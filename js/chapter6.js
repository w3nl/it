// Chapter 6: the yacht (and the passing tour boat).
// Loaded in order by js/boot.js; all game files share the same global scope.

/* ================= CHAPTER 6: THE YACHT ================= */
const UNLOCK6 = KEY + '-ch6';
let ch6Open = false;
function unlocked6(){ if(ch6Open || S.ch===6 || (S.ch===5 && S.f.out5)) return true; try{ return localStorage.getItem(UNLOCK6)==='1'; }catch(e){ return false; } }
function setUnlocked6(){ ch6Open = true; try{ localStorage.setItem(UNLOCK6,'1'); }catch(e){} }

const SYS = { battery:['Battery',[]], fuel:['Fuel pump',['battery']], bilge:['Bilge pump',['battery']], nav:['Navigation computer',['battery']], engine:['Engine',['fuel','bilge','key']], prop:['Propeller',['engine','nav']] };
const SYS_ORDER = ['engine','nav','prop','battery','fuel','bilge'];
function drawYacht(){
  const g = $('#eng-leds'); if(!g) return; const on = S.sys || {};
  g.innerHTML = SYS_ORDER.map((k,i) => { const x = 80 + (i%3)*76, y = 482 + Math.floor(i/3)*44;
    return `<circle cx="${x}" cy="${y}" r="8" fill="${on[k] ? '#3cff6a' : '#3a1010'}"/><text x="${x+14}" y="${y+4}" font-family="IBM Plex Mono, monospace" font-size="10" fill="#cfd3d6">${{engine:'ENGINE',nav:'NAV',prop:'PROP',battery:'BATT',fuel:'FUEL',bilge:'BILGE'}[k]}</text>`; }).join('');
}

Object.assign(H, {
  ywindow(){ if(S.f.docked && !S.f.out6) return openCaptcha();
    if(boatInView) return say(["A Thames tour boat glides past. Forty tourists are photographing Douglas.", "Douglas waves back with enormous enthusiasm. 'Ahoy! Ahoy! Yes, it's mine! Douglas II! There is no Douglas I!'"]); say(S.f.docked ? "Berth 7. Solid ground, just a gangway away. Roy is already looking at it like a long-lost friend." : ["The Thames slides past the windows. Tower Bridge, the Shard, the London Eye. In the wrong direction, and getting smaller.", "Somewhere downstream is the Thames Barrier. Moss keeps looking at it."]); },
  jen6(){ say(["Jen is on the front deck, taking selfies with the skyline.", "She gives you a thumbs up through the glass. She has not noticed that the yacht is drifting."]); },
  plaque(){ say("A brass plaque: DOUGLAS II. You ask what happened to Douglas I. Douglas: 'There was never a Douglas I. Starting at two sounds more successful.'"); },
  lifering(){ say("A life ring. Roy has been eyeing it since the mooring lines dropped."); },
  bell(){ if(!S.f.logRead) return say(["The ship's bell. You give it a ring. DING.", "Douglas: 'Lovely, isn't it? Moss said he hid something on board for the game, but he won't tell me where.'"]);
    if(S.f.gotKey) return say("DING. The bell is empty now. It still sounds lovely.");
    S.f.gotKey = true; give('key'); applyVisuals(); say(["You look under the bell, like the logbook said. Taped inside: a small brass key with a tag.", "IGNITION. You take it."]); },
  engine(){ openEngine(); },
  moss6(){ openTalkTo('Moss', 'Game Master · wearing his cape on a boat', MOSS6_TALK, '"I connected every puzzle to the yacht\'s real systems. For immersion. I\'m now regretting the immersion."'); },
  helm(){ if(S.f.docked && !S.f.out6) return openCaptcha(); openHelm(); },
  doug6(){ openTalkTo('Douglas Reynholm', 'Captain (self-appointed)', DOUG6_TALK, '"Welcome aboard! Isn\'t she magnificent? The yacht, I mean. Moss is also quite magnificent. In his cape."'); },
  chart(){ if(!S.f.engine) return say("The autopilot chart. The screen says: NO PROPULSION. Start the engine first."); if(!S.f.helm) return say("The autopilot chart. The screen says: HELM LOCKED BY SKIPPER-OS."); if(S.f.docked) return say("The autopilot says: DOCKED AT BERTH 7. It sounds proud of itself."); openAutopilot(); },
  logbook(){ openLog(); },
  roy6(){ say(["Roy is holding a bucket and staring at the horizon.", ["\"I'm fine. I'm fine. Don't talk to me about waves.\"", "\"Why is it moving? Buildings don't move. Why do boats move?\"", "\"If you turn this boat off and on again, I will be very happy.\""][Math.floor(Math.random()*3)]]); },
  radio(){ openRadio(); },
  poster6(){ openHttpPoster(); },
  floaty(){ say(["An inflatable dragon pool toy. Douglas asked for more dragons, and Moss delivered.", "It's labelled DRAGON #2 (OF 5). You've never wanted to know where the other three are less."]); }
});
const MOSS6_TALK = [
  ["What's happening?", () => "Douglas pressed the big red Start button. I'd connected it to the yacht's real systems. So it started the game, released the mooring lines, switched off the engine and locked the helm. All at once. Very immersive."],
  ["How do we start the engine?", () => "Engines have dependencies, like software. Some systems need others running first. It's all on the yacht.json sticker. Turn things on in the wrong order and the breaker trips."],
  ["Why won't the helm computer talk to me?", () => "SKIPPER-OS only speaks HTTP status codes. I thought it would be charming. My poster on the wall explains them. 4xx means it's your fault. 5xx means it's my fault. It's never 5xx."],
  ["Where do we dock?", () => "The harbour master sends the berth number over the radio. The radio's a bit crackly, though. One flipped bit and you've got the wrong berth."],
  ["Why are you wearing a cape?", () => "I'm the Game Master. And it's windy on deck. It's a practical cape."]
];
const DOUG6_TALK = [
  ["Why did you press the red button?", () => "It was big and red! You can't put a big red button in front of a man like me and expect nothing to happen."],
  ["Can you steer?", () => "Of course! Well, I've played Yacht Tycoon for four hundred hours. It's practically the same."],
  ["Where's the ignition key?", () => "Moss hid it for the game. He said it was in the logbook. I opened the logbook. It was all numbers. I closed the logbook."],
  ["Where are the board members?", () => "They couldn't make it. Something about 'a prior engagement' and 'absolutely not'. More yacht for us!"],
  ["What does IT stand for?", () => "Incredibly Talented. I've had it printed on the life rings."]
];

