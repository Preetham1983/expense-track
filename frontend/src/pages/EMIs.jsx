import { useState } from 'react';
import { useEMIs } from '../hooks/useEMIs';
import EMICard from '../components/EMICard';
import EMIForm from '../components/EMIForm';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiCheckCircle } from 'react-icons/fi';

export default function EMIs() {
    const { emis, loading, upcoming, addEMI, updateEMI, deleteEMI } = useEMIs();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEMI, setEditingEMI] = useState(null);

    const handleOpenForm = (emi = null) => {
        setEditingEMI(emi);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingEMI(null);
    };

    const handleFormSubmit = async (data) => {
        try {
            if (editingEMI) {
                await updateEMI(editingEMI.id, data);
                toast.success('EMI updated!');
            } else {
                await addEMI(data);
                toast.success('EMI added!');
            }
            handleCloseForm();
        } catch (error) {
            toast.error('Failed to save EMI');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this EMI?')) {
            try {
                await deleteEMI(id);
                toast.success('EMI deleted!');
            } catch (error) {
                toast.error('Failed to delete EMI');
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="page-container">
            <div className="page-header flex-between">
                <div>
                    <h1>EMIs & Bills</h1>
                    <p>Track your recurring payments</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenForm()}>
                    <FiPlus /> Add EMI
                </button>
            </div>

            {upcoming.length > 0 && (
                <div className="upcoming-alert-banner">
                    <div className="alert-icon">⏰</div>
                    <div className="alert-content">
                        <h4>You have {upcoming.length} payments due soon!</h4>
                        <p>Make sure to keep enough balance in your account.</p>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingEMI ? 'Edit EMI' : 'Add New EMI'}</h2>
                            <button className="btn-icon" onClick={handleCloseForm}><FiX /></button>
                        </div>
                        <EMIForm
                            initialData={editingEMI}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseForm}
                        />
                    </div>
                </div>
            )}

            <div className="emi-grid">
                {emis.length === 0 ? (
                    <div className="empty-state full-width">
                        <div className="empty-icon"><FiCheckCircle /></div>
                        <h3>No EMIs found</h3>
                        <p>You have no recurring payments tracked. Great job!</p>
                    </div>
                ) : (
                    emis.map(emi => (
                        <EMICard
                            key={emi.id}
                            emi={emi}
                            onEdit={handleOpenForm}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
