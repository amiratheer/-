import React, { useState, useEffect } from 'react';
import { User, MenuItem, Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, UserPlus, Power, Check, X, Clock, MapPin, Phone } from 'lucide-react';
import Layout from '../components/Layout';

interface ManagerDashboardProps {
  user: User;
  onLogout: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<'orders' | 'menu' | 'staff'>('orders');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Data on Mount and Interval
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [activeView, user.restaurantId]);

  const fetchData = async () => {
    if (!user.restaurantId) return;
    try {
      if (activeView === 'orders') {
        const data = await api.getOrders();
        setOrders(data);
      } else if (activeView === 'menu') {
        const data = await api.getMenu(user.restaurantId);
        setMenu(data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
        const updated = await api.updateMenuItem(item.id, { isAvailable: !item.isAvailable });
        setMenu(prev => prev.map(i => i.id === item.id ? updated : i));
    } catch (e) {
        alert('فشل تحديث الحالة');
    }
  };

  // Order Actions
  const handleAcceptOrder = async (orderId: string) => {
    try {
        await api.updateOrderStatus(orderId, OrderStatus.ACCEPTED);
        fetchData(); // Refresh immediate
    } catch (e) {
        alert('خطأ في الاتصال');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
        await api.updateOrderStatus(orderId, OrderStatus.REJECTED);
        fetchData();
    } catch (e) {
        alert('خطأ في الاتصال');
    }
  };

  const handleNavigation = (key: string) => {
    if (key === 'orders' || key === 'menu' || key === 'staff') {
      setActiveView(key as 'orders' | 'menu' | 'staff');
    }
  };

  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  const activeOrders = orders.filter(o => o.status !== OrderStatus.PENDING && o.status !== OrderStatus.REJECTED && o.status !== OrderStatus.DELIVERED);

  const renderContent = () => {
    if (activeView === 'orders') {
        return (
            <div className="space-y-8">
                {/* Incoming Orders */}
                <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-4 border-r-4 border-red-600 pr-3 flex items-center gap-2">
                        طلبات واردة جديدة <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">{pendingOrders.length}</span>
                    </h3>
                    
                    {pendingOrders.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-dashed border-gray-300 text-center text-gray-400">
                            لا توجد طلبات جديدة بانتظار الموافقة
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {pendingOrders.map(order => (
                                <div key={order.id} className="bg-white p-5 rounded-xl shadow-md border-r-4 border-red-500 animate-in fade-in slide-in-from-right-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg">طلب #{order.id.substring(0, 8)}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {new Date(order.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-red-600 text-lg">{order.totalPrice.toLocaleString()} د.ع</p>
                                        </div>
                                    </div>

                                    {/* Customer Details */}
                                    <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm space-y-2">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <span className="font-bold">الزبون:</span> {order.customerName}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone size={14} className="text-gray-400"/> 
                                            <span className="dir-ltr">{order.customerPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <MapPin size={14} className="text-gray-400"/> {order.customerAddress}
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="mb-4 space-y-1">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm border-b border-dashed border-gray-200 pb-1 last:border-0">
                                                <span className="text-gray-800 font-medium">{item.quantity}x {item.name}</span>
                                                <span className="text-gray-500">{item.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 mt-4">
                                        <button 
                                            onClick={() => handleAcceptOrder(order.id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm"
                                        >
                                            <Check size={18} /> قبول وإرسال للمطبخ
                                        </button>
                                        <button 
                                            onClick={() => handleRejectOrder(order.id)}
                                            className="flex-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                                        >
                                            <X size={18} /> رفض
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Orders Monitoring */}
                <div>
                     <h3 className="font-bold text-gray-800 text-lg mb-4 border-r-4 border-blue-600 pr-3">متابعة الطلبات الجارية</h3>
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">رقم الطلب</th>
                                    <th className="px-6 py-3">الزبون</th>
                                    <th className="px-6 py-3">الحالة</th>
                                    <th className="px-6 py-3">السعر</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activeOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-gray-700">#{order.id.substring(0, 8)}</td>
                                        <td className="px-6 py-4">{order.customerName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold 
                                                ${order.status === OrderStatus.ACCEPTED ? 'bg-blue-100 text-blue-700' : 
                                                  order.status === OrderStatus.PREPARING ? 'bg-orange-100 text-orange-700' :
                                                  order.status === OrderStatus.READY ? 'bg-green-100 text-green-700' : 
                                                  'bg-gray-100 text-gray-700'}`}>
                                                {order.status === OrderStatus.ACCEPTED ? 'مقبول (بانتظار الطبخ)' :
                                                 order.status === OrderStatus.PREPARING ? 'جاري التحضير' :
                                                 order.status === OrderStatus.READY ? 'جاهز للتوصيل' :
                                                 order.status === OrderStatus.ON_THE_WAY ? 'جاري التوصيل' : order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{order.totalPrice.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {activeOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">لا توجد طلبات جارية حالياً</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
        );
    }

    if (activeView === 'menu') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700">قائمة الطعام</h3>
            <button className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition">
              <Plus size={16} /> إضافة طبق
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">صورة</th>
                  <th className="px-6 py-3">اسم الطبق</th>
                  <th className="px-6 py-3">السعر</th>
                  <th className="px-6 py-3">التصنيف</th>
                  <th className="px-6 py-3">الحالة</th>
                  <th className="px-6 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {menu.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-green-600 font-bold">{item.price.toLocaleString()} د.ع</td>
                    <td className="px-6 py-4 text-gray-500">{item.category}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleAvailability(item)}
                        className={`px-2 py-1 rounded text-xs font-bold border ${item.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                      >
                        {item.isAvailable ? 'متوفر' : 'غير متوفر'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeView === 'staff') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">إضافة موظف جديد</h3>
                <UserPlus className="text-gray-400" />
             </div>
             <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">الاسم الكامل</label>
                  <input type="text" className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none" placeholder="محمد علي" />
                </div>
                <div>
                   <label className="block text-sm text-gray-600 mb-1">الدور الوظيفي</label>
                   <select className="w-full p-2 border rounded-lg outline-none">
                     <option value="chef">طباخ</option>
                     <option value="driver">سائق</option>
                   </select>
                </div>
                <button type="button" className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-black">إنشاء حساب</button>
             </form>
           </div>
           
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="p-8 text-center text-gray-400">سيتم تفعيل قائمة الموظفين عند ربط قاعدة البيانات</div>
           </div>
        </div>
      );
    }
  };

  return (
    <Layout user={user} onLogout={onLogout} title="مدير المطعم" activeView={activeView} onNavigate={handleNavigation}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">إدارة المطعم</h2>
            <p className="text-gray-500">مرحباً {user.name}</p>
          </div>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default ManagerDashboard;