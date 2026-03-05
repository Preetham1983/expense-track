export const CATEGORIES = [
    { value: 'groceries', label: 'Groceries', icon: '🛒', color: '#4CAF50' },
    { value: 'rent', label: 'Rent', icon: '🏠', color: '#2196F3' },
    { value: 'travel', label: 'Travel', icon: '✈️', color: '#FF9800' },
    { value: 'subscriptions', label: 'Subscriptions', icon: '📱', color: '#9C27B0' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#E91E63' },
    { value: 'bills', label: 'Bills', icon: '📄', color: '#F44336' },
    { value: 'daily', label: 'Daily', icon: '☕', color: '#795548' },
    { value: 'food', label: 'Food', icon: '🍕', color: '#FF5722' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#673AB7' },
    { value: 'health', label: 'Health', icon: '🏥', color: '#00BCD4' },
    { value: 'education', label: 'Education', icon: '📚', color: '#3F51B5' },
    { value: 'petrol', label: 'Petrol', icon: '⛽', color: '#FFEB3B' },
    { value: 'other', label: 'Other', icon: '📌', color: '#607D8B' },
];

export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'net_banking', label: 'Net Banking' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'other', label: 'Other' },
];

export const EMI_FREQUENCIES = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half Yearly' },
    { value: 'yearly', label: 'Yearly' },
];

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function getCategoryInfo(categoryValue) {
    return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1];
}
