#  AI Cognitive Adventure

> **A gamified cognitive assessment platform for geriatric rehabilitation — built with React, FastAPI, and Google Gemini AI**

---

##  Overview

**AI Cognitive Adventure** is a full-stack web application that transforms standard cognitive assessments into an immersive Fantasy RPG experience. Designed for elderly patients in rehabilitation centres, it uses gamification to increase engagement and consistency in cognitive training — a critical challenge in geriatric neuropsychology.

Patients earn XP, unlock new challenge zones, and progress through RPG ranks as they complete scientifically-grounded assessments across four cognitive domains: **memory**, **verbal fluency**, **logical reasoning**, and **visual observation**. An AI engine powered by Google Gemini evaluates responses, generates adaptive content, and produces structured cognitive health reports.

This project serves as both a **clinical research tool** and a **showcase of applied AI in healthcare**.

---

##  Research Context

This platform was developed to support research on **AI-assisted cognitive rehabilitation for geriatric populations**. It operationalises the following cognitive assessment domains drawn from established neuropsychological frameworks:

| Domain | Assessment Tool | Theoretical Basis |
|---|---|---|
| Short-term Memory | Recall Challenge | Free recall paradigms (Rey AVLT) |
| Verbal Fluency | Fluency Challenge | Category fluency tasks (FAS, animals) |
| Executive Reasoning | Detective Mission | Story comprehension & inference |
| Visual Observation | Vision Challenge | Object recognition & visual scanning |

The **Cognitive Health Index (CHI)** is a composite metric computed as the weighted average of all four domain scores across sessions, providing a longitudinal measure of cognitive performance suitable for clinical tracking.

---

##  Features

###  Gamification System
- Fantasy RPG world map with four challenge zones
- XP-based progression through 6 ranks: Apprentice → Acolyte → Scholar → Arcanist → Sage → Archmage
- Achievement system with 5 unlockable badges
- Adaptive difficulty — XP rewards decrease as patients gain experience
- Zone unlock gates (Wisdom Temple at 300 XP, Reasoning Peaks at 600 XP)

###  Cognitive Challenges
- **🌲 Memory Forest** — Object recall challenge with 3 difficulty levels (5/7/10 objects, 10/8/6 second exposure)
- **🌊 Language Lake** — Timed verbal category fluency (60 seconds, 7 categories, English + Hindi)
- **⛰️ Reasoning Peaks** — AI-generated mystery stories read aloud via TTS; voice/typed Q&A
- **🏛️ Wisdom Temple** — Real photograph shown for 30 seconds; object naming via voice (English + Hindi)

###  AI Integration
- Google Gemini 2.5 Flash Lite for story generation and evaluation
- Multimodal evaluation (image + text) for Vision Challenge
- Generous semantic matching — synonyms, partial matches, component words all accepted
- Bilingual support (English + Hindi) across Fluency and Vision challenges
- Fallback algorithm-based scoring if Gemini is unavailable

###  Reporting
- Per-session score breakdown across all cognitive domains
- Quest Ledger — full history with filterable table
- Downloadable PDF Cognitive Health Report with AI-generated clinical analysis
- Longitudinal performance tracking per user

###  UI/UX
- Full Fantasy RPG aesthetic — dark parchment theme, gold accents, medieval typography
- Mouse-tracking parallax backgrounds with floating rune particles
- Animated region cards with hover glows and shimmer effects
- Fully bilingual UI (EN/HI) in Fluency and Vision challenges
- Responsive design — works on tablet and desktop
- Speech recognition via Web Speech API (Chrome recommended)

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router v6 | Client-side routing with auth guards |
| Axios | API communication |
| Web Speech API | Voice input and text-to-speech |
| CSS Variables | RPG theme system |
| Google Fonts (Cinzel, Lora) | Medieval typography |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| SQLAlchemy + SQLite | ORM and database |
| Google Gemini 2.5 Flash Lite | AI evaluation and content generation |
| Pillow | Image processing for Vision Challenge |
| ReportLab | PDF report generation |
| python-dotenv | Environment variable management |

---

##  Project Structure

