"use client";

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    strength?: number;
    className?: string;
}

/**
 * Magnetic Button Component
 * 
 * A premium button that follows the cursor when hovered,
 * creating a magnetic pull effect with spring physics.
 * 
 * Features:
 * - Cursor-following magnetic effect
 * - Spring physics animation
 * - Ripple effect on click
 * - Squish press animation
 * - Glow on hover
 */
export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
    ({ children, strength = 0.3, className, ...props }, ref) => {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const [isHovered, setIsHovered] = useState(false);
        const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

        const x = useMotionValue(0);
        const y = useMotionValue(0);

        const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
        const springX = useSpring(x, springConfig);
        const springY = useSpring(y, springConfig);

        const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (!buttonRef.current) return;

            const rect = buttonRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;

            x.set(distanceX * strength);
            y.set(distanceY * strength);
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
            x.set(0);
            y.set(0);
        };

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (!rect) return;

            const rippleX = e.clientX - rect.left;
            const rippleY = e.clientY - rect.top;

            const newRipple = { x: rippleX, y: rippleY, id: Date.now() };
            setRipples(prev => [...prev, newRipple]);

            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 600);

            props.onClick?.(e);
        };

        return (
            <motion.button
                ref={(node) => {
                    // @ts-ignore
                    buttonRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) ref.current = node;
                }}
                style={{
                    x: springX,
                    y: springY,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                className={cn(
                    "relative overflow-hidden",
                    "transition-shadow duration-300",
                    isHovered && "shadow-lg glow-primary",
                    className
                )}
                {...props}
            >
                {children}

                {/* Ripple Effects */}
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.id}
                        className="absolute rounded-full bg-white/30 pointer-events-none"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: 0,
                            height: 0,
                        }}
                        initial={{ width: 0, height: 0, opacity: 0.5 }}
                        animate={{ width: 200, height: 200, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                ))}
            </motion.button>
        );
    }
);

MagneticButton.displayName = "MagneticButton";
