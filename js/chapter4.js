// Chapter 4: the lift.
// Loaded in order by js/boot.js; all game files share the same global scope.

/* ================= CHAPTER 4: THE LIFT ================= */
const UNLOCK4 = KEY + '-ch4';
let ch4Open = false;
function unlocked4(){ if(ch4Open || S.ch>=4 || (S.ch===3 && S.f.out3)) return true; try{ return localStorage.getItem(UNLOCK4)==='1'; }catch(e){ return false; } }
function setUnlocked4(){ ch4Open = true; try{ localStorage.setItem(UNLOCK4,'1'); }catch(e){} }

/* seven-segment digits, for the service display */
const SEG = { 0:'abcdef', 1:'bc', 2:'abged', 5:'afgcd', 8:'abcdefg' };
function sevenSeg(d, x, y, s=1, on='#ff3b30', off='rgba(255,59,48,.08)'){
  const R = { a:[6,0,28,6], b:[34,6,6,26], c:[34,38,6,26], d:[6,64,28,6], e:[0,38,6,26], f:[0,6,6,26], g:[6,32,28,6] };
  return Object.entries(R).map(([k,[rx,ry,w,h]]) => `<rect x="${x+rx*s}" y="${y+ry*s}" width="${w*s}" height="${h*s}" rx="${1.5*s}" fill="${SEG[d].includes(k) ? on : off}"/>`).join('');
}
const PAIR = '205815';
const mirrorRead = c => c.split('').reverse().map(d => d==='2' ? '5' : d==='5' ? '2' : d).join('');
function buildDecor4(){
  // speaker holes
  const sp = $('#spk'); for(let r=0;r<3;r++) for(let c=0;c<6;c++) sp.insertAdjacentHTML('beforeend', `<circle cx="${410+c*13}" cy="${138+r*12}" r="3.4"/>`);
  // the tiny mirrored service display inside the mirror
  let mini = `<g transform="translate(1560 0) scale(-1 1)"><rect x="590" y="196" width="148" height="44" rx="3" fill="#0a0505"/>`;
  PAIR.split('').forEach((d,i) => mini += sevenSeg(d, 600 + i*22, 204, .4));
  $('#mirror-mini').innerHTML = mini + '</g>';
}

