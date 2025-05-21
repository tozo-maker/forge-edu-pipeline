
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PIPELINE_STAGES, PipelineStage } from "@/types/pipeline";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

export const useStageNavigation = () => {
  const { projectId, stageId } = useParams<{ projectId: string; stageId: string }>();
  const { projects, loading: projectsLoading, updateProject } = useProjects();
  const { toast } = useToast();
  const navigate = useNavigate();

  const project = projects.find(p => p.id === projectId);
  const currentStage = stageId as PipelineStage || project?.pipeline_status || "project_config";

  // Determine which stages are completed
  const completedStages: PipelineStage[] = React.useMemo(() => {
    if (!project) return [];
    
    const currentStageInfo = PIPELINE_STAGES.find(s => s.id === project.pipeline_status);
    if (!currentStageInfo) return [];
    
    return PIPELINE_STAGES
      .filter(stage => stage.position < currentStageInfo.position)
      .map(stage => stage.id as PipelineStage);
  }, [project]);

  // Handle stage transition
  const handleNextStage = async (onNext?: () => Promise<boolean>) => {
    if (!projectId || !project) return;
    
    if (onNext) {
      // If there's a custom next handler, use that first
      const canProceed = await onNext();
      if (!canProceed) return;
    }
    
    // Find the current stage and the next stage
    const currentStageInfo = PIPELINE_STAGES.find(s => s.id === currentStage);
    if (!currentStageInfo) return;
    
    const nextStage = PIPELINE_STAGES.find(s => s.position === currentStageInfo.position + 1);
    if (!nextStage) return;
    
    // Calculate new completion percentage
    const newCompletionPercentage = Math.min(
      100,
      Math.round((currentStageInfo.position / PIPELINE_STAGES.length) * 100)
    );
    
    // Update project status in the database
    try {
      await updateProject(projectId, {
        pipeline_status: nextStage.id as PipelineStage,
        completion_percentage: newCompletionPercentage
      });
      
      // Show success toast
      toast({
        title: `${currentStageInfo.title} completed!`,
        description: `Moving to ${nextStage.title}`,
        variant: "default",
      });
      
      // Navigate to the next stage
      navigate(`/projects/${projectId}/${nextStage.id}`);
    } catch (error: any) {
      console.error("Error updating project status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update project status",
        variant: "destructive",
      });
    }
  };

  const handlePreviousStage = (onPrevious?: () => void) => {
    if (onPrevious) {
      onPrevious();
      return;
    }
    
    const currentStageInfo = PIPELINE_STAGES.find(s => s.id === currentStage);
    if (!currentStageInfo || currentStageInfo.position <= 1) {
      navigate(`/projects/${projectId}`);
      return;
    }
    
    const previousStage = PIPELINE_STAGES.find(s => s.position === currentStageInfo.position - 1);
    if (previousStage) {
      navigate(`/projects/${projectId}/${previousStage.id}`);
    }
  };

  return {
    project,
    projectId,
    currentStage,
    completedStages,
    loading: projectsLoading,
    handleNextStage,
    handlePreviousStage,
    isAIRelatedStage: currentStage === "content" || currentStage === "validation"
  };
};
