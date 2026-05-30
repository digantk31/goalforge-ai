import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

interface HolographicDecryptorProps {
  markdown: string
}

export function HolographicDecryptor({ markdown }: HolographicDecryptorProps) {
  const [decryptedTitle, setDecryptedTitle] = useState('')
  const [isTitleDone, setIsTitleDone] = useState(false)
  const [showBody, setShowBody] = useState(false)

  // Extract a clean title from markdown or fallback
  const rawTitle = markdown.match(/^#\s+(.+)$/m)?.[1] || 'Workflow Completion Report'
  // Clean markdown by removing the main title so we don't render it twice
  const cleanMarkdown = markdown.replace(/^#\s+.+$/m, '').trim()

  // Matrix character decryption effect for the main title
  useEffect(() => {
    let iteration = 0
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%@$&#*+='
    const target = rawTitle
    let interval: ReturnType<typeof setInterval>

    interval = setInterval(() => {
      setDecryptedTitle(() => {
        return target
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iteration) {
              return target[index]
            }
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')
      })

      if (iteration >= target.length) {
        clearInterval(interval)
        setIsTitleDone(true)
        // Sweep laser and reveal body shortly after title is decrypted
        setTimeout(() => setShowBody(true), 250)
      }

      iteration += 1.5 // Speed of decryption
    }, 30)

    return () => clearInterval(interval)
  }, [rawTitle])

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* Sweeping Laser Bar (Fires when body begins revealing) */}
      {showBody && (
        <div className="laser-scan-line" />
      )}

      {/* Decrypting Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono min-h-[40px] text-gradient-brand">
        {decryptedTitle}
        {!isTitleDone && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-2.5 h-6 bg-brand-400 ml-1 align-middle shadow-[0_0_8px_rgba(167,139,250,0.8)]"
          />
        )}
      </h1>

      {/* Holographic Body Reveal */}
      {showBody && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="cyber-decrypt-layer report-content p-2"
        >
          <ReactMarkdown>{cleanMarkdown}</ReactMarkdown>
        </motion.div>
      )}

      {/* Cyber decorative HUD metrics in background */}
      {!isTitleDone && (
        <div className="absolute right-0 top-0 text-[10px] font-mono text-zinc-600 uppercase tracking-widest select-none pointer-events-none animate-pulse">
          ⚡ Decrypting Secure Transmission Node...
        </div>
      )}
    </div>
  )
}
