# FLASH-UI ⚡

<div align="center">
  <h3> Build faster. Shine brighter.</h3>
  <p>A high-performance React component library designed for the next generation of web interfaces. TypeScript-native and visually stunning.</p>
</div>

---

## 🚀 Overview

**FLASH-UI** isn't just another UI kit. It's a collection of **React + TypeScript** components built for speed and aesthetics. I created this to stop rewriting the same "cool" components for every project. Now, they live here.

## ✨ Featured Components

The library includes several bespoke components ready for production:

*   **⚡ `ArtifactCard`**: A polished card component for displaying complex content or file metadata.
*   **🌌 `DottedGlowBackground`**: Instantly add depth and a "tech" atmosphere to any page background.
*   **📱 `SideDrawer`**: A fully accessible, smooth-sliding navigation drawer.
*   **🟢 `Icons`**: A set of optimized SVG icons for common UI needs.

## 💻 Tech Stack

*   **Core**: React 18+
*   **Language**: TypeScript (Strict mode)
*   **Build Tool**: Vite (Library Mode)

## 📦 Usage

```tsx
import { ArtifactCard, DottedGlowBackground } from 'flash-ui';

function App() {
  return (
    <DottedGlowBackground>
      <div className="p-10">
        <ArtifactCard 
          title="Project X" 
          description="Top secret next-gen dashboard." 
          type="Code"
        />
      </div>
    </DottedGlowBackground>
  );
}
```

---
*Architected by [Zayd](https://github.com/zay168)*