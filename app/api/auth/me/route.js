import { NextResponse } from 'next/server'
import { getUser } from '@/backend/lib/auth.js'

export async function GET(req) {
	const user = await getUser(req)
	if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
	return NextResponse.json(user)
}
