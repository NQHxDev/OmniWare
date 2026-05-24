import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useSearchStore } from '@/stores/search.store';

type HeaderProps = {
   isCollapsed: boolean;
   onToggleSidebar: () => void;
};

const Header: React.FC<HeaderProps> = ({ isCollapsed, onToggleSidebar }) => {
   const location = useLocation();
   const { query, setQuery, clearQuery } = useSearchStore();

   // Clear search query when changing pages
   useEffect(() => {
      clearQuery();
   }, [location.pathname, clearQuery]);

   const getPlaceholder = () => {
      switch (location.pathname) {
         case '/':
            return 'Tìm kiếm thông tin...';
         case '/products':
            return 'Tìm kiếm sản phẩm theo tên hoặc mã...';
         case '/materials':
            return 'Tìm kiếm vật tư theo tên hoặc mã...';
         case '/inventory':
            return 'Tìm kiếm trong kho...';
         case '/transactions':
            return 'Tìm kiếm giao dịch (mã, người thực hiện)...';
         case '/settings':
            return 'Tìm kiếm cài đặt...';
         default:
            return 'Tìm kiếm...';
      }
   };

   return (
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
         <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
               onClick={onToggleSidebar}
               className={`p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 ease-in-out ${
                  isCollapsed
                     ? 'w-9 h-9 opacity-100 mr-4'
                     : 'w-0 h-9 opacity-0 mr-0 overflow-hidden pointer-events-none'
               }`}
            >
               <Menu className="h-5 w-5 text-gray-700 shrink-0" />
            </button>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-auto">
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                     type="text"
                     className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white
                text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900
                focus:border-transparent transition-all duration-200"
                     placeholder={getPlaceholder()}
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                     <button
                        onClick={clearQuery}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Xóa tìm kiếm"
                     >
                        <X className="h-4 w-4" />
                     </button>
                  )}
               </div>
            </div>
         </div>
      </header>
   );
};

export default Header;
