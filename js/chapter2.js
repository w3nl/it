// Chapter 2: Jen's office.
// Loaded in order by js/boot.js; all game files share the same global scope.

/* ================= CHAPTER 2: JEN'S OFFICE ================= */
const UNLOCK2 = KEY + '-ch2';
let ch2Open = false;
function unlocked2(){ if(ch2Open || S.ch>=2 || (S.ch===1 && S.f.escaped)) return true; try{ return localStorage.getItem(UNLOCK2)==='1'; }catch(e){ return false; } }
function setUnlocked2(){ ch2Open = true; try{ localStorage.setItem(UNLOCK2,'1'); }catch(e){} }
const slidesDone = () => Array.isArray(S.sl) && S.sl.length===SLIDES.length && S.sl.every(Boolean);

Object.assign(H, {
  jdoor(){ if(S.f.out2) return startCh3(); openSmartLock(); },
  postcard(){ S.f.sawTown = true; save(); say(["A postcard of a roundabout under a grey sky: GREETINGS FROM SWINDON.", "On the back: 'So proud of you and your big job in computers, love! Everyone here in Swindon, where you were born, says hello. — Mum xx'"]); },
  calendar(){ say(["Jen's calendar is open at March. The 3rd is circled in red:", "'MY BIRTHDAY. Roy got me CROCS?!?! Hid the boardroom Wi-Fi card inside them. Never opening that box again.'", "Today's entry: 'BOARD MEETING 13:30. Topic: What is IT?? (find out what IT is)'"]); },
  jnote(){ say("A sticky note: 'Board mtg 13:30!!' On the back: 'Things to learn first: 1. What IT is. 2. What IT stands for. 3. Where IT is kept?'"); },
  cv(){ S.ach.honest = true; save(); say(["Jen's CV, framed. Under 'Computer skills' it says: 'Lots of experience with computers.'", "Someone has added in pencil, in very small letters: 'I can double-click.'"]); },
  window(){ say(["A basement window at pavement level, behind the railings. Legs stride past all day: suits, heels, and now and then a sausage dog on a lead.", "Jen has given some of the legs names. The dog is called Gary."]); },
  jposter(){ say("KEEP CALM AND CALL IT. Underneath, in Jen's writing: 'IT = Roy and Moss? So IT stands for… Roy and Moss??'"); },
  lamp(){ say("A pink desk lamp. The only light in the basement that isn't a screen or a fire."); },
  laptop(){ openLaptop(); },
  photo(){ S.f.sawPet = true; save(); say(["A photo of a young Jen hugging a very fluffy, very offended white cat.", "Engraved on the frame: 'Me & Sir Purrcival, my first pet. Gone but never forgotten.'"]); },
  notepad(){ openJenPad(); },
  jmug(){ say("'WORLD'S OKAYEST MANAGER'. A present from Roy. Jen uses it anyway, out of spite."); },
  jbin(){ say(["Crumpled drafts of slide one: 'IT = Important Typing?', 'IT = Interesting Things?', 'I.T. = I Tried'.", "And a receipt for 'Computers for Dummies'. Returned. Unread."]); },
  plant(){ say("A plastic plant. Jen still waters it every day. It's doing great."); },
  shoes(){ openShoes(); }
});

