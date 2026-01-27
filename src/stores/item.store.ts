import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';

export type Item = {
   item_id: number;
   item_name: string;
   item_code: string;
   item_type: number;
   unit_name: string;
   total_quantity: number;
   is_low_stock: number;
   low_stock_threshold: number;

   count_variant: number;
};

type ItemState = {
   items: Item[];
   page: number;
   limit: number;
   total: number;
   isLoadingItem: boolean;

   fetchPage: (page: number, type_item: number) => Promise<void>;
};

export const useItemStore = create<ItemState>((set) => ({
   items: [],
   page: 1,
   limit: 0,
   total: 0,
   isLoadingItem: false,

   fetchPage: async (page: number, type_item: number) => {
      const settings = useSettingsStore.getState().settings;
      const limitSetting = settings.limit;

      set({ isLoadingItem: true });

      try {
         const { items, total } = await window.api.getItemsPaged(page, type_item, limitSetting);
         set({
            items,
            total,
            limit: limitSetting,
            page,
            isLoadingItem: false,
         });
      } catch (error) {
         console.error('Error fetching items:', error);
         set({ isLoadingItem: false });
      }
   },
}));
