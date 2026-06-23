import { NewsArticle, LexicalMetrics, TFIDFWeight, NLPAnalysisResult, WordContribution, ArticleLabel } from '../types';
import { trainingCorpus } from '../data/newsDataset';

// Custom List of English Stopwords
export const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'by', 'with', 
  'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 
  'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 
  'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 
  'will', 'just', 'don', 'should', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 
  'ours', 'ourselves', 'you', 'your', 'yours', 'he', 'him', 'his', 'himself', 'she', 
  'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 
  'themselves', 'is', 'was', 'were', 'am', 'are', 'be', 'been', 'being', 'have', 
  'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'could', 'of', 'this',
  'that', 'these', 'those', 'who', 'which', 'whom'
]);

// Helper: Tokenize string into alphanumeric lowercase terms
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length > 0);
}

// Helper: Filter stopwords
export function removeStopwords(tokens: string[]): string[] {
  return tokens.filter(token => !STOPWORDS.has(token));
}

// Extract Lexical Metrics
export function extractLexicalMetrics(title: string, text: string): LexicalMetrics {
  const combinedText = `${title} ${text}`;
  const rawTokens = tokenize(combinedText);
  const totalWords = rawTokens.length || 1;
  
  const uniqueWordsSet = new Set(rawTokens);
  const uniqueWords = uniqueWordsSet.size;
  const lexicalDiversity = Number((uniqueWords / totalWords).toFixed(4));
  
  // Sentences count based on delimiters
  const sentences = combinedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  const avgSentenceLength = Number((totalWords / sentenceCount).toFixed(2));
  
  // Exclamations count Density
  const exclamationCount = (combinedText.match(/!/g) || []).length;
  const exclamationDensity = Number(((exclamationCount / totalWords) * 1000).toFixed(2));
  
  // Uppercase ratios
  const letters = combinedText.replace(/[^a-zA-Z]/g, '');
  const lettersCount = letters.length || 1;
  const uppercaseLetters = (combinedText.replace(/[^A-Z]/g, '')).length;
  const uppercaseRatio = Number((uppercaseLetters / lettersCount).toFixed(4));
  
  // Coleman-Liau Readability Index: CLI = 0.0588 L - 0.296 S - 15.8
  // L = avg letters per 100 words, S = avg sentences per 100 words
  const letterCountOnly = combinedText.replace(/[^a-zA-Z0-9]/g, '').length;
  const L = (letterCountOnly / totalWords) * 100;
  const S = (sentenceCount / totalWords) * 100;
  const rawCli = 0.0588 * L - 0.296 * S - 15.8;
  const readabilityScore = Number(Math.max(1, Math.min(20, Math.round(rawCli * 10) / 10)).toFixed(1));
  
  // Heuristics-based Title Sensationalism Calculator (0 to 100)
  let sensationalismPoints = 0;
  const titleLetters = title.replace(/[^a-zA-Z]/g, '');
  const titleLettersCount = titleLetters.length || 1;
  const titleUpper = (title.replace(/[^A-Z]/g, '')).length;
  const titleUpperRatio = titleUpper / titleLettersCount;
  
  // All caps in title
  if (titleUpperRatio > 0.35) sensationalismPoints += 30;
  else if (titleUpperRatio > 0.20) sensationalismPoints += 15;
  
  // Trigger words
  const clickbaitWords = ['shocking', 'secret', 'alert', 'wow', 'unbelievable', 'leak', 'proof', 'satanic', 'miracle', 'urgent', '!!!', 'omg'];
  const lowercaseTitle = title.toLowerCase();
  clickbaitWords.forEach(word => {
    if (lowercaseTitle.includes(word)) sensationalismPoints += 15;
  });
  
  // Check trailing exclamations in title
  if ((title.match(/!/g) || []).length > 1) sensationalismPoints += 25;
  
  const titleSensationalism = Math.min(100, sensationalismPoints);
  
  return {
    totalWords,
    uniqueWords,
    lexicalDiversity,
    avgSentenceLength,
    exclamationDensity,
    uppercaseRatio,
    readabilityScore: Number(readabilityScore),
    titleSensationalism
  };
}

