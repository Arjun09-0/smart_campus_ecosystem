import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import GoogleSignIn from './components/GoogleSignIn'
import Events from './components/Events'
import LostItems from './components/LostItems'
import IssueForm from './components/IssueForm'
import Clubs from './components/Clubs'
import ClubDetail from './components/ClubDetail'
import NavBar from './components/NavBar'
import FacultyDashboard from './components/FacultyDashboard'
import AdminDashboard from './components/AdminDashboard'
import { getApiUrl } from './config'

function Home({ user }) {
  return (
    <>
      <section className="hero" aria-label="Welcome">
        <div className="hero-inner container">
          <div className="hero-left">
            <h1 className="hero-title">Welcome to <span className="accent">Smart Campus</span></h1>
            <p className="hero-sub">A simple portal to discover campus events and report lost &amp; found items. Fast reporting, community help, and official event listings — all in one place.</p>
            <div className="hero-cta-stack" style={{ marginTop: 18 }}>
              <Link to="/events" className="hero-cta primary">Browse Events</Link>
              <Link to="/lost-and-found" className="hero-cta success">Report Lost / Found</Link>
              <Link to="/clubs" className="hero-cta vivid">Browse Clubs</Link>
              <Link to="/feedback" className="hero-cta sun">Give Feedback</Link>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-images">
              <div className="img img-1" />
              <div className="img img-2" />
              <div className="img img-3" />
            </div>
          </div>
        </div>
      </section>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>About this portal</h2>
        <p className="muted">This portal helps students and staff find campus events, report lost &amp; found items, discover student clubs, and send feedback to the administration. Use the navigation or the buttons above to explore Events, Lost &amp; Found, Clubs, or Feedback.</p>
        {user && <div style={{ marginTop: 12 }} className="muted">Signed in as {user.name} ({user.email})</div>}
      </div>
    </>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(getApiUrl('/api/auth/me'), { credentials: 'include' })
      .then(r => r.json())
      .then(j => setUser(j.user))
  }, [])

  async function logout() {
    await fetch(getApiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' })
    setUser(null)
    navigate('/')
  }

  return (
    <div className="app-root">
      <header className="site-header">
        <div className="container header-row">
          <h1 className="brand">Smart Campus Portal</h1>
          {user && <NavBar user={user} />}
          <div>
            {!user ? (
              <button className="btn small" onClick={() => setShowSignInModal(true)}>Sign In</button>
            ) : (
              <>
                <span className="user-name">{user.name}</span>
                <button className="btn small" onClick={logout}>Sign Out</button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container main">
        <main>
          {!user ? (
            <>
            <div className="login-page">
              <div className="login-card">
                <h1 className="login-brand">Smart Campus Portal</h1>
                <p className="login-sub">Sign in with your KLH account to access events, clubs, lost &amp; found, and campus feedback tools.</p>
                <GoogleSignIn onAuth={setUser} />
                <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
                  Only <strong>@klh.edu.in</strong> accounts are permitted. If you need help, contact campus IT.
                </p>
              </div>
            </div>

            {/* Sign-in modal for header button */}
            {showSignInModal && (
              <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setShowSignInModal(false) }}>
                <div className="modal">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ margin: 0 }}>Sign In</h3>
                    <button className="btn small" onClick={() => setShowSignInModal(false)}>Close</button>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p className="muted">Sign in with your KLH account</p>
                    <GoogleSignIn onAuth={(u) => { setUser(u); setShowSignInModal(false) }} containerId="header-gsi" />
                  </div>
                </div>
              </div>
            )}
            </>
          ) : (
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/events" element={<Events />} />
              <Route path="/lost-and-found" element={<LostItems />} />
              <Route path="/feedback" element={<IssueForm type="feedback" />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/clubs/:id" element={<ClubDetail />} />
              {/* Role-based routes */}
              <Route path="/faculty" element={<React.Suspense fallback={<div>Loading...</div>}><FacultyDashboard user={user} /></React.Suspense>} />
              <Route path="/admin" element={<React.Suspense fallback={<div>Loading...</div>}><AdminDashboard user={user} /></React.Suspense>} />
            </Routes>
          )}
        </main>
  </div>
    </div>
  )
}