/* --- shoe rack --- */
const BOXES = [
  ['BELLADONNA','Red stilettos','#e64980','#fff',"Red stilettos, size 38. Worn once, to a wedding. Never again."],
  ['BELLADONNA','Black boots','#222','#fff',"A note inside: 'Board meeting boots. POWERFUL.' She forgot to wear them today."],
  ['BELLADONNA','Gold sandals','#f1e3c8','#333',"Gold sandals and a receipt longer than a CPU manual."],
  ['BELLADONNA','Emergency heels','#c9a24a','#222',"Emergency heels and an emergency chocolate bar. Half eaten. Bite marks suggest Roy."],
  ['BELLADONNA','Pink kitten heels','#d6336c','#fff',"Pink kitten heels. No kittens were involved."],
  ['CROCS','Lime green · from Roy','#74e04b','#1a3a10','CROCS']
];
function openShoes(){
  openModal('Shoe rack', "Jen's pride and joy", `<div class="shoes">${BOXES.map((b,k)=>`<button class="sbox" type="button" data-b="${k}" style="background:${b[2]};color:${b[3]}"><b>${b[0]}</b><span>${b[1]}</span></button>`).join('')}</div><div class="feedback" id="shfb">Every box except one says BELLADONNA. Jen clearly has a favourite designer.</div>`,
  body => { S.f.sawBrand = true; save();
    body.querySelectorAll('.sbox').forEach(btn => btn.onclick = () => { const b = BOXES[+btn.dataset.b]; beep(300,.05,'triangle'); const fb = $('#shfb'); fb.className = 'feedback';
      if(b[4]==='CROCS'){
        if(!S.f.gotCard){ S.f.gotCard = true; give('card'); fb.className = 'feedback good'; fb.textContent = "Lime green Crocs, tag still on. Tucked inside the left one: a card labelled BOARDROOM WI-FI. You take it."; }
        else fb.textContent = "The Crocs. Still lime. Still green. Still never worn.";
      } else fb.textContent = b[4];
    }); });
}

/* --- Jen's notepad --- */
function openJenPad(){
  const top = 'ABCDEFGHIJKLM'.split(''), bot = 'NOPQRSTUVWXYZ'.split('');
  openModal("Jen's notepad", "Copied off Moss's whiteboard", `<div class="note" style="max-width:580px">Moss's SECRET CODE (very secure!!) Swap every letter with its partner:
    <div class="rot">${top.map(c=>`<span class="top">${c}</span>`).join('')}${top.map(()=>'<span class="arr">⇅</span>').join('')}${bot.map(c=>`<span class="bot">${c}</span>`).join('')}</div>
    Underneath: three doodled shoes, a heart, and "Roy + Moss = IT??"</div>`);
}

/* --- SmartLock --- */
function openSmartLock(){
  openModal('SmartLock', 'Reynholm SmartLock v1.0 · owner: J. Barber', `<form class="slock" id="slf">
    <div class="scr2">TWO-FACTOR AUTHENTICATION ENABLED<br>1. Owner's security answer<br>2. One-time code, sent to the owner's devices</div>
    <label for="sla">Security question: What does IT stand for?</label><input id="sla" autocomplete="off" spellcheck="false">
    <label for="slc">One-time code</label><input id="slc" inputmode="numeric" autocomplete="off">
    <button class="btn" type="submit">Unlock</button>
    <div class="feedback" id="slfb"></div></form>`, () => {
    setTimeout(()=>$('#sla') && $('#sla').focus(), 50);
    $('#slf').onsubmit = e => { e.preventDefault();
      const a = $('#sla').value.toLowerCase().replace(/[^a-z]/g,''), c = $('#slc').value.replace(/\D/g,''), fb = $('#slfb');
      const bad = t => { fb.className = 'feedback bad'; fb.textContent = t; nope(); };
      if(!a) return bad('Answer the security question first.');
      if(['informationtechnology','informatietechnologie','informatietechniek'].includes(a)){
        if(!S.f.triedIT){ S.f.triedIT = true; save(); setTimeout(()=>say([['moss',"Ah. That's the right answer. But it isn't Jen's answer. The lock wants whatever Jen thought IT stood for when she set it."]]), 300); }
        return bad("INCORRECT. That is the correct answer. It is not the owner's answer.");
      }
      if(!['internetthing','internetthings','internetthingy','internetthingies','internetding','internetdingen','internetdinges','internetdingetje'].includes(a)) return bad("INCORRECT. That doesn't match the owner's answer.");
      if(!c) return bad("ANSWER ACCEPTED. Now enter the one-time code sent to the owner.");
      if(c!=='8086') return bad('ANSWER ACCEPTED. ONE-TIME CODE INVALID.');
      fb.className = 'feedback good'; fb.textContent = 'ACCESS GRANTED. Have a lovely day, J. Barber.'; chord([523,659,784,1046,1318],120);
      S.f.out2 = true; save(); applyVisuals(); setTimeout(()=>{ closeModal(); win2(); }, 1300);
    };
  });
}

