import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import CookieConsent from "@/app/components/CookieConsent";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: vi.fn(() => <div data-testid="mock-icon" />),
}));

describe("CookieConsent Component", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render the cookie consent banner when consent is not given", () => {
    render(<CookieConsent />);

    expect(screen.getByText("Cookie Policy")).toBeInTheDocument();
    expect(
      screen.getByText(/We use cookies to improve your experience/)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Learn More" })
    ).toBeInTheDocument();
  });

  it("should not render the cookie consent banner when consent is already given", () => {
    localStorageMock.getItem.mockReturnValueOnce("true");

    render(<CookieConsent />);

    expect(screen.queryByText("Cookie Policy")).not.toBeInTheDocument();
  });

  it("should save consent and hide the banner when Accept button is clicked", () => {
    render(<CookieConsent />);

    const acceptButton = screen.getByRole("button", { name: "Accept" });
    fireEvent.click(acceptButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "deworm-cookie-consent",
      "true"
    );
    expect(screen.queryByText("Cookie Policy")).not.toBeInTheDocument();
  });

  it("should have a link to the privacy policy", () => {
    render(<CookieConsent />);

    const learnMoreLink = screen.getByRole("link", { name: "Learn More" });
    expect(learnMoreLink).toHaveAttribute("href", "/privacy");
  });
});
