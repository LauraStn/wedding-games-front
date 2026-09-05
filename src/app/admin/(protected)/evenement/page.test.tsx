import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../test/test-utils";
import AdminEventPage from "./page";
import * as adminApi from "../../../../features/admin/api";

const BASE_CONFIG = {
  id: "e1",
  slug: "seed-wedding",
  title: "Mariage de démonstration",
  language: "fr-FR",
  status: "DRAFT" as const,
  spouseOneName: undefined,
  spouseTwoName: undefined,
  eventDate: undefined,
  venueName: undefined,
  welcomeMessage: undefined,
  visualConfig: {},
};

describe("AdminEventPage", () => {
  it("préremplit le formulaire avec la configuration existante", async () => {
    vi.spyOn(adminApi, "fetchEventConfig").mockResolvedValue(BASE_CONFIG);

    renderWithProviders(<AdminEventPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Titre de l'événement")).toHaveValue("Mariage de démonstration");
    });
  });

  it("envoie la configuration modifiée et confirme l'enregistrement", async () => {
    vi.spyOn(adminApi, "fetchEventConfig").mockResolvedValue(BASE_CONFIG);
    const updateSpy = vi.spyOn(adminApi, "updateEventConfig").mockResolvedValue({
      ...BASE_CONFIG,
      title: "Le mariage de Jessika et Sandrine",
      spouseOneName: "Jessika",
    });

    const user = userEvent.setup();
    renderWithProviders(<AdminEventPage />);

    const titleInput = await screen.findByLabelText("Titre de l'événement");
    await user.clear(titleInput);
    await user.type(titleInput, "Le mariage de Jessika et Sandrine");
    await user.type(screen.getByLabelText("Premier·ère marié·e"), "Jessika");

    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Le mariage de Jessika et Sandrine", spouseOneName: "Jessika" }),
      );
      expect(screen.getByRole("status")).toHaveTextContent("Configuration enregistrée.");
    });
  });
});
