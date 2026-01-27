import Table from '@/components/Common/Table';
import Button from '@/components/Common/Button';
import { Edit, Eye, Package, Plus, Trash2 } from 'lucide-react';
import { Item } from '@/stores/item.store';
import { useState } from 'react';
import DeleteItemModal from '@/components/Products/DeleteItemModal';

type ItemTableProps = {
   data: Item[];
   isLoading: boolean;
   limit: number;
   page: number;
   fetchPage: (page: number, type_item: number) => Promise<void>;
   onViewDetails: (product: Item) => void;
   setIsModalOpen: (value: boolean) => void;
   setIsUpdateModalOpen: (value: boolean) => void;
   setSelectedProductForUpdate: (product: Item) => void;
};

const ItemTable = ({
   data,
   isLoading,
   limit,
   page,
   fetchPage,
   onViewDetails,
   setIsModalOpen,
   setIsUpdateModalOpen,
   setSelectedProductForUpdate,
}: ItemTableProps) => {
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [productToDelete, setProductToDelete] = useState<Item | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);

   const handleDeleteClick = (product: Item) => {
      setProductToDelete(product);
      setDeleteModalOpen(true);
   };

   const handleConfirmDelete = async () => {
      if (!productToDelete) return;

      setIsDeleting(true);
      try {
         await window.api.deleteItem(productToDelete.item_id);
         await fetchPage(page, 1);
         handleCloseDeleteModal();
      } catch (err) {
         console.error('Lỗi khi xóa sản phẩm:', err);

         // Hiển thị thông báo lỗi chi tiết hơn
         const errorMessage =
            err instanceof Error ? err.message : 'Không thể xóa sản phẩm. Vui lòng thử lại.';

         alert(`Lỗi: ${errorMessage}`);
      } finally {
         setIsDeleting(false);
      }
   };

   const handleCloseDeleteModal = () => {
      setDeleteModalOpen(false);
      // Delay reset để tránh flash content khi modal đóng
      setTimeout(() => {
         setProductToDelete(null);
      }, 300);
   };

   const ROW_HEIGHT = 70;
   const minHeight = limit * ROW_HEIGHT;

   if (isLoading) {
      return (
         <div
            className="flex items-center justify-center text-gray-500"
            style={{ minHeight }}
            role="status"
            aria-label="Đang tải"
         >
            <div className="animate-pulse">Đang tải sản phẩm...</div>
         </div>
      );
   }

   if (data.length === 0) {
      return (
         <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có Sản phẩm nào</h3>
            <p className="text-gray-500 mb-6">Bắt đầu bằng cách thêm một Sản phẩm mới</p>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center mx-auto">
               <Plus className="h-4 w-4 mr-2" />
               Thêm Sản phẩm đầu tiên
            </Button>
         </div>
      );
   }

   return (
      <>
         <div className="overflow-hidden" style={{ minHeight }}>
            <Table
               headers={[
                  'Tên sản phẩm',
                  'Mã sản phẩm',
                  'Đơn vị',
                  'Số biến thể',
                  'Số lượng',
                  'Thao tác',
               ]}
               data={data}
               renderRow={(product) => (
                  <tr
                     key={product.item_id}
                     className="hover:bg-gray-50/80 transition-colors border-b last:border-0 text-sm"
                  >
                     <td className="px-6 py-4 text-center font-semibold">{product.item_name}</td>

                     <td className="px-6 py-4 text-center">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                           {product.item_code}
                        </span>
                     </td>

                     <td className="px-6 py-4 text-center">{product.unit_name}</td>

                     <td className="px-6 py-4 text-center">{product.count_variant}</td>

                     <td
                        className={`px-6 py-4 text-center font-bold ${product.is_low_stock === 1 ? 'text-red-600' : 'text-gray-900'}`}
                     >
                        {product.total_quantity.toLocaleString()}
                     </td>

                     <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                           {/* Nút xem chi tiết */}
                           <Button
                              variant="ghost"
                              onClick={() => onViewDetails(product)}
                              aria-label={`Xem chi tiết ${product.item_name}`}
                           >
                              <Eye className="h-4 w-4 text-blue-500" />
                           </Button>
                           {/* Nút chỉnh sửa thông tin */}
                           <Button
                              variant="ghost"
                              onClick={() => {
                                 setSelectedProductForUpdate(product);
                                 setIsUpdateModalOpen(true);
                              }}
                              aria-label={`Chỉnh sửa ${product.item_name}`}
                           >
                              <Edit className="h-4 w-4" />
                           </Button>

                           {/* Nút xoá Product */}
                           <Button
                              variant="ghost"
                              onClick={() => handleDeleteClick(product)}
                              aria-label={`Xóa ${product.item_name}`}
                           >
                              <Trash2 className="h-4 w-4 text-red-500" />
                           </Button>
                        </div>
                     </td>
                  </tr>
               )}
            />
         </div>

         {deleteModalOpen && productToDelete && (
            <DeleteItemModal
               isOpen={deleteModalOpen}
               onClose={handleCloseDeleteModal}
               onConfirm={handleConfirmDelete}
               productName={productToDelete.item_name}
               isLoading={isDeleting}
            />
         )}
      </>
   );
};

export default ItemTable;
