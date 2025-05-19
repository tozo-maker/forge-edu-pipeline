
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CallToAction: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Educational Content?
        </h2>
        <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
          Join thousands of educators creating high-quality, standards-aligned materials in minutes instead of hours.
        </p>
        <Button asChild size="lg" variant="secondary" className="rounded-full text-primary-700 bg-white hover:bg-white/90 text-lg px-8">
          <Link to="/register">
            Start Creating Content <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
