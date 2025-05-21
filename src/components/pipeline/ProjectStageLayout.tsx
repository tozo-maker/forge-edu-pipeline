
import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PipelineStageNavigation from "@/components/pipeline/PipelineStageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import StageNavigationButtons from "@/components/pipeline/StageNavigationButtons";
import StageLoadingIndicator from "@/components/pipeline/StageLoadingIndicator";
import { useStageNavigation } from "@/hooks/useStageNavigation";

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
  const { 
    project, 
    projectId, 
    currentStage, 
    completedStages, 
    loading: projectsLoading, 
    handleNextStage, 
    handlePreviousStage, 
    isAIRelatedStage 
  } = useStageNavigation();
  
  const navigate = useNavigate();
  const isMobile = useMediaQuery("md");

  const resetErrorBoundary = () => {
    // This function could be used to reset state or refetch data
    useToast().toast({
      title: "Retrying",
      description: "Attempting to recover from the error",
    });
  };

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
              {isLoading && loadingProgress !== undefined && (
                <StageLoadingIndicator 
                  progress={loadingProgress} 
                  message={loadingMessage} 
                />
              )}
              {children}
            </ErrorBoundary>
          </CardContent>
        </Card>
        
        <StageNavigationButtons
          onPrevious={() => handlePreviousStage(onPrevious)}
          onNext={() => handleNextStage(onNext)}
          isNextDisabled={isNextDisabled}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
        />
      </main>
    </div>
  );
};

export default ProjectStageLayout;
