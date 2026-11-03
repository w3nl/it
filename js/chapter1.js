// Chapter 1: the basement. Also defines H, the hotspot table that every chapter adds to.
// Loaded in order by js/boot.js; all game files share the same global scope.

/* ---------- hotspot handlers ---------- */
const H = {
  exit(){ openKeypad(); },
  ext(){ S.f.extTaken = true; give('ext'); applyVisuals();
    say(["A fire extinguisher. The label says MADE IN BRITAIN. That's… probably fine.", "You take it. You never know in this building."]); },
  poster(){ say(["NEW EMERGENCY SERVICES NUMBER: 0118 999 881 999 119 725… 3.", "Catchy. Completely unmemorable. Someone has written 'easy to remember!' underneath."]); },
  clock(){ say("The clock says 12:58. It has said 12:58 since 2007. Nobody has filed a ticket."); },
  roymon(){ say(["Roy's computer. A game of Minesweeper, paused at the exact moment of disaster. 74 unread emails, all titled 'IT??'.",
    "A sticky note on the bezel: 'At lunch. If phone rings: off and on again. — R.'"]); },
  machine(){ S.f.heardMachine = true; save(); beep(1000,.25,'sine',.05);
    say([['machine',"You have… three… saved messages. Beep."],
         ['machine',"\"Hello, IT. Have you tried turning it off and on again?\" Beep."],
         ['machine',"\"Hello, IT. Have you tried forcing an unexpected reboot?\" Beep."],
         ['machine',"\"Hello, IT… Yeah. Is it definitely plugged in? …Okay. Off and on again, then.\" Beep."],
         ['you',"Roy has clearly found his one tool and is sticking with it."]]); },
  board(){ openBoard(); },
  shelf(){ openShelf(); },
  lava(){ say("A lava lamp. Uptime: eleven years. Technically the most reliable hardware in the department."); },
  jen(){ if(S.f.escaped) return startCh2(); say(["A frosted door: J. BARBER, RELATIONSHIP MANAGER. Locked.", "A note taped to the glass: 'In a meeting. Do NOT let them in. Back once the lockdown is over. — Jen'", "First things first: get out of the basement. Then Jen's office opens as Chapter 2."]); },
  mossposter(){ say("'There are 10 types of people in the world: those who understand binary, and those who don't.' Moss has underlined 'binary' three times."); },
  pc(){ openPC(); },
  mug(){ S.f.sawMug = true; save(); say(["Moss's mug: THERE'S NO PLACE LIKE 127.0.0.1", "127.0.0.1 is 'localhost': the address a computer uses to talk to itself. Home, basically. Geek for 'home sweet home'."]); },
  duck(){ S.f.duckTaken = true; give('duck'); applyVisuals();
    say(["A rubber duck. Programmers explain their bugs to it out loud, and somehow that fixes them.", "You take it. Use it on anything you're stuck on."]); },
  sdoor(){ if(S.f.serverOpen){ go('server'); if(!S.f.seenServer){ S.f.seenServer = true; setTimeout(()=>say([
      ['you',"The server room. It's cold, blue and humming. And on fire. Well, the bin is."],
      ['moss',"Ah. You found the second fire. That one's from the first fire. Don't worry, it's contained. In the bin. Which is in front of the breaker panel."],
      ['moss',"Which you need. Sorry."]]), 400);} }
    else openDIP(); },
  // server room
  back(){ go('office'); },
  display(){ if(!S.f.power) return say("The display is dead. NO SIGNAL. The rack has no power. The breaker must have tripped in the fire."); openDisplay(); },
  rack(){ say(S.f.power ? "Moss's server rack, humming happily. It purrs like a cat, if the cat cost £40,000." : "The rack is silent. Every light is out. Somewhere there's a breaker that needs resetting."); },
  hex(){ openHex(); },
  panel(){ if(!S.f.fireOut) return say(["The breaker panel is right behind the burning bin.", "You could reach it, if you didn't mind becoming part of the incident report."]); openLogic(); },
  fire(){ say(["A wastepaper bin, merrily on fire.", "The top page curling in the flames is titled 'Fire Safety Procedures (v3, FINAL, final2).pdf'."]); },
  internet(){ S.netTaps = (S.netTaps||0)+1; save();
    if(S.netTaps===1) say(["Under a glass dome sits a small black box with a single red light.", "The plaque: THE INTERNET. On loan from the Elders of the Internet. DO NOT TOUCH."]);
    else if(S.netTaps===2) say([['moss',"Please don't touch the Internet. The Elders of the Internet would know. They always know."]]);
    else { S.ach.internet = true; save(); say(["You tap the glass. Very gently.", "Somewhere in the world, a million cat videos buffer at once. Best to leave it alone."]); } },
  cables(){ say("A spaghetti of cables. Each one is labelled, helpfully, 'CABLE'."); }
};


