import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase.js'

const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)
const fmtDate = d => new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtTime = d => new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
const medals = ['ð¥', 'ð¥', 'ð¥', 'ð¯']

const C = {
  gold: '#C9A227', goldLight: '#E8C547', goldDark: '#8B6914',
  bg: '#080808', bg2: '#111', bg3: '#1A1A1A', card: '#141414',
  cardBorder: 'rgba(201,162,39,0.15)', text: '#F5F5F0', muted: '#666',
  green: '#27AE60', blue: '#2980B9', red: '#C0392B',
}

const S = {
  header: { position: 'sticky', top: 0, zIndex: 40, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.cardBorder}`, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(20px)', borderTop: `1px solid rgba(201,162,39,0.2)`, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px' },
  content: { padding: '16px 16px 88px', maxWidth: 500, margin: '0 auto' },
  card: { background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 16 },
  btnGold: { background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, color: '#000', border: 'none', borderRadius: 12, padding: '14px 20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, width: '100%', fontFamily: 'inherit', transition: 'all .2s' },
  btnOutline: { background: 'transparent', color: C.gold, border: `1px solid rgba(201,162,39,0.4)`, borderRadius: 12, padding: '13px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, width: '100%', fontFamily: 'inherit' },
  navBtn: (active) => ({ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '8px 10px', color: active ? C.gold : '#444', transform: active ? 'scale(1.08)' : 'scale(1)', transition: 'all .2s', minWidth: 52 }),
  badge: (type) => {
    const map = { gold: { background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, color: '#000' }, green: { background: 'rgba(39,174,96,0.15)', color: C.green }, blue: { background: 'rgba(41,128,185,0.15)', color: '#5DADE2' }, red: { background: 'rgba(192,57,43,0.15)', color: '#E74C3C' }, dim: { background: 'rgba(201,162,39,0.1)', color: C.gold } }
    return { borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '.5px', ...map[type] }
  }
}

// âââ LOGO SVG (mansiÃ³n) âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const LogoSVG = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,4 92,20 92,60 50,96 8,60 8,20" fill="#1a1000" stroke="#C9A227" strokeWidth="3"/>
    <circle cx="50" cy="10" r="1.5" fill="#E8C547" opacity="0.9"/>
    <circle cx="30" cy="16" r="1" fill="#E8C547" opacity="0.6"/>
    <circle cx="70" cy="14" r="1" fill="#E8C547" opacity="0.6"/>
    <polygon points="50,22 72,36 28,36" fill="#C9A227"/>
    <rect x="30" y="36" width="40" height="26" fill="#2a1e00" stroke="#C9A227" strokeWidth="0.5"/>
    <rect x="35" y="38" width="3" height="22" fill="#C9A227" opacity="0.7"/>
    <rect x="43" y="38" width="3" height="22" fill="#C9A227" opacity="0.7"/>
    <rect x="54" y="38" width="3" height="22" fill="#C9A227" opacity="0.7"/>
    <rect x="62" y="38" width="3" height="22" fill="#C9A227" opacity="0.7"/>
    <rect x="33" y="40" width="5" height="5" rx="1" fill="#E8C547" opacity="0.9"/>
    <rect x="62" y="40" width="5" height="5" rx="1" fill="#E8C547" opacity="0.9"/>
    <rect x="47" y="40" width="6" height="5" rx="1" fill="#E8C547" opacity="0.7"/>
    <rect x="45" y="50" width="10" height="12" rx="2" fill="#1a1000"/>
    <ellipse cx="22" cy="56" rx="7" ry="8" fill="#6B4423"/>
    <text x="22" y="59" textAnchor="middle" fill="#C9A227" fontSize="7" fontWeight="bold">$</text>
    <ellipse cx="78" cy="56" rx="7" ry="8" fill="#6B4423"/>
    <text x="78" y="59" textAnchor="middle" fill="#C9A227" fontSize="7" fontWeight="bold">$</text>
    <ellipse cx="35" cy="64" rx="4" ry="2" fill="#C9A227" opacity="0.8"/>
    <ellipse cx="65" cy="64" rx="4" ry="2" fill="#C9A227" opacity="0.8"/>
    <rect x="20" y="67" width="60" height="22" rx="3" fill="#0d0900" stroke="#C9A227" strokeWidth="1.5"/>
    <text x="50" y="74" textAnchor="middle" fill="#C9A227" fontSize="5.5" fontWeight="bold" letterSpacing="0.5">LA CASA</text>
    <text x="50" y="80" textAnchor="middle" fill="#C9A227" fontSize="3.5" letterSpacing="1">DE LAS</text>
    <text x="50" y="86" textAnchor="middle" fill="#C9A227" fontSize="5" fontWeight="bold" letterSpacing="0.5">DINÃMICAS</text>
  </svg>
)

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', border: `1px solid rgba(201,162,39,0.3)`, flexShrink: 0 }}><LogoSVG size={40} /></div>
    <div><b style={{ fontSize: 13, fontWeight: 900, color: '#fff', display: 'block', lineHeight: 1.1 }}>La Casa</b><span style={{ fontSize: 9, color: C.gold, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>De Las DinÃ¡micas</span></div>
  </div>
)

const Loading = () => (
  <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
    <LogoSVG size={72} />
    <div style={{ color: C.gold, fontWeight: 700, letterSpacing: 1 }}>Cargando La Casa...</div>
    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.pulse{animation:pulse 2s infinite}@keyframes houseFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.house-float{animation:houseFloat 3s ease-in-out infinite}@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}input,select,textarea{background:#1a1a1a;border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:13px 16px;color:#fff;font-size:16px;outline:none;width:100%;transition:border-color .2s;font-family:inherit}input:focus,select:focus{border-color:#C9A227}input::placeholder{color:#444}`}</style>
  </div>
)

// âââ ICONOS REDES âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const SocialIcons = {
  whatsapp: <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  facebook: <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  telegram: <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
}

