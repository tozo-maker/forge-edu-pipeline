
import { useEffect } from "react";
import { useWizard } from "@/contexts/WizardContext";
import { useProjects } from "@/hooks/useProjects";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useProjectDataLoader = (projectId?: string) => {
  const { 
    setWizardData, 
    setIsEditing, 
    setInitialDataLoaded, 
    setIsLoadingProject,
    setCurrentProject
  } = useWizard();
  const { projects } = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId && projects.length > 0) {
      setIsLoadingProject(true);
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        setIsEditing(true);
        setCurrentProject(project);
        
        // Extract config data from project
        const configData = project.config_dna || {};
        
        // Convert config data to wizard form data format
        const projectWizardData = {
          title: project.title || "",
          description: project.description || "",
          projectType: configData.projectType || 'lesson_plan',
          gradeLevel: configData.educationalContext?.gradeLevel || [],
          subjectArea: configData.educationalContext?.subjectArea || [],
          standards: configData.educationalContext?.standards || [],
          objectives: configData.learningObjectives || [],
          teachingMethodology: configData.pedagogicalApproach?.teachingMethodology || [],
          assessmentPhilosophy: configData.pedagogicalApproach?.assessmentPhilosophy || "",
          differentiationStrategies: configData.pedagogicalApproach?.differentiationStrategies || [],
          languageComplexity: configData.culturalAccessibility?.languageComplexity || 'moderate',
          culturalInclusion: configData.culturalAccessibility?.culturalInclusion || [],
          accessibilityNeeds: configData.culturalAccessibility?.accessibilityNeeds || [],
          organizationPattern: configData.contentStructure?.organizationPattern || 'sequential',
          contentSections: configData.contentStructure?.contentSections || [],
          estimatedDuration: configData.contentStructure?.estimatedDuration || ""
        };
        
        setWizardData(projectWizardData);
        setInitialDataLoaded(true);
      } else {
        // If project not found, redirect to projects page
        toast.error("Project not found");
        navigate("/projects");
      }
      
      setIsLoadingProject(false);
    } else {
      setInitialDataLoaded(true);
    }
  }, [projectId, projects, navigate, setWizardData, setIsEditing, setInitialDataLoaded, setIsLoadingProject, setCurrentProject]);
};
