// Central auth helpers.
// Citizens and admins are COMPLETELY separate:
//   - different MongoDB collections (users / admins)
//   - different cookies          (pp_user_token / pp_admin_token)
//   - different JWT secrets + audiences
// A citizen token can never be accepted as an admin token and vice-versa.
import jwt from 'jsonwebtoken'
import connectDB from '@/backend/config/db.js'
import User from '@/backend/models/User.js'
import Admin from '@/backend/models/Admin.js'

export const USER_COOKIE = 'pp_user_token'
export const ADMIN_COOKIE = 'pp_admin_token'

const USER_MAX_AGE = 7 * 24 * 60 * 60 // seconds
const ADMIN_MAX_AGE = 8 * 60 * 60 // seconds

function secret(name, devFallback) {
	const value = process.env[name]
	if (value) return value
	if (process.env.NODE_ENV === 'production') {
		throw new Error(`${name} environment variable is required in production`)
	}
	return devFallback
}

const userSecret = () => secret('JWT_SECRET', 'dev-only-user-secret-change-me')
const adminSecret = () => secret('ADMIN_JWT_SECRET', 'dev-only-admin-secret-change-me')

export function signUserToken(user) {
	return jwt.sign({ id: String(user._id) }, userSecret(), {
		expiresIn: USER_MAX_AGE,
		audience: 'pp-user'
	})
}

export function signAdminToken(admin) {
	return jwt.sign({ id: String(admin._id) }, adminSecret(), {
		expiresIn: ADMIN_MAX_AGE,
		audience: 'pp-admin'
	})
}

export function setUserCookie(res, token) {
	res.cookies.set(USER_COOKIE, token, cookieOpts(USER_MAX_AGE))
}
export function setAdminCookie(res, token) {
	res.cookies.set(ADMIN_COOKIE, token, cookieOpts(ADMIN_MAX_AGE))
}
export function clearCookie(res, name) {
	res.cookies.set(name, '', cookieOpts(0))
}

function cookieOpts(maxAge) {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge // seconds
	}
}

/** Returns the logged-in CITIZEN (User document) or null. Never returns an admin. */
export async function getUser(req) {
	const token = req.cookies.get(USER_COOKIE)?.value
	if (!token) return null
	try {
		const decoded = jwt.verify(token, userSecret(), { audience: 'pp-user' })
		await connectDB()
		return (await User.findById(decoded.id).select('-password')) || null
	} catch {
		return null
	}
}

/** Returns the logged-in ADMIN (Admin document) or null. Never returns a citizen. */
export async function getAdmin(req) {
	const token = req.cookies.get(ADMIN_COOKIE)?.value
	if (!token) return null
	try {
		const decoded = jwt.verify(token, adminSecret(), { audience: 'pp-admin' })
		await connectDB()
		return (await Admin.findById(decoded.id).select('-password')) || null
	} catch {
		return null
	}
}

export function normalizeEmail(email) {
	return typeof email === 'string' ? email.trim().toLowerCase() : ''
}
