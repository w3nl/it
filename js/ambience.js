// Ambient sound: a quiet, generated soundscape for each room, made with the Web Audio API (no audio files).
// Follows the Sound button, pauses on the title screen and when the tab is hidden, and changes with the story
// (the bin fire, the Privacy Mode alarm, the yacht's engine…). ambKey() decides what should be playing.

const AMB = { cur: null, master: null, nodes: [], timers: [] };
let noiseBuf = null;

function audioCtx(){ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); return ac; }

/* What should be playing right now, as a key like 'server+on+fire'. null means silence. */
function ambKey(){
  if(!soundOn || !S.started || !$('#title').hidden || document.visibilityState !== 'visible') return null;
  const f = S.f;
  switch(S.scene){
    case 'office':  return 'office';
    case 'server':  return 'server' + (f.power ? '+on' : '') + (f.fireOut ? '' : '+fire');
    case 'jen':     return 'jen';
    case 'doug':    return 'doug' + (f.out3 ? '' : '+alarm');
    case 'lift':    return 'lift';
    case 'dungeon': return 'dungeon';
    case 'yacht':   return 'yacht' + (f.engine && !f.docked ? '+engine' : '');
  }
  return null;
}

function ambUpdate(){
  let want = null;
  try{ want = ambKey(); }catch(e){}
  if(want === AMB.cur) return;
  ambStop();
  AMB.cur = want;
  if(want){ try{ ambStart(want); }catch(e){ AMB.cur = null; } }
}

function ambStop(){
  AMB.timers.forEach(clearTimeout); AMB.timers = [];
  const m = AMB.master, nodes = AMB.nodes;
  AMB.master = null; AMB.nodes = [];
  if(!m || !ac) return;
  m.gain.cancelScheduledValues(ac.currentTime);
  m.gain.setTargetAtTime(0, ac.currentTime, .25);
  setTimeout(() => { nodes.forEach(n => { try{ n.stop && n.stop(); }catch(e){} try{ n.disconnect(); }catch(e){} }); try{ m.disconnect(); }catch(e){} }, 1500);
}

function ambStart(key){
  const ctx = audioCtx();
  if(ctx.state === 'suspended') ctx.resume().catch(() => {});
  const m = ctx.createGain();
  m.gain.value = 0; m.connect(ctx.destination); m.gain.setTargetAtTime(.9, ctx.currentTime, .8);
  AMB.master = m;
  const [scene, ...mods] = key.split('+');
  SOUNDSCAPES[scene](m, mods);
}

/* ---------- building blocks ---------- */
const keep = n => (AMB.nodes.push(n), n);

function noiseBuffer(){
  if(noiseBuf) return noiseBuf;
  const ctx = audioCtx(), b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0);
  for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf = b;
}

/* A steady bed of filtered noise (fans, wind, water). wobble makes it swell slowly. */
function bed(out, { type = 'lowpass', freq = 500, q = .7, gain = .02, wobble = 0, rate = .2 } = {}){
  const src = keep(ac.createBufferSource()); src.buffer = noiseBuffer(); src.loop = true;
  const f = keep(ac.createBiquadFilter()); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = keep(ac.createGain()); g.gain.value = gain;
  src.connect(f); f.connect(g); g.connect(out); src.start();
  if(wobble){ const l = keep(ac.createOscillator()); l.frequency.value = rate; const lg = keep(ac.createGain()); lg.gain.value = gain * wobble; l.connect(lg); lg.connect(g.gain); l.start(); }
  return g;
}

/* A constant tone (mains hum, motors). */
function hum(out, freq, gain, type = 'sine', lowpass){
  const o = keep(ac.createOscillator()); o.type = type; o.frequency.value = freq;
  const g = keep(ac.createGain()); g.gain.value = gain;
  if(lowpass){ const f = keep(ac.createBiquadFilter()); f.type = 'lowpass'; f.frequency.value = lowpass; o.connect(f); f.connect(g); } else o.connect(g);
  g.connect(out); o.start();
}

/* One short tone, optionally gliding to another pitch (chirps, drips, seagulls). */
function blip(out, freq, dur, vol, type = 'sine', glideTo){
  if(!AMB.master) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if(glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .05);
}

/* One short burst of noise (crackles, footsteps, breath). */
function burst(out, dur, vol, freq = 2000, type = 'bandpass'){
  if(!AMB.master) return;
  const t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuffer(); f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 1.5); s.stop(t + dur + .05);
}

/* Run fn every min–max milliseconds while this soundscape plays. */
function every(min, max, fn){
  const tick = () => { if(!AMB.master) return; try{ fn(); }catch(e){} AMB.timers.push(setTimeout(tick, min + Math.random() * (max - min))); };
  AMB.timers.push(setTimeout(tick, 300 + Math.random() * min));
}
const later = (ms, fn) => AMB.timers.push(setTimeout(() => AMB.master && fn(), ms));

