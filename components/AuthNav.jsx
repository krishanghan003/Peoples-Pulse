"use client"
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/components/I18nProvider'

// Shows EITHER the citizen nav OR the admin nav depending on where you are.
// The two sessions are independent (different cookies / APIs).
export function AuthNav(){
	const { t } = useI18n()
	const router = useRouter()
	const pathname = usePathname() || ''
	const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/')

	const [person, setPerson] = useState(null)
	const [loading, setLoading] = useState(true)

	const checkAuth = useCallback(async () => {
		try {
			const res = await fetch(isAdminArea ? '/api/admin/auth/me' : '/api/auth/me', { cache: 'no-store' })
			setPerson(res.ok ? await res.json() : null)
		} catch {
			setPerson(null)
		} finally {
			setLoading(false)
		}
	}, [isAdminArea])

	useEffect(() => {
		setLoading(true)
		checkAuth()
		const onFocus = () => checkAuth()
		window.addEventListener('focus', onFocus)
		window.addEventListener('auth-changed', onFocus)
		return () => {
			window.removeEventListener('focus', onFocus)
			window.removeEventListener('auth-changed', onFocus)
		}
	}, [checkAuth, pathname])

	async function handleLogout(){
		try {
			await fetch(isAdminArea ? '/api/admin/auth/logout' : '/api/auth/logout', { method: 'POST' })
		} catch (error) {
			console.error('Logout failed:', error)
		}
		setPerson(null)
		window.dispatchEvent(new Event('auth-changed'))
		router.push(isAdminArea ? '/admin/login' : '/')
		router.refresh()
	}

	if (loading) return <div className="auth-nav-loading">Loading...</div>

	// ---- Admin area
	if (isAdminArea) {
		if (person) {
			return (
				<div className="auth-nav">
					<Link href="/admin" className="auth-nav-link admin-link">Dashboard</Link>
					<button onClick={handleLogout} className="auth-nav-link logout-btn">{t('logout')}</button>
				</div>
			)
		}
		return (
			<div className="auth-nav">
				<Link href="/admin/login" className="auth-nav-link">Admin Login</Link>
			</div>
		)
	}

	// ---- Citizen area
	if (person) {
		return (
			<div className="auth-nav">
				<Link href="/profile" className="auth-nav-link profile-link">{t('profile')}</Link>
				<button onClick={handleLogout} className="auth-nav-link logout-btn">{t('logout')}</button>
			</div>
		)
	}

	return (
		<div className="auth-nav">
			<Link href="/login" className="auth-nav-link">{t('login')}</Link>
			<Link href="/signup" className="auth-nav-link">{t('signup')}</Link>
		</div>
	)
}
