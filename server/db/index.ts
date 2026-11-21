import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  Company,
  Department,
  Shift,
  Employee,
  LeaveType,
  AuditLog,
  UserRole,
} from './types';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient | null = null;
let useCloudDb = false;

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.warn('[DB] Could not initialize Supabase client:', err);
  }
}

// Local Persistent Store Path
const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface LocalStore {
  companies: Company[];
  departments: Department[];
  shifts: Shift[];
  employees: Employee[];
  leave_types: LeaveType[];
  audit_logs: AuditLog[];
}

// Initial Seed for Local Seam
const defaultStore: LocalStore = {
  companies: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'WorkTak Enterprise Demo',
      industry: 'Software & AI',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      settings: {
        face_required: true,
        face_threshold: 0.5,
        face_margin: 0.05,
        late_grace_minutes: 10,
      },
      created_at: new Date().toISOString(),
    },
  ],
  departments: [
    { id: '00000000-0000-0000-0000-000000000011', company_id: '00000000-0000-0000-0000-000000000001', name: 'Engineering' },
    { id: '00000000-0000-0000-0000-000000000012', company_id: '00000000-0000-0000-0000-000000000001', name: 'Product' },
    { id: '00000000-0000-0000-0000-000000000013', company_id: '00000000-0000-0000-0000-000000000001', name: 'Human Resources' },
    { id: '00000000-0000-0000-0000-000000000014', company_id: '00000000-0000-0000-0000-000000000001', name: 'Finance' },
  ],
  shifts: [
    {
      id: '00000000-0000-0000-0000-000000000021',
      company_id: '00000000-0000-0000-0000-000000000001',
      name: 'General Shift',
      start_time: '09:30',
      end_time: '18:30',
      grace_minutes: 10,
      working_days: [1, 2, 3, 4, 5],
    },
  ],
  employees: [
    {
      id: '00000000-0000-0000-0000-000000000101',
      company_id: '00000000-0000-0000-0000-000000000001',
      employee_code: 'EMP001',
      full_name: 'Alex Vance',
      email: 'admin@worktak.demo',
      role: 'ADMIN',
      department_id: '00000000-0000-0000-0000-000000000011',
      designation: 'Chief Executive Officer',
      shift_id: '00000000-0000-0000-0000-000000000021',
      date_of_joining: '2025-01-01',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000102',
      company_id: '00000000-0000-0000-0000-000000000001',
      employee_code: 'EMP002',
      full_name: 'Priya Sharma',
      email: 'hr@worktak.demo',
      role: 'HR',
      department_id: '00000000-0000-0000-0000-000000000013',
      designation: 'HR Director',
      shift_id: '00000000-0000-0000-0000-000000000021',
      date_of_joining: '2025-01-15',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000103',
      company_id: '00000000-0000-0000-0000-000000000001',
      employee_code: 'EMP003',
      full_name: 'David Miller',
      email: 'finance@worktak.demo',
      role: 'FINANCE',
      department_id: '00000000-0000-0000-0000-000000000014',
      designation: 'Head of Accounts & Payroll',
      shift_id: '00000000-0000-0000-0000-000000000021',
      date_of_joining: '2025-02-01',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000104',
      company_id: '00000000-0000-0000-0000-000000000001',
      employee_code: 'EMP004',
      full_name: 'Vikram Malhotra',
      email: 'manager@worktak.demo',
      role: 'MANAGER',
      department_id: '00000000-0000-0000-0000-000000000011',
      designation: 'Engineering Lead',
      shift_id: '00000000-0000-0000-0000-000000000021',
      date_of_joining: '2025-02-15',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000105',
      company_id: '00000000-0000-0000-0000-000000000001',
      employee_code: 'EMP005',
      full_name: 'Arjun Verma',
      email: 'employee@worktak.demo',
      role: 'EMPLOYEE',
      department_id: '00000000-0000-0000-0000-000000000011',
      designation: 'Senior AI Engineer',
      manager_id: '00000000-0000-0000-0000-000000000104',
      shift_id: '00000000-0000-0000-0000-000000000021',
      date_of_joining: '2025-03-01',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
  ],
  leave_types: [
    { id: '1', company_id: '00000000-0000-0000-0000-000000000001', code: 'CL', name: 'Casual Leave', annual_quota: 12, is_paid: true },
    { id: '2', company_id: '00000000-0000-0000-0000-000000000001', code: 'SL', name: 'Sick Leave', annual_quota: 10, is_paid: true },
    { id: '3', company_id: '00000000-0000-0000-0000-000000000001', code: 'EL', name: 'Earned Leave', annual_quota: 15, is_paid: true },
    { id: '4', company_id: '00000000-0000-0000-0000-000000000001', code: 'UL', name: 'Unpaid Leave', annual_quota: 0, is_paid: false },
  ],
  audit_logs: [],
};

