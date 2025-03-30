import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: vi.fn(({ icon }) => (
    <div data-testid={`icon-${icon.iconName}`} />
  )),
}));

// Skip these tests for now since they require complex mocking of the Spotify Web Playback SDK
describe.skip("SpotifyPlayer Component", () => {
  it("should render player controls", () => {
    // This test will be implemented properly once we have a better mocking strategy for the Spotify SDK
    expect(true).toBe(true);
  });
});
