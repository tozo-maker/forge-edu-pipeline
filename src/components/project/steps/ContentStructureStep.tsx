
import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectWizardFormData } from "@/types/project";
import SectionAdder from "./content-structure/SectionAdder";
import SectionsList from "./content-structure/SectionsList";
import { useContentSections } from "@/hooks/useContentSections";

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
  // Initialize form and default values
  const form = useForm<z.infer<typeof contentStructureSchema>>({
    resolver: zodResolver(contentStructureSchema),
    defaultValues: {
      organizationPattern: data.organizationPattern || 'sequential',
      contentSections: data.contentSections || [],
      estimatedDuration: data.estimatedDuration || "",
    },
  });

  // Initialize sections with defaults
  const initialSections = data.contentSections?.map(section => ({
    title: section.title || "Untitled Section",
    description: section.description || "",
    sequence: section.sequence || 0
  })) || [];
  
  // Use our custom hook to manage sections state
  const { 
    sections, 
    newSectionTitle, 
    newSectionDescription, 
    setNewSectionTitle, 
    setNewSectionDescription, 
    addSection, 
    removeSection, 
    moveSection 
  } = useContentSections(initialSections, form);

  const handleSubmit = (values: z.infer<typeof contentStructureSchema>) => {
    // Ensure that the contentSections match required structure when submitting
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
          
          <SectionAdder 
            title={newSectionTitle}
            description={newSectionDescription}
            onTitleChange={setNewSectionTitle}
            onDescriptionChange={setNewSectionDescription}
            onAddSection={addSection}
          />

          <SectionsList 
            sections={sections}
            form={form}
            onRemoveSection={removeSection}
            onMoveSection={moveSection}
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
