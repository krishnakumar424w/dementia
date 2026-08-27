import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from './GameRegistry';
import { sounds } from '../services/audio';
import { Volume2, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface PadConfig {
  id: number;
  label: string;
  color: string;
  activeColor: string;
  borderColor: string;
}

const PADS: PadConfig[] = [
  { id: 0, label: 'Ruby', color: 'bg-rose-500', activeColor: 'bg-rose-300 ring-4 ring-rose-200 scale-105', borderColor: 'border-rose-600' },
  { id: 1, label: 'Amber', color: 'bg-amber-500', activeColor: 'bg-amber-300 ring-4 ring-amber-200 scale-105', borderColor: 'border-amber-600' },
  { id: 2, label: 'Emerald', color: 'bg-emerald-500', activeColor: 'bg-emerald-300 ring-4 ring-emerald-200 scale-105', borderColor: 'border-emerald-600' },
  { id: 3, label: 'Sapphire', color: 'bg-blue-500', activeColor: 'bg-blue-300 ring-4 ring-blue-200 scale-105', borderColor: 'border-blue-600' },
];

export const TouchSequenceGame: React.FC<GameProps> = ({
  difficulty,
  patientName,
  onComplete,
  onCancel,
}) => {
  // Target rounds based on difficulty (3 to 6 sequence steps)
  const targetRounds = Math.min(Math.max(Math.floor(difficulty / 2) + 3, 3), 6);

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState<number>(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'showing' | 'player_turn' | 'round_success' | 'mistake'>('intro');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [mistakes, setMistakes] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const lastTapTimeRef = useRef<number>(Date.now());

  // Start initial sequence
  const startNewGame = () => {
    const firstPad = Math.floor(Math.random() * 4);
    setSequence([firstPad]);
    setCurrentRound(1);
    setPlayerStep(0);
    setGameState('showing');
  };

  // Play sequence to player
  useEffect(() => {
    if (gameState !== 'showing' || sequence.length === 0) return;

    let idx = 0;
    const playNext = () => {
      if (idx < sequence.length) {
        const padIndex = sequence[idx];
        setActivePad(padIndex);
        sounds.playSimonTone(padIndex);

        setTimeout(() => {
          setActivePad(null);
          idx++;
          setTimeout(playNext, 300);
        }, 550);
      } else {
        // Sequence finished, pass turn to player
        setGameState('player_turn');
        setPlayerStep(0);
        lastTapTimeRef.current = Date.now();
      }
    };

    const timer = setTimeout(playNext, 600);
    return () => clearTimeout(timer);
  }, [gameState, sequence]);

  const handlePadClick = (padIndex: number) => {
    if (gameState !== 'player_turn') return;

    // Log reaction latency
    const tapDelay = Date.now() - lastTapTimeRef.current;
    setReactionTimes(prev => [...prev, tapDelay]);
    lastTapTimeRef.current = Date.now();

    // Visual & audio feedback
    setActivePad(padIndex);
    sounds.playSimonTone(padIndex);
    setTimeout(() => setActivePad(null), 250);

    if (padIndex === sequence[playerStep]) {
      // Correct tap in sequence
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      if (nextStep === sequence.length) {
        // Completed this round!
        if (currentRound >= targetRounds) {
          // Finished all required rounds!
          handleVictory();
        } else {
          // Advance to next round
          sounds.playMatchSuccess();
          setGameState('round_success');
          setTimeout(() => {
            const nextPad = Math.floor(Math.random() * 4);
            setSequence(prev => [...prev, nextPad]);
            setCurrentRound(prev => prev + 1);
            setGameState('showing');
          }, 1000);
        }
      }
    } else {
      // Incorrect tap
      sounds.playError();
      setMistakes(prev => prev + 1);
      setGameState('mistake');

      setTimeout(() => {
        // Re-show sequence without advancing round
        setGameState('showing');
      }, 1200);
    }
  };

  const handleVictory = () => {
    sounds.playFanfare();
    const duration = Math.max((Date.now() - startTime) / 1000, 5);
    const avgReactionTime = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) 
      : 1150;
    
    const accuracy = Math.max(0.4, Math.min(1.0, 1 - (mistakes * 0.15)));

    onComplete({
      accuracy: Math.round(accuracy * 100) / 100,
      completionTimeSeconds: Math.round(duration * 10) / 10,
      mistakes,
      score: Math.round(accuracy * 100),
      metrics: {
        maxSequenceReached: targetRounds,
        avgReactionTimeMs: avgReactionTime,
        roundsCompleted: targetRounds,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-4 select-none">
      {/* Top Header stats */}
      <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Round:</span>
          <span className="text-lg font-bold text-amber-600">{currentRound} / {targetRounds}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Turn:</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            gameState === 'showing' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
            gameState === 'player_turn' ? 'bg-emerald-100 text-emerald-800' :
            gameState === 'round_success' ? 'bg-teal-100 text-teal-800' :
            gameState === 'mistake' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {gameState === 'showing' ? 'Watch & Listen 👂' :
             gameState === 'player_turn' ? 'Your Turn to Tap 👆' :
             gameState === 'round_success' ? 'Splendid! ✨' :
             gameState === 'mistake' ? 'Try Again 🔄' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          Chime Sequence Recall
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {gameState === 'intro' 
            ? `Watch the illuminated chime pads, then repeat their pattern in order.`
            : gameState === 'showing' 
            ? `Watch carefully as the pads light up in sequence...`
            : `Tap the pads in the same sequence you just saw!`}
        </p>
      </div>

      {gameState === 'intro' ? (
        <div className="flex flex-col items-center py-10">
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 mb-6 text-center max-w-md">
            <Volume2 className="w-12 h-12 text-amber-600 mx-auto mb-3" />
            <p className="text-slate-700 text-sm font-medium">
              This exercise exercises your short-term temporal memory and psychomotor speed.
            </p>
          </div>
          <button
            onClick={startNewGame}
            className="flex items-center space-x-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Begin Sequence ({targetRounds} Steps)</span>
          </button>
        </div>
      ) : (
        /* 2x2 Simon Pads */
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm aspect-square my-2">
          {PADS.map(pad => {
            const isActive = activePad === pad.id;
            return (
              <motion.button
                key={pad.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePadClick(pad.id)}
                disabled={gameState !== 'player_turn'}
                className={`rounded-3xl border-4 transition-all duration-150 flex flex-col items-center justify-center cursor-pointer shadow-md ${
                  isActive ? pad.activeColor : `${pad.color} ${pad.borderColor} hover:brightness-110`
                } ${gameState !== 'player_turn' && !isActive ? 'opacity-85' : 'opacity-100'}`}
              >
                <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center text-white font-bold text-base shadow-inner">
                  {pad.id + 1}
                </div>
                <span className="text-white text-xs font-semibold mt-2 tracking-wide uppercase">
                  {pad.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between w-full mt-8 pt-4 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Cancel Exercise
        </button>
        <span className="text-xs text-slate-400">
          Cognitive Domain: <strong>Response Time & Auditory Recall</strong>
        </span>
      </div>
    </div>
  );
};
