import React, { useState, useEffect } from 'react';
import { GameProps } from './GameRegistry';
import { sounds } from '../services/audio';
import { 
  Star, Heart, Circle, Square, Triangle, Shield, 
  Sparkles, CheckCircle, Crosshair 
} from 'lucide-react';
import { motion } from 'motion/react';

interface GridItem {
  id: number;
  isTarget: boolean;
  shapeIndex: number;
  isFound: boolean;
  isMistake: boolean;
}

const SHAPES = [
  { icon: Star, label: 'Golden Star', color: 'text-amber-500 bg-amber-50' },
  { icon: Heart, label: 'Red Heart', color: 'text-rose-500 bg-rose-50' },
  { icon: Circle, label: 'Blue Circle', color: 'text-blue-500 bg-blue-50' },
  { icon: Square, label: 'Green Square', color: 'text-emerald-500 bg-emerald-50' },
  { icon: Triangle, label: 'Purple Triangle', color: 'text-purple-500 bg-purple-50' },
  { icon: Shield, label: 'Teal Shield', color: 'text-teal-500 bg-teal-50' },
];

export const ConcentrationGame: React.FC<GameProps> = ({
  difficulty,
  patientName,
  onComplete,
  onCancel,
}) => {
  // Target shape is chosen randomly
  const [targetShapeIndex] = useState<number>(() => Math.floor(Math.random() * SHAPES.length));
  const targetShape = SHAPES[targetShapeIndex];
  const TargetIcon = targetShape.icon;

  // Grid size: 12 or 16 items depending on difficulty
  const totalItems = difficulty >= 5 ? 16 : 12;
  const targetCount = Math.min(Math.max(Math.floor(difficulty / 2) + 3, 3), 6);

  const [grid, setGrid] = useState<GridItem[]>([]);
  const [foundCount, setFoundCount] = useState<number>(0);
  const [falseAlarms, setFalseAlarms] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Setup grid items
  useEffect(() => {
    const items: GridItem[] = [];
    const targetIndices = new Set<number>();

    while (targetIndices.size < targetCount) {
      targetIndices.add(Math.floor(Math.random() * totalItems));
    }

    for (let i = 0; i < totalItems; i++) {
      if (targetIndices.has(i)) {
        items.push({
          id: i,
          isTarget: true,
          shapeIndex: targetShapeIndex,
          isFound: false,
          isMistake: false,
        });
      } else {
        // Distractor shape
        let distractorIdx = Math.floor(Math.random() * SHAPES.length);
        while (distractorIdx === targetShapeIndex) {
          distractorIdx = Math.floor(Math.random() * SHAPES.length);
        }
        items.push({
          id: i,
          isTarget: false,
          shapeIndex: distractorIdx,
          isFound: false,
          isMistake: false,
        });
      }
    }

    setGrid(items);
  }, [totalItems, targetCount, targetShapeIndex]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleItemClick = (index: number) => {
    const item = grid[index];
    if (item.isFound || item.isMistake) return;

    if (item.isTarget) {
      sounds.playMatchSuccess();
      const newGrid = [...grid];
      newGrid[index].isFound = true;
      setGrid(newGrid);

      const nextFound = foundCount + 1;
      setFoundCount(nextFound);

      if (nextFound === targetCount) {
        handleVictory(falseAlarms);
      }
    } else {
      sounds.playError();
      const newGrid = [...grid];
      newGrid[index].isMistake = true;
      setGrid(newGrid);
      setFalseAlarms(prev => prev + 1);

      setTimeout(() => {
        setGrid(prev => {
          const resetGrid = [...prev];
          if (resetGrid[index]) resetGrid[index].isMistake = false;
          return resetGrid;
        });
      }, 700);
    }
  };

  const handleVictory = (finalFalseAlarms: number) => {
    sounds.playFanfare();
    const duration = Math.max((Date.now() - startTime) / 1000, 4);
    const accuracy = Math.max(0.4, Math.min(1.0, targetCount / (targetCount + finalFalseAlarms)));

    onComplete({
      accuracy: Math.round(accuracy * 100) / 100,
      completionTimeSeconds: Math.round(duration * 10) / 10,
      mistakes: finalFalseAlarms,
      score: Math.round(accuracy * 100),
      metrics: {
        targetCount,
        distractorCount: totalItems - targetCount,
        correctHits: targetCount,
        falseAlarms: finalFalseAlarms,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 select-none">
      {/* Target Mission Card */}
      <div className="w-full bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-2xl border-2 border-teal-300 shadow-sm ${targetShape.color}`}>
            <TargetIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-bold text-teal-800 uppercase tracking-wider">Mission Target</div>
            <h4 className="text-lg font-bold text-slate-800">
              Find all <span className="text-teal-700">{targetShape.label}s</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-teal-100 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Found</span>
            <span className="text-lg font-extrabold text-teal-700">{foundCount} / {targetCount}</span>
          </div>
          <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-teal-100 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Time</span>
            <span className="text-lg font-extrabold font-mono text-slate-800">{elapsedSeconds}s</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-5">
        <p className="text-sm text-slate-600">
          Scan the grid below and tap every <strong>{targetShape.label}</strong>. Filter out the other shapes!
        </p>
      </div>

      {/* Grid of Items */}
      <div className={`grid gap-3 sm:gap-4 w-full ${totalItems === 16 ? 'grid-cols-4 max-w-lg' : 'grid-cols-4 sm:grid-cols-4 max-w-md'}`}>
        {grid.map((item, index) => {
          const shape = SHAPES[item.shapeIndex];
          const IconComp = shape.icon;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleItemClick(index)}
              disabled={item.isFound}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border-2 shadow-xs relative cursor-pointer ${
                item.isFound
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 opacity-90'
                  : item.isMistake
                  ? 'bg-rose-100 border-rose-400 animate-shake'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${shape.color}`}>
                <IconComp className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              {item.isFound && (
                <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                  <CheckCircle className="w-4 h-4 fill-emerald-500 text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between w-full mt-8 pt-4 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Cancel Exercise
        </button>
        <span className="text-xs text-slate-400">
          Cognitive Domain: <strong>Selective Attention & Inhibitory Control</strong>
        </span>
      </div>
    </div>
  );
};
