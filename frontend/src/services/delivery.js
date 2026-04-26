import api from './api';

export const deliveryLogin = async (delivery_id, password) => {
  const response = await api.post('/delivery/login/', { delivery_id, password });
  return response.data;
};

export const getAssignedPickups = async () => {
  const response = await api.get('/delivery/pickups/');
  return response.data;
};

export const updatePickupStatus = async (id, status, failure_reason = '') => {
  const response = await api.post(`/delivery/update-status/${id}/`, { status, failure_reason });
  return response.data;
};
