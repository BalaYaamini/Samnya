/**
 * Hand Landmark Geometric Classifier
 *
 * Classifies ASL-inspired hand signs using only the 21 normalized landmark
 * positions returned by MediaPipe Hands. No ML model required beyond MediaPipe.
 *
 * ─── Coordinate system ────────────────────────────────────────────────────
 * MediaPipe Hands returns landmarks in normalized [0,1] image coordinates:
 *   x: 0 = left edge of frame,  1 = right edge
 *   y: 0 = top  edge of frame,  1 = bottom edge
 *   z: approximate depth (wrist-relative; less reliable, used sparingly)
 *
 * NOTE: Assumes hand is roughly upright with fingers pointing upward.
 * This is the natural pose for ASL sign demonstration in front of a webcam.
 *
 * ─── Supported sign vocabulary ────────────────────────────────────────────
 * Tier 1 (supported): STOP, HELP, WATER, NO, FOOD
 * Tier 2 (experimental): YES, HELLO
 *
 * ─── Disambiguation summary ───────────────────────────────────────────────
 * STOP   : 4 fingers extended, fingers TOGETHER   (spread < 0.10)
 * HELLO  : 5 fingers extended, fingers SPREAD WIDE (spread > 0.07)
 * HELP   : thumb pointing UP, all 4 fingers CURLED  (thumbs-up)
 * YES    : all 4 fingers CURLED, thumb NOT up        (closed fist)
 * NO     : index + middle EXTENDED, ring + pinky CURLED  (2-finger V)
 * WATER  : index + middle + ring EXTENDED, pinky CURLED  (3-finger W)
 * FOOD   : all 5 FINGERTIPS CLUSTERED together      (pinch/bunch)
 *
 * Key pairs:
 *   STOP vs HELLO  → spread score threshold
 *   HELP vs YES    → isThumbUp()
 *   NO   vs WATER  → ring finger extended?
 *   FOOD vs all    → tipBunchedness()
 */

// ─── Landmark index constants (per MediaPipe Hands spec) ──────────────────────
//
//      TH_TIP(4)─TH_IP(3)─TH_MCP(2)─TH_CMC(1)
//                                             \
//  IX_TIP(8)─IX_PIP(6)─IX_MCP(5)              WRIST(0)─PK_MCP(17)─PK_TIP(20)
//  MD_TIP(12)─MD_PIP(10)─MD_MCP(9)─────────── |
//  RG_TIP(16)─RG_PIP(14)─RG_MCP(13)──────────/

const W = 0; // WRIST
const TH_CMC = 1, TH_MCP = 2, TH_IP = 3, TH_TIP = 4;
const IX_MCP = 5, IX_PIP = 6, IX_TIP = 8;
const MD_MCP = 9, MD_PIP = 10, MD_TIP = 12;
const RG_MCP = 13, RG_PIP = 14, RG_TIP = 16;
const PK_MCP = 17, PK_PIP = 18, PK_TIP = 20;

