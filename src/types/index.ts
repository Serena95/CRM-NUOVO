export type UserRole = 'admin' | 'manager' | 'sales' | 'support';

export interface Tenant {
  id: string;
  name: string;
  createdAt: any;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface UserProfile {
  id: string;
  uid: string;
  tenantId: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  probability?: number;
}

export interface Lead {
  id: string;
  tenantId: string;
  title: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  emails: string[];
  phones: string[];
  whatsapp?: string;
  telegram?: string;
  website?: string;
  source?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  value: number;
  currency: string;
  pipelineId: string;
  stageId: string;
  assignedTo?: string;
  probability?: number;
  status: 'active' | 'converted' | 'junk';
  tags: string[];
  notes: string;
  attachments: string[];
  createdAt: any;
  updatedAt: any;
  lastActivityAt?: any;
  nextActivityAt?: any;
}

export interface Deal {
  id: string;
  tenantId: string;
  title: string;
  pipelineId: string;
  stageId: string;
  value: number;
  currency: string;
  probability: number;
  assignedTo?: string;
  contactId?: string;
  companyId?: string;
  products: ProductItem[];
  discount: number;
  tax: number;
  total: number;
  closingDate?: any;
  tags: string[];
  notes: string;
  attachments: string[];
  createdAt: any;
  updatedAt: any;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Contact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  companyId?: string;
  role?: string;
  emails: string[];
  phones: string[];
  whatsapp?: string;
  telegram?: string;
  linkedin?: string;
  address?: string;
  tags: string[];
  notes: string;
  createdAt: any;
  updatedAt: any;
}

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  industry?: string;
  employees?: number;
  revenue?: number;
  phone?: string;
  email?: string;
  website?: string;
  vatNumber?: string;
  address?: string;
  tags: string[];
  notes: string;
  createdAt: any;
  updatedAt: any;
}

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  assignedTo: string;
  collaborators: string[];
  checklist: ChecklistItem[];
  subtasks: string[]; // IDs of subtasks
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: any;
  status: 'pending' | 'in-progress' | 'completed' | 'deferred';
  attachments: string[];
  comments: TaskComment[];
  creatorId: string;
  createdAt: any;
  updatedAt: any;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  text: string;
  createdAt: any;
}

export interface Activity {
  id: string;
  tenantId: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description: string;
  date: any;
  duration?: number; // in minutes
  assignedTo: string;
  status: 'planned' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  relatedTo: 'lead' | 'deal' | 'contact' | 'company';
  relatedId: string;
  createdAt: any;
}

export interface Message {
  id: string;
  tenantId: string;
  channelId: string;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  content: string;
  createdAt: any;
}

export interface Automation {
  id: string;
  tenantId: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  active: boolean;
}

export interface AutomationTrigger {
  type: 'lead_created' | 'deal_created' | 'stage_changed' | 'inactivity' | 'date_reached' | 'field_updated' | 'activity_completed';
  config: any;
}

export interface AutomationAction {
  type: 'create_task' | 'send_email' | 'notify' | 'assign_user' | 'change_stage' | 'update_field' | 'delay' | 'webhook';
  config: any;
}
