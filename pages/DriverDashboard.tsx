import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { MapPin, Navigation, Package, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';

interface DriverDashboardProps {
  user: User;
  onLogout: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'available' | 'current'>('available');
  const [orders, setOrders] = useState<Order[]>([]);
  const [myLocation, setMyLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [user.restaurantId]);

  const fetchOrders = async () => {
    try {
        // Backend filters based on driver role automatically
        const data = await api.getOrders();
        setOrders(data);
    } catch (e) {
        console.error("Failed to load driver orders");
    }
  };

  // Filter orders based on API response
  const availableOrders = orders.filter(o => o.status === OrderStatus.READY && !o.driverId);
  const myCurrentOrder = orders.find(o => o.driverId === user.id && o.status !== OrderStatus.DELIVERED);

  const acceptOrder = async (orderId: string) => {
    try {
        await api.assignDriver(orderId);
        await api.updateOrderStatus(orderId, OrderStatus.ON_THE_WAY);
        fetchOrders();
        setActiveTab('current');
        startGPS();
    } catch (e) {
        alert("فشل قبول الطلب");
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
        await api.updateOrderStatus(orderId, OrderStatus.DELIVERED);
        fetchOrders();
        setActiveTab('available');
    } catch (e) {
        alert("فشل إكمال الطلب");
    }
  };

  const startGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition((position) => {
        setMyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        // Send real GPS to backend
        api.updateLocation(position.coords.latitude, position.coords.longitude);
      });
    }
  };

  // Start GPS if already has order on load
  useEffect(() => {
    if (myCurrentOrder) {
        startGPS();
    }
  }, [myCurrentOrder]);

  const handleNavigation = (key: string) => {
    if (key === 'available' || key === 'current') {
      setActiveTab(key as 'available' | 'current');
    }
  };

  const renderContent = () => {
    if (activeTab === 'available') {
      return (
        <div className="space-y-4 max-w-2xl mx-auto">
          {availableOrders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-in fade-in">
              <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="font-bold text-gray-800">طلب #{order.id.substring(0, 8)}</h3>
                   <p className="text-sm text-gray-500">{order.restaurantName}</p>
                 </div>
                 <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">جاهز</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin size={16} />
                <span>{order.customerAddress}</span>
              </div>
              <button 
                onClick={() => acceptOrder(order.id)}
                className="w-full bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 transition shadow-sm"
              >
                قبول وتوصيل
              </button>
            </div>
          ))}
          {availableOrders.length === 0 && (
            <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
              <Package size={48} className="mx-auto mb-2 opacity-20" />
              <p>لا توجد طلبات جاهزة حالياً</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'current') {
      return (
        <div className="max-w-md mx-auto">
          {myCurrentOrder ? (
            <div className="bg-white p-6 rounded-xl shadow border border-red-100">
               <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600 animate-pulse">
                    <Navigation size={32} />
                  </div>
                  <h2 className="text-xl font-bold">جاري التوصيل...</h2>
                  <p className="text-sm text-gray-500">تم تفعيل GPS</p>
                  {myLocation && <p className="text-xs font-mono mt-1 text-gray-400">{myLocation.lat.toFixed(4)}, {myLocation.lng.toFixed(4)}</p>}
               </div>

               <div className="space-y-4 border-t pt-4">
                  <div>
                    <p className="text-xs text-gray-400">الزبون</p>
                    <p className="font-bold">{myCurrentOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">رقم الهاتف</p>
                    <a href={`tel:${myCurrentOrder.customerPhone}`} className="font-bold text-blue-600 dir-ltr block text-right">
                      {myCurrentOrder.customerPhone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">العنوان</p>
                    <p className="font-medium">{myCurrentOrder.customerAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">المبلغ المطلوب</p>
                    <p className="font-bold text-xl text-green-600">{myCurrentOrder.totalPrice.toLocaleString()} د.ع</p>
                  </div>
               </div>

               <button 
                onClick={() => completeOrder(myCurrentOrder.id)}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                تم التسليم
              </button>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
              <p>ليس لديك طلب نشط</p>
              <button onClick={() => setActiveTab('available')} className="text-red-600 font-bold mt-2 hover:underline">تصفح الطلبات</button>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Layout user={user} onLogout={onLogout} title="كابتن التوصيل" activeView={activeTab} onNavigate={handleNavigation}>
      {renderContent()}
    </Layout>
  );
};

export default DriverDashboard;