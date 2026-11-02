// Core engine: state and saving, sound, dialogue (say), inventory, scene visuals (applyVisuals), hotspot input and close-ups (openModal).
// Loaded in order by js/boot.js; all game files share the same global scope.

const KEY = 'hello-it-basement-v1';
const $ = s => document.querySelector(s);
const fresh = () => ({ v:1, ch:1, scene:'office', pc:'bsod', f:{}, inv:[], hl:{}, hints:0, t:0, ach:{}, netTaps:0, started:false });
let S = fresh();
let sel = null;
/* Motion: 'auto' follows the device's "reduce motion" setting; 'on' and 'off' override it. Saved per device.
   Some browsers (e.g. Firefox) pass on the operating system's "reduce animations" setting, so everything stood still there. */
let motionPref = (() => { try{ return localStorage.getItem(KEY + '-motion') || 'auto'; }catch(e){ return 'auto'; } })();
const deviceReducesMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function reducedMotion(){ return motionPref === 'off' || (motionPref === 'auto' && deviceReducesMotion()); }
function applyMotion(){
  const root = document.documentElement;
  root.classList.toggle('motion-on', motionPref === 'on');
  root.classList.toggle('motion-off', motionPref === 'off');
  // SMIL animations inside the scenes (waving arms…) ignore CSS, so pause them by hand
  document.querySelectorAll('svg.scene').forEach(s => { try{ reducedMotion() ? s.pauseAnimations() : s.unpauseAnimations(); }catch(e){} });
  const b = document.getElementById('btn-motion');
  if(b){ b.textContent = 'Motion ' + motionPref;
    b.title = motionPref === 'auto' ? `Auto follows your device's "reduce motion" setting (now: ${deviceReducesMotion() ? 'reduced, so things stand still' : 'full motion'}). Click to change.`
            : motionPref === 'on' ? 'Everything moves, whatever your device prefers. Click to change.' : 'Nothing moves. Click to change.'; }
}
let soundOn = (() => { try{ return localStorage.getItem(KEY + '-sound') !== '0'; }catch(e){ return true; } })();

/* ---------- persistence ---------- */
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function load(){ try{ const d = JSON.parse(localStorage.getItem(KEY)||'null'); return d && d.v===1 ? d : null; }catch(e){ return null; } }

/* ---------- sound ---------- */
let ac = null;
function beep(freq=660, dur=.08, type='square', vol=.05){
  if(!soundOn) return;
  try{
    ac = ac || new (window.AudioContext||window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime+dur);
    o.start(); o.stop(ac.currentTime+dur+.02);
  }catch(e){}
}
const chord = (arr, gap=90) => arr.forEach((f,i)=>setTimeout(()=>beep(f,.12,'square',.05), i*gap));