/* --- Jen's laptop --- */
let lapView = 'desk', curSlide = 0;
/* The locked laptop remembers its screen ('lock' or 'reset') and what you typed, so closing it to go and look
   for an answer doesn't wipe anything. Saved in S.jl until the laptop is unlocked. */
const jlock = () => S.jl || (S.jl = { view: 'lock', pw: '', q1: '', q2: '', q3: '', checked: false });
const IC = {
  slides:'<svg viewBox="0 0 44 44"><rect x="4" y="6" width="36" height="28" rx="3" fill="#fff"/><rect x="4" y="6" width="36" height="7" rx="3" fill="#d6336c"/><rect x="9" y="17" width="14" height="11" fill="#ffc9de"/><path d="M27 18h8M27 22h8M27 26h6" stroke="#999" stroke-width="2"/><path d="M22 34v5M16 39h12" stroke="#fff" stroke-width="2.5"/></svg>',
  wifi:'<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="#fff"/><path d="M10 20q12-10 24 0M14 25q8-6 16 0M18 30q4-3 8 0" stroke="#8a5cf6" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="22" cy="34" r="2.5" fill="#8a5cf6"/></svg>',
  msgs:'<svg viewBox="0 0 44 44"><path d="M6 7h32a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H18l-8 7v-7H6a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3z" fill="#fff"/><path d="M11 15h22M11 21h16" stroke="#8a5cf6" stroke-width="2.5"/></svg>',
  bin:'<svg viewBox="0 0 44 44"><path d="M11 13h22l-2 27H13z" fill="#fff"/><rect x="8" y="8" width="28" height="5" rx="2" fill="#e8e3ee"/><path d="M17 18v16M22 18v16M27 18v16" stroke="#aaa" stroke-width="2"/></svg>',
  sol:'<svg viewBox="0 0 44 44"><rect x="6" y="9" width="20" height="28" rx="3" fill="#f3eef8" transform="rotate(-10 16 23)"/><rect x="18" y="8" width="20" height="28" rx="3" fill="#fff"/><path d="M28 27l-5-5a3 3 0 0 1 5-3a3 3 0 0 1 5 3z" fill="#d6336c"/></svg>',
  shoe:'<svg viewBox="0 0 44 44"><path d="M6 30h22l10-10q2-3-2-4q-8 2-14 8q-6-6-14-2z" fill="#fff"/><rect x="32" y="20" width="3" height="12" fill="#fff"/></svg>'
};
const SLIDES = [
  { t:'What is IT?', jen:'A presentation by Jen Barber, Head of IT (Relationship Manager)' },
  { t:'CPU', jen:'Computer Power Unit. (Or Cute Purple Underwear?? Check with Moss)', opts:['Central Processing Unit','Computer Personal Unit','Core Power Utility'], a:0, why:"The CPU is the computer's brain: it carries out the instructions of every program." },
  { t:'RAM', jen:'Really Angry Mouse. (When the mouse stops working.)', opts:['Rapid Action Module','Random Access Memory','Read-Anything Memory'], a:1, why:"RAM is the computer's short-term memory. It forgets everything when you turn it off. And on again." },
  { t:'USB', jen:'Universal Shoe Box. (It stores things!!)', opts:['Universal Storage Box','Unified System Bridge','Universal Serial Bus'], a:2, why:"USB is the standard plug for connecting devices. It never fits the first time. Or the second." },
  { t:'HTML', jen:'How To Make Lasagne', opts:['HyperText Markup Language','High-Tech Modern Language','HyperTransfer Mail Link'], a:0, why:"HTML is the language web pages are written in. Including this one." },
  { t:'Wi-Fi', jen:'Wireless Fidelity. (Moss says no, but it sounds right.)', opts:['Wireless Fidelity','Wide Fibre',"It doesn't stand for anything"], a:2, why:"Trick question! Wi-Fi is a made-up brand name, chosen because it rhymes with Hi-Fi. Moss was right.",
    wrong:{0:"That's exactly what Jen wrote. Over the intercom, Moss sighs. Loudly."} },
  { t:'So what does IT stand for?', jen:"IT stands for… (I'll wing it)", opts:['Intelligent Typing','Information Technology','Internet Thing'], a:1, why:"IT means Information Technology: everything to do with computers, networks and data.", notes:true,
    wrong:{2:"That's Jen's version. The board deserves the real one. (Worth remembering, though.)"} }
];
const WRONGS = ["Over the intercom, Moss says: 'No.'", "That's even more wrong than Jen's version.", "Somewhere in the building, Roy laughs and doesn't know why.", "Nope. Try again."];

