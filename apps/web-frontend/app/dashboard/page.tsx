"use client"

import { VoiceButton } from '@/components/protected/voice-button'
import api from '@/lib/api'
import axios from 'axios'
import React from 'react'
import { toast } from 'sonner'


const Dashboard = () => {
  const handlemic = async () => {
    try {
      const response = await api.post('/api/voice/temp-token')
      console.log(response.data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
  const message =
    error.response?.data?.message ?? "Failed to get temp token";

  toast.error("Failed to get temp token", {
    description: message,
  });
} else {
  toast.error("Unexpected error");
}
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
      <VoiceButton onTranscript={(t) => console.log(t)} />
    </div>
  )
}

export default Dashboard