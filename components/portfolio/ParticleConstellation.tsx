"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
}

export const ParticleConstellation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    function initParticles() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;
      
      particlesRef.current = [];
      
      // Increased particle count for more visual impact
      const particleCount = isMobile ? 100 : 180;
      
      for (let i = 0; i < particleCount; i++) {
        const baseSize = 1.5 + Math.random() * 2;
        particlesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: baseSize,
          baseSize: baseSize,
          opacity: 0.25 + Math.random() * 0.25
        });
      }
    }

    function draw() {
      if (!ctx || !isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const connectionDistance = 120;
      const mouseRadius = 150;

      // Update and draw particles
      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Mouse interaction - particles grow and move away
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        
        if (distToMouse < mouseRadius) {
          const force = (mouseRadius - distToMouse) / mouseRadius;
          p.x -= (dx / distToMouse) * force * 2.5;
          p.y -= (dy / distToMouse) * force * 2.5;
          p.size = p.baseSize * (1 + force);
        } else {
          p.size += (p.baseSize - p.size) * 0.1;
        }

        // Draw particle with glow - more visible in light theme
        const particleColor = isDark 
          ? `rgba(147, 197, 253, ${p.opacity * 0.7})` 
          : `rgba(37, 99, 235, ${p.opacity * 1.2})`;
        
        // Outer glow - stronger for light theme
        const glowSize = p.size * 2.5;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        gradient.addColorStop(0, isDark 
          ? `rgba(147, 197, 253, ${p.opacity * 0.3})` 
          : `rgba(37, 99, 235, ${p.opacity * 0.5})`);
        gradient.addColorStop(0.5, isDark 
          ? `rgba(147, 197, 253, ${p.opacity * 0.1})` 
          : `rgba(37, 99, 235, ${p.opacity * 0.2})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw subtle connections to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const ddx = p.x - other.x;
          const ddy = p.y - other.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * (isDark ? 0.35 : 0.55);
            ctx.strokeStyle = isDark 
              ? `rgba(147, 197, 253, ${opacity})` 
              : `rgba(37, 99, 235, ${opacity})`;
            ctx.lineWidth = isDark ? 0.8 : 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw connections to mouse
        if (distToMouse < mouseRadius) {
          const opacity = (1 - distToMouse / mouseRadius) * (isDark ? 0.4 : 0.6);
          ctx.strokeStyle = isDark 
            ? `rgba(96, 165, 250, ${opacity})` 
            : `rgba(37, 99, 235, ${opacity})`;
          ctx.lineWidth = isDark ? 1 : 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      });

      // Mouse cursor glow
      if (mouseX > 0 && mouseY > 0) {
        const cursorGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 35);
        cursorGradient.addColorStop(0, isDark 
          ? 'rgba(96, 165, 250, 0.25)' 
          : 'rgba(37, 99, 235, 0.35)');
        cursorGradient.addColorStop(0.5, isDark 
          ? 'rgba(96, 165, 250, 0.1)' 
          : 'rgba(37, 99, 235, 0.15)');
        cursorGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = cursorGradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Center dot
        ctx.fillStyle = isDark 
          ? 'rgba(147, 197, 253, 0.5)' 
          : 'rgba(37, 99, 235, 0.6)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div 
        className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
};

export default ParticleConstellation;
