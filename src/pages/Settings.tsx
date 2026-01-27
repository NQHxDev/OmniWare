import React, { useEffect, useState } from 'react';
import { AppSettings, useSettingsStore } from '../stores/settingsStore';
import {
   FiSettings,
   FiSave,
   FiRotateCcw,
   FiX,
   FiSun,
   FiMoon,
   FiFile,
   FiInfo,
   FiChevronRight,
} from 'react-icons/fi';
import { HiOutlineAdjustments, HiOutlineViewGrid } from 'react-icons/hi';
import Confirm from '../components/Common/Confirm';

const Settings: React.FC = () => {
   const { settings, isLoaded, updateSettings, resetToDefault, loadSettings } = useSettingsStore();
   const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
   const [isSaving, setIsSaving] = useState(false);

   const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
   const [showConfirm, setShowConfirm] = useState(false);
   const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});

   useEffect(() => {
      if (!isLoaded) {
         loadSettings();
      }
   }, [isLoaded, loadSettings]);

   useEffect(() => {
      if (isLoaded) {
         setTempSettings(settings);
      }
   }, [settings, isLoaded]);

   const handleInputChange = (key: keyof AppSettings, value: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTempSettings((prev: any) => ({
         ...prev,
         [key]: value,
      }));
   };

   const handleSave = async () => {
      setIsSaving(true);
      try {
         await updateSettings(tempSettings);
         setMessage({ text: 'Cài đặt đã được lưu thành công', type: 'success' });
         setTimeout(() => setMessage(null), 3000);
      } catch (error) {
         setMessage({
            text: 'Đã xảy ra lỗi khi lưu cài đặt',
            type: 'error',
         });
      } finally {
         setIsSaving(false);
      }
   };

   const showResetConfirm = () => {
      setConfirmAction(() => async () => {
         await resetToDefault();
         setMessage({
            text: 'Đã khôi phục cài đặt mặc định',
            type: 'success',
         });
         setTimeout(() => setMessage(null), 3000);
      });
      setShowConfirm(true);
   };

   const handleConfirm = async () => {
      setShowConfirm(false);
      await confirmAction();
   };

   // Hàm hủy
   const handleCancel = () => {
      setShowConfirm(false);
   };

   if (!isLoaded) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
               <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
               <p className="text-gray-600">Đang tải cài đặt...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                     <FiSettings className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                     <p className="text-gray-600">Tùy chỉnh cấu hình ứng dụng</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Message Alert */}
            {message && (
               <div
                  className={`mb-6 rounded-lg border ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} p-4`}
               >
                  <div className="flex items-center">
                     <div
                        className={`shrink-0 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
                     >
                        {message.type === 'success' ? (
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                 clipRule="evenodd"
                              />
                           </svg>
                        ) : (
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                 clipRule="evenodd"
                              />
                           </svg>
                        )}
                     </div>
                     <div className="ml-3">
                        <p
                           className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}
                        >
                           {message.text}
                        </p>
                     </div>
                  </div>
               </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Column - Main Settings */}
               <div className="lg:col-span-2 space-y-8">
                  {/* Display Section */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                     <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center space-x-3">
                           <HiOutlineViewGrid className="w-5 h-5 text-gray-600" />
                           <h2 className="text-lg font-semibold text-gray-900">Hiển thị</h2>
                        </div>
                     </div>

                     <div className="p-6 space-y-8">
                        {/* Items per page */}
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-900 mb-1">
                                 Số lượng item mỗi trang
                              </label>
                              <p className="text-sm text-gray-600 mb-4">
                                 Điều chỉnh số lượng item hiển thị phù hợp với màn hình
                              </p>

                              {/* Quick select buttons */}
                              <div className="flex flex-wrap gap-2 mb-6">
                                 {[4, 8, 12, 16, 24, 32].map((num) => (
                                    <button
                                       key={num}
                                       onClick={() => handleInputChange('limit', num)}
                                       className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                          tempSettings.limit === num
                                             ? 'bg-gray-900 text-white'
                                             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                       }`}
                                    >
                                       {num}
                                    </button>
                                 ))}
                              </div>

                              {/* Slider */}
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">4</span>
                                    <span className="text-sm font-medium text-gray-900">
                                       {tempSettings.limit} items
                                    </span>
                                    <span className="text-sm text-gray-600">50</span>
                                 </div>
                                 <input
                                    type="range"
                                    min="4"
                                    max="50"
                                    value={tempSettings.limit}
                                    onChange={(e) =>
                                       handleInputChange('limit', parseInt(e.target.value))
                                    }
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Theme selection */}
                        <div className="space-y-4">
                           <label className="block text-sm font-medium text-gray-900 mb-1">
                              Chế độ giao diện
                           </label>
                           <p className="text-sm text-gray-600 mb-4">
                              Lựa chọn giao diện phù hợp với môi trường sử dụng
                           </p>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <button
                                 onClick={() => handleInputChange('theme', 'light')}
                                 className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-4 ${
                                    tempSettings.theme === 'light'
                                       ? 'border-gray-900 bg-gray-50'
                                       : 'border-gray-200 hover:border-gray-300'
                                 }`}
                              >
                                 <div
                                    className={`p-3 rounded-lg ${tempSettings.theme === 'light' ? 'bg-gray-900' : 'bg-gray-100'}`}
                                 >
                                    <FiSun
                                       className={`w-5 h-5 ${tempSettings.theme === 'light' ? 'text-white' : 'text-gray-600'}`}
                                    />
                                 </div>
                                 <div className="text-left">
                                    <div className="font-medium text-gray-900">Sáng</div>
                                    <div className="text-sm text-gray-600">
                                       Giao diện sáng tiêu chuẩn
                                    </div>
                                 </div>
                                 {tempSettings.theme === 'light' && (
                                    <FiChevronRight className="w-5 h-5 text-gray-900 ml-auto" />
                                 )}
                              </button>

                              <button
                                 onClick={() => handleInputChange('theme', 'dark')}
                                 className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-4 ${
                                    tempSettings.theme === 'dark'
                                       ? 'border-gray-900 bg-gray-900 text-white'
                                       : 'border-gray-200 hover:border-gray-300'
                                 }`}
                              >
                                 <div
                                    className={`p-3 rounded-lg ${tempSettings.theme === 'dark' ? 'bg-white' : 'bg-gray-100'}`}
                                 >
                                    <FiMoon
                                       className={`w-5 h-5 ${tempSettings.theme === 'dark' ? 'text-gray-900' : 'text-gray-600'}`}
                                    />
                                 </div>
                                 <div className="text-left">
                                    <div
                                       className={`font-medium ${tempSettings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                    >
                                       Tối
                                    </div>
                                    <div
                                       className={`text-sm ${tempSettings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                                    >
                                       Giao diện tối chuyên nghiệp
                                    </div>
                                 </div>
                                 {tempSettings.theme === 'dark' && (
                                    <FiChevronRight className="w-5 h-5 text-white ml-auto" />
                                 )}
                              </button>
                           </div>
                        </div>

                        {/* Log retention period */}
                        <div className="space-y-4">
                           <label className="block text-sm font-medium text-gray-900 mb-1">
                              Thời gian lưu Nhật ký
                           </label>
                           <p className="text-sm text-gray-600 mb-4">
                              Hệ thống sẽ tự động dọn dẹp nhật ký cũ sau khoảng thời gian này để tối
                              ưu dung lượng
                           </p>

                           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                              {[1, 3, 6, 12, 24].map((month) => (
                                 <button
                                    key={month}
                                    onClick={() => handleInputChange('logRetention', month)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                       tempSettings.logRetention === month
                                          ? 'border-gray-900 bg-gray-50'
                                          : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                 >
                                    <span
                                       className={`text-lg font-bold ${
                                          tempSettings.logRetention === month
                                             ? 'text-gray-900'
                                             : 'text-gray-500'
                                       }`}
                                    >
                                       {month}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                       Tháng
                                    </span>

                                    {/* Hiển thị dấu tích khi được chọn */}
                                    {tempSettings.logRetention === month && (
                                       <div className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-900" />
                                    )}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Behavior Section */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                     <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center space-x-3">
                           <HiOutlineAdjustments className="w-5 h-5 text-gray-600" />
                           <h2 className="text-lg font-semibold text-gray-900">Hành vi ứng dụng</h2>
                        </div>
                     </div>

                     <div className="p-6 space-y-8">
                        {/* Auto refresh */}
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Tự động làm mới dữ liệu
                                 </label>
                                 <p className="text-sm text-gray-600">
                                    Tự động cập nhật dữ liệu theo khoảng thời gian
                                 </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                 <input
                                    type="checkbox"
                                    checked={tempSettings.autoRefresh}
                                    onChange={(e) =>
                                       handleInputChange('autoRefresh', e.target.checked)
                                    }
                                    className="sr-only peer"
                                 />
                                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                              </label>
                           </div>

                           {tempSettings.autoRefresh && (
                              <div className="pl-2 border-l-2 border-gray-200 ml-2">
                                 <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Khoảng thời gian làm mới
                                 </label>
                                 <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                       <span className="text-sm text-gray-600">5 giây</span>
                                       <span className="text-sm font-medium text-gray-900">
                                          {tempSettings.refreshInterval} giây
                                       </span>
                                       <span className="text-sm text-gray-600">120 giây</span>
                                    </div>
                                    <input
                                       type="range"
                                       min="5"
                                       max="120"
                                       step="5"
                                       value={tempSettings.refreshInterval}
                                       onChange={(e) =>
                                          handleInputChange(
                                             'refreshInterval',
                                             parseInt(e.target.value)
                                          )
                                       }
                                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                                    />
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Language */}
                        <div className="space-y-4">
                           <label className="block text-sm font-medium text-gray-900 mb-1">
                              Ngôn ngữ hiển thị
                           </label>
                           <p className="text-sm text-gray-600 mb-4">
                              Lựa chọn ngôn ngữ cho giao diện ứng dụng
                           </p>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <button
                                 onClick={() => handleInputChange('language', 'vi')}
                                 className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-4 ${
                                    tempSettings.language === 'vi'
                                       ? 'border-gray-900 bg-gray-50'
                                       : 'border-gray-200 hover:border-gray-300'
                                 }`}
                              >
                                 <div
                                    className={`p-3 rounded-lg ${tempSettings.language === 'vi' ? 'bg-gray-900' : 'bg-gray-100'}`}
                                 >
                                    <span
                                       className={`text-lg font-medium ${tempSettings.language === 'vi' ? 'text-white' : 'text-gray-600'}`}
                                    >
                                       VN
                                    </span>
                                 </div>
                                 <div className="text-left">
                                    <div className="font-medium text-gray-900">Tiếng Việt</div>
                                    <div className="text-sm text-gray-600">Ngôn ngữ mặc định</div>
                                 </div>
                                 {tempSettings.language === 'vi' && (
                                    <FiChevronRight className="w-5 h-5 text-gray-900 ml-auto" />
                                 )}
                              </button>

                              <button
                                 onClick={() => handleInputChange('language', 'en')}
                                 className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-4 ${
                                    tempSettings.language === 'en'
                                       ? 'border-gray-900 bg-gray-50'
                                       : 'border-gray-200 hover:border-gray-300'
                                 }`}
                              >
                                 <div
                                    className={`p-3 rounded-lg ${tempSettings.language === 'en' ? 'bg-gray-900' : 'bg-gray-100'}`}
                                 >
                                    <span
                                       className={`text-lg font-medium ${tempSettings.language === 'en' ? 'text-white' : 'text-gray-600'}`}
                                    >
                                       EN
                                    </span>
                                 </div>
                                 <div className="text-left">
                                    <div className="font-medium text-gray-900">English</div>
                                    <div className="text-sm text-gray-600">International</div>
                                 </div>
                                 {tempSettings.language === 'en' && (
                                    <FiChevronRight className="w-5 h-5 text-gray-900 ml-auto" />
                                 )}
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Column - Actions & Info */}
               <div className="space-y-8">
                  {/* Actions Card */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                     <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Thao tác</h3>
                     </div>

                     <div className="p-6 space-y-4">
                        <button
                           onClick={handleSave}
                           disabled={isSaving}
                           className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {isSaving ? (
                              <>
                                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                 <span>Đang lưu...</span>
                              </>
                           ) : (
                              <>
                                 <FiSave className="w-5 h-5" />
                                 <span>Lưu thay đổi</span>
                              </>
                           )}
                        </button>

                        <button
                           onClick={() => setTempSettings(settings)}
                           disabled={isSaving}
                           className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <FiX className="w-5 h-5" />
                           <span>Hủy bỏ</span>
                        </button>

                        <button
                           onClick={showResetConfirm}
                           disabled={isSaving}
                           className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <FiRotateCcw className="w-5 h-5" />
                           <span>Khôi phục mặc định</span>
                        </button>

                        <Confirm
                           isOpen={showConfirm}
                           title="Khôi phục cài đặt"
                           message="Bạn có chắc chắn muốn khôi phục cài đặt mặc định? Hành động này không thể hoàn tác."
                           onConfirm={handleConfirm}
                           onCancel={handleCancel}
                        />
                     </div>
                  </div>

                  {/* Info Card */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                     <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center space-x-3">
                           <FiInfo className="w-5 h-5 text-gray-600" />
                           <h3 className="text-lg font-semibold text-gray-900">Thông tin</h3>
                        </div>
                     </div>

                     <div className="p-6 space-y-4">
                        <div className="space-y-2">
                           <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FiFile className="w-4 h-4" />
                              <span>Đường dẫn file cấu hình:</span>
                           </div>
                           <code className="block text-xs bg-gray-50 text-gray-700 p-2 rounded border border-gray-200">
                              resource/settings.json
                           </code>
                        </div>

                        <div className="space-y-2">
                           <div className="text-sm font-medium text-gray-900">Cài đặt hiện tại</div>
                           <div className="bg-gray-50 p-3 rounded border border-gray-200">
                              <pre className="text-xs text-gray-600 overflow-x-auto">
                                 {JSON.stringify(settings, null, 2)}
                              </pre>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Settings;
