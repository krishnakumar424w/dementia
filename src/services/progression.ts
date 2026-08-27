import { GameCompletionResult } from '../games/GameRegistry';
import { sounds } from './audio';

export interface ProgressionLevel {
  levelNumber: number;
  title: string;
  gameId: string;
  domain: string;
  starsEarned: number; // 0, 1, 2, or 3
  scoreRequirement: number; // target percentage (e.g. 60, 70, 75, 80, 85)
  icon: string;
  color: string;
  bgColor: string;
  bestScore?: number;
  lastPlayedAt?: string;
}

export interface ProgressionState {
  patientId: string;
  levels: ProgressionLevel[];
  currentLevelIdx: number; // Avatar position index (0-based)
  selectedLevelIdx: number; // Inspector preview card index (0-based)
  highestUnlockedIdx: number;
  pendingJumpAnimation?: {
    fromIdx: number;
    toIdx: number;
    timestamp: number;
  } | null;
  lastUpdated: string;
}

export const INITIAL_PROGRESSION_LEVELS: ProgressionLevel[] = [
  {
    levelNumber: 1,
    title: 'Card Flip Recall',
    gameId: 'memory_training',
    domain: 'Visual Memory',
    starsEarned: 3,
    scoreRequirement: 65,
    icon: '🃏',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-500',
    bestScore: 92,
  },
  {
    levelNumber: 2,
    title: 'Touch Chime Reflex',
    gameId: 'touch_sequence',
    domain: 'Psychomotor Speed',
    starsEarned: 3,
    scoreRequirement: 70,
    icon: '⚡',
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-500',
    bestScore: 88,
  },
  {
    levelNumber: 3,
    title: 'Attention Grid Sweep',
    gameId: 'concentration',
    domain: 'Selective Focus',
    starsEarned: 2,
    scoreRequirement: 75,
    icon: '🎯',
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-500',
    bestScore: 82,
  },
  {
    levelNumber: 4,
    title: 'Object Naming Lab',
    gameId: 'icon_identification',
    domain: 'Language & Recall',
    starsEarned: 1,
    scoreRequirement: 75,
    icon: '💡',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-500',
    bestScore: 78,
  },
  {
    levelNumber: 5,
    title: 'Trail Connector',
    gameId: 'graph_interpretation',
    domain: 'Executive Logic',
    starsEarned: 0,
    scoreRequirement: 80,
    icon: '🔗',
    color: 'from-rose-400 to-red-500',
    bgColor: 'bg-rose-500',
  },
  {
    levelNumber: 6,
    title: 'Visual Matrix Search',
    gameId: 'vision_adaptation',
    domain: 'Spatial Scanning',
    starsEarned: 0,
    scoreRequirement: 80,
    icon: '👁️',
    color: 'from-cyan-400 to-blue-600',
    bgColor: 'bg-cyan-500',
  },
  {
    levelNumber: 7,
    title: 'Dual-Task Cortex',
    gameId: 'memory_training',
    domain: 'Working Memory II',
    starsEarned: 0,
    scoreRequirement: 85,
    icon: '🧠',
    color: 'from-amber-400 to-yellow-600',
    bgColor: 'bg-amber-600',
  },
  {
    levelNumber: 8,
    title: 'Grandmaster Brain Apex',
    gameId: 'graph_interpretation',
    domain: 'Integrated Mastery',
    starsEarned: 0,
    scoreRequirement: 90,
    icon: '👑',
    color: 'from-violet-500 to-purple-800',
    bgColor: 'bg-violet-600',
  },
];

const STORAGE_KEY_PREFIX = 'mira_journey_progression_';

type ProgressionListener = (state: ProgressionState) => void;
const listeners: Set<ProgressionListener> = new Set();

/**
 * Star Evaluation Logic:
 * Calculates 0, 1, 2, or 3 stars based on score, accuracy, and requirement.
 * ≥ 1 Star is awarded whenever score meets the requirement or accuracy >= 65%.
 */
export function calculateStarsForScore(
  score: number,
  accuracy: number,
  scoreRequirement: number
): number {
  const effectiveScore = Math.max(score, Math.round(accuracy * 100));

  if (effectiveScore >= scoreRequirement + 15 || accuracy >= 0.92) {
    return 3;
  }
  if (effectiveScore >= scoreRequirement + 5 || accuracy >= 0.78) {
    return 2;
  }
  if (effectiveScore >= scoreRequirement || accuracy >= 0.60) {
    return 1;
  }
  return 0;
}

