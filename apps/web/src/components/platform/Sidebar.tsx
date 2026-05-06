'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import clsx from 'clsx'

const NAV = [
  { href: '/hive', label: 'THE HIVE', icon: HiveIcon, desc: 'Threat Intelligence' },
  { href: '/eyes', label: 'EYES', icon: EyesIcon, desc: 'Deepfake Detection' },
  { href: '/bot', label: 'HORNET BOT', icon: BotIcon, desc: 'AI Analyst' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 h-screen bg-hornet-dark border-r border-hornet-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-hornet-border">
        <Link href="/hive">
          <h1 className="font-mono text-xl font-bold tracking-[0.3em] text-hornet-gold gold-glow">
            H0RN3T
          </h1>
          <p className="font-mono text-[10px] text-hornet-dim tracking-widest mt-0.5">
            CYBER INTELLIGENCE
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, desc }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 group',
                active
                  ? 'bg-hornet-gold/10 border border-hornet-gold/30 text-hornet-gold'
                  : 'text-hornet-dim hover:text-hornet-text hover:bg-hornet-panel'
              )}
            >
              <Icon
                className={clsx(
                  'w-5 h-5 flex-shrink-0',
                  active ? 'text-hornet-gold' : 'text-hornet-muted group-hover:text-hornet-dim'
                )}
              />
              <div>
                <div className="font-mono text-xs font-bold tracking-wider">{label}</div>
                <div className="font-mono text-[10px] text-hornet-muted tracking-wider">{desc}</div>
              </div>
              {active && (
                <div className="ml-auto w-1 h-4 bg-hornet-gold rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Status + Logout */}
      <div className="px-3 py-4 border-t border-hornet-border space-y-2">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-hornet-green animate-pulse" />
            <span className="font-mono text-[10px] text-hornet-dim tracking-widest">SYSTEMS ONLINE</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 font-mono text-xs text-hornet-dim hover:text-hornet-text hover:bg-hornet-panel rounded transition-colors"
        >
          // DISCONNECT
        </button>
      </div>
    </aside>
  )
}

function HiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" />
      <polygon points="12,7 17,9.5 17,14.5 12,17 7,14.5 7,9.5" />
    </svg>
  )
}

function EyesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  )
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1" />
      <circle cx="8.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <path d="M9 17h6" />
    </svg>
  )
}
