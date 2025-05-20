
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, CheckCircle, PauseCircle } from 'lucide-react';

interface ContentViewProps {
  content: any;
  onUpdateContent: (text: string) => void;
  onRegenerateContent: () => void;
  onToggleApproval: () => void;
}

const ContentView: React.FC<ContentViewProps> = ({
  content,
  onUpdateContent,
  onRegenerateContent,
  onToggleApproval
}) => {
  return (
    <div className="space-y-4">
      <Textarea
        value={content.content_text}
        onChange={(e) => {
          // Update local content state without saving to database yet
          onUpdateContent(e.target.value);
        }}
        className="min-h-[400px] font-mono text-sm"
      />
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerateContent}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        <Button
          size="sm"
          variant={content.is_approved ? "outline" : "default"}
          onClick={onToggleApproval}
        >
          {content.is_approved ? (
            <>
              <PauseCircle className="h-4 w-4 mr-2" />
              Unapprove
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Content
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ContentView;
