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
};
