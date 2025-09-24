import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import bg from '../assets/bg.jpg'


export default function Refilling() {
  const navigate = useNavigate()
  const [tableCode, setTableCode] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [errors, setErrors] = useState({})

  function submit(e) {
    e.preventDefault()
    const next = {}
    if (!tableCode.trim()) next.tableCode = 'Enter table code'
    if (!tableNumber.trim()) next.tableNumber = 'Enter table number'
    setErrors(next)
    if (Object.keys(next).length === 0) navigate('/refill-request')
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 90 }}>
        <section
          style={{
            position: 'relative',
            background: `url(${bg}) no-repeat center center/cover`,
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '56px 16px'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(0,0,0,0.65), rgba(0,0,0,0.35))' }}></div>
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 640, textAlign: 'center' }}>
            <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.6rem', lineHeight: 1.2, marginBottom: 16 }}>
              REFILL TABLE CODE &<br />TABLE NUMBER
            </h1>
            <p style={{ color: '#e5e7eb', lineHeight: 1.8, letterSpacing: 0.2, marginBottom: 28 }}>
              Enter the Table Code given by the staff to start your refill request. The timer will begin once cooking starts. Ensure it's the correct code for your table.
            </p>

            <form onSubmit={submit} noValidate style={{
              margin: '0 auto',
              maxWidth: 520,
              background: 'rgba(17,24,39,0.75)',
              padding: 28,
              borderRadius: 18,
              textAlign: 'left',
              boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                <div>
                  <label style={{ color: '#cbd5e1', fontWeight: 800, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Table Code</label>
                  <input value={tableCode} onChange={(e)=>setTableCode(e.target.value)} placeholder="Enter Table Code"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.25)', background: '#fff' }} />
                  {errors.tableCode && <div style={{ color: '#fecaca', fontSize: 12, marginTop: 6 }}>{errors.tableCode}</div>}
                </div>

                <div>
                  <label style={{ color: '#cbd5e1', fontWeight: 800, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Table Number</label>
                  <input value={tableNumber} onChange={(e)=>setTableNumber(e.target.value)} placeholder="Enter Table Number"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.25)', background: '#fff' }} />
                  {errors.tableNumber && <div style={{ color: '#fecaca', fontSize: 12, marginTop: 6 }}>{errors.tableNumber}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 18 }}>
                <button type="submit" style={{ width: 260, background: '#f59e0b', color: '#111827', border: 'none', padding: '12px 16px', borderRadius: 9999, fontWeight: 900, cursor: 'pointer' }}>
                  Go to Refill Request
                </button>
                <a href="/" style={{ display: 'inline-block', background: '#dc2626', color: '#fff', textDecoration: 'none', padding: '12px 16px', borderRadius: 9999, fontWeight: 900 }}>Back to Home Page</a>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}


