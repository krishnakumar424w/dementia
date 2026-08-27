import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from './GameRegistry';
import { sounds } from '../services/audio';
import { 
  Sun, Heart, Coffee, Anchor, Music, Compass, 
  Sparkles, Camera, Bell, Feather, Flower2, TreePine 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CardItem {
  id: number;
  iconIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const ICON_LIST = [
  { icon: Sun, label: 'Sun', color: 'text-amber-500 bg-amber-50' },
  { icon: Heart, label: 'Heart', color: 'text-rose-500 bg-rose-50' },
  { icon: Coffee, label: 'Teacup', color: 'text-amber-700 bg-amber-50' },
  { icon: Anchor, label: 'Anchor', color: 'text-blue-600 bg-blue-50' },
  { icon: Music, label: 'Music', color: 'text-purple-600 bg-purple-50' },
  { icon: Compass, label: 'Compass', color: 'text-emerald-600 bg-emerald-50' },
  { icon: Sparkles, label: 'Star', color: 'text-yellow-500 bg-yellow-50' },
  { icon: Camera, label: 'Camera', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Bell, label: 'Bell', color: 'text-orange-500 bg-orange-50' },
  { icon: Feather, label: 'Feather', color: 'text-teal-600 bg-teal-50' },
  { icon: Flower2, label: 'Flower', color: 'text-pink-500 bg-pink-50' },
  { icon: TreePine, label: 'Tree', color: 'text-green-700 bg-green-50' },
];

export const MemoryTrainingGame: React.FC<GameProps> = ({
  difficulty,
  patientName,
  onComplete,
  onCancel,
}) => {
  // Determine pair count based on difficulty (3 to 6 pairs)
  const pairCount = Math.min(Math.max(Math.floor(difficulty / 2) + 3, 3), 6);
  
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [flipsCount, setFlipsCount] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const flipTimesRef = useRef<number[]>([]);

  // Initialize deck
  useEffect(() => {
    const selectedIcons = ICON_LIST.slice(0, pairCount);
    const deck: CardItem[] = [];
    
    selectedIcons.forEach((_, idx) => {
      deck.push({ id: idx * 2, iconIndex: idx, isFlipped: false, isMatched: false });
      deck.push({ id: idx * 2 + 1, iconIndex: idx, isFlipped: false, isMatched: false });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
  }, [pairCount]);

  // Timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleCardClick = (index: number) => {
    if (isProcessing) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    sounds.playCardFlip();
    flipTimesRef.current.push(Date.now());
    setFlipsCount(prev => prev + 1);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [idx1, idx2] = newFlipped;
      const card1 = newCards[idx1];
      const card2 = newCards[idx2];

      if (card1.iconIndex === card2.iconIndex) {
        // MATCH!
        sounds.playMatchSuccess();
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[idx1].isMatched = true;
            updated[idx2].isMatched = true;
            return updated;
          });
          setFlippedIndices([]);
          setIsProcessing(false);

          const nextMatched = matchedPairs + 1;
          setMatchedPairs(nextMatched);

          if (nextMatched === pairCount) {
            handleVictory(mistakes, flipsCount + 1);
          }
        }, 500);
      } else {
        // MISMATCH
        sounds.playError();
        setMistakes(prev => prev + 1);
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[idx1].isFlipped = false;
            updated[idx2].isFlipped = false;
            return updated;
          });
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 1100);
      }
    }
  };

  const handleVictory = (finalMistakes: number, totalFlips: number) => {
    sounds.playFanfare();
    const duration = Math.max((Date.now() - startTime) / 1000, 5);
    const totalAttempts = totalFlips / 2;
    const accuracy = Math.max(0.4, Math.min(1.0, pairCount / (totalAttempts || pairCount)));

    // Calculate average flip interval
    let avgFlipDelayMs = 1200;
    if (flipTimesRef.current.length > 1) {
      let sum = 0;
      for (let i = 1; i < flipTimesRef.current.length; i++) {
        sum += flipTimesRef.current[i] - flipTimesRef.current[i - 1];
      }
      avgFlipDelayMs = Math.round(sum / (flipTimesRef.current.length - 1));
    }

    onComplete({
      accuracy: Math.round(accuracy * 100) / 100,
      completionTimeSeconds: Math.round(duration * 10) / 10,
      mistakes: finalMistakes,
      score: Math.round(accuracy * 100),
      metrics: {
        totalPairs: pairCount,
        cardsMatched: pairCount,
        flipsCount: totalFlips,
        averageFlipDelayMs: avgFlipDelayMs,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 select-none">
      {/* Top Header stats */}
      <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pairs Found:</span>
          <span className="text-lg font-bold text-teal-700">{matchedPairs} / {pairCount}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time:</span>
          <span className="text-lg font-bold font-mono text-slate-800">{elapsedSeconds}s</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Difficulty:</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Lvl {difficulty}</span>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          Find matching symbol pairs, {patientName ? patientName.split(' ')[0] : 'Arthur'}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Tap two cards at a time to reveal their symbols. Take all the time you need!
        </p>
      </div>

      {/* Grid of Cards */}
      <div
        className={`grid gap-3 sm:gap-4 w-full ${
          pairCount <= 4 ? 'grid-cols-4 max-w-lg' : pairCount === 5 ? 'grid-cols-5 max-w-xl' : 'grid-cols-4 sm:grid-cols-4 max-w-xl'
        }`}
      >
        {cards.map((card, index) => {
          const iconMeta = ICON_LIST[card.iconIndex];
          const IconComp = iconMeta.icon;
          const isRevealed = card.isFlipped || card.isMatched;

          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleCardClick(index)}
              disabled={isRevealed || isProcessing}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-2 shadow-sm ${
                card.isMatched
                  ? 'bg-emerald-50 border-emerald-300 opacity-90'
                  : card.isFlipped
                  ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-200'
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-slate-300 cursor-pointer'
              }`}
            >
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className={`p-2 sm:p-3 rounded-xl ${iconMeta.color}`}>
                      <IconComp className="w-7 h-7 sm:w-9 sm:h-9" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 mt-1">
                      {iconMeta.label}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center w-full h-full"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-300/60 border border-slate-400/40 flex items-center justify-center text-slate-500 font-bold text-sm">
                      ?
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Gentle helper button */}
      <div className="flex items-center justify-between w-full mt-8 pt-4 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Cancel Exercise
        </button>
        <span className="text-xs text-slate-400">
          Cognitive Domain: <strong>Memory & Recall</strong>
        </span>
      </div>
    </div>
  );
};