```
AI-COGNITIVE-ADVENTURE/
├── backend/
│   ├── app/
│   │   ├── data/
│   │   │   └── fluency_categories.py     # Bilingual word sets (7 categories, EN+HI)
│   │   ├── database/
│   │   │   └── db.py                     # SQLAlchemy engine and session
│   │   ├── models/
│   │   │   ├── user.py                   # User model (XP, rank, sessions)
│   │   │   ├── recall_session.py         # Memory challenge sessions
│   │   │   ├── fluency_session.py        # Fluency challenge sessions
│   │   │   ├── detective_session.py      # Detective challenge sessions
│   │   │   └── vision_session.py         # Vision challenge sessions
│   │   ├── routes/
│   │   │   ├── auth_routes.py            # Register, login, profile
│   │   │   ├── recall_routes.py          # Recall scoring
│   │   │   ├── fluency_routes.py         # Fluency scoring with set lookup
│   │   │   ├── detective_routes.py       # Story generation and evaluation
│   │   │   ├── vision_routes.py          # Image serving and evaluation
│   │   │   ├── history_routes.py         # Session history and stats
│   │   │   ├── report_routes.py          # Cognitive report generation
│   │   │   └── pdf_report_routes.py      # PDF report download
│   │   ├── services/
│   │   │   ├── gemini_service.py         # Gemini AI (detective + reports)
│   │   │   └── vision_ai_service.py      # Gemini multimodal (vision)
│   │   ├── static/
│   │   │   └── vision_images/            # Place your .jpg/.png images here
│   │   └── main.py                       # FastAPI app entry point
│   ├── .env                              # Secret keys (never committed)
│   ├── .env.example                      # Template for .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Context-aware navigation
│   │   │   ├── PlayerPanel.jsx           # XP bar, rank, stats
│   │   │   ├── WorldMap.jsx              # Region cards with lock gates
│   │   │   ├── AchievementPanel.jsx      # Achievement tracker
│   │   │   └── RegionNode.jsx            # Individual zone card
│   │   ├── pages/
│   │   │   ├── Home.jsx                  # Landing page with parallax
│   │   │   ├── Login.jsx                 # Auth page
│   │   │   ├── Register.jsx              # Registration page
│   │   │   ├── Dashboard.jsx             # RPG world map HUD
│   │   │   ├── RecallChallenge.jsx       # Memory Forest
│   │   │   ├── FluencyChallenge.jsx      # Language Lake (EN+HI)
│   │   │   ├── DetectiveChallenge.jsx    # Reasoning Peaks
│   │   │   ├── VisionChallenge.jsx       # Wisdom Temple (EN+HI)
│   │   │   ├── History.jsx               # Quest Ledger
│   │   │   └── NotFound.jsx              # 404 page
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx             # Routes with auth guards
│   │   ├── services/
│   │   │   └── api.js                    # Axios instance with interceptors
│   │   ├── styles/
│   │   │   ├── rpg-global.css            # Design system, variables, components
│   │   │   ├── navbar.css
│   │   │   ├── auth.css
│   │   │   ├── home.css
│   │   │   ├── dashboard2.css
│   │   │   ├── challenges.css
│   │   │   └── vision.css
│   │   └── layouts/
│   │       └── MainLayout.jsx
│   ├── .env                              # VITE_API_URL (never committed)
│   ├── .env.example
│   ├── vercel.json                       # Vercel SPA rewrite rules
│   └── package.json
│
├── render.yaml                           # Render deployment config
└── README.md
```

---

##  Getting Started

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- Google Gemini API key — get one free at https://aistudio.google.com/app/apikey
- Google Chrome (required for Web Speech API)

### 1. Clone the Repository
```bash
git clone https://github.com/Krishnaa265/AI-COGNITIVE-ADVENTURE.git
cd AI-COGNITIVE-ADVENTURE
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Create vision images folder and add your images
mkdir -p app/static/vision_images
# Copy your .jpg/.png images into app/static/vision_images/

# Start the backend
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive API documentation.

### 3. Frontend Setup
```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# .env should contain: VITE_API_URL=http://localhost:8000

# Start the frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

##  Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

