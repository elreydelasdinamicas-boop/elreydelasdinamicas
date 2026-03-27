import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './lib/supabase.js'

const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)
const fmtDate = d => new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtTime = d => new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
const medals = ['ð¥', 'ð¥', 'ð¥', 'ð¯', 'ðï¸']

const C = {
  gold: '#E6BE00', goldLight: '#f0d060', goldDark: '#8B6914',
  bg: '#000', bg2: '#0d0d0d', bg3: '#151515', card: '#1a1a1a',
  cardBorder: 'rgba(230,190,0,0.18)', muted: '#555',
  green: '#27AE60', blue: '#2980B9', red: '#C0392B',
  purple: '#9B59B6', orange: '#E67E22',
  wa: '#25D366', waDark: '#075E54',
}

const S = {
  header: { position: 'sticky', top: 0, zIndex: 40, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.cardBorder}`, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(201,162,39,0.2)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px' },
  content: { padding: '16px 16px 88px', maxWidth: 500, margin: '0 auto' },
  card: { background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden' },
  btnGold: { background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, color: '#000', border: 'none', borderRadius: 12, padding: '14px 20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, width: '100%', fontFamily: 'inherit' },
  btnOutline: { background: 'transparent', color: C.gold, border: `1px solid rgba(201,162,39,0.4)`, borderRadius: 12, padding: '13px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, width: '100%', fontFamily: 'inherit' },
  btnPurple: { background: 'linear-gradient(135deg,#5b2d8a,#7c3db8)', color: '#fff', border: '1px solid rgba(155,89,182,0.5)', borderRadius: 12, padding: '14px 20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, width: '100%', fontFamily: 'inherit' },
  navBtn: (active) => ({ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '8px 10px', color: active ? C.gold : '#444', transform: active ? 'scale(1.08)' : 'scale(1)', transition: 'all .2s', minWidth: 52 }),
  badge: (type) => {
    const map = { gold: { background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, color: '#000' }, green: { background: 'rgba(39,174,96,0.15)', color: C.green }, blue: { background: 'rgba(41,128,185,0.15)', color: '#5DADE2' }, red: { background: 'rgba(192,57,43,0.15)', color: '#E74C3C' }, dim: { background: 'rgba(201,162,39,0.1)', color: C.gold }, purple: { background: 'rgba(155,89,182,0.15)', color: '#C9A0E8' }, orange: { background: 'rgba(230,126,34,0.15)', color: '#E67E22' } }
    return { borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '.5px', ...map[type] }
  }
}

const CSS = `@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes houseFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.house-float{animation:houseFloat 3s ease-in-out infinite}.pulse{animation:pulse 2s infinite}@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}.slide-up{animation:slideUp .3s ease}@keyframes glow{0%,100%{box-shadow:0 0 6px rgba(155,89,182,0.4),0 0 0 1px rgba(155,89,182,0.5)}50%{box-shadow:0 0 18px rgba(155,89,182,0.9),0 0 0 1.5px #9B59B6}}.society-glow{animation:glow 2s ease-in-out infinite}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}.society-float{animation:float 3s ease-in-out infinite}input,select,textarea{background:#1a1a1a;border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:13px 16px;color:#fff;font-size:15px;outline:none;width:100%;transition:border-color .2s;font-family:inherit;box-sizing:border-box}input:focus,select:focus,textarea:focus{border-color:#C9A227}input::placeholder,textarea::placeholder{color:#444}textarea{resize:none}::-webkit-scrollbar{display:none}`

const LogoSVG = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,4 92,20 92,60 50,96 8,60 8,20" fill="#1a1000" stroke="#C9A227" strokeWidth="3"/>
    <circle cx="50" cy="10" r="1.5" fill="#E8C547" opacity="0.9"/>
    <polygon points="50,22 72,36 28,36" fill="#C9A227"/>
    <rect x="30" y="36" width="40" height="26" fill="#2a1e00" stroke="#C9A227" strokeWidth="0.5"/>
    <rect x="35" y="38" width="3" height="22" fill="#C9A227" opacity="0.7"/>
    <rect x="43" y="38" width="3" height="22" fill="#C9A227" opacity="0.7"/>
    <rect x="54" y="38" width="3" height="22" fill="#C9A227" opacity="0.7"/>
    <rect x="62" y="38" width="3" height="22" fill="#C9A227" opacity="0.7"/>
    <rect x="33" y="40" width="5" height="5" rx="1" fill="#E8C547" opacity="0.9"/>
    <rect x="62" y="40" width="5" height="5" rx="1" fill="#E8C547" opacity="0.9"/>
    <rect x="45" y="50" width="10" height="12" rx="2" fill="#1a1000"/>
    <ellipse cx="22" cy="56" rx="7" ry="8" fill="#6B4423"/>
    <text x="22" y="59" textAnchor="middle" fill="#C9A227" fontSize="7" fontWeight="bold">$</text>
    <ellipse cx="78" cy="56" rx="7" ry="8" fill="#6B4423"/>
    <text x="78" y="59" textAnchor="middle" fill="#C9A227" fontSize="7" fontWeight="bold">$</text>
    <rect x="20" y="67" width="60" height="22" rx="3" fill="#0d0900" stroke="#C9A227" strokeWidth="1.5"/>
    <text x="50" y="74" textAnchor="middle" fill="#C9A227" fontSize="5.5" fontWeight="bold" letterSpacing="0.5">LA CASA</text>
    <text x="50" y="80" textAnchor="middle" fill="#C9A227" fontSize="3.5" letterSpacing="1">DE LAS</text>
    <text x="50" y="86" textAnchor="middle" fill="#C9A227" fontSize="5" fontWeight="bold" letterSpacing="0.5">DINAMICAS</text>
  </svg>
)

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', border: `1px solid rgba(201,162,39,0.3)`, flexShrink: 0 }}><LogoSVG size={40} /></div>
    <div><b style={{ fontSize: 13, fontWeight: 900, color: '#fff', display: 'block', lineHeight: 1.1 }}>La Casa</b><span style={{ fontSize: 9, color: C.gold, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>De Las Dinamicas</span></div>
  </div>
)

const Toggle = ({ on, onToggle }) => (
  <button onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: on ? C.gold : '#333', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
    <span style={{ position: 'absolute', width: 18, height: 18, background: '#fff', borderRadius: '50%', top: 3, left: on ? 23 : 3, transition: 'left .2s' }}></span>
  </button>
)

const GoldLine = () => <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }} />

const Icons = {
  wa: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ig: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none"/></svg>,
  fb: <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  tg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const DEFAULT_CONFIG = {
  showPoints: true, showWinners: true, showHowItWorks: true, showWelcomeBonus: true,
  whatsapp: '', canal: '', instagram: '', facebook: '', telegram: '',
  supportWhatsapp: '', supportWhatsappText: 'WhatsApp', supportWhatsappMsg: 'Hola! Necesito ayuda',
  paymentWhatsapp: '', imgDeleteDays: 3,
  notifAutoNewRaffle: true, notifAuto24h: true, notifAuto2h: true,
  notifAutoPaymentConfirmed: true, notifAutoUnpaidReminder: true, notifAutoResult: false,
}

// âââ PWA HOOK âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function usePWA() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notifPermission, setNotifPermission] = useState('default')

  useEffect(() => {
    const installed = localStorage.getItem('pwaInstalled') === 'true' ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsInstalled(installed)
    if (window.deferredInstallPrompt) setCanInstall(true)
    const onAvail = () => setCanInstall(true)
    const onInst = () => { setIsInstalled(true); setCanInstall(false) }
    window.addEventListener('pwaInstallAvailable', onAvail)
    window.addEventListener('pwaInstalled', onInst)
    if ('Notification' in window) setNotifPermission(Notification.permission)
    return () => { window.removeEventListener('pwaInstallAvailable', onAvail); window.removeEventListener('pwaInstalled', onInst) }
  }, [])

  const install = useCallback(async () => {
    if (!window.deferredInstallPrompt) return false
    window.deferredInstallPrompt.prompt()
    const { outcome } = await window.deferredInstallPrompt.userChoice
    if (outcome === 'accepted') { localStorage.setItem('pwaInstalled', 'true'); setIsInstalled(true); setCanInstall(false); return true }
    return false
  }, [])

  const requestNotif = useCallback(async () => {
    if (!('Notification' in window)) return false
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    return perm === 'granted'
  }, [])

  return { canInstall, isInstalled, notifPermission, install, requestNotif }
}

