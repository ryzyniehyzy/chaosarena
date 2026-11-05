/* Warstwa Ultimate korzysta z istniejącego pokoju, portfeli i renderowania Areny. */
window.RudaUltimateUI = (function () {
  'use strict';
  function create(bridge) {
    const U = window.RudaUltimate, A = window.RudaArcade;
    const $ = id => document.getElementById(id);
    const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const copy = x => JSON.parse(JSON.stringify(x));
    const check = (ok,msg) => { if(!ok) throw new Error(msg); };
    const get = bridge.getState, now = bridge.now;
    const board = window.RudaBoard, baseTiles = copy(board.BOARD_TILES), baseGroups = copy(board.GROUPS);
    const pawnSvg = {
      pigeon:'<svg viewBox="0 0 48 48"><defs><linearGradient id="pg" x2="1" y2="1"><stop stop-color="#d4edf4"/><stop offset="1" stop-color="#668b97"/></linearGradient></defs><ellipse cx="24" cy="40" rx="16" ry="4" fill="#0004"/><path d="M7 29Q13 22 23 24L28 12Q32 6 38 12L39 20L45 22L38 25Q36 38 23 38Q13 38 7 29" fill="url(#pg)" stroke="#243d46" stroke-width="2"/><path d="M17 27Q30 24 31 31L19 35" fill="#6a8295"/><path d="M28 21L37 24" stroke="#45a99a" stroke-width="4"/><circle cx="35" cy="15" r="2" fill="#122b30"/><path d="M20 39V44M29 39V44" stroke="#eeb96b" stroke-width="2"/></svg>',
      pickaxe:'<svg viewBox="0 0 48 48"><defs><linearGradient id="px"><stop stop-color="#fff0a5"/><stop offset=".5" stop-color="#e9bd54"/><stop offset="1" stop-color="#8d571d"/></linearGradient></defs><ellipse cx="24" cy="41" rx="17" ry="4" fill="#0004"/><path d="M10 40L28 12L33 16L16 44Z" fill="#9e663f" stroke="#4c3024" stroke-width="2"/><path d="M6 15Q22 0 43 22L37 20Q23 8 11 20Z" fill="url(#px)" stroke="#75531c" stroke-width="2"/><path d="M34 6V14M30 10H38" stroke="#fff2b6" stroke-width="2"/></svg>',
      lamp:'<svg viewBox="0 0 48 48"><defs><radialGradient id="lm"><stop stop-color="#fff6b3"/><stop offset="1" stop-color="#e9ad4f"/></radialGradient></defs><ellipse cx="24" cy="42" rx="15" ry="4" fill="#0004"/><path d="M17 10V7Q24 0 31 7V10" fill="none" stroke="#eeb96b" stroke-width="3"/><rect x="15" y="13" width="18" height="25" rx="6" fill="url(#lm)" stroke="#86692f" stroke-width="3"/><path d="M13 13H35L30 7H18Z M13 38H35L37 43H11Z" fill="#bf8f46" stroke="#75531c" stroke-width="2"/><path d="M24 34Q15 29 24 20Q31 30 24 34" fill="#fff5c1"/><path d="M16 15V36M32 15V36" stroke="#956c32" stroke-width="2"/></svg>'
    };
    let renderedScenario = '', featureBusy = false, driverId = '', towerType = 'HUTA';
    let runtime = null, lastFrame = performance.now(), lastSnapshot = 0, snapshotBusy = false, lastInputAt = 0, lastInputJson = '', lastBotSlot = 0;
    let heard = new Set(), soundReady = false, lastSoundSeen = 0;
    const keys = new Set(), touch = {left:false,right:false,throttle:false,brake:false,mine:false};
    function viewer() { return bridge.getViewer(); }
    function canAct(id) { const s=get(),p=s?.players.find(p=>p.id===id);return !!p&&!p.isBot&&(!s.isOnline||p.clientToken===bridge.token()); }
    function profileFor(p) {
      if(p.clientToken!==bridge.token()) return p;
      try { const profile=JSON.parse(bridge.storage.getItem('ruda_ultimate_profile')||'{}'); return {...p,...profile,powerUp:p.powerUp}; }
      catch(e){return p;}
    }
    function persistProfile() {
      const s=get(),p=s?.players.find(p=>p.clientToken===bridge.token()); if(!p)return;
      const profile={arcadeCash:p.arcadeCash,ownedCosmetics:p.ownedCosmetics||[],equippedPawn:p.equippedPawn||'',equippedFrame:p.equippedFrame||'',equippedNick:p.equippedNick||''};
      try{bridge.storage.setItem('ruda_ultimate_profile',JSON.stringify(profile));}catch(e){}
    }
    function applyScenario(id) {
      const scenario=U.SCENARIOS.some(x=>x.id===id)?id:'CLASSIC';
      board.BOARD_TILES.forEach((t,i)=>{Object.assign(t,copy(baseTiles[i]));});
      Object.keys(baseGroups).forEach(k=>{Object.assign(board.GROUPS[k],baseGroups[k]);});
      const properties=board.BOARD_TILES.filter(t=>t.type==='PROPERTY');
      if(scenario==='MINE') {
        const names=['Przekop Burloch','Chodnik Kaufhaus','Pokład Godula 301','Lampownia Godula','Ściana Pokój 402','Komora Czarny Las','Przodek Kochłowice','Wyrobisko Radoszowy','Pokład Gwarek 405','Chodnik Górnośląski','Komora Skałka','Przodek Bielszowice','Chodnik Kokota','Ściana Ruda 510','Komora Aquadrom','Rozdzielnia Halemba','Pokład Halemba 506','Przekop Ficinus','Podszybie Andrzej','Magazyn Wirek','Piec pod ziemią','Komora Skarbnika'];
        properties.forEach((t,i)=>{t.name='Poziom −500 m — '+names[i];t.shortName=names[i];});
        board.BOARD_TILES.filter(t=>t.type==='AIRPORT').forEach((t,i)=>{t.name='Szyb zjazdowy '+['Wanda','Andrzej','Guido','Halemba'][i];t.shortName='⛏ '+['Szyb Wanda','Szyb Andrzej','Szyb Guido','Szyb Halemba'][i];});
        Object.values(board.GROUPS).forEach(g=>{g.name='Poziom −500 · '+g.name;});
        board.GROUPS.AIRPORT.name='Szyby zjazdowe';
        board.BOARD_TILES[4].name='Zawał ścianki chodnikowej';board.BOARD_TILES[4].shortName='Zawał chodnika';
        board.BOARD_TILES[38].name='Wzmocnienie stropu';board.BOARD_TILES[38].shortName='Koszt obudowy';
        board.BOARD_TILES[0].shortName='Podszybie';board.BOARD_TILES[0].name='START — Podszybie −500 m';
      } else if(scenario==='SILESIA') {
        const names=['Zabrze — Kopalnia Guido','Zabrze — Sztolnia Królowa Luiza','Bytom — Rynek','Bytom — Elektrociepłownia Szombierki','Bytom — Opera Śląska','Gliwice — Radiostacja','Gliwice — Rynek','Gliwice — Palmiarnia','Ruda — Kolonia Ficinus','Ruda — Szyb Andrzej','Ruda — Burloch Arena','Zabrze — Wieża Ciśnień','Zabrze — Dom Muzyki i Tańca','Zabrze — Osiedle Zandka','Ruda — Aquadrom','Ruda — Elektrownia Halemba','Ruda — KWK Halemba','Katowice — Nikiszowiec','Katowice — Muzeum Śląskie','Katowice — Spodek','Ruda — Huta Pokój','Gliwice — Zamek Piastowski'];
        properties.forEach((t,i)=>{t.name=names[i];t.shortName=names[i].split(' — ')[1];t.industrial=t.industrial||/Kopalnia|Elektrociepłownia|KWK|Huta/.test(t.name);});
        const groups={ORZEGOW:'Zabrze · Szlak Kopalniany',GODULA:'Bytom · Centrum',KOCHLOWICE:'Gliwice · Stare Miasto',BYKOWINA:'Ruda · Dziedzictwo',BIELSZOWICE:'Zabrze · Kultura',HALEMBA:'Ruda · Halemba',WIREK:'Katowice · Strefa Kultury',NOWY_BYTOM:'Śląsk · Perły Regionu'};
        Object.entries(groups).forEach(([k,v])=>board.GROUPS[k].name=v);
        board.BOARD_TILES.filter(t=>t.type==='AIRPORT').forEach((t,i)=>{t.name='Węzeł podróży '+['Zabrze','Bytom','Gliwice','Katowice'][i];t.shortName='🚋 '+['Zabrze','Bytom','Gliwice','Katowice'][i];});
        board.GROUPS.AIRPORT.name='Węzły komunikacyjne';
      }
      board.BOARD_TILES[20].shortName='Bursa w Rudzie';board.BOARD_TILES[20].name=scenario==='MINE'?'Podziemna Bursa Skarbnika':'Bursa / Giełda w Rudzie';board.BOARD_TILES[20].subtitle='Karty akcji · co 3 rundy';
      return scenario;
    }
    function reduceFeature(s,type,payload,actor,isHost) {
      const p=s.players.find(p=>p.id===actor);check(p,'Dołącz do pokoju, aby wykonać akcję.');
      switch(type) {
        case 'SHOP': U.buyCosmetic(s,actor,payload.item);break;
        case 'UNEQUIP':p.equippedPawn='';p.equippedFrame='';p.equippedNick='';break;
        case 'PERK':check(s.lobbyOpen&&U.PERKS.some(x=>x.id===payload.perk),'Atut wybierasz przed startem partii.');p.powerUp=payload.perk;break;
        case 'SOUND': {
          check(U.SOUNDS.includes(payload.text),'Nieznany okrzyk.');
          check(!s.chat.some(m=>m.playerId===actor&&m.sound&&payload.now-(m.at||0)<1200),'Zaczekaj chwilę przed kolejnym okrzykiem.');
          s.chat.push({id:payload.id,playerId:actor,author:p.name,color:p.color,text:payload.text,sound:true,at:payload.now,time:new Date(payload.now).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Warsaw'}),frame:p.equippedFrame||'',nick:p.equippedNick||''});s.chat=s.chat.slice(-80);break;
        }
        case 'SLOT_START':check(isHost,'Turniej rozpoczyna gospodarz.');check(!s.slotTournament||s.slotTournament.status!=='PLAYING','Turniej już trwa.');s.slotTournament=U.slotsStart(s.players,payload.id,payload.now);break;
        case 'SLOT_SPIN':U.slotsSpin(s.slotTournament,actor,payload.bet,payload.now);U.slotsFinish(s,payload.now);break;
        case 'SLOT_TICK': {
          check(isHost,'Zegar turnieju prowadzi gospodarz.');const t=s.slotTournament;check(t?.status==='PLAYING','Turniej zakończony.');
          if(payload.now<t.deadline)s.players.filter(p=>p.isBot).forEach(bot=>{const e=t.entries[bot.id];if(e&&!e.done)U.slotsSpin(t,bot.id,Math.min(50,e.balance),payload.now);});
          U.slotsFinish(s,payload.now);break;
        }
        case 'KART_START':check(isHost,'Wyścig rozpoczyna gospodarz.');s.kart=A.createKart(s.players,payload.id,payload.seed);s.kartInputs={};break;
        case 'DEFENSE_START':check(isHost,'Obronę rozpoczyna gospodarz.');s.defense=A.createDefense(payload.id,payload.seed);s.defenseCommands={};break;
        case 'LIVE_REWARD': {
          check(isHost,'Nagrody rozlicza gospodarz.');check(['kart','defense'].includes(payload.key),'Nieznana gra.');
          const live=s[payload.key];check(live?.id===payload.session&&['FINISHED','WON','LOST'].includes(live.status),'Ta rozgrywka nie jest zakończona.');
          if(!live.rewarded){live.rewarded=true;s.players.forEach(p=>{if(payload.key==='kart')p.arcadeCash+=live.ranking?.[0]===p.id?500:150;else if(live.status==='WON')p.arcadeCash+=600;});}
          break;
        }
        case 'LIAR_ACTION':U.liarAction(s,actor,payload.card,payload.rank);break;
        default:throw new Error('Nieznana akcja Ultimate.');
      }
      s.revision=(s.revision||0)+1;return s;
    }
    async function dispatch(type,payload={},actor=viewer()?.id,quiet=false) {
      if(featureBusy)return false;
      const s=get();if(!s||!actor)return false;
      payload={...payload,now:now(),id:bridge.makeId('ult'),seed:bridge.seed()};featureBusy=true;
      try {
        if(s.isOnline) {
          const ref=bridge.roomRef();check(ref,'Brak połączenia z pokojem.');let failure=null;
          const result=await ref.transaction(raw=> {
            if(!raw)return;
            try {
              const latest=bridge.normalize(copy(raw)), member=latest.players.find(p=>p.clientToken===bridge.token());
              check(member,'Nie należysz do tego pokoju.');
              const host=latest.hostToken===bridge.token(),target=latest.players.find(p=>p.id===actor);
              check(actor===member.id||(host&&target?.isBot),'Sterujesz wyłącznie własnym graczem.');
              return bridge.sanitize(reduceFeature(latest,type,payload,actor,host));
            }catch(e){failure=e;return;}
          },undefined,false);
          check(result.committed,failure?.message||'Zmiana nie została zapisana.');bridge.accept(result.snapshot.val());
        } else {bridge.accept(reduceFeature(copy(s),type,payload,actor,true));bridge.save();}
        persistProfile();return true;
      }catch(e){if(!quiet)bridge.toast(e.message||'Nie udało się wykonać akcji.');return false;}
      finally{featureBusy=false;}
    }
    function text(id,value){if($(id))$(id).textContent=value;}
    function renderEvent() {
      const s=get(),e=s.ultimate.activeEvent,el=$('ultimate-event');if(!el)return;
      el.classList.toggle('is-crisis',e?.id==='METHANE');
      el.innerHTML=e?`<span class="event-icon">${e.icon}</span><div><strong>${esc(e.name)} · jeszcze ${e.untilRound-s.round} rundy</strong><small>${esc(e.text)}</small></div>`:`<span class="event-icon">⚒️</span><div><strong>Szychta spokojna · wydarzenie w rundzie ${Math.floor(s.round/5)*5+5}</strong><small>Co 5 rund nowa reguła na 2 rundy · Bursa: dostawa co 3 rundy</small></div>`;
    }
    function monoButton(label,type,extra={},actor) {return `<button class="btn-ghost" data-mono-ultimate="${type}" data-payload="${esc(JSON.stringify(extra))}" data-actor="${esc(actor||'')}">${label}</button>`;}
    function renderChoices() {
      const s=get(),dock=$('ultimate-choice-dock');if(!dock)return;
      let html='',actor='';
      if(s.preemption){actor=s.preemption.candidates[0];const a=s.preemption.auction,p=s.players.find(p=>p.id===actor);html=`<h4>📜 ${esc(p?.name)}: prawo pierwokupu</h4><p>${esc(board.BOARD_TILES[a.tileIndex].shortName)} · przejęcie za $${a.openingPrice||1}. Najwyższa oferta $${a.highBid} czeka na decyzję.</p>`;if(canAct(actor))html+=monoButton('Przejmuję za $1','PREEMPT_YES',{},actor)+monoButton('Rezygnuję','PREEMPT_NO',{},actor);}
      else if(s.pendingMove){actor=s.pendingMove.playerId;const p=s.players.find(p=>p.id===actor);html='<h4>🛒 Wagonik: wybierz miejsce lądowania</h4>';if(canAct(actor))[-2,0,2].forEach(d=>{const target=(p.position+Math.max(0,s.pendingMove.steps+d))%40;html+=monoButton(`${d===0?'Zwykły ruch':(d>0?'+2 pola':'−2 pola')} · ${esc(board.BOARD_TILES[target].shortName)}`,'CART',{direction:d},actor);});}
      else if(s.rentOffer){actor=s.rentOffer.playerId;html=`<h4>🛡️ Czynsz $${s.rentOffer.amount}</h4><p>Użyć jednorazowych pleców u Sztygara?</p>`;if(canAct(actor))html+=monoButton('Użyj atutu · nie płacę','SKIP_RENT',{},actor)+monoButton('Zapłać czynsz','PAY_RENT',{},actor);}
      dock.innerHTML=html;dock.classList.toggle('hidden',!html);dock.classList.toggle('ability-box',!!html);dock.classList.toggle('ultimate-choice',!!html);
      if(html && !canAct(actor))dock.insertAdjacentHTML('beforeend','<p>Oczekiwanie na decyzję gracza…</p>');
    }
    function renderTools() {
      const s=get(),p=viewer(),el=$('ultimate-player-tools');if(!p||!el)return;
      const perk=U.PERKS.find(x=>x.id===p.powerUp),current=s.players[s.turnIndex],myTurn=canAct(p.id)&&current.id===p.id;
      let html=`<p>${esc(p.name)} · portfel gier: <strong>$${p.arcadeCash} arcadeCash</strong></p><div class="ability-box"><strong>${esc(perk.name)} ${p.powerUsed?'✓ wykorzystano':'· gotowy'}</strong><p>${esc(perk.text)}</p></div>`;
      if(s.activeGame==='MONOPOLY') {
        const abilities={helmet:'Pierwszy dom lub pierwsza naprawa gratis. '+(p.helmetUsed?'Wykorzystano.':'Umiejętność gotowa.'),cool:'Widzisz przechowywane karty Szansy i karty akcji rywali.',cart:'Po rzucie wybierasz przesunięcie lądowania o ±2. '+(p.cartUsed?'Wykorzystano.':'Umiejętność gotowa.')};
        if(abilities[p.avatar])html+=`<div class="ability-box"><strong>Umiejętność postaci</strong><p>${abilities[p.avatar]}</p></div>`;
        if(p.avatar==='cool')html+=`<div class="ability-box"><strong>🔍 Okulary Szefa</strong>${s.players.filter(x=>x.id!==p.id).map(x=>`<p>${esc(x.name)}: ${x.pardonCards} × wyjście z Izby${x.actionCards.length?' · '+x.actionCards.map(id=>esc(U.MARKET.find(m=>m.id===id)?.name)).join(', '):' · bez kart Bursy'}</p>`).join('')}</div>`;
        if(myTurn&&s.round===1&&s.turnPhase==='ROLL'&&!p.inJail&&p.powerUp==='JUMP'&&!p.powerUsed){html+=`<div class="ability-box"><strong>Zjazd bez Kolejki</strong><div class="ultimate-actions"><select id="ultimate-jump-target" aria-label="Wolna działka">${board.BOARD_TILES.filter(t=>s.properties[t.index]&&!s.properties[t.index].ownerId).map(t=>`<option value="${t.index}">${esc(t.shortName)} · $${t.price}</option>`).join('')}</select><button class="btn-ghost" data-jump>Skocz zamiast rzutu</button></div></div>`;}
        if(p.actionCards.length)html+=`<div class="ability-box"><strong>📦 Karty z Bursy</strong>${p.actionCards.map(id=>`<p>${esc(U.MARKET.find(m=>m.id===id).name)}</p>`).join('')}${p.actionCards.includes('BAIL')&&p.inJail&&myTurn?monoButton('Legalna Kaucja · wyjdź gratis','ACTION_BAIL',{},p.id):''}${p.actionCards.includes('BRIBE')&&myTurn?`<div class="ultimate-actions"><select id="bribe-from" aria-label="Działka zastawiona">${board.BOARD_TILES.filter(t=>s.properties[t.index]?.ownerId===p.id&&s.properties[t.index].mortgaged).map(t=>`<option value="${t.index}">${esc(t.shortName)}</option>`).join('')}</select><select id="bribe-to" aria-label="Nowa działka pod hipotekę">${board.BOARD_TILES.filter(t=>s.properties[t.index]?.ownerId===p.id&&!s.properties[t.index].mortgaged).map(t=>`<option value="${t.index}">${esc(t.shortName)}</option>`).join('')}</select><button class="btn-ghost" data-bribe>Przenieś hipotekę</button></div>`:''}</div>`;
        const m=s.ultimate.market;html+=`<div class="ability-box"><strong>📦 Bursa / Giełda w Rudzie</strong><p>${m&&!m.sold?esc(U.MARKET.find(x=>x.id===m.cardId)?.name)+' · licytacja od $50':'Następna dostawa w rundzie '+(Math.floor(s.round/3)*3+3)+'.'}</p>${myTurn&&m&&!m.sold&&['ROLL','END'].includes(s.turnPhase)?monoButton('Otwórz licytację karty','MARKET_OPEN',{},p.id):''}</div>`;
        const styled=Object.keys(s.districtStyles).filter(g=>U.prestige(s,g,board.BOARD_TILES).active);
        if(styled.length)html+=`<div class="ability-box"><strong>🏛️ Prestiż dzielnic</strong>${styled.map(g=>`<p>${esc(board.GROUPS[g].name)} · ${U.prestige(s,g,board.BOARD_TILES).value} pkt · czynsz +30%</p>`).join('')}</div>`;
      }
      html+='<div class="ultimate-actions"><button class="btn-ghost" data-shop-open>🛍️ Gadżety</button><button class="btn-ghost" data-guide-open>📖 Dodatki i zasady</button></div>';
      el.innerHTML=html;renderChoices();
      board.BOARD_TILES.forEach(t=>{const cell=document.querySelector(`.board-tile[data-index="${t.index}"]`),pr=s.properties[t.index];if(!cell)return;const style=s.districtStyles[t.group];cell.classList.toggle('architectural-tile',!!style&&!!pr&&U.prestige(s,t.group,board.BOARD_TILES).active);cell.classList.toggle('modern-tile',style?.style==='MODERN');cell.classList.toggle('crisis-tile',s.ultimate.activeEvent?.id==='METHANE'&&t.group==='HALEMBA'&&pr?.level>0);});
    }
    function property(index) {
      const s=get(),t=board.BOARD_TILES[index],p=viewer(),set=board.BOARD_TILES.filter(x=>x.type==='PROPERTY'&&x.group===t?.group);
      let el=$('ultimate-architecture');if(!el){el=document.createElement('div');el.id='ultimate-architecture';el.className='ability-box';$('pm-upgrade-box').after(el);}
      if(t?.type!=='PROPERTY'){el.innerHTML='';return;}
      const prest=U.prestige(s,t.group,board.BOARD_TILES),style=s.districtStyles[t.group];
      el.innerHTML=`<p><strong>🏛️ Prestiż dzielnicy: ${prest.value} pkt</strong> ${style?'· '+esc(U.STYLES.find(x=>x.id===style.style)?.name)+(prest.active?' · czynsz +30%':' · bonus czeka na hotel i komplet'):'· styl wymaga hotelu'}</p>`;
      if(!style&&p&&canAct(p.id)&&s.players[s.turnIndex].id===p.id&&set.length&&set.every(x=>s.properties[x.index]?.ownerId===p.id)&&set.some(x=>s.properties[x.index]?.level===5))el.innerHTML+='<div class="ultimate-actions">'+U.STYLES.map(x=>monoButton(`${x.icon} ${esc(x.name)} · $300`,'STYLE',{index,style:x.id},p.id)).join('')+'</div>';
    }
    function openShop() {
      const p=viewer();if(!p)return;
      bridge.modal('🛍️ Giełda Gadżetów',`<p class="shop-wallet">${esc(p.name)} · $${p.arcadeCash} arcadeCash</p><p class="arcade-help">Odblokowane ozdoby zostają w profilu na tym urządzeniu. Skórka pionka zachowuje umiejętność wybranej postaci.</p><button class="btn-ghost shop-reset" data-unequip>Przywróć podstawowy wygląd</button><div class="shop-grid">${U.SHOP.map(item=>{const owned=p.ownedCosmetics.includes(item.id),equipped=[p.equippedPawn,p.equippedFrame,p.equippedNick].includes(item.id);return `<article class="shop-item"><div class="shop-icon">${pawnSvg[item.id]||item.icon}</div><h3>${item.name}</h3><p>${item.text}</p><button class="btn-ghost" data-shop-item="${item.id}" ${equipped?'disabled':''}>${equipped?'✓ Założono':owned?'Załóż':`Odblokuj · $${item.price}`}</button></article>`;}).join('')}</div>`);
    }
    function openGuide() {
      bridge.modal('📖 Ruda Arena Ultimate',`<div class="ultimate-guide"><p>Dziesięć gier przy wspólnym stole. Monopoly i portfel minigier mają osobne pieniądze; zakupy w Giełdzie Gadżetów używają $arcadeCash.</p><h3>⚒️ Monopoly: szychta i atuty</h3><p>Każdy gracz wybiera jeden atut przed startem. Co 5 rund losuje się wydarzenie działające przez bieżącą i następną rundę. Dotacja Premiera wynosi $150 raz na gracza po przejściu przez START w czasie wydarzenia.</p><p>Hełm daje pierwszy dom lub naprawę gratis. Okulary pokazują przechowywane karty rywali. Wagonik pozwala raz zmienić lądowanie po rzucie o 2 pola. Decyzje wyświetlają się przy przyciskach rzutu.</p><h3>📦 Bursa i architektura</h3><p>Bursa na polu 20 dostaje nową kartę co 3 rundy. Aktualną ofertę może wystawić na wspólną licytację gracz w swojej turze także z panelu Szychta Ultimate. Cena wywoławcza karty: $50. Kaucja zwalnia z Izby, a urzędnik przenosi hipotekę na własną niezabudowaną działkę o nie niższej cenie, bez wypłaty różnicy.</p><p>Po zbudowaniu hotelu wykup styl całej dzielnicy za $300 w szczegółach działki. Prestiż (suma poziomów zabudowy) ×2, czynsz +30%, z zaokrągleniem w górę. Bonus wymaga hotelu, kompletu i braku hipotek. Pierwokup działki kosztuje $1, czyli jej cenę wywoławczą; nie dotyczy kart Bursy. Wiele uprawnień rozstrzyga kolejność od gracza aktualnej tury.</p><h3>🃏 Sznaps i Fart</h3><p>W talii są po dwie karty obu akcji. Zaznacz jedną, następnie naciśnij Wyłóż. Sznaps odkrywa jedną kartę gracza po prawej. Fart zmienia figurę według selektora. Można użyć jednej akcji, a potem zagrać zwykłe karty w tej samej turze.</p><h3>🎰 Turniej Goduli</h3><p>Każdy zaczyna z budżetem turniejowym $1000. Koniec po 20 obrotach, wyczerpaniu budżetu lub 3 minutach. Wygrywa najwyższe saldo; przy remisie każdy lider otrzymuje $500 arcadeCash. Budżet turnieju jest oddzielny od zwykłego portfela. Ranking aktualizuje się po każdym obrocie.</p><h3>🏎️ Rajd DTŚ i 🛡️ Obrona Szybu</h3><p>Rajd: strzałki lub przyciski dotykowe, Spacja upuszcza klops. Drugi lokalny gracz ma WASD + F. Pozostałych lokalnych kierowców można wybrać z listy; automatyczny pilot prowadzi kierowców bez aktywnego sterowania. Online każdy steruje swoim kartem, gospodarz musi pozostać w grze. Checkpointy zapobiegają skracaniu okrążeń.</p><p>Obrona: wybierz wieżę i pole na planszy albo jego przycisk. Wspólne fundusze i 15 fal; przegrana przy zniszczeniu szybu. Maksymalny poziom wieży to 3. Zmiana aktywnej gry wstrzymuje symulację; czas turnieju kasynowego płynie nadal.</p><h3>🗺️ Mapy, klimat i okrzyki</h3><p>Scenariusz wybierz w pokoju przed nową partią. Ruda, Podziemia −500 m i Rajza po Śląsku zmieniają nazwy i scenerię pól, zachowując 40-pól i ekonomię planszy. Pora dnia korzysta z zegara Warszawy; pogoda jest efektem wizualnym. Śląskie przyciski w czacie pokazują dymki nad pionkiem i używają głosu przeglądarki, gdy jest dostępny.</p><button class="btn-ghost" data-base-rules>Zasady podstawowych ośmiu gier →</button></div>`);
    }
    function renderLobby(avatars) {
      ['local','online'].forEach(scope=> {
        const sel=$(scope+'-perk');if(sel&&!sel.options.length)sel.innerHTML=U.PERKS.map(x=>`<option value="${x.id}">${x.name}</option>`).join('');
        if(sel)text(scope+'-perk-desc',U.PERKS.find(x=>x.id===sel.value)?.text||'');
      });
      document.querySelectorAll('#local-opponents-list .opp-row').forEach((row,i)=> {
        const opponent=bridge.opponents()[i];if(!opponent)return;if(!opponent.powerUp)opponent.powerUp=U.PERKS[(i+1)%3].id;
        const select=document.createElement('select');select.className='opponent-perk';select.setAttribute('aria-label','Atut gracza '+opponent.name);select.innerHTML=U.PERKS.map(x=>`<option value="${x.id}" ${opponent.powerUp===x.id?'selected':''}>${x.name}</option>`).join('');select.onchange=()=>{opponent.powerUp=select.value;};row.append(select);
        const character=document.createElement('select');character.className='opponent-perk';character.setAttribute('aria-label','Postać gracza '+opponent.name);character.innerHTML=avatars.all.map(a=>`<option value="${a.id}" ${opponent.avatar===a.id?'selected':''}>${esc(a.name)}</option>`).join('');character.onchange=()=>{opponent.avatar=character.value;bridge.refreshLobby();};row.append(character);
      });
      const abilityText={helmet:'⛑️ Pierwszy dom lub naprawa gratis.',cool:'🔍 Widzisz przechowywane karty Szansy i Bursy rywali.',cart:'🛒 Raz zmieniasz lądowanie po rzucie o ±2 pola.'};
      text('local-ability-caption',abilityText[avatars.local]||'Postać dekoracyjna. Korzysta z wybranego atutu Skarbnika.');text('online-ability-caption',abilityText[avatars.online]||'Postać dekoracyjna. Korzysta z wybranego atutu Skarbnika.');
    }
    function weather() {
      const sky=$('ultimate-sky')?.value||'auto',weather=$('ultimate-weather')?.value||'auto';
      const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:'Europe/Warsaw'}).format(new Date()));
      document.body.dataset.sky=sky==='auto'?(hour>=6&&hour<10?'dawn':hour>=10&&hour<18?'day':'night'):sky;
      document.body.dataset.weather=weather==='auto'?(document.body.dataset.sky==='dawn'?'fog':'clear'):weather;
    }
    function renderSound() {
      const s=get();if(!s)return;
      const messages=s.chat.filter(m=>m.sound&&U.SOUNDS.includes(m.text));
      if(!soundReady){messages.forEach(m=>heard.add(m.id));soundReady=true;}
      messages.forEach(m=>{
        if(!heard.has(m.id)){heard.add(m.id);if(now()-(m.at||0)<5000&&bridge.soundEnabled()&&'speechSynthesis'in window){const utter=new SpeechSynthesisUtterance(m.text);utter.lang='pl-PL';utter.rate=1;const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('pl'));if(voice)utter.voice=voice;speechSynthesis.speak(utter);}}
        if(now()-(m.at||0)<4000){const p=s.players.find(p=>p.id===m.playerId),box=p&&$('tokens-'+p.position)?.querySelector(`[title="${CSS.escape(p.name)}"]`);if(box&&!box.querySelector('.pawn-bubble')){const b=document.createElement('span');b.className='pawn-bubble';b.textContent=m.text;box.append(b);setTimeout(()=>b.remove(),Math.max(0,4000-(now()-m.at)));}}
      });
      if(heard.size>180)heard=new Set(messages.map(m=>m.id));
    }
    function renderTournament() {
      const s=get(),t=s.slotTournament,el=$('ultimate-tournament');if(!el)return;
      const p=viewer(),e=t?.entries?.[p?.id];
      let html='<h3>🏆 Turniej Maszyn · Godula 777</h3><p>$1000 na start · 20 obrotów lub 3 minuty · nagroda $500 arcadeCash. Budżet turnieju jest osobny.</p>';
      if(!t)html+='<button class="btn-ghost" data-slot-start>Rozpocznij turniej dla stołu</button>';
      else {
        const seconds=Math.max(0,Math.ceil((t.deadline-now())/1000));
        html+=`<div class="row-between"><strong>${t.status==='PLAYING'?`⏱ <span id="slot-timer">${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}</span>`:'🏁 Turniej zakończony'}</strong><small>Po 20 obrotów na gracza</small></div>`;
        const rows=s.players.map(p=>({p,e:t.entries[p.id]})).filter(x=>x.e).sort((a,b)=>b.e.balance-a.e.balance);
        html+='<table class="tournament-table"><thead><tr><th>Gracz</th><th>Saldo</th><th>Obroty</th></tr></thead><tbody>'+rows.map(({p,e},i)=>`<tr><td>${i+1}. ${esc(p.name)}${t.winnerIds&&U.list(t.winnerIds).includes(p.id)?' 🏆':''}</td><td>$${e.balance}</td><td>${e.spins} / 20${e.done?' ✓':''}</td></tr>`).join('')+'</tbody></table>';
        if(e){html+=`<div class="tournament-reels">${(e.last||[]).map(n=>['7️⃣','💎','🍒','🔔','🍋','⛏️'][n]).join(' ')||'🎰 🎰 🎰'}</div>`;if(t.status==='PLAYING'&&!e.done&&seconds>0)html+='<div class="arcade-toolbar"><select id="slot-tournament-bet" aria-label="Stawka turniejowa"><option value="50">$50</option><option value="25">$25</option><option value="100">$100</option></select><button class="btn-ember-full" style="width:auto" data-slot-spin>Obrót turniejowy</button></div>';}
        if(t.status==='FINISHED')html+='<button class="btn-ghost" data-slot-start>Nowy turniej</button>';
      }
      el.innerHTML=html;
      el.querySelectorAll('[data-slot-start]').forEach(b=>{b.disabled=get().isOnline&&!bridge.isHost();});
    }
    function normalizeExtras(s) {
      if(s.slotTournament?.entries){Object.values(s.slotTournament.entries).forEach(e=>{e.last=Array.isArray(e.last)?e.last:Object.values(e.last||{});});}
      ['kart','defense'].forEach(key=>{const live=s[key];if(live?.id){(key==='kart'?['cars','pickups','mines','police','ranking']:['towers','enemies','shots','processed']).forEach(k=>{live[k]=U.list(live[k]);});}});
      return s;
    }
    function render() {
      const s=get();if(!s)return;
      normalizeExtras(s);const scenario=applyScenario(s.scenarioId);document.body.dataset.scenario=scenario;
      if(renderedScenario!==scenario){renderedScenario=scenario;bridge.rebuildBoard();}
      renderEvent();renderTools();renderTournament();renderSound();persistProfile();
      const humans=s.players.filter(p=>!p.isBot);
      if(!driverId||!humans.some(p=>p.id===driverId))driverId=viewer()?.id||humans[0]?.id;
      const options=humans.map(p=>`<option value="${p.id}" ${driverId===p.id?'selected':''}>${esc(p.name)} · strzałki</option>`).join('');
      if($('kart-driver').innerHTML!==options)$('kart-driver').innerHTML=options;
      $('kart-driver').disabled=!!s.isOnline;
      const selector=$('ultimate-local-viewer');selector.classList.toggle('hidden',s.isOnline||['MONOPOLY','LIARS'].includes(s.activeGame));selector.innerHTML=humans.map(p=>`<option value="${p.id}" ${viewer()?.id===p.id?'selected':''}>Portfel: ${esc(p.name)}</option>`).join('');
      $('btn-kart-start').disabled=s.isOnline&&!bridge.isHost();$('btn-defense-start').disabled=s.isOnline&&!bridge.isHost();
      if(!s.kart)drawKart(null);if(!s.defense)drawDefense(null);
    }
    function getInputs() {
      const s=get(),all={...(s.kartInputs||{})};
      const input={steer:(keys.has('ArrowRight')||touch.right?1:0)-(keys.has('ArrowLeft')||touch.left?1:0),throttle:keys.has('ArrowUp')||touch.throttle,brake:keys.has('ArrowDown')||touch.brake,mine:keys.has(' ')||touch.mine};
      const own=s.isOnline?viewer()?.id:driverId;if(own)all[own]=input;
      if(!s.isOnline){const second=s.players.find(p=>!p.isBot&&p.id!==driverId);if(second)all[second.id]={steer:(keys.has('d')?1:0)-(keys.has('a')?1:0),throttle:keys.has('w'),brake:keys.has('s'),mine:keys.has('f')};}
      if(s.isOnline&&own&&bridge.roomRef()&&performance.now()-lastInputAt>100){const serialized=JSON.stringify(input);if(serialized!==lastInputJson||performance.now()-lastInputAt>800){lastInputAt=performance.now();lastInputJson=serialized;bridge.roomRef().child('kartInputs').child(own).set(input).catch(()=>{});}}
      return all;
    }
    async function sendDefense(pad) {
      const s=get();if(!s?.defense?.id||s.defense.status!=='PLAYING'){bridge.toast('Najpierw rozpocznij obronę szybu.');return;}
      const command={id:bridge.makeId('build'),session:s.defense.id,actor:viewer()?.id,pad,type:towerType==='UPGRADE'?'UPGRADE':'BUILD',tower:towerType,at:now()};
      if(!command.actor||!canAct(command.actor))return;
      if(s.isOnline){try{await bridge.roomRef().child('defenseCommands').child(command.id).set(command);}catch(e){bridge.toast('Nie udało się przekazać polecenia budowy.');}}
      else {
        try{const live=runtime?.key==='defense'?runtime.state:s.defense;A.defenseCommand(live,command);s.defense=live;bridge.save();text('td-notice',live.notice);}
        catch(e){bridge.toast(e.message);}
      }
    }
    function processCommands(live) {
      const s=get();U.list(s.defenseCommands).filter(c=>c.session===live.id).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)).forEach(c=>{
        if(!live.processed.includes(c.id)){
          try{check(s.players.some(p=>p.id===c.actor&&!p.isBot),'Nieznany budowniczy.');A.defenseCommand(live,c);}catch(e){live.notice=e.message;}
          live.processed.push(c.id);live.processed=live.processed.slice(-180);
        }
        if(s.isOnline)bridge.roomRef().child('defenseCommands').child(c.id).remove().catch(()=>{});
      });
    }
    async function completeLive(rt) {
      if(rt.completeStarted)return;rt.completeStarted=true;
      try {
        if(snapshotPromise)await snapshotPromise;
        if(get()?.isOnline)await bridge.roomRef().child(rt.key).set(bridge.sanitize(copy(rt.state)));
        else {get()[rt.key]=rt.state;bridge.save();}
        await dispatch('LIVE_REWARD',{key:rt.key,session:rt.state.id},get().players.find(p=>p.clientToken===bridge.token())?.id||get().players[0].id,true);
      }catch(e){rt.completeStarted=false;bridge.toast('Nagroda czeka na ponowne połączenie z pokojem.');}
    }
    let snapshotPromise=null,lastHudAt=0;
    function frame() {
      const s=get(),stamp=performance.now(),dt=Math.min(.065,(stamp-lastFrame)/1000);lastFrame=stamp;
      if(!s||s.lobbyOpen||!['KART','DEFENSE'].includes(s.activeGame))return;
      if(!s.isOnline&&!$('lobby-overlay').classList.contains('hidden'))return;
      const key=s.activeGame==='KART'?'kart':'defense',saved=s[key],host=bridge.isHost();
      if(!saved?.id)return;
      normalizeExtras(s);
      if(!runtime||runtime.key!==key||runtime.state.id!==saved.id){runtime={key,state:copy(saved),seenElapsed:saved.elapsed,botAt:0,completeStarted:false};lastSnapshot=0;}
      if(!host&&runtime.seenElapsed!==saved.elapsed){runtime.state=copy(saved);runtime.seenElapsed=saved.elapsed;}
      const live=runtime.state;
      if(key==='kart') {
        const humans=s.players.filter(p=>!p.isBot),second=humans.find(p=>p.id!==driverId);
        const bots=s.players.filter(p=>p.isBot||(!s.isOnline&&p.id!==driverId&&p.id!==second?.id)).map(p=>p.id);
        A.stepKart(live,getInputs(),bots,dt);drawKart(live);
      } else {
        if(host) {
          processCommands(live);
          if(s.players.some(p=>p.isBot)&&live.status==='PLAYING'&&live.elapsed-runtime.botAt>4.5){
            runtime.botAt=live.elapsed;
            const pad=[11,1,2,7,0,3,9,5,8,6,10,4].find(i=>!live.towers.some(t=>t.pad===i));
            try{
              if(pad!==undefined&&live.funds>=160)A.defenseCommand(live,{pad,type:'BUILD',tower:live.towers.length%3===2?'WATER':'HUTA'});
              else {const tower=live.towers.find(t=>t.level<3&&live.funds>=t.level*100);if(tower)A.defenseCommand(live,{pad:tower.pad,type:'UPGRADE'});}
            }catch(e){}
          }
        }
        A.stepDefense(live,dt);drawDefense(live);
      }
      if(stamp-lastHudAt>160){updateLiveHud(key,live);lastHudAt=stamp;}
      if(host){
        if(!s.isOnline)s[key]=live;
        if(live.status!=='PLAYING'){if(!live.rewarded&&!saved.rewarded)completeLive(runtime);return;}
        if(stamp-lastSnapshot>(s.isOnline?220:1200)&&!snapshotBusy){
          lastSnapshot=stamp;
          if(s.isOnline){snapshotBusy=true;snapshotPromise=bridge.roomRef().child(key).set(bridge.sanitize(copy(live))).catch(()=>{}).finally(()=>{snapshotBusy=false;});}
          else bridge.save();
        }
      }
    }
    function updateLiveHud(key,live) {
      const s=get();
      if(key==='kart'){
        const p=s.isOnline?viewer()?.id:driverId,car=live.cars.find(c=>c.id===p);
        text('kart-laps',`${Math.min(3,(car?.lap||0)+1)} / 3`);text('kart-speed',Math.round((car?.speed||0)*.8)+' km/h');text('kart-mines',car?.mines||0);
        const secs=Math.max(0,Math.floor(live.elapsed));text('kart-time',`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`);
        $('kart-ranking').innerHTML=A.rankKart(live).map((c,i)=>`<span>${i+1}. ${esc(s.players.find(p=>p.id===c.id)?.name)} · ${c.finished?c.finishTime+' s':Math.min(c.lap+1,3)+'/3'}${live.status==='FINISHED'&&i===0?' 🏆':''}</span>`).join('');
      }else{text('td-wave',live.wave+' / 15');text('td-hp',live.hp+'%');text('td-funds','$'+live.funds);text('td-kills',live.kills);text('td-notice',live.notice);}
    }
    function prepareCanvas(id) {const canvas=$(id),ctx=canvas?.getContext('2d');if(!ctx)return null;ctx.clearRect(0,0,900,540);ctx.lineCap='round';ctx.lineJoin='round';return ctx;}
    function pill(ctx,label,x,y,color='#eac480',size=12) {ctx.font=`700 ${size}px Outfit,system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(label,x,y);}
    function mineIcon(ctx,x,y,scale=1) {
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.strokeStyle='#eec784';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-25,25);ctx.lineTo(-16,-32);ctx.lineTo(16,-32);ctx.lineTo(25,25);ctx.moveTo(-20,4);ctx.lineTo(20,4);ctx.moveTo(-18,-14);ctx.lineTo(18,-14);ctx.stroke();ctx.fillStyle='#426457';ctx.fillRect(-32,25,64,16);ctx.strokeStyle='#81cfb5';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-32,15,0,Math.PI*2);ctx.moveTo(-15,-32);ctx.lineTo(15,-32);ctx.moveTo(0,-47);ctx.lineTo(0,-17);ctx.stroke();ctx.restore();
    }
    function drawKart(live) {
      const ctx=prepareCanvas('kart-canvas');if(!ctx)return;
      ctx.fillStyle='#142b26';ctx.fillRect(0,0,900,540);
      ctx.strokeStyle='#203c32';ctx.lineWidth=1;for(let x=0;x<900;x+=38){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,540);ctx.stroke();}for(let y=0;y<540;y+=38){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(900,y);ctx.stroke();}
      ctx.fillStyle='#253e30';[[245,245,70],[600,300,80],[120,485,58],[810,460,55]].forEach(([x,y,r])=>{ctx.beginPath();ctx.moveTo(x-r,y+r*.4);ctx.lineTo(x,y-r*.7);ctx.lineTo(x+r,y+r*.4);ctx.fill();});
      const trace=()=>{ctx.beginPath();ctx.moveTo(...A.TRACK[0]);A.TRACK.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();};
      trace();ctx.strokeStyle='#5f6b5c';ctx.lineWidth=104;ctx.stroke();trace();ctx.strokeStyle='#34423f';ctx.lineWidth=88;ctx.stroke();trace();ctx.strokeStyle='#d6c9a2';ctx.lineWidth=2;ctx.setLineDash([14,18]);ctx.stroke();ctx.setLineDash([]);
      ctx.save();ctx.translate(115,124);ctx.rotate(-.15);for(let r=0;r<6;r++)for(let c=0;c<2;c++){ctx.fillStyle=(r+c)%2?'#fff5da':'#192520';ctx.fillRect(c*8-8,r*12-36,8,12);}ctx.restore();
      A.TRACK.forEach(([x,y],i)=>pill(ctx,A.LANDMARKS[i],x,y+(i<4?-62:63),'#b6c7ae',12));
      mineIcon(ctx,447,258,1.45);pill(ctx,'RAJD DTŚ',450,342,'#edc681',29);pill(ctx,'WĘGIEL W BAK · KLOPS NA DROGĘ',450,371,'#8caa9c',10);
      if(live){
        live.pickups.forEach(p=>{if(p.cooldown<=0){ctx.fillStyle=p.type==='COAL'?'#eac480':'#a2d0ae';ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();pill(ctx,p.type==='COAL'?'⛏':'●',p.x,p.y,'#172a22',18);}});
        live.mines.forEach(m=>{ctx.fillStyle='#ae6f3c';ctx.beginPath();ctx.arc(m.x,m.y,9,0,Math.PI*2);ctx.fill();pill(ctx,'🧆',m.x,m.y,'#fff',17);});
        live.police.forEach(p=>{ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#f3eede';ctx.fillRect(-15,-9,30,18);ctx.fillStyle='#132c3b';ctx.fillRect(-7,-8,12,16);ctx.fillStyle=Math.sin(live.elapsed*14)>0?'#ff6473':'#69beff';ctx.fillRect(-2,-10,6,20);ctx.restore();});
        live.cars.forEach(car=>{const p=get().players.find(p=>p.id===car.id);ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle);ctx.fillStyle='#050f0d';[[-11,-13],[-11,9],[8,-13],[8,9]].forEach(([x,y])=>ctx.fillRect(x,y,8,5));ctx.fillStyle=p?.color||'#eec784';ctx.shadowColor=car.boost?'#ffcb6a':'#0008';ctx.shadowBlur=car.boost?18:5;ctx.fillRect(-16,-9,32,18);ctx.fillStyle='#182c26';ctx.fillRect(-7,-7,11,14);ctx.fillStyle='#f2ddab';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();if(car.boost>0){ctx.fillStyle='#ffb547';ctx.beginPath();ctx.moveTo(-16,-6);ctx.lineTo(-32,0);ctx.lineTo(-16,6);ctx.fill();}ctx.restore();pill(ctx,p?.name||'',car.x,car.y-26,'#fff5d4',11);});
        if(live.elapsed<0){ctx.fillStyle='#07130cc9';ctx.fillRect(0,0,900,540);pill(ctx,String(Math.ceil(-live.elapsed)),450,260,'#edc681',94);}
        if(live.status==='FINISHED'){ctx.fillStyle='#07130cc9';ctx.fillRect(210,190,480,150);const id=live.ranking?.[0],p=get().players.find(p=>p.id===id);pill(ctx,'🏁 META · '+(p?.name||''),450,244,'#edc681',30);pill(ctx,'Nagrody zostały przyznane do portfela minigier.',450,295,'#d9e5d2',14);}
      }else {ctx.fillStyle='#07130ca6';ctx.fillRect(235,200,430,110);pill(ctx,'WIDZIMY SIĘ NA DTŚ.',450,240,'#edc681',27);pill(ctx,'Naciśnij Start, by ruszyć z całą ekipą.',450,278,'#cfdfcd',14);}
    }
    function drawDefense(live) {
      const ctx=prepareCanvas('defense-canvas');if(!ctx)return;
      ctx.fillStyle='#152522';ctx.fillRect(0,0,900,540);
      for(let x=0;x<900;x+=45)for(let y=0;y<540;y+=45){ctx.strokeStyle='#294036';ctx.lineWidth=1;ctx.strokeRect(x,y,45,45);}
      ctx.strokeStyle='#3c4237';ctx.lineWidth=66;ctx.beginPath();ctx.moveTo(450,0);ctx.lineTo(450,540);ctx.moveTo(0,270);ctx.lineTo(900,270);ctx.stroke();
      ctx.strokeStyle='#7e6d462b';ctx.lineWidth=2;ctx.setLineDash([4,10]);ctx.beginPath();ctx.moveTo(450,0);ctx.lineTo(450,540);ctx.moveTo(0,270);ctx.lineTo(900,270);ctx.stroke();ctx.setLineDash([]);
      [[45,30],[790,38],[20,450],[795,450]].forEach(([x,y])=>{ctx.fillStyle='#293d30';ctx.beginPath();ctx.moveTo(x,y+50);ctx.lineTo(x+60,y);ctx.lineTo(x+115,y+50);ctx.fill();});
      pill(ctx,'HAŁDA PÓŁNOCNA',450,24,'#8ca497',11);pill(ctx,'HAŁDA POŁUDNIOWA',450,515,'#8ca497',11);
      A.PADS.forEach(([x,y],i)=>{const tower=live?.towers.find(t=>t.pad===i);ctx.fillStyle=tower?'#26483e':'#23372e';ctx.strokeStyle=tower?'#7fae91':'#8a8059';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x-22,y-22,44,44,9);ctx.fill();ctx.stroke();if(tower){const range=(tower.type==='HUTA'?148:160)+tower.level*13;if(towerType==='UPGRADE'){ctx.fillStyle='#81cfb505';ctx.beginPath();ctx.arc(x,y,range,0,Math.PI*2);ctx.fill();}pill(ctx,tower.type==='HUTA'?'⚙':'💧',x,y-2,tower.type==='HUTA'?'#edc681':'#8bdad4',25);pill(ctx,'LV '+tower.level,x,y+32,'#9dc3b1',9);}else pill(ctx,String(i+1),x,y,'#b6ba91',15);});
      ctx.fillStyle='#2a4736';ctx.beginPath();ctx.arc(450,270,62,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#eec78480';ctx.lineWidth=2;ctx.stroke();mineIcon(ctx,450,263,1.25);pill(ctx,'SZYB ANDRZEJ',450,335,'#edc681',12);
      if(live){
        ctx.fillStyle='#2d3d32';ctx.fillRect(412,354,76,6);ctx.fillStyle=live.hp>35?'#81cfb5':'#ff8790';ctx.fillRect(412,354,76*live.hp/100,6);
        live.enemies.forEach(e=>{ctx.fillStyle=['#9ca96c','#b8a57a','#85a899'][e.kind];ctx.beginPath();ctx.arc(e.x,e.y,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#18271d';ctx.fillRect(e.x-5,e.y-2,3,3);ctx.fillRect(e.x+3,e.y-2,3,3);ctx.strokeStyle='#7b8d64';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(e.x-9,e.y+3);ctx.lineTo(e.x-16,e.y-2);ctx.moveTo(e.x+9,e.y+3);ctx.lineTo(e.x+16,e.y-2);ctx.stroke();ctx.fillStyle='#233c30';ctx.fillRect(e.x-12,e.y-19,24,4);ctx.fillStyle=e.slow>0?'#9adfe7':'#d2b566';ctx.fillRect(e.x-12,e.y-19,24*Math.max(0,e.hp/e.maxHp),4);});
        live.shots.forEach(b=>{ctx.strokeStyle=b.water?'#8ccfef':'#f4d391';ctx.lineWidth=b.water?3:2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.tx,b.ty);ctx.stroke();});
        if(live.intermission>0&&live.wave>0&&live.status==='PLAYING')pill(ctx,'KOLEJNA FALA ZA '+Math.ceil(live.intermission)+' s',450,412,'#edc681',16);
        if(live.status!=='PLAYING'){ctx.fillStyle='#07130cdd';ctx.fillRect(160,190,580,150);pill(ctx,live.status==='WON'?'SZYB URATOWANY!':'SZYB ZNISZCZONY',450,242,live.status==='WON'?'#edc681':'#ff8790',34);pill(ctx,live.status==='WON'?'15 fal odpartych · +$600 dla każdego gracza':'Zagrajcie jeszcze raz i rozbudujcie wspólną obronę.',450,290,'#d4e3d6',15);}
      }else {ctx.fillStyle='#07130ca6';ctx.fillRect(180,205,540,110);pill(ctx,'CAŁA EKIPA. JEDEN SZYB.',450,244,'#edc681',27);pill(ctx,'Rozpocznij obronę i postaw pierwsze wieże.',450,282,'#cfdfcd',14);}
    }
    function init() {
      const localViewer=document.createElement('select');localViewer.id='ultimate-local-viewer';localViewer.className='btn-top-action hidden';localViewer.setAttribute('aria-label','Wybierz lokalnego gracza w minigrach');document.querySelector('.topbar-actions').prepend(localViewer);localViewer.onchange=()=>bridge.selectViewer(localViewer.value);
      const dock=document.createElement('div');dock.id='ultimate-choice-dock';dock.className='ultimate-choice hidden';$('monopoly-controls').append(dock);
      const tournament=document.createElement('div');tournament.id='ultimate-tournament';tournament.className='tournament-panel';document.querySelector('.casino-shell').append(tournament);
      $('ultimate-soundboard').innerHTML=U.SOUNDS.map(t=>`<button type="button" data-sound="${esc(t)}">🔊 ${esc(t)}</button>`).join('');
      $('td-pad-buttons').innerHTML=A.PADS.map((p,i)=>`<button class="btn-ghost" data-defense-pad="${i}" aria-label="Buduj lub ulepsz na polu ${i+1}">${i+1}</button>`).join('');
      ['sky','weather'].forEach(type=>{const sel=$('ultimate-'+type),saved=bridge.storage.getItem('ruda_ultimate_'+type);if(saved&&[...sel.options].some(o=>o.value===saved))sel.value=saved;sel.onchange=()=>{bridge.storage.setItem('ruda_ultimate_'+type,sel.value);weather();};});weather();setInterval(weather,60000);
      $('btn-ultimate-shop').onclick=openShop;$('btn-lobby-shop').onclick=openShop;$('btn-open-rules').onclick=openGuide;
      ['local','online'].forEach(scope=>{$(scope+'-perk').onchange=()=>{text(scope+'-perk-desc',U.PERKS.find(x=>x.id===$(scope+'-perk').value)?.text);if(scope==='online'&&get()?.isOnline&&get().lobbyOpen)dispatch('PERK',{perk:$(scope+'-perk').value});};});
      $('btn-kart-start').onclick=()=>dispatch('KART_START');$('btn-defense-start').onclick=()=>dispatch('DEFENSE_START');
      $('kart-driver').onchange=()=>{driverId=$('kart-driver').value;keys.clear();Object.keys(touch).forEach(k=>touch[k]=false);};
      $('defense-canvas').addEventListener('click',e=>{const box=e.currentTarget.getBoundingClientRect(),x=(e.clientX-box.left)*900/box.width,y=(e.clientY-box.top)*540/box.height;let pad=-1,dist=35;A.PADS.forEach(([px,py],i)=>{const d=Math.hypot(x-px,y-py);if(d<dist){dist=d;pad=i;}});if(pad>=0)sendDefense(pad);});
      document.querySelectorAll('[data-tower]').forEach(b=>{b.onclick=()=>{towerType=b.dataset.tower;document.querySelectorAll('[data-tower]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));};});
      document.querySelectorAll('[data-kart-control]').forEach(b=>{const name=b.dataset.kartControl;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touch[name]=true;});['pointerup','pointercancel','lostpointercapture'].forEach(evt=>b.addEventListener(evt,()=>{touch[name]=false;}));});
      window.addEventListener('keydown',e=>{if(get()?.activeGame!=='KART'||!$('lobby-overlay').classList.contains('hidden')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','w','a','s','d','f'].includes(key)){keys.add(key);e.preventDefault();}});
      window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>{keys.clear();Object.keys(touch).forEach(k=>touch[k]=false);});
      document.addEventListener('click',async e=>{
        const button=e.target.closest('button');if(!button)return;
        if(button.hasAttribute('data-mono-ultimate')){await bridge.monopoly(button.dataset.monoUltimate,JSON.parse(button.dataset.payload||'{}'),button.dataset.actor||null);return;}
        if(button.hasAttribute('data-jump')){const target=$('ultimate-jump-target');if(target?.value)await bridge.monopoly('POWER_JUMP',{index:Number(target.value)},viewer()?.id);return;}
        if(button.hasAttribute('data-bribe')){await bridge.monopoly('ACTION_BRIBE',{from:Number($('bribe-from').value),to:Number($('bribe-to').value)},viewer()?.id);return;}
        if(button.hasAttribute('data-shop-open'))openShop();if(button.hasAttribute('data-guide-open'))openGuide();if(button.hasAttribute('data-base-rules'))bridge.baseRules();
        if(button.dataset.shopItem){if(await dispatch('SHOP',{item:button.dataset.shopItem}))openShop();}
        if(button.hasAttribute('data-unequip')){if(await dispatch('UNEQUIP'))openShop();}
        if(button.dataset.sound)dispatch('SOUND',{text:button.dataset.sound});
        if(button.hasAttribute('data-slot-start'))dispatch('SLOT_START');
        if(button.hasAttribute('data-slot-spin'))dispatch('SLOT_SPIN',{bet:Number($('slot-tournament-bet')?.value||50)});
        if(button.dataset.defensePad!==undefined)sendDefense(Number(button.dataset.defensePad));
      });
      setInterval(frame,1000/30);
      setInterval(()=>{const s=get();if(!s)return;const t=s.slotTournament;if(t?.status==='PLAYING'){const sec=Math.max(0,Math.ceil((t.deadline-now())/1000));text('slot-timer',`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`);if(bridge.isHost()&&now()-lastBotSlot>1000&&!s.lobbyOpen){lastBotSlot=now();dispatch('SLOT_TICK',{},s.players.find(p=>p.clientToken===bridge.token())?.id||s.players[0].id,true);}}},500);
    }
    function playLiarAction(cardId,rank,actor){return dispatch('LIAR_ACTION',{card:cardId,rank},actor);}
    return {init,render,renderLobby,property,applyScenario,normalizeExtras,profileFor,persistProfile,pawnSvg,playLiarAction,openGuide,openShop};
  }
  return {create};
})();
