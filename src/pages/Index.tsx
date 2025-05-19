
import React from "react";
import Header from "@/components/navigation/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeatureSection from "@/components/landing/FeatureSection";
import PipelineVisual from "@/components/landing/PipelineVisual";
import CallToAction from "@/components/landing/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        <PipelineVisual />
        <CallToAction />
      </main>
      <footer className="bg-gray-50 py-6 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          © {new Date().getFullYear()} EduForge AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
