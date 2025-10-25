import React, { useState } from 'react'

export default function IssueForm({ type = 'feedback' }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, message, contact }),
        credentials: 'include'
      })
      const j = await res.json()
      if (j.ok) {
        setResult('Submitted — thank you')
        setTitle('')
        setMessage('')
        setContact('')
      } else {
        setResult(j.error || 'Failed')
      }
    } catch (err) {
      console.error(err)
      setResult('Network error')
    } finally {
      setLoading(false)
      setTimeout(() => setResult(null), 3000)
    }
  }

  return (
    <div className="card">
  <h3>Send Feedback</h3>
      {result && <div style={{ marginBottom: 8 }}>{result}</div>}
      <form onSubmit={submit}>
        <div>
          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} required />
        </div>
        <div>
          <input placeholder="Contact (optional)" value={contact} onChange={e => setContact(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  )
}
