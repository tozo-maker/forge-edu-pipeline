
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ProjectWizardFormData } from "@/pages/ProjectWizard";

// Schema for the form
const educationalContextSchema = z.object({
  gradeLevel: z.array(z.string()).min(1, {
    message: "Please select at least one grade level.",
  }),
  subjectArea: z.array(z.string()).min(1, {
    message: "Please select at least one subject area.",
  }),
  standards: z.array(z.string()).optional(),
});

type EducationalContextStepProps = {
  data: Partial<ProjectWizardFormData>;
  onNext: (data: Partial<ProjectWizardFormData>) => void;
  onBack: () => void;
};

// Sample data - in a real implementation, this might come from the database
const GRADE_LEVELS = [
  "Elementary - K-2",
  "Elementary - 3-5",
  "Middle School - 6-8",
  "High School - 9-10",
  "High School - 11-12",
  "Higher Education",
  "Adult Education"
];

const SUBJECT_AREAS = [
  "Math",
  "Science",
  "Language Arts",
  "Social Studies",
  "Arts",
  "Foreign Languages",
  "Physical Education",
  "Computer Science",
  "Life Skills",
  "Special Education"
];

const EDUCATIONAL_STANDARDS = [
  "Common Core - Math",
  "Common Core - ELA",
  "NGSS (Science)",
  "ISTE (Technology)",
  "State Standards",
  "AP Framework",
  "IB Framework",
  "WIDA (ELL)",
  "NCTM (Math)"
];

const EducationalContextStep: React.FC<EducationalContextStepProps> = ({ data, onNext, onBack }) => {
  const form = useForm<z.infer<typeof educationalContextSchema>>({
    resolver: zodResolver(educationalContextSchema),
    defaultValues: {
      gradeLevel: data.gradeLevel || [],
      subjectArea: data.subjectArea || [],
      standards: data.standards || [],
    },
  });
  
  const [selectedGrades, setSelectedGrades] = useState<string[]>(data.gradeLevel || []);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(data.subjectArea || []);
  const [selectedStandards, setSelectedStandards] = useState<string[]>(data.standards || []);

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
    const newGrades = selectedGrades.includes(grade) 
      ? selectedGrades.filter(g => g !== grade) 
      : [...selectedGrades, grade];
    form.setValue("gradeLevel", newGrades);
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
    const newSubjects = selectedSubjects.includes(subject) 
      ? selectedSubjects.filter(s => s !== subject) 
      : [...selectedSubjects, subject];
    form.setValue("subjectArea", newSubjects);
  };

  const toggleStandard = (standard: string) => {
    setSelectedStandards(prev => 
      prev.includes(standard) ? prev.filter(s => s !== standard) : [...prev, standard]
    );
    const newStandards = selectedStandards.includes(standard) 
      ? selectedStandards.filter(s => s !== standard) 
      : [...selectedStandards, standard];
    form.setValue("standards", newStandards);
  };

  const handleSubmit = (values: z.infer<typeof educationalContextSchema>) => {
    onNext({
      gradeLevel: values.gradeLevel,
      subjectArea: values.subjectArea,
      standards: values.standards,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Educational Context</h2>
          <p className="text-sm text-gray-500">
            Define the grade levels, subject areas, and educational standards for your content
          </p>
        </div>

        <FormField
          control={form.control}
          name="gradeLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade Levels</FormLabel>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {GRADE_LEVELS.map((grade) => (
                    <Badge 
                      key={grade} 
                      variant={selectedGrades.includes(grade) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleGrade(grade)}
                    >
                      {grade}
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subjectArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Areas</FormLabel>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_AREAS.map((subject) => (
                    <Badge 
                      key={subject} 
                      variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSubject(subject)}
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="standards"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Educational Standards</FormLabel>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {EDUCATIONAL_STANDARDS.map((standard) => (
                    <Badge 
                      key={standard} 
                      variant={selectedStandards.includes(standard) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleStandard(standard)}
                    >
                      {standard}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Optional: Select any applicable educational standards</p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
};

export default EducationalContextStep;
