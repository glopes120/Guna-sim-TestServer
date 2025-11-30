import { GameStatistics, Achievement } from '../types';

const STORAGE_KEY = 'zeze_game_stats_v2'; // Mudei para v2 para resetar/migrar se necessário

// Lista de Achievements Possíveis
export const ACHIEVEMENTS_OiST: Achievement[] = [
  { id: 'shark', title: 'Tubarão de Negócios', description: 'Compra o iPhone por menos de 200€', icon: '🦈' },
  { id: 'diplomat', title: 'Diplomata da Areosa', description: 'Ganha um jogo mantendo a Paciência > 80%', icon: '🕊️' },
  { id: 'survivor', title: 'Sobrevivente', description: 'Joga 20 turnos sem o Zézé se ir embora', icon: 'pk' },
  { id: 'rich', title: 'Mãos Largas', description: 'Aceita pagar mais de 1000€ (Scammed)', icon: '💸' },
  { id: 'insulter', title: 'Boca Suja', description: 'Leva a paciência do Zézé a 0%', icon: '🤬' }
];

const DEFAULT_STATS: GameStatistics = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  totalTurns: 0,
  bestDeal: null,
  lowestPriceSeen: 800,
  recentResults: [],
  achievements: ACHIEVEMENTS_OiST // Inicia com a lista bloqueada
};

export const loadStats = (): GameStatistics => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATS;
    
    const parsed = JSON.parse(stored);
    
    // Merge inteligente para garantir que novos achievements aparecem
    const mergedAchievements = ACHIEVEMENTS_OiST.map(baseAch => {
      const storedAch = parsed.achievements?.find((a: Achievement) => a.id === baseAch.id);
      return storedAch || baseAch;
    });

    return { 
      ...DEFAULT_STATS, 
      ...parsed, 
      achievements: mergedAchievements 
    };
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