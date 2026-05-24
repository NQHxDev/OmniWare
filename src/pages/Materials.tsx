// Materials.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Filter, Package } from 'lucide-react';
import Button from '../components/common/Button';
import { useUnitStore } from '../stores/unit.store';
import { Item, useItemStore } from '../stores/item.store';
import { useVariantStore } from '../stores/variant.store';
import MaterialsDetailModal from '@/components/Materials/MaterialsDetailModal';
import CreateVariantModal from '@/components/Products/CreateVariantModal';
import CreateItemModal from '@/components/Products/CreateItemModal';
import UpdateProductModal from '@/components/Products/UpdateProduct';
import Confirm from '@/components/common/Confirm';
import { useSearchStore } from '@/stores/search.store';

const Materials = () => {
   // Search and filter states
   const { debouncedQuery: searchTerm } = useSearchStore();

   // Modal states
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

   // Detail modal states
   const [showDetail, setShowDetail] = useState<boolean>(false);
   const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
   const [selectedMaterial, setSelectedMaterial] = useState<Item | null>(null);

   // Variant modal states
   const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
   const [variantName, setVariantName] = useState('');
   const [variantCode, setVariantCode] = useState('');
   const [variantQuantity, setVariantQuantity] = useState(0);

   // Update modal states
   const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
   const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false);
   const [selectedMaterialForUpdate, setSelectedMaterialForUpdate] = useState<Item | null>(null);

   // Delete confirmation
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [materialToDelete, setMaterialToDelete] = useState<Item | null>(null);

   // Data hooks
   const { units, fetchUnits } = useUnitStore();
   const { items, page, total, limit, isLoadingItem, fetchPage } = useItemStore();
   const { variantsByItem, fetchByItem } = useVariantStore();

   // Form states
   const [itemName, setItemName] = useState('');
   const [itemCode, setItemCode] = useState('');
   const [unitId, setUnitId] = useState<string | number | null>(null);
   const [typeId] = useState(2);
   const [lowStockThreshold, setLowStockThreshold] = useState(-1);

   const materials = useMemo(() => {
      return items;
   }, [items]);

   useEffect(() => {
      fetchUnits();
   }, [fetchUnits]);

   useEffect(() => {
      fetchPage(1, 2);
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

   useEffect(() => {
      if (showDetail) {
         setTimeout(() => {
            setIsDetailModalVisible(true);
         }, 10);
      } else {
         setIsDetailModalVisible(false);
      }
   }, [showDetail]);

   const filteredMaterials = useMemo(() => {
      if (searchTerm) {
         return materials.filter(
            (item) =>
               item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
         );
      }
      return materials;
   }, [materials, searchTerm]);

   const unitOptions = useMemo(() => {
      if (!units || units.length === 0) return [];

      return units
         .map((unit) => ({
            value: unit?.unit_id.toString(),
            label: unit?.unit_name || '',
         }))
         .filter(Boolean);
   }, [units]);

   const handleUpdateMaterial = async (
      e: React.FormEvent,
      updatedData: {
         item_name: string;
         item_code: string;
         unit_id: number;
         low_stock_threshold: number;
      }
   ) => {
      e.preventDefault();

      if (!selectedMaterialForUpdate) return;

      try {
         await window.api.updateItem(
            selectedMaterialForUpdate.item_id,
            updatedData.item_name,
            updatedData.item_code,
            updatedData.unit_id,
            updatedData.low_stock_threshold
         );

         await fetchPage(page, 2);
         setIsUpdateModalOpen(false);

         // Cập nhật selectedMaterial
         if (selectedMaterial?.item_id === selectedMaterialForUpdate.item_id) {
            setSelectedMaterial({
               ...selectedMaterial,
               ...updatedData,
               unit_name:
                  unitOptions.find((u) => u.value === String(updatedData.unit_id))?.label ||
                  selectedMaterial.unit_name,
            });
         }
      } catch (err) {
         alert('Lỗi khi cập nhật vật tư: Vui lòng thử lại');
      }
   };

   const handleDeleteClick = (material: Item) => {
      setMaterialToDelete(material);
      setIsDeleteModalOpen(true);
   };

   const handleConfirmDelete = async () => {
      if (!materialToDelete) return;

      try {
         await window.api.deleteItem(materialToDelete.item_id);
         await fetchPage(page, 2);
         setIsDeleteModalOpen(false);
         setMaterialToDelete(null);
      } catch (err) {
         console.error('Lỗi khi xóa vật tư:', err);
         alert('Không thể xóa vật tư. Vui lòng thử lại.');
      }
   };

   const handleViewDetails = async (material: Item) => {
      setSelectedMaterial(material);
      setShowDetail(true);
      await fetchByItem(material.item_id);
   };

   const getStockStatus = (quantity: number, threshold: number) => {
      if (threshold === -1) return 'normal';
      if (quantity <= 0) return 'out-of-stock';
      if (quantity <= threshold) return 'low-stock';
      return 'normal';
   };

   if (isLoadingItem && page === 1) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500">Đang tải vật tư...</div>
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
               <h1 className="text-2xl font-semibold text-gray-900">Quản lý vật tư</h1>
               <p className="mt-2 text-gray-600">Danh sách vật tư và biến thể</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
               <Plus className="h-4 w-4 mr-2" />
               Thêm vật tư
            </Button>
         </div>

         {/* Filters and Search */}
         <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="text-sm text-gray-500">
                  Hiển thị {filteredMaterials.length} vật tư
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

         {/* Materials Grid */}
         {filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
               <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">Không có Vật tư nào</h3>
               <p className="text-gray-500 mb-6">Bắt đầu bằng cách thêm một Vật tư mới</p>
               <Button onClick={() => setIsModalOpen(true)} className="flex items-center mx-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm Vật tư đầu tiên
               </Button>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredMaterials.map((material) => {
                  const stockStatus = getStockStatus(
                     material.total_quantity,
                     material.low_stock_threshold
                  );
                  return (
                     <div
                        key={material.item_id}
                        className="
                           bg-white rounded-lg
                           shadow border border-gray-200 hover:shadow-md
                           transition-shadow duration-200 cursor-pointer
                        "
                        onClick={() => handleViewDetails(material)}
                     >
                        <div className="p-6">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                 {material.item_name}
                              </h3>
                              <p className="text-sm text-gray-500">{material.item_code}</p>
                           </div>

                           <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                 <span className="text-sm text-gray-600">Đơn vị:</span>
                                 <span className="font-medium">{material.unit_name}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-sm text-gray-600">Tổng số lượng:</span>
                                 <span
                                    className={`font-bold text-lg ${stockStatus === 'out-of-stock' ? 'text-red-600' : stockStatus === 'low-stock' ? 'text-yellow-600' : 'text-gray-900'}`}
                                 >
                                    {material.total_quantity.toLocaleString()}
                                 </span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-sm text-gray-600">Số biến thể:</span>
                                 <span className="font-medium">{material.count_variant}</span>
                              </div>
                              {material.low_stock_threshold > 0 ? (
                                 <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Ngưỡng cảnh báo:</span>
                                    <span className="font-medium">
                                       {material.low_stock_threshold}
                                    </span>
                                 </div>
                              ) : (
                                 <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Không cảnh báo</span>
                                 </div>
                              )}
                           </div>

                           <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 className="flex-1"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMaterialForUpdate(material);
                                    setIsUpdateModalOpen(true);
                                 }}
                              >
                                 Sửa
                              </Button>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(material);
                                 }}
                              >
                                 Xóa
                              </Button>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {/* Pagination */}
         {filteredMaterials.length >= limit && (
            <div className="flex justify-end gap-2 mt-6">
               <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => fetchPage(page - 1, 2)}
               >
                  Trang trước
               </Button>
               <span className="px-3 py-2 text-sm">Trang {page}</span>
               <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => fetchPage(page + 1, 2)}
               >
                  Trang sau
               </Button>
            </div>
         )}

         {/* Material Detail Modal */}
         {(showDetail || selectedMaterial) && selectedMaterial && (
            <MaterialsDetailModal
               isModalVisible={isDetailModalVisible}
               selectedMaterial={selectedMaterial}
               variants={variantsByItem[selectedMaterial.item_id] || []}
               onClose={() => {
                  setShowDetail(false);
                  setTimeout(() => {
                     setSelectedMaterial(null);
                  }, 300);
               }}
               onOpenAddVariant={() => setIsAddVariantOpen(true)}
               fetchPage={fetchPage}
               page={page}
               fetchByItem={fetchByItem}
            />
         )}

         {/* Add Material Modal */}
         {(isModalOpen || isModalVisible) && (
            <CreateItemModal
               page={page}
               title="vật tư"
               isModalVisible={isModalVisible}
               itemName={itemName}
               itemCode={itemCode}
               unitId={unitId}
               typeId={typeId}
               lowStockThreshold={lowStockThreshold}
               setIsModalOpen={setIsModalOpen}
               setItemName={setItemName}
               setItemCode={setItemCode}
               setUnitId={setUnitId}
               setLowStockThreshold={setLowStockThreshold}
               unitOptions={unitOptions}
               fetchPage={fetchPage}
            />
         )}

         {/* Add Variant Modal */}
         {isAddVariantOpen && (
            <CreateVariantModal
               page={page}
               selectedItem={selectedMaterial}
               variantName={variantName}
               variantCode={variantCode}
               variantQuantity={variantQuantity}
               setVariantName={setVariantName}
               setVariantCode={setVariantCode}
               setVariantQuantity={setVariantQuantity}
               setIsAddVariantOpen={setIsAddVariantOpen}
               fetchPage={fetchPage}
            />
         )}

         {/* Update Material Modal */}
         {(isUpdateModalOpen || isUpdateModalVisible) && selectedMaterialForUpdate && (
            <UpdateProductModal
               title="Cập nhật vật tư"
               isModalVisible={isUpdateModalVisible}
               selectedProduct={selectedMaterialForUpdate}
               unitId={unitId}
               unitOptions={unitOptions}
               setIsModalOpen={setIsUpdateModalOpen}
               handleUpdate={handleUpdateMaterial}
               setUnitId={setUnitId}
               fetchUnits={fetchUnits}
            />
         )}

         {/* Delete Confirmation Modal */}
         <Confirm
            isOpen={isDeleteModalOpen}
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa vật tư "${materialToDelete?.item_name}"?`}
            onConfirm={handleConfirmDelete}
            onCancel={() => {
               setIsDeleteModalOpen(false);
               setMaterialToDelete(null);
            }}
         />
      </div>
   );
};

export default Materials;
