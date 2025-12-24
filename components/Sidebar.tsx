import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardIcon, CalendarIcon, MeasurementIcon, DepartmentIcon, FinanceIcon, ChevronUpIcon, ChevronDownIcon, QualityIcon, RisksIcon, UsersIcon, SettingsIcon, BellIcon, LogOutIcon } from './icons';
import { Project } from '../types';
import ProjectCombobox from './ProjectCombobox';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick, disabled = false }) => {
  const baseClasses = 'flex items-center space-x-3 p-2 rounded-md w-full text-left';
  const activeClasses = 'bg-blue-600 text-white';
  const inactiveClasses = 'hover:bg-slate-700 text-slate-300';
  const disabledClasses = 'text-slate-500 cursor-not-allowed';

  return (
    <button onClick={onClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''}`} disabled={disabled}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
}

const NavGroup: React.FC<NavGroupProps> = ({ title, children }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-xs text-slate-400 uppercase font-bold">{title}</h3>
      <ChevronUpIcon className="w-4 h-4 text-slate-400" />
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

interface SidebarProps {
  companyName: string;
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  onNewProjectClick: () => void;
  onLogoutClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ companyName, projects, selectedProject, setSelectedProject, onNewProjectClick, onLogoutClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);

    // Determine where to navigate
    if (project) {
      // If currently on a project specific page, try to accept the same page for the new project
      // Pattern: /projeto/:id/:view
      const match = currentPath.match(/\/projeto\/\d+\/([a-z]+)/);
      if (match && match[1]) {
        navigate(`/projeto/${project.id}/${match[1]}`);
      } else {
        // Default to dashboard
        navigate(`/projeto/${project.id}/dashboard`);
      }
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
      <div>
        <div className="text-center py-2">
          <h1 className="text-2xl font-bold text-blue-400">Agilis PMO</h1>
        </div>
        <div className="border-t border-slate-700 pt-4">
          <label className="text-sm text-slate-400">Empresa:</label>
          <h2 className="text-white font-semibold text-lg truncate mt-1" title={companyName}>
            {companyName}
          </h2>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-3 p-2 mt-2 rounded-md w-full text-left text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Configurações</span>
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className={`flex items-center space-x-3 p-2 mt-2 rounded-md w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentPath === '/notifications' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            <BellIcon className="w-5 h-5" />
            <span>Notificações</span>
          </button>
        </div>
      </div>
      <nav className="flex-1 flex flex-col space-y-6 my-6 overflow-y-auto">
        <NavGroup title="Gestão do Portfólio">
          <NavItem
            icon={<DashboardIcon className="w-5 h-5" />}
            label="Dashboard do Portfólio"
            active={currentPath === '/' || currentPath === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          />
          <NavItem
            icon={<MeasurementIcon className="w-5 h-5" />}
            label="Gestão de Medições"
            active={currentPath === '/medicoes'}
            onClick={() => navigate('/medicoes')}
          />
          <NavItem
            icon={<DepartmentIcon className="w-5 h-5" />}
            label="Departamentos"
            active={currentPath === '/departamentos'}
            onClick={() => navigate('/departamentos')}
          />
          <NavItem
            icon={<UsersIcon className="w-5 h-5" />}
            label="Equipes"
            active={currentPath === '/equipes'}
            onClick={() => navigate('/equipes')}
          />
          <NavItem
            icon={<UsersIcon className="w-5 h-5" />}
            label="Membros"
            active={currentPath === '/membros'}
            onClick={() => navigate('/membros')}
          />
        </NavGroup>

        <NavGroup title="Gestão do Projeto">
          <div>
            <label htmlFor="project-select" className="text-xs text-slate-400">SELECIONE O PROJETO:</label>
            <ProjectCombobox
              projects={projects}
              selectedProject={selectedProject}
              onSelect={handleProjectSelect}
            />
          </div>
          <button
            onClick={onNewProjectClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center space-x-2">
            <span>+</span>
            <span>Novo</span>
          </button>
          <NavItem
            icon={<DashboardIcon className="w-5 h-5" />}
            label="Dashboard"
            active={selectedProject ? currentPath === `/projeto/${selectedProject.id}/dashboard` : false}
            onClick={() => selectedProject && navigate(`/projeto/${selectedProject.id}/dashboard`)}
            disabled={!selectedProject}
          />
          <NavItem
            icon={<CalendarIcon className="w-5 h-5" />}
            label="Cronograma"
            active={selectedProject ? currentPath === `/projeto/${selectedProject.id}/cronograma` : false}
            onClick={() => selectedProject && navigate(`/projeto/${selectedProject.id}/cronograma`)}
            disabled={!selectedProject}
          />
          <NavItem
            icon={<FinanceIcon className="w-5 h-5" />}
            label="Financeiro"
            active={selectedProject ? currentPath === `/projeto/${selectedProject.id}/financeiro` : false}
            onClick={() => selectedProject && navigate(`/projeto/${selectedProject.id}/financeiro`)}
            disabled={!selectedProject}
          />
          <NavItem
            icon={<QualityIcon className="w-5 h-5" />}
            label="Qualidade"
            active={selectedProject ? currentPath === `/projeto/${selectedProject.id}/qualidade` : false}
            onClick={() => selectedProject && navigate(`/projeto/${selectedProject.id}/qualidade`)}
            disabled={!selectedProject}
          />
          <NavItem
            icon={<RisksIcon className="w-5 h-5" />}
            label="Riscos"
            active={selectedProject ? currentPath === `/projeto/${selectedProject.id}/riscos` : false}
            onClick={() => selectedProject && navigate(`/projeto/${selectedProject.id}/riscos`)}
            disabled={!selectedProject}
          />
          <NavItem
            icon={<UsersIcon className="w-5 h-5" />}
            label="Equipes"
            active={selectedProject ? currentPath === `/projeto/${selectedProject.id}/equipes` : false}
            onClick={() => selectedProject && navigate(`/projeto/${selectedProject.id}/equipes`)}
            disabled={!selectedProject}
          />

        </NavGroup>
      </nav>
      <div className="border-t border-slate-700 pt-4">
        <button
          onClick={onLogoutClick}
          className="flex items-center space-x-3 p-2 rounded-md w-full text-left text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <LogOutIcon className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;