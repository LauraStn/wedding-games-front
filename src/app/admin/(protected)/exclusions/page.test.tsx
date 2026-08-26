import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../test/test-utils";
import AdminExclusionsPage from "./page";
import * as adminApi from "../../../../features/admin/api";

describe("AdminExclusionsPage", () => {
  it("signale clairement les exclusions absolues issues des données de développement", async () => {
    vi.spyOn(adminApi, "fetchParticipants").mockResolvedValue([
      { id: "j1", firstName: "Jessika", lastName: "Dijoux", active: true, role: "PARTICIPANT", invitationStatus: "VALID" },
      { id: "s1", firstName: "Sandrine", lastName: "Santin", active: true, role: "PARTICIPANT", invitationStatus: "VALID" },
      { id: "p1", firstName: "Patrick", lastName: "Santin", active: true, role: "PARTICIPANT", invitationStatus: "VALID" },
    ]);
    vi.spyOn(adminApi, "fetchExclusions").mockResolvedValue([
      { id: "e1", participantAId: "j1", participantBId: "s1", type: "ABSOLUTE", reason: null },
      { id: "e2", participantAId: "j1", participantBId: "p1", type: "ABSOLUTE", reason: null },
    ]);

    renderWithProviders(<AdminExclusionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Jessika Dijoux — Sandrine Santin")).toBeInTheDocument();
      expect(screen.getByText("Jessika Dijoux — Patrick Santin")).toBeInTheDocument();
    });

    const absoluteBadges = screen.getAllByText("Interdiction absolue");
    expect(absoluteBadges).toHaveLength(2);
  });
});
