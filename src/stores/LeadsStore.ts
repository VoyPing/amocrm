import { defineStore } from 'pinia';
import axios from 'axios';
import { Leads, LeadsState, StatusInfo, User } from '../types/leads';

const api = axios.create({
    baseURL: `/api/v4`,
    headers: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImFhZmU4MjE0ZDUyYzQ0MDc0NTM5MTlhZGYwZmVmMzkwNzZjYjZlZWQ4ZGM5MTBiMmJjNGU0NzdjNDM1OTExNzE5ODM5NjkyMzhkNTZiYTJiIn0.eyJhdWQiOiIxOGNmNmQ0My0yMjhmLTQ1NzItYjY0Ny1hMTU4ZDAyNzdmODkiLCJqdGkiOiJhYWZlODIxNGQ1MmM0NDA3NDUzOTE5YWRmMGZlZjM5MDc2Y2I2ZWVkOGRjOTEwYjJiYzRlNDc3YzQzNTkxMTcxOTgzOTY5MjM4ZDU2YmEyYiIsImlhdCI6MTcxODIwNDE1OCwibmJmIjoxNzE4MjA0MTU4LCJleHAiOjE3MTkyNzM2MDAsInN1YiI6IjExMTUwNTI2IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxNzk2NTE4LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMTgyNzgwYmMtYzk0Yy00YTlmLWI0ZDktMzJkZjJhMTdhZGI4In0.B_GNMwk6oMmrF0bg4ydTA45hRPTdTaQAv_Oe4hBN-3r3xMyv8vs0Y7dOS7JWFExj3Q5IElWjlAYkj10B3kWYBS5jPgLYSuYQECKddeVGmBmfUjTaw3BluzXmk020-IJKjtqdI5Pho2GkYXcLLj-pKOC-ktIGl2tS9y-JTjj761P0ckEX_D08g73sIMqIaxncibVO3Uysbkrzz1YKVBQc7OrqpmYw9zKyEIYF9asE9heZgBWNhOsKG-5zxmc6xRr3FZUM3kogSgeOxH3JhUYN6BnVzwwfoLOnHVvBSLpnjcbebNSrJRSmVHKvvAeb_PySiPlUFPdv312Uunbrxwis4A',    }
});

export const useLeadsStore = defineStore('leadsStore', {
    state: (): LeadsState => ({
        leads: [] as Leads[],
        contacts: [],
        statuses: {} as { [key: string]: StatusInfo },
        users: {} as { [key: string]: User },
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async fetchLeads(query: string = '') {
            this.loading = true;
            try {
                const response = await api.get(`/leads?query=${query}`);
                this.leads = response.data._embedded.leads;
                await this.fetchStatuses();
                await this.fetchUsers();
            } catch (error: any) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async fetchStatuses() {
            try {
                const pipelineIds = [...new Set(this.leads.map(lead => lead.pipeline_id))];
                for (const pipelineId of pipelineIds) {
                    const statusesPromises = this.leads
                        .filter(lead => lead.pipeline_id === pipelineId)
                        .map(async lead => {
                            const statusResponse = await api.get(`/leads/pipelines/${pipelineId}/statuses/${lead.status_id}`);
                            const statusData = statusResponse.data;
                            return { statusId: lead.status_id, statusInfo: { name: statusData.name, color: statusData.color } };
                        });

                    const statuses = await Promise.all(statusesPromises);
                    statuses.forEach(status => {
                        this.statuses[status.statusId] = status.statusInfo;
                    });
                }
            } catch (error: any) {
                this.error = error.message;
            }
        },
        async fetchUsers() {
            try {
                const userIds = [...new Set(this.leads.map(lead => lead.responsible_user_id))];
                for (const userId of userIds) {
                    const userResponse = await api.get(`/users/${userId}`);
                    const userData = userResponse.data;
                    this.users[userId] = userData;
                }
            } catch (error: any) {
                this.error = error.message;
            }
        },
        async fetchLeadContacts(dealId: number) {
            this.loading = true;
            try {
                const response = await api.get(`/leads/${dealId}/links`);
                this.contacts = response.data._embedded.contacts;
            } catch (error: any) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    }
});
