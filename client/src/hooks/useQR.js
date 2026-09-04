import { useState, useCallback } from 'react';
import { qrService } from '../services/qrService';

export function useQR() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const generateQR = useCallback(async (params) => {
    setIsGenerating(true);
    setGenerateError('');
    try {
      const data = await qrService.generate(params);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate QR code.';
      setGenerateError(msg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => setGenerateError(''), []);

  return { generateQR, isGenerating, generateError, clearError };
}
