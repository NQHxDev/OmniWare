import { useRef, useEffect, useState } from 'react';
import { Minus, Plus, Package } from 'lucide-react';
import Button from '@/components/Common/Button';
import { Item } from '@/stores/item.store';

type InventoryStockModalProps = {
   isOpen: boolean;
   item: Item;
   action: 'in' | 'out';
   onConfirm: (quantity: number) => Promise<void>;
   onCancel: () => void;
};

export default function InventoryStockModal({
   isOpen,
   item,
   action,
   onConfirm,
   onCancel,
}: InventoryStockModalProps) {
   const inputRef = useRef<HTMLInputElement>(null);
   const [quantity, setQuantity] = useState(0);
   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
      if (isOpen && inputRef.current) {
         setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
         }, 100);
      } else {
         setQuantity(0);
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

   const handleSubmit = async () => {
      if (quantity <= 0) {
         alert('Vui lòng nhập số lượng lớn hơn 0');
         return;
      }

      if (action === 'out' && quantity > item.total_quantity) {
         alert('Số lượng xuất không được vượt quá số lượng hiện có');
         return;
      }

      setIsSubmitting(true);
      try {
         await onConfirm(quantity);
      } finally {
         setIsSubmitting(false);
      }
   };

   const getActionColor = () => {
      return action === 'in' ? 'emerald' : 'red';
   };

   const getActionIcon = () => {
      return action === 'in' ? Plus : Minus;
   };

   const getNewQuantity = () => {
      if (action === 'in') {
         return item.total_quantity + quantity;
      } else {
         return item.total_quantity - quantity;
      }
   };

   if (!isOpen) return null;

   const ActionIcon = getActionIcon();
   const actionColor = getActionColor();

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* Backdrop */}
         <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onCancel} />

         {/* Modal */}
         <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header with colored accent */}
            <div className={`bg-${actionColor}-50 px-6 py-4 border-b border-${actionColor}-100`}>
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${actionColor}-100`}>
                     <ActionIcon className={`h-5 w-5 text-${actionColor}-600`} />
                  </div>
                  <div>
                     <h3 className="text-lg font-semibold text-gray-900">
                        {action === 'in' ? 'Nhập kho' : 'Xuất kho'}
                     </h3>
                     <p className="mt-1 text-sm text-gray-600">
                        Vật phẩm: <span className="font-medium">{item.item_name}</span>
                     </p>
                  </div>
               </div>
            </div>

            {/* Content */}
            <div className="p-6">
               {/* Item Info */}
               <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                     <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <Package className="h-6 w-6 text-gray-400" />
                     </div>
                     <div className="flex-1">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                           <div>
                              <span className="text-gray-600">Mã vật phẩm:</span>
                           </div>
                           <div className="text-right">
                              <span className="font-medium">{item.item_code}</span>
                           </div>

                           <div>
                              <span className="text-gray-600">Đơn vị:</span>
                           </div>
                           <div className="text-right">
                              <span className="font-medium">{item.unit_name}</span>
                           </div>

                           <div>
                              <span className="text-gray-600">Số lượng hiện tại:</span>
                           </div>
                           <div className="text-right">
                              <span className="font-bold">
                                 {item.total_quantity.toLocaleString()}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Quantity Input */}
               <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Số lượng {action === 'in' ? 'nhập' : 'xuất'}
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
                           placeholder="Nhập số lượng"
                           value={quantity === 0 ? '' : quantity}
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

               {/* Result Preview */}
               <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                     Kết quả sau {action === 'in' ? 'nhập' : 'xuất'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                        <span className="text-gray-600">
                           Số lượng {action === 'in' ? 'nhập' : 'xuất'}:
                        </span>
                     </div>
                     <div className="text-right">
                        <span className="font-semibold text-gray-900">
                           {quantity.toLocaleString()} {item.unit_name}
                        </span>
                     </div>

                     <div>
                        <span className="text-gray-600">Số lượng mới:</span>
                     </div>
                     <div className="text-right">
                        <span className="font-bold text-lg text-gray-900">
                           {getNewQuantity().toLocaleString()} {item.unit_name}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Warning for out of stock */}
               {action === 'out' && quantity > item.total_quantity && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                     <p className="text-sm text-red-800">
                        Số lượng xuất ({quantity.toLocaleString()}) vượt quá tồn kho hiện tại (
                        {item.total_quantity.toLocaleString()})
                     </p>
                  </div>
               )}

               {/* Actions */}
               <div className="flex justify-end gap-3">
                  <Button
                     type="button"
                     variant="secondary"
                     onClick={onCancel}
                     disabled={isSubmitting}
                  >
                     Hủy
                  </Button>
                  <Button
                     type="button"
                     onClick={handleSubmit}
                     disabled={
                        quantity <= 0 ||
                        (action === 'out' && quantity > item.total_quantity) ||
                        isSubmitting
                     }
                     className={`
                        ${
                           action === 'in'
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-red-600 hover:bg-red-700'
                        }
                     `}
                  >
                     {isSubmitting
                        ? 'Đang xử lý...'
                        : action === 'in'
                          ? 'Xác nhận nhập'
                          : 'Xác nhận xuất'}
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
}
