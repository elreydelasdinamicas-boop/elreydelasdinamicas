import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'

const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)
const fmtDate = d => new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
const medals = ['🥇', '🥈', '🥉', '🎯']

const S = {
  header: { position: 'sticky', top: 0, zIndex: 40, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(212,175,55,0.2)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px' },
  content: { padding: '16px 16px 88px', maxWidth: 500, margin: '0 auto' },
  card: { background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16 },
  btnGold: { background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', color: '#000', border: 'none', borderRadius: 12, padding: '14px 20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, width: '100%', fontFamily: 'inherit', transition: 'opacity .2s' },
  btnOutline: { background: 'transparent', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.35)', borderRadius: 12, padding: '13px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, width: '100%', fontFamily: 'inherit' },
  btnDanger: { background: 'transparent', color: '#e74c3c', border: '1px solid rgba(231,76,60,.3)', borderRadius: 12, padding: '13px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, width: '100%', fontFamily: 'inherit' },
  navBtn: (active) => ({ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '8px 10px', color: active ? '#D4AF37' : '#555', transform: active ? 'scale(1.08)' : 'scale(1)', transition: 'all .2s', minWidth: 52 }),
  badge: (type) => {
    const map = { gold: { background: '#D4AF37', color: '#000' }, green: { background: 'rgba(39,174,96,0.18)', color: '#27AE60' }, blue: { background: 'rgba(52,152,219,0.15)', color: '#3498db' }, red: { background: 'rgba(231,76,60,0.15)', color: '#e74c3c' }, dim: { background: 'rgba(212,175,55,0.12)', color: '#D4AF37' } }
    return { borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '.5px', ...map[type] }
  }
}

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
    <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}>♛</div>
    <div>
      <b style={{ fontSize: 14, fontWeight: 900, color: '#fff', display: 'block', lineHeight: 1.1 }}>Los Reyes</b>
      <span style={{ fontSize: 9, color: '#D4AF37', fontWeight: 600, letterSpacing: '.5px' }}>De Las Dinámicas</span>
    </div>
  </div>
)

const Loading = () => (
  <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
    <div style={{ fontSize: 48 }} className="crown-float">♛</div>
    <div style={{ color: '#D4AF37', fontWeight: 700 }}>Cargando el Reino...</div>
  </div>
)

