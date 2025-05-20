
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProjectStageLayout from "@/components/pipeline/ProjectStageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Check, RefreshCw, AlertCircle } from "lucide-react";

const ClaudePromptsStage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [outlineData, setOutlineData] = useState<any>(null);
  const [projectConfig, setProjectConfig] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        // Fetch project configuration
        const { data: projectConfigData, error: configError } = await supabase
          .from("project_configs")
          .select("*")
          .eq("project_id", projectId)
          .single();

        if (configError && configError.code !== "PGRST116") throw configError;
        setProjectConfig(projectConfigData);

        // Fetch outline
        const { data: outline, error: outlineError } = await supabase
          .from("outlines")
          .select("*")
          .eq("project_id", projectId)
          .single();

        if (outlineError) throw outlineError;
        setOutlineData(outline);

        // Fetch sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from("sections")
          .select("*")
          .eq("outline_id", outline.id)
          .order("order_index", { ascending: true });

        if (sectionsError) throw sectionsError;
        setSections(sectionsData);

        // Fetch existing prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from("prompts")
          .select("*")
          .in(
            "section_id",
            sectionsData.map((s) => s.id)
          );

        if (promptsError) throw promptsError;

        if (promptsData.length > 0) {
          setPrompts(promptsData);
        } else {
          // Initialize empty prompts
          const initialPrompts = sectionsData.map((section) => ({
            section_id: section.id,
            prompt_text: "",
            parameters: {},
            is_generated: false,
            is_approved: false,
          }));

          setPrompts(initialPrompts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load prompt data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, toast]);

  const generatePrompts = async () => {
    if (isGenerating || !projectId) return;

    try {
      setIsGenerating(true);

      toast({
        title: "Generating Prompts",
        description: "Starting to generate Claude AI prompts...",
      });

      // Process each section to generate its prompt
      for (const section of sections) {
        try {
          // Call the edge function to synthesize prompt
          const { data: response, error } = await supabase.functions.invoke("synthesize-education-prompt", {
            body: {
              projectId,
              sectionId: section.id,
            },
          });

          if (error) throw error;
          
          if (response.success && response.prompt) {
            // If successful, update the prompt in local state
            setPrompts((prev) =>
              prev.map((p) =>
                p.section_id === section.id
                  ? { 
                      ...p, 
                      prompt_text: response.prompt, 
                      parameters: response.parameters,
                      is_generated: true,
                      id: response.promptId || p.id 
                    }
                  : p
              )
            );
          } else {
            console.error("Error synthesizing prompt for section:", section.id);
          }
        } catch (sectionError) {
          console.error("Error processing section:", section.id, sectionError);
          // Continue with next section even if this one fails
        }
        
        // Small delay between sections to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Refresh prompts data from database
      const { data: refreshedPrompts, error: refreshError } = await supabase
        .from("prompts")
        .select("*")
        .in(
          "section_id",
          sections.map((s) => s.id)
        );

      if (refreshError) throw refreshError;
      
      if (refreshedPrompts && refreshedPrompts.length > 0) {
        setPrompts(refreshedPrompts);
      }

      toast({
        title: "Success",
        description: "AI prompts generated successfully",
      });
    } catch (error) {
      console.error("Error generating prompts:", error);
      toast({
        title: "Error",
        description: "Failed to generate prompts: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePrompt = async (promptId: string, newText: string) => {
    try {
      await supabase
        .from("prompts")
        .update({
          prompt_text: newText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", promptId);

      // Update local state
      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? { ...p, prompt_text: newText } : p))
      );

      toast({
        title: "Prompt Updated",
        description: "Changes saved successfully",
      });
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to update prompt",
        variant: "destructive",
      });
    }
  };

  const togglePromptApproval = async (promptId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from("prompts")
        .update({
          is_approved: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", promptId);

      // Update local state
      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? { ...p, is_approved: !currentStatus } : p))
      );

      toast({
        title: currentStatus ? "Prompt Unapproved" : "Prompt Approved",
        description: currentStatus ? "Prompt needs further review" : "Prompt ready for content generation",
      });
    } catch (error) {
      console.error("Error updating prompt approval:", error);
      toast({
        title: "Error",
        description: "Failed to update prompt approval status",
        variant: "destructive",
      });
    }
  };

  const allPromptsApproved = () => {
    return prompts.length > 0 && prompts.every((p) => p.is_approved);
  };

  const handleSubmit = async () => {
    // Check if all prompts are approved
    if (!allPromptsApproved()) {
      toast({
        title: "Cannot Proceed",
        description: "All prompts must be approved before continuing",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const getSectionTitle = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.title || "Unknown Section";
  };

  if (isLoading) {
    return (
      <ProjectStageLayout
        title="Claude Prompts"
        description="Loading prompt data..."
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
      title="Claude Prompts"
      description="Review and customize AI prompts that will be used to generate your content"
      onNext={handleSubmit}
      isNextDisabled={!allPromptsApproved()}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Content Generation Prompts</h2>
            <p className="text-sm text-gray-500">
              These prompts will instruct Claude AI to generate educational content based on your project specifications
            </p>
          </div>
          <Button
            onClick={generatePrompts}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {prompts.some((p) => p.is_generated)
              ? "Regenerate Prompts"
              : "Generate Prompts"}
          </Button>
        </div>

        {prompts.length > 0 ? (
          <div className="space-y-6">
            {prompts.map((prompt, index) => (
              <Card key={prompt.id || index}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {getSectionTitle(prompt.section_id)}
                    </CardTitle>
                    <div className="flex gap-2">
                      {prompt.is_generated && (
                        <Badge variant="outline" className="bg-blue-50">
                          AI-Generated
                        </Badge>
                      )}
                      {prompt.is_approved ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                          Needs Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Prompt for section {index + 1} content generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompt.prompt_text}
                    onChange={(e) => {
                      // Only update local state, we'll save on blur
                      const updatedPrompts = [...prompts];
                      updatedPrompts[index].prompt_text = e.target.value;
                      updatedPrompts[index].is_approved = false; // Unapprove when edited
                      setPrompts(updatedPrompts);
                    }}
                    onBlur={() => {
                      if (prompt.id) {
                        updatePrompt(prompt.id, prompt.prompt_text);
                      }
                    }}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Enter or generate prompt for Claude AI..."
                  />
                </CardContent>
                <CardFooter className="justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (prompt.id) {
                        const newText = `Create educational content for section "${getSectionTitle(prompt.section_id)}".

Key points to include:
- Content aligned with grade-level standards
- Engaging activities for students
- Clear explanations of concepts
- Assessment opportunities

Please create content that follows best pedagogical practices and addresses diverse learning needs.`;
                        
                        updatePrompt(prompt.id, newText);
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    variant={prompt.is_approved ? "outline" : "default"}
                    size="sm"
                    onClick={() => {
                      if (prompt.id) {
                        togglePromptApproval(prompt.id, prompt.is_approved);
                      }
                    }}
                  >
                    {prompt.is_approved ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Unapprove
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">
              No prompts available. Click "Generate Prompts" to create AI prompts based on your project specifications.
            </p>
          </div>
        )}
        
        {prompts.length > 0 && !allPromptsApproved() && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">All prompts must be approved</p>
                <p>
                  Review and approve each prompt before proceeding to content generation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProjectStageLayout>
  );
};

export default ClaudePromptsStage;
