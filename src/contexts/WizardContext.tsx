
import React, { createContext, useContext, useState, ReactNode } from "react";
import { ProjectWizardFormData } from "@/types/project";

type WizardContextType = {
  wizardData: Partial<ProjectWizardFormData>;
  setWizardData: React.Dispatch<React.SetStateAction<Partial<ProjectWizardFormData>>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  initialDataLoaded: boolean;
  setInitialDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingProject: boolean;
  setIsLoadingProject: React.Dispatch<React.SetStateAction<boolean>>;
  currentProject: any;
  setCurrentProject: React.Dispatch<React.SetStateAction<any>>;
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};

type WizardProviderProps = {
  children: ReactNode;
  initialData?: Partial<ProjectWizardFormData>;
};

export const WizardProvider: React.FC<WizardProviderProps> = ({ 
  children, 
  initialData = {
    projectType: 'lesson_plan',
    gradeLevel: [],
    subjectArea: [],
    standards: [],
    objectives: [],
    teachingMethodology: [],
    differentiationStrategies: [],
    languageComplexity: 'moderate',
    culturalInclusion: [],
    accessibilityNeeds: [],
    organizationPattern: 'sequential',
    contentSections: []
  } 
}) => {
  const [wizardData, setWizardData] = useState<Partial<ProjectWizardFormData>>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);

  return (
    <WizardContext.Provider value={{ 
      wizardData, 
      setWizardData,
      currentStep,
      setCurrentStep,
      isEditing,
      setIsEditing,
      initialDataLoaded,
      setInitialDataLoaded,
      isLoading,
      setIsLoading,
      isLoadingProject,
      setIsLoadingProject,
      currentProject,
      setCurrentProject
    }}>
      {children}
    </WizardContext.Provider>
  );
};
