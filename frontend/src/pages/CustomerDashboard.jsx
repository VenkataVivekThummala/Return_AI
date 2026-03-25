import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { returnsService } from '../services/returns';
import {
  Card, StatCard, Table, StatusBadge,
  LoadingScreen, Alert, Button,
} from '../components/UI';
import { formatDate, formatReason, getErrorMessage } from '../utils/helpers';
import {
  PlusCircle, Package, Clock, CheckCircle, XCircle,
  ChevronRight, Inbox,
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    returnsService.myReturns()
      .then(r => setReturns(r.data))
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading your returns..." />;

  const counts = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    accepted: returns.filter(r => r.status === 'accepted').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage your product returns below</p>
        </div>
        <Link to="/customer/create-return">
          <Button icon={PlusCircle} size="md">New Return Request</Button>
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Returns" value={counts.total} color="brand" />
        <StatCard icon={Clock} label="Pending Review" value={counts.pending} color="slate" />
        <StatCard icon={CheckCircle} label="Accepted" value={counts.accepted} color="green" />
        <StatCard icon={XCircle} label="Rejected" value={counts.rejected} color="red" />
      </div>

      {/* Table */}
      <Card>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
          <h2 className="font-display font-semibold text-slate-900 text-lg">Your Return History</h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {returns.length} orders
          </span>
        </div>

        {returns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <div className="p-4 bg-slate-50 rounded-full">
              <Inbox className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-medium text-slate-500">No return requests yet</p>
            <Link to="/customer/create-return">
              <Button variant="secondary" size="sm" icon={PlusCircle}>Start a new return</Button>
            </Link>
          </div>
        ) : (
          <Table headers={['Order ID', 'Product', 'Reason', 'Status', 'Submitted', '']}>
            {returns.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                    #{r.order_id}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 max-w-[200px] truncate">
                  {r.product_name}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatReason(r.return_reason)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">{formatDate(r.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/customer/return/${r.id}`}
                    className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group-hover:text-indigo-500"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
