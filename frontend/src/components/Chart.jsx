import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
