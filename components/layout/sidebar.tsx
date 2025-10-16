// components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  List,
  Mail, 
  BookMarked, 
  Settings, 
  LayoutDashboard,
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
}

export function Sidebar({ isOpen, onClose, isDesktop }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Main', icon: List },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/feed', label: 'Feed', icon: Home },
    { href: '/dashboard/newsletters', label: 'Newsletters', icon: Mail },
    { href: '/dashboard/saved', label: 'Saved', icon: BookMarked },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  // Desktop: always visible
  // Mobile: hidden by default, slides in when open
  const sidebarClasses = isDesktop 
    ? 'w-64 bg-white border-r border-gray-200 flex-shrink-0' 
    : `fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`;

  return (
    <aside className={sidebarClasses}>
      <div className="h-full flex flex-col">
        {/* Header with close button (mobile only) */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">DigestGenie</span>
          </div>
          
          {!isDesktop && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => !isDesktop && onClose()}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;