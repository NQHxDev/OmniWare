import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Select from '../components/common/Select';

const Products = () => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [category, setCategory] = useState('');
   const [unit, setUnit] = useState('');

   const products = [
      {
         id: 1,
         name: 'Quai dép',
         sku: 'QD001',
         category: 'Phụ kiện',
         variants: ['Đỏ/37', 'Đỏ/38', 'Xanh/37'],
         stock: 150,
      },
      {
         id: 2,
         name: 'Keo dán',
         sku: 'KD002',
         category: 'Vật tư',
         variants: [],
         stock: 2,
      },
      {
         id: 3,
         name: 'Giấy bọc',
         sku: 'GB003',
         category: 'Vật tư',
         variants: [],
         stock: 3,
      },
      {
         id: 4,
         name: 'Dây da',
         sku: 'DD004',
         category: 'Nguyên liệu',
         variants: ['Nâu', 'Đen', 'Trắng'],
         stock: 89,
      },
   ];

   const headers = ['Tên sản phẩm', 'Mã SKU', 'Danh mục', 'Biến thể', 'Tồn kho', 'Thao tác'];

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
               <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-gray-600">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {product.category}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex flex-wrap gap-1">
                        {product.variants.length > 0 ? (
                           <span className="text-sm text-gray-500">Có biến thể</span>
                        ) : (
                           <span className="text-sm text-gray-500">Không có biến thể</span>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     <div className={'font-medium'}>{product.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <div className="flex items-center space-x-3">
                        <button className="text-gray-600 hover:text-gray-900">
                           <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                           <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </td>
               </tr>
            )}
         />

         {/* Add Product Modal */}
         <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Thêm sản phẩm mới"
            size="lg"
         >
            <form className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên sản phẩm *
                     </label>
                     <input
                        type="text"
                        placeholder="Ví dụ: Quai"
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
                     <label className="block text-sm font-medium text-gray-700 mb-2">Mã SKU</label>
                     <input
                        type="text"
                        placeholder="Tự động hoặc nhập thủ công"
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
                        label="Danh mục"
                        placeholder="Chọn danh mục"
                        value={category}
                        onChange={setCategory}
                        options={[
                           { label: 'Phụ kiện', value: '1' },
                           { label: 'Nguyên liệu', value: '2' },
                           { label: 'Vật tư', value: '3' },
                        ]}
                     />
                  </div>
                  <div>
                     <Select
                        label="Đơn vị tính"
                        placeholder="Chọn đơn vị"
                        value={unit}
                        onChange={setUnit}
                        options={[
                           { label: 'Cái', value: '1' },
                           { label: 'Chiếc', value: '2' },
                           { label: 'Hộp', value: '3' },
                           { label: 'Thùng', value: '4' },
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
         </Modal>
      </div>
   );
};

export default Products;
