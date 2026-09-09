// Document Understanding Service
// Clean abstraction for multimodal AI vision analysis

import { DocumentAnalysisResult } from '../../types';
import { SAMPLE_DOCUMENTS } from '../../data/mockData';

export class DocumentService {
  private isProcessing: boolean = false;

  public getSampleDocuments(): DocumentAnalysisResult[] {
    return SAMPLE_DOCUMENTS;
  }

  /**
   * Analyzes an uploaded file or camera snapshot.
   * Prototype implementation simulating multimodal OCR + LLM simplification.
   * Clearly marked as AI service abstraction.
   */
  public async analyzeDocument(fileOrSampleId: File | string): Promise<DocumentAnalysisResult> {
    this.isProcessing = true;

    // Simulate realistic AI model processing time
    await new Promise(resolve => setTimeout(resolve, 950));

    let result: DocumentAnalysisResult;

    if (typeof fileOrSampleId === 'string') {
      result = SAMPLE_DOCUMENTS.find(d => d.id === fileOrSampleId) || SAMPLE_DOCUMENTS[0];
    } else {
      // Analyze uploaded custom file: detect document type by name or default to structured appointment breakdown
      const fileName = fileOrSampleId.name.toLowerCase();
      if (fileName.includes('rx') || fileName.includes('med') || fileName.includes('pill')) {
        result = SAMPLE_DOCUMENTS[1];
      } else if (fileName.includes('govt') || fileName.includes('cert') || fileName.includes('form') || fileName.includes('card')) {
        result = SAMPLE_DOCUMENTS[2];
      } else {
        result = {
          ...SAMPLE_DOCUMENTS[0],
          title: fileOrSampleId.name.replace(/\.[^/.]+$/, "") || 'Scanned Document'
        };
      }
    }

    this.isProcessing = false;
    return result;
  }

  public getIsProcessing(): boolean {
    return this.isProcessing;
  }
}

export const documentService = new DocumentService();
