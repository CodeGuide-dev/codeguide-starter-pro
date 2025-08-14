'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Sparkles, Zap, ArrowRight, Github, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export interface HeroProps {
  className?: string
}

export function Hero({ className = '' }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(() => [
    'AI-Powered',
    'Intelligent',
    'Advanced',
    'Smart',
    'Revolutionary'
  ], [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1))
    }, 2500)
    return () => clearTimeout(timeoutId)
  }, [titleNumber, titles])

  return (
    <div className={`w-full min-h-screen relative overflow-hidden ${className}`}>
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-indigo-950/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 text-blue-400/20 dark:text-blue-300/10"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Code size={40} />
      </motion.div>

      <motion.div
        className="absolute top-32 right-20 text-purple-400/20 dark:text-purple-300/10"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles size={32} />
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-20 text-indigo-400/20 dark:text-indigo-300/10"
        animate={{
          y: [0, -25, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Zap size={36} />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="flex flex-col items-center justify-center gap-12 text-center">
          
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass-card"
          >
            <a
              href="https://codeguide.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row items-center gap-3 p-2"
            >
              <Image 
                src="/codeguide-logo.png" 
                alt="CodeGuide" 
                width={48} 
                height={48}
                className="rounded-lg"
              />
              <span className="logo-text text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CodeGuide
              </span>
            </a>
          </motion.div>

          {/* Main Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="glass-card max-w-4xl w-full"
          >
            <div className="flex flex-col gap-8 p-8 lg:p-12">
              
              {/* Animated Title */}
              <div className="flex flex-col gap-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="text-slate-800 dark:text-white">The Future of</span>
                  <br />
                  <span className="relative inline-block overflow-hidden h-16 md:h-20 lg:h-24">
                    {titles.map((title, index) => (
                      <motion.span
                        key={index}
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold"
                        initial={{ opacity: 0, y: 100 }}
                        animate={
                          titleNumber === index
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: titleNumber > index ? -100 : 100 }
                        }
                        transition={{
                          duration: 0.5,
                          ease: "easeInOut",
                        }}
                      >
                        {title}
                      </motion.span>
                    ))}
                  </span>
                  <br />
                  <span className="text-slate-800 dark:text-white">Code Development</span>
                </h1>

                <p className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  Elevate your coding experience with AI-powered insights, real-time suggestions, 
                  and intelligent code analysis. Transform how you write, review, and optimize code 
                  with our revolutionary platform.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Button 
                  size="lg" 
                  className="glass-button text-lg font-semibold text-slate-800 dark:text-white hover:text-slate-900 dark:hover:text-white group w-full sm:w-auto min-w-[200px]"
                >
                  <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="glass-button bg-white/10 dark:bg-black/10 border-white/20 text-lg font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white group w-full sm:w-auto min-w-[200px]"
                >
                  <Github className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
                  View on GitHub
                </Button>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[
                  { icon: Code, title: "Smart Analysis", desc: "AI-powered code insights" },
                  { icon: Zap, title: "Real-time Feedback", desc: "Instant suggestions" },
                  { icon: Sparkles, title: "Best Practices", desc: "Industry standards" }
                ].map(({ icon: Icon, title, desc }, index) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="glass-sm glass-hover rounded-xl p-4 text-center"
                  >
                    <Icon className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}