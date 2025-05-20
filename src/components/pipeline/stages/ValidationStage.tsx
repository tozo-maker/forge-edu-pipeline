
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectStageLayout from "@/components/pipeline/ProjectStageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, AlertTriangle, Check, FileCheck, FileX } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-mobile";

const ValidationStage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [validations, setValidations] = useState<any[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const isMobile = useMediaQuery("md");
  const [activeTab, setActiveTab] = useState<string>("content");
  
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      try {
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
        setSections(sectionsData);
        
        // Get prompts
        const { data: prompts, error: promptsError } = await supabase
          .from("prompts")
          .select("*")
          .in(
            "section_id",
            sectionsData.map((s) => s.id)
          );
          
        if (promptsError) throw promptsError;
        
        if (!prompts || prompts.length === 0) {
          throw new Error("No prompts found for this project");
        }
        
        // Get content items
        const { data: contentData, error: contentError } = await supabase
          .from("content_items")
          .select("*, prompt:prompt_id(*)")
          .in(
            "prompt_id",
            prompts.map((p) => p.id)
          );
          
        if (contentError) throw contentError;
        setContentItems(contentData || []);
        
        // Get validations
        const { data: validationsData, error: validationsError } = await supabase
          .from("validations")
          .select("*")
          .in(
            "content_id",
            contentData.map((c) => c.id)
          );
          
        if (validationsError) throw validationsError;
        setValidations(validationsData || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load validation data: " + (error.message || "Unknown error"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, toast]);
  
  const validateAllContent = async () => {
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      
      const items = [...contentItems];
      let validatedCount = 0;
      
      toast({
        title: "Starting Validation",
        description: `Validating ${items.length} content sections against educational standards...`,
      });
      
      for (const item of items) {
        try {
          // Skip if already validated
          if (validations.find(v => v.content_id === item.id)) {
            validatedCount++;
            continue;
          }
          
          // Call validation edge function
          const { data: response, error } = await supabase.functions.invoke("validate-educational-content", {
            body: {
              contentId: item.id,
            },
          });
          
          if (error) throw error;
          
          if (response.success && response.validation) {
            // Add to validations
            setValidations(prev => [...prev, {
              content_id: item.id,
              validation_data: response.validation,
              quality_score: response.validation.quality_score,
              standards_alignment_score: response.validation.standards_alignment_score,
              improvement_suggestions: response.validation.improvement_suggestions,
              is_approved: response.validation.quality_score >= 8.0 && response.validation.standards_alignment_score >= 8.0
            }]);
            
            validatedCount++;
            
            // Show progress
            if (validatedCount % 2 === 0 || validatedCount === items.length) {
              toast({
                title: "Validation Progress",
                description: `Validated ${validatedCount} of ${items.length} sections`,
              });
            }
          }
          
          // Add small delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (itemError) {
          console.error("Error validating content item:", itemError);
          // Continue with next item
        }
      }
      
      toast({
        title: "Validation Complete",
        description: `Successfully validated ${validatedCount} of ${items.length} content sections`,
      });
      
    } catch (error) {
      console.error("Error in validation process:", error);
      toast({
        title: "Validation Error",
        description: "An error occurred during content validation: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  const updateImprovementSuggestion = async (validationId: string, suggestions: string) => {
    if (!validationId) return;
    
    try {
      const { error } = await supabase
        .from("validations")
        .update({ improvement_suggestions: suggestions })
        .eq("id", validationId);
        
      if (error) throw error;
      
      setValidations(prev => 
        prev.map(v => v.id === validationId ? { ...v, improvement_suggestions: suggestions } : v)
      );
      
      toast({
        title: "Suggestions Updated",
        description: "Improvement suggestions have been saved",
      });
    } catch (error) {
      console.error("Error updating suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to update improvement suggestions",
        variant: "destructive",
      });
    }
  };
  
  const toggleApproval = async (validationId: string, currentStatus: boolean) => {
    if (!validationId) return;
    
    try {
      const { error } = await supabase
        .from("validations")
        .update({ is_approved: !currentStatus })
        .eq("id", validationId);
        
      if (error) throw error;
      
      setValidations(prev => 
        prev.map(v => v.id === validationId ? { ...v, is_approved: !currentStatus } : v)
      );
      
      toast({
        title: currentStatus ? "Content Needs Review" : "Content Approved",
        description: currentStatus ? "Content marked for further review" : "Content has been approved",
      });
    } catch (error) {
      console.error("Error toggling approval:", error);
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive",
      });
    }
  };
  
  const getCurrentContentAndValidation = () => {
    if (!sections.length || currentSectionIndex >= sections.length) {
      return { content: null, validation: null };
    }
    
    const currentSection = sections[currentSectionIndex];
    const content = contentItems.find(c => c.prompt.section_id === currentSection.id);
    
    if (!content) {
      return { content: null, validation: null };
    }
    
    const validation = validations.find(v => v.content_id === content.id);
    
    return { content, validation };
  };
  
  const allContentValidated = () => {
    return contentItems.length > 0 && contentItems.every(content => 
      validations.some(v => v.content_id === content.id && v.is_approved)
    );
  };
  
  const handleSubmit = async () => {
    if (!allContentValidated()) {
      toast({
        title: "Cannot Proceed",
        description: "All content must be validated and approved before proceeding",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  if (isLoading) {
    return (
      <ProjectStageLayout
        title="Content Validation"
        description="Loading content validation data..."
        isLoading={true}
      >
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProjectStageLayout>
    );
  }
  
  const { content: currentContent, validation: currentValidation } = getCurrentContentAndValidation();
  const validationData = currentValidation?.validation_data;
  
  return (
    <ProjectStageLayout
      title="Content Validation"
      description="Validate and enhance your educational content against standards"
      onNext={handleSubmit}
      isNextDisabled={!allContentValidated()}
      isLoading={isValidating}
      loadingMessage={isValidating ? "Validating content against educational standards..." : undefined}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Educational Content Validation</h2>
            <p className="text-sm text-gray-500">
              Analyze content quality and alignment with educational standards
            </p>
          </div>
          
          <Button 
            onClick={validateAllContent} 
            disabled={isValidating || !contentItems.length}
            className="gap-2"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Award className="h-4 w-4" />
            )}
            {validations.length > 0 ? "Revalidate All Content" : "Validate All Content"}
          </Button>
        </div>
        
        {/* Section Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {sections.map((section, index) => {
                const sectionContent = contentItems.find(c => c.prompt.section_id === section.id);
                const sectionValidation = sectionContent 
                  ? validations.find(v => v.content_id === sectionContent.id)
                  : null;
                  
                const validationStatus = !sectionContent ? "missing" :
                  !sectionValidation ? "pending" :
                  sectionValidation.is_approved ? "approved" : "needs-review";
                
                return (
                  <Button
                    key={section.id}
                    variant={index === currentSectionIndex ? "default" : "outline"}
                    size="sm"
                    className="justify-between"
                    onClick={() => setCurrentSectionIndex(index)}
                  >
                    <span className="truncate mr-2">{section.title}</span>
                    {validationStatus === "missing" && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        Missing Content
                      </Badge>
                    )}
                    {validationStatus === "pending" && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        Not Validated
                      </Badge>
                    )}
                    {validationStatus === "needs-review" && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Needs Review
                      </Badge>
                    )}
                    {validationStatus === "approved" && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Approved
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Section Content and Validation */}
        <div className="space-y-6">
          {!currentContent ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Content Not Found</h3>
                  <p className="text-gray-500">
                    No content has been generated for this section yet. Please return to the Content Generation stage
                    to create content before validation.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {sections[currentSectionIndex]?.title || "Section Content"}
                  </CardTitle>
                  <CardDescription>
                    Review the content and its validation results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className={isMobile ? "w-full grid-cols-2" : "grid grid-cols-2"}>
                      <TabsTrigger value="content" className={isMobile ? "text-xs py-1 px-2" : ""}>
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="validation" disabled={!currentValidation} className={isMobile ? "text-xs py-1 px-2" : ""}>
                        Validation
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content">
                      <div className="space-y-4">
                        <div className="bg-gray-50 border rounded-md p-4 font-mono text-sm whitespace-pre-wrap">
                          {currentContent.content_text}
                        </div>
                        
                        {!currentValidation ? (
                          <div className="flex justify-center">
                            <Button 
                              onClick={() => {
                                if (currentContent) {
                                  supabase.functions.invoke("validate-educational-content", {
                                    body: { contentId: currentContent.id }
                                  }).then(({ data, error }) => {
                                    if (error) throw error;
                                    
                                    if (data.success && data.validation) {
                                      // Add to validations
                                      const newValidation = {
                                        id: data.id,
                                        content_id: currentContent.id,
                                        validation_data: data.validation,
                                        quality_score: data.validation.quality_score,
                                        standards_alignment_score: data.validation.standards_alignment_score,
                                        improvement_suggestions: data.validation.improvement_suggestions,
                                        is_approved: data.validation.quality_score >= 8.0 && data.validation.standards_alignment_score >= 8.0
                                      };
                                      
                                      setValidations(prev => [...prev, newValidation]);
                                      setActiveTab("validation");
                                      
                                      toast({
                                        title: "Validation Complete",
                                        description: "Content has been validated successfully",
                                      });
                                    }
                                  }).catch(err => {
                                    console.error("Error validating content:", err);
                                    toast({
                                      title: "Validation Error",
                                      description: "Failed to validate content: " + (err.message || "Unknown error"),
                                      variant: "destructive",
                                    });
                                  });
                                }
                              }}
                            >
                              Validate This Content
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="validation">
                      {validationData ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                              <CardHeader className="py-3">
                                <CardTitle className="text-base">Quality Score</CardTitle>
                              </CardHeader>
                              <CardContent className="py-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Overall Quality</span>
                                    <span 
                                      className={validationData.quality_score >= 8 ? 'text-green-600' : 'text-amber-600'}
                                    >
                                      {validationData.quality_score}/10
                                    </span>
                                  </div>
                                  <Progress 
                                    value={validationData.quality_score * 10} 
                                    className={`h-2 ${validationData.quality_score >= 8 ? 'bg-green-500' : 'bg-amber-500'}`} 
                                  />
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="py-3">
                                <CardTitle className="text-base">Standards Alignment</CardTitle>
                              </CardHeader>
                              <CardContent className="py-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Alignment Score</span>
                                    <span 
                                      className={validationData.standards_alignment_score >= 8 ? 'text-green-600' : 'text-amber-600'}
                                    >
                                      {validationData.standards_alignment_score}/10
                                    </span>
                                  </div>
                                  <Progress 
                                    value={validationData.standards_alignment_score * 10} 
                                    className={`h-2 ${validationData.standards_alignment_score >= 8 ? 'bg-green-500' : 'bg-amber-500'}`} 
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                              <CardHeader className="py-3">
                                <CardTitle className="text-base flex items-center">
                                  <Award className="h-4 w-4 mr-2 text-green-600" />
                                  Strengths
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="py-3">
                                {validationData.strengths && validationData.strengths.length > 0 ? (
                                  <ul className="list-disc pl-5 space-y-1">
                                    {validationData.strengths.map((strength: string, i: number) => (
                                      <li key={i} className="text-sm text-gray-700">{strength}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">No specific strengths identified</p>
                                )}
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="py-3">
                                <CardTitle className="text-base flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                                  Areas for Improvement
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="py-3">
                                {validationData.weaknesses && validationData.weaknesses.length > 0 ? (
                                  <ul className="list-disc pl-5 space-y-1">
                                    {validationData.weaknesses.map((weakness: string, i: number) => (
                                      <li key={i} className="text-sm text-gray-700">{weakness}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">No specific weaknesses identified</p>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                          
                          <Card>
                            <CardHeader className="py-3">
                              <CardTitle className="text-base">Improvement Suggestions</CardTitle>
                              <CardDescription>
                                Recommendations to enhance educational quality
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="py-3">
                              <Textarea
                                value={currentValidation.improvement_suggestions || validationData.improvement_suggestions || ''}
                                className="min-h-[100px]"
                                onChange={(e) => {
                                  // Update local state only
                                  setValidations(prev => 
                                    prev.map(v => v.id === currentValidation.id 
                                      ? { ...v, improvement_suggestions: e.target.value } 
                                      : v
                                    )
                                  );
                                }}
                                onBlur={() => {
                                  if (currentValidation?.id) {
                                    updateImprovementSuggestion(
                                      currentValidation.id, 
                                      currentValidation.improvement_suggestions || validationData.improvement_suggestions || ''
                                    );
                                  }
                                }}
                              />
                            </CardContent>
                            <CardFooter>
                              <Button
                                variant={currentValidation.is_approved ? "outline" : "default"}
                                className="w-full"
                                onClick={() => toggleApproval(currentValidation.id, currentValidation.is_approved)}
                              >
                                {currentValidation.is_approved ? (
                                  <>
                                    <FileX className="h-4 w-4 mr-2" />
                                    Mark for Revision
                                  </>
                                ) : (
                                  <>
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Approve Content
                                  </>
                                )}
                              </Button>
                            </CardFooter>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No validation data available for this content.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              {!allContentValidated() && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">All content must be validated and approved</p>
                      <p>
                        Validate and approve each content section before completing the pipeline.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProjectStageLayout>
  );
};

export default ValidationStage;