/* ---------- puzzle: Moss's PC ---------- */
const termLines = () => S.term || (S.term = []);   // the terminal's screen, saved with the game
function openPC(){
  openModal("Moss's computer", "MossOS 4.2 · basement-01", `
    <div class="monitor"><div class="crt" id="crt"><div class="scr" id="scr"></div></div></div>
    <div class="tower"><span><i class="pled" id="pled"></i>MOSS-TOWER 486DX "do not touch"</span>
      <button class="power" id="pwr" type="button" aria-label="Power button">⏻</button></div>
    <div class="feedback" id="pc-fb"></div>`, () => { renderPC(); $('#pwr').onclick = power; });
}
function power(){
  beep(120,.15,'sine',.08);
  if(S.pc==='off'){ S.pc='boot'; save(); renderPC(); bootSeq(); }
  else { S.pc='off'; save(); renderPC(); $('#pc-fb').textContent = S.f.loggedIn ? 'Off. Moss would be furious. Turn it on again.' : 'Click. The screen goes dark. Now… on again?'; }
  applyVisuals();
}
function renderPC(){
  const crt = $('#crt'), scr = $('#scr'); if(!crt) return;
  $('#pled').classList.toggle('on', S.pc!=='off');
  crt.className = 'crt' + (S.pc==='bsod' ? ' bsod' : ' green');
  if(S.pc==='bsod'){
    scr.innerHTML = `<div class="tag">MossOS</div>
      <div>MossOS has encountered a problem and needs to restart. Not that it can.</div>
      <div>STOP CODE: <b>PEBKAC_EXCEPTION</b><br>(Problem Exists Between Keyboard And Chair)</div>
      <div class="dim">Address 0xDEADBEEF · 0xC0FFEE · 0x8BADF00D</div>
      <div>Press any key to continue <span class="blink">_</span></div>`;
    crt.onclick = () => { $('#pc-fb').textContent = "You press a key. And another. Nothing. It's properly frozen. What would Roy say?"; beep(90,.1); };
  } else if(S.pc==='off'){ scr.innerHTML = ''; crt.onclick = null; }
  else if(S.pc==='boot'){ crt.onclick = null; }
  else if(S.pc==='login'){
    scr.innerHTML = `<div class="line">MossOS 4.2 LTS  basement-01  tty1</div><div class="line"> </div>
      <div class="line">basement-01 login: moss</div>
      <form id="lf"><span>Password:</span><input id="pw" type="password" autocomplete="off" aria-label="Password"></form>
      <div class="line dim"> </div><div class="line dim">Password hint: "where the heart is"</div>
      <div class="line" id="pwmsg"></div>`;
    crt.onclick = () => $('#pw') && $('#pw').focus();
    keepTyped($('#pw'), 'mosspw');
    $('#lf').onsubmit = e => { clearTyped('mosspw'); e.preventDefault(); const v = $('#pw').value.trim().toLowerCase();
      if(['127.0.0.1','localhost','::1','home','127.1'].includes(v) && v!=='home'){ S.f.loggedIn = true; S.pc='term'; save(); chord([523,784,1046]); renderPC(); }
      else { const m = v==='home' ? "So close. Geekier. Think of Moss's mug." : ['Login incorrect.','Login incorrect. Moss passwords are always about home.','Login incorrect. Have you looked at his desk?'][Math.floor(Math.random()*3)];
        $('#pwmsg').textContent = m; $('#pw').value=''; beep(110,.2,'sawtooth',.04); } };
    setTimeout(()=>$('#pw') && $('#pw').focus(), 50);
  } else if(S.pc==='term'){ renderTerm(); }
}
function bootSeq(){
  const lines = ['MossBIOS v4.2  (c) Reynholm Industries','Memory test: 640K OK (ought to be enough for anybody)','Detecting coffee... not found','Mounting /dev/brain ............ OK','Loading MossOS 4.2 LTS','Starting LOCKDOWN PROTOCOL v2.1 ... already running',' '];
  const scr = $('#scr'); scr.innerHTML=''; let i = 0;
  $('#pc-fb').textContent = 'It\'s booting. Have you tried turning it off and on again? Yes. Yes you have.';
  const step = () => { if(!$('#scr')) return; if(i<lines.length){ scr.insertAdjacentHTML('beforeend', `<div class="line">${lines[i++]}</div>`); beep(1200,.02,'square',.02); setTimeout(step, 260); }
    else { S.pc='login'; save(); renderPC(); applyVisuals(); $('#pc-fb').textContent=''; } };
  step();
}
/* terminal */
const FILES = {
  'readme.txt': "MOSS'S COMPUTER.\nDo NOT touch. Especially you, Roy.\nIf you are reading this, you have touched it.",
  'lockdown.log': "[12:41] Smoke detected (toast).\n[12:41] LOCKDOWN PROTOCOL v2.1 ENGAGED. Exit door sealed.\n[12:42] Exit override PIN moved to the server rack display, for safety.\n[12:42] WARNING: bin fire in server room. Breaker tripped. Rack offline.\n[12:43] Breaker reset = logic panel on server room wall.\n[12:43] Server room door code: see note_to_self.rot13",
  'note_to_self.rot13': null,
  'shopping.txt': "- milk\n- new toaster (fewer flames)\n- new fire extinguisher (current one: 'Made in Britain')\n- return the Internet to the Elders by Friday"
};
const NOTE_PLAIN = "Note to self: the server room door code is the answer to life, the universe and everything. Written in binary. Eight switches. Do not tell Roy.";
const rot13 = s => s.replace(/[a-z]/gi, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b); });
// The note is encoded in the player's language, so it decodes to something they can read
Object.defineProperty(FILES, 'note_to_self.rot13', { get: () => rot13(tx(NOTE_PLAIN)), enumerable: true });
const FORTUNES = ["There's no place like 127.0.0.1.","To understand recursion, you must first understand recursion.","It works on my machine.","99 little bugs in the code. Take one down, patch it around. 127 little bugs in the code.","A SQL query walks into a bar, sees two tables and asks: may I join you?","Why do programmers prefer dark mode? Because light attracts bugs."];
function tprint(t, cls=''){ const lines = termLines(); lines.push([t,cls]); if(lines.length > 300) lines.splice(0, lines.length - 300); save(); const o = $('#tout'); if(o){ o.insertAdjacentHTML('beforeend', `<div class="line ${cls}"></div>`); o.lastElementChild.textContent = t; $('#scr').scrollTop = 1e9; } }
const termHist = () => S.thist || (S.thist = []);   // commands for the up and down arrows
let hi = 0;
function renderTerm(){
  const scr = $('#scr');
  scr.innerHTML = `<div id="tout"></div><form id="tf"><span>moss@basement:~$</span><input id="tin" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command"></form>`;
  const lines = termLines(), hist = termHist(); hi = hist.length;
  if(!lines.length){ ["Welcome to MossOS 4.2 LTS.","1 new system message: LOCKDOWN ACTIVE.","Type 'help' for a list of commands."," "].forEach(l=>lines.push([l,''])); }
  const o = $('#tout'); lines.forEach(([t,c]) => { o.insertAdjacentHTML('beforeend', `<div class="line ${c}"></div>`); o.lastElementChild.textContent = t; });
  $('#crt').onclick = () => $('#tin').focus();
  keepTyped($('#tin'), 'tin');
  $('#tf').onsubmit = e => { e.preventDefault(); const v = $('#tin').value; $('#tin').value=''; clearTyped('tin'); if(v.trim()){ hist.push(v); } hi = hist.length; run(v); };
  $('#tin').onkeydown = e => { if(e.key==='ArrowUp'){ e.preventDefault(); if(hi>0){ hi--; $('#tin').value = hist[hi]; } } if(e.key==='ArrowDown'){ e.preventDefault(); if(hi<hist.length){ hi++; $('#tin').value = hist[hi]||''; } } };
  setTimeout(()=>$('#tin') && $('#tin').focus(), 50); scr.scrollTop = 1e9;
}
/* tr: the classic Unix way to swap letters, and so to decode ROT13. Moss's shell supports
   "cat FILE | tr SET1 SET2", "echo TEXT | tr SET1 SET2" and "tr SET1 SET2 < FILE". */
