"use client";

import Image from "next/image";

type MascotProps = {
  /**
   * The mood of the mascot - happy (default) or sad
   */
  mood?: "happy" | "sad";

  /**
   * Optional CSS class name for additional styling
   */
  className?: string;

  /**
   * Width of the mascot image in pixels
   * @default 200
   */
  width?: number;

  /**
   * Height of the mascot image in pixels
   * @default 200
   */
  height?: number;

  /**
   * Optional alt text for accessibility
   * @default "DeWorm Mascot"
   */
  alt?: string;

  /**
   * Whether the image should be prioritized for loading
   * @default false
   */
  priority?: boolean;
};

export default function Mascot({
  mood = "happy",
  className = "",
  width = 200,
  height = 200,
  alt = "DeWorm Mascot",
  priority = false,
}: MascotProps) {
  // Use mascot.svg for happy mood and mascot-sad.svg for sad mood
  const imageSrc =
    mood === "sad" ? "/images/mascot-sad.svg" : "/images/mascot.svg";

  return (
    <div className={className}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
      />
    </div>
  );
}
