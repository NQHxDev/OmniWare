import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import Select, { SelectOption } from '@/components/common/Select';

type UpdateItemProps = {
   title: string;
   isModalVisible: boolean;
   selectedProduct: {
      item_id: number;
      item_name: string;
      item_code: string;
      unit_name: string;
      low_stock_threshold?: number;
   } | null;
   unitId: string | number | null;
   unitOptions: SelectOption[];

   setIsModalOpen: (value: boolean) => void;
   handleUpdate: (
      e: React.FormEvent,
      updatedData: {
         item_name: string;
         item_code: string;
         unit_id: number;
         low_stock_threshold: number;
      }
   ) => Promise<void>;
   setUnitId: (unitId: string | number | null) => void;
   fetchUnits?: () => Promise<void>;
};

export default function UpdateProductModal({
   title,
   isModalVisible,
   selectedProduct,
   unitId,
   unitOptions,
   setIsModalOpen,
   handleUpdate,
   setUnitId,
   fetchUnits,
}: UpdateItemProps) {
   const [itemName, setItemName] = useState('');
   const [itemCode, setItemCode] = useState('');
   const [lowStockThreshold, setLowStockThreshold] = useState<number>(-1);
   const [isLoading, setIsLoading] = useState(false);

   // Khởi tạo form với dữ liệu sản phẩm hiện tại
   useEffect(() => {
      if (selectedProduct) {
         setItemName(selectedProduct.item_name);
         setItemCode(selectedProduct.item_code || '');
         setLowStockThreshold(selectedProduct.low_stock_threshold ?? -1);

         // Tìm unitId dựa trên unit_name
         if (selectedProduct.unit_name && unitOptions.length > 0) {
            const matchedUnit = unitOptions.find(
               (unit) => unit.label === selectedProduct.unit_name
            );
            setUnitId(matchedUnit ? matchedUnit.value : null);
         }
      }
   }, [selectedProduct, unitOptions, setUnitId]);

   // Fetch units khi mở modal nếu cần
   useEffect(() => {
      if (isModalVisible && fetchUnits) {
         fetchUnits();
      }
   }, [isModalVisible, fetchUnits]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedProduct) return;

      if (!itemName.trim()) {
         alert('Vui lòng nhập tên sản phẩm');
         return;
      }

      if (!unitId) {
         alert('Vui lòng chọn đơn vị tính');
         return;
      }

      setIsLoading(true);
      try {
         await handleUpdate(e, {
            item_name: itemName,
            item_code: itemCode,
            unit_id: Number(unitId),
            low_stock_threshold: lowStockThreshold,
         });

         // Reset loading state
         setIsLoading(false);
      } catch (err) {
         setIsLoading(false);
         alert('Lỗi khi cập nhật sản phẩm: Vui lòng thử lại');

         setTimeout(() => {
            const firstInput = document.querySelector('input[name="itemName"]');
            if (firstInput) {
               (firstInput as HTMLInputElement).focus();
            }
         }, 100);
      }
   };

   if (!selectedProduct) return null;

   return (
      <div className="fixed inset-0 z-60 overflow-y-auto">
         {/* Backdrop */}
         <div
            className={`
          fixed inset-0 bg-black
          transition-opacity duration-300 ease-in-out
          ${isModalVisible ? 'opacity-50' : 'opacity-0'}
        `}
            onClick={() => setIsModalOpen(false)}
         />

         <div className="flex min-h-full items-center justify-center p-4">
            <div
               className={`
            relative bg-white rounded-lg shadow-xl w-full max-w-lg
            transform transition-all duration-300 ease-in-out
            ${isModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
            >
               {/* Header */}
               <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                     {title}: {selectedProduct.item_name}
                  </h3>
                  <button
                     onClick={() => setIsModalOpen(false)}
                     className="text-gray-400 hover:text-gray-500 p-1"
                     disabled={isLoading}
                  >
                     ×
                  </button>
               </div>

               {/* Content */}
               <div className="p-6">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tên sản phẩm
                           </label>
                           <input
                              name="itemName"
                              type="text"
                              value={itemName}
                              onChange={(e) => setItemName(e.target.value)}
                              placeholder="Ví dụ: Mẫu ABC"
                              className="
                                 w-full px-3 py-2
                                 border border-gray-300 rounded-lg
                                 text-sm text-gray-900
                                 placeholder:text-gray-400
                                 focus:outline-none
                                 focus:ring-2 focus:ring-gray-900
                                 focus:border-transparent
                                 autofill:bg-white
                                 disabled:bg-gray-100 disabled:cursor-not-allowed
                              "
                              disabled={isLoading}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mã sản phẩm
                           </label>
                           <input
                              type="text"
                              value={itemCode}
                              onChange={(e) => setItemCode(e.target.value)}
                              placeholder="Ví dụ: ABC001"
                              className="
                                 w-full px-3 py-2
                                 border border-gray-300 rounded-lg
                                 text-sm text-gray-900
                                 placeholder:text-gray-400
                                 focus:outline-none
                                 focus:ring-2 focus:ring-gray-900
                                 focus:border-transparent
                                 autofill:bg-white
                                 disabled:bg-gray-100 disabled:cursor-not-allowed
                              "
                              disabled={isLoading}
                           />
                        </div>
                        <div>
                           <Select
                              label="Đơn vị tính"
                              placeholder="Chọn đơn vị"
                              value={unitId}
                              onChange={setUnitId}
                              options={unitOptions}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ngưỡng cảnh báo
                           </label>
                           <input
                              type="text"
                              value={lowStockThreshold === -1 ? '' : lowStockThreshold}
                              onChange={(e) => {
                                 const val = e.target.value;

                                 // Nếu người dùng xóa hết (chuỗi rỗng), set state về -1
                                 if (val === '') {
                                    setLowStockThreshold(-1);
                                    return;
                                 }

                                 // Chỉ cho phép nhập số
                                 const numValue = Number(val);
                                 if (!isNaN(numValue)) {
                                    setLowStockThreshold(numValue);
                                 }
                              }}
                              placeholder="Không cảnh báo"
                              className="
                                 w-full px-3 py-2
                                 border border-gray-300 rounded-lg
                                 text-sm text-gray-900
                                 placeholder:text-gray-400
                                 focus:outline-none
                                 focus:ring-2 focus:ring-gray-900
                                 focus:border-transparent
                                 disabled:bg-gray-100 disabled:cursor-not-allowed
                              "
                              disabled={isLoading}
                           />
                        </div>
                     </div>

                     <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                        <Button
                           type="button"
                           variant="secondary"
                           onClick={() => setIsModalOpen(false)}
                           disabled={isLoading}
                        >
                           Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                           {isLoading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
}
