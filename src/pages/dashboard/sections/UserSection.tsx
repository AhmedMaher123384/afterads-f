import React, { useState } from 'react';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';

type UserSectionProps = {
  currentUser: any;
  onLogout: () => void;
  icons: { LogOut: React.ComponentType<any> };
  isOpen?: boolean;
};

const UserSection: React.FC<UserSectionProps> = ({ currentUser, onLogout, icons, isOpen = true }) => {
  const { LogOut } = icons;
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  
  return (
    <>
      {/* عندما تكون القائمة مقفولة - فقط الأيقونة */}
      {!isOpen ? (
        <button
          onClick={() => setLogoutOpen(true)}
          className="w-full flex items-center justify-center py-3"
          title="تسجيل الخروج"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-blue-600 transition-colors">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </button>
      ) : (
        /* عندما تكون القائمة مفتوحة - كل التفاصيل */
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold ml-2">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white">{currentUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{currentUser?.role || 'User'}</p>
            </div>
          </div>
          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-3 h-3 ml-2" />
            تسجيل الخروج
          </button>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={isLogoutOpen}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        onConfirm={() => {
          setLogoutOpen(false);
          onLogout();
        }}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
};

export default UserSection;