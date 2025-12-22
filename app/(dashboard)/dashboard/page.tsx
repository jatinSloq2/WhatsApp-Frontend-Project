// src/app/(dashboard)/dashboard/page.tsx
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
        gradient: 'from-emerald-500 to-teal-500',
      },
      {
        name: 'Total Sessions',
        value: sessions.length,
        icon: MessageCircle,
        gradient: 'from-blue-500 to-cyan-500',
      },
      {
        name: 'Messages Today',
        value: '0',
        icon: Send,
        gradient: 'from-purple-500 to-pink-500',
      },
      {
        name: 'Campaigns',
        value: '0',
        icon: TrendingUp,
        gradient: 'from-orange-500 to-red-500',
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
        <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold">
              Welcome back, {user?.fullName}
            </h2>
            <p className="mt-2 text-lg text-emerald-100">
              Monitor your WhatsApp sessions and system activity at a glance.
            </p>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
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
            <Card className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    'rounded-2xl bg-gradient-to-br p-4 text-white shadow-xl transition-transform group-hover:scale-110',
                    stat.gradient
                  )}
                >
                  <stat.icon className="h-7 w-7" />
                </div>
              </div>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Sessions */}
      <Card className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Sessions
          </h3>
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
            Last 5
          </Badge>
        </div>

        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.slice(0, 5).map((session) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 dark:text-white leading-none">
                      {session.sessionName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.phoneNumber}
                    </p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    'capitalize font-semibold',
                    session.status === 'connected'
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  )}
                >
                  {session.status}
                </Badge>
              </motion.div>
            ))
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-12 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No sessions found. Create your first session to get started.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}