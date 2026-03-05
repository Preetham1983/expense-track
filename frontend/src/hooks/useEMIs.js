import { useState, useEffect, useCallback } from 'react';
import { emiAPI } from '../services/api';

export function useEMIs() {
    const [emis, setEmis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [upcoming, setUpcoming] = useState([]);

    const fetchEMIs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await emiAPI.getAll({ page: 1, per_page: 50 });
            setEmis(res.data.items);
        } catch (error) {
            console.error('Failed to fetch EMIs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUpcoming = useCallback(async () => {
        try {
            const res = await emiAPI.getUpcoming();
            setUpcoming(res.data.upcoming_emis);
        } catch (error) {
            console.error('Failed to fetch upcoming EMIs:', error);
        }
    }, []);

    useEffect(() => {
        fetchEMIs();
        fetchUpcoming();
    }, [fetchEMIs, fetchUpcoming]);

    const addEMI = async (data) => {
        const res = await emiAPI.create(data);
        await fetchEMIs();
        await fetchUpcoming();
        return res.data;
    };

    const updateEMI = async (id, data) => {
        const res = await emiAPI.update(id, data);
        await fetchEMIs();
        return res.data;
    };

    const deleteEMI = async (id) => {
        await emiAPI.delete(id);
        await fetchEMIs();
    };

    return { emis, loading, upcoming, fetchEMIs, addEMI, updateEMI, deleteEMI };
}
