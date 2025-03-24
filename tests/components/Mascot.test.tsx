import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Mascot from "../../src/app/components/Mascot";

describe("Mascot component", () => {
  test("renders happy mascot by default", () => {
    render(<Mascot />);
    const image = screen.getByAltText("DeWorm Mascot");
    expect(image).toBeInTheDocument();
    expect(image.getAttribute("src")).toContain("/images/mascot.svg");
  });

  test("renders sad mascot when mood is sad", () => {
    render(<Mascot mood="sad" />);
    const image = screen.getByAltText("DeWorm Mascot");
    expect(image).toBeInTheDocument();
    expect(image.getAttribute("src")).toContain("/images/mascot-sad.svg");
  });

  test("accepts custom dimensions", () => {
    render(<Mascot width={300} height={300} />);
    const image = screen.getByAltText("DeWorm Mascot");
    expect(image.getAttribute("width")).toBe("300");
    expect(image.getAttribute("height")).toBe("300");
  });

  test("accepts custom alt text", () => {
    const customAlt = "Custom alt text";
    render(<Mascot alt={customAlt} />);
    expect(screen.getByAltText(customAlt)).toBeInTheDocument();
  });
});
