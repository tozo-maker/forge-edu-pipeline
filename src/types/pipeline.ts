
export type PipelineStage =
  | "project_config"
  | "outline_context"
  | "section_details"
  | "claude_prompts" 
  | "content"
  | "validation";

export type PipelineStageInfo = {
  id: PipelineStage;
  title: string;
  description: string;
  icon: string;
  position: number;
};

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    id: "project_config",
    title: "Project Configuration",
    description: "Set up your project parameters and learning objectives",
    icon: "settings",
    position: 1
  },
  {
    id: "outline_context",
    title: "Outline Context",
    description: "Define the structure and context for your content",
    icon: "layout",
    position: 2
  },
  {
    id: "section_details",
    title: "Section Details",
    description: "Specify detailed requirements for each content section",
    icon: "list-check",
    position: 3
  },
  {
    id: "claude_prompts",
    title: "Claude Prompts",
    description: "Generate or customize AI prompts for content creation",
    icon: "message-square",
    position: 4
  },
  {
    id: "content",
    title: "Content",
    description: "Review and edit the AI-generated educational content",
    icon: "file-text",
    position: 5
  },
  {
    id: "validation",
    title: "Validation",
    description: "Validate content against standards and requirements",
    icon: "check-circle",
    position: 6
  }
];

export interface StageValidation {
  canProgress: boolean;
  message?: string;
  issues?: string[];
}

export interface StageComponent {
  validate: () => Promise<StageValidation>;
  saveProgress: () => Promise<boolean>;
}

// Project and user types
export type Project = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  pipeline_status: PipelineStage;
  completion_percentage: number;
  user_id: string;
  config_dna?: Record<string, any>;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "instructional_designer" | "curriculum_developer";
  preferences: {
    subject_areas: string[];
    grade_levels: string[];
    teaching_style: string;
  };
};

// Stage-specific types
export type ProjectConfig = {
  projectType: 'lesson_plan' | 'course_module' | 'assessment' | 'activity' | 'curriculum';
  educationalContext: {
    gradeLevel: string[];
    subjectArea: string[];
    standards: string[];
  };
  learningObjectives: {
    text: string;
    bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  }[];
  pedagogicalApproach: {
    teachingMethodology: string[];
    assessmentPhilosophy: string;
    differentiationStrategies: string[];
  };
  culturalAccessibility: {
    languageComplexity: 'simple' | 'moderate' | 'advanced';
    culturalInclusion: string[];
    accessibilityNeeds: string[];
  };
  contentStructure: {
    organizationPattern: 'sequential' | 'hierarchical' | 'modular';
    contentSections: { title: string; description: string; sequence: number }[];
    estimatedDuration: string;
  };
};

export type OutlineStructure = {
  summary: string;
  audience: string;
  learningGoals: string;
  keyTopics: string[];
};

export type SectionDetail = {
  title: string;
  description: string;
  learningObjectives: string[];
  activityTypes: string[];
  resources: string[];
  notes?: string;
};

export type Prompt = {
  section_id: string;
  prompt_text: string;
  parameters: Record<string, any>;
  is_generated: boolean;
  is_approved: boolean;
};

export type ContentItem = {
  prompt_id: string;
  content_text: string;
  is_approved: boolean;
  metadata: Record<string, any>;
};

export type ValidationResult = {
  content_id: string;
  validation_data: Record<string, any>;
  quality_score: number | null;
  standards_alignment_score: number | null;
  improvement_suggestions: string;
  is_approved: boolean;
};
