import Button from '@/components/Common/Button';
import Select, { SelectOption } from '@/components/Common/Select';
import { useState } from 'react';

type CreateItemProps = {
   page: number;
   title: string;
   isModalVisible: boolean;

   itemName: string;
   itemCode: string;
   unitId: string | number | null;
   typeId: number;
   lowStockThreshold: number;

   setIsModalOpen: (value: boolean) => void;
   setItemName: (itemName: string) => void;
   setItemCode: (itemCode: string) => void;
   setUnitId: (unitId: string | number | null) => void;
   setLowStockThreshold: (lowStock: number) => void;
   unitOptions: SelectOption[];
   fetchPage: (page: number, type_item: number) => Promise<void>;
};

export default function CreateItemModal({
   page,
   title,
   isModalVisible,

   itemName,
   itemCode,
   unitId,
   typeId,
   lowStockThreshold,

   setIsModalOpen,
   setItemName,
   setItemCode,
   setUnitId,
   setLowStockThreshold,
   unitOptions,
   fetchPage,
}: CreateItemProps) {
   const [stockThresholdDefault, setStockThresholdDefault] = useState(-1);
   const [isItemName, setIsItemName] = useState<boolean>(true);
   const [isItemCode, setIsItemCode] = useState<boolean>(true);
   const [itemCodeError, setItemCodeError] = useState<string>('');

   const handleCreateItem = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!itemName.trim()) {
         alert('Vui lòng nhập tên sản phẩm');
         return;
      }

      if (!unitId) {
         alert('Vui lòng chọn đơn vị tính');
         return;
      }

      try {
         await window.api.createItem(itemName, itemCode, typeId, Number(unitId), lowStockThreshold);

         // reset form
         setItemName('');
         setItemCode('');
         setUnitId(null);

         // đóng modal
         setIsModalOpen(false);

         // reload danh sách
         await fetchPage(page, typeId);
      } catch (err) {
         alert('Lỗi khi thêm sản phẩm: Vui lòng thử lại');
      }
   };

   const checkDuplicateCode = async (code: string) => {
      const isExisted = await window.api.existedItemCode(code);
      if (isExisted) {
         setItemCodeError(': Đã tồn tại');
         setIsItemCode(true);
      } else {
         setItemCodeError('');
         setIsItemCode(false);
      }
   };

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
                  <h3 className="text-lg font-semibold text-gray-900">Thêm {title} mới</h3>
                  <button
                     onClick={() => setIsModalOpen(false)}
                     className="text-gray-400 hover:text-gray-500 p-1"
                  >
                     ×
                  </button>
               </div>

               {/* Content */}
               <div className="p-6">
                  <form className="space-y-6" onSubmit={handleCreateItem}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tên {title} *
                           </label>
                           <input
                              type="text"
                              onChange={(e) => {
                                 const value = e.target.value;
                                 setItemName(value);
                                 setIsItemName(value === '');
                              }}
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
                              "
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mã {title} *{' '}
                              {itemCodeError && (
                                 <span className="text-red-500">{itemCodeError}</span>
                              )}
                           </label>
                           <input
                              type="text"
                              onChange={(e) => {
                                 const value = e.target.value;
                                 if (itemCodeError) setItemCodeError('');
                                 setItemCode(value);
                                 setIsItemCode(value === '');
                              }}
                              onBlur={(e) => checkDuplicateCode(e.target.value)}
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
                              "
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
                              // ref={inputRef}
                              min="-1"
                              type="text"
                              value={stockThresholdDefault === -1 ? '' : stockThresholdDefault}
                              onChange={(e) => {
                                 const val = e.target.value;
                                 if (val === '') {
                                    setLowStockThreshold(-1);
                                    return;
                                 }
                                 // Chỉ cho phép nhập số
                                 const numValue = Number(val);
                                 if (!isNaN(numValue)) {
                                    setStockThresholdDefault(numValue);
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
                                 autofill:bg-white
                              "
                           />
                        </div>
                     </div>

                     <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                        <div className="flex justify-end space-x-3">
                           <Button
                              type="reset"
                              variant="secondary"
                              onClick={() => setIsModalOpen(false)}
                           >
                              Hủy
                           </Button>
                           <Button
                              disabled={
                                 isItemName ||
                                 isItemCode ||
                                 itemCode.includes(' ') ||
                                 !!itemCodeError
                              }
                              type="submit"
                           >
                              Lưu sản phẩm
                           </Button>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
}
