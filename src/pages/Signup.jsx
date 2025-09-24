import React, { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import reservation from '../assets/reservation.jpg'
export default function Signup() {
  const [formValues, setFormValues] = useState({ name: '', email: '', password: '', agreed: false })
  const [errors, setErrors] = useState({})
  const [hoverPrimary, setHoverPrimary] = useState(false)
  const [hoverGoogle, setHoverGoogle] = useState(false)
  const navigate = useNavigate()

  function validate(values) {
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Name is required'
    if (!values.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
      nextErrors.email = 'Enter a valid email'
    }
    if (!values.password) {
      nextErrors.password = 'Password is required'
    } else if (values.password.length < 6) {
      nextErrors.password = 'At least 6 characters'
    }
    return nextErrors
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setFormValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(formValues)
    if (!formValues.agreed) nextErrors.agreed = 'Captcha is required'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      console.log('Submitting signup:', formValues)
      alert('Sign up successful!')
      setFormValues({ name: '', email: '', password: '', agreed: false })
      navigate('/login')
    }
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 90 }}>
        <section
          style={{
            position: 'relative',
            background: `url(${reservation}) no-repeat center center/cover`,
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
              maxWidth: 520,
              background: '#ffffff',
              borderRadius: 16,
              boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
              border: '1px solid rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}
          >
            <div style={{ background: '#f1f5f9', padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, textAlign: 'center', fontSize: '1.9rem', fontWeight: 900, color: '#0f172a' }}>GET STARTED NOW</h2>
              </div>

            <div style={{ padding: 28 }}>
              <form onSubmit={handleSubmit} noValidate>
                <label style={{ display: 'block,', fontWeight: 600, marginBottom: 6 }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    marginBottom: 6,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
                {errors.name && <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 10 }}>{errors.name}</div>}

                <label style={{ display: 'block', fontWeight: 600, margin: '10px 0 6px' }}>Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    marginBottom: 6,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
                {errors.email && <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 10 }}>{errors.email}</div>}

                <label style={{ display: 'block', fontWeight: 600, margin: '10px 0 6px' }}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    marginBottom: 6,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
                {errors.password && <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 10 }}>{errors.password}</div>}

                <div style={{ margin: '10px 0 16px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ transform: 'scale(0.95)', transformOrigin: 'center', height: 78 }}>
                    <ReCAPTCHA size="normal" sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" onChange={(token) => setFormValues((p) => ({ ...p, agreed: Boolean(token) }))} />
                  </div>
                </div>
                {errors.agreed && <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 10 }}>{errors.agreed}</div>}

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: 9999,
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    letterSpacing: 0.5,
                    transition: 'transform .15s ease, box-shadow .15s ease, opacity .15s ease',
                    boxShadow: hoverPrimary ? '0 10px 22px rgba(220,38,38,0.4)' : '0 6px 14px rgba(220,38,38,0.3)',
                    transform: hoverPrimary ? 'translateY(-1px) scale(1.015)' : 'translateY(0) scale(1)'
                  }}
                  onMouseEnter={() => setHoverPrimary(true)}
                  onMouseLeave={() => setHoverPrimary(false)}
                >
                  Sign up
              </button>

                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => alert('Google sign-in coming soon')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      border: '2px solid #e5e7eb',
                      background: '#fff',
                      padding: '10px 14px',
                      borderRadius: 9999,
                      cursor: 'pointer',
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      transition: 'transform .15s ease, box-shadow .15s ease, background-color .15s ease, border-color .15s ease',
                      boxShadow: hoverGoogle ? '0 8px 18px rgba(0,0,0,0.12)' : '0 4px 10px rgba(0,0,0,0.08)',
                      transform: hoverGoogle ? 'translateY(-1px)' : 'translateY(0)',
                      backgroundColor: hoverGoogle ? '#f9fafb' : '#ffffff',
                      borderColor: hoverGoogle ? '#d1d5db' : '#e5e7eb'
                    }}
                    onMouseEnter={() => setHoverGoogle(true)}
                    onMouseLeave={() => setHoverGoogle(false)}
                  >
                    <img src="https://www.svgrepo.com/show/355037/google.svg" width="18" alt="Google logo" />
                    Sign in with Google
                  </button>
            </div>

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14 }}>
                  Already have an account?{' '}
                  <Link to="/loginReservation" style={{ fontWeight: 700, color: '#111827' }}>
                    Login now!
                  </Link>
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


