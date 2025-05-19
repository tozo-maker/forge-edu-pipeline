
import React from "react";
import { ArrowRight } from "lucide-react";
import { PIPELINE_STAGES } from "@/types/pipeline";

const PipelineVisual: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-4">
            Our Six-Stage Pipeline
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every piece of content flows through our carefully designed process
          </p>
        </div>

        <div className="relative">
          {/* Desktop view */}
          <div className="hidden md:flex flex-wrap justify-between">
            {PIPELINE_STAGES.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <div className="w-[15%] flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-center">{stage.title}</h3>
                  <p className="text-sm text-center text-gray-600">{stage.description}</p>
                </div>
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className="flex items-center justify-center w-[2%]">
                    <ArrowRight className="h-8 w-8 text-primary-500" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Mobile view */}
          <div className="md:hidden space-y-8">
            {PIPELINE_STAGES.map((stage, index) => (
              <div key={stage.id} className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{stage.title}</h3>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PipelineVisual;
