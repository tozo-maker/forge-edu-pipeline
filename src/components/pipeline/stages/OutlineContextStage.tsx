
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ProjectStageLayout from "@/components/pipeline/ProjectStageLayout";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import { OutlineStructure } from "@/types/pipeline";

const outlineSchema = z.object({
  summary: z.string().min(10, "Please provide a summary of at least 10 characters"),
  audience: z.string().min(5, "Please specify the audience"),
  learningGoals: z.string().min(10, "Please describe the learning goals"),
  keyTopics: z.array(z.string()),
});

const OutlineContextStage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, loading } = useProjects();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outlineData, setOutlineData] = useState<any>(null);
  const [newTopic, setNewTopic] = useState("");

  const project = projects.find(p => p.id === projectId);

  const form = useForm<z.infer<typeof outlineSchema>>({
    resolver: zodResolver(outlineSchema),
    defaultValues: {
      summary: "",
      audience: "",
      learningGoals: "",
      keyTopics: [],
    }
  });

  useEffect(() => {
    const fetchOutline = async () => {
      if (!projectId) return;

      try {
        const { data, error } = await supabase
          .from("outlines")
          .select("*")
          .eq("project_id", projectId)
          .single();

        if (error) {
          if (error.code !== "PGRST116") { // Not found error
            throw error;
          }
        }

        if (data) {
          setOutlineData(data);
          // Properly type cast the JSON structure field
          const structure = data.structure as Record<string, any>;
          form.reset({
            summary: structure.summary || "",
            audience: structure.audience || "",
            learningGoals: structure.learningGoals || "",
            keyTopics: Array.isArray(structure.keyTopics) ? structure.keyTopics : [],
          });
        }
      } catch (error) {
        console.error("Error fetching outline:", error);
        toast({
          title: "Error",
          description: "Failed to fetch outline data",
          variant: "destructive",
        });
      }
    };

    fetchOutline();
  }, [projectId, form, toast]);

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    
    const currentTopics = form.getValues("keyTopics") || [];
    form.setValue("keyTopics", [...currentTopics, newTopic]);
    setNewTopic("");
  };

  const handleRemoveTopic = (index: number) => {
    const currentTopics = form.getValues("keyTopics");
    form.setValue(
      "keyTopics",
      currentTopics.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (values: z.infer<typeof outlineSchema>): Promise<boolean> => {
    if (!projectId) return false;

    setIsSubmitting(true);

    try {
      const structureData: OutlineStructure = {
        summary: values.summary,
        audience: values.audience,
        learningGoals: values.learningGoals,
        keyTopics: values.keyTopics,
      };

      if (outlineData) {
        // Update existing outline
        await supabase
          .from("outlines")
          .update({
            structure: structureData,
            is_complete: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", outlineData.id);
      } else {
        // Create new outline
        await supabase
          .from("outlines")
          .insert({
            project_id: projectId,
            structure: structureData,
            is_complete: true,
          });
      }

      toast({
        title: "Success",
        description: "Outline has been saved",
      });

      return true;
    } catch (error) {
      console.error("Error saving outline:", error);
      toast({
        title: "Error",
        description: "Failed to save outline",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // The wrapper function that properly returns a Promise<boolean>
  const onNextWrapper = async (): Promise<boolean> => {
    try {
      return new Promise<boolean>((resolve) => {
        // Call handleSubmit with a function that will be executed when form is valid
        const onValid = async (data: z.infer<typeof outlineSchema>) => {
          const result = await handleSubmit(data);
          resolve(result);
        };
        
        // Call with a function that will be executed when form is invalid
        const onInvalid = () => {
          resolve(false);
        };
        
        // Execute the form validation and submission
        form.handleSubmit(onValid, onInvalid)();
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      return false;
    }
  };

  return (
    <ProjectStageLayout
      title="Outline Context"
      description="Define the structure and flow of your educational content"
      onNext={onNextWrapper}
      isLoading={isSubmitting}
    >
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Summary</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a brief overview of what this educational content will cover..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This summary will guide the overall structure of your content.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Who is this content designed for?"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Specify the learners who will engage with this content.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="learningGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Learning Goals</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What should learners achieve after engaging with this content?"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe the overall learning outcomes for this content.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keyTopics"
            render={() => (
              <FormItem>
                <FormLabel>Key Topics</FormLabel>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a key topic"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTopic}
                      disabled={!newTopic.trim()}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {form.getValues("keyTopics")?.length > 0 ? (
                      form.getValues("keyTopics").map((topic, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                        >
                          <span>{topic}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTopic(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No key topics added yet
                      </p>
                    )}
                  </div>
                </div>
                <FormDescription>
                  List the main topics that will be covered in this content.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ProjectStageLayout>
  );
};

export default OutlineContextStage;
