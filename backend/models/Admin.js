import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Admins live in their own collection ("admins"), completely separate from citizens ("users").
const adminSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, unique: true, trim: true, lowercase: true },
	password: { type: String, required: true, minlength: 6 },
	createdAt: { type: Date, default: Date.now }
})

adminSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()
	try {
		this.password = await bcrypt.hash(this.password, 10)
		next()
	} catch (err) {
		next(err)
	}
})

adminSchema.methods.comparePassword = function (candidate) {
	return bcrypt.compare(candidate, this.password)
}

adminSchema.methods.toJSON = function () {
	const obj = this.toObject()
	delete obj.password
	obj.role = 'admin'
	return obj
}

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema)
