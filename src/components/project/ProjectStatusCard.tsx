
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/types/pipeline";
import { Play } from "lucide-react";

interface ProjectStatusCardProps {
  currentStageInfo: typeof PIPELINE_STAGES[0] | undefined;
  handleContinue: () => void;
}

const ProjectStatusCard: React.FC<ProjectStatusCardProps> = ({
  currentStageInfo,
  handleContinue,
}) => {
  return (
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
  );
};

export default ProjectStatusCard;
