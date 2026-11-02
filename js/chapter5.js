// Chapter 5: Dungeons & Datacenters.
// Loaded in order by js/boot.js; all game files share the same global scope.

/* ================= CHAPTER 5: DUNGEONS & DATACENTERS ================= */
const UNLOCK5 = KEY + '-ch5';
let ch5Open = false;
function unlocked5(){ if(ch5Open || S.ch>=5 || (S.ch===4 && S.f.out4)) return true; try{ return localStorage.getItem(UNLOCK5)==='1'; }catch(e){ return false; } }
function setUnlocked5(){ ch5Open = true; try{ localStorage.setItem(UNLOCK5,'1'); }catch(e){} }

const DRV = [['5 GB','#c8262c'],['20 GB','#e8590c'],['80 GB','#1971c2'],['250 GB','#2b8a3e']];
const POTIONS = { 1:['B','#5f3dc4'], 3:['A','#1971c2'], 5:['T','#0b7285'], 8:['T','#2b8a3e'], 13:['E','#e8590c'], 21:['R','#c8262c'], 42:['Y','#ae3ec9'] };
const POTION_START = [8,3,42,1,13,21,5];
function drawDungeon(){
  // hanoi on the table
  const hs = S.hanoi || [[3,2,1,0],[],[]]; let h = '';
  [770,855,940].forEach((x,p) => { h += `<rect x="${x-3}" y="520" width="6" height="84" fill="#9aa3a8"/>`;
    hs[p].forEach((d,i) => { const w = 26 + d*14; h += `<rect x="${x-w/2}" y="${592 - i*12}" width="${w}" height="11" rx="2" fill="${DRV[d][1]}" stroke="#222"/>`; }); });
  $('#hanoi-mini').innerHTML = h;
  // potions on the shelf
  const ps = S.potions || POTION_START; let q = '';
  ps.forEach((n,i) => { const x = 384 + i*26, c = POTIONS[n][1]; q += `<rect x="${x+4}" y="${304}" width="6" height="8" fill="#c9a24a"/><rect x="${x}" y="${312}" width="14" height="46" rx="5" fill="${c}"/><text x="${x+7}" y="${352}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7" fill="#fff">${n}</text>`; });
  $('#potions-mini').innerHTML = q;
}

