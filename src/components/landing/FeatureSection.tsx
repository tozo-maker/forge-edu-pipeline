
import React from "react";
import { 
  Settings2, 
  Cpu, 
  ClipboardCheck, 
  FileOutput
} from "lucide-react";

const features = [
  {
    title: "Smart Configuration",
    description: "Easily set up your educational content with guided configurations that align with teaching standards",
    icon: <Settings2 className="h-10 w-10 text-primary-500" />
  },
  {
    title: "AI Generation",
    description: "Leverage Claude AI to generate high-quality, contextually relevant educational content",
    icon: <Cpu className="h-10 w-10 text-primary-500" />
  },
  {
    title: "Quality Analysis",
    description: "Automatically validate content against educational standards and best practices",
    icon: <ClipboardCheck className="h-10 w-10 text-primary-500" />
  },
  {
    title: "Multi-Format Export",
    description: "Export your content in various formats suitable for different learning environments",
    icon: <FileOutput className="h-10 w-10 text-primary-500" />
  }
];

const FeatureSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-4">
            Streamline Your Content Creation Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our six-stage pipeline ensures high-quality educational content every time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
