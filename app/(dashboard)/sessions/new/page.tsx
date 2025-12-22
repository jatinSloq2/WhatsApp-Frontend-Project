// src/app/(dashboard)/sessions/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, Phone, Tag, CheckCircle } from 'lucide-react';
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
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Session</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Connect a new WhatsApp number to your account
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Phone className="h-4 w-4" />
              Mobile Number
            </label>
            <div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <span className="flex items-center rounded-l-lg bg-gray-100 dark:bg-gray-800 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-r-2 border-gray-300 dark:border-gray-700">
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
                className="w-full rounded-r-lg bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              />
            </div>
            {errors.mobile && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.mobile}</p>
            )}
          </div>

          {/* Session Name */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Tag className="h-4 w-4" />
              Session Name
            </label>
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="My Business WhatsApp"
              className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500 dark:focus:border-emerald-500 py-3"
            />
            {errors.sessionName && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.sessionName}
              </p>
            )}
          </div>

          {/* Info Box */}
          <Card className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-6">
            <h4 className="mb-4 flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-100">
              <CheckCircle className="h-5 w-5" />
              What happens next?
            </h4>
            <ol className="space-y-3">
              {[
                'A QR code will be generated',
                'Open WhatsApp on your phone',
                'Go to Settings → Linked Devices',
                'Scan the QR code to connect'
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-emerald-800 dark:text-emerald-200">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-200 dark:bg-emerald-900 text-xs font-bold text-emerald-900 dark:text-emerald-100">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/sessions" className="flex-1">
              <Button
                type="button"
                className="w-full border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-6 text-base font-semibold"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-base font-semibold shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}