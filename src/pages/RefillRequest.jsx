import React, { useEffect, useMemo, useState } from 'react'
import { createRefillRequest, getTableTimer, isPosConfigured } from '../api/pos.js'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

function Counter({ value, onChange }) {
  function dec() { onChange(Math.max(0, value - 1)) }
  function inc() { onChange(value + 1) }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button type="button" onClick={dec} style={{ width: 24, height: 24, borderRadius: 4, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>-</button>
      <input type="number" min={0} value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value||0)))}
        style={{ width: 40, textAlign: 'center', borderRadius: 6, border: '1px solid #d1d5db', padding: '4px 6px' }} />
      <button type="button" onClick={inc} style={{ width: 24, height: 24, borderRadius: 4, border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>+</button>
    </div>
  )
}

function Item({ name, img, qty, setQty }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: `url('${img}') center/cover no-repeat`, border: '3px solid #ef4444' }}></div>
      <div style={{ color: '#fff', fontWeight: 700 }}>{name}</div>
      <Counter value={qty} onChange={setQty} />
    </div>
  )
}

function Section({ title, items, state, setState }) {
  return (
    <div style={{ marginTop: 22 }}>
      <h3 style={{ color: '#fff', fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', margin: '14px 0' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {items.map((it) => (
          <Item key={it.name} name={it.name} img={it.img}
            qty={state[it.name] || 0}
            setQty={(v) => setState((s) => ({ ...s, [it.name]: v }))}
          />
        ))}
      </div>
    </div>
  )
}

