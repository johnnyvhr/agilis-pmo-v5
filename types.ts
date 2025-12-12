
export enum ProjectStatus {
  EmPlanejamento = 'Em Planejamento',
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluído',
  Cancelado = 'Cancelado',
  Atrasado = 'Atrasado',
  EmDia = 'Em Dia',
}

export interface Project {
  id: number;
  name: string;
  description: string;
  manager: string;
  client: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  departmentBudgets: Record<string, number>;
  contractAdditives: number[];
  associatedTeamIds?: number[];
}

export interface Medicao {
  id: number;
  projeto: string;
  item: string;
  qtd: number;
  unidade: string;
  valorUnitario: number;
  data: string;
  departamento: string;
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
  Admin = 'Administrador',
  PMOManager = 'Gestor do PMO',
  ProjectManager = 'Gerente de Projeto',
  TeamMember = 'Membro da Equipe',
  Stakeholder = 'Stakeholder',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: 'Ativo' | 'Pendente';
}

export interface TeamMember {
  userId: number;
  roleInTeam: string;
}

export type TeamStatus = 'Ativa' | 'Inativa';

export interface Team {
  id: number;
  name: string;
  description: string;
  leaderId: number;
  members: TeamMember[];
  status: TeamStatus;
}
