import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { projectService, workspaceService } from '@/services';
import { handleApiError } from '@/services';
import type { Project, Workspace } from '@/types/models';

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

interface FormData {
  name: string;
  workspace: number;
  domain_url?: string;
  thumbnail_url?: string;
  type: 'canvas' | 'shoot';
}

export default function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // Fetch workspaces for dropdown
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const data = await workspaceService.getAllWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Thêm thumbnail URL nếu có
      const projectData = {
        ...data,
        thumbnail_url: thumbnailPreview || undefined,
      };
      
      const newProject = await projectService.createProject(projectData);
      onSuccess(newProject);
      onClose();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-1">Create a project to start collecting visual feedback</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Project Name */}
          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Homepage Redesign"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register('name', {
                required: 'Project name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters',
                },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Workspace Selection */}
          <div className="mb-5">
            <label htmlFor="workspace" className="block text-sm font-medium text-gray-700 mb-2">
              Workspace <span className="text-red-500">*</span>
            </label>
            {isLoadingWorkspaces ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Loading workspaces...</p>
              </div>
            ) : (
              <select
                id="workspace"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                {...register('workspace', {
                  required: 'Workspace is required',
                  valueAsNumber: true,
                })}
              >
                <option value="">Select a workspace</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.subscription_plan})
                  </option>
                ))}
              </select>
            )}
            {errors.workspace && (
              <p className="mt-1 text-sm text-red-600">{errors.workspace.message}</p>
            )}
          </div>

          {/* Domain URL */}
          <div className="mb-5">
            <label htmlFor="domain_url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              id="domain_url"
              type="url"
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register('domain_url', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL (http:// or https://)',
                },
              })}
            />
            {errors.domain_url && (
              <p className="mt-1 text-sm text-red-600">{errors.domain_url.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">The website you want to collect feedback on</p>
          </div>

          {/* Thumbnail Upload */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                {thumbnailPreview ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setThumbnailPreview('')}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <label className="block">
                  <span className="sr-only">Choose thumbnail image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Project Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Project Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Canvas Type */}
              <label className="relative flex flex-col p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  value="canvas"
                  className="absolute top-4 right-4"
                  {...register('type', { required: true })}
                  defaultChecked
                />
                <div className="text-3xl mb-2">🎨</div>
                <span className="font-semibold text-gray-900 mb-1">Canvas</span>
                <p className="text-xs text-gray-600">
                  Review designs, mockups, and static pages
                </p>
              </label>

              {/* Shoot Type */}
              <label className="relative flex flex-col p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  value="shoot"
                  className="absolute top-4 right-4"
                  {...register('type', { required: true })}
                />
                <div className="text-3xl mb-2">📸</div>
                <span className="font-semibold text-gray-900 mb-1">Shoot</span>
                <p className="text-xs text-gray-600">
                  Capture screenshots and annotate them
                </p>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingWorkspaces}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}