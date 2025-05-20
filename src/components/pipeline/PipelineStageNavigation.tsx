
import React from "react";
import { useNavigate } from "react-router-dom";
import { PIPELINE_STAGES, PipelineStage } from "@/types/pipeline";
import { Button } from "@/components/ui/button";
import { CheckIcon, ArrowRightIcon, LockIcon, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const isMobile = useMediaQuery("sm");
  const isTablet = useMediaQuery("md") && !useMediaQuery("sm");

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

  // For mobile, show a simple dropdown with the current stage and completed stages
  if (isMobile) {
    const currentStageInfo = PIPELINE_STAGES.find(s => s.id === currentStage);
    
    return (
      <div className={cn("w-full py-3", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full flex justify-between items-center bg-white">
              <span className="truncate">
                {currentStageInfo?.position}. {currentStageInfo?.title}
              </span>
              <Menu className="h-4 w-4 ml-2 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-[300px] bg-white">
            {PIPELINE_STAGES.map((stage) => {
              const isCompleted = completedStages.includes(stage.id);
              const isCurrent = currentStage === stage.id;
              const isAccessible = isStageAccessible(stage.id);
              
              return (
                <DropdownMenuItem
                  key={stage.id}
                  disabled={!isAccessible && !isCompleted && !isCurrent}
                  onClick={() => isAccessible || isCompleted ? handleStageClick(stage.id) : null}
                  className={cn(
                    "flex items-center",
                    isCurrent && "bg-primary/10 font-bold",
                    isCompleted && !isCurrent && "text-primary"
                  )}
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full mr-2 border">
                    {isCompleted ? (
                      <CheckIcon className="h-3 w-3 text-primary" />
                    ) : (
                      <span className="text-xs">{stage.position}</span>
                    )}
                  </span>
                  <span className="truncate">{stage.title}</span>
                  {!isAccessible && !isCompleted && !isCurrent && (
                    <LockIcon className="ml-auto h-3 w-3 text-gray-400" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Progress indicator */}
        <div className="mt-4 w-full bg-gray-200 h-2 rounded">
          <motion.div 
            className="h-full bg-primary rounded"
            initial={{ width: "0%" }}
            animate={{ 
              width: `${(completedStages.length / (PIPELINE_STAGES.length - 1)) * 100}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  }
  
  // Tablet version - simplified but not a dropdown
  if (isTablet) {
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

          {/* Stage Indicators - simplified for tablet */}
          {PIPELINE_STAGES.map((stage) => {
            const isCompleted = completedStages.includes(stage.id);
            const isCurrent = currentStage === stage.id;
            const isAccessible = isStageAccessible(stage.id);
            
            return (
              <div key={stage.id} className="relative z-10">
                <Button
                  variant={isCurrent ? "default" : isCompleted ? "outline" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 rounded-full border-2 p-0",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-primary bg-primary/10 text-primary hover:bg-primary/20",
                    !isAccessible && !isCompleted && !isCurrent && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!isAccessible && !isCompleted && !isCurrent}
                  onClick={() => isAccessible || isCompleted ? handleStageClick(stage.id) : null}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{stage.position}</span>
                  )}
                </Button>
                {!isAccessible && !isCompleted && !isCurrent && (
                  <LockIcon className="absolute -right-1 -top-1 h-3 w-3 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop version with tooltips for better usability
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
        <TooltipProvider>
          {PIPELINE_STAGES.map((stage) => {
            const isCompleted = completedStages.includes(stage.id);
            const isCurrent = currentStage === stage.id;
            const isAccessible = isStageAccessible(stage.id);
            
            return (
              <Tooltip key={stage.id}>
                <TooltipTrigger asChild>
                  <div className="relative z-10 flex flex-col items-center">
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>{stage.description}</p>
                  {!isAccessible && !isCompleted && !isCurrent && (
                    <p className="text-gray-400 text-xs">Complete previous stages first</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default PipelineStageNavigation;
