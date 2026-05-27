import Button from '@/components/common/Button';
import { Item } from '@/stores/item.store';
import { useVariantStore } from '@/stores/variant.store';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

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

const suggestColorCode = (name: string): string => {
   const noAccents = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
   
   const words = noAccents.trim().split(/\s+/);
   if (words.length === 0 || !words[0]) return '';
   
   if (words.length === 1) {
      const word = words[0];
      if (word.length >= 2) {
         return word.substring(0, 2).toUpperCase();
      }
      return word.toUpperCase();
   } else {
      return words.map(w => w[0]).join('').toUpperCase();
   }
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

   const [isMultiColor, setIsMultiColor] = useState(false);
   const [colors, setColors] = useState<{ name: string; code: string }[]>([
      { name: 'Đỏ', code: 'DO' },
      { name: 'Xanh dương', code: 'XD' },
      { name: 'Xám', code: 'XA' },
      { name: 'Đen', code: 'DE' },
      { name: 'Trắng', code: 'TA' }
   ]);

   const addColor = () => {
      setColors([...colors, { name: '', code: '' }]);
   };

   const removeColor = (index: number) => {
      setColors(colors.filter((_, i) => i !== index));
   };

   const updateColor = (index: number, key: 'name' | 'code', value: string) => {
      const newColors = [...colors];
      if (key === 'name') {
         const suggested = suggestColorCode(value);
         newColors[index] = { name: value, code: suggested };
      } else {
         newColors[index] = { ...newColors[index], code: value };
      }
      setColors(newColors);
   };

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

      if (isMultiSize && (!variantName.includes('$') || !variantCode.includes('$'))) {
         alert('Tên và Mã bắt buộc phải có ký tự $');
         return;
      }

      if (isMultiColor && (!variantName.includes('#') || !variantCode.includes('#'))) {
         alert('Tên và Mã bắt buộc phải có ký tự #');
         return;
      }

      const activeColors = isMultiColor
         ? colors.map(c => ({ name: c.name.trim(), code: c.code.trim() })).filter(c => c.name && c.code)
         : [{ name: '', code: '' }];

      const activeSizes: (number | string)[] = [];
      if (isMultiSize) {
         if (sizeStart === '' || sizeEnd === '') {
            setSizeError('Bắt buộc nhập size bắt đầu và kết thúc');
            return;
         }
         if (sizeStart >= sizeEnd) {
            setSizeError('Size bắt đầu phải nhỏ hơn size kết thúc');
            return;
         }
         for (let size = sizeStart; size <= sizeEnd; size++) {
            activeSizes.push(size);
         }
      } else {
         activeSizes.push('');
      }

      try {
         for (const color of activeColors) {
            for (const size of activeSizes) {
               let name = variantName;
               let code = variantCode;

               if (isMultiColor) {
                  name = name.replace(/#/g, color.name);
                  code = code.replace(/#/g, color.code);
               }
               if (isMultiSize) {
                  name = name.replace(/\$/g, String(size));
                  code = code.replace(/\$/g, String(size));
               }

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
         }

         setVariantName('');
         setVariantCode('');
         setVariantQuantity(0);
         setIsAddVariantOpen(false);

         const itemType = selectedItem.item_type.toString() === 'product' ? 1 : 2;
         await fetchPage(page, itemType);
      } catch (error) {
         console.error('Error creating variants:', error);
         alert('Lỗi khi tạo biến thể. Vui lòng kiểm tra lại tính duy nhất của Mã SKU.');
      }
   };

   const isNameInvalid = isVariantName ||
      (isMultiSize && !variantName.includes('$')) ||
      (isMultiColor && !variantName.includes('#'));

   const isCodeInvalid = isVariantCode ||
      variantCode.includes(' ') ||
      !!variantError ||
      (isMultiSize && !variantCode.includes('$')) ||
      (isMultiColor && !variantCode.includes('#'));

   const isSizeInvalid = isMultiSize && (sizeStart === '' || sizeEnd === '' || sizeStart >= sizeEnd);

   const isColorInvalid = isMultiColor && (colors.length === 0 || colors.some(c => !c.name.trim() || !c.code.trim()));

   const isSaveDisabled = isNameInvalid || isCodeInvalid || isSizeInvalid || isColorInvalid;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
         <form
            onSubmit={handleCreateVariant}
            className="bg-white rounded-lg w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto"
         >
            <h3 className="text-lg font-semibold">Thêm biến thể</h3>
            
            <div className="flex flex-col gap-1">
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
               {isMultiSize && variantName && !variantName.includes('$') && (
                  <p className="text-[11px] text-red-500 italic px-1">
                     Tên biến thể phải chứa ký tự '$' để thay thế bằng size (Ví dụ: Quai Đen $)
                  </p>
               )}
               {isMultiColor && variantName && !variantName.includes('#') && (
                  <p className="text-[11px] text-red-500 italic px-1">
                     Tên biến thể phải chứa ký tự '#' để thay thế bằng màu (Ví dụ: Quai # $)
                  </p>
               )}
            </div>

            <div className="flex flex-col gap-1">
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
               {variantCode.includes(' ') && (
                  <p className="text-[11px] text-red-500 italic px-1">
                     Mã SKU không được chứa khoảng trắng
                  </p>
               )}
               {variantError && (
                  <p className="text-[11px] text-red-500 italic px-1">
                     {variantError}
                  </p>
               )}
               {isMultiSize && variantCode && !variantCode.includes('$') && !variantCode.includes(' ') && (
                  <p className="text-[11px] text-red-500 italic px-1">
                     Mã SKU phải chứa ký tự '$' để thay thế bằng size (Ví dụ: QADA$)
                  </p>
               )}
               {isMultiColor && variantCode && !variantCode.includes('#') && !variantCode.includes(' ') && (
                  <p className="text-[11px] text-red-500 italic px-1">
                     Mã SKU phải chứa ký tự '#' để thay thế bằng mã màu (Ví dụ: QA#$)
                  </p>
               )}
            </div>

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

            <div className="flex gap-4 border-t border-gray-100 pt-3">
               <label className="flex items-center cursor-pointer gap-2.5 text-xs font-semibold text-gray-700">
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
                     <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors duration-300"></div>
                     <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4"></div>
                  </div>
                  <span className="select-none">Thêm nhiều size</span>
               </label>

               <label className="flex items-center cursor-pointer gap-2.5 text-xs font-semibold text-gray-700">
                  <div className="relative">
                     <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isMultiColor}
                        onChange={(e) => {
                           setIsMultiColor(e.target.checked);
                        }}
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors duration-300"></div>
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4"></div>
                  </div>
                  <span className="select-none">Thêm nhiều màu</span>
               </label>
            </div>

            {(isMultiSize || isMultiColor) && (
               <div className="text-[11px] bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-blue-700 space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-blue-800">Hướng dẫn tạo hàng loạt:</p>
                  <ul className="list-disc pl-4 space-y-1">
                     {isMultiColor && (
                        <li>Nhập ký tự <strong className="text-red-600">#</strong> đại diện cho <strong>Màu sắc</strong>.</li>
                     )}
                     {isMultiSize && (
                        <li>Nhập ký tự <strong className="text-red-600">$</strong> đại diện cho <strong>Kích thước (Size)</strong>.</li>
                     )}
                     <li>Hệ thống sẽ sinh tự động tất cả các tổ hợp biến thể bằng cách thay thế các ký tự đại diện.</li>
                     <li className="list-none pt-1">
                        <strong>Ví dụ:</strong>
                        {isMultiColor && isMultiSize && (
                           <span> Tên <code>Quai # $</code>, Mã <code>QA#$</code> sẽ tạo ra <code>Quai Đỏ 37</code> (<code>QADO37</code>)...</span>
                        )}
                        {isMultiColor && !isMultiSize && (
                           <span> Tên <code>Quai #</code>, Mã <code>QA#</code> sẽ tạo ra <code>Quai Đỏ</code> (<code>QADO</code>)...</span>
                        )}
                        {!isMultiColor && isMultiSize && (
                           <span> Tên <code>Quai $</code>, Mã <code>QA$</code> sẽ tạo ra <code>Quai 37</code> (<code>QA37</code>)...</span>
                        )}
                     </li>
                  </ul>
               </div>
            )}

            {isMultiColor && (
               <div className="space-y-2 border-t border-gray-100 pt-3">
                  <span className="text-xs font-semibold text-gray-700 block">Danh sách màu sắc:</span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                     {colors.map((color, index) => (
                        <div key={index} className="flex gap-2 items-center">
                           <input
                              type="text"
                              placeholder="Tên màu (Ví dụ: Đỏ)"
                              value={color.name}
                              onChange={(e) => updateColor(index, 'name', e.target.value)}
                              className="
                                 w-1/2 border px-3 py-1.5 rounded-lg text-xs
                                 text-gray-900 border-gray-300
                                 placeholder:text-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                              "
                           />
                           <input
                              type="text"
                              placeholder="Mã màu (Ví dụ: DO)"
                              value={color.code}
                              onChange={(e) => updateColor(index, 'code', e.target.value)}
                              className="
                                 w-1/3 border px-3 py-1.5 rounded-lg text-xs
                                 text-gray-900 border-gray-300
                                 placeholder:text-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                              "
                           />
                           <button
                              type="button"
                              onClick={() => removeColor(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              title="Xóa màu này"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                  </div>
                  {colors.length === 0 && (
                     <p className="text-[11px] text-red-500 italic px-1">
                        Vui lòng thêm ít nhất một màu sắc
                     </p>
                  )}
                  {colors.length > 0 && colors.some(c => !c.name.trim() || !c.code.trim()) && (
                     <p className="text-[11px] text-red-500 italic px-1">
                        Không được để trống Tên màu hoặc Mã màu
                     </p>
                  )}
                  <button
                     type="button"
                     disabled={colors.some(c => !c.name.trim() || !c.code.trim())}
                     onClick={addColor}
                     className="text-xs flex items-center gap-1.5 text-emerald-600 font-semibold hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <Plus className="w-3.5 h-3.5" /> Thêm màu sắc
                  </button>
               </div>
            )}

            {isMultiSize && (
               <div className="flex flex-col gap-1 border-t border-gray-100 pt-3">
                  <span className="text-xs font-semibold text-gray-700 block mb-1">Dải kích thước (Size):</span>
                  <div className="flex gap-3">
                     <input
                        type="text"
                        placeholder="Size bắt đầu"
                        value={sizeStart}
                        onChange={(e) => {
                           const val = e.target.value;
                           setSizeStart(val === '' ? '' : Number(val));
                        }}
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
                        onChange={(e) => {
                           const val = e.target.value;
                           setSizeEnd(val === '' ? '' : Number(val));
                        }}
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
                  {sizeStart !== '' && sizeEnd !== '' && sizeStart >= sizeEnd && (
                     <p className="text-[11px] text-red-500 italic px-1">
                        Size bắt đầu phải nhỏ hơn size kết thúc
                     </p>
                  )}
                  {(sizeStart === '' || sizeEnd === '') && (
                     <p className="text-[11px] text-gray-400 italic px-1">
                        Vui lòng điền size bắt đầu và kết thúc
                     </p>
                  )}
               </div>
            )}

            {sizeError && <p className="text-[11px] text-red-400 italic">{sizeError}</p>}

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
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
                  disabled={isSaveDisabled}
                  type="submit"
               >
                  Lưu
               </Button>
            </div>
         </form>
      </div>
   );
}
