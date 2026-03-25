import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { returnsService } from '../services/returns';
import {
  Card, StatusBadge, LoadingScreen, Alert, Button,
} from '../components/UI';
import { formatDate, formatReason, getErrorMessage } from '../utils/helpers';
import {
  ArrowLeft, Package, FileText,
  Image as ImageIcon, ExternalLink,
} from 'lucide-react';

export default function CustomerReturnStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    returnsService.getReturn(id)
      .then(r => setData(r.data))
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Alert type="error" message={error} />
    </div>
  );
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>Back</Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Return Request #{data.order_id}
          </h1>
          <p className="text-sm text-slate-500 font-medium">Submitted {formatDate(data.created_at)}</p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Product Info */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Package className="w-5 h-5 text-indigo-500" />
          <h2 className="font-semibold text-slate-800 text-lg">Product Details</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {[
            { label: 'System ID', value: `#${data.id}`, mono: true },
            { label: 'Order ID', value: `#${data.order_id}`, mono: true },
            { label: 'Product Name', value: data.product_name },
            { label: 'Return Reason', value: formatReason(data.return_reason) },
            { label: 'Delivery Date', value: formatDate(data.delivery_date) },
            { label: 'Status', value: <StatusBadge status={data.status} /> },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
              {typeof value === 'string'
                ? <p className={`text-base font-semibold text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
                : value
              }
            </div>
          ))}
        </div>
        {data.description && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">Description provided</p>
            </div>
            <p className="text-base text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {data.description}
            </p>
          </div>
        )}
      </Card>

      {/* Images */}
      {data.images?.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <ImageIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-slate-800 text-lg">Submitted Images</h2>
            <span className="ml-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {data.images.length}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.images.map((img, i) => (
              <div
                key={img.id}
                className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-50 cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all"
                onClick={() => setLightbox(img.image_url)}
              >
                <img src={img.image_url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Full size" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl cursor-default" onClick={e => e.stopPropagation()}/>
        </div>
      )}
    </div>
  );
}
