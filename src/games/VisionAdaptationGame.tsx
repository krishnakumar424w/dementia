import React, { useState, useEffect } from 'react';
import { GameProps } from './GameRegistry';
import { sounds } from '../services/audio';
import { Eye, Sun, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface VisualTile {
  id: number;
  isOddOne: boolean;
  color: string;
}

export const VisionAdaptationGame: React.FC<GameProps> = ({
  difficulty,
  patientName,
  onComplete,
  onCancel,
}) => {
  // Rounds: 3 to 6 rounds based on difficulty
  const targetRounds = Math.min(Math.max(Math.floor(difficulty / 2) + 3, 3), 6);

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [gridSize, setGridSize] = useState<number>(3); // 3x3 = 9 tiles
  const [tiles, setTiles] = useState<VisualTile[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Generate color palette with subtle contrast delta based on round & difficulty
  useEffect(() => {
    const totalTiles = gridSize * gridSize;
    const oddIndex = Math.floor(Math.random() * totalTiles);

    // Pick random base hue
    const hues = [210, 140, 350, 45, 270, 180];
    const baseHue = hues[(currentRound + difficulty) % hues.length];
    
    // Contrast step decreases as rounds progress (making it more subtle)
    // Contrast delta between 18% (easy) down to 7% (hard)
    const contrastDelta = Math.max(18 - currentRound * 2 - Math.floor(difficulty / 2), 6);
    const baseLightness = 50;
    const oddLightness = baseLightness + contrastDelta;

    const baseColor = `hsl(${baseHue}, 65%, ${baseLightness}%)`;
    const oddColor = `hsl(${baseHue}, 65%, ${oddLightness}%)`;

    const newTiles: VisualTile[] = [];
    for (let i = 0; i < totalTiles; i++) {
      newTiles.push({
        id: i,
        isOddOne: i === oddIndex,
        color: i === oddIndex ? oddColor : baseColor,
      });
    }

    setTiles(newTiles);
  }, [currentRound, gridSize, difficulty]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleTileClick = (tile: VisualTile) => {
    if (tile.isOddOne) {
      sounds.playMatchSuccess();
      if (currentRound >= targetRounds) {
        handleVictory(mistakes);
      } else {
        setCurrentRound(prev => prev + 1);
        if (currentRound >= 2 && gridSize === 3) {
          setGridSize(4); // expand to 4x4
        }
      }
    } else {
      sounds.playError();
      setMistakes(prev => prev + 1);
    }
  };

  const handleVictory = (finalMistakes: number) => {
    sounds.playFanfare();
    const duration = Math.max((Date.now() - startTime) / 1000, 4);
    const accuracy = Math.max(0.4, Math.min(1.0, 1 - (finalMistakes * 0.12)));

    onComplete({
      accuracy: Math.round(accuracy * 100) / 100,
      completionTimeSeconds: Math.round(duration * 10) / 10,
      mistakes: finalMistakes,
      score: Math.round(accuracy * 100),
      metrics: {
        roundsCompleted: targetRounds,
        finalGridDimension: `${gridSize}x${gridSize}`,
        contrastAdaptationDomain: 'Visuospatial & Contrast Sensitivity',
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Round:</span>
          <span className="text-lg font-bold text-teal-700">{currentRound} / {targetRounds}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timer:</span>
          <span className="text-lg font-bold font-mono text-slate-800">{elapsedSeconds}s</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grid:</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">{gridSize}x{gridSize}</span>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Eye className="w-5 h-5 text-teal-600" /> Contrast & Spatial Search
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Tap the single square that has a <strong>slightly lighter shade</strong> than the rest!
        </p>
      </div>

      {/* Grid of Color Squares */}
      <div
        className={`grid gap-3 w-full max-w-sm aspect-square p-2 bg-slate-100 rounded-3xl border border-slate-200 shadow-inner ${
          gridSize === 3 ? 'grid-cols-3' : 'grid-cols-4'
        }`}
      >
        {tiles.map(tile => (
          <motion.button
            key={tile.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleTileClick(tile)}
            style={{ backgroundColor: tile.color }}
            className="rounded-2xl shadow-xs transition-transform duration-100 cursor-pointer hover:brightness-105 border border-black/10"
          />
        ))}
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
          Cognitive Domain: <strong>Visuospatial & Contrast Sensitivity</strong>
        </span>
      </div>
    </div>
  );
};
