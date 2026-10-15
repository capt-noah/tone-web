'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, Smartphone, Sparkles, ShieldCheck, Zap, X } from 'lucide-react';

export function AndroidDownloadBanner() {
  const [showQrModal, setShowQrModal] = useState(false);
  const downloadUrl = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || 'https://musicly-4l0y.onrender.com/download/musicly.apk';

  return (
    <section id="download-android" className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c211d]/90 via-[#111412] to-[#0d0f0d] border border-white/[0.08] shadow-2xl p-6 sm:p-8 md:p-10 select-none mb-10">
      {/* Dynamic atmospheric glow inside banner */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#b9cbba]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#3b4b3e]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline & Feature Matrix */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b9cbba]/10 border border-[#b9cbba]/20 text-[#b9cbba] text-xs font-mono tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#b9cbba]" />
            <span>Tone Mobile for Android</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#fff8f2] leading-[1.1]">
              Take Your Music <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b9cbba] via-[#fff8f2] to-[#a6ada6]">
                Everywhere.
              </span>
            </h2>
            <p className="text-sm md:text-base text-[#a6ada6] max-w-lg leading-relaxed pt-1">
              Experience lossless Telegram cloud sync, instant offline caching, physical lockscreen audio controls, and pure bit-perfect playback on your Android device.
            </p>
          </div>

          {/* Feature Badges Matrix */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1c211d] border border-white/[0.06] text-xs font-medium text-[#fff8f2]">
              <Zap className="w-3.5 h-3.5 text-[#b9cbba]" />
              <span>Lossless FLAC Sync</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1c211d] border border-white/[0.06] text-xs font-medium text-[#fff8f2]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b9cbba]" />
              <span>Offline Cache</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1c211d] border border-white/[0.06] text-xs font-medium text-[#fff8f2]">
              <Smartphone className="w-3.5 h-3.5 text-[#b9cbba]" />
              <span>Lockscreen Studio</span>
            </div>
          </div>

          {/* CTA Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={downloadUrl}
              download="tone.apk"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-sm font-bold shadow-[0_0_25px_rgba(185,203,186,0.35)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-[#0d0f0d]" />
              <span>Download APK</span>
              <span className="text-[10px] font-mono opacity-70 ml-1">v1.2</span>
            </a>

            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#fff8f2] transition-colors"
            >
              <QrCode className="w-4 h-4 text-[#b9cbba]" />
              <span>Scan QR Code</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Perspective Phone Mockup */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-64 sm:w-72 aspect-[9/18.5] rounded-[36px] bg-[#090b09] border-[6px] border-[#212722] shadow-[0_25px_60px_rgba(0,0,0,0.8)] p-2.5 flex flex-col justify-between overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
            {/* Phone Speaker Notch */}
            <div className="w-20 h-4 bg-[#111412] rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#0d0f0d]" />
            </div>

            {/* Mobile Screen Mock Content */}
            <div className="flex-1 rounded-[24px] bg-gradient-to-b from-[#161a16] to-[#0d0f0d] p-3 flex flex-col justify-between border border-white/[0.04] overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#b9cbba]">TONE MOBILE</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#b9cbba] animate-ping" />
              </div>

              {/* Mock Cover Artwork */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden my-auto shadow-lg bg-[#1c211d]">
                <Image
                  src="/images/icon.png"
                  alt="Tone Mobile App"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Mock Controls */}
              <div className="space-y-2 pt-2">
                <div className="h-1 bg-white/20 rounded-full w-full overflow-hidden">
                  <div className="h-full bg-[#b9cbba] w-2/3" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#fff8f2] font-semibold">
                  <span>Midnight Pulse</span>
                  <span className="text-[#b9cbba] font-mono text-[9px]">PLAYING</span>
                </div>
              </div>
            </div>

            {/* Home Indicator Bar */}
            <div className="w-24 h-1 bg-white/20 rounded-full mx-auto mt-2" />
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#111412] border border-white/10 p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#fff8f2]">Scan to Install</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-inner">
              <QRCodeSVG
                value={downloadUrl}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-xs text-[#a6ada6] leading-relaxed">
              Open your Android camera app and point it at this QR code to download the Tone APK directly.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
