import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

export default function Confirmation() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code sent to your email')
      return
    }
    setError('')
    navigate('/reset')
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 90 }}>
        <section
          style={{
            position: 'relative',
            background: "url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop') no-repeat center center/cover",
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '56px 16px'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(0,0,0,0.55), rgba(0,0,0,0.25))' }}></div>

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: 700,
              background: '#f1f5f9',
              borderRadius: 16,
              boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ padding: '32px 28px' }}>
              <h1 style={{ textAlign: 'center', margin: 0, fontSize: '2.1rem', fontWeight: 900, color: '#b91c1c', letterSpacing: 0.5 }}>
                CONFIRM YOUR EMAIL ADDRESS
              </h1>

              <p style={{ textAlign: 'center', marginTop: 14, color: '#0f172a', fontWeight: 600 }}>
                To continue, please enter the confirmation code
              </p>

              <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    style={{
                      width: 420,
                      maxWidth: '100%',
                      padding: '14px 16px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      outline: 'none',
                      background: '#fff',
                      textAlign: 'center',
                      fontSize: '1.05rem',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                    }}
                  />
                </div>
                {error && (
                  <div style={{ textAlign: 'center', color: '#b91c1c', fontSize: 13, marginTop: 8 }}>{error}</div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                  <button
                    type="submit"
                    style={{
                      width: 420,
                      maxWidth: '100%',
                      background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: 9999,
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      letterSpacing: 0.5,
                      boxShadow: '0 8px 18px rgba(220,38,38,0.35)'
                    }}
                  >
                    Confirm
                  </button>
                </div>

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#475569' }}>
                  SIZUMgyupsal is committed to protecting your privacy. <a href="#" style={{ fontWeight: 700, color: '#111827' }}>Learn more &gt;&gt;</a>
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}



