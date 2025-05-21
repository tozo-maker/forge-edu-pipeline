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
import { ProjectWizardFormData } from "@/types/project";

const projectTypeFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  projectType: z.enum(['lesson_plan', 'course_module', 'assessment', 'activity', 'curriculum']),
});

type ProjectTypeStepProps = {
  data: Partial<ProjectWizardFormData>;
  onNext: (data: Partial<ProjectWizardFormData>) => void;
};

const PROJECT_TYPES = [
  { value: 'lesson_plan', label: 'Lesson Plan' },
  { value: 'course_module', label: 'Course Module' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'activity', label: 'Learning Activity' },
  { value: 'curriculum', label: 'Full Curriculum' },
];

const ProjectTypeStep: React.FC<ProjectTypeStepProps> = ({ data, onNext }) => {
  const form = useForm<z.infer<typeof projectTypeFormSchema>>({
    resolver: zodResolver(projectTypeFormSchema),
    defaultValues: {
      title: data.title || "",
      description: data.description || "",
      projectType: data.projectType || "lesson_plan",
    },
  });

  const handleSubmit = (values: z.infer<typeof projectTypeFormSchema>) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
          <p className="text-sm text-gray-500">
            Start by providing basic information about your educational content
          </p>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Photosynthesis Lesson" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Briefly describe the purpose and goals of your content..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectTypeStep;