const CABLES = {
  am:['USB-A to Micro-USB','A','micro',"The flat end fits the port, but the small end won't go into the phone. Roy: 'That one's for my 2011 phone. Sentimental reasons.'"],
  al:['USB-A to Lightning','A','light',"The flat end fits the port, but the thin end won't go into the phone's oval port. Douglas: 'Is that the yacht charger?'"],
  cc:['USB-C to USB-C','C','C',"The oval end fits the phone perfectly. The other end is also oval, and the lift's port is flat and rectangular. So close."],
  ac:['USB-A to USB-C','A','C','OK'],
  rs:['Serial cable (RS-232), 1987','db9','db9',"You try to plug a 1987 serial cable into a smartphone. The phone looks at you with pity. The label says 'MOSS'S. DO NOT LEND TO ROY.'"]
};
function plug(k, x){
  if(k==='A') return `<rect x="${x}" y="16" width="34" height="16" rx="2" fill="#cfd4d8" stroke="#555"/><rect x="${x+5}" y="21" width="24" height="6" fill="#2b5cd6"/>`;
  if(k==='C') return `<rect x="${x+4}" y="18" width="26" height="12" rx="6" fill="#cfd4d8" stroke="#555"/><rect x="${x+9}" y="22" width="16" height="4" rx="2" fill="#555"/>`;
  if(k==='micro') return `<path d="M${x+6} 19 h22 l-4 10 h-14z" fill="#cfd4d8" stroke="#555"/>`;
  if(k==='light') return `<rect x="${x+8}" y="20" width="18" height="8" rx="2" fill="#e8e8e8" stroke="#555"/><path d="M${x+11} 22v4M${x+14} 22v4M${x+17} 22v4M${x+20} 22v4M${x+23} 22v4" stroke="#c9a24a" stroke-width="1.5"/>`;
  return `<path d="M${x} 14 h34 l-4 20 h-26z" fill="#9aa3a8" stroke="#555"/><g fill="#333">${[0,1,2,3,4].map(i=>`<circle cx="${x+6+i*5.5}" cy="20" r="1.4"/>`).join('')}${[0,1,2,3].map(i=>`<circle cx="${x+9+i*5.5}" cy="27" r="1.4"/>`).join('')}</g>`;
}
function openBag(){
  openModal("Roy's backpack", 'Every cable ever made. Not organised. Never organised.', `<div class="cables">${Object.entries(CABLES).map(([id,c]) => `<button type="button" class="cbl ${S.cable===id ? 'on' : ''}" data-c="${id}"><svg viewBox="0 0 240 48" aria-hidden="true">${plug(c[1],8)}<path d="M42 24 C90 0 150 48 198 24" stroke="#222" stroke-width="5" fill="none"/>${plug(c[2],198)}</svg><span>${c[0]}</span><small>${S.cable===id ? 'In your inventory' : 'Take this one'}</small></button>`).join('')}</div>
    <div class="feedback" id="bagfb">You can carry one cable at a time. Roy's rule. He's never followed it.</div>`, body => {
    body.querySelectorAll('.cbl').forEach(b => b.onclick = () => { S.cable = b.dataset.c; if(!S.inv.includes('cable')) S.inv.push('cable'); save(); renderInv(); beep(500,.04);
      body.querySelectorAll('.cbl').forEach(x => { x.classList.toggle('on', x===b); x.querySelector('small').textContent = x===b ? 'In your inventory' : 'Take this one'; });
      $('#bagfb').textContent = `You take the ${CABLES[S.cable][0]}. Select it in your inventory, then click where you want to plug it in.`; });
  });
}

/* --- talking to Roy and Douglas --- */
const ROY_TALK = [
  ["You're back from lunch!", () => "I've been at lunch since 12:58. It was a big lunch. There was a queue. Then there was a second lunch."],
  ["Have you got a charging cable?", () => "Have I got a cable? I've got every cable ever made, in this bag. Not organised. Never organised. Help yourself."],
  ["How do people choose a pattern lock?", () => "Most people just draw a letter. Their initial, usually. And they leave greasy fingerprints all over the screen. Tilt it to the light and you can see the whole thing. Not that I've ever done that."],
  ["Why is there no signal in here?", () => "It's a lift. A metal box. A Faraday cage, Moss calls it. He's told me twice. With a diagram."],
  ["Any idea how to fix all this?", () => S.f.stuck ? (S.ach.roy = true, save(), "Hang on. It's stuck? It's actually stuck? Have you tried… turning it off and on again? The power button. On the side. Go on. This is my moment.") : "Have you tried turning it off and on again? No? Well, wait until it's properly broken. Then do that."]
];
const DOUG_TALK = [
  ["What's wrong with your phone?", () => "It makes noises! Pings, dings, a little song about torches. It started when I downloaded a free torch. Free things are good things, aren't they?"],
  ["What's your unlock pattern?", () => "It's a letter. A very important letter. The best letter. It begins with D. And it ends with… also D."],
  ["Why does your phone control the lift?", () => "I connected the whole building to my phone! Futuristic. Moss said it was the worst idea he'd ever heard, and he's heard Roy's ideas."],
  ["Where's the Bluetooth pairing code?", () => "On the little service screen. The lift man installed it facing the mirror. For elegance, I think."],
  ["Do you know the override passphrase?", () => "No idea. Moss set it up. Something nerdy. Ring him on the emergency phone: that's what it's for. Emergencies, and ringing Moss."]
];
function openTalkTo(name, sub, list, first){
  openModal(name, sub, `<div class="talk">${list.map(([q],k)=>`<button type="button" data-t="${k}">${q}</button>`).join('')}</div><div class="talk-row">${talkFace(name)}<div class="talk-a" id="talk-a">${first}</div></div>`,
  body => body.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { beep(500,.03); $('#talk-a').textContent = '"' + list[+b.dataset.t][1]() + '"'; }));
}

