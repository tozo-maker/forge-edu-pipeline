
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
import { CULTURAL_INCLUSION_STRATEGIES } from "./constants";

interface CulturalInclusionProps {
  form: UseFormReturn<any>;
  selectedStrategies: string[];
  onToggleStrategy: (strategy: string) => void;
}

const CulturalInclusion: React.FC<CulturalInclusionProps> = ({ 
  form, 
  selectedStrategies, 
  onToggleStrategy 
}) => {
  return (
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
                variant={selectedStrategies.includes(strategy) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onToggleStrategy(strategy)}
              >
                {strategy}
              </Badge>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CulturalInclusion;
