import React, { useState } from 'react';
import { gameRegistry, CATEGORIES_METADATA } from '../games/GameRegistry';
import { CognitiveCategory, CognitiveDomain, PatientProfile } from '../types';
import { 
  Brain, Search, Play, Trophy, Sparkles, Filter, 
  Layers, Clock, ShieldCheck, CheckCircle2, ChevronRight, Award, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoriesViewProps {
  patient: PatientProfile;
  onLaunchGame: (gameId: string) => void;
  selectedInitialCategory?: CognitiveCategory | 'ALL';
  onOpenAICaretaker?: (category?: CognitiveCategory) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  patient,
  onLaunchGame,
  selectedInitialCategory = 'ALL',
  onOpenAICaretaker,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CognitiveCategory | 'ALL'>(selectedInitialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  const categories = gameRegistry.getCategories();
  const allGames = gameRegistry.getAllGames();

  // Filter games based on category, search, and domain
  const filteredGames = allGames.filter((game) => {
    const matchesCategory = selectedCategory === 'ALL' || game.category === selectedCategory;
    const matchesDomain = selectedDomain === 'ALL' || game.domain === selectedDomain;
    const matchesSearch = 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.instructions && game.instructions.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesDomain && matchesSearch;
  });

  const getDomainColor = (domain: CognitiveDomain) => {
    switch (domain) {
      case 'memory': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'attention': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'logic': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'response_time': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getCategoryTheme = (cat: CognitiveCategory) => {
    switch (cat) {
      case 'MEMORY_RECALL':
        return { border: 'border-purple-200 hover:border-purple-400', bg: 'bg-purple-50/50', badge: 'bg-purple-600 text-white' };
      case 'ATTENTION_OBSERVATION':
        return { border: 'border-blue-200 hover:border-blue-400', bg: 'bg-blue-50/50', badge: 'bg-blue-600 text-white' };
      case 'ASSOCIATION_RECOGNITION':
        return { border: 'border-rose-200 hover:border-rose-400', bg: 'bg-rose-50/50', badge: 'bg-rose-600 text-white' };
      case 'SEQUENCE_ORDERING':
        return { border: 'border-indigo-200 hover:border-indigo-400', bg: 'bg-indigo-50/50', badge: 'bg-indigo-600 text-white' };
      case 'DAILY_LIFE_FAMILIARITY':
        return { border: 'border-amber-200 hover:border-amber-400', bg: 'bg-amber-50/50', badge: 'bg-amber-600 text-white' };
      case 'VISUAL_SPATIAL':
        return { border: 'border-teal-200 hover:border-teal-400', bg: 'bg-teal-50/50', badge: 'bg-teal-600 text-white' };
      default:
        return { border: 'border-slate-200 hover:border-slate-400', bg: 'bg-slate-50', badge: 'bg-slate-600 text-white' };
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="hd-card bg-white shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="hd-card-title">Cognitive Drill Library // Categorized Protocols</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="hd-badge hd-badge-blue">36 Clinically Verified Games</span>
            <span className="hd-badge hd-badge-emerald">6 Core Categories</span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore Cognitive Games by Category
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
                Browse our comprehensive catalog of 30+ interactive drills structured across 6 core neurological domains. 
                Each exercise is tailored for progressive memory stimulation, focused observation, and daily cognitive vitality.
              </p>
            </div>

            {/* Quick Stats Pill & AI Voice Trigger */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <span className="text-xs font-bold text-blue-600 uppercase block tracking-wider">Total Drills</span>
                <span className="text-xl font-black text-blue-950 font-mono">{allGames.length} Games</span>
              </div>
              <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-xs font-bold text-emerald-600 uppercase block tracking-wider">Categories</span>
                <span className="text-xl font-black text-emerald-950 font-mono">6 Domains</span>
              </div>
              {onOpenAICaretaker && (
                <button
                  onClick={() => onOpenAICaretaker(selectedCategory === 'ALL' ? undefined : selectedCategory)}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Ask Aria Voice</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Voice Assistant Recommendation Prompt Callout */}
          {onOpenAICaretaker && (
            <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-xs">
                  <strong className="font-bold text-slate-900 block">
                    Need a test-optimized game recommendation?
                  </strong>
                  <span className="text-slate-600">
                    Aria Voice analyzes {patient.fullName.split(' ')[0]}'s latest cognitive test benchmarks to recommend drills tailored to their memory and logic scores.
                  </span>
                </div>
              </div>

              <button
                onClick={() => onOpenAICaretaker(selectedCategory === 'ALL' ? undefined : selectedCategory)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-blue-300 text-blue-700 rounded-lg font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-2xs"
              >
                {selectedCategory === 'ALL' ? 'Get AI Recommendation' : `Get ${CATEGORIES_METADATA[selectedCategory]?.name || 'Category'} Drill`}
              </button>
            </div>
          )}

          {/* Search and Filters Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drills by title, concept, or instructions..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Domain Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Domain:</span>
              {['ALL', 'memory', 'attention', 'logic', 'response_time'].map((dom) => (
                <button
                  key={dom}
                  onClick={() => setSelectedDomain(dom)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    selectedDomain === dom
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {dom === 'ALL' ? 'All Domains' : dom.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Category Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedCategory === 'ALL'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-200'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-2xl">🌟</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${
              selectedCategory === 'ALL' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {allGames.length}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-extrabold leading-tight">All Categories</h3>
            <p className={`text-xs mt-0.5 leading-snug ${
              selectedCategory === 'ALL' ? 'text-blue-100' : 'text-slate-500'
            }`}>
              Full drill catalog
            </p>
          </div>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const theme = getCategoryTheme(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-300'
                  : `bg-white ${theme.border} text-slate-800 hover:shadow-2xs`
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {cat.gameCount}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold leading-tight">{cat.name}</h3>
                <p className={`text-xs mt-0.5 line-clamp-1 ${
                  isSelected ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {cat.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Active Category Title & Count */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active View //</span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {selectedCategory === 'ALL' ? 'All 36 Cognitive Drills' : CATEGORIES_METADATA[selectedCategory]?.name}
          </h2>
          <span className="text-sm text-slate-500 font-mono">({filteredGames.length} available)</span>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => {
          const patientDifficulty = patient.currentDifficulty?.[game.gameId] || 3;
          const catMeta = CATEGORIES_METADATA[game.category];

          return (
            <motion.div
              key={game.gameId}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="hd-card bg-white border border-slate-200 hover:border-blue-400 transition-all hover:shadow-sm flex flex-col justify-between group"
            >
              <div className="p-4 sm:p-5">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getDomainColor(game.domain)}`}>
                    {game.domain.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    {game.isCoreDiagnostic && (
                      <span className="text-[11px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono uppercase">
                        Clinical Core
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      ⏱ {game.targetTimeSeconds}s
                    </span>
                  </div>
                </div>

                {/* Title & Icon */}
                <div className="flex items-start gap-3.5 my-2">
                  <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 flex items-center justify-center text-3xl shrink-0 transition-colors shadow-2xs">
                    {game.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {game.title}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 block">
                      {catMeta?.name || game.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed mt-2 line-clamp-2">
                  {game.description}
                </p>

                {/* Instructions snippet */}
                {game.instructions && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      💡 {game.instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-sm font-mono text-slate-600">
                  <span>Level:</span>
                  <span className="font-bold text-slate-900">{patientDifficulty}/10</span>
                </div>

                <button
                  id={`play-drill-${game.gameId}`}
                  onClick={() => onLaunchGame(game.gameId)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Drill</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No games matched your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or choosing another category.</p>
          <button
            onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); setSelectedDomain('ALL'); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
