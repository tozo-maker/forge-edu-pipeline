
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Gauge, BookOpen, School, Accessibility, Globe, 
  AlertTriangle, CheckCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QualityIndicator {
  score: number;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface LiveQualityIndicatorsProps {
  indicators: Record<string, any>;
}

const LiveQualityIndicators: React.FC<LiveQualityIndicatorsProps> = ({
  indicators
}) => {
  // Create quality indicators from the data
  const qualityIndicators: QualityIndicator[] = [
    {
      score: indicators.standards_alignment || 0,
      label: "Standards Alignment",
      icon: <School className="h-4 w-4" />,
      description: "How well content aligns with educational standards"
    },
    {
      score: indicators.reading_level?.score || 0,
      label: `Reading Level${indicators.reading_level?.level ? `: ${indicators.reading_level.level}` : ''}`,
      icon: <BookOpen className="h-4 w-4" />,
      description: "Appropriate reading level for target audience"
    },
    {
      score: indicators.pedagogical_approach || 0,
      label: "Pedagogical Alignment",
      icon: <Gauge className="h-4 w-4" />,
      description: "How well content supports teaching methodology"
    },
    {
      score: indicators.accessibility || 0,
      label: "Accessibility",
      icon: <Accessibility className="h-4 w-4" />,
      description: "How accessible the content is for diverse learners"
    },
    {
      score: indicators.cultural_sensitivity || 0,
      label: "Cultural Sensitivity",
      icon: <Globe className="h-4 w-4" />,
      description: "How culturally inclusive the content is"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 8) return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: "Good" };
    if (score >= 6) return { icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />, text: "Fair" };
    return { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, text: "Needs Improvement" };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Live Quality Assessment</h4>
        <Badge variant="outline" className="text-xs">Real-time</Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {qualityIndicators.map((indicator, index) => {
          const status = getScoreStatus(indicator.score);
          
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        {indicator.icon}
                        <span>{indicator.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {status.icon}
                        <span className="font-medium">{indicator.score.toFixed(1)}/10</span>
                      </div>
                    </div>
                    <Progress 
                      value={indicator.score * 10} 
                      className="h-1"
                      indicatorClassName={getScoreColor(indicator.score)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{indicator.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default LiveQualityIndicators;
