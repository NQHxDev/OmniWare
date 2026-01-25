import { useMemo, useState } from 'react';
import { Search, Eye, Plus, Minus } from 'lucide-react';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';

type Variant = {
   id: number;
   name: string;
   sku: string;
   quantity: number;
   minStock: number;
};

type Product = {
   id: number;
   name: string;
   category: string;
   unit: string;
   variants: Variant[];
};

type ProductRow = Product & {
   totalStock: number;
   hasLowStock: boolean;
};

const products: Product[] = [
   {
      id: 1,
      name: 'Quai dép',
      category: 'Phụ kiện',
      unit: 'Cái',
      variants: [
         { id: 101, name: 'Đỏ - 37', sku: 'QD-RED-37', quantity: 50, minStock: 10 },
         { id: 102, name: 'Đỏ - 38', sku: 'QD-RED-38', quantity: 8, minStock: 10 },
         {
            id: 103,
            name: 'Xanh - 37',
            sku: 'QD-BLUE-37',
            quantity: 35,
            minStock: 10,
         },
      ],
   },
   {
      id: 2,
      name: 'Keo dán',
      category: 'Vật tư',
      unit: 'Thùng',
      variants: [{ id: 201, name: 'Keo dán chính', sku: 'KD-01', quantity: 2, minStock: 5 }],
   },
];

/* ================= COMPONENT ================= */

