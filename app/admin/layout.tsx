'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Ensure we're on client side before accessing localStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Don't do anything until component is mounted

    // Check access based on Redux state and localStorage as fallback
    const checkAccess = () => {
      // First priority: Use Redux state if auth is initialized
      if (isInitialized) {
        if (isAuthenticated && user && user.role === 'admin') {
          setHasAccess(true);
          return;
        } else {
          // Not authorized, redirect
          router.replace('/signin');
          return;
        }
      }

      // Second priority: If auth not initialized yet, check localStorage for quick feedback
      try {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (token && storedUser) {
          const user = JSON.parse(storedUser);
          if (user && user.role === 'admin') {
            // Looks like admin, allow access while auth initializes
            setHasAccess(true);
            return;
          }
        }
        
        // No valid admin credentials found
        router.replace('/signin');
      } catch (error) {
        // Error accessing localStorage or parsing user data
        router.replace('/signin');
      }
    };

    checkAccess();
  }, [isMounted, isAuthenticated, user, isInitialized, router]);

  // Show loading while:
  // 1. Component hasn't mounted yet (SSR safety)
  // 2. Auth is not initialized and we haven't determined access yet
  // 3. We determined no access and are redirecting
  if (!isMounted || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">
            {!isMounted ? 'Loading...' : 'Verifying access...'}
          </p>
        </div>
      </div>
    );
  }

  // User has access, render admin content
  return <>{children}</>;
}