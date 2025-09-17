import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    setError('')
    // Navigate to confirmation page to enter code
    navigate('/confirm', { state: { email } })
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
              maxWidth: 620,
              background: '#f1f5f9',
              borderRadius: 14,
              boxShadow: '0 16px 44px rgba(0,0,0,0.28)',
              border: '2px solid #1e3a8a'
            }}
          >
            <div style={{ padding: 26 }}>
              <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, color: '#b91c1c', letterSpacing: 0.5, marginTop: 8, marginBottom: 18 }}>FORGOT PASSWORD?</h1>
              <p style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 18px', color: '#0f172a', fontWeight: 600 }}>
                In order to reset your password, please submit your email address. A confirmation code will be sent to the email address associated with your account.
              </p>

              <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 520, margin: '0 auto' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="What's your email address?"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    outline: 'none',
                    marginBottom: 8
                  }}
                />
                {error && <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 10 }}>{error}</div>}

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#b91c1c',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Continue
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 18, color: '#334155', fontSize: 13 }}>
                SIZUMgyupsal is committed to protecting your privacy. <a href="#" style={{ fontWeight: 800, color: '#0f172a' }}>Learn more &gt;&gt;</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}


