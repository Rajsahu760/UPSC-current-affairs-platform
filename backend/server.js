// UPSC/BPSC Current Affairs Platform - Backend Server
// Node.js + Express.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies

// API Keys (stored securely in backend)
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Validate API keys
if (!NEWS_API_KEY || !GROQ_API_KEY) {
  console.error('❌ Error: API keys not found. Please check .env file');
  process.exit(1);
}

// ============================================
// ROUTE 1: Fetch News from NewsAPI
// ============================================
app.get('/api/news', async (req, res) => {
  try {
    console.log('📰 Fetching news from NewsAPI...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const fromDate = yesterday.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=india OR भारत&language=en&sortBy=publishedAt&pageSize=30&from=${fromDate}&apiKey=${NEWS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'ok' && data.articles) {
      const formattedNews = data.articles
        .filter(article => article.title && article.urlToImage && article.title !== '[Removed]')
        .map((article, index) => ({
          id: Date.now() + index,
          headline: article.title.replace(` - ${article.source.name}`, ''),
          date: article.publishedAt.split('T')[0],
          category: categorizeNews(article),
          image: article.urlToImage,
          summary: article.description || 'Read full article for details',
          fullContent: article.content || article.description || 'Full article available at source',
          sourceUrl: article.url,
          source: article.source.name
        }));
      
      console.log(`✅ Successfully fetched ${formattedNews.length} news articles`);
      res.json({ success: true, data: formattedNews });
    } else {
      throw new Error('No articles found');
    }
  } catch (error) {
    console.error('❌ News fetch error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: Categorize news based on content
function categorizeNews(article) {
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();
  
  if (text.match(/cricket|football|sports|hockey|badminton|tennis|ipl|fifa|match/)) 
    return 'SPORTS';
  if (text.match(/education|school|university|student|exam|neet|jee|cbse|iit/)) 
    return 'EDUCATION';
  if (text.match(/health|hospital|medicine|doctor|patient|disease|vaccine|covid/)) 
    return 'HEALTH';
  if (text.match(/economy|gdp|market|rupee|inflation|rbi|stock|finance|business|trade/)) 
    return 'ECONOMY';
  if (text.match(/election|parliament|minister|government|court|law|bjp|congress|modi/)) 
    return 'POLITY';
  if (text.match(/science|research|space|isro|nasa|technology|ai|robot|innovation/)) 
    return 'SCIENCE';
  if (text.match(/china|pakistan|usa|russia|world|international|war|un|treaty/)) 
    return 'INTERNATIONAL';
  
  return 'ALL';
}

// ============================================
// ROUTE 2: Translate to Hindi using Groq AI
// ============================================
app.post('/api/translate', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }
    
    console.log('🔄 Translating to Hindi using Groq AI...');
    
    const truncatedText = text.substring(0, 500);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate English to Hindi accurately.'
          },
          {
            role: 'user',
            content: `Translate to Hindi, provide ONLY the translation:\n\n"${truncatedText}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      const hindiText = data.choices[0].message.content.trim()
        .replace(/^["']|["']$/g, '')
        .replace(/^(Translation|Hindi|अनुवाद):\s*/gi, '');
      
      console.log('✅ Translation completed');
      res.json({ success: true, data: hindiText });
    } else {
      throw new Error('Invalid AI response');
    }
  } catch (error) {
    console.error('❌ Translation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ROUTE 3: Generate MCQ Questions using Groq AI
// ============================================
app.post('/api/generate-mcq', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }
    
    console.log('📝 Generating MCQ questions using Groq AI...');
    
    const truncatedContent = content.substring(0, 1500);
    
    const prompt = `You are an expert UPSC/BPSC exam question creator. Based on the following news article, create EXACTLY 5 multiple-choice questions.

NEWS ARTICLE:
"${truncatedContent}"

REQUIREMENTS:
1. Create 5 DIFFERENT questions testing understanding and analysis
2. Each question has exactly 4 options (A, B, C, D)
3. Questions should be UPSC/BPSC exam-oriented
4. Provide both English and Hindi versions
5. Indicate correct answer index (0=A, 1=B, 2=C, 3=D)

CRITICAL: Return ONLY valid JSON, no markdown:

{
  "questions": [
    {
      "question": "English question?",
      "questionHi": "हिंदी प्रश्न?",
      "options": ["A", "B", "C", "D"],
      "optionsHi": ["ए", "बी", "सी", "डी"],
      "correct": 0
    }
  ]
}

Generate exactly 5 questions. Return ONLY JSON.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert UPSC/BPSC exam question creator.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });
    
    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      let responseText = data.choices[0].message.content.trim();
      
      // Clean JSON
      responseText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > 0) {
        responseText = responseText.substring(jsonStart, jsonEnd);
      }
      
      const mcqData = JSON.parse(responseText);
      
      if (mcqData.questions && mcqData.questions.length >= 5) {
        console.log(`✅ Generated ${mcqData.questions.length} MCQ questions`);
        res.json({ success: true, data: mcqData.questions.slice(0, 5) });
      } else {
        throw new Error('Insufficient questions generated');
      }
    } else {
      throw new Error('Invalid AI response');
    }
  } catch (error) {
    console.error('❌ MCQ generation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ROUTE 4: Generate Subjective Question using Groq AI
// ============================================
app.post('/api/generate-subjective', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }
    
    console.log('📝 Generating subjective question using Groq AI...');
    
    const truncatedContent = content.substring(0, 1500);
    
    const prompt = `Create ONE analytical UPSC/BPSC Mains question (150-200 words) based on this news.

NEWS: "${truncatedContent}"

Return ONLY JSON:
{
  "question": "Analytical question in English",
  "questionHi": "हिंदी में प्रश्न"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert UPSC/BPSC exam question creator.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      let responseText = data.choices[0].message.content.trim();
      
      // Clean JSON
      responseText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > 0) {
        responseText = responseText.substring(jsonStart, jsonEnd);
      }
      
      const subjectiveData = JSON.parse(responseText);
      
      console.log('✅ Subjective question generated');
      res.json({ success: true, data: subjectiveData });
    } else {
      throw new Error('Invalid AI response');
    }
  } catch (error) {
    console.error('❌ Subjective generation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ROUTE 5: Health Check
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'UPSC Platform Backend Server is running!',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`✅ Backend Server Running on Port ${PORT}`);
  console.log('🌐 API Endpoints:');
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/news`);
  console.log(`   - POST /api/translate`);
  console.log(`   - POST /api/generate-mcq`);
  console.log(`   - POST /api/generate-subjective`);
  console.log('========================================\n');
});