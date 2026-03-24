import './NotificationDropdown.css';

const NotificationDropdown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="notif-dropdown" role="dialog" aria-label="Notifications">
      <div className="notif-dropdown__header">
        <span className="notif-dropdown__title">Notifications</span>
        <button className="notif-dropdown__close" onClick={onClose}
                type="button" aria-label="Close">✕</button>
      </div>
      <div className="notif-dropdown__body">
        {/* Notification list populated by COMP-20 */}
        <p className="notif-dropdown__empty">No notifications</p>
      </div>
    </div>
  );
};

export default NotificationDropdown;