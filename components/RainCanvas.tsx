
import React, { useEffect, useRef, useCallback } from 'react';
import { RainConfig } from '../types';

interface RainCanvasProps {
  config: RainConfig;
}

class RealisticDrop {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
  isSliding: boolean;
  slideWait: number;
  trail: { y: number; opacity: number }[] = [];
  canvasWidth: number;
  canvasHeight: number;

  constructor(width: number, height: number, config: RainConfig, isInitial: boolean = false) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.reset(width, height, config, isInitial);
  }

  reset(width: number, height: number, config: RainConfig, isInitial: boolean = false) {
    this.x = Math.random() * width;
    this.y = isInitial ? Math.random() * height : -50;
    
    const roll = Math.random();
    if (roll > 0.92) {
      // Very large beads
      this.r = (Math.random() * 6 + 4) * config.size; 
      this.isSliding = true;
    } else if (roll > 0.7) {
      // Medium droplets
      this.r = (Math.random() * 3 + 1.5) * config.size;
      this.isSliding = Math.random() > 0.4;
    } else {
      // Fine condensation
      this.r = (Math.random() * 1.2 + 0.4) * config.size;
      this.isSliding = Math.random() > 0.9;
    }

    this.speed = (Math.random() * 0.6 + 0.2) * config.speed;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.slideWait = Math.random() * 100;
    this.trail = [];
  }

  update(config: RainConfig) {
    if (this.isSliding) {
      if (this.slideWait > 0) {
        this.slideWait -= 1;
      } else {
        // Stuttering motion - gravity overcoming surface tension
        const stutter = Math.random() > 0.95 ? 12 : (Math.random() > 0.8 ? 2 : 0.4);
        const oldY = this.y;
        this.y += this.speed * stutter * 5;
        
        // Horizontal drift (train speed)
        this.x -= 0.15 * config.speed;

        // Leave a trail
        if (this.r > 2 && Math.abs(this.y - oldY) > 1) {
          this.trail.push({ y: this.y, opacity: this.opacity * 0.5 });
          if (this.trail.length > 15) this.trail.shift();
        }
      }
    } else {
      // Ambient vibration/drift
      this.x -= 0.02 * config.speed;
    }

    if (this.y > this.canvasHeight + 50) {
      this.reset(this.canvasWidth, this.canvasHeight, config);
    }
    if (this.x < -50) this.x = this.canvasWidth + 50;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Draw the wet trail first
    if (this.trail.length > 0) {
      ctx.beginPath();
      const trailGrad = ctx.createLinearGradient(this.x, this.y - 100, this.x, this.y);
      trailGrad.addColorStop(0, 'rgba(255,255,255,0)');
      trailGrad.addColorStop(1, `rgba(255,255,255,${this.opacity * 0.2})`);
      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = this.r * 0.8;
      ctx.lineCap = 'round';
      ctx.moveTo(this.x, this.y - 60);
      ctx.lineTo(this.x, this.y - this.r);
      ctx.stroke();
    }

    ctx.translate(this.x, this.y);

    // Realistic refraction gradient for the droplet
    const radGrad = ctx.createRadialGradient(
      -this.r * 0.2, -this.r * 0.2, this.r * 0.1, 
      0, 0, this.r
    );
    // Dark core for depth
    radGrad.addColorStop(0, `rgba(0, 0, 0, ${this.opacity * 0.1})`);
    // Light-catching rim
    radGrad.addColorStop(0.5, `rgba(255, 255, 255, ${this.opacity * 0.1})`);
    radGrad.addColorStop(0.85, `rgba(255, 255, 255, ${this.opacity * 0.6})`);
    radGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    // Slightly non-spherical drops for realism
    ctx.ellipse(0, 0, this.r, this.r * (this.isSliding ? 1.1 : 1), 0, 0, Math.PI * 2);
    ctx.fill();

    // Sharp specular highlight (the light reflection)
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 1.5})`;
    ctx.arc(-this.r * 0.4, -this.r * 0.4, this.r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Secondary smaller highlight for "beady" look
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
    ctx.arc(this.r * 0.3, this.r * 0.5, this.r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

const RainCanvas: React.FC<RainCanvasProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const droplets = useRef<RealisticDrop[]>([]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Adjust density based on screen size
    const count = Math.floor((w * h) / 3500); 
    droplets.current = Array.from({ length: Math.min(count, 800) }, () => new RealisticDrop(w, h, config, true));
  }, [config]);

  useEffect(() => {
    init();
    window.addEventListener('resize', init);

    let animationId: number;
    const ctx = canvasRef.current?.getContext('2d');

    const loop = () => {
      if (!ctx || !canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Dynamic glass "fog"
      ctx.fillStyle = `rgba(10, 15, 25, ${0.2 + config.mist * 0.5})`;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Sort or draw carefully to ensure layering? Usually not needed for simple drops
      droplets.current.forEach(d => {
        d.update(config);
        d.draw(ctx);
      });
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationId);
    };
  }, [init, config]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ filter: `blur(${config.mist * 0.5}px)` }}
    />
  );
};

export default RainCanvas;
