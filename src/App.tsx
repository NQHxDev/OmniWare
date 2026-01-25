import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Layout from './components/Layout/Layout';

function App() {
   return (
      <Router>
         <Layout>
            <Routes>
               <Route path="/" element={<Dashboard />} />
               <Route path="/products" element={<Products />} />
               {/* <Route path="/inventory" element={<Inventory />} /> */}
               <Route
                  path="/transactions"
                  element={
                     <div className="p-8">Nhập/Xuất kho (Tính năng chưa được phát triển)</div>
                  }
               />
               <Route
                  path="/customers"
                  element={<div className="p-8">Khách hàng (Coming soon)</div>}
               />
               <Route path="/reports" element={<div className="p-8">Reports (Coming soon)</div>} />
               {/* <Route path="/settings" element={<Settings />} /> */}
            </Routes>
         </Layout>
      </Router>
   );
}

export default App;
