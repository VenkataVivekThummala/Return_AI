import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { returnsService } from '../services/returns';
import {
  Card, StatCard, Table, StatusBadge, PillBadge,
  LoadingScreen, Alert, Button,
} from '../components/UI';
import { formatDate, getErrorMessage } from '../utils/helpers';
import {
  Package, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronRight, Search, Filter, TrendingUp, BarChart3,
  Shield, FileSearch
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

  export default function ManagerDashboard() {
  const [data, setData] = useState({ returns: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (riskFilter) params.risk_level = riskFilter;

    returnsService.allReturns(params)
      .then(r => setData(r.data))
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [statusFilter, riskFilter]);

  if (loading) return <LoadingScreen message="Loading ML analysis dashboard..." />;

  const { returns, stats } = data;
  const filtered = returns.filter(r =>
    !search ||
    r.order_id.toLowerCase().includes(search.toLowerCase()) ||
    r.product_name.toLowerCase().includes(search.toLowerCase()) ||
    r.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  // Chart data
  const pieData = [
    { name: 'Pending', value: stats.pending || 0, color: '#94a3b8' },
    { name: 'Under Review', value: stats.under_review || 0, color: '#f59e0b' },
    { name: 'Accepted', value: stats.accepted || 0, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const riskDist = [
    { label: 'Low (<30%)', count: returns.filter(r => r.ml_analysis?.customer_risk_score < 0.3).length, fill: '#10b981' },
    { label: 'Med', count: returns.filter(r => r.ml_analysis?.customer_risk_score >= 0.3 && r.ml_analysis?.customer_risk_score < 0.55).length, fill: '#f59e0b' },
    { label: 'High', count: returns.filter(r => r.ml_analysis?.customer_risk_score >= 0.55 && r.ml_analysis?.customer_risk_score < 0.75).length, fill: '#ef4444' },
    { label: 'Crit', count: returns.filter(r => r.ml_analysis?.customer_risk_score >= 0.75).length, fill: '#7c3aed' },
  ];

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Manager Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">AI-powered return request analysis & operations</p>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="col-span-2 sm:col-span-4 lg:col-span-1">
          <StatCard icon={Package} label="Total Requests" value={stats.total || 0} color="brand" sub={`${stats.high_risk || 0} flagged high risk`} />
        </div>
        <StatCard icon={Clock} label="Pending ML" value={stats.pending || 0} color="slate" />
        <StatCard icon={FileSearch} label="Under Review" value={stats.under_review || 0} color="amber" />
        <StatCard icon={CheckCircle} label="Accepted" value={stats.accepted || 0} color="green" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected || 0} color="red" />
      </div>

      {/* Charts row */}
      {returns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800 text-base">Customer Risk Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={riskDist} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {riskDist.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800 text-base">Current Status Breakdown</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 500, color: '#475569' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 bg-white/50 backdrop-blur-sm border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID, product, or customer name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white shadow-sm transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white shadow-sm transition-all"
            >
              <option value="">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
          <h2 className="font-display font-semibold text-slate-900 text-lg">Return Queue</h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
            {filtered.length} matches
          </span>
        </div>

        <Table
          headers={['ID', 'Customer', 'Order ID', 'Product', 'Cust. Risk', 'Similarity', 'Damage', 'Prediction', 'Status', 'Review']}
          empty="No return requests match your criteria."
        >
          {filtered.length > 0 && filtered.map(r => {
            const ml = r.ml_analysis || {};
            const custRiskPcnt = Math.round((ml.customer_risk_score || 0) * 100);
            const simPcnt = ml.similarity_score !== null ? Math.round(ml.similarity_score * 100) : null;
            
            return (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                <td className="px-6 py-4 text-xs font-mono font-medium text-slate-400">#{r.id}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-800">{r.customer_name}</p>
                  <p className="text-xs font-medium text-slate-500">{r.customer_email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 shadow-sm px-2.5 py-1 rounded-md">
                    #{r.order_id}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-700 max-w-[150px] truncate" title={r.product_name}>{r.product_name}</td>
                
                {/* Customer Risk */}
                <td className="px-6 py-4 text-center">
                  {ml.customer_risk_score !== null && ml.customer_risk_score !== undefined ? (
                    <div className="flex flex-col items-center">
                      <span className={`text-xs font-mono font-bold ${custRiskPcnt > 75 ? 'text-purple-600' : custRiskPcnt > 50 ? 'text-red-500' : custRiskPcnt > 25 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {custRiskPcnt}%
                      </span>
                    </div>
                  ) : <span className="text-xs text-slate-400">—</span>}
                </td>

                {/* Similarity */}
                <td className="px-6 py-4 text-center">
                   {simPcnt !== null ? (
                    <PillBadge 
                      label={`${simPcnt}%`} 
                      color={simPcnt > 80 ? 'green' : simPcnt > 50 ? 'amber' : 'red'} 
                    />
                  ) : <span className="text-xs text-slate-400">—</span>}
                </td>

                {/* Damage */}
                <td className="px-6 py-4 text-center">
                  {ml.damage_level ? (
                    <PillBadge 
                      label={ml.damage_level} 
                      color={ml.damage_level === 'Severe' ? 'red' : ml.damage_level === 'Minor' ? 'amber' : 'green'} 
                    />
                  ) : <span className="text-xs text-slate-400">—</span>}
                </td>

                {/* Prediction */}
                <td className="px-6 py-4 text-center">
                   {ml.similarity_prediction ? (
                     <span className="text-xs font-semibold text-slate-600">{ml.similarity_prediction.replace('_', ' ')}</span>
                   ) : <span className="text-xs text-slate-400">—</span>}
                </td>

                <td className="px-6 py-4 text-center"><StatusBadge status={r.status} /></td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/manager/return/${r.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 shadow-sm px-3 py-1.5 rounded-lg transition-all active:scale-95"
                  >
                    Review <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
