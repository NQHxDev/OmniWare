import { ipcRenderer, contextBridge } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
   on(...args: Parameters<typeof ipcRenderer.on>) {
      const [channel, listener] = args;
      return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
   },
   off(...args: Parameters<typeof ipcRenderer.off>) {
      const [channel, ...omit] = args;
      return ipcRenderer.off(channel, ...omit);
   },
   send(...args: Parameters<typeof ipcRenderer.send>) {
      const [channel, ...omit] = args;
      return ipcRenderer.send(channel, ...omit);
   },
   invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
      const [channel, ...omit] = args;
      return ipcRenderer.invoke(channel, ...omit);
   },
});

contextBridge.exposeInMainWorld('api', {
   // Setting
   readSettings: () => ipcRenderer.invoke('read-settings'),
   writeSettings: (settings: unknown) => ipcRenderer.invoke('write-settings', settings),

   // Units
   getUnits: () => ipcRenderer.invoke('units:get-all'),
   updateUnit: (unit_id: number, slug: string, name: string) =>
      ipcRenderer.invoke('units:update', unit_id, slug, name),

   // Items
   createItem: (item_name: string, item_code: string, type_id: number, unit_id: number) =>
      ipcRenderer.invoke('items:create', item_name, item_code, type_id, unit_id),
   getItemsPaged: (page: number, limit: number) =>
      ipcRenderer.invoke('items:get-paged', page, limit),
   deleteItem: (item_id: number) => ipcRenderer.invoke('items:delete', item_id),

   // Variant
   getVariantsByItem: (itemId: number) => ipcRenderer.invoke('variants:get-by-item', itemId),
   createVariant: (itemId: number, variantName: string, variantCode: string, quantity: number) =>
      ipcRenderer.invoke('variants:create', itemId, variantName, variantCode, quantity),
   deleteVariants: (variant_ids: number[]) => ipcRenderer.invoke('variants:delete', variant_ids),
   stockSingleVariant: (variant_id: number, quantity: number, operation: 'in' | 'out') =>
      ipcRenderer.invoke('variants:stock-single-variant', variant_id, quantity, operation),
   stockMultipleVariants: (variant_ids: number[], quantity: number, operation: 'in' | 'out') =>
      ipcRenderer.invoke('variants:stock-multiple-variant', variant_ids, quantity, operation),
});
