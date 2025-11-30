
export enum GameStatus {
  PLAYING = 'playing',
  WON = 'won',       // Comprou barato (< 100€)
  LOST = 'lost',     // Zézé foi embora (Paciência 0)
  PRISON = 'prison', // Zézé foi preso (Chamar a bófia)
  SCAMMED = 'scammed', // Comprou caro (> 400€) -> Tijolo
  ROBBED = 'robbed',   // Agressão física (Paciência 0 + Insultos graves)
  DRAW = "DRAW"
}

export type GameMode = 'negotiation' | 'story';
export type ImageSize = '1K' | '2K' | '4K';

export interface Message {
  id: string;
  sender: 'user' | 'zeze' | 'system'; // Added system for narrator
  text: string;
  imageUrl?: string; // URL/Base64 of the generated image
  videoUrl?: string; // URL/Blob of the generated video
}

export interface GameState {
  mode: GameMode;
  patience: number; // 0 to 100
  currentPrice: number;
  status: GameStatus;
  messages: Message[];
  turnCount: number;
  // Story Mode Specifics
  storyOptions: string[];
  isStoryLoading: boolean;
  imageSize: ImageSize;
}

export interface GeminiResponse {
  text: string;
  patienceChange: number; // How much patience changed this turn
  newPrice: number;
  gameStatus: GameStatus;
  imagePrompt?: string; // Optional prompt for image generation
}

export interface StoryResponse {
  narrative: string; // The situation description + Zeze dialogue
  options: string[]; // 2 to 4 choices for the user
  gameOver: boolean;
  endingType?: 'good' | 'bad' | 'funny' | 'death';
  imagePrompt?: string; // Optional prompt for image generation
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
  bestDeal: number | null; // Lowest price bought (Won)
  lowestPriceSeen: number; // Lowest price ever offered by Zézé
  recentResults: GameResult[]; // Last 5 games
}
