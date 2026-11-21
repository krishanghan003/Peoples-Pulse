import { NextResponse } from 'next/server'
import connectDB from '@/backend/config/db.js'
import Complaint from '@/backend/models/Complaint.js'
import { getAdmin } from '@/backend/lib/auth.js'

const ALLOWED = ['pending', 'forwarded', 'acknowledged', 'resolved']

export async function PATCH(req, { params }) {
	try {
		const admin = await getAdmin(req)
		if (!admin) return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })

		const { status } = await req.json().catch(() => ({}))
		if (!ALLOWED.includes(status)) {
			return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
		}

		await connectDB()
		const complaint = await Complaint.findById(params.id)
		if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 })

		complaint.status = status
		complaint.timeline.push({ at: new Date(), text: `Status changed to ${status}`, action: 'admin-update' })
		await complaint.save()
		return NextResponse.json({ message: 'Updated successfully' })
	} catch (error) {
		console.error('Admin update error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
