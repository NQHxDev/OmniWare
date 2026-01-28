import { PropsWithChildren, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
   const [isCollapsed, setIsCollapsed] = useState(false);

   return (
      <div className="min-h-screen bg-gray-50 flex">
         {/* Sidebar */}
         <aside
            className={`fixed inset-y-0 left-0 bg-white border-r transition-all duration-200 ease-in-out
            ${isCollapsed ? 'w-16' : 'w-64'}`}
         >
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />
         </aside>

         {/* Overlay cho mobile */}
         {!isCollapsed && (
            <div
               className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
               onClick={() => setIsCollapsed(true)}
            />
         )}

         {/* Content */}
         <div
            className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-16' : 'ml-64'}`}
         >
            <Header isCollapsed={isCollapsed} onToggleSidebar={() => setIsCollapsed(false)} />

            <main className="py-8">
               <div className="px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
         </div>
      </div>
   );
};

export default Layout;
