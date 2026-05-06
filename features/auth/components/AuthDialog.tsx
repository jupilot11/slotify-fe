'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
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
        <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
      )}
    </Modal>
  )
}
