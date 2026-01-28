import { ipcRenderer, contextBridge } from 'electron';
import {
   GetTransactionsParams,
   CreateTransactionParams,
} from './database/repositories/transaction.repo';

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
   createItem: (
      item_name: string,
      item_code: string,
      type_id: number,
      unit_id: number,
      low_stock_threshold: number
   ) =>
      ipcRenderer.invoke(
         'items:create',
         item_name,
         item_code,
         type_id,
         unit_id,
         low_stock_threshold
      ),
   updateItem: (
      item_id: number,
      item_name: string,
      item_code: string,
      unit_id: number,
      low_stock_threshold: number
   ) =>
      ipcRenderer.invoke(
         'items:update',
         item_id,
         item_name,
         item_code,
         unit_id,
         low_stock_threshold
      ),
   getItemsPaged: (page: number, type_item: number, limit: number) =>
      ipcRenderer.invoke('items:get-paged', page, type_item, limit),
   deleteItem: (item_id: number) => ipcRenderer.invoke('items:delete', item_id),
   stockInventoryItem: (item_id: number, quantity: number, operation: 'in' | 'out') =>
      ipcRenderer.invoke('items:stock-inventory', item_id, quantity, operation),
   countItem: (type_item: number) => ipcRenderer.invoke('item:get-count', type_item),
   getItemLowStock: (type_item: number) => ipcRenderer.invoke('item:get-low-stock', type_item),
   existedItemCode: (item_code: string) => ipcRenderer.invoke('item:exits-code', item_code),

   // Variant
   getVariantsByItem: (itemId: number) => ipcRenderer.invoke('variants:get-by-item', itemId),
   createVariant: (itemId: number, variantName: string, variantCode: string, quantity: number) =>
      ipcRenderer.invoke('variants:create', itemId, variantName, variantCode, quantity),
   deleteVariants: (variant_ids: number[]) => ipcRenderer.invoke('variants:delete', variant_ids),
   stockSingleVariant: (variant_id: number, quantity: number, operation: 'in' | 'out') =>
      ipcRenderer.invoke('variants:stock-single-variant', variant_id, quantity, operation),
   stockMultipleVariants: (variant_ids: number[], quantity: number, operation: 'in' | 'out') =>
      ipcRenderer.invoke('variants:stock-multiple-variant', variant_ids, quantity, operation),
   existedVariantCode: (item_id: number, variant_code: string) =>
      ipcRenderer.invoke('variants:exits-code', item_id, variant_code),

   // Transaction
   getTransactions: (params: GetTransactionsParams) =>
      ipcRenderer.invoke('transaction:get-transactions', params),
   createTransaction: (params: CreateTransactionParams) =>
      ipcRenderer.invoke('transaction:create', params),
   getTodayNetFlow: () => ipcRenderer.invoke('transaction:today-net-flow'),
});
