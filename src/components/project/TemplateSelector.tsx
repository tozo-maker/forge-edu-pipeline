
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, Book } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  description: string;
  type: string;
  gradeLevel: string[];
  subjectArea: string[];
  popularity: number;
  templateData: any;
}

// Sample template data
const TEMPLATES: Template[] = [
  {
    id: "t1",
    title: "5E Science Lesson",
    description: "Science lesson using the 5E instructional model (Engage, Explore, Explain, Elaborate, Evaluate).",
    type: "lesson_plan",
    gradeLevel: ["Middle School (6-8)", "High School (9-10)"],
    subjectArea: ["Science"],
    popularity: 95,
    templateData: {
      projectType: "lesson_plan",
      organizationPattern: "sequential",
      teachingMethodology: ["Inquiry-based learning", "5E Instructional Model"],
      differentiationStrategies: ["Tiered assignments", "Visual aids", "Collaborative groups"],
      contentSections: [
        { title: "Engage", description: "Hook students with an interesting phenomenon", sequence: 1 },
        { title: "Explore", description: "Students investigate the phenomenon", sequence: 2 },
        { title: "Explain", description: "Build concepts and vocabulary", sequence: 3 },
        { title: "Elaborate", description: "Apply concepts to new situations", sequence: 4 },
        { title: "Evaluate", description: "Assess student understanding", sequence: 5 }
      ]
    }
  },
  {
    id: "t2",
    title: "Math Problem-Based Lesson",
    description: "A math lesson structured around problem-based learning approach.",
    type: "lesson_plan",
    gradeLevel: ["Elementary (3-5)", "Middle School (6-8)"],
    subjectArea: ["Mathematics"],
    popularity: 87,
    templateData: {
      projectType: "lesson_plan",
      organizationPattern: "sequential",
      teachingMethodology: ["Problem-based learning", "Mathematical discourse"],
      differentiationStrategies: ["Multiple solution paths", "Visual models", "Concrete manipulatives"],
      contentSections: [
        { title: "Launch", description: "Present the problem context", sequence: 1 },
        { title: "Explore", description: "Students work on the problem", sequence: 2 },
        { title: "Discuss", description: "Share and compare strategies", sequence: 3 },
        { title: "Connect", description: "Connect to mathematical concepts", sequence: 4 },
        { title: "Practice", description: "Similar problems for reinforcement", sequence: 5 }
      ]
    }
  },
  {
    id: "t3",
    title: "Literature Analysis Module",
    description: "A literature module focused on critical analysis of texts.",
    type: "course_module",
    gradeLevel: ["High School (9-10)", "High School (11-12)"],
    subjectArea: ["Language Arts"],
    popularity: 82,
    templateData: {
      projectType: "course_module",
      organizationPattern: "sequential",
      teachingMethodology: ["Close reading", "Literary analysis", "Socratic discussion"],
      differentiationStrategies: ["Reading guides", "Audio texts", "Discussion protocols"],
      contentSections: [
        { title: "Text Introduction", description: "Background and context", sequence: 1 },
        { title: "Close Reading", description: "Detailed analysis of key passages", sequence: 2 },
        { title: "Character Analysis", description: "Examine character development", sequence: 3 },
        { title: "Theme Exploration", description: "Identify and analyze themes", sequence: 4 },
        { title: "Assessment", description: "Analytical essay or project", sequence: 5 }
      ]
    }
  },
  {
    id: "t4",
    title: "Formative Assessment Collection",
    description: "A set of formative assessment strategies for ongoing learning evaluation.",
    type: "assessment",
    gradeLevel: ["Elementary (K-2)", "Elementary (3-5)", "Middle School (6-8)"],
    subjectArea: ["Mathematics", "Science", "Language Arts", "Social Studies"],
    popularity: 76,
    templateData: {
      projectType: "assessment",
      organizationPattern: "modular",
      teachingMethodology: ["Formative assessment", "Feedback-driven instruction"],
      differentiationStrategies: ["Multiple response formats", "Self-assessment", "Strategic questioning"],
      contentSections: [
        { title: "Pre-Assessment", description: "Determine prior knowledge", sequence: 1 },
        { title: "Quick Checks", description: "Brief activities to gauge understanding", sequence: 2 },
        { title: "Peer Assessment", description: "Collaborative evaluation activities", sequence: 3 },
        { title: "Self-Reflection", description: "Students evaluate their learning", sequence: 4 },
        { title: "Exit Tickets", description: "End-of-lesson understanding check", sequence: 5 }
      ]
    }
  }
];

const TemplateSelector: React.FC = () => {
  const { setWizardData } = useWizard();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("lesson_plan");
  
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };
  
  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;
    
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    setWizardData(prev => ({
      ...prev,
      projectType: template.templateData.projectType,
      organizationPattern: template.templateData.organizationPattern,
      teachingMethodology: template.templateData.teachingMethodology,
      differentiationStrategies: template.templateData.differentiationStrategies,
      contentSections: template.templateData.contentSections,
    }));
    
    toast.success(`Template "${template.title}" applied successfully!`);
  };
  
  const filteredTemplates = TEMPLATES.filter(template => template.type === activeTab);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Template Library</CardTitle>
        <CardDescription>
          Choose from pre-designed templates to jumpstart your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lesson_plan" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="lesson_plan">Lesson Plans</TabsTrigger>
            <TabsTrigger value="course_module">Modules</TabsTrigger>
            <TabsTrigger value="assessment">Assessments</TabsTrigger>
            <TabsTrigger value="activity">Activities</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-2">
            <div className="grid grid-cols-1 gap-4">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className={`border rounded-md p-4 cursor-pointer hover:border-primary transition-all ${
                      selectedTemplate === template.id ? 'border-primary bg-primary-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium text-base">{template.title}</h4>
                          <p className="text-sm text-gray-500">{template.description}</p>
                        </div>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {template.subjectArea.map(subject => (
                        <Badge key={subject} variant="outline" className="bg-blue-50">
                          {subject}
                        </Badge>
                      ))}
                      {template.gradeLevel.slice(0, 1).map(grade => (
                        <Badge key={grade} variant="outline" className="bg-green-50">
                          {grade}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="bg-amber-50">
                        {template.popularity}% Popular
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No templates available for this project type yet.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleApplyTemplate} 
          className="w-full"
          disabled={!selectedTemplate}
        >
          Apply Template
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateSelector;
