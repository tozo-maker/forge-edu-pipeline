
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PIPELINE_STAGES, PipelineStage } from '@/types/pipeline';
import { cn } from '@/lib/utils';
import { Check, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PipelineStageNavigationProps {
  projectId: string;
  currentStage: string;
  completedStages?: PipelineStage[];
  onStageSelect?: (stage: PipelineStage) => void;
}

const PipelineStageNavigation: React.FC<PipelineStageNavigationProps> = ({
  projectId,
  currentStage,
  completedStages = [],
  onStageSelect,
}) => {
  const navigate = useNavigate();

  const handleStageClick = (stage: PipelineStage) => {
    // Don't allow skipping to future stages
    const currentStageInfo = PIPELINE_STAGES.find(s => s.id === currentStage);
    const clickedStageInfo = PIPELINE_STAGES.find(s => s.id === stage);
    
    if (!currentStageInfo || !clickedStageInfo) return;
    
    const isClickedStageAccessible = 
      clickedStageInfo.position <= currentStageInfo.position || 
      completedStages.includes(stage);
    
    if (!isClickedStageAccessible) return;
    
    // Handle the special case for project_config
    if (stage === 'project_config') {
      if (onStageSelect) {
        onStageSelect(stage);
      } else {
        navigate(`/projects/${projectId}/project_config`);
      }
      return;
    }
    
    if (onStageSelect) {
      onStageSelect(stage);
    } else {
      navigate(`/projects/${projectId}/${stage}`);
    }
  };

  const currentStageInfo = PIPELINE_STAGES.find(s => s.id === currentStage);
  const currentStageIndex = currentStageInfo ? currentStageInfo.position : 1;
  const progressPercentage = Math.round((currentStageIndex / PIPELINE_STAGES.length) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Start</span>
        <span>Complete</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="flex justify-between items-center overflow-x-auto pb-4 pt-2">
        {PIPELINE_STAGES.map((stage, index) => {
          const isCurrentStage = currentStage === stage.id;
          const isCompletedStage = completedStages.includes(stage.id as PipelineStage);
          const isAccessible = 
            stage.position <= currentStageIndex || 
            completedStages.includes(stage.id as PipelineStage);

          return (
            <button
              key={stage.id}
              onClick={() => handleStageClick(stage.id as PipelineStage)}
              disabled={!isAccessible}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors",
                "min-w-[80px] text-center",
                isCurrentStage && "text-primary",
                isCompletedStage && "text-green-700",
                !isAccessible && "text-gray-300 cursor-not-allowed",
                isAccessible && !isCurrentStage && "hover:text-primary cursor-pointer"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs relative",
                isCurrentStage && "bg-primary text-white font-medium",
                isCompletedStage && "bg-green-100 text-green-700",
                !isAccessible && "bg-gray-100 text-gray-400",
                isAccessible && !isCurrentStage && !isCompletedStage && "bg-gray-100 text-gray-500"
              )}>
                {isCompletedStage ? (
                  <Check className="w-4 h-4" />
                ) : isAccessible ? (
                  stage.position
                ) : (
                  <Lock className="w-3 h-3" />
                )}
              </div>
              <span className="text-xs whitespace-nowrap">{stage.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineStageNavigation;
