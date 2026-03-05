import { useState } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/helpers';

export default function ExpenseForm({ onSubmit, initialData, onCancel }) {
    const [formData, setFormData] = useState({
        amount: initialData?.amount || '',
        category: initialData?.category || 'other',
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: initialData?.description || '',
        payment_method: initialData?.payment_method || 'cash',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                amount: parseFloat(formData.amount),
                date: new Date(formData.date).toISOString(),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="Enter amount"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.icon} {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Payment Method</label>
                    <select
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    >
                        {PAYMENT_METHODS.map((pm) => (
                            <option key={pm.value} value={pm.value}>{pm.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Description</label>
                <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What was this expense for?"
                    maxLength={500}
                    required
                />
            </div>

            <div className="form-actions">
                {onCancel && (
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
                </button>
            </div>
        </form>
    );
}
