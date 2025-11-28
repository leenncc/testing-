import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Truck, Utensils, Package, ClipboardList, Settings, BarChart3, Menu, LogOut, UserCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SidebarItem = ({ icon: Icon, label, id, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-colors rounded-lg ${
      active 
        ? 'bg-purple-700 text-white' 
        : 'text-purple-100 hover:bg-purple-800 hover:text-white'
    }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'receiving', label: 'Receiving', icon: Truck },
    { id: 'processing', label: 'Processing', icon: Utensils },
    { id: 'packing', label: 'Packing', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-purple-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-purple-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-900" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MushProcess</span>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              {...item}
              active={activeTab === item.id}
              onClick={(id: string) => {
                setActiveTab(id);
                setIsMobileMenuOpen(false);
              }}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-purple-800 bg-purple-900">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-purple-300 truncate">{currentUser?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold rounded transition-colors"
          >
            <LogOut className="w-3 h-3 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen">
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-40">
           <span className="font-bold text-gray-800">{menuItems.find(m => m.id === activeTab)?.label}</span>
           <button onClick={() => setIsMobileMenuOpen(true)}>
             <Menu className="w-6 h-6 text-gray-600" />
           </button>
        </div>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};