import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './index.css';
import './mobile.css'; // New mobile-specific styles

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import EMIs from './pages/EMIs';
import HowItWorks from './pages/HowItWorks';

// Layout wrapper for protected routes
const MainLayout = ({ children }) => (
    <div className="app-layout">
        <Navbar />
        <main className="main-content">
            {children}
        </main>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster position="top-right" toastOptions={{
                    style: { background: '#1e2030', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
                }} />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <MainLayout><Dashboard /></MainLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/expenses" element={
                        <ProtectedRoute>
                            <MainLayout><Expenses /></MainLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/emis" element={
                        <ProtectedRoute>
                            <MainLayout><EMIs /></MainLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/how-it-works" element={
                        <ProtectedRoute>
                            <MainLayout><HowItWorks /></MainLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
