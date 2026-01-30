import Button from '@/components/Common/Button';
import { Item } from '@/stores/item.store';
import { useVariantStore } from '@/stores/variant.store';
import { useState } from 'react';

type CreateVariantProps = {
   page: number;
   selectedItem: Item | null;
   variantName: string;
   variantCode: string;
   variantQuantity: number;
   setVariantName: (variantName: string) => void;
   setVariantCode: (variantCode: string) => void;
   setVariantQuantity: (variantQuantity: number) => void;
   setIsAddVariantOpen: (value: boolean) => void;
   fetchPage: (page: number, type_item: number) => Promise<void>;
};

export default function CreateVariantModal({
   page,
   selectedItem,
   variantName,
   variantCode,
   variantQuantity,
   setVariantName,
   setVariantCode,
   setVariantQuantity,
   setIsAddVariantOpen,
   fetchPage,
}: CreateVariantProps) {
   const [isVariantName, setIsVariantName] = useState<boolean>(true);
   const [isVariantCode, setIsVariantCode] = useState<boolean>(true);
   const [variantError, setVariantCodeError] = useState<string>('');

   const [isMultiSize, setIsMultiSize] = useState(false);
   const [sizeStart, setSizeStart] = useState<number | ''>('');
   const [sizeEnd, setSizeEnd] = useState<number | ''>('');
   const [sizeError, setSizeError] = useState('');

   const checkDuplicateCode = async (variantCode: string) => {
      if (!selectedItem) {
         setVariantCodeError('Xảy ra lỗi');
         setIsVariantCode(true);
         return;
      }
      const isExisted = await window.api.existedVariantCode(selectedItem.item_id, variantCode);
      if (isExisted) {
         setVariantCodeError('Mã đã tồn tại');
         setIsVariantCode(true);
      } else {
         setVariantCodeError('');
         setIsVariantCode(false);
      }
   };

   const handleCreateVariant = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedItem) return;

      if (!variantName.trim() || !variantCode.trim()) {
         alert('Vui lòng nhập tên và mã biến thể');
         return;
      }

      if (isMultiSize) {
         if (!variantName.includes('$') || !variantCode.includes('$')) {
            alert('Tên và Mã bắt buộc phải có ký tự $');
            return;
         }

         if (!sizeStart || !sizeEnd) {
            setSizeError('Bắt buộc nhập size bắt đầu và kết thúc');
            return;
         }

         if (sizeStart >= sizeEnd) {
            setSizeError('Size bắt đầu phải nhỏ hơn size kết thúc');
            return;
         }

         for (let size = sizeStart; size <= sizeEnd; size++) {
            const name = variantName.replace('$', String(size));
            const code = variantCode.replace('$', String(size));

            const res = await window.api.createVariant(
               selectedItem.item_id,
               name,
               code,
               variantQuantity
            );

            await window.api.createTransaction({
               type: 'create',
               itemId: selectedItem.item_id,
               variantId: res.lastInsertRowid,
               quantity: variantQuantity,
            });

            useVariantStore.getState().addVariant(selectedItem.item_id, {
               variant_id: res.lastInsertRowid,
               variant_name: name,
               variant_code: code,
               quantity: variantQuantity,
            });
         }
      } else {
         const res = await window.api.createVariant(
            selectedItem.item_id,
            variantName,
            variantCode,
            variantQuantity
         );

         await window.api.createTransaction({
            type: 'create',
            itemId: selectedItem.item_id,
            variantId: res.lastInsertRowid,
            quantity: variantQuantity,
         });

         useVariantStore.getState().addVariant(selectedItem.item_id, {
            variant_id: res.lastInsertRowid,
            variant_name: variantName,
            variant_code: variantCode,
            quantity: variantQuantity,
         });
      }

      setVariantName('');
      setVariantCode('');
      setVariantQuantity(0);
      setIsAddVariantOpen(false);

      const itemType = selectedItem.item_type.toString() === 'product' ? 1 : 2;
      await fetchPage(page, itemType);
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
         <form
            // onSubmit={handleAddVariant}
            onSubmit={handleCreateVariant}
            className="bg-white rounded-lg w-full max-w-md p-6 space-y-4"
         >
            <h3 className="text-lg font-semibold">Thêm biến thể</h3>
            <input
               placeholder="Tên biến thể"
               value={variantName}
               onChange={(e) => {
                  const value = e.target.value;
                  setVariantName(value);
                  setIsVariantName(value === '');
               }}
               className="w-full border px-3 py-2
                  text-sm text-gray-900
                  border-gray-300 rounded-lg
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:ring-2 focus:ring-gray-900
                  focus:border-transparent
                  autofill:bg-white
               "
            />

            <span className="text-[11px] font-medium text-red-400 tracking-tight italic">
               {variantError}
            </span>
            <input
               placeholder="Mã SKU"
               value={variantCode}
               onChange={(e) => {
                  const value = e.target.value;
                  if (variantError) setVariantCodeError('');
                  setVariantCode(value);
                  setIsVariantCode(value === '');
               }}
               onBlur={(e) => checkDuplicateCode(e.target.value)}
               className="w-full border px-3 py-2
                  text-sm text-gray-900
                  border-gray-300 rounded-lg
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:ring-2 focus:ring-gray-900
                  focus:border-transparent
                  autofill:bg-white
               "
            />

            <input
               min="0"
               type="number"
               placeholder="Số lượng ban đầu: 0"
               onChange={(e) => setVariantQuantity(Number(e.target.value))}
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

            <label className="flex items-center cursor-pointer gap-3 text-sm font-medium text-gray-700">
               <div className="relative">
                  <input
                     type="checkbox"
                     className="sr-only peer"
                     checked={isMultiSize}
                     onChange={(e) => {
                        setIsMultiSize(e.target.checked);
                        setSizeStart('');
                        setSizeEnd('');
                        setSizeError('');
                     }}
                  />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors duration-300"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4"></div>
               </div>

               <span className="select-none">Thêm nhiều size</span>
            </label>

            {/* Input size */}
            {isMultiSize && (
               <div className="flex gap-3">
                  <input
                     type="text"
                     placeholder="Size bắt đầu"
                     value={sizeStart}
                     onChange={(e) => setSizeStart(Number(e.target.value))}
                     className="
                        w-1/2 border px-3 py-2 rounded-lg text-sm
                        text-gray-900 border-gray-300
                        placeholder:text-gray-400
                        focus:outline-none
                        focus:ring-2 focus:ring-gray-900
                        focus:border-transparent
                        autofill:bg-white
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                        [&::-webkit-inner-spin-button]:appearance-none
                     "
                  />
                  <input
                     type="text"
                     placeholder="Size kết thúc"
                     value={sizeEnd}
                     onChange={(e) => setSizeEnd(Number(e.target.value))}
                     className="
                        w-1/2 border px-3 py-2 rounded-lg text-sm
                        text-gray-900 border-gray-300
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
            )}

            {sizeError && <p className="text-[11px] text-red-400 italic">{sizeError}</p>}

            <div className="flex justify-end gap-2">
               <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                     setIsAddVariantOpen(false);
                     setVariantName('');
                     setVariantCode('');
                     setVariantQuantity(0);
                  }}
               >
                  Hủy
               </Button>
               <Button
                  disabled={
                     isVariantName ||
                     isVariantCode ||
                     variantCode.includes(' ') ||
                     !!variantError ||
                     (isMultiSize &&
                        (!variantName.includes('$') ||
                           !variantCode.includes('$') ||
                           !sizeStart ||
                           !sizeEnd ||
                           sizeStart >= sizeEnd))
                  }
                  type="submit"
               >
                  Lưu
               </Button>
            </div>
         </form>
      </div>
   );
}
