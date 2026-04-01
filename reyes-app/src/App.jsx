import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './lib/supabase.js'

const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)
const fmtDate = d => new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtTime = d => new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
const medals = ['🥇', '🥈', '🥉', '🎯', '🎖️']

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
  supportWhatsapp: '3013986016', supportWhatsappText: 'WhatsApp', supportWhatsappMsg: 'Hola! Necesito ayuda',
  paymentWhatsapp: '3013986016', showWAPayButton: true, imgDeleteDays: 3,
  winnersInstagram: '',
  paymentNequi: '', paymentDaviplata: '', paymentBancolombia: '', paymentOtro: '', paymentNota: '',
  notifAutoNewRaffle: true, notifAuto24h: true, notifAuto2h: true,
  notifAutoPaymentConfirmed: true, notifAutoUnpaidReminder: true, notifAutoResult: false,
}

// ─── PWA HOOK ─────────────────────────────────────────────────────────────────
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

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [authPage, setAuthPage] = useState(null)
  const [raffles, setRaffles] = useState([])
  const [loadingRaffles, setLoadingRaffles] = useState(true)
  const [selectedRaffle, setSelectedRaffle] = useState(null)
  const [myTickets, setMyTickets] = useState([])
  const [selectedNums, setSelectedNums] = useState([])
  const [allReservedNums, setAllReservedNums] = useState([])
  const [showReservePopup, setShowReservePopup] = useState(false)
  const [pendingNums, setPendingNums] = useState(null)
  const [appConfig, setAppConfig] = useState(DEFAULT_CONFIG)
  const [societyData, setSocietyData] = useState(null)
  const [supportTicketContext, setSupportTicketContext] = useState(null) // { raffle, number }
  const [bingoVisible, setBingoVisible] = useState(false)
  const pwa = usePWA()
  const [toast, setToast] = useState(null)
  function showToast(msg, type='success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    // Hash navigation — lacasadelasdinamicas.com/#admin
    if (window.location.hash === '#admin') {
      setPage('admin')
      window.location.hash = ''
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await fetchProfile(u.id)
        const p = JSON.parse(localStorage.getItem('pendingNums') || 'null')
        if (p?.raffleId && p?.nums?.length > 0) setPendingNums(p)
      } else {
        setProfile(null)
      }
    })
    fetchConfig()
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchRaffles()
    // Realtime — cuando el admin crea/edita un sorteo se actualiza en todos los dispositivos
    const ch = supabase.channel('raffles-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raffles' }, () => fetchRaffles())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])
  useEffect(() => {
    if (!user) return
    fetchMyTickets()
    // Realtime — boletos y sociedades se actualizan solos
    const ch = supabase.channel(`my-tickets-${user.id}`)
      .on('postgres_changes', { event:'*', schema:'public', table:'tickets', filter:`user_id=eq.${user.id}` }, () => fetchMyTickets())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [user])
  useEffect(() => {
    if (!selectedRaffle) return
    fetchReserved(selectedRaffle.id)
    const ch = supabase.channel(`tickets-${selectedRaffle.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `raffle_id=eq.${selectedRaffle.id}` }, () => fetchReserved(selectedRaffle.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'society_tickets', filter: `raffle_id=eq.${selectedRaffle.id}` }, () => fetchReserved(selectedRaffle.id))
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
    await fetchMyTickets()
    // Pequeño delay para que fetchMyTickets termine antes de ir al perfil
    setTimeout(() => setPage('profile'), 300)
  }

  async function fetchConfig() {
    const { data } = await supabase.from('app_config').select('*').eq('id', 1).single()
    if (data) setAppConfig(prev => ({ ...prev, ...data }))
  }
  async function fetchReserved(id) {
    // Tickets normales
    const { data } = await supabase.from('tickets').select('numbers').eq('raffle_id', id).in('status', ['reserved', 'paid'])
    const normalNums = (data || []).flatMap(t => t.numbers || [])
    // Society tickets — numeros con 2 socios completos se marcan como reservados en la tabla
    // Society completas (2 socios) Y en espera (1 socio) se marcan como ocupadas
    // Excluir canceladas explícitamente
    const { data: sData } = await supabase.from('society_tickets')
      .select('number')
      .eq('raffle_id', id)
      .in('status', ['waiting', 'complete'])  // canceladas NO se incluyen
    const societyOccupied = (sData || []).map(s => s.number)
    setAllReservedNums([...normalNums, ...societyOccupied])
  }
  async function fetchProfile(id) {
    const { data } = await supabase.from('users_profile').select('*').eq('id', id).single()
    if (data) setProfile(data)
  }
  async function fetchRaffles() {
    // Mostrar cache inmediatamente mientras carga
    try {
      const cached = localStorage.getItem('lcdd_raffles')
      if (cached) { setRaffles(JSON.parse(cached)); setLoadingRaffles(false) }
    } catch(e) {}
    try {
      const { data, error } = await supabase.from('raffles').select('*').eq('status','active').order('created_at',{ascending:false})
      if (error) { console.error('fetchRaffles error:', error); return }
      const fresh = data || []
      setRaffles(fresh)
      setLoadingRaffles(false)
      try { localStorage.setItem('lcdd_raffles', JSON.stringify(fresh)) } catch(e) {}
    } catch(e) { setLoadingRaffles(false) }
  }
  async function fetchMyTickets() {
    if (!user) return
    // Mostrar cache inmediatamente
    try {
      const cached = localStorage.getItem('lcdd_tickets_'+user.id)
      if (cached) setMyTickets(JSON.parse(cached))
    } catch(e) {}
    try {
      const { data } = await supabase.from('tickets')
        .select('*, raffles(title,raffle_date,lottery_name,ticket_price,prizes,close_time,society_numbers)')
        .eq('user_id', user.id)
        .in('status', ['reserved','paid','winner'])
        .order('created_at', { ascending: false })
      if (data) {
        setMyTickets(data)
        try { localStorage.setItem('lcdd_tickets_'+user.id, JSON.stringify(data)) } catch(e) {}
      }
      // Tambien cargar society_tickets del usuario
      const { data: sData } = await supabase.from('society_tickets')
        .select('*, raffles(title,raffle_date,lottery_name,ticket_price,prizes,close_time)')
        .or(`socio1_id.eq.${user.id},socio2_id.eq.${user.id}`)
        .in('status', ['waiting','complete','paid'])
        .order('created_at', { ascending: false })
      if (sData && sData.length > 0) {
        // Convertir society_tickets al formato de myTickets para mostrar en perfil
        const societyAsTickets = sData.map(st => {
          const iOwn100 = st.socio1_id === user.id && st.socio2_id === user.id
          const isSocio1 = st.socio1_id === user.id
          const pct = iOwn100 ? 100 : 50
          const myAmt = iOwn100
            ? (st.socio1_amount||0) + (st.socio2_amount||0) || (st.raffles?.ticket_price||0)
            : isSocio1
              ? (st.socio1_amount || Math.round((st.raffles?.ticket_price||0)/2))
              : (st.socio2_amount || Math.round((st.raffles?.ticket_price||0)/2))
          return {
          id: 'soc_'+st.id,
          raffle_id: st.raffle_id,
          raffles: st.raffles,
          numbers: [st.number],
          status: (st.status==='complete'||st.status==='waiting') ? 'reserved' : st.status==='paid' ? 'paid' : 'reserved',
          total_amount: myAmt,
          is_society: !iOwn100,    // si tengo el 100% ya no es "sociedad" — es completo
          is_society_full: iOwn100, // flag para mostrar "100% tuyo"
          society_id: st.id,
          society_pct: pct,
          society_status: st.status,
          society_partner: iOwn100 ? null : (isSocio1 ? st.socio2_id : st.socio1_id),
          created_at: st.created_at
          }  // close return object
        })  // close .map() — mostrar todos los society tickets del usuario sin filtrar
        // Merge: normales + sociedad
        const regular = data || []
        const merged = [...regular, ...societyAsTickets]
        setMyTickets(merged)
        try { localStorage.setItem('lcdd_tickets_'+user.id, JSON.stringify(merged)) } catch(e) {}
      }
    } catch(e) { console.error('fetchMyTickets:', e) }
  }
  async function doLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setAuthPage(null)
    const hasPending = localStorage.getItem('pendingNums')
    setPage(hasPending ? 'profile' : 'home')
  }
  async function doRegister(name, phone, email, password) {
    const refCode = 'CASA-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, phone, referral_code: refCode } } })
    if (error) throw error
    if (data.session) {
      await supabase.from('users_profile').upsert({ id: data.user.id, full_name: name, phone, email, role: 'customer', credits: appConfig.showWelcomeBonus ? 500 : 0, points: appConfig.showWelcomeBonus ? 1000 : 0, referral_code: refCode, is_promoter: false })
      setUser(data.user); await fetchProfile(data.user.id)
      setAuthPage(null)
      // Si tenía boletos pendientes, esperar a que reservePending los procese y ir al perfil
      const hasPending = localStorage.getItem('pendingNums')
      setPage(hasPending ? 'profile' : 'home')
      return
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
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin' || user?.email === 'domenechgoet@gmail.com' || profile?.email === 'domenechgoet@gmail.com'

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
        {page === 'home' && <HomePage raffles={raffles} loadingRaffles={loadingRaffles} displayName={displayName} appConfig={appConfig} onRaffle={r => { setSelectedRaffle(r); setSelectedNums([]); setPage('raffle') }} user={user} onHow={() => setPage('how')} onWinners={() => setPage('winners')} />}
        {page === 'raffle' && selectedRaffle && <RafflePage raffle={selectedRaffle} user={user} allReservedNums={allReservedNums} selectedNums={selectedNums} setSelectedNums={setSelectedNums} onShowPopup={() => setShowReservePopup(true)} onBack={() => setPage('home')} onSociety={async (num, mode) => {
          if (!user) { setAuthPage('login'); return }
          const halfPrice = Math.round(selectedRaffle.ticket_price / 2)
          try {
            // Solo buscar registros activos — ignorar cancelled
          const { data: fresh } = await supabase.from('society_tickets')
              .select('*').eq('raffle_id', selectedRaffle.id).eq('number', num)
              .in('status', ['waiting','complete','paid']).limit(1)
            const st = fresh?.[0]

            // Si no hay registro activo, verificar si hay cancelled para reutilizar
            const { data: cancelledRows } = !st ? await supabase.from('society_tickets')
              .select('id').eq('raffle_id', selectedRaffle.id).eq('number', num)
              .eq('status','cancelled').limit(1) : { data: [] }
            const cancelledId = cancelledRows?.[0]?.id

            const exp = new Date(Date.now()+48*3600000).toISOString()

            if (!st) {
              // LIBRE — insertar o reutilizar cancelled
              const payload = {
                raffle_id: selectedRaffle.id, number: num,
                socio1_id: user.id, socio1_paid: false, socio1_amount: halfPrice,
                socio2_id: (mode==='full'||mode==='buy_other_half') ? user.id : null,
                socio2_paid: false, socio2_amount: (mode==='full'||mode==='buy_other_half') ? halfPrice : 0,
                status: (mode==='full'||mode==='buy_other_half') ? 'complete' : 'waiting',
                expires_at: exp, updated_at: new Date().toISOString()
              }
              if (cancelledId) {
                const { error } = await supabase.from('society_tickets').update(payload).eq('id', cancelledId)
                if (error) throw error
              } else {
                const { error } = await supabase.from('society_tickets').insert(payload)
                if (error) throw error
              }
            } else if (mode === 'socio2' || (!st.socio2_id && st.socio1_id !== user.id)) {
              if (st.socio2_id) { alert('Este número ya no está disponible.'); return }
              const { error } = await supabase.from('society_tickets').update({
                socio2_id: user.id, socio2_paid: false, socio2_amount: halfPrice,
                status: 'complete', updated_at: new Date().toISOString()
              }).eq('id', st.id)
              if (error) throw error
            } else if (mode === 'buy_other_half' && st.socio1_id === user.id && !st.socio2_id) {
              const { error } = await supabase.from('society_tickets').update({
                socio2_id: user.id, socio2_paid: false, socio2_amount: halfPrice,
                status: 'complete', updated_at: new Date().toISOString()
              }).eq('id', st.id)
              if (error) throw error
            }

            await fetchMyTickets()
            setTimeout(() => setPage('profile'), 200)
          } catch(e) { console.error('Society error:', e); throw e }
        }} />}
        {page === 'profile' && <ProfilePage user={user} profile={profile} myTickets={myTickets} onLogout={doLogout} onLogin={() => setAuthPage('login')} onRegister={() => setAuthPage('register')} onPromoter={() => setPage('promoter')} onBecomePromoter={becomePromoter} isAdmin={isAdmin} onAdmin={() => setPage('admin')} onRefresh={fetchMyTickets} onSupport={(ctx) => { setSupportTicketContext(ctx||null); setPage('support') }} appConfig={appConfig} pwa={pwa} />}
        {page === 'promoter' && <PromoterPage user={user} profile={profile} onBack={() => setPage('profile')} />}
        {page === 'points' && appConfig.showPoints && <PointsPage user={user} profile={profile} onLogin={() => setAuthPage('login')} />}
        {page === 'support' && <SupportPage user={user} profile={profile} isAdmin={isAdmin} onBack={() => setPage('home')} appConfig={appConfig} ticketContext={supportTicketContext} />}
        {page === 'admin' && <AdminSafe user={user} isAdmin={isAdmin} raffles={raffles} appConfig={appConfig} setAppConfig={setAppConfig} onBack={() => setPage('home')} onOpenSupport={() => setPage('admin-support')} onOpenSociety={() => setPage('admin-society')} onOpenBingo={() => setPage('admin-bingo')} onRefreshRaffles={fetchRaffles} />}
        {page === 'admin-support' && <SupportPage user={user} profile={profile} isAdmin={true} onBack={() => setPage('admin')} appConfig={appConfig} />}
        {page === 'winners' && <WinnersPage onBack={() => setPage('home')} onRaffle={() => setPage('home')} />}
        {page === 'society' && societyData && <SocietyPage user={user} profile={profile} raffle={societyData.raffle} number={societyData.number} onBack={() => { setPage('raffle') }} onLogin={() => setAuthPage('login')} />}
        {page === 'admin-society' && <AdminSocietyPanel raffles={raffles} onBack={() => setPage('admin')} />}
        {page === 'bingo' && <BingoPage user={user} profile={profile} appConfig={appConfig} onLogin={() => setAuthPage('login')} onBack={() => setPage('home')} />}
        {page === 'admin-bingo' && <AdminBingoPanel onBack={() => setPage('admin')} />}
        {page === 'how' && <HowItWorksPage onBack={() => setPage('home')} onRegister={() => setAuthPage('register')} />}
      </main>
      {/* TOAST */}
      {toast && (
        <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', zIndex:9999, background: toast.type==='error'?'#C0392B':toast.type==='warning'?'#E67E22':'#27AE60', color:'#fff', borderRadius:12, padding:'12px 20px', fontSize:13, fontWeight:700, maxWidth:'85vw', textAlign:'center', display:'flex', alignItems:'center', gap:8 }}>
          <span>{toast.type==='error'?'⚠️':toast.type==='warning'?'⏳':'✅'}</span>
          {toast.msg}
        </div>
      )}
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
            {!user && (
              <div style={{ background:'rgba(230,190,0,0.06)', border:'1px solid rgba(230,190,0,0.15)', borderRadius:9, padding:'8px 12px', marginBottom:10, textAlign:'center' }}>
                <span style={{ color:C.muted, fontSize:11 }}>Se pedirá login — </span>
                <span style={{ color:C.gold, fontSize:11, fontWeight:700 }}>tus números quedan guardados ✓</span>
              </div>
            )}
            <button onClick={handleReserve} style={{ ...S.btnGold, marginBottom: 10 }}>
              {user ? 'Confirmar reserva' : 'Continuar para apartar'}
            </button>
            <div style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginBottom: 10 }}>{selectedRaffle.release_hours ? (() => { const d = new Date(Date.now() + (selectedRaffle.release_hours||24)*3600000); return `Los numeros quedan guardados hasta el ${d.toLocaleDateString('es-CO',{day:'numeric',month:'long'})} a las ${d.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}` })() : 'Los numeros quedan guardados 24 horas mientras confirmas el pago'}</div>
            <button onClick={() => setShowReservePopup(false)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#444', fontSize: 13, cursor: 'pointer', padding: 8, fontFamily: 'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CHOOSE AUTH ──────────────────────────────────────────────────────────────
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
          <div style={{ color: C.gold, fontSize: 18 }}>→</div>
        </div>
        <div onClick={onLogin} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 18, marginBottom: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(201,162,39,0.1)', border: `1px solid rgba(201,162,39,0.25)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.gold} strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </div>
          <div style={{ flex: 1 }}><div style={{ color: '#fff', fontWeight: 900, fontSize: 15, marginBottom: 3 }}>Ya tengo cuenta</div><div style={{ color: C.muted, fontSize: 12 }}>Iniciar sesion y reclamar mis numeros</div></div>
          <div style={{ color: '#666', fontSize: 18 }}>→</div>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', width: '100%', textAlign: 'center', fontSize: 13, fontFamily: 'inherit' }}>Volver al sorteo</button>
      </div>
    </div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
// ─── RAFFLE CARD — nuevo estilo negro + borde amarillo ──────────────────────
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
          {isFeatured && <span style={{ background: `rgba(230,190,0,0.15)`, border: `1px solid rgba(230,190,0,0.4)`, borderRadius: 999, padding: '3px 9px', color: C.gold, fontSize: 7, fontWeight: 800 }}>⭐ DESTACADO</span>}
          {hasSociety && <span style={{ background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: 999, padding: '3px 8px', color: '#CE93D8', fontSize: 7, fontWeight: 700 }}>👥 Sociedad</span>}
          {hasPresale && <span style={{ background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: 999, padding: '3px 8px', color: '#CE93D8', fontSize: 7, fontWeight: 700 }}>Preventa</span>}
        </div>
        <span style={{ color: C.muted, fontSize: 10 }}>🎱 {r.lottery_name}</span>
      </div>
      {/* Titulo */}
      <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px', lineHeight: 1.3 }}>{r.title}</h3>
      {/* Info fecha/loteria/numeros */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        {[['📅', new Date(r.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})], ['🎱', r.lottery_name], ['🔢', `00 — ${String(r.number_range-1).padStart(2,'0')}`]].map(([ic,v]) => (
          <div key={ic} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '5px 6px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 9 }}>{ic}</div>
            <div style={{ color: '#fff', fontSize: 7, fontWeight: 700, marginTop: 1 }}>{v}</div>
          </div>
        ))}
      </div>
      {/* Premios — hasta 4 */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: C.muted, fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Premios</div>
        {prizes.slice(0, 4).map((p, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 11 }}>{medals[i]}</span>
              <span style={{ color: i === 0 ? '#fff' : C.muted, fontSize: i === 0 ? 12 : 11, fontWeight: i === 0 ? 700 : 400 }}>{p.amount || (typeof p==='string'?p:'')}</span>
            </div>
            {p.how_to_win && <div style={{ color:'#555', fontSize:9, marginLeft:18, marginTop:1 }}>↳ {p.how_to_win}</div>}
          </div>
        ))}
      </div>
      {/* Preventa */}
      {hasPresale && (
        <div style={{ background: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.2)', borderRadius: 8, padding: '6px 10px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#CE93D8', fontSize: 9, fontWeight: 700 }}>Preventa —</span>
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
        <button style={{ background: C.gold, color: '#000', border: 'none', borderRadius: 10, padding: '11px 18px', fontWeight: 900, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Participar ↗</button>
      </div>
    </div>
  )
}



function HomePage({ raffles, loadingRaffles, displayName, appConfig, onRaffle, user, onHow, onWinners }) {
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
      {/* Redes sociales — solo si configuradas */}
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
        {appConfig.showWinners && (
          appConfig.winnersInstagram
            ? <a href={appConfig.winnersInstagram} target="_blank" rel="noreferrer" style={{ flex:1, textDecoration:'none' }}>
                <div style={{ background:'linear-gradient(135deg,rgba(240,148,51,0.1),rgba(188,24,136,0.1))', border:'1px solid rgba(220,39,67,0.3)', borderRadius:10, padding:'9px 10px', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5, width:'100%' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" strokeWidth="2" strokeLinecap="round"><defs><linearGradient id="igG" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#igG)"/><circle cx="12" cy="12" r="4" stroke="url(#igG)"/><circle cx="17.5" cy="6.5" r="1" fill="#dc2743" stroke="none"/></svg>
                  <span style={{ background:'linear-gradient(90deg,#f09433,#bc1888)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Ganadores</span>
                </div>
              </a>
            : <button onClick={onWinners} style={{ flex: 1, background: C.bg3, border: '1px solid rgba(39,174,96,0.2)', borderRadius: 10, padding: '9px 10px', color: C.green, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>🏆 Ganadores</button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }}></div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 15, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Dinamicas Activas</h2>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }}></div>
      </div>

      {/* SKELETON mientras cargan */}
      {loadingRaffles && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[1,2].map(i => (
            <div key={i} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:16, padding:18 }} className="pulse">
              <div style={{ background:'#1a1a1a', borderRadius:8, height:16, width:'65%', marginBottom:10 }}></div>
              <div style={{ background:'#1a1a1a', borderRadius:8, height:11, width:'45%', marginBottom:14 }}></div>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {[1,2,3].map(j => <div key={j} style={{ background:'#1a1a1a', borderRadius:8, height:40, flex:1 }}></div>)}
              </div>
              <div style={{ background:'#1a1a1a', borderRadius:10, height:44, width:'100%' }}></div>
            </div>
          ))}
        </div>
      )}

      {/* SORTEOS DESTACADOS */}
      {!loadingRaffles && featuredRaffles.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }}></div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><span>⭐</span> Destacados</h2>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {featuredRaffles.map(r => <RaffleCard key={r.id} r={r} onRaffle={onRaffle} featured />)}
          </div>
        </>
      )}
      {/* RESTO DE SORTEOS */}
      {!loadingRaffles && otherRaffles.length > 0 && (
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


// ─── SOCIETY SECTION — numeros sociedad con estado real ──────────────────────
function SocietySection({ societyNums, raffle: r, user, pad, onSociety, showSocietyInfo, setShowSocietyInfo }) {
  const [societyStates, setSocietyStates] = useState({}) // {num: null | {status, socio1_id, socio2_id, id}}
  const [showModal, setShowModal]         = useState(false)
  const [selectedNum, setSelectedNum]     = useState(null)
  const [selectedMode, setSelectedMode]   = useState(null) // 'society' | 'full' | 'socio2' | 'buy_other_half'
  const [confirming, setConfirming]       = useState(false)

  useEffect(() => {
    loadStates()
    // Poll cada 5 segundos (plan gratuito — sin realtime)
    const interval = setInterval(loadStates, 5000)
    return () => clearInterval(interval)
  }, [r.id])

  async function loadStates() {
    if (!societyNums.length) return
    const { data } = await supabase.from('society_tickets')
      .select('id, number, status, socio1_id, socio2_id, socio1_amount, socio2_amount')
      .eq('raffle_id', r.id)
      .in('number', societyNums)
      .in('status', ['waiting', 'complete', 'paid'])  // excluir cancelled
    const map = {}
    societyNums.forEach(n => { map[n] = null })
    if (data) data.forEach(st => { map[st.number] = st })
    setSocietyStates(map)
  }

  function getNumStatus(n) {
    const st = societyStates[n]
    if (!st) return 'free'                                           // nadie ha reservado
    if (st.socio1_id && st.socio2_id) {
      if (st.socio1_id === user?.id || st.socio2_id === user?.id) return 'i_am_full'  // yo tengo ambas mitades o soy socio
      return 'full'
    }
    if (st.socio1_id === user?.id) return 'i_am_socio1'   // yo soy socio 1, falta otro
    if (st.socio2_id === user?.id) return 'i_am_socio2'   // yo soy socio 2
    return 'waiting'                                       // 1 socio externo, falta 1
  }

  const [showMyModal, setShowMyModal] = useState(false)  // modal especial "ya tengo 50%"

  function openModal(n) {
    const st = getNumStatus(n)
    if (st === 'full' || st === 'i_am_full') return
    setSelectedNum(n)
    if (st === 'i_am_socio1' || st === 'i_am_socio2') {
      setShowMyModal(true)   // modal especial "ya tienes el 50%"
      setSelectedMode('buy_other_half')
    } else if (st === 'waiting') {
      setSelectedMode('socio2')  // auto-set socio2
      setShowModal(true)
    } else {
      setSelectedMode(null)
      setShowModal(true)
    }
  }

  async function confirm() {
    if (!selectedNum || !selectedMode || confirming) return
    if (!user) { onSociety && onSociety(selectedNum, selectedMode); return }
    setConfirming(true)
    const halfPrice = Math.round(r.ticket_price / 2)
    const exp = new Date(Date.now() + 48*3600000).toISOString()
    try {
      // Buscar SOLO registros activos — cancelled son invisibles
      const { data: rows } = await supabase
        .from('society_tickets')
        .select('id, status, socio1_id, socio2_id')
        .eq('raffle_id', r.id)
        .eq('number', selectedNum)
        .in('status', ['waiting', 'complete', 'paid'])
      const active = rows?.[0] || null

      // Determinar acción según estado real
      if (!active) {
        // Verificar si existe un registro cancelled para este número (fallback del delete)
        const { data: cancelled } = await supabase
          .from('society_tickets')
          .select('id')
          .eq('raffle_id', r.id)
          .eq('number', selectedNum)
          .eq('status', 'cancelled')
          .limit(1)
        const cancelledRec = cancelled?.[0]

        if (cancelledRec) {
          // Reutilizar el registro cancelled — actualizarlo en vez de insertar
          const updatePayload = {
            socio1_id: user.id, socio1_paid: false, socio1_amount: halfPrice,
            socio2_id: null, socio2_paid: false, socio2_amount: 0,
            status: selectedMode === 'full' ? 'complete' : 'waiting',
            expires_at: exp, updated_at: new Date().toISOString()
          }
          if (selectedMode === 'full') {
            updatePayload.socio2_id = user.id
            updatePayload.socio2_amount = halfPrice
          }
          const { error } = await supabase.from('society_tickets')
            .update(updatePayload).eq('id', cancelledRec.id)
          if (error) throw error
        } else {
          // LIBRE — insertar nuevo registro
          const payload = {
            raffle_id: r.id, number: selectedNum,
            socio1_id: user.id, socio1_paid: false, socio1_amount: halfPrice,
            status: selectedMode === 'full' ? 'complete' : 'waiting',
            expires_at: exp
          }
          if (selectedMode === 'full') {
            payload.socio2_id = user.id
            payload.socio2_paid = false
            payload.socio2_amount = halfPrice
          }
          const { error } = await supabase.from('society_tickets').insert(payload)
          if (error) throw error
        }

      } else if (active.socio1_id === user.id && !active.socio2_id) {
        // YO SOY SOCIO 1 — comprar la otra mitad
        const { error } = await supabase.from('society_tickets').update({
          socio2_id: user.id, socio2_paid: false, socio2_amount: halfPrice,
          status: 'complete', updated_at: new Date().toISOString()
        }).eq('id', active.id)
        if (error) throw error

      } else if (!active.socio2_id && active.socio1_id !== user.id) {
        // HAY 1 SOCIO EXTERNO — unirse como socio 2
        const { error } = await supabase.from('society_tickets').update({
          socio2_id: user.id, socio2_paid: false, socio2_amount: halfPrice,
          status: 'complete', updated_at: new Date().toISOString()
        }).eq('id', active.id)
        if (error) throw error

      } else if (active.socio1_id === user.id || active.socio2_id === user.id) {
        // YA SOY SOCIO — ir directo al perfil sin error
      } else {
        throw new Error('Este número ya está completo')
      }

      // Refresh states and tickets
      await loadStates()
      if (onSociety) {
        // fetchMyTickets se llama dentro de onSociety para actualizar el perfil
        await onSociety(selectedNum, selectedMode)
      }
      setConfirming(false)
      setShowModal(false)
      setShowMyModal(false)
      // Success toast
      const okDiv = document.createElement('div')
      okDiv.style.cssText = [
        'position:fixed','top:24px','left:50%','transform:translateX(-50%)',
        'z-index:9999','background:linear-gradient(135deg,#1a6b2a,#27AE60)',
        'color:#fff','border-radius:16px','padding:16px 22px',
        'font-size:13px','font-weight:700','max-width:88vw','min-width:240px',
        'box-shadow:0 8px 32px rgba(0,0,0,0.6)',
        'display:flex','align-items:center','gap:12px','font-family:system-ui',
        'border:1px solid rgba(100,255,130,0.3)'
      ].join(';')
      okDiv.innerHTML = '<div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px">✅</div><div style="text-align:left"><div style="font-size:11px;opacity:0.8;margin-bottom:2px">Numero reservado</div><div>#' + String(selectedNum).padStart(2,'0') + ' en sociedad — aparece en tu perfil</div></div>'
      document.body.appendChild(okDiv)
      setTimeout(() => { okDiv.style.transition='opacity .4s'; okDiv.style.opacity='0'; setTimeout(()=>okDiv.remove(),400) }, 3000)
      // Navigate to profile
      setTimeout(() => { if (onSociety) onSociety(selectedNum, selectedMode) }, 600)
    } catch(e) {
      setConfirming(false)
      // Show error as toast instead of native alert
      const errDiv = document.createElement('div')
      errDiv.style.cssText = [
        'position:fixed','top:24px','left:50%','transform:translateX(-50%)',
        'z-index:9999','background:linear-gradient(135deg,#922B21,#C0392B)',
        'color:#fff','border-radius:16px','padding:16px 22px',
        'font-size:13px','font-weight:700','max-width:88vw','min-width:240px',
        'text-align:center','box-shadow:0 8px 32px rgba(0,0,0,0.6)',
        'display:flex','align-items:center','gap:12px','font-family:system-ui',
        'border:1px solid rgba(255,100,100,0.3)'
      ].join(';')
      errDiv.innerHTML = '<div style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">⚠️</div><div style="text-align:left"><div style="font-size:11px;opacity:0.7;margin-bottom:2px">Aviso</div><div>' + (e.message || 'Error al procesar. Intenta de nuevo.') + '</div></div>'
      document.body.appendChild(errDiv)
      setTimeout(() => { errDiv.style.transition='opacity .4s'; errDiv.style.opacity='0'; setTimeout(()=>errDiv.remove(),400) }, 3200)
    }
  }

  const halfPrice = Math.round(r.ticket_price / 2)

  return (
    <>
      <div style={{ background:'linear-gradient(135deg,#0f0619,#1a0d2a)', border:'1px solid rgba(155,89,182,0.35)', borderRadius:18, padding:18, marginBottom:14, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#9B59B6,transparent)' }}></div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div style={{ width:40, height:40, background:'linear-gradient(135deg,#3d1a6e,#6c3db5)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A0E8" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ color:'#C9A0E8', fontSize:13, fontWeight:900 }}>Numeros en Sociedad</div>
            <div style={{ color:'#7b5cad', fontSize:9, marginTop:1 }}>Compra la mitad — recibes el 50% del premio</div>
          </div>
          <button onClick={() => setShowSocietyInfo(true)} style={{ background:'rgba(155,89,182,0.12)', border:'1px solid rgba(155,89,182,0.3)', borderRadius:8, padding:'5px 9px', color:'#9B59B6', fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
            Como funciona?
          </button>
        </div>

        {/* Numeros con estado */}
        <div style={{ color:'#7b5cad', fontSize:9, fontWeight:700, textTransform:'uppercase', marginBottom:8 }}>
          Numeros disponibles ({societyNums.filter(n => getNumStatus(n) !== 'full').length} de {societyNums.length})
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
          {societyNums.map(n => {
            const st = getNumStatus(n)
            const isFull = st === 'full'
            const isWaiting = st === 'waiting'
            const isMine = st === 'i_am_socio1' || st === 'i_am_socio2'
            const isMine1 = st === 'i_am_socio1'
            return (
              <div key={n} onClick={() => !isFull && openModal(n)}
                style={{ background: isFull?'#0d0d0d':st==='i_am_full'?'rgba(39,174,96,0.1)':isMine1?'rgba(52,152,219,0.1)':isWaiting?'linear-gradient(135deg,#1a1040,#2a1a5a)':'linear-gradient(135deg,#2a0d4a,#3d1a6e)',
                  border: isFull?'1px solid #1a1a1a':st==='i_am_full'?'1.5px solid #27AE60':isMine1?'1.5px solid #3498DB':isWaiting?'1.5px solid rgba(155,89,182,0.6)':'1.5px solid #9B59B6',
                  borderRadius:10, padding:'8px 12px', textAlign:'center',
                  cursor:isFull?'not-allowed':'pointer', opacity:isFull?.4:1, position:'relative' }}>
                {/* Badge de estado */}
                <div style={{ position:'absolute', top:-7, right:-4, borderRadius:999, padding:'1px 6px', fontSize:7, fontWeight:700, color:'#fff',
                  background: isFull?'#555':st==='i_am_full'?'#27AE60':isMine1?'#3498DB':isWaiting?'#E67E22':'#27AE60' }}>
                  {isFull?'🔒 Lleno':st==='i_am_full'?'Tú · completo':isMine1?'Tú · falta socio':isWaiting?'1 socio · disponible':'Libre'}
                </div>
                <div style={{ color: isFull?'#444':isMine?'#27AE60':'#C9A0E8', fontSize:20, fontWeight:900, lineHeight:1 }}>{pad(n)}</div>
                <div style={{ color: isFull?'#333':st==='i_am_full'?'#27AE60':isMine1?'#3498DB':isWaiting?'#C9A0E8':'#9B59B6', fontSize:9, fontWeight:600, marginTop:3 }}>
                  {isFull?'Lleno 2/2':st==='i_am_full'?'Tuyo completo':isMine1?'Tu 50% — falta socio':isWaiting?'Disponible 50%':fmt(halfPrice)}
                </div>
              </div>
            )
          })}
        </div>

        {(() => {
          const allFull = societyNums.every(n => { const s = getNumStatus(n); return s === 'full' || s === 'i_am_full' })
          const allMine = societyNums.every(n => { const s = getNumStatus(n); return s === 'i_am_socio1' || s === 'i_am_socio2' || s === 'i_am_full' })
          if (allFull && !allMine) return (
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid #1a1a1a', borderRadius:11, padding:13, textAlign:'center' }}>
              <div style={{ fontSize:16, marginBottom:4 }}>🔒</div>
              <div style={{ color:'#555', fontSize:12, fontWeight:600 }}>Todos los numeros en sociedad ya estan reservados</div>
            </div>
          )
          if (allMine) return (
            <div style={{ background:'rgba(52,152,219,0.08)', border:'1px solid rgba(52,152,219,0.2)', borderRadius:11, padding:13, textAlign:'center' }}>
              <div style={{ color:'#5DADE2', fontSize:12, fontWeight:700 }}>✓ Ya tienes parte de todos los numeros en sociedad</div>
            </div>
          )
          return (
            <button onClick={async () => { await loadStates(); setSelectedNum(null); setSelectedMode(null); setShowModal(true) }} style={{ ...S.btnPurple }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
              Unirme a un numero en sociedad
            </button>
          )
        })()}
      </div>

      {/* MODAL como funciona */}
      {showSocietyInfo && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:400, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setShowSocietyInfo(false)}>
          <div style={{ background:'#141414', borderRadius:'22px 22px 0 0', padding:24, width:'100%', maxWidth:500, border:'1px solid rgba(155,89,182,0.3)', borderBottom:'none', position:'relative', overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#9B59B6,transparent)' }}></div>
            <div style={{ width:38, height:4, background:'#2a2a2a', borderRadius:2, margin:'0 auto 18px' }}></div>
            <div style={{ color:'#C9A0E8', fontSize:15, fontWeight:900, textAlign:'center', marginBottom:16 }}>Como funcionan las sociedades?</div>
            {[['#C9A0E8','Tu pagas','Solo el 50% del valor del boleto'],['#9B59B6','Buscamos','Otra persona que pague el otro 50%'],['#27AE60','Si gana','Cada socio recibe el 50% del premio'],['#E6BE00','Tambien puedes','Comprar las dos mitades y quedarte con el 100%']].map(([col,t,d]) => (
              <div key={t} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'rgba(255,255,255,0.03)', borderRadius:9, padding:10, marginBottom:8 }}>
                <div style={{ width:8, height:8, background:col, borderRadius:'50%', marginTop:4, flexShrink:0 }}></div>
                <div><div style={{ color:col, fontSize:11, fontWeight:700, marginBottom:2 }}>{t}</div><div style={{ color:'#888', fontSize:11, lineHeight:1.5 }}>{d}</div></div>
              </div>
            ))}
            <button onClick={() => setShowSocietyInfo(false)} style={{ ...S.btnPurple, marginTop:8 }}>Entendido</button>
          </div>
        </div>
      )}

      {/* MODAL — ya tengo el 50% de este numero */}
      {showMyModal && selectedNum !== null && (() => {
        const st = societyStates[selectedNum]
        const isSocio1 = st?.socio1_id === user?.id
        const otherHalfFree = !st?.socio2_id
        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:400, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setShowMyModal(false)}>
            <div style={{ background:'#141414', borderRadius:'22px 22px 0 0', padding:22, width:'100%', maxWidth:500, border:'1px solid rgba(52,152,219,0.3)', borderBottom:'none', position:'relative', overflow:'hidden', maxHeight:'88vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#3498DB,transparent)' }}></div>
              <div style={{ width:38, height:4, background:'#2a2a2a', borderRadius:2, margin:'0 auto 16px' }}></div>

              {/* Header — tu numero */}
              <div style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(52,152,219,0.08)', border:'1px solid rgba(52,152,219,0.2)', borderRadius:14, padding:14, marginBottom:14 }}>
                <div style={{ width:52, height:52, background:'rgba(52,152,219,0.15)', border:'2px solid #3498DB', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ color:'#5DADE2', fontSize:22, fontWeight:900 }}>{pad(selectedNum)}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#5DADE2', fontSize:14, fontWeight:700 }}>Ya tienes el 50% del #{pad(selectedNum)}</div>
                  <div style={{ color:'#888', fontSize:11, marginTop:2 }}>Reservado — pendiente de pago</div>
                </div>
                <div style={{ background:'rgba(52,152,219,0.15)', borderRadius:999, padding:'4px 10px', flexShrink:0 }}>
                  <span style={{ color:'#3498DB', fontSize:11, fontWeight:700 }}>50%</span>
                </div>
              </div>

              {/* Resumen */}
              <div style={{ background:'#111', borderRadius:12, padding:14, marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:'#888', fontSize:12 }}>Tu pago</span>
                  <span style={{ color:'#5DADE2', fontSize:13, fontWeight:700 }}>{fmt(halfPrice)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={{ color:'#888', fontSize:12 }}>Si gana, recibes</span>
                  <span style={{ color:'#27AE60', fontSize:12, fontWeight:700 }}>50% del premio</span>
                </div>
                <div style={{ height:1, background:'#1a1a1a', marginBottom:10 }}></div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:8, height:8, background: otherHalfFree?'#E67E22':'#27AE60', borderRadius:'50%' }}></div>
                  <span style={{ color: otherHalfFree?'#E67E22':'#27AE60', fontSize:10 }}>
                    {otherHalfFree ? 'Esperando un segundo socio' : 'Boleto completo — tienes ambas mitades'}
                  </span>
                </div>
              </div>

              {/* Opcion comprar el otro 50% — solo si aún está libre */}
              {otherHalfFree && (
                <div style={{ background:'rgba(230,190,0,0.06)', border:'1px solid rgba(230,190,0,0.2)', borderRadius:12, padding:14, marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#E6BE00" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span style={{ color:C.gold, fontSize:12, fontWeight:700 }}>Quieres el 100% de este numero?</span>
                  </div>
                  <div style={{ color:'#888', fontSize:11, lineHeight:1.6, marginBottom:12 }}>
                    El otro 50% aún está disponible. Si lo compras tú, tendrías el boleto completo y <span style={{ color:C.gold, fontWeight:600 }}>todo el premio si gana</span>.
                  </div>
                  {/* Desglose visual */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#111', borderRadius:9, padding:'10px 12px', marginBottom:12 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ color:'#888', fontSize:9, marginBottom:2 }}>Ya pagaste</div>
                      <div style={{ color:'#5DADE2', fontSize:13, fontWeight:700 }}>{fmt(halfPrice)}</div>
                    </div>
                    <div style={{ color:'#333', fontSize:18 }}>+</div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ color:'#888', fontSize:9, marginBottom:2 }}>Pagarías ahora</div>
                      <div style={{ color:C.gold, fontSize:13, fontWeight:700 }}>{fmt(halfPrice)}</div>
                    </div>
                    <div style={{ color:'#333', fontSize:18 }}>=</div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ color:'#888', fontSize:9, marginBottom:2 }}>Total</div>
                      <div style={{ color:'#27AE60', fontSize:13, fontWeight:700 }}>{fmt(r.ticket_price)}</div>
                    </div>
                  </div>
                  <button onClick={async () => {
                    setConfirming(true)
                    try {
                      // Solo actualizar si el registro sigue activo
                      const { error } = await supabase.from('society_tickets').update({
                        socio2_id: user.id, socio2_paid: false, socio2_amount: halfPrice,
                        status: 'complete', updated_at: new Date().toISOString()
                      }).eq('id', st.id).in('status', ['waiting'])
                      if (error) throw error
                      await loadStates()
                      if (onSociety) await onSociety(selectedNum, 'buy_other_half')
                      setShowMyModal(false)
                      setConfirming(false)
                      // Toast éxito
                      const ok = document.createElement('div')
                      ok.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:9999;background:linear-gradient(135deg,#1a6b2a,#27AE60);color:#fff;border-radius:16px;padding:16px 22px;font-size:13px;font-weight:700;max-width:88vw;min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,0.6);display:flex;align-items:center;gap:12px;font-family:system-ui'
                      ok.innerHTML = '<div style="font-size:22px">✅</div><div><div style="font-size:11px;opacity:.8;margin-bottom:2px">Boleto completo!</div><div>#'+pad(selectedNum)+' ahora es tuyo al 100% — aparece en tu perfil</div></div>'
                      document.body.appendChild(ok)
                      setTimeout(()=>{ok.style.transition='opacity .4s';ok.style.opacity='0';setTimeout(()=>ok.remove(),400)},3000)
                    } catch(e) {
                      setConfirming(false)
                      alert(e.message)
                    }
                  }} disabled={confirming} style={{ width:'100%', background:C.gold, border:'none', borderRadius:10, padding:13, color:'#000', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:confirming?.6:1 }}>
                    {confirming ? 'Procesando...' : `Comprar el otro 50% — ${fmt(halfPrice)}`}
                  </button>
                </div>
              )}

              <button onClick={() => setShowMyModal(false)} style={{ width:'100%', background:'transparent', border:'none', color:'#444', fontSize:12, cursor:'pointer', padding:8, fontFamily:'inherit' }}>Cerrar</button>
            </div>
          </div>
        )
      })()}

      {/* MODAL elegir numero */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:400, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setShowModal(false)}>
          <div style={{ background:'#141414', borderRadius:'22px 22px 0 0', padding:22, width:'100%', maxWidth:500, border:'1px solid rgba(155,89,182,0.3)', borderBottom:'none', position:'relative', overflow:'hidden', maxHeight:'88vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#9B59B6,transparent)' }}></div>
            <div style={{ width:38, height:4, background:'#2a2a2a', borderRadius:2, margin:'0 auto 16px' }}></div>
            <div style={{ color:'#C9A0E8', fontSize:15, fontWeight:900, textAlign:'center', marginBottom:4 }}>Elige tu numero en sociedad</div>
            <div style={{ color:'#7b5cad', fontSize:11, textAlign:'center', marginBottom:16 }}>Toca un numero y selecciona cómo comprarlo</div>

            {societyNums.map(n => {
              const st = getNumStatus(n)
              const isFull = st === 'full'
              const isWaiting = st === 'waiting'
              const isMine1 = st === 'i_am_socio1'
              const isMine2 = st === 'i_am_socio2'
              const isSelected = selectedNum === n

              return (
                <div key={n} style={{ background: isFull?'#0d0d0d':isSelected?'#1a0d2a':'#111', border: isSelected?'2px solid #9B59B6':'1px solid #2a2a2a', borderRadius:12, padding:14, marginBottom:10, opacity:isFull?.4:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: (!isFull&&isSelected)?10:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ color: isFull?'#444':'#C9A0E8', fontSize:26, fontWeight:900 }}>#{pad(n)}</div>
                      <div>
                        {isFull && <div style={{ color:'#555', fontSize:11 }}>Completo — 2/2 socios</div>}
                        {isWaiting && <div style={{ color:'#E67E22', fontSize:11 }}>1 socio registrado — falta 1</div>}
                        {isMine1 && !societyStates[n]?.socio2_id && <div style={{ color:'#27AE60', fontSize:11 }}>Tú eres socio 1 — falta otro socio</div>}
                        {isMine1 && societyStates[n]?.socio2_id && <div style={{ color:'#27AE60', fontSize:11 }}>Ya tienes 2 socios</div>}
                        {isMine2 && <div style={{ color:'#27AE60', fontSize:11 }}>Eres socio 2 de este número</div>}
                        {st === 'free' && <div style={{ color:'#888', fontSize:11 }}>Libre — nadie lo ha reservado</div>}
                      </div>
                    </div>
                    {!isFull && (
                      <button onClick={() => {
                        setSelectedNum(n)
                        if (st === 'i_am_socio1' || st === 'i_am_socio2') {
                          setSelectedMode('buy_other_half')
                          setShowModal(false)
                          setShowMyModal(true)
                        } else if (isWaiting) {
                          setSelectedMode('socio2')
                        } else {
                          setSelectedMode(null)
                        }
                      }} style={{ background: isSelected?'rgba(155,89,182,0.2)':'rgba(155,89,182,0.08)', border:'1px solid rgba(155,89,182,0.3)', borderRadius:8, padding:'5px 10px', color:'#9B59B6', fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                        {isSelected ? 'Seleccionado ✓' : st==='i_am_socio1'||st==='i_am_socio2' ? 'Ver mi 50% →' : isWaiting ? 'Unirme →' : 'Elegir'}
                      </button>
                    )}
                  </div>

                  {/* Opciones según estado */}
                  {isSelected && !isFull && (
                    <div>
                      {/* Libre: puede comprar como sociedad O completo */}
                      {st === 'free' && (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                          <div onClick={() => setSelectedMode('society')} style={{ background:selectedMode==='society'?'rgba(155,89,182,0.2)':'#111', border:selectedMode==='society'?'2px solid #9B59B6':'1px solid #2a2a2a', borderRadius:9, padding:10, textAlign:'center', cursor:'pointer' }}>
                            <div style={{ color:'#C9A0E8', fontSize:11, fontWeight:700, marginBottom:3 }}>En Sociedad</div>
                            <div style={{ color:'#9B59B6', fontSize:18, fontWeight:900 }}>{fmt(halfPrice)}</div>
                            <div style={{ color:'#27AE60', fontSize:9, marginTop:2 }}>Recibes 50% si gana</div>
                          </div>
                          <div onClick={() => setSelectedMode('full')} style={{ background:selectedMode==='full'?'rgba(230,190,0,0.12)':'#111', border:selectedMode==='full'?`2px solid ${C.gold}`:'1px solid #2a2a2a', borderRadius:9, padding:10, textAlign:'center', cursor:'pointer' }}>
                            <div style={{ color:C.gold, fontSize:11, fontWeight:700, marginBottom:3 }}>Completo</div>
                            <div style={{ color:C.gold, fontSize:18, fontWeight:900 }}>{fmt(r.ticket_price)}</div>
                            <div style={{ color:'#888', fontSize:9, marginTop:2 }}>Todo el premio</div>
                          </div>
                        </div>
                      )}
                      {/* Waiting (1 socio externo): auto-confirma como socio 2 sin paso extra */}
                      {isWaiting && (() => {
                        // Auto-set mode cuando se selecciona este numero
                        if (selectedMode !== 'socio2') setTimeout(() => setSelectedMode('socio2'), 0)
                        return (
                          <div style={{ background:'rgba(155,89,182,0.15)', border:'2px solid #9B59B6', borderRadius:9, padding:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div>
                              <div style={{ color:'#C9A0E8', fontSize:12, fontWeight:700 }}>Unirme como socio 2 ✓</div>
                              <div style={{ color:'#27AE60', fontSize:9, marginTop:2 }}>Recibes 50% si gana — listo para confirmar</div>
                            </div>
                            <div style={{ color:'#9B59B6', fontSize:20, fontWeight:900 }}>{fmt(halfPrice)}</div>
                          </div>
                        )
                      })()}
                      {/* Yo soy socio 1, falta socio 2 — puede comprar la otra mitad */}
                      {isMine1 && !societyStates[n]?.socio2_id && (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                          <div style={{ background:'rgba(39,174,96,0.08)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:9, padding:10, textAlign:'center', opacity:.6 }}>
                            <div style={{ color:'#27AE60', fontSize:11, fontWeight:700, marginBottom:3 }}>Tu 50% ✓</div>
                            <div style={{ color:'#27AE60', fontSize:16, fontWeight:900 }}>{fmt(halfPrice)}</div>
                            <div style={{ color:'#888', fontSize:9, marginTop:2 }}>Ya pagado</div>
                          </div>
                          <div onClick={() => setSelectedMode('buy_other_half')} style={{ background:selectedMode==='buy_other_half'?'rgba(230,190,0,0.12)':'#111', border:selectedMode==='buy_other_half'?`2px solid ${C.gold}`:'1px solid #2a2a2a', borderRadius:9, padding:10, textAlign:'center', cursor:'pointer' }}>
                            <div style={{ color:C.gold, fontSize:11, fontWeight:700, marginBottom:3 }}>Comprar el otro 50%</div>
                            <div style={{ color:C.gold, fontSize:16, fontWeight:900 }}>{fmt(halfPrice)}</div>
                            <div style={{ color:'#888', fontSize:9, marginTop:2 }}>Tendrás el 100%</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Boton confirmar */}
            <button onClick={confirm} disabled={!selectedNum || !selectedMode || confirming}
              style={{ width:'100%', background: (!selectedNum||!selectedMode||confirming)?'#2a2a2a':'linear-gradient(135deg,#5b2d8a,#7c3db8)', border:'none', borderRadius:11, padding:14, color: (!selectedNum||!selectedMode||confirming)?'#555':'#fff', fontSize:13, fontWeight:700, cursor:(!selectedNum||!selectedMode||confirming)?'not-allowed':'pointer', fontFamily:'inherit', marginTop:4, marginBottom:8, transition:'all .2s' }}>
              {confirming ? 'Procesando...' : selectedMode==='society' ? `Confirmar — Unirme como socio ${fmt(halfPrice)}` : selectedMode==='full' ? `Confirmar — Comprar completo ${fmt(r.ticket_price)}` : selectedMode==='socio2' ? `Confirmar — Unirme como socio 2 ${fmt(halfPrice)}` : selectedMode==='buy_other_half' ? `Confirmar — Comprar el otro 50% ${fmt(halfPrice)}` : 'Elige un numero y una opcion'}
            </button>
            <button onClick={() => setShowModal(false)} style={{ width:'100%', background:'transparent', border:'none', color:'#444', fontSize:12, cursor:'pointer', padding:8, fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  )
}


// ─── RAFFLE PAGE con SOCIEDAD visual ─────────────────────────────────────────
function RafflePage({ raffle: r, user, allReservedNums, selectedNums, setSelectedNums, onShowPopup, onBack, onSociety }) {
  const range = r.number_range || 100
  const cols  = range <= 100 ? 10 : 20
  const prizes = Array.isArray(r.prizes) ? r.prizes : []
  const societyNums = Array.isArray(r.society_numbers) ? r.society_numbers : []
  const packages = Array.isArray(r.packages) ? r.packages : []
  const promotions = Array.isArray(r.promotions) ? r.promotions : []

  const [verifyName, setVerifyName]   = useState('')
  const [verifyPhone, setVerifyPhone] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [societyModal, setSocietyModal] = useState(null)
  const [societyMode, setSocietyMode]   = useState('society')
  const [showSocietyInfo, setShowSocietyInfo] = useState(false)  // passed to SocietySection
  const [selectedPkg, setSelectedPkg]   = useState(null)

  const pad = n => range <= 100 ? String(n).padStart(2,'0') : String(n).padStart(3,'0')

  const toggleNum = n => {
    if (societyNums.includes(n)) { setSocietyModal(n); setSocietyMode('society'); return }
    setSelectedNums(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  }
  const luckyNum = () => {
    const avail = Array.from({ length:range },(_,i)=>i).filter(n => !allReservedNums.includes(n) && !selectedNums.includes(n) && !societyNums.includes(n))
    if (avail.length) setSelectedNums(prev => [...prev, avail[Math.floor(Math.random()*avail.length)]])
  }

  const pricePerNum = r.presale_active && r.presale_price > 0 ? r.presale_price : r.ticket_price
  const totalPrice  = selectedPkg ? selectedPkg.price : selectedNums.length * pricePerNum
  const activePromo = promotions.find(p => selectedNums.length >= p.buy)

  const shareWA = () => window.open(`https://wa.me/?text=${encodeURIComponent(`La Casa De Las Dinamicas

${r.title}
Boleto: ${fmt(r.ticket_price)}
Sorteo: ${fmtDate(r.raffle_date)}

Aparta tu numero:
www.lacasadelasdinamicas.com`)}`)

  async function verifyTicket() {
    if (!verifyName && !verifyPhone) return
    let ids = []
    if (verifyPhone) { const { data } = await supabase.from('users_profile').select('id').ilike('phone',`%${verifyPhone}%`); ids=(data||[]).map(u=>u.id) }
    else { const { data } = await supabase.from('users_profile').select('id').ilike('full_name',`%${verifyName}%`); ids=(data||[]).map(u=>u.id) }
    if (!ids.length) { setVerifyResult([]); return }
    const { data } = await supabase.from('tickets').select('*').eq('raffle_id',r.id).in('user_id',ids)
    setVerifyResult(data||[])
  }

  const closeTimeStr = r.close_time ? String(r.close_time).slice(0,5) : null

  return (
    <div style={{ paddingBottom:88 }}>
      <style>{CSS}</style>

      {/* ── HEADER compacto ── */}
      <div style={{ background:'#0d0d0d', padding:'12px 16px 14px', borderBottom:`1px solid ${C.cardBorder}` }}>
        {/* Fila 1: Volver | Titulo | Compartir */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:10 }}>
          <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:13, padding:0, fontFamily:'inherit', flexShrink:0 }}>← Volver</button>
          <h1 style={{ color:'#fff', fontSize:14, fontWeight:900, textTransform:'uppercase', textAlign:'center', flex:1, lineHeight:1.2, margin:0 }}>{r.title}</h1>
          <button onClick={shareWA} style={{ background:'rgba(39,174,96,0.15)', border:'1px solid rgba(39,174,96,0.3)', borderRadius:8, color:C.green, cursor:'pointer', padding:'6px 11px', fontSize:11, fontWeight:700, fontFamily:'inherit', flexShrink:0 }}>Compartir</button>
        </div>

        {/* Fila 2: Fecha · Loteria · Cierra — todos juntos en una pastilla */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
          <div style={{ display:'inline-flex', alignItems:'center', background:'#111', border:'1px solid #1a1a1a', borderRadius:999, overflow:'hidden' }}>
            {/* Fecha */}
            <div style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 11px' }}>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke={C.gold} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ color:'#ccc', fontSize:10 }}>{r.raffle_date ? new Date(r.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}) : ''}</span>
            </div>
            <div style={{ width:1, height:16, background:'#2a2a2a', flexShrink:0 }}></div>
            {/* Loteria */}
            <div style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 11px' }}>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ color:'#ccc', fontSize:10 }}>{r.lottery_name}</span>
            </div>
            {/* Cierra — solo si hay close_time */}
            {closeTimeStr && <>
              <div style={{ width:1, height:16, background:'#2a2a2a', flexShrink:0 }}></div>
              <div style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 11px' }}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#E67E22" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ color:'#E67E22', fontSize:10, fontWeight:600 }}>Cierra {closeTimeStr}</span>
              </div>
            </>}
          </div>
        </div>

        {/* Precio */}
        <div style={{ display:'flex', justifyContent:'center' }}>
          {r.presale_active && r.presale_price > 0 ? (
            <div style={{ background:'rgba(155,89,182,0.1)', border:'1px solid rgba(155,89,182,0.3)', borderRadius:999, padding:'6px 16px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:C.muted, fontSize:11, textDecoration:'line-through' }}>{fmt(r.ticket_price)}</span>
              <span style={{ color:'#C9A0E8', fontSize:16, fontWeight:900 }}>{fmt(r.presale_price)}</span>
              <span style={{ background:C.purple, borderRadius:999, padding:'1px 7px', color:'#fff', fontSize:8, fontWeight:700 }}>PREVENTA</span>
            </div>
          ) : (
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(201,162,39,0.08)', border:`1px solid rgba(201,162,39,0.2)`, borderRadius:999, padding:'6px 18px' }}>
              <span style={{ color:C.muted, fontSize:11 }}>Valor del boleto</span>
              <span style={{ color:C.gold, fontSize:16, fontWeight:900 }}>{fmt(r.ticket_price)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── PREMIOS ── */}
      <div style={{ overflowX:'auto', padding:'12px 16px', display:'flex', gap:10, scrollbarWidth:'none' }}>
        {prizes.map((p,i) => (
          <div key={i} style={{ flexShrink:0, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:'12px 16px', minWidth:160, textAlign:'center', position:'relative', overflow:'hidden' }}>
            <GoldLine />
            <div style={{ fontSize:22, marginBottom:4 }}>{medals[i]}</div>
            <div style={{ color:C.muted, fontSize:9, textTransform:'uppercase', marginBottom:4 }}>Premio {i+1}</div>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom: p.how_to_win ? 7 : 0 }}>{p.amount || p.title || p}</div>
            {p.how_to_win && (
              <div style={{ background:'rgba(230,190,0,0.06)', border:'1px solid rgba(230,190,0,0.12)', borderRadius:7, padding:'5px 8px' }}>
                <div style={{ color:'#555', fontSize:7, textTransform:'uppercase', marginBottom:2 }}>Como ganar</div>
                <div style={{ color:'#aaa', fontSize:10, fontWeight:600 }}>{p.how_to_win}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding:'0 16px' }}>

        {/* PAQUETES */}
        {r.packages_active && packages.length > 0 && (
          <div style={{ ...S.card, marginBottom:14 }}>
            <GoldLine />
            <div style={{ color:'#fff', fontWeight:800, fontSize:13, marginBottom:10 }}>Paquetes con descuento</div>
            <div style={{ display:'flex', gap:8, overflow:'auto', scrollbarWidth:'none', paddingBottom:4 }}>
              <div onClick={() => setSelectedPkg(null)} style={{ flexShrink:0, background:!selectedPkg?'rgba(201,162,39,0.15)':'#1a1a1a', border:`1px solid ${!selectedPkg?C.gold:'rgba(255,255,255,0.07)'}`, borderRadius:11, padding:'10px 14px', cursor:'pointer', minWidth:68, textAlign:'center' }}>
                <div style={{ color:'#fff', fontSize:9, fontWeight:700, marginBottom:3 }}>Individual</div>
                <div style={{ color:C.gold, fontSize:13, fontWeight:900 }}>{fmt(pricePerNum)}</div>
              </div>
              {packages.map((pkg,i) => {
                const isSelected = selectedPkg?.qty === pkg.qty
                const savings = (pkg.qty * pricePerNum) - pkg.price
                return (
                  <div key={i} onClick={() => { setSelectedPkg(pkg); setSelectedNums(prev=>prev.slice(0,pkg.qty)) }} style={{ flexShrink:0, background:isSelected?'rgba(201,162,39,0.15)':'#1a1a1a', border:`${isSelected?'2px':'1px'} solid ${isSelected?C.gold:'rgba(255,255,255,0.07)'}`, borderRadius:11, padding:'10px 14px', cursor:'pointer', minWidth:80, textAlign:'center', position:'relative', overflow:'hidden' }}>
                    {isSelected && <GoldLine />}
                    <div style={{ background:C.green, borderRadius:999, padding:'1px 5px', color:'#fff', fontSize:6, fontWeight:700, marginBottom:3, display:'inline-block' }}>-{Math.round(savings/pkg.qty*100/pricePerNum)}%</div>
                    <div style={{ color:'#fff', fontSize:9, fontWeight:700, marginBottom:3 }}>{pkg.qty} boletos</div>
                    <div style={{ color:C.gold, fontSize:13, fontWeight:900 }}>{fmt(pkg.price)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PROMO ACTIVA */}
        {activePromo && (
          <div style={{ background:'rgba(39,174,96,0.08)', border:'1px solid rgba(39,174,96,0.25)', borderRadius:11, padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:20 }}>🎁</span>
            <div><div style={{ color:C.green, fontSize:11, fontWeight:800 }}>{activePromo.label}</div><div style={{ color:C.muted, fontSize:9, marginTop:2 }}>{activePromo.get} numero(s) gratis</div></div>
          </div>
        )}

        {/* ── LEYENDA — fuera de la tabla ── */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:10 }}>
          {[['#111','1px solid #333','#fff','Disponible'],['rgba(201,162,39,0.2)',`2px solid ${C.gold}`,C.gold,'Seleccionado'],['#050505','1px solid #0d0d0d','#555','Apartado']].map(([bg,border,color,label]) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:22, height:22, background:bg, border, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>{label==='Apartado'&&<span style={{fontSize:9}}>🔒</span>}</div>
              <span style={{ fontSize:11, color:C.muted }}>{label}</span>
            </div>
          ))}
          {societyNums.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:22, height:22, background:'#1a0d2a', border:'1.5px solid #9B59B6', borderRadius:6 }}></div>
              <span style={{ fontSize:11, color:C.purple, fontWeight:700 }}>Sociedad</span>
            </div>
          )}
        </div>

        {/* ── TABLA NUMEROS — limpia, solo numeros ── */}
        <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:18, padding:14, marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:7, height:7, background:C.green, borderRadius:'50%', display:'inline-block' }} className="pulse"></span>
              <span style={{ color:C.green, fontSize:11, fontWeight:600 }}>En vivo</span>
            </div>
            <button onClick={luckyNum} style={{ background:`rgba(201,162,39,0.1)`, border:`1px solid rgba(201,162,39,0.25)`, borderRadius:8, color:C.gold, fontSize:11, fontWeight:700, padding:'7px 14px', cursor:'pointer', fontFamily:'inherit' }}>Al azar</button>
          </div>

          {/* GRID — numeros blancos grandes */}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:5 }}>
            {Array.from({ length:range },(_,n) => {
              const isSoc = societyNums.includes(n)
              const isRes = allReservedNums.includes(n)
              const isSel = selectedNums.includes(n)
              const pStr  = pad(n)
              if (isSoc) return (
                <div key={n} onClick={() => { setSocietyModal(n); setSocietyMode('society') }} className="society-glow"
                  style={{ aspectRatio:1, borderRadius:8, background:'#1a0d2a', border:'1.5px solid #9B59B6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'rgba(201,160,232,0.4)' }}></div>
                  <div style={{ fontSize: range<=100?11:9, fontWeight:900, color:'#C9A0E8', lineHeight:1 }}>{pStr}</div>
                  <div style={{ fontSize:8, lineHeight:1, marginTop:1 }}>👥</div>
                </div>
              )
              if (isRes) return <div key={n} style={{ aspectRatio:1, border:'1px solid #111', borderRadius:8, background:'#050505', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, cursor:'not-allowed' }}>🔒</div>
              if (isSel) return <div key={n} onClick={() => toggleNum(n)} style={{ aspectRatio:1, border:`2px solid ${C.gold}`, borderRadius:8, background:'rgba(201,162,39,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:range<=100?13:11, fontWeight:900, color:C.gold, cursor:'pointer' }}>{pStr}</div>
              return <div key={n} onClick={() => toggleNum(n)} style={{ aspectRatio:1, border:'1px solid #1a1a1a', borderRadius:8, background:'#111', display:'flex', alignItems:'center', justifyContent:'center', fontSize:range<=100?13:11, fontWeight:700, color:'#fff', cursor:'pointer' }}>{pStr}</div>
            })}
          </div>

        </div>

        {/* BARRA FLOTANTE sticky — aparece al seleccionar números */}
        {selectedNums.length > 0 && (
          <div style={{ position:'sticky', bottom:68, zIndex:90, background:'rgba(0,0,0,0.95)', borderTop:`2px solid ${C.gold}`, borderRadius:'14px 14px 0 0', padding:'12px 16px', marginTop:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div>
                <div style={{ color:C.muted, fontSize:10, marginBottom:2 }}>Seleccionados</div>
                <div style={{ color:C.gold, fontSize:14, fontWeight:900 }}>{selectedNums.map(n=>pad(n)).join('  ·  ')}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ color:C.muted, fontSize:10, marginBottom:2 }}>Total</div>
                <div style={{ color:C.gold, fontSize:20, fontWeight:900 }}>{fmt(totalPrice)}</div>
              </div>
            </div>
            <button onClick={onShowPopup} style={{ ...S.btnGold, margin:0 }}>
              Apartar mis numeros
            </button>
          </div>
        )}

        {/* ── SECCION SOCIEDAD ── */}
        {societyNums.length > 0 && (
          <SocietySection
            societyNums={societyNums}
            raffle={r}
            user={user}
            pad={pad}
            onSociety={onSociety}
            showSocietyInfo={showSocietyInfo}
            setShowSocietyInfo={setShowSocietyInfo}
          />
        )}

        {/* VERIFICAR BOLETO */}
        <div style={{ ...S.card, marginBottom:14 }}>
          <GoldLine />
          <h3 style={{ color:C.gold, fontWeight:900, fontSize:14, margin:'0 0 4px', textAlign:'center' }}>Verificar mi boleto</h3>
          <p style={{ color:C.muted, fontSize:12, margin:'0 0 14px', textAlign:'center' }}>Consulta si tu numero esta correctamente apartado</p>
          <label style={{ fontSize:10, fontWeight:700, color:C.gold, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Nombre del participante</label>
          <input value={verifyName} onChange={e=>setVerifyName(e.target.value)} placeholder="Ej: Carlos Rodriguez" style={{ marginBottom:8 }} />
          <div style={{ textAlign:'center', color:'#333', fontSize:11, margin:'6px 0' }}>— o —</div>
          <label style={{ fontSize:10, fontWeight:700, color:C.gold, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Celular / WhatsApp</label>
          <input value={verifyPhone} onChange={e=>setVerifyPhone(e.target.value)} placeholder="3001234567" style={{ marginBottom:14 }} />
          <button onClick={verifyTicket} style={S.btnGold}>Verificar boleto</button>
          {verifyResult !== null && (
            <div style={{ marginTop:14 }}>
              {verifyResult.length === 0
                ? <div style={{ textAlign:'center', color:C.muted, fontSize:13, padding:'16px 0' }}>No se encontraron boletos</div>
                : verifyResult.map((t,i) => (
                  <div key={i} style={{ background:C.bg3, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:14, marginBottom:8 }}>
                    <div style={{ color:C.gold, fontSize:18, fontWeight:900, marginBottom:4 }}>#{(t.numbers||[]).map(n=>pad(n)).join(' · ')}</div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={S.badge(t.status==='paid'?'green':'dim')}>{t.status==='paid'?'Pago confirmado':'Pendiente'}</span>
                      <span style={{ color:'#fff', fontWeight:700 }}>{fmt(t.total_amount)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL SOCIEDAD — todos los numeros + opcion completo/sociedad ── */}
      {societyModal !== null && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setSocietyModal(null)}>
          <div style={{ background:'#111', borderRadius:'22px 22px 0 0', padding:24, width:'100%', maxWidth:500, border:'1px solid rgba(155,89,182,0.35)', borderBottom:'none', position:'relative', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#9B59B6,transparent)' }}></div>
            <div style={{ width:40, height:4, background:'#2a2a2a', borderRadius:2, margin:'0 auto 18px' }}></div>
            <div style={{ color:'#C9A0E8', fontSize:15, fontWeight:900, textAlign:'center', marginBottom:14 }}>Confirmar sociedad</div>

            {/* Numero seleccionado */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
              <div style={{ background:'linear-gradient(135deg,#2a0d4a,#3d1a6e)', border:'2.5px solid #9B59B6', borderRadius:16, padding:'16px 28px', textAlign:'center' }}>
                <div style={{ color:'#C9A0E8', fontSize:38, fontWeight:900, lineHeight:1 }}>{pad(societyModal)}</div>
                <div style={{ color:'#9B59B6', fontSize:13, fontWeight:700, marginTop:6 }}>{fmt(r.ticket_price/2)}</div>
              </div>
            </div>

            {/* Resumen claro */}
            <div style={{ background:'#0d0d0d', borderRadius:12, padding:'12px 14px', marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                <span style={{ color:'#888', fontSize:13 }}>Pagas ahora</span>
                <span style={{ color:'#C9A0E8', fontSize:15, fontWeight:700 }}>{fmt(r.ticket_price/2)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                <span style={{ color:'#888', fontSize:13 }}>Si el numero gana</span>
                <span style={{ color:'#27AE60', fontSize:13, fontWeight:700 }}>Recibes el 50% del premio</span>
              </div>
              <div style={{ height:1, background:'#1a1a1a', margin:'7px 0' }}></div>
              <div style={{ color:'#555', fontSize:10, textAlign:'center' }}>El otro socio cubre el 50% restante del boleto</div>
            </div>

            {/* Boton confirmar → directo, sin double-click */}
            <button onClick={async (e) => {
              e.currentTarget.disabled = true
              e.currentTarget.textContent = 'Procesando...'
              const num = societyModal
              setSocietyModal(null)
              if(onSociety) await onSociety(num)
            }} style={{ ...S.btnPurple, marginBottom:10 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              Confirmar — Unirme como socio {fmt(r.ticket_price/2)}
            </button>
            <button onClick={() => setSocietyModal(null)} style={{ width:'100%', background:'transparent', border:'none', color:'#444', fontSize:13, cursor:'pointer', padding:8, fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}


// ─── COMO FUNCIONA ────────────────────────────────────────────────────────────
function HowItWorksPage({ onBack, onRegister }) {
  const steps = [
    { num:'1', color:'#E6BE00', icon:'M3 3h18v18H3z M9 9h6 M9 13h6 M9 17h4', title:'Elige tu dinamica', desc:'Explora las dinamicas activas. Cada una tiene sus premios, fecha de sorteo y valor del boleto.' },
    { num:'2', color:'#E6BE00', icon:'M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0', title:'Aparta tu numero', desc:'Selecciona el numero que quieres y apartalo en tiempo real antes que otra persona lo tome.' },
    { num:'3', color:'#27AE60', icon:'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z', title:'Confirma el pago', desc:'Envia el comprobante de pago por WhatsApp. Lo validamos y aseguramos tu numero de inmediato.' },
    { num:'4', color:'#9B59B6', icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', title:'Espera el sorteo', desc:'El sorteo se realiza en la fecha indicada. El numero ganador lo determina la loteria oficial colombiana.' },
    { num:'5', color:'#E67E22', icon:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M8 12l3 3 5-5', title:'Cobra tu premio', desc:'Si tu numero gana, te contactamos directamente para hacer efectivo el pago del premio en efectivo.' },
  ]
  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      <style>{CSS}</style>
      <div style={{ background:C.bg2, padding:'11px 16px', borderBottom:'1px solid #111', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:13, padding:0, fontFamily:'inherit' }}>← Volver</button>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:22, height:22, background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center' }}><LogoSVG size={22} /></div>
          <span style={{ color:'#fff', fontSize:11, fontWeight:900 }}>La Casa</span>
        </div>
        <div style={{ width:40 }}></div>
      </div>
      <div style={{ padding:'20px 16px 40px', maxWidth:500, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:60, height:60, background:'linear-gradient(135deg,#1a1200,#2a1e00)', border:'2px solid #E6BE00', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <LogoSVG size={36} />
          </div>
          <div style={{ color:'#fff', fontSize:20, fontWeight:900, marginBottom:5 }}>Como funciona?</div>
          <div style={{ color:C.muted, fontSize:12 }}>Participar es muy facil, solo sigue estos pasos</div>
        </div>
        {steps.map((step, idx) => (
          <div key={idx} style={{ display:'flex', gap:12, marginBottom: idx < steps.length-1 ? 4 : 0 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
              <div style={{ width:32, height:32, background:step.color, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:900, color:'#000' }}>{step.num}</div>
              {idx < steps.length-1 && <div style={{ width:2, flex:1, minHeight:14, background:`linear-gradient(180deg,${step.color},transparent)`, margin:'3px 0' }}></div>}
            </div>
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 14px', flex:1, marginBottom:12 }}>
              <div style={{ marginBottom:10 }}>
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={step.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {step.icon.split(' ').reduce((acc, token, i, arr) => {
                    if (token === 'M' || token === 'm') return acc
                    return acc
                  }, null)}
                  <path d={step.icon.split(' M ').map((p,i) => i===0 ? p : 'M '+p).join(' ')} />
                </svg>
              </div>
              <div style={{ color:'#fff', fontSize:13, fontWeight:800, marginBottom:5 }}>{step.title}</div>
              <div style={{ color:C.muted, fontSize:11, lineHeight:1.6 }}>{step.desc}</div>
            </div>
          </div>
        ))}
        <button onClick={onRegister} style={{ ...S.btnGold, marginTop:8 }}>Participar ahora →</button>
      </div>
    </div>
  )
}


// ─── GANADORES ────────────────────────────────────────────────────────────────
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
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:20, fontSize:14, padding:0, fontFamily:'inherit' }}>← Volver</button>
      <div style={{ textAlign:'center', marginBottom:26 }}>
        <div style={{ fontSize:52, marginBottom:14 }}>🏆</div>
        <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, margin:'0 0 8px' }}>Ganadores de La Casa</h1>
        <p style={{ color:C.muted, fontSize:14, margin:0 }}>Personas reales que ganaron sus premios</p>
      </div>
      {list.map((w,i) => (
        <div key={i} style={{ background:`linear-gradient(160deg,#1a1200,${C.card})`, border:`1px solid ${C.cardBorder}`, borderRadius:16, padding:16, marginBottom:12, display:'flex', gap:14, alignItems:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
          <div style={{ width:50, height:50, background:`${w.color}20`, border:`2px solid ${w.color}40`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:22 }}>🏆</div>
          <div style={{ flex:1 }}>
            <div style={{ color:'#fff', fontWeight:800, fontSize:14 }}>{w.name}</div>
            <div style={{ color:C.gold, fontSize:13, fontWeight:700, margin:'2px 0' }}>{w.prize}</div>
            <div style={{ display:'flex', gap:10, fontSize:10, color:C.muted }}>
              <span>📍 {w.city}</span><span>📅 {w.date}</span>
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

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfilePage({ user, profile, myTickets, onLogout, onLogin, onRegister, isAdmin, onAdmin, onRefresh, onSupport, appConfig, pwa }) {
  const [tab, setTab] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ full_name:'', phone:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) setEditForm({ full_name: profile.full_name||'', phone: profile.phone||'' })
  }, [profile])

  async function saveProfile() {
    if (!editForm.full_name.trim()) { alert('Ingresa tu nombre'); return }
    setSaving(true)
    await supabase.from('users_profile').update({ full_name: editForm.full_name, phone: editForm.phone }).eq('id', user.id)
    setSaving(false); setShowEditModal(false); onRefresh && onRefresh()
  }

  if (!user) return (
    <div style={{ ...S.content, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:60, textAlign:'center' }}>
      <h2 style={{ color:'#fff', fontWeight:900, marginBottom:8 }}>Mi Cuenta</h2>
      <p style={{ color:C.muted, marginBottom:28, fontSize:14 }}>Inicia sesion para ver tus boletos</p>
      <button onClick={onLogin} style={{ ...S.btnGold, maxWidth:280 }}>Ingresar a La Casa</button>
      <button onClick={onRegister} style={{ ...S.btnOutline, maxWidth:280, marginTop:12 }}>Crear cuenta gratis</button>
    </div>
  )

  const name  = profile?.full_name || user.email || ''
  const phone = profile?.phone || ''

  const groupTickets = (tickets) => {
    const groups = {}
    tickets.forEach(t => {
      // Clave única: sociedad y completo NUNCA se mezclan
      const raffleKey = t.raffle_id || t.raffles?.id || t.id
      const key = t.is_society ? 'soc_' + (t.society_id || raffleKey + '_' + t.id) : 'reg_' + raffleKey
      if (!groups[key]) groups[key] = { raffle: t.raffles, tickets: [], status: t.status, isSociety: !!t.is_society }
      groups[key].tickets.push(t)
    })
    return Object.values(groups)
  }

  const reserved       = myTickets.filter(t => t.status === 'reserved')
  const paid           = myTickets.filter(t => t.status === 'paid')
  const reservedGroups = groupTickets(reserved)
  const paidGroups     = groupTickets(paid)

  // Android PWA detection
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)

  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      <style>{CSS}</style>

      {/* ── HEADER NEGRO ── */}
      <div style={{ background:'#000', padding:'16px 16px 14px', borderBottom:'1px solid #111' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:52, height:52, background:'#111', borderRadius:'50%', border:'2px solid #E6BE00', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:C.gold, position:'relative', flexShrink:0 }}>
              {name[0]?.toUpperCase() || 'U'}
              <div style={{ position:'absolute', bottom:2, right:2, width:12, height:12, background:C.green, borderRadius:'50%', border:'2px solid #000' }} className="pulse"></div>
            </div>
            <div>
              <div style={{ color:'#fff', fontSize:17, fontWeight:900, lineHeight:1.2 }}>Hola, <span style={{ color:C.gold }}>{name.split(' ')[0]}</span></div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5 }}>
                <div style={{ background:'rgba(230,190,0,0.1)', border:'1px solid rgba(230,190,0,0.2)', borderRadius:999, padding:'2px 9px' }}>
                  <span style={{ color:C.gold, fontSize:9 }}>{isAdmin ? 'Administrador' : 'Jugador'}</span>
                </div>
                {phone && <span style={{ color:'#555', fontSize:10 }}>{phone}</span>}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:7 }}>
            <button onClick={() => setShowEditModal(true)} style={{ width:36, height:36, background:'#111', border:'1px solid #2a2a2a', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={C.gold} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            {isAdmin && <button onClick={onAdmin} style={{ height:36, background:'#111', border:'1px solid #2a2a2a', borderRadius:9, color:C.gold, fontSize:10, fontWeight:700, cursor:'pointer', padding:'0 12px', fontFamily:'inherit' }}>Admin</button>}
            <button onClick={onLogout} style={{ height:36, background:'#C0392B', border:'none', borderRadius:9, display:'flex', alignItems:'center', gap:6, cursor:'pointer', padding:'0 13px', fontFamily:'inherit' }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>Salir</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:'13px 16px 90px' }}>

        {/* MI DINERO */}
        <div style={{ background:'linear-gradient(135deg,#0d1628,#0a1220)', border:'1px solid rgba(41,128,185,0.3)', borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#5DADE2" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span style={{ color:'#5DADE2', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.5 }}>Mi Dinero</span>
            </div>
            <button onClick={() => { if(onSupport) { onSupport({ recargar:true }); } }} style={{ background:'#E67E22', border:'none', borderRadius:9, padding:'9px 16px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Recargar saldo
            </button>
          </div>
          <div style={{ color:'#fff', fontSize:28, fontWeight:900, lineHeight:1, marginBottom:3 }}>{fmt(profile?.credits || 0)}</div>
          <div style={{ color:'#4a7a9b', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Disponible</div>
        </div>

        {/* MIS PUNTOS */}
        <div style={{ background:'#0d0d0d', border:'1px solid rgba(230,190,0,0.22)', borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              <span style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.5 }}>Mis Puntos</span>
            </div>
            <button onClick={() => alert('Historial de puntos — proximamente!')} style={{ background:C.gold, border:'none', borderRadius:9, padding:'9px 16px', display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontFamily:'inherit' }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#000" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ color:'#000', fontSize:12, fontWeight:700 }}>Ver historial</span>
            </button>
          </div>
          <div style={{ color:C.gold, fontSize:28, fontWeight:900, display:'flex', alignItems:'baseline', gap:6 }}>
            {(profile?.points || 0).toLocaleString()} <span style={{ color:'#333', fontSize:13, fontWeight:400 }}>pts</span>
          </div>
        </div>

        {/* BANNER ANDROID */}
        {isAndroid && pwa && !pwa.isInstalled && (
          <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:12, padding:'11px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:10, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ width:34, height:34, borderRadius:9, overflow:'hidden', flexShrink:0, border:'1px solid rgba(230,190,0,0.25)' }}><LogoSVG size={34} /></div>
            <div style={{ flex:1 }}>
              <div style={{ color:'#fff', fontSize:12, fontWeight:800 }}>Instala La Casa</div>
              <div style={{ color:C.muted, fontSize:9, marginTop:1 }}>Acceso rapido + funciona sin internet</div>
            </div>
            {pwa.canInstall
              ? <button onClick={pwa.install} style={{ background:C.gold, border:'none', borderRadius:8, padding:'8px 13px', color:'#000', fontSize:10, fontWeight:800, cursor:'pointer', flexShrink:0, fontFamily:'inherit' }}>Instalar</button>
              : <span style={{ color:C.muted, fontSize:9, flexShrink:0, textAlign:'right', maxWidth:70, lineHeight:1.4 }}>Menu → Agregar a pantalla</span>
            }
          </div>
        )}

        {/* TABS — solo Reservas y Pagados */}
        <div style={{ background:'#111', borderRadius:12, padding:3, display:'flex', gap:2, marginBottom:16 }}>
          {[['Reservas', reserved.length, 0],['Pagados', paid.length, 1]].map(([lb,cnt,i]) => (
            <button key={lb} onClick={() => setTab(i)} style={{ flex:1, padding:'10px 4px', borderRadius:9, border:'none', background:tab===i?C.gold:'transparent', cursor:'pointer', fontFamily:'inherit', position:'relative' }}>
              <span style={{ color:tab===i?'#000':'#555', fontSize:12, fontWeight:tab===i?800:500 }}>{lb}{cnt>0?' ('+cnt+')':''}</span>
            </button>
          ))}
        </div>

        {/* TITULO BOLETOS */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <div style={{ width:3, height:18, background:C.gold, borderRadius:2 }}></div>
          <span style={{ color:'#fff', fontSize:13, fontWeight:900, textTransform:'uppercase', letterSpacing:.5 }}>
            {tab === 0 ? 'Boletos reservados' : 'Boletos pagados'}
          </span>
        </div>

        {myTickets.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:C.muted }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🎟️</div>
            <div style={{ color:'#fff', fontSize:14, fontWeight:600, marginBottom:6 }}>Aun no tienes boletos</div>
            <div style={{ fontSize:12 }}>Participa en una dinamica!</div>
          </div>
        ) : (
          <>
            {tab === 0 && (
              reservedGroups.length > 0
                ? reservedGroups.map((g,i) => <RaffleTicketGroup key={i} group={g} status="reserved" profile={profile} appConfig={appConfig} onRefresh={onRefresh} onSupport={onSupport} />)
                : <div style={{ textAlign:'center', padding:'30px 0', color:C.muted }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>🎟️</div>
                    <div style={{ color:'#fff', fontSize:13 }}>Sin boletos reservados</div>
                  </div>
            )}
            {tab === 1 && (
              paidGroups.length > 0
                ? paidGroups.map((g,i) => <RaffleTicketGroup key={i} group={g} status="paid" profile={profile} appConfig={appConfig} onRefresh={onRefresh} onSupport={onSupport} />)
                : <div style={{ textAlign:'center', padding:'30px 0', color:C.muted }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
                    <div style={{ color:'#fff', fontSize:13 }}>Sin boletos pagados aun</div>
                  </div>
            )}
          </>
        )}

        {/* HISTORIAL al fondo */}
        <div style={{ borderTop:'1px solid #111', paddingTop:14, marginTop:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#333" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ color:'#333', fontSize:11, fontWeight:700, textTransform:'uppercase' }}>Historial de boletos</span>
            </div>
            <div onClick={() => alert('Ver historial completo')} style={{ background:'#111', borderRadius:8, padding:'6px 11px', color:'#444', fontSize:10, cursor:'pointer' }}>Ver todo →</div>
          </div>
          <div style={{ color:'#222', fontSize:11, textAlign:'center', padding:'12px 0' }}>Sin boletos anteriores aun</div>
        </div>
      </div>

      {/* MODAL EDITAR */}
      {showEditModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setShowEditModal(false)}>
          <div style={{ background:'#141414', borderRadius:'22px 22px 0 0', padding:24, width:'100%', maxWidth:500, border:'1px solid rgba(230,190,0,0.2)', borderBottom:'none', position:'relative', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#E6BE00,transparent)' }}></div>
            <div style={{ width:40, height:4, background:'#2a2a2a', borderRadius:2, margin:'0 auto 16px' }}></div>
            <div style={{ color:'#fff', fontSize:15, fontWeight:900, marginBottom:16 }}>Editar mis datos</div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Nombre completo</label>
              <input value={editForm.full_name} onChange={e => setEditForm(p=>({...p,full_name:e.target.value}))} placeholder="Tu nombre completo" />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Numero de WhatsApp</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <input value={editForm.phone} onChange={e => setEditForm(p=>({...p,phone:e.target.value}))} placeholder="+57 300 000 0000" style={{ paddingLeft:36 }} />
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} style={{ ...S.btnGold, marginBottom:10 }}>{saving?'Guardando...':'Guardar cambios'}</button>
            <button onClick={() => setShowEditModal(false)} style={{ width:'100%', background:'transparent', border:'none', color:'#444', fontSize:13, cursor:'pointer', padding:8, fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}


// ─── RAFFLE TICKET GROUP — todos los numeros del mismo sorteo en una tarjeta ──
// ─── MODAL LIBERAR ─────────────────────────────────────────────────────────────
function LiberarModal({ allNums, tickets, liberarNum, setLiberarNum, onClose, onRefresh, isSociety }) {
  const [working, setWorking] = useState(false)
  const pad2 = n => String(n).padStart(2,'0')

  async function doLiberar() {
    if (liberarNum === null || liberarNum === undefined || working) return
    setWorking(true)
    try {
      const ticket = tickets.find(t => (t.numbers||[]).includes(liberarNum))
      if (!ticket) { alert('Boleto no encontrado'); setWorking(false); return }

      const isSocTicket = String(ticket.id).startsWith('soc_')

      if (isSocTicket) {
        const realId = ticket.society_id || String(ticket.id).replace('soc_','')
        const { error } = await supabase.from('society_tickets').delete().eq('id', realId)
        if (error) {
          const { error: e2 } = await supabase.from('society_tickets')
            .update({ status:'cancelled', updated_at: new Date().toISOString() }).eq('id', realId)
          if (e2) throw e2
        }
      } else {
        const nums = ticket.numbers || []
        if (nums.length <= 1) {
          const { error } = await supabase.from('tickets').update({ status:'released' }).eq('id', ticket.id)
          if (error) throw error
        } else {
          const newNums = nums.filter(x => x !== liberarNum)
          const ppu = ticket.total_amount / nums.length
          const { error } = await supabase.from('tickets').update({ numbers:newNums, total_amount:Math.round(ppu*newNums.length) }).eq('id', ticket.id)
          if (error) throw error
        }
      }
      onRefresh && onRefresh()
      onClose()
    } catch(e) {
      console.error('Liberar error:', e)
      alert('Error: ' + (e.message || 'Intenta de nuevo'))
    }
    setWorking(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'#141414', borderRadius:'22px 22px 0 0', padding:'22px 20px 28px', width:'100%', maxWidth:500, border:'1px solid #1a1a1a', borderBottom:'none', position:'relative', overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#E74C3C,transparent)' }}></div>
        <div style={{ width:38, height:4, background:'#2a2a2a', borderRadius:2, margin:'0 auto 16px' }}></div>
        <div style={{ fontSize:28, textAlign:'center', marginBottom:8 }}>🍀</div>
        <div style={{ color:'#fff', fontSize:14, fontWeight:900, textAlign:'center', marginBottom:4 }}>Elige el numero a liberar</div>
        <div style={{ color:'#666', fontSize:11, textAlign:'center', marginBottom:16 }}>El numero quedara disponible para otros</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
          {allNums.map(n => {
            const sel = liberarNum === n
            return (
              <div key={n} onClick={() => setLiberarNum(sel ? null : n)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:sel?'rgba(231,76,60,0.12)':'#111', border:sel?'1.5px solid #E74C3C':'1px solid #222', borderRadius:10, padding:'12px 14px', cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:34, height:34, background:sel?'rgba(231,76,60,0.2)':'rgba(230,190,0,0.08)', border:sel?'1.5px solid #E74C3C':'1px solid rgba(230,190,0,0.2)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:sel?'#E74C3C':'#E6BE00', fontSize:14, fontWeight:900 }}>{pad2(n)}</span>
                  </div>
                  <span style={{ color:sel?'#E74C3C':'#888', fontSize:13, fontWeight:600 }}>Numero #{pad2(n)}</span>
                </div>
                <div style={{ width:22, height:22, borderRadius:'50%', border:sel?'none':'1.5px solid #333', background:sel?'#E74C3C':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {sel && <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </div>
            )
          })}
        </div>
        <button onClick={doLiberar} disabled={liberarNum===null||working}
          style={{ width:'100%', background:liberarNum!==null&&!working?'rgba(192,57,43,0.15)':'#111', border:liberarNum!==null&&!working?'1px solid rgba(192,57,43,0.4)':'1px solid #1a1a1a', borderRadius:11, padding:14, color:liberarNum!==null&&!working?'#E74C3C':'#444', fontSize:13, fontWeight:700, cursor:liberarNum!==null&&!working?'pointer':'not-allowed', fontFamily:'inherit', marginBottom:10 }}>
          {working ? 'Liberando...' : liberarNum!==null ? `Liberar el #${pad2(liberarNum)}` : 'Selecciona un numero'}
        </button>
        <button onClick={onClose} style={{ width:'100%', background:'#E6BE00', border:'none', borderRadius:11, padding:13, color:'#000', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>
          No, conservar mis numeros 🍀
        </button>
      </div>
    </div>
  )
}


function RaffleTicketGroup({ group, status, profile, appConfig, onRefresh, onSupport }) {
  const { raffle, tickets } = group
  const allNums   = tickets.flatMap(t => t.numbers || [])
  const totalAmt  = tickets.reduce((s,t) => s + (t.total_amount||0), 0)
  const firstTicket = tickets[0] || {}
  const isSociety = group.isSociety || tickets.some(t => t.is_society && !t.is_society_full)
  const isSocietyFull = tickets.some(t => t.is_society_full)
  const isReserved = status === 'reserved'
  const isPaid     = status === 'paid'
  const isFinished = status === 'finished'

  const [showLiberar, setShowLiberar]   = useState(false)
  const [liberarNum, setLiberarNum]     = useState(null)
  const [showInfoDinero, setShowInfoDinero] = useState(false)
  const [showInfoPuntos, setShowInfoPuntos] = useState(false)

  // Colors by status
  const borderColor = isPaid ? 'rgba(39,174,96,0.35)' : isFinished ? '#1a1a1a' : isSocietyFull ? 'rgba(230,190,0,0.35)' : isSociety ? 'rgba(155,89,182,0.35)' : 'rgba(230,190,0,0.35)'
  const lineColor   = isPaid ? '#27AE60' : isFinished ? '#333' : isSocietyFull ? C.gold : isSociety ? '#9B59B6' : C.gold
  const numColor    = isPaid ? '#27AE60' : isFinished ? '#444' : isSocietyFull ? C.gold : isSociety ? '#9B59B6' : C.gold
  const labelColor  = numColor

  // WA pago
  const waNum = (appConfig?.paymentWhatsapp || appConfig?.payment_whatsapp || appConfig?.whatsapp || appConfig?.supportWhatsapp || '').replace(/\D/g,'')
  const numsStr = allNums.map(n => '#'+String(n).padStart(2,'0')).join(', ')
  const waMsg = 'Hola! Quiero pagar mis boletos:%0A%0ASorteo: '+(raffle?.title||'')+'%0ANumeros: '+numsStr+'%0ATotal: $'+totalAmt
  const waUrl = waNum ? 'https://wa.me/'+waNum+'?text='+waMsg : null

  // Pago con Mi Dinero — activo solo si alcanza
  const saldo  = profile?.credits || 0
  const puntos = profile?.points  || 0
  const ptsNeed = totalAmt        // 1 pto = $1 COP (ajustar según regla real)
  const dineroOk = saldo >= totalAmt
  const puntosOk = puntos >= ptsNeed

  // Soporte recargar
  const waSupNum = (appConfig?.supportWhatsapp || appConfig?.whatsapp || appConfig?.paymentWhatsapp || '').replace(/\D/g,'')
  const recargaMsg = encodeURIComponent('Hola! Quisiera recargar saldo a mi cuenta en La Casa de las Dinamicas. Por favor indicarme como hacerlo.')
  const recargaUrl = waSupNum ? 'https://wa.me/'+waSupNum+'?text='+recargaMsg : null

  // Raffle close time
  // Mostrar fecha de cierre del sorteo (no close_time que es solo hora)
  const closeTime = raffle?.raffle_date || null
  const closeFmt = raffle?.raffle_date
    ? new Date(raffle.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})
    : ''

  // Download confirmation image (paid)
  function downloadConfirmation() {
    const canvas = document.createElement('canvas')
    canvas.width = 800; canvas.height = 500
    const ctx = canvas.getContext('2d')
    // Background
    ctx.fillStyle = '#000'
    ctx.fillRect(0,0,800,500)
    // Gold border
    ctx.strokeStyle = '#E6BE00'
    ctx.lineWidth = 3
    ctx.strokeRect(12,12,776,476)
    // Header band
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(12,12,776,90)
    // Title
    ctx.fillStyle = '#E6BE00'
    ctx.font = 'bold 32px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('LA CASA DE LAS DINÁMICAS', 400, 55)
    ctx.fillStyle = '#27AE60'
    ctx.font = '18px system-ui'
    ctx.fillText('CONFIRMACIÓN DE BOLETO PAGADO', 400, 82)
    // Raffle name
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 22px system-ui'
    ctx.fillText(raffle?.title || 'Sorteo', 400, 145)
    // Numbers
    ctx.fillStyle = '#E6BE00'
    ctx.font = 'bold 48px system-ui'
    ctx.fillText(allNums.map(n=>'#'+String(n).padStart(2,'0')).join('  '), 400, 230)
    // Divider
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(60,260); ctx.lineTo(740,260); ctx.stroke()
    // Details
    ctx.fillStyle = '#888'
    ctx.font = '16px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('Titular:', 80, 300)
    ctx.fillText('Total pagado:', 80, 335)
    ctx.fillText('Fecha sorteo:', 80, 370)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px system-ui'
    ctx.fillText(profile?.full_name || 'Jugador', 240, 300)
    ctx.fillText('$'+totalAmt.toLocaleString('es-CO'), 240, 335)
    ctx.fillText(raffle?.raffle_date ? new Date(raffle.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}) : '', 240, 370)
    // Paid badge
    ctx.fillStyle = '#27AE60'
    ctx.font = 'bold 18px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('✓ PAGO CONFIRMADO', 400, 440)
    // Download
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'boleto-'+(raffle?.title||'dinamica').replace(/\s+/g,'-')+'-'+allNums.join('-')+'.png'
    a.click()
  }

  const cardBg = isPaid ? '#0a180a' : isFinished ? '#0a0a0a' : isSocietyFull ? '#1a1500' : isSociety ? '#0d0820' : '#0d0d0d'

  return (
    <div style={{ background:cardBg, border:`1px solid ${borderColor}`, borderRadius:14, padding:14, marginBottom:12, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${lineColor},transparent)` }}></div>

      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div>
          <div style={{ color:'#fff', fontSize:13, fontWeight:900, lineHeight:1.2 }}>{raffle?.title || 'Sorteo'}</div>
          <div style={{ color:'#444', fontSize:9, marginTop:3 }}>
            {closeFmt ? 'Cierra: '+closeFmt : raffle?.raffle_date ? new Date(raffle.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}) : ''}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
          {isReserved && (
            <div style={{ background:'#1a1500', border:'1px solid rgba(230,190,0,0.22)', borderRadius:999, padding:'2px 9px', display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:5, height:5, background:C.gold, borderRadius:'50%' }} className="pulse"></div>
              <span style={{ color:C.gold, fontSize:8, fontWeight:700 }}>Reservado</span>
            </div>
          )}
          {isPaid && (
            <div style={{ background:'rgba(39,174,96,0.12)', border:'1px solid rgba(39,174,96,0.3)', borderRadius:999, padding:'2px 9px', display:'flex', alignItems:'center', gap:4 }}>
              <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#27AE60" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ color:'#27AE60', fontSize:8, fontWeight:700 }}>Pagado</span>
            </div>
          )}
          {isSociety && (
            <div style={{ background:'#1a0d2a', border:'1px solid rgba(155,89,182,0.28)', borderRadius:999, padding:'2px 9px', display:'flex', alignItems:'center', gap:4 }}>
              <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#9B59B6" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <span style={{ color:'#9B59B6', fontSize:8, fontWeight:700 }}>Sociedad</span>
            </div>
          )}
          {isReserved && closeTime && (
            <div style={{ background:'#111', borderRadius:6, padding:'3px 8px', textAlign:'center' }}>
              <div style={{ color:'#555', fontSize:7 }}>Cierra en</div>
              <div style={{ color:'#E67E22', fontSize:10, fontWeight:700 }}>
                {(() => {
                  const diff = new Date(closeTime) - Date.now()
                  if (diff <= 0) return 'Cerrado'
                  const d = Math.floor(diff/86400000)
                  const h = Math.floor((diff%86400000)/3600000)
                  return d > 0 ? d+'d · '+h+'h' : h+'h'
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NUMEROS */}
      <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
        {allNums.map((n,i) => (
          <div key={i} style={{ background:`rgba(${isPaid?'39,174,96':isSociety?'155,89,182':'230,190,0'},0.07)`, border:`1.5px solid rgba(${isPaid?'39,174,96':isSociety?'155,89,182':'230,190,0'},0.4)`, borderRadius:9, padding:'5px 11px' }}>
            <div style={{ color:numColor, fontSize:26, fontWeight:900, lineHeight:1 }}>{'#'+String(n).padStart(2,'0')}</div>
          </div>
        ))}
      </div>

      {/* SOCIEDAD / 100% barra */}
      {(isSociety || isSocietyFull) && firstTicket.society_pct && (
        <div style={{ background: isSocietyFull?'rgba(230,190,0,0.08)':'#1a0d2a', borderRadius:8, padding:'8px 10px', marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            {isSocietyFull
              ? <span style={{ color:C.gold, fontSize:9, fontWeight:700 }}>Tuyo al 100% — premio completo!</span>
              : <span style={{ color:'#888', fontSize:9 }}>Tu parte: <span style={{ color:'#9B59B6', fontWeight:700 }}>{firstTicket.society_pct}%</span></span>
            }
            <span style={{ color: isSocietyFull?C.gold:'#fff', fontSize:9, fontWeight:600 }}>
              Premio: {fmt(Math.round((raffle?.prizes?.[0]?.amount||0)*firstTicket.society_pct/100))}
            </span>
          </div>
          <div style={{ background: isSocietyFull?'rgba(230,190,0,0.12)':'#2a1040', borderRadius:999, height:5 }}>
            <div style={{ background: isSocietyFull?C.gold:'#9B59B6', borderRadius:999, height:5, width:'100%' }}></div>
          </div>
        </div>
      )}

      {/* PREMIO + TOTAL */}
      <div style={{ background:'#111', borderRadius:8, padding:'8px 11px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:'#555', fontSize:9 }}>Premio: <span style={{ color:'#fff', fontWeight:600 }}>
          {raffle?.prizes?.[0]?.amount ? fmt(raffle.prizes[0].amount) : raffle?.prizes?.[0] ? (typeof raffle.prizes[0]==='string' ? raffle.prizes[0] : fmt(raffle.prizes[0])) : raffle?.prize_amount ? fmt(raffle.prize_amount) : 'Ver sorteo'}
        </span></span>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:'#444', fontSize:8 }}>{isPaid ? 'Total pagado' : 'Total a pagar'}</div>
          <div style={{ color:numColor, fontSize:16, fontWeight:900, lineHeight:1 }}>{fmt(totalAmt)}</div>
        </div>
      </div>

      {/* ── BOLETO PAGADO ── */}
      {isPaid && (
        <button onClick={downloadConfirmation} style={{ width:'100%', background:`rgba(${isSociety?'155,89,182':'39,174,96'},0.08)`, border:`1.5px solid rgba(${isSociety?'155,89,182':'39,174,96'},0.35)`, borderRadius:10, padding:11, display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer', fontFamily:'inherit' }}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={isSociety?'#9B59B6':'#27AE60'} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span style={{ color:isSociety?'#9B59B6':'#27AE60', fontSize:11, fontWeight:700 }}>Descargar confirmacion de boleto</span>
        </button>
      )}

      {/* ── BOLETO RESERVADO — opciones de pago ── */}
      {isReserved && (
        <>
          {/* Titulo opciones de pago */}
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:9 }}>
            <div style={{ flex:1, height:1, background:`rgba(${isSociety?'155,89,182':'230,190,0'},0.18)` }}></div>
            <span style={{ color:isSociety?'#9B59B6':C.gold, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:.8 }}>Opciones de pago</span>
            <div style={{ flex:1, height:1, background:`rgba(${isSociety?'155,89,182':'230,190,0'},0.18)` }}></div>
          </div>

          {/* 1. WhatsApp — activado/desactivado desde admin */}
          {appConfig?.showWAPayButton !== false && waUrl && (
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block', marginBottom:6 }}>
              <div style={{ background:'#25D366', borderRadius:10, padding:11, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>Pagar {fmt(totalAmt)} por WhatsApp</span>
              </div>
            </a>
          )}

          {/* 2. Chat soporte — siempre visible */}
          <div onClick={() => onSupport && onSupport({ title:raffle?.title||'', number:allNums[0]||0, price:totalAmt })} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:10, padding:11, display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer', marginBottom:6 }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={C.gold} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span style={{ color:C.gold, fontSize:11, fontWeight:600 }}>Pagar y adjuntar comprobante en chat</span>
          </div>

          {/* 3. Mi Dinero — SOLO si el saldo alcanza */}
          {dineroOk && (
            <button onClick={() => { if(window.confirm('Pagar '+fmt(totalAmt)+' con saldo?')) alert('Pago procesado!') }} style={{ width:'100%', background:'#1a3a5c', border:'1px solid rgba(41,128,185,0.4)', borderRadius:10, padding:11, display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer', marginBottom:6, fontFamily:'inherit' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#5DADE2" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span style={{ color:'#5DADE2', fontSize:11, fontWeight:600 }}>Pagar con Mi Dinero · {fmt(saldo)}</span>
            </button>
          )}

          {/* 4. Puntos — SOLO si alcanza */}
          {puntosOk && (
            <button onClick={() => { if(window.confirm('Usar '+ptsNeed.toLocaleString()+' puntos?')) alert('Pago con puntos!') }} style={{ width:'100%', background:'#1a1500', border:'1px solid rgba(230,190,0,0.35)', borderRadius:10, padding:11, display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer', marginBottom:6, fontFamily:'inherit' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              <span style={{ color:C.gold, fontSize:11, fontWeight:600 }}>Pagar con Puntos · {puntos.toLocaleString()} pts</span>
            </button>
          )}

          {/* Nota discreta solo si tiene puntos pero no alcanzan */}
          {!puntosOk && puntos > 0 && (
            <div style={{ background:'rgba(230,190,0,0.04)', border:'1px solid rgba(230,190,0,0.1)', borderRadius:8, padding:'7px 10px', display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ color:'#555', fontSize:9 }}>Te faltan {Math.max(0,ptsNeed-puntos).toLocaleString()} pts para pagar con puntos</span>
              <span style={{ color:'#E6BE00', fontSize:9, fontWeight:600 }}>{puntos.toLocaleString()}/{ptsNeed.toLocaleString()}</span>
            </div>
          )}

          {/* Liberar — discreto, rojo */}
          <div style={{ height:1, background:'#1a1a1a', marginBottom:8 }}></div>
          <button onClick={() => setShowLiberar(true)} style={{ width:'100%', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'4px 0', opacity:.5 }}>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#E74C3C" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            <span style={{ color:'#E74C3C', fontSize:9, fontWeight:500 }}>Liberar boleto</span>
          </button>
        </>
      )}

      {isFinished && (
        <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:10, textAlign:'center', color:'#333', fontSize:10 }}>Sorteo finalizado</div>
      )}

      {/* MODAL LIBERAR */}
      {showLiberar && <LiberarModal
        allNums={allNums}
        tickets={tickets}
        liberarNum={liberarNum}
        setLiberarNum={setLiberarNum}
        onClose={() => { setShowLiberar(false); setLiberarNum(null) }}
        onRefresh={onRefresh}
        isSociety={isSociety || isSocietyFull}
      />}
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
                <button onClick={() => releaseOne(n)} style={{ width:16, height:16, background:'rgba(192,57,43,0.2)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#E74C3C', fontSize:8, fontWeight:700, padding:0, fontFamily:'inherit' }}>✕</button>
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
            <div style={{ color:C.muted, fontSize:12, marginBottom:16 }}>Numeros {nums.map(n=>String(n).padStart(2,'0')).join(', ')} — {fmt(t.total_amount)}</div>
            <a href={waLink()} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
              <div style={{ background:'#0f1e1a', border:'1px solid rgba(39,174,96,0.25)', borderRadius:12, padding:14, marginBottom:10, display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
                <div style={{ width:40, height:40, background:'#128C7E', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ flex:1 }}><div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>Pagar por WhatsApp</div><div style={{ color:C.green, fontSize:10 }}>Enviar comprobante directo</div></div>
                <div style={{ color:C.green, fontSize:16 }}>→</div>
              </div>
            </a>
            <div onClick={() => { setShowPayModal(false); onSupport() }} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:14, marginBottom:14, display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
              <div style={{ width:40, height:40, background:`rgba(201,162,39,0.1)`, border:`1px solid rgba(201,162,39,0.25)`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={C.gold} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div style={{ flex:1 }}><div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>Chat de soporte</div><div style={{ color:C.muted, fontSize:10 }}>Adjuntar comprobante en el chat</div></div>
              <div style={{ color:'#666', fontSize:16 }}>→</div>
            </div>
            <button onClick={() => setShowPayModal(false)} style={{ width:'100%', background:'transparent', border:'none', color:'#444', fontSize:13, cursor:'pointer', padding:8, fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PROMOTER ─────────────────────────────────────────────────────────────────
function PromoterPage({ user, profile, onBack }) {
  const [referrals, setReferrals] = useState([])
  useEffect(() => { if(user) supabase.from('referrals').select('*').eq('promoter_id', user.id).then(({ data }) => { if(data) setReferrals(data) }) }, [user])
  if (!profile?.is_promoter) return <div style={{ ...S.content, textAlign:'center', paddingTop:60 }}><p style={{ color:C.muted }}>No eres Vendedor Oficial aun</p><button onClick={onBack} style={{ ...S.btnGold, maxWidth:240, margin:'16px auto 0' }}>Volver</button></div>
  const refUrl = `https://www.lacasadelasdinamicas.com/?ref=${profile?.referral_code}`
  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:16, fontSize:14, padding:0, fontFamily:'inherit' }}>← Volver</button>
      <div style={{ background:`linear-gradient(160deg,#1a1200,${C.card})`, border:`1px solid ${C.cardBorder}`, borderRadius:18, padding:18, marginBottom:16, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}><span style={{ fontSize:26 }}>📣</span><div><h2 style={{ color:'#fff', fontWeight:900, fontSize:18, margin:0 }}>Panel del Vendedor</h2><span style={S.badge('green')}>Activo</span></div></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[[referrals.length,'Referidos','👥'],[fmt(profile?.total_earnings||0),'Ganancias','💵'],[fmt(profile?.pending_earnings||0),'Por cobrar','💰'],['15%','Comision N1','📈']].map(([val,label,icon]) => (
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
        {[['Nivel 1 — Venta directa','15%'],['Nivel 2 — Referido de referido','7%'],['Nivel 3','3%']].map(([label,pct]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg3, borderRadius:9, padding:'10px 12px', marginBottom:8 }}>
            <span style={{ color:'#ccc', fontSize:12 }}>{label}</span>
            <span style={S.badge('gold')}>{pct}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── POINTS ───────────────────────────────────────────────────────────────────
function PointsPage({ user, profile, onLogin }) {
  return (
    <div style={S.content}>
      <div style={{ background:`linear-gradient(160deg,#1a1200,${C.card})`, border:`1px solid ${C.cardBorder}`, borderRadius:20, padding:24, marginBottom:20, textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ fontSize:36, marginBottom:10 }}>⭐</div>
        <div style={{ color:C.gold, fontSize:36, fontWeight:900 }}>{(profile?.points || 0).toLocaleString()}</div>
        <div style={{ color:C.muted, fontSize:13, marginTop:4 }}>Puntos de fidelidad</div>
        {!user && <button onClick={onLogin} style={{ ...S.btnGold, marginTop:16 }}>Ingresar para ganar puntos</button>}
      </div>
      {[['🎟️','Comprar un boleto','Por cada boleto confirmado','+100 pts'],['👥','Referir un amigo','Cuando se registra con tu enlace','+500 pts'],['📱','Compartir dinamica','Por cada publicacion compartida','+50 pts'],['💰','Recargar saldo','Por cada recarga realizada','+200 pts'],['📸','Seguirnos en Instagram','@lacasadelasdinamicas','+30 pts']].map(([icon,title,desc,pts]) => (
        <div key={title} style={{ ...S.card, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}><span style={{ fontSize:22 }}>{icon}</span><div><div style={{ color:'#fff', fontWeight:700, fontSize:13 }}>{title}</div><div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{desc}</div></div></div>
          <span style={S.badge('dim')}>{pts}</span>
        </div>
      ))}
    </div>
  )
}

// ─── SUPPORT ──────────────────────────────────────────────────────────────────
function SupportPage({ user, profile, isAdmin, onBack, appConfig, ticketContext }) {
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const [notaModal, setNotaModal] = useState(false)
  const [notaText, setNotaText] = useState('')

  const quickReplies = ['Como pago mi boleto?','Cuando es el sorteo?','Quiero liberar un numero','Quiero ser vendedor','Tuve un problema tecnico']
  const adminReplies = ['Pago confirmado ✓ Tu numero esta asegurado!','Pago rechazado, el comprobante no es valido.','Tu pago esta en revision, en breve te confirmamos.','Necesitamos mas informacion del comprobante.','Tu numero fue liberado exitosamente.']

  useEffect(() => {
    if (isAdmin) {
      loadConversations()
      const ch = supabase.channel('support-admin').on('postgres_changes', { event:'INSERT', schema:'public', table:'support_messages' }, loadConversations).subscribe()
      return () => supabase.removeChannel(ch)
    } else if (user) {
      loadMyMessages()
      // Auto mensaje bienvenida si viene desde boton Pagar
      if (ticketContext) sendWelcomeMsg(ticketContext)
      const ch = supabase.channel(`support-${user.id}`).on('postgres_changes', { event:'INSERT', schema:'public', table:'support_messages', filter:`user_id=eq.${user.id}` }, loadMyMessages).subscribe()
      return () => supabase.removeChannel(ch)
    }
  }, [user, isAdmin])

  useEffect(() => { if (selectedConv && isAdmin) loadConvMessages(selectedConv.user_id) }, [selectedConv])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  async function sendWelcomeMsg(ctx) {
    if (!user || !ctx) return
    // Check if already has messages to avoid duplicates
    const { data: existing } = await supabase.from('support_messages').select('id').eq('user_id', user.id).limit(1)
    if (existing && existing.length > 0) return
    // Send welcome message from admin
    const isRecargar = ctx.recargar
    const welcomeMsg = isRecargar
      ? `Hola, ${profile?.full_name?.split(' ')[0] || 'bienvenido'}! 👋 Quieres recargar saldo a tu cuenta. Dinos el monto que deseas recargar y te indicamos como hacerlo.`
      : `Hola, ${profile?.full_name?.split(' ')[0] || 'bienvenido'}! 👋 Veo que quieres pagar el boleto #${String(ctx.number).padStart(2,'0')} de ${ctx.title} por ${fmt(ctx.price)}. Adjunta aqui el comprobante de pago y lo validamos de inmediato.`
    await supabase.from('support_messages').insert({ user_id:user.id, message:welcomeMsg, from_admin:true })
    // Send payment data
    const payData = buildPaymentMsg()
    if (payData) await supabase.from('support_messages').insert({ user_id:user.id, message:payData, from_admin:true })
    await loadMyMessages()
  }

  function buildPaymentMsg() {
    const lines = []
    if (appConfig?.paymentNequi) lines.push(`📱 Nequi: ${appConfig.paymentNequi}`)
    if (appConfig?.paymentDaviplata) lines.push(`📱 Daviplata: ${appConfig.paymentDaviplata}`)
    if (appConfig?.paymentBancolombia) lines.push(`🏦 Bancolombia: ${appConfig.paymentBancolombia}`)
    if (appConfig?.paymentOtro) lines.push(`💳 ${appConfig.paymentOtro}`)
    if (appConfig?.paymentNota) lines.push(`\n${appConfig.paymentNota}`)
    return lines.length > 0 ? 'Datos para el pago:\n' + lines.join('\n') : null
  }

  async function loadConversations() {
    const { data } = await supabase.from('support_messages').select('*, users_profile(full_name,phone)').order('created_at', { ascending:false })
    if (!data) return
    const map = {}
    data.forEach(m => {
      if (!map[m.user_id]) map[m.user_id] = { user_id:m.user_id, name:m.users_profile?.full_name||'Usuario', phone:m.users_profile?.phone, last_msg:m.image_url?'📷 Imagen adjunta':m.message, last_time:m.created_at, unread:0, hasImage:!!m.image_url }
      if (!m.from_admin) map[m.user_id].unread++
      if (m.image_url) map[m.user_id].hasImage = true
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
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif']
    if (!allowed.includes(file.type)) { alert('Solo se permiten imagenes JPG, PNG, WEBP o GIF.'); return }
    if (file.size > 10 * 1024 * 1024) { alert('La imagen no puede pesar mas de 10MB.'); return }
    const ext = file.name.split('.').pop().toLowerCase()
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2,6)}.${ext}`
    const path = `support/${user.id}/${fileName}`
    try {
      const { error: upErr } = await supabase.storage.from('support-images').upload(path, file, { cacheControl:'3600', upsert:false, contentType:file.type })
      if (upErr) { alert('Error al subir imagen: ' + upErr.message); return }
      const { data: urlData } = supabase.storage.from('support-images').getPublicUrl(path)
      const publicUrl = urlData?.publicUrl
      if (!publicUrl) { alert('No se pudo obtener la URL de la imagen.'); return }
      const deleteAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      await supabase.from('support_messages').insert({ user_id:user.id, message:'Comprobante de pago adjunto', from_admin:false, image_url:publicUrl, delete_at:deleteAt })
      await loadMyMessages()
      // Auto respuesta al recibir imagen
      setTimeout(async () => {
        await supabase.from('support_messages').insert({ user_id:user.id, message:'✅ Recibimos tu comprobante! Tu pago esta en validacion. En breve actualizaremos tu boleto y te notificamos. Gracias por tu paciencia!', from_admin:true })
        await loadMyMessages()
      }, 1200)
    } catch(e) { alert('Error inesperado al procesar la imagen.') }
  }

  async function sendMessage(text) {
    const content = (typeof text === 'string' ? text : msg).trim()
    if (!content) return
    setMsg('')
    try {
      if (isAdmin && selectedConv) {
        await supabase.from('support_messages').insert({ user_id:selectedConv.user_id, message:content, from_admin:true })
        loadConvMessages(selectedConv.user_id)
      } else if (user) {
        await supabase.from('support_messages').insert({ user_id:user.id, message:content, from_admin:false })
        loadMyMessages()
      }
    } catch(e) { console.error('sendMessage error:', e) }
  }

  async function confirmPayment() {
    if (!selectedConv) return
    await supabase.from('support_messages').insert({ user_id:selectedConv.user_id, message:'✅ Pago confirmado! Tu numero esta asegurado. Mucha suerte en el sorteo!', from_admin:true })
    await loadConvMessages(selectedConv.user_id)
  }

  async function rejectPayment() {
    await supabase.from('support_messages').insert({ user_id:selectedConv.user_id, message:'❌ Tu pago fue rechazado. El comprobante no es valido o no coincide con el monto. Por favor envia un nuevo comprobante.', from_admin:true })
    await loadConvMessages(selectedConv.user_id)
  }

  async function giveMoreTime() {
    await supabase.from('support_messages').insert({ user_id:selectedConv.user_id, message:'⏱ Te hemos dado 24 horas adicionales para completar tu pago. Aprovechalas!', from_admin:true })
    await loadConvMessages(selectedConv.user_id)
  }

  async function saveNota() {
    if (!notaText.trim()) return
    await supabase.from('support_messages').insert({ user_id:selectedConv.user_id, message:`[NOTA INTERNA] ${notaText}`, from_admin:true, is_internal:true })
    await loadConvMessages(selectedConv.user_id)
    setNotaModal(false); setNotaText('')
  }

  const waLink = () => { const num=(appConfig?.supportWhatsapp||'').replace(/\D/g,''); return num?`https://wa.me/${num}?text=${encodeURIComponent(appConfig?.supportWhatsappMsg||'Hola!')}`:null }

  const filteredConvs = conversations.filter(c => {
    if (filter === 'image') return c.hasImage
    if (filter === 'unread') return c.unread > 0
    if (filter === 'today') { const today = new Date().toDateString(); return new Date(c.last_time).toDateString() === today }
    return true
  })

  // ── ADMIN VIEW ──────────────────────────────────────────────────────────────
  if (isAdmin) return (
    <div style={{ height:'calc(100vh - 64px)', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.cardBorder}`, display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:13, padding:0, fontFamily:'inherit' }}>← Volver</button>
        <h2 style={{ color:'#fff', fontWeight:800, fontSize:15, margin:0, flex:1 }}>Soporte</h2>
        {conversations.filter(c=>c.unread>0).length > 0 && <span style={{ background:'rgba(192,57,43,0.15)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:999, padding:'2px 9px', color:'#E74C3C', fontSize:9, fontWeight:700 }}>{conversations.filter(c=>c.unread>0).length} nuevos</span>}
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* Lista conversaciones */}
        <div style={{ width: selectedConv ? '35%' : '100%', borderRight:`1px solid ${C.cardBorder}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Filtros */}
          <div style={{ padding:'7px 10px', display:'flex', gap:5, overflowX:'auto', scrollbarWidth:'none', borderBottom:'1px solid #111', flexShrink:0 }}>
            {[['all','Todos'],['unread','Sin leer'],['image','Con imagen'],['today','Hoy']].map(([val,label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ flexShrink:0, background:filter===val?'rgba(230,190,0,0.15)':'#111', border:`1px solid ${filter===val?'rgba(230,190,0,0.4)':'#1a1a1a'}`, borderRadius:999, padding:'4px 9px', color:filter===val?C.gold:'#555', fontSize:8, fontWeight:filter===val?700:400, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>{label}</button>
            ))}
          </div>
          {/* Stats */}
          {!selectedConv && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:5, padding:'8px 10px', borderBottom:'1px solid #111', flexShrink:0 }}>
              {[[conversations.length,'Total',C.gold],[conversations.filter(c=>c.unread>0).length,'Sin leer','#E74C3C'],[conversations.filter(c=>{ const t=new Date().toDateString(); return new Date(c.last_time).toDateString()===t }).length,'Hoy','#27AE60']].map(([v,l,col]) => (
                <div key={l} style={{ background:'#111', borderRadius:8, padding:'7px 6px', textAlign:'center' }}>
                  <div style={{ color:col, fontSize:16, fontWeight:900, lineHeight:1 }}>{v}</div>
                  <div style={{ color:'#444', fontSize:7, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          )}
          {/* Lista */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {filteredConvs.length === 0
              ? <div style={{ textAlign:'center', padding:'30px 16px', color:C.muted }}><div style={{ fontSize:32, marginBottom:8 }}>💬</div>Sin conversaciones</div>
              : filteredConvs.map((conv,i) => (
                <div key={i} onClick={() => setSelectedConv(conv)} style={{ padding:'11px 12px', borderBottom:'1px solid #0d0d0d', cursor:'pointer', background:selectedConv?.user_id===conv.user_id?'rgba(230,190,0,0.05)':'transparent', display:'flex', gap:9, alignItems:'center' }}>
                  <div style={{ width:36, height:36, background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#000', fontSize:13, flexShrink:0 }}>{(conv.name||'U')[0].toUpperCase()}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                      <div style={{ color:'#fff', fontWeight:700, fontSize:11 }}>{conv.name}</div>
                      <div style={{ color:'#444', fontSize:8 }}>{conv.last_time ? fmtTime(conv.last_time) : ''}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      {conv.hasImage && <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#888" stroke="none"/><polyline points="21 15 16 10 5 21"/></svg>}
                      <div style={{ color:C.muted, fontSize:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{conv.last_msg}</div>
                    </div>
                  </div>
                  {conv.unread > 0 && <div style={{ width:18, height:18, background:'#C0392B', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:700, flexShrink:0 }}>{conv.unread}</div>}
                </div>
              ))
            }
          </div>
        </div>

        {/* Conversacion abierta */}
        {selectedConv && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header conv */}
            <div style={{ padding:'9px 12px', borderBottom:`1px solid ${C.cardBorder}`, flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={() => setSelectedConv(null)} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontSize:16, padding:0, flexShrink:0 }}>←</button>
                <div style={{ width:32, height:32, background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#000', fontSize:12, flexShrink:0 }}>{(selectedConv.name||'U')[0].toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{selectedConv.name}</div>
                  {selectedConv.phone && <div style={{ color:C.muted, fontSize:10 }}>{selectedConv.phone}</div>}
                </div>
                <div style={{ display:'flex', gap:5 }}>
                  <button onClick={() => window.open(`https://wa.me/${(selectedConv.phone||'').replace(/\D/g,'')}`)} style={{ background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.25)', borderRadius:7, padding:'5px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ color:'#25D366', fontSize:8, fontWeight:700 }}>WA</span>
                  </button>
                </div>
              </div>
              {/* Herramientas admin */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:4, marginTop:9 }}>
                {[
                  { label:'Confirmar', icon:'M20 6 9 17 4 12', color:'#27AE60', bg:'rgba(39,174,96,0.12)', action:confirmPayment },
                  { label:'Rechazar', icon:'M18 6 6 18 M6 6l12 12', color:'#E74C3C', bg:'rgba(192,57,43,0.1)', action:rejectPayment },
                  { label:'+24h', icon:'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 5.477 10 10-4.477 10-10 10z M12 6v6l4 2', color:C.gold, bg:'rgba(230,190,0,0.08)', action:giveMoreTime },
                  { label:'Boletos', icon:'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z M8 2v4 M16 2v4', color:'#888', bg:'#111', action:()=>{} },
                  { label:'Nota', icon:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6', color:'#888', bg:'#111', action:()=>setNotaModal(true) },
                  { label:'Bloquear', icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.93 4.93l14.14 14.14', color:'#E74C3C', bg:'rgba(192,57,43,0.08)', action:()=>{ if(window.confirm('Bloquear usuario?')) alert('Usuario bloqueado') } },
                ].map((tool,i) => (
                  <button key={i} onClick={tool.action} style={{ background:tool.bg, border:`1px solid ${tool.color}30`, borderRadius:8, padding:'6px 2px', textAlign:'center', cursor:'pointer', fontFamily:'inherit' }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={tool.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 3px' }}><path d={tool.icon}/></svg>
                    <div style={{ color:tool.color, fontSize:6, fontWeight:700 }}>{tool.label}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Mensajes */}
            <div style={{ flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:7 }}>
              {messages.map((m,i) => {
                const isInternal = m.message?.startsWith('[NOTA INTERNA]')
                if (isInternal) return (
                  <div key={i} style={{ background:'#1a1500', border:'1px dashed rgba(230,190,0,0.25)', borderRadius:8, padding:'7px 10px', display:'flex', alignItems:'center', gap:5 }}>
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke={C.gold} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style={{ color:C.gold, fontSize:9, fontStyle:'italic' }}>{m.message.replace('[NOTA INTERNA] ','')}</span>
                  </div>
                )
                return (
                  <div key={i} style={{ display:'flex', justifyContent:m.from_admin?'flex-end':'flex-start' }}>
                    <div style={{ maxWidth:'80%', background:m.from_admin?`linear-gradient(135deg,${C.gold},${C.goldLight})`:C.card, color:m.from_admin?'#000':'#fff', borderRadius:m.from_admin?'14px 14px 4px 14px':'14px 14px 14px 4px', padding:'9px 12px', fontSize:12, border:m.from_admin?'none':`1px solid ${C.cardBorder}` }}>
                      {m.image_url && <img src={m.image_url} alt="comprobante" style={{ width:'100%', borderRadius:8, marginBottom:m.message&&m.message!=='Comprobante de pago adjunto'?6:0, display:'block' }} />}
                      {m.message && m.message !== 'Comprobante de pago adjunto' && <div>{m.message}</div>}
                      <div style={{ fontSize:9, color:m.from_admin?'rgba(0,0,0,.4)':'#555', marginTop:3, textAlign:'right' }}>{fmtTime(m.created_at)}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            {/* Respuestas rapidas admin */}
            <div style={{ padding:'6px 10px', overflowX:'auto', display:'flex', gap:5, scrollbarWidth:'none', borderTop:'1px solid #111', flexShrink:0 }}>
              {adminReplies.map(r => (
                <button key={r} onClick={() => sendMessage(r)} style={{ flexShrink:0, background:C.bg3, border:'1px solid #2a2a2a', borderRadius:999, padding:'4px 10px', color:'#ccc', fontSize:10, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>{r}</button>
              ))}
            </div>
            {/* Input */}
            <div style={{ padding:'9px 12px', borderTop:`1px solid ${C.cardBorder}`, display:'flex', gap:7, flexShrink:0 }}>
              <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key==='Enter'&&sendMessage()} placeholder={`Responder a ${selectedConv.name}...`} style={{ flex:1 }} />
              <button onClick={() => sendMessage()} disabled={loading} style={{ ...S.btnGold, width:'auto', padding:'10px 16px', borderRadius:10 }}>↑</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal nota interna */}
      {notaModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#141414', borderRadius:18, padding:20, width:'100%', maxWidth:400, border:`1px solid ${C.cardBorder}` }}>
            <div style={{ color:'#fff', fontWeight:800, fontSize:15, marginBottom:12 }}>Nota interna</div>
            <div style={{ color:C.muted, fontSize:11, marginBottom:12 }}>Solo tu puedes ver esta nota. No se envia al usuario.</div>
            <textarea value={notaText} onChange={e=>setNotaText(e.target.value)} placeholder="Escribe tu nota aqui..." style={{ height:80, marginBottom:12 }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={saveNota} style={{ ...S.btnGold, flex:1 }}>Guardar nota</button>
              <button onClick={() => setNotaModal(false)} style={{ ...S.btnOutline, flex:1 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── USUARIO sin sesion ──────────────────────────────────────────────────────
  if (!user) return (<div style={{ ...S.content, textAlign:'center', paddingTop:60 }}><div style={{ fontSize:48, marginBottom:16 }}>💬</div><h2 style={{ color:'#fff', fontWeight:800, marginBottom:8 }}>Atencion al Cliente</h2><p style={{ color:C.muted, fontSize:14 }}>Inicia sesion para chatear con nosotros</p></div>)

  // ── USUARIO con sesion ──────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 128px)', background:C.bg }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { if(e.target.files[0]) handleImageUpload(e.target.files[0]); e.target.value='' }} />

      {/* Header */}
      <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.cardBorder}`, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', overflow:'hidden', border:`1px solid rgba(201,162,39,0.3)`, flexShrink:0 }}><LogoSVG size={40} /></div>
        <div style={{ flex:1 }}>
          <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>La Casa — Soporte</div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:7, height:7, background:C.green, borderRadius:'50%', display:'inline-block' }} className="pulse"></span>
            <span style={{ color:C.green, fontSize:11 }}>En linea</span>
          </div>
        </div>
        {waLink() && (
          <a href={waLink()} target="_blank" rel="noreferrer" style={{ textDecoration:'none', flexShrink:0 }}>
            <div style={{ background:'#075E54', borderRadius:10, padding:'7px 10px', display:'flex', alignItems:'center', gap:5 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>WA Directo</span>
            </div>
          </a>
        )}
      </div>

      {/* Contexto boleto (si viene desde Pagar) */}
      {ticketContext && (
        <div style={{ margin:'8px 14px 0', background:'#1a1200', border:'1px solid rgba(230,190,0,0.2)', borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.gold} strokeWidth="2"><rect x="1" y="6" width="22" height="14" rx="2"/><path d="M16 2H8v4h8z"/></svg>
          <div>
            <div style={{ color:C.gold, fontSize:8, fontWeight:700 }}>Quieres pagar:</div>
            <div style={{ color:'#fff', fontSize:10, fontWeight:900 }}>{ticketContext.title} · #{String(ticketContext.number).padStart(2,'0')} · {fmt(ticketContext.price)}</div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:8 }}>
        {messages.length === 0 && (
          <div style={{ background:C.card, borderRadius:'16px 16px 16px 4px', padding:'12px 16px', fontSize:13, color:'#fff', maxWidth:'82%', border:`1px solid ${C.cardBorder}` }}>
            Hola{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋 En que te podemos ayudar hoy?
          </div>
        )}
        {messages.map((m,i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.from_admin?'flex-start':'flex-end' }}>
            <div style={{ maxWidth:'82%', background:m.from_admin?C.card:`linear-gradient(135deg,${C.gold},${C.goldLight})`, color:m.from_admin?'#fff':'#000', border:m.from_admin?`1px solid ${C.cardBorder}`:'none', borderRadius:m.from_admin?'16px 16px 16px 4px':'16px 16px 4px 16px', padding:'10px 14px', fontSize:12 }}>
              {m.image_url && <img src={m.image_url} alt="comprobante" style={{ width:'100%', borderRadius:8, marginBottom:6, display:'block' }} />}
              {m.message && m.message !== 'Comprobante de pago adjunto' && <div style={{ lineHeight:1.5 }}>{m.message}</div>}
              <div style={{ fontSize:10, color:m.from_admin?'#555':'rgba(0,0,0,.4)', marginTop:3, textAlign:'right' }}>{fmtTime(m.created_at)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Respuestas rapidas usuario */}
      <div style={{ padding:'6px 14px', overflowX:'auto', display:'flex', gap:6, scrollbarWidth:'none', flexShrink:0 }}>
        {quickReplies.map(r => (
          <button key={r} onClick={() => sendMessage(r)} style={{ flexShrink:0, background:C.bg3, border:`1px solid #2a2a2a`, borderRadius:999, padding:'5px 12px', color:'#ccc', fontSize:11, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>{r}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'10px 14px', borderTop:`1px solid ${C.cardBorder}`, display:'flex', gap:8, flexShrink:0 }}>
        <button onClick={() => fileInputRef.current?.click()} style={{ width:38, height:38, background:C.bg3, border:'1px solid #2a2a2a', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#888" stroke="none"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key==='Enter'&&sendMessage()} placeholder="Escribe tu mensaje..." style={{ flex:1 }} />
        <button onClick={() => sendMessage()} disabled={loading} style={{ ...S.btnGold, width:'auto', padding:'10px 16px', borderRadius:10 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#000" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}


// ─── ADMIN ────────────────────────────────────────────────────────────────────

// ─── ADMIN SAFE WRAPPER ────────────────────────────────────────────────────────
class AdminErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) return (
      <div style={{ padding:24, color:'#fff', background:'#000', minHeight:'100vh' }}>
        <div style={{ color:'#E74C3C', fontSize:16, fontWeight:700, marginBottom:12 }}>Error en el panel admin:</div>
        <div style={{ color:'#aaa', fontSize:12, fontFamily:'monospace', background:'#111', padding:12, borderRadius:8 }}>
          {this.state.error.message}
        </div>
        <button onClick={() => this.setState({error:null})} style={{ marginTop:16, background:'#E6BE00', border:'none', borderRadius:8, padding:'10px 20px', fontWeight:700, cursor:'pointer' }}>
          Reintentar
        </button>
      </div>
    )
    return this.props.children
  }
}
function AdminSafe(props) {
  return (
    <AdminErrorBoundary>
      <AdminPage {...props} />
    </AdminErrorBoundary>
  )
}


function AdminPage({ user, isAdmin, raffles, appConfig, setAppConfig, onBack, onOpenSupport, onOpenSociety, onOpenBingo, onRefreshRaffles }) {
  const [tab, setTab] = useState(0)
  const [tickets, setTickets] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [localConfig, setLocalConfig] = useState({...DEFAULT_CONFIG, ...(appConfig||{})})
  const [showCreateRaffle, setShowCreateRaffle] = useState(false)
  const [editingRaffle, setEditingRaffle] = useState(null)
  const [adminRaffles, setAdminRaffles] = useState(raffles||[])

  useEffect(() => { loadAdminData() }, [])
  useEffect(() => { setLocalConfig(prev => ({...prev, ...(appConfig||{})})) }, [appConfig])

  async function loadAdminData() {
    try {
      const { data: rd } = await supabase.from('raffles').select('*').order('created_at',{ascending:false})
      if (rd) setAdminRaffles(rd)
      const { data: td } = await supabase.from('tickets').select('*, users_profile(full_name,phone), raffles(title)').order('created_at',{ascending:false}).limit(50)
      if (td) setTickets(td)
      const { count } = await supabase.from('support_messages').select('id',{count:'exact'}).eq('from_admin',false)
      setUnreadCount(count||0)
    } catch(e) { console.error('loadAdminData:', e) }
  }

  async function saveConfig() {
    try {
      await supabase.from('app_config').upsert({ id:1, ...localConfig })
      setAppConfig(localConfig)
      alert('Configuracion guardada!')
    } catch(e) { alert('Error: ' + e.message) }
  }

  if (showCreateRaffle || editingRaffle) {
    return <RaffleForm raffle={editingRaffle} onBack={() => { setShowCreateRaffle(false); setEditingRaffle(null) }} onSave={() => { setShowCreateRaffle(false); setEditingRaffle(null); loadAdminData(); if(onRefreshRaffles) onRefreshRaffles() }} />
  }

  const pending = tickets.filter(t => t.status === 'reserved')
  const totalRecaudo = tickets.filter(t => t.status === 'paid').reduce((a,t) => a+(t.total_amount||0), 0)

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:16, fontSize:14, padding:0, fontFamily:'inherit' }}>← Volver</button>

      {/* Header */}
      <div style={{ background:`linear-gradient(160deg,#1a1200,${C.card})`, border:`1px solid ${C.cardBorder}`, borderRadius:18, padding:18, marginBottom:14, position:'relative', overflow:'hidden' }}>
        <GoldLine />
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:11, overflow:'hidden', border:`1px solid rgba(201,162,39,0.3)` }}><LogoSVG size={44} /></div>
          <div><h2 style={{ color:'#fff', fontWeight:900, fontSize:18, margin:0 }}>Panel de Administracion</h2><div style={{ color:C.muted, fontSize:12 }}>La Casa De Las Dinamicas</div></div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        {[['🎰',adminRaffles.length,'Dinamicas'],['🎟️',tickets.length,'Boletos'],['⏳',pending.length,'Por confirmar'],['💬',unreadCount,'Mensajes']].map(([icon,val,label]) => (
          <div key={label} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:14, textAlign:'center' }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
            <div style={{ fontSize:22, fontWeight:900, color:C.gold }}>{val}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2, textTransform:'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recaudo */}
      <div style={{ background:'linear-gradient(135deg,rgba(39,174,96,0.08),rgba(39,174,96,0.03))', border:'1px solid rgba(39,174,96,0.2)', borderRadius:14, padding:'14px 18px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div><div style={{ color:C.green, fontSize:10, fontWeight:700, textTransform:'uppercase', marginBottom:3 }}>Total recaudado</div><div style={{ color:'#fff', fontSize:24, fontWeight:900 }}>{fmt(totalRecaudo)}</div></div>
        <div style={{ fontSize:32 }}>💰</div>
      </div>

      {/* Acciones rapidas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <button onClick={onOpenSupport} style={{ ...S.btnGold, fontSize:13, position:'relative' }}>
          Atender Clientes
          {unreadCount > 0 && <span style={{ position:'absolute', top:-8, right:-8, width:22, height:22, background:'#C0392B', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:700 }}>{unreadCount}</span>}
        </button>
        <button onClick={() => onOpenSociety && onOpenSociety()} style={{ background:'linear-gradient(135deg,#5b2d8a,#7c3db8)', border:'1px solid rgba(155,89,182,0.4)', borderRadius:12, color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', padding:'14px' }}>👥 Sociedades</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <button onClick={() => onOpenBingo && onOpenBingo()} style={{ background:'linear-gradient(135deg,#1a5a1a,#27AE60)', border:'1px solid rgba(39,174,96,0.4)', borderRadius:12, color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', padding:'14px' }}>🎱 Panel Bingo</button>
        <button onClick={() => setShowCreateRaffle(true)} style={{ background:`linear-gradient(135deg,#1a1200,${C.card})`, border:`1px solid ${C.cardBorder}`, borderRadius:12, color:C.gold, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', padding:'14px' }}>+ Nueva Dinamica</button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.03)', borderRadius:10, padding:4, marginBottom:16 }}>
        {['Dinamicas','Boletos','Config'].map((t,i) => (
          <button key={t} onClick={() => setTab(i)} style={{ flex:1, padding:9, border:'none', background:tab===i?C.card:'transparent', color:tab===i?'#fff':'#555', fontSize:12, fontWeight:700, cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>{t}</button>
        ))}
      </div>

      {/* Tab: Dinamicas */}
      {tab === 0 && (
        <div>
          <button onClick={() => setShowCreateRaffle(true)} style={{ ...S.btnGold, marginBottom:14 }}>+ Crear nueva dinamica</button>
          {adminRaffles.map(r => (
            <div key={r.id} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:14, marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#fff', fontWeight:800, fontSize:14 }}>{r.title}</div>
                  <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{r.raffle_date ? new Date(r.raffle_date).toLocaleDateString('es-CO') : ''} · {fmt(r.ticket_price)}</div>
                </div>
                <span style={{ background: r.status==='active'?'rgba(39,174,96,0.15)':'rgba(255,255,255,0.05)', border:`1px solid ${r.status==='active'?'rgba(39,174,96,0.3)':'#2a2a2a'}`, borderRadius:999, padding:'3px 10px', fontSize:9, color: r.status==='active'?C.green:'#666', fontWeight:700 }}>{r.status==='active'?'Activo':'Borrador'}</span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setEditingRaffle(r)} style={{ flex:1, background:'rgba(201,162,39,0.1)', border:`1px solid rgba(201,162,39,0.2)`, borderRadius:8, padding:'8px', color:C.gold, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Editar</button>
                <button onClick={async () => {
                  if (!window.confirm('Eliminar esta dinamica?')) return
                  await supabase.from('raffles').delete().eq('id', r.id)
                  loadAdminData(); if(onRefreshRaffles) onRefreshRaffles()
                }} style={{ background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:8, padding:'8px 12px', color:'#E74C3C', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Boletos */}
      {tab === 1 && (
        <div>
          {tickets.map(t => (
            <div key={t.id} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>{t.users_profile?.full_name || 'Sin nombre'}</div>
                <span style={{ background: t.status==='paid'?'rgba(39,174,96,0.15)':'rgba(230,190,0,0.08)', border:`1px solid ${t.status==='paid'?'rgba(39,174,96,0.3)':'rgba(230,190,0,0.2)'}`, borderRadius:999, padding:'2px 8px', fontSize:9, color: t.status==='paid'?C.green:C.gold, fontWeight:700 }}>{t.status==='paid'?'Pagado':'Reservado'}</span>
              </div>
              <div style={{ color:C.muted, fontSize:10 }}>{t.raffles?.title} · #{(t.numbers||[]).map(n=>String(n).padStart(2,'0')).join(', ')}</div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ color:C.muted, fontSize:10 }}>{t.users_profile?.phone||''}</span>
                <span style={{ color:C.gold, fontSize:12, fontWeight:700 }}>{fmt(t.total_amount||0)}</span>
              </div>
              {t.status === 'reserved' && (
                <button onClick={async () => {
                  await supabase.from('tickets').update({ status:'paid' }).eq('id', t.id)
                  loadAdminData()
                }} style={{ width:'100%', background:'rgba(39,174,96,0.1)', border:'1px solid rgba(39,174,96,0.25)', borderRadius:8, padding:'7px', color:C.green, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginTop:8 }}>✓ Confirmar pago</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Config */}
      {tab === 2 && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:12 }}>Configuracion General</div>
            {[
              ['showPoints','Mostrar boton Puntos','Visible en navegacion'],
              ['showWinners','Mostrar Ganadores','Visible en inicio'],
              ['showHowItWorks','Mostrar Como funciona?','Visible en inicio'],
              ['showWelcomeBonus','Bono de bienvenida','$500 + 1000 pts'],
              ['show_bingo','Mostrar Bingo','Activa el bingo'],
              ['showWAPayButton','Boton Pagar por WhatsApp','Desactiva para solo chat'],
            ].map(([key,label,desc]) => (
              <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg3, borderRadius:10, padding:'11px 14px', marginBottom:8 }}>
                <div><div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{label}</div><div style={{ color:C.muted, fontSize:10, marginTop:1 }}>{desc}</div></div>
                <Toggle on={!!localConfig[key]} onToggle={() => setLocalConfig(prev=>({...prev,[key]:!prev[key]}))} />
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:10 }}>WhatsApp de Soporte</div>
            <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Numero WhatsApp</label>
            <input value={localConfig.paymentWhatsapp||''} onChange={e=>setLocalConfig(p=>({...p,paymentWhatsapp:e.target.value}))} placeholder="+57 300 000 0000" />
          </div>
          <button onClick={saveConfig} style={S.btnGold}>Guardar configuracion</button>
        </div>
      )}
    </div>
  )
}


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

  // Parse prizes — each prize has amount + how_to_win
  const parsePrizes = (raw) => {
    if (!raw || !Array.isArray(raw)) return [{ amount:'', how_to_win:'' }]
    return raw.map(p => ({
      amount: p.amount || (typeof p === 'string' ? p : ''),
      how_to_win: p.how_to_win || ''
    }))
  }

  const [form, setForm] = useState({
    title:             raffle?.title || '',
    ticket_price:      raffle?.ticket_price || 5000,
    number_range:      raffle?.number_range || 100,
    max_per_person:    raffle?.max_per_person || 5,
    raffle_date:       raffle?.raffle_date ? raffle.raffle_date.split('T')[0] : '',
    close_time:        raffle?.close_time || '',
    lottery_name:      raffle?.lottery_name || '',
    card_color:        raffle?.card_color || '#E67E22',
    is_free:           raffle?.is_free || false,
    accepts_points:    raffle?.accepts_points !== false,
    prizes:            parsePrizes(raffle?.prizes),
    society_numbers:   raffle?.society_numbers ? raffle.society_numbers.join(', ') : '',
    status:            raffle?.status || 'active',
    description:       raffle?.description || '',
    is_featured:       raffle?.is_featured || false,
    release_hours:     raffle?.release_hours || 24,
    payment_deadline:  raffle?.payment_deadline || '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  function setPrize(idx, key, val) {
    setForm(p => {
      const prizes = [...p.prizes]
      prizes[idx] = { ...prizes[idx], [key]: val }
      return { ...p, prizes }
    })
  }
  function addPrize() {
    setForm(p => ({ ...p, prizes: [...p.prizes, { amount:'', how_to_win:'' }] }))
  }
  function removePrize(idx) {
    setForm(p => ({ ...p, prizes: p.prizes.filter((_,i) => i !== idx) }))
  }

  async function save() {
    if (!form.title || !form.raffle_date || !form.lottery_name) {
      alert('Completa el titulo, fecha y loteria'); return
    }
    setSaving(true)
    setSaveError(null)
    try {
      // Datos minimos — solo campos seguros
      const data = {
        title:        String(form.title || '').trim(),
        ticket_price: Number(form.ticket_price) || 5000,
        raffle_date:  form.raffle_date,
        lottery_name: String(form.lottery_name || '').trim(),
        status:       'active',
        number_range: Number(form.number_range) || 100,
        prizes:       [],
        description:  '',
        is_featured:  false,
        is_free:      false,
        accepts_points: true,
        release_hours: 24,
        card_color:   '#E67E22',
      }

      setSaveError('Conectando con Supabase...')
      
      const result = isEdit
        ? await supabase.from('raffles').update(data).eq('id', raffle.id)
        : await supabase.from('raffles').insert(data)

      if (result.error) {
        setSaveError('ERROR Supabase: ' + result.error.message + ' | code: ' + result.error.code)
        setSaving(false)
        return
      }

      setSaveError('✅ Guardado exitosamente!')
      setSaving(false)
      setTimeout(() => onSave(), 800)
    } catch(e) {
      setSaveError('EXCEPCION: ' + (e.message || String(e)))
      setSaving(false)
    }
  }

  const prizeLabels = ['🥇 Premio 1','🥈 Premio 2','🥉 Premio 3','🎯 Premio 4','🎁 Premio 5']

  return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:16, fontSize:14, padding:0, fontFamily:'inherit' }}>← Volver</button>
      <div style={{ ...S.card, marginBottom:14, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
        <div style={{ color:C.gold, fontSize:14, fontWeight:900 }}>{isEdit ? 'Editar dinamica' : 'Crear nueva dinamica'}</div>
      </div>

      {saveError && (
        <div style={{ background:'rgba(192,57,43,0.12)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:14, color:'#E74C3C', fontSize:12 }}>
          ⚠️ {saveError}
        </div>
      )}

      <FormField label="Nombre del sorteo">
        <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Ej: MOTO YAMAHA MT-03 + $500.000" />
      </FormField>

      <FormField label="Rango de numeros">
        <div style={{ display:'flex', gap:8 }}>
          {[[100,'00 al 99'],[1000,'000 al 999']].map(([v,l]) => (
            <button key={v} onClick={()=>setForm(p=>({...p,number_range:v}))} style={{ flex:1, border:`1px solid ${form.number_range===v?C.gold:'rgba(201,162,39,0.2)'}`, background:form.number_range===v?'rgba(201,162,39,0.15)':C.bg3, borderRadius:9, padding:'10px', textAlign:'center', color:form.number_range===v?C.gold:C.muted, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
          ))}
        </div>
      </FormField>

      <FormField label="Valor del boleto (COP)">
        <input type="number" value={form.ticket_price} onChange={e=>setForm(p=>({...p,ticket_price:e.target.value}))} placeholder="5000" />
      </FormField>

      <FormField label="Maximo boletos por persona">
        <div style={{ display:'flex', gap:6 }}>
          {[['1',1],['2',2],['5',5],['10',10],['Sin limite',999]].map(([l,v]) => (
            <button key={l} onClick={()=>setForm(p=>({...p,max_per_person:v}))} style={{ flex:1, border:`1px solid ${form.max_per_person===v?C.gold:'rgba(201,162,39,0.2)'}`, background:form.max_per_person===v?'rgba(201,162,39,0.15)':C.bg3, borderRadius:8, padding:'8px 2px', textAlign:'center', color:form.max_per_person===v?C.gold:C.muted, fontSize:9, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
          ))}
        </div>
      </FormField>

      <FormField label="Fecha del sorteo">
        <input type="date" value={form.raffle_date} onChange={e=>setForm(p=>({...p,raffle_date:e.target.value}))} />
      </FormField>

      <FormField label="Hora de cierre (opcional)">
        <input type="time" value={form.close_time} onChange={e=>setForm(p=>({...p,close_time:e.target.value}))} />
        <div style={{ color:C.muted, fontSize:10, marginTop:4 }}>Hora en que se cierra la venta de boletos ese dia</div>
      </FormField>

      <FormField label="Loteria que juega">
        <input value={form.lottery_name} onChange={e=>setForm(p=>({...p,lottery_name:e.target.value}))} placeholder="Ej: Loteria de Bogota" />
      </FormField>

      <FormField label="Color de la tarjeta">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
          {[['#E67E22','Naranja'],['#C9A227','Dorado'],['#C0392B','Rojo'],['#2980B9','Azul'],['#27AE60','Verde'],['#9B59B6','Purpura'],['#1ABC9C','Teal'],['#E91E63','Rosa'],['#607D8B','Gris azul']].map(([color,name]) => (
            <div key={color} onClick={()=>setForm(p=>({...p,card_color:color}))} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer' }}>
              <div style={{ width:38, height:38, background:`linear-gradient(135deg,${color}cc,${color}88)`, borderRadius:10, border:form.card_color===color?`3px solid #fff`:`1px solid ${color}60`, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:color }}></div>
                {form.card_color===color && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:16, fontWeight:900 }}>✓</div>}
              </div>
              <span style={{ fontSize:7, color:form.card_color===color?'#fff':'#555', fontWeight:form.card_color===color?700:400 }}>{name}</span>
            </div>
          ))}
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

      <FormField label="Hora maxima de pago">
        <div style={{ color:C.muted, fontSize:11, marginBottom:8, lineHeight:1.5 }}>
          Hora limite para que los usuarios paguen. Pasada esta hora, el admin puede liberar manualmente los boletos no pagados. El usuario ve un aviso cuando se acerca la hora.
        </div>
        <input type="time" value={form.payment_deadline || ''} onChange={e=>setForm(p=>({...p,payment_deadline:e.target.value}))} placeholder="Ej: 20:00" />
        <div style={{ color:'#444', fontSize:10, marginTop:5 }}>Ej: si el sorteo cierra a las 8:00 PM puedes poner 19:30 como hora limite de pago</div>
      </FormField>

      <FormField label="Estado">
        <div style={{ display:'flex', gap:8 }}>
          {[['active','Activo'],['draft','Borrador'],['finished','Finalizado']].map(([v,l]) => (
            <button key={v} onClick={()=>setForm(p=>({...p,status:v}))} style={{ flex:1, border:`1px solid ${form.status===v?C.gold:'rgba(201,162,39,0.2)'}`, background:form.status===v?'rgba(201,162,39,0.15)':C.bg3, borderRadius:9, padding:'9px', textAlign:'center', color:form.status===v?C.gold:C.muted, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
          ))}
        </div>
      </FormField>

      {/* PREMIOS — con monto + como ganarlo */}
      <FormField label="Premios">
        {form.prizes.map((prize, idx) => (
          <div key={idx} style={{ background:'#111', border:'1px solid rgba(201,162,39,0.15)', borderRadius:12, padding:14, marginBottom:10, position:'relative' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ color:C.gold, fontSize:12, fontWeight:700 }}>{prizeLabels[idx] || '🎁 Premio '+(idx+1)}</span>
              {form.prizes.length > 1 && (
                <button onClick={() => removePrize(idx)} style={{ background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:6, padding:'4px 9px', color:'#E74C3C', fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>Eliminar</button>
              )}
            </div>
            <div style={{ marginBottom:8 }}>
              <label style={{ color:C.muted, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:5 }}>Monto del premio</label>
              <input
                value={prize.amount}
                onChange={e => setPrize(idx,'amount',e.target.value)}
                placeholder="Ej: $1.000.000 en efectivo"
              />
            </div>
            <div>
              <label style={{ color:C.muted, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:5 }}>Como se gana este premio</label>
              <input
                value={prize.how_to_win}
                onChange={e => setPrize(idx,'how_to_win',e.target.value)}
                placeholder="Ej: Con las 2 ultimas cifras de la loteria"
              />
              <div style={{ color:'#444', fontSize:9, marginTop:4 }}>Ej: 2 ultimas · 3 ultimas · Numero exacto · 2 primeras...</div>
            </div>
          </div>
        ))}
        {form.prizes.length < 5 && (
          <button onClick={addPrize} style={{ width:'100%', background:'rgba(201,162,39,0.06)', border:'1px dashed rgba(201,162,39,0.25)', borderRadius:10, padding:11, color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.gold} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar premio
          </button>
        )}
      </FormField>

      <FormField label="Numeros en sociedad (separados por coma)">
        <input value={form.society_numbers} onChange={e=>setForm(p=>({...p,society_numbers:e.target.value}))} placeholder="Ej: 07, 13, 42, 77, 88" />
        <div style={{ color:C.muted, fontSize:10, marginTop:4 }}>Estos numeros se pueden comprar en sociedad entre dos personas</div>
      </FormField>

      <FormField label="Descripcion opcional">
        <textarea rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Informacion adicional..." style={{ background:'#1a1a1a', border:`1px solid rgba(201,162,39,0.2)`, borderRadius:12, padding:'13px 16px', color:'#fff', fontSize:14, outline:'none', width:'100%', fontFamily:'inherit', resize:'none', boxSizing:'border-box' }} />
      </FormField>

      <button onClick={save} disabled={saving} style={{ ...S.btnGold, marginBottom:10 }}>
        {saving
          ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#000" strokeWidth="2.5" style={{ animation:'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Guardando...
            </span>
          : isEdit ? 'Guardar cambios' : 'Crear dinamica'
        }
      </button>
      <button onClick={onBack} style={S.btnOutline}>Cancelar</button>
    </div>
  )
}


// ─── MANUAL SALE ──────────────────────────────────────────────────────────────
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

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onRegister, onBack }) {
  const [email, setEmail] = useState(''); const [pwd, setPwd] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const submit = async () => {
    if (!email || !pwd) { setError('Ingresa tu correo y contrasena'); return }
    setLoading(true); setError('')
    try { await onLogin(email, pwd) }
    catch(e) { setError(e?.message?.includes('Invalid')||e?.message?.includes('invalid') ? 'Correo o contrasena incorrectos' : (e?.message || 'Error al ingresar')) }
    finally { setLoading(false) }
  }
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
          <div><label style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Contrasena</label><input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="••••••••" /></div>
          {error && <div style={{ color:'#E74C3C', fontSize:13, textAlign:'center', padding:'8px 12px', background:'rgba(192,57,43,0.1)', borderRadius:8 }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ ...S.btnGold, opacity:loading?.7:1, marginTop:4 }}>{loading?'Ingresando...':'Ingresar a La Casa'}</button>
        </div>
        <p style={{ textAlign:'center', marginTop:24, color:'#555', fontSize:14 }}>No tienes cuenta? <button onClick={onRegister} style={{ background:'none', border:'none', color:C.gold, fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>Registrate gratis</button></p>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'#333', cursor:'pointer', width:'100%', textAlign:'center', marginTop:12, fontSize:13, fontFamily:'inherit' }}>Explorar sin cuenta</button>
      </div>
    </div>
  )
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
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
            <span style={{ fontSize:24 }}>🎁</span>
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

// ─── TICKET TIMER — countdown basado en expiracion real ──────────────────────
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

// ─── SOCIETY PAGE — pagina completa del sistema de sociedad ──────────────────
function SocietyPage({ user, profile, raffle, number, onBack, onLogin }) {
  const [societyTicket, setSocietyTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  const halfPrice = Math.floor((raffle?.ticket_price || 0) / 2)
  const pad = n => String(n).padStart(raffle?.number_range <= 100 ? 2 : 3, '0')

  useEffect(() => {
    fetchSocietyTicket()
    const ch = supabase.channel(`society-${raffle?.id}-${number}`)
      // society_tickets realtime removido (plan gratuito)
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
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.purple, cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: '0 0 14px', fontFamily: 'inherit' }}>← Volver</button>
        <div style={{ textAlign: 'center', paddingBottom: 20 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg,#2a0d4a,#3d1a6e)', border: '2px solid #9B59B6', borderRadius: 20, padding: '16px 28px', marginBottom: 12 }} className="society-glow">
            <div style={{ color: '#7b5cad', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Numero en Sociedad</div>
            <div style={{ color: '#C9A0E8', fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{pad(number)}</div>
            <div style={{ color: '#9B59B6', fontSize: 11, fontWeight: 700, marginTop: 6 }}>👥 {raffle?.title}</div>
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
                {!societyTicket ? 'Disponible — 0/2 socios' :
                 status === 'waiting' ? '1 socio unido — falta 1 mas!' :
                 status === 'complete' ? 'Completo — 2/2 socios' : 'No disponible'}
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
            <span style={{ fontSize: 18 }}>🏆</span>
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
            ['👥', 'Dos personas compran el mismo numero', 'Cada una paga la mitad del precio del boleto'],
            ['✅', 'El boleto queda completo entre los dos', 'Ambos socios quedan registrados en el sorteo'],
            ['🏆', 'Si el numero gana, ambos ganan', 'El admin coordina la entrega del premio a cada socio'],
            ['⏰', 'Tienes 48 horas para confirmar el pago', 'Si no pagas, el cupo se libera automaticamente'],
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
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#3d1a6e,#6c3db5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                  {societyTicket.reveal_names && societyTicket.socio1?.full_name
                    ? societyTicket.socio1.full_name.split(' ')[0] + ' — ' + (societyTicket.socio1?.city || 'Colombia')
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
            <div style={{ fontSize: 28, marginBottom: 6 }}>👥</div>
            <div style={{ color: '#C9A0E8', fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Ya eres socio de este numero!</div>
            <div style={{ color: C.muted, fontSize: 12 }}>Ve a tu panel para ver el estado y confirmar el pago</div>
          </div>
        )}

        {/* Boton principal */}
        {!loading && canJoin && (
          <button onClick={joinSociety} disabled={joining} style={{ ...S.btnPurple, opacity: joining ? .7 : 1, marginBottom: 8 }}>
            <span>👥</span>
            {joining ? 'Procesando...' : !societyTicket ? `Ser primer socio — ${fmt(halfPrice)}` : `Unirme como socio — ${fmt(halfPrice)}`}
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

// ─── PANEL DE SOCIEDAD EN ADMIN ───────────────────────────────────────────────
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
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontWeight: 700, marginBottom: 16, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>← Volver</button>
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
          <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
          <div>No hay sociedades {filter !== 'all' ? 'con este filtro' : 'aun'}</div>
        </div>
      )}
    </div>
  )
}

// ─── WA PAYMENT BUTTON — mensaje prellenado ──────────────────────────────────
function WAPayButton({ ticket, profile, appConfig, compact = false }) {
  const raffle = ticket.raffles || {}
  const nums = (ticket.numbers || []).map(n => `#${String(n).padStart(2,'0')}`).join(', ')
  const name = profile?.full_name || 'Cliente'
  const sorteoDate = raffle.raffle_date ? new Date(raffle.raffle_date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}) : ''
  const msg = `Hola! Quiero pagar mi boleto:\n\nSorteo: ${raffle.title || ''}\nNumero(s): ${nums}\nValor: ${fmt(ticket.total_amount || 0)}\nFecha sorteo: ${sorteoDate} · ${raffle.lottery_name || ''}\nNombre: ${name}`
  const waNum = (appConfig?.paymentWhatsapp || appConfig?.payment_whatsapp || '').replace(/\D/g,'')
  const waUrl = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}` : null
  const smsUrl = `sms:${profile?.phone || ''}?body=${encodeURIComponent(msg)}`
  if (!waUrl && compact) return null
  if (compact) return (
    <a href={waUrl} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block' }}>
      <div style={{ background:'#25D366', borderRadius:9, padding:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{ color:'#fff', fontSize:9, fontWeight:800 }}>Pagar por WhatsApp — {fmt(ticket.total_amount || 0)}</span>
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

// ─── ADMIN SMS COBRO BUTTON ───────────────────────────────────────────────────
function AdminSMSButton({ ticket, compact = false }) {
  const raffle = ticket.raffles || {}
  const nums = (ticket.numbers || []).map(n => `#${String(n).padStart(2,'0')}`).join(', ')
  const phone = ticket.users_profile?.phone || ticket.user_phone || ''
  const hoursLeft = ticket.expires_at ? Math.max(0, Math.floor((new Date(ticket.expires_at) - Date.now()) / 3600000)) : 24
  const msg = `La Casa De Las Dinamicas: Hola! Tu numero ${nums} del sorteo ${raffle.title || ''} por ${fmt(ticket.total_amount || 0)} esta pendiente de pago. Tienes ${hoursLeft} horas para confirmar. Escríbenos ya!`
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


// ─── BINGO PAGE — completo y didactico ───────────────────────────────────────
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
      <div style={{ fontSize:64, marginBottom:8 }}>🎱</div>
      <div style={{ color:'#fff', fontSize:20, fontWeight:900, textAlign:'center' }}>No hay Bingo activo</div>
      <div style={{ color:C.muted, fontSize:13, textAlign:'center' }}>El admin iniciara una partida pronto</div>
      <button onClick={onBack} style={{ ...S.btnOutline, marginTop:8, maxWidth:200 }}>← Volver</button>
    </div>
  )

  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      <style>{CSS}</style>
      {/* Header */}
      <div style={{ background:C.bg2, padding:'11px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid #1a1a1a`, position:'sticky', top:0, zIndex:40 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:13, padding:0, fontFamily:'inherit' }}>← Volver</button>
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
              ['🎟️','Compra tu carton','Cada carton cuesta '+fmt(game.carton_price)+'. Puedes tener hasta 6 cartones en la misma partida.'],
              ['🔢','Escucha los numeros','El admin va cantando numeros. Cada numero cantado se muestra grande en pantalla.'],
              ['✅','Marca en tu carton','Cuando el numero cantado aparezca en tu carton, tocalo para marcarlo.'],
              ['🏆','Canta BINGO!','Completa una linea horizontal, vertical, diagonal, las 4 esquinas o el carton completo y presiona el boton BINGO!'],
            ].map(([ic,t,d]) => (
              <div key={t} style={{ display:'flex', gap:12, marginBottom:12, paddingBottom:12, borderBottom:'1px solid #1a1a1a' }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{ic}</span>
                <div><div style={{ color:'#fff', fontSize:12, fontWeight:700, marginBottom:2 }}>{t}</div><div style={{ color:C.muted, fontSize:11 }}>{d}</div></div>
              </div>
            ))}
            {/* Tipos de bingo */}
            <div style={{ color:C.gold, fontSize:11, fontWeight:700, marginBottom:8 }}>Formas de ganar:</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[['→','Linea horizontal','Premio basico'],['↓','Linea vertical','Premio basico'],['↗','Diagonal','Premio medio'],['⬛','Carton lleno','Premio MAXIMO!'],['◻️','4 Esquinas','Premio especial']].map(([ic,t,p]) => (
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
                <div style={{ fontSize:32, marginBottom:8 }}>🎟️</div>
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
                  {/* Numeros 5x5 — transpuesto */}
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
                            {isStar ? '⭐' : n}
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
                🎉 BINGO!
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
                <div style={{ fontSize:40, marginBottom:6 }}>🎉</div>
                <div style={{ color:'#fff', fontSize:18, fontWeight:900 }}>Reclamar BINGO!</div>
                <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>Selecciona que tipo de bingo lograste</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                {[['linea','→ Linea'],['vertical','↓ Vertical'],['diagonal','↗ Diagonal'],['esquinas','◻️ Esquinas'],['full','⬛ Carton lleno']].map(([type,label]) => (
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

// ─── ADMIN BINGO PANEL ────────────────────────────────────────────────────────
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
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:16, fontSize:14, padding:0, fontFamily:'inherit' }}>← Volver</button>
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
                {calling ? 'Cantando...' : '🎱 Cantar siguiente numero'}
              </button>
            )}
            {game.status === 'active' && game.mode === 'auto' && (
              <div style={{ background:'rgba(39,174,96,0.08)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:9, padding:'10px', textAlign:'center', marginBottom:8, color:'#27AE60', fontSize:11, fontWeight:700 }}>
                Modo automatico activo — cantando cada {game.auto_interval}s
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