/* ---------- dialogue ---------- */
const WHO = { you:'You', moss:'Moss · intercom', sys:'Basement', machine:'Answering machine', duck:'Rubber duck', term:'Terminal', jen:'Jen · phone', douglas:'Douglas Reynholm', fax:'Fax-o-Matic 3000', roy:'Roy', dragon:'SMAUG-O-TRON 3000' };
let queue = [], typing = null, full = '', onDone = null;
function say(lines, done){
  queue = (Array.isArray(lines) ? lines : [lines]).map(l => typeof l === 'string' ? ['you', l] : l);
  onDone = done || null;
  next();
}
/* Portraits next to the dialogue (portraits/*.svg). The narrator ('sys') has none. */
function faceFor(who){
  const file = { you:'you', roy:'roy', moss:'moss', jen:'jen', machine:'machine', duck:'duck', fax:'fax', dragon:'dragon', douglas: S.ch===6 ? 'douglas-captain' : 'douglas' }[who];
  return file ? `portraits/${file}.svg` : null;
}
function talkFace(name){
  const who = /^Roy/.test(name) ? 'roy' : /^Jen/.test(name) ? 'jen' : /^Moss/.test(name) ? 'moss' : /^Douglas/.test(name) ? 'douglas' : null;
  return who ? `<img class="talk-face" src="${faceFor(who)}" alt="${name}">` : '';
}
function next(){
  clearInterval(typing); typing = null;
  const box = $('#dialog');
  if(!queue.length){ box.hidden = true; const d = onDone; onDone = null; d && d(); return; }
  const [who, text] = queue.shift();
  box.hidden = false;
  box.className = 'dialog who-' + who;
  const face = faceFor(who), fe = $('#d-face');
  if(face){ box.classList.add('has-face'); fe.hidden = false;
    if(fe.getAttribute('src') !== face){ fe.src = face; fe.classList.remove('face-in'); void fe.offsetWidth; fe.classList.add('face-in'); } }
  else fe.hidden = true;
  $('#d-who').textContent = (who==='jen' && S.ch===6) ? 'Jen · on deck' : (who==='moss' && S.ch===6) ? 'Moss' : (who==='jen' && S.ch===5) ? 'Jen' : (who==='moss' && S.ch===5) ? 'Moss · walkie-talkie' : who==='sys' ? (S.ch===6 ? 'The river' : S.ch===5 ? 'The dungeon' : S.ch===4 ? 'The lift' : S.ch===3 ? 'Top floor' : S.ch===2 ? "Jen's office" : 'Basement') : (WHO[who] || who);
  const verb = matchMedia('(hover: none)').matches ? 'tap' : 'click'; $('#d-more').textContent = queue.length ? verb + ' ▸' : verb + ' ✕';
  full = text; let i = 0; const el = $('#d-txt'); el.textContent = '';
  const reduce = reducedMotion();
  if(reduce){ el.textContent = full; return; }
  typing = setInterval(() => { i += 2; el.textContent = full.slice(0, i); if(i >= full.length){ clearInterval(typing); typing = null; } }, 16);
}
$('#dialog').addEventListener('click', () => {
  if(typing){ clearInterval(typing); typing = null; $('#d-txt').textContent = full; return; }
  next();
});

/* ---------- inventory ---------- */
const ITEMS = {
  ext: { name:'Fire extinguisher', svg:'<svg viewBox="0 0 44 44"><rect x="15" y="12" width="14" height="28" rx="6" fill="#c8262c"/><rect x="18" y="20" width="8" height="8" fill="#f2efe4"/><path d="M17 12h10l2-4h-14z" fill="#333"/><path d="M28 10q10 4 8 14" stroke="#222" stroke-width="2.5" fill="none"/></svg>' },
  duck:{ name:'Rubber duck', svg:'<svg viewBox="0 0 44 44"><ellipse cx="24" cy="30" rx="13" ry="8" fill="#ffd21f"/><circle cx="17" cy="18" r="8" fill="#ffd21f"/><path d="M9 18l-6 2 6 3z" fill="#f08a1c"/><circle cx="15" cy="16" r="1.6" fill="#111"/></svg>' }
};
ITEMS.card = { name:'Wi-Fi card', desc:'Jen\'s handwriting: "BOARDROOM WI-FI. Network: Boardroom-Projector. Key: SHOES4EVER."',
  svg:'<svg viewBox="0 0 44 44"><rect x="5" y="10" width="34" height="24" rx="3" fill="#fff"/><path d="M13 22q9-7 18 0M16 26q6-4 12 0" stroke="#8a5cf6" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="22" cy="29" r="2" fill="#8a5cf6"/></svg>' };
ITEMS.paper = { name:'Fax paper', desc:"Denholm's last ream of fax paper. 'For emergencies and contracts.'",
  svg:'<svg viewBox="0 0 44 44"><rect x="9" y="12" width="26" height="22" fill="#e9e4d8" transform="rotate(-6 22 23)"/><rect x="10" y="10" width="26" height="22" fill="#fff"/><path d="M14 16h18M14 21h18M14 26h12" stroke="#c9c2b2" stroke-width="2"/></svg>' };
ITEMS.dphone = { name:"Douglas's phone", desc:"Warm, slightly sticky, and full of apps Douglas shouldn't have installed.",
  svg:'<svg viewBox="0 0 44 44"><rect x="13" y="4" width="18" height="36" rx="4" fill="#111" stroke="#c9a24a" stroke-width="2"/><rect x="15.5" y="8" width="13" height="26" rx="1.5" fill="#1e3a8a"/></svg>' };
