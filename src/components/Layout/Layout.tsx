import { PropsWithChildren } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
   return (
      <div className="min-h-screen bg-gray-50 flex">
         {/* Sidebar cố định */}
         <aside className="w-64 fixed inset-y-0 left-0 bg-white border-r">
            <Sidebar />
         </aside>

         {/* Nội dung chính */}
         <div className="flex-1 ml-64">
            <Header />

            <main className="py-8">
               <div className="px-8">{children}</div>
            </main>
         </div>
      </div>
   );
};

export default Layout;