// --- TF-IDF Engine & Centroid Comparison ---
export class TFIDFClassifier {
  private docCount: number = 0;
  private dfMap: Map<string, number> = new Map();
  private idfMap: Map<string, number> = new Map();
  private classCentroids: Record<ArticleLabel, Map<string, number>> = {
    real: new Map(),
    fake: new Map()
  };

  constructor(corpus: NewsArticle[]) {
    this.train(corpus);
  }

  private train(corpus: NewsArticle[]) {
    this.docCount = corpus.length;
    const classDocs: Record<ArticleLabel, string[][]> = {
      real: [],
      fake: []
    };

    // Calculate document frequencies
    corpus.forEach(doc => {
      const tokens = removeStopwords(tokenize(`${doc.title} ${doc.text}`));
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(term => {
        this.dfMap.set(term, (this.dfMap.get(term) || 0) + 1);
      });
      classDocs[doc.label].push(tokens);
    });

    // Compute IDF values
    // IDF(w) = ln(1 + DocCount / (1 + Document Frequency))
    this.dfMap.forEach((freq, term) => {
      const idf = Math.log(1 + this.docCount / freq);
      this.idfMap.set(term, idf);
    });

    // Compute Average Centroid Vector for each label (Real, Fake)
    (['real', 'fake'] as ArticleLabel[]).forEach(label => {
      const docs = classDocs[label];
      const aggregatedTfidf: Map<string, number> = new Map();

      docs.forEach(docTokens => {
        const tfMap = this.getTermFrequencies(docTokens);
        tfMap.forEach((tf, term) => {
          const idf = this.idfMap.get(term) || 0;
          const tfidf = tf * idf;
          aggregatedTfidf.set(term, (aggregatedTfidf.get(term) || 0) + tfidf);
        });
      });

      // Normalize average vector by document count in that class
      const centroidMap = this.classCentroids[label];
      aggregatedTfidf.forEach((totalTfidf, term) => {
        centroidMap.set(term, totalTfidf / Math.max(1, docs.length));
      });
    });
  }

  private getTermFrequencies(tokens: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    tokens.forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
    const termFrequencies = new Map<string, number>();
    counts.forEach((count, t) => {
      // Logarithmic TF to penalize very high repeats in single document
      termFrequencies.set(t, 1 + Math.log(count));
    });
    return termFrequencies;
  }

  public getTFIDFVector(title: string, text: string): TFIDFWeight[] {
    const tokens = removeStopwords(tokenize(`${title} ${text}`));
    const tfMap = this.getTermFrequencies(tokens);
    const vector: TFIDFWeight[] = [];

    tfMap.forEach((tf, term) => {
      const idf = this.idfMap.get(term) ?? Math.log(1 + this.docCount / 1); // fallback idf
      vector.push({
        term,
        tfidf: tf * idf,
        tf,
        idf
      });
    });

    return vector.sort((a, b) => b.tfidf - a.tfidf);
  }

  // Pure Vector Cosine Similarity Implementation
  // CosSim = (A . B) / (||A|| * ||B||)
  public calculateCosineSimilarity(docVector: TFIDFWeight[], label: ArticleLabel): number {
    const centroid = this.classCentroids[label];
    let dotProduct = 0;
    let docMagnitudeSq = 0;
    let centroidMagnitudeSq = 0;

    // Calculate doc magnitude
    docVector.forEach(weight => {
      docMagnitudeSq += weight.tfidf * weight.tfidf;
    });

    // Calculate centroid magnitude and dot product
    centroid.forEach((val, term) => {
      centroidMagnitudeSq += val * val;
    });

    docVector.forEach(weight => {
      const centroidVal = centroid.get(weight.term) || 0;
      if (centroidVal > 0) {
        dotProduct += weight.tfidf * centroidVal;
      }
    });

    const docMag = Math.sqrt(docMagnitudeSq);
    const centroidMag = Math.sqrt(centroidMagnitudeSq);

    if (docMag === 0 || centroidMag === 0) return 0;
    return Number((dotProduct / (docMag * centroidMag)).toFixed(4));
  }

