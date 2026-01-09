import React, { useEffect, useState } from 'react';
import {
    User,
    Briefcase,
    DollarSign
} from 'lucide-react';
import { fetchDoctorsFull } from '../lib/api';
import '../styles/doctors.css';

const Doctors: React.FC = () => {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchDoctorsFull();
                setDoctors(data);
            } catch (error) {
                console.error('Error loading doctors:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Doctor Directory</h1>
                <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black px-4 py-2 rounded-lg font-medium transition-colors">
                    + New Doctor
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading doctors...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map(doc => (
                        <div key={doc.id} className="doctor-card">
                            <div className="doctor-header">
                                <div className="doctor-avatar">
                                    <User size={24} />
                                </div>
                                <div className="doctor-info w-full">
                                    <h3>
                                        {doc.full_name}
                                        <span className="case-badge" title="Total Cases">
                                            {doc.totalCases || 0} Cases
                                        </span>
                                    </h3>
                                    <p>{doc.clinic_name || 'No Clinic Attached'}</p>
                                </div>
                            </div>

                            <div className="doctor-stats">
                                <div className="stat-item">
                                    <span className="stat-label">
                                        <Briefcase size={12} /> Active Cases
                                    </span>
                                    {/* Placeholder logic for active vs total, for now simplified */}
                                    <span className="stat-value">{doc.totalCases || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">
                                        <DollarSign size={12} /> Lifetime Value
                                    </span>
                                    <span className="stat-value">
                                        {new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 })
                                            .format(doc.totalRevenue || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Doctors;
