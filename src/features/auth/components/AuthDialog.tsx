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
  inline?: boolean
}

export default function AuthDialog({ isOpen, onClose, defaultTab = 'login', inline = false }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)
  const [emailSent, setEmailSent] = useState(false)

  const emailSentContent = (
    <div className="flex flex-col items-center text-center py-6 gap-5">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-sm ring-1 ring-indigo-100">
        <svg
          className="w-8 h-8 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          We&apos;ve sent a confirmation link to your inbox. Click it to activate your account.
        </p>
      </div>
      <Button className="w-full mt-1" size="lg" onClick={onClose}>
        Got it
      </Button>
    </div>
  )

  const mainContent = (
    <>
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-indigo-600 tracking-wide">Slotify</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-slate-400">
            {activeTab === 'login'
              ? 'Sign in to your Slotify account'
              : 'Start managing bookings and queues in minutes'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors rounded-lg p-1.5 hover:bg-slate-50 -mt-0.5"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex bg-slate-100 rounded-xl p-1 mt-5 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={cn(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150',
            activeTab === 'login'
              ? 'bg-white text-indigo-600 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={cn(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150',
            activeTab === 'register'
              ? 'bg-white text-indigo-600 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          Register
        </button>
      </div>

      {activeTab === 'login' ? (
        <>
          <LoginForm />
          <p className="text-center text-sm text-slate-400 mt-5">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
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
    </>
  )

  if (inline) {
    return emailSent ? emailSentContent : mainContent
  }

  if (emailSent) {
    return <Modal isOpen={isOpen} onClose={onClose}>{emailSentContent}</Modal>
  }

  return <Modal isOpen={isOpen} onClose={onClose}>{mainContent}</Modal>
}
