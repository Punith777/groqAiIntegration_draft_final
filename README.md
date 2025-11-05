
# Video Insight Hub


**Video Insight Hub** is an AI-powered application that analyzes video subtitles to provide:
- 🧠 Smart summaries  
- ❓ Interactive Q&A generation  
- 📝 AI-based assessments  
- ⏱️ Minute-by-minute breakdown summaries  

This makes it a powerful tool for **educational, training, or knowledge-based video analytics**.

---

## 🚀 Features

✅ **Subtitle-Based Analysis** — Extracts insights directly from the video’s subtitles.  
✅ **AI-Powered Summarization** — Generates a detailed and concise summary of the video.  
✅ **Q&A Generation** — Automatically creates context-based questions and answers.  
✅ **Assessment Creation** — Builds interactive assessments based on video content.  
✅ **Minute-by-Minute Insights** — Summarizes the video chronologically for easier comprehension.  
✅ **Modern UI** — Built with TypeScript + React + TailwindCSS for a sleek and responsive design.

---

## 🧩 Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | React (Vite + TypeScript) |
| **Styling** | Tailwind CSS |
| **AI Processing** | Groq API |
| **Utilities** | Custom hooks and libraries for summarization, Q&A, and assessment logic |

---


## 2. Install Dependencies

npm install

## 3. Configure Environment Variables

Create a .env file in the project root and add:

VITE_GROQ_API_KEY=your_groq_api_key_here


⚠️ Important: Never commit your .env file or API keys.
The .gitignore file already ensures .env is excluded.

## 4. Run the Application
npm run dev

Then open your browser at:

http://localhost:5173

VIDEO-INSIGHT-HUB-92-MAIN/
├── public/
├── src/
│   ├── components/        # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/
│   │   ├── groq.ts        # API interaction with Groq
│   │   ├── pdfUtils.ts    # Utility functions for exporting/handling PDFs
│   │   └── utils.ts       # General helper functions
│   ├── pages/             # Main UI pages
│   ├── App.tsx            # Root React component
│   ├── main.tsx           # Entry point
│   └── vite-env.d.ts      # TypeScript environment declarations
├── .env                   # Environment variables (not tracked)
├── .gitignore
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig*.json

🧠 How It Works

Subtitle Extraction — Subtitles or transcripts are processed.

AI Analysis via Groq API — Text is analyzed to identify key points, context, and structure.

Summary Generation — The model generates a full and minute-wise summary.

Q&A & Assessment Creation — Based on video context, automatic questions and answers are generated.

UI Presentation — Results are rendered in a clean and interactive interface.

🛠️ Scripts
Command	Description
npm run dev	Starts the development server
npm run build	Builds the project for production
npm run preview	Serves the production build locally
🧾 Example Use Cases

🎓 Educational video summarization

🧑‍🏫 Training module generation

🎬 Video-based quizzes and comprehension tests

🗂️ Knowledge extraction for large video datasets