ITEMS.cable = { name:'Cable', get desc(){ return (CABLES[S.cable] || ['A cable'])[0] + ". From Roy's backpack."; },
  svg:'<svg viewBox="0 0 44 44"><rect x="4" y="17" width="10" height="8" rx="1" fill="#cfd4d8" stroke="#555"/><path d="M14 21 C22 8 24 36 32 21" stroke="#222" stroke-width="3" fill="none"/><rect x="32" y="18" width="9" height="6" rx="3" fill="#cfd4d8" stroke="#555"/></svg>' };
ITEMS.usb = { name:'USB stick', desc:'Labelled SPELL.JS. Found inside the 250 GB hard drive.',
  svg:'<svg viewBox="0 0 44 44"><rect x="8" y="16" width="22" height="12" rx="3" fill="#5f3dc4"/><rect x="30" y="18" width="8" height="8" fill="#cfd4d8" stroke="#555"/><text x="19" y="25" text-anchor="middle" font-size="6" fill="#fff" font-family="monospace">.JS</text></svg>' };
ITEMS.batteries = { name:'4 × AA batteries', desc:"From the potion shelf's secret compartment. A dragon's favourite snack.",
  svg:'<svg viewBox="0 0 44 44"><g fill="#2b8a3e"><rect x="7" y="12" width="7" height="22" rx="2"/><rect x="16" y="12" width="7" height="22" rx="2"/><rect x="25" y="12" width="7" height="22" rx="2"/><rect x="34" y="12" width="7" height="22" rx="2"/></g><g fill="#cfd4d8"><rect x="9" y="9" width="3" height="3"/><rect x="18" y="9" width="3" height="3"/><rect x="27" y="9" width="3" height="3"/><rect x="36" y="9" width="3" height="3"/></g></svg>' };
ITEMS.key = { name:'Ignition key', desc:'A small brass key with a tag: IGNITION. It was taped inside the ship\'s bell.',
  svg:'<svg viewBox="0 0 44 44"><circle cx="14" cy="22" r="8" fill="none" stroke="#e8c766" stroke-width="4"/><path d="M22 22h16M32 22v6M37 22v5" stroke="#e8c766" stroke-width="4" stroke-linecap="round"/><rect x="6" y="30" width="14" height="8" rx="2" fill="#f1e3c8"/></svg>' };
ITEMS.ext.desc = 'Made in Britain. Use it on something that is on fire.';
ITEMS.duck.desc = 'Explain your problem to it. Use it on anything for a free hint.';
function renderInv(){
  const wrap = $('#slots'); wrap.innerHTML = '';
  for(let i=0;i<4;i++){
    const id = S.inv[i];
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'slot' + (id ? ' filled' : '') + (id && sel===id ? ' sel' : '');
    if(id){ b.innerHTML = ITEMS[id].svg; b.title = ITEMS[id].name; b.setAttribute('aria-label', ITEMS[id].name);
      b.onclick = () => { if(id==='dphone'){ sel = null; renderInv(); return openPhone(); } sel = sel===id ? null : id; beep(880,.04); renderInv(); };
    } else { b.disabled = true; b.setAttribute('aria-label','Empty slot'); }
    wrap.appendChild(b);
  }
  $('#tray-hint').textContent = sel ? `${ITEMS[sel].name}: ${ITEMS[sel].desc} Click a spot to use it, or the item again to put it away.` : (matchMedia('(hover: none)').matches ? 'Select an item, then tap where you want to use it.' : 'Select an item, then click where you want to use it.');
  document.querySelectorAll('.hit').forEach(h => h.classList.toggle('item-cursor', !!sel));
}
function give(id){ if(!S.inv.includes(id)) S.inv.push(id); chord([523,659,784]); renderInv(); save(); }
function take(id){ S.inv = S.inv.filter(x=>x!==id); if(sel===id) sel=null; renderInv(); save(); }

