import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SessionUser {
  id:            string;
  name:          string;
  email:         string;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────
// This is the ONLY function that talks to the backend for session data.
// TanStack Query calls it once, then caches the result.
async function fetchSession(): Promise<SessionUser> {
  const res = await api.get('/api/auth/dashboard');
  return res.data.user;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Use this in any protected component/layout.
// On first call → backend request → caches result.
// On every subsequent call within staleTime → returns cached data instantly.
export function useSession() {
  const router      = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['session'],   // all protected routes share this same cache key
    queryFn:  fetchSession,
  });

  // ── Logout helper ────────────────────────────────────────────────────────────
  // Call this on logout to immediately clear the cache so the old user data
  // is never shown again, even within the staleTime window.
  const clearSession = () => {
    queryClient.removeQueries({ queryKey: ['session'] });
    router.push('/signin');
  };

  return {
    user:      query.data ?? null,       // the cached user (or null)
    isLoading: query.isPending,          // true only on the very first load
    isError:   query.isError,            // true if backend returned 401/403/500
    error:     query.error,
    clearSession,                        // call on logout
  };
}

// ─── How the cache behaves ────────────────────────────────────────────────────
//
// Visit /dashboard (first time):
//   isPending = true  → show spinner
//   fetchSession() runs → backend call → user data stored in cache
//   isLoading = false → render dashboard with user.name, user.email
//
// Navigate to /dashboard/settings (within 5 minutes):
//   isPending = false → no spinner, no backend call
//   user = cached data → render immediately
//
// Come back after 5 minutes (staleTime expired):
//   isPending = false → shows stale data instantly
//   fetchSession() runs in background → updates cache silently
//
// Logout:
//   clearSession() removes cache entry → next visit forces a fresh backend call
