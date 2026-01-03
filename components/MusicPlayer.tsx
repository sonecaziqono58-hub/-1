
import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("User interaction required for autoplay."));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <div className="flex items-center space-x-4 px-5 py-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl transition-all group-hover:bg-white/10 group-hover:border-white/20">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden relative ${isPlaying ? 'shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''}`}>
           <i className={`fa-solid ${isPlaying ? 'fa-droplet animate-pulse-slow' : 'fa-droplet'} text-white/20 text-lg`}></i>
           {isPlaying && (
             <div className="absolute bottom-1.5 left-0 right-0 flex justify-center items-end space-x-[2px] h-3 px-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white/30 w-[1.5px] rounded-full animate-pulse-fast" style={{ height: `${10 + Math.random()*90}%`, animationDelay: `${i * 0.2}s` }}></div>
                ))}
             </div>
           )}
        </div>
        
        <div className="flex flex-col min-w-[100px]">
          <span className="text-[10px] font-light text-white/80 tracking-widest mb-0.5">Rain ASMR</span>
          <span className="text-[8px] text-white/30 uppercase tracking-[0.1em]">White Noise</span>
        </div>

        <div className="flex items-center space-x-4 ml-1">
          <button onClick={togglePlay} className="text-white/40 hover:text-white transition-all transform active:scale-90">
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-sm`}></i>
          </button>
          <button onClick={toggleMute} className="text-white/20 hover:text-white transition-all">
            <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-[10px]`}></i>
          </button>
        </div>
      </div>
      
      <audio 
        ref={audioRef}
        loop 
        src="https://www.soundjay.com/nature/sounds/rain-03.mp3" 
      />

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes pulse-fast {
          0%, 100% { transform: scaleY(0.4); opacity: 0.2; }
          50% { transform: scaleY(1); opacity: 0.6; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;
