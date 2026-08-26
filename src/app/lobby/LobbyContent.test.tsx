import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { ParticipantLobbyContent } from "./LobbyContent";
import * as authApi from "../../features/auth/api";
import * as lobbyApi from "../../features/lobby/api";

const session = {
  actorType: "PARTICIPANT" as const,
  role: "PARTICIPANT" as const,
  participant: {
    participantId: "p1",
    eventId: "e1",
    eventSlug: "seed-wedding",
    firstName: "Sandrine",
    displayName: "Sandrine Santin",
    status: "CONNECTED",
    totalPoints: 40,
    totalWins: 2,
  },
  staff: null,
};

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", { value, configurable: true });
  window.dispatchEvent(new Event(value ? "online" : "offline"));
}

describe("ParticipantLobbyContent", () => {
  afterEach(() => setOnline(true));

  it("affiche l'identité confirmée, les points/victoires et une zone réservée aux futures activités, y compris sur mobile", async () => {
    window.innerWidth = 375; // largeur type mobile
    vi.spyOn(authApi, "fetchSession").mockResolvedValue(session);
    vi.spyOn(lobbyApi, "fetchLobby").mockResolvedValue({ status: "OPEN", connectedCount: 8, message: null });

    renderWithProviders(<ParticipantLobbyContent />);

    await waitFor(() => {
      expect(screen.getByText("Sandrine Santin")).toBeInTheDocument();
    });
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/les activités arrivent bientôt/i)).toBeInTheDocument();
  });

  it("signale la perte de connexion et propose une reconnexion", async () => {
    vi.spyOn(authApi, "fetchSession").mockResolvedValue(session);
    vi.spyOn(lobbyApi, "fetchLobby").mockResolvedValue({ status: "OPEN", connectedCount: 3, message: null });

    renderWithProviders(<ParticipantLobbyContent />);
    await waitFor(() => expect(screen.getByText("Sandrine Santin")).toBeInTheDocument());

    setOnline(false);

    await waitFor(() => expect(screen.getByText("Hors connexion")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /se reconnecter/i })).toBeInTheDocument();
  });

  it("ne stocke aucune donnée sensible (session, points, jeton) dans le stockage navigateur", async () => {
    vi.spyOn(authApi, "fetchSession").mockResolvedValue(session);
    vi.spyOn(lobbyApi, "fetchLobby").mockResolvedValue({ status: "OPEN", connectedCount: 5, message: null });

    renderWithProviders(<ParticipantLobbyContent />);
    await waitFor(() => expect(screen.getByText("Sandrine Santin")).toBeInTheDocument());

    const storedContent = Object.keys(window.localStorage)
      .map((key) => `${key}=${window.localStorage.getItem(key)}`)
      .join(";");
    expect(storedContent).not.toContain("Sandrine");
    expect(storedContent).not.toContain("p1");
    expect(storedContent).not.toContain("40");
    expect(Object.keys(window.localStorage).every((key) => key.startsWith("wga:pref:"))).toBe(true);
  });
});
