import axios from 'axios';
import { API_URL } from './constants';

const apiClient = axios.create({ baseURL: `${API_URL}/api/v1` });

export const api = {
  createGoal: async (text: string, _priority: string) => (await apiClient.post('/goals/', { title: text, description: text })).data,
  getGoals: async () => (await apiClient.get('/goals/')).data,
  getGoal: async (id: string) => (await apiClient.get(`/goals/${id}`)).data,
  deleteGoal: async (id: string) => (await apiClient.delete(`/goals/${id}`)).data,
  startWorkflow: async (goalId: string) => (await apiClient.post(`/workflows/${goalId}`)).data
};
