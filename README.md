# Hello, IT: The Basement Lockdown

A browser-based point-and-click escape room set in a basement IT department, inspired by *The IT Crowd*. It is a fan project.

You're the new IT temp. Roy is at lunch, Moss is stuck upstairs in the stationery cupboard, and his Lockdown Protocol has sealed the basement. Find the exit override PIN and get out.

## Play

The game speaks **UK English** and **Dutch** (Nederlands). Switch with the **EN · NL** button in the header; the game remembers your choice, and starts in Dutch when your browser is set to Dutch.

Play online at **https://w3nl.github.io/it/** (GitHub Pages: Settings → Pages → deploy from `main`).

To play locally, serve the folder with any static web server. There's no build step. With Node.js:

```bash
npm start
```

Then open http://127.0.0.1:4173. Double-clicking `index.html` doesn't work, because the game loads its room drawings from `scenes/`.

## Project layout

| Folder | What's in it |
|---|---|
| `index.html` | The page: header, stage, menus |
| `css/` | Styles: `base`, one file per chapter, `phone`, `animations` |
| `js/` | Code: `boot` (start-up), `i18n` (languages), `core` (engine), one file per chapter, `items`, `hints`, `app` |
| `lang/nl/` | The Dutch translation, as plain text: each English line followed by its Dutch version |
| `scenes/` | One SVG drawing per room. Open one in a browser or SVG editor to see it |
| `portraits/` | Character portraits (SVG) for the dialogue |
| `tests/` | Playwright tests that play the game |
| `tools/` | Helper scripts: `i18n-check.js` (finds text without a Dutch translation), `lift-panel.py` |

See [AGENTS.md](AGENTS.md) for how it all fits together.

## Tip: watch the series

Never seen *The IT Crowd*? The game is full of references to it. Watch the series on YouTube first, or afterwards to spot all the jokes: [The IT Crowd on YouTube](https://www.youtube.com/show/VLPLQxUFrtzYaUlfC1e_wcoaUGC02HPVHSW4?sbp=QAE%253D).

## Install it as an app

The game is a Progressive Web App. Once it's hosted on GitHub Pages (Settings → Pages → deploy from `main`), you can install it:

- **Android (Chrome):** open the site, then tap **Install** in the game's header, or the menu ⋮ → **Install app**.
- **iPhone/iPad (Safari):** tap Share → **Add to Home Screen**.
- **Desktop (Chrome/Edge):** click the install icon in the address bar, or the game's **Install** button.

After the first visit it also works offline. When a new version comes out while the game is open, a bar offers to reload; your progress is kept. The version number is at the bottom of the title screen. When you change the game, bump `CACHE` in `sw.js` and `GAME_VERSION` in `js/boot.js` (the same number) so installed copies pick up the new version.

## Saved progress

Progress is saved in your browser's `localStorage` after every step: the current chapter and room, solved puzzles, inventory, timer, hints, achievements, and which chapters are unlocked. Your language, sound and motion settings are saved too. Refresh and press **Continue** to carry on. Progress is per browser and per device.

**Scores** on the title screen shows your best time, fewest hints and rank for every chapter you've finished, with the totals and your achievements. A new game keeps them.

## Have an idea?

Open an issue with the **Idea** form. An AI agent investigates it and replies with a plan; once you approve it (label `ready-to-build`), another agent builds it and opens a pull request, which is reviewed and play-tested by more agents. See [docs/agent-workflow.md](docs/agent-workflow.md) for how it works and the one-time setup.

## Working on the game

New contributors (and AI coding agents) should start with [AGENTS.md](AGENTS.md): how the files fit together, where state is saved, how to add a chapter, the puzzle solutions, and the gotchas.

## Tests

The game has automated tests that play it in a real browser with [Playwright](https://playwright.dev): every chapter from start to finish (including some wrong moves), saving and navigation, the installable app and offline mode, phone layouts, and the Dutch version.

```bash
npm install
npx playwright install chromium
npm test
```

The project uses **Node.js 26** (see `.nvmrc`); with nvm, run `nvm use`. GitHub Actions read the same file.

`npm start` serves the game at http://127.0.0.1:4173 if you want to play it locally over http. The tests also run on GitHub Actions for every push and pull request (see `.github/workflows/tests.yml`); if one fails, the HTML report with screenshots is attached to the workflow run.

## Chapters

1. **The Basement Lockdown.** Escape the IT department and the server room: a crashed PC, a login, a working terminal, a ROT13 cipher, binary DIP switches, logic gates and hexadecimal.
2. **Jen's Office.** Jen needs her board presentation, "What is IT?", fixed before 13:30. Reset her password from clues around the office (social engineering), correct her acronyms, join the boardroom Wi-Fi, and beat a two-factor SmartLock whose answer is what *Jen* thinks IT stands for. Unlocks after Chapter 1.
3. **The Executive Floor.** Douglas Reynholm's computer is full of viruses and his office is in Privacy Mode until the Board gets the annual report. Close pop-ups (only the real ✕ works), end malware in Task Manager, sort phishing from real email, restore the right file from backup, query Denholm's safe with SQL, and fax the report. Douglas is in the room and you can talk to him. Unlocks after Chapter 2.
4. **The Lift.** Douglas's phone is dead, full of spyware and, unfortunately, in charge of the lift you're stuck in, between floors 7 and 8, with Douglas and Roy (finally back from lunch). Pick the right cable from Roy's bag, read a pattern lock from screen smudges, uninstall a suspicious free torch app, pair over Bluetooth with a code you can only see in the mirror, decode Moss's Morse code, and get past an update stuck at 99%. Unlocks after Chapter 3.
5. **Dungeons & Datacenters.** Jen's idea: team building in an escape room, built by Moss the Magnificent in the old storeroom. Locked in with Jen and Roy, you solve the Tower of Hard Drives (recursion), a regex rune cabinet, a buggy spell with an off-by-one loop that summons a NaN, a potion shelf you bubble-sort, a cardboard dragon's number game (binary search) and a Firewall whose password rules get sillier and sillier. Unlocks after Chapter 4.
6. **The Yacht.** Douglas booked the harder version on his new yacht, the Douglas II (there is no Douglas I). He presses the big red button and the yacht drifts down the Thames towards the Thames Barrier. Decode Moss's logbook from ASCII, start the engine systems in dependency order, persuade a helm computer that only speaks HTTP status codes, fix a flipped bit in the harbour radio with parity, program the autopilot to the right berth, and pass a CAPTCHA that asks you to select all the dragons. Unlocks after Chapter 5.

## Features

- Seven illustrated rooms you can click through
- An inventory, layered hints, and a rubber duck that gives free hints (rubber-duck debugging)
- Hidden achievements and an end screen that ranks you from "Elite" to "Roy"
- Character portraits next to the dialogue, and a generated ambient soundscape for every room (from server fans to the lift's pan-pipe music)
- Progress is saved in your browser's localStorage
- A **Motion** button: *auto* follows your device's "reduce motion" setting, *on* always animates (handy in Firefox, which passes on that setting from the operating system), *off* stops everything
- Installable as an app (PWA) and playable offline
- Works on phones: in portrait you swipe sideways through each room; in landscape the whole room fits on screen

## Roadmap

- Douglas III? (Douglas is already looking at bigger yachts)
- More puzzles: SQL, regex, stack traces, a patch panel
- Character portraits and ambient sound
