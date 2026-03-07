import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { FiUser, FiMail, FiCalendar, FiLock, FiCheck, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, updateUser } = useAuth();

    // Username state
    const [username, setUsername] = useState(user?.username || '');
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

    // Income state
    const [monthlyIncome, setMonthlyIncome] = useState(user?.monthly_income || '');
    const [isUpdatingIncome, setIsUpdatingIncome] = useState(false);

    // Password state
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handleUsernameUpdate = async (e) => {
        e.preventDefault();
        if (username === user.username) return;

        setIsUpdatingUsername(true);
        try {
            const res = await authAPI.updateProfile({ username });
            updateUser(res.data);
            toast.success('Username updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update username');
        } finally {
            setIsUpdatingUsername(false);
        }
    };

    const handleIncomeUpdate = async (e) => {
        e.preventDefault();
        const incomeVal = parseFloat(monthlyIncome);
        if (incomeVal === user.monthly_income) return;

        setIsUpdatingIncome(true);
        try {
            const res = await authAPI.updateProfile({ monthly_income: incomeVal });
            updateUser(res.data);
            toast.success('Monthly income updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update income');
        } finally {
            setIsUpdatingIncome(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('New passwords do not match');
        }

        setIsUpdatingPassword(true);
        try {
            await authAPI.updateProfile({
                current_password: passwords.current,
                new_password: passwords.new
            });
            toast.success('Password updated successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (!user) return null;

    return (
        <div className="page-container profile-page">
            <div className="page-header">
                <h1>User Profile</h1>
                <p>Manage your account settings and security</p>
            </div>

            <div className="profile-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem',
                marginTop: '1rem'
            }}>
                {/* Account Details */}
                <div className="stat-card" style={{ height: 'fit-content' }}>
                    <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUser className="text-primary" /> Account Details
                    </h3>
                    <div className="profile-details">
                        <div className="detail-item mb-3">
                            <label className="text-muted d-block small uppercase mb-1">Email Address</label>
                            <div className="d-flex align-items-center gap-2">
                                <FiMail /> <span>{user.email}</span>
                            </div>
                        </div>
                        <div className="detail-item">
                            <label className="text-muted d-block small uppercase mb-1">Joined Date</label>
                            <div className="d-flex align-items-center gap-2">
                                <FiCalendar /> <span>{formatDate(user.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile */}
                <div className="stat-card">
                    <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUser className="text-primary" /> Edit Profile
                    </h3>
                    <form onSubmit={handleUsernameUpdate}>
                        <div className="form-group mb-4">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                minLength={3}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={isUpdatingUsername || username === user.username}
                        >
                            {isUpdatingUsername ? 'Updating...' : 'Update Username'}
                        </button>
                    </form>
                </div>

                {/* Edit Income */}
                <div className="stat-card">
                    <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiDollarSign className="text-secondary" /> Monthly Income
                    </h3>
                    <form onSubmit={handleIncomeUpdate}>
                        <div className="form-group mb-4">
                            <label className="form-label">Monthly Income (₹)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(e.target.value)}
                                min={0}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-secondary w-100"
                            disabled={isUpdatingIncome || parseFloat(monthlyIncome) === user.monthly_income}
                            style={{ backgroundColor: 'var(--secondary-color)', color: 'white' }}
                        >
                            {isUpdatingIncome ? 'Updating...' : 'Update Income'}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="stat-card">
                    <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiLock className="text-danger" /> Change Password
                    </h3>
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="form-group mb-3">
                            <label className="form-label small">Current Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label small">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label className="form-label small">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-secondary w-100"
                            disabled={isUpdatingPassword}
                            style={{ backgroundColor: 'var(--danger-color)', color: 'white' }}
                        >
                            {isUpdatingPassword ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
