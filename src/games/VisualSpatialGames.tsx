import React, { useState, useEffect } from 'react';
import { GameProps } from './GameRegistry';
import { GAME_DATASETS } from './gameDatasets';
import { Grid, Sparkles, Shapes, Palette, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

// ==========================================
// 1. Remember the Location (Grid Coordinate Memory)
// ==========================================
export const RememberLocationGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const gridSize = 9; // 3x3 grid
  const itemsCount = Math.min(4, Math.max(2, Math.floor(1 + difficulty * 0.4)));
  const [phase, setPhase] = useState<'study' | 'place'>('study');
  const [itemPlacements, setItemPlacements] = useState<Array<{ pos: number; emoji: string }>>([]);
  const [userPlacements, setUserPlacements] = useState<Record<number, string>>({});
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    const pool = [...GAME_DATASETS.recallObjectPool].sort(() => Math.random() - 0.5);
    const chosenEmojis = pool.slice(0, itemsCount);

    const positions: number[] = [];
    while (positions.length < itemsCount) {
      const p = Math.floor(Math.random() * gridSize);
      if (!positions.includes(p)) positions.push(p);
    }

    const placements = chosenEmojis.map((emoji, idx) => ({
      pos: positions[idx],
      emoji,
    }));

    setItemPlacements(placements);
    setSelectedEmoji(chosenEmojis[0]);
    setCountdown(3 + itemsCount);
  }, [itemsCount]);

  useEffect(() => {
    if (phase === 'study' && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'study' && countdown === 0) {
      setPhase('place');
      setStartTime(Date.now());
    }
  }, [phase, countdown]);

  const handleCellClick = (cellIndex: number) => {
    if (!selectedEmoji) return;
    setUserPlacements({
      ...userPlacements,
      [cellIndex]: selectedEmoji,
    });
  };

  const handleFinish = () => {
    let correct = 0;
    itemPlacements.forEach((ip) => {
      if (userPlacements[ip.pos] === ip.emoji) correct++;
    });

    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const accuracy = correct / itemPlacements.length;
    const score = Math.round(accuracy * 1000);

    onComplete({
      score,
      accuracy,
      completionTimeSeconds: elapsed,
      mistakes: itemPlacements.length - correct,
      metrics: { totalItems: itemPlacements.length, correctlyPlaced: correct },
    });
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-600" />
            Remember the Location
          </h2>
          <p className="text-xs text-slate-500">
            {phase === 'study' ? 'Memorize where each item is on the grid!' : 'Place the items back into their exact squares'}
          </p>
        </div>
        {phase === 'study' ? (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-mono font-bold text-sm">
            ⏳ {countdown}s
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-md font-mono text-xs font-bold">
            {Object.keys(userPlacements).length} / {itemPlacements.length} Placed
          </span>
        )}
      </div>

      {phase === 'study' ? (
        <div className="w-full flex flex-col items-center py-4">
          <div className="grid grid-cols-3 gap-3 my-2">
            {Array(gridSize).fill(0).map((_, idx) => {
              const item = itemPlacements.find((p) => p.pos === idx);
              return (
                <div
                  key={idx}
                  className="w-20 h-20 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-4xl shadow-2xs"
                >
                  {item ? item.emoji : ''}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => { setPhase('place'); setStartTime(Date.now()); }}
            className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            I Remember the Locations
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-2">
          {/* Emoji selector bar */}
          <div className="flex gap-3 justify-center mb-4">
            {itemPlacements.map((ip, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedEmoji(ip.emoji)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all cursor-pointer ${
                  selectedEmoji === ip.emoji
                    ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-200 scale-105'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                {ip.emoji}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 my-2">
            {Array(gridSize).fill(0).map((_, idx) => (
              <button
                key={idx}
                id={`loc-grid-${idx}`}
                onClick={() => handleCellClick(idx)}
                className="w-20 h-20 bg-slate-50 hover:bg-indigo-50/50 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl flex items-center justify-center text-4xl cursor-pointer"
              >
                {userPlacements[idx] || ''}
              </button>
            ))}
          </div>

          <div className="w-full flex justify-between items-center pt-3 border-t border-slate-100 mt-4">
            <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleFinish}
              disabled={Object.keys(userPlacements).length === 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Submit Placements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {phase === 'study' && (
        <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-4">
          <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. Color & Shape Matching (Conjunctive Feature Match)
// ==========================================
export const ColorShapeMatchingGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 5;
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState({ shape: '🔺', colorName: 'Red', colorBg: 'bg-red-500', colorHex: '#ef4444' });
  const [options, setOptions] = useState<Array<{ id: number; shape: string; colorBg: string; isCorrect: boolean }>>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  const shapes = ['🔺', '⭐', '⚪', '⬛', '❤️'];
  const colors = [
    { name: 'Red', bg: 'bg-red-500', hex: '#ef4444' },
    { name: 'Blue', bg: 'bg-blue-500', hex: '#3b82f6' },
    { name: 'Green', bg: 'bg-emerald-500', hex: '#10b981' },
    { name: 'Yellow', bg: 'bg-amber-400', hex: '#f59e0b' },
  ];

  const startRound = () => {
    const chosenShape = shapes[Math.floor(Math.random() * shapes.length)];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    const currentTarget = { shape: chosenShape, colorName: chosenColor.name, colorBg: chosenColor.bg, colorHex: chosenColor.hex };
    setTarget(currentTarget);

    const correctOpt = { id: 0, shape: chosenShape, colorBg: chosenColor.bg, isCorrect: true };
    const distractors = [
      { id: 1, shape: shapes.find(s => s !== chosenShape) || '⭐', colorBg: chosenColor.bg, isCorrect: false },
      { id: 2, shape: chosenShape, colorBg: colors.find(c => c.name !== chosenColor.name)?.bg || 'bg-blue-500', isCorrect: false },
      { id: 3, shape: shapes.find(s => s !== chosenShape) || '⚪', colorBg: colors.find(c => c.name !== chosenColor.name)?.bg || 'bg-emerald-500', isCorrect: false },
    ];

    setOptions([correctOpt, ...distractors].sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    startRound();
  }, []);

  const handleChoice = (isCorrect: boolean) => {
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
            <Shapes className="w-5 h-5 text-purple-600" />
            Color & Shape Matching
          </h2>
          <p className="text-xs text-slate-500">Match both color and geometric shape</p>
        </div>
        <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-md font-mono text-xs font-bold">
          Round {round + 1} / {totalRounds}
        </span>
      </div>

      <div className="flex flex-col items-center my-6">
        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Target Goal</span>
        <div className={`w-24 h-24 rounded-3xl ${target.colorBg} flex items-center justify-center text-5xl shadow-md border-4 border-white ring-2 ring-slate-200`}>
          {target.shape}
        </div>
        <p className="text-xs font-bold text-slate-700 mt-2">Find the matching {target.colorName} item</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full my-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            id={`color-shape-${idx}`}
            onClick={() => handleChoice(opt.isCorrect)}
            className={`h-20 rounded-2xl ${opt.colorBg} flex items-center justify-center text-4xl border-2 border-white shadow-2xs transition-transform hover:scale-105 cursor-pointer`}
          >
            {opt.shape}
          </button>
        ))}
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
// 3. Shape Matching (Silhouette / Contour Matching)
// ==========================================
export const ShapeMatchingGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 5;
  const [round, setRound] = useState(0);
  const [targetShape, setTargetShape] = useState(GAME_DATASETS.shapeMatchingList[0]);
  const [options, setOptions] = useState<typeof GAME_DATASETS.shapeMatchingList>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  const startRound = () => {
    const list = [...GAME_DATASETS.shapeMatchingList].sort(() => Math.random() - 0.5);
    const chosen = list[0];
    setTargetShape(chosen);
    setOptions(list.slice(0, 4).sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    startRound();
  }, []);

  const handleChoice = (shapeItem: typeof GAME_DATASETS.shapeMatchingList[0]) => {
    const isCorrect = shapeItem.name === targetShape.name;
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
            <Shapes className="w-5 h-5 text-blue-600" />
            Shape Matching
          </h2>
          <p className="text-xs text-slate-500">Geometric shape identification</p>
        </div>
        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md font-mono text-xs font-bold">
          Round {round + 1} / {totalRounds}
        </span>
      </div>

      <div className="flex flex-col items-center my-6">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Target Shape</span>
        <div className="w-24 h-24 bg-blue-50 border-2 border-blue-200 rounded-3xl flex items-center justify-center text-5xl shadow-xs">
          {targetShape.emoji}
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 mt-2">{targetShape.name}</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full my-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            id={`shape-opt-${idx}`}
            onClick={() => handleChoice(opt)}
            className="p-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 border border-slate-200 rounded-xl flex items-center justify-center gap-3 text-base font-bold text-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <span className="text-3xl">{opt.emoji}</span>
            <span>{opt.name}</span>
          </button>
        ))}
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
// 4. Color Matching (Hue & Palette Discrimination)
// ==========================================
export const ColorMatchingGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 5;
  const [round, setRound] = useState(0);
  const [targetColor, setTargetColor] = useState(GAME_DATASETS.colorMatchingList[0]);
  const [options, setOptions] = useState<typeof GAME_DATASETS.colorMatchingList>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  const startRound = () => {
    const list = [...GAME_DATASETS.colorMatchingList].sort(() => Math.random() - 0.5);
    const chosen = list[0];
    setTargetColor(chosen);
    setOptions(list.slice(0, 4).sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    startRound();
  }, []);

  const handleChoice = (colorItem: typeof GAME_DATASETS.colorMatchingList[0]) => {
    const isCorrect = colorItem.name === targetColor.name;
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
            <Palette className="w-5 h-5 text-emerald-600" />
            Color Matching
          </h2>
          <p className="text-xs text-slate-500">Hue and shade comparison</p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-mono text-xs font-bold">
          Round {round + 1} / {totalRounds}
        </span>
      </div>

      <div className="flex flex-col items-center my-6">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Target Color</span>
        <div className={`w-24 h-24 ${targetColor.bgClass} rounded-3xl shadow-md border-4 border-white ring-2 ring-slate-200`} />
        <h3 className="text-lg font-extrabold text-slate-900 mt-2">{targetColor.name}</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full my-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            id={`color-match-${idx}`}
            onClick={() => handleChoice(opt)}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 transition-colors cursor-pointer shadow-2xs"
          >
            <div className={`w-8 h-8 rounded-full ${opt.bgClass} shadow-xs shrink-0`} />
            <span className="text-sm font-bold text-slate-800">{opt.name}</span>
          </button>
        ))}
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
// 5. Visual Memory Grid (Illuminated Matrix Recall)
// ==========================================
export const VisualMemoryGridGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const gridSize = 9; // 3x3 matrix
  const illuminatedCount = Math.min(5, Math.max(3, 2 + Math.floor(difficulty * 0.4)));
  const [phase, setPhase] = useState<'showing' | 'recall'>('showing');
  const [targetCells, setTargetCells] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    const cells: number[] = [];
    while (cells.length < illuminatedCount) {
      const c = Math.floor(Math.random() * gridSize);
      if (!cells.includes(c)) cells.push(c);
    }
    setTargetCells(cells);
    setCountdown(3);
  }, [illuminatedCount]);

  useEffect(() => {
    if (phase === 'showing' && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'showing' && countdown === 0) {
      setPhase('recall');
      setStartTime(Date.now());
    }
  }, [phase, countdown]);

  const handleCellClick = (cellIndex: number) => {
    if (selectedCells.includes(cellIndex)) {
      setSelectedCells(selectedCells.filter((c) => c !== cellIndex));
    } else {
      setSelectedCells([...selectedCells, cellIndex]);
    }
  };

  const handleFinish = () => {
    let correct = 0;
    let falseHits = 0;

    selectedCells.forEach((c) => {
      if (targetCells.includes(c)) correct++;
      else falseHits++;
    });

    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const accuracy = Math.max(0, (correct - falseHits * 0.5) / targetCells.length);
    const score = Math.round(accuracy * 1000);

    onComplete({
      score,
      accuracy: Math.min(1.0, accuracy),
      completionTimeSeconds: elapsed,
      mistakes: (targetCells.length - correct) + falseHits,
      metrics: { illuminatedCount, correctCells: correct, falseHits },
    });
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Grid className="w-5 h-5 text-blue-600" />
            Visual Memory Grid
          </h2>
          <p className="text-xs text-slate-500">
            {phase === 'showing' ? 'Remember the glowing blue tiles!' : `Select all ${targetCells.length} tiles that were lit`}
          </p>
        </div>
        {phase === 'showing' && (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-mono font-bold text-sm">
            ⏳ {countdown}s
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 my-6">
        {Array(gridSize).fill(0).map((_, idx) => {
          const isTarget = targetCells.includes(idx);
          const isSelected = selectedCells.includes(idx);

          if (phase === 'showing') {
            return (
              <div
                key={idx}
                className={`w-20 h-20 rounded-2xl transition-all duration-300 ${
                  isTarget
                    ? 'bg-blue-500 border-2 border-blue-600 shadow-md ring-4 ring-blue-200'
                    : 'bg-slate-100 border border-slate-200'
                }`}
              />
            );
          } else {
            return (
              <button
                key={idx}
                id={`grid-cell-${idx}`}
                onClick={() => handleCellClick(idx)}
                className={`w-20 h-20 rounded-2xl transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-blue-500 border-blue-600 shadow-md scale-95'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              />
            );
          }
        })}
      </div>

      {phase === 'recall' && (
        <div className="w-full flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
          <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleFinish}
            disabled={selectedCells.length === 0}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Submit Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {phase === 'showing' && (
        <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-2">
          <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
