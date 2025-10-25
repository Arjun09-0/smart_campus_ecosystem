import React, { useEffect, useState } from 'react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then(r => r.json())
      .then(j => {
        if (j && j.users) setUsers(j.users)
      })
      .catch(err => console.error('Failed to load users', err))
      .finally(() => setLoading(false))
  }, [])

  async function changeRole(userId, role) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      const j = await res.json()
      if (j.ok) {
        setUsers(u => u.map(x => x._id === userId ? { ...x, role } : x))
      } else {
        alert('Failed: ' + (j.error || 'unknown'))
      }
    } catch (e) {
      console.error(e)
      alert('Request failed')
    }
  }

  if (loading) return <div>Loading users...</div>

  return (
    <div>
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                {u.role !== 'student' && <button className="btn small" onClick={() => changeRole(u._id, 'student')}>Set Student</button>}
                {u.role !== 'faculty' && <button className="btn small" onClick={() => changeRole(u._id, 'faculty')}>Set Faculty</button>}
                {u.role !== 'admin' && <button className="btn small" onClick={() => changeRole(u._id, 'admin')}>Set Admin</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
