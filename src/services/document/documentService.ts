/**
 * Document Understanding Service — Real Gemini Integration
 *
 * Converts uploaded documents (PDF / JPG / JPEG / PNG) to base64,
 * sends them to Google Gemini's multimodal API, and parses
 * the structured JSON response into a DocumentAnalysisResult.
 *
 * All AI logic is contained in this service layer — no API calls in UI components.
 */

import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { DocumentAnalysisResult, DocumentQAEntry } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MODEL_NAME = 'gemini-3.6-flash';

// ─── System prompt for document analysis ──────────────────────────────────────

const ANALYSIS_SYSTEM_INSTRUCTION = `You are an accessibility assistant helping Deaf users understand documents and notices.

Explain the uploaded document using simple, clear English.

RULES:
- Only use information explicitly available in the uploaded document.
- Never invent deadlines, fees, required documents, locations, contact details, eligibility requirements, or instructions.
- If information is not available in the document, use an empty string "" for string fields or an empty array [] for array fields.
- Preserve important dates, numbers, amounts, names, and requirements accurately.
- Separate facts from recommendations.
- Do not claim something is mandatory unless the source document indicates that it is.
- Use short, simple sentences. Avoid jargon.

Respond ONLY with valid JSON matching this exact schema:
{
  "title": "string - Short document title",
  "documentType": "string - Type of document (e.g. 'Government Notice', 'Medical Form', 'Letter', 'Bill')",
  "simpleExplanation": "string - 2-3 sentence plain-English explanation of what this document is about",
  "keyPoints": ["string - Important point 1", "string - Important point 2"],
  "deadlines": [{"date": "string", "description": "string"}],
  "requiredDocuments": ["string - Document or item needed"],
  "requiredActions": ["string - Step the reader should take"],
  "importantDetails": {
    "location": "string or empty",
    "fees": "string or empty",
    "contact": "string or empty",
    "eligibility": "string or empty"
  },
  "warnings": ["string - Any warnings or cautions mentioned"]
}

If the document is unreadable, blurry, or contains no useful text, respond with:
{
  "title": "Unreadable Document",
  "documentType": "Unknown",
  "simpleExplanation": "We could not read the content of this document. The image may be too blurry or the document may be empty.",
  "keyPoints": [],
  "deadlines": [],
  "requiredDocuments": [],
  "requiredActions": [],
  "importantDetails": {},
  "warnings": ["The document could not be read. Please try uploading a clearer image or PDF."]
}`;

