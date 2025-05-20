
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, GraduationCap, BookOpen, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EducationalDNAPanelProps {
  projectConfig: any;
  className?: string;
}

const EducationalDNAPanel: React.FC<EducationalDNAPanelProps> = ({
  projectConfig,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!projectConfig) return null;
  
  const {
    projectType,
    educationalContext,
    learningObjectives,
    pedagogicalApproach,
    culturalAccessibility
  } = projectConfig;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Educational DNA</CardTitle>
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 text-xs space-y-3">
          <div className="space-y-1">
            <div className="flex items-center text-primary">
              <GraduationCap size={14} className="mr-1" />
              <span className="font-medium">Project Type</span>
            </div>
            <p className="ml-5 text-gray-600">{projectType || 'Not specified'}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-primary">
              <BookOpen size={14} className="mr-1" />
              <span className="font-medium">Educational Context</span>
            </div>
            <div className="ml-5 text-gray-600">
              <p>Grade: {educationalContext?.gradeLevel?.join(', ') || 'Not specified'}</p>
              <p>Subject: {educationalContext?.subjectArea?.join(', ') || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-primary">
              <Target size={14} className="mr-1" />
              <span className="font-medium">Learning Objectives</span>
            </div>
            <ul className="ml-5 list-disc pl-3 text-gray-600">
              {learningObjectives && learningObjectives.length > 0 ? (
                learningObjectives.slice(0, 2).map((obj: any, i: number) => (
                  <li key={i}>{obj.text}</li>
                ))
              ) : (
                <li>No objectives specified</li>
              )}
              {learningObjectives && learningObjectives.length > 2 && (
                <li>+ {learningObjectives.length - 2} more</li>
              )}
            </ul>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-primary">
              <Users size={14} className="mr-1" />
              <span className="font-medium">Approach</span>
            </div>
            <div className="ml-5 text-gray-600">
              <p>Methods: {pedagogicalApproach?.teachingMethodology?.slice(0, 2)?.join(', ') || 'Not specified'}</p>
              <p>Accessibility: {culturalAccessibility?.accessibilityNeeds?.slice(0, 2)?.join(', ') || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EducationalDNAPanel;
