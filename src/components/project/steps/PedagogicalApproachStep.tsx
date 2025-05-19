
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProjectWizardFormData } from "@/pages/ProjectWizard";

const pedagogicalApproachSchema = z.object({
  teachingMethodology: z.array(z.string()).min(1, "Select at least one teaching methodology"),
  assessmentPhilosophy: z.string().min(3, "Assessment philosophy is required"),
  differentiationStrategies: z.array(z.string()).min(1, "Select at least one differentiation strategy"),
});

const TEACHING_METHODOLOGIES = [
  "Inquiry-Based Learning",
  "Project-Based Learning",
  "Direct Instruction",
  "Flipped Classroom",
  "Cooperative Learning",
  "Socratic Method",
  "Experiential Learning",
  "Game-Based Learning",
  "Mastery Learning",
  "Personalized Learning"
];

const DIFFERENTIATION_STRATEGIES = [
  "Content Differentiation",
  "Process Differentiation", 
  "Product Differentiation",
  "Learning Environment",
  "Multiple Intelligences",
  "Flexible Grouping",
  "Tiered Assignments",
  "Learning Centers",
  "Choice Boards",
  "Scaffolded Instruction"
];

type PedagogicalApproachStepProps = {
  data: Partial<ProjectWizardFormData>;
  onNext: (data: Partial<ProjectWizardFormData>) => void;
  onBack: () => void;
};

const PedagogicalApproachStep: React.FC<PedagogicalApproachStepProps> = ({ 
  data, 
  onNext, 
  onBack 
}) => {
  const form = useForm<z.infer<typeof pedagogicalApproachSchema>>({
    resolver: zodResolver(pedagogicalApproachSchema),
    defaultValues: {
      teachingMethodology: data.teachingMethodology || [],
      assessmentPhilosophy: data.assessmentPhilosophy || "",
      differentiationStrategies: data.differentiationStrategies || [],
    },
  });

  const [selectedMethodologies, setSelectedMethodologies] = React.useState<string[]>(
    data.teachingMethodology || []
  );
  const [selectedStrategies, setSelectedStrategies] = React.useState<string[]>(
    data.differentiationStrategies || []
  );

  const toggleMethodology = (methodology: string) => {
    const updated = selectedMethodologies.includes(methodology)
      ? selectedMethodologies.filter(m => m !== methodology)
      : [...selectedMethodologies, methodology];
    
    setSelectedMethodologies(updated);
    form.setValue("teachingMethodology", updated);
  };

  const toggleStrategy = (strategy: string) => {
    const updated = selectedStrategies.includes(strategy)
      ? selectedStrategies.filter(s => s !== strategy)
      : [...selectedStrategies, strategy];
    
    setSelectedStrategies(updated);
    form.setValue("differentiationStrategies", updated);
  };

  const handleSubmit = (values: z.infer<typeof pedagogicalApproachSchema>) => {
    onNext({
      teachingMethodology: values.teachingMethodology,
      assessmentPhilosophy: values.assessmentPhilosophy,
      differentiationStrategies: values.differentiationStrategies,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Pedagogical Approach</h2>
          <p className="text-sm text-gray-500">
            Define your teaching and assessment philosophy for this content
          </p>
        </div>

        <FormField
          control={form.control}
          name="teachingMethodology"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teaching Methodologies</FormLabel>
              <FormDescription>
                Select the teaching approaches that will be used in this content
              </FormDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {TEACHING_METHODOLOGIES.map((methodology) => (
                  <Badge 
                    key={methodology} 
                    variant={selectedMethodologies.includes(methodology) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMethodology(methodology)}
                  >
                    {methodology}
                  </Badge>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assessmentPhilosophy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assessment Philosophy</FormLabel>
              <FormDescription>
                Describe your approach to assessing student learning in this content
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., This content will use formative assessments throughout to gauge understanding..."
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
          name="differentiationStrategies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Differentiation Strategies</FormLabel>
              <FormDescription>
                Select strategies to accommodate diverse learners
              </FormDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {DIFFERENTIATION_STRATEGIES.map((strategy) => (
                  <Badge 
                    key={strategy} 
                    variant={selectedStrategies.includes(strategy) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStrategy(strategy)}
                  >
                    {strategy}
                  </Badge>
                ))}
              </div>
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

export default PedagogicalApproachStep;
