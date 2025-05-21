
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Play } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";

const quickStartSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  projectType: z.enum(['lesson_plan', 'course_module', 'assessment', 'activity', 'curriculum']),
  gradeLevel: z.string().min(1, "Please select a grade level"),
  subjectArea: z.string().min(1, "Please select a subject area"),
});

const PROJECT_TYPES = [
  { value: 'lesson_plan', label: 'Lesson Plan' },
  { value: 'course_module', label: 'Course Module' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'activity', label: 'Learning Activity' },
  { value: 'curriculum', label: 'Full Curriculum' },
];

const GRADE_LEVELS = [
  "Elementary (K-2)",
  "Elementary (3-5)",
  "Middle School (6-8)",
  "High School (9-10)",
  "High School (11-12)",
  "Higher Education",
  "Professional Development"
];

const SUBJECT_AREAS = [
  "Mathematics",
  "Science",
  "Language Arts",
  "Social Studies",
  "Foreign Language",
  "Arts",
  "Physical Education",
  "Technology",
  "Special Education",
  "Career and Technical Education"
];

const QuickStartWizard: React.FC = () => {
  const { setWizardData, setCurrentStep } = useWizard();
  const { createProject } = useProjects();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<z.infer<typeof quickStartSchema>>({
    resolver: zodResolver(quickStartSchema),
    defaultValues: {
      title: "",
      projectType: "lesson_plan",
      gradeLevel: "",
      subjectArea: ""
    }
  });
  
  const handleGenerateComplete = async (values: z.infer<typeof quickStartSchema>) => {
    try {
      setIsGenerating(true);
      
      // Generate a complete project based on minimal inputs
      const generatedProject = {
        title: values.title,
        description: `${values.subjectArea} ${values.projectType} for ${values.gradeLevel}`,
        projectType: values.projectType,
        gradeLevel: [values.gradeLevel],
        subjectArea: [values.subjectArea],
        standards: ["Common Core State Standards", "Next Generation Science Standards"],
        objectives: [
          {
            text: `Understand key concepts in ${values.subjectArea}`,
            bloomsLevel: "understand"
          },
          {
            text: `Apply ${values.subjectArea} principles in practical scenarios`,
            bloomsLevel: "apply"
          },
          {
            text: `Analyze and evaluate ${values.subjectArea} information`,
            bloomsLevel: "analyze"
          }
        ],
        teachingMethodology: ["Inquiry-based learning", "Collaborative learning", "Direct instruction"],
        assessmentPhilosophy: "Balanced formative and summative assessment approach",
        differentiationStrategies: ["Tiered assignments", "Flexible grouping", "Multiple modalities"],
        languageComplexity: "moderate",
        culturalInclusion: ["Diverse examples", "Culturally responsive teaching"],
        accessibilityNeeds: ["Visual supports", "Alternative text", "Closed captions"],
        organizationPattern: "sequential",
        contentSections: [
          { title: "Introduction", description: "Opening hook and learning objectives", sequence: 1 },
          { title: "Main Content", description: "Core concepts and skills", sequence: 2 },
          { title: "Practice", description: "Guided and independent practice", sequence: 3 },
          { title: "Assessment", description: "Check for understanding", sequence: 4 },
          { title: "Conclusion", description: "Summary and reflection", sequence: 5 }
        ],
        estimatedDuration: "45 minutes"
      };
      
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create project with generated data
      const { data, error } = await createProject({
        title: generatedProject.title,
        description: generatedProject.description,
        configData: {
          projectType: generatedProject.projectType,
          educationalContext: {
            gradeLevel: generatedProject.gradeLevel,
            subjectArea: generatedProject.subjectArea,
            standards: generatedProject.standards
          },
          learningObjectives: generatedProject.objectives,
          pedagogicalApproach: {
            teachingMethodology: generatedProject.teachingMethodology,
            assessmentPhilosophy: generatedProject.assessmentPhilosophy,
            differentiationStrategies: generatedProject.differentiationStrategies
          },
          culturalAccessibility: {
            languageComplexity: generatedProject.languageComplexity,
            culturalInclusion: generatedProject.culturalInclusion,
            accessibilityNeeds: generatedProject.accessibilityNeeds
          },
          contentStructure: {
            organizationPattern: generatedProject.organizationPattern,
            contentSections: generatedProject.contentSections,
            estimatedDuration: generatedProject.estimatedDuration
          }
        }
      });

      if (error) throw new Error(error);
      
      toast.success("Project created successfully with AI-generated content!");
      navigate(`/projects/${data.id}`);
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Quick Start</CardTitle>
        <CardDescription>
          Create a complete project with minimal input. Our AI will generate the educational content structure for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerateComplete)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Photosynthesis Lesson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gradeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a grade level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GRADE_LEVELS.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subjectArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Area</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUBJECT_AREAS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full mt-4 gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Complete Project...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Create AI-Generated Project
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default QuickStartWizard;
