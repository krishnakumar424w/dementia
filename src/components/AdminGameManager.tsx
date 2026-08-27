import React, { useState, useEffect } from 'react';
import { GameDefinition, CognitiveDomain, CognitiveCategory } from '../types';
import { api } from '../services/api';
import { gameRegistry, GameModule } from '../games/GameRegistry';
import { MemoryTrainingGame } from '../games/MemoryTrainingGame';
import { TouchSequenceGame } from '../games/TouchSequenceGame';
import { ConcentrationGame } from '../games/ConcentrationGame';
import { IconIdentificationGame } from '../games/IconIdentificationGame';
import { GraphInterpretationGame } from '../games/GraphInterpretationGame';
import { VisionAdaptationGame } from '../games/VisionAdaptationGame';
import { 
  Plus, Brain, Sliders, CheckCircle2, XCircle, Play, 
  Trash2, Edit3, Shield, Sparkles, Clock, Target, Tag,
  Layers, Zap, Heart, Eye, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminGameManagerProps {
  onTestLaunchGame?: (gameId: string) => void;
  onReturnToAdminConsole?: () => void;
}

export const AdminGameManager: React.FC<AdminGameManagerProps> = ({
  onTestLaunchGame,
  onReturnToAdminConsole,
}) => {
  const [gamesList, setGamesList] = useState<GameDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddingGame, setIsAddingGame] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // New Game Form State
  const [formData, setFormData] = useState<{
    id: string;
    title: string;
    domain: CognitiveDomain;
    targetTimeSeconds: number;
    baselineDifficulty: number;
    description: string;
    recommendedFor: string;
    tags: string;
    active: boolean;
  }>({
    id: '',
    title: '',
    domain: 'memory',
    targetTimeSeconds: 40,
    baselineDifficulty: 3,
    description: '',
    recommendedFor: 'Early recall reinforcement and hippocampal stimulation.',
    tags: 'Clinical, Adaptive, Recall',
    active: true,
  });

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await api.getGames();
      if (res && res.games) {
        setGamesList(res.games);
      }
    } catch (e) {
      console.error('Failed to load games:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleToggleActive = (gameId: string) => {
    setGamesList(prev =>
      prev.map(g => {
        const id = g.id || g.gameId;
        if (id === gameId) {
          return { ...g, active: g.active === false ? true : false };
        }
        return g;
      })
    );
  };

  const handleDifficultyChange = (gameId: string, diff: number) => {
    setGamesList(prev =>
      prev.map(g => {
        const id = g.id || g.gameId;
        if (id === gameId) {
          return { ...g, difficultyScale: `Level ${diff}/10` };
        }
        return g;
      })
    );
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.id) return;

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload: Partial<GameDefinition> = {
        id: formData.id.toLowerCase().replace(/\s+/g, '_'),
        title: formData.title,
        domain: formData.domain,
        description: formData.description || 'Customized cognitive stimulation exercise.',
        targetTimeSeconds: Number(formData.targetTimeSeconds) || 40,
        recommendedFor: formData.recommendedFor || 'Personalized cognitive rehabilitation.',
        tags: tagsArray,
        active: formData.active,
        difficultyScale: `Level ${formData.baselineDifficulty}/10`,
      };

      await api.addCustomGame(payload);

      // Register dynamically into in-memory Game Registry so patient can play it immediately
      // Using appropriate cognitive engine based on domain
      let engineComponent = MemoryTrainingGame;
      let category: CognitiveCategory = 'MEMORY_RECALL';
      let icon = '🧠';

      if (formData.domain === 'response_time') {
        engineComponent = TouchSequenceGame;
        category = 'SEQUENCE_ORDERING';
        icon = '⚡';
      } else if (formData.domain === 'attention') {
        engineComponent = ConcentrationGame;
        category = 'ATTENTION_OBSERVATION';
        icon = '🎯';
      } else if (formData.domain === 'logic') {
        engineComponent = IconIdentificationGame;
        category = 'ASSOCIATION_RECOGNITION';
        icon = '💡';
      }

      gameRegistry.registerGame({
        gameId: payload.id!,
        category,
        domain: payload.domain!,
        title: payload.title!,
        description: payload.description!,
        icon,
        targetTimeSeconds: payload.targetTimeSeconds!,
        component: engineComponent,
      });

      setSaveSuccessMsg(`Cognitive Module "${formData.title}" registered and live!`);
      setIsAddingGame(false);
      
      // Reset form
      setFormData({
        id: '',
        title: '',
        domain: 'memory',
        targetTimeSeconds: 40,
        baselineDifficulty: 3,
        description: '',
        recommendedFor: '',
        tags: 'Clinical, Adaptive',
        active: true,
      });

      fetchGames();

      setTimeout(() => {
        setSaveSuccessMsg(null);
      }, 3500);
    } catch (err: any) {
      console.error('Failed to create game:', err);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* High Density Top Banner */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <span className="hd-card-title text-slate-200">
              Admin Module Studio // Adding & Managing Cognitive Games
            </span>
          </div>
          <span className="font-mono text-[10px] text-teal-300 font-bold bg-teal-950 px-2 py-0.5 rounded-xs border border-teal-800">
            NODE: ADDING GAMES IN IT
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Cognitive Game Registry & Dynamic Exercise Builder
              </h1>
              <span className="hd-badge hd-badge-blue">
                {gamesList.length} Modules Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Dynamically add, calibrate, toggle, or tune cognitive game modules (Module ID, Domain, Target Latency, Baseline Difficulty 1-10). 
              Changes immediately reflect in the Patient Drill Catalog.
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
            {onReturnToAdminConsole && (
              <button
                onClick={onReturnToAdminConsole}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xs border border-slate-300 transition-colors cursor-pointer"
              >
                Back to Admin Overview
              </button>
            )}

            <button
              onClick={() => setIsAddingGame(!isAddingGame)}
              className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingGame ? 'Close Configurator' : 'Add New Game Module'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {saveSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xs flex items-center justify-between font-mono"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{saveSuccessMsg}</span>
            </div>
            <span className="text-[10px] text-emerald-700">SYNCED TO PATIENT WORKSPACE</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DYNAMIC ADD GAME FORM MODAL / COLLAPSIBLE PANEL */}
      <AnimatePresence>
        {isAddingGame && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="hd-card border-2 border-blue-600 shadow-md">
              <div className="hd-card-header bg-blue-900 text-white">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hd-card-title text-white">
                    Module Configurator // Register New Cognitive Exercise
                  </span>
                </div>
                <span className="text-[10px] font-mono text-blue-200">SCHEMA: CLINICAL_DRILL_V1</span>
              </div>

              <form onSubmit={handleCreateGame} className="p-4 sm:p-5 bg-white space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  
                  {/* Module ID */}
                  <div>
                    <label className="hd-stat-label block mb-1">
                      Module ID (Slug format) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. visual_nback_recall"
                      value={formData.id}
                      onChange={e => setFormData({ ...formData, id: e.target.value })}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Unique system identifier</span>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="hd-stat-label block mb-1">
                      Exercise Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Visual N-Back Sequence Drill"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* Cognitive Domain */}
                  <div>
                    <label className="hd-stat-label block mb-1">
                      Cognitive Domain *
                    </label>
                    <select
                      value={formData.domain}
                      onChange={e => setFormData({ ...formData, domain: e.target.value as CognitiveDomain })}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xs bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none capitalize"
                    >
                      <option value="memory">Short-Term Memory</option>
                      <option value="response_time">Response Time & Speed</option>
                      <option value="attention">Selective Attention</option>
                      <option value="logic">Executive Logic & Reasoning</option>
                    </select>
                  </div>

                  {/* Target Latency (Seconds) */}
                  <div>
                    <label className="hd-stat-label block mb-1">
                      Target Latency / Duration (Seconds) *
                    </label>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="10"
                        max="180"
                        value={formData.targetTimeSeconds}
                        onChange={e => setFormData({ ...formData, targetTimeSeconds: parseInt(e.target.value) || 40 })}
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Baseline Difficulty 1-10 */}
                  <div>
                    <label className="hd-stat-label block mb-1 flex items-center justify-between">
                      <span>Baseline Difficulty (1-10)</span>
                      <span className="font-mono text-blue-700 font-bold">LVL {formData.baselineDifficulty}</span>
                    </label>
                    <div className="flex items-center space-x-3 pt-1">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.baselineDifficulty}
                        onChange={e => setFormData({ ...formData, baselineDifficulty: parseInt(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div>
                    <label className="hd-stat-label block mb-1">
                      Initial Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, active: !formData.active })}
                      className={`w-full py-2 px-3 text-xs font-mono font-bold rounded-xs border flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                        formData.active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {formData.active ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ACTIVE (DEPLOYED)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>INACTIVE (STAGING)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Description & Clinical Purpose */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="hd-stat-label block mb-1">
                      Exercise Description (Shown to Patient)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Recall the sequence of geometric shapes displayed 2 steps earlier."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="hd-stat-label block mb-1">
                      Clinical Purpose & Rationale
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Parietal lobe spatial orientation and working memory buffer."
                      value={formData.recommendedFor}
                      onChange={e => setFormData({ ...formData, recommendedFor: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddingGame(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xs border border-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs shadow-2xs cursor-pointer flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Register & Deploy Module</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COGNITIVE GAMES MANAGEMENT TABLE */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <Brain className="w-3.5 h-3.5 text-blue-600" />
            <span className="hd-card-title">Live Cognitive Game Modules Inventory ({gamesList.length})</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">REAL-TIME CALIBRATION</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono divide-y divide-slate-200">
            <thead className="bg-slate-100/80 text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Module ID & Title</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Target Latency</th>
                <th className="py-2.5 px-3">Baseline Difficulty</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {gamesList.map((game, idx) => {
                const gameId = game.id || game.gameId || `game_${idx}`;
                const isActive = game.active !== false;

                return (
                  <tr key={gameId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-xs bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold font-sans text-slate-900 text-xs">
                            {game.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {gameId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="hd-badge hd-badge-blue capitalize">
                        {game.domain}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-700">
                      {game.targetTimeSeconds}s
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          defaultValue={3}
                          onChange={e => handleDifficultyChange(gameId, parseInt(e.target.value))}
                          className="w-20 accent-blue-600 cursor-pointer"
                        />
                        <span className="font-bold text-blue-700 text-[10px]">
                          {game.difficultyScale || 'Lvl 3/10'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleActive(gameId)}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded-xs uppercase tracking-wider border cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {onTestLaunchGame && (
                          <button
                            onClick={() => onTestLaunchGame(gameId)}
                            className="p-1 px-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xs text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center space-x-1"
                            title="Test Launch Drill in Sandbox"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Test</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
