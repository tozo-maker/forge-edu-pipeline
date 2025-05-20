
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProjectStageLayout from "@/components/pipeline/ProjectStageLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, AlertCircle, X, RotateCcw } from "lucide-react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import SectionsList from "@/components/pipeline/content-generation/SectionsList";
import PromptView from "@/components/pipeline/content-generation/PromptView";
import ContentView from "@/components/pipeline/content-generation/ContentView";
import NoContentView from "@/components/pipeline/content-generation/NoContentView";
import GuidedTour, { AI_CONTENT_GENERATION_TOUR } from "@/components/common/GuidedTour";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/pipeline/content-generation/RichTextEditor";
import EducationalDNAPanel from "@/components/pipeline/content-generation/EducationalDNAPanel";
import GenerationOptions from "@/components/pipeline/content-generation/GenerationOptions";
import LiveQualityIndicators from "@/components/pipeline/content-generation/LiveQualityIndicators";

const ContentGenerationStage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [sections, setSections] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [validations, setValidations] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("prompt");
  const [showTour, setShowTour] = useState(false);
  const isMobile = useMediaQuery("md");
  const [generationInterval, setGenerationInterval] = useState<number | null>(null);
  const [projectConfig, setProjectConfig] = useState<any>(null);
  const [generationModel, setGenerationModel] = useState<string>("claude-3-opus-20240229");
  const [generationStyle, setGenerationStyle] = useState<string>("balanced");
  const [showLiveQuality, setShowLiveQuality] = useState(true);
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  const [generationMessages, setGenerationMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [generationCancelled, setGenerationCancelled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        // First get the project config for educational DNA
        const { data: configData, error: configError } = await supabase
          .from("project_configs")
          .select("*")
          .eq("project_id", projectId)
          .single();
          
        if (configError) throw configError;
        setProjectConfig(configData);
        
        // Get the outline
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
        
        // Get any existing validations
        if (contentData && contentData.length > 0) {
          const { data: validationsData } = await supabase
            .from("validations")
            .select("*")
            .in(
              "content_id",
              contentData.map((c: any) => c.id)
            );
            
          if (validationsData && validationsData.length > 0) {
            // Create a mapping object by content_id
            const validationsMap: Record<string, any> = {};
            validationsData.forEach((validation: any) => {
              validationsMap[validation.content_id] = validation;
            });
            setValidations(validationsMap);
          }
        }
        
        // If there are content items, set the active tab to content
        if (contentData && contentData.length > 0) {
          setActiveTab("content");
        }

        // Show the tour if this is the first time visiting this stage
        const tourShown = localStorage.getItem("eduforge_content_generation_tour_shown");
        if (!tourShown) {
          setShowTour(true);
          localStorage.setItem("eduforge_content_generation_tour_shown", "true");
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
    
    // Clear any existing intervals when component unmounts
    return () => {
      if (generationInterval) {
        clearInterval(generationInterval);
      }
      
      // Close WebSocket if open
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [projectId, toast, generationInterval]);

  // WebSocket setup for real-time updates
  const setupWebSocket = (promptId: string) => {
    // Close existing socket if it exists
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
    
    try {
      // Create a new WebSocket connection
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/content-generation-stream`;
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        // Send initial message with prompt ID
        newSocket.send(JSON.stringify({ 
          promptId,
          generationStyle,
          model: generationModel
        }));
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'progress') {
            setGenerationProgress(data.progress);
          } else if (data.type === 'content') {
            // Update content in real time
            setGenerationMessages(prev => [...prev, data.message]);
            
            // If it's the final message, update the content item
            if (data.final) {
              handleContentReceived(data.content, data.contentId);
            }
          } else if (data.type === 'quality') {
            // Handle real-time quality assessment
            updateQualityIndicators(data.indicators);
          } else if (data.type === 'error') {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to establish real-time connection",
          variant: "destructive",
        });
      };
      
      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
      };
      
      setSocket(newSocket);
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  };

  const cancelGeneration = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'cancel' }));
      socket.close();
      setSocket(null);
    }
    
    if (generationInterval) {
      clearInterval(generationInterval);
      setGenerationInterval(null);
    }
    
    setIsGenerating(false);
    setGenerationCancelled(true);
    setGenerationProgress(0);
    
    toast({
      title: "Generation Cancelled",
      description: "Content generation has been cancelled",
    });
  };

  const updateQualityIndicators = (indicators: any) => {
    // Handle updating quality indicators in the UI
    const currentContent = getCurrentSectionContent();
    if (!currentContent) return;
    
    setValidations(prev => ({
      ...prev,
      [currentContent.id]: {
        ...prev[currentContent.id],
        live_quality: indicators
      }
    }));
  };

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

  const handleContentReceived = (contentText: string, contentId: string) => {
    // Update local state with the received content
    const existingContentItems = [...contentItems];
    const contentIndex = existingContentItems.findIndex(item => item.id === contentId);
    
    if (contentIndex >= 0) {
      existingContentItems[contentIndex] = {
        ...existingContentItems[contentIndex],
        content_text: contentText,
        is_approved: false
      };
    } else {
      // This is a new content item
      const currentPrompt = getCurrentSectionPrompt();
      if (currentPrompt) {
        existingContentItems.push({
          id: contentId,
          prompt_id: currentPrompt.id,
          content_text: contentText,
          is_approved: false,
          metadata: {
            model: generationModel,
            style: generationStyle,
            generated_at: new Date().toISOString()
          }
        });
      }
    }
    
    setContentItems(existingContentItems);
    setActiveTab("content");
    setIsGenerating(false);
    setGenerationProgress(100);
    
    // Clear the generation messages
    setTimeout(() => {
      setGenerationMessages([]);
      setGenerationProgress(0);
    }, 1000);
  };

  const generateContent = async () => {
    const currentPrompt = getCurrentSectionPrompt();
    if (isGenerating || !currentPrompt || !projectId) return;

    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setGenerationCancelled(false);
      setGenerationMessages([]);
      
      // Setup WebSocket for real-time updates
      setupWebSocket(currentPrompt.id);
      
      // Fallback for progress animation if WebSocket fails
      const interval = window.setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 95) return 95;
          return prev + Math.random() * 3;
        });
      }, 800);
      
      setGenerationInterval(interval);
      
      // Notify the user
      toast({
        title: "Generating Content",
        description: `Creating content for "${sections[currentSectionIndex].title}" with Claude AI`,
      });
      
      // Call the edge function as a backup if WebSockets fail
      const { data: response, error } = await supabase.functions.invoke("generate-educational-content", {
        body: {
          promptId: currentPrompt.id,
          parameters: {
            model: generationModel,
            style: generationStyle,
            max_tokens: 4000,
            temperature: generationStyle === "creative" ? 0.9 : 
                         generationStyle === "conservative" ? 0.3 : 0.7
          }
        },
      });
      
      // Clear interval and set progress to 100% if WebSocket didn't complete
      clearInterval(interval);
      setGenerationInterval(null);
      
      if (error) throw error;
      
      if (!response.success || !response.content) {
        throw new Error(response.error || "Failed to generate content");
      }
      
      // If WebSocket failed to update content, update it here
      if (!generationCancelled) {
        // Check if content already exists
        const existingContent = contentItems.find((c) => c.prompt_id === currentPrompt.id);
        
        if (existingContent) {
          // Update local state
          setContentItems((prev) =>
            prev.map((c) =>
              c.id === existingContent.id ? { ...c, content_text: response.content, is_approved: false } : c
            )
          );
        } else if (response.contentId) {
          // Fetch the newly created content
          const { data: newContent, error: fetchError } = await supabase
            .from("content_items")
            .select("*")
            .eq("id", response.contentId)
            .single();
              
          if (fetchError) throw fetchError;
            
          // Update local state
          setContentItems((prev) => [...prev, newContent]);
        }
        
        // Switch tab to view content
        setActiveTab("content");
        
        toast({
          title: "Content Generated",
          description: "AI content has been successfully created with Claude",
        });
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "Failed to generate content: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      if (generationInterval) {
        clearInterval(generationInterval);
        setGenerationInterval(null);
      }
      setIsGenerating(false);
    }
  };

  const validateContent = async () => {
    const currentContent = getCurrentSectionContent();
    if (!currentContent || isValidating) return;
    
    try {
      setIsValidating(true);
      
      // Call the validate-educational-content edge function
      const { data: response, error } = await supabase.functions.invoke("validate-educational-content", {
        body: {
          contentId: currentContent.id,
        },
      });
      
      if (error) throw error;
      
      if (!response.success || !response.validation) {
        throw new Error(response.error || "Failed to validate content");
      }
      
      // Update local state with validation results
      setValidations((prev) => ({ ...prev, [currentContent.id]: { 
        ...response.validation,
        id: response.validationId
      }}));
      
      toast({
        title: "Content Validated",
        description: "Educational quality assessment complete",
      });
    } catch (error) {
      console.error("Error validating content:", error);
      toast({
        title: "Error",
        description: "Failed to validate content: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
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
  const currentValidation = currentContent ? validations[currentContent.id] : null;

  return (
    <ProjectStageLayout
      title="Content Generation"
      description="Generate and refine AI-created educational content with Claude"
      onNext={handleSubmit}
      isNextDisabled={!allContentApproved()}
      isLoading={isGenerating}
      loadingProgress={isGenerating ? generationProgress : undefined}
      loadingMessage={isGenerating ? "Generating educational content with Claude AI..." : undefined}
    >
      {/* AI Content Generation Tour */}
      <GuidedTour
        tourId="content_generation_tour"
        steps={AI_CONTENT_GENERATION_TOUR}
        autoStart={showTour}
        aiContext={true}
        theme="ai"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Section sidebar */}
        <div className="md:col-span-1">
          <ErrorBoundary>
            <SectionsList
              sections={sections}
              prompts={prompts}
              contentItems={contentItems}
              currentSectionIndex={currentSectionIndex}
              onSectionSelect={switchSection}
              getContentProgress={getContentProgress}
            />
            
            {/* Educational DNA Panel */}
            {projectConfig && (
              <EducationalDNAPanel 
                projectConfig={projectConfig} 
                className="mt-4 hidden md:block"
              />
            )}
          </ErrorBoundary>
        </div>
        
        {/* Content area */}
        <div className="md:col-span-3 space-y-4">
          <ErrorBoundary aiContext>
            {/* Generation Options */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <CardTitle>
                    {sections[currentSectionIndex]?.title || "Section Content"}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="live-quality"
                        checked={showLiveQuality}
                        onCheckedChange={setShowLiveQuality}
                      />
                      <Label htmlFor="live-quality" className="text-xs text-muted-foreground">
                        Live Quality
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="rich-editor"
                        checked={isEditingEnabled}
                        onCheckedChange={setIsEditingEnabled}
                      />
                      <Label htmlFor="rich-editor" className="text-xs text-muted-foreground">
                        Rich Editor
                      </Label>
                    </div>
                  </div>
                </div>
                <CardDescription>
                  {sections[currentSectionIndex]?.description || "Generate content for this section"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenerationOptions 
                  model={generationModel}
                  onModelChange={setGenerationModel}
                  style={generationStyle}
                  onStyleChange={setGenerationStyle}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className={isMobile ? "w-full grid-cols-2" : "grid grid-cols-2"}>
                    <TabsTrigger value="prompt" className={isMobile ? "text-xs py-1 px-2" : ""}>
                      Prompt
                      {currentPrompt?.is_approved && (
                        <Check className="h-3 w-3 ml-1 text-green-500" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="content" disabled={!currentContent} className={isMobile ? "text-xs py-1 px-2" : ""}>
                      Content
                      {currentContent?.is_approved && (
                        <Check className="h-3 w-3 ml-1 text-green-500" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} className="space-y-4">
                  <TabsContent value="prompt">
                    <PromptView
                      prompt={currentPrompt}
                      isGenerating={isGenerating}
                      generationProgress={generationProgress}
                      onGenerate={generateContent}
                      onCancel={cancelGeneration}
                    />
                    
                    {/* Real-time generation messages */}
                    {isGenerating && generationMessages.length > 0 && (
                      <div className="mt-4 border rounded-md p-4 bg-gray-50 overflow-y-auto max-h-[300px]">
                        <h4 className="text-sm font-medium mb-2">Generation Progress</h4>
                        <div className="space-y-2">
                          {generationMessages.map((message, index) => (
                            <div 
                              key={index}
                              className="text-sm text-gray-600 animate-fade-in"
                            >
                              {message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="content">
                    {currentContent ? (
                      <>
                        {showLiveQuality && currentValidation?.live_quality && (
                          <div className="mb-4">
                            <LiveQualityIndicators 
                              indicators={currentValidation.live_quality}
                            />
                          </div>
                        )}
                      
                        {isEditingEnabled ? (
                          <RichTextEditor
                            content={currentContent.content_text}
                            onUpdate={updateContent}
                            onRegenerateContent={generateContent}
                            onToggleApproval={toggleContentApproval}
                            onValidateContent={validateContent}
                            validation={currentValidation?.validation_data}
                            isValidating={isValidating}
                            isApproved={currentContent.is_approved}
                          />
                        ) : (
                          <ContentView 
                            content={currentContent}
                            onUpdateContent={updateContent}
                            onRegenerateContent={generateContent}
                            onToggleApproval={toggleContentApproval}
                            onValidateContent={validateContent}
                            validation={currentValidation?.validation_data}
                            isValidating={isValidating}
                          />
                        )}
                      </>
                    ) : (
                      <NoContentView onGoToPrompt={() => setActiveTab("prompt")} />
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
          </ErrorBoundary>
        </div>
      </div>
    </ProjectStageLayout>
  );
};

export default ContentGenerationStage;
