import { useState } from 'react';
import { Menu, Search } from 'lucide-react';

type HeaderProps = {
   isCollapsed: boolean;
   onToggleSidebar: () => void;
};

const Header: React.FC<HeaderProps> = ({ isCollapsed, onToggleSidebar }) => {
   const [searchQuery, setSearchQuery] = useState('');

   return (
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
         <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {isCollapsed && (
               <>
                  <button
                     onClick={onToggleSidebar}
                     className={`p-2 rounded-lg hover:bg-gray-100 transition-all duration-500 ease-in-out ${
                        isCollapsed ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                     }`}
                  >
                     <Menu className="h-5 w-5 text-gray-700" />
                  </button>
               </>
            )}

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-auto">
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                     type="search"
                     className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white
                text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900
                focus:border-transparent transition-all duration-200"
                     placeholder="Tìm kiếm vật phẩm, mã SKU..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
         </div>
      </header>
   );
};

export default Header;
