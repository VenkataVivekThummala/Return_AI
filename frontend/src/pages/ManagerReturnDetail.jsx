import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { returnsService } from '../services/returns';
import {
  Card, StatusBadge, LoadingScreen, Alert, Button, PillBadge
} from '../components/UI';
import { formatDate, formatReason, getErrorMessage } from '../utils/helpers';
import {
  ArrowLeft, User, Package, Calendar, FileText,
  Brain, Image as ImageIcon, CheckCircle, XCircle,
  Clock, AlertTriangle, ExternalLink, ShieldAlert,
  PlayCircle, RefreshCcw, Box, Upload, Plus
} from 'lucide-react';

export default function ManagerReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [runMlLoading, setRunMlLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const fetchData = async () => {
    try {
      const r = await returnsService.getManagerReturn(id);
      setData(r.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setActionLoading(newStatus); setError(''); setActionSuccess('');
    try {
      const res = await returnsService.updateStatus(id, newStatus);
      setData(res.data);
      setActionSuccess(`Status updated to "${newStatus.replace('_', ' ')}"`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true); setError(''); setActionSuccess('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      await returnsService.uploadShippingImage(id, formData);
      setActionSuccess('Baseline image uploaded successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRunMl = async () => {
    setRunMlLoading(true); setError(''); setActionSuccess('');
    try {
      const res = await returnsService.runMl(id);
      setData(res.data);
      setActionSuccess('ML Pipeline executed successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunMlLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading detailed analysis..." />;
  if (!data) return <div className="p-8 text-center text-slate-400">Return request not found.</div>;

  const ml = data.ml_analysis || null;
  const custImages = data.images || [];
  const shipImages = data.shipping_images || [];

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-b border-slate-200/50 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)} className="hover:-translate-x-1 transition-transform">Back</Button>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Review Return <span className="text-slate-400 font-mono text-xl pt-1">#{data.id}</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Order <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">#{data.order_id}</span> · Submitted {formatDate(data.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <StatusBadge status={data.status} />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="shadow-sm" />}
      {actionSuccess && <Alert type="success" message={actionSuccess} className="shadow-sm" />}

      {/* Top 2 Panels: Customer Data (Left) vs Shipping Data (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL: Customer Submitted */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200/80 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-slate-900 text-lg">Customer Submission</h2>
                <p className="text-xs font-medium text-slate-500">Provided by {data.customer?.name}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 grid grid-cols-2 gap-4">
                <div>
                   <p className="text-xs font-medium text-slate-500 mb-1">Product</p>
                   <p className="text-sm font-semibold text-slate-800 line-clamp-2">{data.product_name}</p>
                </div>
                <div>
                   <p className="text-xs font-medium text-slate-500 mb-1">Reason</p>
                   <div className="inline-block px-2.5 py-1 bg-white border border-slate-200 rounded-md shadow-sm">
                      <p className="text-sm font-semibold text-slate-700 capitalize">{formatReason(data.return_reason)}</p>
                   </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Customer Description</p>
                  <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-sm leading-relaxed">{data.description}</p>
                </div>
              </div>

              {/* Customer Images */}
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" /> Uploaded Images ({custImages.length})
                </p>
                {custImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {custImages.map((img, i) => (
                      <div
                        key={img.id}
                        className="relative group rounded-xl overflow-hidden shadow-sm border border-slate-200 aspect-square bg-slate-100 cursor-pointer"
                        onClick={() => setLightbox(img.image_url)}
                      >
                        <img src={img.image_url} alt={`Customer upload ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center flex flex-col items-center">
                     <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                     <p className="text-sm font-medium text-slate-500">No images provided by customer</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL: Shipping / Fulfillment Baseline */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200/80 shadow-sm h-full bg-slate-50/50">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/60">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-slate-900 text-lg">Shipping Baseline</h2>
                <p className="text-xs font-medium text-slate-500">Images taken prior to dispatch</p>
              </div>
            </div>

            <div className="space-y-6">
               <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" /> Pre-Dispatch Images
                  </p>
                  {shipImages.length > 0 && (
                    <Button variant="secondary" size="sm" icon={Plus} onClick={() => fileInputRef.current?.click()} loading={uploadingImage} className="text-xs px-2 py-1">
                      Add Image
                    </Button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                
                {shipImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {shipImages.map((img, i) => (
                      <div
                        key={img.id}
                        className="relative group rounded-xl overflow-hidden shadow-sm border-2 border-indigo-100/50 aspect-[4/3] bg-white cursor-pointer"
                        onClick={() => setLightbox(img.image_url)}
                      >
                        <img src={img.image_url} alt={`Shipping capture ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
                          Baseline
                        </div>
                        <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-white rounded-2xl border-2 border-amber-100 border-dashed text-center flex flex-col items-center">
                     <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
                     <p className="text-sm font-bold text-slate-700">No Shipping Images Found</p>
                     <p className="text-xs font-medium text-slate-500 mt-1 max-w-[250px]">
                       Order <span className="font-mono">#{data.order_id}</span> has no baseline images on record.
                     </p>
                     <Button variant="secondary" className="mt-4" icon={Upload} loading={uploadingImage} onClick={() => fileInputRef.current?.click()}>
                       Upload Baseline Image
                     </Button>
                     <div className="mt-4 p-3 bg-amber-50 rounded-xl text-left border border-amber-100 w-full">
                       <p className="text-[11px] text-amber-800 font-medium">
                          <strong>Order ID Matching Rule:</strong> The ML Pipeline requires pre-dispatch shipping images linked to this specific Order ID to run Similarity and Damage Detection safely.
                       </p>
                     </div>
                  </div>
                )}
               </div>
            </div>
          </Card>
        </div>
      </div>

      {/* BOTTOM PANEL: ML Analysis Results */}
      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
               <Brain className="w-5 h-5" />
             </div>
             <div>
               <h2 className="font-display font-semibold text-white text-lg tracking-wide">AI Analysis Pipeline</h2>
               <p className="text-xs font-medium text-slate-400 mt-0.5">ResNet50 · YOLOv8 · Isolation Forest</p>
             </div>
          </div>
          <div>
            {!ml ? (
              <Button 
                onClick={handleRunMl} 
                loading={runMlLoading} 
                icon={PlayCircle} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/20"
              >
                Execute ML Pipeline
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                onClick={handleRunMl} 
                loading={runMlLoading} 
                icon={RefreshCcw}
                className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-slate-600"
              >
                Re-Run Analysis
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 bg-white">
          {!ml ? (
             <div className="text-center py-12">
                <Brain className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-700">Pipeline Not Executed</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Click the execute button above to run image similarity, damage detection, and customer behavior risk analysis.
                </p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Similarity Score */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">ResNet50 Similarity</p>
                {ml.similarity_score !== null ? (
                  <>
                    <div className="flex items-end gap-2 mb-2">
                       <span className="text-4xl font-display font-bold text-slate-900 tracking-tight">
                         {Math.round(ml.similarity_score * 100)}<span className="text-2xl text-slate-400">%</span>
                       </span>
                    </div>
                    <div className="inline-block px-2.5 py-1 bg-white border border-slate-200 rounded shadow-sm mb-3">
                       <span className="text-sm font-semibold text-indigo-700 capitalize">
                         {ml.similarity_prediction?.replace('_', ' ')}
                       </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${ml.similarity_score > 0.8 ? 'bg-emerald-500' : ml.similarity_score > 0.5 ? 'bg-amber-500' : 'bg-red-500'}`} 
                         style={{ width: `${ml.similarity_score * 100}%` }}
                       />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 h-full">
                    <AlertTriangle className="w-4 h-4" /> <span className="text-sm font-medium">Bypassed (Missing Baseline)</span>
                  </div>
                )}
              </div>

              {/* Damage Detection */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">YOLOv8 Damage</p>
                {ml.damage_level ? (
                  <>
                    <div className="mb-3">
                      <PillBadge 
                        label={ml.damage_level} 
                        color={ml.damage_level === 'Severe' ? 'red' : ml.damage_level === 'Minor' ? 'amber' : 'green'} 
                      />
                    </div>
                    {ml.damage_probability && (
                      <div className="mt-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                        <p className="text-sm font-mono font-medium text-slate-700">{Math.round(ml.damage_probability * 100)}%</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 h-full">
                    <AlertTriangle className="w-4 h-4" /> <span className="text-sm font-medium">Bypassed (Missing Baseline)</span>
                  </div>
                )}
              </div>

              {/* Customer Behavior Risk */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Isolation Forest Risk</p>
                  <ShieldAlert className={`w-5 h-5 ${ml.customer_risk_score > 0.7 ? 'text-purple-500' : 'text-slate-300'}`} />
                </div>
                
                <div className="flex items-center gap-6">
                  <div>
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-display font-bold tracking-tight ${ml.customer_risk_score > 0.75 ? 'text-purple-600' : ml.customer_risk_score > 0.5 ? 'text-red-500' : ml.customer_risk_score > 0.25 ? 'text-amber-500' : 'text-emerald-500'}`}>
                         {Math.round(ml.customer_risk_score * 100)}
                      </span>
                      <span className="text-lg text-slate-400 font-bold mb-1">/ 100</span>
                    </div>
                  </div>
                  
                  {ml.risk_factors && ml.risk_factors.length > 0 && (
                     <div className="flex-1 pl-6 border-l border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Drivers</p>
                        <ul className="space-y-1.5">
                          {ml.risk_factors.slice(0, 2).map((f, i) => (
                             <li key={i} className="text-xs font-medium text-slate-700 flex items-start gap-1.5">
                               <span className="text-amber-500 flex-shrink-0">•</span> {f}
                             </li>
                          ))}
                        </ul>
                     </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </Card>

      {/* FINAL ROW: Manager Evaluation Actions */}
      <Card className="p-6 border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <Calendar className="w-5 h-5 text-slate-400" />
             <div>
               <h3 className="text-base font-bold text-slate-900 tracking-tight">Final Decision</h3>
               <p className="text-xs font-medium text-slate-500 mt-0.5">Authorize or reject based on AI analysis.</p>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              className="px-6 py-2.5 font-bold"
              icon={Clock}
              loading={actionLoading === 'under_review'}
              disabled={data.status === 'under_review'}
              onClick={() => updateStatus('under_review')}
            >
              Under Review
            </Button>
            <Button
              variant="danger"
              className="px-6 py-2.5 font-bold"
              icon={XCircle}
              loading={actionLoading === 'rejected'}
              disabled={data.status === 'rejected'}
              onClick={() => updateStatus('rejected')}
            >
              Reject
            </Button>
             <Button
              variant="success"
              className="px-8 py-2.5 font-bold border-0 shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-500 text-white"
              icon={CheckCircle}
              loading={actionLoading === 'accepted'}
              disabled={data.status === 'accepted'}
              onClick={() => updateStatus('accepted')}
            >
              Accept Return
            </Button>
          </div>
        </div>
      </Card>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
             <img src={lightbox} alt="Full size view" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
             <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-md">
                Click anywhere to close
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
