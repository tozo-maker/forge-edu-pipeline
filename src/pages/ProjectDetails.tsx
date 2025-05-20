
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { PIPELINE_STAGES, PipelineStage } from "@/types/pipeline";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PipelineStageNavigation from "@/components/pipeline/PipelineStageNavigation";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Loader2, ArrowLeft, Play } from "lucide-react";

const ProjectDetails: React.FC = () => {
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

    navigate(`/projects/${projectId}/${project.pipeline_status}`);
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  const currentStageInfo = PIPELINE_STAGES.find(s => s.id === project.pipeline_status);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/projects")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>
            <Badge className="text-sm px-3 py-1">
              {project.completion_percentage}% Complete
            </Badge>
          </div>
          
          <div className="mt-6">
            <PipelineStageNavigation 
              projectId={projectId || ""}
              currentStage={project.pipeline_status}
              completedStages={completedStages}
              onStageSelect={handleStageSelect}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>
                Current stage: {currentStageInfo?.title || "Unknown"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  This project is currently in the {currentStageInfo?.title} stage.
                  {currentStageInfo && currentStageInfo.position < PIPELINE_STAGES.length 
                    ? " Continue working through the pipeline to complete your educational content."
                    : " Your educational content is now ready for export and use!"}
                </p>
                
                <div className="flex justify-center mt-4">
                  <Button 
                    size="lg" 
                    className="gap-2" 
                    onClick={handleContinue}
                  >
                    <Play className="h-4 w-4" />
                    Continue Working
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500 block">Created</span>
                    <span>{formatDistanceToNow(new Date(project.created_at))} ago</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Last Updated</span>
                    <span>{formatDistanceToNow(new Date(project.updated_at))} ago</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Current Stage</span>
                    <span>{currentStageInfo?.title}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Completion</span>
                    <span>{project.completion_percentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentStageInfo && currentStageInfo.position < PIPELINE_STAGES.length ? (
                    <>
                      <p className="text-sm">
                        Continue to the current stage to progress with your project:
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleContinue}
                      >
                        {currentStageInfo.title}
                      </Button>
                      
                      <p className="text-sm mt-4">Or review a completed stage:</p>
                      {completedStages.map((stageId) => {
                        const stage = PIPELINE_STAGES.find(s => s.id === stageId);
                        if (!stage) return null;
                        
                        return (
                          <Button
                            key={stageId}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => navigate(`/projects/${projectId}/${stageId}`)}
                          >
                            {stage.title}
                          </Button>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-sm">
                      Your project is complete! You can now export your content or make final adjustments.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Outlet />
    </div>
  );
};

export default ProjectDetails;
