'use client'
import { useState, useEffect } from 'react'
import { useSceneStore } from '@/stores/sceneStore'
import Link from 'next/link'

const LETTERS = ['H', ' ', 'O', ' ', 'R', ' ', 'N', ' ', 'E', ' ', 'T']
const LETTER_DELAY = 120
const POST_DELAY = 800

export default function Typewriter() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const phase = useSceneStore((s) => s.phase)
  const setPhase = useSceneStore((s) => s.setPhase)
  const setIntroComplete = useSceneStore((s) => s.setIntroComplete)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    function typeLetter(index: number) {
      if (index <= LETTERS.length) {
        setVisibleCount(index)
        if (index < LETTERS.length) {
          timeout = setTimeout(() => typeLetter(index + 1), LETTER_DELAY)
        } else {
          timeout = setTimeout(() => {
            setShowSubtitle(true)
            setTimeout(() => {
              setShowCTA(true)
              setPhase('HERO')
              setIntroComplete(true)
            }, POST_DELAY)
          }, 400)
        }
      }
    }

    timeout = setTimeout(() => typeLetter(0), 1000)
    return () => clearTimeout(timeout)
  }, [setPhase, setIntroComplete])

  const scrollProgress = useSceneStore((s) => s.scrollProgress)
  const heroOpacity = Math.max(0, 1 - scrollProgress * 3)

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      style={{ opacity: heroOpacity, transition: 'opacity 0.3s ease' }}
    >
      {/* Main title */}
      <h1 className="font-mono font-bold text-5xl sm:text-6xl md:text-8xl text-hornet-gold tracking-[0.2em] select-none">
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            style={{
              opacity: i < visibleCount ? 1 : 0,
              textShadow: i < visibleCount ? '0 0 20px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.4)' : 'none',
              transition: 'opacity 0.1s ease, text-shadow 0.3s ease',
              display: 'inline-block',
            }}
          >
            {letter}
          </span>
        ))}
        {/* Cursor */}
        {visibleCount < LETTERS.length && (
          <span className="animate-pulse text-hornet-gold/60">_</span>
        )}
      </h1>

      {/* Subtitle */}
      <div
        className="mt-4 text-center"
        style={{
          opacity: showSubtitle ? 1 : 0,
          transform: showSubtitle ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <p className="font-mono text-xs sm:text-sm text-hornet-dim tracking-[0.4em] uppercase">
          Cybersecurity Intelligence Platform
        </p>
      </div>

      {/* CTA */}
      <div
        className="mt-12 pointer-events-auto"
        style={{
          opacity: showCTA ? 1 : 0,
          transform: showCTA ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
        }}
      >
        <Link
          href="/login"
          className="group relative px-8 py-3 font-mono text-sm font-bold tracking-[0.3em] text-hornet-black bg-hornet-gold
                     hover:bg-yellow-400 transition-colors duration-200 rounded
                     shadow-gold hover:shadow-gold-lg uppercase"
        >
          ENTER THE HIVE
          <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Scroll hint */}
      {showCTA && phase !== 'INTRO' && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: 0.4 }}
        >
          <span className="font-mono text-[10px] text-hornet-dim tracking-widest">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-hornet-gold/40 to-transparent animate-pulse" />
        </div>
      )}
    </div>
  )
}
