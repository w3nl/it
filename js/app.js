// Chapters and end screens, hint/reveal/sound buttons, timer, achievements, title menu, installable app, and start-up.
// Loaded in order by js/boot.js; all game files share the same global scope.

/* ---------- chapters ---------- */
function chapterDone(){ return S.ch===6 ? !!S.f.out6 : S.ch===5 ? !!S.f.out5 : S.ch===4 ? !!S.f.out4 : S.ch===3 ? !!S.f.out3 : S.ch===2 ? !!S.f.out2 : !!S.f.escaped; }
function nextChapter(){ const f = {1:startCh2, 2:startCh3, 3:startCh4, 4:startCh5, 5:startCh6}[S.ch]; if(f) f(); }
function exitLabels(){
  const done = chapterDone(), n = S.ch + 1;
  const set = (sel, open, closed) => document.querySelectorAll(sel).forEach(h => { h.dataset.label = (done && S.ch < 6) ? open : closed; h.setAttribute('aria-label', h.dataset.label); });
  set('#sc-office [data-hs="exit"]', `Exit: on to Chapter ${n}`, 'Exit door');
  set('#sc-office [data-hs="jen"]', `Jen's office: on to Chapter ${n}`, "Jen's office");
  set('#sc-jen [data-hs="jdoor"]', `Door: on to Chapter ${n}`, 'Office door');
  set('#sc-doug [data-hs="ddoor"]', `Door: on to Chapter ${n}`, 'Office door');
  set('#sc-lift [data-hs="lpanel"]', `Step out: on to Chapter ${n}`, 'Lift buttons');
  set('#sc-dungeon [data-hs="firewall"]', `Way out: on to Chapter ${n}`, 'The Firewall');
}
function refreshMenu(){ const fin = chapterDone(); $('#btn-cont').hidden = !S.started || (fin && S.ch >= 6); $('#btn-cont').textContent = fin ? `Continue to Chapter ${S.ch + 1}` : 'Continue'; $('#btn-ch1').hidden = !unlocked2(); $('#btn-ch2').hidden = !unlocked2(); $('#btn-ch3').hidden = !unlocked3(); $('#btn-ch4').hidden = !unlocked4(); $('#btn-ch5').hidden = !unlocked5(); $('#btn-ch6').hidden = !unlocked6(); $('#chapters').hidden = !unlocked2(); }

const CH_END = {
  1:['Lockdown lifted · Chapter 1 complete', "You're out", "Next: Jen's office. She has a board presentation in ten minutes and no idea what IT stands for.", 'Continue to Chapter 2'],
  2:['Door unlocked · Chapter 2 complete', 'Out again', "Next: the top floor. Douglas Reynholm says the internet is broken and his computer is making noises.", 'Continue to Chapter 3'],
  3:['Privacy Mode lifted · Chapter 3 complete', 'Promoted', "Next: the lift. Douglas's phone is making noises too, and he'd like it fixed on the way down.", 'Continue to Chapter 4'],
  4:['Lift released · Chapter 4 complete', 'Ding!', "Next: Jen has had an idea. Team building. Moss has built something for it, and he's worried.", 'Continue to Chapter 5'],
  5:['Firewall lowered · Chapter 5 complete', 'Escaped', "Next: Douglas wants the escape room for the board. Harder. More dragons. And a yacht.", 'Continue to Chapter 6'],
  6:['Docked · Chapter 6 complete', 'The end. Really.', "You escaped five rooms and one yacht at Reynholm Industries. Thank you for playing! On Monday, it all starts again at 12:58.", '']
};
function showWin(){
  if(S.ch===1) setUnlocked2();
  if(S.ch===2) setUnlocked3();
  if(S.ch===3) setUnlocked4();
  if(S.ch===4) setUnlocked5();
  if(S.ch===5) setUnlocked6();
  const [eb, ti, note, next] = CH_END[S.ch] || CH_END[1];
  $('#w-eyebrow').textContent = eb;
  $('#w-title').innerHTML = ti + '<span class="cursor">_</span>';
  $('#w-note').textContent = note;
  $('#btn-next').hidden = !next; $('#btn-next').textContent = next;
  $('#w-time').textContent = fmt(S.t); $('#w-hints').textContent = S.hints;
  $('#w-rank').textContent = S.hints===0 ? 'Elite' : S.hints<=2 ? 'Senior dev' : S.hints<=5 ? 'Junior dev' : 'Roy';
  $('#w-ach').innerHTML = ACH.map(([k,l]) => `<span class="${S.ach[k]?'got':''}">${S.ach[k]?'✓ ':''}${l}</span>`).join('');
  $('#win').hidden = false;
}


