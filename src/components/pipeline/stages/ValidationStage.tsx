
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectStageLayout from "@/components/pipeline/ProjectStageLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  FileText,
  BookOpen,
  CheckCircle,
  XCircle,
  Edit,
  Download,
  CheckSquare,
  AlertCircle,
  Check
} from "lucide-react";

// Define explicit typing for sections and prompts
interface Section {
  id: string;
  title: string;
  description: string;
  order_index: number;
  outline_id: string;
  config: Record<string, any>;
}

interface Prompt {
  id: string;
  section_id: string;
  prompt_text: string;
  content_id?: string;
}

interface ContentItem {
  id: string;
  prompt_id: string;
  content_text: string;
}

interface Validation {
  id?: string;
  content_id: string;
  validation_data: Record<string, any>;
  quality_score: number | null;
  standards_alignment_score: number | null;
  improvement_suggestions: string;
  is_approved: boolean;
}

const ValidationStage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [sections, setSections] = useState<Section[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [validations, setValidations] = useState<Validation[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [projectStandards, setProjectStandards] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      try {
        // Get project config to get educational standards
        const { data: projectConfig, error: configError } = await supabase
          .from("project_configs")
          .select("*")
          .eq("project_id", projectId)
          .single();
          
        if (configError && configError.code !== "PGRST116") throw configError;
        
        if (projectConfig) {
          // Type cast config_data as a Record to access properties safely
          const configData = projectConfig.config_data as Record<string, any>;
          if (configData?.educationalContext?.standards) {
            setProjectStandards(configData.educationalContext.standards);
          }
        }
        
        // Get outline
        const { data: outline, error: outlineError } = await supabase
          .from("outlines")
          .select("*")
          .eq("project_id", projectId)
          .single();
          
        if (outlineError) throw outlineError;
        
        // Get sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from("sections")
          .select("*")
          .eq("outline_id", outline.id)
          .order("order_index", { ascending: true });
          
        if (sectionsError) throw sectionsError;
        setSections(sectionsData as Section[]);
        
        // Get prompts to link to content items
        const { data: promptsData, error: promptsError } = await supabase
          .from("prompts")
          .select("*")
          .in(
            "section_id",
            sectionsData.map(s => s.id)
          );
          
        if (promptsError) throw promptsError;
        setPrompts(promptsData as Prompt[]);
        
        // Get content items
        const { data: contentData, error: contentError } = await supabase
          .from("content_items")
          .select("*")
          .in(
            "prompt_id",
            promptsData.map(p => p.id)
          );
          
        if (contentError) throw contentError;
        setContentItems(contentData || []);
        
        // Get validations
        const { data: validationsData, error: validationsError } = await supabase
          .from("validations")
          .select("*")
          .in(
            "content_id",
            contentData.map((c: ContentItem) => c.id)
          );
          
        if (validationsError) throw validationsError;
        
        // If no validations exist yet, initialize empty ones
        if (!validationsData || validationsData.length === 0) {
          const initialValidations = contentData.map((content: ContentItem) => ({
            content_id: content.id,
            validation_data: {},
            quality_score: null,
            standards_alignment_score: null,
            improvement_suggestions: "",
            is_approved: false,
          }));
          
          setValidations(initialValidations);
        } else {
          setValidations(validationsData);
        }
        
      } catch (error) {
        console.error("Error fetching validation data:", error);
        toast({
          title: "Error",
          description: "Failed to load validation data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, toast]);

  // Helper functions to get related data
  const getCurrentSectionContent = () => {
    if (!sections.length) return null;
    
    const currentSection = sections[currentSectionIndex];
    // Find prompt for current section
    const sectionPrompt = prompts.find(p => p.section_id === currentSection?.id);
    
    return sectionPrompt 
      ? contentItems.find(c => c.prompt_id === sectionPrompt.id)
      : null;
  };
  
  const getCurrentValidation = () => {
    const content = getCurrentSectionContent();
    if (!content) return null;
    
    return validations.find(v => v.content_id === content.id);
  };

  // Calculate the related data for current section
  const currentSection = sections[currentSectionIndex];
  const currentContent = getCurrentSectionContent();
  const currentValidation = getCurrentValidation();

  // Run validation for current section
  const runValidation = async () => {
    if (isValidating || !currentContent || !currentSection) return;
    
    try {
      setIsValidating(true);
      
      toast({
        title: "Running Validation",
        description: `Validating content for "${currentSection.title}"`,
      });
      
      // Simulate validation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate sample validation results
      const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-100
      const alignmentScore = Math.floor(Math.random() * 30) + 70; // 70-100
      
      let suggestions = "";
      if (qualityScore < 85) {
        suggestions += "- Consider adding more examples to illustrate key concepts.\n";
        suggestions += "- Introduce more interactive elements to engage different learning styles.\n";
      }
      
      if (alignmentScore < 85) {
        suggestions += "- Strengthen alignment with curriculum standards by explicitly referencing key requirements.\n";
        suggestions += "- Add assessment components that directly measure standard outcomes.\n";
      }
      
      if (qualityScore >= 90 && alignmentScore >= 90) {
        suggestions += "- This content meets high quality standards. Consider adding extension activities for advanced learners.\n";
      }
      
      const validationData = {
        content_analysis: {
          readability_level: Math.random() > 0.5 ? "Appropriate" : "Slightly advanced",
          educational_completeness: Math.random() > 0.7 ? "Complete" : "Needs minor additions",
          pedagogical_approach: Math.random() > 0.6 ? "Strong" : "Adequate"
        },
        standards_alignment: projectStandards.map(standard => ({
          standard_id: standard,
          alignment_level: Math.random() > 0.7 ? "Strong" : "Partial"
        })),
        improvement_areas: Math.random() > 0.5 
          ? ["Add more examples", "Include differentiation strategies"] 
          : ["Clarify key concepts", "Add assessment components"]
      };
      
      // Check if validation already exists
      const existingValidation = validations.find(v => v.content_id === currentContent.id);
      
      if (existingValidation?.id) {
        // Update existing validation
        const { error } = await supabase
          .from("validations")
          .update({
            validation_data: validationData,
            quality_score: qualityScore,
            standards_alignment_score: alignmentScore,
            improvement_suggestions: suggestions,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingValidation.id);
          
        if (error) throw error;
        
        // Update local state
        setValidations(prev => prev.map(v => 
          v.id === existingValidation.id 
            ? { 
                ...v, 
                validation_data: validationData, 
                quality_score: qualityScore, 
                standards_alignment_score: alignmentScore, 
                improvement_suggestions: suggestions 
              } 
            : v
        ));
      } else {
        // Create new validation
        const { data: newValidation, error } = await supabase
          .from("validations")
          .insert({
            content_id: currentContent.id,
            validation_data: validationData,
            quality_score: qualityScore,
            standards_alignment_score: alignmentScore,
            improvement_suggestions: suggestions,
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update local state
        setValidations(prev => [...prev, newValidation]);
      }
      
      toast({
        title: "Validation Complete",
        description: `Quality Score: ${qualityScore}/100, Alignment Score: ${alignmentScore}/100`,
      });
      
      // Switch to results tab
      setActiveTab("results");
      
    } catch (error) {
      console.error("Error running validation:", error);
      toast({
        title: "Error",
        description: "Failed to complete validation",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Update improvement suggestions
  const updateSuggestions = async (suggestions: string) => {
    if (!currentValidation?.id) return;
    
    try {
      await supabase
        .from("validations")
        .update({
          improvement_suggestions: suggestions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentValidation.id);
        
      // Update local state
      setValidations(prev => prev.map(v => 
        v.id === currentValidation.id 
          ? { ...v, improvement_suggestions: suggestions } 
          : v
      ));
      
      toast({
        title: "Suggestions Updated",
        description: "Improvement suggestions have been saved",
      });
    } catch (error) {
      console.error("Error updating suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to update suggestions",
        variant: "destructive",
      });
    }
  };

  // Toggle content approval
  const toggleApproval = async () => {
    if (!currentValidation?.id) return;
    
    try {
      const newApprovalStatus = !currentValidation.is_approved;
      
      await supabase
        .from("validations")
        .update({
          is_approved: newApprovalStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentValidation.id);
        
      // Update local state
      setValidations(prev => prev.map(v => 
        v.id === currentValidation.id 
          ? { ...v, is_approved: newApprovalStatus } 
          : v
      ));
      
      toast({
        title: newApprovalStatus ? "Content Approved" : "Approval Removed",
        description: newApprovalStatus 
          ? "Content has passed validation" 
          : "Content requires further improvement",
      });
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive",
      });
    }
  };

  // Handle section switching
  const switchSection = (index: number) => {
    setCurrentSectionIndex(index);
    setActiveTab("content"); // Reset to content tab when switching sections
  };

  // Check if all content is approved
  const allContentValidated = () => {
    return (
      contentItems.length > 0 &&
      contentItems.every(content => {
        const validation = validations.find(v => v.content_id === content.id);
        return validation && validation.is_approved;
      })
    );
  };

  // Handle final completion
  const handleCompletion = async () => {
    if (!allContentValidated()) {
      toast({
        title: "Cannot Complete",
        description: "All content must be validated and approved",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // In a real implementation, this would finalize the project
      toast({
        title: "Project Complete!",
        description: "Your educational content has been fully validated",
      });
      
      navigate(`/projects/${projectId}`);
      return true;
    } catch (error) {
      console.error("Error completing project:", error);
      toast({
        title: "Error",
        description: "Failed to complete project",
        variant: "destructive",
      });
      return false;
    }
  };

  // Calculate overall validation progress
  const getValidationProgress = () => {
    if (!validations.length || !contentItems.length) return 0;
    
    const validatedCount = validations.filter(v => 
      v.quality_score !== null && v.standards_alignment_score !== null
    ).length;
    
    const approvedCount = validations.filter(v => v.is_approved).length;
    
    // Calculate progress: 50% for having validations, 50% for approvals
    return (validatedCount / contentItems.length) * 50 + (approvedCount / contentItems.length) * 50;
  };

  // Find validation status for a section
  const getSectionValidationStatus = (sectionId: string) => {
    // Find prompt for this section
    const sectionPrompt = prompts.find(p => p.section_id === sectionId);
    if (!sectionPrompt) return "pending";
    
    // Find content for this prompt
    const sectionContent = contentItems.find(c => c.prompt_id === sectionPrompt.id);
    if (!sectionContent) return "pending";
    
    // Find validation for this content
    const sectionValidation = validations.find(v => v.content_id === sectionContent.id);
    if (!sectionValidation) return "pending";
    
    if (sectionValidation.is_approved) return "approved";
    if (sectionValidation.quality_score !== null) return "validated";
    
    return "pending";
  };

  if (isLoading) {
    return (
      <ProjectStageLayout
        title="Validation & Enhancement"
        description="Loading validation data..."
        isLoading={true}
      >
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProjectStageLayout>
    );
  }

  return (
    <ProjectStageLayout
      title="Validation & Enhancement"
      description="Validate content against educational standards and enhance quality"
      onNext={handleCompletion}
      isNextDisabled={!allContentValidated()}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sections sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">Content Sections</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-3 space-y-1">
              {sections.map((section, index) => {
                // Find validation status for this section
                const status = getSectionValidationStatus(section.id);
                
                return (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      index === currentSectionIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => switchSection(index)}
                  >
                    <div className="truncate flex-1">
                      <span className="mr-1 font-medium">{index + 1}.</span>
                      {section.title || "Untitled Section"}
                    </div>
                    <div className="flex items-center">
                      {status === "approved" && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                      )}
                      {status === "validated" && (
                        <AlertCircle className="h-4 w-4 text-amber-500 ml-2" />
                      )}
                      {status === "pending" && (
                        <FileText className="h-4 w-4 text-gray-400 ml-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
            <CardFooter className="border-t pt-3 px-3">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Validation Progress</span>
                  <span>{Math.round(getValidationProgress())}%</span>
                </div>
                <Progress value={getValidationProgress()} className="h-2" />
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Content and validation area */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentSection?.title || "Section Content"}
              </CardTitle>
              <CardDescription>
                {currentSection?.description || "Validate and enhance this content"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="content">
                    <FileText className="h-4 w-4 mr-2" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger 
                    value="results" 
                    disabled={!currentValidation?.quality_score}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Validation Results
                  </TabsTrigger>
                  <TabsTrigger 
                    value="improvements"
                    disabled={!currentValidation?.quality_score}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Improvements
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  <div className="border rounded-md p-4 space-y-2 bg-gray-50">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {currentContent?.content_text || "No content available for this section"}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/projects/${projectId}/content`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Content
                    </Button>
                    
                    <Button
                      onClick={runValidation}
                      disabled={isValidating || !currentContent}
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Run Validation
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="results" className="space-y-6">
                  {currentValidation?.quality_score ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Quality score */}
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-lg">Quality Score</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex flex-col items-center">
                              <div className={`
                                w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold
                                ${currentValidation.quality_score >= 90 ? 'bg-green-100 text-green-700' : 
                                  currentValidation.quality_score >= 75 ? 'bg-amber-100 text-amber-700' : 
                                  'bg-red-100 text-red-700'}
                              `}>
                                {currentValidation.quality_score}/100
                              </div>
                              <p className="mt-2 text-sm text-gray-500">
                                {currentValidation.quality_score >= 90 ? 'Excellent' : 
                                 currentValidation.quality_score >= 75 ? 'Good' : 'Needs Improvement'}
                              </p>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Analysis:</h4>
                              <ul className="text-sm space-y-1">
                                <li className="flex items-center">
                                  <span className="w-40">Readability Level:</span>
                                  <span>{currentValidation.validation_data?.content_analysis?.readability_level || "N/A"}</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="w-40">Completeness:</span>
                                  <span>{currentValidation.validation_data?.content_analysis?.educational_completeness || "N/A"}</span>
                                </li>
                                <li className="flex items-center">
                                  <span className="w-40">Pedagogical Approach:</span>
                                  <span>{currentValidation.validation_data?.content_analysis?.pedagogical_approach || "N/A"}</span>
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Standards alignment score */}
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-lg">Standards Alignment</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex flex-col items-center">
                              <div className={`
                                w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold
                                ${currentValidation.standards_alignment_score >= 90 ? 'bg-green-100 text-green-700' : 
                                  currentValidation.standards_alignment_score >= 75 ? 'bg-amber-100 text-amber-700' : 
                                  'bg-red-100 text-red-700'}
                              `}>
                                {currentValidation.standards_alignment_score}/100
                              </div>
                              <p className="mt-2 text-sm text-gray-500">
                                {currentValidation.standards_alignment_score >= 90 ? 'High Alignment' : 
                                 currentValidation.standards_alignment_score >= 75 ? 'Moderate Alignment' : 'Low Alignment'}
                              </p>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Standards:</h4>
                              <ul className="text-sm space-y-1">
                                {currentValidation.validation_data?.standards_alignment?.map((item: any, index: number) => (
                                  <li key={index} className="flex items-center justify-between">
                                    <span>{item.standard_id}</span>
                                    <span className={
                                      item.alignment_level === "Strong" ? "text-green-600" : "text-amber-600"
                                    }>
                                      {item.alignment_level}
                                    </span>
                                  </li>
                                )) || (
                                  <li>No standards alignment data available</li>
                                )}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Improvement Areas</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ul className="text-sm space-y-1">
                            {currentValidation.validation_data?.improvement_areas?.map((area: string, index: number) => (
                              <li key={index} className="flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                {area}
                              </li>
                            )) || (
                              <li>No improvement areas identified</li>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => setActiveTab("improvements")}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          View Suggested Improvements
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">No Validation Results</h3>
                      <p className="text-gray-500 mb-4">
                        Run validation on the content first
                      </p>
                      <Button onClick={() => setActiveTab("content")}>
                        Go to Content
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="improvements" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="improvement-suggestions">Improvement Suggestions</Label>
                      <Textarea
                        id="improvement-suggestions"
                        className="min-h-[200px] font-mono"
                        placeholder="Add suggestions for improving this content..."
                        value={currentValidation?.improvement_suggestions || ""}
                        onChange={(e) => {
                          // Update local state
                          setValidations(prev => prev.map(v => 
                            v.content_id === currentValidation?.content_id 
                              ? { ...v, improvement_suggestions: e.target.value } 
                              : v
                          ));
                        }}
                        onBlur={(e) => updateSuggestions(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/projects/${projectId}/content`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Content
                      </Button>
                      
                      <Button
                        onClick={toggleApproval}
                        variant={currentValidation?.is_approved ? "outline" : "default"}
                      >
                        {currentValidation?.is_approved ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Revoke Approval
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Content
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {currentValidation?.is_approved && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800 text-sm">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>
                          This content has been validated and approved. It's ready for final export.
                        </span>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {!allContentValidated() && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>
                  All content sections must be validated and approved before completing the project.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProjectStageLayout>
  );
};

export default ValidationStage;