// âââ APP ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
  const [appConfig, setAppConfig] = useState({
    showPoints: true,
    whatsapp: '', canal: '', instagram: '', facebook: '', telegram: '',
    imgDeleteDays: 3
  })

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
    fetchConfig()
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { fetchRaffles() }, [])
  useEffect(() => { if (user) fetchMyTickets() }, [user])
  useEffect(() => {
    if (!selectedRaffle) return
    fetchAllReservedNums(selectedRaffle.id)
    const channel = supabase.channel(`tickets-${selectedRaffle.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `raffle_id=eq.${selectedRaffle.id}` }, () => fetchAllReservedNums(selectedRaffle.id))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [selectedRaffle])

  async function fetchConfig() {
    const { data } = await supabase.from('app_config').select('*').eq('id', 1).single()
    if (data) setAppConfig(data)
  }
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
      { id: 1, title: 'MOTO YAMAHA MT-03 + $500.000', is_featured: true, ticket_price: 5000, raffle_date: '2025-04-15', lottery_name: 'BOGOTÃ', number_range: 100, prizes: [{ amount: 'Moto Yamaha MT-03 0km' }, { amount: '$500.000 en efectivo' }, { amount: '$200.000 en efectivo' }] },
      { id: 2, title: 'VIAJE A CANCÃN TODO INCLUIDO', is_featured: true, ticket_price: 10000, raffle_date: '2025-05-01', lottery_name: 'MEDELLÃN', number_range: 100, prizes: [{ amount: 'Viaje CancÃºn para 2 personas' }, { amount: '$1.000.000 en efectivo' }, { amount: 'iPhone 16 Pro' }] },
    ])
  }
  async function fetchMyTickets() {
    const { data } = await supabase.from('tickets').select('*, raffles(title, raffle_date, lottery_name)').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setMyTickets(data)
  }

  async function doLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setAuthPage(null); setPage('home')
  }
  async function doRegister(name, phone, email, password) {
    const refCode = 'CASA-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, phone, referral_code: refCode, role: 'customer' } } })
    if (error) throw error
    if (data.session) {
      await supabase.from('users_profile').upsert({ id: data.user.id, full_name: name, phone, email, role: 'customer', credits: 500, points: 1000, referral_code: refCode, is_promoter: false })
      setUser(data.user); await fetchProfile(data.user.id)
      setAuthPage(null); setPage('home'); return
    }
    if (data.user && !data.session) throw new Error('Revisa tu correo y confirma tu cuenta.')
    setAuthPage(null); setPage('home')
  }
  async function doLogout() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setMyTickets([]); setPage('home')
  }
  async function reserveNumbers() {
    if (!user) { setAuthPage('login'); return }
    if (selectedNums.length === 0) return
    const r = selectedRaffle
    const { data: existing } = await supabase.from('tickets').select('numbers').eq('raffle_id', r.id).in('status', ['reserved', 'paid'])
    const taken = (existing || []).flatMap(t => t.numbers || [])
    const conflict = selectedNums.filter(n => taken.includes(n))
    if (conflict.length > 0) {
      alert(`â ï¸ Los nÃºmeros ${conflict.map(n => String(n).padStart(2,'0')).join(', ')} ya estÃ¡n apartados. Por favor elige otros.`)
      await fetchAllReservedNums(r.id); setSelectedNums([]); return
    }
    const { error } = await supabase.from('tickets').insert({ user_id: user.id, raffle_id: r.id, numbers: selectedNums, status: 'reserved', total_amount: selectedNums.length * r.ticket_price })
    if (error) { alert('Error al apartar. Intenta de nuevo.'); return }
    await fetchMyTickets(); setSelectedNums([])
    alert('ð  Â¡NÃºmeros apartados! Ve a tu perfil para confirmar el pago.')
    setPage('profile')
  }
  async function becomePromoter() {
    if (!user) return
    const refCode = 'CASA-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    await supabase.from('users_profile').update({ is_promoter: true, referral_code: refCode }).eq('id', user.id)
    await supabase.from('promoters').upsert({ user_id: user.id, referral_code: refCode, total_earnings: 0, pending_earnings: 0, level1_rate: 15, level2_rate: 7, level3_rate: 3 })
    await fetchProfile(user.id)
    alert('ð Â¡Ahora eres Vendedor Oficial de La Casa!'); setPage('promoter')
  }

  if (loading) return <Loading />
  if (authPage === 'login') return <LoginScreen onLogin={doLogin} onRegister={() => setAuthPage('register')} onBack={() => setAuthPage(null)} />
  if (authPage === 'register') return <RegisterScreen onRegister={doRegister} onLogin={() => setAuthPage('login')} />

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Amigo'
  const isAdmin = profile?.role === 'admin'

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes houseFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.house-float{animation:houseFloat 3s ease-in-out infinite}.pulse{animation:pulse 2s infinite}input,select,textarea{background:#1a1a1a;border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:13px 16px;color:#fff;font-size:16px;outline:none;width:100%;transition:border-color .2s;font-family:inherit}input:focus,select:focus{border-color:#C9A227}input::placeholder{color:#444}`}</style>
      <header style={S.header}>
        <button onClick={() => setPage('home')} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: 8, position: 'relative' }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ width: 8, height: 8, background: '#C0392B', borderRadius: '50%', position: 'absolute', top: 3, right: 3 }}></span>
        </button>
        <Logo />
        {user
          ? <button onClick={() => setPage('profile')} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: 8 }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
          : <button onClick={() => setAuthPage('login')} style={{ background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, border: 'none', color: '#000', cursor: 'pointer', padding: '7px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>Entrar</button>
        }
      </header>
      <main>
        {page === 'home' && <HomePage raffles={raffles} displayName={displayName} appConfig={appConfig} onRaffle={r => { setSelectedRaffle(r); setSelectedNums([]); setPage('raffle') }} user={user} onLogin={() => setAuthPage('login')} />}
        {page === 'raffle' && selectedRaffle && <RafflePage raffle={selectedRaffle} user={user} allReservedNums={allReservedNums} selectedNums={selectedNums} setSelectedNums={setSelectedNums} onReserve={reserveNumbers} onBack={() => setPage('home')} onLogin={() => setAuthPage('login')} />}
        {page === 'profile' && <ProfilePage user={user} profile={profile} myTickets={myTickets} onLogout={doLogout} onLogin={() => setAuthPage('login')} onRegister={() => setAuthPage('register')} onPromoter={() => setPage('promoter')} onBecomePromoter={becomePromoter} isAdmin={isAdmin} onAdmin={() => setPage('admin')} onRefresh={fetchMyTickets} />}
        {page === 'promoter' && <PromoterPage user={user} profile={profile} onBack={() => setPage('profile')} />}
        {page === 'points' && appConfig.showPoints && <PointsPage user={user} profile={profile} onLogin={() => setAuthPage('login')} />}
        {page === 'support' && <SupportPage user={user} profile={profile} isAdmin={false} appConfig={appConfig} />}
        {page === 'admin' && <AdminPage user={user} isAdmin={isAdmin} raffles={raffles} appConfig={appConfig} setAppConfig={setAppConfig} onBack={() => setPage('home')} onOpenSupport={() => setPage('admin-support')} />}
        {page === 'admin-support' && <SupportPage user={user} profile={profile} isAdmin={true} onBack={() => setPage('admin')} appConfig={appConfig} />}
        {page === 'winners' && <WinnersPage onBack={() => setPage('home')} />}
        {page === 'how' && <HowItWorksPage onBack={() => setPage('home')} onRegister={() => setAuthPage('register')} />}
      </main>
      <nav style={S.bottomNav}>
        {[
          { id: 'home', label: 'Inicio', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          ...(appConfig.showPoints ? [{ id: 'points', label: 'Puntos', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }] : []),
          { id: 'support', label: 'Soporte', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { id: 'profile', label: 'Mi Cuenta', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => setPage(id)} style={S.navBtn(page === id)}>
            {icon}
            <span style={{ fontSize: 9, fontWeight: 700 }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

// âââ HOME âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function HomePage({ raffles, displayName, appConfig, onRaffle, user, onLogin }) {
  const socials = [
    { key: 'whatsapp', label: 'WhatsApp', bg: '#075E54', icon: SocialIcons.whatsapp, url: appConfig.whatsapp },
    { key: 'canal', label: 'Canal', bg: '#075E54', icon: SocialIcons.whatsapp, url: appConfig.canal, badge: 'ð¢' },
    { key: 'instagram', label: 'Instagram', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', icon: SocialIcons.instagram, url: appConfig.instagram },
    { key: 'facebook', label: 'Facebook', bg: '#1877F2', icon: SocialIcons.facebook, url: appConfig.facebook },
    { key: 'telegram', label: 'Telegram', bg: '#229ED9', icon: SocialIcons.telegram, url: appConfig.telegram },
  ].filter(s => s.url)

  return (
    <div style={S.content}>
      {/* HERO COMPACTO */}
      <div style={{ background: `linear-gradient(120deg,#1a1200,#0f0c00)`, border: `1px solid rgba(201,162,39,0.25)`, borderRadius: 16, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', border: `1px solid rgba(201,162,39,0.3)`, flexShrink: 0 }}><LogoSVG size={52} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 15, lineHeight: 1.2 }}>Bienvenido, <span style={{ color: C.gold }}>{displayName.split(' ')[0]}</span> ð¨ð´</div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>La mejor plataforma de dinÃ¡micas del paÃ­s</div>
          {/* REDES SOCIALES */}
          {socials.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {socials.map(s => (
                <a key={s.key} href={s.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                    <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {s.icon}
                      {s.badge && <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, background: C.gold, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>{s.badge}</div>}
                    </div>
                    <span style={{ color: '#888', fontSize: 8, fontWeight: 600 }}>{s.label}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
          {socials.length === 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {[['ð°','Legales'],['ðµ','Seguros'],['ð','Premios']].map(([ic,lb]) => (
                <div key={lb} style={{ textAlign: 'center' }}><div style={{ fontSize: 16 }}>{ic}</div><div style={{ color: '#444', fontSize: 8, textTransform: 'uppercase', marginTop: 1 }}>{lb}</div></div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTONES RÃPIDOS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => {}} style={{ flex: 1, background: C.bg3, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '8px 10px', color: C.gold, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Â¿CÃ³mo funciona?
        </button>
        <button onClick={() => {}} style={{ flex: 1, background: C.bg3, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '8px 10px', color: C.green, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          ð Ganadores
        </button>
      </div>

      {/* DINÃMICAS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }}></div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 15, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>ð° DinÃ¡micas Activas</h2>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }}></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {raffles.map(r => (
          <div key={r.id} onClick={() => onRaffle(r)} style={{ background: `linear-gradient(160deg,#1a1200,${C.card})`, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {r.is_featured && <span style={S.badge('gold')}>ð¥ Destacada</span>}
                <span style={S.badge('green')}>â Activa</span>
              </div>
              <span style={{ color: C.muted, fontSize: 11 }}>ð± {r.lottery_name}</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 900, textTransform: 'uppercase', margin: 0, lineHeight: 1.3 }}>{r.title}</h3>
            {(Array.isArray(r.prizes) ? r.prizes : []).slice(0, 3).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{medals[i]}</span>
                <span style={{ color: '#ccc', fontSize: 12 }}>{p.amount || p}</span>
              </div>
            ))}
            {/* Contador dÃ­as */}
            {r.raffle_date && (() => {
              const days = Math.max(0, Math.ceil((new Date(r.raffle_date) - new Date()) / 86400000))
              return (
                <div style={{ background: 'rgba(201,162,39,0.07)', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ color: C.gold, fontSize: 11, fontWeight: 700 }}>{days === 0 ? 'Â¡Hoy es el sorteo!' : `Faltan ${days} dÃ­a${days !== 1 ? 's' : ''} para el sorteo`}</span>
                  <span style={{ color: C.muted, fontSize: 10, marginLeft: 'auto' }}>ð {fmtDate(r.raffle_date)}</span>
                </div>
              )
            })()}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: C.muted, fontSize: 10, textTransform: 'uppercase' }}>Valor del boleto</div>
                <div style={{ color: C.gold, fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{fmt(r.ticket_price)}</div>
              </div>
              <button style={{ background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, color: '#000', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 800, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>ðï¸ Apartar nÃºmero</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// âââ RAFFLE PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    if (verifyPhone) { const { data } = await supabase.from('users_profile').select('id').ilike('phone', `%${verifyPhone}%`); ids = (data||[]).map(u=>u.id) }
    else { const { data } = await supabase.from('users_profile').select('id').ilike('full_name', `%${verifyName}%`); ids = (data||[]).map(u=>u.id) }
    if (!ids.length) { setVerifyResult([]); return }
    const { data } = await supabase.from('tickets').select('*').eq('raffle_id', r.id).in('user_id', ids)
    setVerifyResult(data || [])
  }

  const shareWhatsApp = () => {
    const text = `ð  *La Casa De Las DinÃ¡micas*\n\nð° *${r.title}*\nðµ Boleto: ${fmt(r.ticket_price)}\nð Sorteo: ${fmtDate(r.raffle_date)}\n\nÂ¡Aparta tu nÃºmero ahora!\nð www.lacasadelasdinamicas.com`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  return (
    <div style={{ paddingBottom: 88 }}>
      <div style={{ background: `linear-gradient(180deg,#1a1200 0%,${C.bg} 100%)`, padding: '16px 16px 0', borderBottom: `1px solid ${C.cardBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>â Volver</button>
          <button onClick={shareWhatsApp} style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 8, color: C.green, cursor: 'pointer', padding: '6px 12px', fontSize: 11, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>ð± Compartir</button>
        </div>
        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', margin: '0 auto 12px', border: `1px solid rgba(201,162,39,0.3)` }}><LogoSVG size={56} /></div>
          <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px', lineHeight: 1.3 }}>{r.title}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,162,39,0.08)', border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 999, padding: '6px 18px' }}>
            <span style={{ color: C.muted, fontSize: 11 }}>Valor del boleto</span>
            <span style={{ color: C.gold, fontSize: 16, fontWeight: 900 }}>{fmt(r.ticket_price)}</span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', padding: '14px 16px', display: 'flex', gap: 10, scrollbarWidth: 'none' }}>
        {prizes.map((p, i) => (
          <div key={i} style={{ flexShrink: 0, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: '12px 18px', minWidth: 150, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ fontSize: 26, marginBottom: 5 }}>{medals[i]}</div>
            <div style={{ color: C.muted, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Premio {i+1}</div>
            <div style={{ color: C.gold, fontSize: 13, fontWeight: 800 }}>{p.amount || p.title || p}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: 0 }}>Selecciona tu nÃºmero</h3>
              <div style={{ color: C.green, fontSize: 10, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, background: C.green, borderRadius: '50%', display: 'inline-block' }} className="pulse"></span>
                En vivo â actualizaciÃ³n automÃ¡tica
              </div>
            </div>
            <button onClick={luckyNum} style={{ background: `rgba(201,162,39,0.1)`, border: `1px solid rgba(201,162,39,0.25)`, borderRadius: 8, color: C.gold, fontSize: 11, fontWeight: 700, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>ð² Al azar</button>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            {[['#0f0f0f','#1e1e1e','#444','Disponible'],['rgba(201,162,39,0.2)',C.gold,C.gold,'Seleccionado'],['#0a0a0a','#1a1a1a','#2a2a2a','Apartado ð'],['rgba(41,128,185,0.1)','rgba(41,128,185,0.3)','#5DADE2','Sociedad']].map(([bg,border,color,label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 13, height: 13, background: bg, border: `1px solid ${border}`, borderRadius: 3 }}></div><span style={{ fontSize: 10, color: C.muted }}>{label}</span></div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}>
            {Array.from({ length: range }, (_, n) => {
              const pad = range <= 100 ? String(n).padStart(2,'0') : String(n).padStart(3,'0')
              const st = getStatus(n)
              const isSel = selectedNums.includes(n), isRes = st === 'reserved', isSoc = st === 'society'
              return (
                <button key={n} onClick={() => { if(isRes) return; if(isSoc){setSocietyModal(n);return} toggleNum(n) }}
                  style={{ aspectRatio: 1, border: `1.5px solid ${isSel?C.gold:isRes?'#1a1a1a':isSoc?'rgba(41,128,185,0.35)':'#1a1a1a'}`, borderRadius: 7, background: isSel?`rgba(201,162,39,0.2)`:isRes?'#0a0a0a':isSoc?'rgba(41,128,185,0.08)':'#0d0d0d', color: isSel?C.gold:isRes?'#222':isSoc?'#5DADE2':'#444', fontSize: isRes?8:11, fontWeight: 700, cursor: isRes?'not-allowed':'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isRes ? 'ð' : pad}
                </button>
              )
            })}
          </div>
          {selectedNums.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.15)`, borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: C.muted, fontSize: 12 }}>Seleccionados</span>
                  <span style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>{selectedNums.map(n => range<=100?String(n).padStart(2,'0'):String(n).padStart(3,'0')).join(' Â· ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: C.muted, fontSize: 12 }}>Total a pagar</span>
                  <span style={{ color: C.gold, fontSize: 22, fontWeight: 900 }}>{fmt(selectedNums.length * r.ticket_price)}</span>
                </div>
              </div>
              <button onClick={user ? onReserve : onLogin} style={S.btnGold}>ðï¸ {user ? 'Apartar mis nÃºmeros' : 'Entrar para apartar'}</button>
            </div>
          )}
        </div>

        {societyNums.length > 0 && (
          <div style={{ background: C.card, border: '1px solid rgba(41,128,185,0.25)', borderRadius: 18, padding: 16, marginBottom: 14 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>ð¤</div>
              <h3 style={{ color: C.gold, fontWeight: 900, fontSize: 15, margin: '0 0 4px', textTransform: 'uppercase' }}>Compra en Sociedad</h3>
              <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>JÃºntate con otro participante y paguen el 50% cada uno.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {societyNums.map(n => {
                const pad = range<=100?String(n).padStart(2,'0'):String(n).padStart(3,'0')
                const isOwned = allReservedNums.includes(n)
                return (
                  <div key={n} style={{ background: isOwned?'rgba(39,174,96,0.06)':C.bg3, border: `1px solid ${isOwned?'rgba(39,174,96,0.2)':C.cardBorder}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ background: `rgba(201,162,39,0.1)`, borderRadius: 8, padding: '4px 10px', fontSize: 18, fontWeight: 900, color: C.gold }}>{pad}</div>
                      <span style={{ ...S.badge(isOwned?'green':'dim'), fontSize: 9 }}>{isOwned?'â Completo':'â Libre'}</span>
                    </div>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{isOwned?'Cupo completo':'Disponible'}</div>
                    <div style={{ color: C.muted, fontSize: 11, marginBottom: isOwned?0:10 }}>Boleto {isOwned?'completo':'disponible'}</div>
                    {!isOwned && <button onClick={() => user?setSocietyModal(n):onLogin()} style={{ width:'100%', background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:'none', borderRadius:8, padding:'8px', color:'#000', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Apartar â {fmt(r.ticket_price)}</button>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 16, marginBottom: 14 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>ð</div>
            <h3 style={{ color: C.gold, fontWeight: 900, fontSize: 15, margin: '0 0 4px', textTransform: 'uppercase' }}>Verificar mi boleto</h3>
            <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>Consulta si tu nÃºmero estÃ¡ apartado correctamente.</p>
          </div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Nombre del participante</label><input value={verifyName} onChange={e => setVerifyName(e.target.value)} placeholder="Ej: Carlos RodrÃ­guez" /></div>
          <div style={{ textAlign: 'center', color: '#333', fontSize: 11, margin: '8px 0' }}>â O BUSCA POR â</div>
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>WhatsApp / Celular</label><input value={verifyPhone} onChange={e => setVerifyPhone(e.target.value)} placeholder="Ej: 3001234567" /></div>
          <button onClick={verifyTicket} style={S.btnGold}>ð Verificar boleto</button>
          {verifyResult !== null && (
            <div style={{ marginTop: 14 }}>
              {verifyResult.length === 0
                ? <div style={{ textAlign:'center', color:C.muted, fontSize:13, padding:'16px 0' }}>No se encontraron boletos</div>
                : verifyResult.map((t,i) => (
                  <div key={i} style={{ background:C.bg3, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:14, marginBottom:8 }}>
                    <div style={{ color:C.gold, fontSize:20, fontWeight:900, marginBottom:4 }}>#{(t.numbers||[]).map(n=>range<=100?String(n).padStart(2,'0'):String(n).padStart(3,'0')).join(' Â· ')}</div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={S.badge(t.status==='paid'?'green':'dim')}>{t.status==='paid'?'â Pago confirmado':'â³ Pendiente de pago'}</span>
                      <span style={{ color:'#fff', fontWeight:700 }}>{fmt(t.total_amount)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex:1, background:C.bg3, borderRadius:10, padding:12, textAlign:'center' }}>
              <div style={{ color:C.muted, fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>ð Fecha del sorteo</div>
              <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{new Date(r.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</div>
            </div>
            <div style={{ flex:1, background:C.bg3, borderRadius:10, padding:12, textAlign:'center' }}>
              <div style={{ color:C.muted, fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>ð± Juega con</div>
              <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{r.lottery_name}</div>
            </div>
          </div>
        </div>
      </div>

      {societyModal !== null && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setSocietyModal(null)}>
          <div style={{ background:'#111', borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxWidth:500 }} onClick={e => e.stopPropagation()}>
            <div style={{ width:40, height:4, background:'#2a2a2a', borderRadius:2, margin:'0 auto 20px' }}></div>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ color:C.gold, fontSize:52, fontWeight:900, marginBottom:6 }}>{range<=100?String(societyModal).padStart(2,'0'):String(societyModal).padStart(3,'0')}</div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:16, marginBottom:4 }}>Compra en Sociedad</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              <button onClick={() => { setSocietyModal(null); setSelectedNums([societyModal]) }} style={{ ...S.btnGold, fontSize:14 }}>ð° DueÃ±o Ãºnico â {fmt(r.ticket_price)}</button>
              <button onClick={() => { alert('Esta funciÃ³n estarÃ¡ disponible muy pronto ð '); setSocietyModal(null) }} style={{ background:'rgba(41,128,185,0.1)', border:'1px solid rgba(41,128,185,0.3)', borderRadius:12, padding:16, color:'#5DADE2', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>ð¤ Mi mitad â {fmt(r.ticket_price / 2)}</button>
            </div>
            <button onClick={() => setSocietyModal(null)} style={{ width:'100%', background:'transparent', border:'none', color:'#444', fontSize:13, cursor:'pointer', padding:8, fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// âââ CÃMO FUNCIONA ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function HowItWorksPage({ onBack, onRegister }) {
  const steps = [
    { n: '1', icon: 'ð°', title: 'Elige tu dinÃ¡mica', desc: 'Explora las dinÃ¡micas activas y elige la que mÃ¡s te guste.' },
    { n: '2', icon: 'ð¢', title: 'Aparta tu nÃºmero', desc: 'Selecciona el nÃºmero que quieres y apÃ¡rtalo antes de que lo tome otro.' },
    { n: '3', icon: 'ð³', title: 'Confirma tu pago', desc: 'Paga por Nequi, Daviplata o transferencia y envÃ­a tu comprobante.' },
    { n: '4', icon: 'ð', title: 'Â¡Gana tu premio!', desc: 'El sorteo se realiza en la fecha indicada con la loterÃ­a correspondiente.' },
  ]
  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 700, marginBottom: 20, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>â Volver</button>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: 14, overflow: 'hidden', margin: '0 auto 14px', border: `1px solid rgba(201,162,39,0.3)` }}><LogoSVG size={60} /></div>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: '0 0 8px' }}>Â¿CÃ³mo funciona?</h1>
        <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>Participar es muy fÃ¡cil â solo sigue estos pasos</p>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, position: 'relative' }}>
          {i < steps.length - 1 && <div style={{ position: 'absolute', left: 19, top: 44, bottom: -16, width: 1, background: `rgba(201,162,39,0.2)` }}></div>}
          <div style={{ width: 40, height: 40, background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: 16, flexShrink: 0, zIndex: 1 }}>{s.n}</div>
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: '14px 16px', flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
            <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        </div>
      ))}
      <div style={{ background: `linear-gradient(135deg,rgba(201,162,39,0.1),rgba(201,162,39,0.04))`, border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 16, padding: 20, textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>ð</div>
        <div style={{ color: C.gold, fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Â¡RegÃ­strate y recibe bono!</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>$500 en saldo + 1.000 puntos de fidelidad al crear tu cuenta</div>
        <button onClick={onRegister} style={S.btnGold}>ð  Crear cuenta gratis</button>
      </div>
    </div>
  )
}

// âââ GANADORES ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function WinnersPage({ onBack }) {
  const [winners, setWinners] = useState([])
  useEffect(() => {
    supabase.from('tickets').select('*, users_profile(full_name), raffles(title, raffle_date)').eq('status', 'winner').order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => setWinners(data || []))
  }, [])

  const mockWinners = [
    { name: 'Carlos R.', prize: 'Moto Yamaha MT-03', number: '07', date: '15 feb 2025', city: 'BogotÃ¡' },
    { name: 'MarÃ­a G.', prize: 'Viaje a CancÃºn', number: '34', date: '1 ene 2025', city: 'MedellÃ­n' },
    { name: 'AndrÃ©s P.', prize: '$500.000 efectivo', number: '91', date: '15 dic 2024', city: 'Cali' },
  ]

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 700, marginBottom: 20, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>â Volver</button>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>ð</div>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: '0 0 8px' }}>Ganadores</h1>
        <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>Personas reales que ganaron en La Casa</p>
      </div>
      {mockWinners.map((w, i) => (
        <div key={i} style={{ background: `linear-gradient(160deg,#1a1200,${C.card})`, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
          <div style={{ width: 50, height: 50, background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>ð</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{w.name}</div>
            <div style={{ color: C.gold, fontSize: 13, fontWeight: 700, margin: '2px 0' }}>{w.prize}</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 10, color: C.muted }}>
              <span>NÃºmero #{w.number}</span>
              <span>ð {w.date}</span>
              <span>ð {w.city}</span>
            </div>
          </div>
          <div style={{ width: 44, height: 44, background: 'rgba(201,162,39,0.1)', border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: C.gold, flexShrink: 0 }}>#{w.number}</div>
        </div>
      ))}
    </div>
  )
}

// âââ PROFILE PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ProfilePage({ user, profile, myTickets, onLogout, onLogin, onRegister, onPromoter, onBecomePromoter, isAdmin, onAdmin, onRefresh }) {
  if (!user) return (
    <div style={{ ...S.content, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }} className="house-float"><LogoSVG size={72} /></div>
      <h2 style={{ color: '#fff', fontWeight: 900, marginBottom: 8 }}>Mi Cuenta</h2>
      <p style={{ color: C.muted, marginBottom: 28, fontSize: 14 }}>Inicia sesiÃ³n para ver tus boletos</p>
      <button onClick={onLogin} style={{ ...S.btnGold, maxWidth: 280 }}>ð  Ingresar a La Casa</button>
      <button onClick={onRegister} style={{ ...S.btnOutline, maxWidth: 280, marginTop: 12 }}>Crear cuenta gratis</button>
    </div>
  )
  const reserved = myTickets.filter(t => t.status === 'reserved')
  const paid = myTickets.filter(t => t.status === 'paid')
  const name = profile?.full_name || user.email
  const isPromoter = profile?.is_promoter

  const downloadTicket = (ticket) => {
    const nums = (ticket.numbers || []).map(n => `#${String(n).padStart(2,'0')}`).join('  ')
    const content = `LA CASA DE LAS DINÃMICAS\n${'='.repeat(32)}\n\nBOLETO CONFIRMADO â\n\nDinÃ¡mica: ${ticket.raffles?.title || ''}\nNÃºmeros: ${nums}\nTotal pagado: ${fmt(ticket.total_amount)}\nFecha sorteo: ${ticket.raffles?.raffle_date ? fmtDate(ticket.raffles.raffle_date) : ''}\n\n${'='.repeat(32)}\nwww.lacasadelasdinamicas.com`
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `boleto-${(ticket.numbers||[]).join('-')}.txt`; a.click()
  }

  return (
    <div style={S.content}>
      <div style={{ background: `linear-gradient(160deg,#1a1200,${C.card})`, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 18, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 58, height: 58, background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#000', border: `3px solid rgba(201,162,39,0.3)` }}>{name[0].toUpperCase()}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 2 }}>Hola de nuevo,</div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, lineHeight: 1.1 }}>{name}</div>
            <span style={{ background: 'rgba(201,162,39,0.1)', border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, color: C.gold, textTransform: 'uppercase', marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, background: C.gold, borderRadius: '50%', display: 'inline-block' }}></span>
              {isAdmin ? 'Administrador' : isPromoter ? 'Vendedor Oficial' : 'Participante'}
            </span>
          </div>
          <button onClick={onLogout} style={{ width: 36, height: 36, background: C.bg3, border: `1px solid #2a2a2a`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>

      {isPromoter
        ? <button onClick={onPromoter} style={{ ...S.btnGold, marginBottom: 10, fontSize: 13 }}>ð£ Panel de Vendedor Oficial â</button>
        : <button onClick={onBecomePromoter} style={{ ...S.btnGold, marginBottom: 10, fontSize: 13 }}>ð£ Quiero ser Vendedor Oficial</button>
      }
      {isAdmin && <button onClick={onAdmin} style={{ ...S.btnOutline, marginBottom: 10, fontSize: 13 }}>âï¸ Panel de AdministraciÃ³n</button>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <div style={{ background: `linear-gradient(135deg,#0d1a2a,#0a1520)`, border: '1px solid rgba(41,128,185,0.2)', borderRadius: 14, padding: 14 }}>
          <div style={{ color: '#5DADE2', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>ð° Mi Saldo</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{fmt(profile?.credits || 0)}</div>
          <button style={{ marginTop: 8, background: 'rgba(41,128,185,0.15)', border: '1px solid rgba(41,128,185,0.3)', borderRadius: 7, padding: '5px 10px', color: '#5DADE2', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Recargar</button>
        </div>
        <div style={{ background: `linear-gradient(135deg,#1a1200,#120e00)`, border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 14, padding: 14 }}>
          <div style={{ color: C.gold, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>â­ Mis Puntos</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{(profile?.points || 0).toLocaleString()}</div>
          <div style={{ color: C.muted, fontSize: 10, marginTop: 8 }}>pts de fidelidad</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }}></div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 15, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>ðï¸ Mis Boletos</h2>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }}></div>
      </div>

      {reserved.length > 0 && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 7, height: 7, background: C.gold, borderRadius: '50%' }} className="pulse"></div>
          <span style={{ color: C.gold, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Pendientes de pago ({reserved.length})</span>
        </div>
        {reserved.map(t => <TicketCard key={t.id} ticket={t} onRefresh={onRefresh} onDownload={downloadTicket} />)}
      </>}

      {paid.length > 0 && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 10 }}>
          <div style={{ width: 7, height: 7, background: C.green, borderRadius: '50%' }}></div>
          <span style={{ color: C.green, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Pago confirmado ({paid.length})</span>
        </div>
        {paid.map(t => <TicketCard key={t.id} ticket={t} paid onRefresh={onRefresh} onDownload={downloadTicket} />)}
      </>}

      {myTickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>ðï¸</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>AÃºn no tienes boletos</div>
          <div style={{ fontSize: 13 }}>Â¡Participa en una dinÃ¡mica y gana!</div>
        </div>
      )}
    </div>
  )
}

// âââ TICKET CARD ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function TicketCard({ ticket: t, paid, onRefresh, onDownload }) {
  const nums = t.numbers || []
  const range = nums.length > 0 && Math.max(...nums) > 99 ? 1000 : 100
  const [releasing, setReleasing] = useState(null) // nÃºmero que se estÃ¡ por liberar

  async function releaseOne(num) {
    if (!confirm(`Â¿Liberar el nÃºmero ${String(num).padStart(2,'0')}?`)) return
    const newNums = nums.filter(n => n !== num)
    if (newNums.length === 0) {
      await supabase.from('tickets').update({ status: 'released' }).eq('id', t.id)
    } else {
      const newTotal = newNums.length * (t.total_amount / nums.length)
      await supabase.from('tickets').update({ numbers: newNums, total_amount: newTotal }).eq('id', t.id)
    }
    onRefresh()
  }

  return (
    <div style={{ background: paid ? `linear-gradient(160deg,rgba(39,174,96,0.06),${C.card})` : C.card, border: `1px solid ${paid?'rgba(39,174,96,0.2)':C.cardBorder}`, borderRadius: 16, padding: 16, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: paid ? `linear-gradient(90deg,transparent,${C.green},transparent)` : `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ color: C.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>DinÃ¡mica</div>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{t.raffles?.title || 'DinÃ¡mica'}</div>
        </div>
        {paid && (
          <button onClick={() => onDownload(t)} style={{ background: 'rgba(39,174,96,0.12)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: C.green, fontSize: 10, fontWeight: 700, fontFamily: 'inherit' }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Descargar
          </button>
        )}
      </div>

      {/* NÃºmeros con botÃ³n liberar individual */}
      <div style={{ marginBottom: 10 }}>
        {!paid && nums.length > 1 && <div style={{ color: C.muted, fontSize: 9, marginBottom: 6 }}>Toca â para liberar un nÃºmero individual:</div>}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {nums.map(n => {
            const pad = range <= 100 ? String(n).padStart(2,'0') : String(n).padStart(3,'0')
            return (
              <div key={n} style={{ background: paid ? 'rgba(39,174,96,0.1)' : 'rgba(201,162,39,0.1)', border: `1px solid ${paid?'rgba(39,174,96,0.25)':'rgba(201,162,39,0.25)'}`, borderRadius: 8, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: paid ? C.green : C.gold, fontSize: 16, fontWeight: 900 }}>#{pad}</span>
                {!paid && (
                  <button onClick={() => releaseOne(n)} style={{ width: 16, height: 16, background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#E74C3C', fontSize: 8, fontWeight: 700, padding: 0, fontFamily: 'inherit' }}>â</button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: paid ? 0 : 12 }}>
        <span style={S.badge(paid ? 'green' : 'dim')}>{paid ? 'â PAGO CONFIRMADO' : 'â³ PENDIENTE DE PAGO'}</span>
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 900 }}>{fmt(t.total_amount)}</span>
      </div>
      {!paid && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button onClick={() => alert('FunciÃ³n de pago prÃ³ximamente ð°')} style={{ background: 'rgba(41,128,185,0.1)', border: '1px solid rgba(41,128,185,0.25)', borderRadius: 10, padding: 11, color: '#5DADE2', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>ð³ Pagar ahora</button>
          <button onClick={() => alert('Canjear puntos prÃ³ximamente â­')} style={{ background: `rgba(201,162,39,0.08)`, border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 10, padding: 11, color: C.gold, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>â­ Con puntos</button>
        </div>
      )}
    </div>
  )
}

// âââ PROMOTER PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function PromoterPage({ user, profile, onBack }) {
  const [referrals, setReferrals] = useState([])
  useEffect(() => {
    if (user) supabase.from('referrals').select('*, referred:referred_user_id(email)').eq('promoter_id', user.id).then(({ data }) => { if (data) setReferrals(data) })
  }, [user])
  if (!profile?.is_promoter) return <div style={{ ...S.content, textAlign: 'center', paddingTop: 60 }}><p style={{ color: C.muted }}>No eres Vendedor Oficial aÃºn</p><button onClick={onBack} style={{ ...S.btnGold, maxWidth: 240, margin: '16px auto 0' }}>Volver</button></div>
  const refUrl = `https://www.lacasadelasdinamicas.com/?ref=${profile?.referral_code}`
  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 700, marginBottom: 16, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>â Volver</button>
      <div style={{ background: `linear-gradient(160deg,#1a1200,${C.card})`, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 18, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 28 }}>ð£</span><div><h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>Panel del Vendedor</h2><span style={S.badge('green')}>Activo</span></div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[[referrals.length, 'Referidos', 'ð¥'], [fmt(profile?.total_earnings || 0), 'Ganancias', 'ðµ'], [fmt(profile?.pending_earnings || 0), 'Por cobrar', 'ð°'], ['15%', 'ComisiÃ³n N1', 'ð']].map(([val, label, icon]) => (
          <div key={label} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.gold }}>{val}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 3, textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.card, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>ð Tu enlace de referidos</div>
        <div style={{ background: C.bg3, border: `1px dashed rgba(201,162,39,0.3)`, borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: C.gold, fontFamily: 'monospace', wordBreak: 'break-all' }}>{refUrl}</span>
          <button onClick={() => navigator.clipboard.writeText(refUrl).then(() => alert('â Â¡Copiado!'))} style={{ background: `rgba(201,162,39,0.15)`, border: `1px solid rgba(201,162,39,0.3)`, borderRadius: 8, color: C.gold, fontSize: 11, fontWeight: 700, padding: '6px 10px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Copiar</button>
        </div>
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`ð  *La Casa De Las DinÃ¡micas*\n\nÂ¡Participa en las mejores dinÃ¡micas del paÃ­s!\n\nRegÃ­strate con mi enlace y gana premios increÃ­bles ð°\n\nð ${refUrl}`)}`)} style={S.btnGold}>ð± Compartir por WhatsApp</button>
      </div>
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>ð¸ Estructura de comisiones</div>
        {[['Nivel 1 â Venta directa', '15%'], ['Nivel 2 â Referido de mi referido', '7%'], ['Nivel 3', '3%']].map(([label, pct]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bg3, borderRadius: 9, padding: '10px 12px', marginBottom: 8 }}>
            <span style={{ color: '#ccc', fontSize: 12 }}>{label}</span>
            <span style={S.badge('gold')}>{pct}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// âââ POINTS PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function PointsPage({ user, profile, onLogin }) {
  return (
    <div style={S.content}>
      <div style={{ background: `linear-gradient(160deg,#1a1200,${C.card})`, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 24, marginBottom: 20, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ fontSize: 36, marginBottom: 10 }}>â­</div>
        <div style={{ color: C.gold, fontSize: 36, fontWeight: 900 }}>{(profile?.points || 0).toLocaleString()}</div>
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Puntos de fidelidad</div>
        {!user && <button onClick={onLogin} style={{ ...S.btnGold, marginTop: 16, maxWidth: 240, margin: '16px auto 0' }}>Ingresar para ganar puntos</button>}
      </div>
      {[['ðï¸','Comprar un boleto','Por cada boleto confirmado','+100 pts'],['ð¥','Referir un amigo','Cuando se registra con tu enlace','+500 pts'],['ð±','Compartir dinÃ¡mica','Por cada publicaciÃ³n compartida','+50 pts'],['ð°','Recargar saldo','Por cada recarga realizada','+200 pts'],['ð¸','Seguirnos en Instagram','@lacasadelasdinamicas','+30 pts']].map(([icon,title,desc,pts]) => (
        <div key={title} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 22 }}>{icon}</span><div><div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{title}</div><div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{desc}</div></div></div>
          <span style={S.badge('dim')}>{pts}</span>
        </div>
      ))}
    </div>
  )
}

// âââ SUPPORT PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function SupportPage({ user, profile, isAdmin, onBack, appConfig }) {
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const quickReplies = ['Â¿CÃ³mo pago mi boleto?', 'Â¿CuÃ¡ndo es el sorteo?', 'Quiero liberar un nÃºmero', 'Â¿CÃ³mo funciona la sociedad?', 'Tuve un problema tÃ©cnico', 'Quiero ser vendedor']

  useEffect(() => {
    if (isAdmin) {
      loadConversations()
      const ch = supabase.channel('support-admin').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, () => loadConversations()).subscribe()
      return () => supabase.removeChannel(ch)
    } else if (user) {
      loadMyMessages()
      const ch = supabase.channel(`support-${user.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${user.id}` }, () => loadMyMessages()).subscribe()
      return () => supabase.removeChannel(ch)
    }
  }, [user, isAdmin])

  useEffect(() => { if (selectedConv && isAdmin) loadConvMessages(selectedConv.user_id) }, [selectedConv])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadConversations() {
    const { data } = await supabase.from('support_messages').select('*, users_profile(full_name,phone)').order('created_at', { ascending: false })
    if (!data) return
    const map = {}
    data.forEach(m => {
      if (!map[m.user_id]) map[m.user_id] = { user_id: m.user_id, name: m.users_profile?.full_name || 'Usuario', phone: m.users_profile?.phone, last_msg: m.image_url ? 'ð Imagen' : m.message, last_time: m.created_at, unread: !m.from_admin ? 1 : 0 }
      else if (!m.from_admin) map[m.user_id].unread++
    })
    setConversations(Object.values(map))
  }
  async function loadMyMessages() {
    const { data } = await supabase.from('support_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    setMessages(data || [])
  }
  async function loadConvMessages(userId) {
    const { data } = await supabase.from('support_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  async function handleImageUpload(file) {
    if (!file) return
    const days = appConfig?.imgDeleteDays || 3
    const ext = file.name.split('.').pop()
    const path = `support/${user.id}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('support-images').upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) { alert('Error al subir imagen'); return }
    const { data: { publicUrl } } = supabase.storage.from('support-images').getPublicUrl(path)
    const deleteAt = new Date(Date.now() + days * 86400000).toISOString()
    await supabase.from('support_messages').insert({ user_id: user.id, message: `ð Comprobante de pago`, from_admin: false, image_url: publicUrl, delete_at: deleteAt })
    await loadMyMessages()
    setImagePreview(null)
  }

  async function sendMessage(text) {
    const content = text || msg
    if (!content.trim()) return
    setMsg(''); setLoading(true)
    if (isAdmin && selectedConv) {
      await supabase.from('support_messages').insert({ user_id: selectedConv.user_id, message: content, from_admin: true })
      await loadConvMessages(selectedConv.user_id)
    } else if (user) {
      await supabase.from('support_messages').insert({ user_id: user.id, message: content, from_admin: false })
      await loadMyMessages()
    }
    setLoading(false)
  }

  // âââ VISTA ADMIN âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  if (isAdmin) return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: C.bg }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>â Volver</button>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0 }}>ð¬ Centro de AtenciÃ³n</h2>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: selectedConv ? '35%' : '100%', borderRight: `1px solid ${C.cardBorder}`, overflowY: 'auto' }}>
          {conversations.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px 16px', color: C.muted }}><div style={{ fontSize: 36, marginBottom: 8 }}>ð¬</div><div style={{ fontSize: 13 }}>Sin mensajes aÃºn</div></div>
            : conversations.map((c, i) => (
              <div key={i} onClick={() => setSelectedConv(c)} style={{ padding: '12px 14px', borderBottom: `1px solid rgba(255,255,255,0.04)`, cursor: 'pointer', background: selectedConv?.user_id === c.user_id ? 'rgba(201,162,39,0.06)' : 'transparent', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: 14, flexShrink: 0 }}>{c.name[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ color: C.muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_msg}</div>
                </div>
                {c.unread > 0 && <div style={{ width: 18, height: 18, background: '#C0392B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{c.unread}</div>}
              </div>
            ))
          }
        </div>
        {selectedConv && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setSelectedConv(null)} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontSize: 18, padding: 0 }}>â</button>
              <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: 12 }}>{selectedConv.name[0]?.toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{selectedConv.name}</div>
                {selectedConv.phone && <div style={{ color: C.muted, fontSize: 11 }}>{selectedConv.phone}</div>}
              </div>
              <button onClick={() => window.open(`https://wa.me/${selectedConv.phone?.replace(/\D/g,'')}`)} style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 8, color: C.green, fontSize: 11, fontWeight: 700, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>ð± WhatsApp</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.from_admin ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '78%', background: m.from_admin ? `linear-gradient(135deg,${C.gold},${C.goldLight})` : C.card, color: m.from_admin ? '#000' : '#fff', borderRadius: m.from_admin ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '9px 13px', fontSize: 13 }}>
                    {m.image_url && <img src={m.image_url} alt="comprobante" style={{ width: '100%', borderRadius: 8, marginBottom: m.message ? 6 : 0 }} />}
                    {m.message}
                    {m.delete_at && <div style={{ fontSize: 9, color: m.from_admin ? 'rgba(0,0,0,.4)' : '#555', marginTop: 2 }}>Se elimina: {new Date(m.delete_at).toLocaleDateString('es-CO')}</div>}
                    <div style={{ fontSize: 10, color: m.from_admin ? 'rgba(0,0,0,.4)' : '#555', marginTop: 3, textAlign: 'right' }}>{fmtTime(m.created_at)}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '8px 14px', borderTop: `1px solid rgba(255,255,255,0.04)`, overflowX: 'auto', display: 'flex', gap: 6, scrollbarWidth: 'none' }}>
              {['â Pago confirmado', 'â Pago rechazado', 'â³ En revisiÃ³n', 'ð Te contactamos', 'ð Â¡Ganaste!'].map(r => (
                <button key={r} onClick={() => sendMessage(r)} style={{ flexShrink: 0, background: C.bg3, border: `1px solid #2a2a2a`, borderRadius: 999, padding: '5px 12px', color: '#ccc', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{r}</button>
              ))}
            </div>
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.cardBorder}`, display: 'flex', gap: 8 }}>
              <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Responder al cliente..." style={{ flex: 1 }} />
              <button onClick={() => sendMessage()} disabled={loading} style={{ ...S.btnGold, width: 'auto', padding: '10px 16px', borderRadius: 10 }}>â</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // âââ VISTA USUARIO âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  if (!user) return (
    <div style={{ ...S.content, textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>ð¬</div>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>AtenciÃ³n al Cliente</h2>
      <p style={{ color: C.muted, marginBottom: 24, fontSize: 14 }}>Inicia sesiÃ³n para chatear con nosotros</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)', background: C.bg }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if(e.target.files[0]) handleImageUpload(e.target.files[0]) }} />
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: `1px solid rgba(201,162,39,0.3)` }}><LogoSVG size={42} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>La Casa â Soporte</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, background: C.green, borderRadius: '50%', display: 'inline-block' }} className="pulse"></span>
            <span style={{ color: C.green, fontSize: 11 }}>En lÃ­nea â respuesta inmediata</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ background: C.card, borderRadius: '16px 16px 16px 4px', padding: '12px 16px', fontSize: 13, color: '#fff', maxWidth: '82%', border: `1px solid ${C.cardBorder}` }}>
            ð  Â¡Hola! Bienvenido a La Casa De Las DinÃ¡micas. Â¿En quÃ© te podemos ayudar hoy?
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from_admin ? 'flex-start' : 'flex-end' }}>
            <div style={{ maxWidth: '80%', background: m.from_admin ? C.card : `linear-gradient(135deg,${C.gold},${C.goldLight})`, color: m.from_admin ? '#fff' : '#000', border: m.from_admin ? `1px solid ${C.cardBorder}` : 'none', borderRadius: m.from_admin ? '16px 16px 16px 4px' : '16px 16px 4px 16px', padding: '10px 14px', fontSize: 13, lineHeight: 1.5 }}>
              {m.image_url && (
                <div style={{ marginBottom: m.message ? 6 : 0 }}>
                  <img src={m.image_url} alt="comprobante" style={{ width: '100%', borderRadius: 8, display: 'block' }} />
                  {m.delete_at && <div style={{ fontSize: 9, color: m.from_admin ? '#555' : 'rgba(0,0,0,.5)', marginTop: 3 }}>ð Se elimina el {new Date(m.delete_at).toLocaleDateString('es-CO')}</div>}
                </div>
              )}
              {m.message}
              <div style={{ fontSize: 10, color: m.from_admin ? '#555' : 'rgba(0,0,0,.4)', marginTop: 4, textAlign: 'right' }}>{fmtTime(m.created_at)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '8px 16px', borderTop: `1px solid rgba(255,255,255,0.04)`, overflowX: 'auto', display: 'flex', gap: 6, scrollbarWidth: 'none', flexShrink: 0 }}>
        {quickReplies.map(q => (
          <button key={q} onClick={() => sendMessage(q)} style={{ flexShrink: 0, background: `rgba(201,162,39,0.07)`, border: `1px solid rgba(201,162,39,0.18)`, borderRadius: 999, padding: '6px 12px', color: C.gold, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{q}</button>
        ))}
      </div>
      <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.cardBorder}`, display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        <button onClick={() => fileInputRef.current?.click()} style={{ width: 42, height: 42, background: C.bg3, border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.gold} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Escribe o adjunta comprobante..." style={{ flex: 1 }} />
        <button onClick={() => sendMessage()} disabled={loading} style={{ ...S.btnGold, width: 'auto', padding: '11px 16px', borderRadius: 10, flexShrink: 0 }}>â</button>
      </div>
    </div>
  )
}

// âââ ADMIN PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function AdminPage({ user, isAdmin, raffles, appConfig, setAppConfig, onBack, onOpenSupport }) {
  const [tab, setTab] = useState(0)
  const [tickets, setTickets] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [localConfig, setLocalConfig] = useState(appConfig)

  useEffect(() => { setLocalConfig(appConfig) }, [appConfig])
  useEffect(() => {
    if (!isAdmin) return
    supabase.from('tickets').select('*, users_profile(full_name,phone), raffles(title)').order('created_at', { ascending: false }).limit(30).then(({ data }) => { if (data) setTickets(data) })
    supabase.from('support_messages').select('id', { count: 'exact' }).eq('from_admin', false).then(({ count }) => setUnreadCount(count || 0))
  }, [isAdmin])

  async function saveConfig() {
    await supabase.from('app_config').upsert({ id: 1, ...localConfig })
    setAppConfig(localConfig)
    alert('â ConfiguraciÃ³n guardada')
  }

  if (!isAdmin) return <div style={{ ...S.content, textAlign: 'center', paddingTop: 60 }}><div style={{ fontSize: 48 }}>ð</div><p style={{ color: C.muted, marginTop: 16 }}>Acceso restringido</p></div>

  const pending = tickets.filter(t => t.status === 'reserved')
  const totalRecaudo = tickets.filter(t => t.status === 'paid').reduce((a, t) => a + (t.total_amount || 0), 0)

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 700, marginBottom: 16, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>â Volver</button>
      <div style={{ background: `linear-gradient(160deg,#1a1200,${C.card})`, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 18, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, overflow: 'hidden', border: `1px solid rgba(201,162,39,0.3)` }}><LogoSVG size={44} /></div>
          <div><h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>Panel de AdministraciÃ³n</h2><div style={{ color: C.muted, fontSize: 12 }}>La Casa De Las DinÃ¡micas</div></div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[['ð°', raffles.length, 'DinÃ¡micas'], ['ðï¸', tickets.length, 'Boletos'], ['â³', pending.length, 'Por confirmar'], ['ð¬', unreadCount, 'Mensajes']].map(([icon, val, label]) => (
          <div key={label} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.gold }}>{val}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recaudo total */}
      <div style={{ background: `linear-gradient(135deg,rgba(39,174,96,0.08),rgba(39,174,96,0.03))`, border: '1px solid rgba(39,174,96,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: C.green, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>ðµ Total recaudado</div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 900 }}>{fmt(totalRecaudo)}</div>
        </div>
        <div style={{ fontSize: 32 }}>ð°</div>
      </div>

      <button onClick={onOpenSupport} style={{ ...S.btnGold, marginBottom: 14, fontSize: 14, position: 'relative' }}>
        ð¬ Atender Clientes
        {unreadCount > 0 && <span style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, background: '#C0392B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>{unreadCount}</span>}
      </button>

      <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, marginBottom: 16 }}>
        {['DinÃ¡micas', 'Boletos', 'Config'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ flex: 1, padding: 9, border: 'none', background: tab === i ? C.card : 'transparent', color: tab === i ? '#fff' : '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit' }}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <>
          <button onClick={() => alert('Formulario de creaciÃ³n prÃ³ximamente')} style={{ ...S.btnGold, marginBottom: 14, fontSize: 13 }}>+ Crear nueva dinÃ¡mica</button>
          {raffles.map(r => (
            <div key={r.id} style={{ ...S.card, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 6 }}>{r.title}</div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 10 }}>{fmt(r.ticket_price)} Â· {r.lottery_name}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { const n = prompt(`NÃºmero ganador (0-${r.number_range-1}):`); if (n !== null) alert(`ð Â¡Ganador: ${String(parseInt(n)).padStart(r.number_range<=100?2:3,'0')}!`) }} style={{ flex: 1, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 8, color: C.green, fontSize: 11, fontWeight: 700, padding: 9, cursor: 'pointer', fontFamily: 'inherit' }}>ð° Realizar sorteo</button>
                <button style={{ flex: 1, background: `rgba(201,162,39,0.08)`, border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 8, color: C.gold, fontSize: 11, fontWeight: 700, padding: 9, cursor: 'pointer', fontFamily: 'inherit' }}>âï¸ Editar</button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 1 && (
        <>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>{pending.length} boleto(s) pendientes</div>
          {pending.length === 0
            ? <div style={{ textAlign: 'center', padding: '30px 0', color: C.muted }}>Todo al dÃ­a â</div>
            : pending.map(t => (
              <div key={t.id} style={{ ...S.card, marginBottom: 10 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t.raffles?.title}</div>
                <div style={{ color: C.muted, fontSize: 12, marginBottom: 4 }}>ð¤ {t.users_profile?.full_name}</div>
                {t.users_profile?.phone && <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>ð± {t.users_profile.phone}</div>}
                <div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>NÃºmeros: <span style={{ color: C.gold, fontWeight: 700 }}>{(t.numbers||[]).map(n=>String(n).padStart(2,'0')).join(', ')}</span></div>
                <div style={{ color: C.gold, fontWeight: 900, fontSize: 16, marginBottom: 12 }}>{fmt(t.total_amount)}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={async () => { await supabase.from('tickets').update({ status: 'paid' }).eq('id', t.id); setTickets(prev => prev.map(x => x.id===t.id?{...x,status:'paid'}:x)); alert('â Confirmado') }} style={{ flex: 1, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 8, color: C.green, fontSize: 12, fontWeight: 700, padding: 10, cursor: 'pointer', fontFamily: 'inherit' }}>â Confirmar</button>
                  <button onClick={async () => { await supabase.from('tickets').update({ status: 'rejected' }).eq('id', t.id); setTickets(prev => prev.filter(x => x.id!==t.id)); alert('â Rechazado') }} style={{ flex: 1, background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 8, color: '#E74C3C', fontSize: 12, fontWeight: 700, padding: 10, cursor: 'pointer', fontFamily: 'inherit' }}>â Rechazar</button>
                </div>
              </div>
            ))
          }
        </>
      )}

      {tab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* REDES SOCIALES */}
          <div style={S.card}>
            <div style={{ color: C.gold, fontSize: 13, fontWeight: 800, marginBottom: 12 }}>ð² Redes Sociales</div>
            {[
              ['whatsapp', 'ð± WhatsApp (link directo)', 'https://wa.me/57300...'],
              ['canal', 'ð¢ Canal de WhatsApp', 'https://whatsapp.com/channel/...'],
              ['instagram', 'ð¸ Instagram', 'https://instagram.com/lacasa...'],
              ['facebook', 'ð¥ Facebook', 'https://facebook.com/lacasa...'],
              ['telegram', 'âï¸ Telegram', 'https://t.me/lacasa...'],
            ].map(([key, label, placeholder]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
                <input value={localConfig[key] || ''} onChange={e => setLocalConfig(prev => ({...prev, [key]: e.target.value}))} placeholder={placeholder} style={{ fontSize: 13 }} />
              </div>
            ))}
          </div>

          {/* PUNTOS */}
          <div style={S.card}>
            <div style={{ color: C.gold, fontSize: 13, fontWeight: 800, marginBottom: 12 }}>â­ Programa de Puntos</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bg3, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
              <div>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Mostrar botÃ³n Puntos</div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Visible en la barra de navegaciÃ³n</div>
              </div>
              <button onClick={() => setLocalConfig(prev => ({...prev, showPoints: !prev.showPoints}))}
                style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: localConfig.showPoints ? C.gold : '#333', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                <span style={{ position: 'absolute', width: 18, height: 18, background: '#fff', borderRadius: '50%', top: 3, left: localConfig.showPoints ? 23 : 3, transition: 'left .2s' }}></span>
              </button>
            </div>
          </div>

          {/* IMÃGENES SOPORTE */}
          <div style={S.card}>
            <div style={{ color: C.gold, fontSize: 13, fontWeight: 800, marginBottom: 12 }}>ð Auto-eliminar comprobantes</div>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>Las imÃ¡genes enviadas en soporte se eliminarÃ¡n automÃ¡ticamente despuÃ©s de:</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {[1, 3, 7].map(d => (
                <button key={d} onClick={() => setLocalConfig(prev => ({...prev, imgDeleteDays: d}))}
                  style={{ flex: 1, border: `1px solid ${localConfig.imgDeleteDays === d ? C.gold : 'rgba(201,162,39,0.2)'}`, background: localConfig.imgDeleteDays === d ? 'rgba(201,162,39,0.15)' : C.bg3, borderRadius: 9, padding: '8px', textAlign: 'center', color: localConfig.imgDeleteDays === d ? C.gold : C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {d} dÃ­a{d !== 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* COMISIONES */}
          <div style={S.card}>
            <div style={{ color: C.gold, fontSize: 13, fontWeight: 800, marginBottom: 12 }}>ð¸ Comisiones de vendedores</div>
            {[['Nivel 1 (venta directa) %', 15], ['Nivel 2 %', 7], ['Nivel 3 %', 3]].map(([label, val]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
                <input type="number" defaultValue={val} min="0" max="50" style={{ fontSize: 14 }} />
              </div>
            ))}
          </div>

          <button onClick={saveConfig} style={S.btnGold}>â Guardar toda la configuraciÃ³n</button>
        </div>
      )}
    </div>
  )
}

// âââ LOGIN ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function LoginScreen({ onLogin, onRegister, onBack }) {
  const [email, setEmail] = useState(''); const [pwd, setPwd] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const submit = async () => { setLoading(true); setError(''); try { await onLogin(email, pwd) } catch { setError('Correo o contraseÃ±a incorrectos') } finally { setLoading(false) } }
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
      <style>{`input{background:#1a1a1a;border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:13px 16px;color:#fff;font-size:16px;outline:none;width:100%;font-family:inherit;box-sizing:border-box}input:focus{border-color:#C9A227}`}</style>
      <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, overflow: 'hidden', marginBottom: 16, border: `2px solid rgba(201,162,39,0.4)`, boxShadow: `0 0 40px rgba(201,162,39,0.2)` }} className="house-float"><LogoSVG size={80} /></div>
          <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>La Casa De Las DinÃ¡micas</div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 26, marginBottom: 6, textAlign: 'center' }}>Bienvenido de vuelta</h1>
          <p style={{ color: C.muted, fontSize: 14, textAlign: 'center' }}>Ingresa para ver tus dinÃ¡micas</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>ð§ Correo electrÃ³nico</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tuemail@correo.com" /></div>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>ð ContraseÃ±a</label><input type="password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="â¢â¢â¢â¢â¢â¢â¢â¢" /></div>
          {error && <div style={{ color: '#E74C3C', fontSize: 13, textAlign: 'center', padding: '8px 12px', background: 'rgba(192,57,43,0.1)', borderRadius: 8 }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ ...S.btnGold, opacity: loading ? .7 : 1, marginTop: 4 }}>{loading ? 'Ingresando...' : 'ð  Ingresar a La Casa'}</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, color: '#555', fontSize: 14 }}>Â¿No tienes cuenta? <button onClick={onRegister} style={{ background: 'none', border: 'none', color: C.gold, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>RegÃ­strate gratis</button></p>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', width: '100%', textAlign: 'center', marginTop: 12, fontSize: 13, fontFamily: 'inherit' }}>Explorar sin cuenta</button>
      </div>
    </div>
  )
}

// âââ REGISTER âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function RegisterScreen({ onRegister, onLogin }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', ref: '' }); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const submit = async () => {
    if (!form.name || !form.email || !form.password) { setError('Por favor completa todos los campos'); return }
    if (form.password.length < 6) { setError('La contraseÃ±a debe tener mÃ­nimo 6 caracteres'); return }
    setLoading(true); setError('')
    try { await onRegister(form.name, form.phone, form.email, form.password, form.ref) }
    catch (e) { setError(e.message || 'Error al registrarse. Intenta de nuevo.') }
    finally { setLoading(false) }
  }
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
      <style>{`input{background:#1a1a1a;border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:13px 16px;color:#fff;font-size:16px;outline:none;width:100%;font-family:inherit;box-sizing:border-box}input:focus{border-color:#C9A227}`}</style>
      <div style={{ maxWidth: 380, margin: '0 auto', width: '100%', paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, overflow: 'hidden', marginBottom: 10, border: `1px solid rgba(201,162,39,0.3)` }} className="house-float"><LogoSVG size={60} /></div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 24, marginBottom: 5, textAlign: 'center' }}>Ãnete a La Casa</h1>
          <p style={{ color: C.muted, fontSize: 14, textAlign: 'center' }}>RegÃ­strate gratis y empieza a participar</p>
        </div>
        <div style={{ background: `linear-gradient(135deg,rgba(201,162,39,0.08),rgba(201,162,39,0.03))`, border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>ð</span>
          <div><div style={{ color: C.gold, fontSize: 13, fontWeight: 800 }}>Â¡Bono de bienvenida!</div><div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>$500 en saldo + 1.000 puntos de fidelidad</div></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['ð¤ Nombre completo','name','text','Carlos RodrÃ­guez'],['ð± WhatsApp / Celular','phone','tel','310 000 0000'],['ð§ Correo electrÃ³nico','email','email','tuemail@correo.com'],['ð ContraseÃ±a','password','password','MÃ­nimo 6 caracteres'],['ð CÃ³digo de referido (opcional)','ref','text','CASA-XXXXXX']].map(([label,key,type,placeholder]) => (
            <div key={key}><label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label><input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={placeholder} /></div>
          ))}
          {error && <div style={{ color: '#E74C3C', fontSize: 13, textAlign: 'center', padding: '8px 12px', background: 'rgba(192,57,43,0.1)', borderRadius: 8 }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ ...S.btnGold, marginTop: 6, opacity: loading ? .7 : 1 }}>{loading ? 'Creando tu cuenta...' : 'ð  Unirme a La Casa'}</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#555', fontSize: 14 }}>Â¿Ya tienes cuenta? <button onClick={onLogin} style={{ background: 'none', border: 'none', color: C.gold, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Ingresar</button></p>
      </div>
    </div>
  )
}
