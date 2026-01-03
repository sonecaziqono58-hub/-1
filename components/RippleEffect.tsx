
import React, { useEffect, useRef } from 'react';

const RippleEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = Math.floor(window.innerWidth / 2);
    let height = Math.floor(window.innerHeight / 2);
    canvas.width = width;
    canvas.height = height;

    const damping = 0.99; 
    const size = width * height;
    let buffer1 = new Float32Array(size);
    let buffer2 = new Float32Array(size);
    let temp: Float32Array;

    const handleResize = () => {
      width = Math.floor(window.innerWidth / 2);
      height = Math.floor(window.innerHeight / 2);
      canvas.width = width;
      canvas.height = height;
      const newSize = width * height;
      buffer1 = new Float32Array(newSize);
      buffer2 = new Float32Array(newSize);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.floor(e.clientX / 2);
      const y = Math.floor(e.clientY / 2);
      
      const radius = 8;
      for (let j = -radius; j <= radius; j++) {
        for (let i = -radius; i <= radius; i++) {
          if (i * i + j * j <= radius * radius) {
            const nx = x + i;
            const ny = y + j;
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
              buffer1[ny * width + nx] = 1500; 
            }
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const update = () => {
      const img = ctx.createImageData(width, height);
      const data = img.data;

      for (let i = width; i < size - width; i++) {
        buffer2[i] = (
          (buffer1[i - 1] + 
           buffer1[i + 1] + 
           buffer1[i - width] + 
           buffer1[i + width]) >> 1
        ) - buffer2[i];
        
        buffer2[i] = buffer2[i] * damping;

        const val = buffer2[i];
        const index = i * 4;
        
        if (val > 0.1) {
            // Refraction shimmer
            data[index] = 255;     
            data[index + 1] = 255; 
            data[index + 2] = 255; 
            data[index + 3] = Math.min(val * 0.5, 90); 
        }
      }

      ctx.putImageData(img, 0, 0);
      temp = buffer1;
      buffer1 = buffer2;
      buffer2 = temp;

      requestAnimationFrame(update);
    };

    const animationId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ 
        mixBlendMode: 'plus-lighter', 
        width: '100vw', 
        height: '100vh',
        filter: 'blur(5px) saturate(200%)',
        opacity: 0.8
      }}
    />
  );
};

export default RippleEffect;
