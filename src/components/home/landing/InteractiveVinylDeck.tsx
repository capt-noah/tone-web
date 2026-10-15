'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Disc3, Cloud, Smartphone } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function InteractiveVinylDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const tonearmRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !discRef.current || !deckRef.current) return;

      // 3D Perspective Tilt on Scroll
      gsap.fromTo(
        deckRef.current,
        {
          rotateX: 16,
          scale: 0.95,
          y: 30,
        },
        {
          rotateX: 0,
          scale: 1.02,
          y: -20,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: 1.2,
          },
        }
      );

      // Continuous Scroll-Scrubbed Vinyl Rotation (turns smoothly as user scrolls)
      gsap.to(discRef.current, {
        rotation: 1080,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // Tonearm tracking across grooves
      if (tonearmRef.current) {
        gsap.to(tonearmRef.current, {
          rotate: 24,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            end: 'bottom 20%',
            scrub: 1,
          },
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto flex flex-col items-center select-none [perspective:1200px]"
    >
      {/* Ambient Backlight Glow (Smooth Multi-Stop Radial) */}
      <div
        className="absolute -inset-6 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(59, 75, 62, 0.25) 0%, rgba(185, 203, 186, 0.08) 40%, transparent 70%)',
          transform: 'translateZ(0)',
        }}
      />

      {/* Turntable Plinth Deck */}
      <div
        ref={deckRef}
        className="relative w-full aspect-square max-w-[420px] sm:max-w-[460px] p-6 sm:p-8 rounded-[44px] bg-gradient-to-b from-[#181d19] via-[#111412] to-[#0d0f0d] border border-white/[0.08] shadow-[0_35px_100px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center justify-center overflow-hidden transition-shadow"
      >
        {/* Subtle Surface Sheen */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />

        {/* Tonearm Assembly */}
        <div
          ref={tonearmRef}
          className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30 origin-[20px_20px] pointer-events-none"
        >
          {/* Base Pivot */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#323933] to-[#1c211d] border border-white/20 shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#0d0f0d] border border-[#b9cbba]/40" />
          </div>
          {/* Arm Beam */}
          <div className="w-1.5 h-36 sm:h-40 bg-gradient-to-b from-[#a6ada6] via-[#6e776f] to-[#3b4b3e] rounded-full shadow-md ml-4 -mt-1 origin-top" />
          {/* Stylus Cartridge */}
          <div className="w-4 h-6 bg-[#b9cbba] rounded-sm ml-2.5 -mt-1 border border-black/30 shadow-md flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
          </div>
        </div>

        {/* 3D Vinyl Master Record */}
        <div
          ref={discRef}
          className="relative w-full h-full rounded-full cursor-grab active:cursor-grabbing"
          style={{
            background:
              'repeating-radial-gradient(circle at center, #111412 0px, #1c211d 2px, #0d0f0d 4px, #252b26 6px)',
            boxShadow:
              '0 20px 50px rgba(0,0,0,0.9), inset 0 0 0 2px rgba(255,255,255,0.08), inset 0 0 35px rgba(0,0,0,0.85)',
          }}
        >
          {/* Anisotropic Light Reflection Sheen */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,255,255,0.08)_0deg,transparent_60deg,rgba(255,255,255,0.08)_180deg,transparent_240deg,rgba(255,255,255,0.08)_360deg)] pointer-events-none" />

          {/* Center Label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-gradient-to-tr from-[#1f2821] via-[#2a372d] to-[#161d18] border-4 border-[#0d0f0d] shadow-inner flex flex-col items-center justify-center p-2 text-center pointer-events-none">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 shadow-md">
              <Image
                src="/images/icon.png"
                alt="Tone Label"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="text-[10px] font-black tracking-widest text-[#fff8f2] mt-1">
              TONE
            </span>
            <span className="text-[7px] font-mono text-[#b9cbba] tracking-wider">
              LOSSLESS AUDIO
            </span>

            {/* Spindle Center Hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#0d0f0d] border border-white/30" />
          </div>
        </div>
      </div>

      {/* Clean Simplified Badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[11px] font-mono text-[#a6ada6]">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161a17] border border-white/[0.06]">
          <Disc3 className="w-3 h-3 text-[#b9cbba]" />
          <span>LOSSLESS AUDIO</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161a17] border border-white/[0.06]">
          <Cloud className="w-3 h-3 text-[#b9cbba]" />
          <span>TELEGRAM CLOUD</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161a17] border border-white/[0.06]">
          <Smartphone className="w-3 h-3 text-[#b9cbba]" />
          <span>OFFLINE READY</span>
        </div>
      </div>
    </div>
  );
}
