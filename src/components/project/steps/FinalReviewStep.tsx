
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ProjectWizardFormData } from '@/pages/ProjectWizard';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FinalReviewStepProps {
  data: Partial<ProjectWizardFormData>;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  isEditing?: boolean;
}

const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  data,
  onSubmit,
  onBack,
  isLoading,
  isEditing = false
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Review Your Project Configuration</h2>
        <p className="text-gray-600">
          Please review your project configuration before {isEditing ? "saving changes" : "creating the project"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Title:</span> {data.title}
              </div>
              <div>
                <span className="font-medium">Type:</span> {data.projectType?.replace('_', ' ')}
              </div>
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-sm text-gray-600">{data.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Educational Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Grade Levels:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.gradeLevel?.map(grade => (
                    <Badge key={grade} variant="outline">{grade}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Subject Areas:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.subjectArea?.map(subject => (
                    <Badge key={subject} variant="outline">{subject}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              {data.objectives?.map((objective, index) => (
                <li key={index}>
                  {objective.text}
                  <Badge className="ml-2">{objective.bloomsLevel}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pedagogical Approach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Teaching Methodologies:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.teachingMethodology?.map(method => (
                    <Badge key={method} variant="outline">{method}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Assessment Philosophy:</span>
                <p className="text-sm text-gray-600">{data.assessmentPhilosophy}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Language Complexity:</span> {data.languageComplexity}
              </div>
              <div>
                <span className="font-medium">Organization Pattern:</span> {data.organizationPattern}
              </div>
              <div>
                <span className="font-medium">Estimated Duration:</span> {data.estimatedDuration}
              </div>
              <div>
                <span className="font-medium">Content Sections:</span> {data.contentSections?.length || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            isEditing ? "Save Changes" : "Create Project"
          )}
        </Button>
      </div>
    </div>
  );
};

export default FinalReviewStep;