/** Hand skeleton connection pairs for debug overlay drawing. */
export const HAND_CONNECTIONS: readonly [number, number][] = [
  // Palm
  [W, TH_CMC], [W, IX_MCP], [W, MD_MCP], [W, RG_MCP], [W, PK_MCP],
  [IX_MCP, MD_MCP], [MD_MCP, RG_MCP], [RG_MCP, PK_MCP],
  // Thumb
  [TH_CMC, TH_MCP], [TH_MCP, TH_IP], [TH_IP, TH_TIP],
  // Index
  [IX_MCP, IX_PIP], [IX_PIP, 7], [7, IX_TIP],
  // Middle
  [MD_MCP, MD_PIP], [MD_PIP, 11], [11, MD_TIP],
  // Ring
  [RG_MCP, RG_PIP], [RG_PIP, 15], [15, RG_TIP],
  // Pinky
  [PK_MCP, PK_PIP], [PK_PIP, 19], [19, PK_TIP],
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface ClassificationResult {
  /** ID matching SUPPORTED_SIGNS, or null if no confident match. */
  signId: string | null;
  /** Raw [0–1] score of the best candidate (shown as confidence%). */
  confidence: number;
  /** All candidate scores, sorted descending (useful for debug). */
  allScores: { id: string; score: number }[];
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function dist2d(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Returns true if a non-thumb finger is in the extended (straight) position.
 *
 * Two conditions must both hold:
 *  1. Distance ratio: tip is meaningfully farther from the wrist than the MCP.
 *     (ratio ≥ 1.6 empirically distinguishes extended from curled fingers.)
 *  2. Y-axis check: tip is above (smaller y) the PIP joint.
 *     A 2-pixel tolerance handles slight hand tilt without false negatives.
 *
 * Assumes a roughly upright hand pose. Fails gracefully for strongly tilted
 * hands (returns false → treated as curled → UNKNOWN or lower score).
 */
function isFingerExtended(
  lm: NormalizedLandmark[],
  tip: number,
  pip: number,
  mcp: number,
): boolean {
  const tipWrist = dist2d(lm[tip], lm[W]);
  const mcpWrist = dist2d(lm[mcp], lm[W]);
  const distanceOk = tipWrist > mcpWrist * 1.6;
  const yOk = lm[tip].y < lm[pip].y + 0.02; // 2% tolerance for slight tilt
  return distanceOk && yOk;
}

/**
 * Returns true when the thumb is pointing upward (thumbs-up / HELP gesture).
 *
 * Checks:
 *  - Thumb tip is clearly above (smaller y) than the thumb MCP (≥ 4% gap).
 *  - Thumb tip is above the index MCP (knuckle line of the fist).
 */
function isThumbUp(lm: NormalizedLandmark[]): boolean {
  return (
    lm[TH_TIP].y < lm[TH_MCP].y - 0.04 &&
    lm[TH_TIP].y < lm[IX_MCP].y
  );
}

/**
 * Returns true when the thumb is extended outward from the palm (not tucked).
 * Used to help detect HELLO (open hand with all 5 fingers spread).
 */
function isThumbAbducted(lm: NormalizedLandmark[]): boolean {
  return dist2d(lm[TH_TIP], lm[W]) > dist2d(lm[TH_IP], lm[W]) * 1.2;
}

/**
 * Average gap between adjacent non-thumb fingertips:
 *   index–middle, middle–ring, ring–pinky.
 * Small value (< 0.07) → fingers together (STOP, flat hand).
 * Large value (> 0.09) → fingers spread (HELLO, open wave).
 */
function fingerSpread(lm: NormalizedLandmark[]): number {
  return (
    dist2d(lm[IX_TIP], lm[MD_TIP]) +
    dist2d(lm[MD_TIP], lm[RG_TIP]) +
    dist2d(lm[RG_TIP], lm[PK_TIP])
  ) / 3;
}

/**
 * Average distance of each of the 5 fingertips from their shared centroid.
 * Small value → all tips clustered (FOOD/EAT pinch gesture).
 * Large value → tips spread (any extended-finger sign).
 */
function tipBunchedness(lm: NormalizedLandmark[]): number {
  const tips = [TH_TIP, IX_TIP, MD_TIP, RG_TIP, PK_TIP];
  const cx = tips.reduce((s, i) => s + lm[i].x, 0) / tips.length;
  const cy = tips.reduce((s, i) => s + lm[i].y, 0) / tips.length;
  const center: NormalizedLandmark = { x: cx, y: cy, z: 0 };
  return tips.reduce((s, i) => s + dist2d(lm[i], center), 0) / tips.length;
}

// ─── Weighted rule scoring ────────────────────────────────────────────────────

interface Rule { cond: boolean; weight: number; }

function weightedScore(rules: Rule[]): number {
  const totalW = rules.reduce((s, r) => s + r.weight, 0);
  const metW = rules.reduce((s, r) => s + (r.cond ? r.weight : 0), 0);
  return totalW > 0 ? metW / totalW : 0;
}

// ─── Per-sign scorers ─────────────────────────────────────────────────────────

/**
 * STOP — Flat open hand, all 4 fingers extended and held TOGETHER.
 * Distinction from HELLO: spread < 0.10 (fingers not spread wide).
 */
function scoreStop(lm: NormalizedLandmark[]): number {
  const ix = isFingerExtended(lm, IX_TIP, IX_PIP, IX_MCP);
  const md = isFingerExtended(lm, MD_TIP, MD_PIP, MD_MCP);
  const rg = isFingerExtended(lm, RG_TIP, RG_PIP, RG_MCP);
  const pk = isFingerExtended(lm, PK_TIP, PK_PIP, PK_MCP);
  const spread = fingerSpread(lm);
  return weightedScore([
    { cond: ix,           weight: 2.5 },
    { cond: md,           weight: 2.5 },
    { cond: rg,           weight: 2.5 },
    { cond: pk,           weight: 2.5 },
    { cond: spread < 0.10, weight: 2.0 }, // key: fingers together, not spread
  ]);
}

/**
 * HELLO — Open hand wave, all 5 fingers extended AND fingers SPREAD WIDE.
 * Distinction from STOP: spread > 0.07 AND thumb abducted.
 */
function scoreHello(lm: NormalizedLandmark[]): number {
  const ix = isFingerExtended(lm, IX_TIP, IX_PIP, IX_MCP);
  const md = isFingerExtended(lm, MD_TIP, MD_PIP, MD_MCP);
  const rg = isFingerExtended(lm, RG_TIP, RG_PIP, RG_MCP);
  const pk = isFingerExtended(lm, PK_TIP, PK_PIP, PK_MCP);
  const th = isThumbAbducted(lm);
  const spread = fingerSpread(lm);
  return weightedScore([
    { cond: ix,            weight: 2.0 },
    { cond: md,            weight: 2.0 },
    { cond: rg,            weight: 2.0 },
    { cond: pk,            weight: 2.0 },
    { cond: th,            weight: 1.5 },
    { cond: spread > 0.07, weight: 2.5 }, // key: fingers spread (vs STOP together)
  ]);
}

/**
 * HELP — Classic thumbs-up: thumb pointing UPWARD, all 4 fingers CURLED.
 * Thumb-up condition is heavily weighted as the primary distinguishing feature.
 * Strict checks added to prevent scratching head false positives.
 */
function scoreHelp(lm: NormalizedLandmark[]): number {
  const thUp = isThumbUp(lm);
  const ixC  = !isFingerExtended(lm, IX_TIP, IX_PIP, IX_MCP);
  const mdC  = !isFingerExtended(lm, MD_TIP, MD_PIP, MD_MCP);
  const rgC  = !isFingerExtended(lm, RG_TIP, RG_PIP, RG_MCP);
  const pkC  = !isFingerExtended(lm, PK_TIP, PK_PIP, PK_MCP);
  const thAbd = isThumbAbducted(lm); // thumb clearly separated from palm

  // Hand orientation: palm upright. Wrist (W) to Middle Knuckle (MD_MCP) should be mostly vertical.
  // dy should be negative (MD_MCP is above W), and absolute dy should be larger than dx.
  const dy = lm[MD_MCP].y - lm[W].y;
  const dx = lm[MD_MCP].x - lm[W].x;
  const isUpright = dy < -0.05 && Math.abs(dy) > Math.abs(dx);

  // If the strict conditions are not met, penalize heavily.
  if (!thUp || !isUpright || !thAbd) {
    return 0; // Immediate rejection for casual poses like scratching head
  }

  return weightedScore([
    { cond: thUp, weight: 3.0 },
    { cond: isUpright, weight: 2.0 },
    { cond: thAbd, weight: 2.0 },
    { cond: ixC,  weight: 2.0 },
    { cond: mdC,  weight: 2.0 },
    { cond: rgC,  weight: 1.5 },
    { cond: pkC,  weight: 1.5 },
  ]);
}

/**
 * YES — Closed fist (A-handshape): all 4 fingers CURLED, thumb NOT pointing up.
 * Distinction from HELP: thumb is alongside the fist, not raised.
 */
function scoreYes(lm: NormalizedLandmark[]): number {
  const thNotUp = !isThumbUp(lm);
  const ixC     = !isFingerExtended(lm, IX_TIP, IX_PIP, IX_MCP);
  const mdC     = !isFingerExtended(lm, MD_TIP, MD_PIP, MD_MCP);
  const rgC     = !isFingerExtended(lm, RG_TIP, RG_PIP, RG_MCP);
  const pkC     = !isFingerExtended(lm, PK_TIP, PK_PIP, PK_MCP);
  return weightedScore([
    { cond: thNotUp, weight: 3.0 }, // key: thumb NOT up (distinguishes from HELP)
    { cond: ixC,     weight: 2.5 },
    { cond: mdC,     weight: 2.5 },
    { cond: rgC,     weight: 2.0 },
    { cond: pkC,     weight: 2.0 },
  ]);
}

/**
 * NO — Two-finger V/scissors: index + middle EXTENDED, ring + pinky CURLED.
 * Distinction from WATER: ring finger is NOT extended.
 */
function scoreNo(lm: NormalizedLandmark[]): number {
  const ix  = isFingerExtended(lm, IX_TIP, IX_PIP, IX_MCP);
  const md  = isFingerExtended(lm, MD_TIP, MD_PIP, MD_MCP);
  const rgC = !isFingerExtended(lm, RG_TIP, RG_PIP, RG_MCP);
  const pkC = !isFingerExtended(lm, PK_TIP, PK_PIP, PK_MCP);
  return weightedScore([
    { cond: ix,  weight: 3.0 },
    { cond: md,  weight: 3.0 },
    { cond: rgC, weight: 2.5 }, // key: ring CURLED (vs WATER where ring is extended)
    { cond: pkC, weight: 1.5 },
  ]);
}

/**
 * WATER — W-handshape: index + middle + ring EXTENDED, pinky CURLED.
 * Distinction from NO: ring finger IS extended (3rd finger out).
 */
function scoreWater(lm: NormalizedLandmark[]): number {
  const ix  = isFingerExtended(lm, IX_TIP, IX_PIP, IX_MCP);
  const md  = isFingerExtended(lm, MD_TIP, MD_PIP, MD_MCP);
  const rg  = isFingerExtended(lm, RG_TIP, RG_PIP, RG_MCP);
  const pkC = !isFingerExtended(lm, PK_TIP, PK_PIP, PK_MCP);
  return weightedScore([
    { cond: ix,  weight: 2.0 },
    { cond: md,  weight: 2.0 },
    { cond: rg,  weight: 3.0 }, // key: ring IS extended (vs NO where ring is curled)
    { cond: pkC, weight: 2.0 },
  ]);
}

/**
 * FOOD/EAT — Pinch/bunch gesture: all 5 fingertips clustered closely together.
 * Measured by tipBunchedness() — average distance of each tip from their centroid.
 * Very distinctive: no other supported sign has all tips this close.
 */
function scoreFood(lm: NormalizedLandmark[]): number {
  const bunch = tipBunchedness(lm);
  const thIx  = dist2d(lm[TH_TIP], lm[IX_TIP]);
  const thMd  = dist2d(lm[TH_TIP], lm[MD_TIP]);
  return weightedScore([
    { cond: bunch < 0.08, weight: 3.0 }, // all tips within 8% of their centroid
    { cond: bunch < 0.06, weight: 2.0 }, // bonus: even tighter
    { cond: thIx  < 0.08, weight: 2.0 }, // thumb-to-index close
    { cond: thMd  < 0.10, weight: 1.0 }, // thumb-to-middle close
  ]);
}

// ─── Classifier registry ──────────────────────────────────────────────────────

/** Minimum score for a result to be considered recognized (not UNKNOWN). */
export const CONFIDENCE_THRESHOLD = 0.85;

/**
 * Required margin between the top-1 and top-2 candidates.
 * Prevents ambiguous signs from being forcibly assigned to the closest match.
 */
const MARGIN = 0.15;

const CLASSIFIERS = [
  { id: 'help',  fn: scoreHelp  },
  { id: 'stop',  fn: scoreStop  },
  { id: 'water', fn: scoreWater },
  { id: 'no',    fn: scoreNo    },
  { id: 'food',  fn: scoreFood  },
  { id: 'yes',   fn: scoreYes   },
  { id: 'hello', fn: scoreHello },
] as const;

// ─── Main classification entry point ─────────────────────────────────────────

/**
 * Classify a set of 21 MediaPipe Hands landmarks.
 *
 * Returns the best matching sign if it meets BOTH:
 *   1. score ≥ CONFIDENCE_THRESHOLD (0.85)
 *   2. gap from 2nd-best ≥ MARGIN (0.15) — prevents false forced matches
 *
 * Returns signId = null (UNKNOWN) if neither condition is met.
 */
export function classifySign(landmarks: NormalizedLandmark[]): ClassificationResult {
  const scored = CLASSIFIERS.map(c => ({ id: c.id, score: c.fn(landmarks) }));
  scored.sort((a, b) => b.score - a.score);

  const best   = scored[0];
  const second = scored[1];

  const meetsThreshold = best.score >= CONFIDENCE_THRESHOLD;
  const meetsMargin    = !second || (best.score - second.score) >= MARGIN;

  return {
    signId:    meetsThreshold && meetsMargin ? best.id : null,
    confidence: best.score,
    allScores:  scored,
  };
}