function readStore(): LocalStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(defaultStore, null, 2), 'utf-8');
    return defaultStore;
  }
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return defaultStore;
  }
}

function writeStore(data: LocalStore) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Check whether Supabase tables are ready
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.from('companies').select('id').limit(1);
    if (!error) {
      useCloudDb = true;
      console.log('[DB] Connected to live Supabase Postgres schema.');
      return true;
    }
  } catch (err) {
    // Cloud schema not yet created
  }
  useCloudDb = false;
  return false;
}

// ---------------- DATA LAYER METHODS ----------------

export async function getCompany(id?: string): Promise<Company | null> {
  if (useCloudDb && supabase) {
    const query = supabase.from('companies').select('*');
    if (id) query.eq('id', id);
    const { data, error } = await query.limit(1).single();
    if (!error && data) return data as Company;
  }
  const store = readStore();
  if (id) {
    return store.companies.find((c) => c.id === id) || null;
  }
  return store.companies[0] || null;
}

export async function getAllCompanies(): Promise<Company[]> {
  if (useCloudDb && supabase) {
    const { data, error } = await supabase.from('companies').select('*');
    if (!error && data) return data as Company[];
  }
  const store = readStore();
  return store.companies;
}

export async function createCompany(companyData: Partial<Company>): Promise<Company> {
  const newCompany: Company = {
    id: companyData.id || crypto.randomUUID(),
    name: companyData.name || 'New Company',
    industry: companyData.industry,
    timezone: companyData.timezone || 'Asia/Kolkata',
    currency: companyData.currency || 'INR',
    settings: companyData.settings || {
      face_required: true,
      face_threshold: 0.5,
      face_margin: 0.05,
      late_grace_minutes: 10,
    },
    created_at: new Date().toISOString(),
  };

  if (useCloudDb && supabase) {
    const { data, error } = await supabase.from('companies').insert(newCompany).select().single();
    if (!error && data) return data as Company;
  }

  const store = readStore();
  store.companies.push(newCompany);
  writeStore(store);
  return newCompany;
}

export async function getEmployeeByEmail(email: string): Promise<Employee | null> {
  const normEmail = email.toLowerCase().trim();
  if (useCloudDb && supabase) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .ilike('email', normEmail)
      .limit(1)
      .single();
    if (!error && data) return data as Employee;
  }
  const store = readStore();
  return store.employees.find((e) => e.email.toLowerCase() === normEmail) || null;
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  if (useCloudDb && supabase) {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).limit(1).single();
    if (!error && data) return data as Employee;
  }
  const store = readStore();
  return store.employees.find((e) => e.id === id) || null;
}

export async function listEmployees(
  companyId: string,
  userRole?: UserRole,
  managerId?: string,
  selfId?: string
): Promise<Employee[]> {
  if (useCloudDb && supabase) {
    let query = supabase.from('employees').select('*').eq('company_id', companyId);
    if (userRole === 'MANAGER' && managerId) {
      query = query.or(`manager_id.eq.${managerId},id.eq.${managerId}`);
    } else if (userRole === 'EMPLOYEE' && selfId) {
      query = query.eq('id', selfId);
    }
    const { data, error } = await query;
    if (!error && data) return data as Employee[];
  }

  const store = readStore();
  let emps = store.employees.filter((e) => e.company_id === companyId);
  if (userRole === 'MANAGER' && managerId) {
    emps = emps.filter((e) => e.manager_id === managerId || e.id === managerId);
  } else if (userRole === 'EMPLOYEE' && selfId) {
    emps = emps.filter((e) => e.id === selfId);
  }
  return emps;
}

