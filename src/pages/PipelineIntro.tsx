
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PIPELINE_STAGES } from "@/types/pipeline";
import { Link } from "react-router-dom";

const PipelineIntro: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primary-500 mb-4">
              The EduForge AI Six-Stage Pipeline
            </h1>
            <p className="text-gray-600 text-lg">
              Our structured approach helps you create high-quality educational content consistently
            </p>
          </div>
          
          <div className="space-y-12">
            {PIPELINE_STAGES.map((stage, index) => (
              <div key={stage.id} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{stage.title}</h2>
                  <p className="text-gray-600">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Ready to start creating educational content with our pipeline?
            </p>
            <Button asChild size="lg" className="px-8 rounded-full">
              <Link to="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineIntro;
