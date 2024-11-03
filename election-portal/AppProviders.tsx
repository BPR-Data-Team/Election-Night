'use client';

// AppProviders.tsx
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SharedStateProvider } from '../election-portal/app/sharedContext';

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SharedStateProvider>{children}</SharedStateProvider>
    </QueryClientProvider>
  );
};
