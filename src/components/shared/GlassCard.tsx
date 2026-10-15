'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'card' | 'dark' | 'nav' | 'dock' | 'top' | 'panel' | 'pill';
  hoverEffect?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = 'card',
      hoverEffect = false,
      initial,
      animate,
      transition,
      whileHover,
      children,
      ...props
    },
    ref
  ) => {
    const variantClass =
      variant === 'nav' || variant === 'pill'
        ? 'glass-nav-dark'
        : variant === 'dock'
        ? 'glass-dock-dark'
        : variant === 'top'
        ? 'glass-top-dark'
        : variant === 'panel'
        ? 'glass-panel-dark'
        : 'glass-card-dark';

    return (
      <motion.div
        ref={ref}
        initial={initial}
        animate={animate}
        transition={transition}
        whileHover={
          whileHover !== undefined
            ? whileHover
            : hoverEffect
            ? { y: -2, transition: { duration: 0.2 } }
            : undefined
        }
        className={cn('transition-all duration-300', variantClass, className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
