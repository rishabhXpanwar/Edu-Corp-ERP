import React, { useCallback, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useSocket from '../hooks/useSocket.js';
import useAuth from '../hooks/useAuth.js';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  LogOut,
  Home,
  Users,
  BookOpen,
  Calendar,
  Settings,
  Bell,
  Search,
  Menu,
  Megaphone,
  Briefcase,
  DollarSign,
  FileText,
} from 'lucide-react';
import { logout } from '../features/auth/authSlice.js';
import {
  addNotification,
  incrementUnreadCount,
  fetchUnreadCount,
} from '../features/notifications/notificationSlice.js';
import { ROLES, SCHOOL_STAFF_ROLES, MANAGER_ROLES } from '../constants/roles.js';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const handleIncomingNotification = useCallback((payload) => {
    dispatch(addNotification({
      ...payload,
      _id: payload.notificationId,
      isRead: false,
    }));
    dispatch(incrementUnreadCount());

    if (payload?.message) {
      toast.success(`New notification: ${payload.message.substring(0, 50)}`);
    }
  }, [dispatch]);

  useSocket({ onNotificationNew: handleIncomingNotification });

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const renderNavLinks = () => {
    const role = user?.role;
    
    // Base links for almost everyone
    const links = [
      { to: '/dashboard', label: 'Dashboard', icon: Home },
    ];

    if (SCHOOL_STAFF_ROLES.includes(role)) {
      links.push({ to: '/students', label: 'Students', icon: Users });
      links.push({ to: '/classes', label: 'Classes', icon: BookOpen });
      links.push({ to: '/timetable', label: 'Timetable', icon: Calendar });
    }
    
    if (MANAGER_ROLES.includes(role) || role === ROLES.PRINCIPAL) {
      links.push({ to: '/teachers', label: 'Teachers', icon: Users });
    }

    if (role === ROLES.PRINCIPAL) {
      links.push({ to: '/managers', label: 'Managers', icon: Briefcase });
    }

    if (role === ROLES.FINANCE_MANAGER || role === ROLES.PRINCIPAL) {
      links.push({ to: '/salaries', label: 'Salaries', icon: DollarSign });
      links.push({ to: '/fees', label: 'Fees', icon: FileText });
    }

    // Calendar — visible to all school staff; editable by principal + managers (enforced in CalendarPage)
    if (SCHOOL_STAFF_ROLES.includes(role) || MANAGER_ROLES.includes(role) || role === ROLES.PRINCIPAL) {
      links.push({ to: '/calendar', label: 'Calendar', icon: Calendar });
    }

    links.push({ to: '/notifications', label: 'Notifications', icon: Bell });
    links.push({ to: '/announcements', label: 'Announcements', icon: Megaphone });

    // Add profile/settings for everyone
    links.push({ to: '/profile', label: 'Profile', icon: Settings });

    return links.map((link) => {
      const Icon = link.icon;
      return (
        <NavLink 
          key={link.to} 
          to={link.to} 
          className={({ isActive }) => `auth-layout__nav-link ${isActive ? 'active' : ''}`}
        >
          <Icon size={20} className="nav-icon" />
          <span>{link.label}</span>
        </NavLink>
      );
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="auth-layout school-panel">
      <aside className="auth-layout__sidebar">
        <div className="auth-layout__sidebar-logo">EduCore</div>
        <nav className="auth-layout__nav">
          {renderNavLinks()}
        </nav>
        <div className="auth-layout__sidebar-footer">
          <button className="auth-layout__logout-btn" onClick={handleLogout}>
            <LogOut size={20} className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <div className="auth-layout__body">
        <header className="auth-layout__header">
          <div className="header-left">
            <button className="mobile-menu-btn">
              <Menu size={24} />
            </button>
            <div className="header-search">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => navigate('/notifications')}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            
            <div className="header-user">
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">{user?.role || 'user'}</span>
              </div>
              <div className="user-avatar">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" />
                ) : (
                  <span className="avatar-initials">{getInitials(user?.name)}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="auth-layout__main">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
