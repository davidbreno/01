export type Option = {
  id: string;
  label: string;
};

export async function fetchPatientOptions(limit = 100): Promise<Option[]> {
  const params = new URLSearchParams({ pageSize: String(limit) });
  const response = await fetch(`/api/pacientes?${params.toString()}`);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return (data.items ?? []).map((item: any) => ({ id: item.id, label: item.nome }));
}

export async function fetchDoctorOptions(): Promise<Option[]> {
  const response = await fetch('/api/users/medicos');
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return (data ?? []).map((item: any) => ({ id: item.id, label: item.name }));
}
