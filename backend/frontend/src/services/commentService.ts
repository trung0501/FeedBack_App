import api from '@/services/api';
import type { Comment, CommentCreateRequest } from '../types/models';

/**
 * Comment Service
 */
class CommentService {
  /**
   * Create new comment
   */
  async createComment(data: CommentCreateRequest): Promise<Comment> {
    const response = await api.post<Comment>('/comments/create/', data);
    return response.data;
  }

  /**
   * Get comment detail
   */
  async getComment(commentId: number): Promise<Comment> {
    const response = await api.get<Comment>(`/comments/${commentId}/detail/`);
    return response.data;
  }

  /**
   * Update comment
   */
  async updateComment(commentId: number, content: string): Promise<Comment> {
    const response = await api.put<Comment>(`/comments/${commentId}/detail/`, {
      content,
    });
    return response.data;
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: number): Promise<void> {
    await api.delete(`/comments/${commentId}/detail/`);
  }

  /**
   * Reply to comment
   */
  async replyToComment(commentId: number, content: string): Promise<Comment> {
    const response = await api.post<Comment>(`/comments/${commentId}/reply/`, {
      content,
    });
    return response.data;
  }

  /**
   * Mention users in comment
   */
  async mentionUsers(commentId: number, userIds: number[]): Promise<Comment> {
    const response = await api.post<Comment>(`/comments/${commentId}/mention/`, {
      mention_user: userIds,
    });
    return response.data;
  }

  /**
   * Get comments by session
   */
  async getSessionComments(sessionId: number): Promise<Comment[]> {
    const response = await api.get<Comment[]>(`/sessions/${sessionId}/comments/`);
    return response.data;
  }

  /**
   * Upload attachment for comment
   */
  async uploadAttachment(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('attachment', file);
    
    // Note: You may need to adjust this endpoint based on your backend
    const response = await api.post<{ url: string }>('/comments/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
  }
}

export default new CommentService();