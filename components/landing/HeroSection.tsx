import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-blue-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Main Hero Card */}
          <div className="glass-lg rounded-3xl p-8 sm:p-12 mb-8">
            
            {/* Badge */}
            <div className="inline-flex items-center glass-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-primary">✨ AI-Powered Development</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Build Better Code
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                With AI Guidance
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              CodeGuide.dev transforms how you write code with intelligent AI assistance, 
              modern templates, and best practices that help you ship faster and smarter.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="glass-hover bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium shadow-lg"
                asChild
              >
                <Link href="/sign-up">
                  Get Started Free
                  <span className="ml-2">→</span>
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="glass-hover bg-transparent hover:bg-secondary border border-border text-foreground px-8 py-3 rounded-xl font-medium"
                asChild
              >
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Developers", value: "10K+" },
              { label: "Code Reviews", value: "50K+" },
              { label: "Hours Saved", value: "100K+" }
            ].map((stat, i) => (
              <div key={i} className="glass-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary font-poppins">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 glass-sm rounded-full p-3 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2"></div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  );
}