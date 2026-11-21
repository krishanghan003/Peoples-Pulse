import { NextResponse } from 'next/server'
import connectDB from '@/backend/config/db.js'
import User from '@/backend/models/User.js'
import { signUserToken, setUserCookie, normalizeEmail } from '@/backend/lib/auth.js'

// CITIZEN login only. Admins log in at /api/admin/auth/login.
export async function POST(req) {
	try {
		await connectDB()
		const body = await req.json().catch(() => ({}))
		const email = normalizeEmail(body.email)
		const password = typeof body.password === 'string' ? body.password : ''

		if (!email || !password) {
			return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
		}

		const user = await User.findOne({ email })
		if (!user || !(await user.comparePassword(password))) {
			return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
		}

		const res = NextResponse.json({ message: 'Login successful', user: user.toJSON() })
		setUserCookie(res, signUserToken(user))
		return res
	} catch (error) {
		console.error('Login error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
