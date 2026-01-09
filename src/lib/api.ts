import { supabase } from './supabase';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface DashboardMetrics {
    revenue: number;
    costs: number;
    profit: number;
    outstanding: number;
    activeCases: number;
    lateCases: number;
    deliveredMonth: number;
    avgTurnaround: number;
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
    const now = new Date();
    const startMonth = startOfMonth(now).toISOString();
    const endMonth = endOfMonth(now).toISOString();

    // 1. Revenue (Current Month)
    const { data: revenueData } = await supabase
        .from('invoices')
        .select('total_egp')
        .neq('status', 'void')
        .gte('issued_at', startMonth)
        .lte('issued_at', endMonth);

    const revenue = revenueData?.reduce((sum, inv) => sum + (inv.total_egp || 0), 0) || 0;

    // 2. Costs (Approximate for demo - fetching limited for performance)
    // In a real app, you'd want optimized RPC or aggregated views.
    // For now, we'll implement the "Outstanding" and "Revenue" first as they are simpler.

    // Outstanding Invoices
    const { data: outstandingData } = await supabase
        .from('invoices')
        .select('total_egp')
        .eq('status', 'pending');

    const outstanding = outstandingData?.reduce((sum, inv) => sum + (inv.total_egp || 0), 0) || 0;

    // Active Cases
    const { count: activeCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .not('stage', 'in', '("delivered","completed","cancelled")');

    // Late Cases
    // Supabase filter for date < now is lt
    const { count: lateCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .lt('due_date', now.toISOString())
        .not('stage', 'in', '("delivered","completed","cancelled")');

    // Delivered This Month
    const { count: deliveredMonth } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .in('stage', ['delivered', 'completed'])
        .gte('updated_at', startMonth)
        .lte('updated_at', endMonth);

    // Costs (Mocked/Simplified for now as complex joins might be heavy on client)
    const costs = revenue * 0.4; // Placeholder until complex query implemented

    return {
        revenue,
        costs,
        profit: revenue - costs,
        outstanding,
        activeCases: activeCases || 0,
        lateCases: lateCases || 0,
        deliveredMonth: deliveredMonth || 0,
        avgTurnaround: 3.5, // Placeholder
    };
};

export const fetchRevenueTrend = async () => {
    const startDate = subMonths(new Date(), 6).toISOString();
    const { data } = await supabase
        .from('invoices')
        .select('issued_at, total_egp')
        .neq('status', 'void')
        .gte('issued_at', startDate)
        .order('issued_at');

    // Client-side aggregation
    const trend = new Map<string, number>();
    data?.forEach(inv => {
        const month = format(new Date(inv.issued_at), 'MMM yyyy');
        trend.set(month, (trend.get(month) || 0) + (inv.total_egp || 0));
    });

    return Array.from(trend.entries()).map(([month, revenue]) => ({ month, revenue }));
};

export const fetchLateCases = async () => {
    const { data } = await supabase
        .from('cases')
        .select(`
      case_code,
      patient_name,
      due_date,
      stage,
      doctors ( full_name )
    `)
        .lt('due_date', new Date().toISOString())
        .not('stage', 'in', '("delivered","completed","cancelled")')
        .order('due_date')
        .limit(10);

    return data || [];
};

// --- Finance Module API ---

export interface FinanceMetrics {
    totalRevenue: number;
    outstanding: number;
    collectedMonth: number;
    expensesMonth: number;
}

export const fetchFinanceMetrics = async (): Promise<FinanceMetrics> => {
    const now = new Date();
    const startMonth = startOfMonth(now).toISOString();
    const endMonth = endOfMonth(now).toISOString();

    // Total Revenue (All Time)
    const { data: revenueData } = await supabase
        .from('invoices')
        .select('total_egp')
        .neq('status', 'void');
    const totalRevenue = revenueData?.reduce((sum, i) => sum + (i.total_egp || 0), 0) || 0;

    // Outstanding
    const { data: outstandingData } = await supabase
        .from('invoices')
        .select('total_egp')
        .eq('status', 'pending');
    const outstanding = outstandingData?.reduce((sum, i) => sum + (i.total_egp || 0), 0) || 0;

    // Collected This Month
    const { data: collectedData } = await supabase
        .from('invoices')
        .select('total_egp')
        .in('status', ['paid', 'collected'])
        .gte('updated_at', startMonth)
        .lte('updated_at', endMonth);
    const collectedMonth = collectedData?.reduce((sum, i) => sum + (i.total_egp || 0), 0) || 0;

    // Expenses This Month
    const { data: expensesData } = await supabase
        .from('fin_expenses')
        .select('amount_egp')
        .gte('expense_date', startMonth)
        .lte('expense_date', endMonth);
    const expensesMonth = expensesData?.reduce((sum, i) => sum + (i.amount_egp || 0), 0) || 0;

    return { totalRevenue, outstanding, collectedMonth, expensesMonth };
};

export const fetchInvoices = async (filters?: { status?: string, doctorId?: string, startDate?: string, endDate?: string }) => {
    let query = supabase
        .from('invoices')
        .select(`
      id,
      total_egp,
      status,
      issued_at,
      pdf_url,
      cases (
        case_code,
        patient_name,
        due_date,
        doctors ( id, full_name )
      )
    `)
        .order('issued_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
        query = query.gte('issued_at', filters.startDate);
    }

    if (filters?.endDate) {
        query = query.lte('issued_at', filters.endDate);
    }

    // Doctor filter needs to be applied, but nested filtering in Supabase JS requires inner join filtering
    // For simplicity, we'll filter on the client if it's too complex, OR use the !inner hint.
    // Let's try to filter by cases.doctor_id if needed, but invoices doesn't have doctor_id directly.
    // A correct way: .eq('cases.doctor_id', doctorId) won't work easily without proper foreign key setup for filtering.
    // We will filter client side for specific doctor in this MVP step or just skip if complex.
    // Let's stick to status/date only for now as requested by "Implement Filters" unless doctor is critical.
    // User asked for "Doctor" filter. I'll add "doctors" fetch to populate the dropdown first.

    const { data } = await query.limit(50);

    // Client side doctor filter if needed
    if (filters?.doctorId && data) {
        return data.filter((inv: any) => inv.cases?.doctors?.id === filters.doctorId);
    }

    return data || [];
};

export const fetchDoctors = async () => {
    const { data } = await supabase
        .from('doctors')
        .select('id, full_name')
        .order('full_name');
    return data || [];
};

export const fetchCollectionRate = async () => {
    const { data } = await supabase
        .from('invoices')
        .select('status, total_egp')
        .in('status', ['pending', 'paid', 'collected']);

    const rates = new Map<string, number>();
    data?.forEach(i => {
        rates.set(i.status, (rates.get(i.status) || 0) + (i.total_egp || 0));
    });

    return Array.from(rates.entries()).map(([name, value]) => ({ name, value }));
};

export const fetchRevenueByDoctor = async () => {
    // Note: This involves joining invoices -> cases -> doctors.
    // Doing client-side aggregation for simplicity in this demo without RPC
    const { data } = await supabase
        .from('invoices')
        .select(`
      total_egp,
      cases (
        doctors ( full_name )
      )
    `)
        .neq('status', 'void');

    const doctorRevenue = new Map<string, number>();

    data?.forEach(inv => {
        // @ts-ignore - Supabase types might be deep
        const doctorName = inv.cases?.doctors?.full_name || 'Unknown';
        doctorRevenue.set(doctorName, (doctorRevenue.get(doctorName) || 0) + (inv.total_egp || 0));
    });

    return Array.from(doctorRevenue.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
};

// --- Cases Module API ---

export const fetchCases = async (filters?: { stage?: string, doctorId?: string, search?: string }) => {
    let query = supabase
        .from('cases')
        .select(`
      *,
      doctors ( full_name )
    `)
        .order('created_at', { ascending: false });

    if (filters?.stage && filters.stage !== 'all') {
        query = query.eq('stage', filters.stage);
    }

    if (filters?.search) {
        // Simple search on patient name or case code
        query = query.or(`patient_name.ilike.%${filters.search}%,case_code.ilike.%${filters.search}%`);
    }

    const { data } = await query.limit(50);

    if (filters?.doctorId && data) {
        return data.filter((item: any) => item.doctors?.id === filters.doctorId);
    }

    return data || [];
};

// --- Inventory Module API ---

export const fetchInventory = async () => {
    // Focus on Materials (inv_products) and stock
    const { data } = await supabase
        .from('inv_products')
        .select(`
      *,
      inv_variants (
         *,
         inv_stock_moves ( quantity )
      )
    `);

    return data || [];
};

// --- Doctors Module API ---

export const fetchDoctorsFull = async () => {
    // Determine stats for each doctor
    // This is expensive client-side aggregation, but fine for MVP
    const { data: doctors } = await supabase.from('doctors').select('*');
    const { data: cases } = await supabase.from('cases').select('doctor_id, total_amount');

    // Aggregate
    const stats = doctors?.map(doc => {
        const docCases = cases?.filter(c => c.doctor_id === doc.id) || [];
        const totalCases = docCases.length;
        const totalRevenue = docCases.reduce((sum, c) => sum + (c.total_amount || 0), 0);
        return { ...doc, totalCases, totalRevenue };
    });

    return stats || [];
};