### Backend → Render
1. Import repo on [render.com](https://render.com)
2. Set **Root Directory** to `backend`
3. Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable: `GEMINI_API_KEY=your_key_here`
5. Deploy

---

##  API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| GET | `/auth/profile/{email}` | Get user profile and XP |
| POST | `/recall/score` | Score a recall session |
| POST | `/fluency/score` | Score a fluency session |
| GET | `/detective/mission` | Generate a detective story |
| POST | `/detective/evaluate` | Evaluate detective answers |
| GET | `/vision/image` | Get a random vision image |
| GET | `/vision/xp-rate/{email}` | Get adaptive XP rate |
| POST | `/vision/score` | Score a vision session |
| GET | `/history/{email}` | Get all sessions |
| GET | `/history/stats/{email}` | Get aggregate stats and CHI |
| GET | `/report/{email}` | Generate AI cognitive report |
| GET | `/pdf-report/{email}` | Download PDF report |

Full interactive documentation available at `/docs` when the backend is running.

---

##  Cognitive Assessment Design

### Scoring Methodology

**Recall Challenge**
- Score = (correct recalls / total objects) × 100
- Difficulty bonus: Medium +10, Hard +20
- XP = score ÷ 2

**Verbal Fluency Challenge**
- Words validated against curated bilingual category sets using O(1) set lookup
- Fluency Score = (category matches × 8) + min(unique words, 10) × 2, capped at 100
- XP = fluency score ÷ 2

**Detective Mission**
- Google Gemini evaluates responses across 4 sub-domains (memory, attention, reasoning, language)
- Overall score = weighted average
- XP = overall score ÷ 2

**Vision Challenge**
- Gemini multimodal evaluation (image + transcript)
- Generous semantic matching: synonyms, partial matches, component words
- Adaptive XP: starts at 10 XP/word, decreases by 1 per session, floor at 2 XP/word
- No penalty for wrong answers — reduces anxiety in elderly patients

### Cognitive Health Index (CHI)
```
CHI = mean(memory_avg, language_avg, reasoning_avg, vision_avg)
      across all completed domains
```
Domains with no sessions are excluded from the average, ensuring CHI is meaningful from the first session.

### Adaptive Difficulty
The platform adapts to patient experience across two axes:
1. **Vision XP decay** — rewards decrease as sessions accumulate, maintaining challenge
2. **Zone unlock gates** — harder challenges unlock only after demonstrating baseline competency

---

##  Security

- API keys stored in `.env` files, excluded from version control via `.gitignore`
- No sensitive data in frontend code — all AI calls proxied through backend
- Auth guard on all challenge routes — unauthenticated users redirected to login
- CORS configured via environment variable — tighten to your domain in production

---

##  Accessibility & Localisation

- **Bilingual support** — English and Hindi in Verbal Fluency and Vision Challenge
- Full UI translation including labels, buttons, instructions, and AI feedback
- Hindi tokenisation uses Devanagari-aware regex (`re.split(r'[\s,।\.!?]+', ...)`) for accurate word counting
- Speech recognition configured per language (`en-IN` / `hi-IN`)
- Large fonts, high-contrast gold-on-dark colour scheme for low-vision users
- Voice-first input reduces typing burden for elderly patients

---

##  Screenshots

| Home Page | World Map |
|---|---|
| *Parallax hero with floating runes* | *RPG HUD with 4 challenge zones* |

| Memory Forest | Vision Challenge |
|---|---|
| *Object grid with countdown timer* | *Sacred image with 30s countdown* |

---

##  Contributing

This project is part of active research. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your changes maintain backward compatibility with the existing database schema and do not break the scoring methodology.

---

##  License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

##  Author

**Krishna Pathak**
- GitHub: [@Krishnaa265](https://github.com/Krishnaa265)
- Project: AI Cognitive Adventure — Final Year Research Project

---

##  Acknowledgements

- [Google Gemini](https://aistudio.google.com) — AI evaluation engine
- [FastAPI](https://fastapi.tiangolo.com) — Backend framework
- [React](https://react.dev) — Frontend framework
- [Cinzel & Lora](https://fonts.google.com) — Typography
- Inspired by established neuropsychological assessment tools including the Montreal Cognitive Assessment (MoCA), Rey Auditory Verbal Learning Test (AVLT), and Verbal Fluency Tests

---

<div align="center">
  <strong>Built with ❤️ for cognitive health research</strong><br/>
  <em>Sharpening minds, one quest at a time.</em>
</div>