/* --- 1. the logbook (ASCII) --- */
const LOG_MSG = 'LOOK UNDER THE BELL';   // in Dutch: KIJK ONDER DE BEL (lang/nl)
function openLog(){
  const msg = tx(LOG_MSG), nums = msg.split('').map(c => c.charCodeAt(0)).join(' ');
  const table = [32,...Array.from({length:26},(_,i)=>65+i)].map(n => `<span><b>${n}</b>${n===32 ? '(space)' : String.fromCharCode(n)}</span>`).join('');
  openModal("Captain's logbook", 'The Douglas II · written by Moss', `<div class="logp">
    <div><b>Captain's log, Saturday.</b> Ignition key hidden for the game. Location recorded in ASCII, the way computers store letters, so Douglas can't read it.</div>
    <div class="nums">${nums}</div>
    <div style="font-size:13px">Inside the cover, a printed table: <i>ASCII, for sailors.</i></div><div class="ascii">${table}</div></div>
    <form class="dial" id="logf"><label for="login">Decoded message</label><input id="login" autocomplete="off" spellcheck="false" style="width:min(320px,100%);font-family:var(--f-mono);font-size:16px;letter-spacing:.04em"><button class="btn" type="submit">Check</button></form><div class="feedback" id="logfb"></div>`, () => {
    if(S.f.logRead){ $('#login').value = msg; $('#logfb').className = 'feedback good'; $('#logfb').textContent = 'Decoded: LOOK UNDER THE BELL.'; }
    $('#logf').onsubmit = e => { e.preventDefault(); const v = $('#login').value.toUpperCase().replace(/[^A-Z ]/g,'').replace(/\s+/g,' ').trim(), f = $('#logfb');
      if(v===msg || v===LOG_MSG){ S.f.logRead = true; save(); chord([523,659,784]); f.className = 'feedback good'; f.textContent = 'LOOK UNDER THE BELL. Of course. Where else would you hide a key on a boat?'; return; }
      nope(); f.className = 'feedback bad'; f.textContent = v && msg.startsWith(v.split(' ')[0]) ? 'A good start. Keep going: 32 is a space.' : 'Not quite. Look up each number in the table: 76 is L.'; };
  });
}

