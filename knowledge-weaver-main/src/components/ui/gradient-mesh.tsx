"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GradientMeshProps {
    className?: string;
    animated?: boolean;
}

/**
 * Gradient Mesh Background Component
 * 
 * Creates a premium animated gradient mesh background with multiple
 * radial gradients that slowly morph and move.
 * 
 * Features:
 * - Multiple layered radial gradients
 * - Slow morphing animation
 * - Parallax effect on scroll (optional)
 * - Subtle noise texture overlay
 */
export const GradientMesh: React.FC<GradientMeshProps> = ({
    className = "",
    animated = true
}) => {
    const meshRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!animated) return;

        // Parallax scroll effect
        const handleScroll = () => {
            if (!meshRef.current) return;
            const scrollY = window.scrollY;
            meshRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [animated]);

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <motion.div
                ref={meshRef}
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(at 0% 0%, hsl(240 85% 65% / 0.3) 0, transparent 50%),
            radial-gradient(at 80% 0%, hsl(280 85% 65% / 0.3) 0, transparent 50%),
            radial-gradient(at 40% 100%, hsl(200 85% 65% / 0.3) 0, transparent 50%),
            radial-gradient(at 100% 100%, hsl(320 85% 65% / 0.25) 0, transparent 50%)
          `,
                }}
            >
                {/* Animated blob 1 */}
                {animated && (
                    <motion.div
                        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-30"
                        style={{
                            background: 'radial-gradient(circle, hsl(240 85% 65%) 0%, transparent 70%)',
                            willChange: 'transform',
                        }}
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        initial={{ x: '10%', y: '10%' }}
                    />
                )}

                {/* Animated blob 2 */}
                {animated && (
                    <motion.div
                        className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-25"
                        style={{
                            background: 'radial-gradient(circle, hsl(280 85% 65%) 0%, transparent 70%)',
                            willChange: 'transform',
                        }}
                        animate={{
                            x: [0, -80, 0],
                            y: [0, 100, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        initial={{ x: '70%', y: '20%' }}
                    />
                )}
            </motion.div>

            {/* Noise texture overlay */}
            <div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};
