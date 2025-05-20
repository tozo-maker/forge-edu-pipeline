import React from "react";
import { useNavigate } from "react-router-dom";
import { PIPELINE_STAGES, PipelineStage } from "@/types/pipeline";
import { Button } from "@/components/ui/button";
import { CheckIcon, ArrowRightIcon, LockIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PipelineStageNavigationProps {
  projectId: string;
  currentStage: PipelineStage;
  completedStages: PipelineStage[];
  onStageSelect?: (stage: PipelineStage) => void;
  className?: string;
}

const PipelineStageNavigation: React.FC<PipelineStageNavigationProps> = ({
  projectId,
  currentStage,
  completedStages,
  onStageSelect,
  className,
}) => {
  const navigate = useNavigate();

  const handleStageClick = (stage: PipelineStage) => {
    // If there's a custom handler, use that
    if (onStageSelect) {
      onStageSelect(stage);
      return;
    }

    // Otherwise, navigate to the stage
    navigate(`/projects/${projectId}/${stage}`);
  };

  const isStageAccessible = (stage: PipelineStage) => {
    // Current stage is always accessible
    if (stage === currentStage) return true;
    
    // Completed stages are always accessible
    if (completedStages.includes(stage)) return true;
    
    // Find the position of the stage and current stage
    const stagePosition = PIPELINE_STAGES.find(s => s.id === stage)?.position || 0;
    const currentPosition = PIPELINE_STAGES.find(s => s.id === currentStage)?.position || 0;
    
    // Stage is accessible if it's the next one after current
    return stagePosition === currentPosition + 1;
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative flex items-center justify-between">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200 rounded"></div>
        
        {/* Progress Bar Fill */}
        <motion.div 
          className="absolute left-0 top-1/2 h-1 bg-primary -translate-y-1/2 rounded"
          initial={{ width: "0%" }}
          animate={{ 
            width: `${(completedStages.length / (PIPELINE_STAGES.length - 1)) * 100}%` 
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Stage Indicators */}
        {PIPELINE_STAGES.map((stage) => {
          const isCompleted = completedStages.includes(stage.id);
          const isCurrent = currentStage === stage.id;
          const isAccessible = isStageAccessible(stage.id);
          
          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <Button
                variant={isCurrent ? "default" : isCompleted ? "outline" : "ghost"}
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full border-2",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isCompleted && "border-primary bg-primary/10 text-primary hover:bg-primary/20",
                  !isAccessible && !isCompleted && !isCurrent && "opacity-50 cursor-not-allowed"
                )}
                disabled={!isAccessible && !isCompleted && !isCurrent}
                onClick={() => isAccessible || isCompleted ? handleStageClick(stage.id) : null}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : isCurrent ? (
                  <span className="text-sm font-medium">{stage.position}</span>
                ) : (
                  <span className="text-sm font-medium">{stage.position}</span>
                )}
              </Button>
              <span className="mt-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                {stage.title}
              </span>
              {!isAccessible && !isCompleted && !isCurrent && (
                <LockIcon className="absolute -right-1 -top-1 h-4 w-4 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineStageNavigation;
