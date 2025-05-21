
import React from "react";
import { Progress } from "@/components/ui/progress";

interface StageLoadingIndicatorProps {
  progress: number;
  message?: string;
}

const StageLoadingIndicator: React.FC<StageLoadingIndicatorProps> = ({
  progress,
  message = "Processing..."
}) => {
  return (
    <div className="my-4 space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-center text-muted-foreground">{message}</p>
    </div>
  );
};

export default StageLoadingIndicator;
