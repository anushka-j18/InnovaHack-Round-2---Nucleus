import { login, signup } from './actions'
import { SubmitButton } from './SubmitButton'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string, mode?: string }> }) {
  const params = await searchParams
  const error = params?.error
  const mode = params?.mode

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#151520_0%,var(--bg-dark)_50%)]" />
      <div className="absolute top-0 w-full h-[50vh] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05)_0%,transparent_60%)] pointer-events-none" />
      <div className="bg-grid absolute inset-0 opacity-[0.05] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white flex items-center gap-2 text-sm font-mono tracking-widest transition-colors z-20">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="glass-panel w-full max-w-md p-10 relative z-10 flex flex-col items-center bento-reveal">
        <Image 
          src="/logo/nucleus-white-bgr.png" 
          alt="Nucleus Logo" 
          width={60} 
          height={60} 
          className="w-16 h-16 object-contain mb-8 opacity-80"
        />
        
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
          {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p className="text-white/60 font-light text-sm mb-8 text-center">
          {mode === 'signup' 
            ? 'Join Nucleus to start compressing massive contexts.'
            : 'Sign in to access your Nucleus dashboard and compress contexts.'}
        </p>

        <form className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-mono tracking-widest text-white/40 uppercase pl-2">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="developer@company.com"
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-mono tracking-widest text-white/40 uppercase pl-2">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required
              placeholder="••••••••"
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-2">
              <p className="text-red-400 text-xs font-mono text-center">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 mt-4">
            {mode === 'signup' ? (
              <>
                <SubmitButton formAction={signup}>
                  Create Account
                </SubmitButton>
                <Link 
                  href="/login"
                  className="text-white/40 hover:text-white text-xs font-mono text-center mt-2 transition-colors uppercase tracking-widest"
                >
                  Already have an account? Sign In
                </Link>
              </>
            ) : (
              <>
                <SubmitButton formAction={login}>
                  Sign In
                </SubmitButton>
                <Link 
                  href="/login?mode=signup"
                  className="text-white/40 hover:text-white text-xs font-mono text-center mt-2 transition-colors uppercase tracking-widest"
                >
                  Don&apos;t have an account? Sign Up
                </Link>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
