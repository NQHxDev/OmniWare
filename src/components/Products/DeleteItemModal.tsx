import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

interface DeleteItemModalProps {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => Promise<void>;
   productName: string;
   isLoading?: boolean;
}

const DeleteItemModal = ({
   isOpen,
   onClose,
   onConfirm,
   productName,
   isLoading = false,
}: DeleteItemModalProps) => {
   const [confirmationText, setConfirmationText] = useState('');
   const [error, setError] = useState('');

   const CONFIRMATION_PHRASE = 'xacnhan';

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (confirmationText !== CONFIRMATION_PHRASE) {
         setError('Vui lòng nhập chính xác "xacnhan" để xác nhận xóa');
         return;
      }

      try {
         await onConfirm();
         handleClose();
      } catch (err) {
         setError('Đã xảy ra lỗi khi xóa sản phẩm');
      }
   };

   const handleClose = () => {
      setConfirmationText('');
      setError('');
      onClose();
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
         {/* Backdrop */}
         <div
            className={`
               fixed inset-0 bg-black
               transition-opacity duration-300 ease-in-out
               opacity-50
            `}
            onClick={handleClose}
         />

         {/* Modal */}
         <div className="flex min-h-full items-center justify-center p-4">
            <div
               className={`
                  relative transform overflow-hidden rounded-lg
                bg-white shadow-xl duration-300 ease-in-out
                  transition-all sm:my-8 sm:w-full sm:max-w-lg
                 opacity-100 scale-100
               `}
            >
               {/* Header */}
               <div className="bg-white px-6 pt-6">
                  <div className="flex items-center gap-3">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                     </div>
                     <div>
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                           Xóa sản phẩm
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                           Hành động này không thể hoàn tác
                        </p>
                     </div>
                  </div>
               </div>

               {/* Content */}
               <div className="px-6 py-4">
                  <div className="mb-6">
                     <p className="text-sm text-gray-700">
                        Bạn sắp xóa sản phẩm{' '}
                        <span className="font-semibold text-gray-900">{productName}</span>
                        <br />
                        Tất cả biến thể và dữ liệu liên quan sẽ bị xóa vĩnh viễn!
                     </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                     <div className="mb-4">
                        <label
                           htmlFor="confirmation"
                           className="block text-sm font-medium text-gray-700 mb-3"
                        >
                           Nhập mã sau để xóa:
                           <span className="ml-2 font-bold ">"xacnhan"</span>
                        </label>

                        <input
                           id="confirmation"
                           type="text"
                           value={confirmationText}
                           onChange={(e) => setConfirmationText(e.target.value)}
                           className="
                              w-full px-3 py-2 border
                              focus:outline-none
                              border-gray-300 rounded-lg
                              focus:ring-2 focus:ring-gray-900
                              focus:border-transparent
                              placeholder:text-gray-400
                           "
                           placeholder="Nhập nội dung xác nhận"
                           autoComplete="off"
                        />
                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                     </div>

                     {/* Actions */}
                     <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                        <Button
                           type="button"
                           variant="secondary"
                           onClick={handleClose}
                           className="mt-3 sm:mt-0"
                        >
                           Hủy
                        </Button>
                        <Button
                           type="submit"
                           variant="danger"
                           disabled={confirmationText !== CONFIRMATION_PHRASE || isLoading}
                           isLoading={isLoading}
                        >
                           Xóa
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
};

export default DeleteItemModal;
