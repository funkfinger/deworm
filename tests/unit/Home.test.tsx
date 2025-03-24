import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../../src/app/page";

describe("Home Component", () => {
  it("renders the welcome message", () => {
    render(<Home />);

    expect(screen.getByText("Welcome to DeWorm")).toBeInTheDocument();
    expect(
      screen.getByText(/An app to help cure earworms/i)
    ).toBeInTheDocument();
  });

  it("renders the login button disabled", () => {
    render(<Home />);

    const loginButton = screen.getByRole("button", {
      name: /login with spotify/i,
    });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });
});
