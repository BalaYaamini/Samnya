import React, { useState, useRef, useCallback } from 'react';
import { documentService } from '../services/document/documentService';
import { DocumentAnalysisResult, DocumentQAEntry } from '../types';
import { ttsService } from '../services/speech/ttsService';
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  Info,
  Calendar,
  ListTodo,
  Volume2,
  Sparkles,
  AlertTriangle,
  FileCheck,
  X,
  Send,
  MessageCircle,
  RotateCcw,
  Shield,
  MapPin,
  DollarSign,
  Phone,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png';
const ALLOWED_LABEL = 'PDF, JPG, JPEG, PNG';
const MAX_FILE_SIZE_MB = 10;

const LOADING_STAGES = [
  'Reading document...',
  'Finding important information...',
  'Creating simple explanation...',
];

const EXAMPLE_QUESTIONS = [
  'Where should I submit this?',
  'How much is the fee?',
  'What documents do I need?',
  'When is the deadline?',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string): string {
  if (type === 'application/pdf') return '📄';
  if (type.startsWith('image/')) return '🖼️';
  return '📎';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const UnderstandPage: React.FC = () => {
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);

  // Checklist state
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set());

  // Q&A state
  const [qaHistory, setQaHistory] = useState<DocumentQAEntry[]>([]);
  const [qaInput, setQaInput] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qaInputRef = useRef<HTMLInputElement>(null);

  // ─── File selection ───────────────────────────────────────────────────

  const handleFileSelect = useCallback((file: File) => {
    setFileError(null);
    setAnalysisError(null);

    const validationError = documentService.validateFile(file);
    if (validationError) {
      setFileError(validationError.message);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setCheckedActions(new Set());
    setQaHistory([]);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input value so the same file can be re-selected
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setAnalysisError(null);
  };

  // ─── Analysis ─────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setResult(null);
    setCheckedActions(new Set());
    setQaHistory([]);
    setLoadingStage(0);

    // Animate loading stages
    const stageTimer1 = setTimeout(() => setLoadingStage(1), 2000);
    const stageTimer2 = setTimeout(() => setLoadingStage(2), 5000);

    try {
      const analysisResult = await documentService.analyzeDocument(selectedFile);
      setResult(analysisResult);
    } catch (err: unknown) {
      const error = err as Error;
      setAnalysisError(error.message || "We couldn't analyze the document right now. Please try again.");
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsAnalyzing(false);
      setLoadingStage(0);
    }
  };

  // ─── Q&A ──────────────────────────────────────────────────────────────

  const handleAskQuestion = async (question?: string) => {
    const q = (question || qaInput).trim();
    if (!q || isAskingQuestion) return;

    setIsAskingQuestion(true);
    setQaError(null);
    setQaInput('');

    try {
      const answer = await documentService.askQuestion(q);
      setQaHistory(prev => [...prev, { question: q, answer, timestamp: Date.now() }]);
    } catch (err: unknown) {
      const error = err as Error;
      setQaError(error.message || "We couldn't answer your question right now.");
    } finally {
      setIsAskingQuestion(false);
      // Focus back on input
      setTimeout(() => qaInputRef.current?.focus(), 100);
    }
  };

  const handleQaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  // ─── Checklist ────────────────────────────────────────────────────────

  const toggleAction = (idx: number) => {
    setCheckedActions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // ─── Reset ────────────────────────────────────────────────────────────

  const handleReset = () => {
    documentService.reset();
    setSelectedFile(null);
    setFileError(null);
    setAnalysisError(null);
    setResult(null);
    setCheckedActions(new Set());
    setQaHistory([]);
    setQaInput('');
    setQaError(null);
  };

  // ─── TTS ──────────────────────────────────────────────────────────────

  const handleSpeak = (text: string) => {
    if (text) ttsService.speak(text);
  };

  // ─── Render helpers ───────────────────────────────────────────────────

  const hasDetails = result && (
    result.importantDetails.location ||
    result.importantDetails.fees ||
    result.importantDetails.contact ||
    result.importantDetails.eligibility
  );

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">

      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Document Helper</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Understand a Document
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Upload a document and SAMNYA will explain it in simple words.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
        <span>Only upload documents you're comfortable processing with the AI service.</span>
      </div>

      {/* ═══════════════════════ UPLOAD SECTION ═══════════════════════ */}
      {!result && !isAnalyzing && (
        <div className="space-y-4">

          {/* Drop Zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a document. Click or drag and drop a PDF, JPG, JPEG, or PNG file."
            className={`bg-white dark:bg-[#0F172A] p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4 ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                : fileError
                  ? 'border-red-300 dark:border-red-800'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports {ALLOWED_LABEL} — Max {MAX_FILE_SIZE_MB}MB
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={ALLOWED_EXTENSIONS}
              onChange={handleFileInputChange}
              aria-hidden="true"
            />
          </div>

          {/* File Error */}
          {fileError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{getFileIcon(selectedFile.type)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedFile.type.split('/')[1]?.toUpperCase() || 'File'} · {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                className="w-full mt-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                aria-label="Understand this document"
              >
                <Sparkles className="w-4 h-4" />
                <span>Understand Document</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════ LOADING STATE ═══════════════════════ */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-[#0F172A] p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-6">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <div className="text-center space-y-2">
            <p className="font-bold text-lg text-slate-900 dark:text-white">
              Understanding your document...
            </p>
            <div className="space-y-1.5 mt-3">
              {LOADING_STAGES.map((stage, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                    idx <= loadingStage
                      ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                >
                  {idx < loadingStage ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : idx === loadingStage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                  )}
                  <span>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ ERROR STATE ══════════════════════════ */}
      {analysisError && !isAnalyzing && (
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-red-200 dark:border-red-900 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Could not analyze document</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{analysisError}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* ═══════════════════════ RESULTS ══════════════════════════════ */}
      {result && !isAnalyzing && (
        <div className="space-y-4 animate-fadeIn">

          {/* Result Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0F172A] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {result.documentType || 'Document'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                {result.title}
              </h2>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Analyze Another Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* ── Simple Explanation ── */}
            {result.simpleExplanation && (
              <div className="bg-indigo-50 dark:bg-indigo-950/20 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 md:col-span-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                      <Info className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Simple Explanation</h3>
                  </div>
                  <button
                    onClick={() => handleSpeak(result.simpleExplanation)}
                    className="p-1.5 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg"
                    aria-label="Speak simple explanation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {result.simpleExplanation}
                </p>
              </div>
            )}

            {/* ── Key Points ── */}
            {result.keyPoints.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/40 md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Key Points</h3>
                </div>
                <ul className="space-y-2">
                  {result.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Deadlines ── */}
            <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-3xl border border-red-100 dark:border-red-900/40">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Important Deadlines</h3>
                </div>
                {result.deadlines.length > 0 && (
                  <button
                    onClick={() => handleSpeak(result.deadlines.map(d => `${d.date}: ${d.description}`).join('. '))}
                    className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                    aria-label="Speak deadlines"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {result.deadlines.length > 0 ? (
                <div className="space-y-2">
                  {result.deadlines.map((dl, idx) => (
                    <div key={idx}>
                      <p className="text-slate-900 dark:text-white font-bold text-lg">{dl.date}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{dl.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                  No deadline mentioned in this document.
                </p>
              )}
            </div>

            {/* ── Required Documents ── */}
            <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-3xl border border-amber-100 dark:border-amber-900/40">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Documents Required</h3>
                </div>
                {result.requiredDocuments.length > 0 && (
                  <button
                    onClick={() => handleSpeak(result.requiredDocuments.join('. '))}
                    className="p-1.5 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg"
                    aria-label="Speak required documents"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {result.requiredDocuments.length > 0 ? (
                <ul className="space-y-1.5">
                  {result.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                  No required documents mentioned.
                </p>
              )}
            </div>

            {/* ── What You Need To Do (Action Checklist) ── */}
            {result.requiredActions.length > 0 && (
              <div className="bg-teal-50 dark:bg-teal-950/20 p-5 rounded-3xl border border-teal-100 dark:border-teal-900/40 md:col-span-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400">
                      <ListTodo className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">What You Need To Do</h3>
                  </div>
                  <button
                    onClick={() => handleSpeak(result.requiredActions.join('. '))}
                    className="p-1.5 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900 rounded-lg"
                    aria-label="Speak required actions"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {result.requiredActions.map((action, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checkedActions.has(idx)
                          ? 'bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700'
                          : 'bg-white/60 dark:bg-slate-900/60 border-teal-200/50 dark:border-teal-800/50 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedActions.has(idx)}
                        onChange={() => toggleAction(idx)}
                        className="w-5 h-5 mt-0.5 rounded border-teal-300 text-teal-600 focus:ring-teal-500 flex-shrink-0"
                      />
                      <span className={`font-medium text-base ${
                        checkedActions.has(idx)
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {idx + 1}. {action}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── Important Details ── */}
            {hasDetails && (
              <div className="bg-purple-50 dark:bg-purple-950/20 p-5 rounded-3xl border border-purple-100 dark:border-purple-900/40 md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                    <Info className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Important Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.importantDetails.location && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.importantDetails.location}</p>
                      </div>
                    </div>
                  )}
                  {result.importantDetails.fees && (
                    <div className="flex items-start gap-2.5">
                      <DollarSign className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fees</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.importantDetails.fees}</p>
                      </div>
                    </div>
                  )}
                  {result.importantDetails.contact && (
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.importantDetails.contact}</p>
                      </div>
                    </div>
                  )}
                  {result.importantDetails.eligibility && (
                    <div className="flex items-start gap-2.5">
                      <UserCheck className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Eligibility</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.importantDetails.eligibility}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Warnings ── */}
            {result.warnings.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-3xl border border-orange-200 dark:border-orange-900/40 md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Warnings</h3>
                </div>
                <ul className="space-y-1.5">
                  {result.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-orange-800 dark:text-orange-300 font-medium text-sm">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ═══════════════════ ASK ABOUT DOCUMENT Q&A ═══════════════════ */}
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Ask About This Document</h3>
            </div>

            {/* Example Questions */}
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskQuestion(q)}
                  disabled={isAskingQuestion}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/40 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Q&A History */}
            {qaHistory.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {qaHistory.map((entry, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Q</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{entry.question}</p>
                    </div>
                    <div className="flex items-start gap-2 ml-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">A</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{entry.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Q&A Error */}
            {qaError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{qaError}</span>
              </div>
            )}

            {/* Q&A Input */}
            <div className="flex items-center gap-2">
              <input
                ref={qaInputRef}
                type="text"
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                onKeyDown={handleQaKeyDown}
                placeholder="Ask a question about this document..."
                disabled={isAskingQuestion}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                aria-label="Ask a question about this document"
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={isAskingQuestion || !qaInput.trim()}
                className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send question"
              >
                {isAskingQuestion ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
