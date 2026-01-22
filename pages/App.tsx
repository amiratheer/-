import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import Login from '../pages/Login';
import ManagerDashboard from '../pages/ManagerDashboard';
import ChefDashboard from '../pages/ChefDashboard';
import DriverDashboard from '../pages/DriverDashboard';
import CustomerApp from '../pages/CustomerApp';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth on load
  useEffect(() => {
    const token = localStorage.getItem('aklaty_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Session expired or invalid");
      localStorage.removeItem('aklaty_token');
      localStorage.removeItem('aklaty_user_role');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string) => {
    // Reload to fetch user data and set state
    fetchUserProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem('aklaty_token');
    localStorage.removeItem('aklaty_user_role');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Pass the function that handles successful token receipt
    return <Login onLogin={handleLoginSuccess} />;
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case UserRole.RESTAURANT_MANAGER:
        return <ManagerDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.CHEF:
        return <ChefDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.DRIVER:
        return <DriverDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.CUSTOMER:
        return <CustomerApp user={currentUser} onLogout={handleLogout} />;
      case UserRole.ADMIN:
        return (
          <div className="flex items-center justify-center h-screen bg-gray-100 flex-col">
            <h1 className="text-2xl font-bold mb-4">لوحة الأدمن</h1>
            <p className="text-gray-500 mb-6">يرجى استخدام لوحة التحكم المكتبية الخاصة بالإدارة</p>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">خروج</button>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-screen bg-gray-100 flex-col">
             <p>نوع الحساب غير معروف</p>
             <button onClick={handleLogout} className="text-red-600 mt-2 underline">تسجيل الخروج</button>
          </div>
        );
    }
  };

  return (
    <>
      {renderDashboard()}
    </>
  );
};

export default App;