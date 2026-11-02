// Chapter 3: the executive floor.
// Loaded in order by js/boot.js; all game files share the same global scope.

/* ================= CHAPTER 3: THE EXECUTIVE FLOOR ================= */
const UNLOCK3 = KEY + '-ch3';
let ch3Open = false;
function unlocked3(){ if(ch3Open || S.ch>=3 || (S.ch===2 && S.f.out2)) return true; try{ return localStorage.getItem(UNLOCK3)==='1'; }catch(e){ return false; } }
function setUnlocked3(){ ch3Open = true; try{ localStorage.setItem(UNLOCK3,'1'); }catch(e){} }
function buildDecor3(){
  const g = $('#blinds');
  for(let y=112; y<468; y+=16) g.insertAdjacentHTML('beforeend', `<rect x="732" y="${y}" width="396" height="13" fill="#7a1f22" opacity=".94"/>`);
  g.insertAdjacentHTML('beforeend', '<rect x="732" y="112" width="396" height="356" fill="#ff2a2a" opacity=".12" class="pulse"/>');
}

Object.assign(H, {
  ddoor(){ if(S.f.out3) return startCh4();
    say(["The office doors are sealed. A red panel reads: PRIVACY MODE · SECURITY BREACH ON EXECUTIVE PC.", "Underneath, in smaller letters: 'Release requires Board authorisation.'"]); },
  portrait(){
    if(!S.f.portrait){ S.f.portrait = true; save(); applyVisuals(); beep(200,.2,'triangle');
      return say(["Denholm Reynholm, the founder, glares down from a huge gold frame. Even in oil paint he looks disappointed in you.", "You tug the frame. It swings open on a hinge. Behind it: a steel safe, wired to a very old computer terminal."]); }
    openSafe(); },
  trophies(){ say(["A wall of trophies: 'World's Best Boss', 'World's Best Boss (runner-up)' and 'Best Hair, Executive Category'.", "Every engraving says: 'From Douglas Reynholm, to Douglas Reynholm.'"]); },
  dwindow(){ say(S.f.out3 ? "The blinds are up again. London glitters. Somewhere down there, Roy is still at lunch." : "The blinds are down and glowing red. Through a gap you can see London, carrying on without you."); },
  dpc(){ openDougPC(); },
  plate(){ say("A gold nameplate: D. REYNHOLM, CEO. Someone has added a sticker underneath: 'and IT expert'. It's in Douglas's handwriting."); },
  dphone(){ say(["A gold telephone. You lift the receiver.", "It's Moss, instantly: 'Don't bother calling the Board. They don't take calls on report day. Paper only. They're very old-fashioned. Fax.'"]); },
  whisky(){ say("A crystal glass of whisky. At 14:12. On a Tuesday."); },
  fax(){ openFax(); },
  manual(){ openManual(); },
  douglas(){ openTalk(); },
  tank(){ say("A fish tank with one very large, very smug goldfish. A tiny brass plaque reads: DOUGLAS JR."); },
  cabinet(){ say("The drinks cabinet. Every bottle in it is older than the internet. Including the one in the basement."); },
  golf(){ S.f.putts = (S.f.putts||0) + 1; save();
    if(S.f.putts < 3) return say(["You line up a putt on Douglas's practice green. It misses.", "Douglas: 'The hole moves. It's a known fault. I've emailed IT about it.'"]);
    S.ach.golf = true; save(); chord([784,1046]); say(["Hole in one!", "Douglas: 'Lucky. I'd have got that too. Eventually.'"]); }
});

