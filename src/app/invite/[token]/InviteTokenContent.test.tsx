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
      participantId: "p1",
      firstName: "Sandrine",
      displayName: "Sandrine Santin",
      eventSlug: "seed-wedding",
      eventTitle: "Notre mariage",
    });

    renderInvitePage("valid-token");

    await waitFor(() => {
      expect(screen.getByText(/Sandrine Santin/)).toBeInTheDocument();
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
      participantId: "p1",
      firstName: "Patrick",
      displayName: "Patrick Santin",
      eventSlug: "seed-wedding",
      eventTitle: "Notre mariage",
    });
    vi.spyOn(authApi, "confirmInvitation").mockResolvedValue({
      actorType: "PARTICIPANT",
      role: "PARTICIPANT",
      participant: {
        participantId: "p1",
        eventId: "e1",
        eventSlug: "seed-wedding",
        firstName: "Patrick",
        displayName: "Patrick Santin",
        status: "CONNECTED",
        totalPoints: 0,
        totalWins: 0,
      },
      staff: null,
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