const QA_SYSTEM_INSTRUCTION = `You are an accessibility assistant helping a Deaf user understand a document they uploaded.

You have already analyzed the document. The analysis result is provided below.

RULES:
- Answer ONLY using information from the document analysis provided.
- If the answer cannot be found in the analysis, respond: "I couldn't find that information in this document."
- Use short, simple sentences.
- Never guess or make up information.
- Never add information not present in the analysis.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key.trim() === '') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return key;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:image/png;base64,")
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to encode file to base64.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

function getMimeType(file: File): string {
  // Normalize "image/jpg" to "image/jpeg" for the Gemini API
  if (file.type === 'image/jpg') return 'image/jpeg';
  return file.type;
}

function parseAnalysisResult(raw: string): DocumentAnalysisResult {
  // Try to extract JSON from the response (handle markdown code fences)
  let jsonStr = raw.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr);

  // Validate and normalize the result with safe defaults
  return {
    title: typeof parsed.title === 'string' ? parsed.title : 'Document',
    documentType: typeof parsed.documentType === 'string' ? parsed.documentType : 'Unknown',
    simpleExplanation: typeof parsed.simpleExplanation === 'string' ? parsed.simpleExplanation : '',
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.filter((s: unknown) => typeof s === 'string') : [],
    deadlines: Array.isArray(parsed.deadlines)
      ? parsed.deadlines
          .filter((d: unknown) => d && typeof d === 'object')
          .map((d: Record<string, unknown>) => ({
            date: typeof d.date === 'string' ? d.date : '',
            description: typeof d.description === 'string' ? d.description : '',
          }))
      : [],
    requiredDocuments: Array.isArray(parsed.requiredDocuments) ? parsed.requiredDocuments.filter((s: unknown) => typeof s === 'string') : [],
    requiredActions: Array.isArray(parsed.requiredActions) ? parsed.requiredActions.filter((s: unknown) => typeof s === 'string') : [],
    importantDetails: {
      location: typeof parsed.importantDetails?.location === 'string' ? parsed.importantDetails.location : '',
      fees: typeof parsed.importantDetails?.fees === 'string' ? parsed.importantDetails.fees : '',
      contact: typeof parsed.importantDetails?.contact === 'string' ? parsed.importantDetails.contact : '',
      eligibility: typeof parsed.importantDetails?.eligibility === 'string' ? parsed.importantDetails.eligibility : '',
    },
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.filter((s: unknown) => typeof s === 'string') : [],
  };
}

// ─── Service Class ────────────────────────────────────────────────────────────

export interface FileValidationError {
  type: 'unsupported_type' | 'too_large' | 'empty';
  message: string;
}

export class DocumentService {
  private isProcessing = false;
  private lastAnalysis: DocumentAnalysisResult | null = null;
  private lastDocumentText: string = '';

  /**
   * Validate a file before processing.
   * Returns null if valid, or a FileValidationError if invalid.
   */
  public validateFile(file: File): FileValidationError | null {
    if (!file || file.size === 0) {
      return { type: 'empty', message: 'The selected file appears to be empty.' };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { type: 'too_large', message: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` };
    }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.jpg')) {
      return { type: 'unsupported_type', message: 'Unsupported file type. Please upload a PDF, JPG, JPEG, or PNG file.' };
    }
    return null;
  }

  /**
   * Analyze a document using Google Gemini multimodal API.
   * Sends the file as base64 inline data alongside the analysis system prompt.
   */
  public async analyzeDocument(file: File): Promise<DocumentAnalysisResult> {
    if (this.isProcessing) {
      throw new Error('Analysis already in progress. Please wait.');
    }

    const validationError = this.validateFile(file);
    if (validationError) {
      throw new Error(validationError.message);
    }

    this.isProcessing = true;

    try {
      const apiKey = getApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
      });

      const base64Data = await fileToBase64(file);
      const mimeType = getMimeType(file);

      const filePart: Part = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };

      const textPart: Part = {
        text: 'Analyze this document and provide the structured JSON response. Use simple, clear English suitable for a Deaf user.',
      };

      const result = await model.generateContent([filePart, textPart]);
      const response = result.response;
      const text = response.text();

      if (!text || text.trim() === '') {
        throw new Error('The AI returned an empty response. The document may be unreadable.');
      }

      const analysisResult = parseAnalysisResult(text);

      // Store for Q&A context
      this.lastAnalysis = analysisResult;
      this.lastDocumentText = text;

      return analysisResult;
    } catch (error: unknown) {
      const err = error as Error;

      if (err.message === 'GEMINI_API_KEY_MISSING') {
        throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.');
      }

      // Handle common Gemini API errors
      const msg = err.message || '';
      if (msg.includes('SAFETY')) {
        throw new Error('The document was blocked by content safety filters. Please try a different document.');
      }
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (msg.includes('401') || msg.includes('403') || msg.includes('API_KEY_INVALID')) {
        throw new Error('The Gemini API key is invalid or unauthorized. Please check your .env.local configuration.');
      }
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      if (msg.includes('JSON')) {
        throw new Error('We had trouble reading the AI response. Please try again.');
      }

      // Fallback
      console.error('Document analysis error:', err);
      throw new Error("We couldn't analyze the document right now. Please try again.");
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Ask a question about the last analyzed document.
   * Uses the stored analysis context to ground answers.
   */
  public async askQuestion(question: string): Promise<string> {
    if (!this.lastAnalysis) {
      throw new Error('No document has been analyzed yet. Please upload and analyze a document first.');
    }

    if (!question.trim()) {
      throw new Error('Please enter a question.');
    }

    try {
      const apiKey = getApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: QA_SYSTEM_INSTRUCTION,
      });

      const contextPrompt = `Document Analysis Context:
${JSON.stringify(this.lastAnalysis, null, 2)}

User Question: ${question}

Answer the question using ONLY the information from the document analysis above. Use simple, clear English. If the answer is not in the analysis, say "I couldn't find that information in this document."`;

      const result = await model.generateContent(contextPrompt);
      const response = result.response;
      const text = response.text();

      if (!text || text.trim() === '') {
        return "I couldn't find that information in this document.";
      }

      return text.trim();
    } catch (error: unknown) {
      const err = error as Error;

      if (err.message === 'GEMINI_API_KEY_MISSING') {
        throw new Error('Gemini API key is not configured.');
      }
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      console.error('Document Q&A error:', err);
      throw new Error("We couldn't answer your question right now. Please try again.");
    }
  }

  /**
   * Reset the service state for analyzing a new document.
   */
  public reset(): void {
    this.lastAnalysis = null;
    this.lastDocumentText = '';
    this.isProcessing = false;
  }

  public getIsProcessing(): boolean {
    return this.isProcessing;
  }

  public getLastAnalysis(): DocumentAnalysisResult | null {
    return this.lastAnalysis;
  }
}

export const documentService = new DocumentService();
