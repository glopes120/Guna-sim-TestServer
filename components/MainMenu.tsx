import React, { useState, useEffect } from 'react';
import ZezeAvatar from './ZezeAvatar';
import { GameStatistics } from '../types';

interface MainMenuProps {
  onStartNegotiation: () => void;
  onStartStory: () => void;
  onOpenStats: () => void;
  stats: GameStatistics;
}

// Lógica de Patentes (Ranks)
const getRank = (wins: number) => {
  if (wins >= 50) return { title: "👑 Rei da Areosa", color: "text-yellow-400", border: "border-yellow-500/50", bg: "bg-yellow-500/10" };
  if (wins >= 25) return { title: "🔫 Guna Profissional", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-500/10" };
  if (wins >= 10) return { title: "👟 Mitra Aspirante", color: "text-teal-400", border: "border-teal-500/50", bg: "bg-teal-500/10" };
  if (wins >= 3) return { title: "🧢 Cliente Habitual", color: "text-blue-400", border: "border-blue-500/50", bg: "bg-blue-500/10" };
  return { title: "📸 Turista Acidental", color: "text-gray-400", border: "border-gray-600/50", bg: "bg-gray-700/30" };
};

// Frases aleatórias do Zézé para o menu
const ZEZE_TIPS = [
  '"Dinheiro na mão, cu no chão."',
  '"Quem tem boca vai a Roma, quem tem nota vai às Antas."',
  '"O segredo do negócio é saber fugir."',
  '"Nunca compres nada sem cheirar primeiro."',
  '"Se a bófia perguntar, não viste nada."'
];

const MainMenu: React.FC<MainMenuProps> = ({ onStartNegotiation, onStartStory, onOpenStats, stats }) => {
  const rank = getRank(stats.wins);
  const [tip, setTip] = useState("");

  useEffect(() => {
    setTip(ZEZE_TIPS[Math.floor(Math.random() * ZEZE_TIPS.length)]);
  }, []);

  return (
    <div className="w-full h-full bg-[#0b141a] flex flex-col relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#00a884]/10 to-transparent pointer-events-none"></div>

      <div className="z-10 flex-1 flex flex-col p-6 animate-fade-in h-full">
        
        {/* --- HEADER: Título e Avatar --- */}
        <div className="flex flex-col items-center mt-4 mb-6">
          <div className="relative group cursor-pointer" onClick={onOpenStats}>
            <div className={`absolute -inset-1 rounded-full opacity-20 group-hover:opacity-40 transition duration-500 blur-md ${rank.bg.replace('/10', '')}`}></div>
            <div className="relative w-28 h-28 rounded-full border-4 border-[#1f2c34] shadow-2xl overflow-hidden bg-[#202c33]">
              <ZezeAvatar patience={85} isThinking={false} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#202c33] p-1.5 rounded-full border border-[#2a3942]">
              <span className="text-2xl animate-bounce-subtle">👑</span>
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00a884] to-white tracking-tighter drop-shadow-sm text-center">
            GUNA SIMULATOR
          </h1>
          <p className="text-[#8696a0] text-xs font-medium tracking-[0.2em] uppercase mt-1">Porto Edition</p>
        </div>

        {/* --- STATS CARD --- */}
        <div className={`w-full p-4 rounded-2xl border ${rank.border} ${rank.bg} backdrop-blur-sm mb-6 flex items-center justify-between shadow-lg relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          <div>
            <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider">O teu Estatuto</p>
            <p className={`text-lg font-black ${rank.color}`}>{rank.title}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{stats.wins}</p>
            <p className="text-[10px] text-white/60 uppercase">Vitórias</p>
          </div>
        </div>

        {/* --- ACTION GRID --- */}
        <div className="grid grid-cols-1 gap-3 w-full max-w-sm mx-auto flex-1 content-start">
          
          {/* Botão Principal: Negociar */}
          <button 
            onClick={onStartNegotiation}
            className="col-span-1 bg-gradient-to-r from-[#00a884] to-[#008069] p-4 rounded-xl flex items-center justify-between shadow-lg active:scale-[0.98] transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl backdrop-blur-md">
                💰
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg leading-none">Negociar</h3>
                <p className="text-green-100 text-xs mt-1 font-medium">Compra o iPhone 15</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-white/80 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>

          {/* Botão Secundário: História */}
          <button 
            onClick={onStartStory}
            className="col-span-1 bg-[#202c33] border border-[#2a3942] p-4 rounded-xl flex items-center justify-between shadow-md active:scale-[0.98] transition-all group hover:border-[#00a884]/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#111b21] flex items-center justify-center text-2xl border border-[#2a3942]">
                📖
              </div>
              <div className="text-left">
                <h3 className="text-[#e9edef] font-bold text-lg leading-none">Modo História (ainda em desenvolvimento)</h3>
                <p className="text-[#8696a0] text-xs mt-1 font-medium">Aventuras na Areosa</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-[#8696a0] transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>

          {/* Botão Terciário: Stats */}
          <button 
            onClick={onOpenStats}
            className="col-span-1 bg-[#202c33] border border-[#2a3942] p-4 rounded-xl flex items-center justify-between shadow-md active:scale-[0.98] transition-all group hover:border-[#00a884]/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#111b21] flex items-center justify-center text-2xl border border-[#2a3942]">
                📊
              </div>
              <div className="text-left">
                <h3 className="text-[#e9edef] font-bold text-lg leading-none">Caderneta</h3>
                <p className="text-[#8696a0] text-xs mt-1 font-medium">As tuas estatísticas</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-[#8696a0] transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>

        </div>

        {/* --- FOOTER: Dica do Zézé --- */}
        <div className="mt-auto pt-6 text-center">
          <div className="bg-[#182229] p-3 rounded-lg border border-[#2a3942] inline-block max-w-[90%] transform rotate-1 hover:rotate-0 transition-transform duration-300 shadow-lg">
            <p className="text-[#00a884] text-[10px] font-bold uppercase tracking-widest mb-1">Feito com amor por 100choros 😎</p>
            <p className="text-[#e9edef] text-xs italic font-medium">
              {tip}
            </p>
          </div>
          <p className="text-[10px] text-[#536269] mt-4 font-bold tracking-widest">v2.5 • PORTO • 2025</p>
        </div>

      </div>
    </div>
  );
};

export default MainMenu;