/* --- 2. the engine panel (dependencies) --- */
function openEngine(){
  if(!S.sys) S.sys = {};
  openModal('Engine panel', 'Switch on every system, in an order that works', `<div class="yjson">// yacht.json  (what each system needs first)
{
  "Battery":             [],
  "Fuel pump":           ["Battery"],
  "Bilge pump":          ["Battery"],
  "Navigation computer": ["Battery"],
  "Engine":              ["Fuel pump", "Bilge pump", "ignition key"],
  "Propeller":           ["Engine", "Navigation computer"]
}</div><div class="sysgrid" id="sysg"></div><div class="feedback" id="engfb"></div>`, () => {
    const f = (t,c='') => { const e = $('#engfb'); if(e){ e.className = 'feedback ' + c; e.textContent = t; } };
    const draw = () => { const g = $('#sysg'); if(!g) return;
      g.innerHTML = SYS_ORDER.map(k => `<button type="button" class="sysb ${S.sys[k] ? 'on' : ''}" data-k="${k}" aria-pressed="${!!S.sys[k]}"><i></i>${SYS[k][0]}</button>`).join('') +
        `<button type="button" class="sysb ${S.f.keyIn ? 'on' : ''}" id="ignb"><i></i>Ignition key ${S.f.keyIn ? '(in)' : '(missing)'}</button>`;
      g.querySelectorAll('[data-k]').forEach(b => b.onclick = () => flip(b.dataset.k));
      $('#ignb').onclick = () => { if(S.f.keyIn) return f('The key is in the ignition.'); if(S.inv.includes('key')){ take('key'); S.f.keyIn = true; save(); beep(300,.1,'triangle'); draw(); f('You turn the key in the ignition. Click.', 'good'); } else f("There's no key in the ignition. Douglas: 'Moss hid it. Somewhere in the logbook, he said.'"); };
    };
    const flip = k => {
      if(S.f.engine) return f('Everything is running. The engine purrs. Roy whimpers.', 'good');
      if(S.sys[k]){ return f(tx('{sys} is already on.', { sys: tx(SYS[k][0]) })); }
      const missing = SYS[k][1].filter(d => d==='key' ? !S.f.keyIn : !S.sys[d]);
      if(missing.length){ S.sys = {}; save(); drawYacht(); nope(); draw();
        return f(tx('npm ERR! {sys} needs {deps} first. The breaker trips and everything switches off.', { sys: tx(SYS[k][0]), deps: missing.map(d => tx(d==='key' ? 'the ignition key' : SYS[d][0])).join(tx(' and ')) }), 'bad'); }
      S.sys[k] = true; save(); beep(500 + Object.keys(S.sys).length*80, .06); drawYacht(); draw();
      if(S.sys.prop){ S.f.engine = true; save(); applyVisuals(); chord([196,262,330,392],140); f('The engine rumbles to life. The propeller turns. You are no longer drifting; you are now going nowhere on purpose.', 'good');
        setTimeout(()=>{ closeModal(); say([['moss',"Dependencies resolved! Just like npm install. Except this time nothing broke. That's a first."],['roy',"Can we go back now?"]]); }, 1800); return; }
      f(tx('{sys}: ON.', { sys: tx(SYS[k][0]) }));
    };
    draw();
  });
}

