// Create or reset an ADMIN account (stored in the separate "admins" collection).
// Usage:  npm run create-admin -- "Admin Name" admin@example.com StrongPassword123
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// minimal .env.local loader (no extra dependency)
for (const file of ['.env.local', '.env']) {
	const p = path.resolve(process.cwd(), file)
	if (!fs.existsSync(p)) continue
	for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
		if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
	}
}

const [name, emailRaw, password] = process.argv.slice(2)
if (!name || !emailRaw || !password) {
	console.error('Usage: npm run create-admin -- "Admin Name" admin@example.com Password')
	process.exit(1)
}
if (password.length < 6) {
	console.error('Password must be at least 6 characters')
	process.exit(1)
}

const email = emailRaw.trim().toLowerCase()
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/peoples-pulse'

await mongoose.connect(uri)
const admins = mongoose.connection.collection('admins')
const hash = await bcrypt.hash(password, 10)
const existing = await admins.findOne({ email })
if (existing) {
	await admins.updateOne({ email }, { $set: { name, password: hash } })
	console.log(`Updated existing admin: ${email}`)
} else {
	await admins.insertOne({ name, email, password: hash, createdAt: new Date() })
	await admins.createIndex({ email: 1 }, { unique: true })
	console.log(`Created admin: ${email}`)
}
await mongoose.disconnect()
