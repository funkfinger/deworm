import { vi, describe, it, expect, beforeEach } from "vitest";
import { loginWithSpotify, logout } from "@/app/lib/auth-client";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(),
}));

import { signIn, signOut } from "next-auth/react";

describe("auth-client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginWithSpotify", () => {
    it("should redirect to the earworm-search page after successful login", async () => {
      // Call the function
      await loginWithSpotify();

      // Verify that signIn was called with the expected parameters
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith("spotify", {
        callbackUrl: "/earworm-search",
      });
    });
  });

  describe("logout", () => {
    it("should call signOut with the correct parameters", async () => {
      // Call the function
      await logout();

      // Verify that signOut was called with the expected parameters
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: "/",
      });
    });
  });
});
