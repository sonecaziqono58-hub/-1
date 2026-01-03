
import React, { useEffect, useRef, useCallback } from 'react';
import { RainConfig } from '../types';

interface RainCanvasProps {
  config: RainConfig;
}

class BeadedDroplet {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
  isSliding: boolean;
  slideProgress: number;
  canvasWidth: number;
  canvasHeight: number;

  constructor(width: number, height: number, config: RainConfig, isInitial: boolean = false) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.reset(width, height, config, isInitial);
  }

  reset(width: number, height: number, config: RainConfig, isInitial: boolean = false) {
    this.x = Math.random() * width;
    this.y = isInitial ? Math.random() * height : -30;
    
    const roll = Math.random();
    if (roll > 0.96) {
      this.r = (Math.random() * 4 + 3) * config.size; 
      this.isSliding = true;
    } else if (roll > 0.85) {
      this.r = (Math.random() * 2 + 1) * config.size;
      this.isSliding = Math.random() > 0.5;
    } else {
      this.r = (Math.random() * 0.8 + 0.3) * config.size;
      this.isSliding = Math.random() > 0.95;
    }

    this.speed = (Math.random() * 0.4 + 0.2) * config.speed;
    this.opacity = Math.random() * 0.4 + 0.15;
    this.slideProgress = 0;
  }

  update(config: RainConfig) {
    if (this.isSliding) {
      // Realistic stuttering slide: water accumulates mass before moving
      this.slideProgress += 0.01 * Math.random();
      if (this.slideProgress > 0.5) {
        const acceleration = (this.r / 5) * 4;
        this.y += this.speed * acceleration;
      }
      
      // Horizontal drift (simulating wind/train speed)
      this.x -= 0.12 * config.speed;
    } else {
      // Very slow drift for static condensation
      this.x -= 0.015 * config.speed;
    }

    if (this.y > this.canvasHeight + 30) {
      this.reset(this.canvasWidth, this.canvasHeight, config);
    }
    if (this.x < -30) this.x = this.canvasWidth + 30;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Main bead body - subtle refraction
    const radGrad = ctx.createRadialGradient(
      -this.r * 0.1, -this.r * 0.1, this.r * 0.1, 
      0, 0, this.r
    );
    radGrad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.4})`);
    radGrad.addColorStop(0.7, `rgba(255, 255, 255, ${this.opacity * 0.15})`);
    radGrad.addColorStop(0.9, `rgba(255, 255, 255, ${this.opacity * 0.7})`);
    radGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight - the "sparkle"
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 1.5})`;
    ctx.arc(-this.r * 0.35, -this.r * 0.35, this.r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Subtle trail if sliding
    if (this.isSliding && this.slideProgress > 0.5 && this.r > 2) {
      ctx.beginPath();
      const trailGrad = ctx.createLinearGradient(0, -this.r, 0, -this.r * 4);
      trailGrad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.2})`);
      trailGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
      ctx.fillStyle = trailGrad;
      ctx.ellipse(0, -this.r * 2.5, this.r * 0.4, this.r * 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

const RainCanvas: React.FC<RainCanvasProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const droplets = useRef<BeadedDroplet[]>([]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const count = Math.floor((w * h) / 1800); 
    droplets.current = Array.from({ length: Math.min(count, 1500) }, () => new BeadedDroplet(w, h, config, true));
  }, [config]);

  useEffect(() => {
    init();
    window.addEventListener('resize', init);

    let animationId: number;
    const ctx = canvasRef.current?.getContext('2d');

    const loop = () => {
      if (!ctx || !canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Fog layer
      ctx.fillStyle = `rgba(8, 12, 20, ${0.25 + config.mist * 0.45})`;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

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
      style={{ filter: `blur(${config.mist * 0.8}px)` }}
    />
  );
};

export default RainCanvas;
