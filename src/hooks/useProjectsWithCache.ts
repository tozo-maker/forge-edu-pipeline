
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PipelineStage } from '@/types/pipeline';
import { projectCache } from '@/utils/cache';
import { useToast } from '@/hooks/use-toast';

export type ProjectData = {
  id: string;
  title: string;
  description: string | null;
  pipeline_status: PipelineStage;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  config_dna: any;
};

type ProjectCreateData = {
  title: string;
  description: string;
  configData?: any;
};

export const useProjectsWithCache = (limit?: number) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const getCacheKey = useCallback(() => {
    if (!user) return null;
    return `projects_${user.id}_${limit || 'all'}`;
  }, [user, limit]);

  const fetchProjects = useCallback(async (skipCache = false) => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      setHasAttemptedLoad(true);
      return;
    }

    // Generate cache key
    const cacheKey = getCacheKey();
    if (!cacheKey) return;
    
    // Try to get data from cache first (unless skipCache is true)
    if (!skipCache) {
      const cachedData = projectCache.get<ProjectData[]>(cacheKey);
      if (cachedData) {
        console.log("Using cached project data");
        setProjects(cachedData);
        setLoading(false);
        
        // Refresh in background without showing loading state
        refreshProjectsInBackground();
        setHasAttemptedLoad(true);
        return;
      }
    }

    try {
      setLoading(true);
      console.log("Fetching fresh project data from API");
      
      let query = supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const typedData = data as ProjectData[];
      setProjects(typedData);
      
      // Store in cache with TTL
      if (cacheKey) {
        projectCache.set(cacheKey, typedData, { 
          ttl: 2 * 60 * 1000, // 2 minute TTL
          priority: 'high'
        });
      }
      
      setHasAttemptedLoad(true);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Error fetching projects');
      
      // Show toast for API errors only if we've already attempted once
      if (hasAttemptedLoad) {
        toast({
          title: "Error loading projects",
          description: "Please try again or refresh the page",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, limit, hasAttemptedLoad, toast, getCacheKey]);

  // Background refresh without showing loading state to user
  const refreshProjectsInBackground = useCallback(async () => {
    if (!user) return;
    
    const cacheKey = getCacheKey();
    if (!cacheKey) return;
    
    try {
      console.log("Refreshing projects in background");
      
      let query = supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const typedData = data as ProjectData[];
      
      // Only update state if data is different
      const currentData = JSON.stringify(projects);
      const newData = JSON.stringify(typedData);
      
      if (currentData !== newData) {
        setProjects(typedData);
        console.log("Updated projects from background refresh");
      }
      
      // Update cache
      projectCache.set(cacheKey, typedData, { 
        ttl: 2 * 60 * 1000,
        priority: 'high'
      });
    } catch (err: any) {
      console.error('Error refreshing projects in background:', err);
      // Don't update error state as this is a background refresh
    }
  }, [user, limit, projects, getCacheKey]);

  useEffect(() => {
    fetchProjects();
    
    // Set up cache refresh function
    const cacheKey = getCacheKey();
    if (cacheKey) {
      projectCache.setRefreshFunction(cacheKey, async () => {
        if (!user) return [];
        
        let query = supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
  
        if (limit) {
          query = query.limit(limit);
        }
  
        const { data } = await query;
        return data as ProjectData[];
      }, 2 * 60 * 1000); // Refresh every 2 minutes
    }

    // Set up real-time subscription
    const projectsSubscription = supabase
      .channel('projects_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects',
          filter: user ? `user_id=eq.${user.id}` : undefined 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          // Clear cache on any changes
          if (user) {
            const cacheKey = getCacheKey();
            if (cacheKey) {
              projectCache.remove(cacheKey);
            }
          }
          fetchProjects(true); // Skip cache on realtime updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSubscription);
    };
  }, [user, limit, fetchProjects, getCacheKey]);

  const createProject = async (project: ProjectCreateData) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      
      // First, create the project entry
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: project.title,
          description: project.description,
          pipeline_status: 'project_config',
          completion_percentage: project.configData ? 20 : 0,  // If we have config data, we're further along
          config_dna: project.configData || {}
        })
        .select()
        .single();

      if (projectError) {
        throw projectError;
      }

      // If there's configuration data, save it to project_configs table
      if (project.configData) {
        const { error: configError } = await supabase
          .from('project_configs')
          .insert({
            project_id: projectData.id,
            config_data: project.configData,
            is_complete: true
          });

        if (configError) {
          throw configError;
        }
        
        // Log the completion of the project configuration stage
        const { error: logError } = await supabase
          .from('pipeline_logs')
          .insert({
            project_id: projectData.id,
            stage: 'project_config',
            success_rate: 100,
            duration: 0,
            metadata: { completedAt: new Date().toISOString() }
          });

        if (logError) {
          console.error('Error logging pipeline stage:', logError);
        }
      }

      // Clear cache for this user
      if (user) {
        const cacheKey = getCacheKey();
        if (cacheKey) {
          projectCache.remove(cacheKey);
        }
      }

      setProjects((prev) => [projectData as ProjectData, ...prev]);
      
      toast({
        title: "Project created",
        description: `${project.title} has been created successfully`,
      });
      
      return { data: projectData, error: null };
    } catch (err: any) {
      console.error('Error creating project:', err);
      
      toast({
        title: "Failed to create project",
        description: err.message || "Please try again",
        variant: "destructive"
      });
      
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<ProjectData>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Clear cache for this user
      if (user) {
        const cacheKey = getCacheKey();
        if (cacheKey) {
          projectCache.remove(cacheKey);
        }
      }

      // Update local state immediately
      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, ...updates } : p)
      );
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating project:', err);
      
      toast({
        title: "Failed to update project",
        description: err.message || "Please try again",
        variant: "destructive"
      });
      
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Clear cache for this user
      if (user) {
        const cacheKey = getCacheKey();
        if (cacheKey) {
          projectCache.remove(cacheKey);
        }
      }

      // Update local state immediately
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      toast({
        title: "Project deleted",
        description: "The project has been permanently deleted",
      });
      
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting project:', err);
      
      toast({
        title: "Failed to delete project",
        description: err.message || "Please try again",
        variant: "destructive"
      });
      
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Force refresh function that can be called by components
  const refreshProjects = () => {
    fetchProjects(true); // Skip cache
  };

  return { 
    projects, 
    loading, 
    error, 
    createProject, 
    updateProject, 
    deleteProject,
    refreshProjects
  };
};
