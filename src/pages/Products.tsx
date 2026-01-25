import { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Minus } from 'lucide-react';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Select from '../components/common/Select';

type Variant = {
   id: number;
   name: string;
   sku: string;
   quantity: number;
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
};

const Products = () => {
   const [search, setSearch] = useState<string>('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [unit, setUnit] = useState('');

   const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
   const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
   const [showDetail, setShowDetail] = useState<boolean>(false);
   const [showStockModal, setShowStockModal] = useState<boolean>(false);
   const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
   const [stockAction, setStockAction] = useState<'IN' | 'OUT' | null>(null);

   // Thêm state cho animation
   const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

   const products = [
      {
         id: 1,
         name: 'Mẫu ABC',
         product_code: 'ABC001',
         category: 'Giày',
         unit: 'Đôi',
         variants: [
            { id: 101, name: 'Đỏ - 37', sku: 'ABC-RED-37', quantity: 50 },
            { id: 102, name: 'Đỏ - 38', sku: 'ABC-RED-38', quantity: 8 },
            { id: 103, name: 'Đỏ - 39', sku: 'ABC-RED-39', quantity: 8 },
            { id: 104, name: 'Đỏ - 40', sku: 'ABC-RED-40', quantity: 8 },
            {
               id: 105,
               name: 'Xanh - 37',
               sku: 'QD-BLUE-37',
               quantity: 35,
            },
         ],
         totalStock: 150,
      },
   ];

   const headers = ['Tên sản phẩm', 'Mã sản phẩm', 'Số biến thể', 'Số lượng', 'Thao tác'];

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
         setSelectedVariantIds(filteredVariants.map((v: Variant) => v.id));
      }
   };

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

   // Effect để quản lý animation cho drawer
   useEffect(() => {
      if (showDetail) {
         // Kích hoạt animation khi mở drawer
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

   // Effect để quản lý animation cho modal
   useEffect(() => {
      if (isModalOpen) {
         setTimeout(() => {
            setIsModalVisible(true);
         }, 10);
      } else {
         setIsModalVisible(false);
      }
   }, [isModalOpen]);

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
         <Table
            headers={headers}
            data={products}
            renderRow={(product) => (
               <tr
                  key={product.id}
                  className="hover:bg-gray-50/80 transition-colors border-b last:border-0 text-sm"
               >
                  {/* Tên sản phẩm – căn trái */}
                  <td className="px-6 py-4 text-center">
                     <div className="font-semibold text-gray-900">{product.name}</div>
                  </td>

                  <td className="px-6 py-4 text-center">
                     <span
                        className="
                           inline-block
                           text-xs font-mono text-gray-500
                           bg-gray-50 px-2 py-1
                           rounded border border-gray-100
                        "
                     >
                        {product.product_code}
                     </span>
                  </td>

                  {/* Số biến thể */}
                  <td className="px-6 py-4 text-center">
                     <span className="font-medium text-gray-900">{product.variants.length}</span>
                  </td>

                  {/* Số lượng */}
                  <td className="px-6 py-4 text-center">
                     <span
                        className={`font-bold ${
                           product.totalStock > 0 ? 'text-gray-900' : 'text-red-500'
                        }`}
                     >
                        {product.totalStock.toLocaleString()}
                     </span>
                  </td>

                  {/* Thao tác */}
                  <td className="px-6 py-4 text-center">
                     <div className="flex items-center justify-center gap-1">
                        <Button
                           title="Sửa"
                           variant="ghost"
                           onClick={() => {
                              setSelectedProduct(product);
                              setShowDetail(true);
                           }}
                           className="p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                        >
                           <Edit className="h-4 w-4" />
                        </Button>
                        <button
                           title="Xóa"
                           className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg"
                        >
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </td>
               </tr>
            )}
         />

         {/* ===== PRODUCT DETAIL DRAWER ===== */}
         {(showDetail || selectedProduct) && (
            <div className="fixed inset-0 z-50 overflow-hidden">
               {/* Backdrop với transition */}
               <div
                  className={`
                     fixed inset-0 bg-black
                     transition-opacity duration-300 ease-in-out
                     ${isDrawerVisible ? 'opacity-40' : 'opacity-0'}
                  `}
                  onClick={() => setShowDetail(false)}
               />

               {/* Drawer với slide-in animation */}
               <div
                  className={`
                     fixed inset-y-0 right-0
                     flex max-w-full
                     transform transition-transform duration-500 ease-in-out
                     ${isDrawerVisible ? 'translate-x-0' : 'translate-x-full'}
                  `}
               >
                  <div className="w-screen max-w-3xl">
                     {selectedProduct && (
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
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm biến thể..."
                                    className="w-full h-10 pl-9 pr-3 py-2 border
                                       border-gray-300 rounded-lg text-sm focus:ring-2
                                       focus:ring-gray-900 focus:outline-none transition-all
                                    "
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

                              <Button
                                 variant="secondary"
                                 disabled={selectedVariantIds.length === 0}
                                 onClick={() => {
                                    setStockAction('OUT');
                                    setShowStockModal(true);
                                 }}
                                 className="h-10 px-4 flex items-center justify-center whitespace-nowrap"
                              >
                                 <Trash2 className="h-4 w-4 mr-1.5" />
                                 <span>Xoá</span>
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
                                    <th className="px-4 py-3 text-left font-semibold">Mã SKU</th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                       Số lượng
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                       Thao tác
                                    </th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                 {filteredVariants.map((v: Variant) => (
                                    <tr
                                       key={v.id}
                                       className="hover:bg-gray-50 transition-colors text-sm"
                                    >
                                       <td className="px-4 py-3 text-center">
                                          <input
                                             type="checkbox"
                                             checked={selectedVariantIds.includes(v.id)}
                                             onChange={() => toggleVariant(v.id)}
                                          />
                                       </td>

                                       <td className="px-4 py-3 text-gray-900 font-medium">
                                          {v.name}
                                       </td>

                                       <td className="px-4 py-3 text-gray-500 text-xs">{v.sku}</td>

                                       <td className="px-4 py-3 font-bold text-center">
                                          {v.quantity}
                                       </td>

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
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* Add Product Modal */}
         {(isModalOpen || isModalVisible) && (
            <div className="fixed inset-0 z-60 overflow-y-auto">
               {/* Backdrop với transition */}
               <div
                  className={`
                     fixed inset-0 bg-black
                     transition-opacity duration-300 ease-in-out
                     ${isModalVisible ? 'opacity-40' : 'opacity-0'}
                  `}
                  onClick={() => setIsModalOpen(false)}
               />

               <div className="flex min-h-full items-center justify-center p-4">
                  <div
                     className={`
                     relative bg-white rounded-lg shadow-xl w-full max-w-lg
                     transform transition-all duration-300 ease-in-out
                     ${isModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                  `}
                  >
                     {/* Header */}
                     <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Thêm sản phẩm mới</h3>
                        <button
                           onClick={() => setIsModalOpen(false)}
                           className="text-gray-400 hover:text-gray-500 p-1"
                        >
                           ×
                        </button>
                     </div>

                     {/* Content */}
                     <div className="p-6">
                        <form className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên sản phẩm *
                                 </label>
                                 <input
                                    type="text"
                                    placeholder="Ví dụ: Mẫu ABC"
                                    className="
                                       w-full px-3 py-2
                                       border border-gray-300 rounded-lg
                                       text-sm text-gray-900
                                       placeholder:text-gray-400
                                       focus:outline-none
                                       focus:ring-2 focus:ring-gray-900
                                       focus:border-transparent
                                       autofill:bg-white
                                    "
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã sản phẩm
                                 </label>
                                 <input
                                    type="text"
                                    placeholder="Ví dụ: ABC001"
                                    className="
                                       w-full px-3 py-2
                                       border border-gray-300 rounded-lg
                                       text-sm text-gray-900
                                       placeholder:text-gray-400
                                       focus:outline-none
                                       focus:ring-2 focus:ring-gray-900
                                       focus:border-transparent
                                       autofill:bg-white
                                    "
                                 />
                              </div>
                              <div>
                                 <Select
                                    label="Đơn vị tính"
                                    placeholder="Chọn đơn vị"
                                    value={unit}
                                    onChange={setUnit}
                                    options={[
                                       { label: 'Đôi', value: '1' },
                                       { label: 'Cái', value: '2' },
                                       { label: 'Chiếc', value: '3' },
                                       { label: 'Hộp', value: '4' },
                                       { label: 'Thùng', value: '5' },
                                    ]}
                                 />
                              </div>
                           </div>

                           <div>
                              <label className="flex items-center space-x-2">
                                 <input type="checkbox" className="rounded border-gray-300" />
                                 <span className="text-sm text-gray-700">
                                    Sản phẩm có biến thể (màu sắc, kích thước)
                                 </span>
                              </label>
                           </div>

                           <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                 Hủy
                              </Button>
                              <Button type="submit">Lưu sản phẩm</Button>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Products;
