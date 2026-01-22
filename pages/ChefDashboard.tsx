import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { CheckCircle, Clock, ChefHat, Bell, X, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

interface ChefDashboardProps {
  user: User;
  onLogout: () => void;
}

const ChefDashboard: React.FC<ChefDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<'kitchen' | 'history'>('kitchen');
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<{id: string, message: string, time: Date}[]>([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [user.restaurantId]);

  const fetchOrders = async () => {
    try {
        const data = await api.getOrders();
        // In a real app, logic to detect *new* orders for notifications would be here
        setOrders(data);
    } catch (error) {
        console.error("Failed to fetch kitchen orders");
    }
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
        await api.updateOrderStatus(orderId, newStatus);
        fetchOrders();
    } catch (e) {
        alert("Failed to update status");
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const pendingOrders = orders.filter(o => o.status === OrderStatus.ACCEPTED);
  const preparingOrders = orders.filter(o => o.status === OrderStatus.PREPARING);
  const historyOrders = orders.filter(o => o.status === OrderStatus.READY || o.status === OrderStatus.ON_THE_WAY || o.status === OrderStatus.DELIVERED);

  const handleNavigation = (key: string) => {
    if (key === 'kitchen' || key === 'history') {
      setActiveView(key as 'kitchen' | 'history');
    }
  };

  const renderContent = () => {
    if (activeView === 'history') {
      return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-in fade-in">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
            <Clock />
            الأرشيف والطلبات المكتملة
          </h2>
          <div className="space-y-3">
            {historyOrders.map(order => (
               <div key={order.id} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
                  <div>
                    <p className="font-bold">طلب #{order.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500">{order.items.length} أصناف • {order.totalPrice.toLocaleString()} د.ع</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    {order.status === OrderStatus.READY ? 'جاهز للاستلام' : 'تم التسليم'}
                  </span>
               </div>
            ))}
            {historyOrders.length === 0 && <p className="text-center text-gray-400 py-8">لا يوجد أرشيف حتى الآن</p>}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          {/* NEW ORDERS COLUMN (ACCEPTED BY MANAGER) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
              <Clock />
              طلبات واردة من الإدارة ({pendingOrders.length})
            </h2>
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <div key={order.id} className="border-r-4 border-red-500 bg-gray-50 p-4 rounded-l-lg shadow-sm transition hover:shadow-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-lg">#{order.id.substring(0, 8)}</span>
                    <div className="text-left">
                      <span className="text-sm text-gray-500 block">{new Date(order.createdAt).toLocaleTimeString('ar-IQ')}</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">تمت الموافقة</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-gray-800 font-medium">
                        <span>x{item.quantity} {item.name}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => updateStatus(order.id, OrderStatus.PREPARING)}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition shadow-sm"
                  >
                    بدء التحضير
                  </button>
                </div>
              ))}
              {pendingOrders.length === 0 && <p className="text-gray-400 text-center py-8">لا توجد طلبات جديدة</p>}
            </div>
          </div>
  
          {/* PREPARING COLUMN */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600">
              <ChefHat />
              قيد التحضير ({preparingOrders.length})
            </h2>
            <div className="space-y-4">
              {preparingOrders.map(order => (
                <div key={order.id} className="border-r-4 border-orange-500 bg-orange-50 p-4 rounded-l-lg shadow-sm transition hover:shadow-md">
                   <div className="flex justify-between mb-2">
                    <span className="font-bold text-lg">#{order.id.substring(0, 8)}</span>
                    <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString('ar-IQ')}</span>
                  </div>
                   <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-gray-800">
                        <span>x{item.quantity} {item.name}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => updateStatus(order.id, OrderStatus.READY)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-sm"
                  >
                    <CheckCircle size={18} />
                    جاهز للتوصيل
                  </button>
                </div>
              ))}
              {preparingOrders.length === 0 && <p className="text-gray-400 text-center py-8">لا توجد طلبات قيد التحضير</p>}
            </div>
          </div>
        </div>
    );
  };

  return (
    <Layout user={user} onLogout={onLogout} title="المطبخ" activeView={activeView} onNavigate={handleNavigation}>
      <div className="space-y-6">
        {/* Persistent Notifications Section */}
        {notifications.length > 0 && (
            <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm p-4 transition-all duration-300 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-blue-700">
                    <Bell className="animate-pulse" size={20} />
                    <h2 className="font-bold text-lg">تحديثات المطبخ</h2>
                    </div>
                    <button 
                        onClick={() => setNotifications([])}
                        className="text-xs text-gray-500 hover:text-red-600 underline"
                    >
                        مسح الكل
                    </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {notifications.map((note) => (
                    <div key={note.id} className="flex justify-between items-center bg-blue-50 p-3 rounded border border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-200 p-1.5 rounded-full text-blue-700">
                        <AlertCircle size={16} />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">{note.message}</p>
                        <p className="text-xs text-gray-500">{note.time.toLocaleTimeString('ar-IQ')}</p>
                        </div>
                    </div>
                    <button onClick={() => removeNotification(note.id)} className="text-gray-400 hover:text-red-500 transition">
                        <X size={18} />
                    </button>
                    </div>
                ))}
                </div>
            </div>
        )}

        {renderContent()}
      </div>
    </Layout>
  );
};

export default ChefDashboard;