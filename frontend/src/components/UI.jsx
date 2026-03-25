import React from 'react';
import { getStatusStyle } from '../utils/helpers';
import { AlertTriangle, TrendingUp, Shield, Eye } from 'lucide-react';

// ── Spinner ────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size];
  return (
    <div className={`${s} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin ${className}`} />
  );
};

// ── LoadingScreen ──────────────────────────────────────────────
export const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
    <Spinner size="lg" />
    <p className="text-slate-500 text-sm font-medium">{message}</p>
  </div>
);

// ── StatusBadge ────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const st = getStatusStyle(status);
  return (
    <span className={`badge ${st.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
      {st.label}
    </span>
  );
};

// ── PillBadge ──────────────────────────────────────────────────
export const PillBadge = ({ label, color }) => {
  const colors = {
    brand: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    slate: 'bg-slate-50 text-slate-700 border border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.slate}`}>
      {label}
    </span>
  );
};

// ── Alert ──────────────────────────────────────────────────────
export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm animate-fade-in ${styles[type]}`}>
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
      )}
    </div>
  );
};

// ── Card ───────────────────────────────────────────────────────
export const Card = ({ children, className = '', hover = false }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

// ── StatCard ───────────────────────────────────────────────────
export const StatCard = ({ icon: Icon, label, value, sub, color = 'brand', trend }) => {
  const colors = {
    brand: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl border border-white shadow-sm ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </Card>
  );
};

// ── Table ──────────────────────────────────────────────────────
export const Table = ({ headers, children, empty = 'No records found.' }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50">
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {children || (
          <tr>
            <td colSpan={headers.length} className="text-center py-12 text-slate-400">{empty}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// ── Button ─────────────────────────────────────────────────────
export const Button = ({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', loading = false, disabled = false, className = '', icon: Icon,
}) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 font-medium';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-sm border border-transparent',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${(disabled || loading) ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? <Spinner size="sm" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// ── FormField ──────────────────────────────────────────────────
export const FormField = ({ label, error, required, children, hint }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
      <span>{label} {required && <span className="text-red-500">*</span>}</span>
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {error}</p>}
    {hint && !error && <p className="text-slate-500 text-xs mt-1.5">{hint}</p>}
  </div>
);

// ── Input ──────────────────────────────────────────────────────
export const Input = ({ className = '', error, ...props }) => (
  <input
    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none
      ${error
        ? 'border-red-300 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
        : 'border-slate-200 bg-white text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300'
      } ${className}`}
    {...props}
  />
);

// ── Textarea ───────────────────────────────────────────────────
export const Textarea = ({ className = '', error, ...props }) => (
  <textarea
    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 outline-none resize-y min-h-[100px]
      ${error
        ? 'border-red-300 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
        : 'border-slate-200 bg-white text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300'
      } ${className}`}
    {...props}
  />
);

// ── Select ─────────────────────────────────────────────────────
export const Select = ({ className = '', error, children, ...props }) => (
  <select
    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none appearance-none bg-no-repeat bg-[center_right_1rem] bg-[length:1rem]
      ${error
        ? 'border-red-300 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
        : 'border-slate-200 bg-white text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300'
      } ${className}`}
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
    {...props}
  >
    {children}
  </select>
);
