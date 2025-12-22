// src/app/(dashboard)/campaigns/page.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteCampaign } from '@/store/slices/campaignSlice';
import { CheckCircle, Clock, MessageSquare, Plus, Send, Trash2, Users, XCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CampaignsPage() {
  const dispatch = useAppDispatch();
  const { campaigns, isLoading } = useAppSelector((state) => state.campaign);

  const handleDelete = async (campaignId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this campaign? This action cannot be undone.'
      )
    ) {
      try {
        dispatch(deleteCampaign(campaignId));
        toast.success('Campaign deleted successfully');
      } catch (error: any) {
        toast.error(error || 'Failed to delete campaign');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { class: string; icon: any }> = {
      completed: {
        class: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle,
      },
      sending: {
        class: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: Clock,
      },
      failed: {
        class: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        icon: XCircle,
      },
      draft: {
        class: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        icon: MessageSquare,
      },
    };

    const config = styles[status] || styles.draft;
    const Icon = config.icon;

    return (
      <Badge className={`capitalize font-semibold flex items-center gap-1 ${config.class}`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getMessageTypeColor = (type: string) => {
    return type === 'bulk'
      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
      : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
  };

  const getMessageTypeIcon = (message: any) => {
    if (message.image) return '🖼️';
    if (message.video) return '🎥';
    if (message.audio) return '🎵';
    if (message.document) return '📄';
    return '💬';
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
            Message Campaigns
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Send single or bulk messages to your contacts
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
            <Plus className="h-5 w-5" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card
              key={campaign._id}
              className="group flex flex-col rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Campaign Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform text-2xl">
                    {getMessageTypeIcon(campaign.message)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {campaign.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {campaign.sessionName || campaign.sessionId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and Type Badges */}
              <div className="mb-4 flex gap-2 flex-wrap">
                {getStatusBadge(campaign.status)}
                <Badge className={`capitalize font-semibold ${getMessageTypeColor(campaign.messageType)}`}>
                  {campaign.messageType === 'bulk' ? (
                    <Users className="h-3 w-3 mr-1" />
                  ) : (
                    <Send className="h-3 w-3 mr-1" />
                  )}
                  {campaign.messageType}
                </Badge>
              </div>

              {/* Campaign Stats */}
              <div className="mb-4 flex-1 space-y-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Receivers:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {campaign.totalReceivers}
                  </span>
                </div>

                {campaign.messageType === 'bulk' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sent:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {campaign.sentCount}
                      </span>
                    </div>

                    {campaign.failedCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Failed:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {campaign.failedCount}
                        </span>
                      </div>
                    )}

                    {campaign.delay && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Delay:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {campaign.delay}ms
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(campaign.createdAt)}
                  </span>
                </div>

                {campaign.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatDate(campaign.completedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar for Bulk Campaigns */}
              {campaign.messageType === 'bulk' && campaign.status === 'sending' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.round((campaign.sentCount / campaign.totalReceivers) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
                      style={{
                        width: `${(campaign.sentCount / campaign.totalReceivers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Message Preview */}
              {campaign.message.text && (
                <div className="mb-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Message:</p>
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                    {campaign.message.text}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 border-t-2 border-gray-200 dark:border-gray-800 pt-4">
                <Link
                  href={`/campaigns/${campaign._id}`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full gap-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Send className="h-4 w-4" />
                    Details
                  </Button>
                </Link>

                <Button
                  size="sm"
                  onClick={() => handleDelete(campaign._id)}
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
            <Send className="h-12 w-12 text-white" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            No campaigns yet
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Create your first campaign to start sending messages
          </p>
          <Link href="/campaigns/new">
            <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
              <Plus className="h-5 w-5" />
              Create Campaign
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}