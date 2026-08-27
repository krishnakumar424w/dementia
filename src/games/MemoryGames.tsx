import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from './GameRegistry';
import { GAME_DATASETS } from './gameDatasets';
import { Brain, Eye, Sparkles, CheckCircle, AlertCircle, RefreshCw, Trophy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// 1. Memory Card Match (Pairs)
// ==========================================
export const MemoryCardMatchGame: React.FC<GameProps> = ({
  difficulty,
  patientName,
  onComplete,
  onCancel,
}) => {
  const numPairs = Math.min(8, Math.max(3, Math.floor(2 + difficulty * 0.6)));
  const [cards, setCards] = useState<Array<{ id: number; symbol: string; matched: boolean; flipped: boolean }>>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(Date.now());
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const symbols = GAME_DATASETS.recallObjectPool.slice(0, numPairs);
    const deck = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, id) => ({
        id,
        symbol,
        matched: false,
        flipped: false,
      }));
    setCards(deck);
  }, [numPairs]);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);
      const [idx1, idx2] = newSelected;

      if (newCards[idx1].symbol === newCards[idx2].symbol) {
        setTimeout(() => {
          newCards[idx1].matched = true;
          newCards[idx2].matched = true;
          setCards([...newCards]);
          setSelectedIndices([]);
          setIsLocked(false);

          if (newCards.every((c) => c.matched)) {
            const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
            const accuracy = Math.max(0.2, (numPairs / (moves + 1)));
            const score = Math.round(accuracy * 1000);
            onComplete({
              score,
              accuracy: Math.min(1.0, accuracy),
              completionTimeSeconds: elapsed,
              mistakes,
              metrics: { pairsMatched: numPairs, totalMoves: moves + 1 },
            });
          }
        }, 400);
      } else {
        setMistakes((m) => m + 1);
        setTimeout(() => {
          newCards[idx1].flipped = false;
          newCards[idx2].flipped = false;
          setCards([...newCards]);
          setSelectedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Memory Card Match
          </h2>
          <p className="text-xs text-slate-500">Find and match all {numPairs} matching pairs</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-bold">Moves: {moves}</span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md font-bold">Pairs: {cards.filter(c => c.matched).length / 2} / {numPairs}</span>
        </div>
      </div>

      <div className={`grid gap-3 w-full my-4 ${numPairs > 4 ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4'}`}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            id={`card-${idx}`}
            onClick={() => handleCardClick(idx)}
            disabled={card.matched || card.flipped || isLocked}
            className={`h-20 sm:h-24 rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-bold transition-all duration-300 transform cursor-pointer ${
              card.matched
                ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-800 opacity-80 cursor-default'
                : card.flipped
                ? 'bg-blue-50 border-2 border-blue-500 scale-95 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-blue-400 hover:scale-105'
            }`}
          >
            {card.flipped || card.matched ? card.symbol : '❓'}
          </button>
        ))}
      </div>

      <div className="w-full flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 cursor-pointer"
        >
          Exit Drill
        </button>
        <span className="text-xs text-slate-400">Tap cards to reveal & pair</span>
      </div>
    </div>
  );
};

