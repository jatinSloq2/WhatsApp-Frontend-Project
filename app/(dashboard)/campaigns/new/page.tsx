// src/app/(dashboard)/campaigns/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Users, Upload, X, Image as ImageIcon, FileText, Music, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sendSingleMessage, sendBulkMessage, uploadMedia, setUploadProgress } from '@/store/slices/campaignSlice';
import { fetchSessions } from '@/store/slices/sessionSlice';
import toast from 'react-hot-toast';

export default function NewCampaignPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { sessions } = useAppSelector((state) => state.session);
  const { isSending, uploadProgress } = useAppSelector((state) => state.campaign);

  const [campaignName, setCampaignName] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [messageType, setMessageType] = useState<'single' | 'bulk'>('single');
  const [receiver, setReceiver] = useState('');
  const [receivers, setReceivers] = useState('');
  const [messageText, setMessageText] = useState('');
  const [delay, setDelay] = useState(2000);
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video' | 'audio' | 'document'>('none');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);

    try {
      const result = await dispatch(uploadMedia(file)).unwrap();
      setMediaUrl(result);
      toast.success('Media uploaded successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to upload media');
      setMediaFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSession) {
      toast.error('Please select a session');
      return;
    }

    if (messageType === 'single' && !receiver) {
      toast.error('Please enter a receiver number');
      return;
    }

    if (messageType === 'bulk' && !receivers.trim()) {
      toast.error('Please enter receiver numbers');
      return;
    }

    if (!messageText && mediaType === 'none') {
      toast.error('Please enter a message or upload media');
      return;
    }

    if (mediaType !== 'none' && !mediaUrl) {
      toast.error('Please wait for media to upload');
      return;
    }

    // Build message object
    const message: any = {};

    if (messageText) {
      message.text = messageText;
    }

    if (mediaType !== 'none' && mediaUrl) {
      message[mediaType] = { url: mediaUrl };
      if (caption) {
        message.caption = caption;
      }
    }

    try {
      if (messageType === 'single') {
        await dispatch(
          sendSingleMessage({
            sessionId: selectedSession,
            receiver,
            message,
            campaignName: campaignName || undefined,
          })
        ).unwrap();
        toast.success('Message sent successfully');
      } else {
        const numberList = receivers
          .split('\n')
          .map((n) => n.trim())
          .filter((n) => n.length > 0);

        if (numberList.length === 0) {
          toast.error('No valid numbers found');
          return;
        }

        await dispatch(
          sendBulkMessage({
            sessionId: selectedSession,
            numbers: numberList,
            message,
            delay,
            campaignName: campaignName || undefined,
          })
        ).unwrap();
        toast.success('Bulk campaign started');
      }

      router.push('/campaigns');
    } catch (error: any) {
      toast.error(error || 'Failed to send message');
    }
  };

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <Upload className="h-5 w-5" />;
    }
  };

  const connectedSessions = sessions.filter((s) => s.status === 'connected');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="icon"
          className="rounded-xl border-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Campaign
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Send messages to your contacts
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg space-y-6">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name (Optional)</Label>
            <Input
              id="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Product Launch 2024"
              className="rounded-xl"
            />
          </div>

          {/* Session Selection */}
          <div className="space-y-2">
            <Label htmlFor="session">Select Session *</Label>
            <select
              id="session"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              required
            >
              <option value="">Choose a connected session</option>
              {connectedSessions.map((session) => (
                <option key={session.sessionId} value={session.sessionId}>
                  {session.sessionName} ({session.phoneNumber})
                </option>
              ))}
            </select>
            {connectedSessions.length === 0 && (
              <p className="text-sm text-red-500">
                No connected sessions available. Please connect a session first.
              </p>
            )}
          </div>

          {/* Message Type */}
          <div className="space-y-2">
            <Label>Message Type *</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMessageType('single')}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  messageType === 'single'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                }`}
              >
                <Send className="h-5 w-5" />
                <span className="font-medium">Single Message</span>
              </button>
              <button
                type="button"
                onClick={() => setMessageType('bulk')}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  messageType === 'bulk'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Bulk Messages</span>
              </button>
            </div>
          </div>

          {/* Receiver(s) */}
          {messageType === 'single' ? (
            <div className="space-y-2">
              <Label htmlFor="receiver">Receiver Number *</Label>
              <Input
                id="receiver"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="e.g., +919876543210 or 9876543210"
                className="rounded-xl"
                required
              />
              <p className="text-xs text-gray-500">
                Enter with or without country code
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="receivers">Receiver Numbers *</Label>
              <Textarea
                id="receivers"
                value={receivers}
                onChange={(e) => setReceivers(e.target.value)}
                placeholder="Enter one number per line:
9876543210
9123456789
+919988776655"
                className="rounded-xl min-h-[150px]"
                required
              />
              <p className="text-xs text-gray-500">
                Enter one number per line (with or without country code)
              </p>
            </div>
          )}

          {/* Media Type Selection */}
          <div className="space-y-2">
            <Label>Media Type</Label>
            <div className="grid grid-cols-5 gap-2">
              {['none', 'image', 'video', 'audio', 'document'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setMediaType(type as any);
                    setMediaFile(null);
                    setMediaUrl('');
                  }}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all ${
                    mediaType === type
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  {type === 'none' ? (
                    <X className="h-5 w-5" />
                  ) : type === 'image' ? (
                    <ImageIcon className="h-5 w-5" />
                  ) : type === 'video' ? (
                    <Video className="h-5 w-5" />
                  ) : type === 'audio' ? (
                    <Music className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  <span className="text-xs capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Media Upload */}
          {mediaType !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="media">Upload {mediaType} *</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="media"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  {getMediaIcon()}
                  <span>Choose File</span>
                </label>
                <input
                  id="media"
                  type="file"
                  onChange={handleMediaUpload}
                  accept={
                    mediaType === 'image'
                      ? 'image/*'
                      : mediaType === 'video'
                      ? 'video/*'
                      : mediaType === 'audio'
                      ? 'audio/*'
                      : '*'
                  }
                  className="hidden"
                />
                {mediaFile && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {mediaFile.name}
                  </span>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          )}

          {/* Caption for Media */}
          {mediaType !== 'none' && mediaType !== 'audio' && (
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption to your media"
                className="rounded-xl"
              />
            </div>
          )}

          {/* Message Text */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message Text {mediaType === 'none' ? '*' : '(Optional)'}
            </Label>
            <Textarea
              id="message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your message here..."
              className="rounded-xl min-h-[120px]"
              required={mediaType === 'none'}
            />
          </div>

          {/* Delay for Bulk Messages */}
          {messageType === 'bulk' && (
            <div className="space-y-2">
              <Label htmlFor="delay">Delay Between Messages (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={delay}
                onChange={(e) => setDelay(parseInt(e.target.value))}
                min="1000"
                max="10000"
                step="500"
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">
                Recommended: 2000ms (2 seconds) to avoid rate limits
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 rounded-xl border-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending || !selectedSession || connectedSessions.length === 0}
              className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg rounded-xl"
            >
              {isSending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {messageType === 'single' ? 'Send Message' : 'Start Campaign'}
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}