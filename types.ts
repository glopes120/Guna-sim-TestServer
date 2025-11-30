export enum GameStatus {
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost',
  PRISON = 'prison',
  SCAMMED = 'scammed',
  ROBBED = 'robbed',
  DRAW = "DRAW"
}

export type GameMode = 'negotiation' | 'story';
export type ImageSize = '1K' | '2K' | '4K';

export interface Message {
  id: string;
  sender: 'user' | 'zeze' | 'system';
  text: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface GameState {
  mode: GameMode;
  patience: number;
  currentPrice: number;
  status: GameStatus;
  messages: Message[];
  turnCount: number;
  storyOptions: string[];
  isStoryLoading: boolean;
  imageSize: ImageSize;
  isTyping: boolean; // NOVO: Para controlar o estado de escrita
}

export interface GeminiResponse {
  text: string;
  patienceChange: number;
  newPrice: number;
  gameStatus: GameStatus;
  imagePrompt?: string;
}

export interface StoryResponse {
  narrative: string;
  options: string[];
  gameOver: boolean;
  endingType?: 'good' | 'bad' | 'funny' | 'death';
  imagePrompt?: string;
}

// NOVO: Definição de Achievement
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number; // Timestamp de quando desbloqueou
}

export interface GameResult {
  outcome: 'won' | 'lost' | 'prison' | 'scammed' | 'robbed' | 'story_end';
  finalPrice: number;
  timestamp: number;
}

export interface GameStatistics {
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalTurns: number;
  bestDeal: number | null;
  lowestPriceSeen: number;
  recentResults: GameResult[];
  achievements: Achievement[]; // NOVO: Lista de conquistas
}