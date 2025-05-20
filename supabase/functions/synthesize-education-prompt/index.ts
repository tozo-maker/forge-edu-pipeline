
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  projectId: string;
  sectionId?: string; // Optional for section-specific prompts
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const { projectId, sectionId } = await req.json() as RequestBody;
    
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Log operation start for monitoring
    console.log(`Synthesizing education prompt for project ${projectId}${sectionId ? ` section ${sectionId}` : ''}`);

    // 1. Fetch project configuration data
    const { data: projectConfig, error: configError } = await supabase
      .from('project_configs')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (configError) {
      throw new Error(`Error fetching project config: ${configError.message}`);
    }

    if (!projectConfig?.config_data) {
      throw new Error('Project configuration not found or empty');
    }

    // 2. Fetch outline context
    const { data: outline, error: outlineError } = await supabase
      .from('outlines')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (outlineError && outlineError.code !== 'PGRST116') {
      throw new Error(`Error fetching outline: ${outlineError.message}`);
    }

    // 3. Get section details
    let sections = [];
    if (sectionId) {
      // Fetch specific section if ID provided
      const { data: section, error: sectionError } = await supabase
        .from('sections')
        .select('*')
        .eq('id', sectionId)
        .single();

      if (sectionError) {
        throw new Error(`Error fetching section: ${sectionError.message}`);
      }
      sections = [section];
    } else if (outline?.id) {
      // Fetch all sections for the outline
      const { data: allSections, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('outline_id', outline.id)
        .order('order_index', { ascending: true });

      if (sectionsError) {
        throw new Error(`Error fetching sections: ${sectionsError.message}`);
      }
      sections = allSections || [];
    }

    // 4. Generate educational prompt template based on project type
    const educationalDNA = projectConfig.config_data;
    let promptTemplate = '';
    
    switch (educationalDNA.projectType) {
      case 'lesson_plan':
        promptTemplate = generateLessonPlanPrompt(educationalDNA, outline?.structure, sections);
        break;
      case 'course_module':
        promptTemplate = generateCourseModulePrompt(educationalDNA, outline?.structure, sections);
        break;
      case 'assessment':
        promptTemplate = generateAssessmentPrompt(educationalDNA, outline?.structure, sections);
        break;
      case 'activity':
        promptTemplate = generateActivityPrompt(educationalDNA, outline?.structure, sections);
        break;
      case 'curriculum':
        promptTemplate = generateCurriculumPrompt(educationalDNA, outline?.structure, sections);
        break;
      default:
        promptTemplate = generateGenericPrompt(educationalDNA, outline?.structure, sections);
    }

    // 5. Generate parameters for Claude API
    const promptParameters = generatePromptParameters(educationalDNA, sectionId ? sections[0] : null);
    
    // 6. Store generated prompt in database if needed
    let promptId: string | null = null;
    
    if (sectionId && sections.length > 0) {
      // Store section-specific prompt
      const { data: insertedPrompt, error: insertError } = await supabase
        .from('prompts')
        .upsert({
          section_id: sectionId,
          prompt_text: promptTemplate,
          parameters: promptParameters,
          is_generated: true,
          is_approved: false,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error storing prompt:', insertError);
      } else {
        promptId = insertedPrompt.id;
      }
    }

    // Return synthesized prompt and parameters
    return new Response(
      JSON.stringify({
        success: true,
        prompt: promptTemplate,
        parameters: promptParameters,
        promptId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in synthesize-education-prompt:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper functions for generating different types of prompts
function generateLessonPlanPrompt(educationalDNA: any, outlineStructure: any, sections: any[]): string {
  const gradeLevel = educationalDNA.educationalContext?.gradeLevel?.join(', ') || 'N/A';
  const subjectArea = educationalDNA.educationalContext?.subjectArea?.join(', ') || 'N/A';
  const standards = educationalDNA.educationalContext?.standards?.join('\n- ') || 'N/A';
  
  const teachingMethodology = educationalDNA.pedagogicalApproach?.teachingMethodology?.join(', ') || 'standard';
  const assessmentPhilosophy = educationalDNA.pedagogicalApproach?.assessmentPhilosophy || 'standard assessment';
  
  const languageComplexity = educationalDNA.culturalAccessibility?.languageComplexity || 'moderate';
  const culturalInclusion = educationalDNA.culturalAccessibility?.culturalInclusion?.join(', ') || 'inclusive';
  const accessibilityNeeds = educationalDNA.culturalAccessibility?.accessibilityNeeds?.join(', ') || 'standard';

  const learningObjectives = educationalDNA.learningObjectives?.map((obj: any) => 
    `- ${obj.text} (Bloom's Level: ${obj.bloomsLevel})`
  ).join('\n') || 'N/A';

  // Section specific information
  const sectionDetails = sections.map((section) => {
    return `
## ${section.title}
${section.description || 'No description provided'}

Learning Objectives:
${section.config?.learningObjectives?.map((obj: string) => `- ${obj}`).join('\n') || 'N/A'}

Activity Types:
${section.config?.activityTypes?.map((type: string) => `- ${type}`).join('\n') || 'N/A'}

Resources:
${section.config?.resources?.map((resource: string) => `- ${resource}`).join('\n') || 'N/A'}
`;
  }).join('\n\n');

  return `# Educational Lesson Plan Generation

## PROJECT CONTEXT
You are to generate a high-quality lesson plan for educators teaching ${subjectArea} to ${gradeLevel} students.

## EDUCATIONAL STANDARDS
Follow these educational standards:
- ${standards}

## LEARNING OBJECTIVES
${learningObjectives}

## PEDAGOGICAL APPROACH
- Teaching Methodology: ${teachingMethodology}
- Assessment Philosophy: ${assessmentPhilosophy}

## CULTURAL AND ACCESSIBILITY CONSIDERATIONS
- Language Complexity: ${languageComplexity}
- Cultural Inclusion: ${culturalInclusion}
- Accessibility Needs: ${accessibilityNeeds}

## OUTLINE CONTEXT
${outlineStructure?.summary || 'No summary provided'}

## SECTION DETAILS
${sectionDetails}

## OUTPUT REQUIREMENTS
1. Create engaging, pedagogically sound lesson content.
2. Follow the specified teaching methodology.
3. Ensure content is appropriate for the grade level and subject area.
4. Include clear instructions, activities, and assessment methods.
5. Consider cultural relevance and accessibility needs.
6. Align all content with specified educational standards.
7. Format the output in clean Markdown.
`;
}

function generateCourseModulePrompt(educationalDNA: any, outlineStructure: any, sections: any[]): string {
  // Similar structure to lesson plan but tailored for course modules
  // ... implementation with course module specific elements
  
  return generateGenericPrompt(educationalDNA, outlineStructure, sections, "course module");
}

function generateAssessmentPrompt(educationalDNA: any, outlineStructure: any, sections: any[]): string {
  // Specialized for assessment content
  // ... implementation with assessment specific elements
  
  return generateGenericPrompt(educationalDNA, outlineStructure, sections, "assessment");
}

function generateActivityPrompt(educationalDNA: any, outlineStructure: any, sections: any[]): string {
  // Specialized for educational activities
  // ... implementation with activity specific elements
  
  return generateGenericPrompt(educationalDNA, outlineStructure, sections, "activity");
}

function generateCurriculumPrompt(educationalDNA: any, outlineStructure: any, sections: any[]): string {
  // Specialized for curriculum development
  // ... implementation with curriculum specific elements
  
  return generateGenericPrompt(educationalDNA, outlineStructure, sections, "curriculum");
}

function generateGenericPrompt(educationalDNA: any, outlineStructure: any, sections: any[], type: string = "educational content"): string {
  const gradeLevel = educationalDNA.educationalContext?.gradeLevel?.join(', ') || 'N/A';
  const subjectArea = educationalDNA.educationalContext?.subjectArea?.join(', ') || 'N/A';
  const standards = educationalDNA.educationalContext?.standards?.join('\n- ') || 'N/A';
  
  const teachingMethodology = educationalDNA.pedagogicalApproach?.teachingMethodology?.join(', ') || 'standard';
  const assessmentPhilosophy = educationalDNA.pedagogicalApproach?.assessmentPhilosophy || 'standard assessment';
  
  const languageComplexity = educationalDNA.culturalAccessibility?.languageComplexity || 'moderate';
  const culturalInclusion = educationalDNA.culturalAccessibility?.culturalInclusion?.join(', ') || 'inclusive';
  const accessibilityNeeds = educationalDNA.culturalAccessibility?.accessibilityNeeds?.join(', ') || 'standard';

  const learningObjectives = educationalDNA.learningObjectives?.map((obj: any) => 
    `- ${obj.text} (Bloom's Level: ${obj.bloomsLevel})`
  ).join('\n') || 'N/A';

  // Section specific information
  const sectionDetails = sections.map((section) => {
    return `
## ${section.title}
${section.description || 'No description provided'}

Learning Objectives:
${section.config?.learningObjectives?.map((obj: string) => `- ${obj}`).join('\n') || 'N/A'}

Activity Types:
${section.config?.activityTypes?.map((type: string) => `- ${type}`).join('\n') || 'N/A'}

Resources:
${section.config?.resources?.map((resource: string) => `- ${resource}`).join('\n') || 'N/A'}
`;
  }).join('\n\n');

  return `# Educational ${type.charAt(0).toUpperCase() + type.slice(1)} Generation

## PROJECT CONTEXT
You are to generate high-quality ${type} for ${subjectArea} aimed at ${gradeLevel} students.

## EDUCATIONAL STANDARDS
Follow these educational standards:
- ${standards}

## LEARNING OBJECTIVES
${learningObjectives}

## PEDAGOGICAL APPROACH
- Teaching Methodology: ${teachingMethodology}
- Assessment Philosophy: ${assessmentPhilosophy}

## CULTURAL AND ACCESSIBILITY CONSIDERATIONS
- Language Complexity: ${languageComplexity}
- Cultural Inclusion: ${culturalInclusion}
- Accessibility Needs: ${accessibilityNeeds}

## OUTLINE CONTEXT
${outlineStructure?.summary || 'No summary provided'}

## SECTION DETAILS
${sectionDetails}

## OUTPUT REQUIREMENTS
1. Create engaging, pedagogically sound educational content.
2. Follow the specified teaching methodology.
3. Ensure content is appropriate for the grade level and subject area.
4. Include clear instructions and learning activities.
5. Consider cultural relevance and accessibility needs.
6. Align all content with specified educational standards.
7. Format the output in clean Markdown.
`;
}

function generatePromptParameters(educationalDNA: any, section: any | null): any {
  // Calculate appropriate model parameters based on project needs
  const defaultTemperature = 0.7;
  const defaultMaxTokens = 4000;
  
  let temperature = defaultTemperature;
  let maxTokens = defaultMaxTokens;
  
  // Adjust parameters based on project type
  switch (educationalDNA.projectType) {
    case 'assessment':
      // More precise for assessments 
      temperature = 0.5;
      break;
    case 'activity':
      // More creative for activities
      temperature = 0.8;
      break;
    default:
      // Use defaults
      break;
  }
  
  // Adjust parameters based on Bloom's taxonomy levels if we have learning objectives
  if (educationalDNA.learningObjectives && educationalDNA.learningObjectives.length > 0) {
    // For higher-order thinking objectives (analyze, evaluate, create), we can use higher temperature
    const higherOrderObjectives = educationalDNA.learningObjectives.filter((obj: any) => 
      ['analyze', 'evaluate', 'create'].includes(obj.bloomsLevel)
    );
    
    if (higherOrderObjectives.length > educationalDNA.learningObjectives.length / 2) {
      // If more than half are higher-order, adjust temperature up slightly
      temperature = Math.min(temperature + 0.1, 1.0);
    }
  }
  
  // For longer sections, we might need more tokens
  if (section && section.description && section.description.length > 500) {
    maxTokens = 6000;
  }
  
  return {
    model: "claude-3-opus-20240229",
    max_tokens: maxTokens,
    temperature: temperature
  };
}
