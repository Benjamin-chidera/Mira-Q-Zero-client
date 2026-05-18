import { create } from "zustand";

interface AgentStore {
  isSplitScreen: boolean;
  toggleSplitScreen: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  isSplitScreen: false,
  toggleSplitScreen: () =>
    set((state) => ({ isSplitScreen: !state.isSplitScreen })),
}));