// Using inventory items on hotspots, for every chapter (useItem).
// Loaded in order by js/boot.js; all game files share the same global scope.

function useItem(item, hs){
  if(item==='key'){
    if(hs!=='engine') return say("It's an ignition key. It belongs in the engine panel.");
    take('key'); S.f.keyIn = true; save(); applyVisuals(); beep(300,.1,'triangle'); say("You slide the key into the ignition on the engine panel. Click. Now the systems need switching on."); return openEngine();
  }
  if(item==='usb'){
    if(hs!=='cabinet') return say("A USB stick needs a computer. The Wizard's laptop is in the rune cabinet.");
    if(!S.f.cabinet) return say("The Wizard's laptop is behind the cabinet's glass doors. Solve the runes first.");
    take('usb'); S.f.usbIn = true; save(); applyVisuals(); beep(700,.06); say("You plug SPELL.JS into the Wizard's laptop. It opens the spell in an editor. Moss has left a bug in it. On purpose. Probably."); return openSpell();
  }
  if(item==='batteries'){
    if(hs!=='dragon') return say("The batteries are for something that needs waking up. Something large and cardboard.");
    take('batteries'); S.f.dragonOn = true; save(); applyVisuals(); chord([200,260,330],140);
    return say([["sys","You click the batteries into the dragon's belly. Its eyes glow red. Its wings flap, once, with a cardboard flop."],["dragon","I AM SMAUG-O-TRON 3000. I GUARD THE FIREWALL. ANSWER MY CHALLENGE, OR… OR BE SLIGHTLY DELAYED."]]);
  }
  if(item==='cable'){
    if(hs!=='usb') return say(hs==='dphone' ? "The phone end is sorted. Now the other end needs power: try the lift's service USB port." : "That's not somewhere a cable goes. The lift panel has a service USB port, though.");
    const c = CABLES[S.cable];
    if(S.cable==='ac'){ sel = null; take('cable'); S.f.charged = true; save(); applyVisuals(); chord([392,523,659]);
      return say([["you","USB-A into the flat port, USB-C into the phone's oval port. It fits first time. A small miracle."],["sys","The phone buzzes into life. Battery: 1%… 2%… 4%… and then it stops climbing."],["douglas","It lives! Is it saying anything about torches?"]]); }
    return say(c[3]);
  }
  if(item==='paper'){ if(hs==='fax'){ loadPaper(); return say("You load Denholm's last ream of paper into the fax. It hums approvingly."); } return say("This paper belongs in the fax machine."); }
  if(item==='card') return say(hs==='laptop' ? "Better to type the key into the Wi-Fi settings on the laptop." : "It's a Wi-Fi key. It belongs in the laptop's Wi-Fi settings, not there.");
  if(item==='duck'){ S.ach.duck = true; save();
    const st = stage_(); const lines = HINTS[st];
    return say([['you',"You hold up the duck and explain the problem out loud, step by step…"], ['duck',"…"], ['you', tx('Wait. Saying it out loud helps. {hint}', { hint: tx(lines[0]) })]]); }
  if(item==='ext'){
    if(hs==='fire'){ sel = null; take('ext'); S.f.fireOut = true; save();
      chord([180,140,110],120);
      say([["you","You pull the pin and squeeze. The extinguisher coughs out one small, apologetic British puff."],
           ["you","You give it a firm whack on the side. Made in Britain. WHOOSH."],
           ["sys","Fire out. The breaker panel is reachable."],
           ["moss","Did you put it out? Brilliant. I'll put it in an email to the fire brigade, for their records."]]);
      return applyVisuals(); }
    return say("You point the extinguisher at it. Nothing there is on fire. Yet.");
  }
  say("That doesn't do anything useful.");
}
