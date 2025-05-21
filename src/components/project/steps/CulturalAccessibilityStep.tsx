
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProjectWizardFormData } from "@/types/project";
import { useCulturalAccessibilityForm } from "./cultural-accessibility/useCulturalAccessibilityForm";
import LanguageComplexity from "./cultural-accessibility/LanguageComplexity";
import CulturalInclusion from "./cultural-accessibility/CulturalInclusion";
import AccessibilityNeeds from "./cultural-accessibility/AccessibilityNeeds";

type CulturalAccessibilityStepProps = {
  data: Partial<ProjectWizardFormData>;
  onNext: (data: Partial<ProjectWizardFormData>) => void;
  onBack: () => void;
};

const CulturalAccessibilityStep: React.FC<CulturalAccessibilityStepProps> = ({ 
  data, 
  onNext, 
  onBack 
}) => {
  const {
    form,
    selectedCulturalStrategies,
    selectedAccessibilityNeeds,
    toggleCulturalStrategy,
    toggleAccessibilityNeed,
  } = useCulturalAccessibilityForm(data);

  const handleSubmit = (values: any) => {
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

        <LanguageComplexity form={form} />

        <CulturalInclusion 
          form={form} 
          selectedStrategies={selectedCulturalStrategies}
          onToggleStrategy={toggleCulturalStrategy}
        />

        <AccessibilityNeeds
          form={form}
          selectedNeeds={selectedAccessibilityNeeds}
          onToggleNeed={toggleAccessibilityNeed}
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
