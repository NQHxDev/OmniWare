import Button from '@/components/common/Button';
import Confirm from '@/components/common/Confirm';
import StockOperationModal from '@/components/Materials/StockOperationModal';
import { Item } from '@/stores/item.store';
import { useVariantStore, Variant } from '@/stores/variant.store';
import { Minus, PackageOpen, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type ItemDetailProps = {
   isDrawerVisible: boolean;
   selectedProduct: Item;
   variants: Variant[];
   page: number;

   searchVariant: string;
   setSearchVariant: (v: string) => void;

   selectedVariantIds: number[];
   toggleVariant: (id: number) => void;
   toggleAllVariants: () => void;
   setSelectedVariantIds: (ids: number[]) => void;

   onClose: () => void;
   onOpenAddVariant: () => void;

   fetchPage: (page: number, item_type: number) => Promise<void>;
};

export default function ItemDetailModal({
   isDrawerVisible,
   selectedProduct,
   variants,
   page,

   searchVariant,
   setSearchVariant,

   selectedVariantIds,
   toggleVariant,
   toggleAllVariants,
   setSelectedVariantIds,

   fetchPage,
   onClose,
   onOpenAddVariant,
}: ItemDetailProps) {
   const [stockModalOpen, setStockModalOpen] = useState(false);
   const [stockOperationType, setStockOperationType] = useState<'in' | 'out'>('in');
   const [stockQuantity, setStockQuantity] = useState(0);
   const [selectedVariantIdForSingle, setSelectedVariantIdForSingle] = useState<number | null>(
      null
   );
   const [isBulkOperation, setIsBulkOperation] = useState(true);

   const [isConfirmOpen, setIsConfirmOpen] = useState(false);
   const [pendingIds, setPendingIds] = useState<number[]>([]);

   const { clearByItem, fetchByItem } = useVariantStore();

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
         // Xử lý nhập/xuất kho hàng loạt
         await window.api.stockMultipleVariants(
            selectedVariantIds,
            stockQuantity,
            stockOperationType
         );
         await fetchByItem(selectedProduct.item_id);
      } else {
         // Xử lý nhập/xuất kho đơn lẻ
         if (!selectedVariantIdForSingle) return;

         await window.api.stockSingleVariant(
            selectedVariantIdForSingle,
            stockQuantity,
            stockOperationType
         );
      }

      clearByItem(selectedProduct.item_id);
      await fetchByItem(selectedProduct.item_id);
      await fetchPage(page, 1);
      // Reset và đóng modal
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

      // Lưu IDs vào bộ nhớ tạm và mở Modal confirm
      setPendingIds(variantIdsToDelete);
      setIsConfirmOpen(true);
   };

   const handleConfirmDelete = async () => {
      try {
         // Đóng modal ngay lập tức
         setIsConfirmOpen(false);

         // Gọi API xóa với pendingIds đã lưu
         await window.api.deleteVariants(pendingIds);

         // Xóa thành công thì clear state
         setSelectedVariantIds([]);
         clearByItem(selectedProduct.item_id);
         await fetchByItem(selectedProduct.item_id);
         await fetchPage(page, 1);

         setStockModalOpen(false);
         setSelectedVariantIdForSingle(null);
      } catch (error) {
         alert('Delete Variant Error');
      }
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
         <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop and Transition */}
            <div
               className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
                  isDrawerVisible ? 'opacity-40' : 'opacity-0'
               }`}
               onClick={onClose}
            />

            {/* Drawer */}
            <div
               className={`fixed inset-y-0 right-0 transform transition-transform duration-500 ${
                  isDrawerVisible ? 'translate-x-0' : 'translate-x-full'
               }`}
            >
               <div className="w-screen max-w-3xl bg-white h-full p-6 overflow-y-auto">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                     <div>
                        <h2 className="text-xl font-semibold">{selectedProduct.item_name}</h2>
                        <p className="text-sm text-gray-500">Chi tiết • Sản phẩm</p>
                     </div>

                     <div className="flex items-center gap-2">
                        <Button className="flex items-center" onClick={onOpenAddVariant}>
                           <Plus className="h-4 w-4 mr-2" />
                           Thêm biến thể
                        </Button>
                        <Button variant="secondary" onClick={onClose}>
                           Đóng
                        </Button>
                     </div>
                  </div>

                  {/* Search + Actions */}
                  <div className="flex items-center gap-3 mb-4">
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

                     {/* Button Nhập - Hàng loạt */}
                     <Button
                        variant="secondary"
                        disabled={!selectedVariantIds.length}
                        onClick={handleStockInClick}
                        className="h-10 px-4 flex items-center justify-center whitespace-nowrap"
                     >
                        <Plus className="h-4 w-4 mr-1.5" />
                        <span>Nhập</span>
                     </Button>

                     {/* Button Xuất - Hàng loạt */}
                     <Button
                        variant="secondary"
                        disabled={!selectedVariantIds.length}
                        onClick={handleStockOutClick} // Đã sửa: gọi hàm mở modal
                        className="h-10 px-4 flex items-center justify-center whitespace-nowrap"
                     >
                        <Minus className="h-4 w-4 mr-1.5" />
                        <span>Xuất</span>
                     </Button>

                     {/* Button Xoá */}
                     <Button
                        variant="secondary"
                        disabled={!selectedVariantIds.length && !selectedVariantIdForSingle}
                        onClick={handleDeleteVariants}
                        className="h-10 px-4 flex items-center justify-center whitespace-nowrap"
                     >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        <span>Xoá</span>
                     </Button>

                     {/* Modal Confirm Delete */}
                     <Confirm
                        isOpen={isConfirmOpen}
                        title="Xác nhận xóa"
                        message={`Bạn có chắc chắn muốn xóa ${pendingIds.length} biến thể đã chọn?`}
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setIsConfirmOpen(false)}
                     />
                  </div>

                  {/* Variant Table */}
                  {filteredVariants.length > 0 ? (
                     <table className="w-full border border-gray-200 rounded-lg overflow-hidden border-separate border-spacing-0">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                           <tr>
                              <th className="px-4 py-3 text-center w-12">
                                 <input
                                    type="checkbox"
                                    checked={
                                       filteredVariants.length > 0 &&
                                       selectedVariantIds.length === filteredVariants.length
                                    }
                                    onChange={toggleAllVariants}
                                 />
                              </th>
                              <th className="px-4 py-3 text-left text-gray-500 font-semibold">
                                 Biến thể
                              </th>
                              <th className="px-4 py-3 text-left text-gray-500 font-semibold">
                                 Mã SKU
                              </th>
                              <th className="px-4 py-3 text-center text-gray-500 font-semibold">
                                 Số lượng
                              </th>
                              <th className="px-4 py-3 text-center text-gray-500 font-semibold">
                                 Thao tác
                              </th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                           {filteredVariants.map((v: Variant) => (
                              <tr
                                 key={v.variant_id}
                                 className="hover:bg-gray-50 transition-colors text-sm"
                              >
                                 <td className="px-4 py-3 text-center">
                                    <input
                                       type="checkbox"
                                       checked={selectedVariantIds.includes(v.variant_id)}
                                       onChange={() => toggleVariant(v.variant_id)}
                                    />
                                 </td>

                                 <td className="px-4 py-3 text-gray-900 font-medium">
                                    {v.variant_name}
                                 </td>

                                 <td className="px-4 py-3 text-gray-500 text-xs">
                                    {v.variant_code}
                                 </td>

                                 <td className="px-4 py-3 font-bold text-center">{v.quantity}</td>

                                 <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-4">
                                       <div className="flex items-center justify-center gap-3">
                                          {/* Nút Nhập đơn lẻ */}
                                          <button
                                             title="Nhập kho"
                                             onClick={() => handleSingleStockInClick(v.variant_id)}
                                             className="
                                                p-2 text-emerald-600
                                                hover:bg-emerald-50
                                                rounded-full
                                                transition-colors
                                                border border-transparent
                                                hover:border-emerald-200
                                             "
                                          >
                                             <Plus className="h-4 w-4" />
                                          </button>

                                          {/* Nút Xuất đơn lẻ */}
                                          <button
                                             title="Xuất kho"
                                             onClick={() => handleSingleStockOutClick(v.variant_id)}
                                             className="p-2 text-red-600 hover:bg-red-50
                                                rounded-full transition-colors
                                                border border-transparent hover:border-red-200
                                             "
                                          >
                                             <Minus className="h-4 w-4" />
                                          </button>
                                       </div>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  ) : (
                     <div className="flex flex-col items-center justify-center text-gray-400">
                        {/* Icon minh họa - Sử dụng Package hoặc Inbox từ lucide-react */}
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
      </>
   );
}
