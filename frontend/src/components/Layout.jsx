// frontend/src/components/Layout.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Cog,
  Wrench,
  Calendar,
  ClipboardList,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Masters', path: '/masters', icon: Database },
    { name: 'Motors', path: '/motors', icon: Wrench },
    { name: 'Transaction', path: '/transaction', icon: ClipboardList },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderSidebar = () => (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">EMS</h1>
        <p className="text-sm text-slate-400">Maintenance System</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.full_name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">
              {user.full_name || 'Admin User'}
            </div>
            <div className="text-xs text-slate-400">
              {user.role || 'Administrator'}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-cyan-100 via-teal-100 to-lime-100">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex">{renderSidebar()}</div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar Content */}
          <div className="relative z-50">{renderSidebar()}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        {/* <header className="flex items-center justify-between bg-white shadow px-4 py-3 md:px-6">
          <button
            className="md:hidden text-slate-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header> */}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;