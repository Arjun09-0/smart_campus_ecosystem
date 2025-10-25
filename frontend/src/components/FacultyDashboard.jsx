import React, { useEffect, useState } from 'react'

export default function FacultyDashboard({ user }) {
  if (!user || (user.role !== 'faculty' && user.role !== 'admin')) {
    return <div><h2>Access denied</h2><p className="muted">You must be faculty or admin to view this page.</p></div>
  }
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // fetch recent issues for moderation
    fetch('/api/issues', { credentials: 'include' })
      .then(r => r.json())
      .then(j => { if (j && j.items) setIssues(j.items) })
      .catch(e => console.error('Failed to load issues', e))
      .finally(() => setLoading(false))
  }, [])

  async function markResolved(id) {
    try {
      const res = await fetch(`/api/issues/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'resolved' }) })
      const j = await res.json()
      if (j.ok) setIssues(s => s.map(x => x._id === id ? { ...x, status: 'resolved' } : x))
      else alert('Failed to update')
    } catch (e) { console.error(e); alert('Request failed') }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Faculty Dashboard</h2>
      <p className="muted">Welcome, {user?.name}. Here are recent issues reported by the community.</p>
      <div style={{ marginTop: 12 }}>
        <table className="table">
          <thead><tr><th>Title</th><th>Author</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {issues.map(i => (
              <tr key={i._id}>
                <td>{i.title}</td>
                <td>{i.author && i.author.name}</td>
                <td>{i.status || 'open'}</td>
                <td>{i.status !== 'resolved' && <button className="btn small" onClick={() => markResolved(i._id)}>Mark Resolved</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
