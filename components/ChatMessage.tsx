


import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isZeze = message.sender === 'zeze';

  // Generate a fake timestamp based on message ID if it's a number, or current time
  const getTime = () => {
    try {
      const date = new Date(parseInt(message.id));
      if (isNaN(date.getTime())) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Now";
    }
  };

  return (
    <div className={`flex w-full mb-3 ${isZeze ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`relative max-w-[85%] md:max-w-[70%] px-3 py-2 shadow-lg text-[15px] leading-snug font-medium transition-all
          ${isZeze 
            ? 'bg-gradient-to-br from-[#202c33] to-[#1a2326] text-[#e9edef] rounded-tr-xl rounded-br-xl rounded-bl-xl rounded-tl-none border border-[#2a3942]/40 shadow-[0_2px_8px_rgba(0,0,0,0.3)]' 
            : 'bg-gradient-to-br from-[#005c4b] to-[#004838] text-[#e9edef] rounded-tl-xl rounded-bl-xl rounded-br-xl rounded-tr-none border border-[#00a884]/30 shadow-[0_2px_8px_rgba(0,168,132,0.2)]'}
        `}
      >
        {/* Tail SVGs with enhanced style */}
        {isZeze && (
          <span className="absolute top-0 -left-[10px] w-[10px] h-[14px] overflow-hidden">
            <svg viewBox="0 0 8 13" width="10" height="14" className="fill-[#202c33]">
              <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
            </svg>
          </span>
        )}
        {!isZeze && (
          <span className="absolute top-0 -right-[10px] w-[10px] h-[14px] overflow-hidden">
            <svg viewBox="0 0 8 13" width="10" height="14" className="fill-[#005c4b]">
              <path d="M6.467 3.568L0 12.193V1h5.188c1.77 1 2.338 2.156 1.279 3.568z"></path>
            </svg>
          </span>
        )}

        {/* Sender Name */}
        {isZeze && (
          <div className="text-[12px] font-black text-[#c07c14] mb-1 px-0.5 tracking-wide uppercase">
            ~ Zézé da Areosa 🎯
          </div>
        )}

        {/* Generated Image */}
        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden border-2 border-[#2a3942]/60 bg-black shadow-md hover:shadow-lg transition-shadow">
            <img src={message.imageUrl} alt="Generated Scene" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        )}

        {/* Generated Video */}
        {message.videoUrl && (
          <div className="mb-2 rounded-lg overflow-hidden border-2 border-[#2a3942]/60 bg-black shadow-md">
            <video 
              src={message.videoUrl} 
              controls 
              autoPlay 
              loop 
              muted 
              className="w-full h-auto object-cover" 
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}
        
        <div className="px-1 pt-0.5 pb-5 break-words whitespace-pre-wrap text-sm md:text-base">
          {message.text}
        </div>

        {/* Timestamp & Checks */}
        <div className="absolute bottom-1 right-2 flex items-end gap-1 select-none">
          <span className="text-[10px] text-[#8696a0] font-light min-w-fit opacity-75">
            {getTime()}
          </span>
          {!isZeze && (
             // Double Blue Check
             <svg viewBox="0 0 16 11" width="16" height="11" className="fill-[#53bdeb]">
                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032L6.27 7.775a.365.365 0 0 0-.513.063l-.435.452a.375.375 0 0 0 .075.56L7.53 11.22a.5.5 0 0 0 .736.005l6.749-7.349a.375.375 0 0 0-.005-.56zm-5.01 3.743l-.956.996.35.35c.49.546 1.345.556 1.84.02L15.346 3.97a.56.56 0 0 0-.816-.763l-4.52 4.918zM4.77 1.29l3.96 4.316.51-.51L4.85 0 .61 4.54l.49.51 3.67-3.76z"></path>
             </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

