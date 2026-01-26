/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Button from '../components/Common/Button';
import Select from '../components/Common/Select';
import { useUnitStore } from '../stores/unit.store';
import { Item, useItemStore } from '../stores/item.store';
import { Variant } from '../stores/variant.store';
import { useVariantStore } from '../stores/variant.store';
import ItemDetailModal from '@/components/Products/ItemDetail';
import ItemTable from '@/components/Products/ItemTable';
import CreateVariantModal from '@/components/Products/CreateVariantModal';
import CreateItemModal from '@/components/Products/CreateItemModal';

const Products = () => {
   // Search and filter states
   const [search, setSearch] = useState<string>('');
   const [searchTerm, setSearchTerm] = useState('');

   // Modal states
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

   // Animation states
   const [showDetail, setShowDetail] = useState<boolean>(false);
   const [showStockModal, setShowStockModal] = useState<boolean>(false);

   // Selection states
   const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
   const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
   const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
   const [stockAction, setStockAction] = useState<'IN' | 'OUT' | null>(null);

   // Data hooks
   const { units, fetchUnits } = useUnitStore();
   const { items, page, total, limit, isLoadingItem, fetchPage } = useItemStore();
   const { variantsByItem, fetchByItem } = useVariantStore();

   // From Data
   const [itemName, setItemName] = useState('');
   const [itemCode, setItemCode] = useState('');
   const [unitId, setUnitId] = useState<string | number | null>(null);
   const [typeId] = useState(1);

   const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
   const [variantName, setVariantName] = useState('');
   const [variantCode, setVariantCode] = useState('');
   const [variantQuantity, setVariantQuantity] = useState(0);

   useEffect(() => {
      fetchUnits();
   }, [fetchUnits]);

   useEffect(() => {
      fetchPage(1);
   }, [fetchPage]);

   const tableData = useMemo(() => {
      return items.map((item) => ({
         item_id: item.item_id,
         item_name: item.item_name,
         item_code: item.item_code,
         item_type: item.item_type,
         unit_name: item.unit_name,
         count_variant: item.count_variant || 0,
         total_quantity: item.total_quantity ?? 0,
      }));
   }, [items]);

   const unitOptions = useMemo(() => {
      if (!units || units.length === 0) return [];

      return units
         .map((unit) => {
            const id = unit?.unit_id || unit?.unit_id;
            const name = unit?.unit_name || unit?.unit_slug || '';

            return {
               label: name,
               value: id.toString(),
            };
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

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!itemName.trim()) {
         alert('Vui lòng nhập tên sản phẩm');
         return;
      }

      if (!unitId) {
         alert('Vui lòng chọn đơn vị tính');
         return;
      }

      try {
         await window.api.createItem(
            itemName,
            itemCode,
            typeId, // = 1
            Number(unitId)
         );

         // reset form
         setItemName('');
         setItemCode('');
         setUnitId(null);

         // đóng modal
         setIsModalOpen(false);

         // reload danh sách
         await fetchPage(page);
      } catch (err) {
         alert('Lỗi khi thêm sản phẩm: Vui lòng thử lại');

         setTimeout(() => {
            const firstInput = document.querySelector('input[name="itemName"]');
            if (firstInput) {
               (firstInput as HTMLInputElement).focus();
            }
         }, 100);
      }
   };

   const handleAddVariant = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedProduct) return;

      if (!variantName.trim()) {
         alert('Vui lòng nhập tên biến thể');
         return;
      }

      try {
         const res = await window.api.createVariant(
            selectedProduct.item_id,
            variantName,
            variantCode,
            variantQuantity
         );

         // cập nhật store
         useVariantStore.getState().addVariant(selectedProduct.item_id, {
            variant_id: res.lastInsertRowid,
            variant_name: variantName,
            variant_code: variantCode,
            quantity: variantQuantity,
         });

         setVariantName('');
         setVariantCode('');
         setVariantQuantity(0);
         setIsAddVariantOpen(false);

         await fetchPage(page);
      } catch (err) {
         alert('Lỗi khi thêm biến thể: Vui lòng thử lại');

         setTimeout(() => {
            const firstInput = document.querySelector('input[name="variantName"]');
            if (firstInput) {
               (firstInput as HTMLInputElement).focus();
            }
         }, 100);
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
            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                     <input
                        type="search"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="
                           w-full
                           pl-10 pr-4 py-2 border
                           focus:outline-none
                           border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-gray-900
                           focus:border-transparent
                           placeholder:text-gray-400
                        "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

         {/* Products Table */}
         <div className="overflow-hidden" style={{ minHeight: `${minHeight}px` }}>
            <ItemTable
               data={tableData}
               isLoading={isLoadingItem}
               limit={limit}
               page={page}
               fetchPage={fetchPage}
               onEdit={async (product) => {
                  setSelectedVariantIds([]);
                  setSelectedVariant(null);
                  setSelectedProduct(product);
                  setShowDetail(true);
                  await fetchByItem(product.item_id);
               }}
            />
         </div>

         {/* pagination */}
         {tableData.length > 0 && (
            <div className="flex justify-end gap-2 mt-4">
               <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => fetchPage(page - 1)}
               >
                  Trang trước
               </Button>

               <span className="px-3 py-2 text-sm">Trang {page}</span>

               <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => fetchPage(page + 1)}
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
               search={search}
               page={page}
               setSearch={setSearch}
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
               isModalVisible={isModalVisible}
               variantCode={variantCode}
               variantQuantity={variantQuantity}
               unitId={unitId}
               setIsModalOpen={setIsModalOpen}
               handleSubmit={handleSubmit}
               setItemName={setItemName}
               setItemCode={setItemCode}
               setUnitId={setUnitId}
               unitOptions={unitOptions}
            />
         )}

         {/* Add Variant Modal */}
         {isAddVariantOpen && (
            <CreateVariantModal
               variantName={variantName}
               variantCode={variantCode}
               setVariantName={setVariantName}
               setVariantCode={setVariantCode}
               setVariantQuantity={setVariantQuantity}
               handleAddVariant={handleAddVariant}
               setIsAddVariantOpen={setIsAddVariantOpen}
            />
         )}
      </div>
   );
};

export default Products;