Object.assign(H, {
  mirror(){ openMirror(); },
  floorind(){ if(S.f.out4) return startCh5(); say(S.f.out4 ? "The display says B. Home sweet basement." : "The display says 7½. You're stuck between the seventh floor and the eighth. The pan-pipes play on."); },
  speaker(){ say(["A pan-pipe version of the Reynholm Industries theme tune.", "It has been playing the same eight bars since you got in. Roy is humming along. He hates that he's humming along."]); },
  hatch(){ say(["The emergency hatch in the ceiling. In films, people climb out through these.", "In real life it's bolted from the outside. Films have lied to you about many things."]); },
  cert(){ openCert(); },
  lpanel(){ if(S.f.out4) return startCh5(); say(["You press B. Nothing. You press it eleven more times, because that always helps.", "The yellow alarm button rings a bell somewhere. Nobody comes. The alarm is also controlled by Douglas's phone."]); },
  usb(){ say(S.f.charged ? "Douglas's phone is charging from the service port. The word 'SERVICE' is doing a lot of work here." : ["A service USB port, flat and rectangular, like the ones on old computers. USB-A, Moss would call it.", "It only fits one way round, and never the way you try first."]); },
  dphone(){ openPhone(); },
  ephone(){ openEPhone(); },
  roy(){ openTalkTo('Roy', 'Back from lunch · holding a sandwich', ROY_TALK, '"Don\'t look at me, I\'m on my lunch. Technically. Spiritually."'); },
  bag(){ openBag(); },
  dougl(){ openTalkTo('Douglas Reynholm', 'CEO · owner of the lift, somehow', DOUG_TALK, '"Ask me anything. I own the building. And now the lift. Spiritually."'); }
});

