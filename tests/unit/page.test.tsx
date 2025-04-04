import Home from "@/app/page";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the next/navigation module
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the auth-client module
vi.mock("@/app/lib/auth-client", () => ({
  useSpotifySession: () => ({
    isAuthenticated: false,
    isLoading: false,
  }),
  loginWithSpotify: vi.fn(),
  logout: vi.fn(),
}));

// Mock the components
vi.mock("@/app/components/Mascot", () => ({
  default: ({ mood, size, className }: any) => (
    <div data-testid="mock-mascot" data-mood={mood} data-size={size} className={className}>
      Mascot Component
    </div>
  ),
}));

vi.mock("@/app/components/ChatBubble", () => ({
  default: ({ children, animate, className }: any) => (
    <div data-testid="mock-chat-bubble" data-animate={animate} className={className}>
      {children}
    </div>
  ),
}));

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the home page with mascot and chat bubble", () => {
    render(<Home />);
    
    expect(screen.getByTestId("mock-mascot")).toBeInTheDocument();
    expect(screen.getByTestId("mock-chat-bubble")).toBeInTheDocument();
    expect(screen.getByText(/Login with Spotify/i)).toBeInTheDocument();
  });

  it("shows loading state when clicking login button", async () => {
    const { loginWithSpotify } = await import("@/app/lib/auth-client");
    // Make loginWithSpotify wait before resolving
    (loginWithSpotify as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<Home />);
    
    // Click login button
    fireEvent.click(screen.getByText(/Login with Spotify/i));
    
    // Check for loading state
    expect(screen.getByText(/Connecting.../i)).toBeInTheDocument();
    expect(screen.getByTestId("spotify-login-button")).toBeDisabled();
  });

  it("shows error message when login fails", async () => {
    const { loginWithSpotify } = await import("@/app/lib/auth-client");
    // Make loginWithSpotify reject with an error
    (loginWithSpotify as any).mockRejectedValue(new Error("Login failed"));
    
    render(<Home />);
    
    // Click login button
    fireEvent.click(screen.getByText(/Login with Spotify/i));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId("login-error")).toBeInTheDocument();
    });
    
    // Check error message content
    expect(screen.getByText(/Failed to connect to Spotify/i)).toBeInTheDocument();
    expect(screen.getByText(/Register your app/i)).toBeInTheDocument();
    
    // Check that the button is enabled again
    expect(screen.getByTestId("spotify-login-button")).not.toBeDisabled();
  });
});
