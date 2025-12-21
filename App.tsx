import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GestaoMedicoes from './components/GestaoMedicoes';
import Departamentos from './components/Departamentos';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectCronograma from './components/ProjectCronograma';
import ProjectFinanceiro from './components/ProjectFinanceiro';
import ProjectQualidade from './components/ProjectQualidade';
import ProjectRiscos from './components/ProjectRiscos';
import ProjectFormModal from './components/ProjectFormModal';
import TaskFormModal from './components/TaskFormModal';
import GestaoVista from './components/GestaoVista';
import KanbanBoard from './components/KanbanBoard';
import RiskFormModal from './components/RiskFormModal';
import QualityFormModal from './components/QualityFormModal';
import GestaoEquipes from './components/GestaoEquipes';
import TeamFormModal from './components/TeamFormModal';
import ProjectEquipes from './components/ProjectEquipes';
import GestaoMembros from './components/GestaoMembros';
import UserFormModal from './components/UserFormModal';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import { useProjectContext } from './context/ProjectContext';
import { Project, Task, Risk, QualityCheck, User, Team } from './types';
import LoginPage from './components/LoginPage';
import InvitePage from './components/InvitePage';

// Login component moved to ./components/LoginPage.tsx

const App: React.FC = () => {


  // Use Context
  const {
    companyName, setCompanyName,
    projects, setProjects,
    selectedProject, setSelectedProject,
    departments, setDepartments,
    tasks, setTasks,
    risks, setRisks,
    qualityChecks, setQualityChecks,
    users, setUsers,
    teams, setTeams,
    currentUser,
    addProject, updateProject, deleteProject,
    addTask, updateTask, deleteTask,
    addRisk, updateRisk, deleteRisk,
    addQualityCheck, updateQualityCheck, deleteQualityCheck,
    addTeam, updateTeam, deleteTeam,
    addUser, updateUser, deleteUser,
    resetData
  } = useProjectContext();

  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [riskToEdit, setRiskToEdit] = useState<Risk | null>(null);

  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [qualityCheckToEdit, setQualityCheckToEdit] = useState<QualityCheck | null>(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // No separate state for notifications needed, using Routing.
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);


  const handleSaveProject = (projectData: Omit<Project, 'id'> & { id?: number }) => {
    if (projectData.id) {
      // Ideally we would reconstruct the full Project object, but for now we trust the form returns enough or we merge
      // The original code merged: { ...p, ...projectData }
      // But addProject takes a full Project.
      // The form usually returns fields.
      // We can use a helper or just cast.
      // Since updateProject in context does the map, we just need to pass the updated object.
      // BUT, context updateProject expects a Project. usage: projects.map...
      // We need to find the old project to merge if projectData is partial.
      const oldProject = projects.find(p => p.id === projectData.id);
      if (oldProject) {
        updateProject({ ...oldProject, ...projectData } as Project);
        alert('Projeto atualizado com sucesso!');
      }
    } else {
      const newProject = {
        ...projectData,
        id: Date.now(),
        associatedTeamIds: projectData.associatedTeamIds || []
      } as Project;
      addProject(newProject);
      alert('Projeto criado com sucesso!');
    }
    setIsProjectModalOpen(false);
    setProjectToEdit(null);
  };

  const handleDeleteProject = (projectId: number) => {
    deleteProject(projectId);
    alert('Projeto excluído com sucesso!');
    setIsProjectModalOpen(false);
    setProjectToEdit(null);
  };

  const handleOpenNewProjectModal = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProjectModal = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> & { id?: number }) => {
    if (taskData.id) {
      const oldTask = tasks.find(t => t.id === taskData.id);
      if (oldTask) updateTask({ ...oldTask, ...taskData } as Task);
    } else {
      addTask({ ...taskData, id: Date.now() } as Task);
    }
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(taskId);
    }
    setIsTaskModalOpen(false);
  };

  const handleOpenNewTaskModal = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Risk Handlers
  const handleSaveRisk = (riskData: Omit<Risk, 'id'> & { id?: number }) => {
    if (riskData.id) {
      const old = risks.find(r => r.id === riskData.id);
      if (old) updateRisk({ ...old, ...riskData } as Risk);
    } else {
      addRisk({ ...riskData, id: Date.now() } as Risk);
    }
    setIsRiskModalOpen(false);
  };

  const handleDeleteRisk = (riskId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este risco?')) {
      deleteRisk(riskId);
    }
    setIsRiskModalOpen(false);
  };

  const handleOpenNewRiskModal = () => {
    setRiskToEdit(null);
    setIsRiskModalOpen(true);
  };

  const handleOpenEditRiskModal = (risk: Risk) => {
    setRiskToEdit(risk);
    setIsRiskModalOpen(true);
  };

  // Quality Handlers
  const handleSaveQualityCheck = (qcData: Omit<QualityCheck, 'id'> & { id?: number }) => {
    if (qcData.id) {
      const old = qualityChecks.find(q => q.id === qcData.id);
      if (old) updateQualityCheck({ ...old, ...qcData } as QualityCheck);
    } else {
      addQualityCheck({ ...qcData, id: Date.now() } as QualityCheck);
    }
    setIsQualityModalOpen(false);
  };

  const handleDeleteQualityCheck = (qcId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este item de qualidade?')) {
      deleteQualityCheck(qcId);
    }
    setIsQualityModalOpen(false);
  };

  const handleOpenNewQualityCheckModal = () => {
    setQualityCheckToEdit(null);
    setIsQualityModalOpen(true);
  };

  const handleOpenEditQualityCheckModal = (qc: QualityCheck) => {
    setQualityCheckToEdit(qc);
    setIsQualityModalOpen(true);
  };

  // Team Handlers
  const handleSaveTeam = (teamData: Omit<Team, 'id'> & { id?: number }) => {
    if (teamData.id) {
      const old = teams.find(t => t.id === teamData.id);
      if (old) updateTeam({ ...old, ...teamData } as Team);
    } else {
      addTeam({ ...teamData, id: Date.now() } as Team);
    }
    setIsTeamModalOpen(false);
  };

  const handleDeleteTeam = (teamId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta equipe?')) {
      deleteTeam(teamId);
    }
    setIsTeamModalOpen(false);
  };

  const handleOpenNewTeamModal = () => {
    setTeamToEdit(null);
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeamModal = (team: Team) => {
    setTeamToEdit(team);
    setIsTeamModalOpen(true);
  };

  // User Handlers
  const handleSaveUser = (userData: Omit<User, 'id' | 'email' | 'status'> & { id?: number; email?: string; status?: 'Ativo' | 'Pendente' }) => {
    if (userData.id) {
      const old = users.find(u => u.id === userData.id);
      if (old) updateUser({ ...old, ...userData } as User);
    } else {
      const newUser = {
        ...userData,
        id: Date.now(),
        email: `${userData.name.toLowerCase().replace(/\s/g, '.')}@agilis.pmo`, // mock email
        status: 'Ativo'
      } as User;
      addUser(newUser);
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (userId: number) => {
    const isLeader = teams.some(team => team.leaderId === userId);
    if (isLeader) {
      alert('Não é possível excluir este membro pois ele é líder de uma ou mais equipes. Por favor, reatribua a liderança antes de excluir.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este membro? Ele será removido de todas as equipes.')) {
      deleteUser(userId);
      setIsUserModalOpen(false);
      setUserToEdit(null);
    }
  };

  const handleOpenNewUserModal = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUserModal = (user: User) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };


  const addDepartment = (name: string) => {
    if (name.trim() && !departments.includes(name.trim())) {
      setDepartments([...departments, name.trim()]);
      return true;
    }
    return false;
  };

  const deleteDepartment = (name: string) => {
    setDepartments(departments.filter(dep => dep !== name));
  };


  const projectTasks = tasks.filter(t => t.projectName === selectedProject?.name);
  const projectRisks = risks.filter(r => r.projectName === selectedProject?.name);
  const projectQualityChecks = qualityChecks.filter(qc => qc.projectName === selectedProject?.name);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!currentUser ? <LoginPage onLogin={() => { }} /> : <Navigate to="/" />} />
        <Route path="/invite/:id" element={<InvitePage />} />

        {/* Protected Routes */}
        <Route path="*" element={
          currentUser ? (
            <div className="flex h-screen bg-gray-100 font-sans">
              <Sidebar
                companyName={companyName}
                projects={projects}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                onNewProjectClick={handleOpenNewProjectModal}
                onLogoutClick={() => supabase.auth.signOut()}
              />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Dashboard projects={projects} onEditProject={handleOpenEditProjectModal} />} />
                  <Route path="/dashboard" element={<Dashboard projects={projects} onEditProject={handleOpenEditProjectModal} />} />
                  <Route path="/medicoes" element={<GestaoMedicoes projects={projects} departments={departments} />} />
                  <Route path="/departamentos" element={<Departamentos departments={departments} addDepartment={addDepartment} deleteDepartment={deleteDepartment} />} />
                  <Route path="/equipes" element={<GestaoEquipes teams={teams} users={users} onAddTeam={handleOpenNewTeamModal} onEditTeam={handleOpenEditTeamModal} />} />
                  <Route path="/membros" element={<GestaoMembros users={users} onAddUser={handleOpenNewUserModal} onEditUser={handleOpenEditUserModal} />} />

                  {/* Settings Route */}
                  <Route path="/settings" element={
                    <Settings
                      onClose={() => { /* No back button inside needed typically if sidebar works, but keeping prop if req */ }}
                      currentUser={currentUser}
                      users={users}
                      onAddUser={handleOpenNewUserModal}
                      onEditUser={handleOpenEditUserModal}
                      onDeleteUser={handleDeleteUser}
                      companyName={companyName}
                      setCompanyName={setCompanyName}
                      theme={theme}
                      setTheme={setTheme}
                    />
                  } />

                  {/* Notifications Route */}
                  <Route path="/notifications" element={<Notifications onClose={() => { }} />} />

                  <Route path="/projeto/:id/dashboard" element={<ProjectDashboard project={selectedProject} />} />
                  <Route path="/projeto/:id/cronograma" element={<ProjectCronograma
                    onAddTask={handleOpenNewTaskModal}
                    onEditTask={handleOpenEditTaskModal}
                  />}
                  />
                  <Route path="/projeto/:id/kanban" element={<KanbanBoard
                    onEditTask={handleOpenEditTaskModal}
                  />}
                  />
                  <Route path="/projeto/:id/financeiro" element={<ProjectFinanceiro project={selectedProject} />} />
                  <Route path="/projeto/:id/qualidade" element={<ProjectQualidade
                    project={selectedProject}
                    qualityChecks={projectQualityChecks}
                    onAddQualityCheck={handleOpenNewQualityCheckModal}
                    onEditQualityCheck={handleOpenEditQualityCheckModal}
                    setQualityChecks={setQualityChecks}
                  />}
                  />
                  <Route path="/projeto/:id/riscos" element={<ProjectRiscos
                    project={selectedProject}
                    risks={projectRisks}
                    onAddRisk={handleOpenNewRiskModal}
                    onEditRisk={handleOpenEditRiskModal}
                    setRisks={setRisks}
                  />}
                  />
                  <Route path="/projeto/:id/equipes" element={<ProjectEquipes project={selectedProject} allTeams={teams} allUsers={users} />} />
                  <Route path="/projeto/:id/vista" element={<GestaoVista />}
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              {isProjectModalOpen && (
                <ProjectFormModal
                  onClose={() => setIsProjectModalOpen(false)}
                  onSave={handleSaveProject}
                  onDelete={handleDeleteProject}
                  projectToEdit={projectToEdit}
                  departments={departments}
                  teams={teams}
                />
              )}
              {isTaskModalOpen && selectedProject && (
                <TaskFormModal
                  onClose={() => setIsTaskModalOpen(false)}
                  onSave={handleSaveTask}
                  onDelete={handleDeleteTask}
                  taskToEdit={taskToEdit}
                  projectName={selectedProject.name}
                  departments={departments}
                />
              )}
              {isRiskModalOpen && selectedProject && (
                <RiskFormModal
                  onClose={() => setIsRiskModalOpen(false)}
                  onSave={handleSaveRisk}
                  riskToEdit={riskToEdit}
                  projectName={selectedProject.name}
                />
              )}
              {isQualityModalOpen && selectedProject && (
                <QualityFormModal
                  onClose={() => setIsQualityModalOpen(false)}
                  onSave={handleSaveQualityCheck}
                  qualityCheckToEdit={qualityCheckToEdit}
                  projectName={selectedProject.name}
                />
              )}
              {isTeamModalOpen && (
                <TeamFormModal
                  onClose={() => setIsTeamModalOpen(false)}
                  onSave={handleSaveTeam}
                  onDelete={handleDeleteTeam}
                  teamToEdit={teamToEdit}
                  users={users}
                />
              )}
              {isUserModalOpen && (
                <UserFormModal
                  onClose={() => setIsUserModalOpen(false)}
                  onSave={handleSaveUser}
                  onDelete={handleDeleteUser}
                  userToEdit={userToEdit}
                />
              )}
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
};

export default App;