/* --- 3. the helm (HTTP status codes) --- */
const HTTP_REQ = [
  ['GET','/helm'], ['GET','/tea'], ['GET','/yacht/douglas-i'], ['DELETE','/thames-barrier'],
  ['POST','/login  user=douglas'], ['POST','/login  user=roy'], ['POST','/login  user=jen'], ['POST','/login  user=moss']
];
function httpReply(i){
  switch(i){
    case 0: return S.f.token ? [200, 'OK · helm unlocked'] : [401, ''];
    case 1: S.ach.teapot = true; save(); return [418, ''];
    case 2: return [404, ''];
    case 3: return [405, ''];
    case 4: return [403, ''];
    case 5: return [423, ''];
    case 6: return [404, ''];
    case 7: S.f.token = true; save(); return [200, 'token=magnificent'];
  }
}
function openHelm(){
  openModal('SKIPPER-OS', 'The helm computer. It only speaks HTTP.', `<div class="hcode" id="hcode">${S.f.helm ? '200<small>OK · helm unlocked</small>' : '…<small>send a request</small>'}</div>
    <div class="http">${HTTP_REQ.map(([m,p],i) => `<button type="button" data-r="${i}"><b>${m}</b> ${p}</button>`).join('')}</div>
    <div class="feedback" id="hfb2">${S.f.helm ? 'The helm is unlocked.' : "SKIPPER-OS doesn't explain itself. Moss's poster on the wall might."}</div>`, body => {
    body.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const [code, note] = httpReply(+b.dataset.r), h = $('#hcode');
      h.className = 'hcode' + (code < 300 ? ' ok' : ''); h.innerHTML = code + (note ? `<small>${note}</small>` : '');
      beep(code < 300 ? 880 : 300, .08);
      if(+b.dataset.r===0 && code===200 && !S.f.helm){ S.f.helm = true; save(); applyVisuals(); chord([523,659,784,1046]); $('#hfb2').className = 'feedback good'; $('#hfb2').textContent = 'The wheel unlocks with a clunk. The autopilot chart lights up.';
        setTimeout(()=>{ closeModal(); say([['moss',"200 OK! It likes you. It never liked me. I logged in as me, though. Never mind."]]); }, 1600); }
      else $('#hfb2').textContent = +b.dataset.r===7 ? "Logged in as Moss. SKIPPER-OS gave you a token: proof of who you are. Now send the request it refused before." : (+b.dataset.r===0 && !S.f.token) ? "401 means: log in first. Who might SKIPPER-OS trust?" : ''; });
  });
}
function openHttpPoster(){
  openModal('HTTP for sailors', 'A laminated poster by Moss', `<dl class="manual"><h4>What SKIPPER-OS is trying to tell you</h4>
    <dt>200 OK</dt><dd>Everything worked.</dd>
    <dt>401 Unauthorized</dt><dd>Who are you? Log in first.</dd>
    <dt>403 Forbidden</dt><dd>I know who you are. You're still not allowed.</dd>
    <dt>404 Not Found</dt><dd>That doesn't exist. Or that person isn't in the system.</dd>
    <dt>405 Method Not Allowed</dt><dd>You can't do that. Not even on a yacht.</dd>
    <dt>418 I'm a teapot</dt><dd>A real code. Look it up. It refuses to make coffee.</dd>
    <dt>423 Locked</dt><dd>This account is locked. Too many wrong passwords.</dd>
    <dt>500 Internal Server Error</dt><dd>Something broke inside. (Never happens. — M.)</dd></dl>`);
}