/* --- mirror, certificate, emergency phone --- */
function openMirror(){
  let svg = `<svg viewBox="0 0 600 340" role="img" aria-label="Your reflection, with the service display behind you"><defs><linearGradient id="mg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d5dde1"/><stop offset=".55" stop-color="#93a0a7"/><stop offset="1" stop-color="#bcc7cd"/></linearGradient></defs>
    <rect width="600" height="340" fill="url(#mg2)"/>
    <g transform="translate(600 0) scale(-1 1)">
      <rect x="120" y="40" width="360" height="150" rx="6" fill="#0a0505" stroke="#444" stroke-width="4"/>
      <text x="300" y="70" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="16" fill="#ff8a80">LIFT-03 · BLUETOOTH PAIRING</text>`;
  PAIR.split('').forEach((d,i) => svg += sevenSeg(d, 150 + i*52, 88, 1));
  svg += `<text x="300" y="214" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="13" fill="#3a4146">SERVICE DISPLAY · DO NOT FACE TOWARDS MIRROR</text></g>
    <path d="M40 330 L180 20 M90 330 L230 20" stroke="rgba(255,255,255,.35)" stroke-width="16"/>
    <ellipse cx="300" cy="360" rx="70" ry="80" fill="#3a2a20" opacity=".55"/></svg>`;
  openModal('The mirror', 'The service display is behind you, facing the glass', `<div class="mirrorbox">${svg}</div><div class="feedback">You see the service display reflected in the mirror. You also see yourself. You look like someone who has been locked in four rooms today.</div>`);
}
const MORSE = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..' };
function openCert(){
  openModal('Lift inspection certificate', 'LIFT-03 · Reynholm Industries', `<div class="manual" style="max-width:600px">
    <h4>Certificate of inspection</h4>
    <p style="margin:0 0 4px">Next inspection: overdue. Notes: "Lift now controlled from the CEO's phone. Inspector has resigned."</p>
    <p style="margin:10px 0 0;font-weight:700">Emergency signalling reference (Morse code)</p>
    <p style="margin:2px 0 0;font-size:13px">A dot is a short flash. A dash is a long one. Letters are separated by a longer pause.</p>
    <div class="morse">${Object.entries(MORSE).map(([k,v])=>`<span><b>${k}</b>${v.replace(/\./g,'·').replace(/-/g,'–')}</span>`).join('')}</div></div>`);
}
let morseRun = 0;
function playMorse(word){
  const run = ++morseRun, U = 230, steps = [];
  word.split('').forEach((ch, i) => { MORSE[ch].split('').forEach((sym, j) => { steps.push([1, sym==='.' ? U : U*3]); steps.push([0, U]); }); steps[steps.length-1][1] = U*3; });
  steps[steps.length-1][1] = U*7;
  let t = 400;
  const set = on => { if(run!==morseRun) return; const l = $('#mlamp'); if(l) l.classList.toggle('on', on); const sl = $('#lift-light'); if(sl) sl.classList.toggle('flash', on); };
  steps.forEach(([on, d]) => { setTimeout(() => { set(!!on); if(on && run===morseRun) beep(620, d/1000, 'sine', .04); }, t); t += d; });
  setTimeout(() => { set(false); if(run===morseRun){ const m = $('#mstat'); if(m) m.textContent = 'End of message. Moss: "Shall I send it again?"'; } }, t);
}
function openEPhone(){
  openModal('Emergency phone', 'Connected to: the basement (Moss)', `<div class="talk-a" style="margin-top:0">Moss: "Hello, IT. Ah, you're in Douglas's lift. I can't say the override passphrase out loud: Douglas's app records this line. I'll blink it in Morse on my desk lamp. Watch the light."</div>
    <div class="mlamp" id="mlamp" role="img" aria-label="Moss's lamp, flashing Morse code"></div>
    <div class="feedback" id="mstat" style="text-align:center">Watch closely…</div>
    <div class="row" style="display:flex;justify-content:center"><button class="btn ghost" type="button" id="mreplay">Send it again</button></div>`, () => {
    S.f.calledMoss = true; save(); playMorse('SUDO');
    $('#mreplay').onclick = () => { $('#mstat').textContent = 'Watch closely…'; playMorse('SUDO'); };
  }, () => { morseRun++; const sl = $('#lift-light'); if(sl) sl.classList.remove('flash'); });
}

