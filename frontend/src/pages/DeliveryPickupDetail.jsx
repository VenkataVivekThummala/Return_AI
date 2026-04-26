import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignedPickups, updatePickupStatus } from '../services/delivery';
import { ArrowLeft, Check, Camera, X, AlertTriangle } from 'lucide-react';

export default function DeliveryPickupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureReason, setFailureReason] = useState('');

  useEffect(() => {
    fetchPickup();
  }, [id]);

  const fetchPickup = async () => {
    try {
      const data = await getAssignedPickups();
      const found = data.find(p => p.id === parseInt(id));
      if (found) setPickup(found);
    } catch (error) {
      console.error('Failed to load pickup', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status, reason = '') => {
    setActionLoading(true);
    try {
      const updated = await updatePickupStatus(id, status, reason);
      setPickup(updated);
      setShowFailureModal(false);
      // Image upload logically removed as per requirements
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(false);
      setActionLoading(false);
    }
  };

  if (loading || !pickup) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const customerImage = pickup.customer_uploaded_images?.[0]?.image_url;
  const referenceImage = pickup.system_reference_images?.[0]?.image_url;
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/delivery/dashboard')}
        className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-800">Return #{pickup.order_id}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${
              pickup.pickup_status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
              pickup.pickup_status === 'accepted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              pickup.pickup_status === 'picked' ? 'bg-green-100 text-green-800 border-green-200' :
              'bg-red-100 text-red-800 border-red-200'
            }`}>
              {pickup.pickup_status}
            </span>
          </div>
          <p className="text-slate-500 text-lg">{pickup.product_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Images Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Verification Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Customer Upload</h3>
                <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group relative">
                  {customerImage ? (
                    <img src={customerImage} alt="Customer return" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Click to zoom</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Reference Image</h3>
                <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group relative">
                  {referenceImage ? (
                    <img src={referenceImage} alt="System reference" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Reference</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Proof Upload removed as per requirements */}
        </div>

        {/* Sidebar Info & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Customer Info</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Name</label>
                <p className="font-medium text-slate-800">{pickup.customer_name}</p>
              </div>
              {/* Address removed as per requirements */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Return Reason</label>
                <p className="font-medium text-slate-800 capitalize">{pickup.return_reason.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-800 mb-4 uppercase text-sm tracking-wider">Pickup Actions</h3>
            
            {pickup.pickup_status === 'pending' && (
               <button 
                onClick={() => handleStatusUpdate('accepted')}
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
              >
                {actionLoading ? 'Processing...' : 'Accept Pickup Request'}
              </button>
            )}

            {pickup.pickup_status === 'accepted' && (
                <button 
                  onClick={() => handleStatusUpdate('picked')}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {actionLoading ? 'Saving...' : 'Mark as Picked'}
                </button>
            )}

            {(pickup.pickup_status === 'pending' || pickup.pickup_status === 'accepted') && (
                <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
                  <button
                    onClick={() => handleStatusUpdate('failed', 'Different Product Received')}
                    disabled={actionLoading}
                    className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center border border-orange-200"
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Different Product Received
                  </button>
                  <button 
                    onClick={() => setShowFailureModal(true)}
                    className="w-full bg-white border-2 border-slate-200 hover:border-red-600 hover:text-red-600 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Other Failure Reason
                  </button>
                </div>
            )}

            {pickup.pickup_status === 'failed' && (
              <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
                <div className="flex items-center mb-2 font-bold">
                  <AlertTriangle className="w-5 h-5 mr-2" /> Failed Pickup
                </div>
                <p className="text-sm">{pickup.failure_reason}</p>
              </div>
            )}
            
            {pickup.pickup_status === 'picked' && (
               <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex items-center justify-center font-bold">
               <Check className="w-5 h-5 mr-2" /> Pickup Complete
             </div>
            )}
          </div>
        </div>
      </div>

      {/* Failure Modal */}
      {showFailureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Report Failure</h3>
              <p className="text-slate-500 text-sm mb-4">Please provide a reason why this pickup could not be completed.</p>
              
              <textarea
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="e.g., Customer unavailable, address incorrect..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none h-32 mb-4"
              />
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowFailureModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleStatusUpdate('failed', failureReason)}
                  disabled={!failureReason.trim() || actionLoading}
                  className="px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                >
                  Submit Failure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