/* --- 4. the radio (parity bits) --- */
const PAR_DATA = [[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,1,0,0]];
const PAR_BAD = [2,1];
function parityGrid(fixed){
  const d = PAR_DATA.map(r => [...r]); if(!fixed) d[PAR_BAD[0]][PAR_BAD[1]] ^= 1;
  const sent = PAR_DATA.map(r => r.reduce((a,b)=>a^b,0));
  const col = [0,1,2,3].map(c => PAR_DATA.reduce((a,r)=>a^r[c],0));
  return { d, rowP: sent, colP: col, corner: sent.reduce((a,b)=>a^b,0) };
}
function openRadio(){
  openModal('Harbour radio', 'Channel 16 · Port of London', `<div class="talk-a" style="margin-top:0">"Harbour master to Douglas II. Your berth number follows as a 4×4 picture, with parity bits for error checking. Interference on the line today. Over."</div>
    <p style="font-size:14px;margin:10px 0 0">Every row and every column, parity bit included, was sent with an <b>even</b> number of 1s. One bit got flipped on the way. Tap the bit that's wrong.</p>
    <div class="bitlab"><span>col 1</span><span>col 2</span><span>col 3</span><span>col 4</span><span>parity</span></div>
    <div class="bits" id="bits"></div><div class="feedback" id="radfb"></div>`, () => {
    const f = (t,c='') => { const e = $('#radfb'); if(e){ e.className = 'feedback ' + c; e.textContent = t; } };
    const draw = () => { const g = parityGrid(S.f.parity); let h = '';
      for(let r=0;r<5;r++) for(let c=0;c<5;c++){
        const par = r===4 || c===4, v = r===4 ? (c===4 ? g.corner : g.colP[c]) : (c===4 ? g.rowP[r] : g.d[r][c]);
        h += `<button type="button" class="bit ${par ? 'par' : ''} ${v ? 'one' : ''}" data-r="${r}" data-c="${c}" ${par ? 'tabindex="-1"' : ''} aria-label="Row ${r+1} column ${c+1}: ${v}">${v}</button>`; }
      $('#bits').innerHTML = h;
      $('#bits').querySelectorAll('.bit:not(.par)').forEach(b => b.onclick = () => tap(+b.dataset.r, +b.dataset.c));
    };
    const tap = (r,c) => {
      if(S.f.parity) return f('Fixed. The 1s draw a shape: a seven. Berth 7.', 'good');
      if(r===PAR_BAD[0] && c===PAR_BAD[1]){ S.f.parity = true; save(); chord([523,659,784,1046]); draw(); applyVisuals();
        f('Fixed! Every row and column is even again. Look at the 1s in the four data rows: they draw a 7. Berth 7.', 'good'); return; }
      nope(); const g = parityGrid(false);
      const rowOk = (g.d[r].reduce((a,b)=>a+b,0) + g.rowP[r]) % 2 === 0;
      const colOk = (g.d.reduce((a,row)=>a+row[c],0) + g.colP[c]) % 2 === 0;
      f(tx(rowOk && colOk ? 'Row {r} and column {c} both have an even number of 1s. That bit is fine.' : rowOk ? "Row {r} adds up fine, so the bad bit isn't in this row. Column {c} looks suspicious, though." : "Column {c} adds up fine, so the bad bit isn't in this column. Row {r} looks suspicious, though.", { r: r+1, c: c+1 }));
    };
    if(S.f.parity) f('Fixed. The 1s draw a 7. Berth 7.', 'good');
    draw();
  });
}

