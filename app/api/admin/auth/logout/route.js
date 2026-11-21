import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, clearCookie } from '@/backend/lib/auth.js'

// Only clears the admin session. A citizen session (if any) is untouched.
export async function POST() {
	const res = NextResponse.json({ message: 'Admin logged out' })
	clearCookie(res, ADMIN_COOKIE)
	return res
}
