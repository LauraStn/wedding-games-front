import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../test/test-utils";
import AdminExclusionsPage from "./page";
import * as adminApi from "../../../../features/admin/api";

describe("AdminExclusionsPage", () => {
  it("signale clairement les exclusions absolues issues des données de développement", async () => {
    vi.spyOn(adminApi, "fetchParticipants").mockResolvedValue([
      { id: "j1", firstName: "Jessika", lastName: "Dijoux", displayName: "Jessika Dijoux", status: "CONFIRMED", participantType: "GUEST" },
      { id: "s1", firstName: "Sandrine", lastName: "Santin", displayName: "Sandrine Santin", status: "CONFIRMED", participantType: "GUEST" },
      { id: "p1", firstName: "Patrick", lastName: "Santin", displayName: "Patrick Santin", status: "CONFIRMED", participantType: "GUEST" },
    ]);
    vi.spyOn(adminApi, "fetchExclusions").mockResolvedValue([
      { id: "e1", participantAId: "j1", participantBId: "s1", exclusionType: "HARD" },
      { id: "e2", participantAId: "j1", participantBId: "p1", exclusionType: "HARD" },
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
