
import React from "react";
import { useParams } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WizardSteps from "@/components/project/WizardSteps";
import { WizardProvider } from "@/contexts/WizardContext";
import { useWizard } from "@/contexts/WizardContext";
import { useProjectDataLoader } from "@/hooks/useProjectDataLoader";
import WizardStepRenderer from "@/components/project/WizardStepRenderer";
import { WIZARD_STEPS } from "@/types/project";

const ProjectWizardContent: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentStep } = useWizard();
  
  // Load project data if editing an existing project
  useProjectDataLoader(projectId);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {projectId ? "Edit Project" : "Create New Project"}
          </h1>
          <p className="text-gray-600 mt-2">
            {projectId 
              ? "Update your project's educational DNA to enhance the content creation pipeline"
              : "Configure your project's educational DNA to power the entire content creation pipeline"
            }
          </p>
        </div>
        
        <div className="mb-8">
          <WizardSteps steps={WIZARD_STEPS} currentStep={currentStep} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <WizardStepRenderer />
        </div>
      </main>
    </div>
  );
};

const ProjectWizard: React.FC = () => {
  return (
    <WizardProvider>
      <ProjectWizardContent />
    </WizardProvider>
  );
};

export default ProjectWizard;
