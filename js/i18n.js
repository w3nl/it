// Languages: UK English (the source text, written in the code) and Dutch (lang/nl/*.txt).
// Loaded first by js/boot.js. The English text stays in the code; this file swaps it for Dutch on the way to the screen:
//  - tx(text, vars) translates a string in code (say() uses it for every line; use it for text built from pieces);
//  - a MutationObserver translates every text node and every title / aria-label / data-label / placeholder / alt
//    that appears on the page, so most close-ups need no changes at all. Mark an element translate="no" to skip it.
// The originals are remembered, so switching back to English restores them. See AGENTS.md, "Languages".

const LANG_KEY = 'hello-it-basement-v1-lang';
const LANGS = { en: 'English', nl: 'Nederlands' };
const LANG_FILES = ['ui', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'hints', 'scenes'];
let LANG = (() => {
  try{ const v = localStorage.getItem(LANG_KEY); if(v && v in LANGS) return v; }catch(e){}
  return /^nl\b/i.test(navigator.language || '') ? 'nl' : 'en';
})();
const DICT = {};   // DICT.nl = { keys: Map(normalised English -> Dutch), patterns: [[RegExp, replacement]] }
const normText = s => s.replace(/\s+/g, ' ').trim();

/* ---------- the translation files ----------
   "= English" then "> Dutch" on the next line. "\n" inside a line is a line break.
   "~ regex" then "> replacement with $1" for text that contains numbers or names.
   {name} is a placeholder, filled in by tx(text, { name }). Lines starting with # are comments. */
function parseLang(text, into){
  let key = null, re = null;
  for(const line of text.split('\n')){
    if(line.startsWith('= ')){ key = line.slice(2); re = null; }
    else if(line.startsWith('~ ')){ re = line.slice(2); key = null; }
    else if(line.startsWith('> ')){
      const val = line.slice(2).replace(/\\n/g, '\n');
      if(key !== null) into.keys.set(normText(key.replace(/\\n/g, '\n')), val);
      else if(re !== null) into.patterns.push([new RegExp(re), val]);
      key = re = null;
    }
  }
}
async function loadLang(l){
  if(l === 'en' || DICT[l]) return;
  const d = { keys: new Map(), patterns: [] };
  const texts = await Promise.all(LANG_FILES.map(f => fetch(`lang/${l}/${f}.txt`).then(r => { if(!r.ok) throw new Error(f); return r.text(); })));
  texts.forEach(txt => parseLang(txt, d));
  DICT[l] = d;
}

/* ---------- translating a string ---------- */
function lookup(s){
  const d = DICT[LANG]; if(!d) return null;
  const n = normText(s); if(!n) return null;
  let out = d.keys.get(n);
  if(out === undefined){ for(const [re, rep] of d.patterns){ if(re.test(n)){ out = n.replace(re, rep); break; } } }
  if(out === undefined){ if(window.I18N_MISSES) window.I18N_MISSES.add(n); return null; }   // I18N_MISSES: a Set that tests can install to list untranslated text
  const m = s.match(/^(\s*)[\s\S]*?(\s*)$/);   // keep the spaces around the text
  return m[1] + out + m[2];
}
function tx(s, vars){
  if(s == null) return s;
  let out = String(s);
  if(LANG !== 'en'){ const tr = lookup(out); if(tr !== null) out = tr; }
  if(vars) out = out.replace(/\{(\w+)\}/g, (m, k) => k in vars ? vars[k] : m);
  return out;
}

/* ---------- translating the page ---------- */
const I18N_ATTRS = ['title', 'aria-label', 'data-label', 'placeholder', 'alt'];
const textOrig = new WeakMap();   // text node -> [english, shown]
const attrOrig = new WeakMap();   // element -> { attr: [english, shown] }
const skipped = el => !el || el.closest('[translate="no"], script, style, textarea');
function trText(n){
  const cur = n.data, o = textOrig.get(n);
  const en = (o && o[1] === cur) ? o[0] : cur;
  if(!o && LANG === 'en') return;
  if(!/[A-Za-z]/.test(en)) return;
  const out = LANG === 'en' ? en : (lookup(en) ?? en);
  if(out !== cur) n.data = out;
  textOrig.set(n, [en, out]);
}
function trAttr(el, a){
  const cur = el.getAttribute(a); if(cur == null) return;
  let map = attrOrig.get(el); const o = map && map[a];
  const en = (o && o[1] === cur) ? o[0] : cur;
  if(!o && LANG === 'en') return;
  const out = LANG === 'en' ? en : (lookup(en) ?? en);
  if(out !== cur) el.setAttribute(a, out);
  if(!map) attrOrig.set(el, map = {});
  map[a] = [en, out];
}
function localize(root){
  if(!root) return;
  if(root.nodeType === 3){ if(!skipped(root.parentElement)) trText(root); return; }
  if(root.nodeType !== 1 || skipped(root)) return;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.nodeType === 1 && (n.getAttribute('translate') === 'no' || /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.tagName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  for(let n = root; n; n = walk.nextNode()){
    if(n.nodeType === 3) trText(n);
    else for(const a of I18N_ATTRS) if(n.hasAttribute(a)) trAttr(n, a);
  }
}
const i18nObserver = new MutationObserver(muts => {
  if(LANG === 'en') return;
  for(const m of muts){
    if(m.type === 'childList') m.addedNodes.forEach(localize);
    else if(m.type === 'characterData'){ if(!skipped(m.target.parentElement)) trText(m.target); }
    else if(!skipped(m.target)) trAttr(m.target, m.attributeName);
  }
});
i18nObserver.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });

/* ---------- switching ---------- */
const langHooks = [];   // functions that redraw text built in code, called after a switch
function onLangChange(fn){ langHooks.push(fn); }
function applyLangAttr(){ document.documentElement.lang = LANG === 'nl' ? 'nl' : 'en-GB'; }
async function setLang(l){
  if(!(l in LANGS)) return;
  try{ await loadLang(l); }catch(e){ return false; }
  LANG = l;
  try{ localStorage.setItem(LANG_KEY, l); }catch(e){}
  applyLangAttr();
  localize(document.body);
  langHooks.forEach(fn => { try{ fn(); }catch(e){ console.error(e); } });
  return true;
}
applyLangAttr();
const langReady = loadLang(LANG).catch(() => { LANG = 'en'; applyLangAttr(); }).then(() => localize(document.body));
