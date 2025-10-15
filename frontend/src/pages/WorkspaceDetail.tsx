import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import CreateProjectModal from '@/components/CreateProjectModal';
import EditWorkspaceModal from '@/components/EditWorkspaceModal';
import { workspaceService, projectService } from '@/services';
import { handleApiError } from '@/services';
import type { Workspace, Project } from '@/types/models';

export default function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isEditWorkspaceModalOpen, setIsEditWorkspaceModalOpen] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchWorkspaceDetail();
      fetchWorkspaceProjects();
    }
  }, [id]);

  const fetchWorkspaceDetail = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await workspaceService.getWorkspace(Number(id));
      setWorkspace(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkspaceProjects = async () => {
    try {
      const allProjects = await projectService.listProjects();
      const workspaceProjects = allProjects.filter(p => p.workspace === Number(id));
      setProjects(workspaceProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!confirm('Are you sure you want to delete this workspace? All projects will be lost!')) return;
    
    try {
      await workspaceService.deleteWorkspace(Number(id));
      navigate('/workspaces');
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleOpenProject = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !workspace) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Workspace Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This workspace does not exist'}</p>
          <button
            onClick={() => navigate('/workspaces')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Workspaces
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button onClick={() => navigate('/workspaces')} className="hover:text-blue-600">
          Workspaces
        </button>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{workspace.name}</span>
      </nav>

      {/* Workspace Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                workspace.subscription_plan === 'free' 
                  ? 'bg-gray-100 text-gray-600'
                  : workspace.subscription_plan === 'pro'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                {workspace.subscription_plan.charAt(0).toUpperCase() + workspace.subscription_plan.slice(1)} Plan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditWorkspaceModalOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            <button
              onClick={handleDeleteWorkspace}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {workspace.description && (
          <p className="text-gray-600">{workspace.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Team Members</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Created</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(workspace.created_day).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <button
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Create your first project in this workspace</p>
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpenProject(project.id)}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden cursor-pointer group"
              >
                <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {project.thumbnail_url ? (
                    <img src={project.thumbnail_url} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.type === 'canvas' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                    }`}>
                      {project.type === 'canvas' ? '🎨' : '📸'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {project.domain_url || 'No URL'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateProjectModalOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateProjectModalOpen(false)}
          onSuccess={(newProject) => {
            setProjects([...projects, newProject]);
            setIsCreateProjectModalOpen(false);
          }}
        />
      )}

      {/* Edit Workspace Modal */}
      {isEditWorkspaceModalOpen && workspace && (
        <EditWorkspaceModal
          workspace={workspace}
          onClose={() => setIsEditWorkspaceModalOpen(false)}
          onSuccess={(updatedWorkspace) => {
            setWorkspace(updatedWorkspace);
            setIsEditWorkspaceModalOpen(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}