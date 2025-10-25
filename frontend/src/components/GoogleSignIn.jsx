import React, { useEffect, useState, useRef } from 'react'
import { getApiUrl } from '../config'

export default function GoogleSignIn({ onAuth, containerId = 'gsi-button' }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.warn('Google Client ID not set. Update frontend/.env VITE_GOOGLE_CLIENT_ID')
      return
    }

    function tryInit() {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse
        })
        const el = document.getElementById(containerId)
        if (el) {
          // render a compact button in headers or a large one in the login card
          const size = containerId === 'gsi-button' ? 'large' : 'medium'
          window.google.accounts.id.renderButton(el, { theme: 'outline', size })
          setReady(true)
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      }
    }

    // Try immediately and then poll for the script to load (it is loaded async)
    tryInit()
    if (!ready) {
      intervalRef.current = setInterval(tryInit, 300)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCredentialResponse(response) {
    try {
      const idToken = response.credential
      const res = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken })
      })
      const json = await res.json()
      if (json.ok) {
        setError(null)
        onAuth(json.user)
      } else {
        console.error('Auth failed', json)
        setError(json.error || 'Authentication failed')
      }
    } catch (err) {
      console.error('Auth request failed', err)
      setError('Authentication request failed')
    }
  }

    return (
    <div>
      <div id={containerId} />
      {error && <div style={{ marginTop: 8, color: '#b91c1c', fontWeight: 600 }}>{error}</div>}
      {!ready && (
        <div style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
          Waiting for Google script to load. If nothing appears:
          <ul>
            <li>Make sure `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` is set to your Client ID.</li>
            <li>Ensure http://localhost:5173 is listed in Google Cloud Console (Authorized JavaScript origins).</li>
            <li>Check the browser console for errors.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
