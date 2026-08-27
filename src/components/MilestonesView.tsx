import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { MilestoneItem, PatientProfile } from '../types';
import { api } from '../services/api';
import { sounds } from '../services/audio';
import { 
  Trophy, Sparkles, CheckCircle2, Lock,
  Zap, Star, ArrowRight, Brain, Play,
  Compass, Award, Flame, TrendingUp, ShieldCheck, Sun,
  ChevronDown, Gamepad2, Settings2, RefreshCw, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { gameRegistry } from '../games';
import { 
  progressionService, 
  ProgressionLevel, 
  ProgressionState,
  isLevelUnlockedInList 
} from '../services/progression';

interface MilestonesViewProps {
  patient: PatientProfile;
  onReturnToDashboard?: () => void;
  onLaunchNextGame?: (gameId: string) => void;
}

export type { ProgressionLevel };

const GAME_METADATA_MAP: Record<string, { icon: string; domain: string; defaultTitle: string }> = {
  memory_training: { icon: '🃏', domain: 'Visual Memory', defaultTitle: 'Card Flip Recall' },
  touch_sequence: { icon: '⚡', domain: 'Psychomotor Speed', defaultTitle: 'Touch Chime Reflex' },
  concentration: { icon: '🎯', domain: 'Selective Focus', defaultTitle: 'Attention Grid Sweep' },
  icon_identification: { icon: '💡', domain: 'Language & Recall', defaultTitle: 'Object Naming Lab' },
  graph_interpretation: { icon: '🔗', domain: 'Executive Logic', defaultTitle: 'Trail Connector' },
  vision_adaptation: { icon: '👁️', domain: 'Spatial Scanning', defaultTitle: 'Visual Matrix Search' },
};

export const MilestonesView: React.FC<MilestonesViewProps> = ({ 
  patient,
  onReturnToDashboard,
  onLaunchNextGame,
}) => {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Progressive level state managed via synchronized persistence service
  const [progState, setProgState] = useState<ProgressionState>(() => 
    progressionService.getProgression(patient.id)
  );
  
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [recentCelebration, setRecentCelebration] = useState<string | null>(null);
  const hasCheckedPendingAnimationRef = useRef<boolean>(false);

  const levels = progState.levels;
  const currentLevelIdx = progState.currentLevelIdx;
  const selectedLevelIdx = progState.selectedLevelIdx;

  // Subscribe to external progression changes (from game completions, etc.)
  useEffect(() => {
    const initialState = progressionService.getProgression(patient.id);
    setProgState(initialState);

    const unsubscribe = progressionService.subscribe((updated) => {
      if (updated.patientId === patient.id) {
        setProgState(updated);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [patient.id]);

  // Load clinical milestones badges
  useEffect(() => {
    const loadMilestones = async () => {
      try {
        setLoading(true);
        const res = await api.getMilestones(patient.id);
        setMilestones(res.milestones);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadMilestones();
  }, [patient.id]);

  // Check and trigger pending jump micro-animation if arriving from a completed game
  useEffect(() => {
    if (hasCheckedPendingAnimationRef.current) return;
    const current = progressionService.getProgression(patient.id);

    if (current.pendingJumpAnimation) {
      hasCheckedPendingAnimationRef.current = true;
      const { fromIdx, toIdx } = current.pendingJumpAnimation;
      progressionService.clearPendingJumpAnimation(patient.id);

      // Start at fromIdx, then jump to toIdx after short delay
      setProgState((prev) => ({
        ...prev,
        currentLevelIdx: fromIdx,
        selectedLevelIdx: toIdx,
      }));

      const timer = setTimeout(() => {
        setIsJumping(true);
        sounds.playFanfare();
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.5 },
          colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'],
        });

        setTimeout(() => {
          setProgState((prev) => ({
            ...prev,
            currentLevelIdx: toIdx,
            selectedLevelIdx: toIdx,
          }));
          progressionService.setAvatarPosition(patient.id, toIdx);

          setTimeout(() => {
            setIsJumping(false);
            const targetLvl = current.levels[toIdx];
            celebrateMilestone(`🎉 Level ${targetLvl ? targetLvl.levelNumber : toIdx + 1} Unlocked & Activated!`);
          }, 450);
        }, 400);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [patient.id]);

  /**
   * Star-Based Unlock Rule:
   * Level 1 (idx 0) is always unlocked.
   * Any subsequent Level i (idx > 0) unlocks IF AND ONLY IF Level i-1 has earned at least 1 star (starsEarned >= 1).
   */
  const isLevelUnlocked = (idx: number): boolean => {
    return isLevelUnlockedInList(idx, levels);
  };

  const celebrateMilestone = (customMessage?: string) => {
    sounds.playFanfare();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.45 },
      colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'],
    });
    if (customMessage) {
      setRecentCelebration(customMessage);
      setTimeout(() => setRecentCelebration(null), 3500);
    }
  };

  const jumpToLevel = (targetIdx: number) => {
    const unlocked = isLevelUnlocked(targetIdx);

    // If target level is locked, reject jump and show informative feedback
    if (!unlocked) {
      sounds.playTap();
      const prevLvlNumber = levels[targetIdx - 1]?.levelNumber || 1;
      setRecentCelebration(`🔒 Level ${levels[targetIdx]?.levelNumber || targetIdx + 1} is locked! Earn ≥ 1 Star on Level ${prevLvlNumber} to unlock.`);
      progressionService.setSelectedLevel(patient.id, targetIdx);
      setTimeout(() => setRecentCelebration(null), 3500);
      return;
    }

    if (isJumping || targetIdx === currentLevelIdx) {
      progressionService.setSelectedLevel(patient.id, targetIdx);
      return;
    }

    setIsJumping(true);
    sounds.playTap();
    progressionService.setSelectedLevel(patient.id, targetIdx);

    // Multi-stage jumping physics sequence
    setTimeout(() => {
      progressionService.setAvatarPosition(patient.id, targetIdx);
      
      // On landing
      setTimeout(() => {
        setIsJumping(false);
        celebrateMilestone(`Level ${levels[targetIdx]?.levelNumber || targetIdx + 1} Reached!`);
      }, 450);
    }, 400);
  };

  // Next level candidate index
  const nextCandidateIdx = currentLevelIdx + 1;
  const hasNextLevel = nextCandidateIdx < levels.length;
  const isNextLevelUnlocked = hasNextLevel && isLevelUnlocked(nextCandidateIdx);
  const currentLevel = levels[currentLevelIdx] || levels[0];
  const selectedLevel = levels[selectedLevelIdx] || currentLevel;

  const handleStepNextLevel = () => {
    if (!hasNextLevel) {
      celebrateMilestone('🏆 Congratulations! You have conquered all levels in the Journey Map!');
      return;
    }
    if (!isNextLevelUnlocked) {
      sounds.playTap();
      setRecentCelebration(`⭐ Earn at least 1 star on Level ${currentLevel.levelNumber} to unlock Level ${levels[nextCandidateIdx]?.levelNumber}`);
      setTimeout(() => setRecentCelebration(null), 3500);
      return;
    }
    jumpToLevel(nextCandidateIdx);
  };

  // Game module switcher handler for progression levels
  const handleSelectGameForLevel = (levelIdx: number, newGameId: string) => {
    sounds.playTap();
    const gameDef = gameRegistry.getGame(newGameId);
    const meta = GAME_METADATA_MAP[newGameId] || {
      icon: '🧠',
      domain: gameDef?.domain || 'Cognitive Logic',
      defaultTitle: gameDef?.title || 'Cognitive Drill',
    };

    progressionService.switchGameForLevel(
      patient.id,
      levelIdx,
      newGameId,
      gameDef?.title || meta.defaultTitle,
      gameDef?.domain || meta.domain,
      meta.icon
    );

    setRecentCelebration(`Level ${levels[levelIdx]?.levelNumber} configured with "${gameDef?.title || meta.defaultTitle}"!`);
    setTimeout(() => setRecentCelebration(null), 3000);
  };

  // Level node click handler for interactive selection
  const handleLevelNodeClick = (idx: number) => {
    sounds.playTap();
    progressionService.setSelectedLevel(patient.id, idx);

    const unlocked = isLevelUnlocked(idx);
    if (unlocked) {
      if (idx !== currentLevelIdx) {
        jumpToLevel(idx);
      }
    } else {
      const prevLvlNumber = levels[idx - 1]?.levelNumber || 1;
      setRecentCelebration(`🔒 Level ${levels[idx]?.levelNumber || idx + 1} is locked! Earn ≥ 1 Star on Level ${prevLvlNumber} to unlock.`);
      setTimeout(() => setRecentCelebration(null), 3500);
    }
  };

  // Quick Star Rating Updater for interactive testing and drills
  const handleUpdateStars = (levelIdx: number, newStars: number) => {
    const updatedState = progressionService.updateLevelStars(patient.id, levelIdx, newStars);
    
    if (newStars >= 1) {
      sounds.playFanfare();
      const unlockedNext = updatedState.levels[levelIdx + 1];
      if (unlockedNext) {
        celebrateMilestone(`★ Star Earned! Level ${unlockedNext.levelNumber} Unlocked!`);
        // Trigger jump to the newly unlocked level
        if (levelIdx + 1 <= updatedState.levels.length - 1) {
          jumpToLevel(levelIdx + 1);
        }
      } else {
        celebrateMilestone(`★ Star Earned on Level ${updatedState.levels[levelIdx]?.levelNumber}!`);
      }
    } else {
      sounds.playTap();
    }
  };

  const handleResetJourney = () => {
    if (window.confirm('Reset Journey Map progression back to default initialized state?')) {
      progressionService.resetProgression(patient.id);
      celebrateMilestone('Journey Map Reset to Initial State');
    }
  };

  const unlockedCount = milestones.filter(m => m.unlocked).length;

  return (
    <div className="w-full space-y-5">
      
      {/* FLOWCHART MILESTONE CELEBRATION HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="hd-card bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white border-2 border-blue-600 shadow-lg overflow-hidden relative"
      >
        {/* Background decorative star motifs */}
        <div className="absolute right-4 top-2 text-blue-400/15 pointer-events-none select-none">
          <Star className="w-28 h-28 stroke-1 animate-pulse" />
        </div>

        <div className="hd-card-header border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-base sm:text-lg font-bold text-slate-200">
              Cognitive Milestones & Behavioral Adherence Badges
            </span>
          </div>
          <span className="font-mono text-xs text-teal-300 font-bold bg-teal-950 px-2.5 py-1 rounded-md border border-teal-800">
            NODE: MILESTONE PROGRESSION
          </span>
        </div>

        <div className="p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left Graphic Icon with Visual Streak Badge */}
          <div className="flex items-center space-x-4">
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 text-slate-950 flex flex-col items-center justify-center border-2 border-amber-200 shadow-lg shrink-0 relative group">
              <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-slate-950 fill-slate-950 drop-shadow animate-pulse" />
              <div className="absolute -top-2 -right-2 flex space-x-0.5">
                <Star className="w-5 h-5 text-amber-300 fill-amber-300 drop-shadow" />
                <Star className="w-4 h-4 text-amber-200 fill-amber-200" />
              </div>
              <div className="absolute -bottom-2 -left-1">
                <Trophy className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  7-Day Streak Master • Top 1% Cohort Status!
                </h1>
                <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-mono text-xs font-black rounded-full uppercase tracking-wider shadow-xs">
                  🏆 TOP 1% BENCHMARK
                </span>
                <span className="px-2.5 py-1 bg-blue-800 text-blue-100 font-mono text-xs font-extrabold rounded-md uppercase tracking-wider border border-blue-600">
                  LEVEL {currentLevel.levelNumber} ACTIVE
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-xl leading-relaxed">
                Neuroplasticity reinforcement active for <strong className="text-white">{patient.fullName}</strong>. 
                Performing in the <strong className="text-amber-300 font-bold">Top 1% of cognitive adherence</strong> across 1,240+ clinic patients this week.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => celebrateMilestone('Fanfare Celebration!')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform hover:scale-102 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Celebrate Fanfare</span>
            </button>

            {onReturnToDashboard && (
              <button
                onClick={onReturnToDashboard}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-blue-400 shadow-md transition-colors cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* LinkedIn-Style Cohort Benchmark Pill Strip */}
        <div className="px-5 py-2.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-slate-400 font-mono text-[11px] font-bold">COMMUNITY PERCENTILE RANKINGS:</span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-950/80 border border-amber-500/60 rounded-full text-amber-300 font-mono text-[10px] font-extrabold">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Top 1% Streak Master</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-950/80 border border-blue-500/60 rounded-full text-blue-300 font-mono text-[10px] font-extrabold">
              <Brain className="w-3 h-3 text-blue-400" />
              <span>Top 5% Memory Recall</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/60 rounded-full text-emerald-300 font-mono text-[10px] font-extrabold">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Top 5% Visual Speed</span>
            </span>
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            Updated today from Clinical Telemetry
          </span>
        </div>

        {/* Clean Responsive Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-800 bg-slate-950/80 text-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          <div className="p-3 px-4 flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Visual Streak Badge</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-amber-400">{patient.streakDays || 7} Days Unbroken</span>
            </div>
          </div>
          <div className="p-3 px-4 flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Badges Earned</span>
            <span className="text-sm font-bold text-teal-300 mt-0.5">{unlockedCount} / {milestones.length || 6} Badges</span>
          </div>
          <div className="p-3 px-4 flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Current Node</span>
            <span className="text-sm font-bold text-blue-300 mt-0.5 truncate" title={`Level ${currentLevel.levelNumber} - ${currentLevel.domain}`}>
              Level {currentLevel.levelNumber} ({currentLevel.domain})
            </span>
          </div>
          <div className="p-3 px-4 flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Cohort Benchmark</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5">Top 1% Master Tier</span>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* COGNITIVE JOURNEY MAP (STEPPED LEVEL PROGRESSION)        */}
      {/* ======================================================== */}
      <div className="hd-card shadow-sm bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border-2 border-indigo-800/80 rounded-2xl overflow-hidden">
        
        {/* Map Header */}
        <div className="p-4 bg-slate-950/80 border-b border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/40 text-amber-300 flex items-center justify-center border border-indigo-500/50">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-white tracking-wide">
                  Cognitive Journey Map
                </h3>
                <span className="px-2 py-0.5 bg-indigo-900 text-indigo-200 text-[10px] font-mono font-bold rounded-full border border-indigo-700">
                  STEPPED LEVEL PATH
                </span>
              </div>
              <p className="text-[11px] text-indigo-300/80">
                Unlock each level by earning at least 1 star (★☆☆) on the preceding drill.
              </p>
            </div>
          </div>

          {/* Stepper Interactive CTA */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetJourney}
              title="Reset Progression Journey"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleStepNextLevel}
              disabled={isJumping || !hasNextLevel || !isNextLevelUnlocked}
              title={
                !hasNextLevel 
                  ? 'All levels reached!'
                  : !isNextLevelUnlocked
                  ? `Earn ≥ 1 star on Level ${currentLevel.levelNumber} to unlock Level ${levels[nextCandidateIdx]?.levelNumber}`
                  : `Advance character to Level ${levels[nextCandidateIdx]?.levelNumber}`
              }
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {!isNextLevelUnlocked && hasNextLevel ? (
                <Lock className="w-3.5 h-3.5 text-slate-950" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
              )}
              <span>Step Character to Next Level</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Progression Canvas / Path View */}
        <div className="p-6 sm:p-8 relative min-h-[380px] flex flex-col items-center justify-center overflow-x-auto">
          
          {/* Ambient Background Grid */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Stepped Winding Path of Level Nodes */}
          <div className="w-full max-w-4xl flex items-center justify-between relative py-12 px-4 gap-2 sm:gap-4 overflow-x-auto min-w-[620px]">
            
            {/* Connecting Progress Track */}
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-3 bg-indigo-950 border border-indigo-700/60 rounded-full z-0 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-blue-500 transition-all duration-700"
                style={{ 
                  width: `${Math.max(
                    8,
                    ((levels.filter(l => l.starsEarned >= 1).length) / levels.length) * 100
                  )}%` 
                }}
              />
            </div>

            {/* Stepping Level Nodes */}
            {levels.map((lvl, idx) => {
              const isCurrent = idx === currentLevelIdx;
              const unlocked = isLevelUnlocked(idx);
              const isPassed = lvl.starsEarned >= 1;
              const isSelected = selectedLevelIdx === idx;

              return (
                <div key={lvl.levelNumber} className="relative z-10 flex flex-col items-center group">
                  
                  {/* ANIMATED CHARACTER MASCOT TOKEN */}
                  {isCurrent && (
                    <motion.div
                      layoutId="character-token"
                      initial={{ y: -30, scale: 0.8 }}
                      animate={
                        isJumping 
                          ? { 
                              y: [-10, -55, 0],
                              scale: [1, 1.25, 0.9, 1],
                              rotate: [0, -12, 12, 0],
                            }
                          : { 
                              y: [0, -8, 0],
                              transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                            }
                      }
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="absolute -top-16 z-30 flex flex-col items-center pointer-events-none"
                    >
                      {/* Character Speech Bubble */}
                      <div className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full shadow-lg border border-amber-200 uppercase tracking-tight flex items-center space-x-1 whitespace-nowrap mb-1">
                        <span>⭐ YOU ARE HERE</span>
                      </div>

                      {/* Character Avatar Icon Token */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-lg relative">
                        <span className="text-xl">🧠</span>
                        
                        {/* Little Crown Sparkle */}
                        <div className="absolute -top-2 -right-1 text-amber-200 animate-spin">
                          <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                        </div>
                      </div>

                      {/* Shadow Below Token */}
                      <div className="w-6 h-1.5 bg-black/40 rounded-full blur-[1px] mt-1" />
                    </motion.div>
                  )}

                  {/* Level Node Gem Button */}
                  <button
                    type="button"
                    onClick={() => handleLevelNodeClick(idx)}
                    title={
                      !unlocked
                        ? `🔒 Locked. Earn ≥ 1 star on Level ${levels[idx - 1]?.levelNumber} to unlock.`
                        : `Level ${lvl.levelNumber}: ${lvl.title} (${lvl.starsEarned}/3 Stars) - Click to inspect & play`
                    }
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-black text-sm transition-all transform cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 ring-4 ring-amber-300/60 scale-110 shadow-lg shadow-amber-500/40'
                        : isPassed
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md border-2 border-emerald-300 hover:scale-105'
                        : unlocked
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md border-2 border-blue-400 hover:scale-105'
                        : 'bg-slate-800 text-slate-500 border-2 border-slate-700 opacity-60 hover:opacity-75'
                    } ${isSelected ? 'ring-4 ring-blue-400 scale-105' : ''}`}
                  >
                    {/* Node Content */}
                    {!unlocked ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : isPassed ? (
                      <CheckCircle2 className="w-6 h-6 text-white drop-shadow" />
                    ) : (
                      <span className="text-base font-extrabold">{lvl.levelNumber}</span>
                    )}

                    {/* Star Rating Display Below Node */}
                    <div className="absolute -bottom-4.5 flex space-x-0.5 bg-slate-950/80 px-1 py-0.5 rounded-full border border-slate-800">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${
                            lvl.starsEarned >= s
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </button>

                  {/* Level Label */}
                  <div 
                    onClick={() => handleLevelNodeClick(idx)}
                    className="mt-6 text-center max-w-[85px] cursor-pointer"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span className={`text-[10px] font-extrabold truncate block ${
                        isCurrent ? 'text-amber-300 font-bold' : isSelected ? 'text-blue-300 font-bold underline' : unlocked ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        Lvl {lvl.levelNumber}
                      </span>
                      {!unlocked && <Lock className="w-2.5 h-2.5 text-slate-500 inline" />}
                    </div>
                    <span className="text-[9px] text-slate-400 truncate block font-mono">
                      {lvl.domain.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Level Interactive Inspector Panel */}
          {selectedLevel && (
            <motion.div
              key={selectedLevel.levelNumber}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 w-full max-w-2xl bg-slate-900/95 border border-indigo-700/70 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3.5"
            >
              {/* Main Level Row matching user screenshot */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-600/70 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {selectedLevel.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="font-extrabold text-sm sm:text-base text-white">
                        Level {selectedLevel.levelNumber}: {selectedLevel.title}
                      </h4>
                      <span className="px-2 py-0.5 bg-blue-900/90 text-blue-200 text-[10px] font-mono rounded font-bold border border-blue-700/60">
                        {selectedLevel.domain}
                      </span>
                      {!isLevelUnlocked(selectedLevelIdx) && (
                        <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 text-[10px] font-mono rounded font-bold border border-rose-800 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>LOCKED</span>
                        </span>
                      )}
                    </div>

                    {/* Stars & Target details matching prompt */}
                    <div className="flex items-center space-x-2.5 text-xs text-slate-300 mt-1 flex-wrap gap-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400">Rating:</span>
                        <div className="flex space-x-0.5">
                          {[1, 2, 3].map((starIdx) => (
                            <button
                              key={starIdx}
                              type="button"
                              onClick={() => handleUpdateStars(selectedLevelIdx, starIdx)}
                              title={`Click to set ${starIdx} Star${starIdx > 1 ? 's' : ''} on Level ${selectedLevel.levelNumber}`}
                              className="cursor-pointer hover:scale-125 transition-transform"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  selectedLevel.starsEarned >= starIdx
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600 hover:text-amber-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <span>•</span>
                      <span>Target: <strong className="text-white font-bold">{selectedLevel.scoreRequirement}%</strong></span>
                      <span>•</span>
                      <span className={selectedLevel.starsEarned >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {selectedLevel.starsEarned >= 1 ? '✓ Unlocked / Passed' : 'Needs ≥ 1 Star'}
                      </span>
                    </div>

                    {!isLevelUnlocked(selectedLevelIdx) && (
                      <p className="text-[11px] text-amber-300/90 mt-1 font-mono">
                        * Unlock requirement: Earn at least 1 star on Level {levels[selectedLevelIdx - 1]?.levelNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 self-stretch sm:self-auto justify-end">
                  {isLevelUnlocked(selectedLevelIdx) ? (
                    onLaunchNextGame ? (
                      <button
                        onClick={() => onLaunchNextGame(selectedLevel.gameId)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>PLAY LEVEL DRILL</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => celebrateMilestone(`Level ${selectedLevel.levelNumber} Inspected!`)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
                      >
                        Celebrate Level
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playTap();
                        setRecentCelebration(`🔒 Complete Level ${levels[selectedLevelIdx - 1]?.levelNumber} first!`);
                        setTimeout(() => setRecentCelebration(null), 3000);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl border border-slate-700 cursor-not-allowed flex items-center justify-center space-x-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked Drill</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Game Module Dropdown Selector Row */}
              <div className="pt-2.5 border-t border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs bg-slate-950/60 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:px-4 rounded-b-2xl">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label htmlFor="game-module-select" className="text-slate-300 font-mono text-[11px] flex items-center space-x-1.5 shrink-0 font-bold">
                    <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Switch Game Module:</span>
                  </label>

                  <div className="relative flex-1 sm:flex-none min-w-[210px]">
                    <select
                      id="game-module-select"
                      value={selectedLevel.gameId}
                      onChange={(e) => handleSelectGameForLevel(selectedLevelIdx, e.target.value)}
                      className="w-full bg-slate-900 text-amber-200 font-bold text-xs rounded-lg px-3 py-1.5 pr-8 border border-indigo-500/80 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer appearance-none shadow-inner"
                    >
                      {gameRegistry.getAllGames().map((g) => (
                        <option key={g.gameId} value={g.gameId} className="bg-slate-900 text-white py-1">
                          {g.title} • {g.domain.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-amber-300">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-mono text-indigo-300/80 self-end sm:self-auto">
                  <span>Active Focus: <strong className="text-amber-300">{selectedLevel.domain}</strong></span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Toast / Micro-celebration pill */}
          <AnimatePresence>
            {recentCelebration && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-4 bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs shadow-xl flex items-center space-x-2 z-40 border border-amber-200"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>{recentCelebration}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* DOMAIN PROGRESSION LEVEL-UPS */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <Brain className="w-3.5 h-3.5 text-blue-600" />
            <span className="hd-card-title">Cognitive Domain Level-Up Progressions</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">ADAPTIVE CLINICAL METRICS</span>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F8FAFC]">
          <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-800">Visual Memory</span>
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">LVL 4/10</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">Card recall retention +14%</span>
          </div>

          <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-800">Psychomotor Speed</span>
              <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">LVL 3/10</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">Chime latency: 1.1s avg</span>
          </div>

          <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-800">Selective Attention</span>
              <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">LVL 3/10</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">Target discrimination: 92%</span>
          </div>

          <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-800">Executive Logic</span>
              <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">LVL 3/10</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '58%' }}></div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">Trail connect errors: 0</span>
          </div>
        </div>
      </div>

      {/* BADGES & PERCENTILE ACHIEVEMENTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Visual Achievement Badges & Percentile Benchmarks
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {unlockedCount} of {milestones.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {milestones.map((milestone) => {
            const isGold = milestone.tier === 'gold';
            const isEmerald = milestone.tier === 'emerald';
            const isBronze = milestone.tier === 'bronze';

            // Dynamic border styling based on tier and unlocked status
            let borderStyle = 'border-slate-200';
            let badgeBg = 'bg-white';
            let iconRing = 'border-slate-200 bg-slate-100';

            if (milestone.unlocked) {
              if (isGold) {
                borderStyle = 'border-amber-300 ring-1 ring-amber-200/80 shadow-xs';
                badgeBg = 'bg-gradient-to-b from-amber-50/40 via-white to-white';
                iconRing = 'border-amber-300 bg-gradient-to-tr from-amber-100 to-yellow-100';
              } else if (isEmerald) {
                borderStyle = 'border-emerald-300 ring-1 ring-emerald-200/80 shadow-xs';
                badgeBg = 'bg-gradient-to-b from-emerald-50/40 via-white to-white';
                iconRing = 'border-emerald-300 bg-gradient-to-tr from-emerald-100 to-teal-100';
              } else if (isBronze) {
                borderStyle = 'border-orange-300 ring-1 ring-orange-200/80 shadow-xs';
                badgeBg = 'bg-gradient-to-b from-orange-50/30 via-white to-white';
                iconRing = 'border-orange-300 bg-gradient-to-tr from-orange-100 to-amber-100';
              } else {
                borderStyle = 'border-blue-300 ring-1 ring-blue-200/80 shadow-xs';
                badgeBg = 'bg-white';
                iconRing = 'border-blue-200 bg-blue-50';
              }
            } else {
              badgeBg = 'bg-slate-50/80 opacity-75';
              borderStyle = 'border-slate-200 border-dashed';
              iconRing = 'border-slate-200 bg-slate-200/60 grayscale';
            }

            return (
              <div
                key={milestone.id}
                onClick={() => milestone.unlocked && celebrateMilestone(milestone.title)}
                className={`hd-card p-4.5 justify-between transition-all rounded-xl cursor-pointer ${borderStyle} ${badgeBg} hover:scale-101 hover:shadow-sm`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 shadow-2xs ${iconRing}`}>
                      <span>{milestone.badgeIcon}</span>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      {milestone.unlocked ? (
                        <span className="hd-badge hd-badge-emerald flex items-center space-x-1 font-mono text-[10px] font-extrabold px-2 py-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>UNLOCKED</span>
                        </span>
                      ) : (
                        <span className="hd-badge bg-slate-200 text-slate-600 border border-slate-300 flex items-center space-x-1 font-mono text-[10px]">
                          <Lock className="w-3 h-3" />
                          <span>LOCKED</span>
                        </span>
                      )}

                      {/* Tier Pill */}
                      {milestone.tier && (
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-xs border ${
                          isGold ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          isEmerald ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          isBronze ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {milestone.tier} tier
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                    {milestone.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {milestone.description}
                  </p>

                  {/* LinkedIn-style Percentile Status Banner */}
                  {milestone.percentileRank && (
                    <div className="mt-2.5 px-2.5 py-1 rounded-md bg-slate-900 text-white flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-amber-300 flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{milestone.percentileRank}</span>
                      </span>
                      <span className="text-slate-300 text-[9px] truncate max-w-[120px]">
                        {milestone.benchmarkText || 'Clinic Benchmark'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100/80 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{milestone.category ? milestone.category.toUpperCase() : 'COGNITIVE'}</span>
                  <span>{milestone.unlockedAt ? new Date(milestone.unlockedAt).toLocaleDateString() : 'In Progress'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