  public classify(title: string, text: string): { label: ArticleLabel; confidence: number; scoreReal: number; scoreFake: number } {
    const vector = this.getTFIDFVector(title, text);
    const scoreReal = this.calculateCosineSimilarity(vector, 'real');
    const scoreFake = this.calculateCosineSimilarity(vector, 'fake');

    const total = scoreReal + scoreFake;
    if (total === 0) {
      return { label: 'real', confidence: 0.5, scoreReal, scoreFake };
    }

    const label: ArticleLabel = scoreReal >= scoreFake ? 'real' : 'fake';
    const confidence = Number((Math.max(scoreReal, scoreFake) / total).toFixed(2));

    return { label, confidence, scoreReal, scoreFake };
  }
}

// --- Naive Bayes Probabilistic Classifier ---
export class NaiveBayesClassifier {
  private vocab: Set<string> = new Set();
  private wordCounts: Record<ArticleLabel, Map<string, number>> = {
    real: new Map(),
    fake: new Map()
  };
  private totalWordCounts: Record<ArticleLabel, number> = {
    real: 0,
    fake: 0
  };
  private classCount: Record<ArticleLabel, number> = {
    real: 0,
    fake: 0
  };
  private docCount: number = 0;

  constructor(corpus: NewsArticle[]) {
    this.train(corpus);
  }

  private train(corpus: NewsArticle[]) {
    this.docCount = corpus.length;
    corpus.forEach(doc => {
      this.classCount[doc.label]++;
      // Tokenize title + text
      const tokens = removeStopwords(tokenize(`${doc.title} ${doc.text}`));
      
      tokens.forEach(term => {
        this.vocab.add(term);
        const map = this.wordCounts[doc.label];
        map.set(term, (map.get(term) || 0) + 1);
        this.totalWordCounts[doc.label]++;
      });
    });
  }

  // laplace smoothing probability: P(w | class) = (Count(w, class) + 1) / (TotalWords(class) + |V|)
  private getWordProbability(word: string, label: ArticleLabel): number {
    const count = this.wordCounts[label].get(word) || 0;
    const nominator = count + 1;
    const denominator = this.totalWordCounts[label] + this.vocab.size;
    return nominator / denominator;
  }

  public classify(title: string, text: string): { 
    label: ArticleLabel; 
    confidence: number; 
    contributions: WordContribution[] 
  } {
    const tokens = removeStopwords(tokenize(`${title} ${text}`));
    
    // Log priors
    const logPriorReal = Math.log(this.classCount.real / this.docCount);
    const logPriorFake = Math.log(this.classCount.fake / this.docCount);
    
    let logScoreReal = logPriorReal;
    let logScoreFake = logPriorFake;
    
    const wordContributions: WordContribution[] = [];

    tokens.forEach(word => {
      // We skip words that have never been seen in either class training data to avoid skewing unknown inputs
      if (!this.vocab.has(word)) return;

      const pReal = this.getWordProbability(word, 'real');
      const pFake = this.getWordProbability(word, 'fake');

      logScoreReal += Math.log(pReal);
      logScoreFake += Math.log(pFake);

      // Relative log likelihood ratio: shows how strongly it points to fake vs real
      // Positive indicates Real bias, negative indicates Fake bias
      const logRatio = Math.log(pReal) - Math.log(pFake);
      wordContributions.push({
        word,
        score: Number(logRatio.toFixed(3)),
        label: logRatio >= 0 ? 'real' : 'fake'
      });
    });

    // Compute posterior probabilities using softmax style exponential ratios:
    // P(Real) = e^scoreReal / (e^scoreReal + e^scoreFake)
    // To protect against overflow, subtract the max score from both before exponentiation
    const maxLog = Math.max(logScoreReal, logScoreFake);
    const expReal = Math.exp(logScoreReal - maxLog);
    const expFake = Math.exp(logScoreFake - maxLog);
    
    const probReal = expReal / (expReal + expFake);
    const probFake = expFake / (expReal + expFake);

    const label: ArticleLabel = probReal >= probFake ? 'real' : 'fake';
    const confidence = Number((label === 'real' ? probReal : probFake).toFixed(3));

    // Sort contributions by absolute impact (highest absolute score is highest discriminator)
    const sortedContributions = wordContributions
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
      .slice(0, 15); // get top 15 highest-discrimination words

    return {
      label,
      confidence,
      contributions: sortedContributions
    };
  }
}