/* --- 5. the autopilot (programming a route) --- */
const MAP = { '3,2':'boat', '5,1':'drag', '4,4':'duck', '1,0':'buoy', '7,0':'berth:6', '7,1':'berth:8', '7,2':'barrier', '7,3':'berth:7', '7,4':'berth:5' };
const DIRS = [[0,-1],[1,0],[0,1],[-1,0]], ARROW = ['▲','▶','▼','◀'];
let prog = [];
function openAutopilot(){
  prog = S.prog ? [...S.prog] : [];
  let running = false;
  openModal('Autopilot', 'Program a route from the yacht to the right berth', `<div class="sea" id="sea"></div>
    <div class="prog" id="prog" aria-live="polite"></div>
    <div class="pal"><button type="button" data-cmd="F">Forward</button><button type="button" data-cmd="L">Turn left</button><button type="button" data-cmd="R">Turn right</button><button type="button" id="pundo">Undo</button><button type="button" id="pclear">Clear</button><button type="button" class="run" id="prun">Run ▶</button></div>
    <div class="feedback" id="apfb">Up to 14 steps. Turning happens on the spot; Forward moves one square.</div>`, () => {
    const f = (t,c='') => { const e = $('#apfb'); if(e){ e.className = 'feedback ' + c; e.textContent = t; } };
    const draw = (pos=[0,2], dir=1, step=-1) => { let h = '';
      for(let y=0;y<5;y++) for(let x=0;x<8;x++){ const t = MAP[x+','+y] || '', here = pos[0]===x && pos[1]===y;
        const [kind, num] = t.split(':'); const label = kind==='berth' ? `BERTH ${num}` : {boat:'TOUR BOAT',drag:'DRAGON #3',duck:'GIANT DUCK',buoy:'BUOY',barrier:'THAMES BARRIER'}[kind] || '';
        h += `<div class="cell ${kind} ${kind==='berth' && num==='7' && S.f.parity ? 'goal' : ''}">${here ? `<span class="yt">${ARROW[dir]}</span>` : label}</div>`; }
      $('#sea').innerHTML = h;
      $('#prog').innerHTML = prog.length ? prog.map((c,i) => `<span class="${i===step ? 'now' : ''}">${{F:'Forward',L:'Left',R:'Right'}[c]}</span>`).join('') : '<span style="background:none;color:var(--muted)">Your program is empty.</span>';
    };
    const setProg = () => { S.prog = [...prog]; save(); draw(); };
    $('.pal').querySelectorAll('[data-cmd]').forEach(b => b.onclick = () => { if(running) return; if(prog.length >= 14) return f('The autopilot only remembers 14 steps. Moss says that is plenty.'); prog.push(b.dataset.cmd); beep(600,.02); setProg(); });
    $('#pundo').onclick = () => { if(!running){ prog.pop(); setProg(); } };
    $('#pclear').onclick = () => { if(!running){ prog = []; setProg(); f(''); } };
    $('#prun').onclick = () => { if(running || !prog.length) return; running = true; f('Running…');
      let pos = [0,2], dir = 1, i = 0;
      const stepFn = () => {
        if(!$('#sea')){ running = false; return; }
        if(i >= prog.length){ running = false; draw(pos, dir); return f('The program ended in open water. The yacht bobs there, waiting for more instructions.', 'bad'); }
        const c = prog[i];
        if(c==='L') dir = (dir+3)%4; else if(c==='R') dir = (dir+1)%4;
        else { pos = [pos[0]+DIRS[dir][0], pos[1]+DIRS[dir][1]]; }
        draw(pos, dir, i); beep(c==='F' ? 500 : 700, .03);
        const [x,y] = pos, t = (MAP[x+','+y] || '').split(':');
        const stop = msg => { running = false; nope(); f(msg, 'bad'); };
        if(x<0 || x>7 || y<0 || y>4){ draw([Math.min(7,Math.max(0,x)), Math.min(4,Math.max(0,y))], dir); return stop("You run aground on the riverbank. Douglas: 'Is that Battersea?' Roy: 'I'm getting off.' Change the program and try again."); }
        if(t[0]==='boat') return stop('You nearly ram a tourist boat. Forty tourists photograph Douglas. He waves. Try another route.');
        if(t[0]==='drag') return stop('You bump into DRAGON #3, an inflatable one. It squeaks. Moss: "Mind the dragons! They were expensive!"');
        if(t[0]==='duck') return stop('BOING. A giant rubber duck. You wonder who it was explaining its problems to.');
        if(t[0]==='buoy') return stop('You clip a buoy. It goes ding. Nobody is impressed.');
        if(t[0]==='barrier') return stop('THE THAMES BARRIER. Moss screams. Autopilot emergency stop. Not that way!');
        if(t[0]==='berth'){
          if(t[1]!=='7') return stop(tx("You dock at Berth {n}. A man on the pier shouts that it's his berth, and his yacht is bigger. Douglas is devastated. The harbour radio said which berth is yours.", { n: t[1] }));
          if(!S.f.parity) return stop("You reach a berth, but you don't know if it's the right one. Check the harbour radio for your berth number first.");
          running = false; S.f.docked = true; save(); applyVisuals(); chord([392,523,659,784,1046],120); f('Docked at Berth 7! The mooring lines are thrown. Roy kisses the pier. Well, nearly.', 'good');
          setTimeout(()=>{ closeModal(); say([["sys","The Douglas II glides gently into Berth 7. Ropes are tied. The engine settles to a happy idle."],["moss","We're docked! Now we just need to get off. Which, ah, requires the smart gangway. Which is also part of the game."],["douglas","Another puzzle? Splendid! This is the best Saturday I've ever had."]], () => openCaptcha()); }, 1700); return;
        }
        i++; setTimeout(stepFn, 330);
      };
      setTimeout(stepFn, 200);
    };
    draw();
  });
}

