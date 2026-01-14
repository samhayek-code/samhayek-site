'use client'

import { useState, useEffect } from 'react'

export default function LiveClock() {
  const [time, setTime] = useState<string>('')
  
  useEffect(() => {
    // Set initial time
    setTime(new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    }))
    
    // Update every second
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      }))
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <span 
      className="font-mono font-bold text-[11px] text-subtle tracking-wide"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {time}
    </span>
  )
}
