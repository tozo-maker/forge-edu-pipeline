
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  promptId?: string;
  prompt?: string;
  parameters?: {
    model: string;
    max_tokens: number;
    temperature: number;
    [key: string]: any;
  };
}

// Maximum number of retries for API calls
const MAX_RETRIES = 3;

// Exponential backoff for retries
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get Anthropic API key from environment
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      throw new Error("Anthropic API key not configured");
    }

    // Parse request body
    const { promptId, prompt, parameters } = await req.json() as RequestBody;
    
    let finalPrompt = prompt;
    let finalParams = parameters || { model: "claude-3-opus-20240229", max_tokens: 4000, temperature: 0.7 };
    let sectionId: string | null = null;
    
    // If promptId is provided, fetch the prompt from the database
    if (promptId) {
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single();

      if (promptError) {
        throw new Error(`Error fetching prompt: ${promptError.message}`);
      }

      if (!promptData) {
        throw new Error(`Prompt with ID ${promptId} not found`);
      }

      finalPrompt = promptData.prompt_text;
      finalParams = promptData.parameters || finalParams;
      sectionId = promptData.section_id;
    }

    // Ensure we have a prompt to use
    if (!finalPrompt) {
      throw new Error('No prompt provided');
    }

    // Log operation start for monitoring
    console.log(`Generating content with Claude API for prompt${promptId ? ` ID: ${promptId}` : ''}`);

    // Call Anthropic Claude API with retry logic
    let content = null;
    let error = null;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        console.log(`API attempt ${retries + 1} of ${MAX_RETRIES}`);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: finalParams.model,
            max_tokens: finalParams.max_tokens,
            temperature: finalParams.temperature,
            messages: [
              {
                role: "user",
                content: finalPrompt
              }
            ]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Claude API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        content = data.content && data.content.length > 0 ? data.content[0].text : null;
        
        if (!content) {
          throw new Error('Empty content returned from Claude API');
        }
        
        // Success - break out of retry loop
        break;
      } catch (err) {
        error = err;
        console.error(`Attempt ${retries + 1} failed: ${err.message}`);
        
        // Increment retry counter
        retries++;
        
        // If we've exhausted retries, break and throw the error
        if (retries >= MAX_RETRIES) {
          break;
        }
        
        // Exponential backoff: wait 2^retries * 1000ms before retrying
        const backoffTime = Math.pow(2, retries) * 1000;
        console.log(`Retrying in ${backoffTime}ms...`);
        await sleep(backoffTime);
      }
    }

    // Check if content generation failed after all retries
    if (!content) {
      throw new Error(`Failed to generate content after ${MAX_RETRIES} retries: ${error?.message || 'Unknown error'}`);
    }

    // Store content in database if related to a section
    let contentId: string | null = null;
    if (sectionId && promptId) {
      // Check if content already exists for this prompt
      const { data: existingContent } = await adminClient
        .from('content_items')
        .select('id')
        .eq('prompt_id', promptId)
        .maybeSingle();

      // Insert or update content
      const contentOp = existingContent ? adminClient
        .from('content_items')
        .update({
          content_text: content,
          updated_at: new Date().toISOString(),
          is_approved: false,
          metadata: {
            model: finalParams.model,
            temperature: finalParams.temperature,
            generated_at: new Date().toISOString()
          }
        })
        .eq('id', existingContent.id)
        .select() : adminClient
        .from('content_items')
        .insert({
          prompt_id: promptId,
          content_text: content,
          is_approved: false,
          metadata: {
            model: finalParams.model,
            temperature: finalParams.temperature,
            generated_at: new Date().toISOString()
          }
        })
        .select();
        
      const { data: contentData, error: contentError } = await contentOp;

      if (contentError) {
        console.error('Error storing content:', contentError);
      } else if (contentData && contentData.length > 0) {
        contentId = contentData[0].id;
      }
    }

    // Return generated content
    return new Response(
      JSON.stringify({
        success: true,
        content,
        contentId,
        metadata: {
          model: finalParams.model,
          temperature: finalParams.temperature,
          tokens: content.split(' ').length, // Rough estimate
          generated_at: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-educational-content:', error);
    
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
