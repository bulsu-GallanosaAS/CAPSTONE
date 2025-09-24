import React from 'react'
import { Link } from 'react-router-dom'
import websiteLogo from '../assets/websitelogo.jpg'

export default function Nav() {
  return (
    <nav>
      <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', minWidth: '200px', textDecoration: 'none' }}>
        <img src={websiteLogo} alt="SISZUM Gyupsal Logo" style={{ cursor: 'pointer' }} />
      </Link>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li className="has-dropdown">
          <Link to="/">Menu</Link>
          <ul className="dropdown">
            <li><Link to="/featuremenu">Featured Menu Items</Link></li>
            <li><Link to="/unlimited">Unlimited Menu</Link></li>
            <li><Link to="/alacarte">Ala Carte Menu</Link></li>
            <li><Link to="/sidedish">Side Dishes</Link></li>
          </ul>
        </li>
        <li><Link to="/promos">Promos</Link></li>
        <li><Link to="/feedback">Feedback</Link></li>
        <li><Link to="/reservation">Reservation</Link></li>
        <li><Link to="/refilling">Refilling</Link></li>
      </ul>
    </nav>
  )
}


