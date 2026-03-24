import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, LayoutDashboard, Building2, UserCircle, CreditCard } from 'lucide-react';
import { logout } from '../features/auth/authSlice.js';
import useSocket from '../hooks/useSocket.js';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="sa-layout sa-panel">
      <aside className={`sa-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sa-sidebar__header">
          <h2 className="sa-sidebar__logo">EduCore SA</h2>
        </div>
        
        <nav className="sa-sidebar__nav">
          <NavLink to="/superadmin/dashboard" className={({ isActive }) => `sa-nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/superadmin/schools" className={({ isActive }) => `sa-nav-item ${isActive ? 'active' : ''}`}>
            <Building2 size={20} />
            <span>Schools</span>
          </NavLink>
          <NavLink to="/superadmin/subscriptions" className={({ isActive }) => `sa-nav-item ${isActive ? 'active' : ''}`}>
            <CreditCard size={20} />
            <span>Subscriptions</span>
          </NavLink>
        </nav>
      </aside>

      <div className="sa-main-content">
        <header className="sa-header">
          <div className="sa-header__left">
            <button className="sa-mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              ☰
            </button>
            <h1 className="sa-header__title">Super Admin Portal</h1>
          </div>
          
          <div className="sa-header__right">
            <div className="sa-user-profile">
              <UserCircle size={32} className="sa-user-avatar" />
              <div className="sa-user-info">
                <span className="sa-user-name">{user?.name || 'Super Admin'}</span>
                <span className="sa-user-role">System Administrator</span>
              </div>
            </div>
            <button onClick={handleLogout} className="sa-logout-btn" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="sa-page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;