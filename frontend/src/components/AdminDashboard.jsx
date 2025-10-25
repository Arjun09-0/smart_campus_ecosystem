import React from 'react'
import AdminUsers from './AdminUsers'

export default function AdminDashboard({ user }) {
  if (!user || user.role !== 'admin') {
    return <div><h2>Access denied</h2><p className="muted">You must be an admin to view this page.</p></div>
  }
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p className="muted">Welcome, {user?.name}. Use the tools below to manage the application.</p>
      <section style={{ marginTop: 12 }}>
        <h3>Users</h3>
        <AdminUsers />
      </section>
    </div>
  )
}
