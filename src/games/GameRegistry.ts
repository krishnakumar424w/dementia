import React from 'react';
import { CognitiveDomain, CognitiveCategory, CategoryInfo, GameMetrics } from '../types';

export interface GameCompletionResult {
  accuracy: number; // 0.0 to 1.0
  completionTimeSeconds: number;
  mistakes: number;
  score: number;
  metrics: GameMetrics;
}

export interface GameProps {
  difficulty: number;
  patientName: string;
  onComplete: (result: GameCompletionResult) => void;
  onCancel: () => void;
}

export interface GameModule {
  gameId: string;
  category: CognitiveCategory;
  domain: CognitiveDomain;
  title: string;
  description: string;
  instructions?: string;
  icon: string;
  targetTimeSeconds: number;
  component: React.ComponentType<GameProps>;
  isCoreDiagnostic?: boolean;
}

export const CATEGORIES_METADATA: Record<CognitiveCategory, { name: string; icon: string; description: string; domain: CognitiveDomain }> = {
  MEMORY_RECALL: {
    name: 'Memory & Recall',
    icon: '🧠',
    description: 'Strengthen short-term visual, verbal, and item memory recall.',
    domain: 'memory',
  },
  ATTENTION_OBSERVATION: {
    name: 'Attention & Observation',
    icon: '👀',
    description: 'Train focused attention, visual spotting, and difference detection.',
    domain: 'attention',
  },
  ASSOCIATION_RECOGNITION: {
    name: 'Association & Recognition',
    icon: '🔗',
    description: 'Connect everyday objects, functions, names, and concepts.',
    domain: 'logic',
  },
  SEQUENCE_ORDERING: {
    name: 'Sequence & Ordering',
    icon: '🔢',
    description: 'Master procedural steps, number memory, and pattern logic.',
    domain: 'logic',
  },
  DAILY_LIFE_FAMILIARITY: {
    name: 'Daily Life & Familiarity',
    icon: '🏠',
    description: 'Recall familiar routines, family arrangements, stories, and places.',
    domain: 'memory',
  },
  VISUAL_SPATIAL: {
    name: 'Visual & Spatial Thinking',
    icon: '🧩',
    description: 'Enhance spatial coordinates, shape matching, and color discrimination.',
    domain: 'attention',
  },
};

class GameRegistryService {
  private registry: Map<string, GameModule> = new Map();

  public registerGame(module: GameModule) {
    this.registry.set(module.gameId, module);
  }

  public getGame(gameId: string): GameModule | undefined {
    return this.registry.get(gameId);
  }

  public getAllGames(): GameModule[] {
    return Array.from(this.registry.values());
  }

  public getGamesByCategory(category: CognitiveCategory): GameModule[] {
    return this.getAllGames().filter((g) => g.category === category);
  }

  public getCategories(): CategoryInfo[] {
    const allGames = this.getAllGames();
    return (Object.keys(CATEGORIES_METADATA) as CognitiveCategory[]).map((catKey) => {
      const meta = CATEGORIES_METADATA[catKey];
      const count = allGames.filter((g) => g.category === catKey).length;
      return {
        id: catKey,
        name: meta.name,
        icon: meta.icon,
        description: meta.description,
        gameCount: count,
      };
    });
  }

  public getCategoryInfo(category: CognitiveCategory): CategoryInfo {
    const meta = CATEGORIES_METADATA[category] || {
      name: category,
      icon: '🎮',
      description: '',
    };
    const count = this.getAllGames().filter((g) => g.category === category).length;
    return {
      id: category,
      name: meta.name,
      icon: meta.icon,
      description: meta.description,
      gameCount: count,
    };
  }
}

export const gameRegistry = new GameRegistryService();

