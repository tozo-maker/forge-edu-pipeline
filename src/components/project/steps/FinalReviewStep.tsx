
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectWizardFormData } from "@/pages/ProjectWizard";
import { Loader2 } from "lucide-react";

type FinalReviewStepProps = {
  data: Partial<ProjectWizardFormData>;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
};

const SectionItem = ({ label, value }: { label: string; value: any }) => (
  <div className="mb-4">
    <h4 className="text-sm font-medium text-gray-600">{label}</h4>
    <div className="mt-1">
      {typeof value === 'string' ? (
        <p className="text-gray-900">{value || "Not specified"}</p>
      ) : Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1">
          {value.length > 0 ? (
            value.map((item, i) => (
              typeof item === 'string' ? (
                <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {item}
                </span>
              ) : null
            ))
          ) : (
            <p className="text-gray-500">None specified</p>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Not specified</p>
      )}
    </div>
  </div>
);

const FinalReviewStep: React.FC<FinalReviewStepProps> = ({ 
  data, 
  onSubmit, 
  onBack,
  isLoading 
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Review & Create</h2>
        <p className="text-sm text-gray-500">
          Review your project configuration before creating
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionItem label="Project Title" value={data.title} />
            <SectionItem label="Project Type" 
              value={data.projectType === 'lesson_plan' ? 'Lesson Plan' : 
                    data.projectType === 'course_module' ? 'Course Module' : 
                    data.projectType === 'assessment' ? 'Assessment' :
                    data.projectType === 'activity' ? 'Learning Activity' :
                    data.projectType === 'curriculum' ? 'Full Curriculum' : ''} 
            />
            <SectionItem label="Description" value={data.description} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Educational Context</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionItem label="Grade Levels" value={data.gradeLevel} />
            <SectionItem label="Subject Areas" value={data.subjectArea} />
            <SectionItem label="Educational Standards" value={data.standards} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            {data.objectives && data.objectives.length > 0 ? (
              <div className="space-y-2">
                {data.objectives.map((obj, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                    <p className="text-gray-900">{obj.text}</p>
                    <p className="text-xs text-gray-600">Bloom's Level: {obj.bloomsLevel}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No learning objectives specified</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pedagogical Approach</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionItem label="Teaching Methodologies" value={data.teachingMethodology} />
            <SectionItem label="Assessment Philosophy" value={data.assessmentPhilosophy} />
            <SectionItem label="Differentiation Strategies" value={data.differentiationStrategies} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cultural & Accessibility</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionItem label="Language Complexity" 
              value={
                data.languageComplexity === 'simple' ? 'Simple' :
                data.languageComplexity === 'moderate' ? 'Moderate' :
                data.languageComplexity === 'advanced' ? 'Advanced' : ''
              } 
            />
            <SectionItem label="Cultural Inclusion Strategies" value={data.culturalInclusion} />
            <SectionItem label="Accessibility Needs" value={data.accessibilityNeeds} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Content Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionItem label="Organization Pattern" 
              value={
                data.organizationPattern === 'sequential' ? 'Sequential' :
                data.organizationPattern === 'hierarchical' ? 'Hierarchical' :
                data.organizationPattern === 'modular' ? 'Modular' : ''
              } 
            />
            <SectionItem label="Estimated Duration" value={data.estimatedDuration} />
            
            <h4 className="text-sm font-medium text-gray-600 mb-2">Content Sections</h4>
            {data.contentSections && data.contentSections.length > 0 ? (
              <div className="space-y-2">
                {data.contentSections.map((section, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">
                      {section.sequence}. {section.title}
                    </p>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No content sections specified</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Project...
            </>
          ) : (
            'Create Project'
          )}
        </Button>
      </div>
    </div>
  );
};

export default FinalReviewStep;
