import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

export default function ReservationForm() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialOccasion: '',
    guests: 1
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const location = useLocation()

  // Get reservation data from navigation state
  const reservationData = location.state || {}
  
  // Initialize selected date and time from passed data
  React.useEffect(() => {
    if (reservationData.date) {
      setSelectedDate(reservationData.date)
    }
    if (reservationData.time) {
      setSelectedTime(reservationData.time)
    }
  }, [reservationData])

  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ]

  const timeSlots = [
    { time: '5:00 PM - 6:30 PM', available: true, label: '' },
    { time: '6:30 PM - 8:00 PM', available: true, label: '' }, 
    { time: '8:00 PM - 9:30 PM', available: true, label: '' }
  ]

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay()
  }

  // Mock availability data - some dates are fully booked
  const getDateAvailability = (day, month, year) => {
    // September 2025 has some fully booked dates (Thursdays)
    if (month === 8 && year === 2025) { // September is month 8 (0-indexed)
      const fullyBookedDates = [4, 11, 18, 25] // Thursdays in September 2025
      return fullyBookedDates.includes(day) ? 'fully-booked' : 'available'
    }
    
    // November 2025 has some fully booked dates
    if (month === 10 && year === 2025) { // November is month 10 (0-indexed)
      const fullyBookedDates = [5, 6, 7, 9, 10, 11]
      return fullyBookedDates.includes(day) ? 'fully-booked' : 'available'
    }
    
    // For other months, randomly assign some dates as fully booked
    const randomSeed = day + month + year
    return randomSeed % 7 === 0 ? 'fully-booked' : 'available'
  }

  const handleDateClick = (day) => {
    // Get month and year from passed data, default to September 2025
    const month = reservationData.month ? months.indexOf(reservationData.month) : 8
    const year = reservationData.year || 2025
    
    const availability = getDateAvailability(day, month, year)
    if (availability !== 'fully-booked') {
      setSelectedDate(day)
    }
  }

  const handleTimeClick = (timeSlot) => {
    if (timeSlot.available) {
      setSelectedTime(timeSlot.time)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleGuestsChange = (change) => {
    const newGuests = Math.max(1, Math.min(20, formData.guests + change))
    setFormData(prev => ({
      ...prev,
      guests: newGuests
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    
    if (!selectedDate) {
      newErrors.date = 'Please select a date'
    }
    
    if (!selectedTime) {
      newErrors.time = 'Please select a time slot'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Navigate to upload page with all reservation data
      navigate('/reservation-upload', {
        state: {
          ...reservationData,
          ...formData,
          selectedDate,
          selectedTime,
          month: reservationData.month || 'SEPTEMBER',
          year: reservationData.year || 2025
        }
      })
    }
  }

  const renderCalendar = () => {
    // Get month and year from passed data, default to September 2025
    const month = reservationData.month ? months.indexOf(reservationData.month) : 8
    const year = reservationData.year || 2025
    
    const daysInMonth = getDaysInMonth(month, year)
    const firstDay = getFirstDayOfMonth(month, year)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate === day
      const availability = getDateAvailability(day, month, year)
      const isFullyBooked = availability === 'fully-booked'
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${availability}`}
          onClick={() => handleDateClick(day)}
          style={{
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isFullyBooked ? 'not-allowed' : 'pointer',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
            background: isSelected ? '#dc2626' : 
                       isFullyBooked ? '#f97316' : '#fff',
            border: isSelected ? '1px solid #dc2626' : 
                   isFullyBooked ? '1px solid #f97316' : '1px solid #e2e8f0',
            color: isSelected ? '#fff' : 
                   isFullyBooked ? '#fff' : '#000',
            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            boxShadow: isSelected ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none',
            opacity: isFullyBooked ? 0.8 : 1
          }}
          onMouseEnter={(e) => {
            if (!isSelected && !isFullyBooked) {
              e.target.style.background = '#f3f4f6'
              e.target.style.borderColor = '#dc2626'
              e.target.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected && !isFullyBooked) {
              e.target.style.background = '#fff'
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.transform = 'scale(1)'
            }
          }}
        >
          {day}
        </div>
      )
    }

    return days
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 90 }}>
        <section
          style={{
            position: 'relative',
            background: "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600&auto=format&fit=crop') no-repeat center center/cover",
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
              maxWidth: 1200,
              background: '#ffffff',
              borderRadius: 16,
              boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
              border: '1px solid rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ 
              background: '#dc2626', 
              padding: '20px 24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                SISZUMGYUPSAL RESERVATION
              </h1>
              <button 
                onClick={() => navigate('/reservation-date')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '16px', 
                  cursor: 'pointer', 
                  color: '#fff',
                  fontWeight: 600
                }}
              >
                Back
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              <p style={{ textAlign: 'center', color: '#475569', marginBottom: 32, fontWeight: 600 }}>
                Click on any date you want to reserve, then choose your preferred dining time.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {/* Left Side - Calendar */}
                <div>
                  {/* Calendar Header */}
                  <div style={{ 
                    background: '#dc2626', 
                    padding: '16px 20px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderRadius: '8px 8px 0 0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: '20px', color: '#fff' }}>📅</div>
                      <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                        {reservationData.month || 'SEPTEMBER'} {reservationData.year || 2025}
                      </h2>
                    </div>
                    <button 
                      onClick={() => navigate('/reservation-date')}
                      style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#fff' }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Calendar */}
                  <div style={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    padding: '20px'
                  }}>
                    {/* Days of week */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: 8 }}>
                      {['SUN', 'MON', 'TUES', 'WED', 'THUR', 'FRI', 'SAT'].map(day => (
                        <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#666', padding: '8px 4px' }}>
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                      {renderCalendar()}
                    </div>

                    {/* Selected Date Display */}
                    {selectedDate && (
                      <div style={{ 
                        background: '#f0f9ff', 
                        border: '1px solid #0ea5e9', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        marginTop: 20,
                        marginBottom: 16,
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0369a1' }}>
                          Selected: {reservationData.month || 'SEPTEMBER'} {selectedDate}, {reservationData.year || 2025}
                        </p>
                      </div>
                    )}

                    {/* Legend */}
                    <div style={{ marginTop: 20 }}>
                      <h4 style={{ marginBottom: 12, fontSize: '14px', fontWeight: 600, color: '#374151' }}>Date Availability:</h4>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 12, height: 12, backgroundColor: '#f97316', borderRadius: 2 }}></div>
                          <span style={{ fontSize: '12px', color: '#666' }}>Fully Booked</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 12, height: 12, backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 2 }}></div>
                          <span style={{ fontSize: '12px', color: '#666' }}>Available</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Time Display */}
                    {selectedTime && (
                      <div style={{ 
                        background: '#f0fdf4', 
                        border: '1px solid #22c55e', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        marginTop: 16,
                        marginBottom: 16,
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#15803d' }}>
                          Selected Time: {selectedTime}
                        </p>
                      </div>
                    )}

                    {/* Time Slots */}
                    <div style={{ marginTop: 24 }}>
                      <h4 style={{ marginBottom: 12, fontSize: '14px', fontWeight: 600 }}>Select Time:</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {timeSlots.map((timeSlot, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedTime(timeSlot.time)}
                            disabled={!timeSlot.available}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              background: !timeSlot.available ? '#dc2626' : 
                                         selectedTime === timeSlot.time ? '#dc2626' : '#fff',
                              color: !timeSlot.available ? '#fff' : 
                                     selectedTime === timeSlot.time ? '#fff' : '#374151',
                              cursor: timeSlot.available ? 'pointer' : 'not-allowed',
                              fontWeight: 600,
                              transition: 'all 0.2s',
                              position: 'relative'
                            }}
                          >
                            {timeSlot.time}
                            {!timeSlot.available && (
                              <span style={{ 
                                position: 'absolute', 
                                right: '12px', 
                                fontSize: '10px', 
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}>
                                FULLY BOOKED
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Reservation Form */}
                <div>
                  <div style={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    padding: '24px'
                  }}>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      marginBottom: 24,
                      fontStyle: 'italic'
                    }}>
                      Note: Provide an active phone and email, or your reservation may be canceled.
                    </p>

                    <form onSubmit={handleSubmit}>
                      {/* Name */}
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: `1px solid ${errors.name ? '#dc2626' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.2s'
                          }}
                        />
                        {errors.name && (
                          <p style={{ color: '#dc2626', fontSize: '12px', marginTop: 4 }}>{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: `1px solid ${errors.email ? '#dc2626' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.2s'
                          }}
                        />
                        {errors.email && (
                          <p style={{ color: '#dc2626', fontSize: '12px', marginTop: 4 }}>{errors.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: `1px solid ${errors.phone ? '#dc2626' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.2s'
                          }}
                        />
                        {errors.phone && (
                          <p style={{ color: '#dc2626', fontSize: '12px', marginTop: 4 }}>{errors.phone}</p>
                        )}
                      </div>

                      {/* Special Occasion */}
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                          Special Occasion
                        </label>
                        <input
                          type="text"
                          name="specialOccasion"
                          value={formData.specialOccasion}
                          onChange={handleInputChange}
                          placeholder="E.g. Birthday, Anniversary, etc."
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.2s'
                          }}
                        />
                      </div>

                      {/* Number of Guests */}
                      <div style={{ marginBottom: 32 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                          Number of Guests
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <button
                            type="button"
                            onClick={() => handleGuestsChange(-1)}
                            style={{
                              width: '40px',
                              height: '40px',
                              border: '1px solid #e2e8f0',
                              background: '#fff',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: '#374151'
                            }}
                          >
                            -
                          </button>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: 600, 
                            color: '#374151',
                            minWidth: '20px',
                            textAlign: 'center'
                          }}>
                            {formData.guests}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleGuestsChange(1)}
                            style={{
                              width: '40px',
                              height: '40px',
                              border: '1px solid #e2e8f0',
                              background: '#fff',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: '#374151'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          background: '#dc2626',
                          color: '#fff',
                          border: 'none',
                          padding: '14px 24px',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                      >
                        Next
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}