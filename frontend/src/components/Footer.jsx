import React from 'react'

export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-col">
          <h4>Site</h4>
          <ul>
            <li>Lost</li>
            <li>Report Lost</li>
            <li>Found</li>
            <li>Report Found</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li>Customer Support</li>
            <li>Terms &amp; Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <div className="muted">Email: support@smartcampus.local</div>
          <div className="muted">Tel: +1-555-555-5555</div>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Smart Campus — All rights reserved</div>
    </footer>
  )
}
