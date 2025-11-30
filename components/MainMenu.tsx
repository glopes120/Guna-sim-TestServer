import React, { useState } from 'react';
import ZezeAvatar from './ZezeAvatar';
import { GameStatistics } from '../types';

interface MainMenuProps {
  onStartNegotiation: () => void;
  onStartStory: () => void;
  onOpenStats: () => void;
  stats: GameStatistics; // [NOVO] Recebe as estatísticas
}

// Lógica de Patentes
const getRank = (wins: number) => {
  if (wins >= 50) return { title: "👑 Rei da Areosa", color: "text-[#ffd700]" };
  if (wins >= 25) return { title: "🔫 Guna Profissional", color: "text-[#00d9a3]" };
  if (wins >= 10) return { title: "👟 Mitra Aspirante", color: "text-[#00a884]" };
  if (wins >= 3) return { title: "🧢 Cliente Habitual", color: "text-[#8696a0]" };
  return { title: "📸 Turista Acidental", color: "text-[#536269]" };
};

const MainMenu: React.FC<MainMenuProps> = ({ onStartNegotiation, onStartStory, onOpenStats, stats }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const rank = getRank(stats.wins);

  return (
    <div className="w-full h-full bg-[#111b21] flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 wa-bg opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#00a884]/5 pointer-events-none"></div>

      <div className="z-10 flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-[#00a884] to-[#008f6f] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            <div className="relative w-32 h-32 rounded-full border-4 border-[#00a884] shadow-[0_0_30px_rgba(0,168,132,0.5)] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse-glow">
              <ZezeAvatar patience={85} isThinking={false} />
            </div>
            <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce-subtle">🎯</div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00a884] via-[#00d9a3] to-[#00a884] tracking-tighter drop-shadow-lg">
              GUNA SIMULATOR
            </h1>
            
            {/* [NOVO] Badge de Rank */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#202c33] border border-[#2a3942] shadow-lg ${rank.color} font-black uppercase text-xs tracking-widest`}>
              <span>{rank.title}</span>
              <span className="text-[#8696a0] text-[10px]">({stats.wins} Vitórias)</span>
            </div>

            <p className="text-[#8696a0] mt-4 text-sm md:text-base leading-relaxed max-w-xs pt-2">
              Consegues negociar com o mestre sem ficar "agarrado"?
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-xs space-y-3 pt-2">
          <button 
            onClick={onStartNegotiation}
            onMouseEnter={() => setHoveredButton('negotiation')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full group relative bg-gradient-to-r from-[#00a884] to-[#008f6f] hover:from-[#00d9a3] hover:to-[#00a884] text-white p-4 rounded-2xl shadow-lg hover:shadow-[0_12px_24px_rgba(0,168,132,0.4)] transition-all active:scale-[0.98] flex items-center justify-between overflow-hidden border border-[#00d9a3]/30"
          >
            <div className="flex flex-col items-start z-10">
              <span className="font-black text-lg tracking-tight">Negociar iPhone</span>
              <span className="text-xs text-white/80 font-medium">Modo Clássico</span>
            </div>
            <span className={`text-3xl transition-transform duration-300 ${hoveredButton === 'negotiation' ? 'scale-125' : ''}`}>💰</span>
          </button>

          <button 
            onClick={onStartStory}
            onMouseEnter={() => setHoveredButton('story')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full group bg-[#202c33] hover:bg-[#2a3942] border-2 border-[#00a884]/40 hover:border-[#00a884]/80 text-[#e9edef] p-4 rounded-2xl shadow-md hover:shadow-[0_8px_16px_rgba(0,168,132,0.2)] transition-all active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex flex-col items-start">
              <span className="font-black text-lg tracking-tight">História na Areosa</span>
              <span className="text-xs text-[#8696a0] font-medium">RPG de Escolhas</span>
            </div>
            <span className={`text-3xl transition-transform duration-300 ${hoveredButton === 'story' ? 'scale-125' : ''}`}>📖</span>
          </button>

          <button 
            onClick={onOpenStats}
            onMouseEnter={() => setHoveredButton('stats')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full group bg-[#202c33] hover:bg-[#2a3942] border-2 border-[#00a884]/40 hover:border-[#00a884]/80 text-[#e9edef] p-4 rounded-2xl shadow-md hover:shadow-[0_8px_16px_rgba(0,168,132,0.2)] transition-all active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex flex-col items-start">
              <span className="font-black text-lg tracking-tight">A Minha Caderneta</span>
              <span className="text-xs text-[#8696a0] font-medium">Estatísticas</span>
            </div>
            <span className={`text-3xl transition-transform duration-300 ${hoveredButton === 'stats' ? 'scale-125' : ''}`}>📊</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#00a884]/10 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default MainMenu;