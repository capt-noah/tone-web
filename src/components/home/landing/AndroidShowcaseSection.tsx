'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Smartphone,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  ShieldCheck,
  Heart,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Wifi,
  Battery,
  ChevronDown,
  MoreVertical,
  Volume2,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function AndroidShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadUrl =
    process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ||
    'https://musicly-4l0y.onrender.com/download/musicly.apk';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useGSAP(
    () => {
      if (!sectionRef.current || !cardRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Master Timeline for "Take Your Music" Section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      // 1. Showcase Outer Card Container Reveal
      tl.fromTo(
        cardRef.current,
        { y: 50, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
      )
        // 2. Title appears delayed
        .fromTo(
          '.showcase-title-anim',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
          '-=0.4'
        )
        // 3. Description appears delayed
        .fromTo(
          '.showcase-desc-anim',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.3'
        )
        // 4. Action buttons appear delayed
        .fromTo(
          '.showcase-cta-anim',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' },
          '-=0.25'
        )
        // 5. Badges appear delayed
        .fromTo(
          '.showcase-badges-anim',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
          '-=0.2'
        )
        // 6. Phone chassis floats in with 3D perspective
        .fromTo(
          phoneRef.current,
          {
            y: 60,
            rotateY: -14,
            rotateX: 6,
            opacity: 0,
            scale: 0.92,
          },
          {
            y: 0,
            rotateY: -2,
            rotateX: 2,
            opacity: 1,
            scale: 1,
            duration: 1.0,
            ease: 'power3.out',
          },
          '-=0.5'
        )
        // 7. Inner phone UI elements reveal one by one
        .fromTo(
          '.phone-ui-item',
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.09,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.6'
        );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="download-android"
      ref={sectionRef}
      className="w-full py-20 sm:py-32 border-t border-white/[0.06] bg-[#0d0f0d] relative select-none [perspective:1200px]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div
          ref={cardRef}
          className="showcase-card-container relative rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden bg-gradient-to-br from-[#18201a] via-[#111612] to-[#0d0f0d] border border-[#b9cbba]/20 shadow-[0_30px_90px_rgba(0,0,0,0.85)]"
        >
          {/* Ambient Lighting Gradients (Smooth Multi-Stop) */}
          <div
            className="absolute -top-10 -right-10 w-[450px] h-[450px] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, rgba(185, 203, 186, 0.10) 0%, rgba(59, 75, 62, 0.04) 40%, transparent 70%)',
              transform: 'translateZ(0)',
            }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-[450px] h-[450px] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, rgba(59, 75, 62, 0.18) 0%, rgba(185, 203, 186, 0.04) 40%, transparent 70%)',
              transform: 'translateZ(0)',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            {/* Left Content (One-by-One Delayed Reveal) */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h2 className="showcase-title-anim text-3xl sm:text-4xl md:text-5xl font-black text-[#fff8f2] tracking-tight leading-[1.08]">
                Take Your Music Anywhere
              </h2>

              <p className="showcase-desc-anim text-sm sm:text-base text-[#a6ada6] leading-relaxed">
                Download the official Tone Android app to save tracks offline, control playback directly from your lockscreen, and listen anytime without using mobile data.
              </p>

              {/* Action Buttons */}
              <div className="showcase-cta-anim flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href={downloadUrl}
                  download="tone.apk"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs sm:text-sm font-bold shadow-[0_0_30px_rgba(185,203,186,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Get APK</span>
                </a>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1c241e] hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-[#fff8f2] transition-colors"
                >
                  <QrCode className="w-4 h-4 text-[#b9cbba]" />
                  <span>Display Mobile QR</span>
                </button>
              </div>

              {/* Badges */}
              <div className="showcase-badges-anim pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#a6ada6] font-mono">
                <span className="flex items-center gap-1.5 text-[#b9cbba]">
                  <ShieldCheck className="w-4 h-4 text-[#b9cbba]" />
                  Verified APK Build
                </span>
                <span>•</span>
                <span>Android 8.0+</span>
                <span>•</span>
                <span>Offline Listening</span>
              </div>
            </div>

            {/* Right: Flagship Luxury Smartphone Chassis Mockup */}
            <div className="lg:col-span-6 flex justify-center py-4">
              <div
                ref={phoneRef}
                className="relative w-[300px] sm:w-[320px] aspect-[9/18.8] rounded-[52px] bg-[#0c0e0c] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.14),inset_0_0_0_2px_rgba(0,0,0,0.8)] transition-transform select-none"
              >
                {/* Outer Titanium Chassis Rim Highlight */}
                <div className="absolute inset-0 rounded-[52px] border border-white/10 pointer-events-none" />

                {/* Side Volume / Power Button Indents */}
                <div className="absolute -left-[3px] top-24 w-[3px] h-10 bg-[#283029] rounded-l-sm" />
                <div className="absolute -left-[3px] top-38 w-[3px] h-10 bg-[#283029] rounded-l-sm" />
                <div className="absolute -right-[3px] top-28 w-[3px] h-14 bg-[#283029] rounded-r-sm" />

                {/* OLED Screen Surface */}
                <div className="relative w-full h-full rounded-[42px] bg-gradient-to-b from-[#161c17] via-[#0f1310] to-[#0a0c0a] overflow-hidden flex flex-col justify-between p-4 text-[#fff8f2] shadow-inner border border-white/[0.04]">
                  {/* Status Bar */}
                  <div className="phone-ui-item flex items-center justify-between px-2 pt-1 pb-2 text-[10px] font-mono text-[#a6ada6]">
                    <span>9:41</span>
                    {/* Dynamic Island / Camera Notch */}
                    <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 px-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80 border border-blue-400/40" />
                      <div className="w-1 h-1 rounded-full bg-[#3b4b3e] animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3 text-[#b9cbba]" />
                      <Battery className="w-3.5 h-3.5 text-[#b9cbba]" />
                    </div>
                  </div>

                  {/* App Header Navigation */}
                  <div className="phone-ui-item flex items-center justify-between px-1 py-1 text-xs">
                    <ChevronDown className="w-4 h-4 text-[#a6ada6]" />
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-[#b9cbba] tracking-wider uppercase block">
                        PLAYING FROM TELEGRAM
                      </span>
                      <span className="text-[11px] font-bold text-[#fff8f2] truncate">
                        Lossless Studio Vault
                      </span>
                    </div>
                    <MoreVertical className="w-4 h-4 text-[#a6ada6]" />
                  </div>

                  {/* Album Cover Art Sleeve */}
                  <div className="phone-ui-item my-auto py-2 flex flex-col items-center">
                    <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.85)] border border-white/10 bg-[#121613] group">
                      <Image
                        src="/images/icon.png"
                        alt="Tone Cover"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Track Metadata & Heart Action */}
                  <div className="space-y-3 px-1">
                    <div className="phone-ui-item flex items-center justify-between">
                      <div className="space-y-0.5 max-w-[80%]">
                        <h4 className="text-sm sm:text-base font-bold text-[#fff8f2] truncate">
                          Solar Resonance
                        </h4>
                        <p className="text-xs text-[#b9cbba] font-medium truncate">
                          Tone Studio Master
                        </p>
                      </div>
                      <button className="p-2 rounded-full hover:bg-white/10 text-[#b9cbba]">
                        <Heart className="w-4 h-4 fill-[#b9cbba]" />
                      </button>
                    </div>

                    {/* Progress Bar & Timestamps */}
                    <div className="phone-ui-item space-y-1">
                      <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden">
                        <div className="bg-[#b9cbba] h-full w-[45%]" />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#a6ada6]">
                        <span>1:42</span>
                        <span>3:48</span>
                      </div>
                    </div>

                    {/* Audio Controls */}
                    <div className="phone-ui-item flex items-center justify-between px-2 pt-1">
                      <Shuffle className="w-3.5 h-3.5 text-[#b9cbba]" />
                      <SkipBack className="w-4 h-4 text-[#fff8f2]" />
                      <div className="w-11 h-11 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                        <Play className="w-5 h-5 fill-[#0d0f0d] ml-0.5" />
                      </div>
                      <SkipForward className="w-4 h-4 text-[#fff8f2]" />
                      <Repeat className="w-3.5 h-3.5 text-[#a6ada6]" />
                    </div>

                    {/* Bottom Daemon Status Badge */}
                    <div className="phone-ui-item pt-1 flex items-center justify-between text-[9px] font-mono text-[#a6ada6] border-t border-white/[0.06]">
                      <span className="flex items-center gap-1 text-[#b9cbba]">
                        <Volume2 className="w-3 h-3" />
                        <span>FLAC LOSSLESS</span>
                      </span>
                      <span className="text-green-400">OFFLINE CACHED</span>
                    </div>
                  </div>

                  {/* Home Swipe Indicator */}
                  <div className="phone-ui-item w-28 h-1 bg-white/30 rounded-full mx-auto mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customized QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#111412] border border-[#b9cbba]/30 p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] text-center space-y-6 overflow-hidden">
            {/* Ambient Modal Glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#b9cbba]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/15 bg-[#1c211d] flex-shrink-0 shadow-md">
                  <Image
                    src="/images/icon.png"
                    alt="Tone Icon"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#fff8f2] leading-none">
                    Tone for Android
                  </h3>
                  <p className="text-[11px] font-mono text-[#b9cbba] mt-1">
                    STANDALONE APK INSTALLER
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-[#a6ada6] hover:text-[#fff8f2] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Branded QR Code Container */}
            <div className="relative p-5 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-fit">
              <QRCodeSVG
                value={downloadUrl}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '/images/icon.png',
                  height: 42,
                  width: 42,
                  excavate: true,
                }}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-[#a6ada6] leading-relaxed">
                Scan with your Android camera or QR reader to download the official APK directly to your device.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#fff8f2] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#b9cbba]" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#a6ada6]" />
                      <span>Copy Download URL</span>
                    </>
                  )}
                </button>

                <a
                  href={downloadUrl}
                  download="tone.apk"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
