import api from '@/services/api';
import type {
  Workspace,
  WorkspaceCreateRequest,
  WorkspaceMember,
} from '../types/models';

/**
 * Workspace Service
 */
class WorkspaceService {
  /**
   * Create new workspace
   */
  async createWorkspace(data: WorkspaceCreateRequest): Promise<Workspace> {
    const response = await api.post<Workspace>('/workspaces/', data);
    return response.data;
  }

  /**
   * Get workspace detail
   */
  async getWorkspace(workspaceId: number): Promise<Workspace> {
    const response = await api.get<Workspace>(`/workspaces/${workspaceId}/`);
    return response.data;
  }

  /**
   * Update workspace
   */
  async updateWorkspace(workspaceId: number, data: Partial<WorkspaceCreateRequest>): Promise<Workspace> {
    const response = await api.put<Workspace>(`/workspaces/${workspaceId}/`, data);
    return response.data;
  }

  /**
   * Delete workspace
   */
  async deleteWorkspace(workspaceId: number): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/`);
  }

  /**
   * Upgrade workspace subscription plan
   */
  async upgradeWorkspace(workspaceId: number, plan: 'free' | 'pro' | 'enterprise'): Promise<Workspace> {
    const response = await api.put<Workspace>(`/workspaces/${workspaceId}/upgrade/`, {
      subscription_plan: plan,
    });
    return response.data;
  }

  /**
   * Get workspace members
   */
  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    const response = await api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members/`);
    return response.data;
  }

  /**
   * Add member to workspace (invite)
   */
  async addWorkspaceMember(
    workspaceId: number,
    userId: number,
    role: 'owner' | 'admin' | 'member' = 'member'
  ): Promise<WorkspaceMember> {
    const response = await api.post<WorkspaceMember>(`/workspaces/${workspaceId}/members/`, {
      user: userId,
      role,
    });
    return response.data;
  }

  /**
   * Invite member by email
   */
  async inviteMemberByEmail(
    workspaceId: number,
    email: string,
    role: 'owner' | 'admin' | 'member' = 'member'
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/workspaces/${workspaceId}/members/invite/`,
      { email, role }
    );
    return response.data;
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    workspaceId: number,
    userId: number,
    role: 'owner' | 'admin' | 'member'
  ): Promise<WorkspaceMember> {
    const response = await api.put<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${userId}/role/`,
      { role }
    );
    return response.data;
  }

  /**
   * Remove member from workspace
   */
  async removeMember(workspaceId: number, userId: number): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  }

  /**
   * Get member detail in workspace
   */
  async getMemberDetail(workspaceId: number, userId: number): Promise<WorkspaceMember> {
    const response = await api.get<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${userId}/`
    );
    return response.data;
  }

  /**
   * Leave workspace (current user)
   */
  async leaveWorkspace(workspaceId: number): Promise<void> {
    await api.post(`/workspaces/${workspaceId}/members/leave/`);
  }
}

export default new WorkspaceService();