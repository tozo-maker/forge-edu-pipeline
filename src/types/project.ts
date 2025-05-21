
// Types for the project wizard
export type ProjectWizardFormData = {
  // Project Type
  title: string;
  description: string;
  projectType: 'lesson_plan' | 'course_module' | 'assessment' | 'activity' | 'curriculum';
  
  // Educational Context
  gradeLevel: string[];
  subjectArea: string[];
  standards: string[];
  
  // Learning Objectives
  objectives: {
    text: string;
    bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  }[];
  
  // Pedagogical Approach
  teachingMethodology: string[];
  assessmentPhilosophy: string;
  differentiationStrategies: string[];
  
  // Cultural & Accessibility
  languageComplexity: 'simple' | 'moderate' | 'advanced';
  culturalInclusion: string[];
  accessibilityNeeds: string[];
  
  // Content Structure
  organizationPattern: 'sequential' | 'hierarchical' | 'modular';
  contentSections: { title: string; description: string; sequence: number }[];
  estimatedDuration: string;
};

// Define the steps for the wizard
export const WIZARD_STEPS = [
  { id: 'project-type', title: 'Project Type' },
  { id: 'educational-context', title: 'Educational Context' },
  { id: 'learning-objectives', title: 'Learning Objectives' },
  { id: 'pedagogical-approach', title: 'Pedagogical Approach' },
  { id: 'cultural-accessibility', title: 'Cultural & Accessibility' },
  { id: 'content-structure', title: 'Content Structure' },
  { id: 'final-review', title: 'Review & Create' }
];
