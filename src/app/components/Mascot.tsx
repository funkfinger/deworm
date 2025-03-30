"use client";

import {
  faFaceFrown,
  faFaceGrin,
  faFaceMeh,
  faFaceSmile,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type MascotMood = "happy" | "sad" | "neutral" | "excited" | "loading";

interface MascotProps {
  mood?: MascotMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

export default function Mascot({
  mood = "happy",
  size = "md",
  className = "",
  animate = false,
}: MascotProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const getMascotIcon = () => {
    switch (mood) {
      case "happy":
        return faFaceSmile;
      case "sad":
        return faFaceFrown;
      case "neutral":
        return faFaceMeh;
      case "excited":
        return faFaceGrin;
      case "loading":
        return faSpinner;
      default:
        return faFaceSmile;
    }
  };

  const getAnimationClass = () => {
    if (!animate) return "";

    if (mood === "loading") {
      return "animate-spin";
    }

    if (mood === "excited") {
      return "animate-bounce";
    }

    if (mood === "happy") {
      return "animate-pulse";
    }

    return "";
  };

  return (
    <div
      className={`flex justify-center items-center ${sizeClasses[size]} ${className}`}
      data-testid="mascot-container"
    >
      <div className="relative">
        {/* Main mascot image */}
        <img
          src="/images/mascot.svg"
          alt={`QT mascot feeling ${mood}`}
          className={`${getAnimationClass()}`}
          data-testid="mascot-image"
        />

        {/* Mood indicator */}
        <div
          className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md"
          data-testid="mascot-mood"
        >
          <FontAwesomeIcon
            icon={getMascotIcon()}
            className={`text-primary ${
              mood === "loading" ? "animate-spin" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
}
