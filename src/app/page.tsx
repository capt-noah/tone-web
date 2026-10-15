'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { PublicProductLanding } from '@/components/home/PublicProductLanding';
import { AuthenticatedDashboard } from '@/components/home/AuthenticatedDashboard';
import { DashboardSkeleton } from '@/components/shared/Skeletons';

export default function HomePage() {
  const { isAuthenticated, isMounted, isLoading } = useAuth();
  const { isPageLoading, isInitialized } = useSync();

  // If not mounted on client yet, return null for SSR hydration safety
  if (!isMounted) {
    return null;
  }

  // When logged in -> Spotify-style Music Hub
  if (isAuthenticated) {
    if (isLoading || isPageLoading || !isInitialized) {
      return <DashboardSkeleton />;
    }
    return <AuthenticatedDashboard />;
  }

  // If unauthenticated but still resolving session, wait silently to prevent landing flash
  if (isLoading) {
    return null;
  }

  // For visitors or unauthenticated state -> Dedicated Awwwards-Grade Product Landing
  return <PublicProductLanding />;
}
