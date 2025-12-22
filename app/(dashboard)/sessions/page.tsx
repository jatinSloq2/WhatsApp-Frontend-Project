// src/app/(dashboard)/sessions/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus, Smartphone, Trash2, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSessions, deleteSession } from '@/store/slices/sessionSlice';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SessionsPage() {
  const dispatch = useAppDispatch();
  const { sessions, isLoading } = useAppSelector((state) => state.session);

  useEffect(() => {
    dispatch(fetchSessions());
    
    const interval = setInterval(() => {
      dispatch(fetchSessions());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleDelete = async (sessionId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this session? This action cannot be undone.'
      )
    ) {
      try {
        await dispatch(deleteSession(sessionId)).unwrap();
        toast.success('Session deleted successfully');
      } catch (error: any) {
        toast.error(error || 'Failed to delete session');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      connected: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      qr_waiting: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      qr_ready: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      initializing: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      disconnected: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      no_session: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    };

    return (
      <Badge className={`capitalize font-semibold ${styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400" />
          <div className="absolute inset-0 h-16 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            WhatsApp Sessions
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your connected WhatsApp numbers
          </p>
        </div>
        <Link href="/sessions/new">
          <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
            <Plus className="h-5 w-5" />
            New Session
          </Button>
        </Link>
      </div>

      {/* Sessions Grid */}
      {sessions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card
              key={session.sessionId}
              className="group flex flex-col rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Session Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform">
                    <Smartphone className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {session.sessionName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.phoneNumber}
                    </p>
                  </div>
                </div>
                {getStatusBadge(session.status)}
              </div>

              {/* Session Info */}
              <div className="mb-4 flex-1 space-y-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(session.createdAt)}
                  </span>
                </div>

                {session.connectedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Connected:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatDate(session.connectedAt)}
                    </span>
                  </div>
                )}

                {session.lastSeen && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Seen:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(session.lastSeen)}
                    </span>
                  </div>
                )}

                {session.retryCount !== undefined && session.retryCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Retry Count:</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {session.retryCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t-2 border-gray-200 dark:border-gray-800 pt-4">
                <Link
                  href={`/sessions/${session.sessionId}`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full gap-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Info className="h-4 w-4" />
                    Details
                  </Button>
                </Link>

                <Button
                  size="sm"
                  onClick={() => handleDelete(session.sessionId)}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-16">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl mb-6">
            <Smartphone className="h-12 w-12 text-white" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            No sessions yet
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Create your first WhatsApp session to get started
          </p>
          <Link href="/sessions/new">
            <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
              <Plus className="h-5 w-5" />
              Create Session
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}