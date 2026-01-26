import Button from '@/components/Common/Button';
import Select from '@/components/Common/Select';
import { useEffect } from 'react';

type UnitOption = {
   label: string;
   value: string;
};

type CreateItemProps = {
   isModalVisible: boolean;
   variantCode: string;
   variantQuantity: number;
   unitId: string | number | null;

   setIsModalOpen: (value: boolean) => void;
   handleSubmit: (e: React.FormEvent) => void;
   setItemName: (itemName: string) => void;
   setItemCode: (itemCode: string) => void;
   setUnitId: (unitId: string | number | null) => void;
   unitOptions: UnitOption[];
};

export default function CreateItemModal({
   isModalVisible,
   unitId,
   setIsModalOpen,
   handleSubmit,
   setItemName,
   setItemCode,
   setUnitId,
   unitOptions,
}: CreateItemProps) {
   useEffect(() => {
      if (isModalVisible) {
         // Focus vào input đầu tiên khi modal mở
         setTimeout(() => {
            const firstInput = document.querySelector('input[name="itemName"]');
            if (firstInput) {
               (firstInput as HTMLInputElement).focus();
            }
         }, 100);
      }
   }, [isModalVisible]);

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
                  <h3 className="text-lg font-semibold text-gray-900">Thêm sản phẩm mới</h3>
                  <button
                     onClick={() => setIsModalOpen(false)}
                     className="text-gray-400 hover:text-gray-500 p-1"
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
                              Tên sản phẩm *
                           </label>
                           <input
                              type="text"
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
                              "
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mã sản phẩm
                           </label>
                           <input
                              type="text"
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
                     </div>

                     <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                        <Button
                           type="reset"
                           variant="secondary"
                           onClick={() => setIsModalOpen(false)}
                        >
                           Hủy
                        </Button>
                        <Button type="submit">Lưu sản phẩm</Button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
}