export function isLevelUnlockedInList(idx: number, levels: ProgressionLevel[]): boolean {
  if (idx === 0) return true;
  const prev = levels[idx - 1];
  return prev ? prev.starsEarned >= 1 : false;
}

export function computeHighestUnlockedIdx(levels: ProgressionLevel[]): number {
  let highest = 0;
  for (let i = 0; i < levels.length; i++) {
    if (isLevelUnlockedInList(i, levels)) {
      highest = i;
    } else {
      break;
    }
  }
  return highest;
}

export const progressionService = {
  subscribe(listener: ProgressionListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  notify(state: ProgressionState) {
    listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (e) {
        console.error('Progression listener error:', e);
      }
    });
  },

  getProgression(patientId: string): ProgressionState {
    const key = `${STORAGE_KEY_PREFIX}${patientId || 'default'}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as ProgressionState;
        if (parsed && Array.isArray(parsed.levels) && parsed.levels.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading progression state from storage:', err);
    }

    // Default initialized state:
    // Levels 1-4 are completed (3, 3, 2, 1 stars). Level 5 is unlocked and active.
    const defaultLevels = JSON.parse(JSON.stringify(INITIAL_PROGRESSION_LEVELS));
    const highest = computeHighestUnlockedIdx(defaultLevels);
    const initial: ProgressionState = {
      patientId,
      levels: defaultLevels,
      currentLevelIdx: highest,
      selectedLevelIdx: highest,
      highestUnlockedIdx: highest,
      pendingJumpAnimation: null,
      lastUpdated: new Date().toISOString(),
    };
    this.saveProgression(patientId, initial);
    return initial;
  },

  saveProgression(patientId: string, state: ProgressionState): void {
    const key = `${STORAGE_KEY_PREFIX}${patientId || 'default'}`;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn('Error saving progression state to storage:', err);
    }
    this.notify(state);
  },

  /**
   * Evaluates game completion against the Journey Map.
   * Matches the played game to a level (either the currently active level or the level configured for that game).
   * Calculates stars, unlocks the next level, and sets up character progression and jump animation!
   */
  evaluateGameCompletion(
    patientId: string,
    gameId: string,
    result: GameCompletionResult,
    explicitTargetLevelIdx?: number
  ): {
    state: ProgressionState;
    levelPlayed: ProgressionLevel;
    levelIndex: number;
    starsAwarded: number;
    unlockedNext: boolean;
    advancedToIdx: number;
    score: number;
  } {
    const current = this.getProgression(patientId);
    const levels = [...current.levels];

    // Determine which level was played:
    // 1. If explicitTargetLevelIdx is valid and matches, use it.
    // 2. Otherwise, check if currentLevelIdx matches the game.
    // 3. Otherwise, search for the lowest unlocked level matching the gameId.
    // 4. Fallback to currentLevelIdx.
    let targetIdx = current.currentLevelIdx;

    if (
      typeof explicitTargetLevelIdx === 'number' &&
      explicitTargetLevelIdx >= 0 &&
      explicitTargetLevelIdx < levels.length
    ) {
      targetIdx = explicitTargetLevelIdx;
    } else if (levels[current.currentLevelIdx]?.gameId === gameId) {
      targetIdx = current.currentLevelIdx;
    } else {
      // Find lowest matching unlocked level
      const matchingIdx = levels.findIndex(
        (lvl, idx) => lvl.gameId === gameId && isLevelUnlockedInList(idx, levels)
      );
      if (matchingIdx !== -1) {
        targetIdx = matchingIdx;
      }
    }

    const level = levels[targetIdx];
    const scoreVal = result.score ?? Math.round((result.accuracy || 1) * 100);
    const stars = calculateStarsForScore(scoreVal, result.accuracy, level.scoreRequirement);

    const prevStars = level.starsEarned || 0;
    const newStars = Math.max(prevStars, stars);

    // Update level object
    levels[targetIdx] = {
      ...level,
      starsEarned: newStars,
      bestScore: Math.max(level.bestScore || 0, scoreVal),
      lastPlayedAt: new Date().toISOString(),
    };

    let unlockedNext = false;
    let nextIdx = targetIdx;
    const highestUnlocked = computeHighestUnlockedIdx(levels);

    // If earned >= 1 star on this level, check if it unlocks the next level
    if (newStars >= 1) {
      if (targetIdx + 1 < levels.length) {
        unlockedNext = true;
        nextIdx = targetIdx + 1;
      }
    }

    // Determine target avatar position:
    // If the player passed the level and next level is unlocked, advance avatar to next level
    const newAvatarIdx = unlockedNext ? nextIdx : Math.max(current.currentLevelIdx, targetIdx);
    const newSelectedIdx = unlockedNext ? nextIdx : targetIdx;

    const updatedState: ProgressionState = {
      patientId,
      levels,
      currentLevelIdx: newAvatarIdx,
      selectedLevelIdx: newSelectedIdx,
      highestUnlockedIdx: highestUnlocked,
      pendingJumpAnimation: unlockedNext
        ? {
            fromIdx: targetIdx,
            toIdx: newAvatarIdx,
            timestamp: Date.now(),
          }
        : null,
      lastUpdated: new Date().toISOString(),
    };

    this.saveProgression(patientId, updatedState);

    return {
      state: updatedState,
      levelPlayed: levels[targetIdx],
      levelIndex: targetIdx,
      starsAwarded: stars,
      unlockedNext,
      advancedToIdx: newAvatarIdx,
      score: scoreVal,
    };
  },

  setAvatarPosition(patientId: string, levelIdx: number): ProgressionState {
    const current = this.getProgression(patientId);
    if (!isLevelUnlockedInList(levelIdx, current.levels)) {
      return current;
    }
    const updated: ProgressionState = {
      ...current,
      currentLevelIdx: levelIdx,
      selectedLevelIdx: levelIdx,
      lastUpdated: new Date().toISOString(),
    };
    this.saveProgression(patientId, updated);
    return updated;
  },

  setSelectedLevel(patientId: string, levelIdx: number): ProgressionState {
    const current = this.getProgression(patientId);
    const updated: ProgressionState = {
      ...current,
      selectedLevelIdx: levelIdx,
      lastUpdated: new Date().toISOString(),
    };
    this.saveProgression(patientId, updated);
    return updated;
  },

  updateLevelStars(patientId: string, levelIdx: number, stars: number): ProgressionState {
    const current = this.getProgression(patientId);
    const levels = [...current.levels];
    if (!levels[levelIdx]) return current;

    levels[levelIdx] = {
      ...levels[levelIdx],
      starsEarned: Math.min(Math.max(stars, 0), 3),
      lastPlayedAt: new Date().toISOString(),
    };

    const highestUnlocked = computeHighestUnlockedIdx(levels);
    let nextAvatarIdx = current.currentLevelIdx;
    let pendingAnim = null;

    if (stars >= 1 && levelIdx + 1 < levels.length) {
      nextAvatarIdx = Math.max(current.currentLevelIdx, levelIdx + 1);
      pendingAnim = {
        fromIdx: levelIdx,
        toIdx: levelIdx + 1,
        timestamp: Date.now(),
      };
    }

    const updated: ProgressionState = {
      patientId,
      levels,
      currentLevelIdx: nextAvatarIdx,
      selectedLevelIdx: nextAvatarIdx,
      highestUnlockedIdx: highestUnlocked,
      pendingJumpAnimation: pendingAnim,
      lastUpdated: new Date().toISOString(),
    };

    this.saveProgression(patientId, updated);
    return updated;
  },

  switchGameForLevel(
    patientId: string,
    levelIdx: number,
    gameId: string,
    title: string,
    domain: string,
    icon: string
  ): ProgressionState {
    const current = this.getProgression(patientId);
    const levels = [...current.levels];
    if (!levels[levelIdx]) return current;

    levels[levelIdx] = {
      ...levels[levelIdx],
      gameId,
      title,
      domain,
      icon,
    };

    const updated: ProgressionState = {
      ...current,
      levels,
      lastUpdated: new Date().toISOString(),
    };

    this.saveProgression(patientId, updated);
    return updated;
  },

  clearPendingJumpAnimation(patientId: string): void {
    const current = this.getProgression(patientId);
    if (current.pendingJumpAnimation) {
      const updated: ProgressionState = {
        ...current,
        pendingJumpAnimation: null,
      };
      this.saveProgression(patientId, updated);
    }
  },

  resetProgression(patientId: string): ProgressionState {
    const defaultLevels = JSON.parse(JSON.stringify(INITIAL_PROGRESSION_LEVELS));
    const initial: ProgressionState = {
      patientId,
      levels: defaultLevels,
      currentLevelIdx: 4,
      selectedLevelIdx: 4,
      highestUnlockedIdx: 4,
      pendingJumpAnimation: null,
      lastUpdated: new Date().toISOString(),
    };
    this.saveProgression(patientId, initial);
    return initial;
  },
};
