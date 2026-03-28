import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Sparkles, ArrowRight, UserPlus } from 'lucide-react';
import { Alert, Spinner } from '../components/UI';
import { getErrorMessage } from '../utils/helpers';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/customer/dashboard'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill all fields.'); return; }
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password, 'customer');
      navigate('/customer/dashboard');
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
            <span className="text-xs font-medium text-indigo-600">Join as a Customer</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {/* Header explicitly for Register */}
          <div className="flex border-b border-slate-100">
            <div className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-brand-700 bg-brand-50/50">
              <UserPlus className="w-4 h-4" />
              Customer Registration
            </div>
          </div>

          {/* Form */}
          <div className="p-7">
            <div className="mb-5">
              <h2 className="font-display font-bold text-slate-900 text-lg">Create an Account</h2>
              <p className="text-xs text-slate-400 mt-0.5">Submit and track your return requests easily.</p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-brand-400 transition-colors"
                  autoComplete="name"
                />
              </div>

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
                    autoComplete="new-password"
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
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
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
