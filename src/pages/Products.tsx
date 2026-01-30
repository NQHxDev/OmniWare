/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import Button from '../components/Common/Button';
import { SelectOption } from '../components/Common/Select';
import { useUnitStore } from '../stores/unit.store';
import { Item, useItemStore } from '../stores/item.store';
import { Variant } from '../stores/variant.store';
import { useVariantStore } from '../stores/variant.store';
import ItemDetailModal from '@/components/Products/ItemDetail';
import ItemTable from '@/components/Products/ItemTable';
import CreateVariantModal from '@/components/Products/CreateVariantModal';
import CreateItemModal from '@/components/Products/CreateItemModal';
import UpdateProductModal from '@/components/Products/UpdateProduct';

const Products = () => {
   // Search and filter states
   const [searchTerm, setSearchTerm] = useState<string>('');
   const [searchVariant, setSearchVariant] = useState<string>('');

   // Modal states
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
   const [showFilters, setShowFilters] = useState(false);

   // Animation states
   const [showDetail, setShowDetail] = useState<boolean>(false);
   const [showStockModal, setShowStockModal] = useState<boolean>(false);

   // Selection states
   const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
   const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
   const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
   const [stockAction, setStockAction] = useState<'IN' | 'OUT' | null>(null);
   const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

   // Data hooks
   const { units, fetchUnits } = useUnitStore();
   const { items, page, total, limit, isLoadingItem, fetchPage } = useItemStore();
   const { variantsByItem, fetchByItem } = useVariantStore();

   // From Data
   const [itemName, setItemName] = useState('');
   const [itemCode, setItemCode] = useState('');
   const [unitId, setUnitId] = useState<string | number | null>(null);
   const [typeId] = useState(1);
   const [lowStockThreshold, setLowStockThreshold] = useState(-1);

   const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
   const [variantName, setVariantName] = useState('');
   const [variantCode, setVariantCode] = useState('');
   const [variantQuantity, setVariantQuantity] = useState(0);

   const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
   const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false);
   const [selectedProductForUpdate, setSelectedProductForUpdate] = useState<Item | null>(null);

   const typeOptions: { value: string; label: string }[] = [
      { value: 'in_stock', label: 'Còn hàng' },
      { value: 'low_stock', label: 'Sắp hết' },
      { value: 'out_of_stock', label: 'Hết hàng' },
   ];

   useEffect(() => {
      fetchUnits();
   }, [fetchUnits]);

   useEffect(() => {
      fetchPage(1, 1);
   }, [fetchPage]);

   useEffect(() => {
      if (isUpdateModalOpen) {
         setTimeout(() => {
            setIsUpdateModalVisible(true);
         }, 10);
      } else {
         setIsUpdateModalVisible(false);
      }
   }, [isUpdateModalOpen]);

   const tableData = useMemo(() => {
      if (searchTerm)
         return items.filter(
            (it) =>
               it.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               it.item_code.toLowerCase().includes(searchTerm.toLowerCase())
         );

      return items.map((item) => ({
         item_id: item.item_id,
         item_name: item.item_name,
         item_code: item.item_code,
         item_type: item.item_type,
         unit_name: item.unit_name,
         count_variant: item.count_variant || 0,
         is_low_stock: item.is_low_stock || 0,
         low_stock_threshold: item.low_stock_threshold || 0,
         total_quantity: item.total_quantity ?? 0,
      }));
   }, [items, searchTerm]);

   const unitOptions: SelectOption[] = useMemo(() => {
      if (!units || units.length === 0) return [];

      return units
         .map((unit) => {
            const oneUnit: SelectOption = {
               value: unit?.unit_id.toString(),
               label: unit?.unit_name || '',
            };

            return oneUnit;
         })
         .filter(Boolean);
   }, [units]);

   const toggleVariant = (id: number) => {
      setSelectedVariantIds((prev) =>
         prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      );
   };

   const toggleAllVariants = () => {
      if (!selectedProduct) return;

      const variants = variantsByItem[selectedProduct.item_id] || [];
      setSelectedVariantIds(
         selectedVariantIds.length === variants.length ? [] : variants.map((v) => v.variant_id)
      );
   };

   const handleUpdateProduct = async (
      e: React.FormEvent,
      updatedData: {
         item_name: string;
         item_code: string;
         unit_id: number;
         low_stock_threshold: number;
      }
   ) => {
      e.preventDefault();

      if (!selectedProductForUpdate) return;

      try {
         await window.api.updateItem(
            selectedProductForUpdate.item_id,
            updatedData.item_name,
            updatedData.item_code,
            updatedData.unit_id,
            updatedData.low_stock_threshold
         );

         await fetchPage(page, 1);
         setIsUpdateModalOpen(false);

         // Cập nhật selectedProduct
         if (selectedProduct?.item_id === selectedProductForUpdate.item_id) {
            setSelectedProduct({
               ...selectedProduct,
               ...updatedData,
               unit_name:
                  unitOptions.find((u) => u.value === String(updatedData.unit_id))?.label ||
                  selectedProduct.unit_name,
            });
         }
      } catch (err) {
         alert('Lỗi khi cập nhật sản phẩm: Vui lòng thử lại');
      }
   };

   // Effect để quản lý animation cho drawer
   useEffect(() => {
      if (showDetail) {
         setTimeout(() => {
            setIsDrawerVisible(true);
         }, 10);
      } else {
         // Tắt animation trước khi đóng drawer
         setIsDrawerVisible(false);
         // Delay một chút trước khi set selectedProduct về null
         const timer = setTimeout(() => {
            if (!showDetail) {
               setSelectedProduct(null);
            }
         }, 300);
         return () => clearTimeout(timer);
      }
   }, [showDetail]);

   useEffect(() => {
      if (isModalOpen) {
         setTimeout(() => {
            setIsModalVisible(true);
         }, 10);
      } else {
         setIsModalVisible(false);
      }
   }, [isModalOpen]);

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const totalValue = (total as any)?.total || 0;
   const totalPages = Math.ceil(totalValue / limit);

   const ROW_HEIGHT = 70;
   const minHeight = limit * ROW_HEIGHT;

   return (
      <div>
         <div className="flex items-center justify-between mb-8">
            <div>
               <h1 className="text-2xl font-semibold text-gray-900">Quản lý sản phẩm</h1>
               <p className="mt-2 text-gray-600">Danh sách sản phẩm và biến thể</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
               <Plus className="h-4 w-4 mr-2" />
               Thêm sản phẩm
            </Button>
         </div>

         {/* Filters and Search */}
         <div className="bg-white rounded-lg shadow p-4 mb-6">
            {/* Top bar */}
            <div className="flex flex-col md:flex-row gap-4">
               {/* Search */}
               <div className="flex-1">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                     <input
                        type="search"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="
                           w-full pl-10 pr-4 py-2 border
                           focus:outline-none
                           border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-gray-900
                           focus:border-transparent
                           placeholder:text-gray-400
                        "
                     />
                  </div>
               </div>

               {/* Buttons */}
               <div className="flex gap-2">
                  <Button
                     variant="secondary"
                     onClick={() => setShowFilters(!showFilters)}
                     className="flex items-center"
                  >
                     <Filter className="h-4 w-4 mr-2" />
                     Lọc
                     {showFilters ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                     ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                     )}
                  </Button>

                  <Button variant="ghost">Xuất Excel</Button>
               </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
               <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                     Loại giao dịch
                  </label>

                  {/* Checkbox nằm ngang */}
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                     {typeOptions.map((option) => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                           <input
                              type="checkbox"
                              checked={selectedTypes.includes(option.value)}
                              onChange={(e) => {
                                 if (e.target.checked) {
                                    setSelectedTypes([...selectedTypes, option.value]);
                                 } else {
                                    setSelectedTypes(
                                       selectedTypes.filter((t) => t !== option.value)
                                    );
                                 }
                              }}
                              className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                           />
                           <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* Products Table */}
         <div className="overflow-hidden" style={{ minHeight: `${minHeight}px` }}>
            <ItemTable
               data={tableData}
               isLoading={isLoadingItem}
               limit={limit}
               page={page}
               fetchPage={fetchPage}
               onViewDetails={async (product) => {
                  setSelectedVariantIds([]);
                  setSelectedVariant(null);
                  setSelectedProduct(product);
                  setShowDetail(true);
                  await fetchByItem(product.item_id);
               }}
               setIsModalOpen={setIsModalOpen}
               setIsUpdateModalOpen={setIsUpdateModalOpen}
               setSelectedProductForUpdate={setSelectedProductForUpdate}
            />
         </div>

         {/* pagination */}
         {tableData.length >= limit && (
            <div className="flex justify-end gap-2 mt-4">
               <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => fetchPage(page - 1, 1)}
               >
                  Trang trước
               </Button>

               <span className="px-3 py-2 text-sm">Trang {page}</span>

               <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => fetchPage(page + 1, 1)}
               >
                  Trang sau
               </Button>
            </div>
         )}

         {/* Modal Product Detail */}
         {(showDetail || selectedProduct) && (
            <ItemDetailModal
               isDrawerVisible={isDrawerVisible}
               selectedProduct={selectedProduct!}
               variants={variantsByItem[selectedProduct!.item_id] || []}
               page={page}
               searchVariant={searchVariant}
               setSearchVariant={setSearchVariant}
               selectedVariantIds={selectedVariantIds}
               toggleVariant={toggleVariant}
               toggleAllVariants={toggleAllVariants}
               setSelectedVariantIds={setSelectedVariantIds}
               onClose={() => setShowDetail(false)}
               onOpenAddVariant={() => setIsAddVariantOpen(true)}
               fetchPage={fetchPage}
               onStockIn={() => {
                  setStockAction('IN');
                  setShowStockModal(true);
               }}
               onStockOut={() => {
                  setStockAction('OUT');
                  setShowStockModal(true);
               }}
            />
         )}

         {/* Add Product Modal */}
         {(isModalOpen || isModalVisible) && (
            <CreateItemModal
               page={page}
               title="sản phẩm"
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
               selectedItem={selectedProduct}
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

         {/* Update Product Modal */}
         {(isUpdateModalOpen || isUpdateModalVisible) && selectedProductForUpdate && (
            <UpdateProductModal
               title={'Cập nhật vật phẩm'}
               isModalVisible={isUpdateModalVisible}
               selectedProduct={selectedProductForUpdate}
               unitId={unitId}
               unitOptions={unitOptions}
               setIsModalOpen={setIsUpdateModalOpen}
               handleUpdate={handleUpdateProduct}
               setUnitId={setUnitId}
               fetchUnits={fetchUnits}
            />
         )}
      </div>
   );
};

export default Products;
