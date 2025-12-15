// src/app/page.tsx (Landing Page)

import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-xl font-bold text-white">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WhatsApp Manager</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Manage Multiple
            <span className="block text-primary-600">WhatsApp Sessions</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            Send bulk messages, automate responses with chatbots, and manage multiple WhatsApp
            numbers from one powerful dashboard.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <Zap className="h-6 w-6" />,
              title: 'Multi-Session',
              description: 'Connect multiple WhatsApp numbers simultaneously',
            },
            {
              icon: <CheckCircle className="h-6 w-6" />,
              title: 'Bulk Messaging',
              description: 'Send messages to thousands with campaigns',
            },
            {
              icon: <Shield className="h-6 w-6" />,
              title: 'Chatbots',
              description: 'Automate responses with intelligent bots',
            },
            {
              icon: <Globe className="h-6 w-6" />,
              title: 'Real-time Sync',
              description: 'Instant message synchronization',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary-100 p-3 text-primary-600">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-32 rounded-3xl bg-primary-600 p-12 text-center">
          <h2 className="text-4xl font-bold text-white">Ready to get started?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Join thousands of businesses using WhatsApp Manager to scale their communication.
          </p>
          <Link href="/register">
            <Button
              variant="secondary"
              size="lg"
              className="mt-8 bg-white text-primary-600 hover:bg-gray-100"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            © 2024 WhatsApp Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}