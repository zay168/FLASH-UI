# ⚡ Flash UI: Remastered
### *Google AI Studio App — Antigravity Edition*

![Gemini 3 Flash](https://img.shields.io/badge/Powered%20By-Gemini%203%20Flash-4ade80?style=for-the-badge&logo=google)
![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)
![Vibe](https://img.shields.io/badge/Vibe-Immersive-purple?style=for-the-badge)

> **"Creative UI generation in a flash."**

Flash UI is a next-generation interface generator and surgical code editor powered by Google's **Gemini 3 Flash** model. It transcends simple chat interactions, offering a spatial, "Antigravity" workspace where code, preview, and AI reasoning blend seamlessly.

---

## 🌌 The "Antigravity" Experience

This isn't just a tool; it's an environment. The UI has been completely remastered to feel weightless and immersive.

*   **Dotted Glow Backdrop:** A reactive, animated background that breathes with your workflow.
*   **Floating Command Bar:** Context-aware input that floats above your workspace, complete with glassmorphism and shimmer effects.
*   **Spatial Transitions:** Artifacts slide, scale, and fade with cinema-grade easing (cubic-bezier).

## 🚀 Key Features

### 1. 🧠 Surgical 2-Phase Code Editing
We don't just "rewrite" code; we perform surgery.
*   **Phase 1: Planning (The Brain):** The AI analyzes your request and highlights the exact lines it intends to change in **Amber/Orange**.
*   **Phase 2: Execution (The Hand):** The AI streams the changes, turning the diffs **Green** as they are applied in real-time.

### 2. 👁️ Multimodal Vision
Drop images directly into the editor.
*   **Sketch-to-UI:** Upload a napkin sketch, and Gemini 3 Flash will convert it into high-fidelity HTML/CSS.
*   **Reference Remixing:** Upload a screenshot of a website you like and ask the AI to "make it darker and more rounded."

### 3. ✨ Radical Variations
Stuck in a rut? Open the **Variations Drawer**.
*   The AI assumes unique "Design Personas" (e.g., *Neon Brutalist*, *Soft Claymorphism*, *Swiss International*).
*   Generates 3 fully coded, distinct alternatives to your current work in parallel.

### 4. 🛠️ True IDE Capabilities
*   **Split Pane Resizing:** Drag to adjust the code vs. preview ratio.
*   **Smart Highlighting:** Visual diffs for instant context on what changed.
*   **Live Preview:** Sandboxed iframe execution for safe, instant rendering.

---

## 📦 Installation & Setup

This project uses modern ESM imports (via `esm.sh`) for a lightweight, no-build-necessary experience during prototyping, but is structured for a standard Vite environment.

1.  **Clone the repository**
2.  **Set your API Key**
    You must configure your Google GenAI API key.
    *   *Note:* The code expects `process.env.API_KEY`. You may need to use a bundler like Vite with `define` or a `.env` file depending on your build setup.

3.  **Run the App**
    *   If using Vite/Next/Create-React-App: `npm run dev`
    *   If running raw: Serve the root directory with a local server (e.g., Live Server).

## 🎮 Usage Guide

1.  **The Prompt:** Type a request like *"Create a glassmorphism credit card checkout form"*.
2.  **The Grid:** Your artifacts appear in a 3D timeline. Click one to enter **Focus Mode**.
3.  **The Workshop:**
    *   **Edit:** Type *"Make the background red"* to trigger the Surgical Editor.
    *   **Upload:** Click the 📎 paperclip to add reference images.
    *   **Variations:** Click the ✨ Sparkles icon to generate alternative concepts.

## 🎨 Architecture & Technologies

*   **Core:** React 19 (Hooks, Suspense-ready structure)
*   **AI Orchestration:** `@google/genai` SDK
*   **Model:** `gemini-3-flash-preview` (Optimized for low latency and high reasoning)
*   **Styling:** Pure CSS Variables, CSS Modules approach, and hardware-accelerated animations.

---

###  credits

**Vibe coded by:** [@ammaar](https://x.com/ammaar)
**Remastered by:** Your Friendly Neighborhood AI Engineer

---

*"Start building. The gravity is optional."*