export async function createEmployee(empData: Partial<Employee>): Promise<Employee> {
  const newEmp: Employee = {
    id: empData.id || crypto.randomUUID(),
    company_id: empData.company_id!,
    employee_code: empData.employee_code || `EMP${Math.floor(100 + Math.random() * 900)}`,
    full_name: empData.full_name || 'New Employee',
    email: empData.email!.toLowerCase().trim(),
    phone: empData.phone,
    role: empData.role || 'EMPLOYEE',
    department_id: empData.department_id,
    designation: empData.designation,
    manager_id: empData.manager_id,
    shift_id: empData.shift_id,
    date_of_joining: empData.date_of_joining || new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  if (useCloudDb && supabase) {
    const { data, error } = await supabase.from('employees').insert(newEmp).select().single();
    if (!error && data) return data as Employee;
  }

  const store = readStore();
  store.employees.push(newEmp);
  writeStore(store);
  return newEmp;
}

export async function logAudit(data: {
  company_id: string;
  actor_user_id?: string;
  actor_role?: UserRole;
  action: string;
  entity?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  ip?: string;
}): Promise<AuditLog> {
  const store = readStore();
  // Get last entry for this specific company to maintain per-company cryptographic integrity
  const companyLogs = store.audit_logs.filter((l) => l.company_id === data.company_id);
  const lastEntry = companyLogs[companyLogs.length - 1];
  const prev_hash = lastEntry ? lastEntry.hash : 'GENESIS_HASH_WORKTAK_000';
  const created_at = new Date().toISOString();

  // SHA-256 hash chaining formula per schema:
  // hash = sha256(prev_hash || company_id || actor || action || entity || entity_id || metadata || created_at)
  const hashPayload = `${prev_hash}|${data.company_id}|${data.actor_user_id || 'SYSTEM'}|${data.action}|${
    data.entity || ''
  }|${data.entity_id || ''}|${JSON.stringify(data.metadata || {})}|${created_at}`;

  const hash = crypto.createHash('sha256').update(hashPayload).digest('hex');

  const entry: AuditLog = {
    id: store.audit_logs.length + 1,
    company_id: data.company_id,
    actor_user_id: data.actor_user_id,
    actor_role: data.actor_role,
    action: data.action,
    entity: data.entity,
    entity_id: data.entity_id,
    metadata: data.metadata || {},
    ip: data.ip,
    prev_hash,
    hash,
    created_at,
  };

  store.audit_logs.push(entry);
  writeStore(store);

  if (useCloudDb && supabase) {
    try {
      await supabase.from('audit_logs').insert(entry);
    } catch (e) {
      // cloud insert fallback
    }
  }

  return entry;
}

export async function verifyAuditChain(companyId: string): Promise<{ valid: boolean; checked: number; errorAt?: number }> {
  const store = readStore();
  const logs = store.audit_logs.filter((l) => l.company_id === companyId);
  let prevHash = 'GENESIS_HASH_WORKTAK_000';

  if (logs.length === 0) {
    return { valid: true, checked: 0 };
  }

  for (let i = 0; i < logs.length; i++) {
    const l = logs[i];
    if (l.prev_hash !== prevHash) {
      return { valid: false, checked: i, errorAt: l.id };
    }
    const hashPayload = `${prevHash}|${l.company_id}|${l.actor_user_id || 'SYSTEM'}|${l.action}|${
      l.entity || ''
    }|${l.entity_id || ''}|${JSON.stringify(l.metadata || {})}|${l.created_at}`;
    const expectedHash = crypto.createHash('sha256').update(hashPayload).digest('hex');
    if (l.hash !== expectedHash) {
      return { valid: false, checked: i, errorAt: l.id };
    }
    prevHash = l.hash;
  }
  return { valid: true, checked: logs.length };
}

// Check connection at boot
checkSupabaseConnection().catch(() => {});
