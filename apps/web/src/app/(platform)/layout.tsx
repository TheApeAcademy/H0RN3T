import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/platform/Sidebar'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-hornet-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto relative">
        <div className="absolute inset-0 bg-hornet-grid bg-grid opacity-20 pointer-events-none" />
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
