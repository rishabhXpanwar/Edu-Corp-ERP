import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../components/PageHeader.jsx';
import Spinner from '../../components/Spinner.jsx';
import AcademicYearForm from './AcademicYearForm.jsx';
import SchoolProfileForm from './SchoolProfileForm.jsx';
import {
  fetchSettings,
  selectCurrentYear,
  selectSchool,
  selectSettingsError,
  selectSettingsLoading,
} from './settingsSlice.js';
import './SettingsPage.css';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const school = useSelector(selectSchool);
  const currentYear = useSelector(selectCurrentYear);
  const loading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  if (loading && !school) {
    return (
      <div className="settings-page__loader">
        <Spinner label="Loading settings" />
      </div>
    );
  }

  return (
    <div className="settings-page school-panel">
      <PageHeader
        title="Settings"
        subtitle="Manage your school profile and academic configuration"
      />

      {error ? <div className="settings-page__error">{error}</div> : null}

      {school ? (
        <div className="settings-page__content">
          <SchoolProfileForm school={school} />
          <AcademicYearForm currentYear={currentYear} />
        </div>
      ) : null}
    </div>
  );
};

export default SettingsPage;
