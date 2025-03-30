import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatBubble from "@/app/components/ChatBubble";

describe("ChatBubble Component", () => {
  it("should render with default props", () => {
    render(<ChatBubble>Hello World</ChatBubble>);

    expect(screen.getByTestId("chat-bubble")).toHaveClass("chat-start");
    expect(screen.getByTestId("chat-mascot")).toBeInTheDocument();
    expect(screen.getByText("QT")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("Earworm Expert")).toBeInTheDocument();
  });

  it("should render on the right side", () => {
    render(<ChatBubble position="right">Hello World</ChatBubble>);

    expect(screen.getByTestId("chat-bubble")).toHaveClass("chat-end");
  });

  it("should not show QT mascot and info when isQT is false", () => {
    render(<ChatBubble isQT={false}>Hello World</ChatBubble>);

    expect(screen.queryByText("QT")).not.toBeInTheDocument();
    expect(screen.queryByTestId("chat-mascot")).not.toBeInTheDocument();
    expect(screen.queryByText("Earworm Expert")).not.toBeInTheDocument();
  });

  it("should add custom classes", () => {
    render(<ChatBubble className="custom-class">Hello World</ChatBubble>);

    expect(screen.getByTestId("chat-bubble")).toHaveClass("custom-class");
  });

  it("should apply animation class when animate is true", () => {
    render(<ChatBubble animate>Hello World</ChatBubble>);

    expect(screen.getByTestId("chat-bubble-content")).toHaveClass(
      "animate-bounce-in"
    );
  });
});
