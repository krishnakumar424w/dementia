import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameModule, GameCompletionResult } from '../games/GameRegistry';
import { PatientProfile, CaretakerInteractionResponse } from '../types';
import { api } from '../services/api';
import { sounds, speechManager } from '../services/audio';
import { progressionService } from '../services/progression';
import { 
  Trophy, ArrowRight, Volume2, Sparkles, 
  Brain, CheckCircle, X, Award, Star, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameContainerProps {
  gameModule: GameModule;
  patient: PatientProfile;
  onClose: () => void;
  onGameCompleted: (updatedPatient: PatientProfile) => void;
  onLaunchNextGame: (gameId: string) => void;
  onOpenAIFeedback?: (
    gameModule: GameModule,
    result: GameCompletionResult,
    initialFeedback?: CaretakerInteractionResponse,
    taskKey?: string
  ) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  gameModule,
  patient,
  onClose,
  onGameCompleted,
  onLaunchNextGame,
  onOpenAIFeedback,
}) => {
  const currentDifficulty = patient.currentDifficulty?.[gameModule.gameId] || 3;

  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [completionResult, setCompletionResult] = useState<GameCompletionResult | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null);
  const [caretakerFeedback, setCaretakerFeedback] = useState<CaretakerInteractionResponse | null>(null);
  const [currentTaskKey, setCurrentTaskKey] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [progressionInfo, setProgressionInfo] = useState<{
    starsAwarded: number;
    unlockedNext: boolean;
    levelTitle: string;
    levelNumber: number;
    nextLevelNumber?: number;
  } | null>(null);

  // Stop speech if modal closes or unmounts
  useEffect(() => {
    return () => {
      speechManager.cancel();
    };
  }, []);

  const GameComponent = gameModule.component;

  const handleGameFinished = async (result: GameCompletionResult) => {
    const taskKey = `drill_${gameModule.gameId}_${result.score}_${result.completionTimeSeconds}_${Date.now()}`;
    setCurrentTaskKey(taskKey);
    setCompletionResult(result);
    setGameState('completed');
    setIsSubmitting(true);

    // Evaluate progression and star achievements immediately
    try {
      const evalRes = progressionService.evaluateGameCompletion(
        patient.id,
        gameModule.gameId,
        result
      );

      setProgressionInfo({
        starsAwarded: evalRes.starsAwarded,
        unlockedNext: evalRes.unlockedNext,
        levelTitle: evalRes.levelPlayed.title,
        levelNumber: evalRes.levelPlayed.levelNumber,
        nextLevelNumber: evalRes.advancedToIdx + 1,
      });
    } catch (e) {
      console.warn('Progression evaluation error:', e);
    }

    try {
      sounds.playFanfare();
      confetti({
        particleCount: 65,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#059669', '#d97706', '#0f172a'],
      });
    } catch {
      // fallback
    }

    try {
      const submitRes = await api.submitGameResult({
        sessionId: `sess_${Date.now()}`,
        patientId: patient.id,
        gameId: gameModule.gameId,
        domain: gameModule.domain,
        difficultyLevel: currentDifficulty,
        score: result.score,
        accuracy: result.accuracy,
        completionTimeSeconds: result.completionTimeSeconds,
        mistakes: result.mistakes,
        metrics: result.metrics,
      });

      setSubmissionFeedback(submitRes.feedback);
      if (submitRes.patient) {
        onGameCompleted(submitRes.patient);
      }

      const aiReaction = await api.interactWithCaretaker({
        patientId: patient.id,
        lastGameResult: {
          gameId: gameModule.gameId,
          domain: gameModule.domain,
          accuracy: result.accuracy,
          completionTimeSeconds: result.completionTimeSeconds,
        },
      });

      setCaretakerFeedback(aiReaction);

      // AI speaks exactly ONCE upon task completion
      if (aiReaction?.message) {
        speechManager.speakOnce(
          taskKey,
          aiReaction.message,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch (err) {
      console.error('Error submitting game result:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const speakFeedback = (text: string) => {
    speechManager.speak(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-white w-full max-w-3xl rounded-xs shadow-2xl border-2 border-slate-900 overflow-hidden my-auto"
      >
        {/* Game Title Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-xs bg-blue-600 flex items-center justify-center text-white">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-white leading-tight">
                  {gameModule.title}
                </h2>
                <span className="hd-badge hd-badge-blue capitalize">
                  {gameModule.domain}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xs font-mono text-[10px] font-bold">
              LVL {currentDifficulty} / 10
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Game Content */}
        <div className="p-4 sm:p-6 min-h-[440px] flex items-center justify-center bg-white">
          <AnimatePresence mode="wait">
            {gameState === 'playing' ? (
              <motion.div
                key="game-playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <GameComponent
                  difficulty={currentDifficulty}
                  patientName={patient.fullName}
                  onComplete={handleGameFinished}
                  onCancel={onClose}
                />
              </motion.div>
            ) : (
              /* Victory & Clinical Feedback Screen */
              <motion.div
                key="game-completed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-xl mx-auto flex flex-col items-center text-center py-2"
              >
                {/* Badge Trophy */}
                <div className="w-12 h-12 rounded-xs bg-amber-50 border border-amber-300 text-amber-800 flex items-center justify-center shadow-2xs mb-3">
                  <Trophy className="w-6 h-6" />
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Drill Completed • {patient?.fullName ? patient.fullName.split(' ')[0] : 'Patient'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cognitive telemetry recorded and synced with clinical database
                </p>

                {/* Score & Metric Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 w-full my-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5">
                    <span className="hd-stat-label block">Accuracy</span>
                    <span className="hd-stat-value text-blue-700">
                      {Math.round((completionResult?.accuracy || 1) * 100)}%
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5">
                    <span className="hd-stat-label block">Time</span>
                    <span className="hd-stat-value text-slate-800">
                      {completionResult?.completionTimeSeconds}s
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5">
                    <span className="hd-stat-label block">Next Adaptive</span>
                    <span className="hd-stat-value text-emerald-700">
                      LVL {submissionFeedback?.newDifficulty || currentDifficulty}
                    </span>
                  </div>
                </div>

                {/* Journey Map Progression & Star Banner */}
                {progressionInfo && (
                  <div className="w-full bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-3 mb-3.5 border border-indigo-700/80 shadow-md flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-base shadow-sm shrink-0">
                        ⭐
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-extrabold text-amber-300">
                            {progressionInfo.starsAwarded > 0
                              ? `Earned ${progressionInfo.starsAwarded} Star${progressionInfo.starsAwarded > 1 ? 's' : ''}!`
                              : '0 Stars Earned'}
                          </span>
                          <div className="flex space-x-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  progressionInfo.starsAwarded >= s
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {progressionInfo.unlockedNext
                            ? `🎉 Level ${progressionInfo.nextLevelNumber} Unlocked & Activated on Journey Map!`
                            : `Journey Level ${progressionInfo.levelNumber}: ${progressionInfo.levelTitle}`}
                        </p>
                      </div>
                    </div>

                    {progressionInfo.unlockedNext && (
                      <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shrink-0 font-mono shadow-xs">
                        ✓ UNLOCKED
                      </span>
                    )}
                  </div>
                )}

                {/* AI Caretaker Feedback Box */}
                {caretakerFeedback && (
                  <div className="w-full hd-ai-box text-left mb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-1.5 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[10px] font-bold uppercase font-mono text-blue-900">Aria Caretaker Feedback</span>
                        </div>
                        <p className="text-xs text-[#0369A1] italic">
                          "{caretakerFeedback.message}"
                        </p>
                      </div>

                      <button
                        onClick={() => speakFeedback(caretakerFeedback.message)}
                        className="p-1.5 bg-white border border-blue-200 text-blue-700 rounded-xs hover:bg-blue-50 cursor-pointer shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Flowchart Primary Action: Proceed to AI Feedback Screen */}
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                  {onOpenAIFeedback && completionResult ? (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAIFeedback(gameModule, completionResult, caretakerFeedback || undefined, currentTaskKey);
                      }}
                      className="w-full sm:flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase text-xs rounded-xs shadow-md transition-colors cursor-pointer border border-blue-800"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Proceed to AI Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : caretakerFeedback?.recommendedGame ? (
                    <button
                      onClick={() => {
                        onLaunchNextGame(caretakerFeedback.recommendedGame);
                      }}
                      className="w-full sm:flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs rounded-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Next Prescribed Drill</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : null}

                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs rounded-xs transition-colors cursor-pointer border border-slate-300"
                  >
                    Return to Routine
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
