export enum ProjectStatus {
  EmPlanejamento = 'Em Planejamento',
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluído',
  Cancelado = 'Cancelado',
}

export interface Project {
  id: number;
  code?: string; // New custom code/id field
  name: string;
  description: string;
  manager: string;
  client?: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  departmentBudgets: Record<string, number>;
  contractAdditives: number[];
  associatedTeamIds?: number[];
}

export interface Medicao {
  id: string;
  projeto: string;
  projectId?: number;
  item: string;
  qtd: number;
  unidade: string;
  valorUnitario: number;
  data: string;
  departamento: string;
  status: 'Planejada' | 'Solicitada' | 'Faturada';
  createdByUsername?: string;
}

export type TaskStatus = 'Não Iniciada' | 'Em Andamento' | 'Concluída' | 'Atrasada' | 'Travado';

export interface Task {
  id: number;
  projectName: string;
  group: string;
  name: string;
  responsible: string;
  department?: string;
  plannedStart: string;
  plannedEnd: string;
  plannedDuration: number;
  percentComplete: number;
  actualStart?: string;
  actualEnd?: string;
  actualDuration?: number;
  status: TaskStatus;
}

export type RiskProbability = 'Baixa' | 'Média' | 'Alta';
export type RiskImpact = 'Baixo' | 'Médio' | 'Alto';
export type RiskStatus = 'Aberto' | 'Em Tratamento' | 'Mitigado' | 'Fechado';

export interface Risk {
  id: number;
  projectName: string;
  description: string;
  category: string;
  probability: RiskProbability;
  impact: RiskImpact;
  responsible: string;
  status: RiskStatus;
  lastUpdate: string;
  mitigationPlan: string;
}

export type QualityStatus = 'Conforme' | 'Não Conforme' | 'Pendente';

export interface QualityCheck {
  id: number;
  projectName: string;
  item: string;
  category: string;
  responsible: string;
  status: QualityStatus;
  lastUpdate: string;
  details: string;
}

export enum UserRole {
  Admin = 'admin',
  PMOManager = 'pmo_manager',
  ProjectManager = 'project_manager',
  TeamMember = 'team_member',
  Stakeholder = 'stakeholder',
  User = 'user'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Administrador',
  [UserRole.PMOManager]: 'Gestor do PMO',
  [UserRole.ProjectManager]: 'Gerente de Projeto',
  [UserRole.TeamMember]: 'Membro da Equipe',
  [UserRole.Stakeholder]: 'Stakeholder',
  [UserRole.User]: 'Usuário'
};

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Ativo' | 'Pendente' | 'Inativo';
}

export interface TeamMember {
  userId: number | string;
  roleInTeam: string;
}

export type TeamStatus = 'Ativa' | 'Inativa';

export interface Team {
  id: number; // Teams might still be numeric? Keeping as number is safer unless we know otherwise, but leaderId is referencing User.
  name: string;
  description: string;
  leaderId: number | string;
  members: TeamMember[];
  status: TeamStatus;
}
