import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../utils/helpers';
import { FiPlus, FiFilter, FiX } from 'react-icons/fi';

export default function Expenses() {
    const {
        expenses, loading, pagination, filters,
        setFilters, fetchExpenses, addExpense, updateExpense, deleteExpense
    } = useExpenses();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const handleOpenForm = (expense = null) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingExpense(null);
    };

    const handleFormSubmit = async (data) => {
        try {
            if (editingExpense) {
                await updateExpense(editingExpense.id, data);
                toast.success('Expense updated!');
            } else {
                await addExpense(data);
                toast.success('Expense added!');
            }
            handleCloseForm();
        } catch (error) {
            toast.error('Failed to save expense');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await deleteExpense(id);
                toast.success('Expense deleted!');
            } catch (error) {
                toast.error('Failed to delete expense');
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ category: '', start_date: '', end_date: '' });
        setShowFilters(false);
    };

    return (
        <div className="page-container">
            <div className="page-header flex-between">
                <div>
                    <h1>Expenses</h1>
                    <p>Manage and track your spending</p>
                </div>
                <div className="header-actions">
                    <button className={`btn ${showFilters ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Filters
                    </button>
                    <button className="btn btn-primary" onClick={() => handleOpenForm()}>
                        <FiPlus /> Add Expense
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-group">
                        <label>Category</label>
                        <select name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">All Categories</option>
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Start Date</label>
                        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label>End Date</label>
                        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />
                    </div>
                    {(filters.category || filters.start_date || filters.end_date) && (
                        <button className="btn-icon clear-filters" onClick={clearFilters} title="Clear Filters">
                            <FiX />
                        </button>
                    )}
                </div>
            )}

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
                            <button className="btn-icon" onClick={handleCloseForm}><FiX /></button>
                        </div>
                        <ExpenseForm
                            initialData={editingExpense}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseForm}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <Loader />
            ) : (
                <>
                    <div className="expense-list">
                        {expenses.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">💸</div>
                                <h3>No expenses found</h3>
                                <p>Try adjusting your filters or add a new expense.</p>
                            </div>
                        ) : (
                            expenses.map(expense => (
                                <ExpenseCard
                                    key={expense.id}
                                    expense={expense}
                                    onEdit={handleOpenForm}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>

                    {pagination.total_pages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn btn-outline"
                                disabled={pagination.page === 1}
                                onClick={() => fetchExpenses(pagination.page - 1)}
                            >
                                Previous
                            </button>
                            <span className="page-info">
                                Page {pagination.page} of {pagination.total_pages}
                            </span>
                            <button
                                className="btn btn-outline"
                                disabled={pagination.page === pagination.total_pages}
                                onClick={() => fetchExpenses(pagination.page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
