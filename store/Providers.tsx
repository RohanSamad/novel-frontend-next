'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import AuthInitializer from '@/components/auth/AuthInitializer';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  );
};

export default Providers;