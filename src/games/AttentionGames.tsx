import React, { useState, useEffect } from 'react';
import { GameProps } from './GameRegistry';
import { GAME_DATASETS } from './gameDatasets';
import { Eye, Target, Sparkles, CheckCircle, Search, HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

// ==========================================
// 1. Find the Different Object (Odd One Out)
// ==========================================
export const FindDifferentGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 4 + Math.floor(difficulty * 0.4);
  const gridSize = difficulty > 5 ? 16 : 9; // 3x3 or 4x4
  const [round, setRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gridItems, setGridItems] = useState<string[]>([]);
  const [oddIndex, setOddIndex] = useState(0);
  const [currentSetDesc, setCurrentSetDesc] = useState('');
  const [startTime] = useState(Date.now());

  const startRound = () => {
    const set = GAME_DATASETS.findDifferentSets[Math.floor(Math.random() * GAME_DATASETS.findDifferentSets.length)];
    const oddIdx = Math.floor(Math.random() * gridSize);
    const items = Array(gridSize).fill(set.normal);
    items[oddIdx] = set.odd;

    setGridItems(items);
    setOddIndex(oddIdx);
    setCurrentSetDesc(set.desc);
  };

  useEffect(() => {
    startRound();
  }, []);

  const handleCellClick = (index: number) => {
    const isCorrect = index === oddIndex;
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
      startRound();
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600" />
            Find the Different Object
          </h2>
          <p className="text-xs text-slate-500">{currentSetDesc}</p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-mono text-xs font-bold">
          Round {round + 1} / {totalRounds}
        </span>
      </div>

      <p className="text-xs text-slate-500 font-semibold mb-3">Tap the one object that is different from all the others:</p>

      <div className={`grid gap-2.5 my-3 ${gridSize === 16 ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {gridItems.map((item, idx) => (
          <button
            key={idx}
            id={`find-diff-${idx}`}
            onClick={() => handleCellClick(idx)}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-transform hover:scale-105 cursor-pointer shadow-2xs"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="w-full flex justify-between items-center pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. Same or Different? (Pair Discrimination)
// ==========================================
export const SameOrDifferentGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 5 + Math.floor(difficulty * 0.4);
  const [round, setRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentPair, setCurrentPair] = useState(GAME_DATASETS.sameOrDifferentData[0]);
  const [startTime] = useState(Date.now());

  const startRound = () => {
    const pair = GAME_DATASETS.sameOrDifferentData[Math.floor(Math.random() * GAME_DATASETS.sameOrDifferentData.length)];
    setCurrentPair(pair);
  };

  useEffect(() => {
    startRound();
  }, []);

  const handleChoice = (userSaysSame: boolean) => {
    const isCorrect = userSaysSame === currentPair.isSame;
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
        metrics: { totalRounds, correct: newCorrect },
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
            <Eye className="w-5 h-5 text-teal-600" />
            Same or Different?
          </h2>
          <p className="text-xs text-slate-500">Are these two objects identical or different?</p>
        </div>
        <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-md font-mono text-xs font-bold">
          Round {round + 1} / {totalRounds}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6 my-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 border-2 border-slate-200 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl shadow-xs">
          {currentPair.item1}
        </div>
        <span className="text-slate-300 font-bold text-xl">vs</span>
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 border-2 border-slate-200 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl shadow-xs">
          {currentPair.item2}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full my-2">
        <button
          onClick={() => handleChoice(true)}
          className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <CheckCircle className="w-5 h-5" />
          <span>SAME</span>
        </button>
        <button
          onClick={() => handleChoice(false)}
          className="py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <HelpCircle className="w-5 h-5" />
          <span>DIFFERENT</span>
        </button>
      </div>

      <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. Remember the Colors (Color Sequence Flash)
// ==========================================
export const RememberColorsGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const sequenceLength = Math.min(6, Math.max(3, 2 + Math.floor(difficulty * 0.4)));
  const [phase, setPhase] = useState<'showing' | 'recall'>('showing');
  const [sequence, setSequence] = useState<typeof GAME_DATASETS.colorSequences>([]);
  const [activeFlashIndex, setActiveFlashIndex] = useState<number>(-1);
  const [userInput, setUserInput] = useState<typeof GAME_DATASETS.colorSequences>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const colors = [...GAME_DATASETS.colorSequences].sort(() => Math.random() - 0.5);
    const seq = colors.slice(0, sequenceLength);
    setSequence(seq);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < seq.length) {
        setActiveFlashIndex(idx);
        idx++;
      } else {
        clearInterval(interval);
        setActiveFlashIndex(-1);
        setTimeout(() => setPhase('recall'), 600);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [sequenceLength]);

  const handleColorClick = (color: (typeof GAME_DATASETS.colorSequences)[0]) => {
    const newInput = [...userInput, color];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      let correct = 0;
      newInput.forEach((c, idx) => {
        if (c.name === sequence[idx].name) correct++;
      });

      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = correct / sequence.length;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: sequence.length - correct,
        metrics: { sequenceLength, correctColors: correct },
      });
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Remember the Colors
          </h2>
          <p className="text-xs text-slate-500">
            {phase === 'showing' ? 'Watch the sequence of colors carefully!' : 'Tap the colors in the exact order shown'}
          </p>
        </div>
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-md font-mono text-xs font-bold">
          Length: {sequenceLength}
        </span>
      </div>

      {phase === 'showing' ? (
        <div className="py-12 flex flex-col items-center">
          <div className="flex gap-3 justify-center mb-6">
            {sequence.map((col, idx) => (
              <div
                key={idx}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all duration-300 border-2 ${
                  activeFlashIndex === idx
                    ? `${col.bgClass} scale-110 shadow-lg border-white ring-4 ring-indigo-300`
                    : 'bg-slate-100 border-slate-300 opacity-40'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest animate-pulse">
            Flashing Sequence...
          </span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-4">
          <div className="flex gap-2 justify-center mb-6 min-h-12">
            {userInput.map((col, idx) => (
              <div key={idx} className={`w-10 h-10 rounded-xl ${col.bgClass} shadow-2xs flex items-center justify-center text-white text-xs font-bold`}>
                {idx + 1}
              </div>
            ))}
            {Array(sequence.length - userInput.length).fill(0).map((_, idx) => (
              <div key={idx} className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300" />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            {GAME_DATASETS.colorSequences.map((col, idx) => (
              <button
                key={idx}
                id={`color-opt-${idx}`}
                onClick={() => handleColorClick(col)}
                className={`h-16 rounded-xl ${col.bgClass} text-white font-bold text-sm shadow-xs transition-transform hover:scale-105 cursor-pointer flex flex-col items-center justify-center gap-0.5`}
              >
                <span>{col.name}</span>
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
// 4. Object Spotting (Find Hidden Targets)
// ==========================================
export const ObjectSpottingGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const targetItem = '🔑';
  const totalItems = 16 + Math.floor(difficulty * 1.5);
  const targetCount = 3 + Math.floor(difficulty * 0.4);
  const [board, setBoard] = useState<Array<{ id: number; symbol: string; found: boolean }>>([]);
  const [foundCount, setFoundCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const distractors = ['🍎', '☕', '📚', '⏰', '🥄', '🔔', '✂️', '🖊️', '👟', '🎩', '👓'];
    const items: Array<{ id: number; symbol: string; found: boolean }> = [];

    for (let i = 0; i < targetCount; i++) {
      items.push({ id: i, symbol: targetItem, found: false });
    }
    for (let i = targetCount; i < totalItems; i++) {
      const dist = distractors[Math.floor(Math.random() * distractors.length)];
      items.push({ id: i, symbol: dist, found: false });
    }

    setBoard(items.sort(() => Math.random() - 0.5));
  }, [totalItems, targetCount]);

  const handleItemClick = (id: number, symbol: string) => {
    if (symbol === targetItem) {
      const newBoard = board.map((item) => (item.id === id ? { ...item, found: true } : item));
      setBoard(newBoard);
      const newFound = foundCount + 1;
      setFoundCount(newFound);

      if (newFound >= targetCount) {
        const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        const accuracy = targetCount / (targetCount + mistakes);
        const score = Math.round(accuracy * 1000);
        onComplete({
          score,
          accuracy,
          completionTimeSeconds: elapsed,
          mistakes,
          metrics: { totalTargets: targetCount, mistakes },
        });
      }
    } else {
      setMistakes((m) => m + 1);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            Object Spotting
          </h2>
          <p className="text-xs text-slate-500">Spot all {targetCount} hidden keys ({targetItem})</p>
        </div>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-mono text-xs font-bold">
          Found: {foundCount} / {targetCount}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 w-full my-3">
        {board.map((item) => (
          <button
            key={item.id}
            id={`spot-${item.id}`}
            onClick={() => handleItemClick(item.id, item.symbol)}
            disabled={item.found}
            className={`h-16 sm:h-18 rounded-xl flex items-center justify-center text-3xl transition-all cursor-pointer ${
              item.found
                ? 'bg-emerald-100 border-2 border-emerald-500 scale-95 opacity-80'
                : 'bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 hover:scale-105'
            }`}
          >
            {item.found ? '✅' : item.symbol}
          </button>
        ))}
      </div>

      <div className="w-full flex justify-between items-center pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
        <span className="text-xs text-slate-400 font-mono">Mistakes: {mistakes}</span>
      </div>
    </div>
  );
};

// ==========================================
// 5. Simple Visual Search (Speed Symbol Scan)
// ==========================================
export const VisualSearchGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 5;
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState('⭐');
  const [grid, setGrid] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  const startRound = () => {
    const symbols = ['⭐', '🌸', '🍎', '🚗', '☕', '🔔', '🔑', '📱'];
    const chosenTarget = symbols[Math.floor(Math.random() * symbols.length)];
    const distractors = symbols.filter((s) => s !== chosenTarget);

    const cells = Array(15).fill(null).map(() => distractors[Math.floor(Math.random() * distractors.length)]);
    const targetPos = Math.floor(Math.random() * 16);
    cells.splice(targetPos, 0, chosenTarget);

    setTarget(chosenTarget);
    setGrid(cells);
  };

  useEffect(() => {
    startRound();
  }, []);

  const handleCellClick = (symbol: string) => {
    const isCorrect = symbol === target;
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
      startRound();
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Simple Visual Search
          </h2>
          <p className="text-xs text-slate-500">Quickly find and tap the target symbol: <span className="text-base font-bold">{target}</span></p>
        </div>
        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md font-mono text-xs font-bold">
          Round {round + 1} / {totalRounds}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 w-full my-3">
        {grid.map((sym, idx) => (
          <button
            key={idx}
            id={`vis-search-${idx}`}
            onClick={() => handleCellClick(sym)}
            className="h-16 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-xl flex items-center justify-center text-3xl transition-transform hover:scale-105 cursor-pointer shadow-2xs"
          >
            {sym}
          </button>
        ))}
      </div>

      <div className="w-full flex justify-between items-center pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};
