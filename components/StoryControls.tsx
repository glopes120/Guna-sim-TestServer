

import React from 'react';

interface StoryControlsProps {
  options: string[];
  onChoose: (option: string) => void;
  isLoading: boolean;
  gameOver: boolean;
  onRestart: () => void;
}

const StoryControls: React.FC<StoryControlsProps> = ({ options, onChoose, isLoading, gameOver, onRestart }) => {
  if (gameOver) {
    return (
      <div className="p-4 bg-[#202c33] flex justify-center w-full pb-8 border-t border-[#2a3942]">
        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-[#00a884] to-[#008f6f] hover:from-[#00d9a3] hover:to-[#00a884] text-white font-black py-3 px-8 rounded-full shadow-lg hover:shadow-[0_8px_16px_rgba(0,168,132,0.3)] transition-all active:scale-95 uppercase tracking-wider text-sm w-full max-w-xs border border-[#00d9a3]/30"
        >
          🎮 Jogar Outra Vez
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-[#202c33] flex justify-center items-center h-[140px] border-t border-[#2a3942]">
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-[#00a884] rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-[#00a884] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-[#00a884] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <span className="text-[#8696a0] text-sm font-medium ml-2">A escrever a história...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-[#202c33] flex flex-col gap-2.5 w-full pb-6 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.4)] z-30 border-t border-[#2a3942]/50 max-h-[280px] overflow-y-auto">
      <div className="text-[11px] text-center text-[#00a884] uppercase font-black tracking-widest mb-2 mt-1 sticky top-0">
        ✨ Escolhe o teu destino
      </div>
      <div className="space-y-2">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onChoose(option)}
            className="w-full text-left bg-gradient-to-r from-[#2a3942] to-[#202c33] hover:from-[#00a884]/20 hover:to-[#008f6f]/20 border border-l-4 border-l-[#00a884] hover:border-l-[#00d9a3] border-r border-r-[#2a3942] border-y border-y-[#2a3942] text-[#e9edef] hover:text-[#00d9a3] py-3 px-4 rounded-xl transition-all active:scale-[0.99] shadow-sm text-sm md:text-base font-medium group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#00a884]/0 group-hover:bg-[#00a884]/5 transition-colors"></div>
            <div className="relative flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">→</span>
              <span className="flex-1 leading-snug">{option}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoryControls;