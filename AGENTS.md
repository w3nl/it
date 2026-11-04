# AGENTS.md: working on Hello, IT

Context for AI agents and new contributors. The README covers what the game is and how to play. This file covers what isn't obvious from reading the code.

> **Spoilers:** the puzzle solutions are listed below. You'll need them to test changes.

## What this is

*Hello, IT* is a point-and-click escape room, a fan homage to *The IT Crowd*. You play the new IT temp at Reynholm Industries. Every puzzle teaches a real IT idea (binary, hex, ROT13, SQL, regex, recursion, HTTP status codes, parity bits…) wrapped in a joke.

- 6 chapters, 7 rooms, 37 puzzles. Plain HTML, CSS, JavaScript and SVG: **no build step, no framework, no runtime dependencies** (only Google Fonts).
- Hosted as a static site (GitHub Pages: `https://w3nl.github.io/it/`), installable as a PWA, and playable offline.
- Two languages: **UK English** (written in the code) and **Dutch** (`lang/nl/*.txt`). See "Languages" below.
- **It must be served over http(s).** `js/boot.js` fetches the room drawings, so double-clicking `index.html` (`file://`) shows a "needs a web server" message. Use `npm start` (http://127.0.0.1:4173).
- `node_modules/` and `package.json` exist **only for the tests and the local server**.

## Repository map

| Path | What |
|---|---|
| `index.html` | Page shell: header, stage, title and end screens, inventory, close-up modal. Loads the CSS, then `js/boot.js` |
| `css/*.css` | Styles, loaded in this order (the order matters for the cascade): `base`, `chapter2`, `chapter3`, `phone`, `chapter4`, `chapter5`, `chapter6`, `animations` |
| `scenes/*.svg` | One drawing per room: `office`, `server` (Chapter 1), `jen`, `doug`, `lift`, `dungeon`, `yacht`. Each opens on its own in a browser or SVG editor |
| `js/boot.js` | Start-up: fetches the scenes into the stage, then loads the game scripts **in order** (first `i18n`, and waits for the Dutch text if needed) |
| `js/i18n.js` | Languages: `LANG`, `tx()`, `setLang()`, `onLangChange()`, and the observer that translates the page |
| `lang/nl/*.txt` | The Dutch translation, one file per part: `ui`, `ch1`…`ch6`, `hints`, `scenes` |
| `js/core.js` | Engine: state `S`, `save`/`load`, sound, dialogue `say()`, inventory, `applyVisuals()`, hotspot input, `openModal()`, `nope()` |
| `js/chapter1.js` | Chapter 1, plus `H` (the hotspot table that every chapter adds to) |
| `js/items.js` | `useItem()`: using inventory items on hotspots, for every chapter |
| `js/chapter2.js` … `js/chapter6.js` | One file per chapter: hotspots, puzzles, intro, start and win |
| `js/hints.js` | All hints (`HINTS`) and the `stageN()` functions that pick the current puzzle |
| `js/voice.js` | Optional voices: reads each dialogue line aloud (Web Speech API); `speakLine()`, `VOICE_STYLE` per character, the Voices button |
| `js/ambience.js` | Generated ambient sound per room (Web Audio, no audio files): `ambKey()` decides what plays, `SOUNDSCAPES` builds each room |
| `portraits/*.svg` | Character portraits for the dialogue strip and talk windows: `you`, `roy`, `moss`, `jen`, `douglas`, `douglas-captain`, `machine`, `duck`, `fax`, `dragon` |
| `js/app.js` | Chapter management (`chapterDone`, `nextChapter`, `exitLabels`, `refreshMenu`), end screens (`CH_END`, `showWin`), scores (`recordScore`, `openScores`), buttons, timer, achievements (`ACH`), title menu, PWA install, `start()` |
| `sw.js` | Service worker. **List every new file in `CORE` and bump `CACHE` on every change, together with `GAME_VERSION` in `js/boot.js`.** |
| `manifest.webmanifest`, `icons/` | PWA manifest and icons (`icon.svg` is the source; PNGs are rendered from it) |
| `tests/*.spec.js` | Playwright tests: one playthrough per chapter, plus progress, PWA, phone and fun checks |
| `tests/helpers.js` | Test helpers: `seed`, `hs`, `skip`, `useSlot`, `closeModal`, `waitModalClosed`, `expectWin` |
| `tests/serve.js` | Zero-dependency static server on port 4173 (`npm start`) |
| `.github/workflows/tests.yml` | CI: runs the tests on every push and pull request |
| `.github/workflows/agent-*.yml`, `claude.yml` | The idea → plan → PR → review → playtest agents (see `docs/agent-workflow.md`) |
| `.github/ISSUE_TEMPLATE/idea.yml` | The "Idea" issue form that starts the agents |
| `tools/lift-panel.py` | Regenerates the lift's right-wall panel in perspective (`python3 tools/lift-panel.py`) |
| `docs/escape-room-blueprint.md` | The theme-independent recipe for building another game like this one; keep it in step with lessons learned here |
| `tools/i18n-check.js` | Lists English text without a Dutch translation, stale keys and conflicts (`node tools/i18n-check.js`) |

## How the code fits together

- **One shared global scope.** The game scripts are classic `<script>`s, not modules, loaded one after another by `js/boot.js`. Top-level `const`/`let`/`function` in one file are visible in all later files, and functions can call each other across files at runtime. So:
  - **Load order matters for code that runs immediately** (e.g. `Object.assign(H, …)` needs `chapter1.js` first; `Object.assign(HINTS, …)` lives in `hints.js` itself).
  - **Names must be unique across all files.** Use chapter-specific names (`openPhone`, `stage4`, `ROY5_TALK`…), and avoid names of browser globals (`name`, `status`, `open`, `close`, `print`…).
- The scenes are in the page **before** any game script runs. `core.js` wires up every `.hit` element when it loads, so a scene added later would not be clickable.
- The title-screen buttons stay hidden (`.overlay.loading`) until boot has finished, so nobody can click before the game is ready.
- CSS files follow the same chapter split. Design tokens are on `:root` in `css/base.css` (`--ink`, `--panel`, `--paper`, `--amber`, `--phosphor`…). It's a deliberate single dark theme.

### Scenes and hotspots
- Each `scenes/<name>.svg` is one `<svg class="scene" id="sc-<name>" viewBox="0 0 1600 900">`. `S.scene` holds the short name (`office`, `server`, `jen`, `doug`, `lift`, `dungeon`, `yacht`).
- Clickable areas are transparent `<rect class="hit" fill="transparent" data-hs="id" data-label="Label">` elements at the end of each SVG (the `fill` attribute is only for previewing the file on its own; the game's CSS controls it). The click handler calls `H[id]()`. **Hotspot ids share one namespace across all scenes**, so give new ones a unique id (e.g. `jen6`, `roy5`, `moss6`).
- Several rects may share one `data-hs` (e.g. Jen's door and her SmartLock are both `jdoor`).
- **SVG `id`s, including gradient ids, are global to the page** once the scenes are inserted. Two scenes defining `id="wood"` will clash. Prefix new ids (`dgWall`, `yWin`…).
- Labels can change at runtime: `exitLabels()` relabels exits after a chapter is solved, and the yacht's window/helm become "Smart gangway (exit)" once docked.
- **Perspective on side walls:** a flat object on a side wall must follow that wall's lines (its top and bottom edges point to the far end of the room, like the certificate in the lift). The lift's right-wall panel, USB port, charging phone and emergency box are generated by `tools/lift-panel.py` from the wall's ceiling and floor lines; change the layout there and re-run it, rather than editing those coordinates in `scenes/lift.svg`.
- Some scene parts are drawn or updated by JS (books, server rack, lift buttons, blinds, mirror digits, Hanoi and potions on the table…) in `buildDecor*()` / `draw*()` and `applyVisuals()`.

### State and saving
- `S` is the whole save. `fresh()` gives a new one: `{ v:1, ch, scene, pc, f:{}, inv:[], hl:{}, hints, t, ach:{}, started }`. Chapters add their own fields (`sl`, `jl` (Jen's locked laptop), `killed`, `mail`, `cable`, `hanoi`, `potions`, `sys`, `prog`…).
- `S.f` holds the per-chapter **flags** (see the solutions table for names).
- **Computers stay as you left them** when you close them, also after a reload: the screen they show (`S.lv` Jen's laptop, `S.dv` Douglas's computer, `S.pl` its pop-ups, `S.pv` Douglas's phone, `S.jl` Jen's lock screen), the terminal screens (`S.term` and `S.thist` for Moss, `S.sql` for Denholm's database), and half-typed input (`S.typed`, via `keepTyped(input, key)` / `clearTyped(key)` in `core.js`). Use `keepTyped` for new text fields on computers.
- `save()` writes `S` to `localStorage['hello-it-basement-v1']` after every meaningful action.
- **Chapter unlocks are separate keys:** `hello-it-basement-v1-ch2` … `-ch6` (value `'1'`), plus `unlockedN()` fallbacks based on `S.ch` (for browsers that block storage). `…-norotate` remembers that the phone rotate banner was dismissed, and `…-lang` the language (`en` or `nl`).
- **Scores** (`…-scores`, `{ 1: { t, hints }, … }`) keep each chapter's best time and fewest hints, separately, across new games. `showWin()` records them with `recordScore()`; the **Scores** button on the title screen opens `openScores()` (`app.js`), with totals and all achievements. `rankFor(hints)` gives the rank. Saves from before scores existed: `start()` records the score of a save that ends on a finished chapter, and the overview marks earlier finished chapters (next chapter unlocked) as "Finished before scores were kept".
- Starting a chapter (`startChN()`) replaces `S` with `Object.assign(fresh(), { ach: S.ach })`. **Achievements carry over; everything else resets.**
- Never assume `localStorage` works. Every access is wrapped in `try/catch`.

### Dialogue (`say`)
- `say(lines, done?)` takes a string or `[[who, text], …]`. Clicking the strip advances; `done` runs after the last line.
- `who`: `you`, `sys`, `moss`, `jen`, `roy`, `douglas`, `machine`, `duck`, `fax`, `dragon`. Each has a colour class `.dialog.who-<who>`.
- A **portrait** appears next to every line, chosen by `faceFor(who)` in `core.js` (`sys`, the narrator, has none; Douglas wears his captain's hat in Chapter 6). Talk windows use `talkFace(name)`. A new speaker needs an SVG in `portraits/` (120×120 viewBox, rounded dark background) and an entry in `faceFor`.
- The speaker **label depends on the chapter** and is set in `next()`: `sys` shows "Basement" / "Jen's office" / "Top floor" / "The lift" / "The dungeon" / "The river"; Moss is "Moss · intercom" in chapters 1–4, "Moss · walkie-talkie" in 5 and "Moss" in 6. Add new cases there.

### Close-ups (`openModal`)
- `openModal(title, subtitle, html, onOpen?, onClose?)`. Bind events in `onOpen`. Any timers you start must check that their elements still exist, because the player can close the modal at any time.
- Most puzzles: solve → `S.f.x = true; save(); applyVisuals(); chord([...])`, short feedback, then `setTimeout(() => { closeModal(); say([...]) }, ~1500)`.

### Items
- `ITEMS[id] = { name, desc, svg }` (a `desc` getter is allowed). Inventory slots show 4 items.
- The flow is: select an item → click a hotspot → `useItem(item, hotspotId)`. **The item is deselected before `useItem` runs**, whether or not it works.
- `dphone` (chapter 4) is special: clicking its slot opens the phone instead of selecting it.

### Languages (`js/i18n.js`, `lang/nl/`)
- **English stays in the code.** The Dutch lives in `lang/nl/*.txt` as pairs: a line `= English text`, then `> Nederlandse tekst`. `\n` is a line break, `#` starts a comment, and `~ regex` + `> replacement with $1` handles text with numbers in it (`~ ^Moves: (\d+)$`). Keys are matched with whitespace collapsed, so line breaks and indentation in the code don't matter.
- **Most text needs no code changes.** A `MutationObserver` translates every text node, and the `title`, `aria-label`, `data-label`, `placeholder` and `alt` attributes, as they appear on the page. `say()` translates each line with `tx()`. Elements with `translate="no"` are skipped (the language button, the typing dialogue text).
- **Use `tx()` when text is built from pieces.** A text node only matches when it is one whole sentence. When code glues text together (numbers, names, `+`), write a template with placeholders and translate it as one: `tx('Found in {n} guesses.', { n })`, with `= Found in {n} guesses.` / `> Gevonden in {n} keer raden.` in the language file. Translate the pieces that go into placeholders too (`tx(SYS[k][0])`). The same goes for sentences with markup inside (`<b>`, `<i>`): wrap the whole HTML string in `tx()` and translate it with the markup.
- **Puzzles with English words have a Dutch version,** chosen with `tx()` on the English value: the ROT13 note (`NOTE_PLAIN`) and Jen's door answer (`INTERNET THING` → `INTERNET DING`; the SmartLock accepts both), the potion letters (`BATTERY` → `ENERGIE`, via `potionLetter()`), the logbook (`LOOK UNDER THE BELL` → `KIJK ONDER DE BEL`). Code, commands, SQL, HTTP, regex names and Unix error messages stay English.
- **Switching** calls `setLang()`, which re-translates the page (and restores English from remembered originals) and runs the `onLangChange()` hooks in `app.js`: close the close-up, redraw the inventory, labels, menu, end screen and current dialogue line. The first visit picks Dutch when the browser's language is Dutch.
- **When you add or change English text, add or change its Dutch line** in the matching `lang/nl` file, keeping the joke (rewrite it if it doesn't work in Dutch). Then run `node tools/i18n-check.js`: it lists text without a translation (some of it is code or names, which is fine) and fails on stale keys and conflicting translations, which `tests/language.spec.js` also checks. Dutch is informal (`je`), and drawn text in the scenes has to fit the same space.

### Adding a chapter (checklist)
1. `scenes/<room>.svg` (unique ids, `.hit` rects last), and add the name to `scenes` in `js/boot.js`.
2. `css/chapterN.css`, linked in `index.html` before `css/animations.css`.
3. `js/chapterN.js`: `UNLOCKN`, `unlockedN()`, `setUnlockedN()`, hotspot handlers via `Object.assign(H, {...})`, puzzles, `introN()`, `startChN()`, `winN()`. Add it to `scripts` in `js/boot.js` (before `hints`).
4. Hints in `js/hints.js`: `Object.assign(HINTS, {...})` and `stageN()`, then wire `stage_()`.
5. Wire it up:
   - in `js/app.js`: `chapterDone()`, `refreshMenu()`, `CH_END[N]` and the previous chapter's "Continue to Chapter N", `showWin()` unlock, `nextChapter()`, `#btn-next`, `exitLabels()`, `cont()` message, new `ACH` entries
   - in `js/core.js`: the scene toggle and `#chap` text in `applyVisuals()`, the `sys` label in `next()`, new `ITEMS`
   - in `js/items.js`: new `useItem` cases
   - in `index.html`: a chapter chip on the title screen
6. Add the new files to `CORE` in `sw.js` and bump `CACHE`.
7. The Dutch translation: a `lang/nl/chN.txt` (add it to `LANG_FILES` in `js/i18n.js` and to `CORE`), plus the new labels in `lang/nl/scenes.txt`.
8. A test file `tests/chapterN.spec.js`, rooms added to `tests/phone.spec.js`, and a README section.

## Puzzle solutions (spoilers)

| Ch | Puzzle | Solution | Flags |
|---|---|---|---|
| 1 | Moss's PC | Power button twice (off, on); password `127.0.0.1` (also `localhost`, `::1`) | `S.pc`, `loggedIn` |
| 1 | Terminal | `cat note_to_self.rot13`, then decode: by hand with the whiteboard's ROT13 table, or in the terminal with `cat note_to_self.rot13 \| tr 'A-Za-z' 'N-ZA-Mn-za-m'` (also `echo … \| tr …` and `tr … < file`; `man tr` explains) | `readNote` |
| 1 | Server room DIP switches | 42 = 00101010 (switches 32, 8, 2) | `serverOpen` |
| 1 | Bin fire | Fire extinguisher (office wall) on the fire | `extTaken`, `fireOut` |
| 1 | Logic panel | A=1, B=0, C=0, D=1 (`(A XOR B) AND NOT C AND D`) | `power` |
| 1 | Exit keypad | Rack shows `0x539` = **1337** | `escaped` |
| 2 | Laptop reset | Sir Purrcival / Belladonna / Swindon (photo, shoe boxes, postcard) | `lap` |
| 2 | Slides | Correct options per slide 1–6: `0,1,2,0,2,1` (Wi-Fi = "doesn't stand for anything") | `S.sl[]` |
| 2 | Wi-Fi | Card in the Crocs box: `Boardroom-Projector`, key `SHOES4EVER` | `gotCard`, `wifi` |
| 2 | Present | "Present to boardroom" (needs all slides and Wi-Fi) | `sent` |
| 2 | SmartLock | Jen's answer `internet thing` (ROT13 in the speaker notes) + code `8086` (Messages) | `out2` |
| 3 | Pop-ups | Only the title-bar ✕ closes one; the big buttons spawn 2 more (cap 18) | `pops` |
| 3 | Task Manager | End the 4 "Unknown"/YachtW0rld processes | `S.killed`, `cpu` |
| 3 | Phishing | Legit: emails 0, 3, 5 (`@reynholm.co.uk`); the rest are phishing | `S.mail`, `mailDone` |
| 3 | Backup | `report_FINAL_REAL_use_this.doc`, Fri 14:32, 2.4 MB (index 3) | `report` |
| 3 | Safe | Click the portrait, then `SELECT code FROM safe WHERE owner = 'Denholm'` → **1966** | `portrait`, `safeOpen` |
| 3 | Fax | Open cover, load paper, dial `9` + `01189998819991197253` | `jamFixed`, `paperIn`, `out3` |
| 4 | Charge | USB-A to USB-C cable (`S.cable='ac'`) on the service USB port | `charged` |
| 4 | Pattern | A "D": dots `0,3,6,7,5,1` (either direction); "Tilt it to the light" shows smudges | `unlocked` |
| 4 | Spyware | Settings → uninstall SuperBright Flashlight FREE | `spyGone` |
| 4 | Pairing | **205815** (the mirror shows 218205: reversed, 2↔5) | `paired` |
| 4 | Passphrase | Emergency phone Morse `... ..- -.. ---` = **sudo** | `calledMoss`, `passOK` |
| 4 | Stuck update | Release lift → 99% → power button → Power off → power button | `stuck`, `out4` |
| 5 | Tower of Hard Drives | Standard Hanoi, 4 discs; optimal 15 moves (smallest disc moves right) | `S.hanoi`, `hanoi` |
| 5 | Rune cabinet | `/^[RM]o\w{1,2}$/` matches **Roy, Moss, Rose** | `cabinet` |
| 5 | Spell | USB stick on the cabinet; loop `for (let i = 0; i < runes.length; i++)` → **628210** | `usbIn`, `spell` |
| 5 | Chest | 628210 | `chest` |
| 5 | Potions | Sort ascending with neighbour swaps (min 10): letters spell BATTERY | `S.potions`, `sorted` |
| 5 | Dragon | Batteries on the dragon, then a binary search, 7 guesses for 1–100 (random number) | `dragonOn`, `dragon` |
| 5 | Firewall | Any password passing all 7 rules, e.g. **`Moss#4900`** (digits sum to 13, contains Roy/Moss) | `out5` |
| 6 | Logbook | ASCII → `LOOK UNDER THE BELL`; the bell gives the key | `logRead`, `gotKey` |
| 6 | Engine | Key in ignition; Battery, Fuel, Bilge, Nav, Engine, Propeller (any valid dependency order) | `keyIn`, `S.sys`, `engine` |
| 6 | Helm | `POST /login user=moss`, then `GET /helm` → 200 | `token`, `helm` |
| 6 | Radio | Flipped bit at row 3, column 2 → the bits draw a 7 → Berth 7 | `parity` |
| 6 | Autopilot | `F F R F L F F F F F` | `S.prog`, `docked` |
| 6 | CAPTCHA | Tiles 0, 2, 4, 6, 8 (inflatable, Welsh flag, SMAUG, Komodo, Douglas in a onesie) | `out6` |

## Gotchas

- **`[hidden]{display:none!important}` (in `css/base.css`) must stay.** Components like `.modal` set `display:flex`, which would otherwise override `hidden`.
- **Sizing:** the stage is 16:9 and sized against the viewport height (`.frame` width uses `100svh`).
  - **Portrait phones:** the room is wider than the screen and **pans sideways** inside `#pan`.
  - **Short landscape** (`max-height: 520px`) has its own compact rules.
  - Always check new close-ups at 412×915 and 915×412 for sideways overflow, and run the phone tests.
- **Touch:** on touch screens text says "tap", and taps blur the hotspot so no focus box lingers. Hover tooltips don't exist on phones, so don't hide information in `data-label` only.
- **Motion:**
  - There's a **Motion** button (auto / on / off), saved as `hello-it-basement-v1-motion`. *Auto* follows the device's `prefers-reduced-motion`; *on* animates anyway (adds `html.motion-on`); *off* stops everything (`html.motion-off`). Some browsers, notably Firefox, pass on the operating system's "reduce animations" setting, so without *Motion on* everything stood still there.
  - In JS, **always use `reducedMotion()`** (core.js), never `matchMedia('(prefers-reduced-motion…)')` directly. The CSS kill-switch is the last rule in `css/animations.css`.
  - **SMIL `<animateTransform>` ignores CSS.** `applyMotion()` pauses the SMIL animations in every scene with `pauseAnimations()`.
  - Firefox runs the motion and boat tests in CI (`PW_FIREFOX=1`, project `firefox`). It isn't available in every local setup.
  - The tour boat runs on its own timer (`scheduleBoat`). It only sails when the yacht scene is showing, the title is hidden and the tab is visible.
- **Sound:**
  - Effects use `beep()`/`chord()` in `core.js`; the ambience lives in `js/ambience.js`. Both follow `soundOn`, which is saved as `hello-it-basement-v1-sound`.
  - Ambience is re-checked every 0.7 s by `ambUpdate()`: it compares `ambKey()` (room plus story state, e.g. `server+on+fire`, `doug+alarm`, `yacht+engine`) with what's playing and rebuilds only when it changes. To make a room's sound react to a puzzle, add the flag to its key in `ambKey()` and handle the modifier in its `SOUNDSCAPES` entry.
  - Browsers block audio until the first click or tap, so the AudioContext is resumed on `pointerdown`/`keydown`. The title screen and hidden tabs are silent.
  - Keep levels low: the soundscapes sit under the dialogue, around 0.01 to 0.07 gain per layer.
- **Voices** (`js/voice.js`): off by default, saved as `hello-it-basement-v1-voice`. `next()` in `core.js` calls `speakLine(who, text)` with the translated line, so voices speak the current language (`en-GB` or `nl-NL`, picking a matching device voice). Each speaker has a pitch, rate and voice slot in `VOICE_STYLE`: a new speaker needs an entry there too. Symbols like ♪ and ✕ are stripped. The button is hidden in browsers without speech synthesis. Only dialogue is spoken, not close-ups. Tests replace `speechSynthesis` with a recorder (`tests/voice.spec.js`).
- **CSS class names are global too.** A new class can clash with an existing one in another chapter's CSS (e.g. `.pop` is Douglas's pop-up window, so the portrait animation is `.face-in`). Search the `css/` folder before naming a class.
- **Randomness:** the dragon's number and the rotate-banner quip are random. Tests must not depend on them (the dragon test does a real binary search).
- **Text inside JS template strings** is HTML. Escape `<`, `&`, and quotes that clash with the surrounding string. Prefer typographic apostrophes (’) or double-quoted JS strings for dialogue.
- **Accessibility:** buttons need `type="button"`; form inputs need labels or `aria-label`. Hotspots get `tabindex`/`role="button"` automatically, and Space reveals all hotspots.
- **`window.alert/confirm/prompt` are never used.** Build confirmations into the UI (see the phone's "Power off?" overlay).
- **The claude.ai Artifact copy:** the game is also published as a private claude.ai artifact, as a multi-file artifact (the page plus `css/`, `js/`, `scenes/`, `portraits/`, `lang/`). The page is `index.html` without the `<!doctype>`/`<html>`/`<head>` wrapper and without the PWA tags (manifest, icons, theme-color, apple-*). The service worker only registers when a `link[rel=manifest]` exists, so the artifact stays a plain page.
- **Service worker strategy:** the page and the game's own files are network-first with `cache: 'no-cache'` (the browser checks with the server every time instead of reusing a copy for GitHub Pages' 10 minutes, so an update never mixes old and new files), with the cache as the offline fallback. Installing fills the offline cache with `cache: 'reload'` for the same reason. Google Fonts are cache-first.
- **Versions:** `GAME_VERSION` (`js/boot.js`) and `CACHE` (`sw.js`) are the same number, shown as `v15` at the bottom of the title screen; `tests/pwa.spec.js` fails when they differ. The service worker tells open pages its version (on activate, and when asked); a page running an older version shows the "A new version of the game is ready · Reload" bar (`swVersion()` in `app.js`).

## Tone and writing

- **Humour first, teaching second.** Every wrong answer gets a joke *and* a nudge towards the right idea.
- British English and settings (Swindon, the Thames, "lift", "torch").
- Keep the characters' voices:
  - **Roy:** lazy, sarcastic, catchphrase "Have you tried turning it off and on again?"
  - **Moss:** precise, anxious, over-engineers everything, wears a cape.
  - **Jen:** confident, knows nothing about IT, "Relationship Manager", loves shoes.
  - **Douglas:** vain, oblivious, yachts, "Incredibly Talented".
- Running jokes to reuse: the 0118 999 881 999 119 725… 3 emergency number, the clock stuck at 12:58, the Internet in a box, "There is no Douglas I", the rubber duck (free hints), ROT13, `sudo`.
- No emoji in UI chrome. A few Unicode symbols in game text (✕ ⇄ ▶ ♪) are fine.
- Every puzzle needs two hints in `HINTS`: a nudge, then the answer.
- Every English text needs a Dutch line in `lang/nl` (see "Languages"). In Dutch the voices stay the same: Roy says "Heb je al geprobeerd hem uit en weer aan te zetten?", and names, product names and the IT acronyms stay as they are.

## Agents on GitHub

Ideas arrive as GitHub issues and go through a team of Claude agents in GitHub Actions: refine → build → review and playtest, with the owner approving the plan (label `ready-to-build`) and merging. See [docs/agent-workflow.md](docs/agent-workflow.md).

If you are one of those agents:
- Your role and task are in the workflow's prompt; this file is your project knowledge.
- **Refine:** make the plan concrete enough to build and check: files, acceptance criteria, test plan, both hints for every puzzle, and how any word-based puzzle works in Dutch.
- **Build:** follow the plan and the later discussion, keep the change focused, add the Dutch translation, bump `CACHE`, add tests, make `npm test` pass, update this file.
- **Review / playtest:** report concrete problems with a suggested fix or steps to reproduce. Don't block on taste.

## Workflow

**Never push to `main`.** Every change goes through a pull request: fetch first (the owner squash-merges, so `main` moves), branch from the latest `origin/main`, push the branch and open a PR. The owner reviews and merges. The claude.ai artifact copy is updated only after the PR is merged.

```bash
npm install
npx playwright install chromium   # first time only
npm test                           # about 2 minutes: 31 tests, desktop + Pixel 7 (+ Firefox in CI)
node tools/i18n-check.js           # English text that has no Dutch translation yet
npm start                          # http://127.0.0.1:4173 to play locally
```

- **Node.js 26** (`.nvmrc`), used by every workflow via `node-version-file`. The workflows run on `ubuntu-26.04` with `actions/checkout`, `setup-node` and `upload-artifact` v7. Dependabot (`.github/dependabot.yml`) opens weekly PRs for new action and Playwright versions; the AI agents skip those PRs.
- Tests seed `localStorage` and click hotspots by `data-hs` through `hs()` in `tests/helpers.js`. When a `data-hs` is shared, use `.first()`.
- Tests run in English. `PW_LANG=nl npx playwright test tests/phone.spec.js` checks the phone layouts in Dutch (CI does this too); `tests/language.spec.js` covers the switch and the Dutch puzzle answers.
- After changing the game: **bump `CACHE` in `sw.js` and `GAME_VERSION` in `js/boot.js`** (and add new files to `CORE`), run `npm test`, and update the README chapter list if content changed.
- Licence: GPL-3.0. Character names and jokes come from *The IT Crowd*. This is a non-commercial fan project.
