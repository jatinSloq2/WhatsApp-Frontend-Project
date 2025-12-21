'use client';

import { useEffect, useMemo } from 'react';
import { Users, MessageCircle, Send, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSessions } from '@/store/slices/sessionSlice';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { sessions } = useAppSelector((state) => state.session);

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const activeSessions = useMemo(
    () => sessions.filter((s) => s.status === 'connected').length,
    [sessions]
  );

  const stats = useMemo(
    () => [
      {
        name: 'Active Sessions',
        value: activeSessions,
        icon: Users,
        color: 'from-blue-500 to-blue-600',
      },
      {
        name: 'Total Sessions',
        value: sessions.length,
        icon: MessageCircle,
        color: 'from-emerald-500 to-emerald-600',
      },
      {
        name: 'Messages Today',
        value: '0',
        icon: Send,
        color: 'from-purple-500 to-purple-600',
      },
      {
        name: 'Campaigns',
        value: '0',
        icon: TrendingUp,
        color: 'from-orange-500 to-orange-600',
      },
    ],
    [activeSessions, sessions.length]
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg">
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold">
              Welcome back, {user?.fullName}
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              Monitor your WhatsApp sessions and system activity at a glance.
            </p>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group rounded-2xl p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    'rounded-xl bg-gradient-to-br p-3 text-white shadow-sm transition-transform group-hover:scale-105',
                    stat.color
                  )}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Sessions */}
      <Card className="rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Sessions
          </h3>
          <Badge className="bg-gray-100 text-gray-700">Last 5</Badge>
        </div>

        <div className="mt-5 space-y-3">
          {sessions.length > 0 ? (
            sessions.slice(0, 5).map((session) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-gray-900 leading-none">
                    {session.sessionName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.phoneNumber}
                  </p>
                </div>
                <Badge
                  className={cn(
                    'capitalize',
                    session.status === 'connected'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {session.status}
                </Badge>
              </motion.div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              No sessions found. Create your first session to get started.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
