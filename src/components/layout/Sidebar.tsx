import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Receipt, Settings, LogOut, Shirt, Store, Users, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { icon: Store, label: 'Stores Management', path: '/stores-management', roles: ['SUPER_ADMIN'] },
  { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions', roles: ['SUPER_ADMIN'] },
  { icon: Users, label: 'Employee Management', path: '/employees', roles: ['ADMIN'] },
  { icon: PlusCircle, label: 'New Bill', path: '/new-bill', roles: ['ADMIN', 'EMPLOYEE'] },
  { icon: Receipt, label: 'All Bills', path: '/bills', roles: ['ADMIN', 'EMPLOYEE'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user, store } = useAuth();
  const navigate = useNavigate();
  const isDeactivated = store && !store.isActive && user?.role !== 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter navigation items based on user role and store status
  const visibleNavItems = isDeactivated ? [] : navItems.filter((item) => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground z-50 transform transition-transform duration-300 ease-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Shirt className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">IronPress</h1>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin Panel' : 'Billing System'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-semibold text-sidebar-accent-foreground">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {user?.role && (
                  <span className={cn(
                    "inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold",
                    user.role === 'SUPER_ADMIN'
                      ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                      : user.role === 'ADMIN'
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "bg-green-500/20 text-green-600 dark:text-green-400"
                  )}>
                    {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
