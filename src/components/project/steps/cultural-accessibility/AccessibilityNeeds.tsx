
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { ACCESSIBILITY_NEEDS } from "./constants";

interface AccessibilityNeedsProps {
  form: UseFormReturn<any>;
  selectedNeeds: string[];
  onToggleNeed: (need: string) => void;
}

const AccessibilityNeeds: React.FC<AccessibilityNeedsProps> = ({ 
  form, 
  selectedNeeds, 
  onToggleNeed 
}) => {
  return (
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
                variant={selectedNeeds.includes(need) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onToggleNeed(need)}
              >
                {need}
              </Badge>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AccessibilityNeeds;
