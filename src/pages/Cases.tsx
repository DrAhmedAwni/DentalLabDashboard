import React, { useEffect, useState } from 'react';
import {
    Briefcase,
    CheckCircle,
    Clock,
    AlertTriangle,
    Search
} from 'lucide-react';
import { fetchCases, fetchDoctors } from '../lib/api'; // Reuse fetchDoctors
import '../styles/dashboard.css'; // Reuse card styles
import '../styles/finance.css'; // Reuse filter styles

const Cases: React.FC = () => {
    const [cases, setCases] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [stageFilter, setStageFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Stats (Derived from loaded cases for now for simplicity)
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        late: 0
    });

    useEffect(() => {
        loadData();
    }, [stageFilter, doctorFilter, searchTerm]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [loadedCases, docList] = await Promise.all([
                fetchCases({ stage: stageFilter, doctorId: doctorFilter, search: searchTerm }),
                fetchDoctors()
            ]);
            setCases(loadedCases);
            setDoctors(docList);

            // Update basic stats
            // Final Ready to Deliver and Final Delivered are considered completed
            const completedStatuses = ['final_ready_to_deliver', 'final_delivered'];
            const activeStatuses = ['submitted', 'pouring_scan', 'design', 'waiting_for_confirmation',
                'tryin_printing', 'tryin_ready_to_deliver', 'tryin_delivered',
                'sintring', 'stain_glaze'];

            setStats({
                total: loadedCases.length,
                active: loadedCases.filter((c: any) => activeStatuses.includes(c.stage)).length,
                completed: loadedCases.filter((c: any) => completedStatuses.includes(c.stage)).length,
                late: loadedCases.filter((c: any) => new Date(c.due_date) < new Date() && !completedStatuses.includes(c.stage)).length
            });

        } catch (error) {
            console.error('Error loading cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStageColor = (stage: string) => {
        // Complete status workflow based on user's image
        const statusMap: any = {
            // Initial stages - Blue tones
            'submitted': 'bg-blue-100 text-blue-800',
            'pouring_scan': 'bg-cyan-100 text-cyan-800',

            // Design phase - Purple tones
            'design': 'bg-purple-100 text-purple-800',
            'waiting_for_confirmation': 'bg-amber-100 text-amber-800',

            // Try-in phase - Yellow/Orange tones
            'tryin_printing': 'bg-yellow-100 text-yellow-800',
            'tryin_ready_to_deliver': 'bg-orange-100 text-orange-800',
            'tryin_delivered': 'bg-orange-200 text-orange-900',

            // Final processing - Indigo tones
            'sintring': 'bg-indigo-100 text-indigo-800',
            'stain_glaze': 'bg-violet-100 text-violet-800',

            // Completion - Green tones (Final stages)
            'final_ready_to_deliver': 'bg-green-100 text-green-800',
            'final_delivered': 'bg-green-200 text-green-900', // Invoice sent, payment link provided

            // Legacy/other statuses
            'new': 'bg-blue-100 text-blue-800',
            'in_progress': 'bg-yellow-100 text-yellow-800',
            'printing': 'bg-indigo-100 text-indigo-800',
            'delivered': 'bg-green-100 text-green-800',
            'hold': 'bg-red-100 text-red-800',
            'cancelled': 'bg-gray-100 text-gray-800'
        };
        return statusMap[stage] || 'bg-gray-100 text-gray-800';
    };

    const formatStageName = (stage: string) => {
        // Format stage names for display
        const nameMap: any = {
            'submitted': 'Submitted',
            'pouring_scan': 'Pouring/Scan',
            'design': 'Design',
            'waiting_for_confirmation': 'Waiting for Confirmation',
            'tryin_printing': 'Try-in Printing',
            'tryin_ready_to_deliver': 'Try-in Ready to Deliver',
            'tryin_delivered': 'Try-in Delivered',
            'sintring': 'Sintering',
            'stain_glaze': 'Stain & Glaze',
            'final_ready_to_deliver': 'Final Ready to Deliver',
            'final_delivered': 'Final Delivered ✓', // Indicates invoice sent
        };
        return nameMap[stage] || stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Case Management</h1>
                <p className="text-gray-600">Track and manage all dental cases in one place</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card stat-card">
                    <div className="stat-icon bg-blue-100 text-blue-600">
                        <Briefcase size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Total Cases</p>
                        <h3 className="stat-value">{stats.total}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-yellow-100 text-yellow-600">
                        <Clock size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Active</p>
                        <h3 className="stat-value">{stats.active}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-green-100 text-green-600">
                        <CheckCircle size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Completed</p>
                        <h3 className="stat-value">{stats.completed}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-red-100 text-red-600">
                        <AlertTriangle size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Late</p>
                        <h3 className="stat-value">{stats.late}</h3>
                    </div>
                </div>
            </div>
            {/* Filters & Table */}
            <div className="card">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search patient or code..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            className="filter-select flex-1 md:flex-none"
                            value={stageFilter}
                            onChange={(e) => setStageFilter(e.target.value)}
                        >
                            <option value="all">All Stages</option>
                            <option value="submitted">Submitted</option>
                            <option value="pouring_scan">Pouring/Scan</option>
                            <option value="design">Design</option>
                            <option value="waiting_for_confirmation">Waiting for Confirmation</option>
                            <option value="tryin_printing">Try-in Printing</option>
                            <option value="tryin_ready_to_deliver">Try-in Ready to Deliver</option>
                            <option value="tryin_delivered">Try-in Delivered</option>
                            <option value="sintring">Sintering</option>
                            <option value="stain_glaze">Stain & Glaze</option>
                            <option value="final_ready_to_deliver">Final Ready to Deliver</option>
                            <option value="final_delivered">Final Delivered</option>
                        </select>

                        <select
                            className="filter-select flex-1 md:flex-none"
                            value={doctorFilter}
                            onChange={(e) => setDoctorFilter(e.target.value)}
                        >
                            <option value="">All Doctors</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>{d.full_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-200 text-gray-500 text-sm">
                                <th className="pb-3 pl-4">Case ID</th>
                                <th className="pb-3">Patient</th>
                                <th className="pb-3">Doctor</th>
                                <th className="pb-3">Stage</th>
                                <th className="pb-3">Due Date</th>
                                <th className="pb-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={6} className="py-4 text-center">Loading cases...</td></tr>
                            ) : cases.length === 0 ? (
                                <tr><td colSpan={6} className="py-4 text-center text-gray-500">No cases found matching filters.</td></tr>
                            ) : (
                                cases.map((c) => (
                                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 pl-4 font-medium text-gray-900">#{c.case_code}</td>
                                        <td className="py-3">{c.patient_name}</td>
                                        <td className="py-3">{c.doctors?.full_name}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStageColor(c.stage)}`}>
                                                {formatStageName(c.stage)}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-500">
                                            {new Date(c.due_date).toLocaleDateString()}
                                            {new Date(c.due_date) < new Date() && c.stage !== 'delivered' && (
                                                <AlertTriangle size={14} className="inline text-red-500 ml-1" />
                                            )}
                                        </td>
                                        <td className="py-3 font-medium">
                                            {new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(c.total_amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Cases;
