import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { LogOut, Home, ChefHat, Truck, Users, LayoutDashboard, ShoppingBag, Menu, Map, Clock, ShoppingCart, ClipboardList } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  title: string;
  activeView?: string;
  onNavigate?: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, title, activeView, onNavigate }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNavItems = () => {
    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { key: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'لوحة القيادة' },
          { key: 'users', icon: <Users size={20} />, label: 'المستخدمين' },
        ];
      case UserRole.RESTAURANT_MANAGER:
        return [
          { key: 'orders', icon: <ClipboardList size={20} />, label: 'الطلبات' },
          { key: 'menu', icon: <Menu size={20} />, label: 'المنيو' },
          { key: 'staff', icon: <Users size={20} />, label: 'الموظفين' },
        ];
      case UserRole.CHEF:
        return [
          { key: 'kitchen', icon: <ChefHat size={20} />, label: 'المطبخ' },
          { key: 'history', icon: <Clock size={20} />, label: 'الأرشيف' },
        ];
      case UserRole.DRIVER:
        return [
          { key: 'available', icon: <Truck size={20} />, label: 'المتاح' },
          { key: 'current', icon: <ShoppingBag size={20} />, label: 'طلبي' },
        ];
      case UserRole.CUSTOMER:
        return [
          { key: 'home', icon: <Home size={20} />, label: 'الرئيسية' },
          { key: 'orders', icon: <ShoppingBag size={20} />, label: 'طلباتي' },
          { key: 'cart', icon: <ShoppingCart size={20} />, label: 'السلة' },
          { key: 'tracking', icon: <Map size={20} />, label: 'تتبع' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleNavClick = (key: string) => {
    if (onNavigate) {
      onNavigate(key);
    }
  };

  // Mobile Customer Layout (Preserved look specific for Customer Mobile)
  if (!isDesktop && user.role === UserRole.CUSTOMER) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Hide header in tracking view for immersion, show elsewhere */}
        {activeView !== 'tracking' && (
          <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-red-600">أكلاتي</h1>
              <button onClick={onLogout} className="text-gray-400 hover:text-red-600">
                <LogOut size={20} />
              </button>
            </div>
          </header>
        )}
        
        <main className={activeView === 'tracking' ? '' : 'p-4'}>{children}</main>
        
        <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 z-50 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => (
             <button 
               key={item.key} 
               onClick={() => handleNavClick(item.key)}
               className={`flex flex-col items-center w-full py-1 transition-colors ${activeView === item.key ? 'text-red-600' : 'text-gray-400'}`}
             >
               <div className={`p-1 rounded-full ${activeView === item.key ? 'bg-red-50' : ''}`}>
                 {item.icon}
               </div>
               <span className="text-[10px] font-bold mt-1">{item.label}</span>
             </button>
          ))}
        </nav>
      </div>
    );
  }

  // Professional Layout (Desktop for everyone, Mobile for Professionals)
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row pb-20 lg:pb-0">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white shadow-lg h-screen sticky top-0 z-40">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-red-600">أكلاتي</h1>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.key} 
              onClick={() => handleNavClick(item.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-right ${activeView === item.key ? 'bg-red-50 text-red-600 border-r-4 border-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-red-600 w-full p-2 hover:bg-red-50 rounded transition"
          >
            <LogOut size={18} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header for Professional roles */}
      <header className="lg:hidden bg-white shadow p-4 flex justify-between items-center sticky top-0 z-20">
        <div>
           <h1 className="text-xl font-bold text-red-600">أكلاتي</h1>
           <span className="text-xs text-gray-500">{title}</span>
        </div>
        <button onClick={onLogout} className="text-gray-500">
          <LogOut size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>

      {/* Bottom Navigation for Professional roles on Mobile/Tablet */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50">
          {navItems.map((item) => (
             <button 
                key={item.key} 
                onClick={() => handleNavClick(item.key)}
                className={`flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors ${activeView === item.key ? 'text-red-600' : ''}`}
             >
               {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
               <span className="text-xs mt-1">{item.label}</span>
             </button>
          ))}
      </nav>
    </div>
  );
};

export default Layout;