# Blueprint: a browser escape room like *Hello, IT*, with any theme

This is the reusable knowledge from building *Hello, IT*: how it's put together, why, and what went wrong along the way. It describes no particular theme. Use it to start a new game with another theme (a hospital, a space station, a school, a museum…) and get the same result faster.

**How to use it:** copy this file into the new repository (for example as `docs/blueprint.md`), and start the project with the prompt at the end. As the new game takes shape, write its own `AGENTS.md` like the one in this repository: this file is the general recipe, `AGENTS.md` is the project's own notes.

---

## 1. The concept

- **A point-and-click escape room in the browser.** Rooms are drawings; you click things, read, collect items, use them on other things, and solve puzzles to open the way out.
- **Every puzzle teaches one real idea, wrapped in a joke.** In *Hello, IT*: binary, hex, ROT13, SQL, regex, recursion, sorting, binary search, HTTP status codes, parity bits, dependencies, phishing. Pick the real ideas of the new theme first, then build a joke and a room around each one.
- **Humour first, teaching second.** Every wrong answer gets a joke *and* a nudge towards the right idea. A wrong answer that is close (or a classic mistake) gets its own message.
- **Chapters**, each one room (or two) with 5–7 puzzles, a short intro dialogue, and an end screen with time, hints, rank and achievements. Finishing a chapter unlocks the next one.
- **Characters with fixed voices** (catchphrases, running jokes), written down in a tone guide so every chapter and every contributor keeps them consistent.
- **Help that never gets stuck:** two hints per puzzle (a nudge, then the answer) behind a Hint button, and a "rubber duck" item that gives the first hint for free.

### Puzzle design checklist
- One real idea per puzzle; the room contains everything needed to learn it (a poster, a manual page, a note, a character who explains it badly).
- The answer can be found, not guessed: point to it from at least two places.
- Wrong answers teach: catch the typical mistakes and explain them.
- Two hints: the first points to where to look, the second gives the answer.
- If the answer is a word, plan a version for every language (see Languages).
- Avoid randomness unless the puzzle needs it (and then tests must not depend on it).
- Small optional extras (achievements, Easter eggs) make players explore.

---

## 2. Technology choices (and why)

- **Plain HTML, CSS, JavaScript and SVG. No build step, no framework, no runtime dependencies** (only web fonts). Anyone, or any agent, can read and change any file; nothing to install to play; hosting is any static site.
- **Hosted on GitHub Pages**, installable as a **PWA**, playable **offline**.
- **Served over http(s), never `file://`**: the room drawings are fetched. Show a friendly "needs a web server" message on `file://`. A zero-dependency Node static server (`npm start`) for local play.
- `package.json` and `node_modules/` exist only for the tests and the local server.

### File layout

| Path | What |
|---|---|
| `index.html` | Page shell: header, stage, title and end screens, inventory, close-up modal, dialogue strip |
| `css/` | `base.css` (design tokens on `:root`), one file per chapter, `phone.css`, `animations.css` last |
| `scenes/<room>.svg` | One drawing per room, viewBox `0 0 1600 900` (16:9) |
| `portraits/<who>.svg` | One portrait per speaker, 120×120 |
| `js/boot.js` | Fetches the scenes into the page, then loads the scripts in order; holds `GAME_VERSION` |
| `js/i18n.js` | Languages (see below) |
| `js/core.js` | Engine: state, save/load, sound effects, dialogue, inventory, visuals, hotspot input, close-ups |
| `js/chapter1.js` … | One file per chapter: hotspot handlers, puzzles, intro, start, win. Chapter 1 also defines the hotspot table |
| `js/items.js` | Using inventory items on hotspots |
| `js/hints.js` | All hints and the functions that decide which puzzle you're on |
| `js/ambience.js`, `js/voice.js` | Generated ambient sound; optional spoken dialogue |
| `js/app.js` | Chapters, end screens, scores, buttons, timer, achievements, title menu, install, start-up |
| `lang/<code>/*.txt` | Translations |
| `sw.js`, `manifest.webmanifest`, `icons/` | The installable, offline app |
| `tests/` | Playwright tests and helpers; `tests/serve.js` is the local server |
| `tools/` | Small scripts (translation checker, generators for tricky drawings) |

