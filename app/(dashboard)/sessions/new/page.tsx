// src/app/(dashboard)/sessions/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createSession } from '@/store/slices/sessionSlice';
import toast from 'react-hot-toast';

export default function NewSessionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.session);

  const [mobile, setMobile] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [errors, setErrors] = useState<{ mobile?: string; sessionName?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = 'Enter a valid 10 digit mobile number';
    }

    if (!sessionName.trim()) {
      newErrors.sessionName = 'Session name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      phoneNumber: `+91${mobile}`,
      sessionName,
    };

    try {
      const result = await dispatch(createSession(payload)).unwrap();
      toast.success('Session created successfully');
      
      // Navigate to session detail page to show QR code
      router.push(`/sessions/${result.sessionId}`);
    } catch (error: any) {
      toast.error(error || 'Failed to create session');
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

      {/* Form */}
      <Card className="rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
              <span className="flex items-center rounded-l-lg bg-gray-100 px-3 text-sm text-gray-700">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, ''))
                }
                placeholder="9876543210"
                className="w-full rounded-r-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
            )}
          </div>

          {/* Session Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Session Name
            </label>
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="My Business WhatsApp"
              className="border-gray-300"
            />
            {errors.sessionName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.sessionName}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">
              What happens next?
            </h4>
            <ol className="list-inside list-decimal space-y-1 text-sm text-blue-700">
              <li>A QR code will be generated</li>
              <li>Open WhatsApp on your phone</li>
              <li>Go to Settings → Linked Devices</li>
              <li>Scan the QR code to connect</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/sessions" className="flex-1">
              <Button
                type="button"
                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}