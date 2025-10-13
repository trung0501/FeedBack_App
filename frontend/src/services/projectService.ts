import api from '@/services/api';
import type { Project, ProjectCreateRequest } from '../types/models';

/**
 * Project Service
 */
class ProjectService {
  /**
   * Create new project
   */
  async createProject(data: ProjectCreateRequest): Promise<Project> {
    const response = await api.post<Project>('/projects/', data);
    return response.data;
  }

  /**
   * Get project detail
   */
  async getProject(projectId: number): Promise<Project> {
    const response = await api.get<Project>(`/projects/${projectId}/`);
    return response.data;
  }

  /**
   * Update project
   */
  async updateProject(projectId: number, data: Partial<ProjectCreateRequest>): Promise<Project> {
    const response = await api.put<Project>(`/projects/${projectId}/`, data);
    return response.data;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: number): Promise<void> {
    await api.delete(`/projects/${projectId}/`);
  }

  /**
   * Get all projects
   */
  async listProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects/list/');
    return response.data;
  }

  /**
   * Get projects by workspace
   */
  async getProjectsByWorkspace(workspaceId: number): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects/list/', {
      params: { workspace: workspaceId },
    });
    return response.data;
  }
}

export default new ProjectService();