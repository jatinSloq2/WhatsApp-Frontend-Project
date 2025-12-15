// src/app/(dashboard)/sessions/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSessionStore } from '@/store/sessionStore';
import toast from 'react-hot-toast';

export default function NewSessionPage() {
  const router = useRouter();
  const { createSession, isLoading } = useSessionStore();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    sessionName: '',
  });
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+\d{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone format. Use international format: +1234567890';
    }

    if (!formData.sessionName.trim()) {
      newErrors.sessionName = 'Session name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const session = await createSession(formData);
      toast.success('Session created successfully!');
      router.push(`/sessions/${session.sessionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create session');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/sessions"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Session</h1>
        <p className="mt-1 text-sm text-gray-600">
          Connect a new WhatsApp number to your account
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+1234567890"
            helperText="Use international format with country code"
            error={errors.phoneNumber}
            required
          />

          <Input
            label="Session Name"
            type="text"
            value={formData.sessionName}
            onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
            placeholder="My Business WhatsApp"
            helperText="Give this session a memorable name"
            error={errors.sessionName}
            required
          />

          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">What happens next?</h4>
            <ol className="list-inside list-decimal space-y-1 text-sm text-blue-700">
              <li>A QR code will be generated</li>
              <li>Open WhatsApp on your phone</li>
              <li>Go to Settings → Linked Devices</li>
              <li>Scan the QR code to connect</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Link href="/sessions" className="flex-1">
              <Button variant="outline" className="w-full" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              Create Session
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}