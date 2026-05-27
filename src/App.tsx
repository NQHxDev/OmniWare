import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Layout from './components/Layout/Layout';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Materials from '@/pages/Materials';
import Transactions from '@/pages/Transactions';
import { useSettingsStore } from './stores/settingsStore';

function App() {
   const { settings, isLoaded, loadSettings } = useSettingsStore();

   // Load cài đặt khi khởi động ứng dụng
   useEffect(() => {
      if (!isLoaded) {
         loadSettings();
      }
   }, [isLoaded, loadSettings]);

   // Áp dụng giao diện sáng tối vào thẻ <html>
   useEffect(() => {
      if (isLoaded) {
         if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
         } else {
            document.documentElement.classList.remove('dark');
         }
      }
   }, [settings.theme, isLoaded]);

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