/* ---------- scene visuals ---------- */
function buildDecor(){
  // books on low shelf
  const g = $('#books1'); let x = 752; const cols = ['#8a2b22','#2b4a7a','#c9a24a','#3c6b45','#5a3a6b','#b5652a','#2a2a2a','#7a7a6a'];
  for(const row of [448, 548]){ x = 752; let k = row;
    while(x < 930){ const w = 10 + (x*7 % 13), h = 64 + (x*3 % 18);
      g.insertAdjacentHTML('beforeend', `<rect x="${x}" y="${row+ (80-h)}" width="${w}" height="${h}" fill="${cols[(x+k)%cols.length]}"/>`); x += w + 2; k+=3; }
  }
  // dip mini switches on door
  const d = $('#dip-mini');
  for(let i=0;i<8;i++) d.insertAdjacentHTML('beforeend', `<rect x="${1497+i*10.5}" y="410" width="7" height="28" rx="1"/>`);
  // rack units
  const r = $('#rack');
  for(let y=246, n=0; y<670; y+=30, n++){
    r.insertAdjacentHTML('beforeend', `<rect x="312" y="${y}" width="306" height="24" rx="2" fill="#19212d" stroke="#273246"/>`);
    for(let k=0;k<6;k++) r.insertAdjacentHTML('beforeend', `<rect x="${420+k*30}" y="${y+6}" width="24" height="12" fill="#121821"/>`);
    const c1 = n%3 ? '#5dff8a' : '#3aa0ff', c2 = n%4 ? '#3aa0ff' : '#ffb02e';
    r.insertAdjacentHTML('beforeend', `<circle class="led blink" style="animation-delay:-${(n*0.37)%1.1}s" cx="330" cy="${y+12}" r="4" fill="${c1}"/><circle class="led blink" style="animation-delay:-${(n*0.61)%1.1}s;animation-duration:${.6+(n%4)*.25}s" cx="346" cy="${y+12}" r="4" fill="${c2}"/><circle class="led" cx="362" cy="${y+12}" r="4" fill="#5dff8a"/>`);
  }
}
function applyVisuals(){
  $('#sc-office').classList.toggle('on', S.scene==='office');
  $('#sc-server').classList.toggle('on', S.scene==='server');
  $('#sc-jen').classList.toggle('on', S.scene==='jen');
  $('#sc-doug').classList.toggle('on', S.scene==='doug');
  $('#sc-lift').classList.toggle('on', S.scene==='lift');
  $('#sc-dungeon').classList.toggle('on', S.scene==='dungeon');
  $('#sc-yacht').classList.toggle('on', S.scene==='yacht');
  exitLabels();
  $('#chap').textContent = S.ch===6 ? 'Chapter 6 · The Yacht' : S.ch===5 ? 'Chapter 5 · Dungeons & Datacenters' : S.ch===4 ? 'Chapter 4 · The Lift' : S.ch===3 ? 'Chapter 3 · The Executive Floor' : S.ch===2 ? "Chapter 2 · Jen's Office" : 'Chapter 1 · The Basement Lockdown';
  $('#lock-led').setAttribute('fill', S.f.out2 ? '#3cff6a' : '#3aa0ff');
  $('#lap-lock').style.display = S.f.lap ? 'none' : '';
  $('#portrait').setAttribute('transform', S.f.portrait ? 'matrix(0.25 -0.12 0 1 225 36)' : '');
  $('#safe-vis').style.display = S.f.portrait ? '' : 'none';
  const hp = $('#hit-portrait'); hp.dataset.label = S.f.portrait ? "Denholm's safe" : 'Portrait of Denholm'; hp.setAttribute('aria-label', hp.dataset.label);
  $('#blinds').style.display = S.f.out3 ? 'none' : '';
  $('#alarm-glow').style.display = S.f.out3 ? 'none' : '';
  $('#alarm-light').setAttribute('fill', S.f.out3 ? '#3cff6a' : '#ff2a2a');
  $('#privacy-scr').setAttribute('fill', S.f.out3 ? '#0e3a1a' : '#3a0a0a');
  $('#privacy-txt').textContent = S.f.out3 ? 'RELEASED' : 'PRIVACY'; $('#privacy-txt2').textContent = S.f.out3 ? '' : 'MODE';
  ['#privacy-txt','#privacy-txt2'].forEach(id => $(id).setAttribute('fill', S.f.out3 ? '#7dff9a' : '#ff6b6b'));
  $('#screen-pops').style.display = S.f.pops ? 'none' : '';
  $('#doug-scr').setAttribute('fill', S.f.cpu ? '#0b7285' : '#1e3a8a');
  $('#fax-jam').style.display = S.f.jamFixed ? 'none' : '';
  $('#phone-docked').style.display = S.f.charged ? '' : 'none'; $('#hit-docked').style.display = S.f.charged ? '' : 'none';
  $('#docked-scr').setAttribute('fill', S.f.unlocked ? '#0b7285' : '#1e3a8a');
  $('#floor-ind').textContent = S.f.out4 ? 'B' : '▲ 7½ ▼'; $('#floor-ind').setAttribute('fill', S.f.out4 ? '#3cff6a' : '#ff3b30');
  drawDungeon(); drawYacht();
  $('#sc-yacht').classList.toggle('docked', !!S.f.docked); $('#pier').style.display = S.f.docked ? '' : 'none';
  $('#skip-code').textContent = S.f.helm ? '200 OK' : '401'; $('#skip-code').setAttribute('fill', S.f.helm ? '#7dff9a' : '#ff6b6b');
  document.querySelectorAll('#sc-yacht [data-hs="helm"], #sc-yacht [data-hs="ywindow"]').forEach(h => { const g = S.f.docked && !S.f.out6; h.dataset.label = g ? 'Smart gangway (exit)' : (h.dataset.hs==='helm' ? 'Helm (SKIPPER-OS)' : 'Window'); h.setAttribute('aria-label', h.dataset.label); });
  $('#radio-led').setAttribute('fill', S.f.parity ? '#3cff6a' : '#ff3b30');
  $('#ign-slot').setAttribute('fill', S.f.keyIn ? '#e8c766' : '#888');
  $('#fw-closed').style.display = S.f.out5 ? 'none' : ''; $('#fw-open').style.display = S.f.out5 ? '' : 'none';
  $('#fw-led').setAttribute('fill', S.f.out5 ? '#3cff6a' : S.f.dragon ? '#f1c232' : '#ff3b30');
  $('#fw-txt').textContent = S.f.out5 ? 'OPEN' : S.f.dragon ? 'READY' : 'LOCKED';
  $('#cab-glass').style.display = S.f.cabinet ? 'none' : '';
  $('#lap5-scr').setAttribute('fill', S.f.spell ? '#2b8a3e' : S.f.usbIn ? '#5f3dc4' : '#111');
  $('#chest-closed').style.display = S.f.chest ? 'none' : ''; $('#chest-open').style.display = S.f.chest ? '' : 'none';
  $('#dragon-eye').setAttribute('fill', S.f.dragonOn ? '#ff2a2a' : '#1a1a1a'); $('#dragon-zzz').style.display = S.f.dragonOn ? 'none' : '';
  $('#secret-panel').setAttribute('fill', S.f.sorted ? '#120c06' : '#3a2614'); $('#secret-txt').textContent = S.f.sorted ? '(empty)' : 'DO NOT OPEN';
  $('#fax-led').setAttribute('fill', S.f.jamFixed && S.f.paperIn ? '#3cff6a' : '#ff3b30');
  const has = id => S.inv.includes(id);
  $('#ext-vis').style.display = (S.f.extTaken) ? 'none' : '';
  $('#hit-ext').style.display = (S.f.extTaken) ? 'none' : '';
  $('#duck-vis').style.display = (S.f.duckTaken) ? 'none' : '';
  $('#hit-duck').style.display = (S.f.duckTaken) ? 'none' : '';
  $('#sdoor-closed').style.display = S.f.serverOpen ? 'none' : '';
  $('#sdoor-open').style.display = S.f.serverOpen ? '' : 'none';
  const scr = $('#moss-screen'), bs = $('#moss-bsod'), glow = $('#moss-glow');
  const pcOn = S.pc !== 'off';
  scr.setAttribute('fill', S.pc==='bsod' ? '#1f45c4' : pcOn ? '#06120a' : '#0b0c0c');
  bs.style.display = S.pc==='bsod' ? '' : 'none';
  glow.style.display = pcOn ? '' : 'none';
  glow.setAttribute('fill', S.pc==='bsod' ? 'url(#bsodGlow)' : 'url(#exitGlow)');
  $('#tower-led').setAttribute('fill', pcOn ? '#3cff6a' : '#3a3527');
  $('#fire-vis').style.display = S.f.fireOut ? 'none' : '';
  $('#fire-wallglow').style.display = S.f.fireOut ? 'none' : '';
  $('#hit-fire').style.display = S.f.fireOut ? 'none' : '';
  $('#bin-out').style.display = S.f.fireOut ? '' : 'none';
  $('#rack').classList.toggle('dead', !S.f.power);
  const rt = $('#rack-text');
  rt.textContent = S.f.power ? 'PIN: 0x539' : 'NO SIGNAL';
  rt.setAttribute('fill', S.f.power ? '#7dff9a' : '#1e3a26');
  const lamp = $('#panel-lamp'); lamp.setAttribute('fill', S.f.power ? '#3cff6a' : '#ff3b30'); lamp.classList.toggle('blink', !S.f.power);
  $('#kp-led').setAttribute('fill', S.f.escaped ? '#3cff6a' : '#ff3b30');
  $('#hint-count').textContent = S.hints;
}
function go(scene){
  const f = $('#fade'); f.classList.add('on'); beep(220,.08,'sine',.04);
  setTimeout(() => { S.scene = scene; applyVisuals(); save(); f.classList.remove('on'); }, 330);
}

