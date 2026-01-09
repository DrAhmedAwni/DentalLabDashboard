import React, { useEffect, useState } from 'react';
import {
    BarChart as BarChartIcon,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign
} from 'lucide-react';
import '../styles/dashboard.css';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { fetchDashboardMetrics, fetchRevenueTrend, fetchLateCases, type DashboardMetrics } from '../lib/api';

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [lateCases, setLateCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [m, r, l] = await Promise.all([
                    fetchDashboardMetrics(),
                    fetchRevenueTrend(),
                    fetchLateCases()
                ]);
                setMetrics(m);
                setRevenueData(r);
                setLateCases(l);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(val);
    };

    return (
        <div className="dashboard-container">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your dental lab today.</p>
            </div>

            {/* Top Row - Finance */}
            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-icon bg-blue-100 text-blue-600">
                        <DollarSign size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Monthly Revenue</p>
                        <h3 className="stat-value">{metrics ? formatCurrency(metrics.revenue) : '-'}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-red-100 text-red-600">
                        <TrendingUp size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Monthly Costs</p>
                        <h3 className="stat-value">{metrics ? formatCurrency(metrics.costs) : '-'}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-green-100 text-green-600">
                        <BarChartIcon size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Net Profit</p>
                        <h3 className="stat-value">{metrics ? formatCurrency(metrics.profit) : '-'}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-yellow-100 text-yellow-600">
                        <AlertCircle size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Outstanding</p>
                        <h3 className="stat-value">{metrics ? formatCurrency(metrics.outstanding) : '-'}</h3>
                    </div>
                </div>
            </div>

            {/* Second Row - Cases */}
            <div className="stats-grid mt-6">
                <div className="card stat-card">
                    <div className="stat-icon bg-indigo-100 text-indigo-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="stat-label">Active Cases</p>
                        <h3 className="stat-value">{metrics?.activeCases}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-red-100 text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="stat-label">Late Cases</p>
                        <h3 className="stat-value">{metrics?.lateCases}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-green-100 text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="stat-label">Delivered (Month)</p>
                        <h3 className="stat-value">{metrics?.deliveredMonth}</h3>
                    </div>
                </div>
            </div>

            {/* Charts & Alerts */}
            <div className="dashboard-main-grid mt-8">
                <div className="card chart-section">
                    <h3 className="card-title">Revenue Trend</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={revenueData}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#B4941F" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#revenueGradient)"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card alerts-section">
                    <h3 className="card-title text-red-600">Late Cases Alert</h3>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Case #</th>
                                    <th>Patient</th>
                                    <th>Due</th>
                                    <th>Doctor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lateCases.map(c => (
                                    <tr key={c.case_code}>
                                        <td className="font-medium">{c.case_code}</td>
                                        <td>{c.patient_name}</td>
                                        <td className="text-red-500">{new Date(c.due_date).toLocaleDateString()}</td>
                                        <td>{c.doctors?.full_name}</td>
                                    </tr>
                                ))}
                                {lateCases.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center text-gray-500 py-4">No late cases</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
