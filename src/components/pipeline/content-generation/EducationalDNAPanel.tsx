
import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, School, Target, Users, Globe } from 'lucide-react';

interface EducationalDNAPanelProps {
  projectConfig: any;
  className?: string;
}

const EducationalDNAPanel: React.FC<EducationalDNAPanelProps> = ({
  projectConfig,
  className = ""
}) => {
  if (!projectConfig || !projectConfig.config_data) {
    return null;
  }

  const {
    educationalContext,
    pedagogicalApproach,
    culturalAccessibility,
    learningObjectives
  } = projectConfig.config_data;

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <CardTitle className="text-sm font-medium mb-3 flex items-center gap-2">
          <School className="h-4 w-4" />
          Educational DNA
        </CardTitle>
        
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex items-center gap-2 font-medium mb-1 text-gray-700">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Context
            </div>
            {educationalContext?.gradeLevel && (
              <div className="flex flex-wrap gap-1 mb-1">
                {educationalContext.gradeLevel.map((level: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs py-0 h-5">
                    {level}
                  </Badge>
                ))}
              </div>
            )}
            {educationalContext?.subjectArea && (
              <div className="flex flex-wrap gap-1">
                {educationalContext.subjectArea.map((subject: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs py-0 h-5">
                    {subject}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {learningObjectives && learningObjectives.length > 0 && (
            <div>
              <div className="flex items-center gap-2 font-medium mb-1 text-gray-700">
                <Target className="h-3.5 w-3.5 text-primary" />
                Learning Objectives
              </div>
              <ul className="text-xs list-disc list-outside ml-4 space-y-0.5">
                {learningObjectives.slice(0, 2).map((obj: any, i: number) => (
                  <li key={i} className="text-xs">{obj.text}</li>
                ))}
                {learningObjectives.length > 2 && (
                  <li className="text-gray-500">+ {learningObjectives.length - 2} more</li>
                )}
              </ul>
            </div>
          )}
          
          {pedagogicalApproach && (
            <div>
              <div className="flex items-center gap-2 font-medium mb-1 text-gray-700">
                <Users className="h-3.5 w-3.5 text-primary" />
                Approach
              </div>
              {pedagogicalApproach.teachingMethodology && (
                <div className="flex flex-wrap gap-1">
                  {pedagogicalApproach.teachingMethodology.slice(0, 3).map((method: string, i: number) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 text-xs py-0 h-5">
                      {method}
                    </Badge>
                  ))}
                  {pedagogicalApproach.teachingMethodology.length > 3 && (
                    <Badge variant="outline" className="text-xs py-0 h-5">
                      +{pedagogicalApproach.teachingMethodology.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
          
          {culturalAccessibility && (
            <div>
              <div className="flex items-center gap-2 font-medium mb-1 text-gray-700">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Accessibility
              </div>
              {culturalAccessibility.languageComplexity && (
                <Badge className="text-xs mr-1 py-0 h-5">
                  {culturalAccessibility.languageComplexity} language
                </Badge>
              )}
              {culturalAccessibility.accessibilityNeeds && culturalAccessibility.accessibilityNeeds.length > 0 && (
                <Badge variant="outline" className="text-xs py-0 h-5">
                  {culturalAccessibility.accessibilityNeeds.length} needs addressed
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationalDNAPanel;
