"use client";

import { useState } from "react";
import Mascot from "./Mascot";

export default function MascotExample() {
  const [mood, setMood] = useState<"happy" | "sad">("happy");

  const toggleMood = () => {
    setMood(mood === "happy" ? "sad" : "happy");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Mascot mood={mood} width={150} height={150} />

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Current mood: {mood}</span>
        <button onClick={toggleMood} className="btn btn-sm btn-outline">
          Toggle Mood
        </button>
      </div>
    </div>
  );
}
