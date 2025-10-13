import api from '@/services/api';
import type { Canvas } from '../types/models';

/**
 * Canvas Service
 */
class CanvasService {
  /**
   * Create new canvas
   */
  async createCanvas(projectId: number, iframeUrl?: string): Promise<Canvas> {
    const response = await api.post<Canvas>('/canvas/', {
      project: projectId,
      iframe_url: iframeUrl,
    });
    return response.data;
  }

  /**
   * Get canvas detail
   */
  async getCanvas(canvasId: number): Promise<Canvas> {
    const response = await api.get<Canvas>(`/canvas/${canvasId}`);
    return response.data;
  }

  /**
   * Update canvas
   */
  async updateCanvas(canvasId: number, iframeUrl: string): Promise<Canvas> {
    const response = await api.put<Canvas>(`/canvas/${canvasId}`, {
      iframe_url: iframeUrl,
    });
    return response.data;
  }

  /**
   * Delete canvas
   */
  async deleteCanvas(canvasId: number): Promise<void> {
    await api.delete(`/canvas/${canvasId}`);
  }
}

export default new CanvasService();