const Inventory = () => {
   const [search, setSearch] = useState<string>('');
   const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
   const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
   const [showDetail, setShowDetail] = useState<boolean>(false);
   const [showStockModal, setShowStockModal] = useState<boolean>(false);
   const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
   const [stockAction, setStockAction] = useState<'IN' | 'OUT' | null>(null);

   /* ============ PRODUCT LIST ============ */

   const toggleVariant = (id: number) => {
      setSelectedVariantIds((prev) =>
         prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      );
   };

   const toggleAllVariants = () => {
      if (!selectedProduct) return;

      if (selectedVariantIds.length === filteredVariants.length) {
         setSelectedVariantIds([]);
      } else {
         setSelectedVariantIds(filteredVariants.map((v) => v.id));
      }
   };

   const productRows = products.map((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.quantity, 0);
      const hasLowStock = p.variants.some((v) => v.quantity <= v.minStock);

      return {
         ...p,
         totalStock,
         hasLowStock,
      };
   });

   const headers = ['Sản phẩm', 'Danh mục', 'Tổng tồn', 'Cảnh báo', 'Thao tác'];

   /* ============ VARIANT FILTER ============ */

   const filteredVariants = useMemo(() => {
      if (!selectedProduct) return [];

      return selectedProduct.variants.filter((v: Variant) => {
         if (!search) return true;
         return (
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.sku.toLowerCase().includes(search.toLowerCase())
         );
      });
   }, [selectedProduct, search]);

   /* ============ RENDER ============ */

   return (
      <div>
         {/* ===== HEADER ===== */}
         <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý tồn kho</h1>
            <p className="text-gray-600 mt-1">Quản lý theo sản phẩm, xem chi tiết biến thể</p>
         </div>

         {/* ===== PRODUCT TABLE ===== */}
         <div className="bg-white rounded-lg shadow">
            <Table
               headers={headers}
               data={productRows}
               renderRow={(product) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                     <td className="px-6 py-4 font-medium">{product.name}</td>
                     <td className="px-6 py-4">{product.category}</td>
                     <td className="px-6 py-4 font-semibold">
                        {product.totalStock} {product.unit}
                     </td>
                     <td className="px-6 py-4">
                        {product.hasLowStock ? (
                           <span className="text-red-600 font-medium">⚠ Tồn thấp</span>
                        ) : (
                           <span className="text-green-600">Ổn định</span>
                        )}
                     </td>
                     <td className="px-6 py-4">
                        <Button
                           size="sm"
                           variant="secondary"
                           onClick={() => {
                              setSelectedProduct(product);
                              setShowDetail(true);
                           }}
                        >
                           <Eye className="h-4 w-4 mr-1" />
                           Xem chi tiết
                        </Button>
                     </td>
                  </tr>
               )}
            />
         </div>

         {/* ===== PRODUCT DETAIL DRAWER ===== */}
         {showDetail && selectedProduct && (
            <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
               <div className="w-full max-w-3xl bg-white h-full p-6 overflow-y-auto">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                     <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                           {selectedProduct.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                           {selectedProduct.category} • {selectedProduct.unit}
                        </p>
                     </div>

                     <div className="flex items-center gap-2">
                        <Button className="flex items-center">
                           <Plus className="h-4 w-4 mr-2" />
                           Thêm biến thể
                        </Button>

                        <Button variant="secondary" onClick={() => setShowDetail(false)}>
                           Đóng
                        </Button>
                     </div>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-3 mb-4">
                     {/* Ô Search: Đảm bảo chiều cao đồng bộ */}
                     <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           placeholder="Tìm biến thể..."
                           className="w-full h-10 pl-9 pr-3 py-2 border
                            border-gray-300 rounded-lg text-sm focus:ring-2
                            focus:ring-gray-900 focus:outline-none transition-all"
                        />
                     </div>

                     {/* Button Nhập */}
                     <Button
                        variant="secondary"
                        disabled={selectedVariantIds.length === 0}
                        onClick={() => {
                           setStockAction('IN');
                           setShowStockModal(true);
                        }}
                        className="h-10 px-4 flex items-center justify-center whitespace-nowrap"
                     >
                        <Plus className="h-4 w-4 mr-1.5" />
                        <span>Nhập</span>
                     </Button>

                     {/* Button Xuất */}
                     <Button
                        variant="secondary"
                        disabled={selectedVariantIds.length === 0}
                        onClick={() => {
                           setStockAction('OUT');
                           setShowStockModal(true);
                        }}
                        className="h-10 px-4 flex items-center justify-center whitespace-nowrap"
                     >
                        <Minus className="h-4 w-4 mr-1.5" />
                        <span>Xuất</span>
                     </Button>
                  </div>

                  {/* Variant Table */}
                  <table className="w-full border border-gray-200 rounded-lg overflow-hidden border-separate border-spacing-0">
                     <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                        <tr>
                           <th className="px-4 py-3 text-center w-12">
                              <input
                                 type="checkbox"
                                 checked={
                                    filteredVariants.length > 0 &&
                                    selectedVariantIds.length === filteredVariants.length
                                 }
                                 onChange={toggleAllVariants}
                              />
                           </th>
                           <th className="px-4 py-3 text-left font-semibold">Biến thể</th>
                           <th className="px-4 py-3 text-left font-semibold">SKU</th>
                           <th className="px-4 py-3 text-center font-semibold">Tồn</th>
                           <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredVariants.map((v: Variant) => (
                           <tr key={v.id} className="hover:bg-gray-50 transition-colors text-sm">
                              <td className="px-4 py-3 text-center">
                                 <input
                                    type="checkbox"
                                    checked={selectedVariantIds.includes(v.id)}
                                    onChange={() => toggleVariant(v.id)}
                                 />
                              </td>

                              <td className="px-4 py-3 text-gray-900 font-medium">{v.name}</td>

                              <td className="px-4 py-3 text-gray-500 text-xs">{v.sku}</td>

                              <td className="px-4 py-3 font-bold text-center">{v.quantity}</td>

                              <td className="px-4 py-3">
                                 <div className="flex items-center justify-center gap-4">
                                    <div className="flex items-center justify-center gap-3">
                                       <button
                                          title="Nhập kho"
                                          onClick={() => {
                                             setSelectedVariant(v);
                                             setShowStockModal(true);
                                          }}
                                          className="
                                             p-2 text-emerald-600
                                             hover:bg-emerald-50
                                             rounded-full
                                             transition-colors
                                             border border-transparent
                                             hover:border-emerald-200
                                          "
                                       >
                                          <Plus className="h-4 w-4" />
                                       </button>

                                       <button
                                          title="Xuất kho"
                                          className="p-2 text-red-600 hover:bg-red-50
                                             rounded-full transition-colors
                                             border border-transparent hover:border-red-200
                                          "
                                       >
                                          <Minus className="h-4 w-4" />
                                       </button>
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* ===== STOCK MODAL ===== */}
         <Modal
            isOpen={showStockModal}
            onClose={() => setShowStockModal(false)}
            title={`Nhập kho - ${selectedVariant?.name}`}
         >
            <form className="space-y-4">
               <input
                  type="number"
                  min={1}
                  placeholder="Số lượng"
                  className="w-full px-3 py-2 border rounded-lg"
               />
               <textarea
                  placeholder="Ghi chú"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
               />
               <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setShowStockModal(false)}>
                     Hủy
                  </Button>
                  <Button>Xác nhận</Button>
               </div>
            </form>
         </Modal>
      </div>
   );
};

export default Inventory;
