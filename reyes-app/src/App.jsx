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
  content: { padding: '12px 10px 88px', maxWidth: 500, margin: '0 auto' },
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

const CSS = `@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes houseFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.house-float{animation:houseFloat 3s ease-in-out infinite}.pulse{animation:pulse 2s infinite}@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}.slide-up{animation:slideUp .3s ease}@keyframes glow{0%,100%{box-shadow:0 0 6px rgba(155,89,182,0.4),0 0 0 1px rgba(155,89,182,0.5)}50%{box-shadow:0 0 18px rgba(155,89,182,0.9),0 0 0 1.5px #9B59B6}}.society-glow{animation:glow 2s ease-in-out infinite}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}.society-float{animation:float 3s ease-in-out infinite}input,select,textarea{background:#1a1a1a;border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:13px 16px;color:#fff;font-size:15px;outline:none;width:100%;transition:border-color .2s;font-family:inherit;box-sizing:border-box}input:focus,select:focus,textarea:focus{border-color:#C9A227}input::placeholder,textarea::placeholder{color:#444}textarea{resize:none}::-webkit-scrollbar{display:none}`

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
  show_bingo: false, show_promoter_banner: true, showPoints: true, showWinners: true, showHowItWorks: true, showWelcomeBonus: true,
  whatsapp: '', canal: '', instagram: '', facebook: '', telegram: '',
  supportWhatsapp: '3013986016', supportWhatsappText: 'WhatsApp', supportWhatsappMsg: 'Hola! Necesito ayuda',
  paymentWhatsapp: '3013986016', showWAPayButton: true, showChatPayButton: true, waMsgTemplate: '', imgDeleteDays: 3, showBanner: false, bannerText: '🔥 ¡Hoy es tu día de suerte! Aparta tu número antes de que se agote · 💰 Premios reales cada semana · ✅ Pagos seguros y verificados · 🏆 Ganadores publicados en Instagram', bannerBg: '#E6BE00', bannerColor: '#5a3e00', bannerSpeed: 3,
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
  const [page, _setPage] = useState('home')
  const [pageHistory, setPageHistory] = useState([])
  const setPage = (newPage) => {
    _setPage(prev => {
      if (prev !== newPage) setPageHistory(h => [...h, prev])
      return newPage
    })
  }
  const goBack = () => {
    setPageHistory(h => {
      if (h.length === 0) { _setPage('home'); return [] }
      const last = h[h.length - 1]
      _setPage(last)
      return h.slice(0, -1)
    })
  }
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
    const { data: ex } = await supabase.from('tickets').select('numbers').eq('raffle_id', raffleId).in('status', ['reserved', 'paid', 'winner'])
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
    if (data) {
      const mapped = {
        ...data,
        showBanner: data.show_banner,
        bannerText: data.banner_text,
        bannerBg: data.banner_bg,
        bannerColor: data.banner_color,
        bannerSpeed: data.banner_speed,
        showPoints: data.show_points,
        showWinners: data.show_winners,
        showHowItWorks: data.show_how_it_works,
        showWelcomeBonus: data.show_welcome_bonus,
        supportWhatsapp: data.support_whatsapp,
        supportWhatsappText: data.support_whatsapp_text,
        supportWhatsappMsg: data.support_whatsapp_msg,
        paymentWhatsapp: data.payment_whatsapp,
        showWAPayButton: data.show_wa_pay_button,
        showChatPayButton: data.show_chat_pay_button,
        waMsgTemplate: data.wa_msg_template,
        imgDeleteDays: data.img_delete_days,
      }
      setAppConfig(prev => ({ ...prev, ...mapped }))
    }
  }
  async function fetchReserved(id) {
    try {
      // Tickets normales
      const { data, error } = await supabase.from('tickets').select('numbers').eq('raffle_id', id).in('status', ['reserved', 'paid', 'winner'])
      if (error) { console.error('fetchReserved tickets error:', error); return }
      const normalNums = (data || []).flatMap(t => t.numbers || [])
      // Society tickets
      // Solo marcar como reservado/ocupado si la sociedad está COMPLETA
      // (ambos socios). 'waiting' aún tiene 1 espacio libre.
      const { data: sData, error: sErr } = await supabase.from('society_tickets')
        .select('number, status')
        .eq('raffle_id', id)
        .in('status', ['waiting', 'complete'])
      if (sErr) console.error('fetchReserved society error:', sErr)
      // Solo 'complete' = ocupado totalmente. 'waiting' sigue disponible.
      const societyOccupied = (sData || []).filter(s => s.status === 'complete').map(s => s.number)
      setAllReservedNums([...normalNums, ...societyOccupied])
    } catch(e) { console.error('fetchReserved catch:', e) }
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
      // Check if user came from a referral link
      const urlRef = new URLSearchParams(window.location.search).get('ref')
      let referrerId = null
      if (urlRef) {
        const { data: refUser } = await supabase.from('users_profile').select('id').eq('referral_code', urlRef).limit(1)
        if (refUser?.[0]) referrerId = refUser[0].id
      }
      await supabase.from('users_profile').upsert({ id: data.user.id, full_name: name, phone, email, role: 'customer', credits: appConfig.showWelcomeBonus ? 500 : 0, points: appConfig.showWelcomeBonus ? 1000 : 0, referral_code: refCode, is_promoter: false, referred_by: referrerId })
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
    try {
      await supabase.auth.signOut()
    } catch(e) { console.error('signOut error:', e) }
    setUser(null); setProfile(null); setMyTickets([]); setPageHistory([]); setAllReservedNums([]); _setPage('home')
  }
  async function handleReserve() {
    if (!user) {
      localStorage.setItem('pendingNums', JSON.stringify({ raffleId: selectedRaffle.id, nums: selectedNums, price: selectedRaffle.ticket_price }))
      setShowReservePopup(false); setAuthPage('choose'); return
    }
    const r = selectedRaffle
    try {
      const { data: ex } = await supabase.from('tickets').select('numbers').eq('raffle_id', r.id).in('status', ['reserved', 'paid', 'winner'])
      const taken = (ex || []).flatMap(t => t.numbers || [])
      const conflict = selectedNums.filter(n => taken.includes(n))
      if (conflict.length > 0) { alert(`Los numeros ${conflict.map(n => String(n).padStart(2, '0')).join(', ')} ya estan apartados.`); await fetchReserved(r.id); setSelectedNums([]); setShowReservePopup(false); return }
      const { error } = await supabase.from('tickets').insert({ user_id: user.id, raffle_id: r.id, numbers: selectedNums, status: 'reserved', total_amount: selectedNums.length * r.ticket_price })
      if (error) { alert('Error al reservar: ' + error.message); return }
      await fetchMyTickets(); await fetchReserved(r.id); setSelectedNums([]); setShowReservePopup(false); setPage('profile')
    } catch(e) { alert('Error: ' + e.message) }
  }
  async function becomePromoter() {
    if (!user) return
    const refCode = 'CASA-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    await supabase.from('users_profile').update({ is_promoter: true, referral_code: refCode }).eq('id', user.id)
    await supabase.from('promoters').upsert({ user_id: user.id, referral_code: refCode, total_earnings: 0, pending_earnings: 0, level1_rate: 15, level2_rate: 7, level3_rate: 3 }, { onConflict: 'user_id' })
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
      {/* BANNER MARQUEE */}
      {appConfig?.showBanner && appConfig?.bannerText && (
        <div style={{ background: appConfig.bannerBg || '#E6BE00', overflow:'hidden', height:28, display:'flex', alignItems:'center', flexShrink:0 }}>
          <div style={{ display:'flex', width:'max-content', animation:`marquee ${(6 - (appConfig.bannerSpeed||3)) * 5 + 8}s linear infinite` }}>
            <span style={{ whiteSpace:'nowrap', padding:'0 40px', fontSize:12, fontWeight:700, color: appConfig.bannerColor || '#5a3e00' }}>
              {appConfig.bannerText}&nbsp;&nbsp;&nbsp;
            </span>
            <span style={{ whiteSpace:'nowrap', padding:'0 40px', fontSize:12, fontWeight:700, color: appConfig.bannerColor || '#5a3e00' }} aria-hidden="true">
              {appConfig.bannerText}&nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>
      )}
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
        {page === 'raffle' && selectedRaffle && <RafflePage raffle={selectedRaffle} user={user} allReservedNums={allReservedNums} selectedNums={selectedNums} setSelectedNums={setSelectedNums} onShowPopup={() => setShowReservePopup(true)} onBack={goBack} onSociety={async (num, mode) => {
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
        {page === 'promoter' && <PromoterPage user={user} profile={profile} raffles={raffles} appConfig={appConfig} onBack={() => setPage('profile')} />}
        {page === 'points' && appConfig.showPoints && <PointsPage user={user} profile={profile} onLogin={() => setAuthPage('login')} />}
        {page === 'support' && <SupportPage user={user} profile={profile} isAdmin={isAdmin} onBack={goBack} appConfig={appConfig} ticketContext={supportTicketContext} />}
        {page === 'admin' && <AdminSafe user={user} isAdmin={isAdmin} raffles={raffles} appConfig={appConfig} setAppConfig={setAppConfig} onBack={goBack} onOpenSupport={() => setPage('admin-support')} onOpenSociety={() => setPage('admin-society')} onOpenBingo={() => setPage('admin-bingo')} onRefreshRaffles={fetchRaffles} />}
        {page === 'admin-support' && <SupportPage user={user} profile={profile} isAdmin={true} onBack={() => setPage('admin')} appConfig={appConfig} />}
        {page === 'winners' && <WinnersPage onBack={goBack} onRaffle={() => setPage('home')} />}
        {page === 'society' && societyData && <SocietyPage user={user} profile={profile} raffle={societyData.raffle} number={societyData.number} onBack={() => { setPage('raffle') }} onLogin={() => setAuthPage('login')} />}
        {page === 'admin-society' && <AdminSocietyPanel raffles={raffles} onBack={() => setPage('admin')} />}
        {page === 'bingo' && <BingoPage user={user} profile={profile} appConfig={appConfig} onLogin={() => setAuthPage('login')} onBack={goBack} />}
        {page === 'admin-bingo' && <AdminBingoPanel onBack={() => setPage('admin')} />}
        {page === 'how' && <HowItWorksPage onBack={goBack} onRegister={() => setAuthPage('register')} />}
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
          ...(profile?.is_promoter ? [{ id: 'promoter', label: 'Promotor', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }] : []),
          ...((appConfig.show_bingo || appConfig.showBingo) ? [{ id: 'bingo', label: 'Bingo', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> }] : []),
          { id: 'support', label: 'Soporte', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { id: 'profile', label: 'Mi Cuenta', icon: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map(({ id, label, icon }) => (<button key={id} onClick={() => setPage(id)} style={S.navBtn(page === id)}>{icon}<span style={{ fontSize: 9, fontWeight: 700 }}>{label}</span></button>))}
      </nav>
      {showReservePopup && selectedRaffle && selectedNums.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowReservePopup(false)}>
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
    <div onClick={() => onRaffle(r)} style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)', border: `1.5px solid ${isFeatured ? C.gold : cardColor+'60'}`, borderRadius: 16, padding: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
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
          <div key={ic} style={{ background: 'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '6px 6px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 9 }}>{ic}</div>
            <div style={{ color: '#fff', fontSize: 7, fontWeight: 700, marginTop: 1 }}>{v}</div>
          </div>
        ))}
      </div>
      {/* Premios — hasta 4 */}
      <div style={{ marginBottom: 10, background:'linear-gradient(135deg,rgba(230,190,0,0.12),rgba(230,190,0,0.04))', border:'1px solid rgba(230,190,0,0.25)', borderRadius:10, padding:10 }}>
        <div style={{ color: C.gold, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight:800 }}>🏆 Premios</div>
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

      {/* COMO FUNCIONA + GANADORES — al final */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20, marginBottom: 14 }}>
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
          {[['#fff','1px solid #ddd','#000','Disponible'],['rgba(201,162,39,0.2)',`2px solid ${C.gold}`,C.gold,'Seleccionado'],['rgba(231,76,60,0.25)','1.5px solid #E74C3C','#E74C3C','Apartado']].map(([bg,border,color,label]) => (
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
              const isRes = allReservedNums.includes(n)
              const isSoc = societyNums.includes(n) && !isRes
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
              if (isRes) return <div key={n} style={{ aspectRatio:1, border:'1.5px solid #E74C3C', borderRadius:8, background:'rgba(231,76,60,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, cursor:'not-allowed' }}>🔒</div>
              if (isSel) return <div key={n} onClick={() => toggleNum(n)} style={{ aspectRatio:1, border:`2px solid ${C.gold}`, borderRadius:8, background:'rgba(201,162,39,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:range<=100?13:11, fontWeight:900, color:C.gold, cursor:'pointer' }}>{pStr}</div>
              return <div key={n} onClick={() => toggleNum(n)} style={{ aspectRatio:1, border:'1px solid #ddd', borderRadius:8, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:range<=100?13:11, fontWeight:800, color:'#000', cursor:'pointer' }}>{pStr}</div>
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
function ProfilePage({ user, profile, myTickets, onLogout, onLogin, onRegister, onPromoter, onBecomePromoter, isAdmin, onAdmin, onRefresh, onSupport, appConfig, pwa }) {
  const [tab, setTab] = useState(0)
  const [adminUsers, setAdminUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [pointsAmount, setPointsAmount] = useState('')
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

        {/* PROMOTER BANNER — right after Mis Puntos */}
        {user && !profile?.is_promoter && (appConfig?.show_promoter_banner !== false) && (
          <div onClick={onPromoter} style={{ background:'linear-gradient(135deg,rgba(230,190,0,0.12),rgba(39,174,96,0.08))', border:'2px solid rgba(230,190,0,0.4)', borderRadius:16, padding:14, marginBottom:14, cursor:'pointer', position:'relative', overflow:'hidden', textAlign:'center' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#E6BE00,#27AE60,#E6BE00)' }} />
            <div style={{ fontSize:28, marginBottom:4 }}>💰</div>
            <div style={{ color:C.gold, fontSize:16, fontWeight:900, marginBottom:2 }}>¡Gana dinero real!</div>
            <div style={{ color:'#fff', fontSize:11, marginBottom:2 }}>Conviértete en <span style={{ color:C.gold, fontWeight:900 }}>Promotor</span></div>
            <div style={{ color:C.muted, fontSize:10, marginBottom:8 }}>Comparte sorteos y gana comisiones en efectivo</div>
            <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:10, padding:8, marginBottom:8 }}>
              <div style={{ color:C.gold, fontSize:10, fontWeight:700, marginBottom:2 }}>💸 Ejemplo real</div>
              <div style={{ color:'#27AE60', fontSize:16, fontWeight:900 }}>Ganas hasta $10.000</div>
              <div style={{ color:'#888', fontSize:9 }}>por cada boleto vendido con tu enlace</div>
            </div>
            <div style={{ background:'linear-gradient(135deg,#E6BE00,#f0d000)', borderRadius:10, padding:11 }}><div style={{ color:'#000', fontSize:13, fontWeight:900 }}>🚀 Quiero ser Promotor</div></div>
          </div>
        )}
        {user && profile?.is_promoter && (
          <button onClick={onPromoter} style={{ width:'100%', marginBottom:14, background:'linear-gradient(135deg,rgba(230,190,0,0.08),rgba(230,190,0,0.03))', border:'1.5px solid rgba(230,190,0,0.3)', borderRadius:14, padding:12, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <span style={{ fontSize:18 }}>📣</span>
            <div style={{ textAlign:'left' }}><div style={{ color:C.gold, fontSize:12, fontWeight:900 }}>Panel del Promotor</div><div style={{ color:C.muted, fontSize:9 }}>Ver ganancias y referidos</div></div>
            <span style={{ color:C.gold, marginLeft:'auto' }}>→</span>
          </button>
        )}

        {/* BANNER ANDROID */}
        {isAndroid && pwa && !pwa.isInstalled && (
          <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:12, padding:'11px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:10, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}></div>
            <div style={{ width:34, height:34, borderRadius:9, overflow:'hidden', flexShrink:0, border:'1px solid rgba(230,190,0,0.25)' }}><LogoSVG size={34} /></div>
            <div style={{ flex:1 }}>
              <div style={{ color:'#fff', fontSize:12, fontWeight:800 }}>Instala La Casa</div>
              <div style={{ color:C.muted, fontSize:9, marginTop:1 }}>Acceso rapido + funciona sin internet</div>
            </div>
            {pwa.canInstall              ? <button onClick={pwa.install} style={{ background:C.gold, border:'none', borderRadius:8, padding:'8px 13px', color:'#000', fontSize:10, fontWeight:800, cursor:'pointer', flexShrink:0, fontFamily:'inherit' }}>Instalar</button>
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
  const waTpl = appConfig?.waMsgTemplate ||
    'Hola! Quiero pagar mis boletos\n\nSorteo: {sorteo}\nNumeros: {numeros}\nTotal: {total}\n\nPor favor confirmar mi pago 🙏'
  const waMsg = waTpl
    .replace('{sorteo}', raffle?.title||'')
    .replace('{numeros}', numsStr)
    .replace('{total}', fmt(totalAmt))
  const waUrl = waNum ? 'https://wa.me/'+waNum+'?text='+encodeURIComponent(waMsg) : null

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

          {/* 2. Chat soporte — controlado por config admin */}
          {appConfig?.showChatPayButton !== false && (
            <div onClick={() => onSupport && onSupport({ title:raffle?.title||'', number:allNums[0]||0, price:totalAmt })} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:10, padding:11, display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer', marginBottom:6 }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={C.gold} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span style={{ color:C.gold, fontSize:11, fontWeight:600 }}>Pagar y adjuntar comprobante en chat</span>
            </div>
          )}

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
function PromoterPage({ user, profile, onBack, raffles, appConfig }) {
  const [referrals, setReferrals] = useState([])
  const [earnings, setEarnings] = useState([])
  const [tab, setTab] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase.from('users_profile').select('id,full_name,phone,created_at,is_promoter').eq('referred_by', user.id).then(({ data }) => setReferrals(data || []))
  }, [user])

  async function becomePromoterFn() {
    try {
      const refCode = profile?.referral_code || 'CASA-' + Math.random().toString(36).substr(2,6).toUpperCase()
      const { error: e1 } = await supabase.from('users_profile').update({ is_promoter: true, referral_code: refCode }).eq('id', user.id)
      if (e1) { alert('Error perfil: ' + e1.message); return }
      const { error: e2 } = await supabase.from('promoters').upsert({ user_id: user.id, referral_code: refCode, total_earnings: 0, pending_earnings: 0, level1_rate: appConfig?.level1_rate||15, level2_rate: appConfig?.level2_rate||5 }, { onConflict: 'user_id' })
      if (e2) { alert('Error promoter: ' + e2.message); return }
      alert('✅ ¡Ahora eres Promotor Oficial!')
      // Navigate to home to trigger fresh profile fetch
      window.location.href = window.location.origin + '/'
    } catch(err) { alert('Error: ' + err.message) }
  }

    if (!profile?.is_promoter) return (
    <div style={S.content}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, marginBottom:16, fontSize:14, padding:0, fontFamily:'inherit' }}>← Volver</button>
      <div style={{ textAlign:'center', padding:'40px 0' }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🏆</div>
        <div style={{ color:C.gold, fontSize:18, fontWeight:900, marginBottom:4 }}>Programa de Promotores</div>
        <div style={{ color:C.muted, fontSize:12, marginBottom:20 }}>La Casa De Las Dinámicas</div>
        <div style={{ textAlign:'left', marginBottom:20 }}>
          <div style={{ color:'#fff', fontSize:13, fontWeight:900, marginBottom:8 }}>¿Cómo funciona?</div>
          {[['1','Comparte tu enlace','Recibes un link único para compartir por WhatsApp, redes sociales, etc.','rgba(230,190,0,0.1)'],['2','Tus referidos compran','Cada vez que alguien compra con tu enlace, ganas comisión.','rgba(39,174,96,0.1)'],['3','Cobra tus ganancias','Retira a Nequi, Daviplata o Bancolombia.','rgba(93,173,226,0.1)']].map(([n,t,d,bg])=>(
            <div key={n} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:8, background:'#111', borderRadius:10, padding:10 }}>
              <div style={{ width:28, height:28, background:bg, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff', fontSize:13, fontWeight:900 }}>{n}</div>
              <div><div style={{ color:'#fff', fontSize:11, fontWeight:700 }}>{t}</div><div style={{ color:'#888', fontSize:10 }}>{d}</div></div>
            </div>
          ))}
        </div>
        <div style={{ background:'#111', border:'1px solid rgba(230,190,0,0.2)', borderRadius:10, padding:12, marginBottom:12, textAlign:'left' }}>
          <div style={{ color:'#fff', fontSize:12, fontWeight:900, marginBottom:6 }}>📊 Ejemplo real</div>
          <div style={{ color:'#888', fontSize:10, marginBottom:8 }}>Sorteo de $35.000 — ganas $10.000 por venta:</div>
          {[[5,50000],[10,100000],[20,200000],[50,500000]].map(([n,t])=>(
            <div key={n} style={{ display:'flex', justifyContent:'space-between', marginBottom:3, paddingBottom:3, borderBottom:'1px solid #1a1a1a' }}>
              <span style={{ color:'#fff', fontSize:11 }}>Vendes {n} boletos</span>
              <span style={{ color:C.gold, fontSize:12, fontWeight:900 }}>{fmt(t)}</span>
            </div>
          ))}
          <div style={{ color:'#888', fontSize:10, marginTop:6, marginBottom:4 }}>+ Nivel 2: ganas $1.750 extra por cada venta de tus referidos</div>
        </div>
        <div style={{ background:'rgba(39,174,96,0.06)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:10, padding:10, marginBottom:12, textAlign:'left' }}>
          <div style={{ color:'#27AE60', fontSize:11, fontWeight:900, marginBottom:6 }}>✨ Beneficios</div>
          {['Ganas por TODAS las compras de tu referido, no solo la primera','Comisiones de por vida mientras tu referido siga comprando','$10.000 por cada boleto de $35.000 vendido','$1.750 por ventas de tus sub-referidos (Nivel 2)','Sin inversión, 100% gratis','Ganancias ilimitadas — sin techo','Retira a Nequi, Daviplata, Bancolombia','Panel con estadísticas en tiempo real'].map(b=>(
            <div key={b} style={{ color:'#fff', fontSize:10, marginBottom:3 }}>✔ {b}</div>
          ))}
        </div>
        <button onClick={async () => { await becomePromoterFn(); }} style={S.btnGold}>🚀 ¡Afiliarme ahora — es gratis!</button>
        <div style={{ color:C.muted, fontSize:10, marginTop:4 }}>Solo toma 2 segundos</div>
      </div>
    </div>
  )



  const refUrl = `https://www.lacasadelasdinamicas.com/?ref=${profile?.referral_code}`
  const totalEarnings = profile?.total_earnings || 0
  const pendingEarnings = profile?.pending_earnings || 0
  const activeRaffles = (raffles||[]).filter(r => r.status === 'active')
  const l1 = appConfig?.level1_rate || 15
  const l2 = appConfig?.level2_rate || 5
  const subPromoters = referrals.filter(r => r.is_promoter)

  return (
    <div style={S.content}>
      <div style={{ background:'#111', padding:'11px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1a1a1a', marginBottom:12, borderRadius:'12px 12px 0 0' }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:13, padding:0, fontFamily:'inherit' }}>← Volver</button>
        <span style={{ color:'#fff', fontSize:12, fontWeight:900 }}>Mi Panel Promotor</span>
        <span style={{ background:'rgba(230,190,0,0.1)', border:'1px solid rgba(230,190,0,0.2)', borderRadius:999, padding:'2px 8px', color:C.gold, fontSize:9, fontWeight:700 }}>PRO</span>
      </div>

      {/* STATS */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
        <div style={{ background:'linear-gradient(135deg,rgba(39,174,96,0.1),rgba(39,174,96,0.03))', border:'1px solid rgba(39,174,96,0.25)', borderRadius:12, padding:12, textAlign:'center' }}><div style={{ color:'#888', fontSize:9 }}>Ganancias totales</div><div style={{ color:'#27AE60', fontSize:20, fontWeight:900 }}>{fmt(totalEarnings)}</div></div>
        <div style={{ background:'linear-gradient(135deg,rgba(230,190,0,0.08),rgba(230,190,0,0.02))', border:'1px solid rgba(230,190,0,0.25)', borderRadius:12, padding:12, textAlign:'center' }}><div style={{ color:'#888', fontSize:9 }}>Pendiente cobro</div><div style={{ color:C.gold, fontSize:20, fontWeight:900 }}>{fmt(pendingEarnings)}</div></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:12 }}>
        <div style={{ background:'#111', borderRadius:8, padding:8, textAlign:'center' }}><div style={{ color:'#fff', fontSize:16, fontWeight:900 }}>{referrals.length}</div><div style={{ color:'#888', fontSize:8 }}>Referidos</div></div>
        <div style={{ background:'#111', borderRadius:8, padding:8, textAlign:'center' }}><div style={{ color:'#fff', fontSize:16, fontWeight:900 }}>{l1}%</div><div style={{ color:'#888', fontSize:8 }}>Comisión N1</div></div>
        <div style={{ background:'#111', borderRadius:8, padding:8, textAlign:'center' }}><div style={{ color:'#fff', fontSize:16, fontWeight:900 }}>{subPromoters.length}</div><div style={{ color:'#888', fontSize:8 }}>Sub-promotores</div></div>
      </div>

      {/* REFERRAL LINK */}
      <div style={{ background:'#111', border:'1px solid rgba(230,190,0,0.2)', borderRadius:10, padding:10, marginBottom:12 }}>
        <div style={{ color:C.gold, fontSize:10, fontWeight:700, marginBottom:6 }}>TU ENLACE DE REFERIDO</div>
        <div style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:8, padding:8, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ color:'#fff', fontSize:10, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{refUrl}</span>
          <button onClick={() => { navigator.clipboard.writeText(refUrl); alert('✅ Enlace copiado!') }} style={{ background:'rgba(230,190,0,0.1)', border:'1px solid rgba(230,190,0,0.3)', borderRadius:6, padding:'3px 8px', color:C.gold, fontSize:9, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginLeft:6, flexShrink:0 }}>📋 Copiar</button>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🎱 ¡La Casa De Las Dinámicas! Premios en efectivo 💰\nRegistrate: ${refUrl}`)}`, '_blank')} style={{ flex:1, background:'#27AE60', border:'none', borderRadius:8, padding:8, color:'#fff', fontSize:10, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>WhatsApp</button>
          <button onClick={() => navigator.clipboard.writeText(`🎱 ¡La Casa De Las Dinámicas!\nRegistrate: ${refUrl}`).then(()=>alert('Texto copiado para Instagram!'))} style={{ flex:1, background:'linear-gradient(135deg,#405DE6,#C13584)', border:'none', borderRadius:8, padding:8, color:'#fff', fontSize:10, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>Instagram</button>
          <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refUrl)}`, '_blank')} style={{ flex:1, background:'#1877F2', border:'none', borderRadius:8, padding:8, color:'#fff', fontSize:10, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>Facebook</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.03)', borderRadius:10, padding:4, marginBottom:12 }}>
        {['Dinámicas','Referidos','Comisiones'].map((t,i) => (
          <button key={t} onClick={() => setTab(i)} style={{ flex:1, padding:8, border:'none', background:tab===i?C.card:'transparent', color:tab===i?'#fff':'#555', fontSize:11, fontWeight:700, cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>{t}</button>
        ))}
      </div>

      {/* TAB: Dinámicas con comisión */}
      {tab === 0 && (
        <div>
          <div style={{ color:C.gold, fontSize:12, fontWeight:900, marginBottom:8 }}>🔥 Dinámicas con comisión</div>
          <div style={{ background:'rgba(39,174,96,0.06)', border:'1px solid rgba(39,174,96,0.15)', borderRadius:8, padding:8, marginBottom:8, textAlign:'center' }}>
            <span style={{ color:'#27AE60', fontSize:10, fontWeight:700 }}>💰 Ganas por TODAS las compras de tus referidos, no solo la primera. ¡Comisiones de por vida!</span>
          </div>
          {activeRaffles.length === 0 && <div style={{ color:C.muted, fontSize:11, textAlign:'center', padding:20 }}>No hay dinámicas activas</div>}
          {activeRaffles.map(r => {
            const rl1 = r.commission_l1 || l1
            const earnPer = Math.round(r.ticket_price * rl1 / 100)
            return (
              <div key={r.id} style={{ background:'#111', border:'1.5px solid rgba(230,190,0,0.3)', borderRadius:12, padding:10, marginBottom:6, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, right:0, background:'#27AE60', borderRadius:'0 0 0 8px', padding:'2px 8px' }}><span style={{ color:'#fff', fontSize:8, fontWeight:900 }}>ACTIVO</span></div>
                <div style={{ color:'#fff', fontSize:13, fontWeight:900, marginBottom:4 }}>🎟️ {r.title}</div>
                <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                  <span style={{ background:'rgba(230,190,0,0.08)', borderRadius:6, padding:'3px 8px', color:C.gold, fontSize:10, fontWeight:700 }}>{rl1}% por venta</span>
                  <span style={{ background:'rgba(39,174,96,0.08)', borderRadius:6, padding:'3px 8px', color:'#27AE60', fontSize:10, fontWeight:700 }}>{r.commission_l2||l2}% sub-ref</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ color:'#888', fontSize:10 }}>Boleto: {fmt(r.ticket_price)} · <span style={{ color:C.gold }}>Ganas {fmt(earnPer)}</span></div>
                  <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🎟️ ${r.title} — Premios increíbles!\nCompra aquí: ${refUrl}`)}`,'_blank')} style={{ background:'#27AE60', border:'none', borderRadius:6, padding:'4px 10px', color:'#fff', fontSize:9, fontWeight:900, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>Compartir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB: Referidos */}
      {tab === 1 && (
        <div>
          <div style={{ color:'#fff', fontSize:12, fontWeight:900, marginBottom:8 }}>Mis referidos ({referrals.length})</div>
          {referrals.length === 0 && <div style={{ color:C.muted, fontSize:11, textAlign:'center', padding:20 }}>Aún no tienes referidos. ¡Comparte tu enlace!</div>}
          {referrals.map(r => (
            <div key={r.id} style={{ background:'#111', borderRadius:10, padding:10, marginBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:32, height:32, background:r.is_promoter?'rgba(93,173,226,0.1)':'rgba(39,174,96,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{r.is_promoter?'⭐':'👤'}</div>
                  <div>
                    <div style={{ color:'#fff', fontSize:11, fontWeight:700 }}>{r.full_name||'Sin nombre'} {r.is_promoter && <span style={{ background:'rgba(93,173,226,0.15)', borderRadius:4, padding:'1px 4px', color:'#5DADE2', fontSize:7, fontWeight:900 }}>PROMOTOR</span>}</div>
                    <div style={{ color:'#888', fontSize:9 }}>Tel: {r.phone ? r.phone.slice(0,3)+'****'+r.phone.slice(-3) : 'N/A'}</div>
                  </div>
                </div>
                {r.phone && <button onClick={() => window.open(`https://wa.me/${r.phone.replace(/\D/g,'')}?text=${encodeURIComponent('¡Hola! Soy promotor de La Casa De Las Dinámicas. Hay nuevas dinámicas con premios increíbles, ¿te animas a participar?')}`, '_blank')} style={{ background:'#27AE60', border:'none', borderRadius:6, padding:'4px 8px', color:'#fff', fontSize:8, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>Escribir
                </button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Comisiones */}
      {tab === 2 && (
        <div>
          <div style={{ color:'#fff', fontSize:13, fontWeight:900, marginBottom:8 }}>Estructura de comisiones</div>
          {[['Nivel 1 — Venta directa',`${l1}%`,C.gold],['Nivel 2 — Sub-referido',`${l2}%`,'#27AE60'],['Bono nuevo promotor',fmt(appConfig?.promoter_bonus||5000),'#5DADE2']].map(([label,val,col]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#111', borderRadius:9, padding:'10px 12px', marginBottom:8 }}>
              <span style={{ color:'#ccc', fontSize:12 }}>{label}</span>
              <span style={{ background:`${col}20`, border:`1px solid ${col}50`, borderRadius:6, padding:'3px 10px', color:col, fontSize:12, fontWeight:900 }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => alert('Solicitud de retiro enviada. El admin la procesará pronto.')} style={{ ...S.btnGold, marginTop:12 }}>💸 Solicitar retiro</button>
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

  async function loadUsers(search) {
    let q = supabase.from('users_profile').select('*').order('created_at',{ascending:false}).limit(50)
    if (search) q = q.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
    const { data } = await q
    setAdminUsers(data || [])
  }

  async function addCredits(userId, amount) {
    if (!amount || isNaN(amount)) return
    const user = adminUsers.find(u => u.id === userId)
    if (!user) return
    const newCredits = (user.credits || 0) + parseInt(amount)
    const { error } = await supabase.from('users_profile').update({ credits: newCredits }).eq('id', userId)
    if (error) { alert('Error: ' + error.message); return }
    setCreditAmount('')
    loadUsers(userSearch)
    alert('✅ Créditos agregados: ' + fmt(parseInt(amount)))
  }

  async function addPoints(userId, amount) {
    if (!amount || isNaN(amount)) return
    const user = adminUsers.find(u => u.id === userId)
    if (!user) return
    const newPoints = (user.points || 0) + parseInt(amount)
    const { error } = await supabase.from('users_profile').update({ points: newPoints }).eq('id', userId)
    if (error) { alert('Error: ' + error.message); return }
    setPointsAmount('')
    loadUsers(userSearch)
    alert('✅ Puntos agregados: ' + fmt(parseInt(amount)))
  }

  async function toggleUnlimitedBingo(userId) {
    const user = adminUsers.find(u => u.id === userId)
    if (!user) return
    const newVal = !user.bingo_unlimited
    const { error } = await supabase.from('users_profile').update({ bingo_unlimited: newVal }).eq('id', userId)
    if (error) { alert('Error: ' + error.message); return }
    loadUsers(userSearch)
  }

  async function saveConfig() {
    try {
      // Solo guardar columnas que sabemos que existen en app_config
      // Use snake_case column names matching DB schema
      const payload = {
        id: 1,
        show_points:       localConfig.showPoints       ?? true,
        show_winners:      localConfig.showWinners      ?? true,
        show_how_it_works: localConfig.showHowItWorks   ?? true,
        show_welcome_bonus: localConfig.showWelcomeBonus ?? true,
        show_bingo:        localConfig.show_bingo       ?? true,
        show_promoter_banner: localConfig.show_promoter_banner ?? true,
        show_wa_pay_button:  localConfig.showWAPayButton  ?? true,
        show_chat_pay_button: localConfig.showChatPayButton ?? true,
        wa_msg_template:   localConfig.waMsgTemplate    ?? '',
        show_banner:       localConfig.showBanner       ?? false,
        banner_text:       localConfig.bannerText       ?? '',
        banner_bg:         localConfig.bannerBg         ?? '#E6BE00',
        banner_color:      localConfig.bannerColor      ?? '#5a3e00',
        banner_speed:      localConfig.bannerSpeed      ?? 3,
        payment_whatsapp:  localConfig.paymentWhatsapp  ?? '',
      }
      const { error } = await supabase.from('app_config').upsert(payload, { onConflict: 'id' })
      if (error) throw error
      setAppConfig(prev => ({ ...prev, ...localConfig }))
      alert('Configuracion guardada!')
    } catch(e) { alert('Error al guardar: ' + e.message) }
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
        {['Dinamicas','Boletos','Config','Usuarios'].map((t,i) => (
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
                <button onClick={async (e) => {
                  if (!window.confirm('Eliminar esta dinamica?')) return
                  e.target.textContent = '...'
                  e.target.disabled = true
                  try {
                    const t = new Promise((_,rj) => setTimeout(()=>rj(new Error('timeout')),10000))
                    // Eliminar tickets y boletos asociados primero
                    await Promise.race([supabase.from('tickets').delete().eq('raffle_id', r.id), t])
                    await Promise.race([supabase.from('society_tickets').delete().eq('raffle_id', r.id), t])
                    // Luego eliminar el sorteo
                    const res = await Promise.race([supabase.from('raffles').delete().eq('id', r.id), t])
                    if (res?.error) { alert('Error: ' + res.error.message); e.target.textContent='Eliminar'; e.target.disabled=false; return }
                    loadAdminData(); if(onRefreshRaffles) onRefreshRaffles()
                  } catch(err) { alert('Error: ' + err.message); e.target.textContent='Eliminar'; e.target.disabled=false }
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
              ['show_promoter_banner','Banner Promotor','Muestra banner "Gana dinero" en perfil'],
              ['showWAPayButton','Boton Pagar por WhatsApp','Desactiva para solo chat'],
              ['showChatPayButton','Boton Adjuntar comprobante en chat','Desactiva si no quieres ese boton'],
            ].map(([key,label,desc]) => (
              <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg3, borderRadius:10, padding:'11px 14px', marginBottom:8 }}>
                <div><div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{label}</div><div style={{ color:C.muted, fontSize:10, marginTop:1 }}>{desc}</div></div>
                <Toggle on={!!localConfig[key]} onToggle={() => setLocalConfig(prev=>({...prev,[key]:!prev[key]}))} />
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:10 }}>Comisiones de Promotores</div>
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <div style={{ flex:1 }}><label style={{ fontSize:9, fontWeight:700, color:C.muted, display:'block', marginBottom:4 }}>NIVEL 1 (venta directa)</label><div style={{ display:'flex', alignItems:'center', gap:4 }}><input type="number" value={localConfig.level1_rate||15} onChange={e=>setLocalConfig(p=>({...p,level1_rate:parseInt(e.target.value)||0}))} style={{ flex:1 }} /><span style={{ color:C.muted }}>%</span></div></div>
              <div style={{ flex:1 }}><label style={{ fontSize:9, fontWeight:700, color:C.muted, display:'block', marginBottom:4 }}>NIVEL 2 (sub-referido)</label><div style={{ display:'flex', alignItems:'center', gap:4 }}><input type="number" value={localConfig.level2_rate||5} onChange={e=>setLocalConfig(p=>({...p,level2_rate:parseInt(e.target.value)||0}))} style={{ flex:1 }} /><span style={{ color:C.muted }}>%</span></div></div>
            </div>
            <label style={{ fontSize:9, fontWeight:700, color:C.muted, display:'block', marginBottom:4 }}>BONO POR NUEVO PROMOTOR ($)</label>
            <input type="number" value={localConfig.promoter_bonus||5000} onChange={e=>setLocalConfig(p=>({...p,promoter_bonus:parseInt(e.target.value)||0}))} style={{ marginBottom:8 }} />
            <label style={{ fontSize:9, fontWeight:700, color:C.muted, display:'block', marginBottom:4 }}>PUNTOS POR REGISTRO DE REFERIDO</label>
            <input type="number" value={localConfig.ref_points_register||500} onChange={e=>setLocalConfig(p=>({...p,ref_points_register:parseInt(e.target.value)||0}))} style={{ marginBottom:8 }} />
            <label style={{ fontSize:9, fontWeight:700, color:C.muted, display:'block', marginBottom:4 }}>PUNTOS POR COMPRA DE REFERIDO</label>
            <input type="number" value={localConfig.ref_points_purchase||200} onChange={e=>setLocalConfig(p=>({...p,ref_points_purchase:parseInt(e.target.value)||0}))} style={{ marginBottom:4 }} />
          </div>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:10 }}>WhatsApp de Pagos</div>
            <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Numero WhatsApp</label>
            <input value={localConfig.paymentWhatsapp||''} onChange={e=>setLocalConfig(p=>({...p,paymentWhatsapp:e.target.value}))} placeholder="3013986016" style={{ marginBottom:12 }} />
            <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Mensaje automatico de pago</label>
            <textarea value={localConfig.waMsgTemplate||''} onChange={e=>setLocalConfig(p=>({...p,waMsgTemplate:e.target.value}))} placeholder={'Hola! Quiero pagar mis boletos\n\nSorteo: {sorteo}\nNumeros: {numeros}\nTotal: {total}\n\nPor favor confirmar mi pago 🙏'} rows={5} style={{ marginBottom:6 }} />
            <div style={{ color:C.muted, fontSize:10, lineHeight:1.6 }}>
              Variables disponibles: <span style={{ color:C.gold }}>{'{'+'sorteo{'+'}'}</span> nombre del sorteo · <span style={{ color:C.gold }}>{'{'+'numeros{'+'}'}</span> numeros · <span style={{ color:C.gold }}>{'{'+'total{'+'}'}</span> total a pagar
            </div>
          </div>
          <div style={S.card}>
            <div style={{ color:C.gold, fontSize:13, fontWeight:800, marginBottom:12 }}>Barra Promocional</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg3, borderRadius:10, padding:'11px 14px', marginBottom:10 }}>
              <div>
                <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>Activar barra promocional</div>
                <div style={{ color:C.muted, fontSize:10, marginTop:1 }}>Ticker animado encima del header</div>
              </div>
              <Toggle on={!!localConfig.showBanner} onToggle={() => setLocalConfig(p=>({...p, showBanner:!p.showBanner}))} />
            </div>
            <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Texto del mensaje</label>
            <textarea value={localConfig.bannerText||''} onChange={e=>setLocalConfig(p=>({...p,bannerText:e.target.value}))} rows={3} placeholder="🔥 ¡Hoy es tu día de suerte! · 💰 Premios reales cada semana" style={{ marginBottom:10 }} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Color de fondo</label>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input type="color" value={localConfig.bannerBg||'#E6BE00'} onChange={e=>setLocalConfig(p=>({...p,bannerBg:e.target.value}))} style={{ width:40, height:32, border:`1px solid ${C.cardBorder}`, borderRadius:6, cursor:'pointer', padding:2, background:'transparent' }} />
                  <span style={{ color:C.muted, fontSize:11, fontFamily:'monospace' }}>{localConfig.bannerBg||'#E6BE00'}</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Color del texto</label>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input type="color" value={localConfig.bannerColor||'#5a3e00'} onChange={e=>setLocalConfig(p=>({...p,bannerColor:e.target.value}))} style={{ width:40, height:32, border:`1px solid ${C.cardBorder}`, borderRadius:6, cursor:'pointer', padding:2, background:'transparent' }} />
                  <span style={{ color:C.muted, fontSize:11, fontFamily:'monospace' }}>{localConfig.bannerColor||'#5a3e00'}</span>
                </div>
              </div>
            </div>
            <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Velocidad del scroll</label>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <input type="range" min={1} max={5} step={1} value={localConfig.bannerSpeed||3} onChange={e=>setLocalConfig(p=>({...p,bannerSpeed:Number(e.target.value)}))} style={{ flex:1 }} />
              <span style={{ color:C.muted, fontSize:11, minWidth:50 }}>{['','Muy lento','Lento','Normal','Rápido','Muy rápido'][localConfig.bannerSpeed||3]}</span>
            </div>
            {/* Preview */}
            {localConfig.showBanner && localConfig.bannerText && (
              <div style={{ marginTop:12, background:localConfig.bannerBg||'#E6BE00', overflow:'hidden', height:28, borderRadius:6, display:'flex', alignItems:'center' }}>
                <div style={{ display:'flex', width:'max-content', animation:`marquee ${(6-(localConfig.bannerSpeed||3))*5+8}s linear infinite` }}>
                  <span style={{ whiteSpace:'nowrap', padding:'0 30px', fontSize:12, fontWeight:700, color:localConfig.bannerColor||'#5a3e00' }}>{localConfig.bannerText}&nbsp;&nbsp;&nbsp;</span>
                  <span style={{ whiteSpace:'nowrap', padding:'0 30px', fontSize:12, fontWeight:700, color:localConfig.bannerColor||'#5a3e00' }} aria-hidden="true">{localConfig.bannerText}&nbsp;&nbsp;&nbsp;</span>
                </div>
              </div>
            )}
          </div>
          <button onClick={saveConfig} style={S.btnGold}>Guardar configuracion</button>
        </div>
      )}

      {/* Tab: Usuarios */}
      {tab === 3 && (
        <div>
          <div style={{ marginBottom:12 }}>
            <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Buscar por nombre, teléfono o email..." style={{ marginBottom:8 }} />
            <button onClick={()=>loadUsers(userSearch)} style={{ ...S.btnOutline, fontSize:12 }}>🔍 Buscar usuarios</button>
          </div>

          {adminUsers.length === 0 && <div style={{ color:C.muted, fontSize:12, textAlign:'center', padding:20 }}>Busca un usuario para gestionar sus créditos y puntos</div>}

          {adminUsers.map(u => (
            <div key={u.id} style={{ ...S.card, marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div>
                  <div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>{u.full_name || 'Sin nombre'}</div>
                  <div style={{ color:C.muted, fontSize:10 }}>{u.phone || ''} · {u.email || ''}</div>
                </div>
                <button onClick={()=>setSelectedUser(selectedUser===u.id?null:u.id)} style={{ background:'rgba(230,190,0,0.08)', border:'1px solid rgba(230,190,0,0.2)', borderRadius:8, padding:'4px 10px', color:C.gold, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{selectedUser===u.id?'Cerrar':'Gestionar'}</button>
              </div>

              <div style={{ display:'flex', gap:8, marginBottom:selectedUser===u.id?10:0 }}>
                <div style={{ background:'rgba(93,173,226,0.08)', borderRadius:8, padding:'6px 10px', flex:1, textAlign:'center' }}>
                  <div style={{ color:'#888', fontSize:8 }}>Mi Dinero</div>
                  <div style={{ color:'#5DADE2', fontSize:14, fontWeight:900 }}>{fmt(u.credits||0)}</div>
                </div>
                <div style={{ background:'rgba(230,190,0,0.06)', borderRadius:8, padding:'6px 10px', flex:1, textAlign:'center' }}>
                  <div style={{ color:'#888', fontSize:8 }}>Puntos</div>
                  <div style={{ color:C.gold, fontSize:14, fontWeight:900 }}>{fmt(u.points||0)}</div>
                </div>
                <div style={{ background:u.bingo_unlimited?'rgba(39,174,96,0.1)':'rgba(255,255,255,0.03)', borderRadius:8, padding:'6px 10px', flex:1, textAlign:'center' }}>
                  <div style={{ color:'#888', fontSize:8 }}>Bingo</div>
                  <div style={{ color:u.bingo_unlimited?'#27AE60':'#555', fontSize:10, fontWeight:700 }}>{u.bingo_unlimited?'∞ Ilimitado':'Normal'}</div>
                </div>
              </div>

              {selectedUser === u.id && (
                <div style={{ background:'#0a0a0a', borderRadius:10, padding:10 }}>
                  <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                    <div style={{ flex:1 }}>
                      <label style={{ fontSize:9, color:C.muted, fontWeight:700, display:'block', marginBottom:3 }}>Agregar Mi Dinero $</label>
                      <div style={{ display:'flex', gap:4 }}>
                        <input type="number" value={creditAmount} onChange={e=>setCreditAmount(e.target.value)} placeholder="5000" style={{ flex:1 }} />
                        <button onClick={()=>addCredits(u.id, creditAmount)} style={{ background:'rgba(93,173,226,0.15)', border:'1px solid rgba(93,173,226,0.3)', borderRadius:8, padding:'6px 10px', color:'#5DADE2', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+</button>
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <label style={{ fontSize:9, color:C.muted, fontWeight:700, display:'block', marginBottom:3 }}>Agregar Puntos</label>
                      <div style={{ display:'flex', gap:4 }}>
                        <input type="number" value={pointsAmount} onChange={e=>setPointsAmount(e.target.value)} placeholder="1000" style={{ flex:1 }} />
                        <button onClick={()=>addPoints(u.id, pointsAmount)} style={{ background:'rgba(230,190,0,0.1)', border:'1px solid rgba(230,190,0,0.3)', borderRadius:8, padding:'6px 10px', color:C.gold, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+</button>
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>toggleUnlimitedBingo(u.id)} style={{ width:'100%', background:u.bingo_unlimited?'rgba(231,76,60,0.08)':'rgba(39,174,96,0.08)', border:`1px solid ${u.bingo_unlimited?'rgba(231,76,60,0.3)':'rgba(39,174,96,0.3)'}`, borderRadius:8, padding:8, color:u.bingo_unlimited?'#E74C3C':'#27AE60', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    {u.bingo_unlimited ? '🚫 Quitar bingo ilimitado' : '♾️ Activar bingo ilimitado'}
                  </button>
                  <div style={{ color:C.muted, fontSize:9, marginTop:4 }}>Bingo ilimitado: puede comprar cartones sin límite en cualquier partida</div>
                </div>
              )}
            </div>
          ))}
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
    commission_l1:     raffle?.commission_l1 || 0,
    commission_l2:     raffle?.commission_l2 || 0,
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
      // Parsear premios
      const prizes = (Array.isArray(form.prizes) ? form.prizes : [])
        .filter(p => p && p.amount && String(p.amount).trim())
        .map(p => ({ amount: String(p.amount).trim(), how_to_win: (p.how_to_win||'').trim() }))

      // Parsear numeros de sociedad
      const snRaw = form.society_numbers
        ? String(form.society_numbers).split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
        : []

      const data = {
        title:          String(form.title || '').trim(),
        ticket_price:   Number(form.ticket_price) || 5000,
        raffle_date:    form.raffle_date,
        lottery_name:   String(form.lottery_name || '').trim(),
        status:         form.status || 'active',
        number_range:   Number(form.number_range) || 100,
        prizes:         prizes,
        description:    form.description || '',
        is_featured:    !!form.is_featured,
        is_free:        !!form.is_free,
        accepts_points: form.accepts_points !== false,
        release_hours:  24,
        card_color:     form.card_color || '#E67E22',
        max_per_person: Number(form.max_per_person) || 5,
        commission_l1:  Number(form.commission_l1) || 0,
        commission_l2:  Number(form.commission_l2) || 0,
      }

      // Campos opcionales
      if (snRaw.length > 0) data.society_numbers = snRaw
      else data.society_numbers = null

      if (form.close_time && form.close_time.trim()) {
        data.close_time = form.close_time.length === 5 ? form.close_time + ':00' : form.close_time
      }

      setSaveError('Guardando...')

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout — intenta de nuevo')), 15000)
      )
      let result
      if (isEdit) {
        // .select() es CRITICO — sin el, el update no devuelve respuesta en algunas versiones
        result = await Promise.race([
          supabase.from('raffles').update(data).eq('id', raffle.id).select('id'),
          timeout
        ])
      } else {
        result = await Promise.race([
          supabase.from('raffles').insert(data).select('id'),
          timeout
        ])
      }

      if (result.error) {
        setSaveError('Error: ' + result.error.message)
        setSaving(false)
        return
      }

      setSaveError(null)
      setSaving(false)
      onSave()
    } catch(e) {
      setSaveError('Error: ' + (e.message || String(e)))
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

      {/* COMISIONES DE PROMOTORES */}
      <div style={{ background:'rgba(230,190,0,0.04)', border:'1px solid rgba(230,190,0,0.2)', borderRadius:12, padding:12, marginBottom:14 }}>
        <div style={{ color:C.gold, fontSize:12, fontWeight:800, marginBottom:4 }}>💰 Comisiones de promotores</div>
        <div style={{ color:C.muted, fontSize:10, marginBottom:10 }}>Monto fijo en $ que gana el promotor por cada boleto vendido. Déjalo en 0 si no quieres pagar comisión.</div>
        <FormField label="Comisión Nivel 1 — venta directa ($)">
          <input type="number" value={form.commission_l1} onChange={e => setForm(p => ({ ...p, commission_l1: parseInt(e.target.value) || 0 }))} placeholder="Ej: 10000" />
        </FormField>
        <FormField label="Comisión Nivel 2 — sub-referido ($)">
          <input type="number" value={form.commission_l2} onChange={e => setForm(p => ({ ...p, commission_l2: parseInt(e.target.value) || 0 }))} placeholder="Ej: 2000" />
        </FormField>
        {form.ticket_price > 0 && form.commission_l1 > 0 && (          <div style={{ background:'#0a0a0a', borderRadius:8, padding:10, marginTop:4 }}>
            <div style={{ color:'#888', fontSize:9, marginBottom:4, fontWeight:700 }}>📊 RESUMEN</div>
            <div style={{ color:'#fff', fontSize:11, marginBottom:2 }}>Precio boleto: <span style={{ color:C.gold, fontWeight:700 }}>{fmt(form.ticket_price)}</span></div>
            <div style={{ color:'#fff', fontSize:11, marginBottom:2 }}>Promotor gana: <span style={{ color:'#27AE60', fontWeight:700 }}>{fmt(form.commission_l1)}</span></div>
            <div style={{ color:'#fff', fontSize:11 }}>Tu ingreso neto: <span style={{ color:'#5DADE2', fontWeight:700 }}>{fmt(form.ticket_price - form.commission_l1)}</span></div>
          </div>
        )}
      </div>

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


// ─── BINGO PAGE — v64e premios compactos, como jugar, print español ──────────
function BingoPage({ user, profile, appConfig, onLogin, onBack }) {
  const [game, setGame] = useState(null)
  const [myCartones, setMyCartones] = useState([])
  const [showGuide, setShowGuide] = useState(false)
  const [buyingPack, setBuyingPack] = useState(false)
  const [autoMark, setAutoMark] = useState(true)
  const [expandedCarton, setExpandedCarton] = useState(null)
  const [showBoard, setShowBoard] = useState(false)
  const [winToast, setWinToast] = useState(null)
  const [showPrizeInfo, setShowPrizeInfo] = useState(null)
  const [claimForm, setClaimForm] = useState({ phone:'', method:'', account:'', note:'' })
  const [claimSending, setClaimSending] = useState(false)
  const [countdown, setCountdown] = useState(null)

  function getConfig(g) { try { return JSON.parse(g?.prize_description||'{}') } catch { return {} } }

  useEffect(() => {
    fetchGame()
    const ch = supabase.channel('bingo-live-'+Date.now())
      .on('postgres_changes', { event:'*', schema:'public', table:'bingo_games' }, () => fetchGame())
      .subscribe()
    const poll = setInterval(fetchGame, 6000)
    return () => { supabase.removeChannel(ch); clearInterval(poll) }
  }, [])

  useEffect(() => { if (user && game) fetchMyCartones() }, [user, game?.id])

  // Countdown timer for waiting games
  useEffect(() => {
    if (!game || game.status !== 'waiting') { setCountdown(null); return }
    const cfg = getConfig(game)
    if (!cfg.scheduled_at) { setCountdown(null); return }
    function calc() {
      const diff = new Date(cfg.scheduled_at).getTime() - Date.now()
      if (diff <= 0) { setCountdown({ d:0, h:0, m:0, s:0 }); return }
      setCountdown({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000) })
    }
    calc()
    const iv = setInterval(calc, 1000)
    return () => clearInterval(iv)
  }, [game?.id, game?.status])

  useEffect(() => {
    if (!game || !user || myCartones.length === 0) return
    const called = game.called_numbers || []
    if (called.length === 0) return
    myCartones.forEach(carton => {
      const nums = carton.numbers || []
      const marked = carton.marked || []
      const allNums = nums.flat().filter(n => n !== null)
      if (autoMark) {
        const shouldMark = allNums.filter(n => called.includes(n) && !marked.includes(n))
        if (shouldMark.length > 0) {
          const newMarked = [...marked, ...shouldMark]
          supabase.from('bingo_cartones').update({ marked: newMarked }).eq('id', carton.id)
          setMyCartones(prev => prev.map(c => c.id === carton.id ? { ...c, marked: newMarked } : c))
          checkBingoWin(carton, newMarked, called)
        }
      }
    })
  }, [game?.called_numbers?.length, autoMark])

  function checkBingoWin(carton, marked, called) {
    const cfg = getConfig(game)
    const winTypes = cfg.win_types || ['linea','vertical','diagonal','esquinas','full']
    const winners = cfg.winners || []
    const nums = carton.numbers || []
    const markedSet = new Set(marked)
    const grid = Array.from({length:5}, (_,row) => Array.from({length:5}, (_,col) => {
      const n = nums[col]?.[row]; return n === null || markedSet.has(n)
    }))
    for (const wt of winTypes) {
      if (winners.some(w => w.type === wt && w.userId === user.id)) continue
      const maxWPT = cfg.max_winners_per_type || 1
      if (winners.filter(w => w.type === wt).length >= maxWPT) continue
      let won = false
      if (wt === 'linea') { for (let r=0;r<5;r++) if (grid[r].every(Boolean)) { won=true; break } }
      else if (wt === 'vertical') { for (let c=0;c<5;c++) if (Array.from({length:5},(_,r)=>grid[r][c]).every(Boolean)) { won=true; break } }
      else if (wt === 'diagonal') { if (Array.from({length:5},(_,i)=>grid[i][i]).every(Boolean)) won=true; if (!won && Array.from({length:5},(_,i)=>grid[i][4-i]).every(Boolean)) won=true }
      else if (wt === 'esquinas') { if (grid[0][0]&&grid[0][4]&&grid[4][0]&&grid[4][4]) won=true }
      else if (wt === 'full') { won = grid.every(row => row.every(Boolean)) }
      if (won) { submitAutoWin(carton, wt); return }
    }
  }

  async function submitAutoWin(carton, winType) {
    const cfg = getConfig(game)
    const prizes = cfg.prizes || {}
    const prize = prizes[winType] || 0
    const winners = [...(cfg.winners || []), {
      userId: user.id, name: profile ? `${profile.nombre||''} ${profile.apellido||''}`.trim() : 'Jugador',
      type: winType, cartonNum: carton.carton_number, at_ball: (game.called_numbers||[]).length,
      prize, time: new Date().toISOString(), auto: true
    }]
    const newCfg = { ...cfg, winners }
    await supabase.from('bingo_games').update({ prize_description: JSON.stringify(newCfg) }).eq('id', game.id)
    setWinToast(`🎉 ¡BINGO! Ganaste ${WTL[winType]||winType}${prize ? ' — '+fmt(prize) : ''}!`)
    setTimeout(() => setWinToast(null), 8000)
  }

  async function submitClaim(winnerEntry) {
    if (!claimForm.phone || !claimForm.method) { alert('Ingresa tu teléfono y método de pago'); return }
    setClaimSending(true)
    const cfg = getConfig(game)
    const winners = (cfg.winners || []).map(w =>
      w.userId === winnerEntry.userId && w.type === winnerEntry.type
        ? { ...w, claim: { phone: claimForm.phone, method: claimForm.method, account: claimForm.account, note: claimForm.note, claimedAt: new Date().toISOString(), paid: false } }
        : w
    )
    const newCfg = { ...cfg, winners }
    await supabase.from('bingo_games').update({ prize_description: JSON.stringify(newCfg) }).eq('id', game.id)
    setClaimSending(false)
    setClaimForm({ phone:'', method:'', account:'', note:'' })
  }

  async function fetchGame() {
    try {
      const { data, error } = await supabase.from('bingo_games').select('*').in('status',['active','waiting','paused']).order('created_at',{ascending:false}).limit(1)
      if (error) { console.log('fetchGame error:', error); return }
      const g = data?.[0] || null
      if (g) { setGame(g); return }
      // No active game - check finished
      const { data: fd } = await supabase.from('bingo_games').select('*').eq('status','finished').order('created_at',{ascending:false}).limit(1)
      setGame(fd?.[0] || null)
    } catch(e) { console.log('fetchGame catch:', e) }
  }

  async function fetchMyCartones() {
    if (!game) return
    const { data } = await supabase.from('bingo_cartones').select('*').eq('game_id', game.id).eq('user_id', user.id).order('carton_number')
    setMyCartones(data || [])
  }

  function generateCarton() {
    const cols = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] }
    return Object.entries(cols).map(([_,[min,max]],ci) => {
      const pool = Array.from({length:max-min+1},(_,i)=>i+min).sort(()=>Math.random()-.5)
      return Array.from({length:5},(_,ri) => ci===2&&ri===2 ? null : pool[ri])
    })
  }

  async function buyPack(packOpt) {
    if (!user) { onLogin(); return }
    try {
      const cfg = getConfig(game)
      const numCartones = packOpt?.cartones || cfg.cartones_per_pack || 6
      const maxPer = cfg.max_per_person || 12
      const isUnlimited = profile?.bingo_unlimited === true
      if (!isUnlimited && myCartones.length + numCartones > maxPer) {
        alert(`¡Máximo ${maxPer} cartones por persona! Ya tienes ${myCartones.length}.`)
        return
      }
      setBuyingPack(true)
      const cartones = Array.from({length:numCartones},(_,i) => ({
        game_id: game.id, user_id: user.id, numbers: generateCarton(), marked: [], carton_number: myCartones.length+i+1, paid: false
      }))
      const { error } = await supabase.from('bingo_cartones').insert(cartones)
      if (error) { alert('Error al crear cartones: ' + error.message); setBuyingPack(false); return }
      await fetchMyCartones()
      setBuyingPack(false)
    } catch(err) {
      alert('Error: ' + err.message)
      setBuyingPack(false)
    }
  }

  async function markNumber(cartonId, num) {
    if (!game?.called_numbers?.includes(num)) return
    const carton = myCartones.find(c => c.id === cartonId)
    if (!carton) return
    const newMarked = carton.marked.includes(num) ? carton.marked.filter(n=>n!==num) : [...carton.marked, num]
    await supabase.from('bingo_cartones').update({ marked: newMarked }).eq('id', cartonId)
    setMyCartones(prev => prev.map(c => c.id===cartonId ? {...c, marked:newMarked} : c))
    checkBingoWin(carton, newMarked, game.called_numbers||[])
  }

  function getLetterForNum(n) { if(n<=15) return 'B'; if(n<=30) return 'I'; if(n<=45) return 'N'; if(n<=60) return 'G'; return 'O' }

  function getEmbedUrl(url) {
    if (!url) return ''
    let u = url.trim()
    if (u.includes('youtube.com/watch?v=')) return u.replace('youtube.com/watch?v=','youtube.com/embed/')
    if (u.includes('youtu.be/')) return u.replace('youtu.be/','youtube.com/embed/')
    if (u.includes('youtube.com/live/')) return u.replace('youtube.com/live/','youtube.com/embed/')
    return u
  }

  function handlePrint() {
    const html = myCartones.map((c,ci) => {
      const l=['B','I','N','G','O'], n=c.numbers||[]
      let h=`<div style="page-break-inside:avoid;margin:2%;display:inline-block;width:45%;border:2px solid #ccc;padding:10px"><h3 style="text-align:center;margin:0 0 8px">Cartón #${ci+1}</h3><table style="border-collapse:collapse;width:100%"><tr>${l.map(x=>`<th style="background:#E6BE00;color:#000;padding:6px;border:1px solid #999;text-align:center">${x}</th>`).join('')}</tr>`
      for(let r=0;r<5;r++){h+='<tr>';for(let c2=0;c2<5;c2++){const v=n[c2]?.[r];h+=`<td style="border:1px solid #999;padding:8px;text-align:center;font-size:18px;font-weight:bold">${v===null?'★':v}</td>`}h+='</tr>'}
      return h+'</table></div>'
    }).join('')
    const premiosHtml = winTypes.map(wt => `<span style="background:#f5f5f5;border:1px solid #ddd;border-radius:6px;padding:4px 12px;font-size:12px">${WTL[wt]}: ${prizes[wt]?fmt(prizes[wt]):'—'}</span>`).join(' ')
    const w=window.open('','_blank')
    w.document.write(`<html><head><title>Mis Cartones - Bingo La Casa</title></head><body style="font-family:Arial;padding:20px">
      <h1 style="text-align:center;margin-bottom:4px">Bingo La Casa De Las Dinámicas</h1>
      <h2 style="text-align:center;color:#555;margin-top:0">${game.title||'Bingo'}</h2>
      <div style="text-align:center;margin-bottom:16px">
        <p style="color:#333;font-size:13px;margin:0 0 8px"><b>Premios:</b></p>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px">${premiosHtml}</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center">${html}</div>
      <p style="text-align:center;color:#999;font-size:11px;margin-top:20px">Impreso desde La Casa De Las Dinámicas · lacasadelasdinamicas.com</p>
      <script>setTimeout(()=>window.print(),500)<\/script>
    </body></html>`)
    w.document.close()
  }

  const [shareCount, setShareCount] = useState(() => {
    try { return parseInt(localStorage.getItem('bingo_shares_'+game?.id)||'0') } catch { return 0 }
  })
  const [freeCartonClaimed, setFreeCartonClaimed] = useState(() => {
    try { return localStorage.getItem('bingo_free_'+game?.id)==='true' } catch { return false }
  })

  function handleShare() {
    const ref = profile?.referral_code || ''
    const url = `https://lacasadelasdinamicas.com?ref=${ref}&from=bingo`
    const text = `🎱 ¡Juega Bingo en La Casa De Las Dinámicas! Premios en efectivo 💰\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    const newCount = shareCount + 1
    setShareCount(newCount)
    try { localStorage.setItem('bingo_shares_'+game?.id, String(newCount)) } catch(e) {}
    if (newCount >= 10 && !freeCartonClaimed && user && game) {
      claimFreeCarton()
    }
  }

  async function claimFreeCarton() {
    if (freeCartonClaimed || !user || !game) return
    setFreeCartonClaimed(true)
    try { localStorage.setItem('bingo_free_'+game?.id, 'true') } catch(e) {}
    const carton = {
      game_id: game.id, user_id: user.id, numbers: generateCarton(),
      marked: [], carton_number: myCartones.length + 1, paid: true
    }
    await supabase.from('bingo_cartones').insert(carton)
    await fetchMyCartones()
    alert('🎁 ¡Felicidades! Ganaste un cartón GRATIS por compartir 10 veces')
  }

  const calledNums = game?.called_numbers || []
  const currentNum = game?.current_number
  const cfg = getConfig(game)
  const winners = cfg.winners || []
  const prizes = cfg.prizes || {}
  const winTypes = cfg.win_types || ['linea','vertical','diagonal','esquinas','full']
  const packPrice = cfg.pack_price || game?.carton_price || 6000
  const liveUrl = cfg.live_url || ''
  const wonTypes = winners.map(w => w.type)
  const WTL = { linea:'Línea', vertical:'Vertical', diagonal:'Diagonal', esquinas:'Esquinas', full:'Cartón lleno' }
  const WTIcon = { linea:'→', vertical:'↓', diagonal:'↗', esquinas:'◻️', full:'⬛' }
  const WTDesc = {
    linea: 'Completa 5 números en una fila horizontal (cualquiera de las 5 filas).',
    vertical: 'Completa 5 números en una columna vertical (B, I, N, G u O completa).',
    diagonal: 'Completa 5 números en diagonal (de esquina a esquina). Hay 2 diagonales posibles.',
    esquinas: 'Marca los 4 números de las esquinas del cartón (arriba-izq, arriba-der, abajo-izq, abajo-der).',
    full: 'Marca TODOS los 25 números de tu cartón. Es el premio mayor.'
  }
  const gamePacks = cfg.packs || [{ name:'Pack '+(cfg.cartones_per_pack||6), cartones:cfg.cartones_per_pack||6, price:cfg.pack_price||packPrice }]
  const cPerPack = gamePacks[0]?.cartones || cfg.cartones_per_pack || 6
  const isFree = !!cfg.free_bingo
  const allWon = winTypes.length > 0 && winTypes.every(wt => wonTypes.includes(wt))
  const isFinished = game?.status === 'finished'
  const isWaiting = game?.status === 'waiting'
  const totalPrize = Object.entries(prizes).filter(([k])=>winTypes.includes(k)).reduce((s,[_,v])=>s+v,0)
  const fakePercent = cfg.fake_percent || 0
  const payMethods = cfg.pay_methods || { whatsapp: true }
  const pointsPrice = cfg.points_price || 0

  // ── NO GAME AT ALL ──
  if (!game) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:16 }}>
      <style>{CSS}</style>
      <div style={{ fontSize:64, marginBottom:8 }}>🎱</div>
      <div style={{ color:'#fff', fontSize:20, fontWeight:900, textAlign:'center' }}>No hay Bingo activo</div>
      <div style={{ color:C.muted, fontSize:13, textAlign:'center' }}>El admin iniciará una partida pronto</div>
      <button onClick={onBack} style={{ ...S.btnOutline, marginTop:8, maxWidth:200 }}>← Volver</button>
    </div>
  )

  // ── FINISHED SCREEN ──
  if (isFinished || allWon) return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      <style>{CSS}</style>
      <div style={{ background:C.bg2, padding:'11px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1a1a1a' }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:13, padding:0, fontFamily:'inherit' }}>← Volver</button>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:8, height:8, background:'#888', borderRadius:'50%' }} /><span style={{ color:'#fff', fontSize:12, fontWeight:900 }}>{game.title||'Bingo La Casa'}</span></div>
        <span style={{ color:'#888', fontSize:10 }}>Finalizado</span>
      </div>
      <div style={{ padding:'20px 12px', maxWidth:500, margin:'0 auto', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🏆</div>
        <div style={{ color:'#fff', fontSize:20, fontWeight:900, marginBottom:4 }}>Bingo finalizado</div>
        <div style={{ color:C.muted, fontSize:12, marginBottom:16 }}>Todos los premios fueron entregados</div>

        {winners.length > 0 && (
          <div style={{ background:'#111', border:'1px solid rgba(39,174,96,0.25)', borderRadius:14, padding:12, marginBottom:12, position:'relative', overflow:'hidden', textAlign:'left' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#27AE60,transparent)' }} />
            <div style={{ color:'#27AE60', fontSize:12, fontWeight:700, marginBottom:10 }}>🏆 Ganadores</div>
            {winners.map((w,i) => (
              <div key={i} style={{ background:'rgba(230,190,0,0.04)', border:'1px solid rgba(230,190,0,0.12)', borderRadius:10, padding:'10px 12px', marginBottom:6, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:18 }}>{medals[i]||'🎖️'}</span>
                  <div><div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{w.name||'Jugador'}</div><div style={{ color:C.muted, fontSize:9 }}>Cartón #{w.cartonNum} · Balota #{w.at_ball}</div></div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:C.gold, fontSize:10, fontWeight:700 }}>{WTIcon[w.type]} {WTL[w.type]}</div>
                  {w.prize>0 && <div style={{ color:'#27AE60', fontSize:13, fontWeight:900 }}>{fmt(w.prize)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background:'rgba(230,190,0,0.06)', border:'1px solid rgba(230,190,0,0.15)', borderRadius:12, padding:14, marginBottom:12 }}>
          <div style={{ color:C.gold, fontSize:14, fontWeight:900 }}>Total repartido: {fmt(totalPrize)}</div>
          <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>Gracias por participar · Pronto habrá nuevo bingo</div>
        </div>

        <button onClick={onBack} style={{ ...S.btnGold, maxWidth:300, margin:'0 auto' }}>← Volver al inicio</button>
      </div>
    </div>
  )

  // ── ACTIVE GAME (original flow) ──
  const embedUrl = getEmbedUrl(liveUrl)

  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      <style>{CSS}</style>
      {winToast && <div style={{ position:'fixed', top:80, left:'50%', transform:'translateX(-50%)', zIndex:999, background:'linear-gradient(135deg,#27AE60,#2ECC71)', borderRadius:16, padding:'16px 24px', maxWidth:340, textAlign:'center' }}><div style={{ color:'#fff', fontSize:16, fontWeight:900 }}>{winToast}</div></div>}

      {/* Header */}
      <div style={{ background:C.bg2, padding:'11px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1a1a1a', position:'sticky', top:0, zIndex:40 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:13, padding:0, fontFamily:'inherit' }}>← Volver</button>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, background:game.status==='active'?'#27AE60':'#E67E22', borderRadius:'50%' }} className="pulse" />
          <span style={{ color:'#fff', fontSize:12, fontWeight:900 }}>{game.title||'Bingo La Casa'}</span>
        </div>
        <button onClick={()=>setShowGuide(!showGuide)} style={{ background:'rgba(230,190,0,0.1)', border:'1px solid rgba(230,190,0,0.3)', borderRadius:8, color:C.gold, fontSize:10, fontWeight:700, padding:'5px 10px', cursor:'pointer', fontFamily:'inherit' }}>{showGuide?'Cerrar':'❓ Cómo jugar'}</button>
      </div>

      <div style={{ padding:'12px 12px 100px', maxWidth:500, margin:'0 auto' }}>

        {/* COUNTDOWN — only when waiting */}
        {isWaiting && countdown && cfg.scheduled_at && (
          <div style={{ background:'linear-gradient(135deg,#4a0e0e,#6b1515)', border:'1.5px solid rgba(231,76,60,0.5)', borderRadius:12, padding:12, marginBottom:10, position:'relative', overflow:'hidden', textAlign:'center' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#E74C3C,transparent)' }} />
            <div style={{ color:'#E74C3C', fontSize:8, textTransform:'uppercase', letterSpacing:2, fontWeight:700, marginBottom:6 }}>⏱ Inicia en</div>
            <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:6 }}>
              {[['d','Días'],['h','Horas'],['m','Min']].map(([k,label])=>(
                <div key={k} style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(231,76,60,0.4)', borderRadius:8, padding:'5px 10px', minWidth:46 }}>
                  <div style={{ color:'#ff6b6b', fontSize:20, fontWeight:900, lineHeight:1 }}>{String(countdown[k]).padStart(2,'0')}</div>
                  <div style={{ color:'rgba(231,76,60,0.4)', fontSize:7, marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ color:'#fff', fontSize:11, fontWeight:700 }}>{new Date(cfg.scheduled_at).toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'})} · <span style={{ color:'#ff6b6b' }}>{new Date(cfg.scheduled_at).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</span></div>
          </div>
        )}

        {/* PRIZES — when waiting and no cartones yet */}
        {isWaiting && myCartones.length === 0 && (
          <div style={{ background:'#111', border:'1px solid rgba(230,190,0,0.2)', borderRadius:12, padding:12, marginBottom:10, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(230,190,0,0.6),transparent)' }} />
            <div style={{ textAlign:'center', fontSize:16, marginBottom:2 }}>🏆</div>
            <div style={{ textAlign:'center', color:'#fff', fontSize:13, fontWeight:900, marginBottom:8 }}>¡Premios en efectivo!</div>
            {winTypes.map(wt=>(
              <div key={wt} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(230,190,0,0.06)', border:'1px solid rgba(230,190,0,0.15)', borderRadius:8, padding:'5px 10px', marginBottom:3 }}>
                <span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>{WTIcon[wt]} {WTL[wt]}</span>
                <span style={{ color:C.gold, fontSize:12, fontWeight:900 }}>{prizes[wt]?fmt(prizes[wt]):'—'}</span>
              </div>
            ))}
            <div style={{ background:'rgba(39,174,96,0.08)', borderRadius:7, padding:6, marginTop:4, textAlign:'center' }}><div style={{ color:'#888', fontSize:8 }}>TOTAL</div><div style={{ color:'#27AE60', fontSize:16, fontWeight:900 }}>{fmt(totalPrize)}</div></div>
          </div>
        )}

        {/* PROGRESS BAR — when waiting */}
        {isWaiting && fakePercent > 0 && (
          <div style={{ background:'#111', border:'1px solid rgba(39,174,96,0.2)', borderRadius:10, padding:8, marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>Inscritos</span>
              <span style={{ color:'#27AE60', fontSize:10, fontWeight:700 }}>{fakePercent}%</span>
            </div>
            <div style={{ background:'#0a0a0a', borderRadius:5, height:6, overflow:'hidden' }}>
              <div style={{ background:'#27AE60', height:'100%', width:`${Math.min(fakePercent,100)}%`, borderRadius:5 }} />
            </div>
          </div>
        )}

        {/* PENDING PAYMENT BANNER — when has cartones but unpaid */}
        {myCartones.length > 0 && myCartones.some(c => !c.paid) && (
          <div style={{ background:'rgba(230,126,34,0.1)', border:'1.5px solid rgba(230,126,34,0.4)', borderRadius:12, padding:12, marginBottom:10, textAlign:'center' }}>
            <div style={{ color:'#E67E22', fontSize:14, fontWeight:900, marginBottom:2 }}>⚠️ Pago pendiente</div>
            <div style={{ color:'#fff', fontSize:11, marginBottom:8 }}>{myCartones.length} cartones reservados — envía el pago</div>
            <button onClick={handleShare} style={{ width:'100%', background:'#27AE60', border:'none', borderRadius:10, padding:'9px', color:'#fff', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
              Enviar pago por WhatsApp
            </button>
          </div>
        )}

        {/* LIVE EMBED */}
        {embedUrl && <div style={{ background:'#000', border:'1px solid rgba(230,190,0,0.2)', borderRadius:14, overflow:'hidden', marginBottom:12 }}><div style={{ position:'relative', paddingBottom:'56.25%', height:0 }}><iframe src={embedUrl} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }} allowFullScreen allow="autoplay; encrypted-media" /></div></div>}

        {/* COMO JUGAR */}
        {showGuide && (
          <div style={{ background:'#111', border:'1px solid rgba(230,190,0,0.2)', borderRadius:16, padding:16, marginBottom:14, position:'relative', overflow:'hidden' }}>
            <GoldLine />
            <div style={{ color:C.gold, fontSize:14, fontWeight:900, marginBottom:14, textAlign:'center' }}>¿Cómo jugar Bingo?</div>
            <div style={{ color:'#fff', fontSize:12, fontWeight:700, marginBottom:8 }}>Paso a paso:</div>
            {[
              ['🎟️','Compra tu pack',`Cada pack tiene ${cPerPack} cartones${isFree?' (GRATIS)':` por ${fmt(packPrice)}`}. Cada cartón tiene 25 números aleatorios en 5 columnas (B-I-N-G-O).`],
              ['📺','Mira la transmisión en vivo','El administrador saca las balotas en vivo por YouTube/Instagram. Los números aparecen aquí en tiempo real.'],
              ['✅','Tus cartones se marcan solos','Con "Auto-marcar" activado, cuando sale un número que está en tu cartón, se marca automáticamente en dorado.'],
              ['🏆','¡Gana premios!','El sistema verifica automáticamente si completaste alguna figura. Si ganas, te aparece una notificación y reclamas tu premio.'],
            ].map(([ic,t,d])=>(
              <div key={t} style={{ display:'flex', gap:12, marginBottom:14, paddingBottom:14, borderBottom:'1px solid #1a1a1a' }}>
                <span style={{ fontSize:24, flexShrink:0 }}>{ic}</span>
                <div><div style={{ color:'#fff', fontSize:12, fontWeight:700, marginBottom:3 }}>{t}</div><div style={{ color:C.muted, fontSize:11, lineHeight:1.4 }}>{d}</div></div>
              </div>
            ))}
            <div style={{ color:C.gold, fontSize:12, fontWeight:700, marginBottom:10 }}>Figuras ganadoras:</div>
            {winTypes.map(wt => (
              <div key={wt} style={{ background:'#1a1a1a', borderRadius:10, padding:10, marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{WTIcon[wt]}</span>
                <div style={{ flex:1 }}><div style={{ color:'#fff', fontSize:11, fontWeight:700 }}>{WTL[wt]}</div><div style={{ color:C.muted, fontSize:10, lineHeight:1.3, marginTop:2 }}>{WTDesc[wt]}</div></div>
                <div style={{ color:C.gold, fontSize:11, fontWeight:700, flexShrink:0 }}>{prizes[wt]?fmt(prizes[wt]):'—'}</div>
              </div>
            ))}
            <div style={{ background:'rgba(230,190,0,0.06)', borderRadius:9, padding:10, marginTop:8 }}>
              <div style={{ color:C.muted, fontSize:10, lineHeight:1.4 }}><b style={{ color:'#fff' }}>¿Qué es la estrella ⭐?</b> El centro del cartón (columna N, fila 3) es un espacio libre que cuenta como marcado automáticamente.</div>
            </div>
          </div>
        )}

        {/* BALOTA ACTUAL — hide when waiting */}
        {!isWaiting && <div style={{ background:'#111', border:'1px solid rgba(230,190,0,0.2)', borderRadius:16, padding:14, marginBottom:10, position:'relative', overflow:'hidden' }}>
          <GoldLine />
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:68, height:68, background:currentNum?`linear-gradient(135deg,${C.gold},${C.goldLight})`:'#1a1a1a', borderRadius:'50%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0, border:currentNum?'none':'2px dashed #2a2a2a' }}>
              {currentNum ? (<><span style={{ fontSize:10, fontWeight:900, color:'#5a3e00', lineHeight:1 }}>{getLetterForNum(currentNum)}</span><span style={{ fontSize:28, fontWeight:900, color:'#000', lineHeight:1 }}>{currentNum}</span></>) : <span style={{ color:'#333', fontSize:12 }}>?</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:4, marginBottom:6, flexWrap:'wrap' }}>
                {[...calledNums].slice(-5).map((n,i,arr) => (
                  <div key={`${n}-${i}`} style={{ width:30, height:30, borderRadius:'50%', background:i===arr.length-1?'rgba(230,190,0,0.15)':'#1a1a1a', border:`1px solid ${i===arr.length-1?'rgba(230,190,0,0.4)':'#2a2a2a'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:6, color:i===arr.length-1?C.gold:'#444', lineHeight:1 }}>{getLetterForNum(n)}</span>
                    <span style={{ fontSize:9, fontWeight:700, color:i===arr.length-1?C.gold:'#555', lineHeight:1 }}>{n}</span>
                  </div>
                ))}
                {calledNums.length===0 && <span style={{ color:C.muted, fontSize:11 }}>Esperando...</span>}
              </div>
              <span style={{ color:C.muted, fontSize:10 }}>Cantados: <b style={{ color:C.gold }}>{calledNums.length}/75</b></span>
            </div>
          </div>
        </div>}

        {/* PREMIOS COMPACTOS — hide when waiting */}
        {!isWaiting && <div style={{ background:'#111', border:'1px solid rgba(230,190,0,0.12)', borderRadius:10, padding:'8px 10px', marginBottom:10, display:'flex', gap:4, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ color:'#fff', fontSize:10, fontWeight:900, marginRight:2 }}>🏆</span>
          {winTypes.map(wt => {
            const isWon = wonTypes.includes(wt)
            return (
              <button key={wt} onClick={()=>setShowPrizeInfo(showPrizeInfo===wt?null:wt)} style={{ background:isWon?'rgba(39,174,96,0.15)':'rgba(230,190,0,0.08)', border:`1px solid ${isWon?'rgba(39,174,96,0.3)':'rgba(230,190,0,0.2)'}`, borderRadius:6, padding:'3px 8px', fontSize:9, color:isWon?'#27AE60':C.gold, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:3 }}>
                {isWon && '✅'}{WTIcon[wt]} {WTL[wt]} {prizes[wt]?fmt(prizes[wt]):''}
              </button>
            )
          })}
        </div>}

        {/* POPUP premio seleccionado */}
        {showPrizeInfo && (
          <div style={{ background:'#111', border:'1px solid rgba(230,190,0,0.25)', borderRadius:12, padding:12, marginBottom:10, position:'relative' }}>
            <button onClick={()=>setShowPrizeInfo(null)} style={{ position:'absolute', top:8, right:10, background:'transparent', border:'none', color:'#555', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:20 }}>{WTIcon[showPrizeInfo]}</span>
              <div>
                <div style={{ color:'#fff', fontSize:13, fontWeight:900 }}>{WTL[showPrizeInfo]}</div>
                {prizes[showPrizeInfo] && <div style={{ color:C.gold, fontSize:12, fontWeight:700 }}>Premio: {fmt(prizes[showPrizeInfo])}</div>}
              </div>
            </div>
            <div style={{ color:C.muted, fontSize:11, lineHeight:1.4 }}>{WTDesc[showPrizeInfo]}</div>
            {winners.filter(x=>x.type===showPrizeInfo).length > 0 && (
              <div style={{ background:'rgba(39,174,96,0.1)', borderRadius:8, padding:8, marginTop:8 }}>
                {winners.filter(x=>x.type===showPrizeInfo).map((w,i) => (
                  <div key={i} style={{ color:'#27AE60', fontSize:11, fontWeight:700, marginBottom:i<winners.filter(x=>x.type===showPrizeInfo).length-1?4:0 }}>✅ Ganador {i+1}: {w.name || 'Jugador'}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTROLES — hide when waiting */}
        {!isWaiting && <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <button onClick={()=>setAutoMark(!autoMark)} style={{ flex:1, background:'#111', border:`1px solid ${autoMark?'rgba(39,174,96,0.3)':'#2a2a2a'}`, borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontFamily:'inherit' }}><span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>Auto-marcar</span><Toggle on={autoMark} onToggle={()=>setAutoMark(!autoMark)} /></button>
          <button onClick={()=>setShowBoard(!showBoard)} style={{ background:'#111', border:'1px solid rgba(230,190,0,0.2)', borderRadius:10, padding:'8px 12px', cursor:'pointer', fontFamily:'inherit', color:C.gold, fontSize:10, fontWeight:700 }}>{showBoard?'Ocultar':'1-75'}</button>
          {myCartones.length>0 && <button onClick={handlePrint} style={{ background:'#111', border:'1px solid rgba(230,190,0,0.2)', borderRadius:10, padding:'8px 12px', cursor:'pointer', fontFamily:'inherit', color:C.gold, fontSize:10, fontWeight:700 }}>🖨️ Imprimir</button>}
        </div>}

        {/* TABLERO 1-75 */}
        {!isWaiting && showBoard && (
          <div style={{ background:'#111', border:'1px solid rgba(230,190,0,0.2)', borderRadius:14, padding:10, marginBottom:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3, marginBottom:4 }}>{['B','I','N','G','O'].map(l=><div key={l} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:6, padding:4, textAlign:'center', fontSize:11, fontWeight:900, color:'#000' }}>{l}</div>)}</div>
            {Array.from({length:15},(_,row)=>(
              <div key={row} style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3, marginBottom:2 }}>{Array.from({length:5},(_,col)=>{ const n=row+1+col*15; const ic=calledNums.includes(n); return <div key={n} style={{ padding:'4px 0', borderRadius:5, background:ic?'rgba(230,190,0,0.2)':'#1a1a1a', textAlign:'center', fontSize:9, fontWeight:ic?800:400, color:ic?C.gold:'#888' }}>{n}</div> })}</div>
            ))}
          </div>
        )}

        {/* COMPRAR PACK O CARTONES */}
        {!user ? (
          <div>
            <div style={{ background:'linear-gradient(135deg,rgba(230,190,0,0.06),rgba(230,190,0,0.02))', border:'1.5px solid rgba(230,190,0,0.3)', borderRadius:14, padding:16, marginBottom:10, textAlign:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(230,190,0,0.6),transparent)' }} />
              <div style={{ fontSize:28, marginBottom:4 }}>🎟️</div>
              <div style={{ color:'#fff', fontSize:16, fontWeight:900, marginBottom:2 }}>¡Juega Bingo!</div>
              <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}>Compra tu pack y gana premios en efectivo</div>
              {gamePacks.map((pack,pi)=>(
                <div key={pi} style={{ background:'#0d0d0d', border:'1px solid rgba(230,190,0,0.2)', borderRadius:10, padding:12, marginBottom:8 }}>
                  <div style={{ color:'#fff', fontSize:14, fontWeight:900, marginBottom:1 }}>{pack.name || `Pack de ${pack.cartones}`}</div>
                  <div style={{ color:C.muted, fontSize:10, marginBottom:4 }}>{pack.cartones} cartones aleatorios</div>
                  <div style={{ color:C.gold, fontSize:22, fontWeight:900 }}>{isFree?'GRATIS':fmt(pack.price)}</div>
                </div>
              ))}
              <button onClick={onLogin} style={{ ...S.btnGold, width:'100%', fontSize:14, padding:12, marginBottom:6 }}>🎟️ Comprar y jugar</button>
              <div style={{ color:C.muted, fontSize:10 }}>Al presionar se te pedirá crear cuenta gratis</div>
            </div>
            <div style={{ display:'flex', gap:4, marginBottom:8 }}>
              <div style={{ flex:1, background:'rgba(39,174,96,0.06)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:8, padding:8, textAlign:'center' }}>
                <div style={{ fontSize:14, marginBottom:2 }}>✨</div>
                <div style={{ color:'#27AE60', fontSize:10, fontWeight:700 }}>Auto-verificación</div>
                <div style={{ color:C.muted, fontSize:8 }}>El sistema detecta si ganaste</div>
              </div>
              <div style={{ flex:1, background:'rgba(93,173,226,0.06)', border:'1px solid rgba(93,173,226,0.2)', borderRadius:8, padding:8, textAlign:'center' }}>
                <div style={{ fontSize:14, marginBottom:2 }}>📺</div>
                <div style={{ color:'#5DADE2', fontSize:10, fontWeight:700 }}>En vivo</div>
                <div style={{ color:C.muted, fontSize:8 }}>Transmisión YouTube</div>
              </div>
              <div style={{ flex:1, background:'rgba(230,190,0,0.06)', border:'1px solid rgba(230,190,0,0.2)', borderRadius:8, padding:8, textAlign:'center' }}>
                <div style={{ fontSize:14, marginBottom:2 }}>💰</div>
                <div style={{ color:C.gold, fontSize:10, fontWeight:700 }}>Premios reales</div>
                <div style={{ color:C.muted, fontSize:8 }}>Pago inmediato</div>
              </div>
            </div>
          </div>
        ) : myCartones.length===0 ? (
          <div style={{ marginBottom:14 }}>
            {gamePacks.map((pack,pi)=>(
              <div key={pi} style={{ background:'#111', border:'1px dashed #2a2a2a', borderRadius:14, padding:16, textAlign:'center', marginBottom:8 }}>
                <div style={{ color:'#fff', fontSize:14, fontWeight:900, marginBottom:2 }}>{pack.name || `Pack de ${pack.cartones}`}</div>
                <div style={{ color:C.muted, fontSize:11, marginBottom:2 }}>{pack.cartones} cartones</div>
                <div style={{ color:C.gold, fontSize:20, fontWeight:900, marginBottom:8 }}>{isFree?'GRATIS':fmt(pack.price)}</div>
                <button onClick={()=>buyPack(pack)} disabled={buyingPack} style={{ ...S.btnGold, opacity:buyingPack?.7:1, marginBottom:payMethods.points||payMethods.dinero?6:0 }}>{buyingPack?'Generando...':(isFree?'🎟️ Obtener gratis':'🎟️ Comprar por WhatsApp')}</button>
                {!isFree && payMethods.points && (
                  <button onClick={()=>buyPack(pack)} disabled={buyingPack} style={{ width:'100%', background:'rgba(230,190,0,0.1)', border:'1px solid rgba(230,190,0,0.3)', borderRadius:10, padding:'7px', color:C.gold, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:payMethods.dinero?6:0 }}>Pagar con Puntos{pointsPrice > 0 ? ' · '+fmt(pointsPrice)+' pts' : ''}</button>
                )}
                {!isFree && payMethods.dinero && (
                  <button onClick={()=>buyPack(pack)} disabled={buyingPack} style={{ width:'100%', background:'rgba(93,173,226,0.08)', border:'1px solid rgba(93,173,226,0.25)', borderRadius:10, padding:'7px', color:'#5DADE2', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Pagar con Mi Dinero</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}><span style={{ color:'#fff', fontSize:13, fontWeight:900 }}>Mis {myCartones.length} cartones</span><span style={{ ...S.badge('green'), fontSize:9 }}>Auto-verificación</span></div>

            {/* EXPANDED */}
            {expandedCarton!==null && (()=>{
              const ct=myCartones[expandedCarton]; if(!ct) return null; const nums=ct.numbers||[],marked=ct.marked||[],letters=['B','I','N','G','O']
              return (
                <div style={{ background:'#111', border:'1px solid rgba(230,190,0,0.3)', borderRadius:14, padding:12, position:'relative', overflow:'hidden', marginBottom:12 }}>
                  <GoldLine />
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}><span style={{ color:'#fff', fontSize:13, fontWeight:900 }}>Cartón #{expandedCarton+1}</span><button onClick={()=>setExpandedCarton(null)} style={{ background:'rgba(230,190,0,0.1)', border:'1px solid rgba(230,190,0,0.3)', borderRadius:6, color:C.gold, fontSize:9, padding:'3px 8px', cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>Minimizar</button></div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3, marginBottom:3 }}>{letters.map(l=><div key={l} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:6, padding:5, textAlign:'center', fontSize:13, fontWeight:900, color:'#000' }}>{l}</div>)}</div>
                  {Array.from({length:5},(_,row)=>(
                    <div key={row} style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3, marginBottom:3 }}>{nums.map((col,ci)=>{ const n=col[row],isStar=n===null,isCalled=n!==null&&calledNums.includes(n),isMarked=n!==null?marked.includes(n):true; return <div key={ci} onClick={()=>n&&markNumber(ct.id,n)} style={{ aspectRatio:1, borderRadius:6, background:isStar?`linear-gradient(135deg,${C.gold},${C.goldLight})`:isMarked&&isCalled?'rgba(230,190,0,0.35)':isCalled?'rgba(39,174,96,0.25)':'#fff', border:`1px solid ${isStar?'transparent':isMarked&&isCalled?'rgba(230,190,0,0.6)':isCalled?'rgba(39,174,96,0.5)':'#ddd'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:isStar?'#000':'#000', cursor:isCalled&&!isStar?'pointer':'default' }}>{isStar?'⭐':n}</div> })}</div>
                  ))}
                </div>
              )
            })()}

            {/* GRID 2x3 */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
              {myCartones.map((ct,ci)=>{
                const nums=ct.numbers||[],marked=ct.marked||[],letters=['B','I','N','G','O'],isExp=expandedCarton===ci
                return (
                  <div key={ct.id} onClick={()=>setExpandedCarton(isExp?null:ci)} style={{ background:'#111', border:`1px solid ${isExp?C.gold:!ct.paid?'rgba(230,126,34,0.25)':'rgba(230,190,0,0.2)'}`, borderRadius:10, padding:6, position:'relative', overflow:'hidden', cursor:'pointer', opacity:ct.paid===false&&isWaiting?.6:1 }}>
                    {ct.paid===false && <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%) rotate(-15deg)', background:'rgba(230,126,34,0.9)', borderRadius:4, padding:'2px 8px', zIndex:5 }}><span style={{ color:'#fff', fontSize:7, fontWeight:900, letterSpacing:1 }}>PENDIENTE</span></div>}
                    <GoldLine />
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}><span style={{ color:'#fff', fontSize:9, fontWeight:900 }}>#{ci+1}</span><span style={{ color:C.muted, fontSize:8 }}>{marked.length}m</span></div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2, marginBottom:2 }}>{letters.map(l=><div key={l} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius:3, padding:'2px 0', textAlign:'center', fontSize:7, fontWeight:900, color:'#000' }}>{l}</div>)}</div>
                    {Array.from({length:5},(_,row)=>(
                      <div key={row} style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2, marginBottom:1 }}>{nums.map((col,ci2)=>{ const n=col[row],isStar=n===null,isCalled=n!==null&&calledNums.includes(n),isMarked=n!==null?marked.includes(n):true; return <div key={ci2} style={{ aspectRatio:1, borderRadius:3, background:isStar?`linear-gradient(135deg,${C.gold},${C.goldLight})`:isMarked&&isCalled?'rgba(230,190,0,0.35)':isCalled?'rgba(39,174,96,0.25)':'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, fontWeight:isMarked&&isCalled?900:700, color:'#000' }}>{isStar?'★':n}</div> })}</div>
                    ))}
                  </div>
                )
              })}
            </div>
            <div style={{ textAlign:'center', marginBottom:10 }}><span style={{ color:'#666', fontSize:10 }}>Toca un cartón para verlo grande · BINGO se verifica automáticamente</span></div>

            {/* SHARE + BUY MORE — after cartones */}
            {isWaiting && (
              <>
                {gamePacks.map((pack,pi)=>(
                  <div key={pi} style={{ background:'#111', border:'1px dashed #2a2a2a', borderRadius:12, padding:12, marginBottom:8, textAlign:'center' }}>
                    <div style={{ color:'#fff', fontSize:12, fontWeight:900, marginBottom:2 }}>{pack.name || `Pack de ${pack.cartones}`}</div>
                    <div style={{ color:C.gold, fontSize:16, fontWeight:900, marginBottom:6 }}>{isFree?'GRATIS':fmt(pack.price)}</div>
                    <button onClick={()=>buyPack(pack)} disabled={buyingPack} style={{ ...S.btnGold, fontSize:11, padding:8, opacity:buyingPack?.7:1 }}>{buyingPack?'Generando...':'+ Comprar más cartones'}</button>
                  </div>
                ))}
                <div style={{ background:'rgba(39,174,96,0.06)', border:'1px solid rgba(39,174,96,0.25)', borderRadius:10, padding:10, marginBottom:8, textAlign:'center' }}>
                  <div style={{ color:'#27AE60', fontSize:12, fontWeight:900, marginBottom:4 }}>🎁 Cartón GRATIS · Comparte con 10 amigos</div>
                  <button onClick={handleShare} style={{ width:'100%', background:'#27AE60', border:'none', borderRadius:8, padding:'8px', color:'#fff', fontSize:11, fontWeight:900, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                    Compartir por WhatsApp
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* GANADORES DE ESTA PARTIDA */}
        {winners.length > 0 && (
          <div style={{ background:'#111', border:'1px solid rgba(39,174,96,0.25)', borderRadius:14, padding:12, marginBottom:14, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1.5, background:'linear-gradient(90deg,transparent,#27AE60,transparent)' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ fontSize:18 }}>🏆</span><span style={{ color:'#fff', fontSize:13, fontWeight:900 }}>Ganadores</span></div>
              <span style={{ background:'rgba(39,174,96,0.15)', border:'1px solid rgba(39,174,96,0.3)', borderRadius:999, padding:'2px 8px', color:'#27AE60', fontSize:9, fontWeight:700 }}>{winners.length} premio{winners.length>1?'s':''}</span>
            </div>
            {winners.map((w,i) => {
              const isMe = user && w.userId === user.id
              const hasClaim = !!w.claim
              return (
              <div key={i} style={{ background:'rgba(230,190,0,0.04)', border:'1px solid rgba(230,190,0,0.12)', borderRadius:10, padding:'10px 12px', marginBottom:6 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: isMe && !hasClaim ? 10 : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:20 }}>{medals[i]||'🎖️'}</span>
                    <div>
                      <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{w.name||'Jugador'}</div>
                      <div style={{ color:C.muted, fontSize:10 }}>Cartón #{w.cartonNum} · Balota #{w.at_ball}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:C.gold, fontSize:10, fontWeight:700 }}>{WTIcon[w.type]} {WTL[w.type]}</div>
                    {w.prize>0 && <div style={{ color:'#27AE60', fontSize:11, fontWeight:700 }}>{fmt(w.prize)}</div>}
                  </div>
                </div>
                {isMe && !hasClaim && (
                  <div style={{ background:'rgba(39,174,96,0.06)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:10, padding:10, marginTop:8 }}>
                    <div style={{ color:'#fff', fontSize:11, fontWeight:700, marginBottom:6 }}>Reclama tu premio</div>
                    <div style={{ color:C.muted, fontSize:10, marginBottom:8 }}>Envía tus datos para coordinar la entrega</div>
                    <div style={{ marginBottom:6 }}>
                      <label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:4 }}>WhatsApp / Teléfono *</label>
                      <input type="tel" value={claimForm.phone} onChange={e=>setClaimForm(p=>({...p,phone:e.target.value}))} placeholder="Ej: 301 234 5678" style={{ width:'100%', background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 10px', color:'#fff', fontSize:12, fontFamily:'inherit', boxSizing:'border-box' }} />
                    </div>
                    <div style={{ marginBottom:6 }}>
                      <label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:4 }}>Método de pago *</label>
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {['Nequi','Daviplata','Bancolombia','Efectivo'].map(m=>(
                          <button key={m} onClick={()=>setClaimForm(p=>({...p,method:m}))} style={{ background:claimForm.method===m?'rgba(230,190,0,0.12)':'#1a1a1a', border:`1px solid ${claimForm.method===m?'rgba(230,190,0,0.4)':'#2a2a2a'}`, borderRadius:8, padding:'5px 10px', fontSize:10, color:claimForm.method===m?C.gold:'#888', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{m}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom:6 }}>
                      <label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:4 }}>Número de cuenta / celular</label>
                      <input type="text" value={claimForm.account} onChange={e=>setClaimForm(p=>({...p,account:e.target.value}))} placeholder="Ej: 301 234 5678" style={{ width:'100%', background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 10px', color:'#fff', fontSize:12, fontFamily:'inherit', boxSizing:'border-box' }} />
                    </div>
                    <div style={{ marginBottom:8 }}>
                      <label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:4 }}>Nota adicional (opcional)</label>
                      <input type="text" value={claimForm.note} onChange={e=>setClaimForm(p=>({...p,note:e.target.value}))} placeholder="Horario preferido, otra info..." style={{ width:'100%', background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 10px', color:'#fff', fontSize:12, fontFamily:'inherit', boxSizing:'border-box' }} />
                    </div>
                    <button onClick={()=>submitClaim(w)} disabled={claimSending} style={{ width:'100%', background:'linear-gradient(135deg,#27AE60,#2ECC71)', border:'none', borderRadius:10, padding:'10px', color:'#fff', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit', opacity:claimSending?.7:1 }}>{claimSending?'Enviando...':'✅ Enviar reclamo de premio'}</button>
                  </div>
                )}
                {isMe && hasClaim && (
                  <div style={{ background:'rgba(230,190,0,0.04)', border:'1px solid rgba(230,190,0,0.12)', borderRadius:8, padding:'8px 10px', marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14 }}>✅</span>
                    <div>
                      <div style={{ color:'#27AE60', fontSize:11, fontWeight:700 }}>Reclamo enviado</div>
                      <div style={{ color:C.muted, fontSize:9 }}>Estado: <span style={{ color:w.claim.paid?'#27AE60':'#E67E22', fontWeight:700 }}>{w.claim.paid?'✅ Pagado':'⏳ Pendiente de pago'}</span></div>
                    </div>
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


// ─── ADMIN BINGO PANEL — v64c bulletproof, config in prize_description ────────
function AdminBingoPanel({ onBack }) {
  const [game, setGame] = useState(null)
  const [form, setForm] = useState({
    title: 'Bingo La Casa', pack_price: 6000, mode: 'manual', auto_interval: 15, live_url: '',
    win_types: ['linea', 'vertical', 'diagonal', 'esquinas', 'full'],
    prizes: { linea: 30000, vertical: 30000, diagonal: 40000, esquinas: 40000, full: 50000 },
    scheduled_at: '', cartones_per_pack: 6, max_per_person: 12, free_bingo: false,
    fake_percent: 0, points_price: 0,
    pay_methods: { whatsapp: true, points: false, dinero: false },
    max_winners_per_type: 1,
    packs: [{ name:'Pack 6', cartones:6, price:6000 }]
  })
  const [creating, setCreating] = useState(false)
  const [numInput, setNumInput] = useState('')
  const [calling, setCalling] = useState(false)
  const [autoTimer, setAutoTimer] = useState(null)
  const [stats, setStats] = useState({ players:0, packs:0, revenue:0 })
  const [adminCartones, setAdminCartones] = useState([])

  async function fetchAdminCartones() {
    if (!game) return
    const { data } = await supabase.from('bingo_cartones').select('*, users_profile:user_id(full_name,phone)').eq('game_id', game.id).order('created_at',{ascending:false})
    setAdminCartones(data || [])
  }

  async function approveCarton(cartonId) {
    await supabase.from('bingo_cartones').update({ paid: true }).eq('id', cartonId)
    fetchAdminCartones()
  }

  async function approveAllUser(userId) {
    await supabase.from('bingo_cartones').update({ paid: true }).eq('game_id', game.id).eq('user_id', userId)
    fetchAdminCartones()
  }
  const [editing, setEditing] = useState(false)
  const gameRef = useRef(null)
  const pollPaused = useRef(false)

  function getConfig(g) { try { return JSON.parse(g?.prize_description||'{}') } catch { return {} } }

  async function markWinnerPaid(winnerIdx) {
    if (!game) return
    const cfg = getConfig(game)
    const winners = [...(cfg.winners||[])]
    if (winners[winnerIdx]) {
      winners[winnerIdx] = { ...winners[winnerIdx], claim: { ...(winners[winnerIdx].claim||{}), paid: true, paidAt: new Date().toISOString() } }
      const newCfg = { ...cfg, winners }
      await supabase.from('bingo_games').update({ prize_description: JSON.stringify(newCfg) }).eq('id', game.id)
    }
  }

  const channelRef = useRef(null)
  const pollRef = useRef(null)

  function startPolling() {
    if (channelRef.current) return
    // Only poll when game is active (live bingo needs real-time updates)
    // For waiting/paused, manual refresh is enough
    const g = gameRef.current
    if (!g || g.status !== 'active') return
    channelRef.current = supabase.channel('bingo-admin-'+Date.now())
      .on('postgres_changes', { event:'*', schema:'public', table:'bingo_games' }, () => { if (!pollPaused.current) fetchGame() })
      .subscribe()
    pollRef.current = setInterval(() => { if (!pollPaused.current) fetchGame() }, 5000)
  }

  function stopPolling() {
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  useEffect(() => {
    fetchGame().then(() => { if (gameRef.current) startPolling() })
    return () => { stopPolling(); if (autoTimer) clearInterval(autoTimer) }
  }, [])

  // Start/stop polling based on game status
  useEffect(() => {
    if (game && game.status === 'active') startPolling()
    else stopPolling()
  }, [game?.status])

  useEffect(() => { if (game) { fetchStats(); fetchAdminCartones() } }, [game?.id, game?.status])

  // Load game config into form for editing — only once per game id
  const loadedGameRef = useRef(null)
  useEffect(() => {
    if (game && loadedGameRef.current !== game.id) {
      loadedGameRef.current = game.id
      const cfg = getConfig(game)
      setForm(p => ({
        ...p, title: game.title || p.title, pack_price: cfg.pack_price || game.carton_price || p.pack_price,
        mode: game.mode || p.mode, auto_interval: game.auto_interval || p.auto_interval,
        live_url: cfg.live_url || '', win_types: cfg.win_types || p.win_types, prizes: cfg.prizes || p.prizes,
        scheduled_at: cfg.scheduled_at || '', cartones_per_pack: cfg.cartones_per_pack || 6,
        max_per_person: cfg.max_per_person || 12, free_bingo: !!cfg.free_bingo,
        fake_percent: cfg.fake_percent || 0, points_price: cfg.points_price || 0,
        pay_methods: cfg.pay_methods || { whatsapp: true, points: false, dinero: false },
        max_winners_per_type: cfg.max_winners_per_type || 1,
        packs: cfg.packs || [{ name:'Pack '+(cfg.cartones_per_pack||6), cartones:cfg.cartones_per_pack||6, price:cfg.pack_price||6000 }]
      }))
    }
  }, [game?.id])

  async function fetchGame() {
    if (pollPaused.current) return
    try {
      const { data: rows } = await supabase.from('bingo_games').select('*').in('status',['active','waiting','paused']).order('created_at',{ascending:false}).limit(1)
      const data = rows?.[0] || null
      const d = data || null
      gameRef.current = d
      setGame(prev => {
        if (!prev && !d) return prev
        if (!prev && d) return d
        if (prev && !d) return null
        if (prev.id === d.id && prev.updated_at === d.updated_at && prev.status === d.status) return prev
        return d
      })
    } catch(e) { /* ignore fetch errors during transitions */ }
  }

  async function fetchStats() {
    if (!game) return
    const { data: cartones } = await supabase.from('bingo_cartones').select('user_id').eq('game_id', game.id)
    if (cartones) {
      const players = [...new Set(cartones.map(c => c.user_id))].length
      const packs = Math.ceil(cartones.length / (form.cartones_per_pack || 6))
      const cfg = getConfig(game)
      setStats({ players, packs, revenue: packs * (cfg.pack_price || game.carton_price || 6000) })
    }
  }

  function buildConfigJson() {
    return JSON.stringify({
      pack_price: form.pack_price, live_url: form.live_url, win_types: form.win_types,
      prizes: form.prizes, winners: game ? (getConfig(game).winners || []) : [],
      scheduled_at: form.scheduled_at, cartones_per_pack: form.cartones_per_pack,
      max_per_person: form.max_per_person, free_bingo: form.free_bingo,
      fake_percent: form.fake_percent, points_price: form.points_price,
      pay_methods: form.pay_methods,
      max_winners_per_type: form.max_winners_per_type,
      packs: form.packs
    })
  }

  async function createGame() {
    setCreating(true)
    stopPolling()
    pollPaused.current = true
    // Only remove bingo channels, not tickets/society channels
    try { const chs = supabase.getChannels(); for(const c of chs) { if (c.topic && c.topic.includes('bingo')) supabase.removeChannel(c) } } catch(e) {}
    await new Promise(r => setTimeout(r, 2000))
    try {
      const cfgJson = buildConfigJson()
      const insertData = { title: form.title, prize_description: cfgJson, status: 'waiting', called_numbers: [] }
      console.log('Creating bingo:', insertData)
      const res = await supabase.from('bingo_games').insert(insertData)
      console.log('Result:', res)
      if (res.error) {
        alert('❌ Error: ' + res.error.message + (res.error.details ? '\nDetalles: '+res.error.details : '') + (res.error.hint ? '\nHint: '+res.error.hint : '') + '\nCode: '+(res.error.code||''))
      } else {
        alert('✅ ¡Bingo creado exitosamente!')
      }
    } catch(e) {
      alert('❌ Error: ' + e.message)
    }
    pollPaused.current = false
    await fetchGame()
    if (gameRef.current) startPolling()
    setCreating(false)
  }

  async function saveGame() {
    if (!game) return
    pollPaused.current = true
    const { error } = await supabase.from('bingo_games').update({ title: form.title, prize_description: buildConfigJson() }).eq('id', game.id)
    pollPaused.current = false
    if (error) alert('❌ Error: ' + error.message)
    else alert('✅ Bingo actualizado')
    await fetchGame()
  }

  async function startGame() {
    await supabase.from('bingo_games').update({ status:'active' }).eq('id', game.id)
    await fetchGame()
    if (game.mode === 'auto') startAuto()
  }

  function startAuto() {
    const iv = setInterval(async () => {
      const g = gameRef.current
      if (!g) { clearInterval(iv); return }
      const { data } = await supabase.from('bingo_games').select('called_numbers, status').eq('id', g.id).single()
      if (!data || data.status !== 'active') { clearInterval(iv); return }
      const called = data.called_numbers || []
      const rem = Array.from({length:75},(_,i)=>i+1).filter(n=>!called.includes(n))
      if (rem.length===0) { clearInterval(iv); return }
      const next = rem[Math.floor(Math.random()*rem.length)]
      await supabase.from('bingo_games').update({ called_numbers:[...called,next], current_number:next, updated_at:new Date().toISOString() }).eq('id', g.id)
    }, ((game?.auto_interval||15))*1000)
    setAutoTimer(iv)
  }

  async function callNumber(num) {
    if (!game) return
    setCalling(true)
    const called = game.called_numbers||[]
    if (called.includes(num)) { setCalling(false); return }
    await supabase.from('bingo_games').update({ called_numbers:[...called,num], current_number:num, updated_at:new Date().toISOString() }).eq('id', game.id)
    setCalling(false)
    setNumInput('')
  }

  async function callRandomNumber() {
    if (!game) return
    setCalling(true)
    const called = game.called_numbers||[]
    const rem = Array.from({length:75},(_,i)=>i+1).filter(n=>!called.includes(n))
    if (rem.length===0) { setCalling(false); return }
    const next = rem[Math.floor(Math.random()*rem.length)]
    await callNumber(next)
  }

  function handleNumpad(val) {
    if (val === 'borrar') { setNumInput(''); return }
    if (val === 'cantar') { if (numInput) callNumber(parseInt(numInput)); return }
    const next = numInput + val
    if (parseInt(next)<=75 && next.length<=2) setNumInput(next)
  }

  async function finishGame() {
    if (!window.confirm('¿Finalizar partida? Los jugadores verán la pantalla de ganadores.')) return
    if (autoTimer) { clearInterval(autoTimer); setAutoTimer(null) }
    stopPolling()
    pollPaused.current = true
    await supabase.from('bingo_games').update({ status:'finished' }).eq('id', game.id)
    pollPaused.current = false
    setGame(null)
    gameRef.current = null
  }

  async function deleteGame() {
    if (!window.confirm('¿Eliminar este bingo? Se borrarán todos los cartones y datos.')) return
    if (!window.confirm('⚠️ CONFIRMAR: Esta acción es permanente.')) return
    if (autoTimer) { clearInterval(autoTimer); setAutoTimer(null) }
    stopPolling()
    pollPaused.current = true
    const gid = game.id
    setGame(null)
    gameRef.current = null
    await new Promise(r => setTimeout(r, 300))
    await supabase.from('bingo_cartones').delete().eq('game_id', gid)
    await supabase.from('bingo_games').delete().eq('id', gid)
    pollPaused.current = false
  }

  function toggleWinType(type) { setForm(p=>({...p, win_types:p.win_types.includes(type)?p.win_types.filter(t=>t!==type):[...p.win_types,type]})) }
  function getLetterForNum(n) { if(n<=15) return 'B'; if(n<=30) return 'I'; if(n<=45) return 'N'; if(n<=60) return 'G'; return 'O' }

  const calledNums = game?.called_numbers||[]
  const currentNum = game?.current_number
  const cfg = getConfig(game)
  const winners = cfg.winners || []
  const WTL = { linea:'Línea', vertical:'Vertical', diagonal:'Diagonal', esquinas:'Esquinas', full:'Cartón lleno' }
  const medals = ['🥇','🥈','🥉','🏅','⭐']

  const FormField = ({label,children}) => <div style={{ marginBottom:12 }}><label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:5 }}>{label}</label>{children}</div>

  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      <style>{CSS}</style>
      <div style={{ background:C.bg2, padding:'11px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1a1a1a' }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:C.gold, cursor:'pointer', fontWeight:700, fontSize:13, padding:0, fontFamily:'inherit' }}>← Volver</button>
        <span style={{ color:'#fff', fontSize:13, fontWeight:900 }}>🎱 Panel Bingo</span>
        <span style={{ width:40 }} />
      </div>
      <div style={{ padding:'16px 16px 120px', maxWidth:500, margin:'0 auto' }}>

      {!game ? (
        <div>
          <div style={{ ...S.card, padding:16, marginBottom:12, position:'relative', overflow:'hidden' }}>
            <GoldLine />
            <div style={{ color:'#fff', fontSize:14, fontWeight:900, marginBottom:14, textAlign:'center' }}>Crear nueva partida</div>

            <FormField label="Título"><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></FormField>

            <FormField label="Fecha y hora del bingo">
              <input type="datetime-local" value={form.scheduled_at} onChange={e=>setForm(p=>({...p,scheduled_at:e.target.value}))} style={{ width:'100%' }} />
            </FormField>

            <FormField label="Link del live (YouTube/IG/FB)">
              <input value={form.live_url} onChange={e=>setForm(p=>({...p,live_url:e.target.value}))} placeholder="https://youtube.com/watch?v=..." />
              {form.live_url && form.live_url.includes('youtu') && (
                <div style={{ marginTop:6, background:'#000', border:'1px solid rgba(230,190,0,0.2)', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ position:'relative', paddingBottom:'56.25%', height:0 }}>
                    <iframe src={form.live_url.replace('youtube.com/watch?v=','youtube.com/embed/').replace('youtu.be/','youtube.com/embed/').replace('youtube.com/live/','youtube.com/embed/')} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }} allowFullScreen />
                  </div>
                </div>
              )}
            </FormField>

            {/* PACKS Y CARTONES */}
            <div style={{ background:'rgba(230,190,0,0.04)', border:'1px solid rgba(230,190,0,0.15)', borderRadius:12, padding:12, marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Packs de cartones</div>
                <button onClick={()=>setForm(p=>({...p,packs:[...p.packs,{name:'Pack '+(p.packs.length+1),cartones:6,price:6000}]}))} style={{ background:'rgba(230,190,0,0.1)', border:'1px solid rgba(230,190,0,0.3)', borderRadius:6, padding:'3px 10px', color:C.gold, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Agregar pack</button>
              </div>
              {form.packs.map((pack,pi)=>(
                <div key={pi} style={{ background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:10, padding:10, marginBottom:8, position:'relative' }}>
                  {form.packs.length > 1 && <button onClick={()=>setForm(p=>({...p,packs:p.packs.filter((_,j)=>j!==pi)}))} style={{ position:'absolute', top:6, right:8, background:'transparent', border:'none', color:'#E74C3C', fontSize:12, cursor:'pointer', fontFamily:'inherit', padding:2 }}>✕</button>}
                  <div style={{ marginBottom:6 }}><label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', display:'block', marginBottom:3 }}>Nombre del pack</label><input value={pack.name} onChange={e=>{const v=e.target.value;setForm(p=>({...p,packs:p.packs.map((pk,j)=>j===pi?{...pk,name:v}:pk)}))}} placeholder="Ej: Pack Básico" /></div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <div><label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', display:'block', marginBottom:3 }}>Cartones</label><input type="number" value={pack.cartones} onChange={e=>{const v=parseInt(e.target.value)||1;setForm(p=>({...p,packs:p.packs.map((pk,j)=>j===pi?{...pk,cartones:v}:pk)}))}} min="1" /></div>
                    <div><label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', display:'block', marginBottom:3 }}>Precio $</label><input type="number" value={pack.price} onChange={e=>{const v=parseInt(e.target.value)||0;setForm(p=>({...p,packs:p.packs.map((pk,j)=>j===pi?{...pk,price:v}:pk)}))}} /></div>
                  </div>
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8, marginTop:8 }}>
                <div><label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', display:'block', marginBottom:4 }}>Máx. cartones por persona</label><input type="number" value={form.max_per_person} onChange={e=>setForm(p=>({...p,max_per_person:parseInt(e.target.value)||12}))} /></div>
                <div><label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', display:'block', marginBottom:4 }}>Ganadores por premio</label><input type="number" value={form.max_winners_per_type} onChange={e=>setForm(p=>({...p,max_winners_per_type:parseInt(e.target.value)||1}))} min="1" /></div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(39,174,96,0.08)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:8, padding:'8px 10px', cursor:'pointer' }} onClick={()=>setForm(p=>({...p,free_bingo:!p.free_bingo}))}>
                <div><div style={{ color:'#27AE60', fontSize:12, fontWeight:700 }}>Bingo gratis</div><div style={{ color:C.muted, fontSize:9 }}>Los cartones no tienen costo</div></div>
                <Toggle on={form.free_bingo} />
              </div>
            </div>

            {/* MÉTODOS DE PAGO */}
            <div style={{ background:'rgba(52,152,219,0.04)', border:'1px solid rgba(52,152,219,0.15)', borderRadius:12, padding:12, marginBottom:12 }}>
              <div style={{ color:'#3498DB', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Métodos de pago</div>
              <div style={{ background:'#0a0a0a', border:'1px solid rgba(39,174,96,0.3)', borderRadius:8, padding:'8px 10px', marginBottom:6, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#fff', fontSize:12, fontWeight:600 }}>WhatsApp</span>
                <span style={{ color:'#27AE60', fontSize:9, fontWeight:700 }}>SIEMPRE ACTIVO</span>
              </div>
              <div style={{ background:'#0a0a0a', border:`1px solid ${form.pay_methods.points?'rgba(230,190,0,0.3)':'#2a2a2a'}`, borderRadius:8, padding:'8px 10px', marginBottom:6, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={()=>setForm(p=>({...p,pay_methods:{...p.pay_methods,points:!p.pay_methods.points}}))}>
                  <Toggle on={form.pay_methods.points} />
                  <span style={{ color:form.pay_methods.points?'#fff':'#888', fontSize:12, fontWeight:600 }}>Puntos</span>
                </div>
                {form.pay_methods.points && <input type="number" value={form.points_price} onChange={e=>setForm(p=>({...p,points_price:parseInt(e.target.value)||0}))} placeholder="Precio pts" style={{ width:80, textAlign:'right' }} onClick={e=>e.stopPropagation()} />}
              </div>
              <div style={{ background:'#0a0a0a', border:`1px solid ${form.pay_methods.dinero?'rgba(93,173,226,0.3)':'#2a2a2a'}`, borderRadius:8, padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }} onClick={()=>setForm(p=>({...p,pay_methods:{...p.pay_methods,dinero:!p.pay_methods.dinero}}))}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Toggle on={form.pay_methods.dinero} />
                  <span style={{ color:form.pay_methods.dinero?'#fff':'#888', fontSize:12, fontWeight:600 }}>Mi Dinero (saldo)</span>
                </div>
              </div>
            </div>

            {/* SALA DE ESPERA */}
            <div style={{ background:'rgba(230,126,34,0.04)', border:'1px solid rgba(230,126,34,0.15)', borderRadius:12, padding:12, marginBottom:12 }}>
              <div style={{ color:'#E67E22', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Sala de espera</div>
              <div><label style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', display:'block', marginBottom:4 }}>% de inscritos a mostrar</label>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}><input type="number" value={form.fake_percent} onChange={e=>setForm(p=>({...p,fake_percent:parseInt(e.target.value)||0}))} style={{ flex:1 }} /><span style={{ color:C.muted, fontSize:12, fontWeight:700 }}>%</span></div>
              <div style={{ color:C.muted, fontSize:9, marginTop:4 }}>Se muestra en la barra de progreso para animar a comprar</div></div>
            </div>

            {/* MODO */}
            <FormField label="Modo de balotas">
              <div style={{ display:'flex', gap:8 }}>
                {[['manual','Manual','Tú escribes cada balota'],['auto','Automático','Sale una cada X seg']].map(([v,l,d])=>(
                  <button key={v} onClick={()=>setForm(p=>({...p,mode:v}))} style={{ flex:1, border:`1px solid ${form.mode===v?C.gold:'rgba(230,190,0,0.2)'}`, background:form.mode===v?'rgba(230,190,0,0.1)':C.bg3, borderRadius:9, padding:10, cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
                    <div style={{ color:form.mode===v?C.gold:C.muted, fontSize:12, fontWeight:700 }}>{l}</div><div style={{ color:form.mode===v?'#666':'#444', fontSize:9, marginTop:2 }}>{d}</div>
                  </button>
                ))}
              </div>
            </FormField>
            {form.mode==='auto' && <FormField label="Seg. entre balotas"><input type="number" value={form.auto_interval} onChange={e=>setForm(p=>({...p,auto_interval:parseInt(e.target.value)||15}))} /></FormField>}

            {/* PREMIOS */}
            <FormField label="Premios">
              {[['linea','Línea','→'],['vertical','Vertical','↓'],['diagonal','Diagonal','↗'],['esquinas','Esquinas','◻️'],['full','Cartón lleno','⬛']].map(([type,label,icon])=>{
                const active = form.win_types.includes(type)
                return (
                  <div key={type} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <button onClick={()=>toggleWinType(type)} style={{ width:28, height:28, borderRadius:6, border:`1px solid ${active?C.gold:'#2a2a2a'}`, background:active?'rgba(230,190,0,0.15)':'#1a1a1a', cursor:'pointer', color:active?C.gold:'#555', fontSize:12, fontWeight:700, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center' }}>{active?'✓':''}</button>
                    <span style={{ color:active?'#fff':'#555', fontSize:11, fontWeight:600, minWidth:80 }}>{icon} {label}</span>
                    <div style={{ flex:1, position:'relative' }}>
                      <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#555', fontSize:12, pointerEvents:'none' }}>$</span>
                      <input type="number" value={form.prizes[type]||0} onChange={e=>setForm(p=>({...p,prizes:{...p.prizes,[type]:parseInt(e.target.value)||0}}))} style={{ width:'100%', opacity:active?1:.3, paddingLeft:26 }} disabled={!active} />
                    </div>
                  </div>
                )
              })}
              <div style={{ background:'rgba(230,190,0,0.06)', borderRadius:9, padding:'8px 12px', marginTop:8 }}>
                <span style={{ color:C.gold, fontSize:11, fontWeight:700 }}>Total premios: {fmt(Object.entries(form.prizes).filter(([k])=>form.win_types.includes(k)).reduce((s,[_,v])=>s+v,0))}</span>
              </div>
            </FormField>

            <button onClick={createGame} disabled={creating} style={{ ...S.btnGold, opacity:creating?.7:1 }}>{creating?'Creando...':'🎱 Crear partida'}</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ ...S.card, marginBottom:12, position:'relative', overflow:'hidden' }}>
            <GoldLine />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div><div style={{ color:'#fff', fontSize:14, fontWeight:900 }}>{game.title}</div></div>
              <div style={{ background:game.status==='active'?'rgba(39,174,96,0.15)':'rgba(230,126,34,0.15)', border:`1px solid ${game.status==='active'?'rgba(39,174,96,0.3)':'rgba(230,126,34,0.3)'}`, borderRadius:999, padding:'3px 10px', color:game.status==='active'?'#27AE60':'#E67E22', fontSize:9, fontWeight:700 }}>
                {game.status==='active'?'En vivo':game.status==='waiting'?'En espera':'Pausado'}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {[['Jugadores',stats.players,C.gold],['Packs',stats.packs,C.gold],['Recaudo',fmt(stats.revenue),'#27AE60']].map(([l,v,c])=>(
                <div key={l} style={{ background:'rgba(230,190,0,0.06)', borderRadius:8, padding:'6px 8px', flex:1, textAlign:'center' }}><div style={{ color:C.muted, fontSize:9 }}>{l}</div><div style={{ color:c, fontSize:16, fontWeight:900 }}>{v}</div></div>
              ))}
            </div>
            {game.status !== 'active' && <button onClick={()=>fetchGame()} style={{ marginTop:8, width:'100%', background:'rgba(52,152,219,0.08)', border:'1px solid rgba(52,152,219,0.2)', borderRadius:8, padding:6, color:'#3498DB', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>↻ Actualizar datos</button>}
          </div>

          {/* PAYMENT APPROVAL */}
          {adminCartones.length > 0 && (() => {
            const pending = adminCartones.filter(c => !c.paid)
            const paid = adminCartones.filter(c => c.paid)
            const grouped = {}
            pending.forEach(c => {
              const uid = c.user_id
              if (!grouped[uid]) grouped[uid] = { user: c.users_profile, cartones: [], userId: uid }
              grouped[uid].cartones.push(c)
            })
            const groups = Object.values(grouped)
            return groups.length > 0 ? (
              <div style={{ ...S.card, marginBottom:12, borderColor:'rgba(230,126,34,0.3)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div style={{ color:'#E67E22', fontSize:12, fontWeight:900 }}>⏳ Pagos pendientes ({pending.length} cartones)</div>
                  <span style={{ color:'#27AE60', fontSize:10 }}>✅ {paid.length} pagados</span>
                </div>
                {groups.map(g => (
                  <div key={g.userId} style={{ background:'rgba(230,126,34,0.06)', border:'1px solid rgba(230,126,34,0.2)', borderRadius:10, padding:10, marginBottom:6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{g.user?.full_name || 'Sin nombre'}</div>
                        <div style={{ color:'#888', fontSize:10 }}>{g.user?.phone || ''} · {g.cartones.length} cartones</div>
                      </div>
                      <button onClick={() => approveAllUser(g.userId)} style={{ background:'rgba(39,174,96,0.12)', border:'1px solid rgba(39,174,96,0.3)', borderRadius:8, padding:'6px 12px', color:'#27AE60', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✅ Aprobar</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : adminCartones.length > 0 ? (
              <div style={{ background:'rgba(39,174,96,0.06)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:10, padding:10, marginBottom:12, textAlign:'center' }}>
                <span style={{ color:'#27AE60', fontSize:11, fontWeight:700 }}>✅ Todos pagados ({paid.length} cartones)</span>
              </div>
            ) : null
          })()}

          {/* ACTION BUTTONS — always visible */}
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            <button onClick={finishGame} style={{ flex:1, background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.3)', borderRadius:10, padding:'10px', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
              <div style={{ color:'#E74C3C', fontSize:12, fontWeight:700 }}>⏹ Finalizar</div>
            </button>
            <button onClick={deleteGame} style={{ flex:1, background:'rgba(192,57,43,0.06)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:10, padding:'10px', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
              <div style={{ color:'#C0392B', fontSize:12, fontWeight:700 }}>🗑 Eliminar</div>
              <div style={{ color:'#888', fontSize:8, marginTop:1 }}>Borra todo</div>
            </button>
          </div>

          {/* EDITABLE FIELDS */}
          <div style={{ ...S.card, marginBottom:12, borderColor:'rgba(52,152,219,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ color:'#3498DB', fontSize:11, fontWeight:700 }}>✏️ Editar</div>
              <button onClick={saveGame} style={{ background:'rgba(52,152,219,0.12)', border:'1px solid rgba(52,152,219,0.3)', borderRadius:8, padding:'5px 12px', color:'#3498DB', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✓ Guardar</button>
            </div>
            <FormField label="Título"><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></FormField>
            <FormField label="Fecha y hora"><input type="datetime-local" value={form.scheduled_at} onChange={e=>setForm(p=>({...p,scheduled_at:e.target.value}))} style={{ width:'100%' }} /></FormField>
            <FormField label="Link del live">
              <input value={form.live_url} onChange={e=>setForm(p=>({...p,live_url:e.target.value}))} placeholder="https://youtube.com/watch?v=..." />
              {form.live_url && form.live_url.includes('youtu') && (
                <div style={{ marginTop:6, background:'#000', border:'1px solid rgba(230,190,0,0.2)', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ position:'relative', paddingBottom:'56.25%', height:0 }}>
                    <iframe src={form.live_url.replace('youtube.com/watch?v=','youtube.com/embed/').replace('youtu.be/','youtube.com/embed/').replace('youtube.com/live/','youtube.com/embed/')} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }} allowFullScreen />
                  </div>
                </div>
              )}
            </FormField>
            <FormField label="% inscritos (sala espera)">
              <div style={{ display:'flex', alignItems:'center', gap:8 }}><input type="number" value={form.fake_percent} onChange={e=>setForm(p=>({...p,fake_percent:parseInt(e.target.value)||0}))} style={{ flex:1 }} /><span style={{ color:C.muted }}>%</span></div>
            </FormField>
          </div>

          {game.status==='waiting' && <button onClick={startGame} style={{ ...S.btnGold, background:'linear-gradient(135deg,#27AE60,#2ECC71)', color:'#fff', marginBottom:12, fontSize:15 }}>▶ Iniciar EN VIVO</button>}

          {game.status==='active' && (
            <>
              <div style={{ textAlign:'center', marginBottom:12 }}>
                <div style={{ width:72, height:72, background:currentNum?`linear-gradient(135deg,${C.gold},${C.goldLight})`:'#1a1a1a', borderRadius:'50%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', margin:'0 auto 8px' }}>
                  {currentNum ? (<><span style={{ fontSize:10, fontWeight:900, color:'#5a3e00' }}>{getLetterForNum(currentNum)}</span><span style={{ fontSize:30, fontWeight:900, color:'#000' }}>{currentNum}</span></>) : <span style={{ color:'#333' }}>?</span>}
                </div>
                <div style={{ display:'flex', justifyContent:'center', gap:4, marginBottom:4 }}>
                  {[...calledNums].slice(-5).map((n,i,arr)=>(<div key={`${n}-${i}`} style={{ width:28, height:28, borderRadius:'50%', background:i===arr.length-1?'rgba(230,190,0,0.15)':'#1a1a1a', border:`1px solid ${i===arr.length-1?'rgba(230,190,0,0.4)':'#2a2a2a'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:i===arr.length-1?C.gold:'#555' }}>{n}</div>))}
                </div>
                <span style={{ color:C.muted, fontSize:10 }}>Cantados: <b style={{ color:C.gold }}>{calledNums.length}/75</b></span>
              </div>

              {game.mode==='manual' && (
                <div style={{ ...S.card, marginBottom:12, position:'relative', overflow:'hidden' }}>
                  <GoldLine />
                  <div style={{ color:'#fff', fontSize:12, fontWeight:900, textAlign:'center', marginBottom:10 }}>Escribe la balota</div>
                  <div style={{ background:'#0a0a0a', border:`2px solid ${C.gold}`, borderRadius:12, padding:14, textAlign:'center', marginBottom:10 }}><span style={{ fontSize:32, fontWeight:900, color:C.gold, letterSpacing:4 }}>{numInput||'_'}</span></div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5, marginBottom:8 }}>
                    {['1','2','3','4','5','6','7','8','9','borrar','0','cantar'].map(val=>(
                      <button key={val} onClick={()=>handleNumpad(val)} disabled={val==='cantar'&&(calling||!numInput)}
                        style={{ background:val==='cantar'?`linear-gradient(135deg,${C.gold},${C.goldLight})`:val==='borrar'?'rgba(192,57,43,0.15)':'#1a1a1a', border:`1px solid ${val==='cantar'?'transparent':val==='borrar'?'rgba(192,57,43,0.4)':'#2a2a2a'}`, borderRadius:10, padding:14, fontSize:val==='cantar'||val==='borrar'?13:18, fontWeight:700, cursor:'pointer', fontFamily:'inherit', color:val==='cantar'?'#000':val==='borrar'?'#E74C3C':'#fff', opacity:val==='cantar'&&(calling||!numInput)?.5:1 }}>
                        {val==='borrar'?'⌫':val==='cantar'?(calling?'...':'✓ Cantar'):val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {game.mode==='auto' && (
                <div style={{ background:'rgba(39,174,96,0.08)', border:'1px solid rgba(39,174,96,0.2)', borderRadius:12, padding:12, textAlign:'center', marginBottom:12 }}>
                  <div style={{ color:'#27AE60', fontSize:12, fontWeight:700 }}>Automatico cada {game.auto_interval||15}s</div>
                  {!autoTimer && <button onClick={startAuto} style={{ ...S.btnOutline, borderColor:'rgba(39,174,96,0.4)', color:'#27AE60', marginTop:8, fontSize:12 }}>▶ Reanudar</button>}
                </div>
              )}

              {game.mode==='manual' && <button onClick={callRandomNumber} disabled={calling} style={{ ...S.btnOutline, marginBottom:12, fontSize:12, opacity:calling?.7:1 }}>🎲 Aleatorio (backup)</button>}
            </>
          )}

          {winners.length>0 && (
            <div style={{ ...S.card, marginBottom:12, borderColor:'rgba(39,174,96,0.25)' }}>
              <div style={{ color:'#27AE60', fontSize:12, fontWeight:700, marginBottom:8 }}>🏆 Ganadores (auto-verificados)</div>
              {winners.map((w,i)=>(
                <div key={i} style={{ background:'#0d0d0d', border:`1px solid ${w.claim?.paid?'rgba(39,174,96,0.25)':'rgba(230,190,0,0.15)'}`, borderRadius:10, padding:10, marginBottom:i<winners.length-1?8:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:w.claim?6:0 }}>
                    <div><span style={{ color:'#fff', fontSize:12, fontWeight:700 }}>{medals[i]||'🎖️'} {w.name}</span><div style={{ color:C.muted, fontSize:9 }}>Cartón #{w.cartonNum} · Balota #{w.at_ball}</div></div>
                    <div style={{ textAlign:'right' }}><span style={{ ...S.badge(w.claim?.paid?'green':'gold'), fontSize:9 }}>{w.claim?.paid?'✅ Pagado':WTL[w.type]||w.type}</span>{w.prize>0 && <div style={{ color:'#27AE60', fontSize:10, fontWeight:700, marginTop:2 }}>{fmt(w.prize)}</div>}</div>
                  </div>
                  {w.claim && (
                    <div style={{ background:'rgba(39,174,96,0.06)', border:'1px solid rgba(39,174,96,0.15)', borderRadius:8, padding:8, marginBottom:6 }}>
                      <div style={{ fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:.8, fontWeight:700, marginBottom:4 }}>Datos de contacto</div>
                      <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                        <div><span style={{ color:C.muted, fontSize:10 }}>Tel: </span><span style={{ color:'#fff', fontSize:10, fontWeight:600 }}>{w.claim.phone}</span></div>
                        <div><span style={{ color:C.muted, fontSize:10 }}>Pago: </span><span style={{ color:C.gold, fontSize:10, fontWeight:600 }}>{w.claim.method}</span></div>
                        {w.claim.account && <div><span style={{ color:C.muted, fontSize:10 }}>Cuenta: </span><span style={{ color:'#fff', fontSize:10, fontWeight:600 }}>{w.claim.account}</span></div>}
                      </div>
                      {w.claim.note && <div style={{ color:C.muted, fontSize:9, marginTop:4 }}>Nota: "{w.claim.note}"</div>}
                      {w.claim.paid && w.claim.paidAt && <div style={{ color:'#27AE60', fontSize:9, marginTop:4, fontWeight:600 }}>Pagado el {new Date(w.claim.paidAt).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})} · {new Date(w.claim.paidAt).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</div>}
                    </div>
                  )}
                  {!w.claim?.paid && (
                    <div style={{ display:'flex', gap:6 }}>
                      <div style={{ flex:1, background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.2)', borderRadius:8, padding:7, textAlign:'center', fontSize:10, color:'#E67E22', fontWeight:700 }}>{w.claim?'⏳ Pendiente':'Sin reclamo'}</div>
                      <button onClick={()=>markWinnerPaid(i)} style={{ flex:1, background:'rgba(39,174,96,0.12)', border:'1px solid rgba(39,174,96,0.3)', borderRadius:8, padding:7, textAlign:'center', fontSize:10, color:'#27AE60', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✓ Marcar pagado</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ ...S.card, marginBottom:12 }}>
            <div style={{ color:'#fff', fontSize:12, fontWeight:700, marginBottom:10 }}>Cantados ({calledNums.length})</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {calledNums.length===0 ? <span style={{ color:C.muted, fontSize:11 }}>Ninguno</span> :
                calledNums.map(n=><div key={n} style={{ width:30, height:30, borderRadius:8, background:'rgba(230,190,0,0.15)', border:'1px solid rgba(230,190,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontSize:10, fontWeight:700 }}>{n}</div>)}
            </div>
          </div>


        </div>
      )}
    </div>
  </div>
  )
}
