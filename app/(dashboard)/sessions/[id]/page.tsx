// src/app/(dashboard)/sessions/[id]/page.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteSession, getSessionStatus, setCurrentSession } from '@/store/slices/sessionSlice';
import {
  ArrowLeft, Calendar, CheckCircle2, Clock, Hash, Info,
  Phone, RefreshCw, Smartphone, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessionId = params.id as string;

  const { currentSession, sessions, qrCode, isLoading } = useAppSelector((state) => state.session);
  const [isConnecting, setIsConnecting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasNavigatedRef = useRef(false);

  // Find session from store
  useEffect(() => {
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session) {
      dispatch(setCurrentSession(session));
    }
  }, [sessionId, sessions, dispatch]);

  // Countdown timer for initial wait
  useEffect(() => {
    if (currentSession && ['initializing', 'qr_waiting'].includes(currentSession.status) && countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [currentSession?.status, countdown]);

  // Status polling - check session status every 3 seconds
  useEffect(() => {
    if (currentSession && ['initializing', 'qr_waiting'].includes(currentSession.status)) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const result = await dispatch(getSessionStatus(sessionId)).unwrap();
          
          // If status changed to connected
          if (result.status === 'connected' && currentSession.status !== 'connected') {
            setIsConnecting(false);
            toast.success('Session connected successfully!');
            
            // Navigate after 2 seconds
            if (!hasNavigatedRef.current) {
              hasNavigatedRef.current = true;
              setTimeout(() => {
                router.push('/sessions');
              }, 2000);
            }
          }
        } catch (error) {
          console.error('Error polling session status:', error);
        }
      }, 3000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  }, [currentSession?.status, sessionId, dispatch, router]);

  // Check if already connected and navigate
  useEffect(() => {
    if (currentSession?.status === 'connected' && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      toast.success('Session is already connected!');
      setTimeout(() => {
        router.push('/sessions');
      }, 2000);
    }
  }, [currentSession?.status, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        await dispatch(deleteSession(sessionId)).unwrap();
        toast.success('Session deleted successfully');
        router.push('/sessions');
      } catch (error: any) {
        toast.error(error || 'Failed to delete session');
      }
    }
  };

  const handleRefresh = () => {
    setCountdown(5);
    dispatch(getSessionStatus(sessionId));
  };

  if (isLoading || !currentSession) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const isConnected = currentSession.status === 'connected';
  const needsQR = ['initializing', 'qr_waiting'].includes(currentSession.status);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <Smartphone className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {currentSession.sessionName}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentSession.phoneNumber}</span>
                </p>
              </div>
              <Badge
                className={`text-xs font-semibold uppercase tracking-wide ${
                  currentSession.status === 'connected'
                    ? 'bg-green-100 text-green-700'
                    : currentSession.status === 'qr_waiting'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {currentSession.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status Banner */}
      {isConnected && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">
                Connected & Active
              </h3>
              <p className="text-sm text-green-700">
                Your WhatsApp session is ready to use
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* QR Code Section */}
      {needsQR && (
        <Card className="overflow-hidden border-2 border-gray-200 shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Scan QR Code</h2>
            </div>
          </div>

          <div className="p-8">
            {countdown > 0 ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-3xl font-bold text-blue-600">{countdown}</span>
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-medium text-gray-900">
                    Preparing your QR code...
                  </p>
                  <p className="text-sm text-gray-600">Please wait {countdown} second{countdown !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ) : qrCode || currentSession.qrCode ? (
              <div className="flex flex-col items-center gap-8">
                <div className="rounded-2xl border-4 border-gray-100 bg-white p-6 shadow-lg">
                  <img
                    src={qrCode || currentSession.qrCode}
                    alt="Scan QR Code"
                    className="h-64 w-64"
                  />
                </div>

                <Card className="w-full border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-blue-900">How to connect:</h4>
                    </div>

                    <div className="space-y-3 pl-3">
                      <div className="flex items-start gap-3 text-sm text-blue-800">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                        <span>Open WhatsApp on your phone</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-blue-800">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                        <span>Go to Settings → Linked Devices</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-blue-800">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                        <span>Tap Link a Device</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-blue-800">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                        <span>Scan the QR code to complete connection</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="gap-2 border-2 border-gray-300 font-semibold hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <div className="space-y-1 text-center">
                  <p className="font-medium text-gray-900">
                    Generating QR code...
                  </p>
                  <p className="text-sm text-gray-600">Please wait a moment</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Session Information */}
      <Card className="overflow-hidden border-2 border-gray-200 shadow-sm">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <Hash className="h-6 w-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Session Information</h2>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between rounded-lg border-2 border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Session ID</p>
                <p className="mt-1 font-mono text-sm font-medium text-gray-900">
                  {currentSession.sessionId}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border-2 border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone Number</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {currentSession.phoneNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border-2 border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Created</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {formatDate(currentSession.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {currentSession.connectedAt && (
            <div className="flex items-center justify-between rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">Connected At</p>
                  <p className="mt-1 text-sm font-semibold text-green-900">
                    {formatDate(currentSession.connectedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSession.lastSeen && (
            <div className="flex items-center justify-between rounded-lg border-2 border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Last Seen</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatDate(currentSession.lastSeen)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card className="overflow-hidden border-2 border-gray-200 shadow-sm">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
        </div>

        <div className="space-y-4 p-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-2 border-red-200 py-8 text-red-600 transition-all hover:border-red-300 hover:bg-red-50"
            onClick={handleDelete}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-red-900">Delete Session</div>
              <div className="text-xs text-red-600">Permanently remove this session</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}