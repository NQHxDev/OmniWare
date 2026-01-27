import { Package, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp } from 'lucide-react';

const Dashboard = () => {
   const stats = [
      {
         name: 'Tổng số lượng Sản phẩm',
         value: '1,234',
         change: '+12.5%',
         icon: Package,
         trend: 'up',
      },
      {
         name: 'Tổng số lượng Vật tư',
         value: '5,678',
         change: '+3.2%',
         icon: Package,
         trend: 'up',
      },
      {
         name: 'Tổng số lượng Kho',
         value: '12.5M',
         change: '-2.1%',
         icon: DollarSign,
         trend: 'down',
      },
      {
         name: 'Tăng trưởng',
         value: '24.3%',
         change: '+8.7%',
         icon: TrendingUp,
         trend: 'up',
      },
   ];

   const recentActivities = [
      {
         id: 1,
         type: 'Nhập hàng',
         product: 'Quai dép đỏ size 37',
         quantity: 50,
         time: '10 phút trước',
      },
      { id: 2, type: 'Xuất hàng', product: 'Keo dán', quantity: 2, time: '1 giờ trước' },
      { id: 3, type: 'Nhập hàng', product: 'Giấy bọc', quantity: 100, time: '3 giờ trước' },
      {
         id: 4,
         type: 'Điều chỉnh',
         product: 'Quai dép xanh size 38',
         quantity: -5,
         time: '5 giờ trước',
      },
   ];

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
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                     </div>
                     <div
                        className={`p-3 rounded-lg ${stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}
                     >
                        <stat.icon
                           className={`h-6 w-6 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
                        />
                     </div>
                  </div>
                  <div className="mt-4 flex items-center">
                     {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                     ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                     )}
                     <span
                        className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
                     >
                        {stat.change}
                     </span>
                     <span className="ml-2 text-sm text-gray-500">so với tháng trước</span>
                  </div>
               </div>
            ))}
         </div>

         {/* Recent Activities & Low Stock */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow">
               <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h2>
               </div>
               <div className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                     <div key={activity.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="font-medium text-gray-900">{activity.type}</p>
                              <p className="text-sm text-gray-600">{activity.product}</p>
                           </div>
                           <div className="text-right">
                              <p
                                 className={`font-medium ${activity.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}
                              >
                                 {activity.quantity > 0
                                    ? `+${activity.quantity}`
                                    : activity.quantity}
                              </p>
                              <p className="text-sm text-gray-500">{activity.time}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-lg shadow">
               <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Cảnh báo tồn kho thấp</h2>
               </div>
               <div className="divide-y divide-gray-200">
                  <div className="px-6 py-4">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="font-medium text-gray-900">Keo dán</p>
                           <p className="text-sm text-gray-600">Còn 2 thùng</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                           Sắp hết
                        </span>
                     </div>
                  </div>
                  <div className="px-6 py-4">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="font-medium text-gray-900">Giấy bọc</p>
                           <p className="text-sm text-gray-600">Còn 3 bao</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                           Cảnh báo
                        </span>
                     </div>
                  </div>
                  <div className="px-6 py-4">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="font-medium text-gray-900">Quai dép đỏ size 37</p>
                           <p className="text-sm text-gray-600">Còn 15 đôi</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                           Cảnh báo
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Dashboard;
