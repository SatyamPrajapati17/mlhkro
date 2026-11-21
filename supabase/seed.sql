-- WorkTak Demo Seed Script

DO $$
DECLARE
  v_company_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_dept_eng uuid := '00000000-0000-0000-0000-000000000011'::uuid;
  v_dept_prod uuid := '00000000-0000-0000-0000-000000000012'::uuid;
  v_dept_hr uuid := '00000000-0000-0000-0000-000000000013'::uuid;
  v_dept_fin uuid := '00000000-0000-0000-0000-000000000014'::uuid;
  v_shift_gen uuid := '00000000-0000-0000-0000-000000000021'::uuid;
  
  v_emp_admin uuid := '00000000-0000-0000-0000-000000000101'::uuid;
  v_emp_hr uuid := '00000000-0000-0000-0000-000000000102'::uuid;
  v_emp_fin uuid := '00000000-0000-0000-0000-000000000103'::uuid;
  v_emp_mgr uuid := '00000000-0000-0000-0000-000000000104'::uuid;
  v_emp_dev uuid := '00000000-0000-0000-0000-000000000105'::uuid;
BEGIN
  -- Company
  INSERT INTO companies (id, name, industry, timezone, currency)
  VALUES (v_company_id, 'WorkTak Enterprise Demo', 'Software & AI', 'Asia/Kolkata', 'INR')
  ON CONFLICT (id) DO NOTHING;

  -- Departments
  INSERT INTO departments (id, company_id, name) VALUES
    (v_dept_eng, v_company_id, 'Engineering'),
    (v_dept_prod, v_company_id, 'Product'),
    (v_dept_hr, v_company_id, 'Human Resources'),
    (v_dept_fin, v_company_id, 'Finance')
  ON CONFLICT DO NOTHING;

  -- Shifts
  INSERT INTO shifts (id, company_id, name, start_time, end_time, grace_minutes) VALUES
    (v_shift_gen, v_company_id, 'General Shift', '09:30', '18:30', 10)
  ON CONFLICT DO NOTHING;

  -- Core 5 Role Employees
  INSERT INTO employees (id, company_id, employee_code, full_name, email, role, department_id, designation, shift_id) VALUES
    (v_emp_admin, v_company_id, 'EMP001', 'Alex Vance', 'admin@worktak.demo', 'ADMIN', v_dept_eng, 'Chief Executive Officer', v_shift_gen),
    (v_emp_hr, v_company_id, 'EMP002', 'Priya Sharma', 'hr@worktak.demo', 'HR', v_dept_hr, 'HR Director', v_shift_gen),
    (v_emp_fin, v_company_id, 'EMP003', 'David Miller', 'finance@worktak.demo', 'FINANCE', v_dept_fin, 'Head of Accounts', v_shift_gen),
    (v_emp_mgr, v_company_id, 'EMP004', 'Vikram Malhotra', 'manager@worktak.demo', 'MANAGER', v_dept_eng, 'Engineering Manager', v_shift_gen),
    (v_emp_dev, v_company_id, 'EMP005', 'Arjun Verma', 'employee@worktak.demo', 'EMPLOYEE', v_dept_eng, 'Staff AI Engineer', v_shift_gen)
  ON CONFLICT (company_id, email) DO NOTHING;

  -- Set manager link
  UPDATE employees SET manager_id = v_emp_mgr WHERE id = v_emp_dev;
END $$;