---

## 3. How the code fits together

- **Classic scripts in one shared global scope**, loaded one after another by `boot.js` (not modules). Top-level names are visible in all later files, so:
  - **load order matters** for code that runs immediately;
  - **every name must be unique across all files** (use chapter-specific names like `openPhone`, `stage4`), and avoid browser globals (`name`, `status`, `open`, `close`, `print`).
- **The scenes are in the page before any script runs**, so the engine can wire up every hotspot at load.
- **The title buttons stay hidden until boot has finished**, so nobody clicks before the game is ready.

### State and saving
- One object `S` is the whole save: chapter, room, flags (`S.f`), inventory, hint levels, hint count, time, achievements, plus per-chapter fields. `fresh()` makes a new one.
- `save()` writes it to `localStorage` after every meaningful action. **Wrap every `localStorage` access in `try/catch`**: some browsers block storage.
- Separate keys for things that outlive a game: chapter unlocks, scores, settings (sound, motion, language, voices, dismissed banners).
- Starting a chapter replaces `S` with a fresh one; **achievements carry over**.
- **Things stay as the player left them:** computers, terminals, phones and forms in close-ups keep their screen, output and half-typed input in the save (a small `keepTyped(input, key)` helper), so closing a close-up or reloading loses nothing. Players close things all the time to go and look for an answer.

### Rooms (SVG scenes)
- One `<svg class="scene" id="sc-<room>" viewBox="0 0 1600 900">` per room. Only the current one is shown.
- **Hotspots** are transparent `<rect class="hit" data-hs="id" data-label="Label">` elements at the end of the SVG. A click calls `H[id]()`. **Hotspot ids share one namespace** across all rooms; several rects may share one id.
- **SVG ids (including gradients) are global** once the scenes are in one page: prefix them per room.
- Some parts are drawn or updated by code (state-dependent: a door open or closed, lights on or off, a fire that goes out). Draw every state properly; a quick placeholder (a flat white shape for foam) reads as a mistake to players.
- **Perspective:** flat objects on side walls must follow the wall's lines. For anything complicated, generate the coordinates with a script in `tools/` instead of hand-editing.
- Labels can change at runtime (an exit becomes "on to Chapter N").

### Dialogue
- `say(lines, done?)` takes a string or `[[who, text], …]`; clicking advances; `done` runs after the last line. Text types out (instantly with reduced motion).
- A portrait per speaker, a colour per speaker, and a speaker label that can depend on the chapter (the narrator's label is the room's name).

### Close-ups
- `openModal(title, subtitle, html, onOpen?, onClose?)`; bind events in `onOpen`. Timers must check their elements still exist: the player can close at any time.
- Typical solve: set the flag, save, update visuals, play a chord, short feedback, then close and continue the story.

### Items
- `ITEMS[id] = { name, desc, svg }`; select an item, then click a hotspot: `useItem(item, hotspot)`. Deselect before `useItem` runs. Every "wrong place" gets a helpful line.

### Hints
- `HINTS[stage] = [nudge, answer]`, and one `stageN()` per chapter that returns the current stage from the flags. The Hint button shows the nudge first, then the answer.

### Chapters, end screens, scores
- `chapterDone()`, `nextChapter()`, exit labels, title menu with chapter buttons, end screen per chapter (eyebrow, title, note, next button).
- **Scores** in their own storage key: best time and fewest hints per chapter, kept separately, across new games, with ranks, totals and achievements in an overview from the title menu. Record them at the moment a chapter is finished; recover what you can from older saves.

---

## 4. Languages

