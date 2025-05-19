
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection: React.FC = () => {
  return (
    <section className="relative py-20 px-4 md:px-8 lg:px-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-0"></div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight heading-gradient mb-4">
                Transform Teaching with AI-Powered Content Creation
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-2xl">
                Create standards-aligned educational materials through intelligent configuration
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button asChild size="lg" className="rounded-full text-lg px-8">
                <Link to="/register">
                  Start Creating Content <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full text-lg px-8">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="relative animate-slide-in">
            <div className="bg-white rounded-xl shadow-xl p-6 relative z-10 border border-gray-100">
              <h3 className="font-bold text-xl mb-4 text-center text-primary-500">Six-Stage Pipeline</h3>
              <div className="space-y-2">
                {["Project Config", "Outline Context", "Section Details", "Claude Prompts", "Content", "Validation"].map((stage, index) => (
                  <div 
                    key={index}
                    className={`flex items-center p-3 rounded-lg ${
                      index === 0 ? "bg-primary-500 text-white" : "bg-gray-50"
                    } transition-all`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                      index === 0 ? "bg-white text-primary-500" : "bg-primary-100 text-primary-500"
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{stage}</span>
                    {index < 5 && (
                      <ArrowRight className={`ml-auto h-5 w-5 ${
                        index === 0 ? "text-white" : "text-gray-400"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 h-64 w-64 bg-gradient-to-br from-primary-500 to-accent rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
