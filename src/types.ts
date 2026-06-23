export type ArticleLabel = 'real' | 'fake';

export interface NewsArticle {
  id: string;
  title: string;
  text: string;
  label: ArticleLabel;
  source?: string;
  date?: string;
  summary?: string;
}

export interface LexicalMetrics {
  totalWords: number;
  uniqueWords: number;
  lexicalDiversity: number; // unique / total
  avgSentenceLength: number;
  exclamationDensity: number; // count per 1000 words
  uppercaseRatio: number; // uppercase letters / total letters in title/text
  readabilityScore: number; // approximate Flesch Kincaid Grade Level
  titleSensationalism: number; // 0 to 100 calculated from capitalization and exclamations
}

export interface TFIDFWeight {
  term: string;
  tfidf: number;
  tf: number;
  idf: number;
}

export interface WordContribution {
  word: string;
  score: number; // log likelihood ratio or relative weight
  label: ArticleLabel;
}

export interface NLPAnalysisResult {
  label: ArticleLabel;
  confidence: number; // 0 to 1
  lexical: LexicalMetrics;
  tfidfVector: TFIDFWeight[];
  topContributions: WordContribution[];
  cosineSimilarityReal: number;
  cosineSimilarityFake: number;
  modelType: 'rule_based' | 'naive_bayes' | 'tfidf_cosine' | 'transformer';
}

export interface TransformerReport {
  label: ArticleLabel;
  confidence: number;
  credibilityScore: number; // 0 to 100
  sensationalismScore: number; // 0 to 100
  logicalFallacies: string[];
  sourcesCitedStatus: string;
  analysisExplanation: string;
  factualChecks: Array<{
    claim: string;
    verdict: 'verified' | 'refuted' | 'unverified';
    explanation: string;
  }>;
}

export interface ComparisonResult {
  ruleBased: { label: ArticleLabel; confidence: number };
  naiveBayes: { label: ArticleLabel; confidence: number };
  tfidfCosine: { label: ArticleLabel; confidence: number };
  transformer: TransformerReport | null; // loaded on-demand via server Gemini API
}
