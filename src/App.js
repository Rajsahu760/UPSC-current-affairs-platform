import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchIndianNews } from './services/newsService';
import { translateToHindi, generateMCQQuestion, generateSubjectiveQuestion } from './services/aiService';

function App() {
  const [language, setLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [newsData, setNewsData] = useState([]);
  const [translatedHeadlines, setTranslatedHeadlines] = useState({});
  const [translatedSummaries, setTranslatedSummaries] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceMode, setPracticeMode] = useState('');
  const [selectedNewsForPractice, setSelectedNewsForPractice] = useState(null);
  
  // Translation Loading States
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  
  // MCQ States
  const [mcqList, setMcqList] = useState([]);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showMCQResult, setShowMCQResult] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Subjective States
  const [currentSubjective, setCurrentSubjective] = useState(null);
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
  
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const categories = ['ALL', 'SPORTS', 'EDUCATION', 'HEALTH', 'ECONOMY', 'POLITY', 'SCIENCE', 'INTERNATIONAL'];

  useEffect(() => {
    loadRealNews();
  }, []);

  const loadRealNews = async () => {
    try {
      const news = await fetchIndianNews();
      if (news.length > 0) {
        setNewsData(news);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  // Complete Translation - All Articles
  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);

    if (newLang === 'hi' && filteredNews.length > 0) {
      setIsTranslating(true);
      setTranslationProgress(0);
      
      console.log(`🔄 Starting translation for ALL ${filteredNews.length} articles...`);
      
      const totalArticles = filteredNews.length;
      
      for (let i = 0; i < totalArticles; i++) {
        const news = filteredNews[i];
        
        if (!translatedHeadlines[news.id]) {
          try {
            console.log(`[${i+1}/${totalArticles}] Translating...`);
            
            // Translate headline
            const hindiHeadline = await translateToHindi(news.headline);
            setTranslatedHeadlines(prev => ({ ...prev, [news.id]: hindiHeadline }));
            
            // Translate summary
            const hindiSummary = await translateToHindi(news.summary);
            setTranslatedSummaries(prev => ({ ...prev, [news.id]: hindiSummary }));
            
            // Update progress
            const progress = Math.round(((i + 1) / totalArticles) * 100);
            setTranslationProgress(progress);
            
            console.log(`✅ [${i+1}/${totalArticles}] Done - ${progress}%`);
            
          } catch (error) {
            console.error(`❌ Error at article ${i+1}:`, error);
          }
        }
      }
      
      console.log('✅ ALL translation completed!');
      setIsTranslating(false);
      setTranslationProgress(100);
    }
  };

  const filteredNews = newsData.filter(news => {
    const matchesCategory = selectedCategory === 'ALL' || news.category === selectedCategory;
    const matchesSearch = news.headline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDisplayHeadline = (news) => language === 'hi' ? (translatedHeadlines[news.id] || news.headline) : news.headline;
  const getDisplaySummary = (news) => language === 'hi' ? (translatedSummaries[news.id] || news.summary) : news.summary;

  const handlePracticeClick = async (news, mode) => {
    setSelectedNewsForPractice(news);
    setPracticeMode(mode);
    setShowPracticeModal(true);
    setLoadingQuestion(true);
    setSelectedAnswers({});
    setShowMCQResult(false);
    setCurrentMCQIndex(0);
    setTotalScore(0);
    setQuizCompleted(false);
    setSubjectiveAnswer('');

    try {
      if (mode === 'mcq') {
        const mcqs = await generateMCQQuestion(news.fullContent + ' ' + news.headline);
        setMcqList(mcqs);
      } else {
        const subjective = await generateSubjectiveQuestion(news.fullContent + ' ' + news.headline);
        setCurrentSubjective(subjective);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleMCQAnswer = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentMCQIndex]: optionIndex });
    setShowMCQResult(true);
    if (optionIndex === mcqList[currentMCQIndex].correct) {
      setTotalScore(prev => prev + 1);
    }
  };

  const handleNextMCQ = () => {
    if (currentMCQIndex < mcqList.length - 1) {
      setCurrentMCQIndex(prev => prev + 1);
      setShowMCQResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const closePracticeModal = () => {
    setShowPracticeModal(false);
    setPracticeMode('');
    setMcqList([]);
    setCurrentMCQIndex(0);
    setSelectedAnswers({});
    setTotalScore(0);
    setQuizCompleted(false);
  };

  const currentMCQ = mcqList[currentMCQIndex];

  return (
    <div className="App">
      <div className="header">
        <div className="header-container">
          <h1>🎓 AI Current Affairs for UPSC & BPSC</h1>
          <div className="header-controls">
            <button className="lang-toggle" onClick={handleLanguageToggle} disabled={isTranslating}>
              {language === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
            </button>
            <button className="search-btn" onClick={() => setShowSearch(!showSearch)}>🔍</button>
          </div>
          {showSearch && (
            <div className="search-dropdown">
              <input type="text" placeholder={language === 'en' ? 'Search...' : 'खोजें...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}>❌</button>
            </div>
          )}
        </div>
      </div>

      {/* Translation Loading Indicator */}
      {isTranslating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '15px',
          textAlign: 'center',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
            🔄 Translating to Hindi... {translationProgress}%
          </div>
          <div style={{ 
            width: '100%', 
            maxWidth: '600px', 
            height: '8px', 
            background: 'rgba(255,255,255,0.3)', 
            borderRadius: '4px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${translationProgress}%`,
              height: '100%',
              background: 'white',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      <div className="content">
        <div className="filter-section">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={selectedCategory === cat ? 'active' : ''}>{cat}</button>
          ))}
        </div>

        <div className="news-grid">
          {filteredNews.map(news => (
            <div key={news.id} className="news-card">
              <img src={news.image} alt={news.headline} />
              <div className="news-content">
                <h3>{getDisplayHeadline(news)}</h3>
                <p className="date">📅 {news.date}</p>
                <p className="summary">📝 {getDisplaySummary(news)}</p>
                <div className="card-actions">
                  <button 
                    className="btn-view" 
                    onClick={() => window.open(news.sourceUrl, '_blank')}
                  >
                    {language === 'en' ? '📰 Read Full Article' : '📰 पूरा लेख पढ़ें'}
                  </button>
                  <button className="btn-practice" onClick={() => { setSelectedNewsForPractice(news); setShowPracticeModal(true); }}>{language === 'en' ? 'Practice' : 'अभ्यास'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPracticeModal && !practiceMode && (
        <div className="modal" onClick={() => setShowPracticeModal(false)}>
          <div className="modal-content practice-selector" onClick={(e) => e.stopPropagation()}>
            <h2 style={{textAlign:'center'}}>{language === 'en' ? 'Choose Mode' : 'मोड चुनें'}</h2>
            <div style={{display:'flex',gap:'15px'}}>
              <button className="btn-practice-mcq" onClick={() => handlePracticeClick(selectedNewsForPractice, 'mcq')}>📝 MCQ</button>
              <button className="btn-practice-subjective" onClick={() => handlePracticeClick(selectedNewsForPractice, 'subjective')}>✍️ Subjective</button>
            </div>
          </div>
        </div>
      )}

     {showPracticeModal && practiceMode === 'mcq' && (
  <div className="modal" onClick={closePracticeModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{padding:'14px', maxHeight:'94vh'}}>
      <button onClick={closePracticeModal} style={{position:'absolute',top:'15px',right:'15px',background:'none',border:'none',fontSize:'22px',cursor:'pointer'}}>❌</button>
      <h2 style={{fontSize:'18px',marginBottom:'8px'}}>📝 MCQ Quiz</h2>
      {loadingQuestion ? (
        <div style={{textAlign:'center',padding:'30px'}}><p>🤖 Generating 5 questions...</p></div>
      ) : quizCompleted ? (
        <div style={{textAlign:'center',padding:'20px'}}>
          <h3 style={{fontSize:'22px',color:'#667eea',marginBottom:'15px'}}>🎉 Quiz Complete!</h3>
          <div style={{background:'#f0f4ff',padding:'20px',borderRadius:'10px',margin:'15px 0'}}>
            <p style={{fontSize:'42px',fontWeight:'bold',color:totalScore>=3?'#48bb78':'#e53e3e',margin:0}}>{totalScore}/{mcqList.length}</p>
            <p style={{marginTop:'8px',color:'#666'}}>Score</p>
          </div>
          <button onClick={() => { setCurrentMCQIndex(0); setSelectedAnswers({}); setShowMCQResult(false); setTotalScore(0); setQuizCompleted(false); }} style={{padding:'10px 18px',background:'#667eea',color:'white',border:'none',borderRadius:'5px',cursor:'pointer',marginRight:'8px'}}>🔄 Retry</button>
          <button onClick={closePracticeModal} style={{padding:'10px 18px',background:'#48bb78',color:'white',border:'none',borderRadius:'5px',cursor:'pointer'}}>✓ Close</button>
        </div>
      ) : currentMCQ && (
        <div>
          <div style={{marginBottom:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
              <span style={{fontSize:'13px',fontWeight:'bold',color:'#667eea'}}>Q {currentMCQIndex+1}/{mcqList.length}</span>
              <span style={{fontSize:'13px',fontWeight:'bold',color:'#48bb78'}}>Score: {totalScore}</span>
            </div>
            <div style={{width:'100%',height:'6px',background:'#e2e8f0',borderRadius:'3px',overflow:'hidden'}}>
              <div style={{width:`${((currentMCQIndex+1)/mcqList.length)*100}%`,height:'100%',background:'linear-gradient(90deg,#667eea,#764ba2)',transition:'width 0.3s'}}/>
            </div>
          </div>
          <div style={{padding:'10px',background:'#f0f4ff',borderRadius:'6px',marginBottom:'10px'}}>
            <p style={{fontWeight:'600',fontSize:'14px',lineHeight:'1.3',margin:0}}>{language==='en'?currentMCQ.question:currentMCQ.questionHi}</p>
          </div>
          {currentMCQ.options.map((opt,i) => {
            const isSelected = selectedAnswers[currentMCQIndex]===i;
            const isCorrect = i===currentMCQ.correct;
            let bg='white', color='#333', border='#e2e8f0';
            if(showMCQResult){
              if(isCorrect){ bg='#48bb78'; color='white'; border='#48bb78'; }
              else if(isSelected){ bg='#e53e3e'; color='white'; border='#e53e3e'; }
            }
            return (
              <button key={i} onClick={()=>!showMCQResult&&handleMCQAnswer(i)} disabled={showMCQResult} style={{width:'100%',padding:'10px',marginBottom:'7px',background:bg,color:color,border:`2px solid ${border}`,borderRadius:'6px',cursor:showMCQResult?'default':'pointer',textAlign:'left',fontSize:'13px',lineHeight:'1.3',fontWeight:showMCQResult&&isCorrect?'bold':'normal'}}>
                {String.fromCharCode(65+i)}. {language==='en'?opt:currentMCQ.optionsHi[i]} {showMCQResult&&isCorrect&&'✓'}
              </button>
            );
          })}
          {showMCQResult && (
            <div style={{marginTop:'10px'}}>
              <div style={{padding:'10px',background:selectedAnswers[currentMCQIndex]===currentMCQ.correct?'#f0fff4':'#fff5f5',borderRadius:'6px',marginBottom:'10px',borderLeft:`4px solid ${selectedAnswers[currentMCQIndex]===currentMCQ.correct?'#48bb78':'#e53e3e'}`}}>
                <p style={{fontWeight:'bold',fontSize:'14px',margin:0}}>{selectedAnswers[currentMCQIndex]===currentMCQ.correct?(language==='en'?'✅ Correct!':'✅ सही!'):(language==='en'?'❌ Wrong':'❌ गलत')}</p>
              </div>
              <button onClick={handleNextMCQ} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold',fontSize:'15px'}}>
                {currentMCQIndex<mcqList.length-1?(language==='en'?'➡️ Next':'➡️ अगला'):(language==='en'?'🏁 Finish':'🏁 समाप्त')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)}
      {showPracticeModal && practiceMode === 'subjective' && (
        <div className="modal" onClick={closePracticeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={closePracticeModal} style={{position:'absolute',top:'20px',right:'20px',background:'none',border:'none',fontSize:'24px',cursor:'pointer'}}>❌</button>
            <h2>✍️ Subjective</h2>
            {loadingQuestion ? (
              <div style={{textAlign:'center',padding:'40px'}}><p>🤖 Generating question...</p></div>
            ) : currentSubjective && (
              <div>
                <div style={{padding:'20px',background:'#f0f4ff',borderRadius:'8px',marginBottom:'20px'}}>
                  <p style={{fontWeight:'bold',fontSize:'16px'}}>{language==='en'?currentSubjective.question:currentSubjective.questionHi}</p>
                </div>
                <textarea value={subjectiveAnswer} onChange={(e)=>setSubjectiveAnswer(e.target.value)} placeholder={language==='en'?'Write your answer (150-200 words)...':'अपना उत्तर लिखें (150-200 शब्द)...'} style={{width:'100%',minHeight:'200px',padding:'15px',border:'2px solid #e2e8f0',borderRadius:'8px',fontSize:'15px',marginBottom:'15px',fontFamily:'Arial'}} />
                <p style={{fontSize:'14px',color:'#666',marginBottom:'15px'}}>Words: {subjectiveAnswer.trim().split(/\s+/).filter(w=>w).length}</p>
                <button onClick={()=>{alert(language==='en'?'✅ Answer submitted!':'✅ उत्तर जमा!');closePracticeModal();}} style={{width:'100%',padding:'15px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold',fontSize:'16px'}}>
                  {language==='en'?'Submit':'जमा करें'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;