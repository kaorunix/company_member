export type AccountStatus = 'active' | 'on_leave' | 'retired';

export type EventType =
  | 'hired'
  | 'transferred'
  | 'promoted'
  | 'on_leave'
  | 'returned'
  | 'retired';

export interface Employee {
  id:              number;
  employee_number: string;
  name_kanji:      string;
  name_kana:       string;
  name_initial:    string | null;
  name_alphabet:   string | null;
  email:           string;
  department:      string;
  position:        string;
  account_status:  AccountStatus;
  created_at:      string;
  updated_at:      string;
}

export interface EmployeeListResponse {
  total:     number;
  page:      number;
  per_page:  number;
  employees: Employee[];
}

export interface PersonnelHistory {
  id:              number;
  employee_id:     number;
  event_type:      EventType;
  event_date:      string;
  dept_before:     string | null;
  dept_after:      string | null;
  position_before: string | null;
  position_after:  string | null;
  note:            string | null;
  created_at:      string;
}

export interface EmployeeFormData {
  employee_number: string;
  name_kanji:      string;
  name_kana:       string;
  name_initial:    string;
  name_alphabet:   string;
  email:           string;
  department:      string;
  position:        string;
  account_status:  AccountStatus;
}

export interface ListEmployeesParams {
  name?:           string;
  department?:     string;
  position?:       string;
  account_status?: string;
  page?:           number;
  per_page?:       number;
}

export interface CreateHistoryData {
  event_type:      EventType;
  event_date:      string;
  dept_before?:    string;
  dept_after?:     string;
  position_before?:string;
  position_after?: string;
  note?:           string;
}
