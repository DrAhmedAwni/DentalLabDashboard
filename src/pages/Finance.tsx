import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    CreditCard,
    Wallet,
    TrendingDown,
    Download,
    Filter
} from 'lucide-react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    fetchFinanceMetrics,
    fetchInvoices,
    fetchRevenueTrend,
    fetchCollectionRate,
    fetchDoctors,
    type FinanceMetrics
} from '../lib/api';
import '../styles/finance.css';
import '../styles/dashboard.css'; // Reuse card styles

const COLORS = ['#f59e0b', '#10b981', '#2563eb', '#ef4444'];
const formatCurrency = (val: number | string | undefined) =>
    new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(Number(val) || 0);

const Finance: React.FC = () => {
    const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [collectionRate, setCollectionRate] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [m, i, r, c, docList] = await Promise.all([
                    fetchFinanceMetrics(),
                    fetchInvoices({ status: statusFilter, doctorId: doctorFilter }),
                    fetchRevenueTrend(),
                    fetchCollectionRate(),
                    fetchDoctors()
                ]);
                setMetrics(m);
                setInvoices(i);
                setRevenueTrend(r);
                setCollectionRate(c);
                setDoctors(docList);
            } catch (error) {
                console.error('Error loading finance data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [statusFilter, doctorFilter]);

    if (loading && !metrics) return <div className="p-8">Loading financial data...</div>;

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Overview</h1>
                <p className="text-gray-600">Monitor revenue, expenses, and financial performance</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card stat-card">
                    <div className="stat-icon bg-blue-100 text-blue-600">
                        <DollarSign size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Total Revenue</p>
                        <h3 className="stat-value">{metrics ? formatCurrency(metrics.totalRevenue) : '-'}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-yellow-100 text-yellow-600">
                        <CreditCard size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Outstanding</p>
                        <h3 className="stat-value">{metrics ? formatCurrency(metrics.outstanding) : '-'}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-green-100 text-green-600">
                        <Wallet size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Collected (Mo)</p>
                        <h3 className="stat-value">{metrics ? formatCurrency(metrics.collectedMonth) : '-'}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-red-100 text-red-600">
                        <TrendingDown size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Expenses (Mo)</p>
                        <h3 className="stat-value">{metrics ? formatCurrency(metrics.expensesMonth) : '-'}</h3>
                    </div>
                </div>
            </div>

            <div className="finance-main mb-8">
                {/* Revenue Chart */}
                <div className="card">
                    <h3 className="card-title">Revenue Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} />
                                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Collection Donut */}
                <div className="card">
                    <h3 className="card-title">Collection Rate</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={collectionRate}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {collectionRate.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="card invoices-section">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <h3 className="card-title mb-0">Recent Invoices</h3>

                    <div className="flex gap-2 items-center">
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="collected">Collected</option>
                            <option value="void">Void</option>
                        </select>

                        <select
                            className="filter-select"
                            value={doctorFilter}
                            onChange={(e) => setDoctorFilter(e.target.value)}
                        >
                            <option value="">All Doctors</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>{d.full_name}</option>
                            ))}
                        </select>

                        <button className="action-btn border border-gray-200">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Doctor</th>
                                <th>Patient</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td className="font-medium">#{inv.id.slice(0, 8)}</td>
                                    <td>{inv.cases?.doctors?.full_name}</td>
                                    <td>{inv.cases?.patient_name}</td>
                                    <td className="font-medium">{formatCurrency(inv.total_egp)}</td>
                                    <td>{new Date(inv.issued_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge status-${inv.status}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn" title="Download PDF">
                                            <Download size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-gray-500">No invoices found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Finance;
