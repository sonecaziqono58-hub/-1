
import React from 'react';
import { RainConfig } from '../types';

interface ControlsProps {
  config: RainConfig;
  setConfig: (config: RainConfig) => void;
}

const Controls: React.FC<ControlsProps> = ({ config, setConfig }) => {
  const handleChange = (key: keyof RainConfig, value: number) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-12 px-10 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all hover:bg-white/10">
      <div className="flex items-center space-x-4">
        <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase font-medium">Size</span>
        <input 
          type="range" min="0.1" max="2" step="0.1" 
          value={config.size} 
          onChange={(e) => handleChange('size', parseFloat(e.target.value))}
          className="w-24 cursor-pointer"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase font-medium">Speed</span>
        <input 
          type="range" min="0.1" max="3" step="0.1" 
          value={config.speed} 
          onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
          className="w-24 cursor-pointer"
        />
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase font-medium">Mist</span>
        <input 
          type="range" min="0" max="1" step="0.05" 
          value={config.mist} 
          onChange={(e) => handleChange('mist', parseFloat(e.target.value))}
          className="w-24 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Controls;
