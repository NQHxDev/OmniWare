import { useLocation } from 'react-router-dom';

import { LayoutDashboard, Package, Warehouse, FileText, Settings, Users } from 'lucide-react';

type NavigationItem = {
   name: string;
   href: string;
   icon: React.ElementType;
};

const navigation: NavigationItem[] = [
   { name: 'Tổng quan', icon: LayoutDashboard, href: '/' },
   { name: 'Sản phẩm', icon: Package, href: '/products' },
   { name: 'Kho hàng', icon: Warehouse, href: '/inventory' },
   { name: 'Nhập/Xuất', icon: FileText, href: '/transactions' },
   { name: 'Khách hàng', icon: Users, href: '/customers' },
   { name: 'Báo cáo', icon: FileText, href: '/reports' },
   { name: 'Cài đặt', icon: Settings, href: '/settings' },
];

const Sidebar: React.FC = () => {
   const { pathname } = useLocation();

   return (
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
         <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
               <div className="flex items-center">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                     <Warehouse className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3 flex items-center">
                     <span className="text-xl font-extrabold tracking-tight text-gray-900">
                        Zeion<span className="font-semibold text-gray-500">Developer</span>
                     </span>
                  </div>
               </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
               {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                     <a
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                           ${
                              isActive
                                 ? 'bg-gray-900 text-white'
                                 : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                           }
                        `}
                     >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                     </a>
                  );
               })}
            </nav>
         </div>
      </aside>
   );
};

export default Sidebar;