/* --- talking to Douglas --- */
const TALK = [
  ["What happened to your computer?", () => "I was looking at yachts. And a few other websites. Educational ones. Then it made a noise like a very happy robot and the blinds came down."],
  ["Do you know the Board's fax number?", () => S.f.mailDone ? "The number from the advert? I know this one! ♪ Zero one one eight, nine nine nine, eight eight one, nine nine nine, one one nine, seven two five… THREE! ♪ That's 0118 999 881 999 119 725 3. I can't get it out of my head." : "Fax? Isn't that email for old people? The Board will have emailed me about it. They always email. I never read them."],
  ["Where would your father keep a safe?", () => "Father kept everything important behind his portrait. Money, contracts, his feelings."],
  ["What's the code for the safe?", () => "Father never told me. He said it was 'in the database'. I always assumed a database was a sort of filing cabinet for bases."],
  ["Have you got any fax paper?", () => "Paper? Father kept the last ream in his safe. 'For emergencies and contracts,' he said. This is both, really."],
  ["What does IT stand for?", () => "Incredibly Talented. I decided this morning. Although Barber's slides were very persuasive."]
];
function openTalk(){
  openModal('Douglas Reynholm', 'CEO · charming · no help at all', `<div class="talk">${TALK.map(([q],k)=>`<button type="button" data-t="${k}">${q}</button>`).join('')}</div><div class="talk-row">${talkFace('Douglas')}<div class="talk-a" id="talk-a">"Ask me anything. I know everything. About most things."</div></div>`,
  body => body.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { beep(500,.03); $('#talk-a').textContent = '"' + TALK[+b.dataset.t][1]() + '"'; }));
}

