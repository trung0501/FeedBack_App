import api from '@/services/api';
import type { FeedbackSession } from '../types/models';

/**
 * Feedback Session Service
 */
class SessionService {
  /**
   * Create new feedback session
   */
  async createSession(
    canvasId: number,
    sessionType: 'canvas' | 'shoot',
    userId?: number
  ): Promise<FeedbackSession> {
    const response = await api.post<FeedbackSession>('/sessions/', {
      canvas: canvasId,
      session_type: sessionType,
      user: userId,
    });
    return response.data;
  }

  /**
   * Get session detail
   */
  async getSession(sessionId: number): Promise<FeedbackSession> {
    const response = await api.get<FeedbackSession>(`/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Update session
   */
  async updateSession(
    sessionId: number,
    data: Partial<{ session_type: 'canvas' | 'shoot' }>
  ): Promise<FeedbackSession> {
    const response = await api.put<FeedbackSession>(`/sessions/${sessionId}`, data);
    return response.data;
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: number): Promise<void> {
    await api.delete(`/sessions/${sessionId}`);
  }

  /**
   * Get sessions by project
   */
  async getProjectSessions(projectId: number): Promise<FeedbackSession[]> {
    const response = await api.get<FeedbackSession[]>(`/projects/${projectId}/sessions/`);
    return response.data;
  }
}

export default new SessionService();