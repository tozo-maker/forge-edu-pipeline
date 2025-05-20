
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, FileText, AlertCircle } from 'lucide-react';

interface SectionItemProps {
  id: string;
  title: string;
  index: number;
  isSelected: boolean;
  status: 'pending' | 'inProgress' | 'approved';
  onClick: (index: number) => void;
}

export const SectionItem: React.FC<SectionItemProps> = ({
  title,
  index,
  isSelected,
  status,
  onClick
}) => {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
      onClick={() => onClick(index)}
    >
      <div className="truncate flex-1">
        <span className="mr-1 font-medium">{index + 1}.</span>
        {title || "Untitled Section"}
      </div>
      <div className="flex items-center">
        {status === "approved" && (
          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
        )}
        {status === "inProgress" && (
          <FileText className="h-4 w-4 text-amber-500 ml-2" />
        )}
        {status === "pending" && (
          <AlertCircle className="h-4 w-4 text-gray-400 ml-2" />
        )}
      </div>
    </div>
  );
};

interface SectionsListProps {
  sections: any[];
  prompts: any[];
  contentItems: any[];
  currentSectionIndex: number;
  onSectionSelect: (index: number) => void;
  getContentProgress: () => number;
}

const SectionsList: React.FC<SectionsListProps> = ({
  sections,
  prompts,
  contentItems,
  currentSectionIndex,
  onSectionSelect,
  getContentProgress
}) => {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-lg">Sections</CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-3 space-y-1">
        {sections.map((section, index) => {
          const sectionPrompt = prompts.find(p => p.section_id === section.id);
          const sectionContent = sectionPrompt 
            ? contentItems.find(c => c.prompt_id === sectionPrompt.id)
            : null;
            
          let status: 'pending' | 'inProgress' | 'approved' = "pending";
          if (sectionContent) {
            status = sectionContent.is_approved ? "approved" : "inProgress";
          }
          
          return (
            <SectionItem
              key={section.id}
              id={section.id}
              title={section.title}
              index={index}
              isSelected={index === currentSectionIndex}
              status={status}
              onClick={onSectionSelect}
            />
          );
        })}
      </CardContent>
      <CardFooter className="border-t pt-3 px-3">
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Overall Progress</span>
            <span>{Math.round(getContentProgress())}%</span>
          </div>
          <Progress value={getContentProgress()} className="h-2" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default SectionsList;
