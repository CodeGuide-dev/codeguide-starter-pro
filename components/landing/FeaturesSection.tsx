import { Card } from "@/components/ui/card";

const features = [
  {
    icon: "🤖",
    title: "AI-Powered Guidance",
    description: "Get intelligent code suggestions and architecture recommendations based on best practices and modern patterns.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: "⚡",
    title: "Modern Templates",
    description: "Start with production-ready templates featuring the latest tech stack and proven patterns.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: "🛡️",
    title: "Best Practices",
    description: "Built-in security guidelines, performance optimization tips, and code quality standards.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: "📊",
    title: "Code Analytics",
    description: "Track code quality metrics, identify bottlenecks, and improve your development workflow.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: "🔄",
    title: "Continuous Updates",
    description: "Stay current with automatic updates reflecting the latest industry trends and standards.",
    color: "from-teal-500 to-blue-500"
  },
  {
    icon: "🎯",
    title: "Precision Tools",
    description: "Fine-tuned AI models for specific languages, frameworks, and development scenarios.",
    color: "from-indigo-500 to-purple-500"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-gradient-blue-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="glass-sm inline-flex rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-primary">Features</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Everything You Need to Build Better
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            CodeGuide.dev provides comprehensive tools and guidance to accelerate your development workflow and improve code quality.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="glass-hover rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br {feature.color} p-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold mb-3 text-foreground font-poppins">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Ready to Transform Your Development?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of developers who are already building better code with AI guidance.
            </p>
            
            <button className="glass-hover bg-primary text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-300">
              Start Building Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}