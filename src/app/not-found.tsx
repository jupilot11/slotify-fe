import Link from 'next/link'
import Logo from '@/components/layout/Logo'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 flex items-center px-6">
        <Logo />
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl font-bold text-slate-200 mb-4">404</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
          <p className="text-slate-500 mb-8">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
