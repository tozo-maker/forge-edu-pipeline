
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PipelineStage } from '@/types/pipeline';
import { projectCache } from '@/utils/cache';

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
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Generate cache key based on user and limit
      const cacheKey = `projects_${user.id}_${limit || 'all'}`;
      
      // Try to get data from cache first
      const cachedData = projectCache.get<ProjectData[]>(cacheKey);
      if (cachedData) {
        setProjects(cachedData);
        setLoading(false);
        
        // Refresh in background
        refreshProjectsInBackground(cacheKey);
        return;
      }

      try {
        setLoading(true);
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
        
        // Store in cache with 2 minute TTL
        projectCache.set(cacheKey, typedData, { ttl: 2 * 60 * 1000 });
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Error fetching projects');
      } finally {
        setLoading(false);
      }
    };

    // Background refresh without showing loading state to user
    const refreshProjectsInBackground = async (cacheKey: string) => {
      try {
        let query = supabase
          .from('projects')
          .select('*')
          .eq('user_id', user!.id)
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
        
        // Update cache
        projectCache.set(cacheKey, typedData, { ttl: 2 * 60 * 1000 });
      } catch (err: any) {
        console.error('Error refreshing projects in background:', err);
        // Don't update error state as this is a background refresh
      }
    };

    fetchProjects();

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
            projectCache.remove(`projects_${user.id}_${limit || 'all'}`);
          }
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSubscription);
    };
  }, [user, limit]);

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
        projectCache.remove(`projects_${user.id}_${limit || 'all'}`);
      }

      setProjects((prev) => [projectData as ProjectData, ...prev]);
      return { data: projectData, error: null };
    } catch (err: any) {
      console.error('Error creating project:', err);
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
        projectCache.remove(`projects_${user.id}_${limit || 'all'}`);
      }

      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, ...updates } : p)
      );
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating project:', err);
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
        projectCache.remove(`projects_${user.id}_${limit || 'all'}`);
      }

      setProjects(prev => prev.filter(p => p.id !== projectId));
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting project:', err);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, error, createProject, updateProject, deleteProject };
};
