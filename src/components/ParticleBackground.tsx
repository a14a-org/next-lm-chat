'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Create a few particles on mouse move
      if (Math.random() > 0.7) {
        createParticle(e.clientX, e.clientY, true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];

      // Generate particles across the screen
      for (let i = 0; i < 40; i++) {
        createParticle(Math.random() * canvas.width, Math.random() * canvas.height, false);
      }
    };

    // Create a particle at a position
    const createParticle = (x: number, y: number, isMouseGenerated: boolean) => {
      // Define particle colors based on theme
      const lightThemeColors = [
        'rgba(243, 152, 128, 0.7)', // Coral/Salmon
        'rgba(138, 116, 191, 0.7)', // Purple
        'rgba(147, 112, 219, 0.7)', // Medium Slate Blue
      ];

      const darkThemeColors = [
        'rgba(243, 152, 128, 0.7)', // Keep coral color
        'rgba(157, 134, 217, 0.7)', // Brighter purple for dark mode
        'rgba(157, 134, 217, 0.7)', // Brighter purple for dark mode
      ];

      const colors = theme === 'dark' ? darkThemeColors : lightThemeColors;

      const size = isMouseGenerated ? Math.random() * 6 + 1 : Math.random() * 4 + 1;
      const opacity = isMouseGenerated ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3 + 0.2;

      particlesRef.current.push({
        x,
        y,
        size,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity,
        color: colors[Math.floor(Math.random() * colors.length)],
      });

      // Limit particles to prevent performance issues
      if (particlesRef.current.length > 100) {
        particlesRef.current.shift();
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Fade out
        particle.opacity -= 0.002;

        // Remove particles that are too faded
        if (particle.opacity <= 0) {
          particlesRef.current.splice(index, 1);
          createParticle(Math.random() * canvas.width, Math.random() * canvas.height, false);
          return;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(/[\d\.]+\)$/, `${particle.opacity})`);
        ctx.fill();

        // Subtle attraction to mouse
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          particle.speedX += dx * 0.0002;
          particle.speedY += dy * 0.0002;
        }

        // Keep particles within bounds with gentler bounce
        if (particle.x <= 0 || particle.x >= canvas.width) {
          particle.speedX *= -0.3;
        }

        if (particle.y <= 0 || particle.y >= canvas.height) {
          particle.speedY *= -0.3;
        }
      });

      requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]); // Rerun effect when theme changes

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{
        opacity: theme === 'dark' ? 0.5 : 0.7,
        background: 'transparent', // Ensure canvas has transparent background
      }}
    />
  );
};

export default ParticleBackground;