/* --- Douglas's phone --- */
let pView = 'home', pPower = 'on', pSeq = [], pTilt = false;
const PATTERN = [0,3,6,7,5,1];
const PATTERN_EDGES = PATTERN.slice(1).map((d,i) => [PATTERN[i], d]);
const dotXY = i => [50 + (i%3)*100, 50 + Math.floor(i/3)*100];
const battery = () => !S.f.charged ? 0 : !S.f.spyGone ? 4 : 63;
function openPhone(){
  openModal("Douglas's phone", 'DougPhone Pro Max Ultra Gold', `<div class="phonewrap"><div class="phone"><button type="button" class="ppow" id="ppow" aria-label="Power button"></button><span class="ppow-l">POWER</span><div class="pscr" id="pscr"></div></div></div><div class="feedback" id="pfb"></div>`, () => {
    pView = 'home'; pSeq = []; pTilt = false; if(pPower==='confirm') pPower = 'on';
    $('#ppow').onclick = pressPower; renderPhone();
  });
}
const pfb = (t, cls='') => { const e = $('#pfb'); if(e){ e.className = 'feedback ' + cls; e.textContent = t; } };
function sbar(){ return `<div class="sbar"><span>15:07</span><span>${S.f.charged ? '⚡ ' : ''}${battery()}%</span></div>`; }
function renderPhone(){
  const P = $('#pscr'); if(!P) return;
  if(!S.f.charged){ P.innerHTML = `<div class="pcenter"><svg viewBox="0 0 60 30" width="70"><rect x="2" y="4" width="50" height="22" rx="4" fill="none" stroke="#c8262c" stroke-width="3"/><rect x="53" y="11" width="5" height="8" rx="1" fill="#c8262c"/></svg><div style="color:#c8262c;font-weight:700">0%</div></div>`;
    return pfb("Completely dead. At the bottom there's a small, oval charging port that fits either way up."); }
  if(pPower==='off'){ P.innerHTML = ''; return; }
  if(pPower==='boot'){ P.innerHTML = `<div class="pcenter"><div style="font-size:26px;font-weight:800">DougPhone</div><div class="pill">Finishing update…</div></div>`; return; }
  if(!S.f.unlocked) return lockScreen4(P);
  ({ home:homeScreen, settings:settingsApp, smart:smartApp, yacht:simpleApp, ff:simpleApp, cam:simpleApp, flash:simpleApp })[pView](P);
}
function lockScreen4(P){
  const pts = PATTERN_EDGES.map(([a,b]) => { const [x1,y1] = dotXY(a), [x2,y2] = dotXY(b); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(200,190,160,.5)" stroke-width="16" stroke-linecap="round"/>`; }).join('');
  const path = pSeq.map(dotXY).map(p => p.join(',')).join(' ');
  P.innerHTML = sbar() + `<div class="pcenter" style="justify-content:flex-start;padding-top:10px;gap:6px"><div class="ptime">15:07</div><div style="font-size:12px;opacity:.75">Tuesday</div><div class="pill">${S.f.spyGone ? '2 notifications' : '847 notifications · mostly torches'}</div>
    <svg class="pgrid" viewBox="0 0 300 300" aria-label="Pattern lock">${pTilt ? pts : ''}${pSeq.length > 1 ? `<polyline points="${path}" fill="none" stroke="#8fd3ff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      ${[0,1,2,3,4,5,6,7,8].map(i => { const [x,y] = dotXY(i); return `<circle cx="${x}" cy="${y}" r="${pSeq.includes(i) ? 16 : 11}" fill="${pSeq.includes(i) ? '#8fd3ff' : '#fff'}" data-dot="${i}"/><circle cx="${x}" cy="${y}" r="38" fill="transparent" data-dot="${i}"/>`; }).join('')}</svg>
    <div class="pbtns"><button class="pb" type="button" id="ptilt">${pTilt ? 'Hold it straight' : 'Tilt it to the light'}</button><button class="pb" type="button" id="pclr">Clear</button></div>
    <div class="pmsg" id="pmsg">Draw the unlock pattern: tap the dots in order.</div></div>`;
  P.querySelectorAll('[data-dot]').forEach(c => c.onclick = () => { const i = +c.dataset.dot; if(pSeq.includes(i)) return; pSeq.push(i); beep(900 + i*30, .03); 
    if(pSeq.length === PATTERN.length){ const s = pSeq.join(), ok = s === PATTERN.join() || s === [...PATTERN].reverse().join();
      if(ok){ S.f.unlocked = true; save(); chord([523,659,784,1046]); pSeq = []; renderPhone(); pfb('Unlocked! A D for Douglas. The smudges gave it away.', 'good');
        setTimeout(()=>say([['douglas',"You got in! How? …Fingerprints? On MY screen? Those are the fingerprints of a very busy man."]]), 300); return; }
      renderPhone(); $('#pmsg').textContent = 'Wrong pattern. Douglas: "It\'s a letter! The best letter!"'; nope(); setTimeout(() => { pSeq = []; renderPhone(); }, 900); return; }
    renderPhone(); });
  $('#ptilt').onclick = () => { pTilt = !pTilt; beep(400,.03); renderPhone(); if(pTilt) pfb('You tilt the screen towards the ceiling light. Greasy smudge trails appear between some of the dots.'); };
  $('#pclr').onclick = () => { pSeq = []; renderPhone(); };
}
const PAPPS = [
  ['settings','Settings','#495057','⚙'], ['smart','Smart Building','#1971c2','▣'], ['ff','Friendface','#e64980','f'], ['yacht','Yacht Tycoon','#0b7285','⛵'],
  ['flash','SuperBright Flashlight FREE','#f59f00','☀'], ['cam','Camera','#343a40','◉']
];
function homeScreen(P){
  const apps = PAPPS.filter(a => a[0]!=='flash' || !S.f.spyGone);
  P.innerHTML = sbar() + `<div class="pbody">${S.f.spyGone ? '' : `<div class="notif"><b>SUPERBRIGHT FLASHLIGHT FREE · now</b>DOUGLAS! You have won a FREE torch upgrade!! ♪ Torches, torches, wonderful torches ♪</div>`}
    <div class="apps">${apps.map(([id,l,c,g]) => `<button type="button" class="appi" data-app="${id}"><i style="background:${c}">${g}</i>${l}</button>`).join('')}</div></div>`;
  P.querySelectorAll('.appi').forEach(b => b.onclick = () => { pView = b.dataset.app; beep(700,.03); renderPhone(); });
  if(!S.f.spyGone) pfb('Ding! Ping! The phone plays a little song about torches. These are the noises.');
}
function ptop(title){ return `<div class="ptop"><button type="button" id="phome">‹ Home</button><span>${title}</span></div>`; }
function bindHome(){ const b = $('#phome'); if(b) b.onclick = () => { pView = 'home'; beep(500,.03); renderPhone(); }; }
const SIMPLE = {
  yacht:['Yacht Tycoon', "Douglas has spent £4,000 on virtual yacht polish. His virtual yacht is called 'Douglas II'. There is no Douglas I."],
  ff:['Friendface', "4 friends. Two are Douglas. One is the Friendface help bot. One is Jen, who has muted him."],
  cam:['Camera', "The front camera opens. Douglas leans in and fills the screen. He looks pleased with what he sees."],
  flash:['SuperBright Flashlight FREE', "ALLOW SuperBright Flashlight to access your contacts, microphone, location, text messages and bank details? [ALLOW] [ALLOW]"]
};
function simpleApp(P){ const [t, txt] = SIMPLE[pView]; P.innerHTML = sbar() + `<div class="pbody">${ptop(t)}<div class="prow">${txt}</div></div>`; bindHome(); }
const PSET = [
  ['flash','SuperBright Flashlight FREE',61,['Camera','Microphone','Contacts','Location','SMS','Runs in background']],
  ['yacht','Yacht Tycoon',14,['Storage']],
  ['ff','Friendface',9,['Camera','Location']],
  ['smart','Smart Building',5,['Bluetooth','Location']],
  ['cam','Camera',2,['Camera','Microphone']]
];
const UNINSTALL_MSG = {
  yacht:"Douglas grabs your arm: 'Not the yachts! I've only just bought the polish.' You leave it.",
  ff:"Douglas: 'My four friends!' You leave it. It's barely using any battery anyway.",
  smart:"You hover over Uninstall on Smart Building… and remember that it's the only thing that can open this lift.",
  cam:"The Camera is a system app. And barely using any battery."
};
function settingsApp(P){
  const rows = PSET.filter(r => r[0]!=='flash' || !S.f.spyGone);
  P.innerHTML = sbar() + `<div class="pbody">${ptop('Settings · Battery & apps')}
    <div style="font-size:12px;opacity:.8">Battery ${battery()}% · ${S.f.spyGone ? 'charging normally' : 'charging, but something is draining it faster'}</div>
    ${rows.map(([id,name,pct,perms]) => `<div class="prow"><div class="ph"><span>${name}</span><span>${pct}%</span></div><div class="pbar"><i style="width:${pct}%"></i></div>
      <div class="perm">${perms.map(p => `<span class="${id==='flash' && p!=='Camera' ? 'warn' : ''}">${p}</span>`).join('')}</div>
      <div><button type="button" class="pb" data-un="${id}">Uninstall</button></div></div>`).join('')}</div>`;
  bindHome();
  P.querySelectorAll('[data-un]').forEach(b => b.onclick = () => { const id = b.dataset.un;
    if(id==='flash'){ S.f.spyGone = true; save(); applyVisuals(); chord([523,659,784,1046]); renderPhone(); pfb('Uninstalled. The pinging stops. The battery starts climbing. Silence, at last. Apart from the pan-pipes.', 'good');
      setTimeout(()=>say([['douglas',"It's gone quiet! What did you do?"],['roy',"You downloaded a torch that wanted your microphone, your contacts and your bank details. A torch."],['douglas',"It was free!"]]), 300); return; }
    nope(); pfb(UNINSTALL_MSG[id]); });
}
function smartApp(P){
  const head = sbar() + `<div class="pbody">${ptop('Smart Building')}`;
  if(!S.f.spyGone){ P.innerHTML = head + `<div class="prow">Smart Building needs more battery to run. Battery: 4%. Something on this phone is draining it as fast as it charges.</div></div>`; bindHome(); return; }
  if(!S.f.paired){
    P.innerHTML = head + `<div class="prow"><b>LIFT-03 found nearby (Bluetooth)</b>Enter the 6-digit pairing code shown on the lift's service display.</div>
      <form id="pairf" style="display:grid;gap:8px"><input class="pin" id="pairin" inputmode="numeric" maxlength="6" autocomplete="off" aria-label="Pairing code"><button class="pb go" type="submit">Pair</button></form><div class="pmsg" id="pmsg"></div></div>`;
    bindHome();
    $('#pairf').onsubmit = e => { e.preventDefault(); const v = $('#pairin').value.replace(/\D/g,'');
      if(v===PAIR){ S.f.paired = true; save(); chord([523,784]); renderPhone(); pfb('Paired with LIFT-03.', 'good'); return; }
      nope(); $('#pmsg').textContent = v===mirrorRead(PAIR) ? "Pairing failed. That's how it looks in the mirror… and mirrors flip things." : 'Pairing failed. Wrong code.'; };
    return; }
  if(!S.f.passOK){
    P.innerHTML = head + `<div class="prow"><b>Paired with LIFT-03 ✓</b>Lift is in safety stop. Engineer override required.</div>
      <form id="passf" style="display:grid;gap:8px"><input class="pin" id="passin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Override passphrase" aria-label="Override passphrase"><button class="pb go" type="submit">Override</button></form><div class="pmsg" id="pmsg"></div></div>`;
    bindHome();
    $('#passf').onsubmit = e => { e.preventDefault(); const v = $('#passin').value.trim().toLowerCase();
      if(v==='sudo'){ S.f.passOK = true; save(); chord([523,659,784]); renderPhone(); pfb("Override accepted. Of course Moss chose 'sudo'.", 'good'); return; }
      nope(); $('#pmsg').textContent = S.f.calledMoss ? 'Wrong passphrase. Watch the flashes again, and use the Morse table on the certificate.' : 'Wrong passphrase. Only Moss knows it. There is an emergency phone in this lift.'; };
    return; }
  if(!S.f.updating && !S.f.stuck){
    P.innerHTML = head + `<div class="prow"><b>Override accepted ✓</b>LIFT-03 is ready to move.</div><button class="pb go" type="button" id="prel" style="padding:12px">Release lift</button></div>`;
    bindHome();
    $('#prel').onclick = () => { S.f.updating = true; save(); renderPhone(); };
    return; }
  P.innerHTML = head + `<div class="prow"><b>Update required</b>Installing Smart Building 2.0 (now with yachts). Do not turn off your phone.</div><div class="pprog"><i id="ppg" style="width:${S.f.stuck ? 99 : 0}%"></i></div>
    <div class="pmsg" id="pmsg">${S.f.stuck ? '99%. Time remaining: about 4 years.' : 'Installing…'}</div></div>`;
  bindHome();
  if(!S.f.stuck){ requestAnimationFrame(() => requestAnimationFrame(() => { const g = $('#ppg'); if(g) g.style.width = '99%'; }));
    setTimeout(() => { S.f.stuck = true; save(); const m = $('#pmsg'); if(m) m.textContent = '99%. Time remaining: about 4 years.'; pfb('The update is stuck at 99%. Nothing moves. Not the bar, not the lift.', 'bad');
      setTimeout(()=>say([['douglas',"Why has it stopped? It was doing so well."],['roy',"Oh. Oh, this is it. I've waited all day for this."]]), 600); }, 2600); }
}
function pressPower(){
  beep(160,.08,'square',.05);
  if(!S.f.charged) return pfb("You hold the power button. Nothing. The phone is completely dead.");
  if(pPower==='off'){ pPower = 'boot'; renderPhone();
    setTimeout(() => { pPower = 'on'; S.f.out4 = true; save(); applyVisuals(); chord([523,659,784,1046,1318],120); closeModal(); win4(); }, 1600); return; }
  if(pPower==='boot') return;
  if(S.f.stuck){
    const P = $('#pscr'); pPower = 'confirm';
    P.insertAdjacentHTML('beforeend', `<div class="pover"><div style="font-weight:700">Power off?</div><div style="font-size:12px">An update is installing. Turning off your phone now may cause problems.</div><button class="pb" type="button" id="poff" style="background:#c8262c">Power off</button><button class="pb" type="button" id="pcancel">Cancel</button></div>`);
    $('#poff').onclick = () => { pPower = 'off'; renderPhone(); pfb('The screen goes black. Roy holds his breath. Now… on again?'); };
    $('#pcancel').onclick = () => { pPower = 'on'; renderPhone(); };
    return; }
  pfb("Click. Screen off. Click. Screen on. Nothing has changed. Douglas: 'Careful! That's the yacht button.'");
}

/* --- chapter 4 flow --- */
function intro4(){
  say([["sys","Top floor, 15:02. Douglas presses his phone into your hand. It is warm, slightly sticky and completely dead."],
       ["douglas","It's been making noises all day. Pings. Dings. A little song about torches. Then it died. Fix it on the way down, would you? I'll come with you."],
       ["sys","On the seventh floor, the lift doors open and a man holding a sandwich steps in."],
       ["roy","Oh, hello. You must be the new temp. I'm Roy. I've been at lunch."],
       ["sys","Between the seventh and eighth floors, the lift jolts to a stop. The lights dim. Pan-pipe music starts."],
       ["douglas","Ah. I connected the lift to my phone last week. Smart Building! Very futuristic."],
       ["roy","So the lift is controlled by a phone. Which is dead. And we're in the lift."],
       ["you","Locked in. Fourth time today. At least this room moves. Normally."]]);
}
function startCh4(){
  S = Object.assign(fresh(), { ach: S.ach || {} }); S.ch = 4; S.scene = 'lift'; S.started = true; S.inv = ['duck','dphone']; S.f.duckTaken = true;
  pView = 'home'; pPower = 'on'; pSeq = []; pTilt = false; morseRun++; sel = null; setUnlocked4(); closeModal();
  $('#title').hidden = true; $('#win').hidden = true; renderInv(); applyVisuals(); $('#timer').textContent = '00:00'; save(); intro4();
}
function win4(){
  say([["sys","DougPhone restarts. 'Update complete.' The lift shudders, thinks about it, and glides down. 6… 3… 1… G… B. Ding."],
       ["roy","Did you just… turn it off and on again? That's my line. That's my whole job."],
       ["douglas","Marvellous! The phone works, the lift works, and the torch song has stopped. I'll miss the torch song."],
       ["moss","You're back! I've made tea. And a certificate. It says 'Employee of the Day'. I laminated it."],
       ["jen","Wait, who's this? Are they IT? Brilliant. Quick question: what does IT stand for again?"]], () => showWin());
}