Object.assign(H, {
  firewall(){ if(S.f.out5) return startCh6(); say(["THE FIREWALL. Cardboard bricks, paper flames and a very real lock.", "Moss, over the walkie-talkie: 'The Firewall only opens when its admin panel gets a new, secure password. The admin panel is guarded by the dragon. Obviously.'"]); },
  fwadmin(){ if(!S.f.dragon) return say(["The Firewall admin panel. The screen says: LOCKED BY DRAGON.", "Moss: 'Defeat the dragon first. Intellectually. Please don't actually hit it.'"]); openFirewall(); },
  gmposter(){ say(["A hand-painted poster: MOSS THE MAGNIFICENT, GAME MASTER. Underneath, the rules:", "1. No phones. 2. Do not touch the dragon's tail. 3. Roy, that means you. 4. Have fun (this is compulsory)."]); },
  potions(){ openPotions(); },
  dragon(){ if(!S.f.dragonOn) return say(["A large cardboard dragon, held together with parcel tape and ambition. It isn't moving.", "A label on its belly: SMAUG-O-TRON 3000. REQUIRES 4 × AA BATTERIES (NOT INCLUDED)."]); openDragon(); },
  hanoi(){ openHanoi(); },
  scroll(){ openRegexScroll(); },
  cabinet(){ if(!S.f.cabinet) return openRunes(); if(!S.f.usbIn) return say(["The rune cabinet is open. Inside, on a lectern, sits the Wizard's laptop.", "Its screen says: INSERT SPELL (USB)."]); openSpell(); },
  jen5(){ openTalkTo('Jen', 'Relationship Manager · team builder', JEN_TALK, '"Isn\'t this fun? Team building! I\'m building the team. You\'re doing the puzzles."'); },
  roy5(){ openTalkTo('Roy', 'Reluctant adventurer', ROY5_TALK, '"I want you to know I am here against my will."'); },
  walkie(){ openTalkTo('Moss (walkie-talkie)', 'Game Master · watching on the webcam', MOSS_TALK, '"Moss the Magnificent here. Over."'); },
  barrel(){ say("A barrel. Inside: Moss's spare cape, a bag of crisps and a laminated sign that says 'BARREL'."); },
  chest(){ if(S.f.chest) return say("The chest is open: chocolate coins, a plastic sword and a large, empty space where Moss's dragon manual was."); openChest(); },
  webcam(){ say("A webcam with a red light. Moss is watching you all from his desk. You can hear his cape rustle when he leans in."); },
  torch(){ say("A battery-powered 'flaming' torch. After the toast incident, health and safety insisted."); }
});
const JEN_TALK = [
  ["Whose idea was this?", () => "Mine! Team building. We escape a room together and we bond. I read about it in a magazine. At the dentist's."],
  ["Can you help with the puzzles?", () => "Absolutely. I'm a people person. I'll do the people bits. Are there any people bits?"],
  ["What's a regex?", () => "Is it a dinosaur? It sounds like a dinosaur. A big one. With small arms."],
  ["What password should we use?", () => "password1. It's easy to remember. That's the whole point of passwords, isn't it?"],
  ["Why are you wearing heels in a dungeon?", () => "These are my dungeon shoes."]
];
const ROY5_TALK = [
  ["Are you enjoying team building?", () => "I've been locked in a cupboard with a cardboard dragon by a man who owns a cape. No. I am not."],
  ["Any tips for the Tower of Hard Drives?", () => "Moss explained it once. Move the smallest one every other turn, always in the same direction. Then make the only other move you can. Then I fell asleep."],
  ["How do you guess a number quickly?", () => "Go for the middle. Fifty. Then the middle of whatever's left. Moss calls it binary search. I call it common sense."],
  ["What's bubble sort?", () => "You compare two neighbours and swap them if they're the wrong way round. Over and over. Like Moss explaining things."]
];
const MOSS_TALK = [
  ["What is this place?", () => "Welcome to DUNGEONS & DATACENTERS! My escape room. I built it for Jen's team building. Well, I built it for me. Jen just asked."],
  ["Is the dragon safe?", () => "Perfectly safe. It's cardboard, four AA batteries and a tiny computer. Don't touch its tail; that's where the computer is."],
  ["Why are you worried?", () => "I may have made it slightly too difficult. The first version of the Tower had sixty-four hard drives. The monks would have been proud."],
  ["How long do we have?", () => "Sixty minutes. Or until Jen gets hungry. Whichever comes first."],
  ["Can we have a hint?", () => "Hints cost one Moss Point. You have zero Moss Points. Try the Hint button, or the duck. The duck is very wise."]
];

