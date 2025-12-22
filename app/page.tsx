// src/app/page.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, Shield, Globe, Moon, Sun, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function LandingPage() {
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.auth
  );
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                WhatsApp Manager
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {isLoading ? null : isAuthenticated ? (
                <>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hi, {user?.fullName}
                  </span>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <Zap className="h-4 w-4" />
            <span>Powered by AI</span>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
            Manage Multiple
            <span className="block mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              WhatsApp Sessions
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Send bulk messages, automate responses with chatbots, and manage
            multiple WhatsApp numbers from one powerful dashboard.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg">
                  Go to Dashboard <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Button variant="outline" size="lg" className="border-gray-300 dark:border-gray-700">
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
              gradient: 'from-emerald-500 to-teal-500',
            },
            {
              icon: <CheckCircle className="h-6 w-6" />,
              title: 'Bulk Messaging',
              description: 'Send messages to thousands with campaigns',
              gradient: 'from-teal-500 to-cyan-500',
            },
            {
              icon: <Shield className="h-6 w-6" />,
              title: 'Chatbots',
              description: 'Automate responses with intelligent bots',
              gradient: 'from-cyan-500 to-blue-500',
            },
            {
              icon: <Globe className="h-6 w-6" />,
              title: 'Real-time Sync',
              description: 'Instant message synchronization',
              gradient: 'from-blue-500 to-emerald-500',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 text-white shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-32 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white">Ready to get started?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
            Join thousands of businesses using WhatsApp Manager to scale their communication.
          </p>
          <Link href="/register">
            <Button
              variant="secondary"
              size="lg"
              className="mt-8 bg-white text-emerald-600 hover:bg-gray-100 shadow-xl"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © 2024 WhatsApp Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}