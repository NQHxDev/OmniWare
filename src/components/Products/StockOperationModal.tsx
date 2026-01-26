import Button from '@/components/Common/Button';

type StockOperationProps = {
   isOpen: boolean;
   operationType: 'in' | 'out';
   quantity: number;
   setQuantity: (quantity: number) => void;
   onConfirm: () => void;
   onCancel: () => void;
   selectedCount: number;
};

export default function StockOperationModal({
   isOpen,
   operationType,
   quantity,
   setQuantity,
   onConfirm,
   onCancel,
   selectedCount,
}: StockOperationProps) {
   if (!isOpen) return null;

   const isStockIn = operationType === 'in';
   const title = isStockIn ? 'Nhập kho' : 'Xuất kho';
   const buttonText = isStockIn ? 'Nhập kho' : 'Xuất kho';
   const buttonColor = isStockIn
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : 'bg-red-600 hover:bg-red-700';

   return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40">
         <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-6">
            <div>
               <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
               <p className="text-sm text-gray-500 mt-1">{selectedCount} biến thể được chọn</p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Số lượng {isStockIn ? 'nhập' : 'xuất'}
                  </label>
                  <input
                     type="number"
                     min="0"
                     value={quantity}
                     onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                     className="
                        w-full border px-3 py-2
                        text-sm text-gray-900
                        border-gray-300 rounded-lg
                        placeholder:text-gray-400
                        focus:outline-none
                        focus:ring-2 focus:ring-gray-900
                        focus:border-transparent
                        autofill:bg-white
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                        [&::-webkit-inner-spin-button]:appearance-none
                     "
                  />
               </div>

               {!isStockIn && (
                  <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                     <div className="flex-1">
                        <p className="text-sm text-amber-800">
                           Lưu ý: Xuất không được vượt số lượng hiện tại
                        </p>
                     </div>
                  </div>
               )}
            </div>

            <div className="flex flex-col gap-3">
               <Button onClick={onConfirm} className={`w-full justify-center ${buttonColor}`}>
                  {buttonText}
               </Button>

               <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  className="w-full justify-center border-gray-300 text-gray-700 hover:bg-gray-50"
               >
                  Hủy
               </Button>
            </div>
         </div>
      </div>
   );
}
