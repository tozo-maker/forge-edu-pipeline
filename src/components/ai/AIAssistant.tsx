
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { toast } from "sonner";
import { ProjectWizardFormData } from "@/types/project";
import { Objective } from "@/components/project/steps/learning-objectives/types";

type RecommendationType = 
  | "objectives" 
  | "methodology" 
  | "differentiation" 
  | "structure" 
  | "complete";

interface AIAssistantProps {
  type?: RecommendationType;
  title?: string;
  description?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  type = "complete",
  title = "AI Assistant",
  description = "Let our AI help you create your educational content"
}) => {
  const { wizardData, setWizardData } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI processing time (in a real implementation, this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate recommendations based on type
      switch (type) {
        case "objectives":
          if (wizardData.subjectArea && wizardData.gradeLevel) {
            setWizardData(prev => ({
              ...prev,
              objectives: generateObjectives(prev.subjectArea?.[0] || "", prev.gradeLevel?.[0] || "")
            }));
            toast.success("Learning objectives generated successfully!");
          } else {
            toast.error("Please select subject area and grade level first.");
          }
          break;
          
        case "methodology":
          setWizardData(prev => ({
            ...prev,
            teachingMethodology: generateMethodology(prev.projectType || "lesson_plan")
          }));
          toast.success("Teaching methodology recommendations generated!");
          break;
          
        case "complete":
          // For complete generation, we would generate all aspects
          if (wizardData.title && (wizardData.subjectArea?.length || wizardData.gradeLevel?.length)) {
            const enhancedData = generateCompleteProfile(wizardData);
            setWizardData(prev => ({
              ...prev,
              ...enhancedData
            }));
            toast.success("Educational DNA profile generated successfully!");
          } else {
            toast.error("Please provide at least a title, subject area, or grade level.");
          }
          break;
          
        default:
          toast.error("This recommendation type is not yet implemented.");
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-blue-700">
          <Sparkles className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          {type === "complete" 
            ? "Generate a complete educational profile based on minimal information. This will create learning objectives, teaching methodology, and content structure."
            : "Get AI recommendations for this specific aspect of your educational content."}
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateRecommendations} 
          disabled={isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Recommendations
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper functions to generate educational content
// In a real implementation, these would be API calls to an AI service

function generateObjectives(subject: string, gradeLevel: string): Objective[] {
  // Sample objectives based on subject and grade level
  const objectives: Objective[] = [
    {
      text: `Identify key concepts in ${subject} appropriate for ${gradeLevel} level students`,
      bloomsLevel: "understand"
    },
    {
      text: `Apply ${subject} principles to solve real-world problems`,
      bloomsLevel: "apply"
    },
    {
      text: `Analyze relationships between different ${subject} concepts`,
      bloomsLevel: "analyze"
    }
  ];
  
  return objectives;
}

function generateMethodology(projectType: string): string[] {
  // Sample methodologies based on project type
  if (projectType === "lesson_plan") {
    return ["Inquiry-based learning", "Direct instruction", "Cooperative learning"];
  } else if (projectType === "assessment") {
    return ["Formative assessment", "Performance-based assessment", "Self-assessment"];
  } else {
    return ["Project-based learning", "Differentiated instruction", "Blended learning"];
  }
}

function generateCompleteProfile(partialData: Partial<ProjectWizardFormData>): Partial<ProjectWizardFormData> {
  const subject = partialData.subjectArea?.[0] || "";
  const grade = partialData.gradeLevel?.[0] || "";
  const projectType = partialData.projectType || "lesson_plan";
  
  // Generate a complete educational profile
  return {
    objectives: generateObjectives(subject, grade),
    teachingMethodology: generateMethodology(projectType),
    differentiationStrategies: ["Visual learning supports", "Tiered assignments", "Flexible grouping"],
    culturalInclusion: ["Diverse examples and perspectives", "Culturally responsive content"],
    accessibilityNeeds: ["Screen reader compatible", "Multiple representation of information"],
    organizationPattern: "sequential" as "sequential" | "hierarchical" | "modular",
    contentSections: [
      { title: "Introduction", description: "Opening engagement activity", sequence: 1 },
      { title: "Core Content", description: "Main concepts and skills", sequence: 2 },
      { title: "Practice", description: "Guided and independent practice", sequence: 3 },
      { title: "Assessment", description: "Formative check for understanding", sequence: 4 },
      { title: "Conclusion", description: "Summary and reflection", sequence: 5 }
    ],
    estimatedDuration: "45 minutes"
  };
}

export default AIAssistant;
