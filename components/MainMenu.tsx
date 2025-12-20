import React, { useState, useEffect } from 'react';
import { GameStatistics } from '../types';

interface MainMenuProps {
  onStartNegotiation: () => void;
  onStartStory: () => void;
  onOpenStats: () => void;
  stats: GameStatistics;
}

// Ícones customizados
const PhoneIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FlameIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c1.5 3 4 4.5 4 7.5 0 3.5-2.5 6-4 6s-4-2.5-4-6c0-3 2.5-4.5 4-7.5zm0 14c1.5 0 2.5 1 2.5 2.5S13.5 21 12 21s-2.5-1-2.5-2.5S10.5 16 12 16z"/>
  </svg>
);

const CrownIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const getRank = (wins: number) => {
  if (wins >= 50) return { 
    title: "REI DA AREOSA", 
    subtitle: "O Dono Disto Tudo", 
    icon: "👑",
    color: "from-yellow-400 via-amber-400 to-orange-500",
    textColor: "text-yellow-300",
    glowColor: "shadow-yellow-500/50"
  };
  if (wins >= 25) return { 
    title: "GUNA PRO", 
    subtitle: "Respeitado na Rua", 
    icon: "🔫",
    color: "from-emerald-400 via-green-400 to-teal-500",
    textColor: "text-emerald-300",
    glowColor: "shadow-emerald-500/50"
  };
  if (wins >= 10) return { 
    title: "MITRA", 
    subtitle: "Já Sabe Negociar", 
    icon: "👟",
    color: "from-cyan-400 via-blue-400 to-indigo-500",
    textColor: "text-cyan-300",
    glowColor: "shadow-cyan-500/50"
  };
  if (wins >= 3) return { 
    title: "CLIENTE", 
    subtitle: "Gosta de Pechinchas", 
    icon: "🧢",
    color: "from-blue-400 via-indigo-400 to-purple-500",
    textColor: "text-blue-300",
    glowColor: "shadow-blue-500/50"
  };
  return { 
    title: "TURISTA", 
    subtitle: "Acabou de Chegar", 
    icon: "📸",
    color: "from-slate-400 via-gray-400 to-zinc-500",
    textColor: "text-slate-300",
    glowColor: "shadow-slate-500/50"
  };
};

const TIPS = [
  { icon: "📱", text: "iPhone 15 Pro Max disponível. Faz proposta!" },
  { icon: "💰", text: "Preço do ouro subiu. Hora de vender o fio." },
  { icon: "🚓", text: "Bófia à paisana na zona. Cuidado!" },
  { icon: "⚡", text: "ZéZé nunca perde. És tu o próximo?" },
  { icon: "🎯", text: "Negociação é arte. Aprende com os melhores." },
  { icon: "🏆", text: "50 vitórias = Rei da Areosa. Consegues?" }
];

