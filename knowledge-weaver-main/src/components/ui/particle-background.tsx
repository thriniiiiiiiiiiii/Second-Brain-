"use client";

import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
    className?: string;
    density?: number;
    interactive?: boolean;
}

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
}

/**
 * Particle Background Component
 * 
 * Creates an interactive particle grid with dots that respond to mouse movement.
 * 
 * Features:
 * - Canvas-based particle system
 * - Mouse position affects particle movement
 * - Connect nearby particles with lines
 * - Smooth animations with RAF
 */
export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
    className = "",
    density = 20,
    interactive = true,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const updateSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particlesRef.current = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / (10000 / density));

            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.5 + 0.2,
                });
            }
        };

        const drawParticle = (particle: Particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
            ctx.fill();
        };

        const connectParticles = (particle: Particle, index: number) => {
            const maxDistance = 120;

            for (let i = index + 1; i < particlesRef.current.length; i++) {
                const other = particlesRef.current[i];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }
        };

        const updateParticle = (particle: Particle) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Mouse interaction
            if (interactive) {
                const dx = mouseRef.current.x - particle.x;
                const dy = mouseRef.current.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    particle.x -= dx * force * 0.01;
                    particle.y -= dy * force * 0.01;
                }
            }

            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle, index) => {
                updateParticle(particle);
                drawParticle(particle);
                connectParticles(particle, index);
            });

            rafRef.current = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleResize = () => {
            updateSize();
        };

        updateSize();
        animate();

        if (interactive) {
            window.addEventListener('mousemove', handleMouseMove);
        }
        window.addEventListener('resize', handleResize);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, [density, interactive]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none opacity-40 ${className}`}
            style={{ zIndex: 1, willChange: 'transform' }}
        />
    );
};