export default function App() {
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authPage, setAuthPage] = useState(null)
  const [raffles, setRaffles] = useState([])
  const [selectedRaffle, setSelectedRaffle] = useState(null)
  const [myTickets, setMyTickets] = useState([])
  const [selectedNums, setSelectedNums] = useState([])
  const [chatMessages, setChatMessages] = useState([{ from: 'agent', text: '¡Bienvenido al Reino! ♛ ¿En qué te podemos ayudar hoy?', time: '09:30' }])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { fetchRaffles() }, [])
  useEffect(() => { if (user) fetchMyTickets() }, [user])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('users_profile').select('*').eq('id', userId).single()
    if (data) setProfile(data)
  }

  async function fetchRaffles() {
    const { data } = await supabase.from('raffles').select('*').eq('status', 'active').order('created_at', { ascending: false })
    if (data && data.length > 0) setRaffles(data)
    else setRaffles([
      { id: 1, title: 'MOTO YAMAHA MT-03 + $500.000', is_featured: true, ticket_price: 5000, raffle_date: '2025-04-15', lottery_name: 'BOGOTÁ', number_range: 100, prizes: [{ amount: 'Moto Yamaha MT-03' }, { amount: '$500.000 efectivo' }, { amount: '$200.000 efectivo' }] },
      { id: 2, title: 'VIAJE A CANCÚN TODO INCLUIDO', is_featured: true, ticket_price: 10000, raffle_date: '2025-05-01', lottery_name: 'MEDELLÍN', number_range: 100, prizes: [{ amount: 'Viaje Cancún para 2' }, { amount: '$1.000.000 efectivo' }, { amount: 'iPhone 16 Pro' }] },
    ])
  }

  async function fetchMyTickets() {
    const { data } = await supabase.from('tickets').select('*, raffles(title)').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setMyTickets(data)
  }

  async function doLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setAuthPage(null)
    setPage('home')
  }

  async function doRegister(name, phone, email, password, refCode) {
    const referralCode = 'REY-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, phone, referral_code: referralCode, role: 'customer' } }
    })
    if (error) throw error
    if (data.session) {
      await supabase.from('users_profile').upsert({
        id: data.user.id, full_name: name, phone, email,
        role: 'customer', credits: 500, points: 1000,
        referral_code: referralCode, is_promoter: false
      })
      setUser(data.user)
      await fetchProfile(data.user.id)
      setAuthPage(null)
      setPage('home')
      return
    }
    if (data.user && !data.session) {
      throw new Error('Revisa tu correo y confirma tu cuenta para continuar.')
    }
    setAuthPage(null)
    setPage('home')
  }

  async function doLogout() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setMyTickets([])
    setPage('home')
  }

  async function reserveNumbers() {
    if (!user) { setAuthPage('login'); return }
    if (selectedNums.length === 0) return
    const r = selectedRaffle
    const { error } = await supabase.from('tickets').insert({
      user_id: user.id, raffle_id: r.id,
      numbers: selectedNums, status: 'reserved',
      total_amount: selectedNums.length * r.ticket_price
    })
    if (error) { alert('Error al reservar. Intenta de nuevo.'); return }
    await fetchMyTickets()
    setSelectedNums([])
    alert('♛ ¡Números reservados! Ve a tu perfil para pagar.')
    setPage('profile')
  }

  async function becomePromoter() {
    if (!user) return
    const refCode = 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    await supabase.from('users_profile').update({ is_promoter: true, referral_code: refCode }).eq('id', user.id)
    await supabase.from('promoters').upsert({ user_id: user.id, referral_code: refCode, total_earnings: 0, pending_earnings: 0, level1_rate: 15, level2_rate: 7, level3_rate: 3 })
    await fetchProfile(user.id)
    alert('🎉 ¡Ya eres Heraldo del Reino!')
    setPage('promoter')
  }

  if (loading) return <Loading />
  if (authPage === 'login') return <LoginScreen onLogin={doLogin} onRegister={() => setAuthPage('register')} onBack={() => setAuthPage(null)} />
  if (authPage === 'register') return <RegisterScreen onRegister={doRegister} onLogin={() => setAuthPage('login')} />

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Invitado'
  const isAdmin = profile?.role === 'admin'

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <header style={S.header}>
        <button onClick={() => setPage('home')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: 8, borderRadius: '50%', position: 'relative' }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ width: 8, height: 8, background: '#e74c3c', borderRadius: '50%', position: 'absolute', top: 3, right: 3 }}></span>
        </button>
        <Logo />
        {user
          ? <button onClick={() => setPage('profile')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: 8 }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
          : <button onClick={() => setAuthPage('login')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: 8 }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            </button>
        }
      </header>
      <main>
        {page === 'home' && <HomePage raffles={raffles} displayName={displayName} onRaffle={r => { setSelectedRaffle(r); setSelectedNums([]); setPage('raffle') }} />}
        {page === 'raffle' && selectedRaffle && <RafflePage raffle={selectedRaffle} user={user} myTickets={myTickets} selectedNums={selectedNums} setSelectedNums={setSelectedNums} onReserve={reserveNumbers} onBack={() => setPage('home')} onLogin={() => setAuthPage('login')} />}
        {page === 'profile' && <ProfilePage user={user} profile={profile} myTickets={myTickets} onLogout={doLogout} onLogin={() => setAuthPage('login')} onRegister={() => setAuthPage('register')} onPromoter={() => setPage('promoter')} onBecomePromoter={becomePromoter} isAdmin={isAdmin} onAdmin={() => setPage('admin')} onRefresh={fetchMyTickets} />}
        {page === 'promoter' && <PromoterPage user={user} profile={profile} onBack={() => setPage('profile')} />}
        {page === 'points' && <PointsPage profile={profile} onLogin={() => setAuthPage('login')} user={user} />}
        {page === 'support' && <SupportPage user={user} messages={chatMessages} setMessages={setChatMessages} />}
        {page === 'admin' && <AdminPage isAdmin={isAdmin} raffles={raffles} onBack={() => setPage('home')} />}
      </main>
      <nav style={S.bottomNav}>
        {[
          { id: 'home', label: 'Inicio', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
          { id: 'points', label: 'Puntos', d: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' },
          { id: 'support', label: 'Soporte', d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
          { id: 'profile', label: 'Perfil', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
        ].map(({ id, label, d }) => (
          <button key={id} onClick={() => setPage(id)} style={S.navBtn(page === id)}>
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d={d}/></svg>
            <span style={{ fontSize: 9, fontWeight: 600 }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function HomePage({ raffles, displayName, onRaffle }) {
  return (
    <div style={S.content}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }} className="crown-float">♛</span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>Bienvenido al Reino, {displayName.split(' ')[0]}!</h1>
        </div>
        <p style={{ color: '#888', fontSize: 14 }}>Participa en los sorteos reales y reclama tu premio 👑</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 20, background: '#D4AF37', borderRadius: 4 }}></div>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 17, margin: 0 }}>⚔️ Sorteos del Reino</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {raffles.map(r => (
          <div key={r.id} onClick={() => onRaffle(r)} style={{ background: '#000', border: '2px solid #D4AF37', borderRadius: 16, padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {r.is_featured && <span style={S.badge('gold')}>⭐ Destacado</span>}
                <span style={S.badge('green')}>✓ Activo</span>
              </div>
            </div>
            <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{r.title}</h3>
            {(Array.isArray(r.prizes) ? r.prizes : []).slice(0, 3).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 13 }}>{medals[i]}</span>
                <span style={{ color: '#ddd', fontSize: 12 }}>{p.amount || p}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#aaa' }}>
              <span>📅 {fmtDate(r.raffle_date)}</span>
              <span>🎱 {r.lottery_name}</span>
              <span>🔢 {r.number_range <= 100 ? '00–99' : '000–999'}</span>
            </div>
            <div style={{ height: 1, background: '#1a1a1a' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontSize: 21, fontWeight: 900 }}>{fmt(r.ticket_price)}</span>
              <button style={{ background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', color: '#000', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 800, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>♛ Elegir números</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RafflePage({ raffle: r, user, myTickets, selectedNums, setSelectedNums, onReserve, onBack, onLogin }) {
  const range = r.number_range || 100
  const cols = range <= 100 ? 10 : 20
  const reservedNums = myTickets.filter(t => t.raffle_id === r.id).flatMap(t => t.numbers || [])
  const prizes = Array.isArray(r.prizes) ? r.prizes : []
  const toggleNum = n => setSelectedNums(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const luckyNum = () => {
    const avail = Array.from({ length: range }, (_, i) => i).filter(n => !reservedNums.includes(n) && !selectedNums.includes(n))
    if (avail.length) setSelectedNums(prev => [...prev, avail[Math.floor(Math.random() * avail.length)]])
  }
  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontWeight: 700, marginBottom: 16, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>← Volver</button>
      <div style={{ background: '#0d0d0d', border: '2px solid #D4AF37', borderRadius: 20, padding: 18, marginBottom: 14 }}>
        <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 14px' }}>{r.title}</h1>
        {prizes.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 9, padding: '9px 12px', marginBottom: 7 }}>
            <span style={{ fontSize: 18 }}>{medals[i]}</span>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{p.amount || p}</div>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          {[['Valor', fmt(r.ticket_price)], ['Fecha', new Date(r.raffle_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })], ['Lotería', r.lottery_name]].map(([l, v]) => (
            <div key={l} style={{ background: 'rgba(212,175,55,.07)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ color: '#888', fontSize: 9, textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
              <div style={{ color: l === 'Valor' ? '#D4AF37' : '#fff', fontSize: l === 'Valor' ? 14 : 11, fontWeight: 900 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>Elige tus números</h3>
          <button onClick={luckyNum} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, color: '#D4AF37', fontSize: 11, fontWeight: 700, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>♛ Número Real</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 5 }}>
          {Array.from({ length: range }, (_, n) => {
            const pad = range <= 100 ? String(n).padStart(2, '0') : String(n).padStart(3, '0')
            const isRes = reservedNums.includes(n), isSel = selectedNums.includes(n)
            return <button key={n} onClick={() => !isRes && toggleNum(n)} disabled={isRes} style={{ aspectRatio: 1, border: `1.5px solid ${isSel ? '#D4AF37' : isRes ? 'rgba(52,152,219,0.4)' : '#333'}`, borderRadius: 8, background: isSel ? 'rgba(212,175,55,0.2)' : isRes ? 'rgba(52,152,219,0.15)' : '#111', color: isSel ? '#D4AF37' : isRes ? '#3498db' : '#aaa', fontSize: 11, fontWeight: 700, cursor: isRes ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>{pad}</button>
          })}
        </div>
        {selectedNums.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ background: 'rgba(212,175,55,0.08)', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#888', fontSize: 12 }}>Números seleccionados:</span>
                <span style={{ color: '#D4AF37', fontSize: 12, fontWeight: 700 }}>{selectedNums.map(n => range <= 100 ? String(n).padStart(2, '0') : String(n).padStart(3, '0')).join(', ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888', fontSize: 12 }}>Total:</span>
                <span style={{ color: '#D4AF37', fontSize: 18, fontWeight: 900 }}>{fmt(selectedNums.length * r.ticket_price)}</span>
              </div>
            </div>
            <button onClick={user ? onReserve : onLogin} style={S.btnGold}>♛ {user ? 'Reservar mis números' : 'Inicia sesión para reservar'}</button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfilePage({ user, profile, myTickets, onLogout, onLogin, onRegister, onPromoter, onBecomePromoter, isAdmin, onAdmin, onRefresh }) {
  if (!user) return (
    <div style={{ ...S.content, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }} className="crown-float">♛</div>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>Accede al Reino</h2>
      <p style={{ color: '#888', marginBottom: 28, fontSize: 14 }}>Inicia sesión para ver tus boletos y más</p>
      <button onClick={onLogin} style={{ ...S.btnGold, maxWidth: 280 }}>♛ Acceder al Reino →</button>
      <button onClick={onRegister} style={{ ...S.btnOutline, maxWidth: 280, marginTop: 12 }}>Unirme al Reino</button>
    </div>
  )
  const reserved = myTickets.filter(t => t.status === 'reserved')
  const paid = myTickets.filter(t => t.status === 'paid')
  const name = profile?.full_name || user.email
  const isPromoter = profile?.is_promoter
  return (
    <div style={S.content}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 58, height: 58, background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#000', border: '3px solid rgba(212,175,55,0.4)' }}>{name[0].toUpperCase()}</div>
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, background: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, border: '2px solid #0A0A0A' }}>♛</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#888', fontSize: 12 }}>Hola,</div>
          <div style={{ color: '#D4AF37', fontWeight: 900, fontSize: 20 }}>{name}</div>
          <span style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, background: '#D4AF37', borderRadius: '50%', display: 'inline-block' }}></span>
            {isAdmin ? 'Rey Administrador' : isPromoter ? 'Heraldo del Reino' : 'Caballero del Reino'}
          </span>
        </div>
        <button onClick={onLogout} style={{ width: 38, height: 38, background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
      {isPromoter
        ? <button onClick={onPromoter} style={{ ...S.btnGold, marginBottom: 14, fontSize: 13 }}>📣 HERALDO DEL REINO →</button>
        : <button onClick={onBecomePromoter} style={{ ...S.btnGold, marginBottom: 14, fontSize: 13 }}>♛ CONVERTIRME EN HERALDO DEL REINO</button>
      }
      {isAdmin && <button onClick={onAdmin} style={{ ...S.btnOutline, marginBottom: 14, fontSize: 13 }}>♛ SALA DEL TRONO (ADMINISTRADOR)</button>}
      <div style={{ background: 'linear-gradient(135deg,#1a2a3a,#162030)', border: '1px solid rgba(52,152,219,0.25)', borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#3498db', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>⚜️ Mi Tesoro Real</div>
          <div style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>{fmt(profile?.credits || 0)}</div>
          <div style={{ color: '#3498db', fontSize: 11, opacity: .7 }}>DISPONIBLE</div>
        </div>
        <button style={{ background: 'linear-gradient(135deg,#e67e22,#f39c12)', border: 'none', borderRadius: 12, padding: '12px 18px', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>+ Recargar</button>
      </div>
      <div style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 16, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#D4AF37', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>♛ Puntos de Nobleza</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>{(profile?.points || 0).toLocaleString()}</span>
            <span style={{ color: '#888', fontSize: 13 }}>pts</span>
          </div>
        </div>
        <button style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '9px 14px', color: '#aaa', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Historial</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 22, background: '#D4AF37', borderRadius: 4 }}></div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>♛ MIS TÍTULOS REALES</h2>
      </div>
      {reserved.length > 0 && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, background: '#D4AF37', borderRadius: '50%' }}></div>
          <span style={{ color: '#D4AF37', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Reservados ({reserved.length})</span>
        </div>
        {reserved.map(t => <TicketCard key={t.id} ticket={t} onRefresh={onRefresh} />)}
      </>}
      {paid.length > 0 && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 }}>
          <div style={{ width: 8, height: 8, background: '#27AE60', borderRadius: '50%' }}></div>
          <span style={{ color: '#27AE60', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Pagados ({paid.length})</span>
        </div>
        {paid.map(t => <TicketCard key={t.id} ticket={t} paid onRefresh={onRefresh} />)}
      </>}
      {myTickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🎟️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>No tienes títulos reales aún</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>¡Participa en un sorteo del Reino!</div>
        </div>
      )}
    </div>
  )
}

function TicketCard({ ticket: t, paid, onRefresh }) {
  const nums = t.numbers || []
  const range = nums.length > 0 && Math.max(...nums) > 99 ? 1000 : 100
  const display = nums.map(n => range <= 100 ? String(n).padStart(2, '0') : String(n).padStart(3, '0'))
  async function release() {
    if (!confirm('¿Liberar estos números?')) return
    await supabase.from('tickets').update({ status: 'released' }).eq('id', t.id)
    onRefresh()
  }
  return (
    <div style={{ background: '#111', border: `1px solid ${paid ? 'rgba(39,174,96,0.2)' : 'rgba(212,175,55,0.2)'}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <div style={{ color: '#D4AF37', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Sorteo</div>
      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{t.raffles?.title || 'Sorteo'}</div>
      <div style={{ color: paid ? '#27AE60' : '#D4AF37', fontSize: 42, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>#{display.join(' #')}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: paid ? 0 : 12 }}>
        <span style={S.badge(paid ? 'green' : 'dim')}>{paid ? '✓ PAGADO' : '● RESERVADO'}</span>
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 900 }}>{fmt(t.total_amount)}</span>
      </div>
      {!paid && <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <button onClick={() => alert('Función de pago próximamente')} style={{ background: '#1e3a5f', border: '1px solid rgba(52,152,219,0.3)', borderRadius: 10, padding: 11, color: '#3498db', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>MI DINERO</button>
          <button onClick={() => alert('Pagar con puntos próximamente')} style={{ background: '#111', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 10, padding: 11, color: '#D4AF37', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>PUNTOS</button>
        </div>
        <button onClick={release} style={{ width: '100%', background: 'transparent', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', padding: 6, fontFamily: 'inherit' }}>🗑 LIBERAR BOLETO</button>
      </>}
    </div>
  )
}

function PromoterPage({ user, profile, onBack }) {
  const [referrals, setReferrals] = useState([])
  useEffect(() => {
    if (user) supabase.from('referrals').select('*, referred:referred_user_id(email)').eq('promoter_id', user.id).then(({ data }) => { if (data) setReferrals(data) })
  }, [user])
  if (!profile?.is_promoter) return <div style={{ ...S.content, textAlign: 'center', paddingTop: 60 }}><p style={{ color: '#888' }}>No eres Heraldo del Reino aún</p><button onClick={onBack} style={{ ...S.btnGold, maxWidth: 240, margin: '16px auto 0' }}>Volver</button></div>
const refUrl = `https://glowing-puppy-df9560.netlify.app/?ref=${profile?.referral_code}`  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontWeight: 700, marginBottom: 16, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>← Volver</button>
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 19, marginBottom: 20 }}>📣 Panel del Heraldo</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[[referrals.length, 'Referidos'], [fmt(profile?.total_earnings || 0), 'Ganancias'], [fmt(profile?.pending_earnings || 0), 'Por cobrar'], ['15%', 'Comisión N1']].map(([val, label]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#D4AF37' }}>{val}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 3, textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>🔗 Tu enlace del Reino</div>
        <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px dashed rgba(212,175,55,0.3)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: '#D4AF37', fontFamily: 'monospace', wordBreak: 'break-all' }}>{refUrl}</span>
          <button onClick={() => navigator.clipboard.writeText(refUrl).then(() => alert('✅ Copiado!'))} style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, color: '#D4AF37', fontSize: 11, fontWeight: 700, padding: '6px 10px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Copiar</button>
        </div>
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`👑 Únete a Los Reyes De Las Dinámicas!\n👉 ${refUrl}`)}`)} style={S.btnGold}>📱 Compartir por WhatsApp</button>
      </div>
      <div style={{ ...S.card }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>💸 Comisiones del Reino</div>
        {[['Nivel 1 — Referido directo', '15%'], ['Nivel 2 — Referido indirecto', '7%'], ['Nivel 3 — Tercer nivel', '3%']].map(([label, pct]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,175,55,0.04)', borderRadius: 9, padding: '10px 12px', marginBottom: 8 }}>
            <span style={{ color: '#fff', fontSize: 13 }}>{label}</span>
            <span style={S.badge('gold')}>{pct}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PointsPage({ user, profile, onLogin }) {
  return (
    <div style={S.content}>
      <div style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.04))', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, padding: 20, marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }} className="crown-float">♛</div>
        <div style={{ color: '#D4AF37', fontSize: 30, fontWeight: 900 }}>{(profile?.points || 0).toLocaleString()}</div>
        <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Tus Puntos de Nobleza</div>
        {!user && <button onClick={onLogin} style={{ ...S.btnGold, marginTop: 14, maxWidth: 260, margin: '14px auto 0' }}>Inicia sesión para ganar puntos</button>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 4, height: 20, background: '#D4AF37', borderRadius: 4 }}></div>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 17, margin: 0 }}>¿Cómo ganar puntos?</h2>
      </div>
      {[['🎯','Comprar un título','Por cada boleto comprado','+100 pts'],['👥','Referir un Caballero','Cuando se registra con tu enlace','+500 pts'],['📱','Compartir un sorteo','Por cada sorteo compartido','+50 pts'],['💰','Recargar el Tesoro','Por cada recarga realizada','+200 pts'],['📸','Seguir en Instagram','@losreyesdelasdinamicas','+30 pts']].map(([icon,title,desc,pts]) => (
        <div key={title} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 20 }}>{icon}</span><div><div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{title}</div><div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{desc}</div></div></div>
          <span style={S.badge('dim')}>{pts}</span>
        </div>
      ))}
    </div>
  )
}

function SupportPage({ user, messages, setMessages }) {
  const [msg, setMsg] = useState('')
  const send = () => {
    if (!msg.trim()) return
    const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { from: 'user', text: msg, time: now }])
    setMsg('')
    setTimeout(() => setMessages(prev => [...prev, { from: 'agent', text: 'Gracias 🙌 Un Heraldo te atenderá en breve.', time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }]), 800)
  }
  return (
    <div style={{ ...S.content, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 145px)' }}>
      <div style={{ ...S.card, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♛</div>
        <div><div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Heraldos del Reino</div><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 7, height: 7, background: '#27AE60', borderRadius: '50%' }} className="pulse"></div><span style={{ color: '#27AE60', fontSize: 11 }}>En línea</span></div></div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '80%', background: m.from === 'user' ? 'linear-gradient(135deg,#D4AF37,#F2C94C)' : '#1C1C1E', color: m.from === 'user' ? '#000' : '#fff', borderRadius: m.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '10px 14px', fontSize: 13 }}>
              {m.text}<div style={{ fontSize: 10, color: m.from === 'user' ? 'rgba(0,0,0,.45)' : '#555', marginTop: 4, textAlign: 'right' }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      {user
        ? <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}><input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Escribe tu mensaje..." style={{ flex: 1 }} /><button onClick={send} style={{ ...S.btnGold, width: 'auto', padding: '12px 16px', borderRadius: 12 }}>↑</button></div>
        : <button style={S.btnGold}>Inicia sesión para chatear →</button>
      }
    </div>
  )
}

function AdminPage({ isAdmin, raffles, onBack }) {
  const [tab, setTab] = useState(0)
  const [tickets, setTickets] = useState([])
  useEffect(() => {
    if (isAdmin) supabase.from('tickets').select('*, users_profile(full_name), raffles(title)').order('created_at', { ascending: false }).limit(20).then(({ data }) => { if (data) setTickets(data) })
  }, [isAdmin])
  if (!isAdmin) return <div style={{ ...S.content, textAlign: 'center', paddingTop: 60 }}><div style={{ fontSize: 48 }}>🔒</div><p style={{ color: '#888', marginTop: 16 }}>Acceso restringido</p></div>
  const pending = tickets.filter(t => t.status === 'reserved')
  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontWeight: 700, marginBottom: 16, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>← Volver</button>
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 19, marginBottom: 20 }}>⚙️ Sala del Trono</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[['♛', raffles.length, 'Sorteos'], ['🎟️', tickets.length, 'Boletos'], ['⏳', pending.length, 'Pendientes'], ['📣', '—', 'Promotores']].map(([icon, val, label]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#D4AF37' }}>{val}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2, textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: 18 }}>
        {['Sorteos', 'Pagos', 'Config'].map((t, i) => <button key={t} onClick={() => setTab(i)} style={{ flex: 1, padding: 8, border: 'none', background: tab === i ? '#1C1C1E' : 'transparent', color: tab === i ? '#fff' : '#666', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit' }}>{t}</button>)}
      </div>
      {tab === 0 && raffles.map(r => (
        <div key={r.id} style={{ ...S.card, marginBottom: 10 }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 8 }}>{r.title}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { const n = prompt(`Número ganador (0-${r.number_range - 1}):`); if (n !== null) alert(`♛ Ganador: ${String(parseInt(n)).padStart(r.number_range <= 100 ? 2 : 3, '0')}`) }} style={{ flex: 1, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 8, color: '#27AE60', fontSize: 11, fontWeight: 700, padding: 8, cursor: 'pointer', fontFamily: 'inherit' }}>♛ Realizar sorteo</button>
            <button style={{ flex: 1, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, color: '#D4AF37', fontSize: 11, fontWeight: 700, padding: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Editar</button>
          </div>
        </div>
      ))}
      {tab === 1 && (pending.length === 0
        ? <div style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>No hay pagos pendientes ✓</div>
        : pending.map(t => (
          <div key={t.id} style={{ ...S.card, marginBottom: 10 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t.raffles?.title}</div>
            <div style={{ color: '#888', fontSize: 11, marginBottom: 10 }}>{t.users_profile?.full_name} · {fmt(t.total_amount)}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={async () => { await supabase.from('tickets').update({ status: 'paid' }).eq('id', t.id); setTickets(prev => prev.filter(x => x.id !== t.id)); alert('✅ Aprobado') }} style={{ flex: 1, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 8, color: '#27AE60', fontSize: 12, fontWeight: 700, padding: 8, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Aprobar</button>
              <button onClick={async () => { await supabase.from('tickets').update({ status: 'rejected' }).eq('id', t.id); setTickets(prev => prev.filter(x => x.id !== t.id)); alert('✗ Rechazado') }} style={{ flex: 1, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, color: '#e74c3c', fontSize: 12, fontWeight: 700, padding: 8, cursor: 'pointer', fontFamily: 'inherit' }}>✗ Rechazar</button>
            </div>
          </div>
        ))
      )}
      {tab === 2 && (
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>💸 Comisiones del Reino</div>
          {[['Nivel 1 %', 15], ['Nivel 2 %', 7], ['Nivel 3 %', 3]].map(([label, val]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
              <input type="number" defaultValue={val} min="0" max="50" />
            </div>
          ))}
          <button onClick={() => alert('Guardado ♛')} style={{ ...S.btnGold, marginTop: 6, fontSize: 13 }}>Guardar</button>
        </div>
      )}
    </div>
  )
}

function LoginScreen({ onLogin, onRegister, onBack }) {
  const [email, setEmail] = useState(''); const [pwd, setPwd] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const submit = async () => { setLoading(true); setError(''); try { await onLogin(email, pwd) } catch { setError('Email o contraseña incorrectos') } finally { setLoading(false) } }
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }} className="crown-float">♛</div>
          <div style={{ fontSize: 9, color: '#D4AF37', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>Los Reyes De Las Dinámicas</div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 26, marginBottom: 6 }}>Accede al Reino</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>📧 Correo del Reino</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tuusuario@email.com" /></div>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>🔐 Contraseña</label><input type="password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="••••••••" /></div>
          {error && <div style={{ color: '#e74c3c', fontSize: 13, textAlign: 'center' }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ ...S.btnGold, opacity: loading ? .7 : 1 }}>{loading ? 'Entrando...' : '♛ Entrar al Reino →'}</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, color: '#555', fontSize: 14 }}>¿No tienes título? <button onClick={onRegister} style={{ background: 'none', border: 'none', color: '#D4AF37', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Únete al Reino</button></p>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', width: '100%', textAlign: 'center', marginTop: 12, fontSize: 13, fontFamily: 'inherit' }}>Explorar como visitante</button>
      </div>
    </div>
  )
}

function RegisterScreen({ onRegister, onLogin }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', ref: '' }); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const submit = async () => {
    if (!form.name || !form.email || !form.password) { setError('Completa todos los campos'); return }
    if (form.password.length < 6) { setError('Contraseña mínimo 6 caracteres'); return }
    setLoading(true); setError('')
    try { await onRegister(form.name, form.phone, form.email, form.password, form.ref) }
    catch (e) { setError(e.message || 'Error al registrarse') }
    finally { setLoading(false) }
  }
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 380, margin: '0 auto', width: '100%', paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }} className="crown-float">♛</div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 24, marginBottom: 5 }}>Únete al Reino ♛</h1>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>Reclama tu título y empieza a ganar</p>
        </div>
        <div style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: 12, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎁</span>
          <div><div style={{ color: '#D4AF37', fontSize: 13, fontWeight: 700 }}>¡Bono de Bienvenida Real!</div><div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>500 monedas + 1000 puntos de nobleza</div></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['👤 Nombre del Caballero','name','text','Tu nombre completo'],['📱 WhatsApp','phone','tel','+57 300 000 0000'],['📧 Correo del Reino','email','email','tuusuario@email.com'],['🔐 Contraseña','password','password','Mínimo 6 caracteres'],['🔗 Código de referido (opcional)','ref','text','REF-XXXXXX']].map(([label, key, type, placeholder]) => (
            <div key={key}><label style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label><input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} /></div>
          ))}
          {error && <div style={{ color: '#e74c3c', fontSize: 13, textAlign: 'center' }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ ...S.btnGold, marginTop: 6, opacity: loading ? .7 : 1 }}>{loading ? 'Creando tu título...' : '♛ Reclamar mi título →'}</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#555', fontSize: 14 }}>¿Ya tienes título? <button onClick={onLogin} style={{ background: 'none', border: 'none', color: '#D4AF37', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Acceder al Reino</button></p>
      </div>
    </div>
  )
}
