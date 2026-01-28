import { useLocation, Link } from 'react-router-dom';
import {
   LayoutDashboard,
   Package,
   Warehouse,
   FileText,
   Settings,
   ChevronLeft,
   Archive,
} from 'lucide-react';

type NavigationItem = {
   name: string;
   href: string;
   icon: React.ElementType;
};

type SidebarProps = {
   isCollapsed: boolean;
   onToggle: () => void;
};

const navigation: NavigationItem[] = [
   { name: 'Tổng quan', icon: LayoutDashboard, href: '/' },
   { name: 'Sản phẩm', icon: Package, href: '/products' },
   { name: 'Vật tư', icon: Archive, href: '/materials' },
   { name: 'Kho', icon: Warehouse, href: '/inventory' },
   { name: 'Lịch sử', icon: FileText, href: '/transactions' },
   { name: 'Cài đặt', icon: Settings, href: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
   const { pathname } = useLocation();

   return (
      <div className="h-full flex flex-col">
         {/* Logo */}
         <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <div
               className={`flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center w-full' : ''}`}
            >
               <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
                  <Warehouse className="h-5 w-5 text-white" />
               </div>

               <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}
               >
                  <span className="text-lg font-extrabold text-gray-900 whitespace-nowrap">
                     Tech
                     <span className="font-semibold text-gray-500">Warehouse</span>
                  </span>
               </div>
            </div>

            {/* Nút đóng/mở */}
            <button
               onClick={onToggle}
               className={`p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-500 ease-in-out ${isCollapsed ? 'absolute top-4 right-3' : 'ml-auto'}`}
            >
               {!isCollapsed && <ChevronLeft className="h-4 w-4 text-gray-500" />}
            </button>
         </div>

         {/* Menu */}
         <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
               const Icon = item.icon;
               const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

               return (
                  <Link
                     key={item.name}
                     to={item.href}
                     className={`flex items-center rounded-lg text-sm font-medium transition-all duration-50 ease-in-out
                        ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
                        ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'}
                     `}
                  >
                     <Icon className="h-5 w-5 shrink-0" />

                     {/* Text với hiệu ứng mượt mà */}
                     <span
                        className={`transition-all duration-300 ease-in-out whitespace-nowrap
                           ${isCollapsed ? 'w-0 opacity-0 ml-0 overflow-hidden' : 'w-auto opacity-100 ml-0'}
                        `}
                     >
                        {item.name}
                     </span>
                  </Link>
               );
            })}
         </nav>

         <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}
         >
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
               v1.0.0 @Nguyen Quang Hung
            </span>
         </div>
      </div>
   );
};

export default Sidebar;
