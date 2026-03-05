import { useState, useEffect, useCallback } from 'react';
import { expenseAPI } from '../services/api';

export function useExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1 });
    const [filters, setFilters] = useState({ category: '', start_date: '', end_date: '' });

    const fetchExpenses = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 10 };
            if (filters.category) params.category = filters.category;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;

            const res = await expenseAPI.getAll(params);
            setExpenses(res.data.items);
            setPagination({
                page: res.data.page,
                total: res.data.total,
                total_pages: res.data.total_pages,
            });
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addExpense = async (data) => {
        const res = await expenseAPI.create(data);
        await fetchExpenses(pagination.page);
        return res.data;
    };

    const updateExpense = async (id, data) => {
        const res = await expenseAPI.update(id, data);
        await fetchExpenses(pagination.page);
        return res.data;
    };

    const deleteExpense = async (id) => {
        await expenseAPI.delete(id);
        await fetchExpenses(pagination.page);
    };

    return {
        expenses, loading, pagination, filters,
        setFilters, fetchExpenses, addExpense, updateExpense, deleteExpense,
    };
}
