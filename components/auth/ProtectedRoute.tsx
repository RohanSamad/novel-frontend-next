'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPasswordVerification from './AdminPasswordVerification';

interface ProtectedRouteProps {
  isAllowed: boolean;
  redirectPath?: string;
  children: React.ReactNode;
  requiresAdminVerification?: boolean;
}

const ProtectedRoute = ({
  isAllowed,
  redirectPath = '/signin',
  children,
  requiresAdminVerification = false,
}: ProtectedRouteProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(requiresAdminVerification);
  const router = useRouter();

  useEffect(() => {
    if (!isAllowed) {
      router.replace(redirectPath);
    }
  }, [isAllowed, router, redirectPath]);

  if (!isAllowed) {
    return null; // Wait for redirect
  }

  if (requiresAdminVerification && !isVerified) {
    return (
      <>
        {showVerification && (
          <AdminPasswordVerification
            onVerified={() => {
              setIsVerified(true);
              setShowVerification(false);
            }}
            onCancel={() => {
              setShowVerification(false);
              router.back();
            }}
          />
        )}
        <div className="min-h-screen bg-gray-50" aria-hidden="true" />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
