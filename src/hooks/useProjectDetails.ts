
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PIPELINE_STAGES, PipelineStage } from "@/types/pipeline";
import { useProjects } from "@/hooks/useProjects";

export const useProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, loading } = useProjects();
  const navigate = useNavigate();
  const [completedStages, setCompletedStages] = useState<PipelineStage[]>([]);

  const project = projects.find((p) => p.id === projectId);
  
  useEffect(() => {
    if (project) {
      // Determine which stages are completed
      const currentStageInfo = PIPELINE_STAGES.find(s => s.id === project.pipeline_status);
      if (currentStageInfo) {
        const completed = PIPELINE_STAGES
          .filter(stage => stage.position < currentStageInfo.position)
          .map(stage => stage.id as PipelineStage);
        
        setCompletedStages(completed);
      }
    }
  }, [project]);

  const handleStageSelect = (stage: PipelineStage) => {
    navigate(`/projects/${projectId}/${stage}`);
  };

  const handleContinue = () => {
    if (!project) return;

    // Make sure we use the correct URL for project_config stage
    if (project.pipeline_status === 'project_config') {
      navigate(`/projects/${projectId}/project_config`);
    } else {
      navigate(`/projects/${projectId}/${project.pipeline_status}`);
    }
  };
  
  const currentStageInfo = project ? PIPELINE_STAGES.find(s => s.id === project.pipeline_status) : undefined;

  return {
    projectId,
    project,
    loading,
    completedStages,
    currentStageInfo,
    handleStageSelect,
    handleContinue,
  };
};

export default useProjectDetails;
