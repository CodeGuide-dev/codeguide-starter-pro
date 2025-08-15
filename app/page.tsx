"use client"

import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      
      {/* Footer */}
      <footer className="py-12 bg-gradient-blue-white border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="glass-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Ready to Level Up Your Development?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join the community of developers who trust CodeGuide.dev for smarter, faster development.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="glass-hover bg-primary text-white px-8 py-3 rounded-xl font-medium shadow-lg"
                  asChild
                >
                  <Link href="/sign-up">
                    Start Free Trial
                  </Link>
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="glass-hover bg-transparent border border-border text-foreground px-8 py-3 rounded-xl font-medium"
                  asChild
                >
                  <Link href="/docs">
                    View Documentation
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-muted-foreground text-sm">
                © 2024 CodeGuide.dev. Built with AI, for developers.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
