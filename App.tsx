
import React, { useState, useEffect } from 'react';
import RainCanvas from './components/RainCanvas';
import RippleEffect from './components/RippleEffect';
import Controls from './components/Controls';
import Editor from './components/Editor';
import MusicPlayer from './components/MusicPlayer';
import { Note, RainConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<RainConfig>({
    size: 1.0,
    speed: 0.5, 
    mist: 0.4
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('nordic_notes');
    if (saved) return JSON.parse(saved);
    return [{
      id: '1',
      content: '窗外的灯火汇聚成模糊的光斑，在雨幕中缓缓移动。列车正带着我们驶向远方，而此刻的时间，只属于文字与思绪。\n\n听着连绵的雨声，心境变得格外安稳。',
      date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }];
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleUpdate = (content: string) => {
    const updatedNotes = [...notes];
    updatedNotes[currentIndex].content = content;
    setNotes(updatedNotes);
  };

  const handleNext = () => {
    if (currentIndex < notes.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleAdd = () => {
    const now = new Date();
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    setNotes([...notes, newNote]);
    setCurrentIndex(notes.length);
  };

  const handleDelete = () => {
    if (notes.length <= 1) {
      handleUpdate('');
      return;
    }
    const updatedNotes = notes.filter((_, i) => i !== currentIndex);
    setNotes(updatedNotes);
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleSave = () => {
    localStorage.setItem('nordic_notes', JSON.stringify(notes));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070a]">
      {/* Deepest Layer - Moody Night Landscape */}
      <div 
        className="absolute inset-0 bg-cover z-0"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1518173946687-a4c8a9b746f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=3000&q=80")',
          filter: `brightness(25%) blur(${30 + config.mist * 25}px) saturate(40%)`,
          animation: 'moving-bg 300s linear infinite',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Mid Layer - City Bokeh Lights (Orbs) */}
      <div 
        className="absolute inset-0 bg-cover z-0 opacity-20 mix-blend-screen pointer-events-none"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80")',
          filter: `blur(45px)`,
          animation: 'moving-bg 80s linear infinite',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 110%',
          transform: 'translateY(-5%)'
        }}
      />

      {/* Bokeh Overlays for extra depth */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full blur-[100px] opacity-[0.05]"
            style={{
              width: `${200 + Math.random() * 400}px`,
              height: `${200 + Math.random() * 400}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? '#4a90e2' : '#e2904a',
              animation: `bokeh-float ${10 + Math.random() * 20}s infinite ease-in-out alternate`
            }}
          />
        ))}
      </div>

      {/* Window Frame & Texture */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]"></div>
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_300px_rgba(0,0,0,0.95)]"></div>
      <div className="absolute inset-0 pointer-events-none z-10 border-[40px] border-black/15 rounded-3xl"></div>

      {/* Rain Physics Layer */}
      <RainCanvas config={config} />
      
      {/* Interactive Water Ripple Layer */}
      <RippleEffect />
      
      {/* Controls */}
      <Controls config={config} setConfig={setConfig} />

      {/* Draggable Editor */}
      <Editor 
        notes={notes}
        currentIndex={currentIndex}
        onUpdate={handleUpdate}
        onNext={handleNext}
        onPrev={handlePrev}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onSave={handleSave}
      />

      {/* Compact Music Player */}
      <MusicPlayer />

      <style>{`
        @keyframes moving-bg {
          from { background-position: 0% 0%; }
          to { background-position: 100% 0%; }
        }
        @keyframes bokeh-float {
          from { transform: translate(0, 0); }
          to { transform: translate(50px, 30px); }
        }
      `}</style>
    </div>
  );
};

export default App;