function openLaptop(){
  openModal("Jen's laptop", S.f.lap ? 'Logged in as Jen Barber' : 'Locked', `<div class="laptop"><div class="lscr" id="lscr"></div><div class="lbase"></div></div>`, () => renderLap());
}
function renderLap(){
  const L = $('#lscr'); if(!L) return;
  if(!S.f.lap) return jlock().view === 'reset' ? resetScreen(L) : lockScreen(L);
  ({ desk:desktop, slides:slidesApp, wifi:wifiApp, msgs:msgsApp, bin:binApp, sol:solApp })[lapView](L);
}
function appFrame(L, title, body){
  L.innerHTML = `<div class="app"><div class="bar"><button type="button" id="aback">← Desktop</button><b>${title}</b></div><div class="appbody" id="abody">${body}</div></div>`;
  $('#aback').onclick = () => { lapView = 'desk'; beep(500,.03); renderLap(); };
  return $('#abody');
}
function lockScreen(L){
  const st = jlock(); st.view = 'lock'; save();
  L.innerHTML = `<div class="lock"><div class="avatar">${IC.shoe}</div><div style="font-size:20px;font-weight:700">Jen Barber</div>
    <form id="jl"><input id="jpw" type="password" placeholder="Password" aria-label="Password" autocomplete="off"></form>
    <div class="lmsg" id="jmsg">Password hint: "I'll never forget it!"</div>
    <button type="button" class="link" id="forgot">Forgot password?</button></div>`;
  $('#jpw').value = st.pw; $('#jpw').oninput = e => { st.pw = e.target.value; save(); };
  $('#jl').onsubmit = e => { e.preventDefault(); nope(); $('#jpw').value = st.pw = ''; save();
    $('#jmsg').textContent = ["Incorrect password. Hint: \"I'll never forget it!\" (She forgot it.)", "Incorrect password. Jen probably uses the reset link a lot.", "Incorrect password. Maybe try 'Forgot password?'"][Math.floor(Math.random()*3)]; };
  $('#forgot').onclick = () => { beep(700,.03); resetScreen(L); };
  setTimeout(()=>$('#jpw') && $('#jpw').focus(), 50);
}
function resetScreen(L){
  const st = jlock(); st.view = 'reset'; save();
  L.innerHTML = `<div class="lock"><div style="font-size:18px;font-weight:700">Reset your password</div><div style="font-size:13px">Answer your security questions, Jen.</div>
    <form class="qs" id="rq">
      <label for="q1">Name of your first pet?</label><input id="q1" autocomplete="off" spellcheck="false">
      <label for="q2">Your favourite shoe designer?</label><input id="q2" autocomplete="off" spellcheck="false">
      <label for="q3">Town where you were born?</label><input id="q3" autocomplete="off" spellcheck="false">
      <button class="lbtn" type="submit" style="margin-top:6px">Reset password</button></form>
    <div class="lmsg" id="rmsg"></div><button type="button" class="link" id="rback">Back</button></div>`;
  $('#rback').onclick = () => lockScreen(L);
  ['q1','q2','q3'].forEach(k => { const f = $('#' + k); f.value = st[k]; f.oninput = () => { st[k] = f.value; save(); }; });
  // green or red borders for the answers, as after the last check
  const mark = () => {
    const n = id => $(id).value.toLowerCase().replace(/[^a-z]/g,'');
    const ok = [n('#q1').includes('purrcival'), n('#q2').includes('belladonna'), n('#q3').includes('swindon')];
    ['#q1','#q2','#q3'].forEach((id,k) => $(id).style.borderColor = ok[k] ? '#2b8a3e' : ($(id).value ? '#e03131' : ''));
    return ok;
  };
  if(st.checked){ const ok = mark(); $('#rmsg').textContent = tx('{n} of 3 answers correct. The answers are somewhere in this office.', { n: ok.filter(Boolean).length }); }
  $('#rq').onsubmit = e => { e.preventDefault();
    const ok = mark(); st.checked = true; save();
    if(ok.every(Boolean)){
      S.f.lap = true; save(); applyVisuals(); chord([523,659,784,1046]);
      $('#rmsg').textContent = 'Password reset to "password1". Logging in…';
      setTimeout(() => { renderLap(); const s = $('#m-sub'); if(s) s.textContent = 'Logged in as Jen Barber';
        say([['moss',"You reset Jen's password using her cat, her shoes and her home town? This is why you don't put your whole life on Friendface."],['you',"To be fair, she put it on her walls."]]); }, 1100);
    } else { nope(); $('#rmsg').textContent = tx('{n} of 3 answers correct. The answers are somewhere in this office.', { n: ok.filter(Boolean).length }); }
  };
  setTimeout(() => { const f = ['#q1','#q2','#q3'].map(id => $(id)).find(f => f && !f.value) || $('#q1'); f && f.focus(); }, 50);
}
function desktop(L){
  const newMsg = S.f.sent && !S.f.readCode;
  const apps = [['slides','What is IT.pptx'],['wifi','Wi-Fi'],['msgs', newMsg ? 'Messages (1)' : 'Messages'],['bin','Recycle Bin'],['sol','Solitaire']];
  L.innerHTML = `<div class="desk">${apps.map(([k,l])=>`<button class="ico" type="button" data-app="${k}">${IC[k]}<span>${l}</span></button>`).join('')}</div>
    <div class="taskbar"><span>Start</span><span>${S.f.wifi ? 'Wi-Fi: Boardroom-Projector · 13:24' : 'Wi-Fi: not connected · 13:24'}</span></div>`;
  L.querySelectorAll('.ico').forEach(b => b.onclick = () => { lapView = b.dataset.app; beep(700,.03); renderLap(); });
}
function slidesApp(L){
  const s = SLIDES[curSlide], fixed = !!S.sl[curSlide];
  const content = curSlide===0 ? `<p>${s.jen}</p>` : fixed ? `<p class="wrong">${s.jen}</p><p class="right">${s.opts[s.a]}</p><p class="why">${s.why}</p>` : `<p>${s.jen}</p>`;
  const body = appFrame(L, 'What is IT.pptx · SlideShow', `
    <div class="slide ${fixed ? 'fixed' : ''}"><h4>${s.t}</h4>${content}</div>
    ${(!fixed && s.opts) ? `<div class="opts">${s.opts.map((o,k)=>`<button type="button" data-o="${k}">${o}</button>`).join('')}</div>` : ''}
    ${s.notes ? `<div class="notes"><b>Speaker notes:</b> Roy told me what IT REALLY stands for!! I wrote it in Moss's secret code so nobody can steal it: <code>${rot13(tx('INTERNET THING'))}</code>. (It's my door answer too. Don't forget!!) — J</div>` : ''}
    <div class="smsg" id="smsg">${curSlide===0 ? "Jen's slides need fixing. Use the numbered buttons to move between slides." : ''}</div>
    <div class="snav"><div class="dots">${SLIDES.map((_,k)=>`<button type="button" data-s="${k}" class="${S.sl[k]?'ok':''} ${k===curSlide?'cur':''}" aria-label="Slide ${k+1}">${k+1}</button>`).join('')}</div>
      <button class="lbtn" type="button" id="present">Present to boardroom ▶</button></div>`);
  body.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { curSlide = +b.dataset.s; beep(600,.02); renderLap(); });
  body.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { const k = +b.dataset.o;
    if(k===s.a){ S.sl[curSlide] = 1; save(); chord([659,880]); renderLap();
      const m = $('#smsg'); if(m) m.textContent = slidesDone() ? 'All slides fixed. Jen might survive this meeting.' : 'Fixed. On to the next slide.'; }
    else { nope(); $('#smsg').textContent = (s.wrong && s.wrong[k]) || WRONGS[Math.floor(Math.random()*WRONGS.length)]; } });
  $('#present').onclick = present;
}
function present(){
  const m = $('#smsg');
  if(!slidesDone()){ nope(); m.textContent = "Fix every slide first. The board can't see the lasagne slide."; return; }
  if(!S.f.wifi){ nope(); m.textContent = 'No connection. The boardroom projector is on its own Wi-Fi network.'; return; }
  if(S.f.sent){ m.textContent = 'Already on the big screen. Jen is presenting.'; return; }
  $('#abody').innerHTML = `<div class="slide fixed"><h4>Presenting…</h4><p>Sending "What is IT.pptx" to Boardroom-Projector</p><div class="progress"><i id="pg"></i></div></div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => { const p = $('#pg'); if(p) p.style.width = '100%'; }));
  setTimeout(() => { S.f.sent = true; save(); closeModal(); chord([523,659,784,1046]);
    say([['jen',"It's up! It's on the big screen! Okay, everyone: What is IT."],
         ['douglas',"Wi-Fi doesn't stand for anything? Ha! Like my second marriage. Barber, this is marvellous."],
         ['douglas',"One question, though. What does IT actually stand for?"],
         ['jen',"It's… on the last slide! Information Technology. Obviously. I knew that. I've always known that."],
         ['jen',"Oh, and the SmartLock just sent me a code to let you out. It's synced to my laptop, in Messages. Bye!"],
         ['moss',"The code is only half of it. The lock also wants Jen's own answer. The one she believed when she set it."]]);
  }, 2300);
}
const NETS = [
  ['Reynholm-Guest','Open',"Connected… to a guest network that allows one web page per hour. The projector isn't on it. Disconnected."],
  ['FBI Surveillance Van #3','Secured','FBI'],
  ['Pretty Fly for a Wi-Fi','Secured',"That's Roy's phone hotspot. It ran out of data in 2009."],
  ['It Hurts When IP','Secured',"Moss's network. The password is the first 300 digits of pi. You decide not to."],
  ['Boardroom-Projector','Secured · WPA2','BOARD']
];
function wifiApp(L){
  const body = appFrame(L, 'Wi-Fi settings', `<div style="font-size:13px;margin-bottom:8px">${S.f.wifi ? 'Connected to <b>Boardroom-Projector</b>.' : 'Not connected. Choose a network.'}</div>
    ${NETS.map(([n,t],k)=>`<button class="net ${S.f.wifi && k===4 ? 'on' : ''}" type="button" data-n="${k}"><span>${n}</span><small>${S.f.wifi && k===4 ? 'Connected' : t}</small></button>`).join('')}
    <div id="wform"></div><div class="smsg" id="wmsg"></div>`);
  body.querySelectorAll('.net').forEach(b => b.onclick = () => { const r = NETS[+b.dataset.n][2], w = $('#wmsg'); $('#wform').innerHTML = ''; beep(700,.03);
    if(r==='FBI'){ S.ach.fbi = true; save(); w.textContent = "You try to join the FBI van. Outside the window, a pair of shiny black shoes stops walking. Better not."; return; }
    if(r==='BOARD'){
      if(S.f.wifi){ w.textContent = 'Already connected.'; return; }
      w.textContent = '';
      $('#wform').innerHTML = `<form id="wf" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:4px 0"><input id="wkey" placeholder="Network key" autocomplete="off" spellcheck="false" aria-label="Network key"><button class="lbtn" type="submit">Connect</button></form>`;
      $('#wkey').focus();
      $('#wf').onsubmit = e => { e.preventDefault(); const v = $('#wkey').value.toUpperCase().replace(/[^A-Z0-9]/g,'');
        if(v==='SHOES4EVER'){ S.f.wifi = true; save(); chord([523,784]); renderLap(); const m = $('#wmsg'); if(m) m.textContent = 'Connected to Boardroom-Projector. Now present the slides.'; }
        else { nope(); $('#wmsg').textContent = "Wrong network key. Jen wrote it down somewhere she'd never look."; } };
      return;
    }
    w.textContent = r; });
}
function msgsApp(L){
  const list = [['Moss',"Jen, I've installed your SmartLock. Please choose a security answer you'll actually remember. — Moss"],
                ['Roy',"Borrowed your stapler. And your biscuits. And, briefly, your chair."],
                ['Jen (note to self)',"Door answer is in the speaker notes on the LAST SLIDE!! In Moss's code!!"]];
  if(S.f.sent){ list.push(['Reynholm SmartLock',"One-time code for J. Barber's office: 8086. Never share this code with anyone.",1], ['Jen',"That's the code! Let yourself out. Don't touch my shoes."]); if(!S.f.readCode){ S.f.readCode = true; save(); } }
  appFrame(L, 'Messages', list.reverse().map(([f,t,n])=>`<div class="msg ${n?'new':''}"><b>${f}</b>${t}</div>`).join(''));
}
const BIN = [
  ['CV_honest_version.doc', "Computer skills: I can double-click. Sometimes I triple-click by accident."],
  ['Roy_gift_ideas.txt', "For Jen: Crocs (she'll LOVE them). For Moss: a bigger calculator. For me: a new chair (Jen's)."],
  ['What_is_IT_draft1.pptx', "Slide 1: IT. Slide 2: ???. Slide 3: Any questions? (Please no questions.)"]
];
function binApp(L){
  const body = appFrame(L, 'Recycle Bin', BIN.map(([n],k)=>`<button class="file" type="button" data-f="${k}">${n}</button>`).join('') + `<div class="msg" id="fview" hidden></div>`);
  body.querySelectorAll('.file').forEach(b => b.onclick = () => { const f = BIN[+b.dataset.f]; if(f[0].startsWith('CV')){ S.ach.honest = true; save(); }
    const v = $('#fview'); v.hidden = false; v.innerHTML = `<b>${f[0]}</b>${f[1]}`; beep(600,.03); });
}
function solApp(L){ appFrame(L, 'Solitaire', `<div class="slide fixed"><h4>Solitaire</h4><p>Jen's best score: 0. She thinks it's a spreadsheet for cards.</p></div>`); }

