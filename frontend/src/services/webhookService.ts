import api from '@/services/api';
import type { Webhook } from '../types/models';

/**
 * Webhook Service
 */
class WebhookService {
  /**
   * Create new webhook
   */
  async createWebhook(
    workspaceId: number,
    endpointUrl: string,
    eventType: 'create' | 'read' | 'update' | 'delete',
    model: 'project' | 'comment' | 'user'
  ): Promise<Webhook> {
    const response = await api.post<Webhook>('/webhooks/', {
      workspace: workspaceId,
      endpoint_url: endpointUrl,
      event_type: eventType,
      model,
    });
    return response.data;
  }

  /**
   * Get webhook detail
   */
  async getWebhook(webhookId: number): Promise<Webhook> {
    const response = await api.get<Webhook>(`/webhooks/${webhookId}/detail/`);
    return response.data;
  }

  /**
   * Update webhook
   */
  async updateWebhook(
    webhookId: number,
    data: Partial<{
      endpoint_url: string;
      event_type: 'create' | 'read' | 'update' | 'delete';
      model: 'project' | 'comment' | 'user';
    }>
  ): Promise<Webhook> {
    const response = await api.put<Webhook>(`/webhooks/${webhookId}/detail/`, data);
    return response.data;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: number): Promise<void> {
    await api.delete(`/webhooks/${webhookId}/detail/`);
  }

  /**
   * Trigger event manually (for testing)
   */
  async triggerEvent(eventData: unknown): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/events/', eventData);
    return response.data;
  }
}

export default new WebhookService();