export default function RefillRequest() {
  const [meta, setMeta] = useState({ tableCode: '', tableNumber: '', status: 'On-going', time: '20:00' })
  const [remainingSec, setRemainingSec] = useState(null)
  const [side, setSide] = useState({})
  const [meat, setMeat] = useState({})
  const [food, setFood] = useState({})

  const sideItems = [
    { name: 'Kimchi', img: 'https://png.pngtree.com/thumb_back/fw800/background/20230818/pngtree-korean-kimchi-is-a-steamed-dish-made-with-sesame-oil-image_12985563.jpg' },
    { name: 'Fishcake', img: 'https://seasonedbyjin.com/wp-content/uploads/2022/05/fish-cake-stir-fry.jpg' },
    { name: 'Eggroll', img: 'https://kimchimari.com/wp-content/uploads/2020/01/korean-egg-roll-gyeranmari.jpg' },
    { name: 'Corncheese', img: 'https://tse4.mm.bing.net/th/id/OIP.iT5ICulvvXbX7NTajdkrMAHaJ4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }
  ]
  const meatItems = [
    { name: 'Pork', img: 'https://www.tenderbites.ph/media/catalog/product/cache/6658c6986eb36f9bee022e602f6cd310/s/a/samkyupsal_1_s.jpg' },
    { name: 'Beef', img: 'https://baycatch.ph/cdn/shop/files/beef-samgyupsal-sku.jpg?v=1698145108&width=1946' },
    { name: 'Bacon', img: 'https://c.pxhere.com/photos/dd/35/Meat_Meats-1621745.jpg!d' }
  ]
  const foodItems = [
    { name: 'Rice', img: 'https://ohmyfacts.com/wp-content/uploads/2024/06/45-rice-nutrition-facts-1717912224.jpeg' },
    { name: 'Lettuce', img: 'https://www.100daysofrealfood.com/wp-content/uploads/2023/11/vecteezy_lettuce-salad-leaf-isolated-on-white-background-with_5582269-scaled.jpg' },
    { name: 'Cheese', img: 'https://www.arapatria.com/wp-content/uploads/2019/03/LRM_EXPORT_196177051183705_20190320_150732741-scaled.jpeg' }
  ]

  function mmss(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Initialize countdown based on admin-configured duration
  useEffect(() => {
    // Priority 1: URL param ?minutes=20 (admin can send link)
    const params = new URLSearchParams(window.location.search)
    const minutesParam = params.get('minutes')
    // Priority 2: localStorage key set by admin panel, e.g. refillDurationSec
    const storedDuration = Number(localStorage.getItem('refillDurationSec') || 0)
    const now = Date.now()

    let deadline = Number(localStorage.getItem('refillDeadlineMs') || 0)

    // If no valid deadline or it's in the past, create a new one from params or storage
    if (!deadline || deadline < now) {
      const fallbackMin = minutesParam ? Math.max(1, Number(minutesParam)) : Math.max(1, Math.floor(storedDuration / 60) || 20)
      const durationSec = (minutesParam ? Math.max(1, Number(minutesParam)) * 60 : (storedDuration || 20 * 60))
      deadline = now + durationSec * 1000
      localStorage.setItem('refillDeadlineMs', String(deadline))
      localStorage.setItem('refillDurationSec', String(durationSec))
      setMeta((m) => ({ ...m, time: mmss(durationSec) }))
    }

    // Start ticking
    function tick() {
      const remain = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
      setRemainingSec(remain)
      setMeta((m) => ({ ...m, time: mmss(remain), status: remain === 0 ? 'Time\'s up' : 'On-going' }))
      if (remain === 0) {
        // Clear deadline when finished
        localStorage.removeItem('refillDeadlineMs')
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Initialize admin-controlled meta fields (table code/number/status)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const adminTableCode = params.get('tableCode') || localStorage.getItem('refillTableCode') || ''
    const adminTableNumber = params.get('tableNumber') || localStorage.getItem('refillTableNumber') || ''
    const adminStatus = params.get('status') || localStorage.getItem('refillStatus') || 'On-going'
    if (adminTableCode || adminTableNumber || adminStatus) {
      setMeta((m) => ({ ...m, tableCode: adminTableCode, tableNumber: adminTableNumber, status: adminStatus }))
    }
  }, [])

  // If POS is configured, try to fetch the current table timer from POS
  useEffect(() => {
    async function fetchTimer() {
      if (!isPosConfigured() || !meta.tableCode) return
      const res = await getTableTimer(meta.tableCode)
      if (res?.ok && res?.data) {
        // Expecting { remainingSec: number } or { durationSec: number }
        const remaining = Number(res.data.remainingSec ?? res.data.durationSec ?? 0)
        if (remaining > 0) {
          const deadline = Date.now() + remaining * 1000
          localStorage.setItem('refillDeadlineMs', String(deadline))
          localStorage.setItem('refillDurationSec', String(remaining))
          setRemainingSec(remaining)
          setMeta((m) => ({ ...m, time: mmss(remaining), status: 'On-going' }))
        }
      }
    }
    fetchTimer()
    // Only when table code changes
  }, [meta.tableCode])

  async function handleSubmit(e) {
    e.preventDefault()
    // Build compact items payload (only non-zero)
    function nonZeroEntries(map) {
      return Object.entries(map).filter(([, v]) => Number(v) > 0).map(([name, qty]) => ({ name, qty }))
    }
    const payload = {
      tableCode: meta.tableCode,
      tableNumber: meta.tableNumber,
      status: meta.status,
      remainingSec: remainingSec,
      requestedAt: new Date().toISOString(),
      items: {
        side: nonZeroEntries(side),
        meat: nonZeroEntries(meat),
        food: nonZeroEntries(food),
      }
    }

    let orderId = ''
    try {
      const res = await createRefillRequest(payload)
      if (res?.ok) {
        orderId = res?.data?.id || ''
        window.location.href = `/refill-request-submitted${orderId ? `?id=${encodeURIComponent(orderId)}` : ''}`
        return
      }
    } catch {}
    // Fallback navigation if POS is not configured or request failed
    window.location.href = '/refill-request-submitted'
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 90 }}>
        <section
          style={{
            position: 'relative',
            background: "url('https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_1200,q_auto,f_auto/images/HandamBBQ_C3HandamCombo_RichardCasteel_HTX-38_vh8wjb') no-repeat center center/cover",
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 16px'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1200px 400px at 50% -10%, rgba(255,255,255,0.08), rgba(0,0,0,0)), linear-gradient(to bottom right, rgba(0,0,0,0.65), rgba(0,0,0,0.35))' }}></div>
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 820, background: 'rgba(17,24,39,0.84)', borderRadius: 20, padding: 24, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)' }}>
            <h2 style={{ color: '#ffffff', fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center', margin: 0, fontSize: '1.8rem' }}>Refill Request</h2>

            {/* Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
              <div>
                <label style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Table Code</label>
                <input value={meta.tableCode} readOnly aria-readonly={true} placeholder="001" style={{ width: '100%', padding: '12px 12px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#e5e7eb', color: '#111827', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Table Number</label>
                <input value={meta.tableNumber} readOnly aria-readonly={true} placeholder="A-1" style={{ width: '100%', padding: '12px 12px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#e5e7eb', color: '#111827', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Timer</label>
                <div style={{ width: '100%', padding: '12px 12px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#0b1220', color: '#fff', fontWeight: 900, letterSpacing: 1, textAlign: 'center', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25)', animation: remainingSec !== null && remainingSec <= 60 ? 'pulse 1s infinite' : 'none' }}>
                  {meta.time}
                </div>
              </div>
              <div>
                <label style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Status Tracking</label>
                <input value={meta.status} readOnly aria-readonly={true} placeholder="On-going" style={{ width: '100%', padding: '12px 12px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#e5e7eb', fontWeight: 900, color: '#111827' }} />
              </div>
            </div>

            {/* Sections */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0 10px' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <Section title="Side Dish Selection" items={sideItems} state={side} setState={setSide} />
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '14px 0 6px' }}></div>
                <Section title="Assorted Meat Selection" items={meatItems} state={meat} setState={setMeat} />
              </div>
              <div>
                <Section title="Assorted Food Selection" items={foodItems} state={food} setState={setFood} />
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <button type="submit" style={{ width: 300, background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: '#111827', fontWeight: 900, border: 'none', padding: '12px 18px', borderRadius: 9999, cursor: 'pointer', boxShadow: '0 14px 28px rgba(245,158,11,0.35)' }}>Submit Refill Request</button>
                <Link to="/" style={{ width: 300, textAlign: 'center', background: '#dc2626', color: '#fff', fontWeight: 900, textDecoration: 'none', padding: '12px 18px', borderRadius: 9999, boxShadow: '0 14px 28px rgba(239,68,68,0.35)' }}>Back to Home Page</Link>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}


