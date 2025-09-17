import React from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

export default function SideDishes() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 90 }}>
        <header style={{ padding: '110px 20px 10px 20px' }}>
          <h1 style={{ textAlign: 'center', fontSize: '36px', color: '#d60000', marginBottom: '10px' }}>
            BEST SELLING SIDE DISH
          </h1>
          <p style={{ textAlign: 'center', fontSize: '18px', maxWidth: '700px', margin: '0 auto 40px' }}>
            Our best-selling side dishes — Kimchi, Cheese, Baby Potatoes, Fishcake, and Egg Roll — served in convenient tubs, perfect to pair with any meal!
          </p>

          <div className="menu-grid">
            <div className="card">
              <img src="cheese.png" alt="Cheese on Tub" />
              <div className="card-content">
                <div className="card-title">CHEESE ON TUB</div>
                <div className="card-desc">Cheese</div>
              </div>
              <div className="price-tag">₱100</div>
            </div>

            <div className="card">
              <img src="fishcake.png" alt="Fishcake on Tub" />
              <div className="card-content">
                <div className="card-title">FISHCAKE ON TUB</div>
                <div className="card-desc">Fishcake</div>
              </div>
              <div className="price-tag">₱100</div>
            </div>

            <div className="card">
              <img src="eggroll.png" alt="Eggroll on Tub" />
              <div className="card-content">
                <div className="card-title">EGGROLL ON TUB</div>
                <div className="card-desc">Eggroll</div>
              </div>
              <div className="price-tag">₱100</div>
            </div>

            <div className="card">
              <img src="babypotatoes.png" alt="Baby Potatoes on Tub" />
              <div className="card-content">
                <div className="card-title">BABY POTATOES ON TUB</div>
                <div className="card-desc">Baby Potatoes</div>
              </div>
              <div className="price-tag">₱100</div>
            </div>

            <div className="card">
              <img src="kimchi.png" alt="Kimchi on Tub" />
              <div className="card-content">
                <div className="card-title">KIMCHI ON TUB</div>
                <div className="card-desc">Kimchi</div>
              </div>
              <div className="price-tag">₱100</div>
            </div>
          </div>
        </header>
      </main>
      <Footer />
    </>
  )
}


