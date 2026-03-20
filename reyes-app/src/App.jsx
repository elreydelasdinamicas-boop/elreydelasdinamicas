import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase.js'

const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)
const fmtDate = d => new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtTime = d => new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
const medals = ['🥇', '🥈', '🥉', '🎯']

const S = {
  header: { position: 'sticky', top: 0, zIndex: 40, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(212,175,55,0.2)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px' },
  content: { padding: '16px 16px 88px', maxWidth: 500, margin: '0 auto' },
  card: { background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16 },
  btnGold: { background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', color: '#000', border: 'none', borderRadius: 12, padding: '14px 20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, width: '100%', fontFamily: 'inherit', transition: 'opacity .2s' },
  btnOutline: { background: 'transparent', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.35)', borderRadius: 12, padding: '13px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, width: '100%', fontFamily: 'inherit' },
  navBtn: (active) => ({ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '8px 10px', color: active ? '#D4AF37' : '#555', transform: active ? 'scale(1.08)' : 'scale(1)', transition: 'all .2s', minWidth: 52 }),
  badge: (type) => {
    const map = { gold: { background: '#D4AF37', color: '#000' }, green: { background: 'rgba(39,174,96,0.18)', color: '#27AE60' }, blue: { background: 'rgba(52,152,219,0.15)', color: '#3498db' }, red: { background: 'rgba(231,76,60,0.15)', color: '#e74c3c' }, dim: { background: 'rgba(212,175,55,0.12)', color: '#D4AF37' } }
    return { borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '.5px', ...map[type] }
  }
}

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
    <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}>♛</div>
    <div><b style={{ fontSize: 14, fontWeight: 900, color: '#fff', display: 'block', lineHeight: 1.1 }}>Los Reyes</b><span style={{ fontSize: 9, color: '#D4AF37', fontWeight: 600, letterSpacing: '.5px' }}>De Las Dinámicas</span></div>
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
  const [allReservedNums, setAllReservedNums] = useState([])

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

  // ─── REALTIME: boletos reservados en tiempo real ─────────────────────────
  useEffect(() => {
    if (!selectedRaffle) return
    fetchAllReservedNums(selectedRaffle.id)
    const channel = supabase.channel(`tickets-raffle-${selectedRaffle.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `raffle_id=eq.${selectedRaffle.id}` }, () => {
        fetchAllReservedNums(selectedRaffle.id)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [selectedRaffle])

  async function fetchAllReservedNums(raffleId) {
    const { data } = await supabase.from('tickets').select('numbers').eq('raffle_id', raffleId).in('status', ['reserved', 'paid'])
    if (data) setAllReservedNums(data.flatMap(t => t.numbers || []))
  }

  async function fetchProfile(userId) {
    const { data } = await supabase.from('users_profile').select('*').eq('id', userId).single()
    if (data) setProfile(data)
  }

  async function fetchRaffles() {
    const { data } = await supabase.from('raffles').select('*').eq('status', 'active').order('created_at', { ascending: false })
    if (data && data.length > 0) setRaffles(data)
    else setRaffles([
      { id: 1, title: 'MOTO YAMAHA MT-03 + $500.000', is_featured: true, ticket_price: 5000, raffle_date: '2025-04-15', lottery_name: 'BOGOTÁ', number_range: 100, prizes: [{ amount: 'Moto Yamaha MT-03' }, { amount: '$500.000 efectivo' }, { amount: '$200.000 efectivo' }] },
    ])
  }

  async function fetchMyTickets() {
    const { data } = await supabase.from('tickets').select('*, raffles(title)').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setMyTickets(data)
  }

  async function doLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setAuthPage(null); setPage('home')
  }

  async function doRegister(name, phone, email, password) {
    const referralCode = 'REY-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, phone, referral_code: referralCode, role: 'customer' } }
    })
    if (error) throw error
    if (data.session) {
      await supabase.from('users_profile').upsert({ id: data.user.id, full_name: name, phone, email, role: 'customer', credits: 500, points: 1000, referral_code: referralCode, is_promoter: false })
      setUser(data.user)
      await fetchProfile(data.user.id)
      setAuthPage(null); setPage('home')
      return
    }
    if (data.user && !data.session) throw new Error('Revisa tu correo y confirma tu cuenta.')
    setAuthPage(null); setPage('home')
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
    // Verificar en tiempo real que no estén tomados
    const { data: existing } = await supabase.from('tickets').select('numbers').eq('raffle_id', r.id).in('status', ['reserved', 'paid'])
    const taken = (existing || []).flatMap(t => t.numbers || [])
    const conflict = selectedNums.filter(n => taken.includes(n))
    if (conflict.length > 0) {
      const pad = r.number_range <= 100
      alert(`⚠️ Los números ${conflict.map(n => pad ? String(n).padStart(2,'0') : String(n).padStart(3,'0')).join(', ')} ya fueron reservados. Por favor elige otros.`)
      await fetchAllReservedNums(r.id)
      setSelectedNums([])
      return
    }
    const { error } = await supabase.from('tickets').insert({ user_id: user.id, raffle_id: r.id, numbers: selectedNums, status: 'reserved', total_amount: selectedNums.length * r.ticket_price })
    if (error) { alert('Error al reservar. Intenta de nuevo.'); return }
    await fetchMyTickets()
    setSelectedNums([])
    alert('♛ ¡Números reservados en el Reino! Ve a tu perfil para pagar.')
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
        <button onClick={() => setPage('home')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: 8, position: 'relative' }}>
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
        {page === 'raffle' && selectedRaffle && <RafflePage raffle={selectedRaffle} user={user} allReservedNums={allReservedNums} selectedNums={selectedNums} setSelectedNums={setSelectedNums} onReserve={reserveNumbers} onBack={() => setPage('home')} onLogin={() => setAuthPage('login')} />}
        {page === 'profile' && <ProfilePage user={user} profile={profile} myTickets={myTickets} onLogout={doLogout} onLogin={() => setAuthPage('login')} onRegister={() => setAuthPage('register')} onPromoter={() => setPage('promoter')} onBecomePromoter={becomePromoter} isAdmin={isAdmin} onAdmin={() => setPage('admin')} onRefresh={fetchMyTickets} />}
        {page === 'promoter' && <PromoterPage user={user} profile={profile} onBack={() => setPage('profile')} />}
        {page === 'points' && <PointsPage user={user} profile={profile} onLogin={() => setAuthPage('login')} />}
        {page === 'support' && <SupportPage user={user} profile={profile} isAdmin={false} />}
        {page === 'admin' && <AdminPage user={user} profile={profile} isAdmin={isAdmin} raffles={raffles} onBack={() => setPage('home')} onOpenSupport={() => setPage('admin-support')} />}
        {page === 'admin-support' && <SupportPage user={user} profile={profile} isAdmin={true} onBack={() => setPage('admin')} />}
      </main>
      <nav style={S.bottomNav}>
        {[
          { id: 'home', label: 'Inicio', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { id: 'points', label: 'Puntos', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { id: 'support', label: 'Soporte', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { id: 'profile', label: 'Perfil', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => setPage(id)} style={S.navBtn(page === id)}>
            {icon}
            <span style={{ fontSize: 9, fontWeight: 600 }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
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
            </div>
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

// ─── RAFFLE PAGE ─────────────────────────────────────────────────────────────
function RafflePage({ raffle: r, user, allReservedNums, selectedNums, setSelectedNums, onReserve, onBack, onLogin }) {
  const range = r.number_range || 100
  const cols = range <= 100 ? 10 : 20
  const prizes = Array.isArray(r.prizes) ? r.prizes : []
  const societyNums = Array.isArray(r.society_numbers) ? r.society_numbers : []
  const [verifyName, setVerifyName] = useState('')
  const [verifyPhone, setVerifyPhone] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [societyModal, setSocietyModal] = useState(null)

  const toggleNum = n => setSelectedNums(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const luckyNum = () => {
    const avail = Array.from({ length: range }, (_, i) => i).filter(n => !allReservedNums.includes(n) && !selectedNums.includes(n) && !societyNums.includes(n))
    if (avail.length) setSelectedNums(prev => [...prev, avail[Math.floor(Math.random() * avail.length)]])
  }
  const getStatus = n => allReservedNums.includes(n) ? 'reserved' : societyNums.includes(n) ? 'society' : 'available'

  const verifyTicket = async () => {
    if (!verifyName && !verifyPhone) return
    let ids = []
    if (verifyPhone) {
      const { data } = await supabase.from('users_profile').select('id').ilike('phone', `%${verifyPhone}%`)
      ids = (data || []).map(u => u.id)
    } else {
      const { data } = await supabase.from('users_profile').select('id').ilike('full_name', `%${verifyName}%`)
      ids = (data || []).map(u => u.id)
    }
    if (!ids.length) { setVerifyResult([]); return }
    const { data } = await supabase.from('tickets').select('*').eq('raffle_id', r.id).in('user_id', ids)
    setVerifyResult(data || [])
  }

  return (
    <div style={{ paddingBottom: 88 }}>
      <div style={{ background: 'linear-gradient(180deg,#1a1400 0%,#0A0A0A 100%)', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>← Volver</button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🎟️ ${r.title}\n💵 ${fmt(r.ticket_price)} por número\n👉 https://glowing-puppy-df9560.netlify.app`)}`)} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', padding: 8 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 26 }}>🏆</div>
          <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 6px' }}>{r.title}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 999, padding: '6px 16px' }}>
            <span style={{ color: '#aaa', fontSize: 12 }}>Valor del boleto:</span>
            <span style={{ color: '#D4AF37', fontSize: 14, fontWeight: 900 }}>{fmt(r.ticket_price)}</span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', padding: '12px 16px', display: 'flex', gap: 10, scrollbarWidth: 'none' }}>
        {prizes.map((p, i) => (
          <div key={i} style={{ flexShrink: 0, background: '#111', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: '12px 16px', minWidth: 140, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{medals[i]}</div>
            <div style={{ color: '#888', fontSize: 9, textTransform: 'uppercase', marginBottom: 4 }}>Premio {i+1}</div>
            <div style={{ color: '#D4AF37', fontSize: 13, fontWeight: 800 }}>{p.amount || p.title || p}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* GRID */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>Selecciona tu número</h3>
              <div style={{ color: '#27AE60', fontSize: 10, marginTop: 2 }}>🔴 En vivo — se actualiza automáticamente</div>
            </div>
            <button onClick={luckyNum} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, color: '#D4AF37', fontSize: 11, fontWeight: 700, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>♛ Suerte</button>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            {[['#111','#222','#555','Disponible'],['rgba(212,175,55,0.25)','#D4AF37','#D4AF37','Seleccionado'],['#1a1a1a','rgba(255,255,255,0.1)','#555','Reservado 🔒'],['rgba(52,152,219,0.12)','rgba(52,152,219,0.4)','#3498db','Sociedad']].map(([bg,border,color,label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 13, height: 13, background: bg, border: `1px solid ${border}`, borderRadius: 3 }}></div><span style={{ fontSize: 10, color: '#666' }}>{label}</span></div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}>
            {Array.from({ length: range }, (_, n) => {
              const pad = range <= 100 ? String(n).padStart(2,'0') : String(n).padStart(3,'0')
              const st = getStatus(n)
              const isSel = selectedNums.includes(n)
              const isRes = st === 'reserved'
              const isSoc = st === 'society'
              return (
                <button key={n} onClick={() => { if(isRes) return; if(isSoc){setSocietyModal(n);return} toggleNum(n) }}
                  style={{ aspectRatio: 1, border: `1.5px solid ${isSel?'#D4AF37':isRes?'rgba(255,255,255,0.08)':isSoc?'rgba(52,152,219,0.4)':'#1e1e1e'}`, borderRadius: 7, background: isSel?'rgba(212,175,55,0.25)':isRes?'#141414':isSoc?'rgba(52,152,219,0.12)':'#0d0d0d', color: isSel?'#D4AF37':isRes?'#333':isSoc?'#3498db':'#555', fontSize: isRes?8:11, fontWeight: 700, cursor: isRes?'not-allowed':'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isRes ? '🔒' : pad}
                </button>
              )
            })}
          </div>
          {selectedNums.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ background: 'rgba(212,175,55,0.07)', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#888', fontSize: 12 }}>Seleccionados:</span>
                  <span style={{ color: '#D4AF37', fontSize: 12, fontWeight: 700 }}>{selectedNums.map(n => range<=100?String(n).padStart(2,'0'):String(n).padStart(3,'0')).join(', ')}</span>
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

        {societyNums.length > 0 && (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(52,152,219,0.25)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>💎</div>
              <h3 style={{ color: '#D4AF37', fontWeight: 900, fontSize: 15, margin: '0 0 4px', textTransform: 'uppercase' }}>♛ Boletos en Sociedad del Reino ♛</h3>
              <p style={{ color: '#888', fontSize: 12, margin: 0 }}>Comparte el 50% del valor con otro participante.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {societyNums.map(n => {
                const pad = range<=100?String(n).padStart(2,'0'):String(n).padStart(3,'0')
                const isOwned = allReservedNums.includes(n)
                return (
                  <div key={n} style={{ background: isOwned?'rgba(39,174,96,0.08)':'#111', border: `1px solid ${isOwned?'rgba(39,174,96,0.3)':'rgba(212,175,55,0.2)'}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ background: 'rgba(212,175,55,0.1)', borderRadius: 8, padding: '4px 10px', fontSize: 18, fontWeight: 900, color: '#D4AF37' }}>{pad}</div>
                      <span style={{ ...S.badge(isOwned?'green':'dim'), fontSize: 9 }}>{isOwned?'✓ Completo':'● Disponible'}</span>
                    </div>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{isOwned?'Sociedad Completa':'Disponible'}</div>
                    <div style={{ color: '#888', fontSize: 11, marginBottom: isOwned?0:10 }}>Boleto {isOwned?'completo':'100% tuyo'}</div>
                    {!isOwned && <button onClick={() => user?setSocietyModal(n):onLogin()} style={{ width:'100%', background:'linear-gradient(135deg,#D4AF37,#F2C94C)', border:'none', borderRadius:8, padding:'8px', color:'#000', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Dueño Único — {fmt(r.ticket_price)}</button>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* VERIFICAR */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🔍</div>
            <h3 style={{ color: '#D4AF37', fontWeight: 900, fontSize: 15, margin: '0 0 4px', textTransform: 'uppercase' }}>Verificar mi Boleto Real ♛</h3>
            <p style={{ color: '#888', fontSize: 12, margin: 0 }}>Consulta el estado en el libro real de registros.</p>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Nombre del Titular</label>
            <input value={verifyName} onChange={e => setVerifyName(e.target.value)} placeholder="Ej: Juan Pérez" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, width: '100%', fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <div style={{ textAlign: 'center', color: '#555', fontSize: 11, margin: '8px 0' }}>O BUSCA POR</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>WhatsApp / Celular</label>
            <input value={verifyPhone} onChange={e => setVerifyPhone(e.target.value)} placeholder="Ej: 3001234567" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, width: '100%', fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <button onClick={verifyTicket} style={{ ...S.btnGold, fontSize: 14 }}>🔍 Buscar en el Reino</button>
          {verifyResult !== null && (
            <div style={{ marginTop: 14 }}>
              {verifyResult.length === 0
                ? <div style={{ textAlign:'center', color:'#888', fontSize:13, padding:'16px 0' }}>No se encontraron boletos</div>
                : verifyResult.map((t,i) => (
                  <div key={i} style={{ background:'#111', border:'1px solid rgba(212,175,55,0.2)', borderRadius:12, padding:14, marginBottom:8 }}>
                    <div style={{ color:'#D4AF37', fontSize:22, fontWeight:900, marginBottom:4 }}>#{(t.numbers||[]).map(n=>range<=100?String(n).padStart(2,'0'):String(n).padStart(3,'0')).join(', ')}</div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={S.badge(t.status==='paid'?'green':'dim')}>{t.status==='paid'?'✓ Pagado':'⏳ Reservado'}</span>
                      <span style={{ color:'#fff', fontWeight:700 }}>{fmt(t.total_amount)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <div style={{ background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:16, marginBottom:14 }}>
          <div style={{ display:'flex', gap:10, marginBottom:12 }}>
            <div style={{ flex:1, background:'#111', borderRadius:10, padding:12, textAlign:'center' }}>
              <div style={{ color:'#888', fontSize:9, textTransform:'uppercase', marginBottom:3 }}>📅 Fecha</div>
              <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{new Date(r.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</div>
            </div>
            <div style={{ flex:1, background:'#111', borderRadius:10, padding:12, textAlign:'center' }}>
              <div style={{ color:'#888', fontSize:9, textTransform:'uppercase', marginBottom:3 }}>🎱 Lotería</div>
              <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{r.lottery_name}</div>
            </div>
          </div>
        </div>
      </div>

      {societyModal !== null && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setSocietyModal(null)}>
          <div style={{ background:'#111', borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxWidth:500 }} onClick={e => e.stopPropagation()}>
            <div style={{ width:40, height:4, background:'#333', borderRadius:2, margin:'0 auto 20px' }}></div>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ color:'#D4AF37', fontSize:48, fontWeight:900, marginBottom:8 }}>#{range<=100?String(societyModal).padStart(2,'0'):String(societyModal).padStart(3,'0')}</div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:16, marginBottom:4 }}>Boleto en Sociedad del Reino</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              <button onClick={() => { setSocietyModal(null); setSelectedNums([societyModal]) }} style={{ background:'linear-gradient(135deg,#D4AF37,#F2C94C)', border:'none', borderRadius:12, padding:16, color:'#000', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>👑 Dueño Único — {fmt(r.ticket_price)}</button>
              <button onClick={() => { alert('Sociedad próximamente'); setSocietyModal(null) }} style={{ background:'rgba(52,152,219,0.1)', border:'1px solid rgba(52,152,219,0.3)', borderRadius:12, padding:16, color:'#3498db', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>🤝 Tu Mitad — {fmt(r.ticket_price / 2)}</button>
            </div>
            <button onClick={() => setSocietyModal(null)} style={{ width:'100%', background:'transparent', border:'none', color:'#666', fontSize:13, cursor:'pointer', padding:8, fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PROFILE PAGE ────────────────────────────────────────────────────────────
function ProfilePage({ user, profile, myTickets, onLogout, onLogin, onRegister, onPromoter, onBecomePromoter, isAdmin, onAdmin, onRefresh }) {
  if (!user) return (
    <div style={{ ...S.content, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }} className="crown-float">♛</div>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>Accede al Reino</h2>
      <p style={{ color: '#888', marginBottom: 28, fontSize: 14 }}>Inicia sesión para ver tus boletos</p>
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
      <div style={{ color: paid ? '#27AE60' : '#D4AF37', fontSize: 36, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>#{display.join(' #')}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: paid ? 0 : 12 }}>
        <span style={S.badge(paid ? 'green' : 'dim')}>{paid ? '✓ PAGADO' : '● RESERVADO'}</span>
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 900 }}>{fmt(t.total_amount)}</span>
      </div>
      {!paid && <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <button onClick={() => alert('Pago próximamente')} style={{ background: '#1e3a5f', border: '1px solid rgba(52,152,219,0.3)', borderRadius: 10, padding: 11, color: '#3498db', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>MI DINERO</button>
          <button onClick={() => alert('Pagar con puntos próximamente')} style={{ background: '#111', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 10, padding: 11, color: '#D4AF37', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>PUNTOS</button>
        </div>
        <button onClick={release} style={{ width: '100%', background: 'transparent', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', padding: 6, fontFamily: 'inherit' }}>🗑 LIBERAR BOLETO</button>
      </>}
    </div>
  )
}

// ─── PROMOTER PAGE ───────────────────────────────────────────────────────────
function PromoterPage({ user, profile, onBack }) {
  const [referrals, setReferrals] = useState([])
  useEffect(() => {
    if (user) supabase.from('referrals').select('*, referred:referred_user_id(email)').eq('promoter_id', user.id).then(({ data }) => { if (data) setReferrals(data) })
  }, [user])
  if (!profile?.is_promoter) return <div style={{ ...S.content, textAlign: 'center', paddingTop: 60 }}><p style={{ color: '#888' }}>No eres Heraldo aún</p><button onClick={onBack} style={{ ...S.btnGold, maxWidth: 240, margin: '16px auto 0' }}>Volver</button></div>
  const refUrl = `https://glowing-puppy-df9560.netlify.app/?ref=${profile?.referral_code}`
  return (
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
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`👑 ¡Únete a Los Reyes De Las Dinámicas!\n👉 ${refUrl}`)}`)} style={S.btnGold}>📱 Compartir por WhatsApp</button>
      </div>
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>💸 Comisiones del Reino</div>
        {[['Nivel 1 — Referido directo', '15%'], ['Nivel 2 — Indirecto', '7%'], ['Nivel 3', '3%']].map(([label, pct]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,175,55,0.04)', borderRadius: 9, padding: '10px 12px', marginBottom: 8 }}>
            <span style={{ color: '#fff', fontSize: 13 }}>{label}</span>
            <span style={S.badge('gold')}>{pct}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── POINTS PAGE ─────────────────────────────────────────────────────────────
function PointsPage({ user, profile, onLogin }) {
  return (
    <div style={S.content}>
      <div style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.04))', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, padding: 20, marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }} className="crown-float">♛</div>
        <div style={{ color: '#D4AF37', fontSize: 30, fontWeight: 900 }}>{(profile?.points || 0).toLocaleString()}</div>
        <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Tus Puntos de Nobleza</div>
        {!user && <button onClick={onLogin} style={{ ...S.btnGold, marginTop: 14, maxWidth: 260, margin: '14px auto 0' }}>Inicia sesión para ganar puntos</button>}
      </div>
      {[['🎯','Comprar un título','Por cada boleto comprado','+100 pts'],['👥','Referir un Caballero','Cuando se registra con tu enlace','+500 pts'],['📱','Compartir un sorteo','Por cada sorteo compartido','+50 pts'],['💰','Recargar el Tesoro','Por cada recarga','+200 pts'],['📸','Seguir en Instagram','@losreyesdelasdinamicas','+30 pts']].map(([icon,title,desc,pts]) => (
        <div key={title} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 20 }}>{icon}</span><div><div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{title}</div><div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{desc}</div></div></div>
          <span style={S.badge('dim')}>{pts}</span>
        </div>
      ))}
    </div>
  )
}

// ─── SUPPORT PAGE (usuario + admin) ─────────────────────────────────────────
function SupportPage({ user, profile, isAdmin, onBack }) {
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickReplies] = useState([
    '¿Cómo puedo pagar mi boleto?',
    '¿Cuándo es el sorteo?',
    'Quiero liberar un número',
    '¿Cómo funciona la sociedad?',
    'No me carga la app',
    'Quiero ser promotor'
  ])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isAdmin) {
      loadConversations()
      const channel = supabase.channel('support-admin')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, () => loadConversations())
        .subscribe()
      return () => supabase.removeChannel(channel)
    } else if (user) {
      loadMyMessages()
      const channel = supabase.channel(`support-user-${user.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${user.id}` }, () => loadMyMessages())
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [user, isAdmin])

  useEffect(() => {
    if (selectedConv && isAdmin) loadConvMessages(selectedConv.user_id)
  }, [selectedConv])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadConversations() {
    const { data } = await supabase.from('support_messages').select('*, users_profile(full_name, phone)').order('created_at', { ascending: false })
    if (!data) return
    const convMap = {}
    data.forEach(m => {
      if (!convMap[m.user_id]) convMap[m.user_id] = { user_id: m.user_id, name: m.users_profile?.full_name || 'Usuario', phone: m.users_profile?.phone, last_msg: m.message, last_time: m.created_at, unread: !m.from_admin ? 1 : 0 }
      else if (!m.from_admin) convMap[m.user_id].unread++
    })
    setConversations(Object.values(convMap))
  }

  async function loadMyMessages() {
    const { data } = await supabase.from('support_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    if (data) setMessages(data)
    else setMessages([{ id: 0, message: '¡Bienvenido al soporte del Reino! ♛ ¿En qué te podemos ayudar hoy?', from_admin: true, created_at: new Date().toISOString() }])
  }

  async function loadConvMessages(userId) {
    const { data } = await supabase.from('support_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  async function sendMessage(text) {
    const content = text || msg
    if (!content.trim()) return
    setMsg('')
    setLoading(true)
    if (isAdmin && selectedConv) {
      await supabase.from('support_messages').insert({ user_id: selectedConv.user_id, message: content, from_admin: true })
      await loadConvMessages(selectedConv.user_id)
    } else if (user) {
      await supabase.from('support_messages').insert({ user_id: user.id, message: content, from_admin: false })
      await loadMyMessages()
    }
    setLoading(false)
  }

  // ADMIN VIEW
  if (isAdmin) {
    return (
      <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>← Volver</button>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0 }}>💬 Centro de Soporte Real</h2>
        </div>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Lista conversaciones */}
          <div style={{ width: selectedConv ? '35%' : '100%', borderRight: '1px solid rgba(255,255,255,0.07)', overflowY: 'auto', transition: 'width .2s' }}>
            {conversations.length === 0
              ? <div style={{ textAlign: 'center', padding: '40px 16px', color: '#888' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                  <div style={{ fontSize: 13 }}>No hay mensajes aún</div>
                </div>
              : conversations.map((c, i) => (
                <div key={i} onClick={() => setSelectedConv(c)} style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: selectedConv?.user_id === c.user_id ? 'rgba(212,175,55,0.08)' : 'transparent', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: 14, flexShrink: 0 }}>{c.name[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ color: '#888', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_msg}</div>
                  </div>
                  {c.unread > 0 && <div style={{ width: 18, height: 18, background: '#e74c3c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{c.unread}</div>}
                </div>
              ))
            }
          </div>

          {/* Chat admin */}
          {selectedConv && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setSelectedConv(null)} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: 16, padding: 0 }}>←</button>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: 12 }}>{selectedConv.name[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{selectedConv.name}</div>
                  {selectedConv.phone && <div style={{ color: '#888', fontSize: 11 }}>{selectedConv.phone}</div>}
                </div>
                <button onClick={() => window.open(`https://wa.me/${selectedConv.phone?.replace(/\D/g,'')}`)} style={{ marginLeft: 'auto', background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 8, color: '#27AE60', fontSize: 11, fontWeight: 700, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>📱 WhatsApp</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.from_admin ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '78%', background: m.from_admin ? 'linear-gradient(135deg,#D4AF37,#F2C94C)' : '#1C1C1E', color: m.from_admin ? '#000' : '#fff', borderRadius: m.from_admin ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '9px 13px', fontSize: 13 }}>
                      {m.message}
                      <div style={{ fontSize: 10, color: m.from_admin ? 'rgba(0,0,0,.45)' : '#555', marginTop: 3, textAlign: 'right' }}>{fmtTime(m.created_at)}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {/* Respuestas rápidas admin */}
              <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', display: 'flex', gap: 6, scrollbarWidth: 'none' }}>
                {['✅ Pago aprobado', '❌ Pago rechazado', '⏳ En revisión', '📞 Te llamamos', '🎉 Número ganador'].map(r => (
                  <button key={r} onClick={() => sendMessage(r)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '5px 12px', color: '#ccc', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{r}</button>
                ))}
              </div>
              <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Responder..." style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
                <button onClick={() => sendMessage()} disabled={loading} style={{ ...S.btnGold, width: 'auto', padding: '10px 16px', borderRadius: 10 }}>↑</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // USER VIEW
  if (!user) return (
    <div style={{ ...S.content, textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>Soporte del Reino</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>Inicia sesión para chatear con nuestros Heraldos</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♛</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Heraldos del Reino</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, background: '#27AE60', borderRadius: '50%' }} className="pulse"></div>
            <span style={{ color: '#27AE60', fontSize: 11 }}>En línea — respuesta en minutos</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ background: '#1C1C1E', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, color: '#fff', maxWidth: '80%' }}>
            ¡Bienvenido al soporte del Reino! ♛ ¿En qué te podemos ayudar hoy?
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from_admin ? 'flex-start' : 'flex-end' }}>
            <div style={{ maxWidth: '80%', background: m.from_admin ? '#1C1C1E' : 'linear-gradient(135deg,#D4AF37,#F2C94C)', color: m.from_admin ? '#fff' : '#000', borderRadius: m.from_admin ? '16px 16px 16px 4px' : '16px 16px 4px 16px', padding: '10px 14px', fontSize: 13, lineHeight: 1.5 }}>
              {m.message}
              <div style={{ fontSize: 10, color: m.from_admin ? '#555' : 'rgba(0,0,0,.45)', marginTop: 4, textAlign: 'right' }}>{fmtTime(m.created_at)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', display: 'flex', gap: 6, scrollbarWidth: 'none', flexShrink: 0 }}>
        {quickReplies.map(q => (
          <button key={q} onClick={() => sendMessage(q)} style={{ flexShrink: 0, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 999, padding: '6px 12px', color: '#D4AF37', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Escribe tu mensaje..." style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
        <button onClick={() => sendMessage()} disabled={loading} style={{ ...S.btnGold, width: 'auto', padding: '11px 16px', borderRadius: 10 }}>↑</button>
      </div>
    </div>
  )
}

// ─── ADMIN PAGE ──────────────────────────────────────────────────────────────
function AdminPage({ user, isAdmin, raffles, onBack, onOpenSupport }) {
  const [tab, setTab] = useState(0)
  const [tickets, setTickets] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAdmin) {
      supabase.from('tickets').select('*, users_profile(full_name), raffles(title)').order('created_at', { ascending: false }).limit(30).then(({ data }) => { if (data) setTickets(data) })
      supabase.from('support_messages').select('id', { count: 'exact' }).eq('from_admin', false).then(({ count }) => setUnreadCount(count || 0))
    }
  }, [isAdmin])

  if (!isAdmin) return <div style={{ ...S.content, textAlign: 'center', paddingTop: 60 }}><div style={{ fontSize: 48 }}>🔒</div><p style={{ color: '#888', marginTop: 16 }}>Acceso restringido</p></div>

  const pending = tickets.filter(t => t.status === 'reserved')

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontWeight: 700, marginBottom: 16, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>← Volver</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#D4AF37,#F2C94C)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚙️</div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 19, margin: 0 }}>Sala del Trono</h2>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[['♛', raffles.length, 'Sorteos'], ['🎟️', tickets.length, 'Boletos'], ['⏳', pending.length, 'Por aprobar'], ['💬', unreadCount, 'Mensajes']].map(([icon, val, label]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#D4AF37' }}>{val}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2, textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Botón soporte */}
      <button onClick={onOpenSupport} style={{ ...S.btnGold, marginBottom: 16, fontSize: 14, position: 'relative' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        💬 Centro de Soporte — Responder Usuarios
        {unreadCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#e74c3c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{unreadCount}</span>}
      </button>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: 18 }}>
        {['Sorteos', 'Pagos', 'Config'].map((t, i) => <button key={t} onClick={() => setTab(i)} style={{ flex: 1, padding: 8, border: 'none', background: tab === i ? '#1C1C1E' : 'transparent', color: tab === i ? '#fff' : '#666', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit' }}>{t}</button>)}
      </div>

      {tab === 0 && (
        <>
          <button onClick={() => alert('Formulario de creación próximamente')} style={{ ...S.btnGold, marginBottom: 14, fontSize: 13 }}>+ Crear nuevo sorteo del Reino</button>
          {raffles.map(r => (
            <div key={r.id} style={{ ...S.card, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 8 }}>{r.title}</div>
              <div style={{ color: '#888', fontSize: 11, marginBottom: 10 }}>{fmt(r.ticket_price)} · {r.number_range <= 100 ? '00-99' : '000-999'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { const n = prompt(`Número ganador (0-${r.number_range-1}):`); if (n !== null) alert(`♛ Ganador: ${String(parseInt(n)).padStart(r.number_range<=100?2:3,'0')}`) }} style={{ flex: 1, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 8, color: '#27AE60', fontSize: 11, fontWeight: 700, padding: 8, cursor: 'pointer', fontFamily: 'inherit' }}>♛ Realizar sorteo</button>
                <button style={{ flex: 1, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, color: '#D4AF37', fontSize: 11, fontWeight: 700, padding: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Editar</button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 1 && (
        <>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>{pending.length} boleto(s) por aprobar</div>
          {pending.length === 0
            ? <div style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>No hay pagos pendientes ✓</div>
            : pending.map(t => (
              <div key={t.id} style={{ ...S.card, marginBottom: 10 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t.raffles?.title}</div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>{t.users_profile?.full_name} · Números: {(t.numbers||[]).join(', ')}</div>
                <div style={{ color: '#D4AF37', fontWeight: 800, fontSize: 15, marginBottom: 10 }}>{fmt(t.total_amount)}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={async () => { await supabase.from('tickets').update({ status: 'paid' }).eq('id', t.id); setTickets(prev => prev.map(x => x.id === t.id ? {...x, status:'paid'} : x)); alert('✅ Pago aprobado') }} style={{ flex: 1, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 8, color: '#27AE60', fontSize: 12, fontWeight: 700, padding: 9, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Aprobar</button>
                  <button onClick={async () => { await supabase.from('tickets').update({ status: 'rejected' }).eq('id', t.id); setTickets(prev => prev.filter(x => x.id !== t.id)); alert('✗ Rechazado') }} style={{ flex: 1, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, color: '#e74c3c', fontSize: 12, fontWeight: 700, padding: 9, cursor: 'pointer', fontFamily: 'inherit' }}>✗ Rechazar</button>
                </div>
              </div>
            ))
          }
        </>
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

// ─── LOGIN ───────────────────────────────────────────────────────────────────
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

// ─── REGISTER ────────────────────────────────────────────────────────────────
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
          {[['👤 Nombre del Caballero','name','text','Tu nombre completo'],['📱 WhatsApp','phone','tel','+57 300 000 0000'],['📧 Correo del Reino','email','email','tuusuario@email.com'],['🔐 Contraseña','password','password','Mínimo 6 caracteres'],['🔗 Código de referido (opcional)','ref','text','REF-XXXXXX']].map(([label,key,type,placeholder]) => (
            <div key={key}><label style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label><input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={placeholder} /></div>
          ))}
          {error && <div style={{ color: '#e74c3c', fontSize: 13, textAlign: 'center' }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ ...S.btnGold, marginTop: 6, opacity: loading ? .7 : 1 }}>{loading ? 'Creando tu título...' : '♛ Reclamar mi título →'}</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#555', fontSize: 14 }}>¿Ya tienes título? <button onClick={onLogin} style={{ background: 'none', border: 'none', color: '#D4AF37', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Acceder al Reino</button></p>
      </div>
    </div>
  )
}
