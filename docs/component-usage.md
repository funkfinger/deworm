# Component Usage Guide

This document provides guidance on how to use the custom components available in the DeWorm application.

## Table of Contents

- [Mascot Component](#mascot-component)
  - [Basic Usage](#basic-usage)
  - [Props](#props)
  - [Examples](#examples)
    - [Happy Mascot (Default)](#happy-mascot-default)
    - [Sad Mascot](#sad-mascot)
    - [Custom Styling](#custom-styling)
    - [Interactive Example](#interactive-example)

## Mascot Component

The `Mascot` component is a reusable UI element that displays the DeWorm mascot in different moods (happy or sad). This component simplifies the use of mascot images throughout the application by providing a consistent interface.

### Basic Usage

```tsx
import Mascot from "@/app/components/Mascot";

// Default usage - happy mascot
<Mascot />

// Sad mascot
<Mascot mood="sad" />
```

### Props

The `Mascot` component accepts the following props:

| Prop        | Type               | Default           | Description                                         |
| ----------- | ------------------ | ----------------- | --------------------------------------------------- |
| `mood`      | `"happy" \| "sad"` | `"happy"`         | The mood of the mascot                              |
| `className` | `string`           | `""`              | Additional CSS class names                          |
| `width`     | `number`           | `200`             | Width of the mascot image in pixels                 |
| `height`    | `number`           | `200`             | Height of the mascot image in pixels                |
| `alt`       | `string`           | `"DeWorm Mascot"` | Alt text for accessibility                          |
| `priority`  | `boolean`          | `false`           | Whether the image should be prioritized for loading |

### Examples

#### Happy Mascot (Default)

```tsx
<Mascot />
```

This displays the happy version of the mascot with default settings.

#### Sad Mascot

```tsx
<Mascot mood="sad" />
```

This displays the sad version of the mascot.

#### Custom Styling

```tsx
<Mascot
  mood="happy"
  width={150}
  height={150}
  className="rounded-full shadow-lg"
  alt="Happy DeWorm Mascot"
/>
```

This example shows how to customize the dimensions, add additional styling classes, and customize the alt text.

#### Interactive Example

The `MascotExample` component demonstrates how to create an interactive implementation with a mood toggle:

```tsx
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
```

This example demonstrates how to:

1. Use state to manage the mascot's mood
2. Toggle between happy and sad moods with a button click
3. Display the current mood state
