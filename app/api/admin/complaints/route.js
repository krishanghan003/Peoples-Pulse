import { NextResponse } from 'next/server'
import connectDB from '@/backend/config/db.js'
import Complaint from '@/backend/models/Complaint.js'
import { getAdmin } from '@/backend/lib/auth.js'

export async function GET(req) {
	try {
		const admin = await getAdmin(req)
		if (!admin) return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })

		await connectDB()
		const items = await Complaint.find()
			.populate('userId', 'name email')
			.sort({ createdAt: -1 })
			.limit(200)
			.select('-__v -images') // keep list light: no base64 photos
			.lean()

		const agg = await Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
		const counts = { total: 0, pending: 0, forwarded: 0, acknowledged: 0, resolved: 0 }
		agg.forEach(r => {
			counts.total += r.count
			if (r._id in counts) counts[r._id] = r.count
		})

		return NextResponse.json({ items, counts })
	} catch (error) {
		console.error('Admin complaints error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
