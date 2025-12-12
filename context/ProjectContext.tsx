
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Project, Task, Risk, QualityCheck, User, Team, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ProjectContextType {
    companyName: string;
    setCompanyName: (name: string) => void;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    selectedProject: Project | null;
    setSelectedProject: (project: Project | null) => void;
    departments: string[];
    setDepartments: React.Dispatch<React.SetStateAction<string[]>>;
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    risks: Risk[];
    setRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
    qualityChecks: QualityCheck[];
    setQualityChecks: React.Dispatch<React.SetStateAction<QualityCheck[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    teams: Team[];
    setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
    currentUser: User;

    // Actions
    addProject: (project: Project) => void;
    updateProject: (project: Project) => void;
    deleteProject: (id: number) => void;

    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (id: number) => void;

    addRisk: (risk: Risk) => void;
    updateRisk: (risk: Risk) => void;
    deleteRisk: (id: number) => void;

    addQualityCheck: (qc: QualityCheck) => void;
    updateQualityCheck: (qc: QualityCheck) => void;
    deleteQualityCheck: (id: number) => void;

    addTeam: (team: Team) => void;
    updateTeam: (team: Team) => void;
    deleteTeam: (id: number) => void;

    addUser: (user: User) => void;
    updateUser: (user: User) => void;
    deleteUser: (id: number) => void;

    resetData: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Initial Data
const initialProjects: Project[] = [];
// ... other initials can be empty or default


export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [companyName, setCompanyName] = useState('Sua Empresa');
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [departments, setDepartments] = useState<string[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [risks, setRisks] = useState<Risk[]>([]);
    const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null); // Start null, wait for auth

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            // Fetch Projects
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('*');
            if (projectsData) setProjects(projectsData as any); // Cast for now due to camelCase vs snake_case mismatches

            // Fetch Tasks
            const { data: tasksData } = await supabase.from('tasks').select('*');
            if (tasksData) setTasks(tasksData as any);

            // Fetch Risks
            const { data: risksData } = await supabase.from('risks').select('*');
            if (risksData) setRisks(risksData as any);

            // Fetch Quality Checks
            const { data: qcData } = await supabase.from('quality_checks').select('*');
            if (qcData) setQualityChecks(qcData as any);

            // Fetch Teams
            const { data: teamsData } = await supabase.from('teams').select('*');
            if (teamsData) setTeams(teamsData as any);

            // Fetch Profiles/Users
            const { data: usersData } = await supabase.from('profiles').select('*');
            if (usersData) setUsers(usersData.map((u: any) => ({ ...u, status: 'Ativo' })) as any); // Adapt or map fields
        };

        fetchData();

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setCurrentUser({
                    id: 1, // temporary mapping or fetch from profiles
                    name: session.user.user_metadata.name || session.user.email,
                    email: session.user.email!,
                    role: UserRole.Admin, // fetch from profile
                    status: 'Ativo'
                });
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setCurrentUser({
                    id: 1, // temporary mapping
                    name: session.user.user_metadata.name || session.user.email,
                    email: session.user.email!,
                    role: UserRole.Admin,
                    status: 'Ativo'
                });
            } else {
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Set initial selected project if available and none selected
    useEffect(() => {
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0]);
        }
    }, [projects]);


    // Project Actions
    const addProject = async (project: Project) => {
        // Map camelCase to snake_case for DB
        const dbProject = {
            name: project.name,
            description: project.description,
            status: project.status, // Ensure enum matches text or map it
            start_date: project.startDate,
            end_date: project.endDate,
            manager: project.manager,
            budget: 0, // Default or from project
            priority: 'Média',
            progress: 0
        };

        const { data, error } = await supabase
            .from('projects')
            .insert([dbProject])
            .select();

        if (data) {
            const newProject = data[0]; // Adapt back if needed
            // For simplicity in this step, re-fetch or optimistically update
            setProjects([...projects, { ...project, id: newProject.id }]); // Update local
            setSelectedProject({ ...project, id: newProject.id });
        } else if (error) {
            console.error("Error adding project:", error);
            alert("Erro ao adicionar projeto: " + error.message);
        }
    };

    const updateProject = async (updatedProject: Project) => {
        // Map camelCase to snake_case
        const dbProject = {
            name: updatedProject.name,
            description: updatedProject.description,
            status: updatedProject.status,
            start_date: updatedProject.startDate,
            end_date: updatedProject.endDate,
            manager: updatedProject.manager,
            // ... map other fields if they changed
        };

        const { error } = await supabase
            .from('projects')
            .update(dbProject)
            .eq('id', updatedProject.id);

        if (!error) {
            setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
            if (selectedProject && selectedProject.id === updatedProject.id) {
                setSelectedProject(updatedProject);
            }
        } else {
            console.error("Error updating project:", error);
        }
    };

    const deleteProject = async (id: number) => {
        const { error } = await supabase.from('projects').delete().eq('id', id);

        if (!error) {
            const remaining = projects.filter(p => p.id !== id);
            setProjects(remaining);
            if (selectedProject?.id === id) {
                setSelectedProject(remaining.length > 0 ? remaining[0] : null);
            }
        } else {
            console.error("Error deleting project:", error);
        }
    };

    // Task Actions
    const addTask = async (task: Task) => {
        // Find project ID from name if needed, or component should pass it. 
        // The Task interface has projectName, but DB needs project_id.
        // We need to look up project_id.
        const project = projects.find(p => p.name === task.projectName);
        if (!project) {
            console.error("Project not found for task:", task.projectName);
            return;
        }

        const dbTask = {
            project_id: project.id,
            name: task.name,
            status: task.status,
            responsible: task.responsible,
            planned_start: task.plannedStart,
            planned_end: task.plannedEnd,
            group_name: task.group,
            // ... other fields
        };

        const { data, error } = await supabase.from('tasks').insert([dbTask]).select();

        if (data) {
            const newTask = { ...task, id: data[0].id };
            setTasks([...tasks, newTask]);
        } else {
            console.error("Error adding task:", error);
        }
    };
    const updateTask = async (task: Task) => {
        const dbTask = {
            name: task.name,
            status: task.status,
            responsible: task.responsible,
            planned_start: task.plannedStart,
            planned_end: task.plannedEnd,
            percent_complete: task.percentComplete,
            actual_start: task.actualStart,
            actual_end: task.actualEnd,
            group_name: task.group,
        };

        const { error } = await supabase.from('tasks').update(dbTask).eq('id', task.id);

        if (!error) {
            setTasks(tasks.map(t => t.id === task.id ? task : t));
        } else {
            console.error("Error updating task:", error);
        }
    };

    const deleteTask = async (id: number) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) {
            setTasks(tasks.filter(t => t.id !== id));
        } else {
            console.error("Error deleting task:", error);
        }
    };

    // Risk Actions
    // Risk Actions
    const addRisk = async (risk: Risk) => {
        const project = projects.find(p => p.name === risk.projectName);
        if (!project) return;

        const dbRisk = {
            project_id: project.id,
            description: risk.description,
            probability: risk.probability,
            impact: risk.impact,
            mitigation_plan: risk.mitigationPlan,
            status: risk.status,
            owner: risk.responsible,
            // risk.category needed? schema check
        };
        const { data, error } = await supabase.from('risks').insert([dbRisk]).select();
        if (data) setRisks([...risks, { ...risk, id: data[0].id }]);
    };

    const updateRisk = async (risk: Risk) => {
        const dbRisk = {
            description: risk.description,
            probability: risk.probability,
            impact: risk.impact,
            mitigation_plan: risk.mitigationPlan,
            status: risk.status,
            owner: risk.responsible,
        };
        const { error } = await supabase.from('risks').update(dbRisk).eq('id', risk.id);
        if (!error) setRisks(risks.map(r => r.id === risk.id ? risk : r));
    };

    const deleteRisk = async (id: number) => {
        const { error } = await supabase.from('risks').delete().eq('id', id);
        if (!error) setRisks(risks.filter(r => r.id !== id));
    };

    // Quality Actions
    // Quality Actions
    const addQualityCheck = async (qc: QualityCheck) => {
        const project = projects.find(p => p.name === qc.projectName);
        if (!project) return;

        const dbQC = {
            project_id: project.id,
            item: qc.item,
            criteria: qc.details, // Mapping 'details' to criteria or details? Schema has criteria AND comments. TS has details.
            status: qc.status,
            responsible: qc.responsible,
            // category?
        };
        const { data, error } = await supabase.from('quality_checks').insert([dbQC]).select();
        if (data) setQualityChecks([...qualityChecks, { ...qc, id: data[0].id }]);
    };

    const updateQualityCheck = async (qc: QualityCheck) => {
        const dbQC = {
            item: qc.item,
            criteria: qc.details,
            status: qc.status,
            responsible: qc.responsible,
        };
        const { error } = await supabase.from('quality_checks').update(dbQC).eq('id', qc.id);
        if (!error) setQualityChecks(qualityChecks.map(q => q.id === qc.id ? qc : q));
    };

    const deleteQualityCheck = async (id: number) => {
        const { error } = await supabase.from('quality_checks').delete().eq('id', id);
        if (!error) setQualityChecks(qualityChecks.filter(q => q.id !== id));
    };

    // Team Actions
    // Team Actions
    const addTeam = async (team: Team) => {
        // Teams logic might be more complex with members table
        // For MVP, just insert team
        const { data, error } = await supabase.from('teams').insert([{ name: team.name, color: 'blue' }]).select();
        if (data) setTeams([...teams, { ...team, id: data[0].id }]);
    };
    // Placeholder updates for simplicity, can be expanded
    const updateTeam = async (team: Team) => {
        // Update team details
        setTeams(teams.map(t => t.id === team.id ? team : t));
    };
    const deleteTeam = async (id: number) => {
        await supabase.from('teams').delete().eq('id', id);
        setTeams(teams.filter(t => t.id !== id));
    };

    // User Actions
    // Users are managed by Auth mostly, but we can manage profiles table here?
    const addUser = async (user: User) => {
        // NOTE: Creating a user usually requires Admin Auth API causing side effect
        // For now, we might just be creating a 'profile' entry if they don't exist?
        // Or if this is an invite system.
        // Keeping as mock or specialized admin function.
        setUsers([...users, user]);
    };
    const updateUser = async (user: User) => {
        // Update profile
        await supabase.from('profiles').update({ name: user.name, role: user.role }).eq('id', user.id);
        setUsers(users.map(u => u.id === user.id ? user : u));
    };
    const deleteUser = async (id: number) => {
        // Soft delete or real delete?
        setUsers(users.filter(u => u.id !== id));
        // Also remove from teams
        setTeams(teams.map(team => ({
            ...team,
            members: team.members.filter(m => m.userId !== id)
        })));
    };

    const resetData = () => {
        setProjects([]);
        setSelectedProject(null);
        setDepartments([]);
        setTasks([]);
        setRisks([]);
        setQualityChecks([]);
        setUsers([]);
        setTeams([]);
    };

    return (
        <ProjectContext.Provider value={{
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
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjectContext must be used within a ProjectProvider');
    }
    return context;
};
