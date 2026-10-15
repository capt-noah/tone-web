'use client';

import React, { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollWaveVisualizerProps {
  className?: string;
  intensity?: number;
}

export function ScrollWaveVisualizer({
  className = '',
  intensity = 1.0,
}: ScrollWaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    // Handle high DPI displays
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Floating Audio Particles
    const particleCount = 24;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (canvas.clientWidth || 800),
      y: Math.random() * (canvas.clientHeight || 400),
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Get scroll velocity from GSAP ScrollTrigger if active
      let scrollBoost = 0;
      if (typeof window !== 'undefined' && ScrollTrigger) {
        // @ts-expect-error - GSAP scrollTrigger getVelocity helper
        const vel = ScrollTrigger.getVelocity ? Math.abs(ScrollTrigger.getVelocity()) : 0;
        scrollBoost = Math.min(vel / 2200, 2.0);
      }

      phase += 0.018 + scrollBoost * 0.035;

      // Draw Particles
      particles.forEach((p) => {
        p.x += p.speedX * (1 + scrollBoost);
        p.y += p.speedY * (1 + scrollBoost);

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(185, 203, 186, ${p.alpha * 0.45})`;
        ctx.fill();
      });

      // Layered Harmonic Sine Waves
      const waves = [
        {
          amplitude: (30 + scrollBoost * 18) * intensity,
          frequency: 0.007,
          speed: 1.0,
          color: 'rgba(185, 203, 186, 0.35)',
          lineWidth: 2,
        },
        {
          amplitude: (22 + scrollBoost * 14) * intensity,
          frequency: 0.011,
          speed: 1.3,
          color: 'rgba(59, 75, 62, 0.4)',
          lineWidth: 1.5,
        },
        {
          amplitude: (36 + scrollBoost * 22) * intensity,
          frequency: 0.005,
          speed: 0.75,
          color: 'rgba(255, 248, 242, 0.18)',
          lineWidth: 2.2,
        },
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.lineWidth = wave.lineWidth;
        ctx.strokeStyle = wave.color;

        const centerY = height * 0.52;

        for (let x = 0; x <= width; x += 4) {
          const y =
            centerY +
            Math.sin(x * wave.frequency + phase * wave.speed) * wave.amplitude +
            Math.cos(x * wave.frequency * 0.5 + phase * 0.5) * (wave.amplitude * 0.35);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none select-none ${className}`}
    />
  );
}
