import React, { useState } from 'react';
import { User, UserRole } from './types';
import { MOCK_USERS } from './services/mockData';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import ChefDashboard from './pages/ChefDashboard';
import DriverDashboard from './pages/DriverDashboard';
import CustomerApp from './pages/CustomerApp';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
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
            <p className="text-gray-500 mb-6">قيد التطوير...</p>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">خروج</button>
          </div>
        );
      default:
        return <div>Role not supported</div>;
    }
  };

  return (
    <>
      {renderDashboard()}
    </>
  );
};

export default App;