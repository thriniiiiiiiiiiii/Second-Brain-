"use client";

import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
}

/**
 * Scroll Reveal Component
 * 
 * Reveals elements with animation when they enter the viewport.
 * Uses Intersection Observer via Framer Motion's useInView.
 * 
 * Features:
 * - Smooth reveal animation on scroll
 * - Multiple direction options
 * - Customizable delay for staggered reveals
 * - Only animates once (performance optimized)
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    delay = 0,
    direction = 'up',
    className = "",
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-30px" });

    const directionOffset = {
        up: { y: 16 },
        down: { y: -16 },
        left: { x: 16 },
        right: { x: -16 },
    };

    const offset = directionOffset[direction];

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, ...offset }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{
                duration: 0.3,
                delay: Math.min(delay, 0.15),
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {children}
        </motion.div>
    );
};
