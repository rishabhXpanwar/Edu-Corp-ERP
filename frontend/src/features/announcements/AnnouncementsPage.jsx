import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import Spinner from '../../components/Spinner.jsx';
import { MANAGER_ROLES, ROLES } from '../../constants/roles.js';
import AnnouncementCard from './AnnouncementCard.jsx';
import PostAnnouncementModal from './PostAnnouncementModal.jsx';
import {
  fetchAnnouncements,
  selectAnnouncements,
  selectAnnouncementError,
  selectAnnouncementLoading,
  selectAnnouncementPagination,
} from './announcementSlice.js';
import './AnnouncementsPage.css';

const AnnouncementsPage = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const items = useSelector(selectAnnouncements);
  const loading = useSelector(selectAnnouncementLoading);
  const error = useSelector(selectAnnouncementError);
  const pagination = useSelector(selectAnnouncementPagination);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const canPostAnnouncement = useMemo(
    () => user?.role === ROLES.PRINCIPAL || MANAGER_ROLES.includes(user?.role),
    [user?.role],
  );

  useEffect(() => {
    dispatch(fetchAnnouncements({ page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  if (loading && items.length === 0) {
    return (
      <div className="announcements-page school-panel">
        <PageHeader title="Announcements" subtitle="School-wide updates and notices" />
        <div className="announcements-page__loading">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-page school-panel">
      <PageHeader
        title="Announcements"
        subtitle="School-wide updates and notices"
        action={
          canPostAnnouncement ? (
            <button
              type="button"
              className="announcements-page__post-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Post Announcement
            </button>
          ) : null
        }
      />

      {error && <div className="announcements-page__error">{error}</div>}

      {items.length === 0 ? (
        <EmptyState title="No announcements yet" subtitle="Announcements will appear here once posted" />
      ) : (
        <motion.div layout className="announcements-page__list">
          {items.map((announcement) => (
            <AnnouncementCard
              key={announcement._id}
              announcement={announcement}
              currentUserId={user?._id || user?.id}
              currentRole={user?.role}
            />
          ))}
        </motion.div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          perPage={pagination.limit}
          onPageChange={setCurrentPage}
        />
      )}

      <PostAnnouncementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default AnnouncementsPage;
