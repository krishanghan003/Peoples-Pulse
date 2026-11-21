import { NextResponse } from 'next/server'
import connectDB from '@/backend/config/db.js'
import Admin from '@/backend/models/Admin.js'
import { signAdminToken, setAdminCookie, normalizeEmail } from '@/backend/lib/auth.js'

// ADMIN login only. Looks in the "admins" collection, never in "users".
export async function POST(req) {
	try {
		await connectDB()
		const body = await req.json().catch(() => ({}))
		const email = normalizeEmail(body.email)
		const password = typeof body.password === 'string' ? body.password : ''

		if (!email || !password) {
			return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
		}

		const admin = await Admin.findOne({ email })
		if (!admin || !(await admin.comparePassword(password))) {
			return NextResponse.json({ error: 'Invalid admin email or password' }, { status: 401 })
		}

		const res = NextResponse.json({ message: 'Admin login successful', admin: admin.toJSON() })
		setAdminCookie(res, signAdminToken(admin))
		return res
	} catch (error) {
		console.error('Admin login error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
