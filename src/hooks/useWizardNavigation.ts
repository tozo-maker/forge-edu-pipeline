
import { useWizard } from "@/contexts/WizardContext";
import { ProjectWizardFormData, WIZARD_STEPS } from "@/types/project";
import { useNavigate } from "react-router-dom";

export const useWizardNavigation = () => {
  const { 
    wizardData, 
    setWizardData, 
    currentStep, 
    setCurrentStep, 
    isEditing 
  } = useWizard();
  const navigate = useNavigate();

  const handleNext = (stepData: Partial<ProjectWizardFormData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const handlePrevious = (projectId?: string) => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    } else if (isEditing && projectId) {
      // If we're on the first step and editing, navigate back to project details
      navigate(`/projects/${projectId}`);
    }
  };

  return {
    handleNext,
    handlePrevious,
    currentStepId: WIZARD_STEPS[currentStep]?.id,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === WIZARD_STEPS.length - 1,
    totalSteps: WIZARD_STEPS.length,
  };
};
