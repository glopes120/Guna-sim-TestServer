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

  const recentResults = stats.recentResults || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#202c33] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh] text-[#e9edef]">
        
        {/* Header */}
        <div className="bg-[#202c33] p-4 flex justify-between items-center shrink-0 border-b border-[#2a3942]">
          <h2 className="text-lg font-medium tracking-wide">Info. do Negócio</h2>
          <button onClick={onClose} className="text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-y-auto">
          
          {/* Main Stats Grid */}
          <div className="p-4 grid grid-cols-2 gap-3 border-b border-[#2a3942] bg-[#111b21]">
            <div className="bg-[#202c33] p-3 rounded-lg text-center">
              <div className="text-xs text-[#8696a0] mb-1">Jogos</div>
              <div className="text-xl font-bold text-[#e9edef]">{stats.gamesPlayed}</div>
            </div>
            <div className="bg-[#202c33] p-3 rounded-lg text-center">
              <div className="text-xs text-[#8696a0] mb-1">Sucesso</div>
              <div className={`text-xl font-bold ${winRate > 50 ? 'text-[#00a884]' : 'text-[#f15c6d]'}`}>
                {winRate}%
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 bg-[#111b21]">
             
             {/* List Items */}
             <div className="bg-[#202c33] rounded-lg overflow-hidden">
                 <div className="flex justify-between items-center p-3 border-b border-[#2a3942]">
                    <span className="text-[#e9edef] text-sm">Vitórias</span>
                    <span className="text-[#00a884] font-bold">{stats.wins}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 border-b border-[#2a3942]">
                    <span className="text-[#e9edef] text-sm">Derrotas</span>
                    <span className="text-[#f15c6d] font-bold">{stats.losses}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 border-b border-[#2a3942]">
                    <span className="text-[#e9edef] text-sm">Turnos Totais</span>
                    <span className="text-[#8696a0] font-bold">{stats.totalTurns}</span>
                 </div>
                 <div className="flex justify-between items-center p-3">
                    <span className="text-[#e9edef] text-sm">Melhor Negócio</span>
                    <span className="text-[#f0b330] font-bold">
                      {stats.bestDeal ? `${stats.bestDeal}€` : '-'}
                    </span>
                 </div>
             </div>

             {/* History Section */}
             {recentResults.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs text-[#8696a0] font-bold uppercase px-1">Recente</h3>
                  <div className="bg-[#202c33] rounded-lg overflow-hidden">
                    {recentResults.map((result, idx) => (
                      <div key={idx} className="p-3 border-b border-[#2a3942] last:border-0 flex justify-between items-center text-sm">
                        <span className={result.outcome === 'won' ? 'text-[#00a884] font-medium' : 'text-[#f15c6d] font-medium'}>
                          {result.outcome === 'won' ? '✅ Comprado' : '🚫 Fuga'}
                        </span>
                        <span className="text-[#8696a0] text-xs">{result.finalPrice}€</span>
                      </div>
                    ))}
                  </div>
                </div>
             )}

             <div className="pt-4 flex justify-center pb-2">
                 <button 
                   onClick={onReset}
                   className="text-xs text-[#f15c6d] hover:underline"
                 >
                   Apagar histórico de conversas
                 </button>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;