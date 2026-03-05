import { formatCurrency } from '../utils/helpers';
import { FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

export default function EMICard({ emi, onEdit, onDelete }) {
    const today = new Date().getDate();
    const daysUntil = emi.due_date >= today ? emi.due_date - today : 30 - today + emi.due_date;
    const isUrgent = daysUntil <= 3;
    const isDueSoon = daysUntil <= 7;

    const getFrequencyLabel = (freq) => {
        const map = { monthly: 'Monthly', quarterly: 'Quarterly', half_yearly: 'Half Yearly', yearly: 'Yearly' };
        return map[freq] || freq;
    };

    return (
        <div className={`emi-card ${isUrgent ? 'urgent' : isDueSoon ? 'due-soon' : ''}`}>
            <div className="emi-card-header">
                <div className="emi-name-section">
                    <h4>{emi.emi_name}</h4>
                    <span className="emi-frequency-badge">{getFrequencyLabel(emi.frequency)}</span>
                </div>
                <div className="emi-actions">
                    <button className="action-btn edit" onClick={() => onEdit(emi)} title="Edit">
                        <FiEdit2 />
                    </button>
                    <button className="action-btn delete" onClick={() => onDelete(emi.id)} title="Delete">
                        <FiTrash2 />
                    </button>
                </div>
            </div>
            <div className="emi-card-body">
                <div className="emi-amount">{formatCurrency(emi.amount)}</div>
                <div className="emi-due">
                    <FiCalendar />
                    <span>Due on {emi.due_date}th of every month</span>
                </div>
                {emi.description && <p className="emi-description">{emi.description}</p>}
            </div>
            <div className="emi-card-footer">
                {isUrgent ? (
                    <span className="due-badge urgent">⚠️ Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
                ) : isDueSoon ? (
                    <span className="due-badge soon">📅 Due in {daysUntil} days</span>
                ) : (
                    <span className="due-badge normal">✅ {daysUntil} days left</span>
                )}
            </div>
        </div>
    );
}
