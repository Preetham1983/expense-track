import { formatDate } from '../utils/helpers';
import { FiCheck, FiCheckCircle, FiX } from 'react-icons/fi';

export default function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClose }) {
    const getTypeIcon = (type) => {
        switch (type) {
            case 'emi_reminder': return '⏰';
            case 'spending_alert': return '⚠️';
            case 'budget_warning': return '🚨';
            case 'monthly_summary': return '📊';
            default: return '🔔';
        }
    };

    const getTypeClass = (type) => {
        switch (type) {
            case 'emi_reminder': return 'type-emi';
            case 'spending_alert': return 'type-spending';
            case 'budget_warning': return 'type-budget';
            default: return 'type-default';
        }
    };

    return (
        <div className="notification-panel">
            <div className="notification-header">
                <h3>Notifications</h3>
                <div className="notification-header-actions">
                    <button onClick={onMarkAllRead} className="mark-all-btn" title="Mark all read">
                        <FiCheckCircle /> Mark all
                    </button>
                    <button onClick={onClose} className="close-panel-btn">
                        <FiX />
                    </button>
                </div>
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        <span className="no-notif-icon">🔔</span>
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`notification-item ${!notif.is_read ? 'unread' : ''} ${getTypeClass(notif.type)}`}
                        >
                            <div className="notif-icon">{getTypeIcon(notif.type)}</div>
                            <div className="notif-content">
                                <h4>{notif.title}</h4>
                                <p>{notif.message}</p>
                                <span className="notif-time">{formatDate(notif.created_at)}</span>
                            </div>
                            {!notif.is_read && (
                                <button onClick={() => onMarkRead(notif.id)} className="mark-read-btn" title="Mark as read">
                                    <FiCheck />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
