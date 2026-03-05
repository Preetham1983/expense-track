import { formatCurrency, formatDate, getCategoryInfo } from '../utils/helpers';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function ExpenseCard({ expense, onEdit, onDelete }) {
    const category = getCategoryInfo(expense.category);

    return (
        <div className="expense-card">
            <div className="expense-card-left">
                <div className="expense-category-icon" style={{ background: category.color + '22', color: category.color }}>
                    {category.icon}
                </div>
                <div className="expense-info">
                    <h4 className="expense-description">{expense.description}</h4>
                    <div className="expense-meta">
                        <span className="expense-category-tag" style={{ background: category.color + '18', color: category.color }}>
                            {category.label}
                        </span>
                        <span className="expense-date">{formatDate(expense.date)}</span>
                        <span className="expense-payment">{expense.payment_method.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>
            <div className="expense-card-right">
                <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                <div className="expense-actions">
                    <button className="action-btn edit" onClick={() => onEdit(expense)} title="Edit">
                        <FiEdit2 />
                    </button>
                    <button className="action-btn delete" onClick={() => onDelete(expense.id)} title="Delete">
                        <FiTrash2 />
                    </button>
                </div>
            </div>
        </div>
    );
}
