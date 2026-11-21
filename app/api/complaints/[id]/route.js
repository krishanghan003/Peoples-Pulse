import { NextResponse } from 'next/server'
import connectDB from '@/backend/config/db.js'
import Complaint from '@/backend/models/Complaint.js'
import { getUser } from '@/backend/lib/auth.js'

// Citizen-facing endpoints: a citizen can only read/delete THEIR OWN complaints.

async function loadOwned(req, id) {
	const user = await getUser(req)
	if (!user) return { res: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
	await connectDB()
	let complaint = null
	try { complaint = await Complaint.findById(id) } catch { /* invalid id */ }
	if (!complaint) return { res: NextResponse.json({ error: 'Complaint not found' }, { status: 404 }) }
	if (String(complaint.userId) !== String(user._id)) {
		return { res: NextResponse.json({ error: 'Access denied' }, { status: 403 }) }
	}
	return { complaint, user }
}

export async function GET(req, { params }) {
	try {
		const { res, complaint } = await loadOwned(req, params.id)
		if (res) return res
		const obj = complaint.toObject()
		delete obj.__v
		if (obj.images) obj.images = obj.images.map(({ base64Data, ...rest }) => rest)
		return NextResponse.json(obj)
	} catch (error) {
		console.error('Get complaint error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function DELETE(req, { params }) {
	try {
		const { res, complaint } = await loadOwned(req, params.id)
		if (res) return res
		await Complaint.findByIdAndDelete(complaint._id)
		return NextResponse.json({ message: 'Complaint deleted successfully' })
	} catch (error) {
		console.error('Delete complaint error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
