// components/voice-button.tsx
'use client'
import { useState, useRef } from 'react'
import { useMicVAD } from '@ricky0123/vad-react'
import { getSpeechmaticsToken, connectSpeechmatics } from '@/lib/speechmatics'
import { Mic, MicOff } from 'lucide-react'