/* --- 1. the Tower of Hard Drives (recursion) --- */
function openHanoi(){
  if(!S.hanoi) S.hanoi = [[3,2,1,0],[],[]];
  if(S.hmoves == null) S.hmoves = 0;
  let pick = null;
  openModal('The Tower of Hard Drives', 'Move the whole stack to the right-hand peg', `<div class="metal" style="padding:12px"><svg id="hsvg" viewBox="0 0 600 240" style="width:100%;height:auto;display:block" role="img" aria-label="Three pegs with hard drives"></svg></div>
    <div class="feedback" id="hfb">Tap a peg to pick up its top drive, then tap another peg to put it down. Never put a bigger drive on a smaller one.</div>
    <div style="display:flex;gap:8px;align-items:center;margin-top:8px"><button class="btn ghost" type="button" id="hreset">Start again</button><span class="tray-label" id="hmoves"></span></div>`, () => {
    const f = (t, c='') => { const e = $('#hfb'); if(e){ e.className = 'feedback ' + c; e.textContent = t; } };
    const draw = () => { const svg = $('#hsvg'); if(!svg) return;
      let h = `<rect x="20" y="212" width="560" height="14" rx="3" fill="#6b4a2e"/>`;
      [100,300,500].forEach((x,p) => {
        h += `<rect x="${x-5}" y="60" width="10" height="154" rx="4" fill="#9aa3a8"/><text x="${x}" y="50" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#cfd3d6">${['START','','GOAL'][p]}</text>`;
        S.hanoi[p].forEach((d,i) => { const w = 60 + d*36, y = 188 - i*26, lift = (pick===p && i===S.hanoi[p].length-1) ? -16 : 0;
          h += `<g transform="translate(0 ${lift})"><rect x="${x-w/2}" y="${y}" width="${w}" height="24" rx="4" fill="${DRV[d][1]}" stroke="#111"/><text x="${x}" y="${y+16}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#fff">${DRV[d][0]}</text></g>`; });
        h += `<rect class="peg" data-p="${p}" x="${x-98}" y="30" width="196" height="200" fill="${pick===p ? 'rgba(240,165,58,.14)' : 'transparent'}" style="cursor:pointer"/>`;
      });
      svg.innerHTML = h; $('#hmoves').textContent = `Moves: ${S.hmoves}`;
      svg.querySelectorAll('.peg').forEach(r => r.onclick = () => tap(+r.dataset.p));
    };
    const tap = p => {
      if(S.f.hanoi) return;
      if(pick===null){ if(!S.hanoi[p].length) return f('That peg is empty.'); pick = p; beep(500,.03); return draw(); }
      if(p===pick){ pick = null; return draw(); }
      const from = S.hanoi[pick], to = S.hanoi[p], d = from[from.length-1], top = to[to.length-1];
      if(top !== undefined && top < d){ nope(); f("You can't put a bigger drive on a smaller one. Over the walkie-talkie, Moss gasps.", 'bad'); pick = null; return draw(); }
      to.push(from.pop()); S.hmoves++; pick = null; beep(700,.03); f(''); save(); drawDungeon(); draw();
      if(S.hanoi[2].length===4){ S.f.hanoi = true; if(S.hmoves<=15) S.ach.hanoi = true; save(); give('usb'); chord([523,659,784,1046]);
        f(`Done in ${S.hmoves} moves${S.hmoves<=15 ? ' (the minimum possible!)' : ' (15 is the minimum)'}. The 250 GB drive pops open: inside is a USB stick labelled SPELL.JS. You take it.`, 'good');
        setTimeout(()=>{ closeModal(); say([['moss',"The Tower of Hard Drives! Solved! The trick is recursion: to move four drives, you move three, then one, then three again. And to move three…"],['roy',"We get it, Moss."]]); }, 1800); }
    };
    $('#hreset').onclick = () => { if(S.f.hanoi) return; S.hanoi = [[3,2,1,0],[],[]]; S.hmoves = 0; pick = null; save(); drawDungeon(); draw(); f('Back to the start.'); };
    if(S.f.hanoi) f('Solved. The drives are back in order, and very pleased with themselves.', 'good');
    draw();
  });
}