// âââ APP PRINCIPAL ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function App() {
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [authPage, setAuthPage] = useState(null)
  const [raffles, setRaffles] = useState([])
  const [selectedRaffle, setSelectedRaffle] = useState(null)
  const [myTickets, setMyTickets] = useState([])
  const [selectedNums, setSelectedNums] = useState([])
  const [allReservedNums, setAllReservedNums] = useState([])
  const [showReservePopup, setShowReservePopup] = useState(false)
  const [pendingNums, setPendingNums] = useState(null)
  const [appConfig, setAppConfig] = useState(DEFAULT_CONFIG)
  const [societyData, setSocietyData] = useState(null) // { raffle, number }
  const [bingoVisible, setBingoVisible] = useState(false)
  const pwa = usePWA()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
        const p = JSON.parse(localStorage.getItem('pendingNums') || 'null')
        if (p?.raffleId && p?.nums?.length > 0) setPendingNums(p)
      } else setProfile(null)
    })
    fetchConfig()
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { fetchRaffles() }, [])
  useEffect(() => { if (user) fetchMyTickets() }, [user])
  useEffect(() => {
    if (!selectedRaffle) return
    fetchReserved(selectedRaffle.id)
    const ch = supabase.channel(`tickets-${selectedRaffle.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `raffle_id=eq.${selectedRaffle.id}` }, () => fetchReserved(selectedRaffle.id))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [selectedRaffle])

  useEffect(() => { if (user && pendingNums?.nums?.length > 0) reservePending() }, [user, pendingNums])

  async function reservePending() {
    const { raffleId, nums, price } = pendingNums
    if (!raffleId || !nums?.length) return
    const { data: ex } = await supabase.from('tickets').select('numbers').eq('raffle_id', raffleId).in('status', ['reserved', 'paid'])
    const taken = (ex || []).flatMap(t => t.numbers || [])
    const avail = nums.filter(n => !taken.includes(n))
    if (avail.length > 0) await supabase.from('tickets').insert({ user_id: user.id, raffle_id: raffleId, numbers: avail, status: 'reserved', total_amount: avail.length * price })
    localStorage.removeItem('pendingNums'); setPendingNums(null)
    await fetchMyTickets(); setPage('profile')
  }

  async function fetchConfig() {
    const { data } = await supabase.from('app_config').select('*').eq('id', 1).single()
    if (data) setAppConfig(prev => ({ ...prev, ...data }))
  }
  async function fetchReserved(id) {
    const { data } = await supabase.from('tickets').select('numbers').eq('raffle_id', id).in('status', ['reserved', 'paid'])
    if (data) setAllReservedNums(data.flatMap(t => t.numbers || []))
  }
  async function fetchProfile(id) {
    const { data } = await supabase.from('users_profile').select('*').eq('id', id).single()
    if (data) setProfile(data)
  }
  async function fetchRaffles() {
    const { data, error } = await supabase.from('raffles').select('*').eq('status', 'active').order('created_at', { ascending: false })
    if (error) { console.error('Error fetching raffles:', error); return }
    setRaffles(data || [])
  }
  async function fetchMyTickets() {
    const { data } = await supabase.from('tickets').select('*, raffles(title,raffle_date,lottery_name,ticket_price)').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setMyTickets(data)
  }
  async function doLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setAuthPage(null); setPage('home')
  }
  async function doRegister(name, phone, email, password) {
    const refCode = 'CASA-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, phone, referral_code: refCode } } })
    if (error) throw error
    if (data.session) {
      await supabase.from('users_profile').upsert({ id: data.user.id, full_name: name, phone, email, role: 'customer', credits: appConfig.showWelcomeBonus ? 500 : 0, points: appConfig.showWelcomeBonus ? 1000 : 0, referral_code: refCode, is_promoter: false })
      setUser(data.user); await fetchProfile(data.user.id)
      setAuthPage(null); setPage('home'); return
    }
    if (data.user && !data.session) throw new Error('Revisa tu correo y confirma tu cuenta.')
  }
  async function doLogout() {
    await supabase.auth.signOut(); setUser(null); setProfile(null); setMyTickets([]); setPage('home')
  }
  async function handleReserve() {
    if (!user) {
      localStorage.setItem('pendingNums', JSON.stringify({ raffleId: selectedRaffle.id, nums: selectedNums, price: selectedRaffle.ticket_price }))
      setShowReservePopup(false); setAuthPage('choose'); return
    }
    const r = selectedRaffle
    const { data: ex } = await supabase.from('tickets').select('numbers').eq('raffle_id', r.id).in('status', ['reserved', 'paid'])
    const taken = (ex || []).flatMap(t => t.numbers || [])
    const conflict = selectedNums.filter(n => taken.includes(n))
    if (conflict.length > 0) { alert(`Los numeros ${conflict.map(n => String(n).padStart(2, '0')).join(', ')} ya estan apartados.`); await fetchReserved(r.id); setSelectedNums([]); setShowReservePopup(false); return }
    await supabase.from('tickets').insert({ user_id: user.id, raffle_id: r.id, numbers: selectedNums, status: 'reserved', total_amount: selectedNums.length * r.ticket_price })
    await fetchMyTickets(); setSelectedNums([]); setShowReservePopup(false); setPage('profile')
  }
  async function becomePromoter() {
    if (!user) return
    const refCode = 'CASA-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    await supabase.from('users_profile').update({ is_promoter: true, referral_code: refCode }).eq('id', user.id)
    await supabase.from('promoters').upsert({ user_id: user.id, referral_code: refCode, total_earnings: 0, pending_earnings: 0, level1_rate: 15, level2_rate: 7, level3_rate: 3 })
    await fetchProfile(user.id); alert('Ahora eres Vendedor Oficial!'); setPage('promoter')
  }

  // Don't block render while loading - show home with empty raffles instead
  if (authPage === 'choose') return <ChooseAuthScreen selectedRaffle={selectedRaffle} selectedNums={selectedNums} onLogin={() => setAuthPage('login')} onRegister={() => setAuthPage('register')} onBack={() => { setAuthPage(null); setPage('raffle') }} />
  if (authPage === 'login') return <LoginScreen onLogin={doLogin} onRegister={() => setAuthPage('register')} onBack={() => setAuthPage(null)} />
  if (authPage === 'register') return <RegisterScreen onRegister={doRegister} onLogin={() => setAuthPage('login')} appConfig={appConfig} />

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Amigo'
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <style>{CSS}</style>
      <header style={S.header}>
        <button onClick={() => setPage('home')} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: 8, position: 'relative' }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ width: 8, height: 8, background: '#C0392B', borderRadius: '50%', position: 'absolute', top: 3, right: 3 }}></span>
        </button>
        <Logo />
        {user ? <button onClick={() => setPage('profile')} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: 8 }}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
          : <button onClick={() => setAuthPage('login')} style={{ background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, border: 'none', color: '#000', cursor: 'pointer', padding: '7px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>Entrar</button>}
      </header>
      <main>
        {page === 'home' && <HomePage raffles={raffles} displayName={displayName} appConfig={appConfig} onRaffle={r => { setSelectedRaffle(r); setSelectedNums([]); setPage('raffle') }} user={user} onHow={() => setPage('how')} onWinners={() => setPage('winners')} />}
        {page === 'raffle' && selectedRaffle && <RafflePage raffle={selectedRaffle} user={user} allReservedNums={allReservedNums} selectedNums={selectedNums} setSelectedNums={setSelectedNums} onShowPopup={() => setShowReservePopup(true)} onBack={() => setPage('home')} onSociety={num => { setSocietyData({ raffle: selectedRaffle, number: num }); setPage('society') }} />}
        {page === 'profile' && <ProfilePage user={user} profile={profile} myTickets={myTickets} onLogout={doLogout} onLogin={() => setAuthPage('login')} onRegister={() => setAuthPage('register')} onPromoter={() => setPage('promoter')} onBecomePromoter={becomePromoter} isAdmin={isAdmin} onAdmin={() => setPage('admin')} onRefresh={fetchMyTickets} onSupport={() => setPage('support')} appConfig={appConfig} pwa={pwa} />}
        {page === 'promoter' && <PromoterPage user={user} profile={profile} onBack={() => setPage('profile')} />}
        {page === 'points' && appConfig.showPoints && <PointsPage user={user} profile={profile} onLogin={() => setAuthPage('login')} />}
        {page === 'support' && <SupportPage user={user} profile={profile} isAdmin={false} appConfig={appConfig} />}
        {page === 'admin' && <AdminPage user={user} isAdmin={isAdmin} raffles={raffles} appConfig={appConfig} setAppConfig={setAppConfig} onBack={() => setPage('home')} onOpenSupport={() => setPage('admin-support')} onOpenSociety={() => setPage('admin-society')} onOpenBingo={() => setPage('admin-bingo')} onRefreshRaffles={fetchRaffles} />}
        {page === 'admin-support' && <SupportPage user={user} profile={profile} isAdmin={true} onBack={() => setPage('admin')} appConfig={appConfig} />}
        {page === 'winners' && <WinnersPage onBack={() => setPage('home')} onRaffle={() => setPage('home')} />}
        {page === 'society' && societyData && <SocietyPage user={user} profile={profile} raffle={societyData.raffle} number={societyData.number} onBack={() => { setPage('raffle') }} onLogin={() => setAuthPage('login')} />}
        {page === 'admin-society' && <AdminSocietyPanel raffles={raffles} onBack={() => setPage('admin')} />}
        {page === 'bingo' && <BingoPage user={user} profile={profile} appConfig={appConfig} onLogin={() => setAuthPage('login')} onBack={() => setPage('home')} />}
        {page === 'admin-bingo' && <AdminBingoPanel onBack={() => setPage('admin')} />}
        {page === 'how' && <HowItWorksPage onBack={() => setPage('home')} onRegister={() => setAuthPage('register')} />}
      </main>
      <nav style={S.bottomNav}>
        {[{ id: 'home', label: 'Inicio', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          ...(appConfig.showPoints ? [{ id: 'points', label: 'Puntos', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }] : []),
          ...(appConfig.show_bingo ? [{ id: 'bingo', label: 'Bingo', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> }] : []),
          { id: 'support', label: 'Soporte', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { id: 'profile', label: 'Mi Cuenta', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map(({ id, label, icon }) => (<button key={id} onClick={() => setPage(id)} style={S.navBtn(page === id)}>{icon}<span style={{ fontSize: 9, fontWeight: 700 }}>{label}</span></button>))}
      </nav>
      {showReservePopup && selectedRaffle && selectedNums.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowReservePopup(false)}>
          <div className="slide-up" style={{ background: '#111', borderRadius: '22px 22px 0 0', padding: 24, width: '100%', maxWidth: 500, border: `1px solid rgba(201,162,39,0.25)`, borderBottom: 'none', position: 'relative', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <GoldLine />
            <div style={{ width: 40, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 18px' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div><div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>Numeros seleccionados</div><div style={{ color: C.gold, fontSize: 20, fontWeight: 900 }}>{selectedNums.map(n => `#${String(n).padStart(selectedRaffle.number_range <= 100 ? 2 : 3, '0')}`).join('  ')}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ color: C.muted, fontSize: 11 }}>Total</div><div style={{ color: C.gold, fontSize: 20, fontWeight: 900 }}>{fmt(selectedNums.length * selectedRaffle.ticket_price)}</div></div>
            </div>
            <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}><div style={{ color: C.muted, fontSize: 9, textTransform: 'uppercase', marginBottom: 2 }}>Sorteo</div><div style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{new Date(selectedRaffle.raffle_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ color: C.muted, fontSize: 9, textTransform: 'uppercase', marginBottom: 2 }}>Loteria</div><div style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{selectedRaffle.lottery_name}</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ color: C.muted, fontSize: 9, textTransform: 'uppercase', marginBottom: 2 }}>Caduca</div><div style={{ color: '#E74C3C', fontSize: 11, fontWeight: 700 }}>{selectedRaffle.release_hours ? (() => { const d = new Date(Date.now() + (selectedRaffle.release_hours||24)*3600000); return d.toLocaleDateString('es-CO',{day:'numeric',month:'short'}) + ' ' + d.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) })() : '24h'}</div></div>
            </div>
            <button onClick={handleReserve} style={{ ...S.btnGold, marginBottom: 10 }}>Confirmar reserva</button>
            <div style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginBottom: 10 }}>{selectedRaffle.release_hours ? (() => { const d = new Date(Date.now() + (selectedRaffle.release_hours||24)*3600000); return `Los numeros quedan guardados hasta el ${d.toLocaleDateString('es-CO',{day:'numeric',month:'long'})} a las ${d.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}` })() : 'Los numeros quedan guardados 24 horas mientras confirmas el pago'}</div>
            <button onClick={() => setShowReservePopup(false)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#444', fontSize: 13, cursor: 'pointer', padding: 8, fontFamily: 'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// âââ CHOOSE AUTH ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ChooseAuthScreen({ selectedRaffle, selectedNums, onLogin, onRegister, onBack }) {
  const r = selectedRaffle
  const pad = n => r ? String(n).padStart(r.number_range <= 100 ? 2 : 3, '0') : String(n).padStart(2, '0')
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', marginBottom: 14, border: `1px solid rgba(201,162,39,0.3)` }} className="house-float"><LogoSVG size={64} /></div>
          <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>La Casa De Las Dinamicas</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#1a1200,#2a1800)', border: `1px solid rgba(201,162,39,0.4)`, borderRadius: 16, padding: 16, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <GoldLine />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(201,162,39,0.15)', border: `1px solid rgba(201,162,39,0.3)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.gold} strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </div>
            <div><div style={{ color: C.gold, fontSize: 13, fontWeight: 800 }}>Tienes boletos guardados!</div><div style={{ color: C.muted, fontSize: 10 }}>{r?.title}</div></div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {(selectedNums || []).map(n => (<div key={n} style={{ background: 'rgba(201,162,39,0.12)', border: `1px solid rgba(201,162,39,0.3)`, borderRadius: 8, padding: '5px 10px', color: C.gold, fontSize: 14, fontWeight: 900 }}>#{pad(n)}</div>))}
          </div>
          <div style={{ background: 'rgba(201,162,39,0.08)', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: C.muted, fontSize: 11 }}>Se liberan en</span>
            <span style={{ color: '#E74C3C', fontSize: 13, fontWeight: 800 }}>24:00:00</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 6 }}>Para guardar tus numeros</div>
          <div style={{ color: C.muted, fontSize: 13 }}>Ingresa o crea tu cuenta en menos de 1 minuto</div>
        </div>
        <div onClick={onRegister} style={{ background: `linear-gradient(160deg,#1a1200,${C.card})`, border: `1px solid rgba(201,162,39,0.3)`, borderRadius: 16, padding: 18, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
          <GoldLine />
          <div style={{ width: 48, height: 48, background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          </div>
          <div style={{ flex: 1 }}><div style={{ color: '#fff', fontWeight: 900, fontSize: 15, marginBottom: 3 }}>Crear cuenta gratis</div><div style={{ color: C.muted, fontSize: 12 }}>$500 en saldo + 1.000 puntos de bienvenida</div></div>
          <div style={{ color: C.gold, fontSize: 18 }}>â</div>
        </div>
        <div onClick={onLogin} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 18, marginBottom: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(201,162,39,0.1)', border: `1px solid rgba(201,162,39,0.25)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.gold} strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </div>
          <div style={{ flex: 1 }}><div style={{ color: '#fff', fontWeight: 900, fontSize: 15, marginBottom: 3 }}>Ya tengo cuenta</div><div style={{ color: C.muted, fontSize: 12 }}>Iniciar sesion y reclamar mis numeros</div></div>
          <div style={{ color: '#666', fontSize: 18 }}>â</div>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', width: '100%', textAlign: 'center', fontSize: 13, fontFamily: 'inherit' }}>Volver al sorteo</button>
      </div>
    </div>
  )
}

// âââ HOME PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// âââ RAFFLE CARD â nuevo estilo negro + borde amarillo ââââââââââââââââââââââ
function RaffleCard({ r, onRaffle, featured }) {
  const prizes = Array.isArray(r.prizes) ? r.prizes : []
  const hasSociety = Array.isArray(r.society_numbers) && r.society_numbers.length > 0
  const hasPresale = r.presale_active && r.presale_price > 0
  const cardColor = r.card_color || '#E6BE00'
  const isFeatured = r.is_featured || featured
  return (
    <div onClick={() => onRaffle(r)} style={{ background: '#000', border: `1.5px solid ${isFeatured ? C.gold : cardColor+'60'}`, borderRadius: 16, padding: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${isFeatured ? C.gold : cardColor},transparent)` }}></div>
      {/* Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ background: '#27AE60', borderRadius: 999, padding: '3px 9px', color: '#fff', fontSize: 7, fontWeight: 800 }}>ACTIVO</span>
          {isFeatured && <span style={{ background: `rgba(230,190,0,0.15)`, border: `1px solid rgba(230,190,0,0.4)`, borderRadius: 999, padding: '3px 9px', color: C.gold, fontSize: 7, fontWeight: 800 }}>â­ DESTACADO</span>}
          {hasSociety && <span style={{ background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: 999, padding: '3px 8px', color: '#CE93D8', fontSize: 7, fontWeight: 700 }}>ð¥ Sociedad</span>}
          {hasPresale && <span style={{ background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: 999, padding: '3px 8px', color: '#CE93D8', fontSize: 7, fontWeight: 700 }}>Preventa</span>}
        </div>
        <span style={{ color: C.muted, fontSize: 10 }}>ð± {r.lottery_name}</span>
      </div>
      {/* Titulo */}
      <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px', lineHeight: 1.3 }}>{r.title}</h3>
      {/* Info fecha/loteria/numeros */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        {[['ð', new Date(r.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})], ['ð±', r.lottery_name], ['ð¢', `00 â ${String(r.number_range-1).padStart(2,'0')}`]].map(([ic,v]) => (
          <div key={ic} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '5px 6px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 9 }}>{ic}</div>
            <div style={{ color: '#fff', fontSize: 7, fontWeight: 700, marginTop: 1 }}>{v}</div>
          </div>
        ))}
      </div>
      {/* Premios â hasta 4 */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: C.muted, fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Premios</div>
        {prizes.slice(0, 4).map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{ fontSize: 11 }}>{medals[i]}</span>
            <span style={{ color: i === 0 ? '#fff' : C.muted, fontSize: i === 0 ? 12 : 11, fontWeight: i === 0 ? 700 : 400 }}>{p.amount || p}</span>
          </div>
        ))}
      </div>
      {/* Preventa */}
      {hasPresale && (
        <div style={{ background: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.2)', borderRadius: 8, padding: '6px 10px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#CE93D8', fontSize: 9, fontWeight: 700 }}>Preventa â</span>
          <span style={{ color: '#C9A0E8', fontSize: 14, fontWeight: 900 }}>{fmt(r.presale_price)}</span>
          <span style={{ color: C.muted, fontSize: 9, textDecoration: 'line-through' }}>{fmt(r.ticket_price)}</span>
        </div>
      )}
      <div style={{ height: 1, background: '#111', marginBottom: 10 }}></div>
      {/* Precio y CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: C.muted, fontSize: 9 }}>Valor del boleto</div>
          <div style={{ color: isFeatured ? C.gold : cardColor, fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{fmt(r.ticket_price)}</div>
        </div>
        <button style={{ background: C.gold, color: '#000', border: 'none', borderRadius: 10, padding: '11px 18px', fontWeight: 900, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Participar â</button>
      </div>
    </div>
  )
}



function HomePage({ raffles, displayName, appConfig, onRaffle, user, onHow, onWinners }) {
  const socials = [
    { key: 'whatsapp', label: 'WhatsApp', bg: '#075E54', icon: Icons.wa, url: appConfig.whatsapp },
    { key: 'canal', label: 'Canal', bg: '#128C7E', icon: Icons.wa, url: appConfig.canal, badge: true },
    { key: 'instagram', label: 'Instagram', bg: 'linear-gradient(45deg,#f09433,#dc2743,#bc1888)', icon: Icons.ig, url: appConfig.instagram },
    { key: 'facebook', label: 'Facebook', bg: '#1877F2', icon: Icons.fb, url: appConfig.facebook },
    { key: 'telegram', label: 'Telegram', bg: '#229ED9', icon: Icons.tg, url: appConfig.telegram },
  ].filter(s => s.url)
  const featuredRaffles = raffles.filter(r => r.is_featured)
  const otherRaffles = raffles.filter(r => !r.is_featured)

  return (
    <div style={S.content}>
      {/* BIENVENIDA compacta */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 900, lineHeight: 1.2, marginBottom: 3 }}>
          Bienvenido, <span style={{ color: C.gold }}>{displayName.split(' ')[0]}!</span>
        </div>
        <div style={{ color: C.muted, fontSize: 11 }}>Hoy puede ser tu dia de <span style={{ color: C.gold, fontWeight: 700 }}>SUERTE</span></div>
      </div>
      {/* Redes sociales â solo si configuradas */}
      {socials.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {socials.map(s => (
            <a key={s.key} href={s.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 34, height: 34, background: s.bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {s.icon}
                  {s.badge && <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, background: C.gold, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="#000" strokeWidth="3"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>}
                </div>
                <span style={{ color: C.muted, fontSize: 8, fontWeight: 600 }}>{s.label}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {appConfig.showHowItWorks && <button onClick={onHow} style={{ flex: 1, background: C.bg3, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '9px 10px', color: C.gold, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Como funciona?</button>}
        {appConfig.showWinners && <button onClick={onWinners} style={{ flex: 1, background: C.bg3, border: '1px solid rgba(39,174,96,0.2)', borderRadius: 10, padding: '9px 10px', color: C.green, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>ð Ganadores</button>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }}></div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 15, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Dinamicas Activas</h2>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }}></div>
      </div>

      {/* SORTEOS DESTACADOS */}
      {featuredRaffles.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }}></div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><span>â­</span> Destacados</h2>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {featuredRaffles.map(r => <RaffleCard key={r.id} r={r} onRaffle={onRaffle} featured />)}
          </div>
        </>
      )}
      {/* RESTO DE SORTEOS */}
      {otherRaffles.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }}></div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 13, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Mas Dinamicas</h2>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {otherRaffles.map(r => <RaffleCard key={r.id} r={r} onRaffle={onRaffle} />)}
          </div>
        </>
      )}
    </div>
  )
}

// âââ RAFFLE PAGE con SOCIEDAD visual âââââââââââââââââââââââââââââââââââââââââ
function RafflePage({ raffle: r, user, allReservedNums, selectedNums, setSelectedNums, onShowPopup, onBack, onSociety }) {
  const range = r.number_range || 100
  const cols = range <= 100 ? 10 : 20
  const prizes = Array.isArray(r.prizes) ? r.prizes : []
  const societyNums = Array.isArray(r.society_numbers) ? r.society_numbers : []
  const packages = Array.isArray(r.packages) ? r.packages : []
  const promotions = Array.isArray(r.promotions) ? r.promotions : []
  const [verifyName, setVerifyName] = useState('')
  const [verifyPhone, setVerifyPhone] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [societyModal, setSocietyModal] = useState(null)
  const [selectedPkg, setSelectedPkg] = useState(null)

  const pad = n => range <= 100 ? String(n).padStart(2, '0') : String(n).padStart(3, '0')
  const toggleNum = n => {
    if (societyNums.includes(n)) { setSocietyModal(n); return }
    setSelectedNums(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  }
  const luckyNum = () => {
    const avail = Array.from({ length: range }, (_, i) => i).filter(n => !allReservedNums.includes(n) && !selectedNums.includes(n) && !societyNums.includes(n))
    if (avail.length) setSelectedNums(prev => [...prev, avail[Math.floor(Math.random() * avail.length)]])
  }
  const getStatus = n => allReservedNums.includes(n) ? 'reserved' : societyNums.includes(n) ? 'society' : 'available'

  const activePromo = promotions.find(p => selectedNums.length >= p.buy)
  const freeNums = activePromo ? activePromo.get : 0

  const pricePerNum = r.presale_active && r.presale_price > 0 ? r.presale_price : r.ticket_price
  const totalPrice = selectedPkg ? selectedPkg.price : selectedNums.length * pricePerNum

  async function verifyTicket() {
    if (!verifyName && !verifyPhone) return
    let ids = []
    if (verifyPhone) { const { data } = await supabase.from('users_profile').select('id').ilike('phone', `%${verifyPhone}%`); ids = (data||[]).map(u => u.id) }
    else { const { data } = await supabase.from('users_profile').select('id').ilike('full_name', `%${verifyName}%`); ids = (data||[]).map(u => u.id) }
    if (!ids.length) { setVerifyResult([]); return }
    const { data } = await supabase.from('tickets').select('*').eq('raffle_id', r.id).in('user_id', ids)
    setVerifyResult(data || [])
  }

  const shareWA = () => window.open(`https://wa.me/?text=${encodeURIComponent(`La Casa De Las Dinamicas\n\n${r.title}\nBoleto: ${fmt(r.ticket_price)}\nSorteo: ${fmtDate(r.raffle_date)}\n\nAparta tu numero:\nwww.lacasadelasdinamicas.com`)}`)

  return (
    <div style={{ paddingBottom: 88 }}>
      <div style={{ background: `linear-gradient(180deg,#1a1200 0%,${C.bg} 100%)`, padding: '16px 16px 0', borderBottom: `1px solid ${C.cardBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>â Volver</button>
          <button onClick={shareWA} style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 8, color: C.green, cursor: 'pointer', padding: '6px 12px', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>Compartir</button>
        </div>
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, overflow: 'hidden', margin: '0 auto 10px', border: `1px solid rgba(201,162,39,0.3)` }}><LogoSVG size={52} /></div>
          <h1 style={{ color: '#fff', fontSize: 16, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px', lineHeight: 1.3 }}>{r.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {r.presale_active && r.presale_price > 0 ? (
              <div style={{ background: 'rgba(155,89,182,0.1)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: 999, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: C.muted, fontSize: 11, textDecoration: 'line-through' }}>{fmt(r.ticket_price)}</span>
                <span style={{ color: '#C9A0E8', fontSize: 16, fontWeight: 900 }}>{fmt(r.presale_price)}</span>
                <span style={{ background: C.purple, borderRadius: 999, padding: '1px 7px', color: '#fff', fontSize: 8, fontWeight: 700 }}>PREVENTA</span>
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,162,39,0.08)', border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 999, padding: '6px 18px' }}>
                <span style={{ color: C.muted, fontSize: 11 }}>Valor del boleto</span>
                <span style={{ color: C.gold, fontSize: 16, fontWeight: 900 }}>{fmt(r.ticket_price)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premios scroll */}
      <div style={{ overflowX: 'auto', padding: '12px 16px', display: 'flex', gap: 10, scrollbarWidth: 'none' }}>
        {prizes.map((p, i) => (
          <div key={i} style={{ flexShrink: 0, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: '10px 16px', minWidth: 140, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <GoldLine />
            <div style={{ fontSize: 24, marginBottom: 4 }}>{medals[i]}</div>
            <div style={{ color: C.muted, fontSize: 9, textTransform: 'uppercase', marginBottom: 4 }}>Premio {i+1}</div>
            <div style={{ color: C.gold, fontSize: 12, fontWeight: 800 }}>{p.amount || p.title || p}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* PAQUETES */}
        {r.packages_active && packages.length > 0 && (
          <div style={{ ...S.card, marginBottom: 14 }}>
            <GoldLine />
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Paquetes con descuento</div>
            <div style={{ display: 'flex', gap: 8, overflow: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
              <div onClick={() => setSelectedPkg(null)} style={{ flexShrink: 0, background: !selectedPkg ? 'rgba(201,162,39,0.15)' : '#1a1a1a', border: `1px solid ${!selectedPkg ? C.gold : 'rgba(255,255,255,0.07)'}`, borderRadius: 11, padding: '10px 14px', cursor: 'pointer', minWidth: 68, textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: 9, fontWeight: 700, marginBottom: 3 }}>Individual</div>
                <div style={{ color: C.gold, fontSize: 13, fontWeight: 900 }}>{fmt(pricePerNum)}</div>
              </div>
              {packages.map((pkg, i) => {
                const isSelected = selectedPkg?.qty === pkg.qty
                const savings = (pkg.qty * pricePerNum) - pkg.price
                return (
                  <div key={i} onClick={() => { setSelectedPkg(pkg); setSelectedNums(prev => prev.slice(0, pkg.qty)) }} style={{ flexShrink: 0, background: isSelected ? 'rgba(201,162,39,0.15)' : '#1a1a1a', border: `${isSelected ? '2px' : '1px'} solid ${isSelected ? C.gold : 'rgba(255,255,255,0.07)'}`, borderRadius: 11, padding: '10px 14px', cursor: 'pointer', minWidth: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    {isSelected && <GoldLine />}
                    <div style={{ background: C.green, borderRadius: 999, padding: '1px 5px', color: '#fff', fontSize: 6, fontWeight: 700, marginBottom: 3, display: 'inline-block' }}>-{Math.round(savings/pkg.qty*100/pricePerNum)}%</div>
                    <div style={{ color: '#fff', fontSize: 9, fontWeight: 700, marginBottom: 3 }}>{pkg.qty} boletos</div>
                    <div style={{ color: C.gold, fontSize: 13, fontWeight: 900 }}>{fmt(pkg.price)}</div>
                    <div style={{ color: C.muted, fontSize: 7, textDecoration: 'line-through' }}>{fmt(pkg.qty * pricePerNum)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PROMO ACTIVA */}
        {activePromo && (
          <div style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 11, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>ð</span>
            <div><div style={{ color: C.green, fontSize: 11, fontWeight: 800 }}>{activePromo.label}</div><div style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>{activePromo.get} numero(s) gratis seran asignados automaticamente</div></div>
          </div>
        )}

        {/* GRILLA NUMEROS */}
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: 0 }}>Selecciona tu numero</h3>
              <div style={{ color: C.green, fontSize: 10, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, background: C.green, borderRadius: '50%', display: 'inline-block' }} className="pulse"></span>
                En vivo
              </div>
            </div>
            <button onClick={luckyNum} style={{ background: 'rgba(201,162,39,0.1)', border: `1px solid rgba(201,162,39,0.25)`, borderRadius: 8, color: C.gold, fontSize: 11, fontWeight: 700, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>Al azar</button>
          </div>

          {/* LEYENDA */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {[['#0d0d0d','#1a1a1a','#333','Disponible'],['rgba(201,162,39,0.2)',C.gold,C.gold,'Seleccionado'],['#050505','#111','#1a1a1a','Apartado']].map(([bg,border,color,label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 13, height: 13, background: bg, border: `1px solid ${border}`, borderRadius: 3 }}></div><span style={{ fontSize: 10, color: C.muted }}>{label}</span></div>
            ))}
            {societyNums.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 13, height: 13, background: 'linear-gradient(135deg,#2a0d4a,#3d1a6e)', border: '1px solid #9B59B6', borderRadius: 3 }}></div>
                <span style={{ fontSize: 10, color: C.purple, fontWeight: 700 }}>ð¥ Sociedad â mitad precio!</span>
              </div>
            )}
          </div>

          {/* GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}>
            {Array.from({ length: range }, (_, n) => {
              const isSoc = societyNums.includes(n)
              const isRes = allReservedNums.includes(n)
              const isSel = selectedNums.includes(n)

              if (isSoc) return (
                <div key={n} onClick={() => setSocietyModal(n)} className="society-glow society-float"
                  style={{ aspectRatio: 1, borderRadius: 6, background: 'linear-gradient(135deg,#2a0d4a,#3d1a6e)', border: '1.5px solid #9B59B6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,160,232,0.8),transparent)' }}></div>
                  <div style={{ fontSize: range <= 100 ? 8 : 7, fontWeight: 900, color: '#C9A0E8', lineHeight: 1 }}>{pad(n)}</div>
                  <div style={{ fontSize: 7, lineHeight: 1, marginTop: 1 }}>ð¥</div>
                </div>
              )
              if (isRes) return <div key={n} style={{ aspectRatio: 1, border: '1px solid #111', borderRadius: 6, background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, cursor: 'not-allowed' }}>ð</div>
              if (isSel) return <div key={n} onClick={() => toggleNum(n)} style={{ aspectRatio: 1, border: `2px solid ${C.gold}`, borderRadius: 6, background: 'rgba(201,162,39,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: C.gold, cursor: 'pointer' }}>{pad(n)}</div>
              return <div key={n} onClick={() => toggleNum(n)} style={{ aspectRatio: 1, border: '1px solid #1a1a1a', borderRadius: 6, background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#333', cursor: 'pointer' }}>{pad(n)}</div>
            })}
          </div>

          {selectedNums.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.15)`, borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: C.muted, fontSize: 12 }}>Seleccionados</span>
                  <span style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>{selectedNums.map(n => pad(n)).join(' Â· ')}</span>
                </div>
                {freeNums > 0 && <div style={{ color: C.green, fontSize: 11, marginBottom: 6 }}>+ {freeNums} numero(s) GRATIS por la promo!</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: C.muted, fontSize: 12 }}>Total</span>
                  <span style={{ color: C.gold, fontSize: 22, fontWeight: 900 }}>{fmt(totalPrice)}</span>
                </div>
              </div>
              <button onClick={onShowPopup} style={S.btnGold}>Apartar mis numeros</button>
            </div>
          )}
        </div>

        {/* SECCION SOCIEDAD */}
        {societyNums.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#0f0619,#1a0d2a)', border: '1px solid rgba(155,89,182,0.35)', borderRadius: 18, padding: 18, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#9B59B6,#C9A0E8,#9B59B6,transparent)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#3d1a6e,#6c3db5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>ð¥</div>
              <div><div style={{ color: '#C9A0E8', fontSize: 13, fontWeight: 900 }}>Numeros en Sociedad</div><div style={{ color: '#7b5cad', fontSize: 9, marginTop: 1 }}>Compra la mitad â gana todo el premio</div></div>
            </div>
            <div style={{ background: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.18)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[['Tu pagas','Solo el 50% del valor','#C9A0E8'],['Buscamos','Otra persona para completar el boleto','#9B59B6'],['Si gana','AMBOS reciben el premio completo!','#27AE60']].map(([t,d,c]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, background: `${c}20`, border: `1px solid ${c}40`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><div style={{ width: 5, height: 5, background: c, borderRadius: '50%' }}></div></div>
                    <div><span style={{ color: c, fontSize: 9, fontWeight: 700 }}>{t}: </span><span style={{ color: '#888', fontSize: 9 }}>{d}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ color: '#7b5cad', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Numeros disponibles ({societyNums.length})</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {societyNums.map(n => (
                <div key={n} onClick={() => setSocietyModal(n)} className="society-glow society-float"
                  style={{ background: 'linear-gradient(135deg,#2a0d4a,#3d1a6e)', border: '1.5px solid #9B59B6', borderRadius: 10, padding: '8px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                  <div style={{ color: '#C9A0E8', fontSize: 16, fontWeight: 900 }}>{pad(n)}</div>
                  <div style={{ color: '#9B59B6', fontSize: 8, fontWeight: 700 }}>{fmt(r.ticket_price / 2)}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setSocietyModal(societyNums[0])} style={S.btnPurple}>
              <span>ð¥</span> Unirme a un numero en sociedad
            </button>
          </div>
        )}

        {/* VERIFICAR BOLETO */}
        <div style={{ ...S.card, marginBottom: 14 }}>
          <GoldLine />
          <h3 style={{ color: C.gold, fontWeight: 900, fontSize: 14, margin: '0 0 4px', textAlign: 'center' }}>Verificar mi boleto</h3>
          <p style={{ color: C.muted, fontSize: 12, margin: '0 0 14px', textAlign: 'center' }}>Consulta si tu numero esta correctamente apartado</p>
          <label style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Nombre del participante</label>
          <input value={verifyName} onChange={e => setVerifyName(e.target.value)} placeholder="Ej: Carlos Rodriguez" style={{ marginBottom: 8 }} />
          <div style={{ textAlign: 'center', color: '#333', fontSize: 11, margin: '6px 0' }}>â o â</div>
          <label style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Celular / WhatsApp</label>
          <input value={verifyPhone} onChange={e => setVerifyPhone(e.target.value)} placeholder="3001234567" style={{ marginBottom: 14 }} />
          <button onClick={verifyTicket} style={S.btnGold}>Verificar boleto</button>
          {verifyResult !== null && (
            <div style={{ marginTop: 14 }}>
              {verifyResult.length === 0 ? <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: '16px 0' }}>No se encontraron boletos con esos datos</div>
                : verifyResult.map((t, i) => (
                  <div key={i} style={{ background: C.bg3, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 14, marginBottom: 8 }}>
                    <div style={{ color: C.gold, fontSize: 18, fontWeight: 900, marginBottom: 4 }}>#{(t.numbers||[]).map(n => pad(n)).join(' Â· ')}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={S.badge(t.status === 'paid' ? 'green' : 'dim')}>{t.status === 'paid' ? 'Pago confirmado' : 'Pendiente'}</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{fmt(t.total_amount)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* MODAL SOCIEDAD */}
      {societyModal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setSocietyModal(null)}>
          <div className="slide-up" style={{ background: '#111', borderRadius: '22px 22px 0 0', padding: 24, width: '100%', maxWidth: 500, border: '1px solid rgba(155,89,182,0.35)', borderBottom: 'none', position: 'relative', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#9B59B6,#C9A0E8,#9B59B6,transparent)' }}></div>
            <div style={{ width: 40, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 18px' }}></div>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg,#2a0d4a,#3d1a6e)', border: '2px solid #9B59B6', borderRadius: 20, padding: '16px 28px', marginBottom: 10 }} className="society-glow">
                <div style={{ color: '#7b5cad', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Numero en Sociedad</div>
                <div style={{ color: '#C9A0E8', fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{pad(societyModal)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <span style={{ fontSize: 14 }}>ð¥</span>
                  <span style={{ color: '#9B59B6', fontSize: 10, fontWeight: 700 }}>{r.title}</span>
                </div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,rgba(155,89,182,0.08),rgba(155,89,182,0.03))', border: '1px solid rgba(155,89,182,0.2)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, background: '#555', borderRadius: '50%' }}></div><span style={{ color: '#888', fontSize: 11 }}>Valor real del boleto</span></div>
                <span style={{ color: '#555', fontSize: 12, fontWeight: 700, textDecoration: 'line-through' }}>{fmt(r.ticket_price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, background: C.purple, borderRadius: '50%' }}></div><span style={{ color: '#C9A0E8', fontSize: 11, fontWeight: 700 }}>Tu pagas (50%)</span></div>
                <span style={{ color: C.purple, fontSize: 20, fontWeight: 900 }}>{fmt(r.ticket_price / 2)}</span>
              </div>
              <div style={{ background: 'rgba(39,174,96,0.08)', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 14 }}>ð</span>
                <div><div style={{ color: C.green, fontSize: 9, fontWeight: 700 }}>Si el numero gana, AMBOS reciben el premio completo</div><div style={{ color: C.muted, fontSize: 8, marginTop: 1 }}>{prizes[0]?.amount || 'Premio principal'}</div></div>
              </div>
            </div>
            <button onClick={() => { setSocietyModal(null); if(onSociety) onSociety(societyModal) }} style={{ ...S.btnPurple, marginBottom: 10 }}>
              <span>ð¥</span> Unirme como socio â {fmt(r.ticket_price / 2)}
            </button>
            <button onClick={() => setSocietyModal(null)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#444', fontSize: 13, cursor: 'pointer', padding: 8, fontFamily: 'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
// âââ COMO FUNCIONA ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function HowItWorksPage({ onBack, onRegister }) {
  const steps = [
    { n:'1', icon:'ð°', title:'Elige tu dinamica', desc:'Explora las dinamicas activas. Cada una tiene sus premios, fecha de sorteo y valor del boleto.' },
    { n:'2', icon:'ð¢', title:'Aparta tu numero', desc:'Selecciona el numero que quieres y apartalo en tiempo real antes de que lo tome otra persona.' },
    { n:'3', icon:'ð³', title:'Confirma tu pago', desc:'Paga por Nequi, Daviplata o transferencia. Envia tu comprobante por WhatsApp o desde la app.' },
    { n:'4', icon:'ð', title:'Gana tu premio!', desc:'El sorteo se realiza en la fecha indicada con la loteria oficial. Si tu numero coincide, ganas!' },
  ]
  const faqs = [
    ['Es seguro participar?','Si. Todos los sorteos se realizan con loterias oficiales y publicamos los resultados en vivo.'],
    ['Cuanto tiempo tengo para pagar?','Tienes 24 horas despues de apartar tu numero para enviar el comprobante de pago.'],
    ['Como recibo mi premio?','Nos contactamos contigo directamente por WhatsApp para coordinar la entrega.'],
    ['Puedo apartar varios numeros?','Depende del sorteo. Cada dinamica tiene configurado el maximo de boletos por persona.'],
  ]
  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:20, fontSize:14, padding:0, fontFamily:'inherit' }}>â Volver</button>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ width:64, height:64, borderRadius:16, overflow:'hidden', margin:'0 auto 16px', border:`1px solid rgba(201,162,39,0.3)` }} className="house-float"><LogoSVG size={64} /></div>
        <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, margin:'0 0 8px' }}>Como funciona?</h1>
        <p style={{ color:C.muted, fontSize:14, margin:0 }}>Participar es muy facil, solo sigue estos pasos</p>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display:'flex', gap:14, marginBottom:16, position:'relative' }}>
          {i < steps.length-1 && <div style={{ position:'absolute', left:19, top:44, bottom:-16, width:1, background:'rgba(201,162,39,0.2)' }}></div>}
          <div style={{ width:40, height:40, background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#000', fontSize:16, flexShrink:0, zIndex:1 }}>{s.n}</div>
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:'14px 16px', flex:1, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:14, marginBottom:4 }}>{s.title}</div>
            <div style={{ color:C.muted, fontSize:12, lineHeight:1.6 }}>{s.desc}</div>
          </div>
        </div>
      ))}
      <div style={{ textAlign:'center', margin:'24px 0 14px', color:C.gold, fontSize:14, fontWeight:800 }}>Preguntas frecuentes</div>
      {faqs.map(([q,a],i) => (
        <div key={i} style={{ ...S.card, marginBottom:10, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
          <div style={{ color:'#fff', fontSize:13, fontWeight:700, marginBottom:5 }}>{q}</div>
          <div style={{ color:C.muted, fontSize:12, lineHeight:1.6 }}>{a}</div>
        </div>
      ))}
      <div style={{ background:`linear-gradient(135deg,rgba(201,162,39,0.1),rgba(201,162,39,0.04))`, border:`1px solid rgba(201,162,39,0.2)`, borderRadius:16, padding:22, textAlign:'center', marginTop:10 }}>
        <div style={{ fontSize:34, marginBottom:10 }}>ð</div>
        <div style={{ color:C.gold, fontSize:15, fontWeight:800, marginBottom:4 }}>Registrate y recibe bono!</div>
        <div style={{ color:C.muted, fontSize:13, marginBottom:18 }}>$500 en saldo + 1.000 puntos de fidelidad al crear tu cuenta</div>
        <button onClick={onRegister} style={S.btnGold}>Crear cuenta gratis</button>
      </div>
    </div>
  )
}

// âââ GANADORES ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function WinnersPage({ onBack, onRaffle }) {
  const [winners, setWinners] = useState([])
  useEffect(() => {
    supabase.from('tickets').select('*, users_profile(full_name,city), raffles(title,prizes)').eq('status','winner').order('created_at',{ascending:false}).limit(20)
      .then(({ data }) => { if (data?.length > 0) setWinners(data) })
  }, [])
  const mock = [
    { name:'C.R.', city:'Bogota', prize:'Moto Yamaha MT-03', number:'07', date:'15 feb 2025', color:'#27AE60' },
    { name:'M.G.', city:'Medellin', prize:'Viaje a Cancun', number:'34', date:'1 ene 2025', color:'#3498DB' },
    { name:'A.P.', city:'Cali', prize:'$500.000 en efectivo', number:'91', date:'15 dic 2024', color:'#E67E22' },
    { name:'L.T.', city:'Barranquilla', prize:'iPhone 16 Pro', number:'12', date:'1 dic 2024', color:'#9B59B6' },
    { name:'D.M.', city:'Bogota', prize:'$1.000.000 en efectivo', number:'55', date:'15 nov 2024', color:'#E74C3C' },
  ]
  const list = winners.length > 0
    ? winners.map((w,i) => ({ name:(w.users_profile?.full_name||'Ganador').split(' ').map(p=>p[0]+'.').join(''), city:w.users_profile?.city||'Colombia', prize:(w.raffles?.prizes?.[0]?.amount||w.raffles?.title||'Premio'), number:(w.numbers||[])[0]||'?', date:fmtDate(w.created_at), color:['#27AE60','#3498DB','#E67E22','#9B59B6','#E74C3C'][i%5] }))
    : mock

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:20, fontSize:14, padding:0, fontFamily:'inherit' }}>â Volver</button>
      <div style={{ textAlign:'center', marginBottom:26 }}>
        <div style={{ fontSize:52, marginBottom:14 }}>ð</div>
        <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, margin:'0 0 8px' }}>Ganadores de La Casa</h1>
        <p style={{ color:C.muted, fontSize:14, margin:0 }}>Personas reales que ganaron sus premios</p>
      </div>
      {list.map((w,i) => (
        <div key={i} style={{ background:`linear-gradient(160deg,#1a1200,${C.card})`, border:`1px solid ${C.cardBorder}`, borderRadius:16, padding:16, marginBottom:12, display:'flex', gap:14, alignItems:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
          <div style={{ width:50, height:50, background:`${w.color}20`, border:`2px solid ${w.color}40`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:22 }}>ð</div>
          <div style={{ flex:1 }}>
            <div style={{ color:'#fff', fontWeight:800, fontSize:14 }}>{w.name}</div>
            <div style={{ color:C.gold, fontSize:13, fontWeight:700, margin:'2px 0' }}>{w.prize}</div>
            <div style={{ display:'flex', gap:10, fontSize:10, color:C.muted }}>
              <span>ð {w.city}</span><span>ð {w.date}</span>
            </div>
          </div>
          <div style={{ background:`${w.color}18`, border:`1px solid ${w.color}30`, borderRadius:10, padding:'6px 12px', textAlign:'center' }}>
            <div style={{ color:C.muted, fontSize:7, textTransform:'uppercase' }}>Numero</div>
            <div style={{ color:w.color, fontSize:20, fontWeight:900 }}>{w.number}</div>
          </div>
        </div>
      ))}
      <div style={{ background:'linear-gradient(135deg,rgba(39,174,96,0.08),rgba(39,174,96,0.03))', border:'1px solid rgba(39,174,96,0.2)', borderRadius:16, padding:22, textAlign:'center', marginTop:10 }}>
        <div style={{ color:C.green, fontSize:15, fontWeight:800, marginBottom:5 }}>Tu puedes ser el proximo ganador!</div>
        <div style={{ color:C.muted, fontSize:13, marginBottom:18 }}>Aparta tu numero hoy y participa</div>
        <button onClick={onRaffle} style={S.btnGold}>Ver dinamicas activas</button>
      </div>
    </div>
  )
}

// âââ PROFILE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ProfilePage({ user, profile, myTickets, onLogout, onLogin, onRegister, isAdmin, onAdmin, onRefresh, onSupport, appConfig, pwa }) {
  const [tab, setTab] = useState(0)

  if (!user) return (
    <div style={{ ...S.content, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:60, textAlign:'center' }}>
      <div style={{ width:72, height:72, borderRadius:16, overflow:'hidden', marginBottom:16 }} className="house-float"><LogoSVG size={72} /></div>
      <h2 style={{ color:'#fff', fontWeight:900, marginBottom:8 }}>Mi Cuenta</h2>
      <p style={{ color:C.muted, marginBottom:28, fontSize:14 }}>Inicia sesion para ver tus boletos</p>
      <button onClick={onLogin} style={{ ...S.btnGold, maxWidth:280 }}>Ingresar a La Casa</button>
      <button onClick={onRegister} style={{ ...S.btnOutline, maxWidth:280, marginTop:12 }}>Crear cuenta gratis</button>
    </div>
  )

  const name = profile?.full_name || user.email || ''
  const phone = profile?.phone || ''

  // Agrupar boletos por raffle_id
  const groupTickets = (tickets) => {
    const groups = {}
    tickets.forEach(t => {
      const key = t.raffle_id || t.raffles?.id || t.id
      if (!groups[key]) groups[key] = { raffle: t.raffles, tickets: [], status: t.status }
      groups[key].tickets.push(t)
    })
    return Object.values(groups)
  }

  const reserved = myTickets.filter(t => t.status === 'reserved')
  const paid     = myTickets.filter(t => t.status === 'paid')
  const history  = myTickets.filter(t => !['reserved','paid'].includes(t.status))

  const tabTickets = tab === 0 ? myTickets : tab === 1 ? reserved : tab === 2 ? paid : history
  const groupedTickets = groupTickets(tabTickets)

  const reservedGroups = groupTickets(reserved)
  const paidGroups     = groupTickets(paid)
  const historyGroups  = groupTickets(history)

  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      {/* HEADER */}
      <div style={{ background:'#111', padding:'13px 16px', borderBottom:'1px solid #1a1a1a' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:40, height:40, background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:'#000', border:`2px solid rgba(230,190,0,0.25)`, flexShrink:0 }}>
              {name[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ color:'#fff', fontSize:15, fontWeight:900 }}>Hola, <span style={{ color:C.gold }}>{name.split(' ')[0]}</span></div>
              <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:999, padding:'1px 9px', display:'inline-block', marginTop:3 }}>
                <span style={{ color:'#777', fontSize:8, fontWeight:600 }}>{isAdmin ? 'Administrador' : 'Jugador'}</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:7, alignItems:'center' }}>
            {isAdmin && <button onClick={onAdmin} style={{ background:'rgba(230,190,0,0.1)', border:'1px solid rgba(230,190,0,0.25)', borderRadius:7, padding:'5px 10px', color:C.gold, fontSize:9, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Admin</button>}
            <button onClick={onLogout} style={{ width:30, height:30, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#C0392B" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:'12px 16px 90px' }}>
        {/* DINERO + PUNTOS */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
          <div style={{ background:'linear-gradient(135deg,#0d1628,#0a1220)', border:'1px solid rgba(41,128,185,0.3)', borderRadius:13, padding:'11px 13px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#5DADE2" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span style={{ color:'#5DADE2', fontSize:8, fontWeight:700, textTransform:'uppercase' }}>Mi Dinero</span>
            </div>
            <div style={{ color:'#fff', fontSize:20, fontWeight:900, marginBottom:6 }}>{fmt(profile?.credits || 0)}</div>
            <div style={{ background:'#E67E22', borderRadius:6, padding:'4px 9px', color:'#fff', fontSize:7, fontWeight:800, display:'inline-block', cursor:'pointer' }}>+ Recargar</div>
          </div>
          <div style={{ background:'#0d0d0d', border:`1px solid rgba(230,190,0,0.25)`, borderRadius:13, padding:'11px 13px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              <span style={{ color:C.gold, fontSize:8, fontWeight:700, textTransform:'uppercase' }}>Mis Puntos</span>
            </div>
            <div style={{ color:'#fff', fontSize:20, fontWeight:900, marginBottom:6 }}>{(profile?.points || 0).toLocaleString()}</div>
            <div style={{ color:'#444', fontSize:7 }}>pts disponibles</div>
          </div>
        </div>

        {/* PWA BANNER compacto */}
        {pwa && !pwa.isInstalled && (
          <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:11, padding:'9px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:9, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ width:28, height:28, borderRadius:7, overflow:'hidden', flexShrink:0, border:`1px solid rgba(230,190,0,0.25)` }}><LogoSVG size={28} /></div>
            <div style={{ flex:1 }}><div style={{ color:'#fff', fontSize:10, fontWeight:800 }}>Instala La Casa</div><div style={{ color:C.muted, fontSize:8 }}>Offline + notificaciones</div></div>
            {pwa.canInstall
              ? <button onClick={pwa.install} style={{ background:C.gold, border:'none', borderRadius:7, padding:'6px 10px', color:'#000', fontSize:8, fontWeight:800, cursor:'pointer', flexShrink:0, fontFamily:'inherit' }}>Instalar</button>
              : <div style={{ color:C.muted, fontSize:8, flexShrink:0, maxWidth:70, textAlign:'right', lineHeight:1.4 }}>Menu â Agregar pantalla</div>
            }
          </div>
        )}

        {/* TABS */}
        <div style={{ background:'#111', borderRadius:11, padding:3, display:'flex', gap:2, marginBottom:14 }}>
          {[['Todo', myTickets.length], ['Reservas', reserved.length], ['Pagados', paid.length], ['Historial', history.length]].map(([lb, count], i) => (
            <button key={lb} onClick={() => setTab(i)} style={{ flex:1, padding:'7px 2px', borderRadius:8, border:'none', textAlign:'center', background:tab===i?C.gold:'transparent', cursor:'pointer', fontFamily:'inherit', position:'relative' }}>
              <span style={{ color:tab===i?'#000':C.muted, fontSize:8, fontWeight:tab===i?800:500 }}>{lb}</span>
              {count > 0 && <span style={{ position:'absolute', top:2, right:3, background:tab===i?'rgba(0,0,0,0.25)':'rgba(230,190,0,0.2)', borderRadius:999, width:13, height:13, display:'flex', alignItems:'center', justifyContent:'center', fontSize:6, fontWeight:700, color:tab===i?'#000':C.gold }}>{count}</span>}
            </button>
          ))}
        </div>

        {/* TITULO MIS BOLETOS */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <div style={{ width:3, height:18, background:C.gold, borderRadius:2 }}></div>
          <span style={{ color:'#fff', fontSize:14, fontWeight:900, textTransform:'uppercase', letterSpacing:.5 }}>Mis Boletos</span>
        </div>

        {myTickets.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:C.muted }}>
            <div style={{ fontSize:44, marginBottom:12 }}>ðï¸</div>
            <div style={{ color:'#fff', fontSize:14, fontWeight:600, marginBottom:6 }}>Aun no tienes boletos</div>
            <div style={{ fontSize:12 }}>Participa en una dinamica!</div>
          </div>
        ) : (
          <>
            {(tab === 0 || tab === 1) && reservedGroups.length > 0 && (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                  <div style={{ width:7, height:7, background:C.gold, borderRadius:'50%' }} className="pulse"></div>
                  <span style={{ color:C.gold, fontSize:11, fontWeight:800, textTransform:'uppercase' }}>Reservados ({reserved.length})</span>
                </div>
                {reservedGroups.map((g, i) => <RaffleTicketGroup key={i} group={g} status="reserved" profile={profile} appConfig={appConfig} onRefresh={onRefresh} onSupport={onSupport} />)}
              </>
            )}
            {(tab === 0 || tab === 2) && paidGroups.length > 0 && (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, marginTop: tab===0 && reservedGroups.length>0 ? 14 : 0 }}>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#27AE60" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ color:'#27AE60', fontSize:11, fontWeight:800, textTransform:'uppercase' }}>Pagados ({paid.length})</span>
                </div>
                {paidGroups.map((g, i) => <RaffleTicketGroup key={i} group={g} status="paid" profile={profile} appConfig={appConfig} onRefresh={onRefresh} onSupport={onSupport} />)}
              </>
            )}
            {(tab === 0 || tab === 3) && historyGroups.length > 0 && (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, marginTop: tab===0 ? 14 : 0 }}>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#555" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ color:'#555', fontSize:11, fontWeight:800, textTransform:'uppercase' }}>Historial ({history.length})</span>
                </div>
                {historyGroups.map((g, i) => <RaffleTicketGroup key={i} group={g} status="finished" profile={profile} appConfig={appConfig} onRefresh={onRefresh} onSupport={onSupport} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// âââ RAFFLE TICKET GROUP â todos los numeros del mismo sorteo en una tarjeta ââ
function RaffleTicketGroup({ group, status, profile, appConfig, onRefresh, onSupport }) {
  const { raffle, tickets } = group
  const allNums = tickets.flatMap(t => t.numbers || [])
  const totalAmount = tickets.reduce((s, t) => s + (t.total_amount || 0), 0)
  const firstTicket = tickets[0] || {}
  const expires = firstTicket.expires_at ? new Date(firstTicket.expires_at) : null
  const hoursLeft = expires ? Math.max(0, Math.floor((expires - Date.now()) / 3600000)) : null
  const isReserved = status === 'reserved'
  const isPaid = status === 'paid'
  const isFinished = status === 'finished'

  const borderColor = isPaid ? 'rgba(39,174,96,0.35)' : isFinished ? '#1a1a1a' : 'rgba(230,190,0,0.35)'
  const lineColor = isPaid ? '#27AE60' : isFinished ? '#333' : C.gold
  const numColor = isPaid ? '#27AE60' : isFinished ? '#444' : C.gold
  const labelColor = isPaid ? '#27AE60' : isFinished ? '#555' : C.gold

  // Build WA message with all numbers
  const numsStr = allNums.map(n => '#'+String(n).padStart(2,'0')).join(', ')
  const waNum = (appConfig?.paymentWhatsapp || appConfig?.payment_whatsapp || '').replace(/\D/g,'')
  const waMsg = 'Hola! Quiero pagar mis boletos:%0A%0ASorteo: '+(raffle?.title||'')+'%0ANumeros: '+numsStr+'%0ATotal: '+fmt(totalAmount)+'%0AFecha: '+(raffle?.raffle_date?new Date(raffle.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}):'')+'%0ALoteria: '+(raffle?.lottery_name||'')+'%0ANombre: '+(profile?.full_name||'')
  const waUrl = waNum ? 'https://wa.me/'+waNum+'?text='+encodeURIComponent(waMsg) : null

  return (
    <div style={{ background:'#0d0d0d', border:`1px solid ${borderColor}`, borderRadius:14, padding:14, marginBottom:10, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${lineColor},transparent)` }}></div>

      {/* HEADER tarjeta */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke={labelColor} strokeWidth="2"><rect x="1" y="6" width="22" height="14" rx="2"/><path d="M16 2H8v4h8z"/></svg>
            <span style={{ color:labelColor, fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:.5 }}>Sorteo</span>
          </div>
          <div style={{ color:'#fff', fontSize:13, fontWeight:900, textTransform:'uppercase', lineHeight:1.25 }}>{raffle?.title || 'Sorteo'}</div>
          <div style={{ color:'#555', fontSize:9, marginTop:3 }}>
            ð {raffle?.raffle_date ? new Date(raffle.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}) : ''} Â· ð± {raffle?.lottery_name || ''}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          {isReserved && hoursLeft !== null && (
            <div style={{ background:hoursLeft<3?'rgba(231,76,60,0.15)':'rgba(230,190,0,0.1)', border:`1px solid ${hoursLeft<3?'rgba(231,76,60,0.3)':'rgba(230,190,0,0.25)'}`, borderRadius:999, padding:'3px 8px', marginBottom:3 }}>
              <span style={{ color:hoursLeft<3?'#E74C3C':C.gold, fontSize:8, fontWeight:700 }}>{hoursLeft < 1 ? 'Vence pronto!' : 'Vence en '+hoursLeft+'h'}</span>
            </div>
          )}
          {isPaid && (
            <div style={{ background:'rgba(39,174,96,0.1)', border:'1px solid rgba(39,174,96,0.3)', borderRadius:999, padding:'3px 8px', display:'flex', alignItems:'center', gap:4 }}>
              <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#27AE60" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ color:'#27AE60', fontSize:8, fontWeight:700 }}>Confirmado</span>
            </div>
          )}
          {isReserved && <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:5, height:5, background:C.gold, borderRadius:'50%' }} className="pulse"></div><span style={{ color:C.gold, fontSize:8, fontWeight:700 }}>Reservado</span></div>}
        </div>
      </div>

      {/* NUMEROS â todos juntos */}
      <div style={{ marginBottom:10 }}>
        <div style={{ color:'#444', fontSize:8, textTransform:'uppercase', letterSpacing:.8, marginBottom:8 }}>Tus numeros ({allNums.length})</div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {allNums.map((n, i) => (
            <div key={i} style={{ background:isPaid?'rgba(39,174,96,0.08)':isFinished?'rgba(255,255,255,0.03)':'rgba(230,190,0,0.08)', border:`1.5px solid ${isPaid?'rgba(39,174,96,0.35)':isFinished?'#2a2a2a':'rgba(230,190,0,0.4)'}`, borderRadius:10, padding:'7px 12px', textAlign:'center' }}>
              <div style={{ color:numColor, fontSize:26, fontWeight:900, lineHeight:1 }}>{'#'+String(n).padStart(2,'0')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PREMIO + TOTAL */}
      <div style={{ background:'#111', borderRadius:9, padding:'9px 11px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ fontSize:12 }}>ð°</span>
          <span style={{ color:'#666', fontSize:9 }}>Premio:</span>
          <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>{raffle?.prizes?.[0]?.amount || raffle?.prizes?.[0] || ''}</span>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:'#444', fontSize:8 }}>{isPaid?'Total pagado':'Total a pagar'}</div>
          <div style={{ color:numColor, fontSize:17, fontWeight:900, lineHeight:1 }}>{fmt(totalAmount)}</div>
        </div>
      </div>

      {/* BOTON WA o estado */}
      {isReserved && waUrl && (
        <a href={waUrl} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block' }}>
          <div style={{ background:'#25D366', borderRadius:10, padding:11, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'rgba(255,255,255,0.2)' }}></div>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ color:'#fff', fontSize:11, fontWeight:900 }}>Pagar {fmt(totalAmount)} por WhatsApp</span>
          </div>
        </a>
      )}
      {isReserved && !waUrl && (
        <div style={{ background:'#1a1a1a', borderRadius:10, padding:11, textAlign:'center', color:C.muted, fontSize:10 }}>Contacta al administrador para pagar</div>
      )}
      {isPaid && (
        <div style={{ background:'rgba(39,174,96,0.08)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:10, padding:10, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#27AE60" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ color:'#27AE60', fontSize:11, fontWeight:700 }}>Pago confirmado</span>
        </div>
      )}
      {isFinished && (
        <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:10, textAlign:'center', color:'#444', fontSize:10 }}>Sorteo finalizado</div>
      )}
    </div>
  )
}


function TicketCard({ ticket: t, paid, onRefresh, onDownload, onSupport, appConfig }) {
  const nums = t.numbers || []
  const range = Math.max(...nums, 0) > 99 ? 1000 : 100
  const [showPayModal, setShowPayModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [showExtendModal, setShowExtendModal] = useState(false)

  useEffect(() => {
    if (paid || !t.created_at) return
    const releaseHours = t.raffles?.release_hours || 24
    const releaseTime = new Date(t.created_at).getTime() + releaseHours * 3600000
    const update = () => {
      const diff = releaseTime - Date.now()
      if (diff <= 0) { setTimeLeft('Vencido'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [t.created_at, paid, t.raffles?.release_hours])

  async function releaseOne(num) {
    if (!window.confirm(`Liberar el numero ${String(num).padStart(2,'0')}?`)) return
    const newNums = nums.filter(n => n !== num)
    if (newNums.length === 0) await supabase.from('tickets').update({ status:'released' }).eq('id', t.id)
    else { const pp = t.total_amount / nums.length; await supabase.from('tickets').update({ numbers:newNums, total_amount:newNums.length * pp }).eq('id', t.id) }
    onRefresh()
  }

  const waLink = () => {
    const num = (appConfig?.paymentWhatsapp || appConfig?.supportWhatsapp || '').replace(/\D/g,'')
    const msg = `Hola! Quiero pagar mi boleto\nDinamica: ${t.raffles?.title || ''}\nNumeros: ${nums.map(n=>String(n).padStart(2,'0')).join(', ')}\nTotal: ${fmt(t.total_amount)}`
    return num ? `https://wa.me/${num}?text=${encodeURIComponent(msg)}` : '#'
  }

  return (
    <div style={{ background: paid ? `linear-gradient(160deg,rgba(39,174,96,0.06),${C.card})` : C.card, border:`1px solid ${paid?'rgba(39,174,96,0.2)':C.cardBorder}`, borderRadius:16, padding:16, marginBottom:12, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:paid?`linear-gradient(90deg,transparent,${C.green},transparent)`:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div>
          <div style={{ color:C.muted, fontSize:9, fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>Dinamica</div>
          <div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>{t.raffles?.title || 'Dinamica'}</div>
        </div>
        {paid && (
          <button onClick={() => onDownload(t)} style={{ background:'rgba(39,174,96,0.12)', border:'1px solid rgba(39,174,96,0.25)', borderRadius:8, padding:'5px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, color:C.green, fontSize:10, fontWeight:700, fontFamily:'inherit' }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Descargar
          </button>
        )}
      </div>

      {!paid && nums.length > 1 && <div style={{ color:C.muted, fontSize:9, marginBottom:6 }}>Toca X para liberar un numero:</div>}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
        {nums.map(n => {
          const pad = range<=100 ? String(n).padStart(2,'0') : String(n).padStart(3,'0')
          return (
            <div key={n} style={{ background:paid?'rgba(39,174,96,0.1)':'rgba(201,162,39,0.1)', border:`1px solid ${paid?'rgba(39,174,96,0.25)':'rgba(201,162,39,0.25)'}`, borderRadius:8, padding:'6px 8px', display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ color:paid?C.green:C.gold, fontSize:16, fontWeight:900 }}>#{pad}</span>
              {!paid && (
                <button onClick={() => releaseOne(n)} style={{ width:16, height:16, background:'rgba(192,57,43,0.2)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#E74C3C', fontSize:8, fontWeight:700, padding:0, fontFamily:'inherit' }}>â</button>
              )}
            </div>
          )
        })}
      </div>

      {!paid && timeLeft && (
        <div style={{ background: timeLeft === 'Vencido' ? 'rgba(192,57,43,0.1)' : 'rgba(201,162,39,0.06)', border: `1px solid ${timeLeft === 'Vencido' ? 'rgba(192,57,43,0.3)' : 'rgba(201,162,39,0.2)'}`, borderRadius:10, padding:'9px 12px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color: timeLeft === 'Vencido' ? '#E74C3C' : C.muted, fontSize:9, textTransform:'uppercase', marginBottom:2 }}>{timeLeft === 'Vencido' ? 'Numero vencido' : 'Tiempo para pagar'}</div>
            <div style={{ color: timeLeft === 'Vencido' ? '#E74C3C' : C.gold, fontSize:20, fontWeight:900, fontFamily:'monospace', letterSpacing:1 }}>{timeLeft}</div>
          </div>
          <div>
            <div style={{ color:C.muted, fontSize:9, marginBottom:4, textAlign:'right' }}>Vence el</div>
            <div style={{ color:'#fff', fontSize:10, fontWeight:700, textAlign:'right' }}>
              {(() => { const d = new Date(new Date(t.created_at).getTime() + (t.raffles?.release_hours||24)*3600000); return d.toLocaleDateString('es-CO',{day:'numeric',month:'short'}) + ' ' + d.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) })()}
            </div>
            <div onClick={() => setShowExtendModal(true)} style={{ color:C.gold, fontSize:8, fontWeight:700, textAlign:'right', marginTop:3, cursor:'pointer', textDecoration:'underline' }}>Solicitar mas tiempo</div>
          </div>
        </div>
      )}

      {!paid && <TicketTimer ticket={t} />}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:paid?0:12 }}>
        <span style={S.badge(paid?'green':'dim')}>{paid?'Pago confirmado':'Pendiente de pago'}</span>
        <span style={{ color:'#fff', fontSize:15, fontWeight:900 }}>{fmt(t.total_amount)}</span>
      </div>

      {showExtendModal && (
        <div style={{ background:'linear-gradient(135deg,#1a1200,#141414)', border:`1px solid rgba(201,162,39,0.25)`, borderRadius:12, padding:14, marginBottom:10 }}>
          <div style={{ color:C.gold, fontSize:12, fontWeight:800, marginBottom:6 }}>Solicitar mas tiempo</div>
          <div style={{ color:C.muted, fontSize:11, marginBottom:12, lineHeight:1.5 }}>Enviamos una solicitud al administrador para extender el tiempo de tu reserva. El admin decidira si aprueba la extension.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <button onClick={async () => { const nums2=(nums||[]).map(n=>String(n).padStart(2,'0')).join(', '); await supabase.from('support_messages').insert({ user_id:t.user_id, message:'Solicito mas tiempo para pagar mi boleto #'+nums2+' de la dinamica '+(t.raffles?.title||'')+'. Por favor extender el plazo.', from_admin:false }); setShowExtendModal(false); alert('Solicitud enviada! El admin revisara tu caso.') }} style={{ background:'rgba(201,162,39,0.1)', border:'1px solid rgba(201,162,39,0.25)', borderRadius:9, padding:10, color:C.gold, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Enviar solicitud</button>
            <button onClick={() => setShowExtendModal(false)} style={{ background:'transparent', border:`1px solid #2a2a2a`, borderRadius:9, padding:10, color:'#555', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}

      {!paid && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <button onClick={() => setShowPayModal(true)} style={{ background:'rgba(201,162,39,0.1)', border:`1px solid rgba(201,162,39,0.25)`, borderRadius:10, padding:11, color:C.gold, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Pagar ahora</button>
          <button style={{ background:'rgba(201,162,39,0.07)', border:`1px solid rgba(201,162,39,0.2)`, borderRadius:10, padding:11, color:C.gold, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }} onClick={() => alert('Canjear puntos proximamente')}>Con puntos</button>
        </div>
      )}

      {showPayModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setShowPayModal(false)}>
          <div className="slide-up" style={{ background:'#111', borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxWidth:500, border:`1px solid rgba(201,162,39,0.2)`, borderBottom:'none', position:'relative', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ width:40, height:4, background:'#2a2a2a', borderRadius:2, margin:'0 auto 16px' }}></div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:16, marginBottom:4 }}>Confirmar pago</div>
            <div style={{ color:C.muted, fontSize:12, marginBottom:16 }}>Numeros {nums.map(n=>String(n).padStart(2,'0')).join(', ')} â {fmt(t.total_amount)}</div>
            <a href={waLink()} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
              <div style={{ background:'#0f1e1a', border:'1px solid rgba(39,174,96,0.25)', borderRadius:12, padding:14, marginBottom:10, display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
                <div style={{ width:40, height:40, background:'#128C7E', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ flex:1 }}><div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>Pagar por WhatsApp</div><div style={{ color:C.green, fontSize:10 }}>Enviar comprobante directo</div></div>
                <div style={{ color:C.green, fontSize:16 }}>â</div>
              </div>
            </a>
            <div onClick={() => { setShowPayModal(false); onSupport() }} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:14, marginBottom:14, display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
              <div style={{ width:40, height:40, background:`rgba(201,162,39,0.1)`, border:`1px solid rgba(201,162,39,0.25)`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={C.gold} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div style={{ flex:1 }}><div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>Chat de soporte</div><div style={{ color:C.muted, fontSize:10 }}>Adjuntar comprobante en el chat</div></div>
              <div style={{ color:'#666', fontSize:16 }}>â</div>
            </div>
            <button onClick={() => setShowPayModal(false)} style={{ width:'100%', background:'transparent', border:'none', color:'#444', fontSize:13, cursor:'pointer', padding:8, fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// âââ PROMOTER âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function PromoterPage({ user, profile, onBack }) {
  const [referrals, setReferrals] = useState([])
  useEffect(() => { if(user) supabase.from('referrals').select('*').eq('promoter_id', user.id).then(({ data }) => { if(data) setReferrals(data) }) }, [user])
  if (!profile?.is_promoter) return <div style={{ ...S.content, textAlign:'center', paddingTop:60 }}><p style={{ color:C.muted }}>No eres Vendedor Oficial aun</p><button onClick={onBack} style={{ ...S.btnGold, maxWidth:240, margin:'16px auto 0' }}>Volver</button></div>
  const refUrl = `https://www.lacasadelasdinamicas.com/?ref=${profile?.referral_code}`
  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:16, fontSize:14, padding:0, fontFamily:'inherit' }}>â Volver</button>
      <div style={{ background:`linear-gradient(160deg,#1a1200,${C.card})`, border:`1px solid ${C.cardBorder}`, borderRadius:18, padding:18, marginBottom:16, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}><span style={{ fontSize:26 }}>ð£</span><div><h2 style={{ color:'#fff', fontWeight:900, fontSize:18, margin:0 }}>Panel del Vendedor</h2><span style={S.badge('green')}>Activo</span></div></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[[referrals.length,'Referidos','ð¥'],[fmt(profile?.total_earnings||0),'Ganancias','ðµ'],[fmt(profile?.pending_earnings||0),'Por cobrar','ð°'],['15%','Comision N1','ð']].map(([val,label,icon]) => (
          <div key={label} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:14, textAlign:'center' }}>
            <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
            <div style={{ fontSize:20, fontWeight:900, color:C.gold }}>{val}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:3, textTransform:'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.card, marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:10 }}>Tu enlace de referidos</div>
        <div style={{ background:C.bg3, border:`1px dashed rgba(201,162,39,0.3)`, borderRadius:10, padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, marginBottom:10 }}>
          <span style={{ fontSize:11, color:C.gold, fontFamily:'monospace', wordBreak:'break-all' }}>{refUrl}</span>
          <button onClick={() => navigator.clipboard.writeText(refUrl).then(() => alert('Copiado!'))} style={{ background:'rgba(201,162,39,0.15)', border:`1px solid rgba(201,162,39,0.3)`, borderRadius:8, color:C.gold, fontSize:11, fontWeight:700, padding:'6px 10px', cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit' }}>Copiar</button>
        </div>
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`La Casa De Las Dinamicas!\nParticipa en las mejores dinamicas del pais!\nRegistrate: ${refUrl}`)}`)} style={S.btnGold}>Compartir por WhatsApp</button>
      </div>
      <div style={S.card}>
        <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:12 }}>Estructura de comisiones</div>
        {[['Nivel 1 â Venta directa','15%'],['Nivel 2 â Referido de referido','7%'],['Nivel 3','3%']].map(([label,pct]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg3, borderRadius:9, padding:'10px 12px', marginBottom:8 }}>
            <span style={{ color:'#ccc', fontSize:12 }}>{label}</span>
            <span style={S.badge('gold')}>{pct}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// âââ POINTS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function PointsPage({ user, profile, onLogin }) {
  return (
    <div style={S.content}>
      <div style={{ background:`linear-gradient(160deg,#1a1200,${C.card})`, border:`1px solid ${C.cardBorder}`, borderRadius:20, padding:24, marginBottom:20, textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ fontSize:36, marginBottom:10 }}>â­</div>
        <div style={{ color:C.gold, fontSize:36, fontWeight:900 }}>{(profile?.points || 0).toLocaleString()}</div>
        <div style={{ color:C.muted, fontSize:13, marginTop:4 }}>Puntos de fidelidad</div>
        {!user && <button onClick={onLogin} style={{ ...S.btnGold, marginTop:16 }}>Ingresar para ganar puntos</button>}
      </div>
      {[['ðï¸','Comprar un boleto','Por cada boleto confirmado','+100 pts'],['ð¥','Referir un amigo','Cuando se registra con tu enlace','+500 pts'],['ð±','Compartir dinamica','Por cada publicacion compartida','+50 pts'],['ð°','Recargar saldo','Por cada recarga realizada','+200 pts'],['ð¸','Seguirnos en Instagram','@lacasadelasdinamicas','+30 pts']].map(([icon,title,desc,pts]) => (
        <div key={title} style={{ ...S.card, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}><span style={{ fontSize:22 }}>{icon}</span><div><div style={{ color:'#fff', fontWeight:700, fontSize:13 }}>{title}</div><div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{desc}</div></div></div>
          <span style={S.badge('dim')}>{pts}</span>
        </div>
      ))}
    </div>
  )
}

// âââ SUPPORT ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function SupportPage({ user, profile, isAdmin, onBack, appConfig }) {
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const quickReplies = ['Como pago mi boleto?','Cuando es el sorteo?','Quiero liberar un numero','Quiero ser vendedor','Tuve un problema tecnico']

  useEffect(() => {
    if (isAdmin) {
      loadConversations()
      const ch = supabase.channel('support-admin').on('postgres_changes', { event:'INSERT', schema:'public', table:'support_messages' }, loadConversations).subscribe()
      return () => supabase.removeChannel(ch)
    } else if (user) {
      loadMyMessages()
      const ch = supabase.channel(`support-${user.id}`).on('postgres_changes', { event:'INSERT', schema:'public', table:'support_messages', filter:`user_id=eq.${user.id}` }, loadMyMessages).subscribe()
      return () => supabase.removeChannel(ch)
    }
  }, [user, isAdmin])

  useEffect(() => { if(selectedConv && isAdmin) loadConvMessages(selectedConv.user_id) }, [selectedConv])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  async function loadConversations() {
    const { data } = await supabase.from('support_messages').select('*, users_profile(full_name,phone)').order('created_at', { ascending:false })
    if (!data) return
    const map = {}
    data.forEach(m => {
      if (!map[m.user_id]) map[m.user_id] = { user_id:m.user_id, name:m.users_profile?.full_name||'Usuario', phone:m.users_profile?.phone, last_msg:m.image_url?'Imagen adjunta':m.message, unread:!m.from_admin?1:0 }
      else if (!m.from_admin) map[m.user_id].unread++
    })
    setConversations(Object.values(map))
  }
  async function loadMyMessages() {
    const { data } = await supabase.from('support_messages').select('*').eq('user_id', user.id).order('created_at', { ascending:true })
    setMessages(data || [])
  }
  async function loadConvMessages(userId) {
    const { data } = await supabase.from('support_messages').select('*').eq('user_id', userId).order('created_at', { ascending:true })
    if (data) setMessages(data)
  }
  async function handleImageUpload(file) {
    if (!file || !user) return

    // Validar tipo y tamaÃ±o
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif']
    if (!allowed.includes(file.type)) {
      alert('Solo se permiten imagenes JPG, PNG, WEBP o GIF.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no puede pesar mas de 10MB.')
      return
    }

    const ext = file.name.split('.').pop().toLowerCase()
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2,6)}.${ext}`
    const path = `support/${user.id}/${fileName}`

    try {
      // Subir al bucket
      const { data: uploadData, error: upErr } = await supabase.storage
        .from('support-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (upErr) {
        console.error('Upload error:', upErr)
        if (upErr.message?.includes('row-level security') || upErr.message?.includes('policy')) {
          alert('Error de permisos en Storage. Ejecuta el SQL de fix-storage en Supabase.')
        } else if (upErr.message?.includes('Bucket not found')) {
          alert('El bucket support-images no existe. Crealo en Supabase Storage â New Bucket â nombre: support-images â Public.')
        } else {
          alert('Error al subir: ' + upErr.message)
        }
        return
      }

      // Obtener URL publica
      const { data: urlData } = supabase.storage
        .from('support-images')
        .getPublicUrl(path)

      const publicUrl = urlData?.publicUrl
      if (!publicUrl) { alert('No se pudo obtener la URL de la imagen.'); return }

      // Auto-eliminar en 48 horas fijo
      const deleteAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

      // Guardar en support_messages
      const { error: msgErr } = await supabase.from('support_messages').insert({
        user_id: user.id,
        message: 'Comprobante de pago adjunto',
        from_admin: false,
        image_url: publicUrl,
        delete_at: deleteAt
      })

      if (msgErr) {
        console.error('Message error:', msgErr)
        alert('Imagen subida pero no se pudo registrar el mensaje. Intenta de nuevo.')
        return
      }

      await loadMyMessages()

    } catch(e) {
      console.error('handleImageUpload exception:', e)
      alert('Error inesperado al procesar la imagen. Intenta de nuevo.')
    }
  }
  async function sendMessage(text) {
    const content = text || msg
    if (!content.trim()) return
    setMsg(''); setLoading(true)
    if (isAdmin && selectedConv) { await supabase.from('support_messages').insert({ user_id:selectedConv.user_id, message:content, from_admin:true }); await loadConvMessages(selectedConv.user_id) }
    else if (user) { await supabase.from('support_messages').insert({ user_id:user.id, message:content, from_admin:false }); await loadMyMessages() }
    setLoading(false)
  }
  const waLink = () => { const num=(appConfig?.supportWhatsapp||'').replace(/\D/g,''); return num?`https://wa.me/${num}?text=${encodeURIComponent(appConfig?.supportWhatsappMsg||'Hola!')}`:null }

  if (isAdmin) return (
    <div style={{ height:'calc(100vh - 64px)', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.cardBorder}`, display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:14, padding:0, fontFamily:'inherit' }}>â Volver</button>
        <h2 style={{ color:'#fff', fontWeight:800, fontSize:16, margin:0 }}>Centro de Atencion</h2>
      </div>
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <div style={{ width:selectedConv?'35%':'100%', borderRight:`1px solid ${C.cardBorder}`, overflowY:'auto' }}>
          {conversations.length===0 ? <div style={{ textAlign:'center', padding:'40px 16px', color:C.muted }}><div style={{ fontSize:36, marginBottom:8 }}>ð¬</div>Sin mensajes aun</div>
            : conversations.map((c,i) => (
              <div key={i} onClick={() => setSelectedConv(c)} style={{ padding:'12px 14px', borderBottom:`1px solid rgba(255,255,255,0.04)`, cursor:'pointer', background:selectedConv?.user_id===c.user_id?'rgba(201,162,39,0.06)':'transparent', display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ width:38, height:38, background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#000', fontSize:14, flexShrink:0 }}>{(c.name||'U')[0].toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'#fff', fontWeight:700, fontSize:13, marginBottom:2 }}>{c.name}</div>
                  <div style={{ color:C.muted, fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.last_msg}</div>
                </div>
                {c.unread>0 && <div style={{ width:18, height:18, background:'#C0392B', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:700, flexShrink:0 }}>{c.unread}</div>}
              </div>
            ))}
        </div>
        {selectedConv && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.cardBorder}`, display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={() => setSelectedConv(null)} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontSize:18, padding:0 }}>â</button>
              <div style={{ flex:1 }}><div style={{ color:'#fff', fontWeight:700, fontSize:13 }}>{selectedConv.name}</div>{selectedConv.phone && <div style={{ color:C.muted, fontSize:11 }}>{selectedConv.phone}</div>}</div>
              <button onClick={() => window.open(`https://wa.me/${(selectedConv.phone||'').replace(/\D/g,'')}`)} style={{ background:'rgba(39,174,96,0.15)', border:'1px solid rgba(39,174,96,0.25)', borderRadius:8, color:C.green, fontSize:11, fontWeight:700, padding:'5px 10px', cursor:'pointer', fontFamily:'inherit' }}>WhatsApp</button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
              {messages.map((m,i) => (
                <div key={i} style={{ display:'flex', justifyContent:m.from_admin?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth:'78%', background:m.from_admin?`linear-gradient(135deg,${C.gold},${C.goldLight})`:C.card, color:m.from_admin?'#000':'#fff', borderRadius:m.from_admin?'16px 16px 4px 16px':'16px 16px 16px 4px', padding:'9px 13px', fontSize:13, border:m.from_admin?'none':`1px solid ${C.cardBorder}` }}>
                    {m.image_url && <img src={m.image_url} alt="comprobante" style={{ width:'100%', borderRadius:8, marginBottom:m.message?6:0, display:'block' }} />}
                    {m.message}
                    <div style={{ fontSize:10, color:m.from_admin?'rgba(0,0,0,.4)':'#555', marginTop:3, textAlign:'right' }}>{fmtTime(m.created_at)}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding:'8px 14px', overflowX:'auto', display:'flex', gap:6, scrollbarWidth:'none' }}>
              {['Pago confirmado','Pago rechazado','En revision','Ganaste!'].map(r => (
                <button key={r} onClick={() => sendMessage(r)} style={{ flexShrink:0, background:C.bg3, border:`1px solid #2a2a2a`, borderRadius:999, padding:'5px 12px', color:'#ccc', fontSize:11, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>{r}</button>
              ))}
            </div>
            <div style={{ padding:'10px 14px', borderTop:`1px solid ${C.cardBorder}`, display:'flex', gap:8 }}>
              <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key==='Enter'&&sendMessage()} placeholder="Responder..." style={{ flex:1 }} />
              <button onClick={() => sendMessage()} disabled={loading} style={{ ...S.btnGold, width:'auto', padding:'10px 16px', borderRadius:10 }}>â</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (!user) return (<div style={{ ...S.content, textAlign:'center', paddingTop:60 }}><div style={{ fontSize:48, marginBottom:16 }}>ð¬</div><h2 style={{ color:'#fff', fontWeight:800, marginBottom:8 }}>Atencion al Cliente</h2><p style={{ color:C.muted, fontSize:14 }}>Inicia sesion para chatear con nosotros</p></div>)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 128px)', background:C.bg }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { if(e.target.files[0]) handleImageUpload(e.target.files[0]); e.target.value='' }} />
      <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.cardBorder}`, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{ width:42, height:42, borderRadius:'50%', overflow:'hidden', border:`1px solid rgba(201,162,39,0.3)`, flexShrink:0 }}><LogoSVG size={42} /></div>
        <div style={{ flex:1 }}>
          <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>La Casa â Soporte</div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:7, height:7, background:C.green, borderRadius:'50%', display:'inline-block' }} className="pulse"></span><span style={{ color:C.green, fontSize:11 }}>En linea</span></div>
        </div>
        {waLink() && (<a href={waLink()} target="_blank" rel="noreferrer" style={{ textDecoration:'none', flexShrink:0 }}><div style={{ background:'#075E54', borderRadius:10, padding:'7px 10px', display:'flex', alignItems:'center', gap:5 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>{appConfig?.supportWhatsappText||'WhatsApp'}</span></div></a>)}
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
        {messages.length===0 && <div style={{ background:C.card, borderRadius:'16px 16px 16px 4px', padding:'12px 16px', fontSize:13, color:'#fff', maxWidth:'82%', border:`1px solid ${C.cardBorder}` }}>Bienvenido! En que te podemos ayudar hoy?</div>}
        {messages.map((m,i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.from_admin?'flex-start':'flex-end' }}>
            <div style={{ maxWidth:'80%', background:m.from_admin?C.card:`linear-gradient(135deg,${C.gold},${C.goldLight})`, color:m.from_admin?'#fff':'#000', border:m.from_admin?`1px solid ${C.cardBorder}`:'none', borderRadius:m.from_admin?'16px 16px 16px 4px':'16px 16px 4px 16px', padding:'10px 14px', fontSize:13 }}>
              {m.image_url && <div style={{ marginBottom:m.message?6:0 }}><img src={m.image_url} alt="comprobante" style={{ width:'100%', borderRadius:8, display:'block' }} />{m.delete_at && <div style={{ fontSize:9, color:m.from_admin?'#555':'rgba(0,0,0,.4)', marginTop:3 }}>Expira el {new Date(m.delete_at).toLocaleDateString('es-CO')}</div>}</div>}
              {m.message}
              <div style={{ fontSize:10, color:m.from_admin?'#555':'rgba(0,0,0,.4)', marginTop:4, textAlign:'right' }}>{fmtTime(m.created_at)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding:'8px 16px', borderTop:`1px solid rgba(255,255,255,0.04)`, overflowX:'auto', display:'flex', gap:6, scrollbarWidth:'none', flexShrink:0 }}>
        {quickReplies.map(q => (<button key={q} onClick={() => sendMessage(q)} style={{ flexShrink:0, background:'rgba(201,162,39,0.07)', border:`1px solid rgba(201,162,39,0.18)`, borderRadius:999, padding:'6px 12px', color:C.gold, fontSize:11, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>{q}</button>))}
      </div>
      <div style={{ padding:'10px 16px', borderTop:`1px solid ${C.cardBorder}`, display:'flex', gap:8, flexShrink:0, alignItems:'center' }}>
        <button onClick={() => fileInputRef.current?.click()} style={{ width:44, height:44, background:C.bg3, border:`1px solid rgba(201,162,39,0.2)`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, padding:0 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.gold} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill={C.gold} stroke="none"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key==='Enter'&&sendMessage()} placeholder="Escribe o adjunta comprobante..." style={{ flex:1 }} />
        <button onClick={() => sendMessage()} disabled={loading} style={{ ...S.btnGold, width:'auto', padding:'11px 16px', borderRadius:10, flexShrink:0 }}>â</button>
      </div>
    </div>
  )
}
// âââ ADMIN ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function AdminPage({ user, isAdmin, raffles, appConfig, setAppConfig, onBack, onOpenSupport, onOpenSociety, onOpenBingo, onRefreshRaffles }) {
  const [tab, setTab] = useState(0)
  const [tickets, setTickets] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [localConfig, setLocalConfig] = useState(appConfig)
  const [showCreateRaffle, setShowCreateRaffle] = useState(false)
  const [editingRaffle, setEditingRaffle] = useState(null)

  useEffect(() => { setLocalConfig(appConfig) }, [appConfig])
  const [adminRaffles, setAdminRaffles] = useState([])

  useEffect(() => {
    if (!isAdmin) return
    loadAdminData()
  }, [isAdmin])

  async function loadAdminData() {
    // Cargar TODOS los sorteos (activos + borradores)
    const { data: rd } = await supabase.from('raffles').select('*').order('created_at', { ascending: false })
    if (rd) setAdminRaffles(rd)
    // Cargar boletos
    const { data: td } = await supabase.from('tickets').select('*, users_profile(full_name,phone), raffles(title)').order('created_at',{ascending:false}).limit(50)
    if (td) setTickets(td)
    // Mensajes sin leer
    const { count } = await supabase.from('support_messages').select('id',{count:'exact'}).eq('from_admin',false)
    setUnreadCount(count||0)
  }

  async function saveConfig() {
    await supabase.from('app_config').upsert({ id:1, ...localConfig })
    setAppConfig(localConfig)
    alert('Configuracion guardada')
  }

  if (!isAdmin) return <div style={{ ...S.content, textAlign:'center', paddingTop:60 }}><div style={{ fontSize:48 }}>ð</div><p style={{ color:C.muted, marginTop:16 }}>Acceso restringido</p></div>
  if (showCreateRaffle || editingRaffle) return <RaffleForm raffle={editingRaffle} onBack={() => { setShowCreateRaffle(false); setEditingRaffle(null) }} onSave={() => { setShowCreateRaffle(false); setEditingRaffle(null); onRefreshRaffles(); loadAdminData() }} />

  const pending = tickets.filter(t => t.status === 'reserved')
  const totalRecaudo = tickets.filter(t => t.status === 'paid').reduce((a,t) => a + (t.total_amount||0), 0)

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:16, fontSize:14, padding:0, fontFamily:'inherit' }}>â Volver</button>
      <div style={{ background:`linear-gradient(160deg,#1a1200,${C.card})`, border:`1px solid ${C.cardBorder}`, borderRadius:18, padding:18, marginBottom:14, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:11, overflow:'hidden', border:`1px solid rgba(201,162,39,0.3)` }}><LogoSVG size={44} /></div>
          <div><h2 style={{ color:'#fff', fontWeight:900, fontSize:18, margin:0 }}>Panel de Administracion</h2><div style={{ color:C.muted, fontSize:12 }}>La Casa De Las Dinamicas</div></div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        {[['ð°',adminRaffles.length,'Dinamicas'],['ðï¸',tickets.length,'Boletos'],['â³',pending.length,'Por confirmar'],['ð¬',unreadCount,'Mensajes']].map(([icon,val,label]) => (
          <div key={label} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:14, textAlign:'center' }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
            <div style={{ fontSize:22, fontWeight:900, color:C.gold }}>{val}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2, textTransform:'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'linear-gradient(135deg,rgba(39,174,96,0.08),rgba(39,174,96,0.03))', border:'1px solid rgba(39,174,96,0.2)', borderRadius:14, padding:'14px 18px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div><div style={{ color:C.green, fontSize:10, fontWeight:700, textTransform:'uppercase', marginBottom:3 }}>Total recaudado</div><div style={{ color:'#fff', fontSize:24, fontWeight:900 }}>{fmt(totalRecaudo)}</div></div>
        <div style={{ fontSize:32 }}>ð°</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <button onClick={onOpenSupport} style={{ ...S.btnGold, fontSize:13, position:'relative' }}>
          Atender Clientes
          {unreadCount > 0 && <span style={{ position:'absolute', top:-8, right:-8, width:22, height:22, background:'#C0392B', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:700 }}>{unreadCount}</span>}
        </button>
        <button onClick={() => onOpenSociety && onOpenSociety()} style={{ background:'linear-gradient(135deg,#5b2d8a,#7c3db8)', border:'1px solid rgba(155,89,182,0.4)', borderRadius:12, color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', padding:'14px' }}>ð¥ Sociedades</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <button onClick={() => onOpenBingo && onOpenBingo()} style={{ background:'linear-gradient(135deg,#1a5a1a,#27AE60)', border:'1px solid rgba(39,174,96,0.4)', borderRadius:12, color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', padding:'14px' }}>ð± Panel Bingo</button>
        <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:12, padding:'14px', display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:11 }}>+ Mas pronto</div>
      </div>
      <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.03)', borderRadius:10, padding:4, marginBottom:16 }}>
        {['Dinamicas','Boletos','Config'].map((t,i) => (
          <button key={t} onClick={() => setTab(i)} style={{ flex:1, padding:9, border:'none', background:tab===i?C.card:'transparent', color:tab===i?'#fff':'#555', fontSize:12, fontWeight:700, cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <>
          <button onClick={() => setShowCreateRaffle(true)} style={{ ...S.btnGold, marginBottom:14 }}>+ Crear nueva dinamica</button>
          {adminRaffles.length === 0 && <div style={{ textAlign:'center', padding:'30px 0', color:C.muted }}><div style={{ fontSize:32, marginBottom:8 }}>ð°</div><div>No hay dinamicas aun</div></div>}
          {adminRaffles.map(r => (
            <div key={r.id} style={{ ...S.card, marginBottom:10, position:'relative', overflow:'hidden', opacity: r.status==='draft'?0.7:1 }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
              <div style={{ fontWeight:700, color:'#fff', fontSize:13, marginBottom:6 }}>{r.title}</div>
              <div style={{ display:'flex', gap:5, alignItems:'center', marginBottom:6 }}><span style={{ background:r.status==='active'?'rgba(39,174,96,0.15)':'rgba(255,255,255,0.05)', border:`1px solid ${r.status==='active'?'rgba(39,174,96,0.3)':'rgba(255,255,255,0.1)'}`, borderRadius:999, padding:'2px 8px', color:r.status==='active'?'#27AE60':'#888', fontSize:9, fontWeight:700 }}>{r.status==='active'?'ACTIVO':r.status==='draft'?'BORRADOR':'FINALIZADO'}</span><span style={{ color:C.muted, fontSize:10 }}>{fmt(r.ticket_price)} Â· {r.lottery_name}</span></div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setEditingRaffle(r)} style={{ flex:1, background:'rgba(201,162,39,0.08)', border:`1px solid rgba(201,162,39,0.2)`, borderRadius:8, color:C.gold, fontSize:11, fontWeight:700, padding:9, cursor:'pointer', fontFamily:'inherit' }}>Editar</button>
                <button onClick={async () => { const n=window.prompt('Numero ganador (0-'+(r.number_range-1)+'):'); if(n!==null) alert('Ganador: #'+String(parseInt(n)).padStart(r.number_range<=100?2:3,'0')) }} style={{ flex:1, background:'rgba(39,174,96,0.1)', border:'1px solid rgba(39,174,96,0.25)', borderRadius:8, color:C.green, fontSize:11, fontWeight:700, padding:9, cursor:'pointer', fontFamily:'inherit' }}>Realizar sorteo</button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 1 && (
        <>
          <div style={{ ...S.card, marginBottom:14 }}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:10 }}>Registrar venta manual</div>
            <ManualSaleForm raffles={raffles} onSaved={() => supabase.from('tickets').select('*, users_profile(full_name,phone), raffles(title)').order('created_at',{ascending:false}).limit(50).then(({data})=>{if(data)setTickets(data)})} />
          </div>
          {pending.length === 0
            ? <div style={{ textAlign:'center', padding:'20px 0', color:C.muted }}>Todo al dia</div>
            : pending.map(t => (
              <div key={t.id} style={{ ...S.card, marginBottom:10, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:13, marginBottom:4 }}>{t.raffles?.title}</div>
                <div style={{ color:C.muted, fontSize:12, marginBottom:3 }}>ð¤ {t.users_profile?.full_name}</div>
                {t.users_profile?.phone && <div style={{ color:C.muted, fontSize:11, marginBottom:6 }}>ð± {t.users_profile.phone}</div>}
                <div style={{ color:C.muted, fontSize:12, marginBottom:6 }}>Numeros: <span style={{ color:C.gold, fontWeight:700 }}>{(t.numbers||[]).map(n=>String(n).padStart(2,'0')).join(', ')}</span></div>
                <div style={{ color:C.gold, fontWeight:900, fontSize:16, marginBottom:12 }}>{fmt(t.total_amount)}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:7 }}>
                  <button onClick={async () => { await supabase.from('tickets').update({status:'paid'}).eq('id',t.id); setTickets(prev=>prev.map(x=>x.id===t.id?{...x,status:'paid'}:x)) }} style={{ background:'#27AE60', border:'none', borderRadius:9, color:'#fff', fontSize:11, fontWeight:800, padding:11, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Confirmar Pago</button>
                  <a href={'https://wa.me/'+(t.users_profile?.phone||'').replace(/\D/g,'')+'?text='+encodeURIComponent('Hola '+( t.users_profile?.full_name||'')+', tu pago del boleto #'+(t.numbers||[]).map(n=>String(n).padStart(2,'0')).join(', ')+' del sorteo '+(t.raffles?.title||'')+' por '+fmt(t.total_amount)+' fue confirmado. Gracias!')} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                    <div style={{ background:'#075E54', borderRadius:9, color:'#fff', fontSize:11, fontWeight:800, padding:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5, height:'100%' }}><svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>WhatsApp</div>
                  </a>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                  <AdminSMSButton ticket={t} />
                  <button onClick={async () => { await supabase.from('tickets').update({status:'rejected'}).eq('id',t.id); setTickets(prev=>prev.filter(x=>x.id!==t.id)) }} style={{ background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:9, color:'#E74C3C', fontSize:11, fontWeight:700, padding:11, cursor:'pointer', fontFamily:'inherit' }}>Rechazar</button>
                </div>
              </div>
            ))
          }
        </>
      )}

      {tab === 2 && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:12 }}>Configuracion General</div>
            {[['showPoints','Mostrar boton Puntos','Visible en la barra de navegacion'],['showWinners','Mostrar boton Ganadores','Visible en la pantalla de inicio'],['showHowItWorks','Mostrar Como funciona?','Visible en la pantalla de inicio'],['showWelcomeBonus','Bono de bienvenida','$500 + 1000 pts al registrarse'],['show_bingo','Mostrar Bingo','Activa el juego de bingo']].map(([key,label,desc]) => (
              <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg3, borderRadius:10, padding:'11px 14px', marginBottom:8 }}>
                <div><div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{label}</div><div style={{ color:C.muted, fontSize:10, marginTop:1 }}>{desc}</div></div>
                <Toggle on={localConfig[key]} onToggle={() => setLocalConfig(prev=>({...prev,[key]:!prev[key]}))} />
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:10 }}>WhatsApp de Soporte</div>
            <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}>Aparece como boton en el chat de soporte de los usuarios</div>
            {[['supportWhatsapp','Numero WhatsApp','+57 300 000 0000'],['supportWhatsappText','Texto del boton','Escribir al WhatsApp'],['supportWhatsappMsg','Mensaje predeterminado','Hola! Necesito ayuda...']].map(([key,label,ph]) => (
              <div key={key} style={{ marginBottom:10 }}>
                <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>{label}</label>
                <input value={localConfig[key]||''} onChange={e=>setLocalConfig(prev=>({...prev,[key]:e.target.value}))} placeholder={ph} />
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:10 }}>WhatsApp de Pagos</div>
            <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}>Numero al que llegan los comprobantes al presionar "Pagar ahora"</div>
            <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Numero WhatsApp</label>
            <input value={localConfig.paymentWhatsapp||''} onChange={e=>setLocalConfig(prev=>({...prev,paymentWhatsapp:e.target.value}))} placeholder="+57 300 000 0000" />
          </div>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:12 }}>Redes Sociales</div>
            {[['whatsapp','WhatsApp'],['canal','Canal WhatsApp'],['instagram','Instagram'],['facebook','Facebook'],['telegram','Telegram']].map(([key,label]) => (
              <div key={key} style={{ marginBottom:10 }}>
                <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>{label}</label>
                <input value={localConfig[key]||''} onChange={e=>setLocalConfig(prev=>({...prev,[key]:e.target.value}))} placeholder={`https://...`} />
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:10 }}>Auto-eliminar comprobantes</div>
            <div style={{ display:'flex', gap:8 }}>
              {[1,3,7].map(d => (
                <button key={d} onClick={() => setLocalConfig(prev=>({...prev,imgDeleteDays:d}))} style={{ flex:1, border:`1px solid ${localConfig.imgDeleteDays===d?C.gold:'rgba(201,162,39,0.2)'}`, background:localConfig.imgDeleteDays===d?'rgba(201,162,39,0.15)':C.bg3, borderRadius:9, padding:'9px', textAlign:'center', color:localConfig.imgDeleteDays===d?C.gold:C.muted, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{d} dia{d!==1?'s':''}</button>
              ))}
            </div>
          </div>
          <button onClick={saveConfig} style={S.btnGold}>Guardar toda la configuracion</button>
        </div>
      )}
    </div>
  )
}

// âââ RAFFLE FORM ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// âââ FORM FIELD â definido fuera para evitar re-render y perdida de foco ââââ
function FormField({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:10, fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>{label}</label>
      {children}
    </div>
  )
}

function RaffleForm({ raffle, onBack, onSave }) {
  const isEdit = !!raffle
  const [form, setForm] = useState({ title:raffle?.title||'', ticket_price:raffle?.ticket_price||5000, number_range:raffle?.number_range||100, max_per_person:raffle?.max_per_person||5, raffle_date:raffle?.raffle_date?raffle.raffle_date.split('T')[0]:'', lottery_name:raffle?.lottery_name||'', card_color:raffle?.card_color||'#E67E22', is_free:raffle?.is_free||false, accepts_points:raffle?.accepts_points!==false, prizes:raffle?.prizes?raffle.prizes.map(p=>p.amount||p).join('\n'):'', society_numbers:raffle?.society_numbers?raffle.society_numbers.join(', '):'', status:raffle?.status||'active', description:raffle?.description||'', is_featured:raffle?.is_featured||false, release_hours:raffle?.release_hours||24 })
  const [saving, setSaving] = useState(false)
  const colors = ['#C9A227','#E74C3C','#3498DB','#27AE60','#9B59B6','#E67E22','#1ABC9C']

  // F defined outside to prevent focus loss - see FormField component below

  async function save() {
    if (!form.title || !form.raffle_date || !form.lottery_name) { alert('Completa el titulo, fecha y loteria'); return }
    setSaving(true)
    const prizes = form.prizes.split('\n').filter(p=>p.trim()).map(p=>({ amount:p.trim() }))
    const society_numbers = form.society_numbers ? form.society_numbers.split(',').map(n=>parseInt(n.trim())).filter(n=>!isNaN(n)) : []
    const data = { title:form.title, ticket_price:parseInt(form.ticket_price)||5000, number_range:parseInt(form.number_range)||100, max_per_person:parseInt(form.max_per_person)||5, raffle_date:form.raffle_date, lottery_name:form.lottery_name, card_color:form.card_color, is_free:form.is_free, accepts_points:form.accepts_points, prizes, society_numbers, status:form.status, description:form.description, is_featured:form.is_featured||false, release_hours:parseInt(form.release_hours)||24 }
    let saveError = null
    if (isEdit) {
      const { error } = await supabase.from('raffles').update(data).eq('id', raffle.id)
      saveError = error
    } else {
      const { error } = await supabase.from('raffles').insert(data)
      saveError = error
    }
    setSaving(false)
    if (saveError) { alert('Error al guardar: ' + saveError.message); return }
    alert(isEdit ? 'Dinamica actualizada!' : 'Dinamica creada exitosamente!')
    onSave()
  }

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:16, fontSize:14, padding:0, fontFamily:'inherit' }}>â Volver</button>
      <div style={{ ...S.card, marginBottom:14, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ color:C.gold, fontSize:14, fontWeight:900 }}>{isEdit?'Editar dinamica':'Crear nueva dinamica'}</div>
      </div>
      <FormField label="Nombre del sorteo"><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Ej: MOTO YAMAHA MT-03 + $500.000" /></FormField>
      <FormField label="Rango de numeros">
        <div style={{ display:'flex', gap:8 }}>
          {[[100,'00 al 99'],[1000,'000 al 999']].map(([v,l]) => (
            <button key={v} onClick={()=>setForm(p=>({...p,number_range:v}))} style={{ flex:1, border:`1px solid ${form.number_range===v?C.gold:'rgba(201,162,39,0.2)'}`, background:form.number_range===v?'rgba(201,162,39,0.15)':C.bg3, borderRadius:9, padding:'10px', textAlign:'center', color:form.number_range===v?C.gold:C.muted, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Valor del boleto (COP)"><input type="number" value={form.ticket_price} onChange={e=>setForm(p=>({...p,ticket_price:e.target.value}))} placeholder="5000" /></FormField>
      <FormField label="Maximo boletos por persona">
        <div style={{ display:'flex', gap:6 }}>
          {[['1',1],['2',2],['5',5],['10',10],['Sin limite',999]].map(([l,v]) => (
            <button key={l} onClick={()=>setForm(p=>({...p,max_per_person:v}))} style={{ flex:1, border:`1px solid ${form.max_per_person===v?C.gold:'rgba(201,162,39,0.2)'}`, background:form.max_per_person===v?'rgba(201,162,39,0.15)':C.bg3, borderRadius:8, padding:'8px 2px', textAlign:'center', color:form.max_per_person===v?C.gold:C.muted, fontSize:9, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Fecha del sorteo"><input type="date" value={form.raffle_date} onChange={e=>setForm(p=>({...p,raffle_date:e.target.value}))} /></FormField>
      <FormField label="Loteria que juega"><input value={form.lottery_name} onChange={e=>setForm(p=>({...p,lottery_name:e.target.value}))} placeholder="Ej: Loteria de Bogota" /></FormField>
      <FormField label="Color de la tarjeta">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
          {[
            ['#E67E22','Naranja'],['#C9A227','Dorado'],['#C0392B','Rojo'],
            ['#2980B9','Azul'],['#27AE60','Verde'],['#9B59B6','Purpura'],
            ['#1ABC9C','Teal'],['#E91E63','Rosa'],['#607D8B','Gris azul'],
          ].map(([color,name]) => (
            <div key={color} onClick={()=>setForm(p=>({...p,card_color:color}))} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer' }}>
              <div style={{ width:38, height:38, background:`linear-gradient(135deg,${color}cc,${color}88)`, borderRadius:10, border:form.card_color===color?`3px solid #fff`:`1px solid ${color}60`, transition:'all .2s', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:color }}></div>
                {form.card_color===color && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:16, fontWeight:900 }}>â</div>}
              </div>
              <span style={{ fontSize:7, color:form.card_color===color?'#fff':'#555', fontWeight:form.card_color===color?700:400 }}>{name}</span>
            </div>
          ))}
        </div>
        <div style={{ background:`linear-gradient(160deg,${form.card_color}22,${form.card_color}11)`, border:`1px solid ${form.card_color}44`, borderRadius:11, padding:'8px 12px', fontSize:10, color:'#fff', fontWeight:600, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${form.card_color},transparent)` }}></div>
          Vista previa â asi se vera la tarjeta en el home
        </div>
      </FormField>
      <FormField label="Marcar como destacado">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg3, borderRadius:9, padding:'11px 14px' }}>
          <div>
            <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>Sorteo destacado</div>
            <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>Aparece en la seccion "Destacados" del home</div>
          </div>
          <Toggle on={form.is_featured||false} onToggle={()=>setForm(p=>({...p,is_featured:!p.is_featured}))} />
        </div>
      </FormField>
      <FormField label="Opciones">
        {[['accepts_points','Acepta pago con puntos'],['is_free','Sorteo gratis (sin costo)']].map(([key,label]) => (
          <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg3, borderRadius:9, padding:'11px 14px', marginBottom:8 }}>
            <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{label}</div>
            <Toggle on={form[key]} onToggle={()=>setForm(p=>({...p,[key]:!p[key]}))} />
          </div>
        ))}
      </FormField>
      <FormField label="Tiempo para pagar (horas antes de liberar el numero)">
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          {[[6,'6h'],[12,'12h'],[24,'24h'],[48,'48h'],[72,'72h']].map(([v,l]) => (
            <button key={v} onClick={()=>setForm(p=>({...p,release_hours:v}))} style={{ flex:1, border:`1px solid ${form.release_hours===v?C.gold:'rgba(201,162,39,0.2)'}`, background:form.release_hours===v?'rgba(201,162,39,0.15)':C.bg3, borderRadius:9, padding:'9px', textAlign:'center', color:form.release_hours===v?C.gold:C.muted, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
          ))}
        </div>
        <div style={{ background:'rgba(201,162,39,0.06)', border:`1px solid rgba(201,162,39,0.15)`, borderRadius:9, padding:'9px 12px', color:C.muted, fontSize:11 }}>
          Si el usuario no paga en <span style={{ color:C.gold, fontWeight:700 }}>{form.release_hours} horas</span>, el numero se libera automaticamente para otra persona
        </div>
      </FormField>

      <FormField label="Estado">
        <div style={{ display:'flex', gap:8 }}>
          {[['active','Activo'],['draft','Borrador'],['finished','Finalizado']].map(([v,l]) => (
            <button key={v} onClick={()=>setForm(p=>({...p,status:v}))} style={{ flex:1, border:`1px solid ${form.status===v?C.gold:'rgba(201,162,39,0.2)'}`, background:form.status===v?'rgba(201,162,39,0.15)':C.bg3, borderRadius:9, padding:'9px', textAlign:'center', color:form.status===v?C.gold:C.muted, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Premios (uno por linea)">
        <textarea rows={5} value={form.prizes} onChange={e=>setForm(p=>({...p,prizes:e.target.value}))} placeholder={"Moto Yamaha MT-03 0km\n$500.000 en efectivo\n$200.000 en efectivo"} style={{ background:'#1a1a1a', border:`1px solid rgba(201,162,39,0.2)`, borderRadius:12, padding:'13px 16px', color:'#fff', fontSize:14, outline:'none', width:'100%', fontFamily:'inherit', resize:'none', boxSizing:'border-box' }} />
      </FormField>
      <FormField label="Numeros en sociedad (separados por coma)">
        <input value={form.society_numbers} onChange={e=>setForm(p=>({...p,society_numbers:e.target.value}))} placeholder="Ej: 07, 13, 42, 77, 88" />
        <div style={{ color:C.muted, fontSize:10, marginTop:4 }}>Estos numeros se pueden comprar en sociedad entre dos personas</div>
      </FormField>
      <FormField label="Descripcion opcional">
        <textarea rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Informacion adicional..." style={{ background:'#1a1a1a', border:`1px solid rgba(201,162,39,0.2)`, borderRadius:12, padding:'13px 16px', color:'#fff', fontSize:14, outline:'none', width:'100%', fontFamily:'inherit', resize:'none', boxSizing:'border-box' }} />
      </FormField>
      <button onClick={save} disabled={saving} style={{ ...S.btnGold, marginBottom:10, opacity:saving?.7:1 }}>{saving?'Guardando...':isEdit?'Guardar cambios':'Crear dinamica'}</button>
      <button onClick={onBack} style={S.btnOutline}>Cancelar</button>
    </div>
  )
}

// âââ MANUAL SALE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ManualSaleForm({ raffles, onSaved }) {
  const [f, setF] = useState({ raffleId:'', name:'', phone:'', numbers:'', status:'paid' })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!f.raffleId || !f.name || !f.numbers) { alert('Completa dinamica, nombre y numeros'); return }
    const r = raffles.find(x => String(x.id) === String(f.raffleId))
    if (!r) return
    const nums = f.numbers.split(',').map(n=>parseInt(n.trim())).filter(n=>!isNaN(n))
    if (!nums.length) { alert('Ingresa al menos un numero valido'); return }
    setSaving(true)
    const { data: existUser } = await supabase.from('users_profile').select('id').ilike('full_name', f.name.trim()).limit(1)
    let userId = existUser?.[0]?.id
    if (!userId) {
      const fakeId = crypto.randomUUID()
      await supabase.from('users_profile').insert({ id:fakeId, full_name:f.name.trim(), phone:f.phone.trim(), email:`manual_${fakeId.slice(0,8)}@lacasa.com`, role:'customer', credits:0, points:0 })
      userId = fakeId
    }
    await supabase.from('tickets').insert({ user_id:userId, raffle_id:r.id, numbers:nums, status:f.status, total_amount:nums.length * r.ticket_price })
    setSaving(false); setF({ raffleId:'', name:'', phone:'', numbers:'', status:'paid' })
    alert(`Venta registrada para ${f.name}`); onSaved()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div>
        <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:5 }}>Dinamica</label>
        <select value={f.raffleId} onChange={e=>setF(p=>({...p,raffleId:e.target.value}))} style={{ background:'#1a1a1a', border:`1px solid rgba(201,162,39,0.2)`, borderRadius:10, padding:'11px 14px', color:f.raffleId?'#fff':'#444', fontSize:14, outline:'none', width:'100%', fontFamily:'inherit' }}>
          <option value="">Selecciona una dinamica</option>
          {raffles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
      </div>
      {[['Nombre del participante','name','text','Carlos Rodriguez'],['Telefono / WhatsApp','phone','tel','310 000 0000'],['Numeros separados por coma','numbers','text','07, 23, 45']].map(([label,key,type,ph]) => (
        <div key={key}>
          <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:5 }}>{label}</label>
          <input type={type} value={f[key]} onChange={e=>setF(p=>({...p,[key]:e.target.value}))} placeholder={ph} />
        </div>
      ))}
      <div>
        <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:5 }}>Estado del pago</label>
        <div style={{ display:'flex', gap:8 }}>
          {[['paid','Pagado'],['reserved','Reservado']].map(([v,l]) => (
            <button key={v} onClick={()=>setF(p=>({...p,status:v}))} style={{ flex:1, border:`1px solid ${f.status===v?C.gold:'rgba(201,162,39,0.2)'}`, background:f.status===v?'rgba(201,162,39,0.15)':C.bg3, borderRadius:9, padding:'9px', textAlign:'center', color:f.status===v?C.gold:C.muted, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
          ))}
        </div>
      </div>
      <button onClick={save} disabled={saving} style={{ ...S.btnGold, opacity:saving?.7:1 }}>{saving?'Guardando...':'Registrar venta'}</button>
    </div>
  )
}

// âââ LOGIN ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// âââ LOGIN ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function LoginScreen({ onLogin, onRegister, onBack }) {
  const [email, setEmail] = useState(''); const [pwd, setPwd] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const submit = async () => { setLoading(true); setError(''); try { await onLogin(email, pwd) } catch { setError('Correo o contrasena incorrectos') } finally { setLoading(false) } }
  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', justifyContent:'center', padding:24 }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:380, margin:'0 auto', width:'100%' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32 }}>
          <div style={{ width:72, height:72, borderRadius:18, overflow:'hidden', marginBottom:16, border:`2px solid rgba(201,162,39,0.4)` }} className="house-float"><LogoSVG size={72} /></div>
          <div style={{ fontSize:10, color:C.gold, fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>La Casa De Las Dinamicas</div>
          <h1 style={{ color:'#fff', fontWeight:900, fontSize:24, marginBottom:6, textAlign:'center' }}>Bienvenido de vuelta</h1>
          <p style={{ color:C.muted, fontSize:14, textAlign:'center' }}>Ingresa para ver tus dinamicas</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Correo electronico</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tuemail@correo.com" /></div>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Contrasena</label><input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="â¢â¢â¢â¢â¢â¢â¢â¢" /></div>
          {error && <div style={{ color:'#E74C3C', fontSize:13, textAlign:'center', padding:'8px 12px', background:'rgba(192,57,43,0.1)', borderRadius:8 }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ ...S.btnGold, opacity:loading?.7:1, marginTop:4 }}>{loading?'Ingresando...':'Ingresar a La Casa'}</button>
        </div>
        <p style={{ textAlign:'center', marginTop:24, color:'#555', fontSize:14 }}>No tienes cuenta? <button onClick={onRegister} style={{ background:'none', border:'none', color:C.gold, fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>Registrate gratis</button></p>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'#333', cursor:'pointer', width:'100%', textAlign:'center', marginTop:12, fontSize:13, fontFamily:'inherit' }}>Explorar sin cuenta</button>
      </div>
    </div>
  )
}

// âââ REGISTER âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function RegisterScreen({ onRegister, onLogin, appConfig }) {
  const [form, setForm] = useState({ name:'', phone:'', email:'', password:'', ref:'' }); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const submit = async () => {
    if (!form.name||!form.email||!form.password) { setError('Completa todos los campos'); return }
    if (form.password.length < 6) { setError('La contrasena debe tener minimo 6 caracteres'); return }
    setLoading(true); setError('')
    try { await onRegister(form.name, form.phone, form.email, form.password, form.ref) }
    catch(e) { setError(e.message || 'Error al registrarse. Intenta de nuevo.') }
    finally { setLoading(false) }
  }
  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', justifyContent:'center', padding:24 }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:380, margin:'0 auto', width:'100%', paddingBottom:24 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24 }}>
          <div style={{ width:60, height:60, borderRadius:14, overflow:'hidden', marginBottom:10, border:`1px solid rgba(201,162,39,0.3)` }} className="house-float"><LogoSVG size={60} /></div>
          <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, marginBottom:5, textAlign:'center' }}>Unete a La Casa</h1>
          <p style={{ color:C.muted, fontSize:14, textAlign:'center' }}>Registrate gratis y empieza a participar</p>
        </div>
        {appConfig?.showWelcomeBonus !== false && (
          <div style={{ background:`linear-gradient(135deg,rgba(201,162,39,0.08),rgba(201,162,39,0.03))`, border:`1px solid rgba(201,162,39,0.2)`, borderRadius:14, padding:'14px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:24 }}>ð</span>
            <div><div style={{ color:C.gold, fontSize:13, fontWeight:800 }}>Bono de bienvenida!</div><div style={{ color:C.muted, fontSize:11, marginTop:2 }}>$500 en saldo + 1.000 puntos de fidelidad</div></div>
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[['Nombre completo','name','text','Carlos Rodriguez'],['WhatsApp / Celular','phone','tel','310 000 0000'],['Correo electronico','email','email','tuemail@correo.com'],['Contrasena','password','password','Minimo 6 caracteres']].map(([label,key,type,ph]) => (
            <div key={key}><label style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>{label}</label><input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph} /></div>
          ))}
          {error && <div style={{ color:'#E74C3C', fontSize:13, textAlign:'center', padding:'8px 12px', background:'rgba(192,57,43,0.1)', borderRadius:8 }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ ...S.btnGold, marginTop:6, opacity:loading?.7:1 }}>{loading?'Creando tu cuenta...':'Unirme a La Casa'}</button>
        </div>
        <p style={{ textAlign:'center', marginTop:20, color:'#555', fontSize:14 }}>Ya tienes cuenta? <button onClick={onLogin} style={{ background:'none', border:'none', color:C.gold, fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>Ingresar</button></p>
      </div>
    </div>
  )
}

// âââ TICKET TIMER â countdown basado en expiracion real ââââââââââââââââââââââ
function TicketTimer({ ticket }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    function calc() {
      const expiry = ticket.expires_at
        ? new Date(ticket.expires_at)
        : ticket.raffles?.raffle_date
          ? new Date(new Date(ticket.raffles.raffle_date).getTime() - 6 * 3600000)
          : null
      if (!expiry) { setTimeLeft(''); return }
      const diff = expiry - Date.now()
      if (diff <= 0) { setTimeLeft('Vencido'); setUrgent(true); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      setUrgent(diff < 12 * 3600000)
      if (days > 0) setTimeLeft(`${days}d ${hours}h restantes`)
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m restantes`)
      else setTimeLeft(`${mins} min restantes`)
    }
    calc()
    const iv = setInterval(calc, 60000)
    return () => clearInterval(iv)
  }, [ticket])

  if (!timeLeft) return null
  const color = urgent ? '#E74C3C' : '#E67E22'
  const dateLabel = ticket.raffles?.raffle_date
    ? `Sorteo: ${new Date(ticket.raffles.raffle_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`
    : ''

  return (
    <div style={{ background: urgent ? 'rgba(192,57,43,0.08)' : 'rgba(230,126,34,0.08)', border: `1px solid ${color}40`, borderRadius: 8, padding: '7px 9px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 5, height: 5, background: color, borderRadius: '50%' }} className="pulse"></div>
          <span style={{ color, fontSize: 9, fontWeight: 700 }}>{urgent ? 'Paga urgente!' : 'Confirma tu pago'}</span>
        </div>
        {dateLabel && <div style={{ color: '#555', fontSize: 8, marginTop: 1 }}>{dateLabel}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color, fontSize: 13, fontWeight: 900 }}>{timeLeft}</div>
      </div>
    </div>
  )
}

// âââ SOCIETY PAGE â pagina completa del sistema de sociedad ââââââââââââââââââ
function SocietyPage({ user, profile, raffle, number, onBack, onLogin }) {
  const [societyTicket, setSocietyTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  const halfPrice = Math.floor((raffle?.ticket_price || 0) / 2)
  const pad = n => String(n).padStart(raffle?.number_range <= 100 ? 2 : 3, '0')

  useEffect(() => {
    fetchSocietyTicket()
    const ch = supabase.channel(`society-${raffle?.id}-${number}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'society_tickets', filter: `raffle_id=eq.${raffle?.id}` }, fetchSocietyTicket)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [raffle?.id, number])

  async function fetchSocietyTicket() {
    if (!raffle?.id) return
    const { data } = await supabase.from('society_tickets')
      .select('*, socio1:socio1_id(full_name,city), socio2:socio2_id(full_name,city)')
      .eq('raffle_id', raffle.id)
      .eq('number', number)
      .single()
    setSocietyTicket(data || null)
    setLoading(false)
  }

  async function joinSociety() {
    if (!user) { onLogin(); return }
    setJoining(true)
    try {
      if (!societyTicket) {
        // Crear nueva sociedad como socio 1
        const expiresAt = new Date(Date.now() + 48 * 3600000).toISOString()
        const { error } = await supabase.from('society_tickets').insert({
          raffle_id: raffle.id, number, socio1_id: user.id,
          socio1_paid: false, socio1_amount: halfPrice,
          status: 'waiting', expires_at: expiresAt
        })
        if (error) throw error
        alert(`Numero #${pad(number)} reservado en sociedad! Tienes 48 horas para confirmar el pago de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(halfPrice)}.`)
      } else if (societyTicket.status === 'waiting' && !societyTicket.socio2_id) {
        // Unirse como socio 2
        if (societyTicket.socio1_id === user.id) { alert('Ya eres el primer socio de este numero!'); setJoining(false); return }
        const { error } = await supabase.from('society_tickets').update({
          socio2_id: user.id, socio2_paid: false,
          socio2_amount: halfPrice, status: 'complete', updated_at: new Date().toISOString()
        }).eq('id', societyTicket.id)
        if (error) throw error
        alert(`Te uniste a la sociedad del numero #${pad(number)}! Tienen el boleto completo. Confirma tu pago de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(halfPrice)}.`)
      }
      await fetchSocietyTicket()
    } catch(e) {
      alert('Error al unirse: ' + e.message)
    }
    setJoining(false)
  }

  const status = societyTicket?.status
  const isSocio1 = societyTicket?.socio1_id === user?.id
  const isSocio2 = societyTicket?.socio2_id === user?.id
  const alreadyIn = isSocio1 || isSocio2
  const canJoin = !societyTicket || (status === 'waiting' && !societyTicket.socio2_id && !alreadyIn)
  const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <style>{CSS}</style>
      <div style={{ background: 'linear-gradient(180deg,#0f0619 0%,#080808 100%)', padding: '16px 16px 0', borderBottom: '1px solid rgba(155,89,182,0.2)' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.purple, cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: '0 0 14px', fontFamily: 'inherit' }}>â Volver</button>
        <div style={{ textAlign: 'center', paddingBottom: 20 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg,#2a0d4a,#3d1a6e)', border: '2px solid #9B59B6', borderRadius: 20, padding: '16px 28px', marginBottom: 12 }} className="society-glow">
            <div style={{ color: '#7b5cad', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Numero en Sociedad</div>
            <div style={{ color: '#C9A0E8', fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{pad(number)}</div>
            <div style={{ color: '#9B59B6', fontSize: 11, fontWeight: 700, marginTop: 6 }}>ð¥ {raffle?.title}</div>
          </div>
          {/* Estado del numero */}
          {loading ? (
            <div style={{ color: C.muted, fontSize: 12 }}>Verificando disponibilidad...</div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '5px 14px', border: '1px solid', ...(
              !societyTicket ? { background: 'rgba(155,89,182,0.12)', borderColor: 'rgba(155,89,182,0.3)', color: '#C9A0E8' } :
              status === 'waiting' ? { background: 'rgba(230,126,34,0.12)', borderColor: 'rgba(230,126,34,0.3)', color: '#E67E22' } :
              { background: 'rgba(39,174,96,0.12)', borderColor: 'rgba(39,174,96,0.3)', color: '#27AE60' }
            )}}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} className="pulse"></div>
              <span style={{ fontSize: 10, fontWeight: 700 }}>
                {!societyTicket ? 'Disponible â 0/2 socios' :
                 status === 'waiting' ? '1 socio unido â falta 1 mas!' :
                 status === 'complete' ? 'Completo â 2/2 socios' : 'No disponible'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={S.content}>
        {/* Desglose precio */}
        <div style={{ background: 'linear-gradient(135deg,rgba(155,89,182,0.08),rgba(155,89,182,0.03))', border: '1px solid rgba(155,89,182,0.2)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <div style={{ color: '#9B59B6', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Desglose del costo</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: C.muted, fontSize: 13 }}>Valor real del boleto</span>
            <span style={{ color: '#555', fontSize: 13, fontWeight: 700, textDecoration: 'line-through' }}>{fmt(raffle?.ticket_price || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#C9A0E8', fontSize: 13, fontWeight: 700 }}>Tu pagas (50%)</span>
            <span style={{ color: C.purple, fontSize: 24, fontWeight: 900 }}>{fmt(halfPrice)}</span>
          </div>
          <div style={{ background: 'rgba(39,174,96,0.08)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>ð</span>
            <div>
              <div style={{ color: '#27AE60', fontSize: 11, fontWeight: 700 }}>Si el numero gana, AMBOS reciben el premio completo</div>
              <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{(Array.isArray(raffle?.prizes) ? raffle.prizes[0]?.amount : '') || 'Premio principal'}</div>
            </div>
          </div>
        </div>

        {/* Como funciona */}
        <div style={{ ...S.card, marginBottom: 14 }}>
          <GoldLine />
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Como funciona la sociedad</div>
          {[
            ['ð¥', 'Dos personas compran el mismo numero', 'Cada una paga la mitad del precio del boleto'],
            ['â', 'El boleto queda completo entre los dos', 'Ambos socios quedan registrados en el sorteo'],
            ['ð', 'Si el numero gana, ambos ganan', 'El admin coordina la entrega del premio a cada socio'],
            ['â°', 'Tienes 48 horas para confirmar el pago', 'Si no pagas, el cupo se libera automaticamente'],
          ].map(([icon, title, desc], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 3 ? 12 : 0, paddingBottom: i < 3 ? 12 : 0, borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <div><div style={{ color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{title}</div><div style={{ color: C.muted, fontSize: 11 }}>{desc}</div></div>
            </div>
          ))}
        </div>

        {/* Socio actual si existe */}
        {societyTicket && societyTicket.status === 'waiting' && (
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Primer socio (ya pago su parte)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#3d1a6e,#6c3db5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>ð¤</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                  {societyTicket.reveal_names && societyTicket.socio1?.full_name
                    ? societyTicket.socio1.full_name.split(' ')[0] + ' â ' + (societyTicket.socio1?.city || 'Colombia')
                    : 'Socio verificado'}
                </div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>El admin puede revelar su identidad si lo decides</div>
              </div>
              <div style={{ background: 'rgba(39,174,96,0.12)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 999, padding: '3px 9px', color: '#27AE60', fontSize: 9, fontWeight: 700 }}>Pago confirmado</div>
            </div>
          </div>
        )}

        {/* Ya soy socio */}
        {alreadyIn && (
          <div style={{ background: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.25)', borderRadius: 14, padding: 14, marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>ð¥</div>
            <div style={{ color: '#C9A0E8', fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Ya eres socio de este numero!</div>
            <div style={{ color: C.muted, fontSize: 12 }}>Ve a tu panel para ver el estado y confirmar el pago</div>
          </div>
        )}

        {/* Boton principal */}
        {!loading && canJoin && (
          <button onClick={joinSociety} disabled={joining} style={{ ...S.btnPurple, opacity: joining ? .7 : 1, marginBottom: 8 }}>
            <span>ð¥</span>
            {joining ? 'Procesando...' : !societyTicket ? `Ser primer socio â ${fmt(halfPrice)}` : `Unirme como socio â ${fmt(halfPrice)}`}
          </button>
        )}
        {!loading && !canJoin && !alreadyIn && (
          <div style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
            <div style={{ color: '#27AE60', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Este numero ya tiene 2 socios</div>
            <div style={{ color: C.muted, fontSize: 11 }}>Revisa otros numeros disponibles en sociedad</div>
          </div>
        )}
        <button onClick={onBack} style={{ ...S.btnOutline, marginTop: 8 }}>Ver otros numeros</button>
      </div>
    </div>
  )
}

// âââ PANEL DE SOCIEDAD EN ADMIN âââââââââââââââââââââââââââââââââââââââââââââââ
function AdminSocietyPanel({ raffles, onBack }) {
  const [societies, setSocieties] = useState([])
  const [filter, setFilter] = useState('all')
  const [selectedRaffle, setSelectedRaffle] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSocieties() }, [selectedRaffle])

  async function fetchSocieties() {
    setLoading(true)
    let q = supabase.from('society_tickets')
      .select('*, raffle:raffle_id(title,ticket_price), socio1:socio1_id(full_name,phone,city), socio2:socio2_id(full_name,phone,city)')
      .order('created_at', { ascending: false })
    if (selectedRaffle !== 'all') q = q.eq('raffle_id', selectedRaffle)
    const { data } = await q
    setSocieties(data || [])
    setLoading(false)
  }

  async function revealNames(id) {
    await supabase.from('society_tickets').update({ reveal_names: true }).eq('id', id)
    fetchSocieties()
  }
  async function extendTime(id) {
    const newExp = new Date(Date.now() + 24 * 3600000).toISOString()
    await supabase.from('society_tickets').update({ expires_at: newExp }).eq('id', id)
    fetchSocieties()
    alert('Plazo extendido 24 horas')
  }
  async function cancelSociety(id) {
    if (!window.confirm('Cancelar esta sociedad?')) return
    await supabase.from('society_tickets').update({ status: 'cancelled' }).eq('id', id)
    fetchSocieties()
  }
  async function confirmPayment(id, socioNum) {
    const field = socioNum === 1 ? 'socio1_paid' : 'socio2_paid'
    await supabase.from('society_tickets').update({ [field]: true }).eq('id', id)
    fetchSocieties()
  }

  const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)
  const filtered = filter === 'all' ? societies : societies.filter(s => s.status === filter)
  const waiting = societies.filter(s => s.status === 'waiting').length
  const complete = societies.filter(s => s.status === 'complete').length

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 700, marginBottom: 16, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>â Volver</button>
      <div style={{ ...S.card, marginBottom: 14 }}>
        <GoldLine />
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Gestion de Sociedades</div>
        <div style={{ color: C.muted, fontSize: 11 }}>Administra todas las sociedades activas</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[[societies.length, 'Total', '#9B59B6'], [waiting, 'Sin socio', '#E67E22'], [complete, 'Completas', '#27AE60']].map(([v, l, c]) => (
          <div key={l} style={{ background: C.card, border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 12, padding: 10, textAlign: 'center' }}>
            <div style={{ color: c, fontSize: 20, fontWeight: 900 }}>{v}</div>
            <div style={{ color: C.muted, fontSize: 8, textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {[['all', 'Todos'], ['waiting', 'Sin socio'], ['complete', 'Completas'], ['cancelled', 'Canceladas']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ flexShrink: 0, background: filter === v ? 'rgba(201,162,39,0.15)' : '#1a1a1a', border: `1px solid ${filter === v ? C.gold : 'rgba(255,255,255,0.06)'}`, borderRadius: 999, padding: '5px 12px', color: filter === v ? C.gold : C.muted, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '30px 0', color: C.muted }}>Cargando...</div>}

      {!loading && filtered.map(s => {
        const halfPrice = Math.floor((s.raffle?.ticket_price || 0) / 2)
        const pad = n => String(n).padStart(2, '0')
        const statusColor = s.status === 'waiting' ? '#E67E22' : s.status === 'complete' ? '#27AE60' : '#555'
        return (
          <div key={s.id} style={{ background: C.card, border: `1px solid ${statusColor}40`, borderRadius: 14, padding: 14, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,transparent,${statusColor},transparent)` }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ color: C.muted, fontSize: 9, textTransform: 'uppercase', marginBottom: 2 }}>{s.raffle?.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ background: 'linear-gradient(135deg,#2a0d4a,#3d1a6e)', border: '1.5px solid #9B59B6', borderRadius: 8, padding: '4px 10px', color: '#C9A0E8', fontSize: 18, fontWeight: 900 }}>#{pad(s.number)}</div>
                  <div style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}35`, borderRadius: 999, padding: '2px 8px', color: statusColor, fontSize: 8, fontWeight: 700 }}>
                    {s.status === 'waiting' ? 'Sin segundo socio' : s.status === 'complete' ? 'Completa' : 'Cancelada'}
                  </div>
                </div>
              </div>
              {s.expires_at && s.status === 'waiting' && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: C.muted, fontSize: 8 }}>Vence</div>
                  <div style={{ color: '#E74C3C', fontSize: 10, fontWeight: 700 }}>{new Date(s.expires_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              )}
            </div>

            {/* Socios */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {[{ socio: s.socio1, paid: s.socio1_paid, num: 1, label: 'Socio 1' }, { socio: s.socio2, paid: s.socio2_paid, num: 2, label: 'Socio 2' }].map(({ socio, paid, num, label }) => (
                <div key={num} style={{ flex: 1, background: '#1a1a1a', borderRadius: 10, padding: '8px 10px' }}>
                  <div style={{ color: C.muted, fontSize: 8, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                  {socio ? (
                    <>
                      <div style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{socio.full_name}</div>
                      <div style={{ color: C.muted, fontSize: 9, margin: '2px 0' }}>{socio.phone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ color: fmt(halfPrice), fontSize: 9 }}>{fmt(halfPrice)}</span>
                        {paid
                          ? <span style={{ background: 'rgba(39,174,96,0.15)', borderRadius: 999, padding: '1px 6px', color: '#27AE60', fontSize: 7, fontWeight: 700 }}>Pagado</span>
                          : <button onClick={() => confirmPayment(s.id, num)} style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 6, padding: '2px 6px', color: '#27AE60', fontSize: 7, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Confirmar</button>
                        }
                      </div>
                    </>
                  ) : (
                    <div style={{ color: '#555', fontSize: 10, fontStyle: 'italic' }}>Sin socio aun</div>
                  )}
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
              {s.socio1?.phone && (
                <button onClick={() => window.open('https://wa.me/'+(s.socio1.phone).replace(/\D/g,'')+'?text='+encodeURIComponent('Hola! Tu sociedad del numero #'+pad(s.number)+' en La Casa De Las Dinamicas'))} style={{ background: '#075E54', border: 'none', borderRadius: 8, padding: '7px', color: '#fff', fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>WA Socio 1</button>
              )}
              {!s.reveal_names && (
                <button onClick={() => revealNames(s.id)} style={{ background: `rgba(201,162,39,0.1)`, border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 8, padding: '7px', color: C.gold, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Revelar nombres</button>
              )}
              {s.status === 'waiting' && (
                <button onClick={() => extendTime(s.id)} style={{ background: `rgba(201,162,39,0.08)`, border: `1px solid rgba(201,162,39,0.18)`, borderRadius: 8, padding: '7px', color: C.gold, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+24h</button>
              )}
              {s.status !== 'cancelled' && (
                <button onClick={() => cancelSociety(s.id)} style={{ background: `rgba(192,57,43,0.1)`, border: `1px solid rgba(192,57,43,0.25)`, borderRadius: 8, padding: '7px', color: '#E74C3C', fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              )}
            </div>
          </div>
        )
      })}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>ð¥</div>
          <div>No hay sociedades {filter !== 'all' ? 'con este filtro' : 'aun'}</div>
        </div>
      )}
    </div>
  )
}

// âââ WA PAYMENT BUTTON â mensaje prellenado ââââââââââââââââââââââââââââââââââ
function WAPayButton({ ticket, profile, appConfig, compact = false }) {
  const raffle = ticket.raffles || {}
  const nums = (ticket.numbers || []).map(n => `#${String(n).padStart(2,'0')}`).join(', ')
  const name = profile?.full_name || 'Cliente'
  const sorteoDate = raffle.raffle_date ? new Date(raffle.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}) : ''
  const msg = `Hola! Quiero pagar mi boleto:\n\nSorteo: ${raffle.title || ''}\nNumero(s): ${nums}\nValor: ${fmt(ticket.total_amount || 0)}\nFecha sorteo: ${sorteoDate} Â· ${raffle.lottery_name || ''}\nNombre: ${name}`
  const waNum = (appConfig?.paymentWhatsapp || appConfig?.payment_whatsapp || '').replace(/\D/g,'')
  const waUrl = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}` : null
  const smsUrl = `sms:${profile?.phone || ''}?body=${encodeURIComponent(msg)}`
  if (!waUrl && compact) return null
  if (compact) return (
    <a href={waUrl} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block' }}>
      <div style={{ background:'#25D366', borderRadius:9, padding:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{ color:'#fff', fontSize:9, fontWeight:800 }}>Pagar por WhatsApp â {fmt(ticket.total_amount || 0)}</span>
      </div>
    </a>
  )
  return (
    <div>
      {waUrl && (
        <a href={waUrl} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block', marginBottom:8 }}>
          <div style={{ background:'#25D366', borderRadius:11, padding:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'rgba(255,255,255,0.2)' }}></div>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div>
              <div style={{ color:'#fff', fontSize:11, fontWeight:900, lineHeight:1 }}>Pagar por WhatsApp</div>
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:7, marginTop:1 }}>Mensaje prellenado listo para enviar</div>
            </div>
          </div>
        </a>
      )}
      {/* Preview mensaje */}
      <div style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:10, padding:10, marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
          <div style={{ width:5, height:5, background:'#25D366', borderRadius:'50%' }}></div>
          <span style={{ color:'#25D366', fontSize:7, fontWeight:700 }}>Mensaje que se enviara automaticamente</span>
        </div>
        <div style={{ background:'#0d200d', borderRadius:8, padding:9, borderLeft:'2px solid #25D366' }}>
          <div style={{ color:'#d0f0d0', fontSize:8, lineHeight:1.7, whiteSpace:'pre-line' }}>{msg}</div>
        </div>
      </div>
      {/* Boton SMS secundario */}
      <a href={smsUrl} style={{ textDecoration:'none', display:'block' }}>
        <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:9, padding:9, display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#888" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span style={{ color:'#888', fontSize:8, fontWeight:700 }}>Enviar por SMS</span>
        </div>
      </a>
    </div>
  )
}

// âââ ADMIN SMS COBRO BUTTON âââââââââââââââââââââââââââââââââââââââââââââââââââ
function AdminSMSButton({ ticket, compact = false }) {
  const raffle = ticket.raffles || {}
  const nums = (ticket.numbers || []).map(n => `#${String(n).padStart(2,'0')}`).join(', ')
  const phone = ticket.users_profile?.phone || ticket.user_phone || ''
  const hoursLeft = ticket.expires_at ? Math.max(0, Math.floor((new Date(ticket.expires_at) - Date.now()) / 3600000)) : 24
  const msg = `La Casa De Las Dinamicas: Hola! Tu numero ${nums} del sorteo ${raffle.title || ''} por ${fmt(ticket.total_amount || 0)} esta pendiente de pago. Tienes ${hoursLeft} horas para confirmar. EscrÃ­benos ya!`
  const smsUrl = `sms:${phone.replace(/\D/g,'')}?body=${encodeURIComponent(msg)}`
  if (compact) return (
    <a href={smsUrl} style={{ textDecoration:'none', display:'block' }}>
      <div style={{ background:'linear-gradient(135deg,#1a1040,#2d1a6e)', border:'1px solid rgba(155,89,182,0.4)', borderRadius:8, padding:'7px', textAlign:'center', cursor:'pointer' }}>
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#CE93D8" strokeWidth="2" style={{ display:'block', margin:'0 auto 3px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <div style={{ color:'#CE93D8', fontSize:6, fontWeight:800 }}>SMS</div>
      </div>
    </a>
  )
  return (
    <a href={smsUrl} style={{ textDecoration:'none', display:'block' }}>
      <div style={{ background:'linear-gradient(135deg,#1a1040,#2d1a6e)', border:'1px solid rgba(155,89,182,0.4)', borderRadius:10, padding:10, textAlign:'center', cursor:'pointer', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'rgba(155,89,182,0.5)' }}></div>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#CE93D8" strokeWidth="2" style={{ display:'block', margin:'0 auto 4px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10" stroke="#CE93D8" strokeWidth="2"/><line x1="9" y1="14" x2="12" y2="14" stroke="#CE93D8" strokeWidth="2"/></svg>
        <div style={{ color:'#CE93D8', fontSize:8, fontWeight:800 }}>SMS Cobro</div>
      </div>
    </a>
  )
}


// âââ BINGO PAGE â completo y didactico âââââââââââââââââââââââââââââââââââââââ
function BingoPage({ user, profile, appConfig, onLogin, onBack }) {
  const [game, setGame] = useState(null)
  const [myCartones, setMyCartones] = useState([])
  const [showGuide, setShowGuide] = useState(false)
  const [buyingCarton, setBuyingCarton] = useState(false)
  const [bingoClaim, setBingoClaim] = useState(false)
  const [winType, setWinType] = useState('')

  useEffect(() => {
    fetchGame()
    const ch = supabase.channel('bingo-live')
      .on('postgres_changes', { event:'*', schema:'public', table:'bingo_games' }, fetchGame)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  useEffect(() => { if (user && game) fetchMyCartones() }, [user, game])

  async function fetchGame() {
    const { data } = await supabase.from('bingo_games').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(1).single()
    setGame(data || null)
  }

  async function fetchMyCartones() {
    if (!game) return
    const { data } = await supabase.from('bingo_cartones').select('*').eq('game_id', game.id).eq('user_id', user.id)
    setMyCartones(data || [])
  }

  function generateCarton() {
    const cols = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] }
    return Object.values(cols).map(([ min, max ], ci) =>
      Array.from({length:5},(_,ri) => {
        if (ci===2 && ri===2) return null // estrella gratis
        const pool = Array.from({length:max-min+1},(_,i)=>i+min)
        return pool[Math.floor(Math.random()*pool.length)]
      })
    )
  }

  async function buyCarton() {
    if (!user) { onLogin(); return }
    if (myCartones.length >= 6) { alert('Ya tienes el maximo de 6 cartones!'); return }
    setBuyingCarton(true)
    const numbers = generateCarton()
    await supabase.from('bingo_cartones').insert({ game_id: game.id, user_id: user.id, numbers, marked: [], carton_number: myCartones.length + 1, paid: false })
    await fetchMyCartones()
    setBuyingCarton(false)
  }

  async function markNumber(cartonId, num) {
    if (!game?.called_numbers?.includes(num)) return
    const carton = myCartones.find(c => c.id === cartonId)
    if (!carton) return
    const newMarked = carton.marked.includes(num) ? carton.marked.filter(n=>n!==num) : [...carton.marked, num]
    await supabase.from('bingo_cartones').update({ marked: newMarked }).eq('id', cartonId)
    setMyCartones(prev => prev.map(c => c.id===cartonId ? {...c, marked:newMarked} : c))
  }

  async function claimBingo() {
    if (!winType) { alert('Selecciona el tipo de bingo que tienes!'); return }
    await supabase.from('bingo_games').update({ winner_user_id: user.id, win_type: winType, status: 'paused' }).eq('id', game.id)
    setBingoClaim(false)
    alert('BINGO reclamado! El admin va a verificar tu carton.')
  }

  const calledNums = game?.called_numbers || []
  const currentNum = game?.current_number

  if (!game) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:16 }}>
      <style>{CSS}</style>
      <div style={{ fontSize:64, marginBottom:8 }}>ð±</div>
      <div style={{ color:'#fff', fontSize:20, fontWeight:900, textAlign:'center' }}>No hay Bingo activo</div>
      <div style={{ color:C.muted, fontSize:13, textAlign:'center' }}>El admin iniciara una partida pronto</div>
      <button onClick={onBack} style={{ ...S.btnOutline, marginTop:8, maxWidth:200 }}>â Volver</button>
    </div>
  )

  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      <style>{CSS}</style>
      {/* Header */}
      <div style={{ background:C.bg2, padding:'11px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid #1a1a1a`, position:'sticky', top:0, zIndex:40 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:13, padding:0, fontFamily:'inherit' }}>â Volver</button>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, background:'#27AE60', borderRadius:'50%' }} className="pulse"></div>
          <span style={{ color:'#fff', fontSize:12, fontWeight:900 }}>Bingo La Casa</span>
        </div>
        <button onClick={() => setShowGuide(!showGuide)} style={{ background:'rgba(230,190,0,0.1)', border:`1px solid rgba(230,190,0,0.3)`, borderRadius:8, color:C.gold, fontSize:10, fontWeight:700, padding:'5px 10px', cursor:'pointer', fontFamily:'inherit' }}>
          {showGuide ? 'Cerrar guia' : '? Guia'}
        </button>
      </div>

      <div style={{ padding:'14px 16px 100px', maxWidth:500, margin:'0 auto' }}>

        {/* GUIA DIDACTICA */}
        {showGuide && (
          <div style={{ background:'#111', border:`1px solid rgba(230,190,0,0.2)`, borderRadius:16, padding:16, marginBottom:14, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ color:C.gold, fontSize:13, fontWeight:900, marginBottom:12, textAlign:'center' }}>Como jugar Bingo</div>
            {[
              ['ðï¸','Compra tu carton','Cada carton cuesta '+fmt(game.carton_price)+'. Puedes tener hasta 6 cartones en la misma partida.'],
              ['ð¢','Escucha los numeros','El admin va cantando numeros. Cada numero cantado se muestra grande en pantalla.'],
              ['â','Marca en tu carton','Cuando el numero cantado aparezca en tu carton, tocalo para marcarlo.'],
              ['ð','Canta BINGO!','Completa una linea horizontal, vertical, diagonal, las 4 esquinas o el carton completo y presiona el boton BINGO!'],
            ].map(([ic,t,d]) => (
              <div key={t} style={{ display:'flex', gap:12, marginBottom:12, paddingBottom:12, borderBottom:'1px solid #1a1a1a' }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{ic}</span>
                <div><div style={{ color:'#fff', fontSize:12, fontWeight:700, marginBottom:2 }}>{t}</div><div style={{ color:C.muted, fontSize:11 }}>{d}</div></div>
              </div>
            ))}
            {/* Tipos de bingo */}
            <div style={{ color:C.gold, fontSize:11, fontWeight:700, marginBottom:8 }}>Formas de ganar:</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[['â','Linea horizontal','Premio basico'],['â','Linea vertical','Premio basico'],['â','Diagonal','Premio medio'],['â¬','Carton lleno','Premio MAXIMO!'],['â»ï¸','4 Esquinas','Premio especial']].map(([ic,t,p]) => (
                <div key={t} style={{ background:'#1a1a1a', borderRadius:9, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{ic}</span>
                  <div><div style={{ color:'#fff', fontSize:9, fontWeight:700 }}>{t}</div><div style={{ color:C.gold, fontSize:8 }}>{p}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NUMERO ACTUAL + PREMIO */}
        <div style={{ background:'#111', border:`1px solid rgba(230,190,0,0.2)`, borderRadius:16, padding:14, marginBottom:14, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div>
              <div style={{ color:C.muted, fontSize:9, textTransform:'uppercase' }}>Premio</div>
              <div style={{ color:C.gold, fontSize:18, fontWeight:900, lineHeight:1 }}>{game.prize_description || fmt(game.prize_amount)}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ color:C.muted, fontSize:9, marginBottom:4 }}>Numero actual</div>
              <div style={{ width:52, height:52, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:900, color:'#000' }}>
                {currentNum || '?'}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ color:C.muted, fontSize:9 }}>Cantados</div>
              <div style={{ color:'#fff', fontSize:18, fontWeight:900 }}>{calledNums.length}</div>
            </div>
          </div>
          {/* Ultimos 5 numeros */}
          <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
            {[...calledNums].slice(-5).map((n,i,arr) => (
              <div key={n} style={{ width:28, height:28, borderRadius:'50%', background:i===arr.length-1?`linear-gradient(135deg,${C.gold},${C.goldLight})`:'#1a1a1a', border:`1px solid ${i===arr.length-1?'transparent':'#2a2a2a'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:i===arr.length-1?'#000':'#555' }}>{n}</div>
            ))}
            {calledNums.length === 0 && <div style={{ color:C.muted, fontSize:11 }}>Esperando primer numero...</div>}
          </div>
        </div>

        {/* MIS CARTONES */}
        {!user ? (
          <div style={{ textAlign:'center', padding:'20px 0', marginBottom:14 }}>
            <div style={{ color:C.muted, fontSize:13, marginBottom:12 }}>Ingresa para comprar cartones y jugar</div>
            <button onClick={onLogin} style={{ ...S.btnGold, maxWidth:200, margin:'0 auto' }}>Entrar a jugar</button>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ color:'#fff', fontSize:13, fontWeight:900 }}>Mis cartones ({myCartones.length}/6)</div>
              {myCartones.length < 6 && (
                <button onClick={buyCarton} disabled={buyingCarton} style={{ background:C.gold, border:'none', borderRadius:9, padding:'8px 14px', color:'#000', fontSize:10, fontWeight:800, cursor:'pointer', fontFamily:'inherit', opacity:buyingCarton?.7:1 }}>
                  {buyingCarton ? '...' : `+ Carton ${fmt(game.carton_price)}`}
                </button>
              )}
            </div>

            {myCartones.length === 0 && (
              <div style={{ background:'#111', border:'1px dashed #2a2a2a', borderRadius:14, padding:24, textAlign:'center', marginBottom:14 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>ðï¸</div>
                <div style={{ color:'#fff', fontSize:13, fontWeight:700, marginBottom:4 }}>No tienes cartones aun</div>
                <div style={{ color:C.muted, fontSize:11, marginBottom:14 }}>Compra tu primer carton por {fmt(game.carton_price)}</div>
                <button onClick={buyCarton} style={{ ...S.btnGold }}>Comprar carton</button>
              </div>
            )}

            {myCartones.map((carton, ci) => {
              const nums = carton.numbers || []
              const marked = carton.marked || []
              const letters = ['B','I','N','G','O']
              return (
                <div key={carton.id} style={{ background:'#111', border:`1px solid rgba(230,190,0,0.2)`, borderRadius:16, padding:12, marginBottom:12, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div style={{ color:'#fff', fontSize:11, fontWeight:800 }}>Carton #{ci+1}</div>
                    <div style={{ color:C.muted, fontSize:10 }}>{marked.length} marcados</div>
                  </div>
                  {/* Header BINGO */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3, marginBottom:3 }}>
                    {letters.map(l => <div key={l} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:6, padding:'5px', textAlign:'center', fontSize:11, fontWeight:900, color:'#000' }}>{l}</div>)}
                  </div>
                  {/* Numeros 5x5 â transpuesto */}
                  {Array.from({length:5},(_,row) => (
                    <div key={row} style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3, marginBottom:3 }}>
                      {nums.map((col, colIdx) => {
                        const n = col[row]
                        const isStar = n === null
                        const isCalled = n !== null && calledNums.includes(n)
                        const isMarked = n !== null ? marked.includes(n) : true
                        return (
                          <div key={colIdx} onClick={() => n && markNumber(carton.id, n)}
                            style={{ aspectRatio:1, borderRadius:6, background:isStar?`linear-gradient(135deg,${C.gold},${C.goldLight})`:isMarked&&isCalled?'rgba(230,190,0,0.25)':isCalled?'rgba(39,174,96,0.15)':'#1a1a1a', border:`1px solid ${isStar?'transparent':isMarked&&isCalled?'rgba(230,190,0,0.5)':isCalled?'rgba(39,174,96,0.4)':'#2a2a2a'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:isStar?14:10, fontWeight:900, color:isStar?'#000':isMarked&&isCalled?C.gold:isCalled?'#27AE60':'#555', cursor:isCalled&&!isStar?'pointer':'default' }}>
                            {isStar ? 'â­' : n}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )
            })}

            {/* BOTON BINGO */}
            {myCartones.length > 0 && (
              <button onClick={() => setBingoClaim(true)} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, border:'none', borderRadius:14, padding:16, color:'#000', fontSize:18, fontWeight:900, cursor:'pointer', width:'100%', fontFamily:'inherit', letterSpacing:2, marginTop:8 }}>
                ð BINGO!
              </button>
            )}
          </>
        )}

        {/* MODAL RECLAMAR BINGO */}
        {bingoClaim && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setBingoClaim(false)}>
            <div style={{ background:'#111', borderRadius:'22px 22px 0 0', padding:24, width:'100%', maxWidth:500, border:`1px solid rgba(230,190,0,0.3)`, borderBottom:'none', position:'relative', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
              <div style={{ width:40, height:4, background:'#2a2a2a', borderRadius:2, margin:'0 auto 16px' }}></div>
              <div style={{ textAlign:'center', marginBottom:16 }}>
                <div style={{ fontSize:40, marginBottom:6 }}>ð</div>
                <div style={{ color:'#fff', fontSize:18, fontWeight:900 }}>Reclamar BINGO!</div>
                <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>Selecciona que tipo de bingo lograste</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                {[['linea','â Linea'],['vertical','â Vertical'],['diagonal','â Diagonal'],['esquinas','â»ï¸ Esquinas'],['full','â¬ Carton lleno']].map(([type,label]) => (
                  <button key={type} onClick={() => setWinType(type)} style={{ background:winType===type?`rgba(230,190,0,0.15)`:'#1a1a1a', border:`1px solid ${winType===type?C.gold:'#2a2a2a'}`, borderRadius:10, padding:'11px', color:winType===type?C.gold:'#888', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{label}</button>
                ))}
              </div>
              <button onClick={claimBingo} disabled={!winType} style={{ ...S.btnGold, opacity:winType?1:.5, marginBottom:8 }}>Confirmar BINGO!</button>
              <button onClick={() => setBingoClaim(false)} style={{ width:'100%', background:'transparent', border:'none', color:'#444', fontSize:12, cursor:'pointer', padding:8, fontFamily:'inherit' }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// âââ ADMIN BINGO PANEL ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function AdminBingoPanel({ onBack }) {
  const [game, setGame] = useState(null)
  const [form, setForm] = useState({ title:'Bingo La Casa', prize_description:'', prize_amount:120000, carton_price:2000, mode:'manual', auto_interval:15 })
  const [creating, setCreating] = useState(false)
  const [calling, setCalling] = useState(false)
  const [autoTimer, setAutoTimer] = useState(null)

  useEffect(() => {
    fetchGame()
    return () => { if (autoTimer) clearInterval(autoTimer) }
  }, [])

  async function fetchGame() {
    const { data } = await supabase.from('bingo_games').select('*').in('status',['active','waiting','paused']).order('created_at',{ascending:false}).limit(1).single()
    setGame(data || null)
  }

  async function createGame() {
    setCreating(true)
    const { data, error } = await supabase.from('bingo_games').insert({ ...form, status:'waiting', called_numbers:[], created_by:null }).select().single()
    if (!error) setGame(data)
    setCreating(false)
  }

  async function startGame() {
    await supabase.from('bingo_games').update({ status:'active' }).eq('id', game.id)
    await fetchGame()
    if (form.mode === 'auto') startAuto()
  }

  function startAuto() {
    const iv = setInterval(async () => {
      const { data } = await supabase.from('bingo_games').select('called_numbers').eq('id', game.id).single()
      const called = data?.called_numbers || []
      const remaining = Array.from({length:75},(_,i)=>i+1).filter(n=>!called.includes(n))
      if (remaining.length === 0) { clearInterval(iv); return }
      const next = remaining[Math.floor(Math.random()*remaining.length)]
      await supabase.from('bingo_games').update({ called_numbers:[...called,next], current_number:next }).eq('id',game.id)
    }, (form.auto_interval || 15) * 1000)
    setAutoTimer(iv)
  }

  async function callNumber() {
    if (!game) return
    setCalling(true)
    const called = game.called_numbers || []
    const remaining = Array.from({length:75},(_,i)=>i+1).filter(n=>!called.includes(n))
    if (remaining.length === 0) { alert('Ya se cantaron todos los numeros!'); setCalling(false); return }
    const next = remaining[Math.floor(Math.random()*remaining.length)]
    await supabase.from('bingo_games').update({ called_numbers:[...called,next], current_number:next, updated_at: new Date().toISOString() }).eq('id',game.id)
    await fetchGame()
    setCalling(false)
  }

  async function finishGame() {
    if (!window.confirm('Finalizar partida?')) return
    if (autoTimer) clearInterval(autoTimer)
    await supabase.from('bingo_games').update({ status:'finished' }).eq('id',game.id)
    setGame(null)
  }

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:16, fontSize:14, padding:0, fontFamily:'inherit' }}>â Volver</button>
      <div style={{ ...S.card, marginBottom:14, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ color:C.gold, fontSize:14, fontWeight:900 }}>Panel de Bingo</div>
      </div>

      {!game ? (
        <div>
          <div style={{ color:'#fff', fontSize:13, fontWeight:700, marginBottom:14 }}>Crear nueva partida</div>
          {[['Titulo','title','text'],['Descripcion del premio','prize_description','text'],['Valor del premio','prize_amount','number'],['Precio del carton','carton_price','number'],['Segundos entre numeros (auto)','auto_interval','number']].map(([l,k,t]) => (
            <div key={k} style={{ marginBottom:10 }}>
              <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:5 }}>{l}</label>
              <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:t==='number'?parseInt(e.target.value)||0:e.target.value}))} />
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>Modo de canto</label>
            <div style={{ display:'flex', gap:8 }}>
              {[['manual','Manual (admin canta)'],['auto','Automatico']].map(([v,l]) => (
                <button key={v} onClick={()=>setForm(p=>({...p,mode:v}))} style={{ flex:1, border:`1px solid ${form.mode===v?C.gold:'rgba(230,190,0,0.2)'}`, background:form.mode===v?'rgba(230,190,0,0.1)':C.bg3, borderRadius:9, padding:10, color:form.mode===v?C.gold:C.muted, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
              ))}
            </div>
          </div>
          <button onClick={createGame} disabled={creating} style={{ ...S.btnGold }}>{creating?'Creando...':'Crear partida'}</button>
        </div>
      ) : (
        <div>
          <div style={{ background:'#111', border:`1px solid rgba(230,190,0,0.2)`, borderRadius:14, padding:14, marginBottom:14, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div>
                <div style={{ color:'#fff', fontSize:14, fontWeight:900 }}>{game.title}</div>
                <div style={{ color:C.muted, fontSize:11 }}>Premio: {game.prize_description || fmt(game.prize_amount)}</div>
              </div>
              <div style={{ background:game.status==='active'?'rgba(39,174,96,0.15)':'rgba(230,190,0,0.12)', border:`1px solid ${game.status==='active'?'rgba(39,174,96,0.3)':'rgba(230,190,0,0.25)'}`, borderRadius:999, padding:'3px 10px', color:game.status==='active'?'#27AE60':C.gold, fontSize:9, fontWeight:700 }}>
                {game.status==='active'?'En vivo':game.status==='waiting'?'Esperando':'Pausado'}
              </div>
            </div>
            {/* Numero actual */}
            <div style={{ textAlign:'center', padding:'12px 0', marginBottom:10 }}>
              <div style={{ color:C.muted, fontSize:10, marginBottom:6 }}>Ultimo numero cantado</div>
              <div style={{ width:64, height:64, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:900, color:'#000', margin:'0 auto 8px' }}>
                {game.current_number || '?'}
              </div>
              <div style={{ color:C.muted, fontSize:11 }}>Cantados: {(game.called_numbers||[]).length}/75</div>
            </div>
            {/* Acciones */}
            {game.status === 'waiting' && (
              <button onClick={startGame} style={{ ...S.btnGold, marginBottom:8 }}>Iniciar partida</button>
            )}
            {game.status === 'active' && game.mode === 'manual' && (
              <button onClick={callNumber} disabled={calling} style={{ ...S.btnGold, marginBottom:8, opacity:calling?.7:1 }}>
                {calling ? 'Cantando...' : 'ð± Cantar siguiente numero'}
              </button>
            )}
            {game.status === 'active' && game.mode === 'auto' && (
              <div style={{ background:'rgba(39,174,96,0.08)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:9, padding:'10px', textAlign:'center', marginBottom:8, color:'#27AE60', fontSize:11, fontWeight:700 }}>
                Modo automatico activo â cantando cada {game.auto_interval}s
              </div>
            )}
            <button onClick={finishGame} style={{ ...S.btnOutline, borderColor:'rgba(192,57,43,0.4)', color:'#E74C3C' }}>Finalizar partida</button>
          </div>

          {/* Numeros cantados */}
          <div style={{ ...S.card, marginBottom:14 }}>
            <div style={{ color:'#fff', fontSize:12, fontWeight:700, marginBottom:10 }}>Numeros cantados ({(game.called_numbers||[]).length})</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {(game.called_numbers||[]).map(n => (
                <div key={n} style={{ width:30, height:30, borderRadius:8, background:`rgba(230,190,0,0.15)`, border:`1px solid rgba(230,190,0,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontSize:10, fontWeight:700 }}>{n}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
