import React, { useState, useEffect, useRef } from 'react';
import { sendGunaMessage, generateStoryTurn } from './services/geminiService';
import { GameState, GameStatus, Message, GameStatistics, GameResult, ImageSize } from './types';
import ChatMessage from './components/ChatMessage';
import PatienceMeter from './components/PatienceMeter';
import ZezeAvatar from './components/ZezeAvatar';
import StatsModal from './components/StatsModal';
import StoryControls from './components/StoryControls';
import MainMenu from './components/MainMenu';
import { loadStats, saveStats, clearStats } from './utils/storageUtils';

// Web Speech API Type Definition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Icons
const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-[#8696a0]">
    <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
  </svg>
);
const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white">
    <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2.002z"></path>
  </svg>
);
const HandshakeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-[#e9edef]">
    <path d="M18 2.01L7 2c-2.76 0-5 2.24-5 5v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7.01c0-2.76-2.24-5-5-5zm-1.8 13.9l-2.78-1.12c-.55-.22-.9-.76-.9-1.35V7.5c0-1.1-.9-2-2-2s-2 .9-2 2v2.33c-.45.18-.84.47-1.15.84-.7.83-.88 1.95-.49 2.96l1.24 3.23c.36.93 1.25 1.54 2.24 1.54h2.46c1.37 0 2.65-.77 3.32-2l.06-.1z"></path>
  </svg>
);
const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
  </svg>
);
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white">
    <path d="M23 7l-6 5 6 5V7zM15 5H2c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"></path>
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-white">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
  </svg>
);
const SmileyIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" className="fill-[#8696a0]">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm0-18c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm4.5 7c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm-9 0c.828 0 1.5.672 1.5 1.5S8.328 12.5 7.5 12.5 6 11.828 6 11s.672-1.5 1.5-1.5zm4.5 9c-2.485 0-4.5-2.015-4.5-4.5h9c0 2.485-2.015 4.5-4.5 4.5z"></path>
  </svg>
);
const ClipIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" className="fill-[#8696a0]">
        <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512 1.28 1.28-5.514 5.514c-1.497 1.497-3.96 1.429-5.418-.038a3.813 3.813 0 0 1 0-5.384l7.916-7.915c1.211-1.211 3.224-1.211 4.439 0 .609.609.944 1.418.944 2.278 0 .86-.335 1.669-.944 2.278L9.418 17.653a3.633 3.633 0 0 1-2.576 1.079 3.636 3.636 0 0 1-2.577-1.079 3.642 3.642 0 0 1-1.077-2.578 3.655 3.655 0 0 1 1.077-2.578l.002-.001z"></path>
    </svg>
)

const OPENING_LINES = [
  "Ei sócio! Xira aí! Tenho aqui uma cena que até te saltam as vistas! Um iPhone 15 Pro Max, caído do camião... quer dizer, novinho em folha! É máquina de guerra, tá-se a ber? 800 paus e é teu.",
  "Oube lá mano! Psst! Anda cá! Queres um telemóvel topo de gama? iPhone 15, coisa fina. O antigo dono... digamos que já não precisa dele. 800 aéreos.",
  "Boas chefe! Tás com cara de quem precisa de um upgrade e curte do FCP! Tenho aqui o bicho! iPhone 15 Pro Max. Ainda cheira a novo! Só 800 paus para ti.",
];

const getRandomLine = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

