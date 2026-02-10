"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerLoaderProps {
    className?: string;
    lines?: number;
}

/**
 * Shimmer Loader Component
 * 
 * Premium loading skeleton with animated gradient shimmer effect.
 * 
 * Features:
 * - Animated gradient shimmer
 * - Pulsing glow effect
 * - Customizable line count
 */
export const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({
    className = "",
    lines = 3,
}) => {
    return (
        <div className={cn("space-y-3", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="relative h-4 bg-muted rounded-lg overflow-hidden"
                    style={{
                        width: i === lines - 1 ? '60%' : '100%',
                    }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{
                            x: ['-100%', '200%'],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
