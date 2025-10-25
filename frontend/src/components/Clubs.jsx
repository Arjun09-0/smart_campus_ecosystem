import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Clubs() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', contact: '' })
  const [message, setMessage] = useState(null)

  useEffect(() => { fetchClubs() }, [])

  async function fetchClubs() {
    try {
      const res = await fetch('/api/clubs')
      const j = await res.json()
      if (j.ok) setClubs(j.clubs || [])
    } catch (err) { console.error(err) }
  }

  async function createClub(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/clubs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) })
      const j = await res.json()
      if (j.ok) {
        setClubs(prev => [j.club, ...prev])
        setForm({ name: '', description: '', contact: '' })
        setShowForm(false)
        setMessage('Created')
        setTimeout(() => setMessage(null), 2000)
      } else {
        setMessage(j.error || 'Failed')
      }
    } catch (err) { console.error(err); setMessage('Network error') }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Clubs & Student Organizations</h2>
        <div>
          <button className="btn" onClick={() => setShowForm(true)}>Create Club</button>
        </div>
      </div>

      {message && <div className="card" style={{ marginTop: 8 }}>{message}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Create Club</h3>
            <form onSubmit={createClub}>
              <div><input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><input placeholder="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
              <div><textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div style={{ marginTop: 8 }}>
                <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12, marginTop: 12 }}>
        {clubs.map(c => (
          <div key={c._id} className="card">
            <h4>{c.name}</h4>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{c.contact}</div>
            <p style={{ color: '#374151' }}>{c.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to={`/clubs/${c._id}`} className="btn small">Open</Link>
              <div style={{ fontSize: 12, color: '#888' }}>{(c.members && c.members.length) || 0} members</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
