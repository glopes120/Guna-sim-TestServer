import React from 'react';

interface PatienceMeterProps {
  level: number;
}

const PatienceMeter: React.FC<PatienceMeterProps> = ({ level }) => {
  // Color logic
  let textColor = 'text-[#e9edef]';
  let bgGradient = 'bg-[#00a884]';
  let emoji = '😊';
  
  if (level < 20) {
    textColor = 'text-[#ff4444]';
    bgGradient = 'bg-gradient-to-r from-[#ff4444] to-[#cc0000]';
    emoji = '😡';
  } else if (level < 40) {
    textColor = 'text-[#ff8800]';
    bgGradient = 'bg-gradient-to-r from-[#ff8800] to-[#ff6600]';
    emoji = '😠';
  } else if (level < 60) {
    textColor = 'text-[#ffcc00]';
    bgGradient = 'bg-gradient-to-r from-[#ffcc00] to-[#ffaa00]';
    emoji = '😐';
  } else if (level < 80) {
    textColor = 'text-[#88dd00]';
    bgGradient = 'bg-gradient-to-r from-[#88dd00] to-[#66cc00]';
    emoji = '🙂';
  } else {
    textColor = 'text-[#00dd88]';
    bgGradient = 'bg-gradient-to-r from-[#00a884] to-[#00dd88]';
    emoji = '😄';
  }

  return (
    <div className="w-full flex justify-center py-2 md:py-3 sticky top-0 z-10 pointer-events-none">
      <div className="bg-gradient-to-r from-[#182229]/95 to-[#0f1a20]/95 px-4 md:px-5 py-2 md:py-2 rounded-xl md:rounded-lg shadow-sm md:shadow-md border border-[#2a3942]/50 flex items-center gap-2 md:gap-3 backdrop-blur-md">
        <span className="text-lg md:text-xl">{emoji}</span>
        
        <span className="text-[10px] md:text-[11px] font-bold text-[#8696a0] uppercase tracking-wide whitespace-nowrap">
          Paciência
        </span>
        
        {/* Enhanced Bar */}
        <div className="w-20 md:w-24 h-2 md:h-2.5 bg-[#374248]/60 rounded-full overflow-hidden border border-[#2a3942]/30">
          <div 
            className={`h-full transition-all duration-500 ease-out shadow-lg ${bgGradient}`}
            style={{ 
              width: `${Math.max(0, Math.min(100, level))}%`,
              boxShadow: level > 60 ? '0 0 12px rgba(0, 168, 132, 0.6)' : ''
            }}
          />
        </div>

        <span className={`text-xs md:text-sm font-black ${textColor} min-w-[35px] md:min-w-[38px] text-right drop-shadow-lg`}>
          {level}%
        </span>
      </div>
    </div>
  );
};

export default PatienceMeter;