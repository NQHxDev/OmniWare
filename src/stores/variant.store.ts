import { create } from 'zustand';

export type Variant = {
   variant_id: number;
   variant_name: string;
   variant_code: string;
   quantity: number;
};

type VariantState = {
   variantsByItem: Record<number, Variant[]>;
   loadingItemIds: number[];

   fetchByItem: (itemId: number) => Promise<void>;
   addVariant: (itemId: number, variant: Variant) => void;
   clearByItem: (itemId: number) => void;
};

export const useVariantStore = create<VariantState>((set, get) => ({
   variantsByItem: {},
   loadingItemIds: [],

   async fetchByItem(itemId) {
      const { variantsByItem, loadingItemIds } = get();

      if (variantsByItem[itemId]) return;

      if (loadingItemIds.includes(itemId)) return;

      set({ loadingItemIds: [...loadingItemIds, itemId] });

      try {
         const data = await window.api.getVariantsByItem(itemId);

         set((state) => ({
            variantsByItem: {
               ...state.variantsByItem,
               [itemId]: data,
            },
         }));
      } finally {
         set((state) => ({
            loadingItemIds: state.loadingItemIds.filter((id) => id !== itemId),
         }));
      }
   },

   addVariant(itemId: number, variant: Variant) {
      set((state) => ({
         variantsByItem: {
            ...state.variantsByItem,
            [itemId]: [...(state.variantsByItem[itemId] || []), variant],
         },
      }));
   },

   clearByItem(itemId) {
      set((state) => {
         const clone = { ...state.variantsByItem };
         delete clone[itemId];
         return { variantsByItem: clone };
      });
   },
}));
