import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ProjectStageLayout from "@/components/pipeline/ProjectStageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, ChevronUp, ChevronDown, Loader2, BookOpen } from "lucide-react";

// Schema for a single section
const sectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  description: z.string().min(1, "Section description is required"),
  learningObjectives: z.array(z.string()),
  activityTypes: z.array(z.string()),
  resources: z.array(z.string()),
  notes: z.string().optional(),
});

const SectionDetailsStage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [outline, setOutline] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");
  const [newItem, setNewItem] = useState("");

  // Form for the current section
  const form = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      description: "",
      learningObjectives: [],
      activityTypes: [],
      resources: [],
      notes: "",
    },
  });

  // Fetch outline and sections data
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        // Fetch outline first
        const { data: outlineData, error: outlineError } = await supabase
          .from("outlines")
          .select("*")
          .eq("project_id", projectId)
          .single();

        if (outlineError) throw outlineError;
        setOutline(outlineData);

        // Then fetch sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from("sections")
          .select("*")
          .eq("outline_id", outlineData.id)
          .order("order_index", { ascending: true });

        if (sectionsError) throw sectionsError;

        if (sectionsData.length > 0) {
          setSections(sectionsData);
          loadSectionForm(sectionsData[0], 0);
        } else {
          // Create initial sections based on key topics from outline
          // Properly type cast the structure field as a Record
          const structure = outlineData.structure as Record<string, any>;
          const keyTopics = structure.keyTopics || [];
          const initialSections = keyTopics.map((topic: string, index: number) => ({
            title: topic,
            description: "",
            order_index: index + 1,
            outline_id: outlineData.id,
            config: {
              learningObjectives: [],
              activityTypes: [],
              resources: [],
              notes: "",
            },
          }));

          if (initialSections.length > 0) {
            // Insert all sections at once
            const { data: newSections, error: insertError } = await supabase
              .from("sections")
              .insert(initialSections)
              .select();

            if (insertError) throw insertError;
            setSections(newSections);
            
            if (newSections && newSections.length > 0) {
              loadSectionForm(newSections[0], 0);
            }
          } else {
            // If no key topics, create one empty section
            const { data: newSection, error: insertError } = await supabase
              .from("sections")
              .insert({
                title: "New Section",
                description: "",
                order_index: 1,
                outline_id: outlineData.id,
                config: {
                  learningObjectives: [],
                  activityTypes: [],
                  resources: [],
                  notes: "",
                },
              })
              .select()
              .single();

            if (insertError) throw insertError;
            setSections([newSection]);
            loadSectionForm(newSection, 0);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load section data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, toast]);

  // Load a section into the form
  const loadSectionForm = (section: any, index: number) => {
    setCurrentSectionIndex(index);
    
    form.reset({
      title: section.title || "",
      description: section.description || "",
      learningObjectives: section.config?.learningObjectives || [],
      activityTypes: section.config?.activityTypes || [],
      resources: section.config?.resources || [],
      notes: section.config?.notes || "",
    });
  };

  // Save the current section
  const saveCurrentSection = async () => {
    try {
      const values = form.getValues();
      const currentSection = sections[currentSectionIndex];
      
      await supabase
        .from("sections")
        .update({
          title: values.title,
          description: values.description,
          config: {
            learningObjectives: values.learningObjectives,
            activityTypes: values.activityTypes,
            resources: values.resources,
            notes: values.notes,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSection.id);
      
      // Update the local state
      const updatedSections = [...sections];
      updatedSections[currentSectionIndex] = {
        ...currentSection,
        title: values.title,
        description: values.description,
        config: {
          learningObjectives: values.learningObjectives,
          activityTypes: values.activityTypes,
          resources: values.resources,
          notes: values.notes,
        },
      };
      
      setSections(updatedSections);
      
      toast({
        title: "Section Saved",
        description: `${values.title} has been updated`,
      });
      
      return true;
    } catch (error) {
      console.error("Error saving section:", error);
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive",
      });
      return false;
    }
  };

  // Switch to a different section
  const switchSection = async (index: number) => {
    // Save current section first
    await saveCurrentSection();
    
    // Then load the new section
    loadSectionForm(sections[index], index);
  };

  // Add a new section
  const addNewSection = async () => {
    if (!outline) return;
    
    try {
      const newOrderIndex = sections.length > 0 
        ? Math.max(...sections.map(s => s.order_index)) + 1 
        : 1;
      
      const { data: newSection, error } = await supabase
        .from("sections")
        .insert({
          title: "New Section",
          description: "",
          order_index: newOrderIndex,
          outline_id: outline.id,
          config: {
            learningObjectives: [],
            activityTypes: [],
            resources: [],
            notes: "",
          },
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Save current section first
      await saveCurrentSection();
      
      // Update sections and switch to new one
      setSections([...sections, newSection]);
      loadSectionForm(newSection, sections.length);
      
      toast({
        title: "Section Added",
        description: "New section has been created",
      });
    } catch (error) {
      console.error("Error adding section:", error);
      toast({
        title: "Error",
        description: "Failed to add new section",
        variant: "destructive",
      });
    }
  };

  // Move a section up or down
  const moveSection = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }
    
    try {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      
      // Save current section first
      await saveCurrentSection();
      
      // Swap order indices
      const updatedSections = [...sections];
      const temp = updatedSections[index].order_index;
      updatedSections[index].order_index = updatedSections[newIndex].order_index;
      updatedSections[newIndex].order_index = temp;
      
      // Update in database
      const updates = [
        supabase
          .from("sections")
          .update({ order_index: updatedSections[index].order_index })
          .eq("id", updatedSections[index].id),
        supabase
          .from("sections")
          .update({ order_index: updatedSections[newIndex].order_index })
          .eq("id", updatedSections[newIndex].id),
      ];
      
      await Promise.all(updates);
      
      // Sort sections by order_index
      updatedSections.sort((a, b) => a.order_index - b.order_index);
      setSections(updatedSections);
      
      // Update current section index
      setCurrentSectionIndex(updatedSections.findIndex(s => s.id === sections[index].id));
    } catch (error) {
      console.error("Error reordering sections:", error);
      toast({
        title: "Error",
        description: "Failed to reorder sections",
        variant: "destructive",
      });
    }
  };

  // Handle array items (objectives, activities, resources)
  const addArrayItem = (field: "learningObjectives" | "activityTypes" | "resources") => {
    if (!newItem.trim()) return;
    
    const currentItems = form.getValues(field) || [];
    form.setValue(field, [...currentItems, newItem]);
    setNewItem("");
  };
  
  const removeArrayItem = (field: "learningObjectives" | "activityTypes" | "resources", index: number) => {
    const currentItems = form.getValues(field);
    form.setValue(
      field,
      currentItems.filter((_, i) => i !== index)
    );
  };

  // Handle final submission
  const handleSubmit = async () => {
    // First save the current section
    const saved = await saveCurrentSection();
    if (!saved) return false;
    
    try {
      setIsSaving(true);
      
      // Mark all sections as complete
      await supabase
        .from("sections")
        .update({ is_complete: true })
        .eq("outline_id", outline.id);
      
      return true;
    } catch (error) {
      console.error("Error finalizing sections:", error);
      toast({
        title: "Error",
        description: "Failed to finalize sections",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProjectStageLayout
        title="Section Details"
        description="Loading section data..."
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
      title="Section Details"
      description="Define the content and requirements for each section of your educational content"
      onNext={handleSubmit}
      isLoading={isSaving}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sections sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">Sections</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-3">
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      index === currentSectionIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    }`}
                    onClick={() => switchSection(index)}
                  >
                    <div className="truncate flex-1">
                      <span className="mr-1 font-medium">{index + 1}.</span>
                      {section.title || "Untitled Section"}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(index, "up");
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(index, "down");
                        }}
                        disabled={index === sections.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={addNewSection}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Section form */}
        <div className="md:col-span-3">
          <Form {...form}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Section {currentSectionIndex + 1}: {form.watch("title") || "Untitled Section"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="learning">Learning</TabsTrigger>
                        <TabsTrigger value="activities">Activities</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter section title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe what this section covers"
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any additional context or notes"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Include any special instructions or context for this section.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <TabsContent value="learning" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="learningObjectives"
                          render={() => (
                            <FormItem>
                              <FormLabel>Learning Objectives</FormLabel>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add a learning objective"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => addArrayItem("learningObjectives")}
                                    disabled={!newItem.trim()}
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  {form.getValues("learningObjectives")?.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                                    >
                                      <span>{item}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeArrayItem("learningObjectives", index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  
                                  {form.getValues("learningObjectives")?.length === 0 && (
                                    <p className="text-sm text-gray-500 italic">
                                      No learning objectives added yet
                                    </p>
                                  )}
                                </div>
                              </div>
                              <FormDescription>
                                What learners should know or be able to do after this section.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <TabsContent value="activities" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="activityTypes"
                          render={() => (
                            <FormItem>
                              <FormLabel>Activity Types</FormLabel>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add an activity type"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => addArrayItem("activityTypes")}
                                    disabled={!newItem.trim()}
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  {form.getValues("activityTypes")?.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                                    >
                                      <span>{item}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeArrayItem("activityTypes", index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  
                                  {form.getValues("activityTypes")?.length === 0 && (
                                    <p className="text-sm text-gray-500 italic">
                                      No activity types added yet
                                    </p>
                                  )}
                                </div>
                              </div>
                              <FormDescription>
                                Types of activities to include (e.g., discussion, simulation, etc.)
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <TabsContent value="resources" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="resources"
                          render={() => (
                            <FormItem>
                              <FormLabel>Teaching Resources</FormLabel>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add a resource"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => addArrayItem("resources")}
                                    disabled={!newItem.trim()}
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  {form.getValues("resources")?.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                                    >
                                      <span>{item}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeArrayItem("resources", index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  
                                  {form.getValues("resources")?.length === 0 && (
                                    <p className="text-sm text-gray-500 italic">
                                      No resources added yet
                                    </p>
                                  )}
                                </div>
                              </div>
                              <FormDescription>
                                Materials, media, or tools needed for this section.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button
                      type="button"
                      onClick={() => saveCurrentSection()}
                      className="ml-auto"
                    >
                      Save Section
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </ProjectStageLayout>
  );
};

export default SectionDetailsStage;
