import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';
import { FiHome, FiDollarSign, FiCreditCard, FiBell, FiLogOut, FiMenu, FiX, FiHelpCircle } from 'react-icons/fi';

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
        { path: '/how-it-works', label: 'How it Works', icon: <FiHelpCircle /> },
    ];

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">💰</span>
                    <span className="brand-text">ExpenseTracker</span>
                </Link>

                <div className="navbar-actions mobile-only-actions">
                    <div className="notification-wrapper">
                        <button
                            className="notification-btn"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FiBell />
                            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                        </button>
                    </div>
                    <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

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

                    {/* Profile link for mobile */}
                    <Link
                        to="/profile"
                        className={`nav-link mobile-profile-link ${location.pathname === '/profile' ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                    >
                        <span className="user-avatar-small">{user?.username?.[0]?.toUpperCase()}</span>
                        <span>Profile</span>
                    </Link>

                    <button className="nav-link logout-btn-mobile" onClick={handleLogout}>
                        <FiLogOut />
                        <span>Logout</span>
                    </button>
                </div>

                <div className="navbar-actions desktop-only-actions">
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

                    <div className="user-nav-group">
                        <Link to="/profile" className="user-info" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <span className="user-avatar">{user?.username?.[0]?.toUpperCase()}</span>
                            <span className="user-name">{user?.username}</span>
                        </Link>

                        <button className="logout-btn" onClick={handleLogout} title="Logout">
                            <FiLogOut />
                        </button>
                    </div>
                </div>

                {showNotifications && mobileOpen && (
                    <div className="mobile-notification-overlay">
                        <NotificationPanel
                            notifications={notifications}
                            onMarkRead={markAsRead}
                            onMarkAllRead={markAllRead}
                            onClose={() => setShowNotifications(false)}
                        />
                    </div>
                )}
            </div>
        </nav>
    );
}
