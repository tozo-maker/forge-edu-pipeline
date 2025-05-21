
import { useState } from "react";
import { useWizard } from "@/contexts/WizardContext";
import { useProjects } from "@/hooks/useProjects";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useProjectSubmission = (projectId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { wizardData, isEditing, currentProject } = useWizard();
  const { createProject, updateProject } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to create a project");
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare project data for creation or update
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

      if (isEditing && projectId) {
        // Update existing project
        const { data, error } = await updateProject(projectId, {
          title: projectData.title,
          description: projectData.description,
          config_dna: projectData.configData,
          // If we're updating a project in the project_config stage, make sure to update completion percentage
          ...(currentProject?.pipeline_status === 'project_config' ? { completion_percentage: 20 } : {})
        });

        if (error) {
          throw new Error(error);
        }

        toast.success("Project updated successfully!");
        navigate(`/projects/${projectId}`);
      } else {
        // Create new project
        const { data, error } = await createProject(projectData);

        if (error) {
          throw new Error(error);
        }

        toast.success("Project created successfully!");
        navigate(`/projects/${data.id}`);
      }
    } catch (error: any) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} project: ${error.message}`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
