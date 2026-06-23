import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies
app.use(express.json());

// Initialize Google Gen AI Client lazily as per guidance
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Server Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Web Scraper Proxy Endpoint
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Valid URL starting with http:// or https:// is required.' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL. HTTP status: ${response.status}`);
    }

    const html = await response.text();

    // 1. Core Simple Parsers: Extract <title>
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';

    // Clean html entities in title
    title = title
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Remove site banners / branding usually appended to titles (e.g. "| Reuters", "- BBC News")
    title = title.split(/\s+[-|]\s+/)[0];

    // 2. Parser: Strip scripts, styles, noscript, and sidebar tags to get clean article text
    let cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

    // Extract content specifically within paragraph blocks <p>...</p>
    const paragraphMatches = [...cleanHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    let paragraphs = paragraphMatches
      .map(m => m[1].replace(/<[^>]*>/g, '').trim()) // strip internal markup tags like <a> or <strong>
      .filter(p => p.length > 20); // filter short noise blocks like "Cookies settings", "Read more"

    let articleText = paragraphs.slice(0, 15).join('\n\n'); // Grab first 15 paragraphs for reliable processing

    if (!articleText || articleText.trim().length < 100) {
      // Fallback: strip ALL tags if pattern-based paragraph scraper returns too little text
      let textFallback = cleanHtml
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      articleText = textFallback.slice(0, 2000); // Take first 2000 chars
    }

    // Clean html entities in main text
    articleText = articleText
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    res.json({
      title: title || 'Scraped Article',
      text: articleText || 'Unable to parse substantial text content from this website.'
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: `Scraping failed: ${error.message || error}` });
  }
});

// Advanced NLP Classification via Transformer Model (Gemini 3.5 Flash)
app.post('/api/analyze-transformer', async (req, res) => {
  const { title, text } = req.body;

  if (!title || !text) {
    return res.status(400).json({ error: 'Title and Text elements are required.' });
  }

  try {
    const ai = getAiClient();
    
    const prompt = `You are an elite, objective, state-of-the-art computational NLP and fact-checking model. Your mandate is to analyze the following news article for authenticity, bias, sensationalism, and truthfulness.

TITLE: ${title}
TEXT: ${text}

Analyze this article thoroughly. Evaluate logical consistency, rhetorical devices, spelling pattern biases, hyper-polarized tones, anonymous sourcing, and factual cross-references.
Provide an authenticated diagnostic report in strictly structured JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are a professional natural language processing and fact-checking program. Analyze content strictly on:
1. Credibility index (factual groundings, logical structures).
2. Sensationalism level (exaggeration, fearmongering, all-caps clickbait).
3. Logical fallacies present (e.g., ad hominem, false equivalence, appeal to conspiracy).
4. Veracity of central propositions.
Your output must be structured, factual, and unbiased. Do not hallucinate.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: [
            'label', 
            'confidence', 
            'credibilityScore', 
            'sensationalismScore', 
            'logicalFallacies', 
            'sourcesCitedStatus', 
            'analysisExplanation', 
            'factualChecks'
          ],
          properties: {
            label: {
              type: Type.STRING,
              description: 'MUST be either "real" or "fake" based on truthfulness and intent.',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'The probability score of classification correctness, from 0.0 to 1.0.',
            },
            credibilityScore: {
              type: Type.NUMBER,
              description: 'Score out of 100 assessing the factual reliability and journalistic standards.',
            },
            sensationalismScore: {
              type: Type.NUMBER,
              description: 'Score out of 100 assessing exaggerated, emotional, or fear-inducing rhetoric.',
            },
            logicalFallacies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List any logical fallacies detected, e.g. straw man, conspiracy appeals, gaslighting.',
            },
            sourcesCitedStatus: {
              type: Type.STRING,
              description: 'Analysis of sources mentioned (e.g., primary, anonymous blogs, none).',
            },
            analysisExplanation: {
              type: Type.STRING,
              description: 'Thorough, objective summary of why this article was classified as real or fake.',
            },
            factualChecks: {
              type: Type.ARRAY,
              description: 'List of specific claims extracted from the article and an objective verification of each.',
              items: {
                type: Type.OBJECT,
                required: ['claim', 'verdict', 'explanation'],
                properties: {
                  claim: { type: Type.STRING, description: 'The specific assertion made.' },
                  verdict: { type: Type.STRING, description: 'Must be: "verified", "refuted", or "unverified".' },
                  explanation: { type: Type.STRING, description: 'An objective explanation for our verdict.' }
                }
              }
            }
          }
        }
      }
    });

    const parsedText = response.text ? response.text.trim() : '{}';
    const parsedData = JSON.parse(parsedText);
    res.json(parsedData);

  } catch (error: any) {
    console.error('Transformer evaluation error:', error);
    res.status(500).json({ error: `Transformer analysis failed: ${error.message || error}` });
  }
});

// ----------------------------------------------------
// VITE AND STATIC ASSETS HANDLING
// ----------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in Development mode. Integrating Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in Production mode. Serving pre-compiled static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fake News Detector backend listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Error launching server:', err);
});
