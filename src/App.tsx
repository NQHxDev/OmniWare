import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Layout from './components/Layout/Layout';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Materials from '@/pages/Materials';
import Transactions from '@/pages/Transactions';

function App() {
   return (
      <Router>
         <Layout>
            <Routes>
               <Route path="/" element={<Dashboard />} />
               <Route path="/products" element={<Products />} />
               <Route path="/materials" element={<Materials />} />
               <Route path="/inventory" element={<Inventory />} />
               <Route path="/transactions" element={<Transactions />} />
               <Route path="/settings" element={<Settings />} />
            </Routes>
         </Layout>
      </Router>
   );
}

export default App;
