
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProjectStageLayout from "@/components/pipeline/ProjectStageLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Play, 
  Sparkles, 
  Check, 
  RefreshCw,
  FileText, 
  AlertCircle,
  PauseCircle,
  CheckCircle
} from "lucide-react";

const ContentGenerationStage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [sections, setSections] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("prompt");

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        // First get the outline
        const { data: outline, error: outlineError } = await supabase
          .from("outlines")
          .select("*")
          .eq("project_id", projectId)
          .single();

        if (outlineError) throw outlineError;
        
        // Get all sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from("sections")
          .select("*")
          .eq("outline_id", outline.id)
          .order("order_index", { ascending: true });

        if (sectionsError) throw sectionsError;
        setSections(sectionsData);

        // Get all prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from("prompts")
          .select("*")
          .in(
            "section_id",
            sectionsData.map((s) => s.id)
          );

        if (promptsError) throw promptsError;
        setPrompts(promptsData);

        // Get any existing content items
        const { data: contentData, error: contentError } = await supabase
          .from("content_items")
          .select("*")
          .in(
            "prompt_id",
            promptsData.map((p) => p.id)
          );

        if (contentError) throw contentError;
        setContentItems(contentData || []);
        
        // If there are content items, set the active tab to content
        if (contentData && contentData.length > 0) {
          setActiveTab("content");
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load content generation data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, toast]);

  const getCurrentSectionPrompt = () => {
    if (!sections.length || !prompts.length) return null;
    
    const currentSection = sections[currentSectionIndex];
    return prompts.find((p) => p.section_id === currentSection.id);
  };

  const getCurrentSectionContent = () => {
    const currentPrompt = getCurrentSectionPrompt();
    if (!currentPrompt) return null;
    
    return contentItems.find((c) => c.prompt_id === currentPrompt.id);
  };

  const generateContent = async () => {
    const currentPrompt = getCurrentSectionPrompt();
    if (isGenerating || !currentPrompt || !projectId) return;

    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Notify the user
      toast({
        title: "Generating Content",
        description: `Creating content for "${sections[currentSectionIndex].title}"`,
      });
      
      // Simulate content generation with progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 1000);
      
      // Simulate API call to Claude
      await new Promise((resolve) => setTimeout(resolve, 5000));
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Generate example content based on prompt and section
      const section = sections[currentSectionIndex];
      const sampleContent = generateSampleContent(currentPrompt.prompt_text, section);
      
      // Check if content already exists
      const existingContent = contentItems.find((c) => c.prompt_id === currentPrompt.id);
      
      if (existingContent) {
        // Update existing content
        const { error } = await supabase
          .from("content_items")
          .update({
            content_text: sampleContent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingContent.id);
          
        if (error) throw error;
        
        // Update local state
        setContentItems((prev) =>
          prev.map((c) =>
            c.id === existingContent.id ? { ...c, content_text: sampleContent } : c
          )
        );
      } else {
        // Create new content item
        const { data: newContent, error } = await supabase
          .from("content_items")
          .insert({
            prompt_id: currentPrompt.id,
            content_text: sampleContent,
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update local state
        setContentItems((prev) => [...prev, newContent]);
      }
      
      // Switch tab to view content
      setActiveTab("content");
      
      toast({
        title: "Content Generated",
        description: "Content has been successfully created",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateSampleContent = (prompt: string, section: any) => {
    // This is a placeholder that would normally call Claude API
    // For demonstration, generate structured sample content
    const title = section.title || "Untitled Section";
    const objectives = section.config?.learningObjectives || ["Understand key concepts"];
    
    return `# ${title}

## Learning Objectives
${objectives.map((obj: string) => `- ${obj}`).join('\n')}

## Introduction
This section introduces students to essential concepts related to ${title.toLowerCase()}. Through interactive activities and clear explanations, students will develop a strong understanding of the subject matter.

## Key Concepts
1. **Fundamental Principles**: Understanding the basic principles that underpin ${title.toLowerCase()}.
2. **Applied Knowledge**: How these concepts apply in real-world situations.
3. **Critical Analysis**: Developing skills to analyze and evaluate information related to this topic.

## Activities
1. **Group Discussion**: Students work in small groups to discuss their understanding of key concepts.
2. **Interactive Exercise**: Complete the worksheet on page 4 to practice applying these principles.
3. **Reflection**: Write a short paragraph reflecting on how these concepts connect to previously learned material.

## Assessment
- Complete the review questions at the end of the section
- Participation in group discussion
- Quality of reflection writing

## Additional Resources
- Supplementary readings available in the appendix
- Online interactive tools at education.example.com/${title.toLowerCase().replace(/\s/g, '-')}
- Video demonstration of key concepts

*Generated based on specified educational parameters and learning objectives*`;
  };

  const updateContent = async (newText: string) => {
    const currentContent = getCurrentSectionContent();
    if (!currentContent) return;

    try {
      await supabase
        .from("content_items")
        .update({
          content_text: newText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentContent.id);
        
      // Update local state
      setContentItems((prev) =>
        prev.map((c) => (c.id === currentContent.id ? { ...c, content_text: newText } : c))
      );
      
      toast({
        title: "Content Updated",
        description: "Changes saved successfully",
      });
    } catch (error) {
      console.error("Error updating content:", error);
      toast({
        title: "Error",
        description: "Failed to save content changes",
        variant: "destructive",
      });
    }
  };

  const toggleContentApproval = async () => {
    const currentContent = getCurrentSectionContent();
    if (!currentContent) return;

    try {
      await supabase
        .from("content_items")
        .update({
          is_approved: !currentContent.is_approved,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentContent.id);
        
      // Update local state
      setContentItems((prev) =>
        prev.map((c) =>
          c.id === currentContent.id ? { ...c, is_approved: !c.is_approved } : c
        )
      );
      
      toast({
        title: currentContent.is_approved ? "Content Needs Review" : "Content Approved",
        description: currentContent.is_approved 
          ? "Content marked for further review" 
          : "Content has been approved",
      });
    } catch (error) {
      console.error("Error updating content approval:", error);
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive",
      });
    }
  };

  const switchSection = (index: number) => {
    setCurrentSectionIndex(index);
    
    // Reset to prompt tab if there's no content for this section
    const sectionId = sections[index]?.id;
    const promptForSection = prompts.find(p => p.section_id === sectionId);
    
    if (promptForSection) {
      const contentForPrompt = contentItems.find(c => c.prompt_id === promptForSection.id);
      setActiveTab(contentForPrompt ? "content" : "prompt");
    } else {
      setActiveTab("prompt");
    }
  };

  const allContentApproved = () => {
    // Check if we have content for all prompts and all are approved
    return (
      prompts.length > 0 &&
      prompts.every((prompt) => {
        const content = contentItems.find((c) => c.prompt_id === prompt.id);
        return content && content.is_approved;
      })
    );
  };

  const handleSubmit = async () => {
    // Ensure all content is generated and approved
    if (!allContentApproved()) {
      toast({
        title: "Cannot Proceed",
        description: "All content must be generated and approved before continuing",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const getContentProgress = () => {
    if (!prompts.length) return 0;
    
    const contentCount = contentItems.length;
    const approvedCount = contentItems.filter(c => c.is_approved).length;
    
    // Calculate progress: 50% for having content, 100% for all approved
    return (contentCount / prompts.length) * 50 + (approvedCount / prompts.length) * 50;
  };

  if (isLoading) {
    return (
      <ProjectStageLayout
        title="Content Generation"
        description="Loading content data..."
        isLoading={true}
      >
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProjectStageLayout>
    );
  }

  const currentPrompt = getCurrentSectionPrompt();
  const currentContent = getCurrentSectionContent();

  return (
    <ProjectStageLayout
      title="Content Generation"
      description="Generate and refine AI-created educational content"
      onNext={handleSubmit}
      isNextDisabled={!allContentApproved()}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Section sidebar */}
        <div className="md:col-span-1">
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
                  
                let status = "pending";
                if (sectionContent) {
                  status = sectionContent.is_approved ? "approved" : "inProgress";
                }
                
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
                      {status === "inProgress" && (
                        <FileText className="h-4 w-4 text-amber-500 ml-2" />
                      )}
                      {status === "pending" && (
                        <AlertCircle className="h-4 w-4 text-gray-400 ml-2" />
                      )}
                    </div>
                  </div>
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
        </div>
        
        {/* Content area */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {sections[currentSectionIndex]?.title || "Section Content"}
              </CardTitle>
              <CardDescription>
                {sections[currentSectionIndex]?.description || "Generate content for this section"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="prompt">
                    Prompt
                    {currentPrompt?.is_approved && (
                      <Check className="h-3 w-3 ml-1 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="content" disabled={!currentContent}>
                    Content
                    {currentContent?.is_approved && (
                      <Check className="h-3 w-3 ml-1 text-green-500" />
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="prompt" className="space-y-4">
                  <div className="bg-gray-50 border rounded-md p-4 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">AI Prompt</span>
                      {currentPrompt?.is_approved ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                          Not Approved
                        </Badge>
                      )}
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {currentPrompt?.prompt_text || "No prompt available for this section"}
                    </pre>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!currentPrompt?.is_approved}
                      onClick={generateContent}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button 
                      size="sm" 
                      disabled={!currentPrompt?.is_approved || isGenerating}
                      onClick={generateContent} 
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Generation Progress</span>
                        <span>{Math.round(generationProgress)}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4">
                  {currentContent ? (
                    <>
                      <Textarea
                        value={currentContent.content_text}
                        onChange={(e) => {
                          // Update local state first
                          setContentItems((prev) =>
                            prev.map((c) =>
                              c.id === currentContent.id
                                ? { ...c, content_text: e.target.value, is_approved: false }
                                : c
                            )
                          );
                        }}
                        onBlur={(e) => updateContent(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                      />
                      
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateContent()}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button
                          size="sm"
                          variant={currentContent.is_approved ? "outline" : "default"}
                          onClick={toggleContentApproval}
                        >
                          {currentContent.is_approved ? (
                            <>
                              <PauseCircle className="h-4 w-4 mr-2" />
                              Unapprove
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Content
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">No Content Yet</h3>
                      <p className="text-gray-500 mb-4">
                        Generate content from the approved prompt first
                      </p>
                      <Button onClick={() => setActiveTab("prompt")}>
                        Go to Prompt
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {!allContentApproved() && activeTab === "content" && contentItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>
                  All content sections must be generated and approved before moving to the validation stage.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProjectStageLayout>
  );
};

export default ContentGenerationStage;
