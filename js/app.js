/* ═══════════════════════════════════════════
   MR. BRAND — SHARED APP LOGIC
   Cart, Cursor, Animations, Helpers
═══════════════════════════════════════════ */

// ─── CART STORE ───
const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem('mrbrand_cart')) || []; }
    catch { return []; }
  },
  save(items) {
    localStorage.setItem('mrbrand_cart', JSON.stringify(items));
    Cart.updateBadge();
  },
  add(product) {
    const items = Cart.get();
    const key = `${product.id}-${product.variant || 'default'}`;
    const existing = items.find(i => i.key === key);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 5);
    } else {
      items.push({ ...product, key, qty: 1 });
    }
    Cart.save(items);
    showToast('✓', product.name, 'Added to your cart');
  },
  remove(key) {
    const items = Cart.get().filter(i => i.key !== key);
    Cart.save(items);
  },
  updateQty(key, qty) {
    const items = Cart.get();
    const item = items.find(i => i.key === key);
    if (item) { item.qty = qty; if (item.qty <= 0) return Cart.remove(key); }
    Cart.save(items);
  },
  count() { return Cart.get().reduce((s,i) => s + i.qty, 0); },
  total() { return Cart.get().reduce((s,i) => s + (i.price * i.qty), 0); },
  clear() { localStorage.removeItem('mrbrand_cart'); Cart.updateBadge(); },
  updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(el => {
      const c = Cart.count();
      el.textContent = c;
      el.style.display = c > 0 ? 'flex' : 'none';
    });
  }
};

// ─── WISHLIST ───
const Wishlist = {
  get() { try { return JSON.parse(localStorage.getItem('mrbrand_wishlist')) || []; } catch { return []; } },
  toggle(id) {
    let list = Wishlist.get();
    if (list.includes(id)) {
      list = list.filter(i => i !== id);
      showToast('♡', 'Removed from Wishlist', '');
    } else {
      list.push(id);
      showToast('♥', 'Added to Wishlist', 'Saved for later');
    }
    localStorage.setItem('mrbrand_wishlist', JSON.stringify(list));
    return list.includes(id);
  },
  has(id) { return Wishlist.get().includes(id); }
};

