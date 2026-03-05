import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEMIs } from '../hooks/useEMIs';
import { useExpenses } from '../hooks/useExpenses';
import { expenseAPI, authAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { CategoryPieChart, MonthlyBarChart } from '../components/Chart';
import EMICard from '../components/EMICard';
import ExpenseCard from '../components/ExpenseCard';
import Loader from '../components/Loader';
import { FiTrendingUp, FiTarget, FiAlertCircle, FiEdit3, FiCheck, FiX as FiClose } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user, updateUser } = useAuth();
    const { upcoming, loading: emisLoading } = useEMIs();
    const { expenses, loading: expensesLoading } = useExpenses();
    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState(user?.monthly_budget || '');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoadingSummary(true);
            try {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;

                // Fetch current month summary
                const res = await expenseAPI.getSummary(currentYear, currentMonth);
                setSummary(res.data);

                // Fetch last 6 months for the bar chart
                const last6Months = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(currentYear, now.getMonth() - i, 1);
                    const monthRes = await expenseAPI.getSummary(d.getFullYear(), d.getMonth() + 1);
                    last6Months.push({
                        month: d.toLocaleString('default', { month: 'short' }),
                        total: monthRes.data.total_spent
                    });
                }
                setMonthlyData(last6Months);

            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoadingSummary(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleBudgetUpdate = async (e) => {
        e.preventDefault();
        try {
            const budgetVal = parseFloat(newBudget);
            const res = await authAPI.updateBudget(budgetVal);
            updateUser(res.data);
            setIsEditingBudget(false);
            toast.success('Budget updated successfully!');
        } catch (error) {
            toast.error('Failed to update budget');
        }
    };

    if (loadingSummary || emisLoading || expensesLoading) return <Loader />;

    const budgetUsage = user?.monthly_budget && summary ? (summary.total_spent / user.monthly_budget) * 100 : 0;
    const isOverBudget = budgetUsage > 100;

    return (
        <div className="page-container dashboard">
            <div className="page-header">
                <h1>Welcome, {user?.username}! 👋</h1>
                <p>Here's your financial overview for {summary?.month} {summary?.year}</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card total-spent">
                    <div className="stat-icon"><FiTrendingUp /></div>
                    <div className="stat-content">
                        <h3>Total Spent This Month</h3>
                        <div className="stat-value">{formatCurrency(summary?.total_spent || 0)}</div>
                    </div>
                </div>

                <div className={`stat-card budget ${isOverBudget ? 'over-budget' : ''}`}>
                    <div className="stat-icon">{isOverBudget ? <FiAlertCircle /> : <FiTarget />}</div>
                    <div className="stat-content">
                        <div className="flex-between" style={{ alignItems: 'center' }}>
                            <h3>Monthly Budget</h3>
                            <button className="btn-icon" onClick={() => setIsEditingBudget(!isEditingBudget)}>
                                {isEditingBudget ? <FiClose /> : <FiEdit3 />}
                            </button>
                        </div>

                        {isEditingBudget ? (
                            <form onSubmit={handleBudgetUpdate} className="budget-edit-form">
                                <input
                                    type="number"
                                    value={newBudget}
                                    onChange={(e) => setNewBudget(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="btn-icon text-success"><FiCheck /></button>
                            </form>
                        ) : user?.monthly_budget ? (
                            <>
                                <div className="stat-value">{formatCurrency(user.monthly_budget)}</div>
                                <div className="budget-progress-container">
                                    <div
                                        className={`budget-progress-bar ${budgetUsage > 90 ? 'danger' : budgetUsage > 75 ? 'warning' : 'safe'}`}
                                        style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="budget-text">{budgetUsage.toFixed(1)}% used</div>
                            </>
                        ) : (
                            <div className="no-budget">
                                <p>No budget set</p>
                                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingBudget(true)}>Set Budget</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="stat-card emis-due">
                    <div className="stat-icon" style={{ backgroundColor: '#f59e0b22', color: '#f59e0b' }}>⏰</div>
                    <div className="stat-content">
                        <h3>Upcoming EMIs (3 days)</h3>
                        <div className="stat-value">{upcoming.length}</div>
                        <div className="budget-text">payments due soon</div>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Spending by Category</h3>
                    <CategoryPieChart data={summary?.category_breakdown || {}} />
                </div>
                <div className="chart-card">
                    <h3>6-Month Spending Trend</h3>
                    <MonthlyBarChart monthlyData={monthlyData} />
                </div>
            </div>

            <div className="dashboard-lists-grid">
                <div className="recent-list-section">
                    <div className="section-header-row">
                        <h3>Recent Expenses</h3>
                        <button className="btn-link" onClick={() => navigate('/expenses')}>View All</button>
                    </div>
                    <div className="expense-list compact">
                        {expenses.slice(0, 4).length > 0 ? (
                            expenses.slice(0, 4).map(exp => (
                                <ExpenseCard key={exp.id} expense={exp} onEdit={() => navigate('/expenses')} onDelete={() => { }} />
                            ))
                        ) : (
                            <p className="empty-state-text">No expenses recorded recently.</p>
                        )}
                    </div>
                </div>

                <div className="recent-list-section">
                    <div className="section-header-row">
                        <h3>Upcoming EMIs</h3>
                        <button className="btn-link" onClick={() => navigate('/emis')}>Manage EMIs</button>
                    </div>
                    <div className="emi-list compact">
                        {upcoming.length > 0 ? (
                            upcoming.map(emi => (
                                <EMICard key={emi.id} emi={emi} onEdit={() => navigate('/emis')} onDelete={() => { }} />
                            ))
                        ) : (
                            <div className="empty-state-text">
                                <p>No EMIs due in the next 3 days!</p>
                                <span className="celebration">🎉</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
