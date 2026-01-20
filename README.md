# 🎓 UPSC/BPSC Current Affairs Platform

AI-powered Current Affairs platform designed specifically for UPSC and BPSC exam preparation with bilingual support (English/Hindi).

## ✨ Features

### 📰 Real-time News Integration
- Fetches latest Indian news from NewsAPI
- 30+ articles updated daily
- Multiple categories: Sports, Education, Health, Economy, Polity, Science, International

### 🌐 Bilingual Support
- **English ↔ Hindi Translation** using Groq AI (Llama 3.3)
- One-click language toggle
- Complete translation of headlines and summaries

### 🧠 AI-Powered Practice Mode
- **MCQ Quiz**: 5 AI-generated questions per article
- **Subjective Questions**: Essay-type questions (150-200 words)
- Real-time score tracking
- Both English and Hindi versions

### 🔍 Smart Features
- Category-wise filtering
- Search functionality
- Direct links to full articles
- Responsive design (Mobile & Desktop)

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI Framework
- **CSS3** - Styling
- **Fetch API** - API Integration

### Backend
- **Node.js** - Runtime
- **Express.js** - Server Framework
- **NewsAPI** - News Source
- **Groq AI API** - Translation & Question Generation

## 📁 Project Structure
```
upsc-current-affairs/
├── backend/
│   ├── server.js          # Express backend server
│   ├── package.json
│   └── .env               # API keys (not in git)
├── src/
│   ├── App.js             # Main React component
│   ├── App.css            # Styling
│   ├── services/
│   │   ├── newsService.js # News fetching logic
│   │   └── aiService.js   # AI translation & questions
│   └── index.js
├── public/
├── package.json
├── .gitignore
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- API Keys:
  - NewsAPI key from [newsapi.org](https://newsapi.org)
  - Groq API key from [groq.com](https://groq.com)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rajsahu760/UPSC-current-affairs-platform.git
cd upsc-current-affairs
```

### Step 2: Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

Create `.env` file in `backend/` folder:
```env
PORT=5000
NEWS_API_KEY=your_newsapi_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm start
```

Application will open at `http://localhost:3000`

## 🎯 How to Use

1. **Browse News**: Latest Indian news loads automatically
2. **Filter by Category**: Click category buttons (SPORTS, EDUCATION, etc.)
3. **Search**: Use search icon to find specific topics
4. **Switch Language**: Click हिंदी/English button to translate all content
5. **Practice**: 
   - Click "Practice/अभ्यास" on any news card
   - Choose MCQ or Subjective mode
   - Take AI-generated quizzes

## 📊 API Endpoints

### Backend Server (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | Fetch latest news articles |
| POST | `/api/translate` | Translate English to Hindi |
| POST | `/api/generate-mcq` | Generate 5 MCQ questions |
| POST | `/api/generate-subjective` | Generate subjective question |
| GET | `/api/health` | Health check |

## 🔐 Security

- API keys stored in `.env` (not committed to Git)
- Backend acts as proxy to protect API keys
- CORS enabled for frontend-backend communication

## 🐛 Known Issues & Limitations

- **Rate Limiting**: Groq API free tier has 30 requests/minute limit
  - Solution: Translations happen in batches
  - Some articles may take time to translate

## 🚧 Future Enhancements

- [ ] User authentication & progress tracking
- [ ] Bookmark favorite articles
- [ ] Daily quiz challenges
- [ ] Performance analytics
- [ ] PDF export of articles
- [ ] Voice reading feature

## 👨‍💻 Developer

**Raj Sahu**
- GitHub: [@Rajsahu760](https://github.com/Rajsahu760)

## 📄 License

This project is for educational purposes - UPSC/BPSC exam preparation.

## 🙏 Acknowledgments

- NewsAPI for news data
- Groq AI for translation and question generation
- UPSC/BPSC aspirants community

---

**Made with ❤️ for UPSC/BPSC Aspirants**