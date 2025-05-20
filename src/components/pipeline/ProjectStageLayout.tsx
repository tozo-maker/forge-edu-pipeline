
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PIPELINE_STAGES, PipelineStage } from "@/types/pipeline";
import { useProjects } from "@/hooks/useProjects";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PipelineStageNavigation from "@/components/pipeline/PipelineStageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Progress } from "@/components/ui/progress";
import { useMediaQuery } from "@/hooks/use-mobile";

interface ProjectStageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onNext?: () => Promise<boolean>;
  onPrevious?: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  loadingProgress?: number;
  loadingMessage?: string;
}

const ProjectStageLayout: React.FC<ProjectStageLayoutProps> = ({
  title,
  description,
  children,
  onNext,
  onPrevious,
  isNextDisabled = false,
  isLoading = false,
  loadingProgress,
  loadingMessage = "Processing...",
}) => {
  const { projectId, stageId } = useParams<{ projectId: string; stageId: string }>();
  const { projects, loading: projectsLoading, updateProject } = useProjects();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("md");

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
  const handleNextStage = async () => {
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

  const handlePreviousStage = () => {
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

  const resetErrorBoundary = () => {
    // This function could be used to reset state or refetch data
    toast({
      title: "Retrying",
      description: "Attempting to recover from the error",
    });
  };

  // Check if current stage is related to AI operations
  const isAIRelatedStage = React.useMemo(() => {
    return currentStage === "content_generation" || currentStage === "validation";
  }, [currentStage]);

  if (projectsLoading || !project) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className={`container mx-auto ${isMobile ? 'p-3' : 'p-6'}`}>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/projects/${projectId}`)}
            className={isMobile ? "mb-2 px-2 text-sm" : "mb-4"}
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className={`mr-1 h-${isMobile ? 3 : 4} w-${isMobile ? 3 : 4}`} />
            Back to Project
          </Button>
          
          <PipelineStageNavigation 
            projectId={projectId as string}
            currentStage={currentStage}
            completedStages={completedStages}
          />
        </div>
        
        <Card className="mb-6">
          <CardHeader className={isMobile ? "px-4 py-3" : "py-3"}>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "px-4 py-3" : "py-3"}>
            <ErrorBoundary 
              onReset={resetErrorBoundary}
              aiContext={isAIRelatedStage}
              maxRetries={3}
            >
              {isLoading && loadingProgress !== undefined ? (
                <div className="my-4 space-y-2">
                  <Progress value={loadingProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">{loadingMessage}</p>
                </div>
              ) : null}
              {children}
            </ErrorBoundary>
          </CardContent>
        </Card>
        
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
          <Button 
            variant="outline" 
            onClick={handlePreviousStage}
            className={isMobile ? "w-full" : ""}
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className={`mr-2 h-${isMobile ? 3 : 4} w-${isMobile ? 3 : 4}`} />
            Previous
          </Button>
          <Button 
            onClick={handleNextStage} 
            disabled={isNextDisabled || isLoading}
            className={isMobile ? "w-full" : ""}
            size={isMobile ? "sm" : "default"}
          >
            {isLoading ? (
              <>
                <Loader2 className={`mr-2 h-${isMobile ? 3 : 4} w-${isMobile ? 3 : 4} animate-spin`} />
                {loadingMessage || "Processing..."}
              </>
            ) : (
              <>
                Next
                <ArrowRight className={`ml-2 h-${isMobile ? 3 : 4} w-${isMobile ? 3 : 4}`} />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ProjectStageLayout;
