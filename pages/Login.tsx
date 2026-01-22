import React, { useState } from 'react';
import { UserRole } from '../types';
import { api } from '../services/api';
import { ChefHat, Truck, User, Building, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.CUSTOMER);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.login(identifier, password);
      localStorage.setItem('aklaty_token', response.token);
      localStorage.setItem('aklaty_user_role', response.user.role);
      onLogin(response.token);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول، يرجى التحقق من المعلومات');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: UserRole.CUSTOMER, label: 'الزبون', icon: <User size={18} /> },
    { id: UserRole.RESTAURANT_MANAGER, label: 'مدير المطعم', icon: <Building size={18} /> },
    { id: UserRole.CHEF, label: 'الطباخ', icon: <ChefHat size={18} /> },
    { id: UserRole.DRIVER, label: 'السائق', icon: <Truck size={18} /> },
    { id: UserRole.ADMIN, label: 'الأدمن', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-red-600 p-6 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">أكلاتي</h1>
          <p className="opacity-90">منصة توصيل الطعام العراقية الأولى</p>
        </div>
        
        <div className="p-6">
          <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); }}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              تسجيل دخول {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {activeTab === UserRole.ADMIN ? 'البريد الإلكتروني' : 'رقم الهاتف'}
              </label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={activeTab === UserRole.ADMIN ? "admin@aklaty.com" : "077xxxxxxxxx"}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جارِ التحقق...' : 'دخول النظام'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;