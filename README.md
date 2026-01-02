# FLASH-UI ⚡

<div align="center">
  <h3>AI-Powered HTML/CSS Component Generator</h3>
  <p>Describe what you need. Get production-ready UI code instantly.</p>
  <br />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Gemini-API-4285F4?style=flat-square&logo=google" alt="Gemini" />
</div>

---

## 🧠 About

FLASH-UI is an experimental AI tool that leverages **Google's Gemini API** to generate clean, semantic HTML and CSS components on demand.

Describe any UI component in natural language, and watch as the AI builds it in real-time with streaming output.

## ✨ Features

*   **🎨 3 Design Directions**: For every prompt, get 3 unique stylistic interpretations.
*   **✏️ Live Code Editor**: Edit the generated code directly with syntax highlighting.
*   **👁️ Real-time Preview**: See your component render as you type.
*   **🔄 Variations Mode**: Generate radical redesigns with one click.
*   **📸 Image Input**: Upload reference images to guide the generation.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **AI Model** | Google Gemini (via `@google/genai`) |
| **Frontend** | React 19 + TypeScript |
| **Build** | Vite 6 |
| **Output** | Pure HTML/CSS (copy-paste ready) |

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/zay168/FLASH-UI.git
cd FLASH-UI

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Add your Gemini API key to .env

# Run the development server
npm run dev
```

## 📁 Project Structure

```
FLASH-UI/
├── src/
│   ├── index.tsx       # Main application
│   ├── index.css       # Global styles
│   ├── components/     # React components
│   ├── constants.ts    # App constants
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Utility functions
├── index.html          # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔑 API Key

Get your free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

---

*Built with ❤️ by [Zayd](https://github.com/zay168) • Based on work by [@ammaar](https://x.com/ammaar)*
