import React from 'react'

export default function Gallery() {
  return (
    <section className="gallery">
      <h2>Restaurant Gallery</h2>
      <div className="gallery-grid">
        <div className="gallery-item large top-left">
          <img src="https://via.placeholder.com/400x250/FF6B6B/FFFFFF?text=Korean+BBQ+Grill+with+Meat" alt="Korean BBQ Grill with Meat" />
        </div>
        <div className="gallery-item medium top-center">
          <img src="https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Cooked+Meat+on+Grill" alt="Cooked Meat on Grill" />
        </div>
        <div className="gallery-item large top-right">
          <img src="https://via.placeholder.com/400x250/45B7D1/FFFFFF?text=Chopsticks+with+Cheese" alt="Chopsticks with Cheese" />
        </div>
        <div className="gallery-item medium bottom-left">
          <img src="https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Korean+BBQ+Table+Setup" alt="Korean BBQ Table Setup" />
        </div>
        <div className="gallery-item medium bottom-right">
          <img src="https://via.placeholder.com/300x200/FFEAA7/FFFFFF?text=BBQ+Experience" alt="BBQ Experience" />
        </div>
      </div>
    </section>
  )
}