/* --- 2. the rune cabinet (regular expressions) --- */
const RUNE_WORDS = ['Roy','Moss','Jen','Rose','Mo','Douglas','Robot'];
const RUNE_RE = /^[RM]o\w{1,2}$/;
function openRegexScroll(){
  openModal('Regex for Wizards', 'A scroll in Moss\'s handwriting', `<div class="parch"><h4>Regex for Wizards</h4>
    <p style="margin:0 0 10px">A regular expression is a pattern that a word must fit, letter by letter.</p>
    <dl><dt>^</dt><dd>the start of the word</dd><dt>$</dt><dd>the end of the word</dd><dt>[RM]</dt><dd>one letter: either R or M</dd><dt>o</dt><dd>just the letter o</dd><dt>\\w</dt><dd>any single letter or digit</dd><dt>{1,2}</dt><dd>the thing before it, one or two times</dd></dl>
    <p style="margin:12px 0 0">Example: <b>^Ca\\w$</b> matches <i>Cat</i> and <i>Cab</i>, but not <i>Cart</i> (too long) or <i>Bat</i> (wrong start).</p></div>`);
}
function openRunes(){
  const picked = new Set();
  openModal('The Rune Cabinet', 'Select every name the pattern matches, then cast', `<div class="regex">/^[RM]o\\w{1,2}$/</div>
    <div class="runes">${RUNE_WORDS.map(w => `<button type="button" class="rune" data-w="${w}" aria-pressed="false">${w}</button>`).join('')}</div>
    <div style="display:flex;justify-content:center"><button class="btn" type="button" id="cast">Cast</button></div><div class="feedback" id="rfb" style="text-align:center">The scroll on the wall explains the symbols.</div>`, body => {
    body.querySelectorAll('.rune').forEach(b => b.onclick = () => { const w = b.dataset.w; picked.has(w) ? picked.delete(w) : picked.add(w); b.classList.toggle('on', picked.has(w)); b.setAttribute('aria-pressed', picked.has(w)); beep(600,.03); });
    $('#cast').onclick = () => { const f = $('#rfb'); const want = RUNE_WORDS.filter(w => RUNE_RE.test(w));
      const ok = want.length===picked.size && want.every(w => picked.has(w));
      if(ok){ S.f.cabinet = true; save(); applyVisuals(); chord([523,659,784,1046]); f.className = 'feedback good'; f.textContent = 'The runes glow. The cabinet doors swing open, revealing the Wizard\'s laptop.';
        setTimeout(()=>{ closeModal(); say([['jen',"What happened? Did I do that? I think I did that."],['roy',"You did not do that."]]); }, 1400); return; }
      nope(); f.className = 'feedback bad';
      const wrong = [...picked].find(w => !RUNE_RE.test(w));
      f.textContent = wrong==='Mo' ? "Mo is too short: \\w{1,2} needs at least one more letter after the o." : wrong==='Robot' ? "Robot is too long: after 'Ro' it has three letters, and {1,2} allows only one or two." : wrong==='Jen' ? "Jen doesn't start with R or M. Also, she's not IT. She'd like everyone to stop saying that." : wrong==='Douglas' ? "Douglas starts with D. The runes are unimpressed." : `The runes flicker. ${want.filter(w => !picked.has(w)).length ? 'You missed at least one match.' : 'Something is off.'}`;
    };
  });
}

/* --- 3. the wizard's laptop (debugging) --- */
const LOOPS = ['for (let i = 1; i <= runes.length; i++) {','for (let i = 0; i <= runes.length; i++) {','for (let i = 1; i < runes.length; i++) {','for (let i = 0; i < runes.length; i++) {'];
function castSpell(k){ const runes = [3,1,4,1,5]; let out = ''; const start = (k===1 || k===3) ? 0 : 1, le = k < 2;
  for(let i = start; le ? i <= runes.length : i < runes.length; i++) out += (runes[i]===undefined ? NaN : runes[i]*2); return out; }
