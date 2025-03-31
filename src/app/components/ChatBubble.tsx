"use client";

import type { ReactNode } from "react";

interface ChatBubbleProps {
  children: ReactNode;
  position?: "left" | "right";
  className?: string;
  isQT?: boolean;
  animate?: boolean;
}

export default function ChatBubble({
  children,
  position = "left",
  className = "",
  isQT = true,
  animate = false,
}: ChatBubbleProps) {
  // Convert children to string if needed
  const content =
    typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children.join("")
        : String(children);

  return (
    <div
      className={`chat ${
        position === "left" ? "chat-start" : "chat-end"
      } ${className}`}
      data-testid="chat-bubble"
    >
      {isQT && (
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img
              src="/images/mascot.svg"
              alt="QT mascot"
              data-testid="chat-mascot"
            />
          </div>
        </div>
      )}
      <div className="chat-header">
        {isQT && <span className="font-bold">QT</span>}
        <time className="text-xs opacity-50 ml-2">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
      <div
        className={`chat-bubble ${animate ? "animate-bounce-in" : ""}`}
        data-testid="chat-bubble-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div className="chat-footer opacity-50">
        {isQT && <span>Earworm Expert</span>}
      </div>
    </div>
  );
}
