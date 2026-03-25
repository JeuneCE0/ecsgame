'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.003;

      // Multiple ambient gradient blobs floating
      const blobs = [
        { cx: 0.2, cy: 0.3, r: 350, color: 'rgba(255,191,0,0.04)', speed: 0.7, amp: 120 },
        { cx: 0.8, cy: 0.7, r: 300, color: 'rgba(255,157,0,0.03)', speed: 0.5, amp: 100 },
        { cx: 0.5, cy: 0.2, r: 280, color: 'rgba(255,191,0,0.025)', speed: 0.6, amp: 80 },
        { cx: 0.3, cy: 0.8, r: 250, color: 'rgba(255,157,0,0.02)', speed: 0.4, amp: 90 },
      ];

      for (const blob of blobs) {
        const bx = canvas.width * blob.cx + Math.sin(time * blob.speed) * blob.amp;
        const by = canvas.height * blob.cy + Math.cos(time * blob.speed * 0.8) * blob.amp;
        const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, blob.r);
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Subtle star-like particles
      const particleCount = 25;
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 137.508;
        const px = ((seed * 1.1 + time * 15) % canvas.width);
        const py = ((seed * 0.7 + time * 8) % canvas.height);
        const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
        const size = 1 + pulse * 1.5;
        const opacity = 0.1 + pulse * 0.2;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 191, 0, ${opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener('resize', resize);

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

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-ecs-black overflow-hidden">
      <AnimatedBackground />

      {/* Radial vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(12,12,12,0.3) 50%, rgba(12,12,12,0.85) 100%)',
          zIndex: 1,
        }}
      />

      {/* Logo */}
      <motion.div
        className="relative mb-8"
        style={{ zIndex: 2 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-25 bg-ecs-amber rounded-full scale-150" />
          <Image
            src="/logo.png"
            alt="ECS GAME"
            width={180}
            height={54}
            priority
            className="relative"
          />
        </div>
      </motion.div>

      <div className="relative w-full max-w-lg" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
