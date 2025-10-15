// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DashboardLayout from '@/components/DashboardLayout';
// import CreateProjectModal from '@/components/CreateProjectModal';
// import { projectService } from '@/services';
// import { handleApiError } from '@/services';
// import type { Project } from '@/types/models';

// export default function Projects() {
//   const navigate = useNavigate();
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const fetchProjects = async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const data = await projectService.listProjects();
//       setProjects(data);
//       console.log('Loaded projects:', data.length);
//     } catch (err) {
//       setError(handleApiError(err));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCreateProject = () => {
//     setIsCreateModalOpen(true);
//   };

//   const handleOpenProject = (projectId: number) => {
//     navigate(`/projects/${projectId}`);
//   };

//   const handleDeleteProject = async (projectId: number) => {
//     if (!confirm('Are you sure you want to delete this project?')) return;

//     try {
//       await projectService.deleteProject(projectId);
//       setProjects(projects.filter(p => p.id !== projectId));
//     } catch (err) {
//       alert(handleApiError(err));
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
//           <p className="text-gray-600 mt-2">
//             Manage your projects and get visual feedback from your team
//           </p>
//         </div>
//         <button
//           onClick={handleCreateProject}
//           className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           New Project
//         </button>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-sm text-red-800">{error}</p>
//         </div>
//       )}

//       {isLoading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
//               <div className="h-48 bg-gray-200"></div>
//               <div className="p-4">
//                 <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
//                 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : projects.length === 0 ? (
//         <div className="text-center py-16">
//           <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//             </svg>
//           </div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
//           <p className="text-gray-600 mb-6">Create your first project to start collecting feedback</p>
//           <button
//             onClick={handleCreateProject}
//             className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             Create Your First Project
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {/* console.log('Projects data:', projects);
//           console.log('Is array?', Array.isArray(projects)); */}
          
//           {/* {projects.map((project) => ( */}
//           {projects && projects.length > 0 && projects.map((project) => (
//             <div
//               key={project.id}
//               className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 overflow-hidden group cursor-pointer"
//               onClick={() => handleOpenProject(project.id)}
//             >
//               <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
//                 {project.thumbnail_url ? (
//                   <img 
//                     src={project.thumbnail_url} 
//                     alt={project.name}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                 )}
                
//                 <div className="absolute top-3 right-3">
//                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                     project.type === 'canvas' 
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-purple-500 text-white'
//                   }`}>
//                     {project.type === 'canvas' ? '🎨 Canvas' : '📸 Shoot'}
//                   </span>
//                 </div>
//               </div>

//               <div className="p-4">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
//                   {project.name}
//                 </h3>
//                 <p className="text-sm text-gray-500 mb-3">
//                   {project.domain_url ? (
//                     <a 
//                       href={project.domain_url} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="hover:text-blue-600 truncate block"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {project.domain_url}
//                     </a>
//                   ) : (
//                     'No URL'
//                   )}
//                 </p>

//                 <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleOpenProject(project.id);
//                     }}
//                     className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Open
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDeleteProject(project.id);
//                     }}
//                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {isCreateModalOpen && (
//         <CreateProjectModal
//           onClose={() => setIsCreateModalOpen(false)}
//           onSuccess={(newProject) => {
//             setProjects([...projects, newProject]);
//             setIsCreateModalOpen(false);
//           }}
//         />
//       )}
//     </DashboardLayout>
//   );
// }

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import CreateProjectModal from '@/components/CreateProjectModal';
import EditProjectModal from '@/components/EditProjectModal';
import { projectService } from '@/services';
import { handleApiError } from '@/services';
import type { Project } from '@/types/models';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await projectService.listProjects();
      setProjects(data);
      console.log('Loaded projects:', data.length);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleOpenProject = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectService.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">
            Manage your projects and get visual feedback from your team
          </p>
        </div>
        <button
          onClick={handleCreateProject}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">Create your first project to start collecting feedback</p>
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Project
          </button>
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 overflow-hidden group cursor-pointer"
              onClick={() => handleOpenProject(project.id)}
            >
              {/* Project Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                {project.thumbnail_url ? (
                  <img 
                    src={project.thumbnail_url} 
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.type === 'canvas' 
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}>
                    {project.type === 'canvas' ? '🎨 Canvas' : '📸 Shoot'}
                  </span>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {project.domain_url ? (
                    <a 
                      href={project.domain_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 truncate block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.domain_url}
                    </a>
                  ) : (
                    'No URL'
                  )}
                </p>

                {/* Actions - 3 BUTTONS: Open, Settings, Delete */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProject(project.id);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newProject) => {
            setProjects([...projects, newProject]);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={(updatedProject) => {
            setProjects(
              projects.map(p => p.id === updatedProject.id ? updatedProject : p)
            );
            setEditingProject(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}

