/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Filter, Package, Edit, Trash2, Minus } from 'lucide-react';
import Button from '../components/Common/Button';
import { useUnitStore } from '../stores/unit.store';
import { Item, useItemStore } from '../stores/item.store';
import CreateItemModal from '@/components/Products/CreateItemModal';
import UpdateProductModal from '@/components/Products/UpdateProduct';
import Confirm from '@/components/Common/Confirm';
import InventoryStockModal from '@/components/Inventory/InventoryStockModal';
import Table from '@/components/Common/Table';

const Inventory = () => {
   // Search and filter states
   const [searchTerm, setSearchTerm] = useState<string>('');

   // Modal states
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

   // Stock modal states
   const [showStockModal, setShowStockModal] = useState<boolean>(false);
   const [selectedItemForStock, setSelectedItemForStock] = useState<Item | null>(null);
   const [stockAction, setStockAction] = useState<'in' | 'out'>('in');

   // Update modal states
   const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
   const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false);
   const [selectedItemForUpdate, setSelectedItemForUpdate] = useState<Item | null>(null);

   // Delete confirmation
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

   // Data hooks
   const { units, fetchUnits } = useUnitStore();
   const { items, page, total, limit, isLoadingItem, fetchPage } = useItemStore();

   // Form states
   const [itemName, setItemName] = useState('');
   const [itemCode, setItemCode] = useState('');
   const [unitId, setUnitId] = useState<string | number | null>(null);
   const [typeId] = useState(3); // Type 3 for Inventory items
   const [lowStockThreshold, setLowStockThreshold] = useState(-1);

   const inventoryItems = useMemo(() => {
      return items;
   }, [items]);

   useEffect(() => {
      fetchUnits();
   }, [fetchUnits]);

   useEffect(() => {
      fetchPage(1, 3);
   }, [fetchPage]);

   useEffect(() => {
      if (isModalOpen) {
         setTimeout(() => {
            setIsModalVisible(true);
         }, 10);
      } else {
         setIsModalVisible(false);
      }
   }, [isModalOpen]);

   useEffect(() => {
      if (isUpdateModalOpen) {
         setTimeout(() => {
            setIsUpdateModalVisible(true);
         }, 10);
      } else {
         setIsUpdateModalVisible(false);
      }
   }, [isUpdateModalOpen]);

   const filteredItems = useMemo(() => {
      if (searchTerm) {
         return inventoryItems.filter(
            (item) =>
               item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
         );
      }
      return inventoryItems;
   }, [inventoryItems, searchTerm]);

   const unitOptions = useMemo(() => {
      if (!units || units.length === 0) return [];

      return units
         .map((unit) => ({
            value: unit?.unit_id.toString(),
            label: unit?.unit_name || '',
         }))
         .filter(Boolean);
   }, [units]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!itemName.trim()) {
         alert('Vui lòng nhập tên vật phẩm');
         return;
      }

      if (!unitId) {
         alert('Vui lòng chọn đơn vị tính');
         return;
      }

      try {
         const res = await window.api.createItem(
            itemName,
            itemCode,
            typeId, // = 3 for Inventory
            Number(unitId),
            lowStockThreshold
         );

         // Variant ghosts
         await window.api.createVariant(
            res.item_id,
            itemName,
            itemCode + '_' + new Date().getTime(),
            0
         );

         // reset form
         setItemName('');
         setItemCode('');
         setUnitId(null);

         // đóng modal
         setIsModalOpen(false);

         // reload danh sách
         await fetchPage(page, 3);
      } catch (err) {
         alert('Lỗi khi thêm vật phẩm: Vui lòng thử lại');
      }
   };

   const handleUpdateItem = async (
      e: React.FormEvent,
      updatedData: {
         item_name: string;
         item_code: string;
         unit_id: number;
         low_stock_threshold: number;
      }
   ) => {
      e.preventDefault();

      if (!selectedItemForUpdate) return;

      try {
         await window.api.updateItem(
            selectedItemForUpdate.item_id,
            updatedData.item_name,
            updatedData.item_code,
            updatedData.unit_id,
            updatedData.low_stock_threshold
         );

         await fetchPage(page, 3);
         setIsUpdateModalOpen(false);
      } catch (err) {
         alert('Lỗi khi cập nhật vật phẩm: Vui lòng thử lại');
      }
   };

   const handleDeleteClick = (item: Item) => {
      setItemToDelete(item);
      setIsDeleteModalOpen(true);
   };

   const handleConfirmDelete = async () => {
      if (!itemToDelete) return;

      try {
         await window.api.deleteItem(itemToDelete.item_id);
         await fetchPage(page, 3);
         setIsDeleteModalOpen(false);
         setItemToDelete(null);
      } catch (err) {
         console.error('Lỗi khi xóa vật phẩm:', err);
         alert('Không thể xóa vật phẩm. Vui lòng thử lại.');
      }
   };

   const handleStockIn = (item: Item) => {
      setSelectedItemForStock(item);
      setStockAction('in');
      setShowStockModal(true);
   };

   const handleStockOut = (item: Item) => {
      setSelectedItemForStock(item);
      setStockAction('out');
      setShowStockModal(true);
   };

   const handleStockConfirm = async (quantity: number) => {
      if (!selectedItemForStock) return;

      try {
         if (stockAction === 'in') {
            await window.api.stockInventoryItem(selectedItemForStock.item_id, quantity, 'in');
         } else {
            await window.api.stockInventoryItem(selectedItemForStock.item_id, quantity, 'out');
         }

         await fetchPage(page, 3);
         setShowStockModal(false);
         setSelectedItemForStock(null);
      } catch (err) {
         alert(`Lỗi khi ${stockAction === 'in' ? 'nhập' : 'xuất'} kho: Vui lòng thử lại`);
      }
   };

   const getStockStatus = (quantity: number, threshold: number) => {
      if (threshold === -1) return 'normal';
      if (quantity <= 0) return 'out-of-stock';
      if (quantity <= threshold) return 'low-stock';
      return 'normal';
   };

   const getStockStatusColor = (status: string) => {
      switch (status) {
         case 'out-of-stock':
            return 'text-red-600 bg-red-50';
         case 'low-stock':
            return 'text-yellow-600 bg-yellow-50';
         default:
            return 'text-gray-600 bg-gray-50';
      }
   };

   const getStockStatusText = (status: string) => {
      switch (status) {
         case 'out-of-stock':
            return 'Hết hàng';
         case 'low-stock':
            return 'Sắp hết';
         default:
            return 'Còn hàng';
      }
   };

   if (isLoadingItem && page === 1) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500">Đang tải vật phẩm kho...</div>
         </div>
      );
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const totalValue = (total as any)?.total || 0;
   const totalPages = Math.ceil(totalValue / limit);

   return (
      <div>
         <div className="flex items-center justify-between mb-8">
            <div>
               <h1 className="text-2xl font-semibold text-gray-900">Quản lý kho</h1>
               <p className="mt-2 text-gray-600">Danh sách vật phẩm trong kho</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
               <Plus className="h-4 w-4 mr-2" />
               Thêm vật phẩm
            </Button>
         </div>

         {/* Filters and Search */}
         <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                     <input
                        type="search"
                        placeholder="Tìm kiếm vật phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="
                           w-full
                           pl-10 pr-4 py-2 border
                           focus:outline-none
                           border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-gray-900
                           focus:border-transparent
                           placeholder:text-gray-400
                        "
                     />
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="secondary" className="flex items-center">
                     <Filter className="h-4 w-4 mr-2" />
                     Lọc
                  </Button>
                  <Button variant="ghost">Xuất Excel</Button>
               </div>
            </div>
         </div>

         {/* Inventory Table */}
         {filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
               <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">Không có vật phẩm nào</h3>
               <p className="text-gray-500 mb-6">Bắt đầu bằng cách thêm một vật phẩm mới</p>
               <Button onClick={() => setIsModalOpen(true)} className="flex items-center mx-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm vật phẩm đầu tiên
               </Button>
            </div>
         ) : (
            <>
               <div className="overflow-hidden">
                  <Table
                     headers={[
                        'Tên vật phẩm',
                        'Mã vật phẩm',
                        'Đơn vị',
                        'Số lượng',
                        'Trạng thái',
                        'Thao tác',
                     ]}
                     data={filteredItems}
                     renderRow={(item) => {
                        const stockStatus = getStockStatus(
                           item.total_quantity,
                           item.low_stock_threshold
                        );

                        return (
                           <tr
                              key={item.item_id}
                              className="hover:bg-gray-50 transition-colors border-b last:border-0 text-sm"
                           >
                              {/* Tên vật phẩm */}
                              <td className="px-6 py-4 text-center font-semibold">
                                 {item.item_name}
                              </td>

                              {/* Mã vật phẩm */}
                              <td className="px-6 py-4 text-center">
                                 <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {item.item_code}
                                 </span>
                              </td>

                              {/* Đơn vị */}
                              <td className="px-6 py-4 text-center text-gray-600">
                                 {item.unit_name}
                              </td>

                              {/* Số lượng */}
                              <td className="px-6 py-4 text-center">
                                 <span
                                    className={`font-bold ${stockStatus === 'out-of-stock' ? 'text-red-600' : stockStatus === 'low-stock' ? 'text-yellow-600' : 'text-gray-900'}`}
                                 >
                                    {item.total_quantity.toLocaleString()}
                                 </span>
                              </td>

                              {/* Trạng thái */}
                              <td className="px-6 py-4 text-center">
                                 <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(stockStatus)}`}
                                 >
                                    {getStockStatusText(stockStatus)}
                                 </span>
                              </td>

                              {/* Thao tác */}
                              <td className="px-6 py-4 text-center">
                                 <div className="flex justify-center gap-1">
                                    {/* Stock In Button */}
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                       onClick={() => handleStockIn(item)}
                                       aria-label={`Nhập kho ${item.item_name}`}
                                    >
                                       <Plus className="h-4 w-4" />
                                    </Button>

                                    {/* Stock Out Button */}
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                       onClick={() => handleStockOut(item)}
                                       aria-label={`Xuất kho ${item.item_name}`}
                                    >
                                       <Minus className="h-4 w-4" />
                                    </Button>

                                    {/* Edit Button */}
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => {
                                          setSelectedItemForUpdate(item);
                                          setIsUpdateModalOpen(true);
                                       }}
                                       aria-label={`Sửa ${item.item_name}`}
                                    >
                                       <Edit className="h-4 w-4" />
                                    </Button>

                                    {/* Delete Button */}
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                       onClick={() => handleDeleteClick(item)}
                                       aria-label={`Xóa ${item.item_name}`}
                                    >
                                       <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                        );
                     }}
                  />
               </div>

               {/* Pagination - Giữ nguyên phần phân trang */}
               {filteredItems.length >= limit && (
                  <div className="flex justify-end gap-2 mt-6">
                     <Button
                        variant="secondary"
                        disabled={page === 1}
                        onClick={() => fetchPage(page - 1, 3)}
                     >
                        Trang trước
                     </Button>
                     <span className="px-3 py-2 text-sm">Trang {page}</span>
                     <Button
                        variant="secondary"
                        disabled={page === totalPages}
                        onClick={() => fetchPage(page + 1, 3)}
                     >
                        Trang sau
                     </Button>
                  </div>
               )}
            </>
         )}

         {/* Add Item Modal */}
         {(isModalOpen || isModalVisible) && (
            <CreateItemModal
               title="vật phẩm"
               isModalVisible={isModalVisible}
               unitId={unitId}
               setIsModalOpen={setIsModalOpen}
               handleSubmit={handleSubmit}
               setItemName={setItemName}
               setItemCode={setItemCode}
               setUnitId={setUnitId}
               setLowStockThreshold={setLowStockThreshold}
               unitOptions={unitOptions}
            />
         )}

         {/* Update Item Modal */}
         {(isUpdateModalOpen || isUpdateModalVisible) && selectedItemForUpdate && (
            <UpdateProductModal
               title="Cập nhật vật phẩm kho"
               isModalVisible={isUpdateModalVisible}
               selectedProduct={selectedItemForUpdate}
               unitId={unitId}
               unitOptions={unitOptions}
               setIsModalOpen={setIsUpdateModalOpen}
               handleUpdate={handleUpdateItem}
               setUnitId={setUnitId}
               fetchUnits={fetchUnits}
            />
         )}

         {/* Stock Modal */}
         {showStockModal && selectedItemForStock && (
            <InventoryStockModal
               isOpen={showStockModal}
               item={selectedItemForStock}
               action={stockAction}
               onConfirm={handleStockConfirm}
               onCancel={() => {
                  setShowStockModal(false);
                  setSelectedItemForStock(null);
               }}
            />
         )}

         {/* Delete Confirmation Modal */}
         <Confirm
            isOpen={isDeleteModalOpen}
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa vật phẩm "${itemToDelete?.item_name}"?`}
            onConfirm={handleConfirmDelete}
            onCancel={() => {
               setIsDeleteModalOpen(false);
               setItemToDelete(null);
            }}
         />
      </div>
   );
};

export default Inventory;
