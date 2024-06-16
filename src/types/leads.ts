export interface Leads {
    id: string;
    name: string;
    price: string;
    responsible_user_id: string;
    status_id: string;
    created_at: Date | number;
    pipeline_id: string;
  }

  export interface LeadsState {
    leads: Leads[],
    contacts: [],
    loading: boolean,
    error: string | null,
    users: { [key: string]: User },
    statuses: { [key: string]: StatusInfo },
  }

  export interface StatusInfo {
    name: string;
    color: string;
}

  export interface User {
    name: string;
}