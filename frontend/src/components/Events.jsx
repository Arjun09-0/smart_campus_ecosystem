import React, { useEffect, useState } from 'react'
import Hero from './Hero'
import { getApiUrl } from '../config'

export default function Events() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const res = await fetch(getApiUrl('/api/events'))
      const j = await res.json()
      if (j.ok) setEvents(j.events || [])
    } catch (err) {
      console.error('Failed to load events', err)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(getApiUrl('/api/events'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      })
      const j = await res.json()
      if (j.ok) {
        setEvents(prev => [j.event, ...prev])
        setForm({ title: '', description: '', date: '', location: '' })
        setShowForm(false)
        setMessage('Event created')
        setTimeout(() => setMessage(null), 3000)
      } else {
        console.error('Create failed', j)
        setMessage(j.error || 'Failed to create')
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Hero title="Campus Events" subtitle="Discover upcoming campus activities and join the community." />

      <div className="container" style={{ marginTop: 18 }}>
        <div className="page-header">
          <h2 className="page-title">Campus Events</h2>
          <div className="top-right">
            <button className="btn" onClick={() => setShowForm(true)}>Create Event</button>
          </div>
        </div>
        {message && <div className="card" style={{ marginBottom: 12 }}>{message}</div>}

        {events.length === 0 ? (
          <div className="card empty-state">No upcoming events</div>
        ) : (
          <ul>
            {events.map(ev => (
              <li key={ev._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{ev.title}</strong>
                  <span style={{ color: '#6b7280' }}>{new Date(ev.date).toLocaleDateString()}</span>
                </div>
                <div style={{ color: '#374151' }}><strong>Venue:</strong> {ev.location || 'TBA'}</div>
                <div style={{ color: '#555' }}>{ev.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Create Event</h3>
              <button className="btn small" onClick={() => setShowForm(false)}>Close</button>
            </div>

            <form onSubmit={submit}>
              <div>
                <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <input type="date" placeholder="Date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn" disabled={loading}>{loading ? 'Posting...' : 'Create Event'}</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
