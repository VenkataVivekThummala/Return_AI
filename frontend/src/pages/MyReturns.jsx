import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { returnsService } from '../services/returns';
import { Card, Table, StatusBadge, LoadingScreen, Alert, Button } from '../components/UI';
import { formatDate, formatReason, getErrorMessage } from '../utils/helpers';
import { PlusCircle, ChevronRight, Inbox } from 'lucide-react';

export default function MyReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    returnsService.myReturns()
      .then(r => setReturns(r.data))
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Your Returns</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">{returns.length} total return requests</p>
        </div>
        <Link to="/customer/create-return">
          <Button icon={PlusCircle}>New Return Request</Button>
        </Link>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <Card>
        {returns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-slate-50/50 rounded-2xl">
            <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
              <Inbox className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-medium text-slate-500">No returns found</p>
            <Link to="/customer/create-return">
              <Button variant="secondary" size="sm">Create your first return</Button>
            </Link>
          </div>
        ) : (
          <Table headers={['Order ID', 'Product', 'Reason', 'Status', 'Date', '']}>
            {returns.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                    #{r.order_id}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900 max-w-[200px] truncate">
                  {r.product_name}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatReason(r.return_reason)}</td>
                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
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
