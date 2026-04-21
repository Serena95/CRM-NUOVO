import { 
  GitBranch, 
  DollarSign, 
  Globe, 
  Info, 
  Calendar, 
  Store, 
  UserCog, 
  Users2, 
  Smartphone, 
  TrendingUp 
} from 'lucide-react';

export interface PipelineDefinition {
  id: string;
  name: string;
  icon: any;
  color: string;
}

export const CRM_PIPELINES: PipelineDefinition[] = [
  { id: 'GENERALE', name: 'Generali', icon: GitBranch, color: '#3b82f6' },
  { id: 'FINANZA_AGEVOLATA', name: 'Finanza Agevolata', icon: DollarSign, color: '#10b981' },
  { id: 'DIGITALE', name: 'Servizi Digitali', icon: Globe, color: '#06b6d4' },
  { id: 'CONSULENZE', name: 'Consulenze', icon: Info, color: '#8b5cf6' },
  { id: 'ECONOMIE', name: 'Economie', icon: TrendingUp, color: '#64748b' },
  { id: 'EVENTI', name: 'Organizzazione Eventi', icon: Calendar, color: '#f59e0b' },
  { id: 'PRODOTTI', name: 'Prodotti e servizi', icon: Store, color: '#ec4899' },
  { id: 'FORMAZIONE', name: 'Formazione', icon: UserCog, color: '#f43f5e' },
  { id: 'COWORKING', name: 'Coworking', icon: Users2, color: '#8b5cf6' },
  { id: 'PRENOTAZIONI', name: 'Prenotazioni Online', icon: Smartphone, color: '#10b981' },
];

export const DEFAULT_STAGES = [
  { id: 'new', name: 'Nuovo', color: '#94a3b8', order: 0 },
  { id: 'contacted', name: 'Contattato', color: '#3b82f6', order: 1 },
  { id: 'meeting', name: 'Incontro', color: '#8b5cf6', order: 2 },
  { id: 'proposal', name: 'Proposta', color: '#f59e0b', order: 3 },
  { id: 'negotiation', name: 'Negoziazione', color: '#06b6d4', order: 4 },
  { id: 'won', name: 'Vinto', color: '#10b981', order: 5 },
  { id: 'lost', name: 'Perso', color: '#ef4444', order: 6 },
];
