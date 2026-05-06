'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

type Tab = 'login' | 'register'

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: Tab
}

export default function AuthDialog({ isOpen, onClose, defaultTab = 'login' }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)
  const [emailSent, setEmailSent] = useState(false)

  if (emailSent) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col items-center text-center py-4 gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50">
            <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">
              We&apos;ve sent a confirmation link to your email address. Please check your inbox to activate your account.
            </p>
          </div>
          <Button className="w-full mt-2" size="lg" onClick={onClose}>
            Got it
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === 'login'
              ? 'Sign in to your Slotify account'
              : 'Start managing bookings and queues in minutes.'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors rounded-md p-1 -mt-1"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <hr className="border-slate-100 mt-4 mb-5" />

      <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={cn(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
            activeTab === 'login'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={cn(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
            activeTab === 'register'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          Register
        </button>
      </div>

      {activeTab === 'login' ? (
        <>
          <LoginForm />
          <p className="text-center text-sm text-slate-500 mt-4">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              Register
            </button>
          </p>
        </>
      ) : (
        <RegisterForm
          onSwitchToLogin={() => setActiveTab('login')}
          onSuccess={() => setEmailSent(true)}
        />
      )}
    </Modal>
  )
}
