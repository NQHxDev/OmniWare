/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />
interface Window {
   api: {
      // Setting
      readSettings: () => Promise<any[]>;
      writeSettings: (updatedSettings) => Promise<any>;

      // Unit
      getUnits: () => Promise<any[]>;
      updateUnit: (unit_id: number, slug: string, name: string) => Promise<any>;

      // Item
      createItem: (
         item_name: string,
         item_code: string,
         type_id: number,
         unit_id: number,
         low_stock_threshold: number
      ) => Promise<any>;
      updateItem: (
         item_id: number,
         item_name: string,
         item_code: string,
         unit_id: number,
         low_stock_threshold: number
      ) => Promise<any>;
      getItemsPaged: (page: number, type_item, limit: number) => Promise<any>;
      deleteItem: (item_id: number) => Promise<any>;
      stockInventoryItem: (
         item_id: number,
         quantity: number,
         operation: 'in' | 'out'
      ) => Promise<any>;

      // Variant
      getVariantsByItem: (itemId: number) => Promise<any>;
      createVariant: (
         item_id: number,
         variant_name: string,
         variant_code: string,
         quantity: number
      ) => Promise<any>;
      addVariant: (item_id: number, variant: unknown) => Promise<any>;
      stockMultipleVariants: (
         variant_ids: number[],
         quantity: number,
         operation: 'in' | 'out'
      ) => Promise<any>;
      stockSingleVariant: (
         variant_id: number,
         quantity: number,
         operation: 'in' | 'out'
      ) => Promise<any>;

      deleteVariants: (variantIdsToDelete: number[]) => Promise<any>;
   };
}
