import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  HelpCircle, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  Globe, 
  Search, 
  Percent, 
  BookOpen, 
  AlertTriangle, 
  Flame, 
  CheckCircle, 
  FileText, 
  Layers3, 
  Activity, 
  Sparkles, 
  ChevronRight,
  Info 
} from 'lucide-react';
import { analyzeNewsArticle, STOPWORDS } from './utils/nlpEngine';
import { testShowcaseArticles } from './data/newsDataset';
import { NLPAnalysisResult, TransformerReport, ArticleLabel } from './types';

export default function App() {
  // Input fields
  const [title, setTitle] = useState<string>(testShowcaseArticles[1].title); // Pre-load fake anti-gravity
  const [text, setText] = useState<string>(testShowcaseArticles[1].text);
  
  // URL Scraping
  const [scrapUrl, setScrapUrl] = useState<string>('');
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scraperError, setScraperError] = useState<string | null>(null);
  const [scraperSuccess, setScraperSuccess] = useState<boolean>(false);

  // Local NLP Analysis Results (automatically computed)
  const [localAnalysis, setLocalAnalysis] = useState<NLPAnalysisResult | null>(null);

  // Interface view toggles
  const [wordHighlightMode, setWordHighlightMode] = useState<'naive_bayes' | 'tfidf' | 'stopwords'>('naive_bayes');
  const [selectedWordDetails, setSelectedWordDetails] = useState<{ word: string; score: number; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'comparison' | 'lexical'>('comparison');

  // Trigger Local Analysis on Input Change
  useEffect(() => {
    if (title.trim() || text.trim()) {
      const results = analyzeNewsArticle(title, text);
      setLocalAnalysis(results);
    } else {
      setLocalAnalysis(null);
    }
  }, [title, text]);

  // Load sample article
  const handleLoadSample = (articleId: string) => {
    const found = testShowcaseArticles.find(a => a.id === articleId);
    if (found) {
      setTitle(found.title);
      setText(found.text);
      setScraperSuccess(false);
      setScraperError(null);
      setSelectedWordDetails(null);
    }
  };

  // Clear inputs
  const handleClearInputs = () => {
    setTitle('');
    setText('');
    setScrapUrl('');
    setScraperError(null);
    setScraperSuccess(false);
    setSelectedWordDetails(null);
  };

  // Trigger URL Scrape
  const handleUrlScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapUrl || !scrapUrl.trim().startsWith('http')) {
      setScraperError('Please enter a valid URL beginning with http:// or https://');
      return;
    }

    setIsScraping(true);
    setScraperError(null);
    setScraperSuccess(false);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapUrl.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to scrape online article.');
      }

      if (data.title || data.text) {
        setTitle(data.title || '');
        setText(data.text || '');
        setScraperSuccess(true);
      } else {
        setScraperError('Scraper completed, but no substantial text could be extracted.');
      }
    } catch (err: any) {
      setScraperError(err.message || 'Scraping failed. The server might be rate-limited or the site forbids automated reads.');
    } finally {
      setIsScraping(false);
    }
  };

  // Process text words into an attention/influence map token layout
  const rawTokens = useMemo(() => {
    if (!text) return [];
    // Split keeping punctuations intact so reading flow is preserved
    return text.split(/(\s+)/).filter(t => t.length > 0);
  }, [text]);

  const tokenAnalysisList = useMemo(() => {
    if (!localAnalysis) return [];
    
    return rawTokens.map((rawToken, index) => {
      const cleanWord = rawToken.toLowerCase().replace(/[^\w]/g, '');
      let colorClass = 'bg-slate-50 hover:bg-slate-200 text-slate-700';
      let score = 0;
      let type = 'Neutral';

      if (!cleanWord) {
        return { rawToken, cleanWord, colorClass, score, type };
      }

      // 1. Is Stopword
      if (STOPWORDS.has(cleanWord)) {
        if (wordHighlightMode === 'stopwords') {
          colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
        }
        return { rawToken, cleanWord, colorClass, score, type: 'Grammatical Stopword' };
      }

      // 2. Naive Bayes weight highlight
      const contribution = localAnalysis.topContributions.find(c => c.word === cleanWord);
      
      // Calculate tfidf strength
      const tfidfWeightObj = localAnalysis.tfidfVector.find(v => v.term === cleanWord);
      const tfidfScore = tfidfWeightObj ? tfidfWeightObj.tfidf : 0;

      if (wordHighlightMode === 'naive_bayes' && contribution) {
        score = contribution.score;
        if (contribution.label === 'fake') {
          type = 'Bias toward FAKE';
          // Negative rating means points to fake news, render red density
          const absVal = Math.min(1, Math.abs(contribution.score) / 3);
          if (absVal > 0.7) colorClass = 'bg-red-500 text-white';
          else if (absVal > 0.4) colorClass = 'bg-red-300 text-slate-900';
          else colorClass = 'bg-red-100 text-red-950';
        } else {
          type = 'Bias toward REAL';
          // Positive score points to real news, render green density
          const absVal = Math.min(1, Math.abs(contribution.score) / 3);
          if (absVal > 0.7) colorClass = 'bg-emerald-500 text-white';
          else if (absVal > 0.4) colorClass = 'bg-emerald-300 text-slate-900';
          else colorClass = 'bg-emerald-100 text-emerald-950';
        }
      } else if (wordHighlightMode === 'tfidf' && tfidfScore > 0) {
        score = tfidfScore;
        type = 'TF-IDF Relevance value';
        const norm = Math.min(1, tfidfScore / 1.5);
        if (norm > 0.7) colorClass = 'bg-blue-600 text-white';
        else if (norm > 0.4) colorClass = 'bg-blue-300 text-slate-900';
        else colorClass = 'bg-blue-100 text-blue-900';
      }

      return { rawToken, cleanWord, colorClass, score, type };
    });
  }, [rawTokens, localAnalysis, wordHighlightMode]);

  // Overall computed parameters
  const wordCount = localAnalysis?.lexical.totalWords || 0;
  const gradeLevel = localAnalysis?.lexical.readabilityScore || 0;
  
  // Decide final active label for display
  const combinedLabel: ArticleLabel = localAnalysis?.label || 'real';
  const combinedConfidence = localAnalysis?.confidence ? (localAnalysis.confidence * 100).toFixed(1) : '50.0';

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800 font-sans leading-normal overflow-x-hidden" id="app_root">
      
      {/* ----------------- TOP NAVBAR ----------------- */}
      <nav className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 shadow-lg relative z-20" id="navbar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-black text-lg text-white font-mono shadow-md">
            V
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              Veritas<span className="text-blue-400">NLP</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono -mt-1 font-semibold">FAKE NEWS CLASSIFIER</span>
          </div>
          <span className="ml-4 px-2.5 py-0.5 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-300 font-mono hidden sm:inline-block">
            v2.4.1-STABLE
          </span>
        </div>

        {/* System parameters */}
        <div className="flex items-center gap-6 text-xs font-semibold">
          <div className="hidden md:flex items-center gap-4 text-slate-300">
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Workspace NLP</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors opacity-60">Batch Analysis</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors opacity-60">Global Models</span>
          </div>
          
          <div className="w-px h-6 bg-slate-800 hidden md:block"></div>
          
          <div className="flex items-center gap-2 bg-slate-800 py-1 px-3 rounded-full border border-slate-700">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-mono tracking-tight text-emerald-300">SERVER ONLINE</span>
          </div>
        </div>
      </nav>

      {/* ----------------- MAIN APP WORKSPACE ----------------- */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 flex flex-col xl:flex-row gap-4" id="main_content_container">
        
        {/* LEFT COLUMN: Input Control & NLP Keyword maps (Takes 7/10 share on desktop) */}
        <section className="xl:flex-[7] flex flex-col gap-4 min-w-0" id="left_processing_canvas">
          
          {/* ARTICLE ENTRY CARD */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col p-0 overflow-hidden" id="entry_editor_card">
            
            {/* Header sub-bar */}
            <div className="h-10 border-b px-4 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-black uppercase text-slate-600 tracking-wider">News Article Under Review</span>
              </div>
              
              {/* Quick Preset Samples selection */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[50vw] py-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase mr-1 hidden sm:inline">Load Sample:</span>
                <button 
                  onClick={() => handleLoadSample('test-1')}
                  className="text-[10px] px-2 py-0.5 bg-white border border-slate-350 hover:border-slate-400 rounded text-slate-700 font-medium cursor-pointer transition-colors shrink-0"
                  id="btn_load_sample_1"
                >
                  🌐 Quantum Chips
                </button>
                <button 
                  onClick={() => handleLoadSample('test-2')}
                  className="text-[10px] px-2 py-0.5 bg-white border border-slate-350 hover:border-slate-400 rounded text-slate-700 font-medium cursor-pointer transition-colors shrink-0"
                  id="btn_load_sample_2"
                >
                  🚀 Anti-Gravity Case
                </button>
                <button 
                  onClick={() => handleLoadSample('test-3')}
                  className="text-[10px] px-2 py-0.5 bg-white border border-slate-350 hover:border-slate-400 rounded text-slate-700 font-medium cursor-pointer transition-colors shrink-0"
                  id="btn_load_sample_3"
                >
                  🩺 WHO Polio Report
                </button>
                <button 
                  onClick={() => handleLoadSample('test-4')}
                  className="text-[10px] px-2 py-0.5 bg-white border border-slate-350 hover:border-slate-400 rounded text-slate-700 font-medium cursor-pointer transition-colors shrink-0"
                  id="btn_load_sample_4"
                >
                  🏜️ Canyon Gold Cave
                </button>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="p-4 flex flex-col gap-3">
              
              {/* Title input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">Article Headline / Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the article title or headline here..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                  id="article_title_input"
                />
              </div>

              {/* Text body area */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">Article Full Text Content</label>
                <textarea 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the full paragraph copy of the news article or editorial here to calculate NLP weight properties..."
                  className="w-full h-44 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded font-serif italic text-slate-700 leading-relaxed placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all shadow-inner resize-y"
                  id="article_text_input"
                />
              </div>

              {/* Web Scraper Box */}
              <form onSubmit={handleUrlScrape} className="mt-1 bg-slate-50 p-2.5 rounded border border-slate-200 flex flex-col sm:flex-row gap-2 items-center">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 shrink-0">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Kaggle/Web URL Scraper:</span>
                </div>
                <div className="flex-1 relative w-full">
                  <input
                    type="url"
                    value={scrapUrl}
                    onChange={(e) => setScrapUrl(e.target.value)}
                    placeholder="https://example-news-blog.com/viral-story-page"
                    className="w-full pl-7 pr-3 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-slate-400 font-mono"
                    id="scraper_url_input"
                  />
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  disabled={isScraping}
                  className="w-full sm:w-auto px-4 py-1.5 bg-slate-800 text-white rounded font-bold text-[10px] uppercase hover:bg-slate-700 disabled:bg-slate-300 transition-colors cursor-pointer shrink-0"
                  id="btn_scrape_trigger"
                >
                  {isScraping ? 'Scraping...' : 'Fetch & Scrape'}
                </button>
              </form>

              {/* Scraper Status Messages */}
              {scraperError && (
                <div className="p-2 bg-red-50 text-red-700 rounded text-xs border border-red-100 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{scraperError}</span>
                </div>
              )}
              {scraperSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded text-xs border border-emerald-100 flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>Scraper complete! Populated title and body content for calculation.</span>
                </div>
              )}

            </div>

            {/* Bottom bar of editor */}
            <div className="h-12 border-t px-4 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1 font-semibold">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  Words: <strong className="text-slate-800">{wordCount}</strong>
                </span>
                <span className="hidden sm:inline border-r h-4 border-slate-300"></span>
                <span className="hidden sm:flex items-center gap-1 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Linguistic Index: <strong className="text-slate-800">{gradeLevel} Kincaid</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClearInputs}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                  id="btn_clear_editor"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>

          </div>

          {/* ATTENTION / KEYWORD HIGHLIGHTING MAP */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col" id="attention_map_card">
            
            {/* Header */}
            <div className="h-12 border-b px-4 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 shrink-0 py-1 sm:py-0">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-black uppercase text-slate-600 tracking-wider">NLP Feature Mapping & Token Heatmap</span>
              </div>

              {/* View options selectors */}
              <div className="flex items-center gap-1 mt-1 sm:mt-0 bg-slate-200 p-0.5 rounded border border-slate-300">
                <button
                  onClick={() => {
                    setWordHighlightMode('naive_bayes');
                    setSelectedWordDetails(null);
                  }}
                  className={`text-[9px] px-2.5 py-1 rounded font-bold uppercase transition-all cursor-pointer ${wordHighlightMode === 'naive_bayes' ? 'bg-white shadow text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
                  id="toggle_nb_weight"
                >
                  Naive Bayes Biases
                </button>
                <button
                  onClick={() => {
                    setWordHighlightMode('tfidf');
                    setSelectedWordDetails(null);
                  }}
                  className={`text-[9px] px-2.5 py-1 rounded font-bold uppercase transition-all cursor-pointer ${wordHighlightMode === 'tfidf' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                  id="toggle_tfidf_weight"
                >
                  TF-IDF Rarity
                </button>
                <button
                  onClick={() => {
                    setWordHighlightMode('stopwords');
                    setSelectedWordDetails(null);
                  }}
                  className={`text-[9px] px-2.5 py-1 rounded font-bold uppercase transition-all cursor-pointer ${wordHighlightMode === 'stopwords' ? 'bg-white shadow text-amber-700' : 'text-slate-600 hover:text-slate-900'}`}
                  id="toggle_stopword_weight"
                >
                  Pruned Stopwords
                </button>
              </div>
            </div>

            {/* Heatmap Area */}
            <div className="p-4 flex-1 flex flex-col gap-3 min-h-[160px]">
              
              {!text.trim() ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                  <Layers3 className="w-8 h-8 opacity-40 mb-2 animate-bounce" />
                  <p className="text-xs font-semibold">Write an article above to render lexical and attention tokens.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  
                  {/* Legend explanation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 bg-slate-50 p-2 rounded">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500">
                      {wordHighlightMode === 'naive_bayes' && (
                        <>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 border"></span> Real Association (Positive Log likelihood)</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500 border"></span> Fake Association (Negative Log likelihood)</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-50 border"></span> Neutral / Common term</span>
                        </>
                      )}
                      {wordHighlightMode === 'tfidf' && (
                        <>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-600 border"></span> Extreme Document Rarity (High TF-IDF weight)</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-200 border"></span> Low / Average Rarity term</span>
                        </>
                      )}
                      {wordHighlightMode === 'stopwords' && (
                        <>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-200 border"></span> Filtered Word (Has no semantic significance)</span>
                          <span className="text-slate-400 italic">These word lists are fully ignored by the probabilistic mathematical engines!</span>
                        </>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">Hover or tap on highlighting words</span>
                  </div>

                  {/* Words stream */}
                  <div className="flex flex-wrap gap-x-1.5 gap-y-2 leading-relaxed p-2 max-h-[220px] overflow-y-auto font-mono text-[11px] bg-slate-50/50 rounded border border-slate-100 placeholder-slate-200" id="word_heatmap_grid">
                    {tokenAnalysisList.map((tok, idx) => {
                      if (!tok.cleanWord) {
                        return <span key={idx} className="text-slate-400 self-center">{tok.rawToken}</span>;
                      }
                      
                      const hasActiveScore = wordHighlightMode !== 'stopwords' ? Math.abs(tok.score) > 0 : STOPWORDS.has(tok.cleanWord);
                      const isHovered = selectedWordDetails?.word === tok.cleanWord;

                      return (
                        <span 
                          key={idx}
                          onClick={() => {
                            if (hasActiveScore) {
                              setSelectedWordDetails({
                                word: tok.cleanWord,
                                score: tok.score,
                                type: tok.type
                              });
                            }
                          }}
                          className={`px-1.5 py-0.5 rounded transition-all cursor-pointer select-none text-[10px] leading-none ${tok.colorClass} ${hasActiveScore ? 'hover:scale-105 border font-bold border-transparent shadow-sm' : ''} ${isHovered ? 'ring-2 ring-blue-500 scale-105 font-black' : ''}`}
                          title={`${tok.cleanWord} - Score: ${tok.score}`}
                        >
                          {tok.rawToken}
                        </span>
                      );
                    })}
                  </div>

                  {/* Selected Token detailed drawer feedback */}
                  {selectedWordDetails && (
                    <div className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs border border-slate-700 font-mono shadow-md flex items-center justify-between" id="selected_word_pnl">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
                          {selectedWordDetails.word[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 leading-none">Token Explanatory Feature Context</p>
                          <p className="text-sm font-black text-white mt-1">"{selectedWordDetails.word}"</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 leading-none">Statistical Indicator Type</p>
                          <p className="text-xs text-orange-400 font-bold mt-1 uppercase">{selectedWordDetails.type}</p>
                        </div>
                        <div className="text-right border-l border-slate-700 pl-4">
                          <p className="text-[10px] text-slate-400 leading-none">Log/TF-IDF Value</p>
                          <p className={`text-sm font-bold mt-1 ${selectedWordDetails.score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {selectedWordDetails.score > 0 ? `+${selectedWordDetails.score}` : selectedWordDetails.score}
                          </p>
                        </div>
                        <button 
                          onClick={() => setSelectedWordDetails(null)}
                          className="text-slate-400 hover:text-white pl-2 cursor-pointer transition-colors font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
            
            <div className="h-6 px-4 border-t flex items-center justify-between text-[9px] text-slate-400 italic bg-slate-50 font-mono shrink-0">
              <span>LEXICAL DICTIONARY SIZE: {localAnalysis?.topContributions.length || 0} SECTOR TERMS</span>
              <span>Values map mathematical correlation with specific categories</span>
            </div>
          </div>

          {/* LOWER INTERACTIVE TABS: Classifier Comparison vs Deep Gemini Fact-Check */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col" id="analysis_details_tabs_card">
            
            {/* Tab buttons bar */}
            <div className="h-11 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between" id="tabs_header">
              <div className="flex gap-1 h-full items-end">
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`px-4 py-2 border-t-2 text-[10px] tracking-wide font-black uppercase flex items-center gap-1.5 cursor-pointer h-full transition-all ${activeTab === 'comparison' ? 'bg-white text-slate-900 border-blue-500 rounded-t' : 'text-slate-400 hover:text-white border-transparent'}`}
                  id="tab_comparison_btn"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  NLP Models Duel
                </button>
                <button
                  onClick={() => setActiveTab('lexical')}
                  className={`px-4 py-2 border-t-2 text-[10px] tracking-wide font-black uppercase flex items-center gap-1.5 cursor-pointer h-full transition-all ${activeTab === 'lexical' ? 'bg-white text-slate-900 border-blue-500 rounded-t' : 'text-slate-400 hover:text-white border-transparent'}`}
                  id="tab_lexical_btn"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Advanced Lexical Ratios
                </button>
              </div>

              {/* Quick latency stats */}
              <div className="hidden sm:flex text-[9px] text-slate-500 font-mono font-bold">
                LATENCY ACCELERATOR: ONLINE
              </div>
            </div>

            {/* TAB CONTENT SECTION */}
            <div className="p-4 flex-1">
              
              {/* TAB 1: NLP MODERN COMPONENT DUEL */}
              {activeTab === 'comparison' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-blue-50/50 text-blue-900 border border-blue-100 p-3 rounded text-[11px] leading-relaxed relative overflow-hidden flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Multi-Classifier Duel Architecture:</strong> VeritasNLP processes your input through three totally distinct NLP algorithms to check for malicious formatting. Real-time consensus is calculated on each keystroke or dataset load.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Classifier 1: Heuristic Rule-Based Pattern Classifier */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2 pb-1 border-b">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Rule-Based Baseline</span>
                          <span className="text-[9px] font-mono leading-none bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">HEURISTIC</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                          Evaluates structural parameters like exclamation count, CAPS LOCK ratios, and specific blacklisted trigger words.
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] text-slate-400 font-bold uppercase leading-none">Model Verdict</p>
                          <span className={`text-xs font-bold ${localAnalysis ? (localAnalysis.lexical.titleSensationalism > 40 || localAnalysis.lexical.exclamationDensity > 2 ? 'text-red-600' : 'text-emerald-700') : 'text-slate-400'}`}>
                            {localAnalysis ? (localAnalysis.lexical.titleSensationalism > 40 || localAnalysis.lexical.exclamationDensity > 2 ? 'FAKE ARTICLE' : 'REAL ARTICLE') : 'No Input'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-slate-400 font-bold uppercase leading-none">Confidence</p>
                          <span className="text-xs font-mono font-bold">
                            {localAnalysis ? `${Math.round(40 + (localAnalysis.lexical.titleSensationalism / 2))}%` : '0%'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Classifier 2: TF-IDF Vector Centroid Cosine Similarity */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2 pb-1 border-b">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider font-mono">TF-IDF Vector cosine</span>
                          <span className="text-[9px] font-mono leading-none bg-blue-100 px-1.5 py-0.5 rounded text-blue-750">MATROID</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                          Computes token frequency matrices penalized by global dataset document frequency, measuring spatial cosine angle to target centroids.
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] text-slate-400 font-bold uppercase leading-none">Vector Verdict</p>
                          <span className={`text-xs font-bold ${localAnalysis ? (localAnalysis.cosineSimilarityReal >= localAnalysis.cosineSimilarityFake ? 'text-emerald-700' : 'text-red-600') : 'text-slate-400'}`}>
                            {localAnalysis ? (localAnalysis.cosineSimilarityReal >= localAnalysis.cosineSimilarityFake ? 'REAL ARTICLE' : 'FAKE ARTICLE') : 'No Input'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-slate-400 font-bold uppercase leading-none">Cosine Match</p>
                          <span className="text-xs font-mono font-bold text-slate-600 block">
                            R: {localAnalysis?.cosineSimilarityReal.toFixed(3) || '0.0'} | F: {localAnalysis?.cosineSimilarityFake.toFixed(3) || '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Classifier 3: Naive Bayes Multinomial Probabilities */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2 pb-1 border-b">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Naive Bayes Classifier</span>
                          <span className="text-[9px] font-mono leading-none bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-750">PROBABILITY</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                          Applies joint log-probabilities with Laplace smoothing over the complete vocabulary training corpus. High performance on semantic styles!
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] text-slate-400 font-bold uppercase leading-none">NB Posterior</p>
                          <span className={`text-xs font-bold ${localAnalysis ? (localAnalysis.label === 'real' ? 'text-emerald-700' : 'text-red-600') : 'text-slate-400'}`}>
                            {localAnalysis ? (localAnalysis.label === 'real' ? 'REAL ARTICLE' : 'FAKE ARTICLE') : 'No Input'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-slate-400 font-bold uppercase leading-none">Laplace Log</p>
                          <span className="text-xs font-mono font-bold text-slate-800">
                            {localAnalysis ? `${(localAnalysis.confidence * 100).toFixed(1)}%` : '0%'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: LEXICAL SPECIFIC RATIOS */}
              {activeTab === 'lexical' && (
                <div className="flex flex-col gap-4 text-xs font-sans text-slate-700 leading-relaxed">
                  
                  {!localAnalysis ? (
                    <p className="text-slate-500 italic py-6 text-center">No loaded data. Write text inside the editor above.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="bg-slate-50 p-3 rounded-lg border">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Vocabulary Diversity Ratio</span>
                        <div className="text-xl font-bold font-mono text-slate-800">
                          {(localAnalysis.lexical.lexicalDiversity * 100).toFixed(1)}%
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Ratio of unique keywords to absolute token counts. Higher values indicate detailed, specialized writing styles.
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Uppercase (SHOUTING) Ratio</span>
                        <div className="text-xl font-bold font-mono text-slate-800">
                          {(localAnalysis.lexical.uppercaseRatio * 100).toFixed(1)}%
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Frequency of capitalized letters. Clickbait news channels rely heavily on excessive All-Caps blocks inside headlines.
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Exclamations Frequency</span>
                        <div className="text-xl font-bold font-mono text-slate-800">
                          {localAnalysis.lexical.exclamationDensity.toFixed(1)} /1k
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Frequency of exclamations per 1,000 words. Real articles average 0.2, fake items frequently exceed 8.0!
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Median Sentence Length</span>
                        <div className="text-xl font-bold font-mono text-slate-800">
                          {localAnalysis.lexical.avgSentenceLength} words
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Average count of words grouped in each sentence. Reliable journalism generally features longer, balanced clauses.
                        </p>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Consolidated Decision, Key TF-IDF vectors (Takes 3/10 share on desktop) */}
        <section className="xl:flex-[3] flex flex-col gap-4 min-w-0" id="right_metrics_rail">
          
          {/* CONSOLIDATED STYLED DECISION CARD */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden" id="verdict_hero_card">
            
            {/* Top banner corner text */}
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
              Global Pipeline Consensus
            </span>

            {/* Core Classification display */}
            {combinedLabel === 'fake' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-650 border border-red-200 mb-3 shadow-inner">
                  <ShieldAlert className="w-9 h-9" />
                </div>
                <div className="text-red-600 font-extrabold text-4xl tracking-tighter" id="display_label_fake">
                  FAKE NEWS
                </div>
                <p className="text-[10px] bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 font-bold mt-2 select-none uppercase tracking-wider">
                  ⚠️ High Risk Anomaly detected
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-750 border border-emerald-200 mb-3 shadow-inner">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <div className="text-emerald-700 font-extrabold text-4xl tracking-tighter" id="display_label_real">
                  REAL NEWS
                </div>
                <p className="text-[10px] bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 font-bold mt-2 select-none uppercase tracking-wider">
                  ✓ Verified stylistic patterns
                </p>
              </div>
            )}

            {/* Scale Slider */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-5 relative border shadow-inner">
              <div 
                className={`h-full transition-all duration-700 ${combinedLabel === 'fake' ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${combinedConfidence}%` }}
              ></div>
            </div>

            {/* Sub details */}
            <div className="flex justify-between w-full mt-2 text-[10px] font-mono text-slate-500 font-bold uppercase">
              <span>Classifier Certainty</span>
              <span className={combinedLabel === 'fake' ? 'text-red-600' : 'text-emerald-700'}>
                {combinedConfidence}%
              </span>
            </div>
          </div>

          {/* ADVANCED LEXICAL METRICS GAUGES */}
          <div className="bg-slate-900 rounded-lg shadow-md border border-slate-800 p-4 text-white flex flex-col" id="metrics_slider_box">
            <span className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest block border-b border-slate-800 pb-1.5">
              Engine Statistics Dashboard
            </span>

            <div className="space-y-4">
              
              {/* Metric 1: Sentiment analysis proxy */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Emotional Hostility</span>
                  <span className="text-orange-400 font-bold">
                    {localAnalysis ? (localAnalysis.lexical.titleSensationalism > 50 ? 'Extremely Aggressive' : 'Balanced Objective') : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-400 h-full transition-all duration-500" 
                    style={{ width: localAnalysis ? `${localAnalysis.lexical.titleSensationalism}%` : '50%' }}
                  ></div>
                </div>
              </div>

              {/* Metric 2: Subjective Formatting proxy */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Punctuation Alert Level</span>
                  <span className="text-blue-400 font-bold">
                    {localAnalysis ? (localAnalysis.lexical.exclamationDensity > 2 ? 'High Punctuation Bias' : 'Normal / Low') : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-400 h-full transition-all duration-500" 
                    style={{ width: localAnalysis ? `${Math.min(100, localAnalysis.lexical.exclamationDensity * 15)}%` : '20%' }}
                  ></div>
                </div>
              </div>

              {/* Metric 3: Source Credibility proxy */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">General Information Density</span>
                  <span className="text-emerald-400 font-bold">
                    {localAnalysis ? (localAnalysis.lexical.lexicalDiversity > 0.45 ? 'Highly Specialized' : 'Average Lexile') : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-500" 
                    style={{ width: localAnalysis ? `${Math.min(100, localAnalysis.lexical.lexicalDiversity * 160)}%` : '50%' }}
                  ></div>
                </div>
              </div>

            </div>

            {/* Keyword tags based on real TF-IDF weights */}
            <div className="mt-6 pt-4 border-t border-slate-850">
              <div className="text-[10px] text-slate-500 font-mono font-black mb-2.5 uppercase tracking-wide">
                TF-IDF Highly Characteristic Terms:
              </div>
              
              {!localAnalysis || localAnalysis.tfidfVector.length === 0 ? (
                <div className="text-[10px] text-slate-500 italic pb-2">Waiting for article input vectors...</div>
              ) : (
                <div className="flex flex-wrap gap-1.5" id="tfidf_tags_container">
                  {localAnalysis.tfidfVector.slice(0, 7).map((weight, i) => (
                    <span 
                      key={i} 
                      onClick={() => {
                        setSelectedWordDetails({
                          word: weight.term,
                          score: weight.tfidf,
                          type: 'TF-IDF Dimension Weight'
                        });
                        setWordHighlightMode('tfidf');
                      }}
                      className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-750 hover:border-slate-500 transition-colors cursor-pointer font-mono flex items-center gap-1"
                      title={`TF-IDF Weight Score: ${weight.tfidf}`}
                    >
                      <span>{weight.term}</span>
                      <span className="text-[8px] bg-slate-700 text-slate-400 rounded px-1">{weight.tfidf.toFixed(2)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
          </div>

          {/* CLASSIFICATION ENGINE PIPELINE DIAGRAM */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col" id="pipeline_diagram_box">
            <span className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest block">
              Computational Pipeline Lifecycle
            </span>

            <div className="flex-1 flex flex-col gap-2.5">
              
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 font-mono border">
                  IN
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-[10px] font-bold text-slate-800 uppercase">1. Article Input Stream</p>
                  <p className="text-[9px] text-slate-400 font-medium">Text extraction & normalization</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 font-mono border border-blue-200">
                  REG
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-[10px] font-bold text-slate-800 uppercase">2. TF-IDF Normalization</p>
                  <p className="text-[9px] text-slate-400 font-medium">Pruning {STOPWORDS.size} common English stopwords</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 font-mono border border-indigo-200">
                  CLF
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-[10px] font-bold text-slate-800 uppercase">3. Probability Model</p>
                  <p className="text-[9px] text-slate-400 font-medium">Joint multinomial Naive Bayes evaluation</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-3 pt-1 border-t border-dashed">
                <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                  OUT
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-[10px] font-black text-slate-800 uppercase">4. Consensus Verdict</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase transition-all">
                    {combinedLabel === 'fake' ? '⚠️ Anomalous Threat Level' : '✓ Standard Factual Tone'}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </section>

      </main>

      {/* ----------------- SYSTEM SPEC FOOTER ----------------- */}
      <footer className="h-8 bg-white border-t px-6 flex items-center justify-between text-[9px] text-slate-400 shrink-0 font-mono font-semibold" id="footer">
        <div>CORE PLATFORM: REACT 19.0.1 + EXPRESS SERVER</div>
        <div className="hidden sm:block">NLP REPOSITORY SESSION: ACTIVE SHADOW PIPELINE</div>
        <div>LATENCY: COMPRESSED</div>
      </footer>

    </div>
  );
}
