import { useState, useEffect, useCallback } from 'react';
import {
   FiSearch,
   FiFilter,
   FiDownload,
   FiRefreshCw,
   FiArrowDown,
   FiArrowUp,
   FiPackage,
   FiClock,
} from 'react-icons/fi';
import { FilePlus, PackagePlus, PackageMinus, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../components/Common/Button';
import { useSettingsStore } from '../stores/settingsStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Define transaction types
export type TransactionType = 'create' | 'in' | 'out';

export interface Transaction {
   history_id: number;
   type: TransactionType;
   item_id: number;
   item_name: string;
   item_code: string;
   item_type: 1 | 2 | 3; // 1: Product, 2: Material, 3: Inventory
   variant_id?: number;
   variant_name?: string;
   variant_code?: string;
   quantity: number;
   previous_quantity: number;
   new_quantity: number;
   user_id: number;
   user_name: string;
   created_at: string;
   notes?: string;
}

const Transactions = () => {
   // State for transactions and loading
   const [transactions, setTransactions] = useState<Transaction[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Pagination state
   const [page, setPage] = useState(1);
   const [total, setTotal] = useState(0);

   // Filter states
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([]);
   const [selectedItemTypes, setSelectedItemTypes] = useState<(1 | 2 | 3)[]>([]);
   const [dateRange, setDateRange] = useState<{
      start: string;
      end: string;
   }>({
      start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days ago
      end: format(new Date(), 'yyyy-MM-dd'),
   });

   // Sort state
   const [sortField, setSortField] = useState<keyof Transaction>('created_at');
   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

   // Modal states
   const [showFilters, setShowFilters] = useState(false);

   // Get settings
   const { settings } = useSettingsStore();
   const itemsPerPage = settings.limit || 8;

   // Fetch transactions
   const fetchTransactions = useCallback(
      async (pageNum: number) => {
         setIsLoading(true);
         setError(null);

         try {
            const filters = {
               search: searchTerm,
               types: selectedTypes,
               itemTypes: selectedItemTypes,
               startDate: dateRange.start,
               endDate: dateRange.end,
               page: pageNum,
               limit: itemsPerPage,
               sortField,
               sortDirection,
            };

            const result = await window.api.getTransactions(filters);

            setTransactions(result.data);
            setTotal(result.total);
            setPage(pageNum);
         } catch {
            setError('Không thể tải nhật ký giao dịch.');
         } finally {
            setIsLoading(false);
         }
      },
      [
         searchTerm,
         selectedTypes,
         selectedItemTypes,
         dateRange.start,
         dateRange.end,
         itemsPerPage,
         sortField,
         sortDirection,
      ]
   );

   // Initial fetch
   useEffect(() => {
      fetchTransactions(1);
   }, [fetchTransactions]);

   // Apply filters
   const applyFilters = () => {
      fetchTransactions(1);
      setShowFilters(false);
   };

   // Clear filters
   const clearFilters = () => {
      setSearchTerm('');
      setSelectedTypes([]);
      setSelectedItemTypes([]);
      setDateRange({
         start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
         end: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchTransactions(1);
   };

   // Handle sort
   const handleSort = (field: keyof Transaction) => {
      if (sortField === field) {
         setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
         setSortField(field);
         setSortDirection('desc');
      }
   };

   // Get type config
   const getTypeConfig = (type: TransactionType) => {
      const configs = {
         create: {
            label: 'Tạo mới',
            icon: FilePlus,
            color: 'bg-blue-100 text-blue-800',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
         },
         in: {
            label: 'Nhập kho',
            icon: PackagePlus,
            color: 'bg-emerald-100 text-emerald-800',
            borderColor: 'border-emerald-200',
            iconColor: 'text-emerald-600',
         },
         out: {
            label: 'Xuất kho',
            icon: PackageMinus,
            color: 'bg-amber-100 text-amber-800',
            borderColor: 'border-amber-200',
            iconColor: 'text-amber-600',
         },
      };
      return configs[type];
   };

   // Format date
   const formatDate = (dateString: string) => {
      try {
         const utcDate = dateString.endsWith('Z') ? dateString : dateString + 'Z';
         const date = new Date(utcDate);

         return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
      } catch (err) {
         return dateString;
      }
   };

   // Calculate total pages
   const totalPages = Math.ceil(total / itemsPerPage);

   // Type options
   const typeOptions: { value: TransactionType; label: string }[] = [
      { value: 'create', label: 'Tạo mới' },
      { value: 'in', label: 'Nhập kho' },
      { value: 'out', label: 'Xuất kho' },
   ];

   // Item type options
   const itemTypeOptions: { value: 1 | 2 | 3; label: string }[] = [
      { value: 1, label: 'Sản phẩm' },
      { value: 2, label: 'Vật tư' },
      { value: 3, label: 'Kho' },
   ];

   // Render sort indicator
   const renderSortIndicator = (field: keyof Transaction) => {
      if (sortField !== field) return null;
      return sortDirection === 'asc' ? (
         <FiArrowUp className="inline ml-1" />
      ) : (
         <FiArrowDown className="inline ml-1" />
      );
   };

   return (
      <div className="bg-gray-50">
         {/* Header */}
         <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
                     <p className="text-gray-600 mt-1">Theo dõi tất cả hoạt động trong hệ thống</p>
                  </div>
                  <div className="flex gap-2">
                     <Button
                        variant="secondary"
                        onClick={() => fetchTransactions(page)}
                        disabled={isLoading}
                        className="flex items-center"
                     >
                        <FiRefreshCw
                           className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                        />
                        Làm mới
                     </Button>
                     <Button variant="ghost" className="flex items-center">
                        <FiDownload className="w-4 h-4 mr-2" />
                        Xuất Excel
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                     <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                           type="search"
                           placeholder="Tìm kiếm theo Tên hoặc Mã..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                           className="
                              w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
                        />
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center"
                     >
                        <FiFilter className="w-4 h-4 mr-2" />
                        Lọc
                        {showFilters ? (
                           <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                           <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                     </Button>
                     <Button onClick={applyFilters} className="flex items-center">
                        Áp dụng
                     </Button>
                  </div>
               </div>

               {/* Advanced Filters */}
               {showFilters && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Transaction Types */}
                        <div>
                           <label className="block text-sm font-medium text-gray-900 mb-3">
                              Loại giao dịch
                           </label>
                           <div className="space-y-2">
                              {typeOptions.map((option) => (
                                 <label key={option.value} className="flex items-center">
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
                                    <span className="ml-2 text-sm text-gray-700">
                                       {option.label}
                                    </span>
                                 </label>
                              ))}
                           </div>
                        </div>

                        {/* Item Types */}
                        <div>
                           <label className="block text-sm font-medium text-gray-900 mb-3">
                              Loại vật phẩm
                           </label>
                           <div className="space-y-2">
                              {itemTypeOptions.map((option) => (
                                 <label key={option.value} className="flex items-center">
                                    <input
                                       type="checkbox"
                                       checked={selectedItemTypes.includes(option.value)}
                                       onChange={(e) => {
                                          if (e.target.checked) {
                                             setSelectedItemTypes([
                                                ...selectedItemTypes,
                                                option.value,
                                             ]);
                                          } else {
                                             setSelectedItemTypes(
                                                selectedItemTypes.filter((t) => t !== option.value)
                                             );
                                          }
                                       }}
                                       className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                       {option.label}
                                    </span>
                                 </label>
                              ))}
                           </div>
                        </div>

                        {/* Date Range */}
                        <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-gray-900 mb-3">
                              Khoảng thời gian
                           </label>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Từ ngày
                                 </label>
                                 <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) =>
                                       setDateRange({ ...dateRange, start: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                 />
                              </div>
                              <div>
                                 <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Đến ngày
                                 </label>
                                 <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) =>
                                       setDateRange({ ...dateRange, end: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                 />
                              </div>
                           </div>
                           <div className="mt-3 flex gap-2">
                              <Button size="sm" variant="ghost" onClick={clearFilters}>
                                 Xóa bộ lọc
                              </Button>
                              <Button size="sm" onClick={applyFilters}>
                                 Áp dụng
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
               {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                     <div className="flex flex-col items-center space-y-4">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                        <p className="text-gray-600">Đang tải nhật ký...</p>
                     </div>
                  </div>
               ) : error ? (
                  <div className="flex flex-col items-center justify-center h-64 p-8">
                     <p className="text-gray-900 font-medium mb-2">Đã xảy ra lỗi</p>
                     <p className="text-gray-600 text-center mb-4">{error}</p>
                     <Button onClick={() => fetchTransactions(page)}>Thử lại</Button>
                  </div>
               ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 p-8">
                     <div className="p-4 bg-gray-100 rounded-full mb-4">
                        <FiPackage className="w-8 h-8 text-gray-400" />
                     </div>
                     <p className="text-gray-900 font-medium mb-2">Không có giao dịch nào</p>
                     <p className="text-gray-600 text-center">
                        {searchTerm || selectedTypes.length > 0 || selectedItemTypes.length > 0
                           ? 'Không tìm thấy giao dịch phù hợp với bộ lọc'
                           : 'Chưa có giao dịch nào được ghi nhận'}
                     </p>
                  </div>
               ) : (
                  <>
                     <div className="overflow-x-auto">
                        <table className="w-full">
                           <thead className="bg-gray-50">
                              <tr>
                                 <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('created_at')}
                                 >
                                    <div className="flex items-center justify-center">
                                       <FiClock className="w-4 h-4 mr-2" />
                                       Thời gian
                                       {renderSortIndicator('created_at')}
                                    </div>
                                 </th>
                                 <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('type')}
                                 >
                                    Loại giao dịch
                                    {renderSortIndicator('type')}
                                 </th>
                                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vật phẩm
                                 </th>
                                 <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('quantity')}
                                 >
                                    Số lượng
                                    {renderSortIndicator('quantity')}
                                 </th>
                                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sau thay đổi
                                 </th>
                                 <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('user_name')}
                                 >
                                    <div className="flex items-center justify-center">
                                       Trạng thái
                                       {renderSortIndicator('quantity')}
                                    </div>
                                 </th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-200">
                              {transactions.map((transaction) => {
                                 const typeConfig = getTypeConfig(transaction.type);
                                 const quantityChange = ['in', 'out', 'create', 'delete'].includes(
                                    transaction.type
                                 )
                                    ? transaction.quantity
                                    : null;

                                 return (
                                    <tr key={transaction.history_id} className="hover:bg-gray-50">
                                       <td className="px-6 py-4">
                                          <div className="flex justify-center">
                                             <div className="text-sm text-gray-900 font-medium text-center">
                                                {formatDate(transaction.created_at)}
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex justify-center">
                                             <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-900">
                                                   {typeConfig.label}
                                                </span>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex justify-center">
                                             <div className="space-y-1 max-w-xs">
                                                <div className="flex flex-col items-center gap-2">
                                                   <span className="text-sm font-medium text-gray-900 text-center">
                                                      {transaction.item_name}
                                                   </span>
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-0.5 text-center">
                                                   {transaction.variant_name && (
                                                      <div>
                                                         Biến thể: {transaction.variant_name}
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex justify-center">
                                             <div className="space-y-1">
                                                {quantityChange && (
                                                   <div
                                                      className={`flex items-center justify-center text-sm font-bold ${
                                                         ['in', 'create'].includes(transaction.type)
                                                            ? 'text-emerald-600'
                                                            : 'text-amber-600'
                                                      }`}
                                                   >
                                                      {['in', 'create'].includes(transaction.type)
                                                         ? '+'
                                                         : '-'}
                                                      {quantityChange.toLocaleString()}
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex justify-center">
                                             <div className="text-sm text-gray-900 font-medium">
                                                {transaction.new_quantity.toLocaleString()}
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex justify-center">
                                             <div className="space-y-1">
                                                <div className="text-sm text-gray-900">
                                                   {transaction.type === 'create'
                                                      ? 'Đã thêm'
                                                      : 'Thành công'}
                                                </div>
                                             </div>
                                          </div>
                                       </td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>

                     {/* Pagination */}
                     {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                           <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-700">
                                 Trang <b>{page}</b> / {totalPages}
                              </div>

                              <div className="flex items-center gap-2">
                                 {/* Previous */}
                                 <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={page === 1 || isLoading}
                                    onClick={() => fetchTransactions(page - 1)}
                                 >
                                    Trước
                                 </Button>

                                 {/* First page */}
                                 <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => fetchTransactions(1)}
                                 >
                                    1
                                 </Button>

                                 {/* Current page */}
                                 <Button
                                    variant="primary"
                                    size="sm"
                                    disabled
                                    className="cursor-default"
                                 >
                                    {page}
                                 </Button>

                                 {/* Next */}
                                 <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={page === totalPages || isLoading}
                                    onClick={() => fetchTransactions(page + 1)}
                                 >
                                    Sau
                                 </Button>
                              </div>
                           </div>
                        </div>
                     )}
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export default Transactions;
