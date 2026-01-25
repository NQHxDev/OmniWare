import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';

export type Item = {
   item_id: number;
   item_name: string;
   item_code: string;
   item_type: number;
   total_quantity: number;
   count_variant: number;
};

type ItemState = {
   items: Item[];
   page: number;
   limit: number;
   total: number;
   isLoadingItem: boolean;

   fetchPage: (page: number) => Promise<void>;
};

export const useItemStore = create<ItemState>((set) => ({
   items: [],
   page: 1,
   limit: 0,
   total: 0,
   isLoadingItem: false,

   fetchPage: async (page: number) => {
      const settings = useSettingsStore.getState().settings;
      const limitSetting = settings.limit;

      set({ isLoadingItem: true });

      const { items, total } = await window.api.getItemsPaged(page, limitSetting);

      set({
         items,
         total,
         limit: limitSetting,
         page,
         isLoadingItem: false,
      });
   },
}));
