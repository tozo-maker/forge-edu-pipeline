
import React from "react";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import SectionItem from "./SectionItem";
import { z } from "zod";

type ContentSection = {
  title: string;
  description: string;
  sequence: number;
};

type SectionsListProps = {
  sections: ContentSection[];
  form: UseFormReturn<any>;
  onRemoveSection: (index: number) => void;
  onMoveSection: (fromIndex: number, toIndex: number) => void;
};

const SectionsList: React.FC<SectionsListProps> = ({
  sections,
  form,
  onRemoveSection,
  onMoveSection,
}) => {
  return (
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
                <SectionItem
                  key={index}
                  section={section}
                  index={index}
                  isLast={index === sections.length - 1}
                  onRemove={onRemoveSection}
                  onMoveUp={(idx) => onMoveSection(idx, idx - 1)}
                  onMoveDown={(idx) => onMoveSection(idx, idx + 1)}
                />
              ))
            )}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default SectionsList;