- **The first language stays in the code; translations live in plain text files** (`lang/nl/*.txt`) as pairs: `= English text` then `> Translated text`. `\n` is a line break; `~ regex` + `> replacement with $1` handles text with numbers. Easy to read and edit for anyone, including people who don't code.
- **Most text needs no code changes:** a `MutationObserver` translates every text node and the `title`, `aria-label`, `data-label`, `placeholder` and `alt` attributes as they appear. Dialogue is translated in `say()`. `translate="no"` skips an element.
- **Use `tx(template, vars)` when code builds text from pieces** (numbers, names, markup): translate the whole sentence as one template with `{placeholders}`, and translate the pieces too. A sentence glued together with `+` can't be translated.
- **Word puzzles need a version per language**, chosen by translating the English answer (an encoded note decodes to the player's language; letters on bottles spell a word in their language). Accept both languages' answers where it's harmless. Code, commands, SQL, HTTP and real error messages stay as they are.
- Switching language re-translates the page and restores the original from remembered text; hooks redraw what code built. Detect the browser language on the first visit.
- A **checker script** lists untranslated text and fails on stale keys and conflicting translations; a test runs it. Every new English line needs its translation in the same change.

---

## 5. Sound, voices and motion

- **Sound effects** with tiny Web Audio beeps and chords (no files).
- **Ambience per room**, generated with Web Audio (filtered noise, hums, little events), reacting to the story (a fire crackles until it's out). Re-check every second against a key like `server+on+fire` and rebuild only when it changes. Keep levels low, under the dialogue. Resume the audio context on the first click or tap; silence on the title screen and hidden tabs.
- **Optional voices** with the Web Speech API (`speechSynthesis`, `SpeechSynthesisUtterance`): off by default, each speaker has a pitch, speed and voice slot, the language follows the game, symbols are stripped, speech stops on the next line, Menu and language switch. Hide the button where speech isn't supported.
- **A Motion setting (auto / on / off).** Some browsers (notably Firefox) pass on the operating system's "reduce animations" setting, so everything stood still for players who never asked for that. Use one `reducedMotion()` function everywhere, a CSS kill-switch as the last rule, and pause SMIL animations by hand (they ignore CSS).

---

## 6. Phones

- The stage is **16:9 and sized against the viewport height**. On portrait phones the room is wider than the screen and **pans sideways**, with a "swipe to look around" hint and a funny "turn your phone" banner that can be dismissed. Short landscape screens get compact rules.
- On touch screens the text says "tap", taps blur the hotspot, and **nothing important lives only in a hover tooltip**.
- Check every close-up at 412×915 and 915×412 for sideways overflow (there's a test for it), also in every language: translations are longer.

---

## 7. The installable app, versions and updates

- `manifest.webmanifest` with icons (an SVG source, PNGs rendered from it).
- **Service worker:** the page and the game's own files **network-first with `cache: 'no-cache'`** (GitHub Pages lets browsers reuse files for 10 minutes; without this, players got old files, or a mix of old and new ones, after an update), the cache as the offline fallback, and the offline cache filled with `cache: 'reload'`. Fonts cache-first.
- **A version number** (`GAME_VERSION` in `boot.js`, the same number as the service worker's cache name; a test checks they match), shown on the title screen. Bump it on every change.
- **An update bar:** the service worker tells open pages its version; a page running an older one shows "A new version is ready · Reload" (saving first).

---

## 8. Tests

- **Playwright** plays the game in a real browser: one full playthrough per chapter (including some wrong moves), plus progress and saving, scores, the installable app and offline mode, phone layouts (Pixel 7), languages, sound/voices and motion. Firefox runs the motion tests in CI.
- **Helpers:** `seed(page, state, unlocks)` starts from a prepared save; `hs(page, id)` clicks a hotspot by id; `skip(page)` clicks through dialogue; `useSlot`, `closeModal`, `waitModalClosed`, `expectWin`.
- **Stub what the test browser lacks** (e.g. replace `speechSynthesis` with a recorder) and test the logic around it.
- **Check what the player sees, not just the state.** A bug that stopped dialogue text from appearing passed every test that only checked flags; one phone test that read the dialogue caught it.
- Run the layout tests in every language (an environment variable picks the language).
- Never depend on randomness.

---

## 9. GitHub, CI and AI agents

- **Never push to `main`**: every change is a branch from the latest `main` and a pull request; the owner reviews and merges (squash). Fetch first, because `main` moves.
- **CI** runs all tests on every push and pull request (Node version from `.nvmrc`, current action versions). Dependabot or Renovate keeps actions and Playwright up to date.
- **AI agents in GitHub Actions** (optional): an "Idea" issue form → a *refine* agent writes a concrete plan → the owner approves with a label → a *build* agent opens a PR → *review* and *playtest* agents comment. They need a `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`) or a working `ANTHROPIC_API_KEY` with credit as a repository secret; without it every PR gets red agent checks.
- **`AGENTS.md` is the project's memory** (with `CLAUDE.md` importing it): repository map, how the code fits together, state and storage keys, the puzzle solutions (spoilers, needed for testing), gotchas, tone guide, checklists. Update it in the same PR as the change.

---

## 10. Lessons learned (mistakes we made, so you don't have to)

- **`[hidden]{display:none!important}`**: components with `display:flex` otherwise ignore `hidden`.
- **CSS class names are global too**: a new class clashed with an existing one in another chapter's CSS. Search before naming.
- **Text inside JS template strings is HTML**: escape `<`, `&` and clashing quotes; prefer typographic apostrophes.
- **Careful with edits that add a comment to a line**: twice, code after a new `//` comment silently stopped running (a chapter start and the dialogue text). Put comments on their own line, and test what the player sees.
- **Show a version number from the start**: it ends "is it the old version?" guessing.
- **Save results at the moment they happen** (scores, unlocks); you can't rebuild them later.
- **Keep what players type** in close-ups; they close things to go and look.
- **Never use `alert/confirm/prompt`**; build confirmations into the UI.
- **Accessibility:** buttons have `type="button"`; inputs have labels or `aria-label`; hotspots get `tabindex`/`role="button"`; a key (Space) reveals all hotspots.
- **Perspective and drawn details matter**: a flat object at the wrong angle or a placeholder shape gets noticed immediately.
- **Unique names:** check a hotspot id, SVG id, storage key or global name isn't already used.

---

## 11. Checklists

### Adding a chapter
1. `scenes/<room>.svg` (prefixed ids, hotspot rects last) and add it to the scene list in `boot.js`.
2. `css/chapterN.css`, linked before `animations.css`.
3. `js/chapterN.js`: unlock key and functions, hotspot handlers, puzzles, intro, start, win; add it to the script list (before `hints`).
4. Hints and `stageN()`.
5. Wire it up: chapter done/next, end screen text, exit labels, continue message, achievements, the chapter button on the title screen, the room toggle and chapter title, the narrator label, new items and item uses.
6. Translations: `lang/<code>/chN.txt`, new labels in the scenes file.
7. Service worker: new files in the file list; bump the version (cache name and `GAME_VERSION`).
8. Tests: a playthrough, the new room in the phone test; README and `AGENTS.md` (including the solutions table).

### Before every PR
- Version bumped; new files listed in the service worker.
- Translations added; the translation checker passes.
- All tests pass, the phone tests also in the other languages.
- `AGENTS.md` updated.
- Screenshots checked for anything visual, at desktop and phone sizes.

---

## 12. Starting prompt for a new project

Paste this into a new Claude Code session in an empty repository (after copying this file to `docs/blueprint.md`), and fill in the brackets:

```
I want to build a browser point-and-click escape room with the theme [THEME],
in the same way as described in docs/blueprint.md. Read it first and follow its
technology choices, structure, tone rules and checklists.

Theme and setting: [where it happens, the mood, inspirations]
Characters: [3–5 characters with their personality and catchphrases]
What players should learn: [the real ideas of the theme, one per puzzle]
Languages: [e.g. UK English and Dutch]
Repository: [owner/name] (GitHub Pages)

Start with Chapter 1: one room, 5–6 puzzles, intro and end screen, hints, the
title menu, saving, the installable app and tests. Write AGENTS.md for this project
as you go. Open a pull request per change; never push to main.
```
