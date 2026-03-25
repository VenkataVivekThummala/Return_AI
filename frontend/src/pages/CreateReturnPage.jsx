import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { returnsService } from '../services/returns';
import {
  Card, Alert, Button, FormField, Input, Select, Textarea,
} from '../components/UI';
import { getErrorMessage } from '../utils/helpers';
import {
  Upload, X, Image as ImageIcon, CheckCircle2,
  PackageOpen, Send,
} from 'lucide-react';

export default function CreateReturnPage() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({
    order_id: '',
    product_name: '',
    delivery_date: '',
    return_reason: '',
    description: '',
  });
  const [images, setImages] = useState([]); // { file, preview, name }
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.order_id.trim()) e.order_id = 'Order ID is required';
    if (!form.product_name.trim()) e.product_name = 'Product name is required';
    if (!form.delivery_date) e.delivery_date = 'Delivery date is required';
    else if (new Date(form.delivery_date) > new Date()) e.delivery_date = 'Date cannot be in the future';
    if (!form.return_reason) e.return_reason = 'Please select a reason';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 10) e.description = 'Please provide more detail (min 10 chars)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addImages = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newImgs = valid.slice(0, 5 - images.length).map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages(p => [...p, ...newImgs]);
  };

  const removeImage = (i) => {
    URL.revokeObjectURL(images[i].preview);
    setImages(p => p.filter((_, idx) => idx !== i));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    addImages(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true); setApiError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img.file));
      const res = await returnsService.createReturn(fd);
      setSubmitted(res.data);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 animate-slide-up">
        <Card className="p-8 text-center border-emerald-100 shadow-emerald-100/50">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Request Submitted!</h2>
          <p className="text-slate-500 text-base mt-2 mb-8 font-medium">
            Your return request has been successfully created.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-3 mb-8 border border-slate-100">
            <div className="flex justify-between text-sm py-1 border-b border-slate-200/60 pb-3">
              <span className="text-slate-500 font-medium">Return ID</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">#{submitted.id}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="font-semibold capitalize text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">Pending Review</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 py-2.5" onClick={() => navigate('/customer/my-returns')}>
              View My Returns
            </Button>
            <Button className="flex-1 py-2.5" onClick={() => {
              setSubmitted(null);
              setForm({ order_id: '', product_name: '', delivery_date: '', return_reason: '', description: '' });
              setImages([]);
            }}>
              Start New Return
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200/50 pb-6">
        <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm">
          <PackageOpen className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Create Return Request</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Fill in the details below to start your product return</p>
        </div>
      </div>

      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} className="mb-6 shadow-sm" />}

      <form onSubmit={handleSubmit}>
        <Card className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Order ID" error={errors.order_id} required>
              <Input
                value={form.order_id}
                onChange={e => set('order_id', e.target.value)}
                placeholder="e.g. ORD-2024-8821"
                error={errors.order_id}
              />
            </FormField>
            <FormField label="Product Name" error={errors.product_name} required>
              <Input
                value={form.product_name}
                onChange={e => set('product_name', e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 Headphones"
                error={errors.product_name}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Delivery Date" error={errors.delivery_date} required hint="When did you receive the item?">
              <Input
                type="date"
                value={form.delivery_date}
                onChange={e => set('delivery_date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                error={errors.delivery_date}
              />
            </FormField>
            <FormField label="Return Reason" error={errors.return_reason} required>
              <Select
                value={form.return_reason}
                onChange={e => set('return_reason', e.target.value)}
                error={errors.return_reason}
              >
                <option value="">Select a reason...</option>
                <option value="delivery_damaged">Delivery Damaged</option>
                <option value="not_working">Not Working</option>
                <option value="wrong_item">Wrong Item Received</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Description" error={errors.description} required hint="Describe the issue in detail for faster processing">
            <Textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Please describe the issue with the product in detail..."
              rows={4}
              error={errors.description}
            />
          </FormField>

          {/* Image Upload */}
          <FormField label="Product Images" hint={`Upload up to 5 images. ${images.length}/5 uploaded.`}>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => images.length < 5 && fileRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ease-out
                ${dragOver ? 'border-indigo-400 bg-indigo-50/50 scale-[0.99]' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}
                ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-3">
                <Upload className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {dragOver ? 'Drop images here' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">PNG, JPG, WEBP formats supported</p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => addImages(e.target.files)}
              />
            </div>

            {/* Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-square bg-slate-50">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeImage(i); }}
                        className="p-1.5 bg-white rounded-full hover:scale-110 transition-transform shadow-sm"
                      >
                        <X className="w-4 h-4 text-slate-700" />
                      </button>
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 bg-black/50 p-1 rounded backdrop-blur-sm">
                      <ImageIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FormField>
        </Card>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-end">
          <Button variant="secondary" className="w-full sm:w-auto px-6" onClick={() => navigate(-1)} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={submitting} className="w-full sm:w-auto px-8" icon={Send}>
            {submitting ? 'Submitting...' : 'Submit Return'}
          </Button>
        </div>
      </form>
    </div>
  );
}
