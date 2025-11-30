
import { GameStatistics } from '../types';

const STORAGE_KEY = 'zeze_game_stats_v1';

const DEFAULT_STATS: GameStatistics = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  totalTurns: 0,
  bestDeal: null,
  lowestPriceSeen: 800,
  recentResults: []
};

export const loadStats = (): GameStatistics => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATS;
    // Merge with default to ensure new fields (like recentResults) exist if loading old data
    return { ...DEFAULT_STATS, ...JSON.parse(stored) };
  } catch (e) {
    console.error("Failed to load stats", e);
    return DEFAULT_STATS;
  }
};

export const saveStats = (stats: GameStatistics): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save stats", e);
  }
};

export const clearStats = (): GameStatistics => {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_STATS;
};
