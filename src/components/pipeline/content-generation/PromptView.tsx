
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play, X, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PromptViewProps {
  prompt: any;
  isGenerating: boolean;
  generationProgress: number;
  onGenerate: () => void;
  onCancel?: () => void;
}

const PromptView: React.FC<PromptViewProps> = ({
  prompt,
  isGenerating,
  generationProgress,
  onGenerate,
  onCancel
}) => {
  if (!prompt) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No prompt available for this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-md p-4 font-mono text-sm whitespace-pre-wrap">
        {prompt.prompt_text}
      </div>
      
      {isGenerating ? (
        <div className="space-y-3">
          <Progress value={generationProgress} className="h-2" />
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating with Claude AI...
            </div>
            
            {onCancel && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCancel}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {prompt.is_approved ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700 text-sm">
                This prompt has been approved and is ready for content generation.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-700 text-sm">
                Review the prompt carefully before generating content.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-center">
            <Button 
              onClick={onGenerate} 
              size="lg"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Generate Content with Claude AI
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PromptView;
