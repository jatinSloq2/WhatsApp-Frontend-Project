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
  Loader2,
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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session) {
      dispatch(setCurrentSession(session));
    }
  }, [sessionId, sessions, dispatch]);

  useEffect(() => {
    if (currentSession && ['initializing', 'qr_ready', 'qr_waiting'].includes(currentSession.status)) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const result = await dispatch(getSessionStatus(sessionId)).unwrap();
          
          if (result.status === 'connected') {
            setIsConnecting(false);
            toast.success('Session connected successfully!');
            
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            
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

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
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

  const handleRefresh = async () => {
    try {
      await dispatch(getSessionStatus(sessionId)).unwrap();
      toast.success('Status refreshed');
    } catch (error) {
      toast.error('Failed to refresh status');
    }
  };

  if (isLoading || !currentSession) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400" />
          <div className="absolute inset-0 h-16 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const isConnected = currentSession.status === 'connected';
  const needsQR = ['initializing', 'qr_ready', 'qr_waiting'].includes(currentSession.status);
  const displayQR = qrCode || currentSession.qrCode;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {currentSession.sessionName}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentSession.phoneNumber}</span>
                </p>
              </div>
              <Badge
                className={`text-xs font-bold uppercase tracking-wide ${
                  currentSession.status === 'connected'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : ['qr_ready', 'qr_waiting'].includes(currentSession.status)
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
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
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                Connected & Active
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Your WhatsApp session is ready to use
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* QR Code Section */}
      {needsQR && (
        <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Scan QR Code</h2>
            </div>
          </div>

          <div className="p-8">
            {displayQR ? (
              <div className="flex flex-col items-center gap-8">
                <div className="rounded-3xl border-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 shadow-2xl">
                  <img
                    src={displayQR}
                    alt="Scan QR Code"
                    className="h-64 w-64"
                  />
                </div>

                <Card className="w-full border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                        <Info className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">How to connect:</h4>
                    </div>

                    <div className="space-y-3 pl-3">
                      {[
                        'Open WhatsApp on your phone',
                        'Go to Settings → Linked Devices',
                        'Tap "Link a Device"',
                        'Scan the QR code above to complete connection'
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm text-emerald-800 dark:text-emerald-200">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Waiting for connection... (auto-checking every 3s)</span>
                    </div>
                  </div>
                </Card>

                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="gap-2 border-2 border-gray-300 dark:border-gray-700 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400" />
                <div className="space-y-1 text-center">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Generating QR code...
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Please wait a moment</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Session Information */}
      <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 px-6 py-5">
          <div className="flex items-center gap-3">
            <Hash className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Session Information</h2>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {[
            { icon: Hash, label: 'Session ID', value: currentSession.sessionId, mono: true },
            { icon: Phone, label: 'Phone Number', value: currentSession.phoneNumber },
            { icon: Calendar, label: 'Created', value: formatDate(currentSession.createdAt) },
            ...(currentSession.connectedAt ? [{ icon: CheckCircle2, label: 'Connected At', value: formatDate(currentSession.connectedAt), success: true }] : []),
            ...(currentSession.lastSeen ? [{ icon: Clock, label: 'Last Seen', value: formatDate(currentSession.lastSeen) }] : []),
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded-xl border-2 p-4 ${
                item.success
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950'
                  : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${item.mono ? 'font-mono' : ''} ${item.success ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-900 dark:text-white'}`}>
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Actions</h2>
        </div>

        <div className="p-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 py-8 text-red-600 dark:text-red-400 transition-all hover:border-red-300 dark:hover:border-red-700 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={handleDelete}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-red-900 dark:text-red-100">Delete Session</div>
              <div className="text-xs text-red-600 dark:text-red-400">Permanently remove this session</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}