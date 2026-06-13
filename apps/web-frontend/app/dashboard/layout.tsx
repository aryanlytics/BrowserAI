import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import api from '@/lib/api'
import axios from 'axios'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('sessionToken')?.value

  // 1. If cookie is missing, redirect immediately
  if (!token) {
    redirect('/sign-in?error=login_required')
  }

  // 2. Query the API Gateway to validate the session on the backend
  try {
    await api.get('/api/auth/dashborad', {
      headers: {
        // Forward the session cookie to the API Gateway so the server can validate it
        'Cookie': `sessionToken=${token}`,
      },
    })
  } catch (err) {
    console.error('[Dashboard Security] ❌ Failed to validate session:', err)

    const status = axios.isAxiosError(err)
    ? err.response?.status
    : undefined

  if (status === 401 || status === 403) {
    redirect('/sign-in?error=session_expired')
  }

    // Network errors or gateway down
    redirect('/sign-in?error=server_error')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* You can put common dashboard layout elements here, like Sidebar or Header */}
      {children}
    </div>
  )
}
