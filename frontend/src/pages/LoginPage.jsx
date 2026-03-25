import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Sparkles, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import { Alert, Spinner } from '../components/UI';
import { getErrorMessage } from '../utils/helpers';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('customer'); // 'customer' | 'manager'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/customer/dashboard'} replace />;

  const demoAccounts = {
    customer: { email: 'customer@demo.com', password: 'demo123' },
    manager: { email: 'manager@demo.com', password: 'demo123' },
  };

  const fillDemo = () => {
    setForm(demoAccounts[tab]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill all fields.'); return; }
    setLoading(true); setError('');
    try {
      const loggedUser = await login(form.email, form.password);
      if (tab === 'manager' && loggedUser.role !== 'manager') {
        setError('This account does not have manager access.');
        return;
      }
      if (tab === 'customer' && loggedUser.role !== 'customer') {
        setError('Please use the manager login tab.');
        return;
      }
      navigate(loggedUser.role === 'manager' ? '/manager/dashboard' : '/customer/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl shadow-lg shadow-brand-200 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">ReturnAI</h1>
          <p className="text-slate-500 text-sm mt-1">Intelligent Return Verification Platform</p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span className="text-xs font-medium text-indigo-600">ML-Powered Fraud Detection</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {/* Role tabs */}
          <div className="flex border-b border-slate-100">
            {[
              { key: 'customer', label: 'Customer', icon: UserCheck },
              { key: 'manager', label: 'Manager', icon: Briefcase },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError(''); setForm({ email: '', password: '' }); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all
                  ${tab === key
                    ? 'text-brand-700 border-b-2 border-brand-600 bg-brand-50/50'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-7">
            <div className="mb-5">
              <h2 className="font-display font-bold text-slate-900 text-lg">
                {tab === 'customer' ? 'Customer Login' : 'Manager Login'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {tab === 'customer'
                  ? 'Submit and track your return requests'
                  : 'Review and verify return requests'
                }
              </p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-brand-400 transition-colors"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-brand-400 transition-colors"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm shadow-brand-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Spinner size="sm" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Signing in...' : `Sign in as ${tab === 'customer' ? 'Customer' : 'Manager'}`}
              </button>
            </form>

            {/* Demo fill */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={fillDemo}
                className="w-full py-2 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors"
              >
                Fill demo credentials →
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Isolation Forest', sub: 'Anomaly Detection' },
            { label: 'CNN Analysis', sub: 'Image Verification' },
            { label: 'Risk Scoring', sub: 'Fraud Prevention' },
          ].map(({ label, sub }) => (
            <div key={label} className="bg-white/70 backdrop-blur rounded-xl p-3 border border-white text-center">
              <p className="text-xs font-bold text-slate-700">{label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
