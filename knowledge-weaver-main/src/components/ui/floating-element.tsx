"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingElementProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    distance?: number;
    className?: string;
}

/**
 * Floating Element Component
 * 
 * Adds a weightless floating animation to any element.
 * 
 * Features:
 * - Subtle up/down floating motion
 * - Customizable duration and delay
 * - Spring-based easing
 */
export const FloatingElement: React.FC<FloatingElementProps> = ({
    children,
    delay = 0,
    duration = 3,
    distance = 10,
    className = "",
}) => {
    return (
        <motion.div
            className={cn("", className)}
            animate={{
                y: [0, -distance, 0],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    );
};
