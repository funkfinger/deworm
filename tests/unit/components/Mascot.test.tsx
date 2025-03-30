import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Mascot, { MascotMood } from "@/app/components/Mascot";

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: vi.fn(() => <div data-testid="mock-icon" />),
}));

describe("Mascot Component", () => {
  it("should render with default props", () => {
    render(<Mascot />);

    expect(screen.getByTestId("mascot-container")).toBeInTheDocument();
    expect(screen.getByTestId("mascot-image")).toBeInTheDocument();
    expect(screen.getByTestId("mascot-mood")).toBeInTheDocument();
    expect(screen.getByAltText("QT mascot feeling happy")).toBeInTheDocument();
  });

  it("should apply size classes correctly", () => {
    render(<Mascot size="lg" />);

    expect(screen.getByTestId("mascot-container")).toHaveClass("w-32 h-32");
  });

  it("should apply custom className", () => {
    render(<Mascot className="custom-class" />);

    expect(screen.getByTestId("mascot-container")).toHaveClass("custom-class");
  });

  it("should have correct alt text for different moods", () => {
    const moods: MascotMood[] = [
      "happy",
      "sad",
      "neutral",
      "excited",
      "loading",
    ];

    moods.forEach((mood) => {
      render(<Mascot mood={mood} />);
      expect(
        screen.getByAltText(`QT mascot feeling ${mood}`)
      ).toBeInTheDocument();
    });
  });

  it("should apply animation classes when animate is true", () => {
    render(<Mascot mood="excited" animate={true} />);

    // For excited mood, it should add animate-bounce
    expect(screen.getByTestId("mascot-image")).toHaveClass("animate-bounce");
  });
});