/* --- 6. the smart gangway (CAPTCHA) --- */
const TILES = [
  ['Inflatable dragon', '#2fa456', true, ''],
  ['Dragonfly', '#4dabf7', false, "A dragonfly is an insect. A very fast one, but still an insect."],
  ['The Welsh flag', '#5c677d', true, ''],
  ['Dragon fruit', '#e64980', false, "Dragon fruit is a fruit. Delicious, but it has never guarded anything."],
  ['SMAUG-O-TRON 3000', '#3c8a4a', true, ''],
  ['Snapdragon (a flower)', '#ae3ec9', false, "A snapdragon is a flower. Jen has some on her desk."],
  ['Komodo dragon', '#8a6a3a', true, ''],
  ['A rubber duck', '#f1c232', false, "That's a rubber duck. A very good listener, but not a dragon."],
  ['Douglas in a dragon onesie', '#1b2a4a', true, '']
];
function tileArt(i){
  const s = ['<path d="M20 70 q-6 -40 20 -54 q16 -6 22 8 q-10 10 -6 30 q30 -10 40 12 q-20 14 -50 10z" fill="#fff" opacity=".9"/>',
    '<path d="M50 20 v60" stroke="#fff" stroke-width="5"/><ellipse cx="32" cy="40" rx="18" ry="8" fill="#fff" opacity=".8"/><ellipse cx="68" cy="40" rx="18" ry="8" fill="#fff" opacity=".8"/><ellipse cx="34" cy="56" rx="14" ry="6" fill="#fff" opacity=".6"/><ellipse cx="66" cy="56" rx="14" ry="6" fill="#fff" opacity=".6"/>',
    '<rect x="10" y="20" width="80" height="30" fill="#fff"/><rect x="10" y="50" width="80" height="30" fill="#2b8a3e"/><path d="M28 60 q10 -26 30 -20 q14 -10 18 6 q-10 2 -10 10 q-14 14 -38 4z" fill="#c8262c"/>',
    '<ellipse cx="50" cy="52" rx="30" ry="24" fill="#ff8ac0"/><path d="M30 34 l-8 -12 M50 28 v-14 M70 34 l8 -12" stroke="#7bc96f" stroke-width="6" stroke-linecap="round"/><g fill="#fff"><circle cx="42" cy="50" r="2"/><circle cx="56" cy="56" r="2"/><circle cx="50" cy="44" r="2"/></g>',
    '<rect x="26" y="30" width="48" height="40" rx="6" fill="#2a2a2a"/><circle cx="40" cy="44" r="5" fill="#ff2a2a"/><circle cx="60" cy="44" r="5" fill="#ff2a2a"/><rect x="36" y="58" width="28" height="4" fill="#888"/>',
    '<path d="M50 84 v-40" stroke="#2b8a3e" stroke-width="5"/><g fill="#fff"><ellipse cx="50" cy="30" rx="10" ry="14"/><ellipse cx="38" cy="42" rx="8" ry="10"/><ellipse cx="62" cy="42" rx="8" ry="10"/></g>',
    '<path d="M10 64 q20 -24 50 -18 q26 4 30 16 q-30 0 -40 8 q-20 4 -40 -6z" fill="#cfc29a"/><circle cx="76" cy="54" r="2.5" fill="#111"/><path d="M90 62 l8 2" stroke="#c8262c" stroke-width="3"/>',
    '<ellipse cx="54" cy="62" rx="30" ry="18" fill="#fff3a0"/><circle cx="40" cy="38" r="16" fill="#fff3a0"/><path d="M24 38 l-12 4 l12 4z" fill="#f08a1c"/><circle cx="36" cy="34" r="2.5" fill="#111"/>',
    '<path d="M30 86 q-4 -40 20 -48 q24 8 20 48z" fill="#2fa456"/><ellipse cx="50" cy="30" rx="14" ry="16" fill="#e8bc96"/><path d="M34 22 q16 -20 32 0 l-4 -14 l-6 6 l-6 -10 l-6 10 l-6 -6z" fill="#2fa456"/><path d="M44 36 q6 5 12 0" stroke="#7a3a2a" stroke-width="2.5" fill="none"/>'];
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${s[i]}</svg>`;
}
function openCaptcha(){
  if(S.f.out6) return say("You're off the yacht. Roy is lying on the pier, hugging it.");
  const picked = new Set();
  openModal('Smart gangway', 'Reynholm SmartDock · bot protection', `<div class="capthead">Select all squares with<b>dragons</b>Douglas in a onesie counts. He insisted.</div>
    <div class="capt">${TILES.map(([l,c],i) => `<button type="button" class="ctile" data-t="${i}" style="background:${c}" aria-pressed="false">${tileArt(i)}<span>${l}</span></button>`).join('')}</div>
    <div style="display:flex;justify-content:flex-end;max-width:460px;margin:8px auto 0"><button class="btn" type="button" id="cverify">Verify</button></div><div class="feedback" id="cfb" style="max-width:460px;margin-inline:auto"></div>`, body => {
    body.querySelectorAll('.ctile').forEach(b => b.onclick = () => { const i = +b.dataset.t; picked.has(i) ? picked.delete(i) : picked.add(i); b.classList.toggle('on', picked.has(i)); b.setAttribute('aria-pressed', picked.has(i)); beep(600,.02); });
    $('#cverify').onclick = () => { const f = $('#cfb');
      const wrong = [...picked].find(i => !TILES[i][2]);
      if(wrong !== undefined){ nope(); f.className = 'feedback bad'; f.textContent = tx('{why} Please try again.', { why: tx(TILES[wrong][3]) }); return; }
      const missed = TILES.filter((t,i) => t[2] && !picked.has(i)).length;
      if(missed){ nope(); f.className = 'feedback bad'; f.textContent = tx(missed===1 ? 'You missed 1 dragon. {more}' : 'You missed {n} dragons. {more}', { n: missed, more: tx(missed===1 ? 'Look closely. Flags count. Lizards count. Douglas counts.' : 'Some dragons are less obvious than others.') }); return; }
      S.f.out6 = true; save(); applyVisuals(); chord([523,659,784,1046,1318],120); f.className = 'feedback good'; f.textContent = 'Verified: you are a human. Or a very well-informed robot. Gangway lowering.';
      setTimeout(()=>{ closeModal(); win6(); }, 1400);
    };
  });
}

/* --- chapter 6 flow --- */
function intro6(){
  say([["sys","Saturday, 11:00. The Thames. Douglas's brand-new yacht, the Douglas II, bobs gently at its berth. There is still no Douglas I."],
       ["douglas","Welcome aboard! The board couldn't make it, so it's just us. Moss has rebuilt his escape room on my yacht. Harder! More dragons!"],
       ["moss","I've connected every puzzle to the yacht's real systems. For immersion. I'm starting to think that was a mistake."],
       ["douglas","Nonsense. Now, which button starts the game? This big red one?"],
       ["sys","Douglas presses the big red button. The mooring lines drop. The engine cuts out. The helm locks. Slowly, the yacht begins to drift down the Thames."],
       ["roy","We're moving. Why are we moving? I get seasick looking at puddles."],
       ["moss","We're drifting towards the Thames Barrier. Nobody panic. I'm… I'm panicking."],
       ["jen","Wooo! Look at the view! Selfie!"],
       ["you","Locked in. Sixth time. This time there's a river."]]);
}
function startCh6(){
  S = Object.assign(fresh(), { ach: S.ach || {} }); S.ch = 6; S.scene = 'yacht'; S.started = true; S.inv = ['duck']; S.f.duckTaken = true;
  prog = []; sel = null; setUnlocked6(); closeModal();
  $('#title').hidden = true; $('#win').hidden = true; renderInv(); applyVisuals(); $('#timer').textContent = '00:00'; save(); intro6();
}
function win6(){
  say([["sys","The smart gangway lowers with a satisfied beep. Roy is first off. He lies down on the pier and hugs it."],
       ["jen","Wait, were we drifting? I thought that was the view moving."],
       ["moss","Six escapes. One yacht. Zero sinkings. I'm calling that a successful product launch."],
       ["douglas","Best team building ever! Same time next week? I'll buy a bigger yacht. Douglas III. We'll skip Douglas I again."],
       ["roy","Have you tried… not doing that?"],
       ["sys","And that was the week the new IT temp escaped all of Reynholm Industries. Monday, they start again at 12:58."]], () => showWin());
}

/* --- the passing tour boat (just for fun) --- */
let boatTimer = null, boatInView = false;
function scheduleBoat(delay){ clearTimeout(boatTimer); boatTimer = setTimeout(sendBoat, delay); }
function sendBoat(manual = false){
  const boat = $('#tourboat');
  const reduced = reducedMotion();
  const visible = S.scene==='yacht' && $('#title').hidden && document.visibilityState==='visible';
  if(!boat || !visible || (reduced && !manual)){ scheduleBoat(8000); return; }
  boat.classList.remove('pass', 'force-pass'); void boat.getBoundingClientRect();
  if(reduced && manual) boat.classList.add('force-pass');
  boat.classList.add('pass');
  setTimeout(() => { boatInView = true; $('#doug-arm').style.display = 'none'; $('#doug-wave').style.display = ''; beep(330,.25,'sine',.03); }, 4200);
  setTimeout(() => { boatInView = false; $('#doug-arm').style.display = ''; $('#doug-wave').style.display = 'none'; }, 13500);
  scheduleBoat(18000 + 15000 + Math.random()*20000);
}
scheduleBoat(7000);
