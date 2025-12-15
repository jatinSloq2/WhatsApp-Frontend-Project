// src/hooks/useQRCode.ts

import { useState, useEffect, useCallback } from 'react';
import { sessionService } from '@/lib/api/session.service';
import { useSocket } from './useSocket';

export const useQRCode = (sessionId: string | null) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { on, off, subscribeToSession } = useSocket();

  const fetchQRCode = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await sessionService.getQRCode(sessionId);
      setQrCode(response.data.qr);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch QR code');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchQRCode();
      subscribeToSession(sessionId);

      // Listen for new QR codes
      const handleQRCode = (data: any) => {
        if (data.sessionId === sessionId) {
          setQrCode(data.qr);
        }
      };

      on('qr_code', handleQRCode);

      return () => {
        off('qr_code', handleQRCode);
      };
    }
  }, [sessionId, fetchQRCode, subscribeToSession, on, off]);

  return {
    qrCode,
    isLoading,
    error,
    refetch: fetchQRCode,
  };
};