import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppSettings {
   limit: number;
   theme: 'light' | 'dark';
   language: 'vi' | 'en';
   autoRefresh: boolean;
   refreshInterval: number;
   logRetention: number;
}

interface SettingsStore {
   settings: AppSettings;
   isLoaded: boolean;
   loadSettings: () => Promise<void>;
   updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
   resetToDefault: () => Promise<void>;
}

const defaultSettings: AppSettings = {
   limit: 8,
   theme: 'light',
   language: 'vi',
   autoRefresh: false,
   refreshInterval: 30,
   logRetention: 3,
};

export const useSettingsStore = create<SettingsStore>()(
   persist(
      (set, get) => ({
         settings: defaultSettings,
         isLoaded: false,

         loadSettings: async () => {
            try {
               const savedSettings = await window.api.readSettings();
               if (savedSettings) {
                  set({
                     settings: { ...defaultSettings, ...savedSettings },
                     isLoaded: true,
                  });
               } else {
                  set({ isLoaded: true });
               }
            } catch (error) {
               console.error('Failed to load settings:', error);
               set({ isLoaded: true });
            }
         },

         updateSettings: async (newSettings: Partial<AppSettings>) => {
            const currentSettings = get().settings;
            const updatedSettings = { ...currentSettings, ...newSettings };

            set({ settings: updatedSettings });

            // Save to file
            await window.api.writeSettings(updatedSettings);
         },

         resetToDefault: async () => {
            set({ settings: defaultSettings });
            await window.api.writeSettings(defaultSettings);
         },
      }),
      {
         name: 'settings-memory-cache',
      }
   )
);
