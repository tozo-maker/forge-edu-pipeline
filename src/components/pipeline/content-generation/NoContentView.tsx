
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface NoContentViewProps {
  onGoToPrompt: () => void;
}

const NoContentView: React.FC<NoContentViewProps> = ({ onGoToPrompt }) => {
  return (
    <div className="py-12 text-center">
      <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium mb-2">No Content Yet</h3>
      <p className="text-gray-500 mb-4">
        Generate content from the approved prompt first
      </p>
      <Button onClick={onGoToPrompt}>
        Go to Prompt
      </Button>
    </div>
  );
};

export default NoContentView;