const getEndingImagePrompt = (status: GameStatus): string | null => {
  switch (status) {
    case GameStatus.WON:
      return "Uma imagem cinematográfica de celebração: pessoa feliz segurando um iPhone 15 Pro Max, iluminação dramática, realista, alta resolução";
    case GameStatus.LOST:
      return "Uma imagem dramática de desalento: pessoa desapontada a afastar-se com um ambiente urbano noturno, realista, alta resolução";
    case GameStatus.DRAW:
      return "Uma imagem de impasse: duas pessoas afastando-se, expressão neutra, cenário urbano tenso, realista, alta resolução";
    default:
      return null;
  }
};

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  const [inMainMenu, setInMainMenu] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPriceAnimating, setIsPriceAnimating] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  const [stats, setStats] = useState<GameStatistics>(loadStats);

  const [gameState, setGameState] = useState<GameState>(() => ({
    mode: 'negotiation',
    patience: 50,
    currentPrice: 800,
    status: GameStatus.PLAYING,
    turnCount: 0,
    messages: [
      {
        id: Date.now().toString(),
        sender: 'zeze',
        text: getRandomLine(OPENING_LINES)
      }
    ],
    storyOptions: [],
    isStoryLoading: false,
    imageSize: '1K'
  }));

  // [MODIFICAÇÃO 1] Scroll com delay para dar tempo ao teclado de abrir
  useEffect(() => {
    setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, 100);
  }, [gameState.messages, isLoading, gameState.storyOptions, isGeneratingVideo]);

  useEffect(() => {
      const generateEndingVisual = async () => {
          if (gameState.status !== GameStatus.PLAYING && gameState.mode === 'negotiation') {
              const prompt = getEndingImagePrompt(gameState.status);
              if (prompt) {
                  const msgId = `ending-${Date.now()}`;
                  setGameState(prev => ({
                      ...prev,
                      messages: [...prev.messages, { id: msgId, sender: 'system', text: "A gerar final..." }]
                  }));
                  
                  try {
                        console.log('📸 Imagem final desativada (quota esgotada)');
                        setGameState(prev => ({
                          ...prev,
                          messages: prev.messages.map(m => 
                            m.id === msgId ? { ...m, text: "FIM DE JOGO" } : m
                          )
                        }));
                  } catch (e) {
                      console.error("Ending image failed", e);
                  }
              }
          }
      };
      
      generateEndingVisual();
  }, [gameState.status, gameState.mode, gameState.imageSize]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
       if (SpeechRecognition) {
         const recognition = new SpeechRecognition();
         recognition.continuous = false;
         recognition.interimResults = true;
         recognition.lang = 'pt-PT';
         recognition.onstart = () => { setIsListening(true); setSpeechError(null); };
         recognition.onend = () => { setIsListening(false); };
         recognition.onresult = (event: any) => {
           const currentTranscript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
           setInput(currentTranscript);
         };
         recognition.onerror = (event: any) => {
             if (event.error !== 'no-speech') console.error("Speech Error", event.error);
             setIsListening(false);
             let msg = "Erro no áudio";
             if (event.error === 'network') msg = "Falha na ligação";
             else if (event.error === 'not-allowed') msg = "Sem permissão";
             else if (event.error === 'no-speech') return;
             setSpeechError(msg);
             setTimeout(() => setSpeechError(null), 3500);
         };
         recognitionRef.current = recognition;
       }
    }
  }, []);

  const toggleAudio = () => {
    initAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) { setSpeechError("Navegador não suportado"); return; }
    if (isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
    } else {
      setSpeechError(null);
      try { recognitionRef.current.abort(); } catch (e) {}
      setTimeout(() => { try { recognitionRef.current.start(); } catch (e) {} }, 150);
    }
  };

  const processImagePrompt = async (messageId: string, imagePrompt: string | undefined, currentSize: ImageSize) => {
    if (!imagePrompt) return;
    console.log('📸 Geração de imagens desativada (quota esgotada)');
    return;
  };

  const handleNegotiationMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    if (isListening) { try { recognitionRef.current.stop(); } catch(e){} }
    if (isAudioEnabled) initAudio();

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: text };
    setGameState(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendGunaMessage(gameState, text);
      const newPatience = Math.max(0, Math.min(100, gameState.patience + response.patienceChange));
      
      const zezeMsgId = (Date.now() + 1).toString();
      const zezeMsg: Message = { id: zezeMsgId, sender: 'zeze', text: response.text };

      setGameState(prev => ({
        ...prev,
        patience: newPatience,
        currentPrice: response.newPrice,
        status: response.gameStatus,
        turnCount: prev.turnCount + 1,
        messages: [...prev.messages, zezeMsg]
      }));

      processImagePrompt(zezeMsgId, response.imagePrompt, gameState.imageSize);

      if (response.gameStatus !== GameStatus.PLAYING) {
         console.log('🎮 JOGO TERMINOU! Status:', response.gameStatus);
         const result: GameResult = {
             outcome: response.gameStatus as any,
             finalPrice: response.newPrice,
             timestamp: Date.now()
         };
         const newStats = { ...stats };
         newStats.gamesPlayed++;
         newStats.totalTurns += gameState.turnCount + 1;
         newStats.recentResults = [result, ...newStats.recentResults].slice(0, 5);
         
         if (response.gameStatus === GameStatus.WON) {
             newStats.wins++;
             if (!newStats.bestDeal || response.newPrice < newStats.bestDeal) {
                 newStats.bestDeal = response.newPrice;
             }
         } else {
             newStats.losses++;
         }
         
         if (response.newPrice < newStats.lowestPriceSeen) newStats.lowestPriceSeen = response.newPrice;
         
         setStats(newStats);
         saveStats(newStats);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📹 Video uploads disabled - Veo video generation removed');
    return;
  };

  const startStoryMode = async () => {
    setInMainMenu(false);
    setGameState(prev => ({
      ...prev,
      mode: 'story',
      patience: 100, 
      currentPrice: 0,
      status: GameStatus.PLAYING,
      turnCount: 0,
      messages: [],
      storyOptions: [],
      isStoryLoading: true
    }));
    setShowMenu(false);

    try {
      const storyTurn = await generateStoryTurn("", "");
      const msgId = Date.now().toString();
      const msg: Message = { id: msgId, sender: 'zeze', text: storyTurn.narrative };
      
      setGameState(prev => ({
        ...prev,
        messages: [msg],
        storyOptions: storyTurn.options,
        isStoryLoading: false
      }));

      processImagePrompt(msgId, storyTurn.imagePrompt, gameState.imageSize);

    } catch (e) {
      console.error(e);
      setGameState(prev => ({ ...prev, isStoryLoading: false }));
    }
  };

  const handleStoryChoice = async (choice: string) => {
    setGameState(prev => ({
        ...prev,
        storyOptions: [], 
        isStoryLoading: true,
        messages: [...prev.messages, { id: Date.now().toString(), sender: 'user', text: choice }]
    }));

    const history = gameState.messages.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n');

    try {
        const storyTurn = await generateStoryTurn(history, choice);
        const msgId = (Date.now() + 1).toString();
        const msg: Message = { id: msgId, sender: 'zeze', text: storyTurn.narrative };
        
        const newStatus = storyTurn.gameOver ? GameStatus.WON : GameStatus.PLAYING; 
        
        setGameState(prev => ({
            ...prev,
            messages: [...prev.messages, msg],
            storyOptions: storyTurn.options,
            status: newStatus,
            isStoryLoading: false
        }));

        processImagePrompt(msgId, storyTurn.imagePrompt, gameState.imageSize);

    } catch (e) {
        setGameState(prev => ({ ...prev, isStoryLoading: false }));
    }
  };

  const startNegotiationGame = () => {
    setInMainMenu(false);
    setGameState({
      mode: 'negotiation',
      patience: 50,
      currentPrice: 800,
      status: GameStatus.PLAYING,
      turnCount: 0,
      messages: [{ id: Date.now().toString(), sender: 'zeze', text: getRandomLine(OPENING_LINES) }],
      storyOptions: [],
      isStoryLoading: false,
      imageSize: gameState.imageSize 
    });
    setShowMenu(false);
  };

  const handleBackToMenu = () => {
      setInMainMenu(true);
      setShowMenu(false);
  };

  const restartNegotiation = () => {
    startNegotiationGame();
  };

  const handleImageSizeChange = (size: ImageSize) => {
    setGameState(prev => ({ ...prev, imageSize: size }));
    setShowMenu(false);
  }

  const handleMainButtonClick = () => {
    if (gameState.mode === 'negotiation') {
        if (isListening) toggleListening();
        else if (input.trim()) handleNegotiationMessage(input);
        else toggleListening();
    }
  };

  return (
    // [MODIFICAÇÃO 2] Altura Dinâmica (100dvh) para mobile
    <div className="flex justify-center items-center h-[100dvh] w-screen bg-gradient-to-br from-[#000000] via-[#0b141a] to-[#000000] p-0 md:p-4 lg:p-6 font-sans fixed inset-0 supports-[height:100svh]:h-[100svh]">
      <StatsModal stats={stats} isOpen={showStats} onClose={() => setShowStats(false)} onReset={() => setStats(clearStats())} />

      <div className="w-full h-full md:w-full md:h-[90vh] lg:max-w-[500px] lg:max-h-[850px] md:rounded-[28px] bg-[#0b141a] shadow-2xl flex flex-col overflow-hidden relative border-0 md:border md:border-[#2a3942]/30 md:hover:border-[#00a884]/20 md:transition-all md:duration-500">
        
        <div className="hidden md:block absolute inset-0 rounded-[28px] pointer-events-none bg-gradient-to-b from-[#00a884]/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        
        {inMainMenu ? (
          <MainMenu 
            onStartNegotiation={startNegotiationGame} 
            onStartStory={startStoryMode} 
            onOpenStats={() => setShowStats(true)} 
          />
        ) : (
          <>
            {showMenu && (
                <div className="absolute top-14 right-2 md:right-4 bg-gradient-to-br from-[#202c33] to-[#1a2326] rounded-xl shadow-2xl z-50 border border-[#2a3942]/60 py-2 min-w-[220px] md:min-w-[240px] animate-slide-in-right backdrop-blur-subtle max-h-[60vh] overflow-y-auto">
                    <button onClick={handleBackToMenu} className="w-full text-left px-4 py-3 hover:bg-[#00a884]/10 text-[#e9edef] flex items-center gap-3 transition-colors group text-sm md:text-base">
                        <span className="text-xl group-hover:scale-125 transition-transform">🏠</span> 
                        <span className="font-medium">Menu Principal</span>
                    </button>
                    <button onClick={restartNegotiation} className="w-full text-left px-4 py-3 hover:bg-[#00a884]/10 text-[#e9edef] flex items-center gap-3 transition-colors group text-sm md:text-base">
                        <span className="text-xl group-hover:scale-125 transition-transform">🔄</span> 
                        <span className="font-medium">Reiniciar Jogo</span>
                    </button>
                    <div className="divider-glow my-2"></div>
                    <div className="px-4 py-2 text-xs text-[#8696a0] font-bold uppercase">Qualidade Imagem</div>
                    <div className="flex px-4 gap-2 mb-2">
                        {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                          <button 
                            key={size}
                            onClick={() => handleImageSizeChange(size)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all active:scale-95 ${gameState.imageSize === size ? 'bg-gradient-to-r from-[#00a884] to-[#008f6f] text-white border-[#00d9a3] shadow-lg shadow-[#00a884]/30' : 'text-[#8696a0] border-[#2a3942] hover:border-[#00a884]/50'}`}
                          >
                            {size}
                          </button>
                        ))}
                    </div>
                    <div className="divider-glow my-2"></div>
                    <button onClick={() => setShowStats(true)} className="w-full text-left px-4 py-3 hover:bg-[#00a884]/10 text-[#e9edef] flex items-center gap-3 transition-colors group text-sm md:text-base">
                        <span className="text-xl group-hover:scale-125 transition-transform">📊</span> 
                        <span className="font-medium">Caderneta</span>
                    </button>
                </div>
            )}

            <div className="px-2 md:px-3 py-2 md:py-2.5 bg-gradient-to-r from-[#202c33] to-[#1a2326] flex justify-between items-center z-20 shrink-0 shadow-md border-b border-[#2a3942]/40">
              <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                <button onClick={handleBackToMenu} className="p-2 hover:bg-[#2a3942]/60 rounded-full transition-all duration-200 flex-shrink-0">
                    <BackArrowIcon />
                </button>
                <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer hover:bg-[#2a3942]/40 p-1 md:p-1.5 rounded-lg transition-all duration-200 min-w-0 flex-1 md:flex-none" onClick={() => setShowMenu(!showMenu)}>
                  <div className="w-10 md:w-11 h-10 md:h-11 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#00a884]/60 bg-gradient-to-br from-slate-700 to-black shadow-lg shadow-[#00a884]/20">
                    <ZezeAvatar patience={gameState.mode === 'story' ? 100 : gameState.patience} isThinking={isLoading || gameState.isStoryLoading} />
                  </div>
                  <div className="flex flex-col justify-center min-w-0 flex-1 md:flex-none">
                    <div className="text-[#e9edef] font-bold text-[13px] md:text-[15px] leading-tight flex items-center gap-1 truncate">
                      Zézé 
                      {gameState.mode === 'story' && <span className="text-[#00a884] text-[8px] md:text-[10px] font-black bg-[#00a884]/20 px-1.5 py-0.5 rounded-full border border-[#00a884]/40 flex-shrink-0">RPG</span>}
                    </div>
                    <div className="text-[#8696a0] text-[11px] md:text-[12px] truncate font-medium">
                      {isLoading || gameState.isStoryLoading ? "✍️ a escrever..." : (isGeneratingVideo ? "🎬 a processar..." : "🟢 Online")}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 px-1 md:px-2 flex-shrink-0">
                <button onClick={toggleAudio} className={`p-2 rounded-full transition-all duration-200 ${isAudioEnabled ? "bg-[#00a884]/30 text-[#00a884]" : "text-[#8696a0] hover:text-[#00a884]"}`}><VideoIcon /></button>
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-[#2a3942]/60 transition-all duration-200 text-[#e9edef]"><MenuIcon /></button>
              </div>
            </div>

            {gameState.mode === 'negotiation' && (
                <div className="bg-gradient-to-r from-[#182229]/80 to-[#0f1a20]/80 px-3 md:px-4 py-2 flex justify-center border-b border-[#00a884]/20 z-10 backdrop-blur-sm">
                <span className={`text-[11px] md:text-xs font-black text-[#00a884] uppercase flex items-center gap-1.5 md:gap-2 tracking-wider ${isPriceAnimating ? 'animate-price' : ''}`}>
                    📱 iPhone 15 • <span className="text-[#00d9a3] font-black text-[12px] md:text-sm drop-shadow-lg">{gameState.currentPrice}€</span>
                </span>
                </div>
            )}

            <div className="relative flex-1 bg-[#0b141a] overflow-hidden w-full">
                <div className="absolute inset-0 wa-bg pointer-events-none opacity-40"></div>
                <div ref={scrollRef} className="relative h-full overflow-y-auto p-3 md:p-4 space-y-2">
                  {gameState.mode === 'negotiation' && <PatienceMeter level={gameState.patience} />}
                  {gameState.messages.map((msg, idx) => (
                    <div key={msg.id} className={idx === gameState.messages.length - 1 ? 'animate-slide-in-left' : ''}>
                      <ChatMessage message={msg} />
                    </div>
                  ))}
                  
                  {gameState.mode === 'negotiation' && gameState.status !== GameStatus.PLAYING && (
                      <div className="flex justify-center mt-6 pt-4 animate-bounce-subtle">
                          <button onClick={restartNegotiation} className="bg-gradient-to-r from-[#00a884] to-[#008f6f] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full border-2 border-[#00d9a3] hover:shadow-[0_8px_20px_rgba(0,168,132,0.4)] font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg text-sm md:text-base">
                              🎮 JOGAR NOVAMENTE
                          </button>
                      </div>
                  )}
                  
                  <div className="h-4"></div>
                </div>
            </div>

            {gameState.mode === 'story' ? (
                <StoryControls 
                    options={gameState.storyOptions} 
                    onChoose={handleStoryChoice} 
                    isLoading={gameState.isStoryLoading} 
                    gameOver={gameState.status !== GameStatus.PLAYING}
                    onRestart={startStoryMode}
                />
            ) : (
                // [MODIFICAÇÃO 3] Padding Bottom Dinâmico para Safe Area
                <div className="bg-gradient-to-t from-[#202c33] to-[#1a2326] p-2 md:p-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-end gap-1.5 md:gap-2 shrink-0 z-20 relative shadow-2xl border-t border-[#2a3942]/40">
                    {speechError && (
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-red-600/95 text-white text-xs font-bold px-3 md:px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50 whitespace-nowrap border border-red-500/50">
                            ⚠️ {speechError}
                        </div>
                    )}
                    <div className="flex-1 bg-gradient-to-r from-[#2a3942]/80 to-[#202c33]/80 rounded-[20px] md:rounded-[24px] px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-1.5 md:gap-2 min-h-[42px] md:min-h-[44px] border border-[#2a3942]/50 backdrop-blur-sm hover:border-[#00a884]/30 transition-colors">
                        <button className="p-1.5 hover:bg-[#374248]/60 rounded-full transition-colors hidden md:block flex-shrink-0"><SmileyIcon /></button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMainButtonClick()}
                            disabled={gameState.status !== GameStatus.PLAYING || isLoading}
                            placeholder={isListening ? "🎤 A ouvir..." : (gameState.status === GameStatus.PLAYING ? "Mensagem" : "Bloqueado")}
                            className={`bg-transparent text-[#e9edef] placeholder-[#8696a0] text-[14px] md:text-[15px] flex-1 outline-none w-full font-medium ${isListening ? 'animate-pulse text-[#00a884]' : ''}`}
                        />
                        <input 
                          type="file" 
                          accept="image/*" 
                          ref={fileInputRef} 
                          className="hidden" 
                          onChange={handleFileUpload}
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()} 
                          className={`p-1.5 hover:bg-[#374248]/60 rounded-full transition-all duration-200 flex-shrink-0 ${isGeneratingVideo ? 'animate-spin-smooth text-[#00a884]' : ''}`}
                          disabled={isGeneratingVideo}
                        >
                          <ClipIcon />
                        </button>
                    </div>
                    
                    {gameState.status === GameStatus.PLAYING && input.length === 0 && !isListening && (
                        <button onClick={() => handleNegotiationMessage(`ACEITO O NEGÓCIO POR ${gameState.currentPrice} EUROS!`)} className="w-10 md:w-11 h-10 md:h-11 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-[#008f6f] to-[#006b52] hover:from-[#00a884] hover:to-[#008f6f] border-2 border-[#00d9a3]/50 hover:border-[#00d9a3] flex-shrink-0 transition-all active:scale-90 md:hover-lift touch-manipulation">
                            <HandshakeIcon />
                        </button>
                    )}

                    <button 
                        onClick={handleMainButtonClick}
                        disabled={isLoading || gameState.status !== GameStatus.PLAYING}
                        className={`w-10 md:w-11 h-10 md:h-11 rounded-full flex items-center justify-center shadow-lg transition-all flex-shrink-0 active:scale-90 touch-manipulation border-2 ${isListening ? 'bg-red-600/90 border-red-500 animate-pulse shadow-lg shadow-red-600/40' : 'bg-gradient-to-br from-[#00a884] to-[#008f6f] hover:from-[#00d9a3] hover:to-[#00a884] border-[#00d9a3]/50 hover:border-[#00d9a3] md:hover:shadow-lg md:hover:shadow-[#00a884]/40'}`}
                    >
                        {isListening ? <MicIcon /> : (input.trim() ? <SendIcon /> : <MicIcon />)}
                    </button>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}