// ─── TOAST ───
function showToast(icon, msg, sub) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon" id="tIcon"></span><div><div class="toast-msg" id="tMsg"></div><div class="toast-sub" id="tSub"></div></div>`;
    document.body.appendChild(toast);
  }
  document.getElementById('tIcon').textContent = icon;
  document.getElementById('tMsg').textContent = msg;
  document.getElementById('tSub').textContent = sub;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── CUSTOM CURSOR ───
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!cursor || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(${mx-5}px, ${my-5}px)`;
  });
  (function loop() {
    rx += (mx - rx - 18) * 0.12;
    ry += (my - ry - 18) * 0.12;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a,button,.pcard,.btn-gold,.btn-outline,.nav-icon-btn,.filter-option,.cat-pill,.wishlist-btn,.product-thumb');
    if (t) ring.classList.add('hover');
    else ring.classList.remove('hover');
  });
}

// ─── NAV SCROLL ───
function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll);
  onScroll();
}

// ─── REVEAL OBSERVER ───
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ─── HERO PARALLAX ───
function initParallax() {
  document.addEventListener('mousemove', e => {
    const xR = (e.clientX / window.innerWidth - 0.5) * 2;
    const yR = (e.clientY / window.innerHeight - 0.5) * 2;
    document.querySelectorAll('.hero-orb').forEach((orb, i) => {
      const f = (i + 1) * 14;
      orb.style.transform = `translate(${xR*f}px, ${yR*f}px)`;
    });
  });
}

// ─── RIPPLE ───
function initRipple() {
  document.querySelectorAll('.btn-gold, .btn-outline').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = btn.getBoundingClientRect();
      const r = document.createElement('span');
      r.style.cssText = `position:absolute;left:${e.clientX-rect.left}px;top:${e.clientY-rect.top}px;
        width:0;height:0;background:rgba(255,255,255,0.22);border-radius:50%;
        transform:translate(-50%,-50%);animation:rippleAnim 0.6s ease forwards;pointer-events:none;`;
      btn.style.position = 'relative'; btn.style.overflow = 'hidden';
      btn.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  });
  if (!document.getElementById('rippleStyle')) {
    const s = document.createElement('style');
    s.id = 'rippleStyle';
    s.textContent = '@keyframes rippleAnim{to{width:200px;height:200px;opacity:0}}';
    document.head.appendChild(s);
  }
}

// ─── FORMAT PRICE ───
function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}

// ─── PRODUCTS DATA ───
const PRODUCTS = [
  { id:'p1', name:'Solstice I', collection:'Celestial', spec:'42mm · Automatic · 18K Gold', price:245000, badge:'new', color:'#C9A84C', bg:'rgba(201,168,76,0.12)', dialBg:'#1a1510', caseFill:'#3a2e1a', series:'Celestial', movement:'Automatic', material:'18K Yellow Gold', strap:'Brown Leather', water:'100m', power:'50hr', diameter:'42mm', description:'The Solstice I captures the eternal dance of the cosmos in its 18K gold case. A Manufacture automatic movement beats at the heart of this celestial companion, each oscillation a testament to decades of horological mastery.' },
  { id:'p2', name:'Midnight Azure', collection:'Nocturne', spec:'40mm · Manual Wind · Titanium', price:320000, oldPrice:390000, badge:'ltd', color:'#4D9FFF', bg:'rgba(77,159,255,0.10)', dialBg:'#0a1525', caseFill:'#0f1e32', series:'Nocturne', movement:'Manual Wind', material:'Grade 5 Titanium', strap:'Navy Rubber', water:'200m', power:'72hr', diameter:'40mm', description:'Born from the depths of the midnight ocean, the Azure wears a stunning blue dial that shifts like deep water under moonlight. The titanium case ensures featherlight elegance on the wrist.' },
  { id:'p3', name:'Equinox Chrono', collection:'Horizon', spec:'44mm · Quartz · Stainless Steel', price:69500, oldPrice:85000, badge:'sale', color:'#00FFD1', bg:'rgba(0,255,209,0.08)', dialBg:'#081510', caseFill:'#0d2018', series:'Horizon', movement:'Quartz Chronograph', material:'316L Stainless Steel', strap:'Black Leather', water:'50m', power:'—', diameter:'44mm', description:'Precision engineered for the modern explorer. The Equinox Chrono pairs a Swiss quartz chronograph movement with a striking green-tinted dial — a watch that commands attention in boardroom and wilderness alike.' },
  { id:'p4', name:'Aure Perpetua', collection:'Lumière', spec:'39mm · Automatic · 18K Gold', price:420000, badge:'', color:'#E8C96D', bg:'rgba(232,201,109,0.10)', dialBg:'#201808', caseFill:'#3a2e10', series:'Lumière', movement:'Automatic', material:'18K Yellow Gold', strap:'Champagne Leather', water:'30m', power:'48hr', diameter:'39mm', description:'Light incarnate. The Aure Perpetua channels pure luminosity through a champagne dial that seems to glow from within. A dress watch of rare refinement, shaped for those who inhabit the extraordinary.' },
  { id:'p5', name:'Rouge Mystère', collection:'Nocturne', spec:'41mm · Automatic · Rose Gold', price:185000, badge:'new', color:'#C96D6D', bg:'rgba(201,109,109,0.10)', dialBg:'#1a0c0c', caseFill:'#2a1515', series:'Nocturne', movement:'Automatic', material:'18K Rose Gold', strap:'Bordeaux Leather', water:'50m', power:'48hr', diameter:'41mm', description:'A whisper of desire rendered in rose gold. The Rouge Mystère is a study in passionate restraint — its deep burgundy dial and rose gold case creating a timeless tension between warmth and shadow.' },
  { id:'p6', name:'Argent Squelette', collection:'Perpetua', spec:'43mm · Tourbillon · Steel', price:980000, badge:'ltd', color:'#B8B8C8', bg:'rgba(184,184,200,0.07)', dialBg:'#1a1a1a', caseFill:'#2a2a2a', series:'Perpetua', movement:'Tourbillon', material:'316L Stainless Steel', strap:'Steel Bracelet', water:'30m', power:'80hr', diameter:'43mm', description:'Where engineering becomes sculpture. Every gear, spring, and balance wheel of the Argent Squelette is revealed through a fully open skeleton dial — a living canvas of horological art.' },
  { id:'p7', name:'Verdant GMT', collection:'Horizon', spec:'42mm · Automatic · Titanium', price:135000, badge:'', color:'#5A9E7A', bg:'rgba(90,158,122,0.10)', dialBg:'#0a1a10', caseFill:'#0f2018', series:'Horizon', movement:'Automatic GMT', material:'Grade 5 Titanium', strap:'Forest Green Fabric', water:'200m', power:'52hr', diameter:'42mm', description:'For the traveller who never loses track of home. The Verdant GMT pairs a second time-zone complication with a striking forest green dial, set in a lightweight titanium case that shrugs off adventure.' },
  { id:'p8', name:'Nebula Moon', collection:'Celestial', spec:'38mm · Quartz · Steel', price:54000, oldPrice:72000, badge:'sale', color:'#9B6EC8', bg:'rgba(155,110,200,0.08)', dialBg:'#160d22', caseFill:'#1e1230', series:'Celestial', movement:'Quartz Moon Phase', material:'316L Stainless Steel', strap:'Purple Leather', water:'50m', power:'—', diameter:'38mm', description:'A pocket of the cosmos on your wrist. The Nebula Moon\'s moon phase complication and violet dial create an intimate window to the night sky, perfect for the dreamer who finds poetry in precision.' },
  { id:'p9', name:'Grand Complication I', collection:'Perpetua', spec:'45mm · Tourbillon · 18K Gold', price:2450000, badge:'ltd', color:'#C9A84C', bg:'rgba(201,168,76,0.14)', dialBg:'#201a08', caseFill:'#3a2e1a', series:'Perpetua', movement:'Tourbillon + Perpetual Calendar', material:'18K Yellow Gold', strap:'Alligator Leather', water:'30m', power:'80hr', diameter:'45mm', description:'The pinnacle of MR. BRAND\'s horological ambition. Only 9 pieces are crafted per year, each requiring over 800 hours of hand-finishing. A perpetual calendar, tourbillon, and chiming mechanism coexist in perfect harmony.' },
  { id:'p10', name:'Horizon Diver', collection:'Horizon', spec:'44mm · Automatic · Steel', price:92000, badge:'new', color:'#4D9FFF', bg:'rgba(77,159,255,0.08)', dialBg:'#060d18', caseFill:'#0f1e32', series:'Horizon', movement:'Automatic', material:'316L Stainless Steel', strap:'Black Rubber', water:'500m', power:'48hr', diameter:'44mm', description:'Engineered to conquer the deep. The Horizon Diver features a unidirectional rotating bezel, luminous markers, and a hermetically sealed case rated to 500 metres — where light fades but time never stops.' },
  { id:'p11', name:'Lumière Blanc', collection:'Lumière', spec:'36mm · Quartz · White Gold', price:310000, badge:'', color:'#F0EBE0', bg:'rgba(240,235,224,0.06)', dialBg:'#181614', caseFill:'#2a2520', series:'Lumière', movement:'Quartz', material:'18K White Gold', strap:'Pearl White Leather', water:'30m', power:'—', diameter:'36mm', description:'Pure as light at dawn. The Lumière Blanc is a jewellery-watch of sublime delicacy — its white gold case and pearlescent dial crafted for those who wear elegance without effort.' },
  { id:'p12', name:'Nocturne Absolute', collection:'Nocturne', spec:'42mm · Automatic · PVD Black', price:175000, badge:'new', color:'#555565', bg:'rgba(85,85,101,0.10)', dialBg:'#080808', caseFill:'#151515', series:'Nocturne', movement:'Automatic', material:'PVD Black Steel', strap:'Black Leather', water:'100m', power:'48hr', diameter:'42mm', description:'Darkness perfected. Every surface of the Nocturne Absolute is coated in deep black PVD — a ghost that haunts the wrist with understated menace. For those who let their presence speak before their words.' }
];

// ─── INIT ON LOAD ───
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initReveal();
  initRipple();
  Cart.updateBadge();
  // prevent # links
  document.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
});

// Generate watch SVG
function watchSVG(color, caseFill, dialBg, size=130, h2=8, m2=10, s2=7) {
  const id = 'wg' + Math.random().toString(36).slice(2,7);
  return `<svg width="${size}" height="${Math.round(size*1.27)}" viewBox="0 0 220 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="85" y="0" width="50" height="65" rx="4" fill="${dialBg}" stroke="${color}" stroke-width="0.5" opacity="0.9"/>
    <rect x="80" y="62" width="60" height="14" rx="3" fill="${color}" opacity="0.45"/>
    <circle cx="110" cy="140" r="72" fill="url(#${id}cg)"/>
    <circle cx="110" cy="140" r="72" fill="none" stroke="${color}" stroke-width="2" opacity="0.8"/>
    <circle cx="110" cy="140" r="66" fill="url(#${id}dg)"/>
    <g stroke="${color}" stroke-width="1.5" opacity="0.6">
      <line x1="110" y1="76" x2="110" y2="84"/><line x1="110" y1="196" x2="110" y2="204"/>
      <line x1="46" y1="140" x2="54" y2="140"/><line x1="166" y1="140" x2="174" y2="140"/>
    </g>
    <g fill="${color}" opacity="0.85">
      <rect x="107" y="86" width="6" height="12" rx="1"/>
      <rect x="107" y="182" width="6" height="12" rx="1"/>
      <rect x="55" y="137" width="12" height="6" rx="1"/>
      <rect x="153" y="137" width="12" height="6" rx="1"/>
    </g>
    <text x="110" y="125" text-anchor="middle" font-family="'Syncopate',sans-serif" font-size="7" fill="${color}" letter-spacing="3" opacity="0.95">MR. BRAND</text>
    <text x="110" y="135" text-anchor="middle" font-family="sans-serif" font-size="5" fill="${color}" letter-spacing="2" opacity="0.5">SWISS MADE</text>
    <line x1="110" y1="140" x2="${110+h2}" y2="98" stroke="#F0EBE0" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="110" y1="140" x2="${110+m2}" y2="${140-m2}" stroke="#F0EBE0" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="110" y1="140" x2="${110-s2}" y2="${140+s2*1.5}" stroke="#00FFD1" stroke-width="1" stroke-linecap="round" opacity="0.9"/>
    <circle cx="110" cy="140" r="4" fill="${color}"/><circle cx="110" cy="140" r="1.5" fill="#F0EBE0"/>
    <rect x="181" y="134" width="12" height="12" rx="2" fill="${color}" opacity="0.7"/>
    <rect x="80" y="204" width="60" height="14" rx="3" fill="${color}" opacity="0.45"/>
    <rect x="85" y="215" width="50" height="65" rx="4" fill="${dialBg}" stroke="${color}" stroke-width="0.5" opacity="0.9"/>
    <defs>
      <radialGradient id="${id}cg" cx="38%" cy="34%" r="70%"><stop offset="0%" stop-color="${caseFill}"/><stop offset="100%" stop-color="#070605"/></radialGradient>
      <radialGradient id="${id}dg" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="${dialBg}"/><stop offset="100%" stop-color="#030302"/></radialGradient>
    </defs>
  </svg>`;
}
