import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SystemSettings, DEFAULT_SETTINGS } from "@/types/settings";

interface SettingsState {
  settings: SystemSettings;
  
  // Update settings
  updateSettings: (updates: Partial<SystemSettings>) => void;
  resetSettings: () => void;
  
  // Getters
  getSetting: <K extends keyof SystemSettings>(key: K) => SystemSettings[K];
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },

      getSetting: (key) => {
        return get().settings[key];
      },
    }),
    {
      name: "geo-nexus-settings",
    }
  )
);
