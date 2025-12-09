import { Menu, Bell } from 'lucide-react';

export default function AdminMobileHeader({ onMenuClick, pendingCount = 0 }) {
  return (
    <header className="admin-mobile-header">
      <button className="admin-mobile-menu-btn" onClick={onMenuClick}>
        <Menu size={24} />
      </button>
      
      <span className="admin-mobile-brand">💅 Vitoria Nails</span>
      
      <button className="admin-notification-btn">
        <Bell size={24} />
        {pendingCount > 0 && (
          <span className="admin-notification-badge">{pendingCount}</span>
        )}
      </button>
    </header>
  );
}