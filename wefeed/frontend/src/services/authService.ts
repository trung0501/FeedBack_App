import api from '@/services/api';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
} from '../types/models';

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/users/register/', data);
    
    // Save token to localStorage
    if (response.data.token) {
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/login/', data);
    
    // Save token and user info
    if (response.data.token) {
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    
    return response.data;
  }

  /**
   * Login with Google OAuth
   */
  async googleLogin(tokenId: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/google/', {
      token: tokenId,
    });
    
    if (response.data.token) {
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Get user detail
   */
  async getUserDetail(userId: number): Promise<User> {
    const response = await api.get<User>(`/users/${userId}/detail/`);
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(userId: number, data: ChangePasswordRequest): Promise<void> {
    await api.put(`/users/${userId}/password/`, data);
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId: number, file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post<User>(`/users/${userId}/avatar/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Update user in localStorage
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      currentUser.avatar_url = response.data.avatar_url;
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
    
    return response.data;
  }

  /**
   * Send OTP for 2FA
   */
  async sendOTP(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/send-otp/', { email });
    return response.data;
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/verify-otp/', { email, otp });
    return response.data;
  }

  /**
   * Setup 2-Step Authentication
   */
  async setup2FA(): Promise<{ qr_code: string; secret: string }> {
    const response = await api.post<{ qr_code: string; secret: string }>('/auth/2step/setup/');
    return response.data;
  }

  /**
   * Verify 2-Step Authentication
   */
  async verify2FA(code: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/2step/verify/', { code });
    return response.data;
  }

  /**
   * Request password reset
   */
  async resetPasswordRequest(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password/', { email });
    return response.data;
  }
}

export default new AuthService();