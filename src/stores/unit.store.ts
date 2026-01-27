import { create } from 'zustand';

export interface IUnit {
   unit_id: number;
   unit_slug: string;
   unit_name: string;
}

interface UnitState {
   units: IUnit[];
   isLoadingUnit: boolean;
   fetchUnits: () => Promise<void>;
   updateUnit: (id: number, slug: string, name: string) => Promise<void>;
}

export const useUnitStore = create<UnitState>((set) => ({
   units: [],
   isLoadingUnit: false,

   // Hàm load dữ liệu từ Database
   fetchUnits: async () => {
      set({ isLoadingUnit: true });
      try {
         const data = await window.api.getUnits();

         set({ units: data, isLoadingUnit: false });
      } catch (error) {
         console.error('Lỗi load units:', error);
         set({ isLoadingUnit: false });
      }
   },

   // Hàm cập nhật
   updateUnit: async (id, slug, name) => {
      await window.api.updateUnit(id, slug, name);
      // Sau khi update ở DB, fetch lại dữ liệu mới nhất
      const { fetchUnits } = useUnitStore.getState();
      await fetchUnits();
   },
}));
