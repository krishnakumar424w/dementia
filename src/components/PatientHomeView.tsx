import React from 'react';
import { PatientProfile } from '../types';
import { gameRegistry, CATEGORIES_METADATA } from '../games/GameRegistry';
import { Avatar } from './Avatar';
import { 
  Brain, Sparkles, Trophy, Bell, Camera, 
  Play, Flame, Heart, Zap, Target, Eye, Layers, ArrowRight,
  Award, TrendingUp, ChevronRight, Grid, ListFilter
} from 'lucide-react';

interface PatientHomeViewProps {
  patient: PatientProfile;
  onLaunchGame: (gameId: string) => void;
  onOpenAICaretaker: () => void;
  onSelectSubView: (view: 'games' | 'categories' | 'reminders' | 'memories' | 'milestones') => void;
}

export const PatientHomeView: React.FC<PatientHomeViewProps> = ({
  patient,
  onLaunchGame,
  onOpenAICaretaker,
  onSelectSubView,
}) => {
  const games = gameRegistry.getAllGames();
  const categories = gameRegistry.getCategories();
  const firstName = patient.fullName ? patient.fullName.split(' ')[0] : 'Arthur';
  const streakCount = patient.streakDays || 7;

  return (
    <div className="w-full space-y-4">
      {/* High Density Patient Summary Card */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <span className="hd-card-title">Patient Session // Morning Wellness Protocol</span>
            <span className="hd-badge hd-badge-emerald">Telemetry Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-full font-mono text-[10px] font-bold">
              <Trophy className="w-3 h-3 text-amber-600" />
              <span>COHORT RANK: TOP 1%</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-bold">PID: {(patient.id || '').toUpperCase()}</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="relative shrink-0">
              <Avatar
                src={patient.photoUrl}
                alt={patient.fullName}
                size="lg"
                rounded="2xl"
                className="border-2 border-amber-300 ring-2 ring-amber-100 shadow-2xs"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full border border-white shadow-xs" title="Top 1% Streak Master">
                <Trophy className="w-3 h-3 text-white fill-white" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Good morning, {firstName}
                </h1>
                <span className="text-sm text-slate-500 font-mono">({patient.age}y / {patient.diagnosis || patient.dementiaStage || 'MCI'})</span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mt-1">
                Target daily routine initialized. Unbroken <strong className="text-slate-900 font-mono">{streakCount}-day streak</strong> recorded. Ready for today's cognitive exercises.
              </p>
            </div>
          </div>

          {/* Quick AI Caretaker Action */}
          <div className="flex items-center space-x-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => onSelectSubView('categories')}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-sm font-bold uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
            >
              <Grid className="w-4 h-4 text-indigo-600" />
              <span>All Games</span>
            </button>

            <button
              onClick={onOpenAICaretaker}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Voice Chat (Aria)</span>
            </button>
          </div>
        </div>

        {/* Dense Patient Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 bg-slate-50/70 text-xs divide-x divide-slate-200">
          <div className="p-2.5 px-4">
            <div className="hd-stat-label">Composite Score</div>
            <div className="flex items-baseline space-x-2">
              <div className="hd-stat-value text-blue-700">{patient.compositeScore ?? 84}/100</div>
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded-xs">
                Top 5%
              </span>
            </div>
          </div>

          {/* Visual Streak Achievement Badge Card */}
          <div className="p-2.5 px-4 bg-amber-50/40">
            <div className="hd-stat-label flex items-center justify-between">
              <span>Daily Streak Badge</span>
              <span className="text-[9px] font-mono font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded-xs">
                UNLOCKED
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-2xs shrink-0">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-amber-900 leading-tight">
                  {streakCount}-Day Streak Master
                </span>
                <span className="text-[10px] font-mono text-amber-700">
                  Top 1% Player This Week
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 px-4">
            <div className="hd-stat-label">Clinical Stability</div>
            <div className="flex items-center space-x-1.5 h-[30px]">
              <span className="hd-stat-value text-emerald-700 text-sm font-bold">
                {(patient.stabilityStatus || 'Stable').toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-xs font-bold">
                Tier I
              </span>
            </div>
          </div>

          <div className="p-2.5 px-4">
            <div className="hd-stat-label">Total Drills Library</div>
            <div className="flex items-baseline space-x-2">
              <div className="hd-stat-value text-indigo-700">{games.length} Games</div>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">
                6 Categories
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Category Quick Access Banners */}
      <div className="hd-card bg-white shadow-2xs p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ListFilter className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Browse Games by Category
            </h2>
          </div>
          <button
            onClick={() => onSelectSubView('categories')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Open Category Explorer</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectSubView('categories')}
              className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-white text-slate-700 rounded-full border border-slate-200">
                  {cat.gameCount}
                </span>
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 leading-tight">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {cat.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Recommended Drills Grid */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <Brain className="w-3.5 h-3.5 text-blue-600" />
            <span className="hd-card-title">Featured Daily Cognitive Exercises</span>
          </div>
          <button
            onClick={() => onSelectSubView('categories')}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View all {games.length} games →
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#F8FAFC]">
          {games.slice(0, 6).map((game) => {
            const difficultyLevel = patient.currentDifficulty?.[game.gameId] || 3;
            const catMeta = CATEGORIES_METADATA[game.category];

            return (
              <div
                key={game.gameId}
                className="bg-white border border-slate-200 hover:border-blue-500 rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-300 flex items-center justify-center text-lg transition-colors">
                        {game.icon}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">{game.domain}</span>
                    </div>

                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                      LVL {difficultyLevel}
                    </span>
                  </div>

                  <span className="hd-badge hd-badge-blue mb-1">
                    {catMeta?.name || game.category}
                  </span>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                    {game.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {game.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">
                    ⏱ {game.targetTimeSeconds}s
                  </span>

                  <button
                    onClick={() => onLaunchGame(game.gameId)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 group-hover:bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Launch</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
