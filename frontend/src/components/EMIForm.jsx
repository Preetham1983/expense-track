import { useState } from 'react';
import { EMI_FREQUENCIES } from '../utils/helpers';

export default function EMIForm({ onSubmit, initialData, onCancel }) {
    const [formData, setFormData] = useState({
        emi_name: initialData?.emi_name || '',
        amount: initialData?.amount || '',
        due_date: initialData?.due_date || 1,
        frequency: initialData?.frequency || 'monthly',
        description: initialData?.description || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                amount: parseFloat(formData.amount),
                due_date: parseInt(formData.due_date),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label>EMI Name</label>
                    <input
                        type="text"
                        value={formData.emi_name}
                        onChange={(e) => setFormData({ ...formData, emi_name: e.target.value })}
                        placeholder="e.g. Home Loan, Car Loan"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="EMI amount"
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Due Date (Day of Month)</label>
                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Frequency</label>
                    <select
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    >
                        {EMI_FREQUENCIES.map((freq) => (
                            <option key={freq.value} value={freq.value}>{freq.label}</option>
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
                    placeholder="Additional notes"
                    maxLength={500}
                />
            </div>

            <div className="form-actions">
                {onCancel && (
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : initialData ? 'Update EMI' : 'Add EMI'}
                </button>
            </div>
        </form>
    );
}
