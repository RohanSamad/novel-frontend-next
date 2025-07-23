'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (!token || !userStr) {
      router.replace('/signin');
      return;
    }

    const user = JSON.parse(userStr);

    if (user.role !== 'admin') {
      router.replace('/signin');
      return;
    }

    setIsVerified(true);
  }, [router]);

  if (!isVerified) return null;

  return <>{children}</>;
}
