import React, { useState, useEffect } from 'react';

interface ZezeAvatarProps {
  patience: number;
  isThinking: boolean;
}

const ZezeAvatar: React.FC<ZezeAvatarProps> = ({ patience, isThinking }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emoji, setEmoji] = useState('');

  // Random blink logic
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
      const nextBlink = Math.random() * 4000 + 2000;
      setTimeout(triggerBlink, nextBlink);
    };

    const timeoutId = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Emoji display based on state
  useEffect(() => {
    let currentEmoji = '';
    
    if (patience < 20) {
      currentEmoji = '😡';
    } else if (patience < 40) {
      currentEmoji = '😠';
    } else if (isThinking) {
      currentEmoji = '🤔';
    } else if (patience > 80) {
      currentEmoji = '😄';
    } else {
      currentEmoji = '😏';
    }
    
    setEmoji(currentEmoji);
    setShowEmoji(true);
    
    const timer = setTimeout(() => setShowEmoji(false), 2000);
    return () => clearTimeout(timer);
  }, [patience, isThinking]);

  let containerClasses = "w-full h-full object-cover transition-transform duration-300 ";
  
  if (patience < 30) {
    containerClasses += "animate-shake grayscale-[0.2] contrast-125 saturate-150";
  } else if (isThinking) {
    containerClasses += "animate-pulse-joy scale-105"; 
  } else if (patience > 75) {
    containerClasses += "animate-float brightness-110";
  } else {
    containerClasses += "animate-float";
  }

  const blinkStyle = isBlinking ? { transform: 'scaleY(0.1)', transformOrigin: 'center' } : {};

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-300 to-slate-400">
        <img 
            src="https://picsum.photos/seed/zeze/200/200?grayscale" 
            alt="Zézé" 
            className={containerClasses}
            style={blinkStyle}
        />
        
        {/* Emoji floating indicator */}
        {showEmoji && (
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce-subtle">
                {emoji}
            </div>
        )}
        
        {/* Anger indicator */}
        {patience < 20 && (
            <div className="absolute top-1 right-1 text-lg font-bold animate-pulse text-red-500">
                💢
            </div>
        )}
        
        {/* Money eyes (happy) */}
        {patience > 75 && !isThinking && (
            <div className="absolute -bottom-1 -right-2 text-lg animate-twinkle">
                💰
            </div>
        )}
        
        {/* Thinking indicator */}
        {isThinking && (
            <div className="absolute top-1 left-1 text-lg animate-spin-smooth">
                ⚙️
            </div>
        )}

        {/* Patience glow effect */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `inset 0 0 20px rgba(0, 168, 132, ${Math.max(0, (100 - patience) / 200)})`,
            background: `radial-gradient(circle, rgba(0, 168, 132, ${(100 - patience) / 400}) 0%, transparent 70%)`
          }}
        />
    </div>
  );
};

export default ZezeAvatar;