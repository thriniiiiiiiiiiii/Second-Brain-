"use client";

import React, { useRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    tilt?: boolean;
    glow?: boolean;
}

/**
 * Glass Card Component
 * 
 * A premium glassmorphism card with 3D tilt effect based on mouse position.
 * 
 * Features:
 * - Glassmorphism with backdrop blur
 * - 3D tilt on hover (mouse position-based)
 * - Animated gradient border
 * - Floating shadow that intensifies
 * - Spring physics animations
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, tilt = true, glow = false, className, ...props }, ref) => {
        const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
        const [isHovered, setIsHovered] = useState(false);

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!tilt) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            setMousePosition({ x, y });
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
            setMousePosition({ x: 0.5, y: 0.5 });
        };

        // Calculate 3D rotation based on mouse position
        const [isTouchDevice, setIsTouchDevice] = useState(false);

        React.useEffect(() => {
            setIsTouchDevice(window.matchMedia("(hover: none)").matches);
        }, []);

        const shouldTilt = tilt && !isTouchDevice;

        const rotateX = shouldTilt ? (mousePosition.y - 0.5) * -10 : 0;
        const rotateY = shouldTilt ? (mousePosition.x - 0.5) * 10 : 0;

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "relative glass rounded-xl overflow-hidden",
                    "transition-[transform,box-shadow,opacity] duration-300 spring",
                    isHovered && "shadow-float-hover",
                    glow && isHovered && "glow-primary",
                    className
                )}
                style={{
                    transformStyle: "preserve-3d",
                    perspective: 1000,
                }}
                animate={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    mass: 0.5,
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.02 }}
                {...props}
            >
                {/* Gradient Border Animation */}
                <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>

                {/* Inner Glow */}
                {glow && isHovered && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </motion.div>
        );
    }
);

GlassCard.displayName = "GlassCard";
