'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  formAction: (formData: FormData) => void
  children: React.ReactNode
}

export function SubmitButton({ formAction, children }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      formAction={formAction}
      disabled={pending}
      className="w-full flex items-center justify-center bg-white text-black font-bold tracking-[0.2em] uppercase font-mono py-3 rounded-xl hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-80 disabled:cursor-wait"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="opacity-80 text-xs tracking-[0.2em]">PROCESSING...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
