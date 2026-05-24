import { useRef, useEffect } from 'react';
import Button from '@/components/common/Button';
import { Minus, Plus } from 'lucide-react';

type StockOperationModal = {
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
}: StockOperationModal) {
   const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      if (isOpen && inputRef.current) {
         setTimeout(() => {
            inputRef.current?.focus();
         }, 100);
      }
   }, [isOpen]);

   const handleQuantityChange = (value: string) => {
      const numValue = parseInt(value, 10);
      if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
         setQuantity(value === '' ? 0 : numValue);
      }
   };

   const incrementQuantity = () => {
      setQuantity(quantity + 1);
   };

   const decrementQuantity = () => {
      if (quantity > 0) {
         setQuantity(quantity - 1);
      }
   };

   const getOperationTitle = () => {
      if (operationType === 'in') {
         return `Nhập kho ${selectedCount} biến thể`;
      } else {
         return `Xuất kho ${selectedCount} biến thể`;
      }
   };

   const getOperationDescription = () => {
      if (operationType === 'in') {
         return `Nhập số lượng cho ${selectedCount === 1 ? 'biến thể đã chọn' : `${selectedCount} biến thể đã chọn`}`;
      } else {
         return `Xuất số lượng cho ${selectedCount === 1 ? 'biến thể đã chọn' : `${selectedCount} biến thể đã chọn`}`;
      }
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* Backdrop */}
         <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onCancel} />

         {/* Modal */}
         <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900">{getOperationTitle()}</h3>
               <p className="mt-1 text-sm text-gray-500">{getOperationDescription()}</p>
            </div>

            {/* Content */}
            <div className="p-6">
               <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Số lượng {operationType === 'in' ? 'nhập' : 'xuất'}
                  </label>

                  <div className="flex items-center gap-3">
                     {/* Decrement Button */}
                     <button
                        type="button"
                        onClick={decrementQuantity}
                        disabled={quantity <= 0}
                        className={`
                           p-2 rounded-lg border
                           ${
                              quantity <= 0
                                 ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                 : 'text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                           }
                           transition-colors
                        `}
                        aria-label="Giảm số lượng"
                     >
                        <Minus className="h-4 w-4" />
                     </button>

                     {/* Quantity Input */}
                     <div className="flex-1 relative">
                        <input
                           ref={inputRef}
                           type="text"
                           inputMode="numeric"
                           pattern="[0-9]*"
                           value={quantity === 0 ? '' : quantity}
                           placeholder="Nhập số lượng"
                           onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                 handleQuantityChange('0');
                                 return;
                              }
                              // Chỉ cho phép nhập số
                              const numValue = Number(val);
                              if (!isNaN(numValue)) {
                                 handleQuantityChange(val);
                              }
                           }}
                           className="
                              w-full px-4 py-3 text-center
                              text-lg font-semibold
                              border border-gray-300 rounded-lg
                              focus:outline-none focus:ring-2
                              focus:ring-gray-900 focus:border-transparent
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                              [&::-webkit-inner-spin-button]:appearance-none
                               text-gray-900
                              placeholder:text-gray-400
                              disabled:bg-gray-100 disabled:cursor-not-allowed
                           "
                           autoFocus
                        />
                     </div>

                     {/* Increment Button */}
                     <button
                        type="button"
                        onClick={incrementQuantity}
                        className="
                           p-2 rounded-lg border
                           text-gray-700 border-gray-300
                           hover:bg-gray-50 active:bg-gray-100
                           transition-colors
                        "
                        aria-label="Tăng số lượng"
                     >
                        <Plus className="h-4 w-4" />
                     </button>
                  </div>

                  {/* Quick Selection */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                     {[5, 10, 20, 50, 100, 200].map((num) => (
                        <button
                           key={num}
                           type="button"
                           onClick={() => setQuantity(num)}
                           className={`
                              px-3 py-1.5 text-sm rounded-md border
                              ${
                                 quantity === num
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                              }
                              transition-colors
                           `}
                        >
                           {num}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Summary */}
               {selectedCount > 1 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                           Tổng số lượng {operationType === 'in' ? 'nhập' : 'xuất'}:
                        </span>
                        <span className="font-semibold text-gray-900">
                           {(quantity * selectedCount).toLocaleString()} cái
                        </span>
                     </div>
                     <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Áp dụng cho:</span>
                        <span className="font-medium text-gray-900">{selectedCount} biến thể</span>
                     </div>
                  </div>
               )}

               {/* Warning for stock out */}
               {operationType === 'out' && selectedCount > 1 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                     <p className="text-sm text-yellow-800">
                        Số lượng xuất sẽ được áp dụng đồng đều cho {selectedCount} biến thể đã chọn
                     </p>
                  </div>
               )}

               {/* Actions */}
               <div className="flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={onCancel}>
                     Hủy
                  </Button>
                  <Button
                     type="button"
                     onClick={onConfirm}
                     disabled={quantity <= 0}
                     className={`
                        ${
                           operationType === 'in'
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-red-600 hover:bg-red-700'
                        }
                     `}
                  >
                     {operationType === 'in' ? 'Xác nhận nhập' : 'Xác nhận xuất'}
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
}
