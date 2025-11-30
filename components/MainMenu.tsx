import React, { useState } from 'react';
import ZezeAvatar from './ZezeAvatar';

interface MainMenuProps {
  onStartNegotiation: () => void;
  onStartStory: () => void;
  onOpenStats: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartNegotiation, onStartStory, onOpenStats }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <div className="w-full h-full bg-[#111b21] flex flex-col relative overflow-hidden font-sans">
      {/* Background Pattern with gradient overlay */}
      <div className="absolute inset-0 wa-bg opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#00a884]/5 pointer-events-none"></div>

      {/* Animated background elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00a884] rounded-full opacity-5 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00a884] rounded-full opacity-5 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="z-10 flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-6">
          {/* Avatar with enhanced styling */}
          <div className="relative">
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-[#00a884] to-[#008f6f] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            <div className="relative w-32 h-32 rounded-full border-4 border-[#00a884] shadow-[0_0_30px_rgba(0,168,132,0.5)] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse-glow">
              <ZezeAvatar patience={85} isThinking={false} />
            </div>
            <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce-subtle">🎯</div>
          </div>

          {/* Title and Subtitle */}
          <div className="text-center space-y-3">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00a884] via-[#00d9a3] to-[#00a884] tracking-tighter drop-shadow-lg">
                GUNA SIMULATOR
              </h1>
              <div className="h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-[#00a884] to-transparent mt-2"></div>
            </div>
            <p className="text-[#00a884] font-bold text-xs md:text-sm uppercase tracking-[2px] letter-spacing">
              🏆 Business à Moda do Porto
            </p>
            <p className="text-[#8696a0] mt-4 text-sm md:text-base leading-relaxed max-w-xs">
              Consegues negociar com o mestre e sair por menos? Ou vais ficar com o iPhone pendurado? 📱
            </p>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="w-full max-w-xs space-y-3 pt-6">
          
          {/* Primary Button - Negotiation */}
          <button 
            onClick={onStartNegotiation}
            onMouseEnter={() => setHoveredButton('negotiation')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full group relative bg-gradient-to-r from-[#00a884] to-[#008f6f] hover:from-[#00d9a3] hover:to-[#00a884] text-white p-4 rounded-2xl shadow-lg hover:shadow-[0_12px_24px_rgba(0,168,132,0.4)] transition-all active:scale-[0.98] flex items-center justify-between overflow-hidden border border-[#00d9a3]/30"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            <div className="flex flex-col items-start z-10">
              <span className="font-black text-lg tracking-tight">Negociar iPhone</span>
              <span className="text-xs text-white/80 font-medium">Modo Clássico</span>
            </div>
            <span className={`text-3xl transition-transform duration-300 ${hoveredButton === 'negotiation' ? 'scale-125' : ''}`}>💰</span>
          </button>

          {/* Secondary Button - Story */}
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

          {/* Tertiary Button - Stats */}
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

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#00a884]/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Footer */}
      <div className="z-10 p-6 text-center border-t border-[#2a3942]/50">
        <p className="text-[11px] text-[#8696a0] uppercase tracking-widest font-bold letter-spacing-1">
          ✨ Powered by Gemini 2.5 & 3 Pro
        </p>
        <p className="text-[10px] text-[#8696a0]/60 mt-2 font-medium">Made with ❤️ for Porto vibes</p>
      </div>
    </div>
  );
};

export default MainMenu;