/* The lift's pan-pipe music: the same eight bars, forever. MIDI note numbers and beats; 0 is a rest. */
const PANPIPE = [[76,1],[79,1],[81,1],[79,1],[76,2],[74,2], [72,1],[74,1],[76,1],[79,1],[81,2],[0,2],
                 [84,1],[81,1],[79,1],[76,1],[74,2],[76,2], [72,1],[74,1],[72,1],[69,1],[72,4]];
function panpipes(out){
  const beat = 430; let i = 0;
  const play = () => {
    if(!AMB.master) return;
    const [n, b] = PANPIPE[i++ % PANPIPE.length];
    if(n) pipe(out, 440 * Math.pow(2, (n - 69) / 12), b * beat / 1000 * .95);
    AMB.timers.push(setTimeout(play, b * beat));
  };
  AMB.timers.push(setTimeout(play, 700));
}
function pipe(out, freq, dur){
  const t = ac.currentTime, o = ac.createOscillator(), vib = ac.createOscillator(), vg = ac.createGain(), g = ac.createGain();
  o.type = 'sine'; o.frequency.value = freq; vib.frequency.value = 5; vg.gain.value = freq * .006;
  vib.connect(vg); vg.connect(o.frequency);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.03, t + .08); g.gain.setValueAtTime(.03, t + dur * .7); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); vib.start(t); o.stop(t + dur + .05); vib.stop(t + dur + .05);
  burst(out, .07, .005, 2600);
}

/* ---------- one soundscape per room ---------- */
const SOUNDSCAPES = {
  // Chapter 1, the basement: 50 Hz fluorescent hum, computer fans, the odd tube buzz. (The clock doesn't tick. It's stuck at 12:58.)
  office(m){
    hum(m, 50, .012); hum(m, 100, .005);
    bed(m, { freq: 380, gain: .03 });
    every(9000, 16000, () => burst(m, .35, .018, 3200));
  },
  // Chapter 1, the server room: fans (much louder once the power is back), server chirps, and the bin fire until it's out.
  server(m, mods){
    const on = mods.includes('on');
    hum(m, 50, .014);
    bed(m, { type: 'bandpass', freq: 900, q: .6, gain: on ? .07 : .02 });
    if(on) every(2500, 6000, () => blip(m, 1600 + Math.random() * 900, .06, .012, 'square'));
    if(mods.includes('fire')) every(80, 400, () => burst(m, .05 + Math.random() * .08, .015 + Math.random() * .03, 1500 + Math.random() * 2500, 'highpass'));
  },
  // Chapter 2, Jen's office: the street outside the basement window, and footsteps going past.
  jen(m){
    bed(m, { freq: 260, gain: .035, wobble: .5, rate: .07 });
    every(3500, 8000, () => [0, 1, 2, 3].forEach(i => later(i * 420, () => burst(m, .07, .03, 700, 'lowpass'))));
  },
  // Chapter 3, Douglas's office: air conditioning, and the Privacy Mode alarm until you escape.
  doug(m, mods){
    bed(m, { freq: 600, gain: .022 });
    hum(m, 60, .006);
    if(mods.includes('alarm')) every(3000, 3000, () => { blip(m, 880, .18, .018, 'square'); later(220, () => blip(m, 660, .18, .018, 'square')); });
  },
  // Chapter 4, the lift: motor hum and the pan-pipe version of the Reynholm Industries theme.
  lift(m){
    hum(m, 80, .01);
    bed(m, { freq: 200, gain: .015 });
    panpipes(m);
  },
  // Chapter 5, Moss's escape room: draughty storeroom, dripping water, crackling (battery-powered) torches.
  dungeon(m){
    bed(m, { freq: 220, gain: .03, wobble: .6, rate: .05 });
    every(1500, 4500, () => blip(m, 1300 + Math.random() * 500, .09, .03, 'sine', 380));
    every(120, 500, () => burst(m, .04, .005 + Math.random() * .01, 2500, 'highpass'));
  },
  // Chapter 6, the yacht: lapping water, seagulls, and the engine once it's running (until you dock).
  yacht(m, mods){
    bed(m, { freq: 480, gain: .04, wobble: .7, rate: .25 });
    bed(m, { type: 'bandpass', freq: 1800, q: .5, gain: .008, wobble: .9, rate: .18 });
    every(9000, 18000, () => [0, 1, 2].forEach(i => later(i * 260, () => blip(m, 1500 - i * 80, .22, .016, 'triangle', 950))));
    if(mods.includes('engine')) hum(m, 42, .05, 'sawtooth', 140);
  }
};

/* Keep the soundscape in step with the game. Browsers only allow sound after the player has clicked or tapped. */
setInterval(ambUpdate, 700);
document.addEventListener('visibilitychange', ambUpdate);
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if(ac && ac.state === 'suspended') ac.resume().catch(() => {}); ambUpdate(); }, { passive: true }));
