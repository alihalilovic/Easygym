import { requests } from '@/api/api';
import {
  CreateDietPlanRequest,
  UpdateDietPlanRequest,
  DietPlan,
  AssignDietPlanRequest,
} from '@/types/DietPlan';

const dietPlanService = {
  getDietPlans: async () => {
    const dietPlans = await requests.get<DietPlan[]>(`/dietplan`);
    return dietPlans;
  },
  getDietPlan: async (dietPlanId: number) => {
    const dietPlan = await requests.get<DietPlan>(`/dietplan/${dietPlanId}`);
    return dietPlan;
  },
  createDietPlan: async (dietPlan: CreateDietPlanRequest) => {
    const newDietPlan = await requests.post<DietPlan>(`/dietplan`, dietPlan);
    return newDietPlan;
  },
  updateDietPlan: async (
    dietPlanId: number,
    dietPlan: UpdateDietPlanRequest,
  ) => {
    const updatedDietPlan = await requests.put<DietPlan>(
      `/dietplan/${dietPlanId}`,
      dietPlan,
    );
    return updatedDietPlan;
  },
  deleteDietPlan: async (dietPlanId: number) => {
    await requests.delete(`/dietplan/${dietPlanId}`);
  },
  assignDietPlan: async (request: AssignDietPlanRequest) => {
    await requests.post(`/dietplan/assign`, request);
  },
  unassignDietPlan: async (dietPlanId: number, clientId: number) => {
    await requests.delete(`/dietplan/${dietPlanId}/unassign/${clientId}`);
  },
  updateAssignmentActive: async (
    dietPlanId: number,
    clientId: number,
    isActive: boolean,
  ) => {
    await requests.put(
      `/dietplan/${dietPlanId}/assignment/${clientId}/active`,
      { isActive },
    );
  },
};

export default dietPlanService;
