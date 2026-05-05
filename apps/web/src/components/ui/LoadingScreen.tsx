'use client'
export default function LoadingScreen() {
  return (
    <div className="w-full h-screen bg-hornet-black flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-hornet-gold/20 border-t-hornet-gold animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-hornet-gold/60 text-xs">⬡</span>
        </div>
      </div>
      <div>
        <p className="font-mono text-hornet-gold tracking-[0.5em] text-sm font-bold">H0RN3T</p>
        <p className="font-mono text-hornet-muted text-xs text-center mt-1 tracking-widest">
          INITIALIZING
        </p>
      </div>
    </div>
  )
}
