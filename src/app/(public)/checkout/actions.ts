'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function loginAction(
  email: string,
  password: string,
): Promise<{ ok: boolean }> {
  try {
    await signIn('credentials', { email, password, redirect: false })
    return { ok: true }
  } catch (e) {
    if (e instanceof AuthError) return { ok: false }
    // next-auth v5 beta may throw a NEXT_REDIRECT even with redirect:false.
    // A redirect from credentials means auth succeeded (failed auth throws AuthError).
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('NEXT_REDIRECT')) return { ok: true }
    return { ok: false }
  }
}
