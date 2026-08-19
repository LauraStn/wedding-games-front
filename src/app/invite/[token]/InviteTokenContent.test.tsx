import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/test-utils";
import { InviteTokenContent } from "./InviteTokenContent";
import { ApiError } from "../../../api/errors";
import * as authApi from "../../../features/auth/api";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

function renderInvitePage(token: string) {
  return renderWithProviders(<InviteTokenContent token={token} />);
}

describe("InviteTokenContent", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("résout un QR valide et affiche l'identité reconnue", async () => {
    vi.spyOn(authApi, "resolveInvitation").mockResolvedValue({
      firstName: "Sandrine",
      lastName: "Santin",
      status: "VALID",
    });

    renderInvitePage("valid-token");

    await waitFor(() => {
      expect(screen.getByText(/Sandrine/)).toBeInTheDocument();
      expect(screen.getByText(/Santin/)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /c.est bien moi/i })).toBeInTheDocument();
  });

  it("affiche un message d'invitation invalide quand le jeton est inconnu", async () => {
    vi.spyOn(authApi, "resolveInvitation").mockRejectedValue(
      new ApiError("not-found", "Cette invitation est introuvable."),
    );

    renderInvitePage("unknown-token");

    await waitFor(() => {
      expect(screen.getByText("Cette invitation est introuvable.")).toBeInTheDocument();
    });
  });

  it("confirme l'identité et redirige vers le salon", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "resolveInvitation").mockResolvedValue({
      firstName: "Patrick",
      lastName: "Santin",
      status: "VALID",
    });
    vi.spyOn(authApi, "confirmInvitation").mockResolvedValue({
      participantId: "p1",
      firstName: "Patrick",
      lastName: "Santin",
      role: "PARTICIPANT",
      points: 0,
      victories: 0,
    });

    renderInvitePage("valid-token");

    const confirmButton = await screen.findByRole("button", { name: /c.est bien moi/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/lobby");
    });
    expect(authApi.confirmInvitation).toHaveBeenCalledWith(
      { token: "valid-token" },
      expect.anything(),
    );
  });
});
