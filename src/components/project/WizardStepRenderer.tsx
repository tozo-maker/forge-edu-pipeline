
import React from "react";
import { useWizard } from "@/contexts/WizardContext";
import { useWizardNavigation } from "@/hooks/useWizardNavigation";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { WIZARD_STEPS } from "@/types/project";

// Import step components
import ProjectTypeStep from "@/components/project/steps/ProjectTypeStep";
import EducationalContextStep from "@/components/project/steps/EducationalContextStep";
import LearningObjectivesStep from "@/components/project/steps/LearningObjectivesStep";
import PedagogicalApproachStep from "@/components/project/steps/PedagogicalApproachStep";
import CulturalAccessibilityStep from "@/components/project/steps/CulturalAccessibilityStep";
import ContentStructureStep from "@/components/project/steps/ContentStructureStep";
import FinalReviewStep from "@/components/project/steps/FinalReviewStep";
import { useProjectSubmission } from "@/hooks/useProjectSubmission";

const WizardStepRenderer: React.FC = () => {
  const { 
    wizardData, 
    currentStep, 
    isLoadingProject, 
    initialDataLoaded, 
    isEditing 
  } = useWizard();
  const { projectId } = useParams<{ projectId: string }>();
  const { handleNext, handlePrevious } = useWizardNavigation();
  const { isSubmitting, handleSubmit } = useProjectSubmission(projectId);

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading project data...</span>
      </div>
    );
  }

  if (!initialDataLoaded) {
    return null;
  }

  const onBack = () => handlePrevious(projectId);

  switch (currentStep) {
    case 0:
      return <ProjectTypeStep data={wizardData} onNext={handleNext} />;
    case 1:
      return <EducationalContextStep data={wizardData} onNext={handleNext} onBack={onBack} />;
    case 2:
      return <LearningObjectivesStep data={wizardData} onNext={handleNext} onBack={onBack} />;
    case 3:
      return <PedagogicalApproachStep data={wizardData} onNext={handleNext} onBack={onBack} />;
    case 4:
      return <CulturalAccessibilityStep data={wizardData} onNext={handleNext} onBack={onBack} />;
    case 5:
      return <ContentStructureStep data={wizardData} onNext={handleNext} onBack={onBack} />;
    case 6:
      return <FinalReviewStep 
        data={wizardData} 
        onSubmit={handleSubmit} 
        onBack={onBack} 
        isLoading={isSubmitting}
        isEditing={isEditing}
      />;
    default:
      return null;
  }
};

export default WizardStepRenderer;