function trSet(spec){
  const s = spec.replace(/^['"]|['"]$/g, ''); let out = '';
  for(let i = 0; i < s.length; i++){
    if(s[i + 1] === '-' && i + 2 < s.length){ for(let c = s.charCodeAt(i); c <= s.charCodeAt(i + 2); c++) out += String.fromCharCode(c); i += 2; }
    else out += s[i];
  }
  return out;
}
function trApply(text, from, to){
  const f = trSet(from), t = trSet(to);
  return text.split('').map(ch => { const i = f.indexOf(ch); return i < 0 || !t.length ? ch : t[Math.min(i, t.length - 1)]; }).join('');
}
function shellSource(part){
  const c = part.match(/^cat\s+(\S+)$/);
  if(c){
    if(!(c[1] in FILES)) return { err: `cat: ${c[1]}: No such file or directory` };
    if(c[1] === 'note_to_self.rot13'){ S.f.readNote = true; save(); }
    return { text: FILES[c[1]] };
  }
  const e = part.match(/^echo\s+(.+)$/);
  if(e) return { text: e[1].replace(/^['"]|['"]$/g, '') };
  return { err: "Moss's shell can only pipe from cat or echo. Try: cat note_to_self.rot13 | tr …" };
}
function runTr(cmd){
  let src, trPart;
  if(cmd.includes('|')){ const [left, right] = cmd.split('|').map(x => x.trim()); src = shellSource(left); trPart = right; }
  else {
    const m = cmd.match(/^(tr\s+.*?)\s*<\s*(\S+)$/);
    if(!m) return tprint("tr: it needs something to translate. Feed it a file:\n  cat <file> | tr SET1 SET2      (see: man tr)");
    src = shellSource('cat ' + m[2]); trPart = m[1];
  }
  if(src.err) return tprint(src.err);
  const toks = trPart.match(/'[^']*'|"[^"]*"|\S+/g) || [];
  if(toks[0] !== 'tr') return tprint(tx("{cmd}: Moss's shell can only pipe into tr. (see: man tr)", { cmd: toks[0] || 'that' }));
  if(toks.length < 3) return tprint("tr: it needs two sets of letters: what to replace, and what to replace it with. (see: man tr)");
  const out = trApply(src.text, toks[1], toks[2]);
  if(/answer to life|antwoord op/i.test(out)) S.ach.tr = true, save();
  return tprint(out);
}
function run(raw){
  const cmd = raw.trim(); tprint('moss@basement:~$ ' + cmd, 'dim'); beep(1400,.015,'square',.02);
  if(!cmd) return;
  const [c, ...args] = cmd.split(/\s+/); const a = args.join(' '); const lc = cmd.toLowerCase();
  if(lc==='sudo make me a sandwich'){ S.ach.sandwich = true; save(); return tprint('Okay.'); }
  if(lc==='make me a sandwich') return tprint('What? Make it yourself.');
  if(cmd.includes('|') || /^tr\b/.test(lc)) return runTr(cmd);
  switch(c.toLowerCase()){
    case 'help': return tprint("Commands: ls, cat <file>, whoami, date, ping <host>, fortune, cowsay <text>, history, clear, exit\nText tools: echo <text>, tr (swap letters; see: man tr). Pipe them with |\n(Moss also knows some secret ones.)");
    case 'echo': return tprint(a.replace(/^['"]|['"]$/g, ''));
    case 'ls': return tprint(args.includes('-a')||args.includes('-la') ? ".  ..  .countdown_highscores  " + Object.keys(FILES).join('  ') : Object.keys(FILES).join('  '));
    case 'dir': return tprint("'dir'? This isn't 1993. Try ls.");
    case 'cat': {
      if(!a) return tprint('cat: missing file name. Try: cat readme.txt');
      if(a==='.countdown_highscores') return tprint("1. MOSS ......... 9 letters (CONUNDRUM)\n2. MOSS ......... 9 letters\n3. ROY .......... 2 letters ('UH')");
      if(!(a in FILES)) return tprint(`cat: ${a}: No such file or directory`);
      if(a==='lockdown.log'){ S.f.readLog = true; save(); }
      if(a==='note_to_self.rot13'){ S.f.readNote = true; save(); }
      return tprint(FILES[a]);
    }
    case 'rot13': return tprint("rot13: command not found. Moss doesn't trust tools he didn't write himself.\nHe decodes with tr, which every Unix computer has. (see: man tr)\nOr do it by hand with the table on the whiteboard.");
    case 'whoami': return tprint('moss');
    case 'date': return tprint('Mon 12:58:00 GMT. (It is always 12:58 in the basement.)');
    case 'ping': return tprint(/internet/i.test(a) ? "PING the-internet: Request timed out.\nThe Internet appears to be in the server room. Under a glass dome." : `PING ${a||'nothing'}: 64 bytes from ${a||'nowhere'}: time=0.42ms. Pong.`);
    case 'fortune': return tprint(FORTUNES[Math.floor(Math.random()*FORTUNES.length)]);
    case 'cowsay': { const t = a || tx('Moo. Have you tried turning it off and on again?'); const bar = '-'.repeat(Math.min(t.length+2, 40));
      return tprint(` ${bar}\n< ${t} >\n ${bar}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`); }
    case 'history': return tprint("  1  mail fire@emergency.services.gov.uk\n  2  \"Dear Sir/Madam, I am writing to inform you of a fire which has broken out at the premises of...\"\n  3  \"...123 Carrendon Road. Looking forward to hearing from you. All the best, Maurice Moss.\"\n  4  lockdown --engage --panic");
    case 'clear': S.term = []; save(); $('#tout').innerHTML=''; return;
    case 'exit': case 'logout': return closeModal();
    case 'sudo': return tprint('moss is not in the sudoers file. This incident will be reported.');
    case 'rm': if(/-rf/.test(a)){ S.ach.rmrf = true; save(); return tprint("Nice try. Moss saw that coming in 2004.\nrm: refusing to delete the only working computer in the basement."); } return tprint('rm: Moss has write-protected everything. Including his feelings.');
    case 'man':
      if(a==='tr') return tprint("TR(1)            Moss's Manual            TR(1)\n\ntr SET1 SET2 swaps every letter from SET1 for the letter in the same\nposition in SET2. A-Z means all the letters from A to Z.\n\nExample:\n  echo 'hello' | tr 'a-z' 'A-Z'      gives HELLO\n  cat file.txt | tr 'a-z' 'A-Z'      shouts a whole file\n\nROT13 swaps A-M with N-Z (and a-m with n-z). Can you build the\ntwo sets for that? — M.");
      if(a==='rot13') return tprint("ROT13: move every letter 13 places along the alphabet. Doing it twice\ngets you back where you started. No command needed: see man tr. — M.");
      return tprint(tx('No manual entry for {page}. Real nerds read the source. — M.', { page: a || 'that' }));
    case 'hello': case 'hi': return tprint('Hello, IT. Have you tried turning it off and on again?');
    case 'lockdown': return tprint('lockdown: protocol already engaged. Override requires the exit PIN.');
    case 'youtube': case 'tv': case 'netflix': return tprint("Moss's recommended viewing: The IT Crowd, on YouTube.\nhttps://www.youtube.com/show/VLPLQxUFrtzYaUlfC1e_wcoaUGC02HPVHSW4?sbp=QAE%253D\nIt's a documentary, basically.");
    case 'vim': case 'vi': return tprint("You've opened vim. You will never leave. (Just kidding. Moss disabled it for your own safety.)");
    case 'emacs': return tprint('emacs: a great operating system, lacking only a decent editor.');
    case 'exit()': case 'quit': return tprint('Try: exit');
    default: return tprint(`bash: ${c}: command not found`);
  }
}

/* ---------- puzzle: whiteboard ---------- */
function openBoard(){
  const top = 'ABCDEFGHIJKLM'.split(''), bot = 'NOPQRSTUVWXYZ'.split('');
  openModal('Whiteboard', "Moss's handwriting, mostly", `<div class="board">
    <div>ROT13 — rotate every letter by 13. Do it twice and you're back where you started!! Genius!!</div>
    <div class="red">Too slow? Make the computer do it: man tr</div>
    <div class="rot">${top.map(c=>`<span class="top">${c}</span>`).join('')}${top.map(()=>'<span class="arr">⇅</span>').join('')}${bot.map(c=>`<span class="bot">${c}</span>`).join('')}</div>
    <div class="todo"><div>TODO:</div><div></div>
      <div>1. Return the Internet to the Elders</div><div>2. Teach Roy binary <span class="red">(again)</span></div>
      <div>3. Buy toaster with fewer flames</div><div>4. <s>Roy ≠ idiot</s></div></div></div>`);
}

/* ---------- puzzle: bookshelf ---------- */
const BOOKS = [
  ['The Art of Computer Programming, Vol. 1', '#2b4a7a', 220, "Pristine. Spine uncracked. Nobody has ever finished it. Not even Moss."],
  ["Networking for Dummies", '#f1c232', 180, "Roy's. Bookmarked on page 3. It has been on page 3 for four years."],
  ["The Hitchhiker's Guide to the Galaxy", '#3c6b45', 200, "HHG"],
  ["The Joy of Regex", '#8a2b22', 160, "You open it. Every page just says: ^$   …The joy is empty."],
  ["Learn C++ in 21 Days", '#5a3a6b', 190, "A note inside, in Moss's writing: 'Day 22. Still learning.'"],
  ["Countdown: Official Annual 1998", '#b5652a', 170, "Moss's favourite. Every puzzle is solved in pen and marked 'TOO EASY'."],
  ["Wizards & Warlocks: Player's Handbook", '#2a2a2a', 210, "A character sheet falls out: 'MOSS THE MAGNIFICENT. Level 14 Wizard. Charisma: 3.'"],
  ["Friendface for the Lonely", '#c9a24a', 150, "A self-help book about social networks. The receipt is still in it. Unread."],
];
function openShelf(){
  openModal('Bookshelf', 'Click a spine to pull it out', `<div class="shelf">${BOOKS.map((b,i)=>`<button class="book" type="button" data-i="${i}" style="background:${b[1]};color:${['#f1c232','#c9a24a'].includes(b[1])?'#1a1a1a':'#f2efe4'};height:${b[2]}px">${b[0]}</button>`).join('')}</div><div class="feedback" id="sh-fb">Lots of books. Some of them have even been read.</div>`,
  body => body.querySelectorAll('.book').forEach(btn => btn.onclick = () => { const b = BOOKS[+btn.dataset.i]; beep(300,.05,'triangle');
    const fb = $('#sh-fb'); fb.className='feedback';
    if(b[3]==='HHG'){ S.f.found42 = true; save(); fb.classList.add('good'); fb.textContent = "Dog-eared and well loved. Inside the cover, in big friendly letters: DON'T PANIC. And underneath, in Moss's writing: 'Answer to life, the universe & everything = 42'."; }
    else fb.textContent = b[3]; }));
}

/* ---------- puzzle: DIP switches ---------- */
function openDIP(){
  const vals = [128,64,32,16,8,4,2,1];
  const st = S.dip || [0,0,0,0,0,0,0,0];
  openModal('Server room lock', 'Eight DIP switches and a blinking lamp', `<div class="metal">
    <div class="plate">Enter the answer · 8-bit</div>
    <div class="dips" id="dips">${vals.map((v,i)=>`<button class="dip ${st[i]?'on':''}" type="button" data-i="${i}" aria-label="Switch worth ${v}" aria-pressed="${!!st[i]}"><span class="well"><span class="knob"></span></span><small>${v}</small></button>`).join('')}</div>
    <div class="dip-legend"><span>ON ↑ = 1</span><span>OFF ↓ = 0</span></div>
    <div class="feedback" id="dip-fb"><span class="lamp" id="dip-lamp"></span>LOCKED</div></div>`,
  body => body.querySelectorAll('.dip').forEach(b => b.onclick = () => {
    const i = +b.dataset.i; st[i] = st[i] ? 0 : 1; S.dip = st; save();
    b.classList.toggle('on', !!st[i]); b.setAttribute('aria-pressed', !!st[i]); beep(st[i]?900:600,.03);
    const val = st.reduce((s,x,k)=>s + x*vals[k], 0);
    if(val===42){ $('#dip-lamp').classList.add('ok'); const fb = $('#dip-fb'); fb.className='feedback good'; fb.innerHTML='<span class="lamp ok"></span>00101010 · ACCESS GRANTED';
      S.f.serverOpen = true; save(); chord([523,659,784,1046]);
      setTimeout(()=>{ closeModal(); applyVisuals(); say([["sys","Clunk. The server room door swings open. A wave of cold, blue air rolls out."],["moss","Did you just open the server room? With binary? I'm so proud. Don't tell Roy it was 42."]]); }, 900); }
  }));
}

/* ---------- puzzle: logic gates ---------- */
function openLogic(){
  const inp = S.logic || {A:0,B:0,C:0,D:0};
  const svg = `<svg viewBox="0 0 600 340" role="img" aria-label="Logic circuit">
    <g id="wires">
      <polyline class="w" data-s="A" points="76,60 160,60 160,80 200,80"/>
      <polyline class="w" data-s="B" points="76,130 160,130 160,100 200,100"/>
      <polyline class="w" data-s="C" points="76,200 200,200"/>
      <polyline class="w" data-s="C" points="130,200 130,260 200,260"/>
      <polyline class="w" data-s="D" points="76,280 200,280"/>
      <polyline class="w" data-s="X" points="260,90 340,90 340,160 400,160"/>
      <polyline class="w" data-s="N" points="260,200 320,200 320,180 400,180"/>
      <polyline class="w" data-s="O" points="260,270 360,270 360,200 400,200"/>
      <polyline class="w" data-s="Q" points="460,180 528,180"/>
    </g>
    <circle cx="130" cy="200" r="5" fill="#8b939c"/>
    <g class="gate"><rect x="200" y="64" width="60" height="52" rx="4"/><text x="230" y="95" text-anchor="middle">XOR</text></g>
    <g class="gate"><rect x="200" y="184" width="60" height="32" rx="4"/><text x="230" y="205" text-anchor="middle">NOT</text></g>
    <g class="gate"><rect x="200" y="244" width="60" height="52" rx="4"/><text x="230" y="275" text-anchor="middle">OR</text></g>
    <g class="gate"><rect x="400" y="144" width="60" height="72" rx="4"/><text x="430" y="185" text-anchor="middle">AND</text></g>
    <circle id="lg-lamp" cx="552" cy="180" r="22" fill="#3a1010" stroke="#8b939c" stroke-width="3"/>
    <text class="lbl" x="552" y="226" text-anchor="middle">POWER</text>
    ${['A','B','C','D'].map((k,i)=>{ const y=[60,130,200,280][i]; return `<g class="sw" data-k="${k}" tabindex="0" role="switch" aria-label="Input ${k}">
      <rect class="base" x="14" y="${y-14}" width="56" height="28" rx="14"/><circle cx="${inp[k]?56:28}" cy="${y}" r="10" fill="${inp[k]?'#7dff9a':'#777'}"/>
      <text class="lbl" x="42" y="${y-20}" text-anchor="middle">${k}</text></g>`; }).join('')}
  </svg>`;
  openModal('Breaker panel', "Moss's \"fun\" reset circuit: light the lamp", `<div class="metal logic">${svg}</div>
    <div class="feedback" id="lg-fb">Toggle the inputs A–D. Lit wires carry a 1.</div>`,
  body => {
    const update = () => {
      const X = inp.A ^ inp.B, N = inp.C ? 0 : 1, O = (inp.C || inp.D) ? 1 : 0, Q = X & N & O;
      const v = {A:inp.A,B:inp.B,C:inp.C,D:inp.D,X,N,O,Q};
      body.querySelectorAll('.w').forEach(w => w.classList.toggle('on', !!v[w.dataset.s]));
      body.querySelectorAll('.sw').forEach(g => { const k = g.dataset.k, c = g.querySelector('circle'), y = +c.getAttribute('cy');
        c.setAttribute('cx', inp[k]?56:28); c.setAttribute('fill', inp[k]?'#7dff9a':'#777'); g.setAttribute('aria-checked', !!inp[k]); });
      $('#lg-lamp').setAttribute('fill', Q ? '#7dff9a' : '#3a1010');
      if(Q && !S.f.power){ S.f.power = true; save(); chord([392,523,659,784,1046],110);
        const fb = $('#lg-fb'); fb.className='feedback good'; fb.textContent='CLUNK. The breaker resets. Somewhere, a server sighs with relief.';
        setTimeout(()=>{ closeModal(); applyVisuals(); say([["sys","The rack wakes up: fans spin, lights blink, the display flickers to life."],["moss","Power's back? Lovely. The exit PIN should be on the rack display now. I stored it in hexadecimal. For security."],["you","Security through obscurity. Classic."]]); }, 1100); }
    };
    body.querySelectorAll('.sw').forEach(g => { const t = () => { inp[g.dataset.k] ^= 1; S.logic = inp; save(); beep(700,.03); update(); };
      g.addEventListener('click', t); g.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); t(); } }); });
    update();
  });
}

/* ---------- rack display & hex note ---------- */
function openDisplay(){
  S.f.sawPin = true; save();
  openModal('Rack display', 'Status: online', `<div class="crt green" style="aspect-ratio:16/7"><div class="scr">
    <div class="line">LOCKDOWN PROTOCOL v2.1 ........ ACTIVE</div><div class="line">RACK POWER .................... OK</div><div class="line"> </div>
    <div class="line" style="font-size:1.6em">EXIT OVERRIDE PIN: 0x539</div><div class="line"> </div>
    <div class="line dim">(Stored in hexadecimal for extra security. — M.)</div></div></div>
    <div class="feedback">The exit keypad only has the digits 0 to 9.</div>`);
}
function openHex(){
  openModal('Sticky note', 'Stuck to the side of the rack', `<div class="note">
    HEX for ROY (please read!!)<br>
    Hex counts 0–9, then <b>A</b>=10 <b>B</b>=11 <b>C</b>=12 <b>D</b>=13 <b>E</b>=14 <b>F</b>=15.<br>
    "0x" just means "this is hex".<br>
    Each position is worth 16× the one to its right:<br>
    &nbsp;&nbsp;<b>256s</b> · <b>16s</b> · <b>1s</b><br>
    Example: 0x2A = 2×16 + 10 = <b>42</b><br>
    It's not hard, Roy. — M.</div>`);
}

/* ---------- puzzle: exit keypad ---------- */
const WRONG = ["ACCESS DENIED", "DENIED. HAVE YOU TRIED TURNING IT OFF AND ON AGAIN?", "NOPE. PIN IS 4 DIGITS. DECIMAL ONES.", "DENIED. THIS INCIDENT WILL BE REPORTED."];
function openKeypad(){
  if(S.f.escaped) return nextChapter();
  let code = '';
  openModal('Exit keypad', 'Lockdown protocol v2.1 · enter override PIN', `<div class="metal keypad">
    <div class="kdisp" id="kd">____</div><div class="kmsg" id="km">LOCKDOWN ACTIVE</div>
    <div class="keys">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-k="${n}">${n}</button>`).join('')}
      <button type="button" class="clr" data-k="C" aria-label="Clear">C</button><button type="button" data-k="0">0</button><button type="button" class="ok" data-k="OK">OK</button></div></div>`,
  body => {
    const show = () => $('#kd').textContent = (code + '____').slice(0,4);
    const press = k => {
      if(k==='C'){ code=''; beep(300,.05); show(); return; }
      if(k==='OK'){
        if(code==='1337'){ chord([523,659,784,1046,1318],120); $('#km').className='kmsg good'; $('#km').textContent='OVERRIDE ACCEPTED · WELCOME, ELITE ONE'; S.f.escaped = true; save(); applyVisuals(); setTimeout(()=>{ closeModal(); win(); }, 1300); return; }
        let m = WRONG[Math.floor(Math.random()*WRONG.length)];
        if(code==='1234') m = "1234? THAT'S THE KIND OF CODE AN IDIOT HAS ON HIS LUGGAGE.";
        if(code==='0042'||code==='42') m = "42 OPENED THE SERVER ROOM. THIS IS A DIFFERENT DOOR.";
        if(code==='0539'||code==='539') m = "THAT'S STILL HEX. CONVERT IT TO DECIMAL.";
        if(code==='0118') m = "THAT'S THE EMERGENCY NUMBER. WELL, THE START OF IT.";
        if(!code) m = "TYPE SOMETHING FIRST.";
        $('#km').className='kmsg'; $('#km').textContent = m; beep(120,.25,'sawtooth',.05); code=''; show(); return;
      }
      if(code.length<4){ code += k; beep(900+(+k)*40,.05); show(); }
    };
    body.querySelectorAll('[data-k]').forEach(b => b.onclick = () => press(b.dataset.k));
    body._kh = e => { if(/^[0-9]$/.test(e.key)) press(e.key); else if(e.key==='Enter') press('OK'); else if(e.key==='Backspace'){ code = code.slice(0,-1); show(); } };
    document.addEventListener('keydown', body._kh);
    modalClose = () => document.removeEventListener('keydown', body._kh);
  });
}