/* --- Douglas's computer --- */
let pops = null, popNext = 8, dView = 'desk';
const dfb = (t, cls='') => { const e = $('#dfb'); if(e){ e.className = 'feedback ' + cls; e.textContent = t; } };
const POP_TEXTS = [
  ['WINNER!!!','YOU ARE THE 1,000,000th VISITOR!','CLAIM PRIZE'],
  ['Security Alert','Your PC has 3,141 viruses! Act now!','REMOVE VIRUSES'],
  ['Yachts Near You','Hot yachts in your area want to meet you.','SHOW ME'],
  ['Download RAM','Is your PC slow? Download more RAM for free!','DOWNLOAD'],
  ['Congratulations','Douglas, you have won a free tie!','✕ CLOSE'],
  ['Speed Up PC','Click here to make your computer faster.','OK'],
  ['Quick Survey','Rate your experience with pop-ups! ★★★★★','NO THANKS'],
  ['Free Screensaver','Your boss would LOVE this yacht screensaver.','INSTALL']
];
const POP_POS = [[3,5],[50,3],[22,24],[52,34],[5,52],[34,56],[28,4],[48,62]];
function mkPop(k){ const [x,y] = POP_POS[k] || [3 + Math.random()*50, 3 + Math.random()*55]; return { t: POP_TEXTS[k % POP_TEXTS.length], x, y, c: ['#2b8a3e','#c8262c','#e8590c','#1971c2','#ae3ec9'][k%5] }; }
const DIC = {
  tm:'<svg viewBox="0 0 44 44"><rect x="5" y="7" width="34" height="28" rx="3" fill="#fff"/><path d="M9 28l7-8 5 5 8-12 6 6" stroke="#2b8a3e" stroke-width="3" fill="none" stroke-linejoin="round"/></svg>',
  mail:'<svg viewBox="0 0 44 44"><rect x="5" y="10" width="34" height="24" rx="3" fill="#fff"/><path d="M6 12l16 12 16-12" stroke="#1971c2" stroke-width="3" fill="none"/></svg>',
  bak:'<svg viewBox="0 0 44 44"><rect x="7" y="6" width="30" height="32" rx="3" fill="#fff"/><rect x="13" y="6" width="18" height="11" fill="#c9d6e8"/><circle cx="22" cy="27" r="6" fill="none" stroke="#1971c2" stroke-width="3"/></svg>',
  web:'<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="17" fill="#fff"/><path d="M5 22h34M22 5q-9 17 0 34M22 5q9 17 0 34" stroke="#1971c2" stroke-width="2.5" fill="none"/></svg>'
};
function openDougPC(){
  openModal("Douglas's computer", 'Reynholm Executive Edition', `<div class="laptop"><div class="lscr dpc" id="dscr"></div><div class="stand"></div></div><div class="feedback" id="dfb"></div>`, () => { dView = 'desk'; renderDPC(); });
}
function renderDPC(){
  const L = $('#dscr'); if(!L) return;
  if(!S.f.pops) return popScreen(L);
  ({ desk:dDesk, tm:tmApp, mail:mailApp, bak:bakApp, web:webApp })[dView](L);
}
function dFrame(L, title, body){
  L.innerHTML = `<div class="app"><div class="bar"><button type="button" id="dback">← Desktop</button><b>${title}</b></div><div class="appbody" id="abody2">${body}</div></div>`;
  $('#dback').onclick = () => { dView = 'desk'; beep(500,.03); renderDPC(); };
  return $('#abody2');
}
function popScreen(L){
  if(!pops){ pops = [0,1,2,3,4,5,6,7].map(mkPop); popNext = 8; }
  L.innerHTML = pops.map((p,i)=>`<div class="pop" style="left:${p.x}%;top:${p.y}%;z-index:${i+1}"><div class="pt"><span>${p.t[0]}</span><button class="px" type="button" data-x="${i}" aria-label="Close ${p.t[0]}">✕</button></div><div class="pb">${p.t[1]}<br><button class="fake" type="button" data-f="${i}" style="background:${p.c}">${p.t[2]}</button></div></div>`).join('')
    + `<div class="taskbar" style="z-index:40"><span>Start</span><span>${pops.length} pop-ups · CPU 100%</span></div>`;
  L.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { pops.splice(+b.dataset.x, 1); beep(800,.03);
    if(!pops.length){ S.f.pops = true; pops = null; save(); applyVisuals(); chord([523,659,784]); renderDPC(); dfb('All pop-ups closed. The desktop is back, but everything is still crawling.', 'good'); return; }
    renderDPC(); });
  L.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { if(pops.length < 18) pops.push(mkPop(popNext++), mkPop(popNext++)); nope(); renderDPC();
    dfb("That wasn't a real close button. Two more pop-ups appear. Only the ✕ in the title bar really closes one.", 'bad'); });
}
function dDesk(L){
  const apps = [['tm','Task Manager'],['mail','Mail'],['bak','MossBackup'],['web','Internet']];
  L.innerHTML = `<div class="desk">${apps.map(([k,l])=>`<button class="ico" type="button" data-app="${k}" data-name="${l}">${DIC[k]}<span>${l}</span></button>`).join('')}</div>
    <div class="taskbar"><span>Start</span><span>CPU ${S.f.cpu ? 7 : 100}% · Fax queue: ${S.f.report ? '1 document' : 'empty'}</span></div>`;
  L.querySelectorAll('.ico').forEach(b => b.onclick = () => { const k = b.dataset.app;
    if(k!=='tm' && k!=='web' && !S.f.cpu){ nope(); dfb(`${b.dataset.name} is frozen. The CPU is at 100%: something is hogging the computer.`, 'bad'); return; }
    dView = k; dfb(''); beep(700,.03); renderDPC(); });
}
const PROCS = [
  ['explorer.exe','System',1,'ok'], ['svchost.exe','System',1,'sys'], ['antivirus.exe','Reynholm IT',0,'av'],
  ['totally_not_a_virus.exe','Unknown',31,'bad'], ['privacy_mode.exe','Reynholm Security',2,'priv'],
  ['free_yacht_screensaver.exe','YachtW0rld Ltd',24,'bad'], ['douglas_music.exe','D. Reynholm',2,'music'],
  ['crypto_miner_lite.exe','Unknown',22,'bad'], ['cursor_glitter_trail.exe','Unknown',17,'bad']
];
const PROC_MSG = {
  ok:"You end explorer.exe. The whole desktop vanishes. Douglas screams. You quickly start it again. Let's not do that twice.",
  sys:"Access denied. svchost.exe is a system process. Nobody knows exactly what it does, but everything needs it.",
  av:"You hover over 'End task' on the antivirus… and stop. That's exactly how Douglas got into this mess.",
  priv:"Access denied. Privacy Mode can only be released by the Board.",
  music:"Douglas: 'Not my Barry Manilow! That stays.'"
};
function tmApp(L){
  const killed = S.killed || (S.killed = []);
  const live = PROCS.filter(p => !killed.includes(p[0]));
  const cpu = Math.min(100, live.reduce((s,p)=>s+p[2], 0));
  const body = dFrame(L, 'Task Manager', `<div class="tmhead"><span>CPU <b>${cpu}%</b></span><div class="cpubar"><i style="width:${cpu}%"></i></div></div>
    <div class="tmwrap"><table class="tm"><thead><tr><th>Process</th><th>Publisher</th><th>CPU</th><th></th></tr></thead><tbody>
    ${live.map(p=>`<tr><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}%</td><td><button type="button" class="lbtn sm" data-p="${p[0]}">End task</button></td></tr>`).join('')}</tbody></table></div>
    <div class="smsg" id="tmsg">${S.f.cpu ? 'CPU back to normal. The computer breathes again.' : 'Something is eating the CPU. Be careful what you end.'}</div>`);
  body.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
    const p = PROCS.find(x => x[0]===b.dataset.p);
    if(p[3]==='bad'){
      killed.push(p[0]); save(); beep(900,.04);
      const done = PROCS.every(x => x[3]!=='bad' || killed.includes(x[0]));
      if(done && !S.f.cpu){ S.f.cpu = true; save(); chord([523,659,784,1046]); renderDPC();
        setTimeout(()=>say([['douglas',"It's stopped whirring! What did you do? Never mind. I'll tell the Board it was me."]]), 200); return; }
      renderDPC(); const m = $('#tmsg'); if(m) m.textContent = `Ended ${p[0]}.`; return;
    }
    nope(); if(p[3]==='ok'){ S.ach.explorer = true; save(); }
    $('#tmsg').textContent = PROC_MSG[p[3]];
  });
}
const MAILS = [
  { from:'Reynholm Board', addr:'board@reynholm.co.uk', subj:'URGENT: annual report by 15:00', legit:true, real:true,
    body:"Douglas, the annual report must reach the Board by 15:00 today. Email is quarantined again, so FAX it to the boardroom. The number is the one from the new emergency services advert, the one you keep singing. Send the version we approved: Friday 14:32, 2.4 MB, with the new pie chart. NOT the one with your yacht in it. — The Board" },
  { from:'Reynholm IT Support', addr:'it-support@reynholm-secure.biz', subj:'Your password expires TODAY', legit:false, body:"Dear user, your password expires in 1 hour. Log in here to keep it: http://reynholm-secure.biz/login-now" },
  { from:'Douglas Reynholm', addr:'douglas@reynho1m.co.uk', subj:'Quick favour, very urgent', legit:false, body:"Hi, it's me, Douglas, your boss. Please transfer £50,000 to the account below straight away. Don't tell anyone. Especially not me." },
  { from:'Jen Barber', addr:'jen.barber@reynholm.co.uk', subj:'Thanks for the meeting!', legit:true, body:"Douglas, thank you for liking my presentation. Please stop calling me 'Barber the Computer Wizard' in front of the Board. — Jen" },
  { from:'Prince Adebayo', addr:'prince@royal-treasure-fund.ng', subj:'Business proposal: $40,000,000', legit:false, body:"Dear Friend, I am a prince with a large fortune trapped in a bank. Kindly send your bank details and a small fee of £2,000." },
  { from:'Maurice Moss', addr:'maurice.moss@reynholm.co.uk', subj:'Please read: do NOT click links', legit:true, body:"Douglas. I'm begging you. Do not click links in emails. Do not download yachts. I have switched on security training mode. — Moss" },
  { from:'YachtWorld Deals', addr:'winner@yachtw0rld-deals.ru', subj:"You've WON a YACHT!!!", legit:false, body:"Congratulations Douglas!!! Download your_yacht.exe to claim your FREE yacht today!!!" }
];
function mailApp(L){
  const marks = S.mail || (S.mail = {}), done = S.f.mailDone;
  const body = dFrame(L, done ? 'Mail · Inbox' : 'Mail · Security training mode', `
    ${done ? '' : `<div class="notes" style="margin:0 0 10px;max-width:none">MossMail security training: mark every email as <b>Legit</b> or <b>Phishing</b> to unlock the inbox. Tip: look closely at the address after the @.</div>`}
    ${MAILS.map((m,k)=>`<div class="mail ${marks[k] ? 'm-' + marks[k] : ''}"><div class="mh"><b>${m.from}</b> <span>&lt;${m.addr}&gt;</span></div><div class="ms">${m.subj}</div>
      ${done ? `<p class="mb ${m.real ? '' : 'dim'}">${m.legit ? m.body : '(Moved to junk.)'}</p>`
             : `<p class="mb">${m.real ? '(Message locked until training is complete.)' : m.body}</p>
                <div class="mbtn"><button type="button" data-k="${k}" data-v="legit" class="${marks[k]==='legit' ? 'on' : ''}">Legit</button><button type="button" data-k="${k}" data-v="phish" class="${marks[k]==='phish' ? 'on' : ''}">Phishing</button></div>`}</div>`).join('')}
    ${done ? '' : '<button class="lbtn" type="button" id="mcheck">Check my answers</button>'}<div class="smsg" id="mmsg">${done ? 'Training passed. Inbox unlocked.' : ''}</div>`);
  body.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { marks[b.dataset.k] = b.dataset.v; save(); beep(700,.02); const sc = body.scrollTop; renderDPC(); const nb = $('#abody2'); if(nb) nb.scrollTop = sc; });
  const c = $('#mcheck'); if(c) c.onclick = () => {
    const all = MAILS.length, right = MAILS.filter((m,k) => marks[k] === (m.legit ? 'legit' : 'phish')).length;
    if(Object.keys(marks).length < all){ nope(); $('#mmsg').textContent = `Mark all ${all} emails first.`; return; }
    if(right===all){ S.f.mailDone = true; save(); chord([523,659,784,1046]); renderDPC(); const nb = $('#abody2'); if(nb) nb.scrollTop = 0; return; }
    nope(); $('#mmsg').textContent = `${right} of ${all} correct. Check each sender's domain, letter by letter.`;
  };
}
const BAKS = [
  ['report_old_DO_NOT_USE.doc','Wed 11:47','1.9 MB','Board',"It's the old version. The filename was very clear about this."],
  ['report_FINAL.doc','Thu 13:05','2.1 MB','Board',"It's last year's report. The Board will notice. Probably."],
  ['report_FINAL_v2.doc','Fri 09:10','2.4 MB','Douglas',"Page one is a full-page photo of Douglas. Not the approved version."],
  ['report_FINAL_REAL_use_this.doc','Fri 14:32','2.4 MB','Board','OK'],
  ['report_FINAL_REAL_use_this (copy).doc','Fri 14:32','0 KB','Douglas',"It's completely empty. 0 KB means there's nothing in it."],
  ['report_FINAL_v3_douglas_edits.doc','Sat 02:13','48 MB','Douglas',"It contains a 45-minute video of Douglas's yacht. The Board said NOT that one."]
];
function bakApp(L){
  const body = dFrame(L, 'MossBackup', `<div style="font-size:13px;margin-bottom:8px">${S.f.report ? '✓ Approved report restored and queued on the Fax-o-Matic.' : 'Deleted files found in the backup. Choose the version to restore.'}</div>
    <div class="tmwrap"><table class="tm"><thead><tr><th>File</th><th>Modified</th><th>Size</th><th>Author</th><th></th></tr></thead><tbody>
    ${BAKS.map((b,k)=>`<tr><td>${b[0]}</td><td>${b[1]}</td><td>${b[2]}</td><td>${b[3]}</td><td><button type="button" class="lbtn sm" data-b="${k}">Restore</button></td></tr>`).join('')}</tbody></table></div><div class="smsg" id="bmsg"></div>`);
  body.querySelectorAll('[data-b]').forEach(btn => btn.onclick = () => { const b = BAKS[+btn.dataset.b];
    if(b[4]==='OK'){
      if(S.f.report){ $('#bmsg').textContent = 'Already restored and queued.'; return; }
      S.f.report = true; save(); chord([523,659,784,1046]); renderDPC();
      setTimeout(()=>say([['you',"Restored: Friday 14:32, 2.4 MB, one tasteful pie chart. It's queued on the fax machine."],['douglas',"Is there a picture of me in it? …There should be a picture of me in it."]]), 200);
      return; }
    nope(); $('#bmsg').textContent = 'You preview it. ' + b[4] + ' You put it back.'; });
}
function webApp(L){
  dFrame(L, 'Internet', `<div class="mail"><div class="ms">Blocked by Privacy Mode</div><p class="mb">The browser is locked until the Board releases Privacy Mode.</p></div>
    <div class="mail"><div class="ms">Douglas's bookmarks</div><p class="mb">yachts.com · more-yachts.com · how-to-turn-on-email.com · am-i-a-good-boss.quiz (result: yes)</p></div>`);
}

