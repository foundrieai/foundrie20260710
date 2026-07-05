import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  Calendar, 
  Search, 
  BarChart3, 
  BookOpen, 
  Settings, 
  Activity,
  ChevronRight,
  User as UserIcon,
  LogOut,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-lg group",
      active 
        ? "bg-blue-50 text-blue-700" 
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5 mr-3", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
    {label}
    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
  </button>
);

export const Sidebar: React.FC<{ currentPath: string; onNavigate: (path: string) => void }> = ({ currentPath, onNavigate }) => {
  const { currentTenant, user, logout } = useApp();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'strategy', label: 'Brand Strategy', icon: Target },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'listening', label: 'Listening', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'guides', label: 'Brand Guides', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'status', label: 'System Status', icon: Activity },
  ];

  return (
    <div className="flex flex-col h-screen border-r border-slate-200 bg-white w-64 shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">BrandForge</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentPath === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center p-2 space-x-3 rounded-lg bg-slate-50 justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
              <UserIcon className="w-6 h-6 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{currentTenant?.name || 'No Tenant'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
