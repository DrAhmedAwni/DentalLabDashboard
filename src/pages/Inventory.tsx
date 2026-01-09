import React, { useEffect, useState } from 'react';
import {
    Package,
    AlertOctagon,
    TrendingUp,
    ShoppingCart
} from 'lucide-react';
import { fetchInventory } from '../lib/api';
import '../styles/dashboard.css';

const Inventory: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchInventory();
                setProducts(data);
            } catch (error) {
                console.error('Error loading inventory:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getLowStockCount = () => {
        // Logic would be complex with variants, simplified here:
        return products.filter(p =>
            p.inv_variants?.some((v: any) =>
                (v.inv_stock_moves?.reduce((sum: number, m: any) => sum + m.quantity, 0) || 0) < 10
            )
        ).length;
    };

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
                <p className="text-gray-600">Track stock levels, materials, and inventory usage</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card stat-card">
                    <div className="stat-icon bg-blue-100 text-blue-600">
                        <Package size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Total Products</p>
                        <h3 className="stat-value">{products.length}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-red-100 text-red-600">
                        <AlertOctagon size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Low Stock</p>
                        <h3 className="stat-value">{getLowStockCount()}</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-green-100 text-green-600">
                        <TrendingUp size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Total Value</p>
                        <h3 className="stat-value">-</h3>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-yellow-100 text-yellow-600">
                        <ShoppingCart size={26} />
                    </div>
                    <div>
                        <p className="stat-label">Purchase Orders</p>
                        <h3 className="stat-value">0</h3>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="card">
                <h3 className="card-title mb-4">Stock Overview</h3>
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b border-gray-200 text-gray-500 text-sm">
                            <th className="pb-3 pl-4">Product Name</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Brand</th>
                            <th className="pb-3">Variants</th>
                            <th className="pb-3">Total Stock</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr><td colSpan={5} className="py-4 text-center">Loading inventory...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={5} className="py-4 text-center text-gray-500">No products found.</td></tr>
                        ) : (
                            products.map(p => {
                                const totalStock = p.inv_variants?.reduce((sum: number, v: any) =>
                                    sum + (v.inv_stock_moves?.reduce((s: number, m: any) => s + m.quantity, 0) || 0), 0) || 0;

                                return (
                                    <tr key={p.id} className="border-b border-gray-100">
                                        <td className="py-3 pl-4 font-medium">{p.name}</td>
                                        <td className="py-3 capitalize">{p.category}</td>
                                        <td className="py-3">{p.brand || '-'}</td>
                                        <td className="py-3">{p.inv_variants?.length || 0}</td>
                                        <td className="py-3">
                                            <span className={`font-semibold ${totalStock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                {totalStock}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