// --- Rule-Based Baseline Engine ---
export function classifyRuleBased(title: string, text: string): { label: ArticleLabel; confidence: number } {
  const lowercaseCombined = `${title} ${text}`.toLowerCase();
  const titleLetters = title.replace(/[^a-zA-Z]/g, '');
  const titleLettersCount = titleLetters.length || 1;
  const titleUpper = (title.replace(/[^A-Z]/g, '')).length;
  const titleUpperRatio = titleUpper / titleLettersCount;

  const totalExclamations = (text.match(/!/g) || []).length + (title.match(/!/g) || []).length;
  const clickbaitRegex = /\b(shocking|secret|alert|wow|unbelievable|leak|proof|satanic|miracle|urgent|conspiracy|insiders|hide|completely silent|mainstream media)\b/gi;
  const clickbaitMatches = (lowercaseCombined.match(clickbaitRegex) || []).length;

  let maliciousIndicators = 0;
  
  if (titleUpperRatio > 0.3) maliciousIndicators += 2;
  if (totalExclamations > 3) maliciousIndicators += 2;
  if (clickbaitMatches > 1) maliciousIndicators += 2;
  if (clickbaitMatches > 3) maliciousIndicators += 2;

  // Let's classify: if malicious points >= 4, it is highly likely Fake
  if (maliciousIndicators >= 4) {
    const confidence = Math.min(0.9, 0.5 + (maliciousIndicators * 0.08));
    return { label: 'fake', confidence: Number(confidence.toFixed(2)) };
  } else {
    // defaults to real with low confidence
    const confidence = Math.min(0.8, 0.5 + ((4 - maliciousIndicators) * 0.08));
    return { label: 'real', confidence: Number(confidence.toFixed(2)) };
  }
}

// Instantiate Global Engines for App Core
export const tfidfEngine = new TFIDFClassifier(trainingCorpus);
export const naiveBayesEngine = new NaiveBayesClassifier(trainingCorpus);

// Main Full Analyzer Wrapper
export function analyzeNewsArticle(title: string, text: string): NLPAnalysisResult & { scoreReal: number; scoreFake: number } {
  // 1. Lexical features
  const lexical = extractLexicalMetrics(title, text);
  
  // 2. TF-IDF centroid similarities
  const tfidfResult = tfidfEngine.classify(title, text);
  const tfidfVector = tfidfEngine.getTFIDFVector(title, text);
  
  // 3. Naive Bayes classification
  const nbResult = naiveBayesEngine.classify(title, text);

  // Combine outcomes: we will let Naive Bayes & TF-IDF Cosine both vote!
  // If they agree, confidence is high. If they disagree, we decide based on the stronger confidence rating.
  let finalLabel: ArticleLabel = 'real';
  let finalConfidence = 0.5;

  if (nbResult.label === tfidfResult.label) {
    finalLabel = nbResult.label;
    finalConfidence = Math.max(nbResult.confidence, tfidfResult.confidence);
  } else {
    // Select the one with the higher confidence index
    if (nbResult.confidence >= tfidfResult.confidence) {
      finalLabel = nbResult.label;
      finalConfidence = nbResult.confidence;
    } else {
      finalLabel = tfidfResult.label;
      finalConfidence = tfidfResult.confidence;
    }
  }

  return {
    label: finalLabel,
    confidence: finalConfidence,
    lexical,
    tfidfVector: tfidfVector.slice(0, 15), // top 15 terms
    topContributions: nbResult.contributions,
    cosineSimilarityReal: tfidfResult.scoreReal,
    cosineSimilarityFake: tfidfResult.scoreFake,
    scoreReal: tfidfResult.scoreReal,
    scoreFake: tfidfResult.scoreFake,
    modelType: 'naive_bayes' // core algorithm
  };
}
