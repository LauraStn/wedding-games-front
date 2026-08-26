import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/test-utils";
import AdminLoginPage from "./page";
import { ApiError } from "../../../api/errors";
import * as authApi from "../../../features/auth/api";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

describe("AdminLoginPage", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("connecte le staff et redirige vers le back-office", async () => {
    const user = userEvent.setup();
    const loginSpy = vi.spyOn(authApi, "staffLogin").mockResolvedValue({
      id: "s1",
      username: "admin",
      displayName: "Administrateur",
      role: "ADMIN",
      active: true,
      createdAt: "2026-08-18T10:00:00Z",
    });

    renderWithProviders(<AdminLoginPage />);

    await user.type(screen.getByLabelText("Identifiant"), "admin");
    await user.type(screen.getByLabelText("Mot de passe"), "change-me");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith(
        { username: "admin", password: "change-me" },
        expect.anything(),
      );
      expect(replaceMock).toHaveBeenCalledWith("/admin");
    });
  });

  it("affiche une erreur sur identifiants invalides", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "staffLogin").mockRejectedValue(
      new ApiError("unauthorized", "Identifiants invalides.", 401, "INVALID_CREDENTIALS"),
    );

    renderWithProviders(<AdminLoginPage />);

    await user.type(screen.getByLabelText("Identifiant"), "admin");
    await user.type(screen.getByLabelText("Mot de passe"), "wrong");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(screen.getByText("Identifiants invalides.")).toBeInTheDocument();
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
