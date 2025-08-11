'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { checkSession } from '@/store/slices/authSlice';

const AuthDebug: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [testResult, setTestResult] = useState<string>('');

  const testSessionCheck = async () => {
    setTestResult('Testing...');
    try {
      const result = await dispatch(checkSession());
      setTestResult(`Success: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setTestResult('Cleared localStorage');
  };

  const showStorageData = () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    setTestResult(`Token: ${token ? 'EXISTS' : 'MISSING'}\nUser: ${user || 'MISSING'}`);
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">🔧 Auth Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Auth State:</strong>
          <pre className="text-xs bg-gray-100 p-1 rounded mt-1">
            {JSON.stringify(
              {
                isAuthenticated: auth.isAuthenticated,
                hasUser: !!auth.user,
                userRole: auth.user?.role,
                status: auth.status,
                isInitialized: auth.isInitialized,
                error: auth.error,
              },
              null,
              2
            )}
          </pre>
        </div>
        
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={testSessionCheck}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Test Session
          </button>
          <button
            onClick={showStorageData}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs"
          >
            Show Storage
          </button>
          <button
            onClick={clearAllData}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
          >
            Clear All
          </button>
        </div>
        
        {testResult && (
          <div className="mt-2">
            <strong>Test Result:</strong>
            <pre className="text-xs bg-gray-100 p-1 rounded mt-1 max-h-32 overflow-auto">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;