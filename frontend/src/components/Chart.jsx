import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { CATEGORIES, formatCurrency } from '../utils/helpers';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export function CategoryPieChart({ data }) {
    const chartData = Object.entries(data).map(([key, value]) => {
        const cat = CATEGORIES.find(c => c.value === key);
        return { name: cat?.label || key, value: Math.round(value * 100) / 100, color: cat?.color || '#607D8B' };
    }).filter(item => item.value > 0);

    if (chartData.length === 0) {
        return <div className="chart-empty">No spending data for this period</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function MonthlyBarChart({ monthlyData }) {
    if (!monthlyData || monthlyData.length === 0) {
        return <div className="chart-empty">No monthly data available</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </BarChart>
        </ResponsiveContainer>
    );
}

export function SpendingTrendChart({ monthlyData }) {
    if (!monthlyData || monthlyData.length === 0) {
        return <div className="chart-empty">No trend data available</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff' }}
                />
                <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export function IncomeExpenseChart({ income, actualExpense }) {
    const data = [
        { name: 'Income', amount: income || 0, fill: '#14b8a6' },
        { name: 'Expense', amount: actualExpense || 0, fill: '#f43f5e' }
    ];

    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40} />
            </BarChart>
        </ResponsiveContainer>
    );
}

