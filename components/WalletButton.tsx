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
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M4.52 16.72l3.27-3.27a.6.6 0 01.42-.18h13.02a.3.3 0 01.21.51l-3.27 3.27a.6.6 0 01-.42.18H4.73a.3.3 0 01-.21-.51zm0-9.44l3.27 3.27a.6.6 0 00.42.18h13.02a.3.3 0 00.21-.51L18.17 6.95a.6.6 0 00-.42-.18H4.73a.3.3 0 00-.21.51zm16.71 2.99L18.17 13a.6.6 0 01-.42.18H4.73a.3.3 0 01-.21-.51l3.06-3.27a.6.6 0 01.42-.18h13.02a.3.3 0 01.21.51z"/>
    </svg>
  ),
  ETH: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 1.5l-7 10.75L12 16l7-3.75L12 1.5zM5 13.5L12 22.5l7-9L12 17.25 5 13.5z"/>
    </svg>
  ),
  BTC: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M14.24 10.56c-.31 1.24-2.24.61-2.84.44l.55-2.18c.62.18 2.61.44 2.29 1.74zm-3.11 1.56l-.6 2.41c.74.19 3.03.92 3.37-.44.36-1.42-2.03-1.79-2.77-1.97zm10.57 2.3c-1.34 5.36-6.76 8.62-12.12 7.28S.96 14.94 2.3 9.58 9.06.96 14.42 2.3s8.62 6.76 7.28 12.12zm-5.77-5.67c.26-1.7-1.04-2.62-2.81-3.23l.57-2.3-1.4-.35-.56 2.23c-.37-.09-.75-.18-1.13-.27l.56-2.25-1.4-.35-.58 2.3c-.3-.07-.6-.14-.89-.21l-1.93-.48-.37 1.49s1.04.24 1.02.25c.57.14.67.52.65.82l-.66 2.63c.04.01.09.02.14.04l-.14-.03-.92 3.67c-.07.17-.24.42-.63.32.01.02-1.02-.25-1.02-.25l-.7 1.6 1.82.45c.34.09.67.17 1 .26l-.58 2.33 1.4.35.58-2.3c.38.1.75.2 1.12.29l-.57 2.28 1.4.35.58-2.32c2.4.45 4.2.27 4.96-1.9.61-1.75-.03-2.75-1.29-3.41.92-.21 1.61-.81 1.8-2.05z"/>
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
          <div className="font-mono text-xs text-muted mb-1">{currency}</div>
          <div className="font-mono text-[11px] text-foreground/70 truncate">
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