$('#btn-hint').onclick = () => {
  if(!$('#title').hidden || chapterDone()) return;
  const st = stage_(); const lv = S.hl[st] || 0; const arr = HINTS[st];
  S.hints++; S.hl[st] = lv + 1; save(); applyVisuals();
  say([['sys', (lv>=arr.length-1 ? 'Big hint: ' : 'Hint: ') + arr[Math.min(lv, arr.length-1)]]]);
};
const rev = $('#btn-reveal');
rev.onclick = () => { stage.classList.add('reveal'); setTimeout(()=>stage.classList.remove('reveal'), 1600); };
document.addEventListener('keydown', e => {
  if(e.key==='Escape') closeModal();
  if(e.code==='Space' && $('#modal').hidden && document.activeElement && !/INPUT|BUTTON/.test(document.activeElement.tagName) && !document.activeElement.classList.contains('hit')){ e.preventDefault(); stage.classList.add('reveal'); }
});
document.addEventListener('keyup', e => { if(e.code==='Space') stage.classList.remove('reveal'); });
$('#btn-sound').textContent = soundOn ? 'Sound on' : 'Sound off';
$('#btn-sound').onclick = () => { soundOn = !soundOn; $('#btn-sound').textContent = soundOn ? 'Sound on' : 'Sound off';
  try{ localStorage.setItem(KEY + '-sound', soundOn ? '1' : '0'); }catch(e){}
  ambUpdate(); };

/* ---------- timer ---------- */
const fmt = s => String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
setInterval(() => { if(S.started && !chapterDone() && $('#title').hidden && document.visibilityState==='visible'){ S.t++; $('#timer').textContent = fmt(S.t); if(S.t%5===0) save(); } }, 1000);

/* ---------- flow ---------- */
const ACH = [['internet','Touched the Internet'],['sandwich','sudo make me a sandwich'],['duck','Rubber-duck debugger'],['rmrf','Tried rm -rf'],['fbi','Tried to join the FBI van'],['honest',"Read Jen's honest CV"],['explorer','Ended explorer.exe'],['bobby','Little Bobby Tables'],['golf','Hole in one'],['roy',"Let Roy say his line"],['hanoi','Tower in 15 moves'],['bubble','Bubble sort champion'],['teapot',"418 I'm a teapot"],['tr','Decoded with tr']];
function win(){
  say([["sys","The lock clunks. The door swings open onto the stairwell."],["moss","You did it! You're out! And with 1337 as well. That's literally elite."],["moss","Now, could you come and get me out of the stationery cupboard? …Hello?"]], () => {
    $('#w-time').textContent = fmt(S.t); $('#w-hints').textContent = S.hints;
    $('#w-rank').textContent = S.hints===0 ? 'Elite' : S.hints<=2 ? 'Senior dev' : S.hints<=5 ? 'Junior dev' : 'Roy';
    $('#w-ach').innerHTML = ACH.map(([k,l]) => `<span class="${S.ach[k]?'got':''}">${S.ach[k]?'✓ ':''}${l}</span>`).join('');
    showWin();
  });
}
function intro(){
  say([["sys","Reynholm Industries. The basement. 12:58 on a Monday."],
       ["you","First day as the IT temp. Roy's at lunch. Moss is… somewhere."],
       ["moss","Hello? Is this thing on? It's Moss. I'm upstairs. In the stationery cupboard. Don't ask."],
       ["moss","There was a small fire. Toast-related. My Lockdown Protocol has sealed the basement, which is good, because it means it works."],
       ["moss","And bad, because you're in it. The exit override PIN is somewhere in the system. Have a click around. Carefully. And please don't touch the Internet."],
       ["you","…The Internet?"]]);
}
function startNew(){ S = Object.assign(fresh(), { ach: S.ach || {} }); S.started = true; termBuf = []; sel = null; $('#title').hidden = true; $('#win').hidden = true; renderInv(); applyVisuals(); $('#timer').textContent = '00:00'; save(); intro(); }
function cont(){ $('#title').hidden = true; S.started = true; renderInv(); applyVisuals(); $('#timer').textContent = fmt(S.t);
  say([["sys", S.scene==='yacht' ? "Back on the Douglas II. Roy is still holding the bucket." : S.scene==='dungeon' ? "Back in the dungeon. The dragon is still made of cardboard." : S.scene==='lift' ? "Back in the lift. The pan-pipes haven't stopped." : S.scene==='doug' ? "Back on the top floor. Douglas raises his whisky at you." : S.scene==='jen' ? "Back in Jen's office. The SmartLock blinks at you." : S.scene==='server' ? "Back in the server room. Still cold. Still humming." : "Back in the basement. The clock still says 12:58."]]); }
