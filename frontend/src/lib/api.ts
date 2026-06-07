import type {
  CreateHistoryData,
  Employee,
  EmployeeFormData,
  EmployeeListResponse,
  ListEmployeesParams,
  PersonnelHistory,
} from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `HTTP ${res.status}`
    );
  }
  return res.json();
}

export const api = {
  employees: {
    list(params: ListEmployeesParams): Promise<EmployeeListResponse> {
      const q = new URLSearchParams();
      if (params.name)           q.set('name', params.name);
      if (params.department)     q.set('department', params.department);
      if (params.position)       q.set('position', params.position);
      if (params.account_status) q.set('account_status', params.account_status);
      if (params.page)           q.set('page', String(params.page));
      if (params.per_page)       q.set('per_page', String(params.per_page));
      return request<EmployeeListResponse>(`/employees?${q}`);
    },
    get(id: number): Promise<Employee> {
      return request<Employee>(`/employees/${id}`);
    },
    create(data: Omit<EmployeeFormData, never>): Promise<Employee> {
      return request<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: number, data: Partial<EmployeeFormData>): Promise<Employee> {
      return request<Employee>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },
  histories: {
    list(employeeId: number): Promise<PersonnelHistory[]> {
      return request<PersonnelHistory[]>(`/employees/${employeeId}/histories`);
    },
    create(
      employeeId: number,
      data: CreateHistoryData
    ): Promise<PersonnelHistory> {
      return request<PersonnelHistory>(
        `/employees/${employeeId}/histories`,
        { method: 'POST', body: JSON.stringify(data) }
      );
    },
  },
};
