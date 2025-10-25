import React from 'react'
import { NavLink } from 'react-router-dom'

export default function NavBar({ user }) {
  return (
    <nav className="nav">
      <NavLink to="/" end className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
      <NavLink to="/events" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Events</NavLink>
      <NavLink to="/lost-and-found" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Lost &amp; Found</NavLink>
      <NavLink to="/feedback" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Feedback</NavLink>
      <NavLink to="/clubs" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Clubs</NavLink>
      {/* Role links */}
      {user && user.role === 'faculty' && (
        <NavLink to="/faculty" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Faculty</NavLink>
      )}
      {user && user.role === 'admin' && (
        <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>
      )}
    </nav>
  )
}
