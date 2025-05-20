
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Loader2, Play } from 'lucide-react';

interface PromptViewProps {
  prompt: any;
  isGenerating: boolean;
  generationProgress: number;
  onGenerate: () => void;
}

const PromptView: React.FC<PromptViewProps> = ({
  prompt,
  isGenerating,
  generationProgress,
  onGenerate
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border rounded-md p-4 text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">AI Prompt</span>
          {prompt?.is_approved ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Approved
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              Not Approved
            </Badge>
          )}
        </div>
        <pre className="whitespace-pre-wrap font-mono text-xs">
          {prompt?.prompt_text || "No prompt available for this section"}
        </pre>
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={!prompt?.is_approved}
          onClick={onGenerate}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        <Button 
          size="sm" 
          disabled={!prompt?.is_approved || isGenerating}
          onClick={onGenerate} 
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Generate Content
            </>
          )}
        </Button>
      </div>
      
      {isGenerating && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Generation Progress</span>
            <span>{Math.round(generationProgress)}%</span>
          </div>
          <Progress value={generationProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default PromptView;
