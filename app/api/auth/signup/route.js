import { NextResponse } from 'next/server'
import connectDB from '@/backend/config/db.js'
import User from '@/backend/models/User.js'
import { normalizeEmail } from '@/backend/lib/auth.js'

// Public signup creates CITIZEN accounts only. There is no way to sign up as admin.
export async function POST(req) {
	try {
		await connectDB()
		const body = await req.json().catch(() => ({}))
		const name = typeof body.name === 'string' ? body.name.trim() : ''
		const email = normalizeEmail(body.email)
		const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
		const password = typeof body.password === 'string' ? body.password : ''

		if (!name || !email || !password) {
			return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
		}
		if (password.length < 6) {
			return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
		}

		if (await User.findOne({ email })) {
			return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
		}

		await new User({ name, email, phone, password }).save()
		return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
	} catch (error) {
		if (error?.code === 11000) {
			return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
		}
		console.error('Signup error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