$('#btn-new').onclick = startNew;
$('#btn-cont').onclick = () => chapterDone() ? nextChapter() : cont();
$('#btn-again').onclick = startNew;
$('#btn-stay').onclick = () => { $('#win').hidden = true; exitLabels();
  say(['sys', S.ch < 6 ? `Take your time. When you're ready, use the way out to go on to Chapter ${S.ch + 1}.` : "Take your time. The pier isn't going anywhere, and neither is Roy."]); };
$('#btn-next').onclick = () => S.ch===1 ? startCh2() : S.ch===2 ? startCh3() : S.ch===3 ? startCh4() : S.ch===4 ? startCh5() : startCh6();
$('#btn-ch6').onclick = startCh6;
$('#btn-ch1').onclick = startNew;
$('#btn-ch5').onclick = startCh5;
$('#btn-ch4').onclick = startCh4;
$('#btn-ch3').onclick = startCh3;
$('#btn-ch2').onclick = startCh2;
$('#btn-menu').onclick = () => { closeModal(); $('#dialog').hidden = true; queue = []; $('#title').hidden = false; $('#win').hidden = true; refreshMenu(); };

const ROT_LINES = [
  "This basement is wider than your phone. Roy says: turn it sideways. Moss says: exactly 90 degrees, please, not 89.",
  "Error 0x5A: SCREEN_TOO_TALL. Rotate your phone to continue. Or swipe, like an animal.",
  "Jen read that phones work better sideways. She's holding hers sideways right now. Upside down, but still.",
  "Douglas turned his phone sideways once and saw a yacht. Your results may vary."
];
function setupRotate(){
  const r = $('#rotate'); let off = false;
  try{ off = localStorage.getItem(KEY + '-norotate') === '1'; }catch(e){}
  r.hidden = off;
  $('#rot-line').textContent = ROT_LINES[Math.floor(Math.random() * ROT_LINES.length)];
  $('#rot-x').onclick = () => { r.hidden = true; beep(500,.04); try{ localStorage.setItem(KEY + '-norotate','1'); }catch(e){} };
}
const MOTION_NEXT = { auto: 'on', on: 'off', off: 'auto' };
$('#btn-motion').onclick = () => {
  motionPref = MOTION_NEXT[motionPref] || 'auto';
  try{ localStorage.setItem(KEY + '-motion', motionPref); }catch(e){}
  applyMotion();
  say([['sys', motionPref === 'on' ? 'Motion on: feet, boats and dragons move, even if your device asks for less motion.'
             : motionPref === 'off' ? 'Motion off: everything stands still. Even Douglas. Especially Douglas.'
             : `Motion auto: following your device's setting, which is ${deviceReducesMotion() ? '"reduce motion", so things stand still' : 'full motion'}.`]]);
};
matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', applyMotion);

function start(data){
  setupRotate();
  applyMotion();
  buildDecor(); buildDecor3(); buildDecor4();
  const saved = (data && data.v===1) ? data : load();
  if(saved){ S = Object.assign(fresh(), saved); }
  refreshMenu();
  renderInv(); applyVisuals(); $('#timer').textContent = fmt(S.t);
}
/* ---------- installable app (PWA) ---------- */
if('serviceWorker' in navigator && document.querySelector('link[rel="manifest"]') && /^https?:$/.test(location.protocol)){
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('#btn-install').hidden = false; });
window.addEventListener('appinstalled', () => { installEvt = null; $('#btn-install').hidden = true; say(['moss', "Installed! The game now lives on your device. Like a very small, very nerdy lodger."]); });
$('#btn-install').onclick = async () => { if(!installEvt) return; installEvt.prompt(); try{ await installEvt.userChoice; }catch(e){} installEvt = null; $('#btn-install').hidden = true; };

window.claude?.hot?.snapshot?.(() => S);
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? null);
