// Frontend News Service - Fetches news from Backend
// Backend handles NewsAPI integration

const BACKEND_URL = 'http://localhost:5000/api';

export const fetchIndianNews = async () => {
  try {
    console.log('📰 Fetching news from backend server...');
    
    const response = await fetch(`${BACKEND_URL}/news`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Successfully loaded ${result.data.length} news articles from backend`);
      return result.data;
    } else {
      console.error('❌ Backend error:', result.error);
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error fetching news:', error.message);
    return [];
  }
};