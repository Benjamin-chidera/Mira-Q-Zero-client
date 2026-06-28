import { LogOut } from 'lucide-react';
import useAuthStore from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';

export function DashboardHeader() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/mira/login');
  };

  return (
    <header className="h-17.5 bg-white border-b border-gray-100 flex items-center justify-end px-8 shrink-0 relative z-30">
      <button 
        onClick={handleLogout} 
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 font-bold text-[0.8125rem] cursor-pointer"
        title="Log Out"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </header>
  );
}

