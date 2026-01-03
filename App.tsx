
import React, { useState, useEffect } from 'react';
import RainCanvas from './components/RainCanvas';
import RippleEffect from './components/RippleEffect';
import Controls from './components/Controls';
import Editor from './components/Editor';
import MusicPlayer from './components/MusicPlayer';
import { Note, RainConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<RainConfig>({
    size: 1.2,
    speed: 0.45, 
    mist: 0.35
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('nordic_notes');
    if (saved) return JSON.parse(saved);
    return [{
      id: '1',
      content: '雨水如珠，在温热的指尖划过玻璃时化作涟漪。列车正穿过城市的霓虹，那些模糊的光斑像是融化的梦境。\n\n深夜的旅途，总是让人想要留下些什么。',
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#04060b]">
      {/* Background - Far city silhouettes and moody sky */}
      <div 
        className="absolute inset-0 bg-cover z-0"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=3000&q=80")',
          filter: `brightness(20%) blur(${25 + config.mist * 20}px) saturate(30%)`,
          animation: 'moving-bg 400s linear infinite',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Midground - Stronger Bokeh Light Orbs */}
      <div 
        className="absolute inset-0 bg-cover z-0 opacity-30 mix-blend-screen pointer-events-none"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1485846234645-a62644efb4e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80")',
          filter: `blur(40px) brightness(1.5)`,
          animation: 'moving-bg 120s linear infinite',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 115%',
          transform: 'translateY(-2%)'
        }}
      />

      {/* Dynamic Floating Bokeh Spots */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full blur-[120px] opacity-[0.08]"
            style={{
              width: `${300 + Math.random() * 500}px`,
              height: `${300 + Math.random() * 500}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? '#5da9ff' : (i % 3 === 1 ? '#ffb35d' : '#ff5d5d'),
              animation: `bokeh-float ${15 + Math.random() * 30}s infinite ease-in-out alternate`
            }}
          />
        ))}
      </div>

      {/* Glass Pane Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen-2.png')]"></div>
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_400px_rgba(0,0,0,1)]"></div>
      <div className="absolute inset-0 pointer-events-none z-10 border-[50px] border-black/20 rounded-[3rem]"></div>

      {/* Rain Physics Layer */}
      <RainCanvas config={config} />
      
      {/* Interactive Water Ripple Layer */}
      <RippleEffect />
      
      {/* HUD Controls */}
      <Controls config={config} setConfig={setConfig} />

      {/* Editor Window */}
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

      {/* Rain White Noise */}
      <MusicPlayer />

      <style>{`
        @keyframes moving-bg {
          from { background-position: 0% 0%; }
          to { background-position: 100% 0%; }
        }
        @keyframes bokeh-float {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(100px, 60px) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default App;
