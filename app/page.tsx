"use client"

import { Hero } from '@/components/hero-glassmorphism'
import { Features } from '@/components/features-glassmorphism'

export default function Home() {
  return (
    <main className="relative">
      {/* Main Content */}
      <Hero />
      <Features />
      
      {/* Smooth Scroll Behavior */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </main>
  )
}
