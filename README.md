# 👁️ Image Recognition Agent

An autonomous computer vision agent powered by **Google Gemini 2.5 Flash**, **Node.js/Express**, and **React + Vite**.

---

## 🌟 Key Features

- 🔍 **Deep Visual Perception**: Multi-stage agent analysis of scenes, objects, lighting, and composition.
- 🎯 **Object & Label Recognition**: Confidence-scored entity extraction with detailed descriptions.
- 📝 **Optical Text Extraction (OCR)**: Fast OCR for extracting typography, sign text, and document data.
- 🎨 **Dominant Chromatic Palette**: HEX color swatches and distribution percentages.
- 🛡️ **Safety & Content Moderation**: Instant safety check and flag audit.
- 💬 **Interactive Visual Chat**: Chat with your image in real-time.
- 📊 **Report Exporting**: Single-click export of analysis results into structured JSON.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- Gemini API Key from [Google AI Studio](https://aistudio.google.com/) (optional, fallback sample mode included)

### 2. Backend Setup
```bash
cd backend
npm install
```
Add your Gemini API key in `backend/.env`:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key
```

Run backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, Custom Glassmorphism Vanilla CSS
- **Backend**: Express, Node.js, `@google/genai` (Gemini 2.5 Flash), Multer, Cors, Dotenv
