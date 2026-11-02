// All hints (two per puzzle: a nudge, then the answer) and how the game decides which puzzle you are on.
// Loaded in order by js/boot.js; all game files share the same global scope.

/* ---------- hints ---------- */
const HINTS = {
  crash: ["Moss's computer has crashed hard. The answering machine on Roy's desk has some classic IT wisdom.", "Open Moss's computer and press the power button on the tower twice: off, then on again."],
  login: ["The login wants Moss's password. The hint says 'where the heart is'. Something on his desk says it too.", "Moss's mug: 'There's no place like 127.0.0.1'. Type 127.0.0.1 as the password."],
  files: ["You're in. Type ls to list the files and cat <filename> to read one.", "Type: cat lockdown.log, then: cat note_to_self.rot13"],
  decode: ["The note is in ROT13: every letter swaps with the one 13 places along. Decode it by hand with the whiteboard table, or let Moss's computer do it: type man tr in the terminal.", "Type: cat note_to_self.rot13 | tr 'A-Za-z' 'N-ZA-Mn-za-m' — it says the code is the answer to life, the universe and everything, in binary. One of the books on the shelf knows the answer."],
  binary: ["The answer is 42. Flip the switches so their values add up to 42.", "42 = 32 + 8 + 2. Switch ON the ones marked 32, 8 and 2 (binary 00101010)."],
  fire: ["There's a fire right in front of the breaker panel. You've seen something red and useful next to the exit door.", "Take the fire extinguisher from the office wall, select it in your inventory, then click the fire."],
  logic: ["The lamp needs the AND gate to get three 1s: from XOR, NOT and OR.", "Set A on, B off, C off, D on. XOR(1,0)=1, NOT(0)=1, OR(0,1)=1."],
  hex: ["With the power back, read the rack display. The yellow sticky note explains hex.", "0x539 = 5×256 + 3×16 + 9 = 1337. Enter 1337 on the exit keypad. Very elite."]
};
Object.assign(HINTS, {
  j_login: ["Jen's laptop is locked, but there's a 'Forgot password?' link. The answers to her security questions are all over her office.", "Pet: the photo on her desk (Sir Purrcival). Shoe designer: the shoe rack (Belladonna). Home town: the postcard (Swindon)."],
  j_slides: ["Open 'What is IT.pptx' on the laptop and fix the acronym on every slide.", "CPU = Central Processing Unit, RAM = Random Access Memory, USB = Universal Serial Bus, HTML = HyperText Markup Language, Wi-Fi = it doesn't stand for anything, IT = Information Technology."],
  j_wifi: ["The projector is on its own Wi-Fi network. Jen hid the key somewhere she'd never look. Her calendar says where.", "Open the shoe rack and look in the Crocs box."],
  j_wifi2: ["Open Wi-Fi on the laptop, choose Boardroom-Projector and type the key from the card in your inventory.", "Network: Boardroom-Projector. Key: SHOES4EVER."],
  j_send: ["Slides fixed, Wi-Fi connected. Time to present.", "In the slides app, press 'Present to boardroom'."],
  j_door: ["The lock wants Jen's own answer, not the right one, plus the code in Messages. Her speaker notes on the last slide hide her answer in Moss's code. Her notepad has the key.", "VAGREARG GUVAT in ROT13 is INTERNET THING. The one-time code is 8086."]
});
function stage2(){
  if(!S.f.lap) return 'j_login';
  if(!slidesDone()) return 'j_slides';
  if(!S.f.wifi) return S.inv.includes('card') ? 'j_wifi2' : 'j_wifi';
  if(!S.f.sent) return 'j_send';
  return 'j_door';
}
Object.assign(HINTS, {
  d_pop: ["Douglas's computer is covered in pop-ups. Only the small ✕ in each pop-up's title bar really closes it.", "Ignore the big coloured buttons inside the pop-ups: they spawn more. Click the red ✕ at the top right of each window."],
  d_cpu: ["The computer is crawling. Open Task Manager and look for programs that use lots of CPU and come from unknown publishers.", "End totally_not_a_virus.exe, free_yacht_screensaver.exe, crypto_miner_lite.exe and cursor_glitter_trail.exe."],
  d_mail: ["Open Mail. Moss's security training makes you mark every email as Phishing or Legit. Check the address after the @, letter by letter.", "Legit: board@reynholm.co.uk, jen.barber@reynholm.co.uk and maurice.moss@reynholm.co.uk. The rest are phishing (watch out for reynho1m with a number 1)."],
  d_backup: ["Use MossBackup to restore the annual report. The Board's email says exactly which version they approved.", "Restore report_FINAL_REAL_use_this.doc: Friday 14:32, 2.4 MB. Not the 0 KB copy."],
  d_safe: ["The fax machine needs paper. Ask Douglas where his father kept the last ream, and where he kept his safe.", "Click the portrait to swing it open. In the database type: SELECT code FROM safe WHERE owner = 'Denholm'; then enter 1966 on the safe."],
  d_fax: ["Clear the jam, load the paper and dial the Board's number from the advert (Douglas can sing it). If the fax shows an error code, the manual next to it explains.", "Open the cover, load the paper, then dial 9 for an outside line followed by 0118 999 881 999 119 725 3, and press Send."]
});
function stage3(){
  if(!S.f.pops) return 'd_pop';
  if(!S.f.cpu) return 'd_cpu';
  if(!S.f.mailDone) return 'd_mail';
  if(!S.f.report) return 'd_backup';
  if(!S.f.paperIn && !S.inv.includes('paper')) return 'd_safe';
  return 'd_fax';
}
Object.assign(HINTS, {
  l_charge: ["Douglas's phone is dead. Roy's backpack is full of cables and the lift panel has a service USB port. Compare the plug shapes at both ends.", "Take the USB-A to USB-C cable from Roy's backpack, select it in your inventory and use it on the service USB port."],
  l_unlock: ["The phone has a pattern lock. Douglas says it's a letter, and Roy knows how to see fingerprints. Tilt the screen to the light.", "Draw a D: top-left, middle-left, bottom-left, bottom-middle, middle-right, top-middle."],
  l_spy: ["The battery is stuck at 4% and the phone keeps making noises. Open Settings and see which app is draining it.", "Uninstall SuperBright Flashlight FREE: it uses 61% of the battery and wants your microphone, contacts and text messages."],
  l_pair: ["Open Smart Building and pair with the lift. The pairing code is on the service display, but you can only see it in the mirror.", "Mirrors flip left and right: read the digits from right to left and swap the 2s and 5s. The code is 205815."],
  l_pass: ["The override needs Moss's passphrase. Ring him on the emergency phone and watch the light. The inspection certificate has a Morse table.", "Short-short-short, short-short-long, long-short-short, long-long-long: S U D O. The passphrase is sudo."],
  l_restart: ["The update is stuck at 99%. Ask Roy what to do. You already know what he'll say.", "Press the power button on the side of the phone, choose Power off, then press the power button again to turn it back on."]
});
function stage4(){
  if(!S.f.charged) return 'l_charge';
  if(!S.f.unlocked) return 'l_unlock';
  if(!S.f.spyGone) return 'l_spy';
  if(!S.f.paired) return 'l_pair';
  if(!S.f.passOK) return 'l_pass';
  return 'l_restart';
}
Object.assign(HINTS, {
  p_hanoi: ["Start with the Tower of Hard Drives on the table. Move the whole stack to the right-hand peg, one drive at a time, never a bigger drive on a smaller one.", "Move the smallest drive every other turn, always one peg to the right (from the right-hand peg it jumps back to the left one). In between, make the only other legal move. 15 moves in total."],
  p_regex: ["The rune cabinet opens for every name its pattern matches, and only those. The regex scroll on the wall explains the symbols.", "^[RM]o\\w{1,2}$ means: starts with R or M, then o, then one or two more letters, then stop. Select Roy, Moss and Rose."],
  p_usb: ["The Wizard's laptop wants a spell on a USB stick. You found one inside the biggest hard drive.", "Select the USB stick in your inventory and click the rune cabinet."],
  p_spell: ["Run the spell on the Wizard's laptop. Something in the loop line is wrong: change it with the dropdown.", "Lists start at 0 and stop before their length. Choose: for (let i = 0; i < runes.length; i++). The output is 628210."],
  p_chest: ["The spell printed a six-digit number. Try it on the treasure chest.", "Enter 628210 on the chest."],
  p_sort: ["The dragon manual says its batteries are behind the potion shelf. Sort the potions from smallest to largest number by swapping neighbours.", "The order is 1, 3, 5, 8, 13, 21, 42, and the labels spell BATTERY. Keep swapping any neighbours where the left one is bigger."],
  p_wake: ["You have batteries. Something cardboard needs them.", "Select the batteries in your inventory and click the dragon."],
  p_dragon: ["Beat the dragon's number game. Always guess the middle of the numbers that are still possible.", "Start with 50. If it says HIGHER, try 75; if LOWER, try 25. Keep halving the gap. Seven guesses are always enough."],
  p_firewall: ["The Firewall admin panel wants a password that follows every rule. A new rule appears each time you pass one.", "One that works: Moss#4900. The digits 4 + 9 + 0 + 0 add up to 13."]
});
function stage5(){
  if(!S.f.hanoi) return 'p_hanoi';
  if(!S.f.cabinet) return 'p_regex';
  if(!S.f.usbIn) return 'p_usb';
  if(!S.f.spell) return 'p_spell';
  if(!S.f.chest) return 'p_chest';
  if(!S.f.sorted) return 'p_sort';
  if(!S.f.dragonOn) return 'p_wake';
  if(!S.f.dragon) return 'p_dragon';
  return 'p_firewall';
}
Object.assign(HINTS, {
  y_log: ["The logbook on the map table is written in numbers. The ASCII table inside its cover turns numbers into letters.", "76 79 79 75 32 85 78 68 69 82 32 84 72 69 32 66 69 76 76 spells LOOK UNDER THE BELL. Type that into the decoder."],
  y_key: ["The logbook told you where the ignition key is hidden.", "Click the brass ship's bell next to the life ring."],
  y_engine: ["Start the engine panel's systems in an order that respects yacht.json. Put the ignition key in first.", "Tap the ignition key slot, then switch on: Battery, Fuel pump, Bilge pump, Navigation computer, Engine, Propeller."],
  y_helm: ["SKIPPER-OS only answers in HTTP status codes. The poster on the wall explains them. You need GET /helm to return 200.", "GET /helm gives 401: log in first. Douglas gets 403, Roy 423 and Jen 404. Log in as Moss, then send GET /helm again."],
  y_radio: ["The harbour radio's berth number has one flipped bit. Every row and column should contain an even number of 1s.", "Row 3 and column 2 are the odd ones out: tap the bit where they cross. The fixed 1s draw a 7. Berth 7."],
  y_nav: ["Program the autopilot to reach Berth 7 without hitting anything. You start facing right.", "Forward, Forward, Right, Forward, Left, then Forward five times."],
  y_captcha: ["The smart gangway wants you to select every square with a dragon. Douglas in a onesie counts.", "Select the inflatable dragon, the Welsh flag, SMAUG-O-TRON 3000, the Komodo dragon and Douglas in a dragon onesie."]
});
function stage6(){
  if(!S.f.logRead) return 'y_log';
  if(!S.f.gotKey) return 'y_key';
  if(!S.f.engine) return 'y_engine';
  if(!S.f.helm) return 'y_helm';
  if(!S.f.parity) return 'y_radio';
  if(!S.f.docked) return 'y_nav';
  return 'y_captcha';
}
function stage_(){
  if(S.ch===6) return stage6();
  if(S.ch===5) return stage5();
  if(S.ch===4) return stage4();
  if(S.ch===3) return stage3();
  if(S.ch===2) return stage2();
  if(!S.f.loggedIn) return S.pc==='login' ? 'login' : 'crash';
  if(!S.f.readNote) return 'files';
  if(!S.f.serverOpen) return S.f.found42 ? 'binary' : 'decode';
  if(!S.f.fireOut) return 'fire';
  if(!S.f.power) return 'logic';
  return 'hex';
}
