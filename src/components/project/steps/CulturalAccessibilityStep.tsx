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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectWizardFormData } from "@/types/project";

const culturalAccessibilitySchema = z.object({
  languageComplexity: z.enum(['simple', 'moderate', 'advanced']),
  culturalInclusion: z.array(z.string()).min(1, "Select at least one cultural inclusion strategy"),
  accessibilityNeeds: z.array(z.string()).optional(),
});

type CulturalAccessibilityStepProps = {
  data: Partial<ProjectWizardFormData>;
  onNext: (data: Partial<ProjectWizardFormData>) => void;
  onBack: () => void;
};

const LANGUAGE_COMPLEXITY = [
  { value: 'simple', label: 'Simple', description: 'Basic vocabulary, short sentences, concrete concepts' },
  { value: 'moderate', label: 'Moderate', description: 'Grade-appropriate vocabulary, varied sentence structures' },
  { value: 'advanced', label: 'Advanced', description: 'Complex vocabulary, academic language, abstract concepts' }
];

const CULTURAL_INCLUSION_STRATEGIES = [
  "Diverse Perspectives",
  "Cultural References",
  "Global Viewpoints",
  "Inclusive Language",
  "Representation in Examples",
  "Multiple Cultural Contexts",
  "Indigenous Knowledge",
  "Cultural Sensitivity",
  "Anti-Bias Framework"
];

const ACCESSIBILITY_NEEDS = [
  "Screen Reader Optimization",
  "Visual Impairment Support",
  "Hearing Impairment Support",
  "Motor Skill Accommodation",
  "Reading Difficulty Support",
  "ADHD/Focus Support",
  "English Language Learners",
  "Text-to-Speech Friendly",
  "Alternative Assessment Options"
];

const CulturalAccessibilityStep: React.FC<CulturalAccessibilityStepProps> = ({ 
  data, 
  onNext, 
  onBack 
}) => {
  const form = useForm<z.infer<typeof culturalAccessibilitySchema>>({
    resolver: zodResolver(culturalAccessibilitySchema),
    defaultValues: {
      languageComplexity: data.languageComplexity || 'moderate',
      culturalInclusion: data.culturalInclusion || [],
      accessibilityNeeds: data.accessibilityNeeds || [],
    },
  });

  const [selectedCulturalStrategies, setSelectedCulturalStrategies] = React.useState<string[]>(
    data.culturalInclusion || []
  );
  const [selectedAccessibilityNeeds, setSelectedAccessibilityNeeds] = React.useState<string[]>(
    data.accessibilityNeeds || []
  );

  const toggleCulturalStrategy = (strategy: string) => {
    const updated = selectedCulturalStrategies.includes(strategy)
      ? selectedCulturalStrategies.filter(s => s !== strategy)
      : [...selectedCulturalStrategies, strategy];
    
    setSelectedCulturalStrategies(updated);
    form.setValue("culturalInclusion", updated);
  };

  const toggleAccessibilityNeed = (need: string) => {
    const updated = selectedAccessibilityNeeds.includes(need)
      ? selectedAccessibilityNeeds.filter(n => n !== need)
      : [...selectedAccessibilityNeeds, need];
    
    setSelectedAccessibilityNeeds(updated);
    form.setValue("accessibilityNeeds", updated);
  };

  const handleSubmit = (values: z.infer<typeof culturalAccessibilitySchema>) => {
    onNext({
      languageComplexity: values.languageComplexity,
      culturalInclusion: values.culturalInclusion,
      accessibilityNeeds: values.accessibilityNeeds || [],
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Cultural & Accessibility</h2>
          <p className="text-sm text-gray-500">
            Configure language complexity, cultural inclusion, and accessibility options
          </p>
        </div>

        <FormField
          control={form.control}
          name="languageComplexity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language Complexity</FormLabel>
              <FormDescription>
                Select the appropriate language complexity level for your content
              </FormDescription>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language complexity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LANGUAGE_COMPLEXITY.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label} - <span className="text-gray-500 text-xs">{level.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="culturalInclusion"
          render={() => (
            <FormItem>
              <FormLabel>Cultural Inclusion Strategies</FormLabel>
              <FormDescription>
                Select strategies to make your content culturally inclusive
              </FormDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {CULTURAL_INCLUSION_STRATEGIES.map((strategy) => (
                  <Badge 
                    key={strategy} 
                    variant={selectedCulturalStrategies.includes(strategy) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCulturalStrategy(strategy)}
                  >
                    {strategy}
                  </Badge>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accessibilityNeeds"
          render={() => (
            <FormItem>
              <FormLabel>Accessibility Needs</FormLabel>
              <FormDescription>
                Select accommodations for diverse learner needs (optional)
              </FormDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {ACCESSIBILITY_NEEDS.map((need) => (
                  <Badge 
                    key={need} 
                    variant={selectedAccessibilityNeeds.includes(need) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleAccessibilityNeed(need)}
                  >
                    {need}
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

export default CulturalAccessibilityStep;
