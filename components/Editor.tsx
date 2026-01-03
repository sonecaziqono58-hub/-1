
import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';

interface EditorProps {
  notes: Note[];
  currentIndex: number;
  onUpdate: (content: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onAdd: () => void;
  onDelete: () => void;
  onSave: () => void;
}

const Editor: React.FC<EditorProps> = ({ 
  notes, 
  currentIndex, 
  onUpdate, 
  onNext, 
  onPrev, 
  onAdd, 
  onDelete, 
  onSave 
}) => {
  const [time, setTime] = useState(new Date());
  const [pos, setPos] = useState({ x: -300, y: -225 }); // Centered initial offset
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentNote = notes[currentIndex] || { content: '', date: '', time: '' };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPos({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <div 
      onMouseDown={handleMouseDown}
      style={{ 
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        left: '50%',
        top: '50%',
        resize: 'both',
        overflow: 'hidden'
      }}
      className={`absolute z-40 w-[600px] h-[450px] min-w-[350px] min-h-[300px] bg-white/5 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col transition-shadow hover:shadow-white/10 ${isDragging ? 'cursor-grabbing select-none' : ''}`}
    >
      {/* Header / Drag Handle */}
      <div className="drag-handle px-8 pt-8 pb-4 flex justify-between items-end border-b border-white/5 cursor-grab active:cursor-grabbing">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">MEMO DATE</span>
          <h2 className="nordic-font text-2xl font-light text-white/90">
            {currentNote.date || formatDate(time)}
          </h2>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-1">STATION TIME</span>
          <p className="text-sm font-light text-white/60 tabular-nums tracking-wider">
            {formatTime(time)}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-8 py-6 relative">
        <textarea
          value={currentNote.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="在此处记录你的思绪..."
          className="w-full h-full bg-transparent border-none outline-none text-white/80 text-lg leading-relaxed placeholder:text-white/20 resize-none font-light italic focus:ring-0"
        />
      </div>

      {/* Footer Toolbar */}
      <div className="px-8 py-6 flex justify-between items-center bg-black/30 border-t border-white/5">
        <div className="flex items-center space-x-8">
          <button 
            onClick={onPrev}
            disabled={currentIndex <= 0}
            title="Previous"
            className="text-white/40 hover:text-white transition-all transform hover:scale-110 disabled:opacity-10"
          >
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <button 
            onClick={onNext}
            disabled={currentIndex >= notes.length - 1}
            title="Next"
            className="text-white/40 hover:text-white transition-all transform hover:scale-110 disabled:opacity-10"
          >
            <i className="fa-solid fa-arrow-right text-xl"></i>
          </button>
          <button 
            onClick={onAdd}
            title="New Note"
            className="text-white/40 hover:text-white transition-all transform hover:scale-110"
          >
            <i className="fa-solid fa-plus text-xl"></i>
          </button>
        </div>

        <div className="flex items-center space-x-8">
          <button 
            onClick={onDelete}
            title="Delete"
            className="text-red-400/30 hover:text-red-400/80 transition-all transform hover:scale-110"
          >
            <i className="fa-solid fa-trash-can text-xl"></i>
          </button>
          <button 
            onClick={onSave}
            className="bg-white/10 hover:bg-white/20 text-white/90 px-8 py-2.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-medium transition-all active:scale-95 border border-white/10"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
