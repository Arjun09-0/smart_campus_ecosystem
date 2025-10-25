import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ClubDetail() {
  const { id } = useParams()
  const [club, setClub] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchClub(); fetchUser() }, [])

  async function fetchClub() {
    try {
      const res = await fetch(`/api/clubs/${id}`)
      const j = await res.json()
      if (j.ok) setClub(j.club)
    } catch (err) { console.error(err) }
  }

  async function fetchUser() {
    try {
      const r = await fetch('/api/auth/me', { credentials: 'include' })
      const j = await r.json()
      if (j.ok) setCurrentUser(j.user)
    } catch (err) { console.error(err) }
  }

  async function join() {
    setLoading(true)
    try {
      const res = await fetch(`/api/clubs/${id}/join`, { method: 'POST', credentials: 'include' })
      const j = await res.json()
      if (j.ok) setClub(j.club)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function leave() {
    setLoading(true)
    try {
      const res = await fetch(`/api/clubs/${id}/leave`, { method: 'POST', credentials: 'include' })
      const j = await res.json()
      if (j.ok) setClub(j.club)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function removeClub() {
    if (!window.confirm('Delete this club?')) return
    try {
      const res = await fetch(`/api/clubs/${id}`, { method: 'DELETE', credentials: 'include' })
      const j = await res.json()
      if (j.ok) navigate('/clubs')
      else alert(j.error || 'Failed')
    } catch (err) { console.error(err) }
  }

  if (!club) return <div>Loading...</div>

  const isMember = currentUser && club.members && club.members.some(m => (m._id ? m._id === currentUser._id : m === currentUser._id))
  const isOwner = currentUser && club.owner && ((club.owner._id && club.owner._id === currentUser._id) || (club.owner === currentUser._id))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{club.name}</h2>
        <div>
          {isMember ? (
            <button className="btn" onClick={leave} disabled={loading}>Leave</button>
          ) : (
            <button className="btn" onClick={join} disabled={loading}>Join</button>
          )}
          {isOwner && <button className="btn danger" onClick={removeClub} style={{ marginLeft: 8 }}>Delete</button>}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ color: '#6b7280' }}>Contact: {club.contact || '—'}</div>
        <p style={{ marginTop: 8 }}>{club.description}</p>
        <div style={{ marginTop: 12 }}>
          <h4>Members ({club.members ? club.members.length : 0})</h4>
          <ul>
            {club.members && club.members.map(m => (
              <li key={m._id || m}>{m.name || m.email || m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
