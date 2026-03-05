import React from 'react';
import { FiDownload, FiArrowLeft, FiCheckCircle, FiShield, FiSmartphone, FiDatabase } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
    const navigate = useNavigate();

    const handleDownloadPDF = () => {
        window.print();
    };

    const steps = [
        {
            title: "Smart Tracking",
            desc: "Add your daily expenses and categorize them (Food, Transport, etc.). Our system automatically calculates your monthly spending trends.",
            icon: <FiCheckCircle />
        },
        {
            title: "EMI Management",
            desc: "Never miss a payment. Add your EMIs with due dates, and we'll send you alerts before they are due.",
            icon: <FiSmartphone />
        },
        {
            title: "Real-time Notifications",
            desc: "Get instant alerts when you're nearing your budget limit or when an EMI is due soon.",
            icon: <FiShield />
        },
        {
            title: "Data Security",
            desc: "Your data is encrypted and securely stored in MongoDB Atlas, accessible only to you via JWT-authenticated sessions.",
            icon: <FiDatabase />
        }
    ];

    return (
        <div className="page-container how-it-works-page">
            <div className="page-header flex-between no-print">
                <div>
                    <h1>How it Works</h1>
                    <p>Learn how to manage your finances effectively with ExpenseTracker.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        <FiArrowLeft /> Back
                    </button>
                    <button className="btn btn-primary" onClick={handleDownloadPDF}>
                        <FiDownload /> Export as PDF
                    </button>
                </div>
            </div>

            <div className="how-it-works-content">
                <section className="guide-section hero-section">
                    <h2>Master Your Finances in 4 Simple Steps</h2>
                    <div className="guide-grid">
                        {steps.map((step, idx) => (
                            <div key={idx} className="guide-card">
                                <span className="guide-icon">{step.icon}</span>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="guide-section">
                    <h2>1. Setting Up Your Profile</h2>
                    <p>Start by setting a monthly budget. This budget is the core of our tracking system. Whenever you add an expense, it will be deducted from this total, and you'll see a real-time progress bar on your dashboard.</p>
                </section>

                <section className="guide-section">
                    <h2>2. Tracking Expenses</h2>
                    <p>Go to the <strong>Expenses</strong> tab to log your spending. You can filter expenses by category or date range. We analyze this data to provide you with insights into your spending habits.</p>
                </section>

                <section className="guide-section">
                    <h2>3. Managing EMIs</h2>
                    <p>Add all your fixed monthly payments in the <strong>EMIs</strong> section. The system classifies them as <em>Normal</em>, <em>Due Soon</em>, or <em>Urgent</em> based on the remaining days, so you can prioritize your payments.</p>
                </section>

                <section className="guide-section">
                    <h2>4. Using the App on Mobile (PWA)</h2>
                    <p>This app is a Progressive Web App. You can "Install" it on your Android or iOS device directly from your browser. Once installed, it will look and feel like a native application with a dedicated icon on your home screen.</p>
                </section>
            </div>

            <style>{`
                .how-it-works-page {
                    max-width: 900px;
                    margin: 0 auto;
                }
                .how-it-works-content {
                    margin-top: 2rem;
                    line-height: 1.8;
                }
                .guide-section {
                    margin-bottom: 3rem;
                }
                .hero-section {
                    text-align: center;
                    margin-bottom: 4rem;
                }
                .guide-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-top: 2rem;
                }
                .guide-card {
                    background: var(--bg-surface);
                    border: var(--glass-border);
                    padding: 1.5rem;
                    border-radius: var(--radius-md);
                    text-align: center;
                }
                .guide-icon {
                    font-size: 2rem;
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                    display: block;
                }
                .guide-card h3 {
                    margin-bottom: 0.75rem;
                    font-size: 1.1rem;
                }
                .guide-card p {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                strong {
                    color: var(--primary-color);
                }
                @media print {
                    .no-print { display: none !important; }
                    .how-it-works-page { max-width: 100%; color: black; }
                    .guide-card { border: 1px solid #ccc; background: white; color: black; }
                }
            `}</style>
        </div>
    );
}
