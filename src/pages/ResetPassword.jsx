import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  function validate() {
    const next = {}
    if (!password) next.password = 'Please enter a new password'
    else if (password.length < 6) next.password = 'At least 6 characters'
    if (!confirmPassword) next.confirm = 'Please retype your new password'
    else if (confirmPassword !== password) next.confirm = 'Passwords do not match'
    return next
  }

  function handleSubmit(event) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length === 0) {
      // Replace with API call to reset password using a token
      navigate('/reset-success')
    }
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
              maxWidth: 780,
              background: '#e5e7eb',
              borderRadius: 14,
              boxShadow: '0 18px 50px rgba(0,0,0,0.35)'
            }}
          >
            <div style={{ padding: 28 }}>
              <h1 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 900, color: '#b91c1c', letterSpacing: 0.4, margin: '6px 0 24px' }}>
                RESET YOUR PASSWORD
              </h1>

              <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 520, margin: '0 auto' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 8, textAlign: 'center', color: '#111827' }}>Choose new password</label>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{
                      width: '100%',
                      padding: '12px 44px 12px 14px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      outline: 'none'
                    }}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    style={{ position: 'absolute', right: 8, top: 6, height: 32, minWidth: 32, border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: '#475569' }}>
                    {showNew ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{errors.password}</div>}

                <label style={{ display: 'block', fontWeight: 700, marginBottom: 8, textAlign: 'center', color: '#111827' }}>Retype password</label>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype new password"
                    style={{
                      width: '100%',
                      padding: '12px 44px 12px 14px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      outline: 'none'
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    style={{ position: 'absolute', right: 8, top: 6, height: 32, minWidth: 32, border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: '#475569' }}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirm && <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 14, textAlign: 'center' }}>{errors.confirm}</div>}

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="submit"
                    style={{
                      width: 240,
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
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}


