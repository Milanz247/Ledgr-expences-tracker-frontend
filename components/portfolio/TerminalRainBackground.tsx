"use client";

import React, { useEffect, useRef, useState } from 'react';

interface FloatingCommand {
  text: string;
  x: number;
  y: number;
  opacity: number;
  maxOpacity: number;
  speed: number;
  fontSize: number;
  state: 'fadingIn' | 'visible' | 'fadingOut';
}

interface PopupCommand {
  text: string;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  life: number;
  maxLife: number;
}

// DevOps commands - comprehensive list
const terminalCommands = [
  // --- Linux service management ---
  '$ systemctl status nginx',
  '$ systemctl restart nginx',
  '$ systemctl enable nginx',
  '$ systemctl status docker',
  '$ systemctl restart docker',
  '$ systemctl status firewalld',
  '$ systemctl restart NetworkManager',

  // --- Linux basics ---
  '$ df -h',
  '$ free -m',
  '$ top',
  '$ htop',
  '$ vmstat 1',
  '$ dmesg | tail',
  '$ journalctl -xe',
  '$ tail -f /var/log/messages',
  '$ tail -f /var/log/syslog',
  '$ ip a',
  '$ ip r',
  '$ ip link',
  '$ ss -tulnp',
  '$ ps aux | grep nginx',

  // --- Network troubleshooting ---
  '$ ping google.com',
  '$ traceroute google.com',
  '$ curl -v http://localhost',
  '$ wget http://localhost',
  '$ dig example.com',
  '$ nslookup example.com',
  '$ tcpdump -i eth0',
  '$ nc -zv 10.0.0.1 22',

  // --- Kubernetes common ops ---
  '$ kubectl get pods',
  '$ kubectl get pods -A',
  '$ kubectl get nodes',
  '$ kubectl describe pod pod-name',
  '$ kubectl logs pod-name',
  '$ kubectl logs -f pod-name',
  '$ kubectl exec -it pod-name -- bash',
  '$ kubectl get svc',
  '$ kubectl get deployment',
  '$ kubectl rollout restart deployment/app',
  '$ kubectl top pod',
  '$ kubectl top node',
  '$ kubectl port-forward pod 8080:80',
  '$ kubectl get events --sort-by=time',

  // --- Docker common ops ---
  '$ docker ps',
  '$ docker ps -a',
  '$ docker logs container-id',
  '$ docker logs -f container-id',
  '$ docker exec -it container bash',
  '$ docker run -d image-name',
  '$ docker build -t my-image .',
  '$ docker images',
  '$ docker inspect container-id',
  '$ docker system df',
  '$ docker stats',

  // --- Git / CI/CD ---
  '$ git status',
  '$ git pull origin main',
  '$ git push',
  '$ git merge branch-name',
  '$ git log --oneline --graph',
  '$ git checkout -b new-feature',

  // --- Terraform ---
  '$ terraform init',
  '$ terraform plan',
  '$ terraform apply',
  '$ terraform destroy',
  '$ terraform fmt',

  // --- Helm / Argo ---
  '$ helm install mychart ./chart',
  '$ helm upgrade mychart ./chart',
  '$ helm uninstall mychart',
  '$ argocd app list',
  '$ argocd app sync my-app',

  // --- Ansible / AWS ---
  '$ ansible-playbook deploy.yml',
  '$ aws s3 sync ./dist s3://bucket',
  '$ aws ec2 describe-instances',
];

