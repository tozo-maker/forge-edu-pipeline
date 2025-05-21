
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProjectWizardFormData } from "@/types/project";

// Schema for the cultural accessibility form
const culturalAccessibilitySchema = z.object({
  languageComplexity: z.enum(['simple', 'moderate', 'advanced']),
  culturalInclusion: z.array(z.string()).min(1, "Select at least one cultural inclusion strategy"),
  accessibilityNeeds: z.array(z.string()).optional(),
});

export type CulturalAccessibilityFormValues = z.infer<typeof culturalAccessibilitySchema>;

export const useCulturalAccessibilityForm = (data: Partial<ProjectWizardFormData>) => {
  // Initialize form with default values from data
  const form = useForm<CulturalAccessibilityFormValues>({
    resolver: zodResolver(culturalAccessibilitySchema),
    defaultValues: {
      languageComplexity: data.languageComplexity || 'moderate',
      culturalInclusion: data.culturalInclusion || [],
      accessibilityNeeds: data.accessibilityNeeds || [],
    },
  });

  // State for selected strategies and needs
  const [selectedCulturalStrategies, setSelectedCulturalStrategies] = useState<string[]>(
    data.culturalInclusion || []
  );
  const [selectedAccessibilityNeeds, setSelectedAccessibilityNeeds] = useState<string[]>(
    data.accessibilityNeeds || []
  );

  // Toggle functions
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

  return {
    form,
    selectedCulturalStrategies,
    selectedAccessibilityNeeds,
    toggleCulturalStrategy,
    toggleAccessibilityNeed,
  };
};
