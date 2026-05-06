import dynamic from 'next/dynamic'
import LoadingScreen from '@/components/ui/LoadingScreen'

const LandingExperience = dynamic(
  () => import('@/components/canvas/Experience'),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  }
)

export default function HomePage() {
  return (
    <main className="relative w-full h-screen bg-hornet-black overflow-hidden">
      <LandingExperience />
    </main>
  )
}
