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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectWizardFormData } from "@/types/project";

const contentStructureSchema = z.object({
  organizationPattern: z.enum(['sequential', 'hierarchical', 'modular']),
  contentSections: z.array(
    z.object({
      title: z.string().min(1, "Section title is required"),
      description: z.string().optional(),
      sequence: z.number()
    })
  ).min(1, "At least one content section is required"),
  estimatedDuration: z.string().min(1, "Estimated duration is required"),
});

type ContentSection = {
  title: string;
  description: string;
  sequence: number;
};

type ContentStructureStepProps = {
  data: Partial<ProjectWizardFormData>;
  onNext: (data: Partial<ProjectWizardFormData>) => void;
  onBack: () => void;
};

const ORGANIZATION_PATTERNS = [
  { 
    value: 'sequential',
    label: 'Sequential', 
    description: 'Linear progression through content where each section builds on the previous'
  },
  { 
    value: 'hierarchical',
    label: 'Hierarchical', 
    description: 'Content organized by main concepts with supporting details in a tree structure'
  },
  { 
    value: 'modular',
    label: 'Modular', 
    description: 'Self-contained units that can be explored in different orders'
  }
];

const ContentStructureStep: React.FC<ContentStructureStepProps> = ({ 
  data, 
  onNext, 
  onBack 
}) => {
  // Make sure to provide definitive values for all required properties
  const [sections, setSections] = useState<ContentSection[]>(
    data.contentSections?.map(section => ({
      title: section.title || "Untitled Section", // Default value instead of empty string
      description: section.description || "",
      sequence: section.sequence || 0
    })) || []
  );
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");

  const form = useForm<z.infer<typeof contentStructureSchema>>({
    resolver: zodResolver(contentStructureSchema),
    defaultValues: {
      organizationPattern: data.organizationPattern || 'sequential',
      contentSections: sections,
      estimatedDuration: data.estimatedDuration || "",
    },
  });

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const newSection: ContentSection = {
      title: newSectionTitle,
      description: newSectionDescription,
      sequence: sections.length + 1
    };
    
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    form.setValue("contentSections", updatedSections);
    setNewSectionTitle("");
    setNewSectionDescription("");
  };

  const removeSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index).map((section, idx) => ({
      ...section,
      sequence: idx + 1
    }));
    setSections(updatedSections);
    form.setValue("contentSections", updatedSections);
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    
    const updatedSections = [...sections];
    const [removed] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, removed);
    
    // Update sequence numbers
    const reorderedSections = updatedSections.map((section, idx) => ({
      ...section,
      sequence: idx + 1
    }));
    
    setSections(reorderedSections);
    form.setValue("contentSections", reorderedSections);
  };

  const handleSubmit = (values: z.infer<typeof contentStructureSchema>) => {
    // Here we ensure that the contentSections match required structure when submitting
    const validSections = values.contentSections.map(section => ({
      title: section.title || "Untitled Section",
      description: section.description || "",
      sequence: section.sequence
    }));
    
    onNext({
      organizationPattern: values.organizationPattern,
      contentSections: validSections,
      estimatedDuration: values.estimatedDuration,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Content Structure</h2>
          <p className="text-sm text-gray-500">
            Define how your educational content will be organized
          </p>
        </div>

        <FormField
          control={form.control}
          name="organizationPattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Pattern</FormLabel>
              <FormDescription>
                Choose how your content will be structured
              </FormDescription>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization pattern" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ORGANIZATION_PATTERNS.map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      <div>
                        <span className="font-medium">{pattern.label}</span>
                        <p className="text-xs text-muted-foreground">{pattern.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Content Sections</FormLabel>
          <FormDescription>
            Define the main sections or modules of your content
          </FormDescription>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Section title"
                />
              </div>
              <div>
                <Button
                  type="button"
                  onClick={addSection}
                  variant="outline"
                  className="w-full"
                  disabled={!newSectionTitle.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </div>
            
            <Textarea
              value={newSectionDescription}
              onChange={(e) => setNewSectionDescription(e.target.value)}
              placeholder="Section description (optional)"
              className="min-h-[80px]"
            />
          </div>

          <FormField
            control={form.control}
            name="contentSections"
            render={() => (
              <FormItem>
                <div className="space-y-3">
                  {sections.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No sections added yet</p>
                  ) : (
                    sections.map((section, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <div className="flex items-center h-full py-2 cursor-move">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium flex items-center">
                                  <span className="inline-block bg-gray-100 text-gray-700 w-6 h-6 rounded-full text-xs flex items-center justify-center mr-2">
                                    {section.sequence}
                                  </span>
                                  {section.title}
                                </h4>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveSection(index, index - 1)}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveSection(index, index + 1)}
                                    disabled={index === sections.length - 1}
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSection(index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {section.description && (
                                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="estimatedDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Duration</FormLabel>
              <FormDescription>
                Specify how long this content will take to complete
              </FormDescription>
              <FormControl>
                <Input placeholder="e.g., 45 minutes, 3 hours, 2 weeks" {...field} />
              </FormControl>
              <FormMessage />
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

export default ContentStructureStep;