const MainMenu: React.FC<MainMenuProps> = ({ onStartNegotiation, onStartStory, onOpenStats, stats }) => {
  const rank = getRank(stats.wins);
  const [currentTip, setCurrentTip] = useState(0);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 4000);

    const pulseInterval = setInterval(() => {
      setShowPulse(prev => !prev);
    }, 2000);

    return () => {
      clearInterval(tipInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden font-sans">
      
      {/* BACKGROUND COM OVERLAY GRADIENT */}
      <div className="absolute inset-0">
        <img 
          src="porto-bg-vertical.png"
          alt="Porto Background" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay com múltiplas camadas */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-blue-900/20"></div>
      </div>

      {/* CONTAINER PRINCIPAL */}
      <div className="relative z-10 h-full flex flex-col max-w-md mx-auto px-5 py-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${rank.color} flex items-center justify-center text-2xl shadow-2xl ${rank.glowColor} transform hover:scale-110 transition-all duration-300`}>
              {rank.icon}
            </div>
            <div>
              <h1 className="text-white font-black text-xl tracking-tight leading-none drop-shadow-lg">
                GUNA SIMULATOR
              </h1>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-0.5">
                Porto Edition
              </p>
            </div>
          </div>
          
          <button 
            onClick={onOpenStats}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <TrophyIcon />
          </button>
        </div>

        {/* RANK CARD - DESTAQUE PRINCIPAL */}
        <div className={`relative mb-6 rounded-3xl bg-gradient-to-br ${rank.color} p-1 shadow-2xl ${rank.glowColor} hover:shadow-3xl transition-all duration-500`}>
          {/* Efeito de brilho animado */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          
          <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-[22px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`text-4xl ${showPulse ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                    {rank.icon}
                  </div>
                  <div>
                    <p className={`font-black text-2xl ${rank.textColor} tracking-tight leading-none drop-shadow-lg`}>
                      {rank.title}
                    </p>
                    <p className="text-gray-400 text-sm font-medium mt-1">
                      {rank.subtitle}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-5xl font-black ${rank.textColor} leading-none drop-shadow-2xl`}>
                  {stats.wins}
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">
                  Vitórias
                </p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mt-4 relative">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${rank.color} rounded-full transition-all duration-1000 ease-out relative`}
                  style={{ width: `${Math.min((stats.wins % 25) * 4, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
              <p className="text-gray-500 text-xs text-center mt-2 font-medium">
                {stats.wins >= 50 ? "NÍVEL MÁXIMO!" : `Faltam ${Math.max(0, Math.ceil(stats.wins / 25) * 25 + (stats.wins % 25 === 0 && stats.wins > 0 ? 25 : 0) - stats.wins)} vitórias para próximo rank`}
              </p>
            </div>
          </div>
        </div>

        {/* BOTÃO PRINCIPAL - NEGOCIAR */}
        <button
          onClick={onStartNegotiation}
          className="group relative mb-4 overflow-hidden rounded-3xl shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 active:scale-[0.98]"
        >
          {/* Background animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Efeito de onda no hover */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </div>

          <div className="relative px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <PhoneIcon />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-white/90 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-full">
                    Modo Principal
                  </span>
                  {showPulse && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  )}
                </div>
                <h2 className="text-white font-black text-2xl tracking-tight leading-none drop-shadow-lg">
                  NEGOCIAR
                </h2>
                <p className="text-emerald-50 text-sm font-medium mt-1 opacity-90">
                  Tenta enganar o Zézé 💰
                </p>
              </div>
            </div>

            <div className="text-white text-3xl group-hover:translate-x-1 transition-transform">
              →
            </div>
          </div>
        </button>

        {/* BOTÕES SECUNDÁRIOS */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* História */}
          <button
            onClick={onStartStory}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md border border-purple-500/30 hover:border-purple-400/50 shadow-xl hover:shadow-purple-500/30 transition-all duration-300 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative p-5">
              <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <BookOpenIcon />
              </div>
              <h3 className="text-white font-bold text-base mb-1 leading-tight">
                História
              </h3>
              <p className="text-gray-400 text-xs font-medium leading-tight">
                RPG na Areosa
              </p>
            </div>
          </button>

          {/* Caderneta */}
          <button
            onClick={onOpenStats}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-md border border-blue-500/30 hover:border-blue-400/50 shadow-xl hover:shadow-blue-500/30 transition-all duration-300 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative p-5">
              <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <TrophyIcon />
              </div>
              <h3 className="text-white font-bold text-base mb-1 leading-tight">
                Caderneta
              </h3>
              <p className="text-gray-400 text-xs font-medium leading-tight">
                Ver Progresso
              </p>
            </div>
          </button>
        </div>

        {/* NEWS TICKER */}
        <div className="mt-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 p-4 shadow-2xl">
            {/* Barra lateral animada */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500">
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                Zézé News • Live
              </p>
            </div>

            <div className="h-8 overflow-hidden relative">
              {TIPS.map((tip, idx) => (
                <div
                  key={idx}
                  className={`absolute w-full flex items-center gap-2 transition-all duration-500 ${
                    idx === currentTip 
                      ? 'translate-y-0 opacity-100' 
                      : idx === currentTip - 1 || (currentTip === 0 && idx === TIPS.length - 1)
                      ? '-translate-y-full opacity-0'
                      : 'translate-y-full opacity-0'
                  }`}
                >
                  <span className="text-lg">{tip.icon}</span>
                  <p className="text-white text-sm font-medium leading-tight">
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
            <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">
              v3.0 • Made in Porto
            </p>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
          </div>
        </div>

      </div>

      {/* Efeito de partículas flutuantes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default MainMenu;