/* --- Denholm's safe & database --- */
const DB = {
  staff: { cols:['name','role','floor'], rows:[['Roy','IT','basement'],['Moss','IT','basement'],['Jen','Relationship Manager','basement'],['Douglas','CEO','top'],['Denholm','Founder','portrait']] },
  safe: { cols:['owner','code','contents'], rows:[['Denholm','1966','fax paper, contracts, a photo of a horse'],['Douglas','0000','sold on eBay'],['Board','????','ACCESS DENIED']] }
};
let sqlBuf = [];
function sqlRun(q){
  const out = t => sqlBuf.push(t);
  out('SQL> ' + q);
  const s = q.trim().replace(/;\s*$/,'').trim(); if(!s) return;
  if(/^help$/i.test(s)) return out("Tables: staff, safe.\nExample: SELECT name, role FROM staff WHERE floor = 'basement';");
  if(/^show\s+tables$/i.test(s)) return out('staff\nsafe');
  if(/^drop\s+table/i.test(s)){ S.ach.bobby = true; save(); return out("Nice try, Little Bobby Tables. Denholm's database is read-only."); }
  if(/^(delete|update|insert)\b/i.test(s)) return out("ERROR: read-only database. Like Denholm, it does not change.");
  const m = s.match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(\w+)\s*=\s*(['"]?)(.+?)\4)?$/i);
  if(!m) return out("SYNTAX ERROR. Try: SELECT column FROM table WHERE column = 'value'");
  const [, colsRaw, tname, wcol, , wval] = m; const tn = tname.toLowerCase(), t = DB[tn];
  if(!t) return out(`ERROR: there is no table called ${tname}. Try SHOW TABLES`);
  const cols = colsRaw.trim()==='*' ? t.cols : colsRaw.split(',').map(c => c.trim().toLowerCase());
  const bad = cols.find(c => !t.cols.includes(c)); if(bad) return out(`ERROR: no column called ${bad} in ${tn}. Columns: ${t.cols.join(', ')}`);
  let rows = t.rows;
  if(wcol){ const wi = t.cols.indexOf(wcol.toLowerCase()); if(wi < 0) return out(`ERROR: no column called ${wcol} in ${tn}`); rows = rows.filter(r => r[wi].toLowerCase() === wval.trim().toLowerCase()); }
  const single = tn==='safe' && wcol && wcol.toLowerCase()==='owner' && rows.length===1;
  const ci = t.cols.indexOf('code');
  const head = cols.join(' | ');
  const lines = rows.map(r => cols.map(c => { const i = t.cols.indexOf(c); return (tn==='safe' && i===ci && (!single || r[0]==='Board')) ? '****' : r[i]; }).join(' | '));
  out(head + '\n' + '-'.repeat(Math.min(44, head.length)) + '\n' + (lines.join('\n') || '(no rows)'));
  if(tn==='safe' && cols.includes('code') && !single) out("Codes are hidden. Ask for one owner at a time: WHERE owner = '...'");
}
function openSafe(){
  if(S.f.safeOpen) return say("The safe is open and nearly empty: some contracts and a photo of a horse. Denholm loved that horse.");
  openModal("Denholm's safe", 'DENHOLM-DB v1.0 (1987) · type HELP', `<div class="crt green" style="aspect-ratio:auto;height:280px"><div class="scr" id="sqlscr"><div id="sqlout"></div><form id="sqlf"><span>SQL&gt;</span><input id="sqlin" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="SQL query"></form></div></div>
    <form class="dial" id="dialf"><label for="dial">Safe combination</label><input id="dial" inputmode="numeric" maxlength="4" autocomplete="off"><button class="btn" type="submit">Open safe</button></form><div class="feedback" id="safefb"></div>`, () => {
    if(!sqlBuf.length) sqlBuf.push("DENHOLM-DB v1.0. Property of Denholm Reynholm. Keep out, Douglas.\nType HELP to see the tables.");
    const draw = () => { const o = $('#sqlout'); if(!o) return; o.innerHTML = ''; sqlBuf.forEach(t => { const d = document.createElement('div'); d.className = 'line'; d.textContent = t; o.appendChild(d); }); $('#sqlscr').scrollTop = 1e9; };
    draw();
    $('#sqlf').onsubmit = e => { e.preventDefault(); sqlRun($('#sqlin').value); $('#sqlin').value = ''; beep(1400,.015,'square',.02); draw(); };
    $('#sqlscr').onclick = () => $('#sqlin').focus();
    $('#dialf').onsubmit = e => { e.preventDefault(); const v = $('#dial').value.trim(), f = $('#safefb');
      if(v==='1966'){ S.f.safeOpen = true; give('paper'); save(); applyVisuals(); chord([392,523,659,784]);
        f.className = 'feedback good'; f.textContent = "Clunk. The safe swings open: contracts, a photo of a horse, and the last ream of fax paper. You take the paper.";
        setTimeout(()=>{ closeModal(); say([['douglas',"1966! The year England won the World Cup. Father never stopped talking about it. Or about that horse."]]); }, 1500); }
      else if(v==='0000'){ nope(); f.className = 'feedback bad'; f.textContent = "0000 was the code for Douglas's own safe. He sold it."; }
      else { nope(); f.className = 'feedback bad'; f.textContent = 'The dial clicks, but the safe stays shut.'; } };
    setTimeout(()=>$('#sqlin') && $('#sqlin').focus(), 50);
  });
}

/* --- the fax machine --- */
const FAXNUM = '01189998819991197253';
function loadPaper(){ if(S.f.paperIn) return false; take('paper'); S.f.paperIn = true; save(); applyVisuals(); beep(300,.1,'triangle'); return true; }
function openManual(){
  openModal('Fax-o-Matic 3000 manual', 'Page 47 of 312: error codes', `<dl class="manual"><h4>Troubleshooting</h4>
    <dt>E-01 · PAPER JAM</dt><dd>Open the cover and remove the jammed sheet. Do not photocopy your face at the Christmas party.</dd>
    <dt>E-02 · NO PAPER</dt><dd>Load paper. The machine needs paper to print replies and confirmations.</dd>
    <dt>E-03 · TONER LOW</dt><dd>Ignore. The toner has said this since 1998.</dd>
    <dt>E-04 · NO OUTSIDE LINE</dt><dd>Calls outside the building need a 9 first. Dial 9, then the full number.</dd>
    <dt>E-05 · FAX IS SULKING</dt><dd>Have you tried turning it off and on again?</dd></dl>`);
}
function openFax(){
  if(S.f.out3) return say("The fax machine purrs contentedly. It has finally been useful.");
  openModal('Fax-o-Matic 3000', 'Fax, copier and occasional paperweight', `<div class="faxm">
      <div class="lcd" id="lcd"></div>
      <div class="faxrow"><button type="button" class="lbtn" id="fcover">Open cover</button><button type="button" class="lbtn" id="fpaper">Load paper</button></div>
      <div class="fnum" id="fnum"></div>
      <div class="keys">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-d="${n}">${n}</button>`).join('')}<button type="button" class="clr" data-d="C" aria-label="Clear">C</button><button type="button" data-d="0">0</button><button type="button" class="ok" data-d="S">Send</button></div>
    </div><div class="feedback" id="ffb"></div>`, body => {
    let num = '', err = '';
    const f = (t, cls='') => { const e = $('#ffb'); if(e){ e.className = 'feedback ' + cls; e.textContent = t; } };
    const draw = () => { if(!$('#lcd')) return;
      $('#lcd').textContent = err || (!S.f.jamFixed ? 'E-01 · PAPER JAM' : !S.f.paperIn ? 'E-02 · NO PAPER' : S.f.report ? 'READY · 1 DOC IN MEMORY' : 'READY · NO DOCUMENT');
      $('#fnum').textContent = num || 'Dial a number';
      $('#fcover').disabled = !!S.f.jamFixed; $('#fpaper').disabled = !!S.f.paperIn; };
    draw();
    $('#fcover').onclick = () => { S.f.jamFixed = true; save(); applyVisuals(); beep(200,.15,'triangle'); err = '';
      f("You open the cover. Jammed inside is a crumpled photocopy of Douglas's face, from the Christmas party. You pull it out."); draw(); };
    $('#fpaper').onclick = () => { err = '';
      if(S.inv.includes('paper')){ loadPaper(); f("You load Denholm's last ream of paper. The fax hums approvingly.", 'good'); }
      else f("The paper tray is empty. The fax needs paper to print the Board's reply.", 'bad');
      draw(); };
    const press = d => {
      if(d==='C'){ num = ''; err = ''; beep(300,.05); return draw(); }
      if(d!=='S'){ if(num.length < 24){ num += d; beep(900 + (+d)*40,.04); } err = ''; return draw(); }
      const bad = (lcd, t) => { err = lcd; nope(); f(t, 'bad'); draw(); };
      if(!S.f.jamFixed) return bad('E-01 · PAPER JAM', 'The fax refuses. Check the manual for E-01.');
      if(!S.f.paperIn) return bad('E-02 · NO PAPER', 'The fax refuses. Check the manual for E-02.');
      if(!S.f.report) return bad('NO DOCUMENT', "There's nothing to send. Restore the report on Douglas's computer first.");
      if(!num) return bad('NO NUMBER', 'Dial a number first.');
      if(num===FAXNUM) return bad('E-04 · NO OUTSIDE LINE', "Beep. Boop. E-04. What does the manual say?");
      if(num.replace(/^9/,'')==='999') return bad('CANCELLED', "You were about to fax the emergency services. They have enough to deal with in this building.");
      if(num!=='9'+FAXNUM) return bad('NO ANSWER', "Nobody answers. That isn't the Board's number.");
      err = 'SENDING… PAGE 1/1'; draw(); f('Connecting…', 'good');
      body.querySelectorAll('button').forEach(b => b.disabled = true);
      [600,1800,900,2400,1200,700,2000,1500].forEach((hz,i) => setTimeout(()=>beep(hz,.18,'square',.04), i*220));
      setTimeout(() => { S.f.out3 = true; save(); applyVisuals(); closeModal(); win3(); }, 2300);
    };
    body.querySelectorAll('[data-d]').forEach(b => b.onclick = () => press(b.dataset.d));
  });
}

/* --- chapter 3 flow --- */
function intro3(){
  say([["sys","Top floor, 14:12. The lift opens onto thick red carpet and a cloud of expensive aftershave."],
       ["douglas","Ah! IT! Marvellous. Come in, come in. The internet's broken and my computer is making noises. Saucy noises."],
       ["sys","As you step inside, the PC shrieks. Red lights flash. The blinds slam down. Behind you the doors lock: PRIVACY MODE · SECURITY BREACH DETECTED."],
       ["douglas","Oh, it does that. Whenever I visit certain websites. Yacht websites. Mostly."],
       ["moss","Hello? It's Moss. Privacy Mode only lifts when the Board says so. And today the Board only cares about one thing: the annual report, by 15:00."],
       ["moss","Which is on Douglas's computer. Which is full of viruses. Good luck. Don't let him touch anything."],
       ["you","Locked in. Third time today."]]);
}
function startCh3(){
  S = Object.assign(fresh(), { ach: S.ach || {} }); S.ch = 3; S.scene = 'doug'; S.started = true; S.inv = ['duck']; S.f.duckTaken = true;
  pops = null; sqlBuf = []; dView = 'desk'; sel = null; setUnlocked3(); closeModal();
  $('#title').hidden = true; $('#win').hidden = true; renderInv(); applyVisuals(); $('#timer').textContent = '00:00'; save(); intro3();
}
function win3(){
  say([["fax","SCREEEEECH. Brrrrr. Ding! A reply slides out of the fax machine."],
       ["fax","FROM THE BOARD: Report received at 14:58. Thank you. Privacy Mode released. P.S. Who added the yacht video?"],
       ["sys","Clunk. The doors unlock and the blinds roll up. Afternoon light floods the office."],
       ["douglas","Ha! Brilliant! You've saved the company. I'm promoting you. To… Head of Computers. Or Lord of the Internet. Your choice."],
       ["douglas","Now, before you go: could you have a quick look at my phone? It's making noises too."],
       ["moss","Three escapes in one day. I'm putting you forward for Employee of the Month. I've never been Employee of the Month."]], () => showWin());
}
