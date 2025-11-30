import React from 'react';
import { GameStatistics } from '../types';

interface StatsModalProps {
  stats: GameStatistics;
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ stats, isOpen, onClose, onReset }) => {
  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#202c33] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] text-[#e9edef] border border-[#2a3942]">
        
        {/* Header */}
        <div className="bg-[#202c33] p-4 flex justify-between items-center shrink-0 border-b border-[#2a3942]">
          <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
            <span>🏆</span> Caderneta do Guna
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#374248] rounded-full transition-colors">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar">
          
          {/* Main Stats */}
          <div className="p-4 grid grid-cols-2 gap-3 bg-[#111b21]">
            <div className="bg-[#202c33] p-3 rounded-lg text-center border border-[#2a3942]">
              <div className="text-xs text-[#8696a0] mb-1 font-medium uppercase">Jogos</div>
              <div className="text-2xl font-black text-[#e9edef]">{stats.gamesPlayed}</div>
            </div>
            <div className="bg-[#202c33] p-3 rounded-lg text-center border border-[#2a3942]">
              <div className="text-xs text-[#8696a0] mb-1 font-medium uppercase">Win Rate</div>
              <div className={`text-2xl font-black ${winRate > 50 ? 'text-[#00a884]' : 'text-[#f15c6d]'}`}>
                {winRate}%
              </div>
            </div>
          </div>

          {/* ACHIEVEMENTS SECTION (NOVO) */}
          <div className="px-4 py-2">
            <h3 className="text-xs text-[#00a884] font-black uppercase tracking-widest mb-3 mt-2">Conquistas</h3>
            <div className="grid grid-cols-1 gap-2">
              {stats.achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    ach.unlockedAt 
                      ? 'bg-gradient-to-r from-[#202c33] to-[#2a3942] border-[#00a884]/40 shadow-lg' 
                      : 'bg-[#111b21] border-[#2a3942] opacity-60 grayscale'
                  }`}
                >
                  <div className={`text-3xl ${ach.unlockedAt ? 'animate-bounce-subtle' : ''}`}>
                    {ach.unlockedAt ? ach.icon : 'UB'} {/* UB = Unknown Badge ou Lock */}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${ach.unlockedAt ? 'text-[#e9edef]' : 'text-[#8696a0]'}`}>
                      {ach.title}
                    </div>
                    <div className="text-xs text-[#8696a0] leading-snug">
                      {ach.description}
                    </div>
                  </div>
                  {ach.unlockedAt && (
                    <div className="ml-auto text-[#00a884]">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botão Reset */}
          <div className="p-6 text-center">
             <button 
               onClick={onReset}
               className="text-xs text-[#f15c6d] hover:text-red-400 underline decoration-red-500/30"
             >
               Apagar todo o progresso
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;