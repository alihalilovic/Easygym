import WorkoutStore from '@/store/workoutStore';
import WorkoutSessionStore from '@/store/workoutSessionStore';
import InteractionStore from '@/store/interactionStore';
import { createContext, useContext } from 'react';

interface Store {
  workout: WorkoutStore;
  workoutSession: WorkoutSessionStore;
  interactionStore: InteractionStore;
}

export const store: Store = {
  workout: new WorkoutStore(),
  workoutSession: new WorkoutSessionStore(),
  interactionStore: new InteractionStore(),
};

export const StoreContext = createContext<Store>(store);

export const useStore = () => useContext(StoreContext);

export default store;
