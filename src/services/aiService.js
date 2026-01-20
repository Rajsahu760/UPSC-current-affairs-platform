// Frontend API Service - Connects to Backend
// All API calls go through backend server (secure)

const BACKEND_URL = 'http://localhost:5000/api';

// Translate English to Hindi via Backend
export const translateToHindi = async (englishText) => {
  try {
    console.log('🔄 Requesting Hindi translation from backend...');
    
    const response = await fetch(`${BACKEND_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: englishText })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Translation received from backend');
      return result.data;
    } else {
      throw new Error(result.error || 'Translation failed');
    }
    
  } catch (error) {
    console.error('❌ Translation error:', error.message);
    // Fallback: return original text
    return englishText;
  }
};

// Generate 5 MCQ Questions via Backend
export const generateMCQQuestion = async (newsContent) => {
  try {
    console.log('📝 Requesting MCQ questions from backend...');
    
    const response = await fetch(`${BACKEND_URL}/generate-mcq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newsContent })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Received ${result.data.length} MCQ questions from backend`);
      return result.data;
    } else {
      throw new Error(result.error || 'MCQ generation failed');
    }
    
  } catch (error) {
    console.error('❌ MCQ generation error:', error.message);
    throw error;
  }
};

// Generate Subjective Question via Backend
export const generateSubjectiveQuestion = async (newsContent) => {
  try {
    console.log('📝 Requesting subjective question from backend...');
    
    const response = await fetch(`${BACKEND_URL}/generate-subjective`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newsContent })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Subjective question received from backend');
      return result.data;
    } else {
      throw new Error(result.error || 'Subjective generation failed');
    }
    
  } catch (error) {
    console.error('❌ Subjective generation error:', error.message);
    throw error;
  }
};