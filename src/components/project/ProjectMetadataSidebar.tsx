
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineStage, PIPELINE_STAGES, Project } from "@/types/pipeline";
import { useNavigate } from "react-router-dom";

interface ProjectMetadataSidebarProps {
  project: Project;
  projectId: string;
  currentStageInfo: typeof PIPELINE_STAGES[0] | undefined;
  completedStages: PipelineStage[];
  handleContinue: () => void;
}

const ProjectMetadataSidebar: React.FC<ProjectMetadataSidebarProps> = ({
  project,
  projectId,
  currentStageInfo,
  completedStages,
  handleContinue,
}) => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default ProjectMetadataSidebar;
