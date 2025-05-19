
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import WizardSteps from "@/components/project/WizardSteps";
import ProjectTypeStep from "@/components/project/steps/ProjectTypeStep";
import EducationalContextStep from "@/components/project/steps/EducationalContextStep";
import LearningObjectivesStep from "@/components/project/steps/LearningObjectivesStep";
import PedagogicalApproachStep from "@/components/project/steps/PedagogicalApproachStep";
import CulturalAccessibilityStep from "@/components/project/steps/CulturalAccessibilityStep";
import ContentStructureStep from "@/components/project/steps/ContentStructureStep";
import FinalReviewStep from "@/components/project/steps/FinalReviewStep";

// Define the steps for the wizard
const WIZARD_STEPS = [
  { id: 'project-type', title: 'Project Type' },
  { id: 'educational-context', title: 'Educational Context' },
  { id: 'learning-objectives', title: 'Learning Objectives' },
  { id: 'pedagogical-approach', title: 'Pedagogical Approach' },
  { id: 'cultural-accessibility', title: 'Cultural & Accessibility' },
  { id: 'content-structure', title: 'Content Structure' },
  { id: 'final-review', title: 'Review & Create' }
];

// Create a type for the wizard form data
export type ProjectWizardFormData = {
  // Project Type
  title: string;
  description: string;
  projectType: 'lesson_plan' | 'course_module' | 'assessment' | 'activity' | 'curriculum';
  
  // Educational Context
  gradeLevel: string[];
  subjectArea: string[];
  standards: string[];
  
  // Learning Objectives
  objectives: {
    text: string;
    bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  }[];
  
  // Pedagogical Approach
  teachingMethodology: string[];
  assessmentPhilosophy: string;
  differentiationStrategies: string[];
  
  // Cultural & Accessibility
  languageComplexity: 'simple' | 'moderate' | 'advanced';
  culturalInclusion: string[];
  accessibilityNeeds: string[];
  
  // Content Structure
  organizationPattern: 'sequential' | 'hierarchical' | 'modular';
  contentSections: { title: string; description: string; sequence: number }[];
  estimatedDuration: string;
};

const ProjectWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject } = useProjects();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<ProjectWizardFormData>>({
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
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = (stepData: Partial<ProjectWizardFormData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to create a project");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare project data for creation
      const projectData = {
        title: wizardData.title || "Untitled Project",
        description: wizardData.description || "",
        configData: {
          projectType: wizardData.projectType,
          educationalContext: {
            gradeLevel: wizardData.gradeLevel,
            subjectArea: wizardData.subjectArea,
            standards: wizardData.standards
          },
          learningObjectives: wizardData.objectives,
          pedagogicalApproach: {
            teachingMethodology: wizardData.teachingMethodology,
            assessmentPhilosophy: wizardData.assessmentPhilosophy,
            differentiationStrategies: wizardData.differentiationStrategies
          },
          culturalAccessibility: {
            languageComplexity: wizardData.languageComplexity,
            culturalInclusion: wizardData.culturalInclusion,
            accessibilityNeeds: wizardData.accessibilityNeeds
          },
          contentStructure: {
            organizationPattern: wizardData.organizationPattern,
            contentSections: wizardData.contentSections,
            estimatedDuration: wizardData.estimatedDuration
          }
        }
      };

      // Create the project
      const { data, error } = await createProject(projectData);

      if (error) {
        throw new Error(error);
      }

      toast.success("Project created successfully!");
      navigate(`/projects/${data.id}`);
    } catch (error: any) {
      toast.error(`Failed to create project: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which step component to render based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ProjectTypeStep data={wizardData} onNext={handleNext} />;
      case 1:
        return <EducationalContextStep data={wizardData} onNext={handleNext} onBack={handlePrevious} />;
      case 2:
        return <LearningObjectivesStep data={wizardData} onNext={handleNext} onBack={handlePrevious} />;
      case 3:
        return <PedagogicalApproachStep data={wizardData} onNext={handleNext} onBack={handlePrevious} />;
      case 4:
        return <CulturalAccessibilityStep data={wizardData} onNext={handleNext} onBack={handlePrevious} />;
      case 5:
        return <ContentStructureStep data={wizardData} onNext={handleNext} onBack={handlePrevious} />;
      case 6:
        return <FinalReviewStep 
          data={wizardData} 
          onSubmit={handleSubmit} 
          onBack={handlePrevious} 
          isLoading={isLoading} 
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">
            Configure your project's educational DNA to power the entire content creation pipeline
          </p>
        </div>
        
        <div className="mb-8">
          <WizardSteps steps={WIZARD_STEPS} currentStep={currentStep} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default ProjectWizard;
