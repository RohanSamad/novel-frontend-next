'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { checkSession, setInitialized, restoreFromStorage } from '@/store/slices/authSlice';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we're on client side before accessing localStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Don't access localStorage until mounted

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (!token) {
          dispatch(setInitialized());
          return;
        }

        // First, restore from localStorage immediately for instant UX
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user && user.id && user.email) {
              dispatch(restoreFromStorage());
            }
          } catch (e) {
            // Invalid stored data, continue with API validation
          }
        }

        // Then validate with server in background (this may update the state)
        await dispatch(checkSession());
        
      } catch (error) {
        // Fallback: try to restore from localStorage even if API fails
        try {
          const token = localStorage.getItem('auth_token');
          const storedUser = localStorage.getItem('auth_user');
          
          if (token && storedUser) {
            const user = JSON.parse(storedUser);
            if (user && user.id && user.email) {
              dispatch(restoreFromStorage());
              return;
            }
          }
        } catch (e) {
          // If everything fails, just mark as initialized
        }
        
        dispatch(setInitialized());
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [dispatch, isInitialized, isMounted]);

  // Always render children immediately - no loading screen
  return <>{children}</>;
};

export default AuthInitializer;