function openSpell(){
  const k0 = S.loopSel ?? 0;
  openModal("The Wizard's laptop", 'spell.js · by Moss the Magnificent', `<div class="code5">
      <div class="cm">// Spell of Opening. Doubles every rune.</div>
      <div>let runes = [3, 1, 4, 1, 5];</div><div>let code = "";</div>
      <div><select id="loopsel" aria-label="Loop line">${LOOPS.map((l,i)=>`<option value="${i}" ${i===k0 ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div>  code = code + runes[i] * 2;</div><div>}</div><div>summon(code);</div></div>
    <div style="display:flex;gap:8px;margin-top:10px;align-items:center;flex-wrap:wrap"><button class="btn" type="button" id="runsp">Run spell ▶</button><span class="tray-label">Tip: the dashed line can be changed.</span></div>
    <div class="out5" id="sout">${S.f.spell ? '✨ ' + castSpell(3) + ' ✨' : ''}</div><div class="feedback" id="sfb"></div>`, () => {
    $('#loopsel').onchange = e => { S.loopSel = +e.target.value; save(); };
    $('#runsp').onclick = () => { const k = +$('#loopsel').value, out = castSpell(k), f = $('#sfb'); beep(900,.05);
      $('#sout').textContent = '> summon("' + out + '")';
      if(out.includes('NaN')){ nope(); f.className = 'feedback bad'; f.textContent = "The spell summons a NaN: a small, confused grey goat. It is Not a Number. The loop ran one step past the end of the list."; return; }
      if(k===2){ nope(); f.className = 'feedback bad'; f.textContent = "Only five digits. The first rune (3) was skipped: in JavaScript, lists start counting at 0, not 1."; return; }
      S.f.spell = true; save(); chord([523,659,784,1046]); $('#sout').textContent = '✨ ' + out + ' ✨'; f.className = 'feedback good';
      f.textContent = "The spell works! The laptop shows 628210 in sparkly letters. Six digits. That looks like a chest code.";
    };
  });
}

/* --- the treasure chest --- */
function openChest(){
  openModal('Treasure chest', 'A six-digit brass combination lock', `<form class="dial" id="chf"><label for="chin">Combination</label><input id="chin" inputmode="numeric" maxlength="6" autocomplete="off" style="width:150px"><button class="btn" type="submit">Open</button></form><div class="feedback" id="chfb"></div>`, () => {
    setTimeout(()=>$('#chin') && $('#chin').focus(), 50);
    $('#chf').onsubmit = e => { e.preventDefault(); const v = $('#chin').value.trim(), f = $('#chfb');
      if(v==='628210'){ S.f.chest = true; save(); applyVisuals(); chord([392,523,659,784]); f.className = 'feedback good'; f.textContent = 'The lid creaks open.';
        setTimeout(()=>{ closeModal(); say([["sys","Inside: chocolate coins, a plastic sword, and a booklet: THE DRAGON MANUAL, by Moss."],["sys","'SMAUG-O-TRON 3000 runs on 4 AA batteries. The batteries are in the secret compartment of the potion shelf. It opens when the potions are sorted from smallest to largest. You may only swap two neighbouring potions. This is called bubble sort. It is educational.'"],["roy","Of course it is."]]); }, 900); return; }
      nope(); f.className = 'feedback bad'; f.textContent = v.includes('NaN') || /[a-z]/i.test(v) ? "The lock only has digits. No goats." : 'The lock stays shut.'; };
  });
}

/* --- 4. the potion shelf (bubble sort) --- */
function openPotions(){
  if(!S.potions) S.potions = [...POTION_START];
  if(S.swaps == null) S.swaps = 0;
  openModal('The potion shelf', 'Sort from smallest to largest, swapping neighbours only', `<div class="bottles" id="bots"></div><div class="feedback" id="pofb"></div><div class="tray-label" id="poswaps" style="margin-top:6px"></div>`, () => {
    const f = (t,c='') => { const e = $('#pofb'); if(e){ e.className = 'feedback ' + c; e.textContent = t; } };
    const draw = () => { const b = $('#bots'); if(!b) return;
      b.innerHTML = S.potions.map((n,i) => `<div class="bottle"><div class="cork"></div><div class="glass" style="background:${POTIONS[n][1]}">${n}</div><div class="lt">${POTIONS[n][0]}</div></div>` + (i < S.potions.length-1 ? `<button type="button" class="swapb" data-i="${i}" aria-label="Swap ${n} and ${S.potions[i+1]}" ${S.f.sorted ? 'disabled' : ''}>⇄</button>` : '')).join('');
      $('#poswaps').textContent = `Swaps: ${S.swaps}`;
      b.querySelectorAll('.swapb').forEach(s => s.onclick = () => { const i = +s.dataset.i, a = S.potions;
        if(a[i] < a[i+1]){ f("Those two are already in order. Swapping them would only make things worse. Moss would be disappointed. Quietly."); nope(); return; }
        [a[i], a[i+1]] = [a[i+1], a[i]]; S.swaps++; beep(600,.04); save(); drawDungeon(); draw(); f('');
        if(a.every((v,j) => j===0 || a[j-1] < v)){ S.f.sorted = true; if(S.swaps<=10) S.ach.bubble = true; save(); give('batteries'); applyVisuals(); chord([523,659,784,1046]);
          f(`Sorted in ${S.swaps} swaps. The labels spell BATTERY, and the secret compartment clicks open: four AA batteries. You take them.`, 'good');
          setTimeout(()=>{ closeModal(); say([['moss',"Bubble sort! Slow, but honest. Like me."]]); }, 1800); }
      }); };
    if(S.f.sorted) f('Sorted. B-A-T-T-E-R-Y. The compartment is empty now.', 'good');
    draw();
  });
}

/* --- 5. the dragon (binary search) --- */
function newDragonNumber(){ S.dnum = 1 + Math.floor(Math.random()*100); S.dg = []; save(); }
function openDragon(){
  if(S.f.dragon) return say("SMAUG-O-TRON 3000 is purring quietly. Well, whirring. It respects you now.");
  if(!S.dnum) newDragonNumber();
  openModal('SMAUG-O-TRON 3000', 'A cardboard dragon with a very small computer in its tail', `<div class="dragonbox"><div class="dsay" id="dsay">I AM THINKING OF A NUMBER FROM 1 TO 100. YOU HAVE 7 GUESSES, PUNY HUMAN.</div>
    <form class="dial" id="dgf" style="margin-top:0"><label for="dgin">Your guess</label><input id="dgin" inputmode="numeric" maxlength="3" autocomplete="off"><button class="btn" type="submit">Guess</button></form>
    <div class="dhist" id="dhist"></div></div><div class="feedback" id="dgfb"></div>`, () => {
    const hist = () => { $('#dhist').innerHTML = S.dg.map(([g,r]) => `<span>${g} ${r}</span>`).join('') + `<span>${7 - S.dg.length} left</span>`; };
    hist(); setTimeout(()=>$('#dgin') && $('#dgin').focus(), 50);
    $('#dgf').onsubmit = e => { e.preventDefault(); const g = parseInt($('#dgin').value, 10); $('#dgin').value = ''; const say2 = t => $('#dsay').textContent = t;
      if(!(g>=1 && g<=100)) return say2('A NUMBER FROM 1 TO 100. I AM A DRAGON, NOT A CALCULATOR.');
      if(g===S.dnum){ S.f.dragon = true; save(); applyVisuals(); chord([523,659,784,1046,1318],110); say2(`${g}! NOOO! YOU HAVE DEFEATED ME. THE FIREWALL ADMIN PANEL IS NOW UNLOCKED.`);
        $('#dgfb').className = 'feedback good'; $('#dgfb').textContent = `Found in ${S.dg.length+1} guesses.`;
        setTimeout(()=>{ closeModal(); say([['moss',"Binary search! Always guess the middle. Seven guesses are enough for 100 numbers, because 2 × 2 × 2 × 2 × 2 × 2 × 2 is 128."],['jen',"I knew it was the middle one. I was just about to say."]]); }, 1700); return; }
      S.dg.push([g, g < S.dnum ? '↑' : '↓']); save(); beep(g < S.dnum ? 700 : 400, .08);
      if(S.dg.length >= 7){ const was = S.dnum; newDragonNumber(); nope(); say2(`HA! IT WAS ${was}. I HAVE CHOSEN A NEW NUMBER. TRY AGAIN, PUNY HUMAN.`); $('#dgfb').textContent = 'Tip from Roy: always go for the middle of what is left.'; hist(); return; }
      say2(g < S.dnum ? `HIGHER! (${7 - S.dg.length} GUESSES LEFT)` : `LOWER! (${7 - S.dg.length} GUESSES LEFT)`); hist();
    };
  });
}

/* --- 6. the Firewall (password rules) --- */
const RULES = [
  ['At least 8 characters.', v => v.length >= 8],
  ['Include a number.', v => /\d/.test(v)],
  ['Include a capital letter.', v => /[A-Z]/.test(v)],
  ['Include a special character, like ! # or ?', v => /[^A-Za-z0-9]/.test(v)],
  ['The digits must add up to 13. (In honour of ROT13.)', v => (v.match(/\d/g) || []).reduce((s,d) => s + +d, 0) === 13],
  ['Include the name of someone in the IT department.', v => /roy|moss/i.test(v)],
  ['Must not contain the word "password". Sorry, Jen.', v => !/password/i.test(v)]
];
function openFirewall(){
  if(S.f.out5) return say("The Firewall is down.");
  openModal('Firewall admin panel', 'Set a new secure password to lower the Firewall', `<label class="tray-label" for="pwin5">New password</label><input class="pwin" id="pwin5" autocomplete="off" autocapitalize="off" spellcheck="false" value="${S.f.jenTyped ? '' : 'password1'}">
    <div class="rules" id="rules"></div><div style="margin-top:10px"><button class="btn" type="button" id="pwset" disabled>Set password</button></div><div class="feedback" id="pwfb"></div>`, () => {
    if(!S.f.jenTyped){ S.f.jenTyped = true; save(); $('#pwfb').textContent = 'Jen leans over and types "password1" before you can stop her.'; }
    const check = () => { const v = $('#pwin5').value; let html = '', all = true;
      for(const [txt, fn] of RULES){ const ok = fn(v);
        const extra = (txt.startsWith('Include the name') && !ok && /jen/i.test(v)) ? '<small>Jen is the Relationship Manager. She is not in the IT department. She has asked everyone to stop pointing this out.</small>' : '';
        html += `<div class="rule ${ok ? 'ok' : ''}"><b>${ok ? '✓' : '✗'}</b><span>${txt}${extra}</span></div>`;
        if(!ok){ all = false; break; } }
      $('#rules').innerHTML = html; $('#pwset').disabled = !all; return all; };
    $('#pwin5').oninput = check; check();
    $('#pwset').onclick = () => { if(!check()) return; S.f.out5 = true; save(); applyVisuals(); chord([523,659,784,1046,1318],120);
      $('#pwfb').className = 'feedback good'; $('#pwfb').textContent = 'PASSWORD ACCEPTED. LOWERING FIREWALL…'; setTimeout(()=>{ closeModal(); win5(); }, 1300); };
  });
}

/* --- chapter 5 flow --- */
function intro5(){
  say([["sys","Basement, 16:30. You're admiring Moss's laminated certificate when Jen claps her hands."],
       ["jen","Right! I've had an idea. Team building! An escape room! We escape a room together, as a team!"],
       ["roy","We? They've escaped four rooms today. On their own. I was at lunch for most of it."],
       ["jen","Exactly, so they can carry us. Moss has built one in the old storeroom. In you go!"],
       ["sys","The storeroom door slams shut behind the three of you. Someone has painted it to look like a castle. A walkie-talkie crackles."],
       ["moss","Welcome, adventurers, to DUNGEONS & DATACENTERS. I am your Game Master, Moss the Magnificent. To escape, you must lower the Firewall."],
       ["moss","I should mention that I'm a little worried. I may have made it slightly too hard."],
       ["you","Locked in. Fifth time today. This time on purpose."]]);
}
function startCh5(){
  S = Object.assign(fresh(), { ach: S.ach || {} }); S.ch = 5; S.scene = 'dungeon'; S.started = true; S.inv = ['duck']; S.f.duckTaken = true;
  sel = null; setUnlocked5(); closeModal();
  $('#title').hidden = true; $('#win').hidden = true; renderInv(); applyVisuals(); $('#timer').textContent = '00:00'; save(); intro5();
}
function win5(){
  say([["sys","The Firewall's paper flames flop over. The castle door swings open onto the basement corridor."],
       ["moss","You did it! Escape time: " + fmt(S.t) + ". That's a new record. It's also the only record."],
       ["jen","Team building complete! I feel so much closer to all of you."],
       ["roy","I feel closer to the door."],
       ["douglas","I say! Is this the famous escape room? I'd like to book it for the board. Can you make it harder? More dragons. And a yacht."],
       ["moss","…I'm going to need a lot more cardboard."]], () => showWin());
}
