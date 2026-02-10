"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface CursorSpotlightProps {
    className?: string;
    size?: number;
    intensity?: number;
}

/**
 * Cursor Spotlight Component
 * 
 * Creates a radial gradient spotlight effect that follows the cursor.
 * 
 * Features:
 * - Smooth cursor tracking with spring physics
 * - Customizable size and intensity
 * - Blend mode for beautiful overlay
 * - Performance optimized with requestAnimationFrame
 */
export const CursorSpotlight: React.FC<CursorSpotlightProps> = ({
    className = "",
    size = 300,
    intensity = 0.15,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        let rafId: number;

        const handleMouseMove = (e: MouseEvent) => {
            if (rafId) cancelAnimationFrame(rafId);

            rafId = requestAnimationFrame(() => {
                mouseX.set(e.clientX);
                mouseY.set(e.clientY);
                if (!isVisible) setIsVisible(true);
            });
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [mouseX, mouseY, isVisible]);

    if (!isVisible) return null;

    return (
        <motion.div
            className={`pointer-events-none fixed inset-0 z-30 ${className}`}
            style={{
                opacity: intensity,
            }}
        >
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: size,
                    height: size,
                    x: springX,
                    y: springY,
                    translateX: `-50%`,
                    translateY: `-50%`,
                    background: `radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.4) 30%, transparent 70%)`,
                    mixBlendMode: 'soft-light',
                    filter: 'blur(40px)',
                }}
            />
        </motion.div>
    );
};