// ==========================================
// 2. Remember the Objects (Study then Pick)
// ==========================================
export const RememberObjectsGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const targetCount = Math.min(6, Math.max(3, Math.floor(2 + difficulty * 0.4)));
  const [phase, setPhase] = useState<'study' | 'recall' | 'result'>('study');
  const [targets, setTargets] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(5);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    const pool = [...GAME_DATASETS.recallObjectPool].sort(() => Math.random() - 0.5);
    const chosenTargets = pool.slice(0, targetCount);
    const distractors = pool.slice(targetCount, targetCount + targetCount + 2);
    const allOptions = [...chosenTargets, ...distractors].sort(() => Math.random() - 0.5);

    setTargets(chosenTargets);
    setOptions(allOptions);
    setCountdown(Math.max(4, 3 + targetCount));
  }, [targetCount]);

  useEffect(() => {
    if (phase === 'study' && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'study' && countdown === 0) {
      setPhase('recall');
      setStartTime(Date.now());
    }
  }, [phase, countdown]);

  const toggleSelect = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleFinish = () => {
    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    let correctCount = 0;
    let falseCount = 0;

    selectedItems.forEach((item) => {
      if (targets.includes(item)) correctCount++;
      else falseCount++;
    });

    const missed = targets.length - correctCount;
    const mistakes = falseCount + missed;
    const accuracy = Math.max(0, (correctCount - falseCount * 0.5) / targets.length);
    const score = Math.round(accuracy * 1000);

    onComplete({
      score,
      accuracy: Math.min(1.0, accuracy),
      completionTimeSeconds: elapsed,
      mistakes,
      metrics: { targetsRemembered: correctCount, falseAlarms: falseCount, totalTargets: targets.length },
    });
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Remember the Objects
          </h2>
          <p className="text-xs text-slate-500">
            {phase === 'study' ? 'Memorize these objects carefully!' : `Select all ${targets.length} objects you saw earlier`}
          </p>
        </div>
        {phase === 'study' && (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-mono font-bold text-sm">
            ⏳ {countdown}s
          </span>
        )}
      </div>

      {phase === 'study' && (
        <div className="w-full flex flex-col items-center py-6">
          <div className="flex flex-wrap gap-4 justify-center my-4">
            {targets.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-50 border-2 border-indigo-200 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-xs"
              >
                {item}
              </motion.div>
            ))}
          </div>
          <p className="text-sm font-semibold text-slate-600 mt-4">Study these items before time runs out!</p>
          <button
            onClick={() => { setPhase('recall'); setStartTime(Date.now()); }}
            className="mt-5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            I am Ready Now
          </button>
        </div>
      )}

      {phase === 'recall' && (
        <div className="w-full flex flex-col items-center">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full my-4">
            {options.map((item, idx) => {
              const isSelected = selectedItems.includes(item);
              return (
                <button
                  key={idx}
                  id={`object-opt-${idx}`}
                  onClick={() => toggleSelect(item)}
                  className={`h-20 sm:h-22 rounded-xl flex items-center justify-center text-4xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 scale-95 shadow-inner'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-mono text-slate-500 font-bold">
              Selected: {selectedItems.length} of {targets.length}
            </span>
            <button
              onClick={handleFinish}
              disabled={selectedItems.length === 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Submit Answer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="w-full flex justify-start pt-2">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. Which Object Disappeared?
// ==========================================
export const WhichDisappearedGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 3 + Math.floor(difficulty * 0.4);
  const [round, setRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<'study' | 'missing'>('study');
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [removedItem, setRemovedItem] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  const startRound = (r: number) => {
    const count = 3 + Math.floor(difficulty * 0.4);
    const pool = [...GAME_DATASETS.recallObjectPool].sort(() => Math.random() - 0.5);
    const selected = pool.slice(0, count);
    const missing = selected[Math.floor(Math.random() * selected.length)];
    const distractors = pool.filter((x) => !selected.includes(x)).slice(0, 3);
    const optList = [missing, ...distractors].sort(() => Math.random() - 0.5);

    setCurrentItems(selected);
    setRemovedItem(missing);
    setOptions(optList);
    setPhase('study');

    setTimeout(() => {
      setPhase('missing');
    }, 2800);
  };

  useEffect(() => {
    startRound(0);
  }, []);

  const handleAnswer = (choice: string) => {
    const isCorrect = choice === removedItem;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (round + 1 >= totalRounds) {
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = newCorrect / totalRounds;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: totalRounds - newCorrect,
        metrics: { rounds: totalRounds, correct: newCorrect },
      });
    } else {
      setRound(round + 1);
      startRound(round + 1);
    }
  };

  const visibleRemaining = currentItems.filter((i) => i !== removedItem);

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            Which Object Disappeared?
          </h2>
          <p className="text-xs text-slate-500">
            {phase === 'study' ? 'Memorize all objects!' : 'One object vanished! Tap the missing one'}
          </p>
        </div>
        <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-md font-mono text-xs font-bold">
          Round {round + 1} / {totalRounds}
        </span>
      </div>

      {phase === 'study' ? (
        <div className="py-6 flex flex-col items-center">
          <div className="flex flex-wrap gap-4 justify-center my-4">
            {currentItems.map((item, idx) => (
              <div
                key={idx}
                className="w-18 h-18 sm:w-20 sm:h-20 bg-purple-50 border-2 border-purple-200 rounded-2xl flex items-center justify-center text-4xl shadow-xs"
              >
                {item}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest mt-3 animate-pulse">
            Memorizing...
          </span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <p className="text-xs font-bold text-slate-500 mb-2">Remaining Objects:</p>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {visibleRemaining.map((item, idx) => (
              <div
                key={idx}
                className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-3xl"
              >
                {item}
              </div>
            ))}
            <div className="w-14 h-14 bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl flex items-center justify-center text-2xl text-amber-600 font-bold">
              ❓
            </div>
          </div>

          <p className="text-sm font-bold text-slate-800 mb-3">Which object disappeared?</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            {options.map((opt, idx) => (
              <button
                key={idx}
                id={`disappear-opt-${idx}`}
                onClick={() => handleAnswer(opt)}
                className="h-16 bg-white hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-500 rounded-xl flex items-center justify-center text-3xl transition-colors cursor-pointer shadow-2xs"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. Remember the Picture (Scene Recall)
// ==========================================
export const RememberPictureGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const [sceneIndex] = useState(() => Math.floor(Math.random() * GAME_DATASETS.rememberPlaceScenes.length));
  const scene = GAME_DATASETS.rememberPlaceScenes[sceneIndex];
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (phase === 'study' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'study' && countdown === 0) {
      setPhase('quiz');
    }
  }, [phase, countdown]);

  const currentQ = scene.questions[qIndex];

  const handleAnswer = (choice: string) => {
    const isCorrect = choice === currentQ.answer;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (qIndex + 1 >= scene.questions.length) {
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = newCorrect / scene.questions.length;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: scene.questions.length - newCorrect,
        metrics: { totalQuestions: scene.questions.length, correctAnswers: newCorrect },
      });
    } else {
      setQIndex(qIndex + 1);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-xl">{scene.icon}</span>
            Remember the Picture
          </h2>
          <p className="text-xs text-slate-500">{scene.name}</p>
        </div>
        {phase === 'study' ? (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-mono font-bold text-sm">
            ⏳ {countdown}s
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md font-mono text-xs font-bold">
            Question {qIndex + 1} / {scene.questions.length}
          </span>
        )}
      </div>

      {phase === 'study' ? (
        <div className="w-full flex flex-col items-center py-4">
          <div className="w-full p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl mb-4">
            <p className="text-base text-slate-800 leading-relaxed font-serif text-center">
              "{scene.description}"
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {scene.details.map((det, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 text-center">
                ✨ {det}
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase('quiz')}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            I am Ready for Questions
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-2">
          <p className="text-base font-bold text-slate-900 mb-4 text-center">
            {currentQ.question}
          </p>
          <div className="flex flex-col gap-2.5 w-full">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                id={`pic-opt-${idx}`}
                onClick={() => handleAnswer(opt)}
                className="p-3.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 text-left transition-colors cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 5. Which One Did You See? (Flash Target Recognition)
// ==========================================
export const WhichOneDidYouSeeGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 4 + Math.floor(difficulty * 0.4);
  const [round, setRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<'flash' | 'choose'>('flash');
  const [target, setTarget] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  const startRound = () => {
    const pool = [...GAME_DATASETS.recallObjectPool].sort(() => Math.random() - 0.5);
    const chosen = pool[0];
    const distractors = pool.slice(1, 4);
    const opts = [chosen, ...distractors].sort(() => Math.random() - 0.5);

    setTarget(chosen);
    setOptions(opts);
    setPhase('flash');

    setTimeout(() => {
      setPhase('choose');
    }, 1200);
  };

  useEffect(() => {
    startRound();
  }, []);

  const handleAnswer = (choice: string) => {
    const isCorrect = choice === target;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (round + 1 >= totalRounds) {
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = newCorrect / totalRounds;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: totalRounds - newCorrect,
        metrics: { totalRounds, correctHits: newCorrect },
      });
    } else {
      setRound(round + 1);
      startRound();
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Which One Did You See?
          </h2>
          <p className="text-xs text-slate-500">Flash memory target detection</p>
        </div>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-mono text-xs font-bold">
          Round {round + 1} / {totalRounds}
        </span>
      </div>

      {phase === 'flash' ? (
        <div className="py-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            className="w-24 h-24 bg-amber-50 border-4 border-amber-300 rounded-3xl flex items-center justify-center text-6xl shadow-md"
          >
            {target}
          </motion.div>
          <span className="text-xs font-bold text-amber-600 mt-4 uppercase tracking-widest">
            Memorize this!
          </span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-4">
          <p className="text-sm font-bold text-slate-800 mb-4">Which object was just flashed?</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            {options.map((opt, idx) => (
              <button
                key={idx}
                id={`flash-opt-${idx}`}
                onClick={() => handleAnswer(opt)}
                className="h-20 bg-slate-50 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 rounded-2xl flex items-center justify-center text-4xl transition-colors cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};
