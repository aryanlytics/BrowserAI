"use client"

import api from '@/lib/api'
import React from 'react'
import { toast } from 'sonner'

const Dashboard = () => {
  const handlemic = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      const response = await api.post('/api/voice/temp-token')
      console.log(response.data)
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message ?? "Failed to get temp token";
      toast.error("Failed to get temp token", {
        description: message,
      });
    }


  }
  return (
    <div className='w-screen h-screen'>
      <div>
          Dasboaord
      </div>
      <div>
          <button onClick={handlemic}>
             Mic
          </button>
      </div>
    </div>
  )
}

export default Dashboard