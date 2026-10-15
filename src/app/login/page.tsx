'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter your username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await login(username.trim(), password);
    setIsLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 select-none relative overflow-hidden bg-[#0d0f0d]">
      {/* Ambient Lighting Gradients (Smooth Multi-Stop Radial) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(59, 75, 62, 0.20) 0%, rgba(185, 203, 186, 0.06) 35%, transparent 70%)',
          transform: 'translateZ(0)',
        }}
      />

      {/* Luxury Auth Card with Generous Vertical Spacing */}
      <div className="w-full max-w-[440px] rounded-[32px] bg-gradient-to-b from-[#171e18] via-[#111512] to-[#0c0f0d] border border-white/[0.12] p-8 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Card Top Navigation: Back Button & Logo */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1c221d] hover:bg-white/10 border border-white/[0.08] text-xs font-medium text-[#a6ada6] hover:text-[#fff8f2] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>

          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md border border-white/20 bg-[#1c211d]">
            <Image
              src="/images/icon.png"
              alt="Tone"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-[26px] font-black tracking-tight text-[#fff8f2]">
            Welcome Back
          </h2>
          <p className="text-sm text-[#a6ada6]">
            Sign in to access your lossless collection
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#0d0f0d] border border-white/[0.08]">
          <button
            type="button"
            className="py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#1c221d] text-[#fff8f2] shadow-sm border border-white/[0.08]"
          >
            Sign In
          </button>
          <Link
            href="/register"
            className="py-2 rounded-xl text-xs sm:text-sm font-medium text-[#a6ada6] hover:text-[#fff8f2] text-center transition-colors flex items-center justify-center"
          >
            Create Account
          </Link>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#ee7d77]/15 border border-[#ee7d77]/30 text-xs sm:text-sm text-[#ee7d77] text-center font-medium animate-in fade-in duration-150">
            {error}
          </div>
        )}

        {/* Form without sticking labels */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Username Input */}
          <div className="relative flex items-center">
            <User className="absolute left-4 w-4 h-4 text-[#a6ada6]" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#141915] border border-white/[0.08] text-sm sm:text-base text-[#fff8f2] placeholder-[#a6ada6]/50 focus:outline-none focus:border-[#b9cbba]/60 focus:ring-1 focus:ring-[#b9cbba]/40 transition-all shadow-inner"
              required
              autoFocus
            />
          </div>

          {/* Password Input with Visibility Toggle */}
          <div className="relative flex items-center">
            <Lock className="absolute left-4 w-4 h-4 text-[#a6ada6]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#141915] border border-white/[0.08] text-sm sm:text-base text-[#fff8f2] placeholder-[#a6ada6]/50 focus:outline-none focus:border-[#b9cbba]/60 focus:ring-1 focus:ring-[#b9cbba]/40 transition-all shadow-inner"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 p-1 rounded-lg text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/5 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] font-bold text-sm sm:text-base shadow-[0_0_20px_rgba(185,203,186,0.25)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-3"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
