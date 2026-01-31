"use client";

import React, { useEffect, useRef, useState } from 'react';

interface CircuitNode {
  x: number;
  y: number;
  type: 'junction' | 'endpoint' | 'chip';
  connections: number[];
  pulsePhase: number;
  size: number;
}

interface DataPulse {
  pathIndex: number;
  progress: number;
  speed: number;
  direction: 1 | -1;
}

interface CircuitPath {
  from: number;
  to: number;
  segments: { x: number; y: number }[];
}

export const CircuitBoardBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<CircuitNode[]>([]);
  const pathsRef = useRef<CircuitPath[]>([]);
  const pulsesRef = useRef<DataPulse[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
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

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initCircuitBoard();
    };

    function initCircuitBoard() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;
      
      nodesRef.current = [];
      pathsRef.current = [];
      pulsesRef.current = [];

      // Grid-based node placement for circuit board feel
      const gridSize = isMobile ? 120 : 100;
      const cols = Math.ceil(w / gridSize) + 1;
      const rows = Math.ceil(h / gridSize) + 1;

      // Create nodes at grid intersections with some randomness
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Only place nodes at ~40% of intersections for organic feel
          if (Math.random() > 0.4) continue;
          
          const x = col * gridSize + (Math.random() - 0.5) * 20;
          const y = row * gridSize + (Math.random() - 0.5) * 20;
          
          // Determine node type
          let type: CircuitNode['type'] = 'junction';
          const rand = Math.random();
          if (rand > 0.92) type = 'chip';
          else if (rand > 0.75) type = 'endpoint';

          nodesRef.current.push({
            x,
            y,
            type,
            connections: [],
            pulsePhase: Math.random() * Math.PI * 2,
            size: type === 'chip' ? 12 : type === 'endpoint' ? 4 : 3
          });
        }
      }

      // Create circuit paths between nearby nodes
      nodesRef.current.forEach((node, i) => {
        nodesRef.current.forEach((other, j) => {
          if (i >= j) return;
          if (node.connections.length >= 3 || other.connections.length >= 3) return;
          
          const dx = Math.abs(node.x - other.x);
          const dy = Math.abs(node.y - other.y);
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Connect nodes that are roughly aligned (horizontal or vertical preference)
          const isAligned = dx < 30 || dy < 30;
          const maxDist = isMobile ? 180 : 150;
          
          if (dist < maxDist && (isAligned || Math.random() > 0.7)) {
            node.connections.push(j);
            other.connections.push(i);
            
            // Create path with right-angle segments (circuit board style)
            const segments = createCircuitPath(node.x, node.y, other.x, other.y);
            pathsRef.current.push({ from: i, to: j, segments });
          }
        });
      });

      // Create data pulses
      const pulseCount = isMobile ? 8 : 15;
      for (let i = 0; i < pulseCount; i++) {
        if (pathsRef.current.length > 0) {
          pulsesRef.current.push({
            pathIndex: Math.floor(Math.random() * pathsRef.current.length),
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.003,
            direction: Math.random() > 0.5 ? 1 : -1
          });
        }
      }
    }

    // Create right-angle path between two points (PCB trace style)
    function createCircuitPath(x1: number, y1: number, x2: number, y2: number): { x: number; y: number }[] {
      const segments: { x: number; y: number }[] = [{ x: x1, y: y1 }];
      
      // Decide whether to go horizontal first or vertical first
      if (Math.random() > 0.5) {
        // Horizontal then vertical
        segments.push({ x: x2, y: y1 });
      } else {
        // Vertical then horizontal
        segments.push({ x: x1, y: y2 });
      }
      
      segments.push({ x: x2, y: y2 });
      return segments;
    }

    // Get position along a path
    function getPathPosition(path: CircuitPath, progress: number): { x: number; y: number } {
      const segments = path.segments;
      if (segments.length < 2) return segments[0] || { x: 0, y: 0 };

      // Calculate total path length
      let totalLength = 0;
      const segmentLengths: number[] = [];
      
      for (let i = 0; i < segments.length - 1; i++) {
        const dx = segments[i + 1].x - segments[i].x;
        const dy = segments[i + 1].y - segments[i].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        segmentLengths.push(len);
        totalLength += len;
      }

      // Find position at progress
      const targetDist = progress * totalLength;
      let accumulatedDist = 0;

      for (let i = 0; i < segmentLengths.length; i++) {
        if (accumulatedDist + segmentLengths[i] >= targetDist) {
          const segmentProgress = (targetDist - accumulatedDist) / segmentLengths[i];
          return {
            x: segments[i].x + (segments[i + 1].x - segments[i].x) * segmentProgress,
            y: segments[i].y + (segments[i + 1].y - segments[i].y) * segmentProgress
          };
        }
        accumulatedDist += segmentLengths[i];
      }

      return segments[segments.length - 1];
    }

    function draw() {
      if (!ctx || !isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      timeRef.current += 16;
      ctx.clearRect(0, 0, w, h);

      // Colors - MORE VISIBLE in light mode
      const traceColor = isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(37, 99, 235, 0.18)';
      const traceHighlight = isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.28)';
      const nodeColor = isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.5)';
      const pulseColor = isDark ? '#60A5FA' : '#2563EB';
      const chipColor = isDark ? 'rgba(34, 211, 153, 0.3)' : 'rgba(16, 185, 129, 0.4)';

      // Draw circuit traces (paths)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      pathsRef.current.forEach(path => {
        if (path.segments.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(path.segments[0].x, path.segments[0].y);
        
        for (let i = 1; i < path.segments.length; i++) {
          ctx.lineTo(path.segments[i].x, path.segments[i].y);
        }
        
        ctx.strokeStyle = traceColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Subtle glow effect
        ctx.strokeStyle = traceHighlight;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw nodes
      nodesRef.current.forEach((node) => {
        const pulse = Math.sin(timeRef.current * 0.002 + node.pulsePhase) * 0.3 + 0.7;
        
        ctx.save();
        ctx.globalAlpha = pulse;

        if (node.type === 'chip') {
          // Draw IC chip
          const chipW = 24;
          const chipH = 16;
          
          ctx.fillStyle = chipColor;
          ctx.fillRect(node.x - chipW/2, node.y - chipH/2, chipW, chipH);
          
          ctx.strokeStyle = isDark ? 'rgba(34, 211, 153, 0.5)' : 'rgba(16, 185, 129, 0.6)';
          ctx.lineWidth = isDark ? 1 : 1.5;
          ctx.strokeRect(node.x - chipW/2, node.y - chipH/2, chipW, chipH);
          
          // Chip pins
          const pinCount = 3;
          for (let i = 0; i < pinCount; i++) {
            const pinX = node.x - chipW/2 + (chipW / (pinCount + 1)) * (i + 1);
            ctx.beginPath();
            ctx.moveTo(pinX, node.y - chipH/2);
            ctx.lineTo(pinX, node.y - chipH/2 - 4);
            ctx.moveTo(pinX, node.y + chipH/2);
            ctx.lineTo(pinX, node.y + chipH/2 + 4);
            ctx.stroke();
          }
        } else if (node.type === 'endpoint') {
          // Draw via/pad
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size + 2, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
        } else {
          // Draw junction
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw and update data pulses
      pulsesRef.current.forEach(pulse => {
        const path = pathsRef.current[pulse.pathIndex];
        if (!path) return;

        const pos = getPathPosition(path, pulse.progress);
        
        // Pulse glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 12);
        gradient.addColorStop(0, pulseColor + 'CC');
        gradient.addColorStop(0.5, pulseColor + '44');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Pulse core
        ctx.fillStyle = pulseColor;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Update pulse position
        pulse.progress += pulse.speed * pulse.direction;
        
        if (pulse.progress >= 1 || pulse.progress <= 0) {
          // Jump to new random path
          pulse.pathIndex = Math.floor(Math.random() * pathsRef.current.length);
          pulse.progress = pulse.direction === 1 ? 0 : 1;
          pulse.direction = Math.random() > 0.5 ? 1 : -1;
        }
      });

      animationRef.current = requestAnimationFrame(draw);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div 
        className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5"
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

export default CircuitBoardBackground;
