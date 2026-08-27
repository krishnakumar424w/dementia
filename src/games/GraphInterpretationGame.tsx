import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from './GameRegistry';
import { sounds } from '../services/audio';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface TrailNode {
  id: number;
  label: string;
  orderIndex: number; // 0, 1, 2, ...
  x: number; // percentage 10 to 90
  y: number; // percentage 10 to 90
}

export const GraphInterpretationGame: React.FC<GameProps> = ({
  difficulty,
  patientName,
  onComplete,
  onCancel,
}) => {
  // Sequence length: 4 to 8 nodes based on difficulty
  // e.g. 1, A, 2, B, 3, C
  const nodeCount = Math.min(Math.max(Math.floor(difficulty / 2) + 4, 4), 8);
  const sequenceLabels = ['1', 'A', '2', 'B', '3', 'C', '4', 'D'].slice(0, nodeCount);

  const [nodes, setNodes] = useState<TrailNode[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [connectedPath, setConnectedPath] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [nodeLatencyMs, setNodeLatencyMs] = useState<number[]>([]);

  const lastTapRef = useRef<number>(Date.now());

  // Fixed comfortable coordinates to avoid overlap
  const PRESET_COORDS = [
    { x: 18, y: 22 },
    { x: 78, y: 18 },
    { x: 25, y: 75 },
    { x: 80, y: 72 },
    { x: 50, y: 48 },
    { x: 20, y: 48 },
    { x: 82, y: 45 },
    { x: 50, y: 80 },
  ];

  useEffect(() => {
    const initializedNodes: TrailNode[] = sequenceLabels.map((label, index) => {
      const coord = PRESET_COORDS[index % PRESET_COORDS.length];
      return {
        id: index,
        label,
        orderIndex: index,
        x: coord.x,
        y: coord.y,
      };
    });
    setNodes(initializedNodes);
    lastTapRef.current = Date.now();
  }, [nodeCount]);

  const handleNodeClick = (node: TrailNode) => {
    const isNext = node.orderIndex === currentStep;

    const latency = Date.now() - lastTapRef.current;
    setNodeLatencyMs(prev => [...prev, latency]);
    lastTapRef.current = Date.now();

    if (isNext) {
      sounds.playSimonTone(node.orderIndex);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setConnectedPath(prev => [...prev, node.id]);

      if (nextStep === nodes.length) {
        handleVictory(mistakes);
      }
    } else if (node.orderIndex > currentStep) {
      sounds.playError();
      setMistakes(prev => prev + 1);
    }
  };

  const handleVictory = (finalMistakes: number) => {
    sounds.playFanfare();
    const duration = Math.max((Date.now() - startTime) / 1000, 5);
    const accuracy = Math.max(0.4, Math.min(1.0, 1 - (finalMistakes * 0.12)));
    const avgLatency = nodeLatencyMs.length > 0
      ? Math.round(nodeLatencyMs.reduce((a, b) => a + b, 0) / nodeLatencyMs.length)
      : 1300;

    onComplete({
      accuracy: Math.round(accuracy * 100) / 100,
      completionTimeSeconds: Math.round(duration * 10) / 10,
      mistakes: finalMistakes,
      score: Math.round(accuracy * 100),
      metrics: {
        connectedNodes: nodes.length,
        avgReactionTimeMs: avgLatency,
        trailType: 'Alternating Number-Letter (Trail Making Test)',
      },
    });
  };

  const nextExpectedLabel = sequenceLabels[currentStep] || 'Done';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 select-none">
      {/* Top Header stats */}
      <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Target:</span>
          <span className="text-xl font-extrabold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-lg border border-blue-200">
            {nextExpectedLabel}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress:</span>
          <span className="text-lg font-bold text-slate-800">{currentStep} / {nodes.length}</span>
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">
          Trail Making Sequence Matrix
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Tap the circles in alternating order: <strong>1 → A → 2 → B → 3 → C...</strong>
        </p>
      </div>

      {/* Trail Canvas / Stage Area */}
      <div className="w-full aspect-[4/3] max-w-lg bg-slate-900 rounded-3xl p-4 relative overflow-hidden border-4 border-slate-800 shadow-xl">
        {/* Connection lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connectedPath.map((nodeId, idx) => {
            if (idx === 0) return null;
            const prevNode = nodes.find(n => n.id === connectedPath[idx - 1]);
            const currNode = nodes.find(n => n.id === nodeId);
            if (!prevNode || !currNode) return null;

            return (
              <line
                key={idx}
                x1={`${prevNode.x}%`}
                y1={`${prevNode.y}%`}
                x2={`${currNode.x}%`}
                y2={`${currNode.y}%`}
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Scattered Nodes */}
        {nodes.map(node => {
          const isConnected = connectedPath.includes(node.id);
          const isCurrentTarget = node.orderIndex === currentStep;

          return (
            <motion.button
              key={node.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleNodeClick(node)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-lg transition-all duration-200 cursor-pointer ${
                isConnected
                  ? 'bg-emerald-500 text-white border-2 border-emerald-300 ring-4 ring-emerald-500/20'
                  : isCurrentTarget
                  ? 'bg-blue-500 text-white border-2 border-white ring-4 ring-blue-400 animate-bounce'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-2 border-slate-600'
              }`}
            >
              {isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : (
                node.label
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Cancel Exercise
        </button>
        <span className="text-xs text-slate-400">
          Cognitive Domain: <strong>Executive Function & Cognitive Flexibility</strong>
        </span>
      </div>
    </div>
  );
};
