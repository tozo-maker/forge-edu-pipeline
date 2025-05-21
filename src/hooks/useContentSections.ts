
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

type ContentSection = {
  title: string;
  description: string;
  sequence: number;
};

export const useContentSections = (
  initialSections: ContentSection[],
  form: UseFormReturn<any>
) => {
  const [sections, setSections] = useState<ContentSection[]>(initialSections);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const newSection: ContentSection = {
      title: newSectionTitle,
      description: newSectionDescription,
      sequence: sections.length + 1
    };
    
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    form.setValue("contentSections", updatedSections);
    setNewSectionTitle("");
    setNewSectionDescription("");
  };

  const removeSection = (index: number) => {
    const updatedSections = sections
      .filter((_, i) => i !== index)
      .map((section, idx) => ({
        ...section,
        sequence: idx + 1
      }));
    
    setSections(updatedSections);
    form.setValue("contentSections", updatedSections);
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    
    const updatedSections = [...sections];
    const [removed] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, removed);
    
    // Update sequence numbers
    const reorderedSections = updatedSections.map((section, idx) => ({
      ...section,
      sequence: idx + 1
    }));
    
    setSections(reorderedSections);
    form.setValue("contentSections", reorderedSections);
  };

  return {
    sections,
    newSectionTitle,
    newSectionDescription,
    setNewSectionTitle,
    setNewSectionDescription,
    addSection,
    removeSection,
    moveSection
  };
};