export const TerminalRainBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commandsRef = useRef<FloatingCommand[]>([]);
  const popupsRef = useRef<PopupCommand[]>([]);
  const animationRef = useRef<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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
      initCommands();
    };

    function initCommands() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;
      
      commandsRef.current = [];
      popupsRef.current = [];
      
      // Floating commands
      const initialCount = isMobile ? 12 : 20;
      for (let i = 0; i < initialCount; i++) {
        spawnCommand(w, h, true);
      }
    }

    function spawnCommand(w: number, h: number, initial: boolean = false) {
      if (!ctx) return;
      
      const isMobile = w < 768;
      const fontSize = isMobile ? 11 : 13;
      
      ctx.font = `500 ${fontSize}px "SF Mono", "Fira Code", "JetBrains Mono", Consolas, monospace`;
      const text = terminalCommands[Math.floor(Math.random() * terminalCommands.length)];
      const textWidth = ctx.measureText(text).width;
      
      const padding = 30;
      const maxX = Math.max(padding, w - textWidth - padding);
      const x = padding + Math.random() * (maxX - padding);
      const startY = initial ? (Math.random() * h) : -30;
      const maxOpacity = 0.3 + Math.random() * 0.2;
      
      commandsRef.current.push({
        text,
        x,
        y: startY,
        opacity: initial ? maxOpacity * 0.7 : 0,
        maxOpacity,
        speed: 0.25 + Math.random() * 0.35,
        fontSize,
        state: 'fadingIn'
      });
    }

    function spawnPopup(w: number, h: number) {
      if (!ctx) return;
      
      const isMobile = w < 768;
      const fontSize = isMobile ? 12 : 14;
      
      ctx.font = `600 ${fontSize}px "SF Mono", "Fira Code", "JetBrains Mono", Consolas, monospace`;
      const text = terminalCommands[Math.floor(Math.random() * terminalCommands.length)];
      const textWidth = ctx.measureText(text).width;
      
      const padding = 80;
      const x = padding + Math.random() * (w - textWidth - padding * 2);
      const y = padding + Math.random() * (h - padding * 2);
      
      popupsRef.current.push({
        text,
        x,
        y,
        opacity: 0,
        scale: 0.5,
        life: 0,
        maxLife: 180 + Math.random() * 120 // 3-5 seconds at 60fps
      });
    }

    function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, isDark: boolean) {
      const gridSize = 60;
      
      // Grid lines - MORE VISIBLE in light mode
      ctx.strokeStyle = isDark ? 'rgba(52, 211, 153, 0.05)' : 'rgba(15, 23, 42, 0.08)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      
      // Grid intersection dots - MORE VISIBLE in light mode
      ctx.fillStyle = isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(15, 23, 42, 0.2)';
      for (let x = 0; x <= w; x += gridSize) {
        for (let y = 0; y <= h; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function draw() {
      if (!ctx) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;
      
      // Clear canvas
      ctx.clearRect(0, 0, w, h);
      
      // Draw grid first (background layer)
      drawGrid(ctx, w, h, isDark);

      // Process floating commands
      commandsRef.current.forEach((cmd, index) => {
        switch (cmd.state) {
          case 'fadingIn':
            cmd.opacity = Math.min(cmd.opacity + 0.006, cmd.maxOpacity);
            if (cmd.opacity >= cmd.maxOpacity) {
              cmd.state = 'visible';
            }
            break;
          case 'visible':
            if (cmd.y > h - 80) {
              cmd.state = 'fadingOut';
            }
            break;
          case 'fadingOut':
            cmd.opacity = Math.max(cmd.opacity - 0.008, 0);
            break;
        }

        cmd.y += cmd.speed;

        ctx.font = `500 ${cmd.fontSize}px "SF Mono", "Fira Code", "JetBrains Mono", Consolas, monospace`;
        ctx.textBaseline = 'top';

        if (isDark) {
          ctx.fillStyle = `rgba(52, 211, 153, ${cmd.opacity})`;
          ctx.shadowColor = `rgba(52, 211, 153, ${cmd.opacity * 0.5})`;
          ctx.shadowBlur = 6;
        } else {
          // Light mode - MORE VISIBLE with blue tint
          ctx.fillStyle = `rgba(15, 23, 42, ${cmd.opacity * 0.85})`;
          ctx.shadowColor = `rgba(59, 130, 246, 0.15)`;
          ctx.shadowBlur = 3;
        }

        ctx.fillText(cmd.text, cmd.x, cmd.y);
        ctx.shadowBlur = 0;

        if (cmd.opacity <= 0 || cmd.y > h + 50) {
          commandsRef.current.splice(index, 1);
        }
      });

      // Process popup commands
      popupsRef.current.forEach((popup, index) => {
        popup.life++;
        
        // Animation phases
        const progress = popup.life / popup.maxLife;
        
        if (progress < 0.15) {
          // Pop in
          const t = progress / 0.15;
          popup.opacity = t * 0.8;
          popup.scale = 0.5 + t * 0.5;
        } else if (progress < 0.85) {
          // Visible
          popup.opacity = 0.8;
          popup.scale = 1;
        } else {
          // Fade out
          const t = (progress - 0.85) / 0.15;
          popup.opacity = 0.8 * (1 - t);
          popup.scale = 1 - t * 0.2;
        }

        ctx.save();
        ctx.translate(popup.x, popup.y);
        ctx.scale(popup.scale, popup.scale);
        
        // Draw popup background
        ctx.font = `600 14px "SF Mono", "Fira Code", "JetBrains Mono", Consolas, monospace`;
        const textWidth = ctx.measureText(popup.text).width;
        const padding = 12;
        const bgHeight = 32;
        
        // Background with rounded corners effect
        if (isDark) {
          ctx.fillStyle = `rgba(15, 23, 42, ${popup.opacity * 0.9})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${popup.opacity * 0.95})`;
        }
        ctx.beginPath();
        ctx.roundRect(-padding, -bgHeight/2, textWidth + padding * 2, bgHeight, 6);
        ctx.fill();
        
        // Border - MORE VISIBLE in light mode
        if (isDark) {
          ctx.strokeStyle = `rgba(52, 211, 153, ${popup.opacity * 0.6})`;
        } else {
          ctx.strokeStyle = `rgba(59, 130, 246, ${popup.opacity * 0.5})`;
        }
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Text
        ctx.textBaseline = 'middle';
        if (isDark) {
          ctx.fillStyle = `rgba(52, 211, 153, ${popup.opacity})`;
          ctx.shadowColor = `rgba(52, 211, 153, 0.5)`;
          ctx.shadowBlur = 8;
        } else {
          // Light mode - blue accent color
          ctx.fillStyle = `rgba(37, 99, 235, ${popup.opacity})`;
          ctx.shadowColor = `rgba(59, 130, 246, 0.3)`;
          ctx.shadowBlur = 4;
        }
        ctx.fillText(popup.text, 0, 0);
        ctx.shadowBlur = 0;
        
        ctx.restore();

        if (popup.life >= popup.maxLife) {
          popupsRef.current.splice(index, 1);
        }
      });

      // Spawn new floating commands
      const maxCommands = isMobile ? 15 : 25;
      if (commandsRef.current.length < maxCommands && Math.random() < 0.02) {
        spawnCommand(w, h);
      }
      
      // Spawn new popups occasionally
      const maxPopups = isMobile ? 2 : 4;
      if (popupsRef.current.length < maxPopups && Math.random() < 0.008) {
        spawnPopup(w, h);
      }

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
        className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5"
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default TerminalRainBackground;
