// src/app/(dashboard)/sessions/[id]/page.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useQRCode } from '@/hooks/useQRCode';
import { useSocket } from '@/hooks/useSocket';
import { formatDate } from '@/lib/utils';
import { useSessionStore } from '@/store/sessionStore';
import { ArrowLeft, CheckCircle, Power, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const {
    currentSession,
    getSession,
    logoutSession,
    deleteSession,
    updateSessionInList,
    isLoading,
  } = useSessionStore();

  const { qrCode, isLoading: qrLoading, refetch: refetchQR } = useQRCode(sessionId);
  const { on, off, subscribeToSession } = useSocket();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      getSession(sessionId);
      subscribeToSession(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    // Listen for session status updates
    const handleSessionStatus = (data: any) => {
      if (data.sessionId === sessionId) {
        updateSessionInList(sessionId, {
          status: data.status,
          connectedAt: data.connectedAt,
          lastSeen: data.lastSeen,
        });

        if (data.status === 'connected') {
          setIsConnecting(false);
          toast.success('Session connected successfully!');
        } else if (data.status === 'disconnected') {
          toast.error('Session disconnected');
        }
      }
    };

    // Listen for new QR codes
    const handleQRCode = (data: any) => {
      if (data.sessionId === sessionId) {
        setIsConnecting(true);
      }
    };

    on('session_status', handleSessionStatus);
    on('qr_code', handleQRCode);

    return () => {
      off('session_status', handleSessionStatus);
      off('qr_code', handleQRCode);
    };
  }, [sessionId, on, off, updateSessionInList]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout this session?')) {
      try {
        await logoutSession(sessionId);
        toast.success('Session logged out successfully');
        router.push('/sessions');
      } catch (error) {
        toast.error('Failed to logout session');
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        await deleteSession(sessionId);
        toast.success('Session deleted successfully');
        router.push('/sessions');
      } catch (error) {
        toast.error('Failed to delete session');
      }
    }
  };

  if (isLoading || !currentSession) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isConnected = currentSession.status === 'connected';
  const needsQR = ['initializing', 'qr_waiting'].includes(currentSession.status);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/sessions"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentSession.sessionName}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{currentSession.phoneNumber}</p>
          </div>
          <Badge
            variant={
              currentSession.status === 'connected'
                ? 'success'
                : currentSession.status === 'qr_waiting'
                ? 'warning'
                : 'danger'
            }
          >
            {currentSession.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Card */}
        {needsQR && (
          <Card className="lg:col-span-2">
            <div className="text-center">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Scan QR Code to Connect
              </h3>
              
              {qrLoading || isConnecting ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <Spinner size="lg" />
                  <p className="text-sm text-gray-600">
                    {isConnecting ? 'Waiting for WhatsApp to connect...' : 'Generating QR code...'}
                  </p>
                </div>
              ) : qrCode ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="rounded-lg border-4 border-gray-200 bg-white p-4">
                    <QRCode value={qrCode} size={256} level="H" />
                  </div>
                  
                  <div className="max-w-md space-y-2 text-left">
                    <h4 className="font-medium text-gray-900">How to connect:</h4>
                    <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600">
                      <li>Open WhatsApp on your phone</li>
                      <li>Tap Menu or Settings and select Linked Devices</li>
                      <li>Tap Link a Device</li>
                      <li>Point your phone at this screen to scan the QR code</li>
                    </ol>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetchQR}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh QR Code
                  </Button>
                </div>
              ) : (
                <div className="py-12">
                  <p className="mb-4 text-gray-600">Failed to generate QR code</p>
                  <Button onClick={refetchQR} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Connection Status Card */}
        {isConnected && (
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Connected Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  Your WhatsApp session is active and ready to use
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Session Info Card */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Session Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-600">Session ID</span>
              <span className="font-mono text-sm font-medium text-gray-900">
                {currentSession.sessionId.slice(0, 20)}...
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-600">Phone Number</span>
              <span className="text-sm font-medium text-gray-900">
                {currentSession.phoneNumber}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-600">Created</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(currentSession.createdAt)}
              </span>
            </div>
            {currentSession.connectedAt && (
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Connected At</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(currentSession.connectedAt)}
                </span>
              </div>
            )}
            {currentSession.lastSeen && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Seen</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(currentSession.lastSeen)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Actions Card */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Actions</h3>
          <div className="space-y-3">
            {isConnected && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <Power className="h-4 w-4" />
                Logout Session
              </Button>
            )}
            <Button
              variant="danger"
              className="w-full justify-start gap-2"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete Session
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}