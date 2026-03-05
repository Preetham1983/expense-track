import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';
import { FiHome, FiDollarSign, FiCreditCard, FiBell, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { unreadCount, notifications, markAsRead, markAllRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: <FiHome /> },
        { path: '/expenses', label: 'Expenses', icon: <FiDollarSign /> },
        { path: '/emis', label: 'EMIs', icon: <FiCreditCard /> },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">💰</span>
                    <span className="brand-text">ExpenseTracker</span>
                </Link>

                <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <FiX /> : <FiMenu />}
                </button>

                <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="navbar-actions">
                    <div className="notification-wrapper">
                        <button
                            className="notification-btn"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FiBell />
                            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                        </button>
                        {showNotifications && (
                            <NotificationPanel
                                notifications={notifications}
                                onMarkRead={markAsRead}
                                onMarkAllRead={markAllRead}
                                onClose={() => setShowNotifications(false)}
                            />
                        )}
                    </div>

                    <div className="user-info">
                        <span className="user-avatar">{user?.username?.[0]?.toUpperCase()}</span>
                        <span className="user-name">{user?.username}</span>
                    </div>

                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <FiLogOut />
                    </button>
                </div>
            </div>
        </nav>
    );
}
