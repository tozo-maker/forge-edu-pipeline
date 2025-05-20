
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, CheckCircle, PauseCircle, Award, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ContentViewProps {
  content: any;
  onUpdateContent: (text: string) => void;
  onRegenerateContent: () => void;
  onToggleApproval: () => void;
  onValidateContent?: () => void;
  validation?: any;
  isValidating?: boolean;
}

const ContentView: React.FC<ContentViewProps> = ({
  content,
  onUpdateContent,
  onRegenerateContent,
  onToggleApproval,
  onValidateContent,
  validation,
  isValidating = false
}) => {
  const [localContent, setLocalContent] = useState(content.content_text);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  };
  
  const handleBlur = () => {
    // Only update if content actually changed
    if (localContent !== content.content_text) {
      onUpdateContent(localContent);
    }
  };
  
  return (
    <div className="space-y-4">
      <Textarea
        value={localContent}
        onChange={handleTextChange}
        onBlur={handleBlur}
        className="min-h-[400px] font-mono text-sm"
      />
      
      {validation && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Content Validation</h3>
            {validation.quality_score >= 8.0 && validation.standards_alignment_score >= 8.0 ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                High Quality
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                Needs Improvement
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Quality Score</span>
                <span>{validation.quality_score}/10</span>
              </div>
              <Progress 
                value={(validation.quality_score / 10) * 100} 
                className={`h-2 ${validation.quality_score >= 8 ? 'bg-green-500' : 'bg-amber-500'}`} 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Standards Alignment</span>
                <span>{validation.standards_alignment_score}/10</span>
              </div>
              <Progress 
                value={(validation.standards_alignment_score / 10) * 100} 
                className={`h-2 ${validation.standards_alignment_score >= 8 ? 'bg-green-500' : 'bg-amber-500'}`} 
              />
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            {validation.strengths && validation.strengths.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center text-green-700">
                  <Award className="h-4 w-4 mr-1" />
                  Strengths
                </h4>
                <ul className="ml-5 list-disc space-y-1 mt-1 text-gray-600">
                  {validation.strengths.slice(0, 3).map((strength: string, i: number) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.weaknesses && validation.weaknesses.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center text-amber-700">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Areas for Improvement
                </h4>
                <ul className="ml-5 list-disc space-y-1 mt-1 text-gray-600">
                  {validation.weaknesses.slice(0, 3).map((weakness: string, i: number) => (
                    <li key={i}>{weakness}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.improvement_suggestions && (
              <div>
                <h4 className="font-medium">Improvement Suggestions</h4>
                <p className="text-gray-600 mt-1">
                  {validation.improvement_suggestions}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateContent}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          
          {onValidateContent && (
            <Button
              variant="outline" 
              size="sm"
              onClick={onValidateContent}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Validate
                </>
              )}
            </Button>
          )}
        </div>
        
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
