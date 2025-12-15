// src/app/(dashboard)/dashboard/page.tsx

'use client';

import { useEffect } from 'react';
import { Users, MessageCircle, Send, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { sessions, fetchSessions } = useSessionStore();

  useEffect(() => {
    fetchSessions();
  }, []);

  const stats = [
    {
      name: 'Active Sessions',
      value: sessions.filter((s) => s.status === 'connected').length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Sessions',
      value: sessions.length,
      icon: MessageCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Messages Today',
      value: '0',
      icon: Send,
      color: 'bg-purple-500',
    },
    {
      name: 'Campaigns',
      value: '0',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.fullName}!</h2>
            <p className="mt-1 text-primary-100">
              Here&apos;s what&apos;s happening with your WhatsApp sessions today.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={cn('rounded-lg p-3', stat.color)}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
        <div className="mt-4 space-y-3">
          {sessions.length > 0 ? (
            sessions.slice(0, 5).map((session) => (
              <div
                key={session._id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{session.sessionName}</p>
                  <p className="text-sm text-gray-500">{session.phoneNumber}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    session.status === 'connected'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {session.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No sessions yet. Create your first session!</p>
          )}
        </div>
      </Card>
    </div>
  );
}