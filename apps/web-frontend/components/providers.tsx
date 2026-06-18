"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Create a single QueryClient per browser session.
// It lives for the lifetime of the tab — that's how the cache persists
// across page navigations without a hard refresh.
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:           5 * 60 * 1000,  // data is "fresh" for 5 minutes
            gcTime:             10 * 60 * 1000,  // keep in cache 10 min when unused
            retry:              false,            // never retry auth failures
            refetchOnWindowFocus: false,          // don't refetch when tab regains focus
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
