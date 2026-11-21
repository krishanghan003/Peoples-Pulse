"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/components/I18nProvider'

export default function LoginPage(){
	const { t } = useI18n()
	const [form, setForm] = useState({ email: '', password: '' })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [info, setInfo] = useState('')
	const router = useRouter()

	useEffect(() => {
		const msg = new URLSearchParams(window.location.search).get('message')
		if (msg) setInfo(msg)
	}, [])

	function update(key, value){
		setForm(prev => ({ ...prev, [key]: value }))
	}

	async function handleSubmit(e){
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			})

			const data = await res.json()

			if (res.ok) {
				try{ window.dispatchEvent(new Event('auth-changed')) }catch{}
				// Only allow safe, same-site, NON-admin redirects for citizens
				const r = new URLSearchParams(window.location.search).get('redirect')
				const safe = r && r.startsWith('/') && !r.startsWith('//') && !r.startsWith('/admin')
				router.push(safe ? r : '/profile')
				router.refresh()
			} else {
				setError(data.error || 'Login failed')
			}
		} catch (error) {
			setError('Network error. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className="auth-container">
			<div className="auth-form">
				<h1>{t('login')}</h1>
				<p className="muted" style={{textAlign:'center',marginTop:-8}}>Citizen login</p>
				<form onSubmit={handleSubmit} className="form">
					{info && <div style={{color:'var(--success, #16a34a)',textAlign:'center'}}>{info}</div>}
					{error && <div style={{color:'var(--danger)',textAlign:'center'}}>{error}</div>}
					
					<div className="field">
						<label>Email</label>
						<input
							type="email"
							value={form.email}
							onChange={e => update('email', e.target.value)}
							placeholder="your@email.com"
							required
						/>
					</div>

					<div className="field">
						<label>Password</label>
						<input
							type="password"
							value={form.password}
							onChange={e => update('password', e.target.value)}
							placeholder="Your password"
							required
						/>
					</div>

					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? 'Logging in...' : t('login')}
					</button>
				</form>

				<div className="auth-links">
					<p>Don't have an account? <Link href="/signup">{t('signup')}</Link></p>
					<p className="muted" style={{fontSize:13}}>Government administrator? <Link href="/admin/login">Admin login</Link></p>
				</div>
			</div>
		</main>
	)
}
