import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/PageHeader';
import LeaveApplicationForm from './LeaveApplicationForm';
import LeaveHistoryTable from './LeaveHistoryTable';
import LeaveApprovalQueue from './LeaveApprovalQueue';
import './LeavePage.css';

const TAB_IDS = {
  APPLY: 'apply',
  HISTORY: 'history',
  QUEUE: 'queue',
};

const LeavePage = () => {
  const { user } = useSelector((state) => state.auth);

  const canReviewQueue = useMemo(
    () => ['principal', 'hrManager', 'adminManager'].includes(user?.role),
    [user?.role]
  );

  const [activeTab, setActiveTab] = useState(TAB_IDS.APPLY);

  const renderTabBody = () => {
    if (activeTab === TAB_IDS.APPLY) {
      return <LeaveApplicationForm />;
    }

    if (activeTab === TAB_IDS.HISTORY) {
      return <LeaveHistoryTable />;
    }

    return <LeaveApprovalQueue />;
  };

  return (
    <div className="leave-page">
      <PageHeader
        title="Leave Management"
        subtitle="Apply for leave, track requests, and review pending approvals"
      />

      <div className="leave-tabs" role="tablist" aria-label="Leave tabs">
        <button
          type="button"
          className={`leave-tabs__tab ${activeTab === TAB_IDS.APPLY ? 'is-active' : ''}`}
          onClick={() => setActiveTab(TAB_IDS.APPLY)}
        >
          Apply
        </button>

        <button
          type="button"
          className={`leave-tabs__tab ${activeTab === TAB_IDS.HISTORY ? 'is-active' : ''}`}
          onClick={() => setActiveTab(TAB_IDS.HISTORY)}
        >
          My History
        </button>

        {canReviewQueue && (
          <button
            type="button"
            className={`leave-tabs__tab ${activeTab === TAB_IDS.QUEUE ? 'is-active' : ''}`}
            onClick={() => setActiveTab(TAB_IDS.QUEUE)}
          >
            Approval Queue
          </button>
        )}
      </div>

      <section className="leave-page__content">
        {renderTabBody()}
      </section>
    </div>
  );
};

export default LeavePage;
