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
  console.log(sessions)
  useEffect(() => {
    dispatch(fetchSessions());
    
    // Refresh every 30 seconds
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
      connected: 'bg-emerald-100 text-emerald-700',
      qr_waiting: 'bg-yellow-100 text-yellow-700',
      initializing: 'bg-blue-100 text-blue-700',
      disconnected: 'bg-red-100 text-red-700',
      no_session: 'bg-gray-100 text-gray-700',
    };

    return (
      <Badge className={`capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            WhatsApp Sessions
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your connected WhatsApp numbers
          </p>
        </div>
        <Link href="/sessions/new">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
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
              className="flex flex-col rounded-2xl p-5"
            >
              {/* Session Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {session.sessionName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {session.phoneNumber}
                    </p>
                  </div>
                </div>
                {getStatusBadge(session.status)}
              </div>

              {/* Session Info */}
              <div className="mb-4 flex-1 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(session.createdAt)}
                  </span>
                </div>

                {session.connectedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connected:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(session.connectedAt)}
                    </span>
                  </div>
                )}

                {session.lastSeen && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Seen:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(session.lastSeen)}
                    </span>
                  </div>
                )}

                {session.retryCount !== undefined && session.retryCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retry Count:</span>
                    <span className="font-medium text-orange-600">
                      {session.retryCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-gray-200 pt-4">
                <Link
                  href={`/sessions/${session.sessionId}`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <Info className="h-4 w-4" />
                    Details
                  </Button>
                </Link>

                <Button
                  size="sm"
                  onClick={() => handleDelete(session.sessionId)}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center rounded-2xl py-12">
          <Smartphone className="mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No sessions yet
          </h3>
          <p className="mb-6 text-sm text-gray-600">
            Create your first WhatsApp session to get started
          </p>
          <Link href="/sessions/new">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-5 w-5" />
              Create Session
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}