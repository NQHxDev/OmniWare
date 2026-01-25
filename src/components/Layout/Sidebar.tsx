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
   { name: 'Nhật ký', icon: FileText, href: '/transactions' },
   { name: 'Cài đặt', icon: Settings, href: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
   const { pathname } = useLocation();

   return (
      <div className="h-full flex flex-col">
         {/* Logo */}
         <div className="flex items-center h-16 px-4 border-b border-gray-200 justify-between">
            <div className="flex items-center overflow-hidden">
               <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
                  <Warehouse className="h-5 w-5 text-white" />
               </div>

               {!isCollapsed && (
                  <span className="ml-3 text-lg font-extrabold text-gray-900 whitespace-nowrap">
                     Zeion
                     <span className="font-semibold text-gray-500">Developer</span>
                  </span>
               )}
            </div>

            {/* Nút đóng */}
            {!isCollapsed && (
               <button onClick={onToggle} className="p-1 rounded hover:bg-gray-100">
                  <ChevronLeft className="h-5 w-5 text-gray-500" />
               </button>
            )}
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
                     className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition
                        ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
                     `}
                  >
                     <Icon className="h-5 w-5 shrink-0" />
                     {!isCollapsed && <span>{item.name}</span>}
                  </Link>
               );
            })}
         </nav>
      </div>
   );
};

export default Sidebar;
