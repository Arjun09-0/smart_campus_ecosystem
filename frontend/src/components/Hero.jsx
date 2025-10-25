import React from 'react'
import { Link } from 'react-router-dom'

export default function Hero({ title, subtitle, buttons = [] }) {
  return (
    <header className="hero">
      <div className="hero-inner container">
        <div className="hero-left">
          <h1 className="hero-title">{title}</h1>
          {subtitle && <p className="hero-sub">{subtitle}</p>}
        </div>
        <div className="hero-right">
          <div className="hero-cta-stack">
            {buttons.map((b, i) => {
              // If an onClick handler is provided, render a button so it can perform actions
              if (typeof b.onClick === 'function') {
                return (
                  <button key={i} onClick={b.onClick} className={`hero-cta ${b.variant || ''}`}>
                    {b.label}
                  </button>
                )
              }

              // Otherwise fall back to a Link (for navigation)
              return (
                <Link key={i} to={b.to || '/'} className={`hero-cta ${b.variant || ''}`}>
                  {b.label}
                </Link>
              )
            })}
          </div>
          <div className="hero-images">
            <div className="img img-1" />
            <div className="img img-2" />
            <div className="img img-3" />
          </div>
        </div>
      </div>
    </header>
  )
}
