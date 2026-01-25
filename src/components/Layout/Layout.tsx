import { PropsWithChildren, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
   const [isCollapsed, setIsCollapsed] = useState(false);

   return (
      <div className="min-h-screen bg-gray-50 flex">
         {/* Sidebar */}
         <aside
            className={`fixed inset-y-0 left-0 bg-white border-r transition-all duration-300
            ${isCollapsed ? 'w-16' : 'w-64'}`}
         >
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />
         </aside>

         {/* Content */}
         <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
            <Header isCollapsed={isCollapsed} onToggleSidebar={() => setIsCollapsed(false)} />

            <main className="py-8">
               <div className="px-8">{children}</div>
            </main>
         </div>
      </div>
   );
};

export default Layout;
