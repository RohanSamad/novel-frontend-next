'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';

interface AdminPasswordVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
}

const AdminPasswordVerification: React.FC<AdminPasswordVerificationProps> = ({
  onVerified,
  onCancel
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TEMP: Replace with actual validation logic (e.g., Supabase or internal API call)
      const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      
      if (password !== ADMIN_PASSWORD) {
        throw new Error('Invalid password');
      }

      toast.success('Admin access verified');
      onVerified();
    } catch {
      toast.error('Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary-100 p-3 rounded-full">
            <Lock className="h-5 w-5 text-primary-600" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-6">
          Verify Admin Access
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Admin Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Verify
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPasswordVerification;
