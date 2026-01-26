import Button from '@/components/Common/Button';

type CreateVariantProps = {
   variantName: string;
   variantCode: string;
   setVariantName: (variantName: string) => void;
   setVariantCode: (variantCode: string) => void;
   setVariantQuantity: (variantQuantity: number) => void;
   handleAddVariant: (e: React.FormEvent) => void | Promise<void>;
   setIsAddVariantOpen: (value: boolean) => void;
};

export default function CreateVariantModal({
   variantName,
   variantCode,
   setVariantName,
   setVariantCode,
   setVariantQuantity,
   handleAddVariant,
   setIsAddVariantOpen,
}: CreateVariantProps) {
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
         <form
            onSubmit={handleAddVariant}
            className="bg-white rounded-lg w-full max-w-md p-6 space-y-4"
         >
            <h3 className="text-lg font-semibold">Thêm biến thể</h3>
            <input
               placeholder="Tên biến thể"
               value={variantName}
               onChange={(e) => setVariantName(e.target.value)}
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
               placeholder="Mã SKU"
               value={variantCode}
               onChange={(e) => setVariantCode(e.target.value)}
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
               type="number"
               min="0"
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
               <Button type="submit">Lưu</Button>
            </div>
         </form>
      </div>
   );
}
