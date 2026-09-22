/**
 * MediaPipe Hands CDN Loader
 *
 * Dynamically injects MediaPipe Hands from jsDelivr CDN at runtime.
 * No npm install required; WASM and model files are served from CDN.
 *
 * Pinned version: @mediapipe/hands@0.4.1646424915 (stable, widely tested)
 */

const MP_VERSION = '0.4.1646424915';
export const CDN_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MP_VERSION}`;

// ─── Type definitions ─────────────────────────────────────────────────────────

/** A single hand landmark in normalized [0,1] image coordinates. */
export interface MPLandmark {
  x: number; // 0 = left edge, 1 = right edge
  y: number; // 0 = top edge,  1 = bottom edge
  z: number; // depth estimate (relative to wrist; less reliable on webcams)
}

/** Results object passed to the onResults callback. */
export interface MPHandsResults {
  /** One array of 21 landmarks per detected hand. null / undefined if no hand. */
  multiHandLandmarks?: MPLandmark[][];
  /** Handedness (Left / Right) per detected hand. */
  multiHandedness?: Array<{ label: 'Left' | 'Right'; score: number }>;
}

interface MPHandsOptions {
  maxNumHands?: number;
  /** 0 = lite (faster), 1 = full (more accurate). We use 0 for performance. */
  modelComplexity?: 0 | 1;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

/** Subset of the MediaPipe Hands API surface we actually use. */
export interface MPHandsInstance {
  setOptions(options: MPHandsOptions): void;
  onResults(callback: (results: MPHandsResults) => void): void;
  /** Send one frame for inference. Resolves after onResults has been called. */
  send(input: {
    image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;
  }): Promise<void>;
  close(): void;
}

// Augment the global Window so TypeScript knows about window.Hands
declare global {
  interface Window {
    Hands: new (config: { locateFile: (file: string) => string }) => MPHandsInstance;
  }
}

// ─── Loader ───────────────────────────────────────────────────────────────────

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Idempotent — skip if already injected
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`CDN load failed: ${src}`));
    document.head.appendChild(el);
  });
}

/** Cached load promise — ensures the CDN script is only injected once. */
let _loadPromise: Promise<void> | null = null;

/**
 * Load the MediaPipe Hands JS bundle from CDN.
 * Safe to call multiple times — returns the same Promise on subsequent calls.
 */
export function ensureMediaPipeLoaded(): Promise<void> {
  if (!_loadPromise) {
    _loadPromise = injectScript(`${CDN_BASE}/hands.js`);
  }
  return _loadPromise;
}

/**
 * Construct a new MediaPipe Hands instance configured to load WASM and model
 * files from the pinned CDN version (avoids version drift on unpkg).
 *
 * Must only be called AFTER ensureMediaPipeLoaded() has resolved.
 */
export function createHandsInstance(): MPHandsInstance {
  if (typeof window.Hands !== 'function') {
    throw new Error(
      'MediaPipe Hands is not loaded. Call ensureMediaPipeLoaded() first.',
    );
  }
  return new window.Hands({
    locateFile: (file: string) => `${CDN_BASE}/${file}`,
  });
}