/* --- chapter 2 flow --- */
function intro2(){
  say([["sys","Upstairs, 13:20. Moss is out of the cupboard. You head back down to the basement, rubber duck in your pocket."],
       ["jen","You! You're the new IT person? I'm Jen. Relationship Manager. Head of IT, basically. In here, quick."],
       ["jen","I've got a board presentation in ten minutes. It's called 'What is IT?' It's nearly perfect. Just… check it. Make it a bit more correct. Then send it to the boardroom projector."],
       ["jen","The laptop's on the desk. I've got to go and stall Douglas. Bye!"],
       ["sys","The door clicks shut. A small screen beside it lights up: REYNHOLM SMARTLOCK · TWO-FACTOR AUTHENTICATION."],
       ["moss","Ah. I fitted that lock for Jen last week. She chose her own security question. And her own answer."],
       ["moss","So to get out, you'll need to know what Jen thinks IT stands for. Which is a much harder question than what it actually stands for."],
       ["you","Locked in. Again."]]);
}
function startCh2(){
  S = Object.assign(fresh(), { ach: S.ach || {} }); S.ch = 2; S.scene = 'jen'; S.started = true; S.inv = ['duck']; S.f.duckTaken = true; S.sl = SLIDES.map((_,k)=>k===0 ? 1 : 0);
  curSlide = 0; lapView = 'desk'; sel = null;   // S.jl (the lock screen's typing) is reset with the rest of S setUnlocked2(); closeModal();
  $('#title').hidden = true; $('#win').hidden = true; renderInv(); applyVisuals(); $('#timer').textContent = '00:00'; save(); intro2();
}
function win2(){
  say([["sys","The SmartLock beeps happily. The door swings open."],
       ["jen","It's me! The board LOVED it. Douglas wants a sequel: 'What is a Computer?'"],
       ["douglas","Barber! Splendid show. I've decided IT stands for 'Incredibly Talented'. Like me. Put it on the letterhead."],
       ["moss","Well done. Two escapes in one day. That's a department record."]], () => showWin());
}
