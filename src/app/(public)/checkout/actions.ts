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
    throw e
  }
}
