import api from './api';

export const returnsService = {
  // Customer
  createReturn: (formData) =>
    api.post('/create-return/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  myReturns: () => api.get('/my-returns/'),
  getReturn: (id) => api.get(`/return/${id}/`),

  // Manager
  allReturns: (params) => api.get('/manager/returns/', { params }),
  getManagerReturn: (id) => api.get(`/manager/return/${id}/`),
  updateStatus: (id, status) => api.put(`/manager/update-status/${id}/`, { status }),
  runMl: (id) => api.post(`/manager/run-ml/${id}/`),
  dashboardStats: () => api.get('/dashboard/stats/'),
  uploadShippingImage: (id, formData) =>
    api.post(`/manager/return/${id}/upload-shipping-image/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
