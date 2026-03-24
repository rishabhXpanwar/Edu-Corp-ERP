import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../components/PageHeader.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import RouteCard from './RouteCard.jsx';
import RouteDetailPanel from './RouteDetailPanel.jsx';
import AddRouteModal from './AddRouteModal.jsx';
import { fetchTransports, setSelectedTransport, clearSelectedTransport } from './transportSlice.js';
import './TransportPage.css';

const TransportPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, selectedItem, loading, error } = useSelector((state) => state.transport);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const isAdmin = useMemo(
    () => ['principal', 'adminManager'].includes(user?.role),
    [user?.role]
  );

  const isStudent = useMemo(
    () => user?.role === 'student',
    [user?.role]
  );

  useEffect(() => {
    dispatch(fetchTransports());
  }, [dispatch]);

  // For students, find their assigned route
  const studentRoute = useMemo(() => {
    if (!isStudent) return null;
    const studentId = user?._id || user?.id;
    if (!studentId) return null;

    return items.find((route) =>
      route.assignedStudents?.some((assigned) => {
        const assignedId = assigned?._id || assigned?.id || assigned;
        return assignedId === studentId;
      })
    );
  }, [items, isStudent, user?._id, user?.id]);

  const handleCardClick = (route) => {
    dispatch(setSelectedTransport(route));
  };

  const handleCloseDetail = () => {
    dispatch(clearSelectedTransport());
  };

  const handleAddRoute = () => {
    setEditingRoute(null);
    setAddModalOpen(true);
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setEditingRoute(null);
  };

  if (loading && items.length === 0) {
    return (
      <div className="transport-page">
        <PageHeader title="Transport Management" />
        <div className="transport-page__loading">
          <Spinner />
        </div>
      </div>
    );
  }

  // Student view: show only their assigned route
  if (isStudent) {
    return (
      <div className="transport-page">
        <PageHeader title="Your Transport Route" />
        <div className="transport-page__content">
          {studentRoute ? (
            <div className="transport-page__student-view">
              <RouteCard
                route={studentRoute}
                onClick={() => handleCardClick(studentRoute)}
                isSelected={selectedItem?._id === studentRoute._id}
              />
              {selectedItem && (
                <RouteDetailPanel
                  route={selectedItem}
                  onClose={handleCloseDetail}
                  isAdmin={false}
                />
              )}
            </div>
          ) : (
            <EmptyState
              title="No Route Assigned"
              description="You are not currently assigned to any transport route."
            />
          )}
        </div>
      </div>
    );
  }

  // Admin view: show all routes
  return (
    <div className="transport-page">
      <PageHeader
        title="Transport Management"
        action={isAdmin ? (
          <button type="button" className="btn btn-primary" onClick={handleAddRoute}>
            Add Route
          </button>
        ) : null}
      />

      <div className="transport-page__content">
        {error && <div className="transport-page__error">{error}</div>}

        {items.length === 0 ? (
          <EmptyState
            title="No Transport Routes"
            description="No transport routes have been created yet."
          />
        ) : (
          <div className="transport-page__grid-container">
            <div className="transport-page__grid">
              {items.map((route) => (
                <RouteCard
                  key={route._id}
                  route={route}
                  onClick={() => handleCardClick(route)}
                  isSelected={selectedItem?._id === route._id}
                />
              ))}
            </div>

            {selectedItem && (
              <RouteDetailPanel
                route={selectedItem}
                onClose={handleCloseDetail}
                onEdit={isAdmin ? () => handleEditRoute(selectedItem) : null}
                isAdmin={isAdmin}
              />
            )}
          </div>
        )}
      </div>

      <AddRouteModal
        isOpen={addModalOpen}
        onClose={handleCloseModal}
        editingRoute={editingRoute}
      />
    </div>
  );
};

export default TransportPage;
