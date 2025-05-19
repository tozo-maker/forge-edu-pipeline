
import React from "react";
import { CheckIcon } from "lucide-react";

type Step = {
  id: string;
  title: string;
};

type WizardStepsProps = {
  steps: Step[];
  currentStep: number;
};

const WizardSteps: React.FC<WizardStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full">
      <div className="hidden sm:flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step circle */}
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                  ${
                    index < currentStep
                      ? "bg-primary border-primary text-white"
                      : index === currentStep
                      ? "border-primary text-primary" 
                      : "border-gray-300 text-gray-400"
                  }`}
              >
                {index < currentStep ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                {step.title}
              </span>
            </div>
            
            {/* Line between steps */}
            {index < steps.length - 1 && (
              <div 
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStep ? "bg-primary" : "bg-gray-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Mobile view - just show current step title */}
      <div className="flex sm:hidden justify-between items-center">
        <span className="font-medium">Step {currentStep + 1}: {steps[currentStep].title}</span>
        <span className="text-sm text-gray-500">{currentStep + 1} of {steps.length}</span>
      </div>
    </div>
  );
};

export default WizardSteps;
