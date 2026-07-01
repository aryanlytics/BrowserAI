"use client"

import api from "@/lib/api"
import { useState } from "react"

const Dashboard = () => {
  const [isListening, setIsListening] = useState(false)
  const [token, setToken] = useState("")
  const handleMicClick = async () => {
    try {
      setIsListening(true)
      const response = await api.post("/api/voice/temp-token")
      if (response.data.token) {
        setToken(response.data.token)
        
      }
      console.log(response)
    } catch (error) {
      console.error(error)
    }
    finally {
      setIsListening(false)
    }
  }
  return (
    <div>
      <div>Dashboard</div>
      <button disabled={isListening} onClick={handleMicClick}>{isListening ? "Stop using your voice" : "control browser with your voice"}</button>
    </div>
  )
}

export default Dashboard