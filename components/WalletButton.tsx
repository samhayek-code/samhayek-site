'use client'

import { useState, useEffect } from 'react'

interface WalletButtonProps {
  currency: 'SOL' | 'ETH' | 'BTC'
  address: string
  onShowQR?: (currency: string, address: string) => void
  showQRButton?: boolean
}

const currencyColors: Record<string, string> = {
  SOL: '#9945FF',
  ETH: '#627EEA',
  BTC: '#F7931A',
}

const currencyIcons: Record<string, JSX.Element> = {
  SOL: (
    <svg viewBox="0 0 397.7 311.7" fill="currentColor" className="w-5 h-5">
      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/>
      <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
    </svg>
  ),
  ETH: (
    <svg viewBox="0 0 256 417" fill="currentColor" className="w-5 h-5">
      <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fillOpacity=".8"/>
      <path d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
      <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fillOpacity=".8"/>
      <path d="M127.962 416.905v-104.72L0 236.585z"/>
      <path d="M127.961 287.958l127.96-75.637-127.96-58.162z" fillOpacity=".6"/>
      <path d="M0 212.32l127.96 75.638v-133.8z" fillOpacity=".8"/>
    </svg>
  ),
  BTC: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z"/>
      <path fill="#0a0a0a" d="M17.27 10.554c.238-1.587-.97-2.44-2.622-3.01l.536-2.148-1.308-.326-.521 2.09c-.344-.085-.697-.166-1.048-.246l.525-2.103-1.307-.326-.536 2.147c-.284-.065-.563-.128-.834-.196l.001-.006-1.803-.45-.348 1.396s.97.222.95.236c.53.132.625.483.61.761l-.612 2.453c.037.01.084.023.137.045l-.139-.035-.857 3.436c-.065.161-.23.403-.601.312.013.02-.95-.238-.95-.238l-.65 1.497 1.702.424c.317.08.627.162.933.24l-.54 2.175 1.305.326.536-2.15c.356.097.702.186 1.04.272l-.534 2.14 1.308.326.541-2.17c2.226.42 3.9.251 4.604-1.763.568-1.621-.028-2.557-1.2-3.168.854-.197 1.497-.758 1.67-1.917zm-2.986 4.186c-.403 1.621-3.13.745-4.014.525l.716-2.871c.884.221 3.72.658 3.298 2.346zm.404-4.21c-.368 1.474-2.638.725-3.375.542l.65-2.603c.737.184 3.108.527 2.725 2.062z"/>
    </svg>
  ),
}

export default function WalletButton({ currency, address, onShowQR, showQRButton = true }: WalletButtonProps) {
  const [copied, setCopied] = useState(false)
  const color = currencyColors[currency]
  const icon = currencyIcons[currency]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-3 p-4 rounded-lg border transition-all group"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        {/* Currency icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>

        {/* Address */}
        <div className="flex-1 min-w-0">
          <div className="font-mono font-medium text-xs text-muted mb-1">{currency}</div>
          <div className="font-mono font-medium text-[11px] text-foreground/70 truncate">
            {address}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          {/* QR Code button */}
          {showQRButton && onShowQR && (
            <button
              onClick={() => onShowQR(currency, address)}
              className="p-2 rounded-md transition-all hover:bg-white/10"
              style={{ color: '#666' }}
              aria-label="Show QR code"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="3" height="3" />
                <rect x="18" y="14" width="3" height="3" />
                <rect x="14" y="18" width="3" height="3" />
                <rect x="18" y="18" width="3" height="3" />
              </svg>
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-md transition-all hover:bg-white/10"
            style={{ color: copied ? '#34d399' : '#666' }}
            aria-label="Copy address"
          >
            {copied ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
