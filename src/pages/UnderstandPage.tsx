import React, { useState } from 'react';
import { documentService } from '../services/document/documentService';
import { DocumentAnalysisResult } from '../types';
import { ttsService } from '../services/speech/ttsService';
import { 
  FileText, 
  Upload, 
  Camera, 
  Sparkles, 
  Volume2, 
  Calendar, 
  CheckCircle, 
  ListChecks, 
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react';

export const UnderstandPage: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);

  const samples = documentService.getSampleDocuments();

  const handleSampleSelect = async (sampleId: string) => {
    setIsProcessing(true);
    try {
      const result = await documentService.analyzeDocument(sampleId);
      setSelectedDoc(result);
      setActiveFileName(result.title);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setActiveFileName(file.name);
    try {
      const result = await documentService.analyzeDocument(file);
      setSelectedDoc(result);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReadAloud = () => {
    if (!selectedDoc) return;
    const summaryText = `Document: ${selectedDoc.title}. What is this: ${selectedDoc.whatIsThis}. Deadline: ${selectedDoc.deadline}. What should you do: ${selectedDoc.whatShouldIDo}.`;
    ttsService.speak(summaryText);
  };

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Document Simplifier</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Understand Documents
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Upload or photograph complex official documents, medical notices, and forms. SAMNYA turns them into simple, accessible action points.
        </p>
      </div>

      {/* Honesty / AI Prototype Notice */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Multimodal AI Service Abstraction:</p>
          <p className="mt-0.5 text-blue-800 dark:text-blue-300 leading-relaxed">
            The MVP connects to an extensible document extraction pipeline. You can upload any PDF or image, or select one of the realistic hospital/prescription/government samples to test the breakdown flow.
          </p>
        </div>
      </div>

      {/* Upload Dropzone & Camera Action */}
      <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-3xl p-6 sm:p-8 text-center transition-colors relative">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload document"
          />

          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Upload Document or Take Photo
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Drag and drop your appointment slip, prescription, or notice here, or tap to browse.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Camera className="w-4 h-4 text-teal-500" />
            <span>Supports Camera Snapshots & PDFs</span>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Or test with sample documents:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSampleSelect(s.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedDoc?.id === s.id
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50 dark:bg-slate-900/50'
                }`}
              >
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide block">
                  {s.documentType}
                </span>
                <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                  {s.title}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Loading Spinner */}
      {isProcessing && (
        <div className="bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Analyzing document with AI simplification...
          </p>
          <p className="text-xs text-slate-400">
            Extracting requirements, dates, and actionable instructions
          </p>
        </div>
      )}

      {/* RESULT CARD (The exact format requested in prompt) */}
      {selectedDoc && !isProcessing && (
        <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border-2 border-teal-500/40 shadow-md space-y-6 animate-fadeIn">
          
          {/* Header & Speak */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  {selectedDoc.documentType}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  AI Confidence {selectedDoc.confidenceScore}%
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {selectedDoc.title}
              </h2>
            </div>

            <button
              onClick={handleReadAloud}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all active:scale-95 flex-shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </button>
          </div>

          {/* 4 Essential Simplification Questions */}
          <div className="space-y-4">
            
            {/* 1. What is this? */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                What is this?
              </span>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {selectedDoc.whatIsThis}
              </p>
            </div>

            {/* 2. What do I need? */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-teal-500" />
                What do I need?
              </span>
              <ul className="space-y-1.5">
                {selectedDoc.whatDoINeed.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Deadline */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Deadline
              </span>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                {selectedDoc.deadline}
              </p>
            </div>

            {/* 4. What should I do? */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                What should I do?
              </span>
              <p className="text-base font-bold text-teal-950 dark:text-teal-100">
                {selectedDoc.whatShouldIDo}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
