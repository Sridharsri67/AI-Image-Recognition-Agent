# 👁️ AI Image Recognition Agent

> **Autonomous AI-powered Computer Vision Platform built with Google Gemini 3.5 Flash, Node.js, Express, React, and Vite.**

![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![React](https://img.shields.io/badge/React-Vite-blue)
![Gemini](https://img.shields.io/badge/Google-Gemini%203.5%20Flash-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-yellow)
![License](https://img.shields.io/badge/License-MIT-success)

---

# 📖 Overview

**AI Image Recognition Agent** is an intelligent computer vision platform that enables users to upload an image and receive comprehensive AI-generated insights.

Unlike traditional image classifiers, this project functions as an **autonomous AI agent**, capable of understanding images, answering follow-up questions, extracting text, detecting objects, analyzing scenes, identifying dominant colors, and performing safety analysis.

The agent leverages **Google Gemini 3.5 Flash** for multimodal reasoning and provides an interactive experience through a modern React dashboard.

---

# ⚙️ What It Does

The Image Recognition Agent analyzes uploaded/captured images to perform:

- Live Web Camera Capture (Take snapshots directly from web webcam)
- Client-Side Routing (Distinct workspace and dashboard paths)
- Object Detection
- Scene Understanding
- Image Captioning
- OCR (Text Extraction)
- Color Palette Analysis
- Image Q&A
- Safety Moderation
- Structured AI Reports

The platform transforms raw images into meaningful, human-readable intelligence.

---

# 🧠 AI Vision Engine

The AI engine automatically extracts:

- Objects
- Landmarks
- Animals
- Vehicles
- Food Items
- Human Activities
- Indoor / Outdoor Scenes
- Background Context
- Environmental Details

Each detected element includes AI-generated descriptions and contextual understanding.

---

# 🔍 Object Recognition

The agent identifies:

- Multiple objects
- Important entities
- Visual relationships
- Relative positioning
- Scene composition

Example:

```
Person → Sitting
Laptop → On Desk
Coffee Mug → Next to Laptop
Window → Natural Lighting
```

---

# 📝 OCR Engine

The platform automatically extracts visible text from:

- Documents
- Posters
- Sign Boards
- Receipts
- Screenshots
- Product Labels
- Books

Useful for document digitization and visual search.

---

# 🎨 Color Intelligence

The Image Recognition Agent detects:

- Dominant Colors
- HEX Codes
- Color Distribution
- Visual Theme
- Background Palette

Example:

| Color | HEX |
|--------|------|
| Blue | #3478F6 |
| White | #FFFFFF |
| Gray | #757575 |

---

# 💬 Interactive AI Chat

Users can interact with the uploaded image by asking questions such as:

- What is happening in this image?
- Describe the objects.
- Is this image safe?
- What text is visible?
- What colors dominate the image?
- Explain the scene.
- Count visible objects.

The AI responds contextually based on the uploaded image.

---

# 🛡️ Safety & Moderation

The platform evaluates images for:

- Sensitive Content
- Violence
- Adult Content
- Hate Symbols
- Unsafe Material
- Harmful Imagery

This makes the project suitable for content moderation workflows.

---

# 📊 AI Report Generation

Generate structured reports containing:

- Image Summary
- Object List
- OCR Results
- Scene Description
- Safety Analysis
- Color Palette
- AI Metadata

Reports can be exported as:

- JSON
- PDF *(Future)*
- CSV *(Future)*

---

# 🏗️ Architecture

```
                React Dashboard
                      │
                      ▼
             Express.js REST API
                      │
                      ▼
          Gemini Vision AI Engine
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
 Image Analysis    OCR Engine    Safety Check
       │              │              │
       └──────────────┼──────────────┘
                      ▼
             Structured AI Response
                      │
                      ▼
            Interactive React UI
```

---

# 🛠️ Tech Stack

## Frontend

- React 19
- React Router Dom v6 (Client-side routing)
- Vite
- Vanilla CSS
- Lucide React
- Fetch API

---

## Backend

- Node.js
- Express.js
- Multer
- Google Gemini SDK
- dotenv
- cors

---

## AI Model

- Google Gemini 3.5 Flash (with fallback model chain)
- Multimodal Vision API

---

## Development Tools

- VS Code
- Git
- GitHub
- npm

---

# 📂 Project Structure

```
AI-Image-Recognition-Agent/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── styles/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── config/
│   ├── uploads/
│   ├── utils/
│   └── server.js
│
├── README.md
├── package.json
└── .gitignore
```

---

# 🚀 Core Features

## 📷 Live Camera Capture

- Captures live photos via webcam (`navigator.mediaDevices.getUserMedia`)
- Mirrored video feed for intuitive alignment
- Offscreen canvas capture rendering
- Automatic redirect to dashboard upon snapshot analysis

## 🛣️ Client-Side Routing

- Custom URLs `/home` (workspace) and `/dashboard` (results)
- Interactive capsule switcher inside navigation header
- Dynamic state-based redirections

## 👁️ Image Analysis

- Scene Understanding
- Object Recognition
- Context Detection
- AI Caption Generation

---

## 🔍 Computer Vision

- Multi-object Detection
- Visual Relationship Analysis
- Scene Classification
- Image Description

---

## 📝 OCR

- Printed Text Recognition
- Document Reading
- Sign Detection
- Label Extraction

---

## 🎨 Color Analysis

- Dominant Color Detection
- HEX Palette
- Visual Theme Analysis

---

## 💬 AI Chat

- Ask Questions About Images
- Context-Aware Responses
- Interactive Visual Assistant

---

## 🛡️ Safety Analysis

- NSFW Detection
- Sensitive Content Check
- Harmful Content Review

---

## 📄 Reporting

- JSON Export
- Structured Results
- AI Summary

---

# 🔥 Image Processing Workflow

```
Image Upload
      │
      ▼
Image Validation
      │
      ▼
Gemini Vision Analysis
      │
      ▼
Object Detection
      │
      ▼
OCR Extraction
      │
      ▼
Color Analysis
      │
      ▼
Safety Moderation
      │
      ▼
Interactive AI Response
      │
      ▼
Report Generation
```

---

# 🛡️ Use Cases

## Education

- Learn Computer Vision
- AI Experiments
- Research Projects

---

## Business

- Product Image Analysis
- Document Processing
- Visual Search

---

## Accessibility

- AI Image Description
- Scene Narration
- Visual Assistance

---

## Automation

- OCR Pipelines
- Image Classification
- Smart Image Search

---

## AI Development

- Vision Agent Development
- Multimodal AI Applications
- LLM-powered Image Understanding

---

# 🚀 Future Roadmap

- Image Similarity Search
- Face Detection *(Authorized Use Only)*
- Emotion Recognition
- Batch Image Processing
- PDF Report Export
- Multi-language OCR
- Image Comparison
- Voice-based Image Chat
- Drag & Drop Upload
- Cloud Storage Integration
- User Authentication
- Image History
- Docker Deployment

---

# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/Sridharsri67/AI-Image-Recognition-Agent.git

cd AI-Image-Recognition-Agent
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

GEMINI_API_KEY=YOUR_API_KEY
```

Run the backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Visit:

```
http://localhost:5173
```

---

# 🔒 Security Notice

This project is intended for:

- Educational Purposes
- AI Research
- Computer Vision Learning
- Authorized Image Processing
- Software Development

Do not use this project for unauthorized surveillance or privacy-invasive activities.

---

# 👨‍💻 Author

**Sridhar Konda**

Backend Developer • AI Enthusiast • Computer Vision • JavaScript • Node.js • React

---

# 📜 License

MIT License © 2026 AI Image Recognition Agent

---

# ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the project

🛠️ Contribute improvements

🐞 Report issues

---

# 📌 Motto

> **"Transforming images into intelligent insights with AI."**