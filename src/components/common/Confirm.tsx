interface ConfirmProps {
   isOpen: boolean;
   title?: string;
   message: string;
   onConfirm: () => void;
   onCancel: () => void;
}

const Confirm = ({ isOpen, title, message, onConfirm, onCancel }: ConfirmProps) => {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
         {/* Thêm rounded-2xl để bo góc lớn hiện đại */}
         <div className="bg-white border border-gray-100 w-full max-w-sm p-8 shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <h3 className="text-xl font-bold text-black uppercase tracking-tight mb-3">
               {title || 'Xác nhận'}
            </h3>

            {/* Body */}
            <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
               {/* Nút chính bo góc nhiều (rounded-full) */}
               <button
                  onClick={onConfirm}
                  className="w-full py-3 text-sm font-semibold text-white bg-black hover:bg-zinc-800 rounded-full transition-all active:scale-95"
               >
                  Đồng ý Ý
               </button>

               {/* Nút phụ */}
               <button
                  onClick={onCancel}
                  className="w-full py-3 text-sm font-medium text-gray-400 bg-transparent hover:text-black transition-all"
               >
                  Hủy bỏ
               </button>
            </div>
         </div>
      </div>
   );
};

export default Confirm;
