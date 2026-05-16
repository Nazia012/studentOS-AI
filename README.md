# StudentOS

> **Transform Academic Chaos into a Survival Plan.**

An AI-powered academic survival assistant built to cure "exam paralysis." Upload messy syllabi or notes, and StudentOS instantly extracts deadlines, prioritizes high-impact study topics, and generates an actionable survival strategy. 

**Built for Hack Bramha: Hack Days**

---

## The Problem
Students today aren't failing because the material is too hard; they're failing because they are buried in academic chaos. Between dense PDFs, scattered announcements, and handwritten notes, students spend more time trying to organize their academic lives than actually studying. When deadlines pile up, this leads to "exam paralysis."

## The Solution
**StudentOS** is a minimalistic dashboard that acts as an intelligent command center. Instead of generic calendars, it uses the **Google Gemini API** to provide brutal brevity and direct, actionable strategies so students can focus on exactly what matters to maximize their marks.

---

## Key Features

* **Multimodal AI Parsing:** Upload PDFs, images, or paste text. The Gemini API "reads" complex syllabi and extracts critical deadlines and subjects instantly.
* **"I'm Cooked" (Panic Mode):** A dedicated toggle for extreme stress situations. When activated, the AI shifts to an emergency 80/20 revision strategy, explicitly telling the student which high-yield topics to study and what to safely skip.
* **Smart Resource Generation:** Automatically generates targeted `[Search Notes]` and `[Watch Tutorial]` links for every high-priority topic so studying can begin immediately.
* **Contextual Chat Interface:** A persistent chat that remembers your uploaded syllabus, allowing you to ask follow-up questions or adjust deadlines on the fly.
* **Calming UI:** A sleek, distraction-free Glassmorphism interface that shifts to a high-alert visual state when Panic Mode is engaged.

---

## Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Styling:** Tailwind CSS (Glassmorphism design system), Framer Motion
* **AI / Backend Logic:** Google Gemini API (Gemini 3 Flash)
* **Deployment:** Vercel

---

## Getting Started

To run StudentOS locally, follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/Nazia012/studentOS-AI.git](https://github.com/Nazia012/studentOS-AI.git)
cd studentOS-AI
