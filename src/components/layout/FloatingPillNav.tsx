'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Library,
  Heart,
  User,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useSync } from '@/context/SyncContext';
import { GlassCard } from '@/components/shared/GlassCard';

export function FloatingPillNav() {
  const pathname = usePathname();
  const { currentSong } = usePlayer();
  const { triggerPageLoad, syncAll } = useSync();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Favorites', href: '/favorites', icon: Heart, activeColor: 'text-[#ee7d77]' },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      triggerPageLoad(450);
    } else {
      triggerPageLoad(380);
    }
  };

  return (
    <nav
      aria-label="Floating Navigation Dock"
      className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out select-none ${
        currentSong ? 'bottom-24 md:bottom-[98px]' : 'bottom-6'
      }`}
    >
      <GlassCard variant="pill" className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 !rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'bg-white/[0.14] text-[#fff8f2] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_16px_rgba(185,203,186,0.25)] font-bold'
                  : 'text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/[0.08]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? (item.activeColor || 'text-[#b9cbba]') : 'text-[#a6ada6] group-hover:text-[#fff8f2]'
                }`}
              />
              <span className={`transition-all ${isActive ? 'inline-block' : 'hidden sm:inline-block'}`}>
                {item.label}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#b9cbba] shadow-[0_0_8px_#b9cbba] sm:hidden" />
              )}
            </Link>
          );
        })}
      </GlassCard>
    </nav>
  );
}
