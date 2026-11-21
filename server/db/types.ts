export type UserRole = 'ADMIN' | 'HR' | 'FINANCE' | 'MANAGER' | 'EMPLOYEE';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND';
export type AttendanceSource = 'FACE' | 'KIOSK' | 'MANUAL';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type PayrollStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PAID';
export type DocStatus = 'UPLOADED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
export type SignalStatus = 'OPEN' | 'REVIEWED' | 'DISMISSED';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Company {
  id: string;
  name: string;
  industry?: string;
  timezone: string;
  currency: string;
  settings: {
    face_required: boolean;
    face_threshold: number;
    face_margin: number;
    late_grace_minutes: number;
  };
  created_at: string;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
}

export interface Shift {
  id: string;
  company_id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  working_days: number[];
}

export interface Employee {
  id: string;
  company_id: string;
  user_id?: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department_id?: string;
  designation?: string;
  manager_id?: string;
  shift_id?: string;
  date_of_joining: string;
  status: EmployeeStatus;
  avatar_url?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  company_id: string;
  employee_id: string;
  work_date: string;
  check_in_at?: string;
  check_out_at?: string;
  status: AttendanceStatus;
  source?: AttendanceSource;
  face_confidence?: number;
  minutes_worked?: number;
  note?: string;
}

export interface LeaveType {
  id: string;
  company_id: string;
  code: string;
  name: string;
  annual_quota: number;
  is_paid: boolean;
}

export interface LeaveBalance {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  allocated: number;
  used: number;
}

export interface LeaveRequest {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type_id: string;
  from_date: string;
  to_date: string;
  half_day: boolean;
  days: number;
  reason?: string;
  status: RequestStatus;
  decided_by?: string;
  decided_at?: string;
  decision_note?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  company_id: string;
  actor_user_id?: string;
  actor_role?: UserRole;
  action: string;
  entity?: string;
  entity_id?: string;
  metadata: Record<string, any>;
  ip?: string;
  prev_hash?: string;
  hash: string;
  created_at: string;
}

export interface SessionUser {
  userId: string;
  email: string;
  companyId: string;
  role: UserRole;
  fullName: string;
}
