import { create } from 'zustand'

export type ScenePhase = 'INTRO' | 'HERO' | 'FLYTHROUGH' | 'HIVE'

interface SceneState {
  phase: ScenePhase
  scrollProgress: number
  mouseX: number
  mouseY: number
  cameraZ: number
  introComplete: boolean
  setPhase: (phase: ScenePhase) => void
  setScrollProgress: (v: number) => void
  setMouse: (x: number, y: number) => void
  setCameraZ: (z: number) => void
  setIntroComplete: (v: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  phase: 'INTRO',
  scrollProgress: 0,
  mouseX: 0,
  mouseY: 0,
  cameraZ: 5,
  introComplete: false,
  setPhase: (phase) => set({ phase }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setMouse: (mouseX, mouseY) => set({ mouseX, mouseY }),
  setCameraZ: (cameraZ) => set({ cameraZ }),
  setIntroComplete: (introComplete) => set({ introComplete }),
}))
