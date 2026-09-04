import api from './api';

export const qrService = {
  generate: async ({ url, name, foregroundColor, backgroundColor, size, errorCorrectionLevel }) => {
    const response = await api.post('/qr/generate', {
      url,
      name,
      foregroundColor,
      backgroundColor,
      size,
      errorCorrectionLevel,
    });
    return response.data;
  },

  getAll: async ({ search = '', sort = 'newest', page = 1, limit = 20 } = {}) => {
    const response = await api.get('/qr', {
      params: { search, sort, page, limit },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/qr/${id}`);
    return response.data;
  },

  deleteQR: async (id) => {
    const response = await api.delete(`/qr/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/qr/stats');
    return response.data;
  },
};
