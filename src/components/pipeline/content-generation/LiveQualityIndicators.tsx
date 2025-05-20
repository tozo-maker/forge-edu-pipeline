
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LiveQualityIndicatorsProps {
  indicators: {
    standards_alignment?: number;
    reading_level?: {
      score: number;
      level: string;
    };
    pedagogical_alignment?: number;
    accessibility?: number;
    cultural_sensitivity?: number;
  };
}

const LiveQualityIndicators: React.FC<LiveQualityIndicatorsProps> = ({ indicators }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getBadgeVariant = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800 hover:bg-green-100";
    if (score >= 6) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    return "bg-red-100 text-red-800 hover:bg-red-100";
  };
  
  return (
    <div className="bg-gray-50 p-3 rounded-lg border space-y-3">
      <h4 className="text-sm font-medium mb-2 flex items-center">
        Live Educational Quality Assessment
      </h4>
      
      <div className="grid grid-cols-2 gap-3">
        {indicators.standards_alignment !== undefined && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Standards Alignment</span>
              <Badge variant="outline" className={cn(getBadgeVariant(indicators.standards_alignment))}>
                {indicators.standards_alignment.toFixed(1)}/10
              </Badge>
            </div>
            <Progress 
              value={(indicators.standards_alignment / 10) * 100} 
              className={`h-1.5 ${getScoreColor(indicators.standards_alignment)}`}
            />
          </div>
        )}
        
        {indicators.reading_level && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Reading Level</span>
              <Badge variant="outline" className={cn(getBadgeVariant(indicators.reading_level.score))}>
                {indicators.reading_level.level}
              </Badge>
            </div>
            <Progress 
              value={(indicators.reading_level.score / 10) * 100} 
              className={`h-1.5 ${getScoreColor(indicators.reading_level.score)}`}
            />
          </div>
        )}
        
        {indicators.pedagogical_alignment !== undefined && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Pedagogical Alignment</span>
              <Badge variant="outline" className={cn(getBadgeVariant(indicators.pedagogical_alignment))}>
                {indicators.pedagogical_alignment.toFixed(1)}/10
              </Badge>
            </div>
            <Progress 
              value={(indicators.pedagogical_alignment / 10) * 100} 
              className={`h-1.5 ${getScoreColor(indicators.pedagogical_alignment)}`}
            />
          </div>
        )}
        
        {indicators.accessibility !== undefined && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Accessibility</span>
              <Badge variant="outline" className={cn(getBadgeVariant(indicators.accessibility))}>
                {indicators.accessibility.toFixed(1)}/10
              </Badge>
            </div>
            <Progress 
              value={(indicators.accessibility / 10) * 100} 
              className={`h-1.5 ${getScoreColor(indicators.accessibility)}`}
            />
          </div>
        )}
        
        {indicators.cultural_sensitivity !== undefined && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Cultural Sensitivity</span>
              <Badge variant="outline" className={cn(getBadgeVariant(indicators.cultural_sensitivity))}>
                {indicators.cultural_sensitivity.toFixed(1)}/10
              </Badge>
            </div>
            <Progress 
              value={(indicators.cultural_sensitivity / 10) * 100} 
              className={`h-1.5 ${getScoreColor(indicators.cultural_sensitivity)}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveQualityIndicators;
