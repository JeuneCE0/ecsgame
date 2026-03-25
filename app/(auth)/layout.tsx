'use client';

import { useEffect, useRef } from 'react';

function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      pulse: number;
    }

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 40;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initParticles() {
      if (!canvas) return;
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      // Draw animated grid lines
      const gridSpacing = 60;
      ctx.lineWidth = 0.5;

      for (let x = 0; x < canvas.width; x += gridSpacing) {
        const offset = Math.sin(time + x * 0.005) * 2;
        const opacity = 0.03 + Math.sin(time * 0.5 + x * 0.01) * 0.015;
        ctx.strokeStyle = `rgba(255, 191, 0, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSpacing) {
        const offset = Math.cos(time + y * 0.005) * 2;
        const opacity = 0.03 + Math.cos(time * 0.5 + y * 0.01) * 0.015;
        ctx.strokeStyle = `rgba(255, 191, 0, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(canvas.width, y + offset);
        ctx.stroke();
      }

      // Draw mesh gradient blobs
      const cx1 = canvas.width * 0.3 + Math.sin(time * 0.7) * 100;
      const cy1 = canvas.height * 0.4 + Math.cos(time * 0.5) * 80;
      const gradient1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, 300);
      gradient1.addColorStop(0, 'rgba(255, 191, 0, 0.04)');
      gradient1.addColorStop(1, 'rgba(255, 191, 0, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx2 = canvas.width * 0.7 + Math.cos(time * 0.6) * 120;
      const cy2 = canvas.height * 0.6 + Math.sin(time * 0.4) * 90;
      const gradient2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 250);
      gradient2.addColorStop(0, 'rgba(255, 157, 0, 0.03)');
      gradient2.addColorStop(1, 'rgba(255, 157, 0, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw floating particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
        const currentSize = p.size * (0.8 + Math.sin(p.pulse * 1.5) * 0.2);

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 191, 0, ${currentOpacity})`;
        ctx.fill();

        // Soft glow around particle
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 4);
        glow.addColorStop(0, `rgba(255, 191, 0, ${currentOpacity * 0.3})`);
        glow.addColorStop(1, 'rgba(255, 191, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - currentSize * 4, p.y - currentSize * 4, currentSize * 8, currentSize * 8);
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-ecs-black overflow-hidden">
      <AnimatedGrid />

      {/* Ambient radial vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(12,12,12,0.4) 50%, rgba(12,12,12,0.9) 100%)',
          zIndex: 1,
        }}
      />

      <div className="relative w-full max-w-md" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
