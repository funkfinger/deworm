import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import Header from "@/app/components/Header";
import type { Session } from "next-auth";

// Mock auth-client module
vi.mock("@/app/lib/auth-client", () => ({
  useSpotifySession: vi.fn(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: vi.fn(({ src, alt, ...props }) => {
    // Mock next/image component for testing
    // biome-ignore lint/a11y/useAltText: This is a test mock that already handles alt text through props
    return (
      <img src={src} alt={alt || ""} {...props} data-testid="next-image" />
    );
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: vi.fn(({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
}));

import { useSpotifySession } from "@/app/lib/auth-client";

describe("Header Component", () => {
  it("should render the DeWorm logo", () => {
    vi.mocked(useSpotifySession).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      session: null,
    });

    render(<Header />);

    const logo = screen.getByTestId("next-image");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("alt", "DeWorm Logo");
    expect(logo).toHaveAttribute("src", "/images/deworm-logo.png");
  });

  it("should display a loading spinner when session is loading", () => {
    vi.mocked(useSpotifySession).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      session: null,
    });

    render(<Header />);

    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("should display a Spotify connected badge when authenticated", () => {
    vi.mocked(useSpotifySession).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      session: {
        user: { name: "Test User" },
        expires: "2023-01-01T00:00:00.000Z",
      } as Session,
    });

    render(<Header />);

    const badge = screen.getByText("Spotify Connected");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("badge-primary");
  });

  it("should not display anything when not loading and not authenticated", () => {
    vi.mocked(useSpotifySession).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      session: null,
    });

    render(<Header />);

    const spinner = screen.queryByTestId("loading-spinner");
    const badge = screen.queryByText("Spotify Connected");

    expect(spinner).not.toBeInTheDocument();
    expect(badge).not.toBeInTheDocument();
  });
});
