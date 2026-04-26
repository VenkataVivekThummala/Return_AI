import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignedPickups } from '../services/delivery';
import { Package, MapPin, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DeliveryDashboard() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      const data = await getAssignedPickups();
      setPickups(data);
    } catch (error) {
      console.error('Failed to load pickups', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-blue-100 text-blue-800 border-blue-200',
      picked: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };
    return `px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${badges[status] || badges.pending}`;
  };

  const getStatusIcon = (status) => {
    if (status === 'picked') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Assigned Pickups</h1>
          <p className="text-slate-500 mt-2">Manage your active return pickups</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total</span>
          <span className="ml-3 text-2xl font-bold text-blue-600">{pickups.length}</span>
        </div>
      </div>

      {pickups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-700">No pickups assigned</h3>
          <p className="text-slate-500 mt-2">You currently have no return pickups assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pickups.map((pickup) => (
            <div 
              key={pickup.id} 
              onClick={() => navigate(`/delivery/return/${pickup.id}`)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className={getStatusBadge(pickup.pickup_status)}>
                    {pickup.pickup_status}
                  </span>
                  {getStatusIcon(pickup.pickup_status)}
                </div>
                <span className="text-sm text-slate-400 font-medium font-mono">#{pickup.order_id}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {pickup.product_name}
              </h3>
              
              <div className="space-y-3 mt-4">
                {/* Address removed as per requirements */}
                
                <div className="flex items-center space-x-3 text-sm text-slate-600">
                  <Package className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="capitalize">{pickup.return_reason.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Assigned: {new Date(pickup.assigned_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                    {pickup.customer_name.substring(0, 2)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{pickup.customer_name}</span>
                </div>
                
                <span className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
