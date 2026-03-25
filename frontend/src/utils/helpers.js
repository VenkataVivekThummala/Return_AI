export const getRiskColor = (score) => {
  if (score < 0.3) return { text: 'text-emerald-600', bg: 'bg-emerald-100', bar: 'bg-emerald-500', label: 'LOW' };
  if (score < 0.55) return { text: 'text-amber-600', bg: 'bg-amber-100', bar: 'bg-amber-500', label: 'MEDIUM' };
  if (score < 0.75) return { text: 'text-red-600', bg: 'bg-red-100', bar: 'bg-red-500', label: 'HIGH' };
  return { text: 'text-purple-600', bg: 'bg-purple-100', bar: 'bg-purple-600', label: 'CRITICAL' };
};

export const getStatusStyle = (status) => {
  const map = {
    pending: { badge: 'badge-pending', dot: 'bg-slate-400', label: 'Pending' },
    under_review: { badge: 'badge-under_review', dot: 'bg-amber-500', label: 'Under Review' },
    accepted: { badge: 'badge-accepted', dot: 'bg-emerald-500', label: 'Accepted' },
    rejected: { badge: 'badge-rejected', dot: 'bg-red-500', label: 'Rejected' },
  };
  return map[status] || map.pending;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatReason = (reason) => {
  const map = {
    delivery_damaged: 'Delivery Damaged',
    not_working: 'Not Working',
    wrong_item: 'Wrong Item',
    other: 'Other',
  };
  return map[reason] || reason;
};

export const getErrorMessage = (err) => {
  if (!err.response) return 'Network error. Please check your connection.';
  const data = err.response.data;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
  }
  return 'An unexpected error occurred.';
};
