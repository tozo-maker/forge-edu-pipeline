
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Setup CORS headers for WebSockets
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a WebSocket server to handle connections
serve(async (req) => {
  // Handle CORS preflight requests for WebSockets
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if it's a WebSocket connection request
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";
    
    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get Anthropic API key from environment
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      return new Response(JSON.stringify({ error: "Anthropic API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Upgrade the connection to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Handle connection open
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
    
    // Handle connection close
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    
    // Handle errors
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Handle messages from client
    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle cancel request
        if (message.type === 'cancel') {
          socket.send(JSON.stringify({ 
            type: 'info', 
            message: 'Generation cancelled' 
          }));
          return;
        }
        
        // Get prompt ID from message
        const promptId = message.promptId;
        if (!promptId) {
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: 'No promptId provided' 
          }));
          return;
        }
        
        // Get model and style preferences
        const model = message.model || "claude-3-opus-20240229";
        const style = message.style || "balanced";
        
        // Send initial progress update
        socket.send(JSON.stringify({ 
          type: 'progress', 
          progress: 5,
          message: 'Starting content generation...' 
        }));
        
        // Fetch the prompt from the database
        const { data: promptData, error: promptError } = await adminClient
          .from('prompts')
          .select('*, sections!inner(*)')
          .eq('id', promptId)
          .single();

        if (promptError) {
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: `Error fetching prompt: ${promptError.message}` 
          }));
          return;
        }

        // Get project configuration for educational DNA
        let projectConfig = null;
        if (promptData.sections) {
          const outlineId = promptData.sections.outline_id;
          
          const { data: outlineData } = await adminClient
            .from('outlines')
            .select('project_id')
            .eq('id', outlineId)
            .single();
            
          if (outlineData) {
            const projectId = outlineData.project_id;
            
            const { data: configData } = await adminClient
              .from('project_configs')
              .select('*')
              .eq('project_id', projectId)
              .single();
              
            if (configData) {
              projectConfig = configData;
              
              // Update progress
              socket.send(JSON.stringify({ 
                type: 'progress', 
                progress: 15,
                message: 'Educational DNA loaded...' 
              }));
            }
          }
        }
        
        // Enhance prompt with educational context if available
        let finalPrompt = promptData.prompt_text;
        if (projectConfig) {
          const { educationalContext, pedagogicalApproach, culturalAccessibility } = projectConfig.config_data;
          
          // Add educational DNA as context
          finalPrompt = `
Educational Context:
- Grade Level: ${educationalContext?.gradeLevel?.join(', ') || 'Not specified'}
- Subject Area: ${educationalContext?.subjectArea?.join(', ') || 'Not specified'}
- Standards: ${educationalContext?.standards?.join(', ') || 'Not specified'}

Pedagogical Approach:
- Teaching Methodology: ${pedagogicalApproach?.teachingMethodology?.join(', ') || 'Not specified'}
- Assessment Philosophy: ${pedagogicalApproach?.assessmentPhilosophy || 'Not specified'}

Accessibility Requirements:
- Language Complexity: ${culturalAccessibility?.languageComplexity || 'Not specified'}
- Cultural Inclusion: ${culturalAccessibility?.culturalInclusion?.join(', ') || 'Not specified'}
- Accessibility Needs: ${culturalAccessibility?.accessibilityNeeds?.join(', ') || 'Not specified'}

${promptData.prompt_text}`;
        }
        
        // Apply generation style
        if (style) {
          const styleIntro = 
            style === "creative" ? 
              "Generate creative, engaging, and imaginative educational content. Feel free to use analogies, stories, and thought-provoking examples." :
            style === "conservative" ?
              "Generate clear, concise, and straightforward educational content. Focus on accuracy, clarity, and alignment with educational standards." :
              "Generate well-balanced educational content that combines clarity with engagement. Use a mix of straightforward explanations and illustrative examples.";
              
          finalPrompt = `${styleIntro}\n\n${finalPrompt}`;
        }
        
        // Update progress
        socket.send(JSON.stringify({ 
          type: 'progress', 
          progress: 20,
          message: 'Prompt prepared, connecting to Claude AI...' 
        }));

        // Create a new content item in the database
        const { data: contentData, error: contentError } = await adminClient
          .from('content_items')
          .insert({
            prompt_id: promptId,
            content_text: "",
            is_approved: false,
            metadata: {
              model,
              style: style || 'balanced',
              temperature: style === "creative" ? 0.9 : style === "conservative" ? 0.3 : 0.7,
              generated_at: new Date().toISOString()
            }
          })
          .select()
          .single();
          
        if (contentError) {
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: `Error creating content item: ${contentError.message}` 
          }));
          return;
        }
        
        const contentId = contentData.id;
        
        // Update progress
        socket.send(JSON.stringify({ 
          type: 'progress', 
          progress: 30,
          message: 'Content entry created, generating with Claude AI...' 
        }));
        
        // Call Anthropic Claude API with streaming enabled
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicApiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model,
              max_tokens: 4000,
              temperature: style === "creative" ? 0.9 : style === "conservative" ? 0.3 : 0.7,
              stream: true,
              messages: [
                {
                  role: "user",
                  content: finalPrompt
                }
              ]
            })
          });

          if (!response.ok) {
            const errorData = await response.body?.getReader().read();
            const decoder = new TextDecoder();
            const errorText = decoder.decode(errorData?.value);
            throw new Error(`Claude API error: ${response.status} ${errorText}`);
          }

          // Process the stream
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let contentText = "";
          let progress = 30;
          let isQualityCheck = false;
          let progressIncrement = 60 / (4000 / 50); // Rough estimate of progress per token chunk
          
          // Count for quality checks (every N updates)
          let updateCount = 0;
          const qualityCheckFrequency = 10;

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(5).trim();
                
                if (data === '[DONE]') {
                  continue;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  
                  if (parsed.type === 'content_block_delta' && 
                      parsed.delta && 
                      parsed.delta.text) {
                    const text = parsed.delta.text;
                    contentText += text;
                    
                    // Update progress
                    progress = Math.min(90, progress + progressIncrement);
                    
                    // Send content update
                    socket.send(JSON.stringify({ 
                      type: 'content', 
                      progress,
                      message: `Generated ${contentText.length} characters...`,
                      content: contentText
                    }));
                    
                    // Periodic quality checks
                    updateCount++;
                    if (updateCount % qualityCheckFrequency === 0 && !isQualityCheck) {
                      isQualityCheck = true;
                      
                      // Run quality check in the background
                      EdgeRuntime.waitUntil((async () => {
                        try {
                          // Simple analysis with a separate Claude call
                          const qualityResponse = await fetch('https://api.anthropic.com/v1/messages', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'x-api-key': anthropicApiKey,
                              'anthropic-version': '2023-06-01'
                            },
                            body: JSON.stringify({
                              model: "claude-3-haiku-20240307", // Use faster model for quality checks
                              max_tokens: 500,
                              temperature: 0.2,
                              messages: [
                                {
                                  role: "user",
                                  content: `
You are an educational content quality assessor. Analyze this partial educational content:

${contentText.slice(0, 2000)}${contentText.length > 2000 ? '...' : ''}

Provide a JSON response with these quality metrics (scores from 0-10):
1. standards_alignment: How well the content seems to align with educational standards
2. reading_level: What reading level the content is appropriate for (score and level name)
3. pedagogical_approach: How well it supports effective teaching and learning
4. accessibility: How accessible the content appears for diverse learners
5. cultural_sensitivity: How culturally inclusive and sensitive the content seems

Return ONLY valid JSON with no explanatory text.
`
                                }
                              ]
                            })
                          });
                          
                          if (qualityResponse.ok) {
                            const qualityData = await qualityResponse.json();
                            let qualityText = qualityData.content[0].text;
                            
                            try {
                              // Extract JSON if it's in a code block format
                              const jsonMatch = qualityText.match(/```json\n([\s\S]*?)\n```/) || 
                                              qualityText.match(/```([\s\S]*?)```/);
                              
                              if (jsonMatch && jsonMatch[1]) {
                                qualityText = jsonMatch[1];
                              }
                              
                              const qualityMetrics = JSON.parse(qualityText);
                              
                              socket.send(JSON.stringify({
                                type: 'quality',
                                indicators: qualityMetrics
                              }));
                            } catch (e) {
                              console.error('Error parsing quality metrics:', e);
                            }
                          }
                        } catch (e) {
                          console.error('Error generating quality metrics:', e);
                        } finally {
                          isQualityCheck = false;
                        }
                      })());
                    }
                  }
                } catch (e) {
                  console.error('Error parsing chunk:', e);
                }
              }
            }
          }

          // Store the complete content in the database
          await adminClient
            .from('content_items')
            .update({
              content_text: contentText,
              updated_at: new Date().toISOString()
            })
            .eq('id', contentId);
            
          // Send final update
          socket.send(JSON.stringify({ 
            type: 'content', 
            progress: 100,
            message: 'Content generation complete',
            content: contentText,
            contentId,
            final: true
          }));
          
          console.log('Content generation complete');
          
        } catch (error) {
          console.error('Error calling Claude API:', error);
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: `Error generating content: ${error.message}` 
          }));
        }
        
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: `Error: ${error.message}` 
        }));
      }
    };

    return response;
  } catch (error) {
    console.error('Error in content-generation-stream:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
