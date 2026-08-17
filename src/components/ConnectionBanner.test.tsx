import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectionBanner } from "./ConnectionBanner";

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", { value, configurable: true });
  window.dispatchEvent(new Event(value ? "online" : "offline"));
}

describe("ConnectionBanner", () => {
  afterEach(() => setOnline(true));

  it("n'affiche rien quand la connexion est active", () => {
    setOnline(true);
    render(<ConnectionBanner />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("affiche un message de reconnexion quand la connexion est perdue", () => {
    setOnline(false);
    render(<ConnectionBanner />);
    expect(screen.getByRole("status")).toHaveTextContent(/connexion perdue/i);
  });
});
