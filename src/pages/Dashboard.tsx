import { Archive, CheckCircle, Package, RefreshCw, Warehouse } from 'lucide-react';
import { useEffect, useState } from 'react';

const Dashboard = () => {
   const [counts, setCounts] = useState({
      products: 0,
      materials: 0,
      inventory: 0,
      transactions: 0,
   });

   useEffect(() => {
      const fetchData = async () => {
         const [pCount, mCount, iCount, tCount] = await Promise.all([
            window.api.countItem(1),
            window.api.countItem(2),
            window.api.countItem(3),
            window.api.getTodayNetFlow(),
         ]);

         setCounts({
            products: pCount.total,
            materials: mCount.total,
            inventory: iCount.total,
            transactions: tCount,
         });
      };
      fetchData();
   }, []);

   const stats = [
      {
         statsId: 1,
         name: 'Số lượng Sản phẩm',
         value: counts.products,
         icon: Package,
      },
      {
         statsId: 2,
         name: 'Số lượng Vật tư',
         value: counts.materials,
         icon: Archive,
      },
      {
         statsId: 3,
         name: 'Vật phẩm trong Kho',
         value: counts.inventory,
         icon: Warehouse,
      },
      {
         statsId: 4,
         name: 'Nhập xuất hôm nay',
         value: counts.transactions,
         icon: RefreshCw,
      },
   ];

   const [warningMaterials, setWarningMaterials] = useState([]);
   const [warningInventory, setWarningInventory] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchLowStock = async () => {
         try {
            setLoading(true);
            const dataWarningMaterials = await window.api.getItemLowStock(2);
            const warningInventory = await window.api.getItemLowStock(3);

            setWarningMaterials(dataWarningMaterials);
            setWarningInventory(warningInventory);
         } catch (error) {
            console.error('Lỗi lấy dữ liệu cảnh báo:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchLowStock();
   }, []);

   if (loading) return <div>Đang tải dữ liệu...</div>;

   return (
      <div>
         <div className="flex items-center justify-between mb-8">
            <div>
               <h1 className="text-2xl font-semibold text-gray-900">Tổng quan kho hàng</h1>
               <p className="mt-2 text-gray-600">Thống kê và quản lý hàng tồn kho</p>
            </div>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
               <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>

                        {stat.statsId !== 4 ? (
                           <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
                        ) : (
                           <p
                              className={`mt-2 text-2xl font-semibold text-gray-900 ${stat.value >= 0 ? 'text-green-600' : 'text-red-600'}`}
                           >
                              {stat.value > 0 ? `+${stat.value}` : stat.value}
                           </p>
                        )}
                     </div>
                     <div className="p-3 rounded-lg bg-green-100">
                        <stat.icon className="h-6 w-6 text-green-600" />
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Low Material & Low Stock */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Low Material */}
            <div className="bg-white rounded-lg shadow">
               <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Cảnh báo Vật tư thấp</h2>
               </div>
               <div className="divide-y divide-gray-200">
                  {warningMaterials.length > 0 ? (
                     warningMaterials.map((material) => (
                        <div
                           key={material.item_id}
                           className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex-1">
                                 <p className="font-semibold text-gray-900">{material.item_name}</p>
                                 <p className="text-xs font-medium text-gray-400 uppercase tracking-tight mt-0.5">
                                    {material.item_code}
                                 </p>
                              </div>

                              <div className="flex-1 text-center">
                                 <p className="text-sm font-medium text-gray-600">
                                    Còn{' '}
                                    <span className="text-gray-900 font-bold">
                                       {material.quantity}
                                    </span>{' '}
                                    {material.unit_name}
                                 </p>
                              </div>

                              <div className="flex-1 text-right">
                                 <span
                                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                                       material.quantity === 0
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-orange-100 text-orange-700'
                                    }`}
                                 >
                                    {material.quantity === 0 ? 'Hết hàng' : 'Sắp hết'}
                                 </span>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="bg-green-50 p-3 rounded-full mb-3">
                           <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">
                           Không có cảnh báo nào
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                           Không có sản phẩm nào đạt ngưỡng cảnh báo
                        </p>
                     </div>
                  )}
               </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-lg shadow">
               <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                     Cảnh báo Vật phẩm trong Kho thấp
                  </h2>
               </div>
               <div className="divide-y divide-gray-200">
                  {warningInventory.length > 0 ? (
                     warningInventory.map((inventory) => (
                        <div
                           key={inventory.item_id}
                           className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex-1">
                                 <p className="font-semibold text-gray-900">
                                    {inventory.item_name}
                                 </p>
                                 <p className="text-xs font-medium text-gray-400 uppercase tracking-tight mt-0.5">
                                    {inventory.item_code}
                                 </p>
                              </div>

                              <div className="flex-1 text-center">
                                 <p className="text-sm font-medium text-gray-600">
                                    Còn{' '}
                                    <span className="text-gray-900 font-bold">
                                       {inventory.quantity}
                                    </span>{' '}
                                    {inventory.unit_name}
                                 </p>
                              </div>

                              <div className="flex-1 text-right">
                                 <span
                                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                                       inventory.quantity === 0
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-orange-100 text-orange-700'
                                    }`}
                                 >
                                    {inventory.quantity === 0 ? 'Hết hàng' : 'Sắp hết'}
                                 </span>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="bg-green-50 p-3 rounded-full mb-3">
                           <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">
                           Không có cảnh báo nào
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                           Không có sản phẩm nào đạt ngưỡng cảnh báo
                        </p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default Dashboard;
