
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { LANGUAGE_COMPLEXITY } from "./constants";

interface LanguageComplexityProps {
  form: UseFormReturn<any>;
}

const LanguageComplexity: React.FC<LanguageComplexityProps> = ({ form }) => {
  return (
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
  );
};

export default LanguageComplexity;
