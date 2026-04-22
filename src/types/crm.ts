export interface CRMStructure {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface CRMStage {
  id: string;
  structure_id: string | null; // null if it's a shared stage
  name: string;
  position: number;
  is_won: boolean;
  is_lost: boolean;
  color?: string;
}

export interface CRMDeal {
  id: string;
  structure_id: string;
  stage_id: string;
  title: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  value: number;
  assigned_to: string;
  preanalysis_result: PreanalysisResult | null;
  custom_fields: Record<string, any>;
  form_source?: string;
  created_at: string;
}

export interface PreanalysisResult {
  score: number;
  result: string;
  company_data: {
    name: string;
    vat?: string;
    industry?: string;
    size?: string;
  };
  contact_data: {
    name: string;
    phone: string;
    email: string;
  };
  request_type: string;
  budget: number;
  service_requested: string;
  notes: string;
  estimated_amount: number;
  auto_notes: string[];
  submission_date: string;
}

export interface CRMFormResult {
  id: string;
  structure_slug: string;
  form_url: string;
  payload: Record<string, any>;
  score: number;
  result: string;
  created_at: string;
}
