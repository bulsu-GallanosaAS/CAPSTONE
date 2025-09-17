import React from 'react'

export default function Events() {
  return (
    <section className="events">
      <h2>Sneak peak of our book events</h2>
      <div className="events-carousel">
        <div className="event-image small">
          <img src="https://via.placeholder.com/200x150/2C3E50/FFFFFF?text=Event+1" alt="Event 1" />
        </div>
        <div className="event-image large">
          <img src="https://via.placeholder.com/400x300/34495E/FFFFFF?text=Main+Event+Image" alt="Main Event" />
        </div>
        <div className="event-image small">
          <img src="https://via.placeholder.com/200x150/2C3E50/FFFFFF?text=Event+3" alt="Event 3" />
        </div>
      </div>
      <div className="carousel-dots">
        <span className="dot"></span>
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </section>
  )
}





