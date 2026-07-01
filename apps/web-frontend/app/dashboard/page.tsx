"use client"

import api from "@/lib/api"
import { useState } from "react"

const Dashboard = () => {
  const [isListening, setIsListening] = useState(false)
  const handleMicClick = async () => {
    try {
      setIsListening(true)
      const response = await api.post("/api/voice/temp-token")
      console.log(response)
    } catch (error) {
      console.error(error)
    }
    
  }
  return (
    <div>
      <div>Dashboard</div>
      <button onClick={handleMicClick}>Mic</button>
    </div>
  )
}

export default Dashboard