import Button from '@/components/common/Button';
import Confirm from '@/components/common/Confirm';
import StockOperationModal from '@/components/Materials/StockOperationModal';
import { Item } from '@/stores/item.store';
import { useVariantStore, Variant } from '@/stores/variant.store';
import { Minus, PackageOpen, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type MaterialsDetailModalProps = {
   isModalVisible: boolean;
   selectedMaterial: Item;
   variants: Variant[];
   onClose: () => void;
   onOpenAddVariant: () => void;
   fetchPage: (page: number, type_item: number) => Promise<void>;
   page: number;
   fetchByItem: (itemId: number) => Promise<void>;
};

export default function MaterialsDetailModal({
   isModalVisible,
   selectedMaterial,
   variants,
   onClose,
   onOpenAddVariant,
   fetchPage,
   page,
   fetchByItem,
}: MaterialsDetailModalProps) {
   const [stockModalOpen, setStockModalOpen] = useState(false);
   const [stockOperationType, setStockOperationType] = useState<'in' | 'out'>('in');
   const [stockQuantity, setStockQuantity] = useState(0);
   const [selectedVariantIdForSingle, setSelectedVariantIdForSingle] = useState<number | null>(
      null
   );
   const [isBulkOperation, setIsBulkOperation] = useState(true);
   const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
   const [searchVariant, setSearchVariant] = useState('');
   const [isConfirmOpen, setIsConfirmOpen] = useState(false);
   const [pendingIds, setPendingIds] = useState<number[]>([]);

   const { clearByItem } = useVariantStore();

   const handleStockInClick = () => {
      if (selectedVariantIds.length === 0) return;

      setStockOperationType('in');
      setStockQuantity(0);
      setIsBulkOperation(true);
      setSelectedVariantIdForSingle(null);
      setStockModalOpen(true);
   };

   const handleStockOutClick = () => {
      if (selectedVariantIds.length === 0) return;

      setStockOperationType('out');
      setStockQuantity(0);
      setIsBulkOperation(true);
      setSelectedVariantIdForSingle(null);
      setStockModalOpen(true);
   };

   const handleSingleStockInClick = (variantId: number) => {
      setStockOperationType('in');
      setStockQuantity(0);
      setIsBulkOperation(false);
      setSelectedVariantIdForSingle(variantId);
      setStockModalOpen(true);
   };

   const handleSingleStockOutClick = (variantId: number) => {
      setStockOperationType('out');
      setStockQuantity(0);
      setIsBulkOperation(false);
      setSelectedVariantIdForSingle(variantId);
      setStockModalOpen(true);
   };

   const handleStockConfirm = async () => {
      if (isBulkOperation) {
         await window.api.stockMultipleVariants(
            selectedVariantIds,
            stockQuantity,
            stockOperationType
         );
      } else {
         if (!selectedVariantIdForSingle) return;
         await window.api.stockSingleVariant(
            selectedVariantIdForSingle,
            stockQuantity,
            stockOperationType
         );
      }

      clearByItem(selectedMaterial.item_id);
      await fetchByItem(selectedMaterial.item_id);
      await fetchPage(page, 2);
      setStockModalOpen(false);
      setStockQuantity(0);
      setSelectedVariantIdForSingle(null);
   };

   const handleDeleteVariants = () => {
      const variantIdsToDelete = isBulkOperation
         ? selectedVariantIds
         : selectedVariantIdForSingle
           ? [selectedVariantIdForSingle]
           : [];

      if (variantIdsToDelete.length === 0) return;

      setPendingIds(variantIdsToDelete);
      setIsConfirmOpen(true);
   };

   const handleConfirmDelete = async () => {
      try {
         setIsConfirmOpen(false);

         await window.api.deleteVariants(pendingIds);

         setSelectedVariantIds([]);
         clearByItem(selectedMaterial.item_id);
         await fetchByItem(selectedMaterial.item_id);
         await fetchPage(page, 2);
         setStockModalOpen(false);
         setSelectedVariantIdForSingle(null);
      } catch (error) {
         alert('Lỗi khi xóa biến thể');
      }
   };

   const toggleVariant = (id: number) => {
      setSelectedVariantIds((prev) =>
         prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      );
   };

   const toggleAllVariants = () => {
      const variants = filteredVariants;
      setSelectedVariantIds(
         selectedVariantIds.length === variants.length ? [] : variants.map((v) => v.variant_id)
      );
   };

   const filteredVariants = useMemo(() => {
      if (!searchVariant) return variants;

      return variants.filter(
         (v) =>
            v.variant_name.toLowerCase().includes(searchVariant.toLowerCase()) ||
            v.variant_code.toLowerCase().includes(searchVariant.toLowerCase())
      );
   }, [variants, searchVariant]);

   const getSelectedCountForModal = () => {
      if (isBulkOperation) {
         return selectedVariantIds.length;
      } else {
         return 1;
      }
   };

   return (
      <>
         {/* Backdrop */}
         <div
            className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${isModalVisible ? 'opacity-40' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
         />

         {/* Modal */}
         <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isModalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
         >
            <div
               className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl"
               onClick={(e) => e.stopPropagation()}
            >
               {/* Header */}
               <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                     <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                           {selectedMaterial.item_name}
                        </h2>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                           <span>Mã: {selectedMaterial.item_code}</span>
                           <span>•</span>
                           <span>Đơn vị: {selectedMaterial.unit_name}</span>
                           <span>•</span>
                           <span>
                              Tổng số lượng: {selectedMaterial.total_quantity.toLocaleString()}
                           </span>
                        </div>
                     </div>
                     <Button variant="ghost" onClick={onClose}>
                        Đóng
                     </Button>
                  </div>
               </div>

               {/* Content */}
               <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  {/* Search + Actions */}
                  <div className="flex items-center gap-3 mb-6">
                     <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                           type="search"
                           value={searchVariant}
                           onChange={(e) => setSearchVariant(e.target.value)}
                           placeholder="Tìm biến thể..."
                           className="
                              w-full h-10 pl-9 pr-3 py-2 border
                              border-gray-300 rounded-lg text-sm focus:ring-2
                              focus:ring-gray-900 focus:outline-none transition-all
                              placeholder:text-gray-400 focus:border-transparent
                           "
                        />
                     </div>

                     <Button className="flex items-center" onClick={onOpenAddVariant}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm biến thể
                     </Button>

                     <Button
                        variant="secondary"
                        disabled={!selectedVariantIds.length}
                        onClick={handleStockInClick}
                        className="h-10 px-4 flex items-center"
                     >
                        <Plus className="h-4 w-4 mr-1.5" />
                        <span>Nhập</span>
                     </Button>

                     <Button
                        variant="secondary"
                        disabled={!selectedVariantIds.length}
                        onClick={handleStockOutClick}
                        className="h-10 px-4 flex items-center"
                     >
                        <Minus className="h-4 w-4 mr-1.5" />
                        <span>Xuất</span>
                     </Button>

                     <Button
                        variant="secondary"
                        disabled={!selectedVariantIds.length && !selectedVariantIdForSingle}
                        onClick={handleDeleteVariants}
                        className="h-10 px-4 flex items-center"
                     >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        <span>Xoá</span>
                     </Button>
                  </div>

                  {/* Variant Table */}
                  {filteredVariants.length > 0 ? (
                     <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                           <thead className="bg-gray-50">
                              <tr>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                    <input
                                       type="checkbox"
                                       checked={
                                          filteredVariants.length > 0 &&
                                          selectedVariantIds.length === filteredVariants.length
                                       }
                                       onChange={toggleAllVariants}
                                    />
                                 </th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Biến thể
                                 </th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã SKU
                                 </th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số lượng
                                 </th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                 </th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-200">
                              {filteredVariants.map((v: Variant) => (
                                 <tr key={v.variant_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                       <input
                                          type="checkbox"
                                          checked={selectedVariantIds.includes(v.variant_id)}
                                          onChange={() => toggleVariant(v.variant_id)}
                                       />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                       {v.variant_name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{v.variant_code}</td>
                                    <td className="px-6 py-4 font-bold text-center">
                                       {v.quantity.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="flex items-center justify-center gap-2">
                                          <button
                                             onClick={() => handleSingleStockInClick(v.variant_id)}
                                             className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
                                             title="Nhập kho"
                                          >
                                             <Plus className="h-4 w-4" />
                                          </button>
                                          <button
                                             onClick={() => handleSingleStockOutClick(v.variant_id)}
                                             className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                             title="Xuất kho"
                                          >
                                             <Minus className="h-4 w-4" />
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                           <PackageOpen className="h-10 w-10 text-gray-300" />
                        </div>
                        <span className="text-lg font-medium text-gray-500">
                           Không tìm thấy biến thể nào
                        </span>
                        <p className="text-sm text-gray-400 mt-1">
                           Vui lòng kiểm tra lại bộ lọc hoặc thêm mới biến thể
                        </p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Stock Operation Modal */}
         <StockOperationModal
            isOpen={stockModalOpen}
            operationType={stockOperationType}
            quantity={stockQuantity}
            setQuantity={setStockQuantity}
            onConfirm={handleStockConfirm}
            onCancel={() => {
               setStockModalOpen(false);
               setSelectedVariantIdForSingle(null);
            }}
            selectedCount={getSelectedCountForModal()}
         />

         {/* Delete Confirmation Modal */}
         <Confirm
            isOpen={isConfirmOpen}
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa ${pendingIds.length} biến thể đã chọn?`}
            onConfirm={handleConfirmDelete}
            onCancel={() => setIsConfirmOpen(false)}
         />
      </>
   );
}
