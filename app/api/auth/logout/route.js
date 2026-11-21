import { NextResponse } from 'next/server'
import { USER_COOKIE, clearCookie } from '@/backend/lib/auth.js'

// Only clears the citizen session. An admin session (if any) is untouched.
export async function POST() {
	const res = NextResponse.json({ message: 'Logged out successfully' })
	clearCookie(res, USER_COOKIE)
	return res
}
