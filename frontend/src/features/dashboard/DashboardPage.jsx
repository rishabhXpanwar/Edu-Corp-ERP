import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles.js';
import PrincipalDashboard from './PrincipalDashboard.jsx';
import FinanceManagerDashboard from './FinanceManagerDashboard.jsx';
import HrManagerDashboard from './HrManagerDashboard.jsx';
import AcademicManagerDashboard from './AcademicManagerDashboard.jsx';
import AdminManagerDashboard from './AdminManagerDashboard.jsx';
import TeacherDashboard from './TeacherDashboard.jsx';
import StudentDashboard from './StudentDashboard.jsx';
import ParentDashboard from './ParentDashboard.jsx';
import './DashboardPage.css';

export const CHART_COLORS = {
  primary: '#0B9ADB',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const DashboardPage = () => {
  const role = useSelector((state) => state.auth.user?.role);

  useEffect(() => {
    console.log('[DashboardPage] role router ready - role:', role);
  }, [role]);

  if (!role) {
    return <div className="dashboard-role__placeholder">Loading dashboard...</div>;
  }

  if (role === ROLES.SUPER_ADMIN) {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  switch (role) {
    case ROLES.PRINCIPAL:
      return <PrincipalDashboard chartColors={CHART_COLORS} />;
    case ROLES.FINANCE_MANAGER:
      return <FinanceManagerDashboard chartColors={CHART_COLORS} />;
    case ROLES.HR_MANAGER:
      return <HrManagerDashboard chartColors={CHART_COLORS} />;
    case ROLES.ACADEMIC_MANAGER:
      return <AcademicManagerDashboard chartColors={CHART_COLORS} />;
    case ROLES.ADMIN_MANAGER:
      return <AdminManagerDashboard chartColors={CHART_COLORS} />;
    case ROLES.TEACHER:
      return <TeacherDashboard chartColors={CHART_COLORS} />;
    case ROLES.STUDENT:
      return <StudentDashboard chartColors={CHART_COLORS} />;
    case ROLES.PARENT:
      return <ParentDashboard chartColors={CHART_COLORS} />;
    default:
      return <Navigate to="/forbidden" replace />;
  }
};

export default DashboardPage;
