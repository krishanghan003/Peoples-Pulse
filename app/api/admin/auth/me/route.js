import { NextResponse } from 'next/server'
import { getAdmin } from '@/backend/lib/auth.js'

export async function GET(req) {
	const admin = await getAdmin(req)
	if (!admin) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
	return NextResponse.json({ ...admin.toJSON() })
}
