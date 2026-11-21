"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Admin login — completely separate from the citizen login at /login.
export default function AdminLoginPage(){
	const [form, setForm] = useState({ email: '', password: '' })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	// Already logged in as admin? Go straight to the dashboard.
	useEffect(() => {
		fetch('/api/admin/auth/me').then(r => { if (r.ok) router.replace('/admin') }).catch(() => {})
	}, [router])

	function update(key, value){ setForm(prev => ({ ...prev, [key]: value })) }

	async function handleSubmit(e){
		e.preventDefault()
		setLoading(true)
		setError('')
		try {
			const res = await fetch('/api/admin/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			})
			const data = await res.json().catch(() => ({}))
			if (res.ok) {
				try{ window.dispatchEvent(new Event('auth-changed')) }catch{}
				router.push('/admin')
				router.refresh()
			} else {
				setError(data.error || 'Admin login failed')
			}
		} catch {
			setError('Network error. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className="auth-container">
			<div className="auth-form">
				<h1>Admin Login</h1>
				<p className="muted" style={{textAlign:'center',marginTop:-8}}>Authorized administrators only</p>
				<form onSubmit={handleSubmit} className="form">
					{error && <div style={{color:'var(--danger)',textAlign:'center'}}>{error}</div>}

					<div className="field">
						<label>Admin Email</label>
						<input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="admin@example.com" required />
					</div>

					<div className="field">
						<label>Password</label>
						<input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Admin password" required />
					</div>

					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? 'Logging in...' : 'Login as Admin'}
					</button>
				</form>

				<div className="auth-links">
					<p className="muted" style={{fontSize:13}}>Not an admin? <Link href="/login">Citizen login</Link></p>
				</div>
			</div>
		</main>
	)
}
