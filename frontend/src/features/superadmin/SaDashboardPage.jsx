import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from './saSchoolsSlice.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatsCard from '../../components/StatsCard.jsx';
import Spinner from '../../components/Spinner.jsx';
import { Building2, Users, DollarSign, Activity } from 'lucide-react';
import './SaDashboardPage.css';

const SaDashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector(state => state.saSchools);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading && !stats) {
    return <Spinner />;
  }

  if (error) {
    return <div className="error-message">Failed to load dashboard: {error}</div>;
  }

  // Use provided stats or defaults
  const data = stats || { totalSchools: 0, activeSchools: 0, totalStudents: 0, totalRevenue: 0 };

  return (
    <div className="sa-dashboard">
      <PageHeader 
        title="Super Admin Dashboard" 
        subtitle="Overview of all registered schools and system metrics." 
      />

      <div className="sa-stats-grid">
        <StatsCard 
          title="Total Schools" 
          value={data.totalSchools} 
          icon={<Building2 size={24} />} 
          accentColor="var(--info)"
        />
        <StatsCard 
          title="Active Schools" 
          value={data.activeSchools} 
          icon={<Activity size={24} />} 
          accentColor="var(--success)"
        />
        <StatsCard 
          title="Total Students" 
          value={data.totalStudents} 
          icon={<Users size={24} />} 
          accentColor="var(--warning)"
        />
        <StatsCard 
          title="Total Revenue" 
          value={`$${(data.totalRevenue || 0).toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          accentColor="var(--finance-positive)"
        />
      </div>
    </div>
  );
};

export default SaDashboardPage;