/* ---------- tooltip & hotspot input ---------- */
const stage = $('#stage'), tip = $('#tip');
stage.addEventListener('mousemove', e => {
  const h = e.target.closest && e.target.closest('.hit');
  if(!h || !$('#title').hidden || !$('#win').hidden){ tip.hidden = true; return; }
  const r = stage.getBoundingClientRect();
  tip.hidden = false;
  tip.textContent = sel ? `Use ${ITEMS[sel].name} on ${h.dataset.label}` : h.dataset.label;
  tip.style.left = Math.min(Math.max(e.clientX - r.left, 80), r.width-80) + 'px';
  tip.style.top = (e.clientY - r.top) + 'px';
});
stage.addEventListener('mouseleave', () => tip.hidden = true);
stage.addEventListener('click', e => {
  const h = e.target.closest && e.target.closest('.hit');
  if(!h) return;
  if(e.detail) h.blur();
  if(matchMedia('(hover: none)').matches) tip.hidden = true;
  if(!$('#dialog').hidden && typing){ /* skip typing, still act */ }
  beep(440,.03,'sine',.03);
  const id = h.dataset.hs;
  if(sel){ const it = sel; sel = null; renderInv(); useItem(it, id); return; }
  (H[id] || (() => say("Nothing interesting.")))();
});
stage.addEventListener('contextmenu', e => { if(sel){ e.preventDefault(); sel=null; renderInv(); } });
// keyboard access to hotspots
document.querySelectorAll('.hit').forEach(h => { h.setAttribute('tabindex','0'); h.setAttribute('role','button'); h.setAttribute('aria-label', h.dataset.label);
  h.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); e.stopPropagation(); h.dispatchEvent(new MouseEvent('click',{bubbles:true})); } }); });

/* ---------- modal ---------- */
let modalClose = null;
function openModal(title, sub, html, onOpen, onClose){
  $('#m-title').textContent = title; $('#m-sub').textContent = sub || '';
  $('#m-body').innerHTML = html; $('#modal').hidden = false; tip.hidden = true;
  modalClose = onClose || null;
  onOpen && onOpen($('#m-body'));
}
function closeModal(){ if($('#modal').hidden) return; $('#modal').hidden = true; $('#m-body').innerHTML=''; const c = modalClose; modalClose=null; c && c(); }
$('#m-close').onclick = closeModal;
$('#modal').addEventListener('click', e => { if(e.target.id==='modal') closeModal(); });


const nope = () => beep(140,.2,'sawtooth',.04);   // the 'wrong answer' buzz
