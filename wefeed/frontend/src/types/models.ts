/**
 * User Model
 */
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  avatar_url?: string;
  auth_type: 'default' | 'google' | 'sso';
  two_stept_auth: boolean;
  created_day: string;
}

/**
 * Workspace Model
 */
export interface Workspace {
  id: number;
  name: string;
  description?: string;
  owner: number; // User ID
  subscription_plan: 'free' | 'pro' | 'enterprise';
  created_day: string;
}

/**
 * Workspace Member Model
 */
export interface WorkspaceMember {
  id: number;
  workspace: number; // Workspace ID
  user: number; // User ID
  role: 'owner' | 'admin' | 'member';
  joined_day: string;
}

/**
 * Project Model
 */
export interface Project {
  id: number;
  name: string;
  workspace: number; // Workspace ID
  domain_url?: string;
  thumbnail_url?: string;
  type: 'canvas' | 'shoot';
  created_day: string;
}

/**
 * Canvas Model
 */
export interface Canvas {
  id: number;
  project: number; // Project ID
  iframe_url?: string;
  created_day: string;
  updated_day: string;
}

/**
 * Feedback Session Model
 */
export interface FeedbackSession {
  id: number;
  user?: number; // User ID (nullable)
  canvas: number; // Canvas ID
  session_type: 'canvas' | 'shoot';
  created_day: string;
  updated_day: string;
}

/**
 * Comment Model
 */
export interface Comment {
  id: number;
  session: number; // FeedbackSession ID
  user: number; // User ID
  content: string;
  position_x?: number;
  position_y?: number;
  tag_user?: number; // User ID
  mention_user?: number[]; // Array of User IDs
  attachment_url?: string;
  created_day: string;
  updated_day: string;
}

/**
 * Webhook Model
 */
export interface Webhook {
  id: number;
  workspace: number; // Workspace ID
  endpoint_url: string;
  event_type: 'create' | 'read' | 'update' | 'delete';
  model: 'project' | 'comment' | 'user';
  created_day: string;
}

/**
 * Auth Response Types
 */
export interface LoginResponse {
  user: User;
  token: string;
  refresh_token?: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

/**
 * API Request Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface WorkspaceCreateRequest {
  name: string;
  description?: string;
}

export interface ProjectCreateRequest {
  name: string;
  workspace: number;
  type: 'canvas' | 'shoot';
  domain_url?: string;
  thumbnail_url?: string;
}

export interface CommentCreateRequest {
  session: number;
  content: string;
  position_x?: number;
  position_y?: number;
  tag_user?: number;
  mention_user?: number[];
  attachment_url?: string;
}

/**
 * Utility Types
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}