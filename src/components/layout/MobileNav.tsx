'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Heart, User } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useSync } from '@/context/SyncContext';

export function MobileNav() {
  const pathname = usePathname();
  const { currentSong } = usePlayer();
  const { triggerPageLoad, syncAll } = useSync();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Favorites', href: '/favorites', icon: Heart },
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
      aria-label="Mobile Navigation"
      className={`md:hidden fixed left-0 right-0 z-30 glass-dock border-t border-white/[0.08] px-4 py-2 flex items-center justify-around select-none transition-all duration-200 ${
        currentSong ? 'bottom-[88px]' : 'bottom-0'
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-colors ${
              isActive
                ? 'text-[#b9cbba] font-bold'
                : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#b9cbba]' : 'text-[#a6ada6]'}`} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
