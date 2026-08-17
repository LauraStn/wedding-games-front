import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { RoleGuard } from "./RoleGuard";
import { ApiError } from "../../api/errors";
import * as authApi from "./api";
import type { Session } from "./types";

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

function renderGuarded(allow: Session["role"][]) {
  return renderWithProviders(
    <RoleGuard allow={allow}>
      <div>Contenu protégé</div>
    </RoleGuard>,
  );
}

describe("RoleGuard", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  it("redirige vers l'accueil quand aucune session n'est active", async () => {
    vi.spyOn(authApi, "fetchSession").mockRejectedValue(
      new ApiError("unauthorized", "Vous devez confirmer votre identité pour continuer."),
    );

    renderGuarded(["PARTICIPANT"]);

    await waitFor(() => expect(redirectMock).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("Contenu protégé")).not.toBeInTheDocument();
  });

  it("restaure une session existante et affiche le contenu autorisé", async () => {
    vi.spyOn(authApi, "fetchSession").mockResolvedValue({
      participantId: "p1",
      firstName: "Sandrine",
      lastName: "Santin",
      role: "PARTICIPANT",
      points: 12,
      victories: 1,
    });

    renderGuarded(["PARTICIPANT"]);

    await waitFor(() => expect(screen.getByText("Contenu protégé")).toBeInTheDocument());
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("refuse l'accès admin à un rôle intervenant", async () => {
    vi.spyOn(authApi, "fetchSession").mockResolvedValue({
      participantId: "p2",
      firstName: "Alex",
      lastName: "Dupont",
      role: "INTERVENANT",
      points: 0,
      victories: 0,
    });

    renderGuarded(["ADMIN"]);

    await waitFor(() => expect(redirectMock).toHaveBeenCalledWith("/unauthorized"));
    expect(screen.queryByText("Contenu protégé")).not.toBeInTheDocument();
  });
});
