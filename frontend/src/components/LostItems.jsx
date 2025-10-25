import React, { useEffect, useState } from 'react'
import Hero from './Hero'
import { useNavigate } from 'react-router-dom'

export default function LostItems() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', description: '', location: '', contact: '', found: false })
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
    // fetch current user for ownership checks
    ;(async () => {
      try {
        const r = await fetch('/api/auth/me', { credentials: 'include' })
        const j = await r.json()
        if (j.ok) setCurrentUser(j.user)
      } catch (err) {
        console.error('failed to fetch current user', err)
      }
    })()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch('/api/lost-items')
      const j = await res.json()
      if (j.ok) setItems(j.items || [])
    } catch (err) {
      console.error('Failed to load lost items', err)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/lost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      })
      const j = await res.json()
      if (j.ok) {
        setItems(prev => [j.item, ...prev])
        setForm({ title: '', description: '', location: '', contact: '', found: false })
        setShowForm(false)
        setMessage('Reported')
        setTimeout(() => setMessage(null), 2500)
      } else {
        console.error('Submit failed', j)
        setMessage(j.error || 'Failed')
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error')
    } finally {
      setLoading(false)
    }
  }

  // mark an item returned (owner only)
  async function markReturned(id) {
    try {
      const res = await fetch(`/api/lost-items/${id}/return`, { method: 'PATCH', credentials: 'include' })
      const j = await res.json()
      if (j.ok) {
        setItems(prev => prev.map(it => it._id === j.item._id ? j.item : it))
      } else {
        setMessage(j.error || 'Failed')
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error')
    }
  }

  // delete an item (owner only)
  async function deleteItem(id) {
    if (!window.confirm('Remove this item? This cannot be undone.')) return
    try {
      console.log('[DELETE] currentUser=', currentUser)
      const res = await fetch(`/api/lost-items/${id}`, { method: 'DELETE', credentials: 'include' })
      const text = await res.text()
      let j
      try { j = JSON.parse(text) } catch (e) { j = { ok: false, raw: text } }
      console.log('[DELETE] resp status=', res.status, 'body=', j)
      if (res.status === 200 && j.ok) {
        setItems(prev => prev.filter(it => it._id !== id))
        setMessage('Removed')
      } else if (res.status === 403) {
        setMessage('Not allowed — you are not the reporter or not signed in')
      } else if (res.status === 404) {
        setMessage('Item not found')
      } else {
        setMessage(j.error || 'Failed')
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error')
    }
  }

  // Prepare hero buttons so the hero's CTAs open the report modal and set found state
  const heroButtons = [
    { label: 'Report Lost', variant: 'danger', onClick: () => { setForm(prev => ({ ...prev, found: false })); setShowForm(true) } },
    { label: 'Report Found', variant: 'success', onClick: () => { setForm(prev => ({ ...prev, found: true })); setShowForm(true) } }
  ]

  return (
    <div>
      <Hero title="Find & Recover" subtitle="Report lost items or mark found items to help the community." buttons={heroButtons} />

      <div className="container" style={{ marginTop: 18 }}>
        {message && <div className="card" style={{ marginBottom: 12 }}>{message}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button className="btn" onClick={() => setShowForm(true)}>Report Item</button>
        </div>

        {/* Split into Lost and Found sections */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }} className="card">
            <h3>Lost</h3>
            {items.filter(it => it.status !== 'found').length === 0 ? (
              <div className="empty-state">No lost items</div>
            ) : (
              <ul>
                {items.filter(it => it.status !== 'found').map(it => (
                  <li key={it._id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{it.title}</strong>
                      <span style={{ color: '#6b7280' }}>{it.location}</span>
                    </div>
                    <div style={{ color: '#374151' }}>{it.description}</div>
                    <div style={{ color: '#374151', fontSize: 13, marginTop: 6 }}>Contact: {it.contact || '—'}</div>
                    <div style={{ color: '#374151', fontSize: 12, marginTop: 6 }}>Reported by: {it.reportedBy && (it.reportedBy.name || it.reportedBy.email || it.reportedBy)}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{it.status}</div>
                    {/* owner actions */}
                    {currentUser && (() => {
                      const reporterId = it.reportedBy && (it.reportedBy._id || it.reportedBy)
                      const isOwner = reporterId && String(reporterId) === String(currentUser._id)
                      return isOwner ? (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          {it.status !== 'returned' && (
                            <button className="btn small" onClick={() => markReturned(it._id)}>Mark returned</button>
                          )}
                          <button className="btn small" onClick={() => deleteItem(it._id)}>Remove</button>
                        </div>
                      ) : null
                    })()}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 260 }} className="card">
            <h3>Found</h3>
            {items.filter(it => it.status === 'found').length === 0 ? (
              <div className="empty-state">No found items</div>
            ) : (
              <ul>
                {items.filter(it => it.status === 'found').map(it => (
                  <li key={it._id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{it.title}</strong>
                      <span style={{ color: '#6b7280' }}>{it.location}</span>
                    </div>
                    <div style={{ color: '#374151' }}>{it.description}</div>
                    <div style={{ color: '#374151', fontSize: 13, marginTop: 6 }}>Contact: {it.contact || '—'}</div>
                    <div style={{ color: '#374151', fontSize: 12, marginTop: 6 }}>Reported by: {it.reportedBy && (it.reportedBy.name || it.reportedBy.email || it.reportedBy)}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{it.status}</div>
                    {currentUser && (() => {
                      const reporterId = it.reportedBy && (it.reportedBy._id || it.reportedBy)
                      const isOwner = reporterId && String(reporterId) === String(currentUser._id)
                      return isOwner ? (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          {it.status !== 'returned' && (
                            <button className="btn small" onClick={() => markReturned(it._id)}>Mark returned</button>
                          )}
                          <button className="btn small" onClick={() => deleteItem(it._id)}>Remove</button>
                        </div>
                      ) : null
                    })()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Report Item</h3>
                <button className="btn small" onClick={() => setShowForm(false)}>Close</button>
              </div>

              <form onSubmit={submit}>
                <div>
                  <input placeholder="Item title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <input placeholder="Contact (phone or email)" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
                </div>
                <div>
                  <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label>
                    <input type="checkbox" checked={form.found} onChange={e => setForm({ ...form, found: e.target.checked })} /> Found
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" className="btn" disabled={loading}>{loading ? 'Posting...' : 'Report'}</button>
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

