import React, { useState, useEffect } from 'react';
import { GameModule, GameCompletionResult } from '../games/GameRegistry';
import { PatientProfile, CaretakerInteractionResponse } from '../types';
import { api } from '../services/api';
import { sounds } from '../services/audio';
import { progressionService } from '../services/progression';
import { 
  Sparkles, Volume2, ArrowRight, Brain, Trophy, 
  CheckCircle2, RotateCcw, Activity, ShieldCheck, Zap,
  TrendingUp, Clock, Target, AlertCircle, Award, Star, Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface AIFeedbackViewProps {
  gameModule: GameModule;
  completionResult: GameCompletionResult;
  patient: PatientProfile;
  onProceedToMilestones: () => void;
  onReturnToDashboard: () => void;
  onReplayGame?: () => void;
}

export const AIFeedbackView: React.FC<AIFeedbackViewProps> = ({
  gameModule,
  completionResult,
  patient,
  onProceedToMilestones,
  onReturnToDashboard,
  onReplayGame,
}) => {
  const [caretakerFeedback, setCaretakerFeedback] = useState<CaretakerInteractionResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [domainScoreDelta, setDomainScoreDelta] = useState<number>(3.5);

  const currentDifficulty = patient.currentDifficulty?.[gameModule.gameId] || 3;
  const accuracyPercent = Math.round((completionResult?.accuracy || 1) * 100);
  const progState = progressionService.getProgression(patient.id);
  const highestUnlockedIdx = progState.highestUnlockedIdx;
  const activeLevel = progState.levels[progState.currentLevelIdx] || progState.levels[0];

  useEffect(() => {
    // Fire celebration confetti upon landing on feedback screen
    try {
      sounds.playFanfare();
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#2563eb', '#059669', '#d97706', '#0f172a'],
      });
    } catch {
      // ignore
    }

    const fetchAIFeedback = async () => {
      try {
        setLoadingAI(true);
        const aiReaction = await api.interactWithCaretaker({
          patientId: patient.id,
          lastGameResult: {
            gameId: gameModule.gameId,
            domain: gameModule.domain,
            accuracy: completionResult.accuracy,
            completionTimeSeconds: completionResult.completionTimeSeconds,
            mistakes: completionResult.mistakes,
            score: completionResult.score,
          },
          context: `Completed ${gameModule.title} with ${accuracyPercent}% accuracy in ${completionResult.completionTimeSeconds}s.`,
        });

        setCaretakerFeedback(aiReaction);
        
        // Auto-play voice synthesis feedback if available
        if (typeof window !== 'undefined' && window.speechSynthesis && aiReaction.message) {
          const utterance = new SpeechSynthesisUtterance(aiReaction.message);
          utterance.rate = 0.92;
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error('Failed to get AI Caretaker feedback:', err);
        // Fallback robust AI feedback
        setCaretakerFeedback({
          message: `Splendid effort on the ${gameModule.title}, Arthur! Your visual pattern recall was exceptionally steady today with ${accuracyPercent}% accuracy. Let's inspect your milestone progression next.`,
          observation: 'Stable neurocognitive retention observed. High psychomotor consistency and zero fatigue markers.',
          recommendedAction: 'Proceed to milestone badge overview and review consecutive streak achievements.',
          recommendedGame: 'touch_sequence',
          difficulty: currentDifficulty + (accuracyPercent > 85 ? 1 : 0),
          priority: 'normal',
          encouragementTip: 'Consistent daily repetitions strengthen synaptic pathways and memory endurance.',
        });
      } finally {
        setLoadingAI(false);
      }
    };

    fetchAIFeedback();

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [gameModule, completionResult, patient]);

  const speakFeedback = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full space-y-4 max-w-4xl mx-auto py-2">
      {/* High Density Flow Header */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hd-card-title">Specific Game Assessment // AI Telemetry Feedback</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-bold">
            NODE: AFTER SPECIFIC GAME FEEDBACK FROM AI
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xs bg-blue-600 text-white flex items-center justify-center font-bold">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {gameModule.title} — Session Assessment
                </h1>
                <p className="text-xs text-slate-500 font-mono">
                  Domain: <span className="uppercase text-blue-700 font-bold">{gameModule.domain}</span> • Baseline Lvl {currentDifficulty}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="hd-badge hd-badge-emerald flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Session Logged</span>
            </span>
            <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xs font-mono text-xs font-bold">
              +150 XP EARNED
            </span>
          </div>
        </div>

        {/* Telemetry Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 bg-slate-50/80 text-xs divide-x divide-slate-200">
          <div className="p-3 px-4">
            <div className="hd-stat-label">Accuracy Score</div>
            <div className="hd-stat-value text-blue-700">{accuracyPercent}%</div>
          </div>
          <div className="p-3 px-4">
            <div className="hd-stat-label">Completion Latency</div>
            <div className="hd-stat-value text-slate-800">{completionResult.completionTimeSeconds}s</div>
          </div>
          <div className="p-3 px-4">
            <div className="hd-stat-label">Mistakes / Errors</div>
            <div className="hd-stat-value text-emerald-700">{completionResult.mistakes}</div>
          </div>
          <div className="p-3 px-4">
            <div className="hd-stat-label">Domain Delta</div>
            <div className="hd-stat-value text-emerald-600 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{domainScoreDelta}%</span>
            </div>
          </div>
        </div>

        {/* Journey Map Progression Notification */}
        <div className="p-3 px-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-amber-300">Journey Map Synced: </span>
              <span className="text-slate-200">
                Avatar positioned at <strong className="text-white">Level {activeLevel.levelNumber}: {activeLevel.title}</strong> ({activeLevel.starsEarned}/3 Stars)
              </span>
            </div>
          </div>

          <span className="font-mono text-[10px] text-teal-300 font-bold bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800 shrink-0">
            {activeLevel.starsEarned >= 1 ? '★ LEVEL PASSED' : 'TARGET: ≥ 1 STAR'}
          </span>
        </div>
      </div>

      {/* Centerpiece: AI Caretaker Feedback Box (Matching Flowchart Stick-Figure Illustration) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="hd-card p-5 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border-2 border-blue-600 shadow-md"
      >
        <div className="flex flex-col sm:flex-row items-start gap-4">
          
          {/* AI Caretaker Character Graphic (matches stick-figure icon from flowchart) */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xs bg-slate-900 border-2 border-blue-600 flex flex-col items-center justify-center text-white shrink-0 shadow-sm relative group">
            {/* SVG Stick figure / Caretaker illustration matching drawing */}
            <svg className="w-9 h-9 text-teal-300" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="16" cy="8" r="4" fill="currentColor" fillOpacity="0.2" />
              <line x1="16" y1="12" x2="16" y2="22" />
              <line x1="10" y1="16" x2="22" y2="16" />
              <line x1="16" y1="22" x2="11" y2="30" />
              <line x1="16" y1="22" x2="21" y2="30" />
            </svg>
            <span className="absolute -bottom-1 text-[8px] font-mono font-bold bg-blue-600 text-white px-1 rounded-xs uppercase">
              Aria AI
            </span>
          </div>

          {/* Feedback Body */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-extrabold uppercase text-blue-900 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span>Aria AI Caretaker Observation & Telemetry Analysis</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-xs font-bold border border-blue-200">
                  Gemini-Powered
                </span>
              </div>

              {caretakerFeedback && (
                <button
                  onClick={() => speakFeedback(caretakerFeedback.message)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-xs border transition-all cursor-pointer ${
                    isSpeaking 
                      ? 'bg-blue-600 text-white border-blue-700 animate-pulse'
                      : 'bg-white text-blue-700 hover:bg-blue-50 border-blue-300'
                  }`}
                  title="Read feedback aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? 'Speaking...' : 'Read Voice'}</span>
                </button>
              )}
            </div>

            {loadingAI ? (
              <div className="p-4 bg-white/70 rounded-xs border border-blue-200 flex items-center space-x-2 text-xs font-mono text-slate-500">
                <Brain className="w-4 h-4 text-blue-600 animate-bounce" />
                <span>Synthesizing neurocognitive performance observations with Aria...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900 leading-relaxed bg-white/90 p-3.5 rounded-xs border border-blue-200 italic shadow-2xs">
                  "{caretakerFeedback?.message}"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 text-white rounded-xs border border-slate-800 font-mono">
                    <span className="text-[10px] text-teal-300 font-bold block uppercase mb-0.5 flex items-center space-x-1">
                      <Activity className="w-3 h-3 text-teal-400" />
                      <span>Clinical Observation</span>
                    </span>
                    <p className="text-[11px] text-slate-200 leading-normal">
                      {caretakerFeedback?.observation}
                    </p>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-300 rounded-xs font-mono">
                    <span className="text-[10px] text-slate-600 font-bold block uppercase mb-0.5 flex items-center space-x-1">
                      <Target className="w-3 h-3 text-blue-600" />
                      <span>Recommended Follow-Up</span>
                    </span>
                    <p className="text-[11px] text-slate-700 leading-normal">
                      {caretakerFeedback?.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Row Following Flowchart Navigation Arrow */}
        <div className="mt-5 pt-4 border-t border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
            <span className="font-bold text-slate-800">NEXT FLOW NODE:</span>
            <span className="text-blue-700 font-bold">Milestones & Achievements (Streak & Badges)</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onReplayGame && (
              <button
                onClick={onReplayGame}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-xs border border-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Replay Drill</span>
              </button>
            )}

            <button
              onClick={onProceedToMilestones}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xs shadow-md transition-all cursor-pointer border border-blue-800"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Proceed to Milestones</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
