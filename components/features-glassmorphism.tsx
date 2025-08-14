'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  Code2,
  Sparkles,
  Target,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  benefits: string[]
  delay?: number
  className?: string
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  benefits, 
  delay = 0, 
  className = '' 
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay, 
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ y: -8 }}
      className={`glass-card group relative overflow-hidden ${className}`}
    >
      {/* Background gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Icon */}
        <motion.div 
          className="mb-6"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-lg">
            <Icon className="w-full h-full text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6 flex-grow">
          {description}
        </p>

        {/* Benefits List */}
        <ul className="space-y-3 mb-6">
          {benefits.map((benefit, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 + index * 0.1 }}
              className="flex items-center gap-3 text-slate-700 dark:text-slate-200"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </motion.li>
          ))}
        </ul>

        {/* Learn More Link */}
        <Button 
          variant="ghost" 
          className="glass-button justify-between w-full group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-colors duration-300"
        >
          <span className="text-slate-700 dark:text-slate-200 font-medium">Learn More</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  )
}

export interface FeaturesProps {
  className?: string
}

export function Features({ className = '' }: FeaturesProps) {
  const features = [
    {
      icon: Brain,
      title: 'AI Code Analysis',
      description: 'Advanced machine learning algorithms analyze your code patterns, detect potential issues, and suggest optimizations in real-time.',
      benefits: [
        'Intelligent bug detection',
        'Performance optimization tips',
        'Code quality metrics',
        'Smart refactoring suggestions'
      ]
    },
    {
      icon: Zap,
      title: 'Real-time Suggestions',
      description: 'Get instant feedback and contextual suggestions as you type, helping you write better code faster than ever before.',
      benefits: [
        'Instant autocomplete',
        'Context-aware hints',
        'Live error detection',
        'Smart code completion'
      ]
    },
    {
      icon: Shield,
      title: 'Best Practices Enforcement',
      description: 'Automatically enforce coding standards and best practices across your entire team with customizable rules and guidelines.',
      benefits: [
        'Customizable rule sets',
        'Team-wide consistency',
        'Security vulnerability detection',
        'Industry standard compliance'
      ]
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamlessly collaborate with your team through shared workspaces, code reviews, and integrated communication tools.',
      benefits: [
        'Shared code workspaces',
        'Integrated code reviews',
        'Real-time collaboration',
        'Team progress tracking'
      ]
    }
  ]

  return (
    <section className={`py-24 lg:py-32 relative overflow-hidden ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-purple-50/30 dark:via-slate-900/30 dark:to-purple-950/30" />
      
      {/* Floating Background Icons */}
      <motion.div
        className="absolute top-32 left-12 text-blue-200/20 dark:text-blue-800/20"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Code2 size={60} />
      </motion.div>
      
      <motion.div
        className="absolute bottom-32 right-16 text-purple-200/20 dark:text-purple-800/20"
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <Target size={50} />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 glass-sm rounded-full px-6 py-3 mb-8">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Powerful Features
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-6 leading-tight">
            Everything You Need to
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Code Better
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover the comprehensive suite of AI-powered tools designed to transform 
            your development workflow and elevate your coding experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              benefits={feature.benefits}
              delay={0.3 + index * 0.15}
              className="h-full"
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-20"
        >
          <div className="glass-card inline-block">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                Ready to revolutionize your development workflow?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                Join thousands of developers who are already building better software with CodeGuide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="glass-button bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0">
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" className="glass-button">
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}