/* Ruda Arena Ultimate — deterministyczne reguły, bez zależności od interfejsu. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RudaUltimate = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const list = x => (Array.isArray(x) ? x : Object.values(x || {})).filter(Boolean);
  const ensure = (ok, message) => { if (!ok) throw new Error(message); };
  const PERKS = [
    { id: 'RENT', name: 'Plecy u Sztygara', text: 'Raz w partii odmawiasz zapłaty czynszu. Decydujesz po wejściu na pole.' },
    { id: 'JUMP', name: 'Zjazd bez Kolejki', text: 'W pierwszej rundzie zamiast rzutu skaczesz na dowolną wolną działkę.' },
    { id: 'FIRST', name: 'Prawo Pierwokupu', text: 'Po licytacji działki możesz przejąć ją za cenę wywoławczą $1, przed rozliczeniem zwycięzcy.' }
  ];
  const EVENTS = [
    { id: 'METHANE', icon: '⚠️', name: 'Awaria Metanowa w Halembie', text: 'Działki Halemby z domami lub hotelem nie pobierają czynszu. Budowa w Halembie jest wstrzymana.' },
    { id: 'COAL', icon: '⛏️', name: 'Boom Węglowy', text: 'Czynsz z kopalń, hut i zakładów przemysłowych rośnie o 50%.' },
    { id: 'PREMIER', icon: '🏛️', name: 'Wizyta Premiera w Nowym Bytomiu', text: 'Każdy aktywny gracz dostaje dodatkowe $150 przy swoim najbliższym przejściu przez START w czasie wydarzenia.' }
  ];
  const MARKET = [
    { id: 'BRIBE', name: 'Przekupstwo urzędnika', text: 'Przenieś własną hipotekę na niezabudowaną działkę o tej samej lub wyższej cenie. Bez dodatkowej wypłaty.' },
    { id: 'BAIL', name: 'Legalna Kaucja', text: 'Jednorazowe wyjście z Izby OUG bez płacenia $50.' }
  ];
  const STYLES = [
    { id: 'FAMILOK', name: 'Robotnicze Familoki', icon: '🧱', cost: 300 },
    { id: 'MODERN', name: 'Modernizm Huty', icon: '🏙️', cost: 300 }
  ];
  const SHOP = [
    { id: 'pigeon', kind: 'pawn', name: 'Śląski Gołąb', price: 450, icon: '🕊️', text: 'Metaliczny pionek z gołębiem pocztowym.' },
    { id: 'pickaxe', kind: 'pawn', name: 'Złoty Kilof', price: 700, icon: '⛏️', text: 'Złoty kilof z połyskiem hutniczej stali.' },
    { id: 'lamp', kind: 'pawn', name: 'Lampka Naftowa', price: 550, icon: '🏮', text: 'Górnicza lampka z ciepłym światłem.' },
    { id: 'gold-frame', kind: 'frame', name: 'Rama Barona', price: 300, icon: '👑', text: 'Złota ramka wiadomości na czacie.' },
    { id: 'neon-frame', kind: 'frame', name: 'Neon Szybu', price: 300, icon: '💠', text: 'Turkusowa ramka wiadomości na czacie.' },
    { id: 'gold-name', kind: 'nick', name: 'Złoty nick', price: 200, icon: '✨', color: '#edc681', text: 'Złoty kolor podpisu na czacie.' },
    { id: 'mint-name', kind: 'nick', name: 'Miętowy nick', price: 200, icon: '🌿', color: '#81cfb5', text: 'Miętowy kolor podpisu na czacie.' }
  ];
  const SCENARIOS = [
    { id: 'CLASSIC', name: 'Ruda Śląska', icon: '🏭', text: 'Osiem dzielnic, lotniska i zakłady Rudy.' },
    { id: 'MINE', name: 'Podziemia −500 m', icon: '🪨', text: 'Wyrobiska i szyby zjazdowe. Podatki to koszty zawałów.' },
    { id: 'SILESIA', name: 'Rajza po Śląsku', icon: '🚋', text: 'Ruda, Zabrze, Bytom, Gliwice i Katowice na wspólnej planszy.' }
  ];
  const SOUNDS = ['O matko jedyna!', 'Kaj leziesz?', 'Dej spokój!', 'Szczęść Boże!'];
  function random(s) {
    let x = (s.rng >>> 0) || 942357;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    s.rng = x >>> 0;
    return s.rng / 4294967296;
  }
  function prestige(s, groupId, tiles) {
    const set = tiles.filter(t => t.type === 'PROPERTY' && t.group === groupId);
    const base = set.reduce((v, t) => v + (s.properties[t.index]?.level || 0), 0);
    const style = s.districtStyles?.[groupId];
    const active = !!style && set.length > 0 && set.every(t => s.properties[t.index]?.ownerId === style.ownerId && !s.properties[t.index].mortgaged) && set.some(t => s.properties[t.index]?.level === 5);
    return { value: base * (active ? 2 : 1), active, style: active ? style : null };
  }
  function createRules(ctx) {
    const { tiles, player, current, group, ownsSet, activePlayers, log, event, credit, charge, move, landing, settle } = ctx;
    function normalize(s) {
      s.ultimate = s.ultimate && typeof s.ultimate === 'object' ? s.ultimate : { rng: 942357, lastEventRound: 0, lastMarketRound: 0 };
      s.ultimate.rng = Number(s.ultimate.rng) || 942357;
      s.ultimate.history = list(s.ultimate.history);
      if (!s.ultimate.activeEvent?.id) s.ultimate.activeEvent = null;
      if (!s.ultimate.market?.cardId) s.ultimate.market = null;
      s.districtStyles = s.districtStyles && typeof s.districtStyles === 'object' ? s.districtStyles : {};
      s.pendingMove = s.pendingMove?.playerId ? s.pendingMove : null;
      s.rentOffer = s.rentOffer?.playerId ? s.rentOffer : null;
      s.preemption = s.preemption?.candidates ? s.preemption : null;
      if (s.preemption) s.preemption.candidates = list(s.preemption.candidates);
      s.scenarioId = SCENARIOS.some(x => x.id === s.scenarioId) ? s.scenarioId : 'CLASSIC';
      s.players.forEach((p, i) => {
        p.powerUp = PERKS.some(x => x.id === p.powerUp) ? p.powerUp : PERKS[i % PERKS.length].id;
        p.actionCards = list(p.actionCards).filter(x => MARKET.some(m => m.id === x));
        p.ownedCosmetics = list(p.ownedCosmetics).filter(x => SHOP.some(m => m.id === x));
        p.powerUsed = !!p.powerUsed; p.helmetUsed = !!p.helmetUsed; p.cartUsed = !!p.cartUsed;
        ['equippedPawn', 'equippedFrame', 'equippedNick'].forEach(key => { if (!p.ownedCosmetics.includes(p[key])) p[key] = ''; });
      });
      return s;
    }
    function init(s, seed) {
      s.ultimate = { rng: (seed >>> 0) || 942357, lastEventRound: 0, lastMarketRound: 0, history: [], activeEvent: null, market: null };
      s.districtStyles = {}; s.preemption = null; s.rentOffer = null; s.pendingMove = null;
      s.players.forEach(p => { p.powerUsed = false; p.helmetUsed = false; p.cartUsed = false; p.actionCards = []; p.premierPaid = ''; });
      normalize(s);
    }
    function round(s) {
      const u = s.ultimate;
      if (u.activeEvent && s.round >= u.activeEvent.untilRound) { log(s, '🌤️ Koniec wydarzenia: ' + u.activeEvent.name + '.'); u.activeEvent = null; }
      if (s.round % 5 === 0 && u.lastEventRound !== s.round) {
        const pool = EVENTS.filter(e => e.id !== u.lastEventId);
        const chosen = pool[Math.floor(random(u) * pool.length)];
        u.activeEvent = { ...chosen, startRound: s.round, untilRound: s.round + 2, key: s.gameId + ':' + s.round };
        u.lastEventRound = s.round; u.lastEventId = chosen.id;
        u.history.unshift({ id: chosen.id, name: chosen.name, round: s.round }); u.history = u.history.slice(0, 20);
        log(s, chosen.icon + ' SZYCHTA: ' + chosen.name + '. ' + chosen.text + ' Działa przez rundy ' + s.round + '–' + (s.round + 1) + '.');
      }
      if (s.round % 3 === 0 && u.lastMarketRound !== s.round) {
        u.lastMarketRound = s.round;
        const item = MARKET[Math.floor(random(u) * MARKET.length)];
        u.market = { cardId: item.id, round: s.round, sold: false };
        log(s, '📦 Bursa w Rudzie: nowa karta „' + item.name + '”. Licytacja od $50 dostępna do następnej dostawy.');
      }
    }
    function onStart(s, p) {
      const e = s.ultimate.activeEvent;
      if (e?.id === 'PREMIER' && s.round < e.untilRound && p.premierPaid !== e.key) {
        p.premierPaid = e.key; credit(s, p.id, 150, 'Dotacja Miasta — wizyta Premiera');
      }
    }
    function rent(s, index, base) {
      const t = tiles[index], prop = s.properties[index], e = s.ultimate.activeEvent;
      if (e && s.round < e.untilRound) {
        if (e.id === 'METHANE' && t.group === 'HALEMBA' && prop?.level > 0) return 0;
        if (e.id === 'COAL' && (t.industrial || t.type === 'UTILITY')) base *= 1.5;
      }
      if (t.type === 'PROPERTY' && prestige(s, t.group, tiles).active) base *= 1.3;
      return Math.ceil(base);
    }
    function buildCost(s, p, t) { return p.avatar === 'helmet' && !p.helmetUsed ? 0 : t.buildCost; }
    function repairCost(s, p, amount) {
      if (amount > 0 && p.avatar === 'helmet' && !p.helmetUsed) { p.helmetUsed = true; log(s, '⛑️ ' + p.name + ': pierwsza naprawa za darmo dzięki Hełmowi Sztygara.'); return 0; }
      return amount;
    }
    function planMove(s, p, steps, diceSum) {
      if (p.avatar === 'cart' && !p.cartUsed) {
        s.pendingMove = { playerId: p.id, steps, diceSum }; s.turnPhase = 'CART_CHOICE';
        log(s, '🛒 ' + p.name + ': wybierz zwykły ruch lub użyj wagonika (−2 / +2 pola).');
      } else { move(s, p, steps); landing(s, p, diceSum); }
    }
    function offerRent(s, p, ownerId, amount, reason) {
      if (amount > 0 && p.powerUp === 'RENT' && !p.powerUsed) {
        s.rentOffer = { playerId: p.id, ownerId, amount, reason }; s.turnPhase = 'RENT_CHOICE';
        log(s, '🛡️ ' + p.name + ': czynsz $' + amount + '. Możesz użyć atutu Plecy u Sztygara.');
      } else charge(s, p.id, ownerId, amount, reason);
    }
    function finalizeAuction(s, a, override) {
      const winner = player(s, override || a.leaderId), price = override ? (a.openingPrice || 1) : a.highBid;
      if (winner && !winner.bankrupt && winner.cash >= price) {
        winner.cash -= price;
        if (a.kind === 'ACTION') {
          winner.actionCards.push(a.cardId); s.ultimate.market.sold = true;
          log(s, '📦 ' + winner.name + ' zdobywa kartę „' + MARKET.find(x => x.id === a.cardId).name + '” za $' + price + '.');
        } else {
          const prop = s.properties[a.tileIndex];
          prop.ownerId = winner.id; prop.level = 0; prop.mortgaged = false;
          prop.history.unshift(winner.name + ': ' + (override ? 'prawo pierwokupu' : 'licytacja') + ' $' + price);
          log(s, '🔨 ' + winner.name + ' przejmuje ' + tiles[a.tileIndex].shortName + ' za $' + price + '.');
        }
        event(s, winner.id, null, price, a.kind === 'ACTION' ? 'Karta z Bursy' : override ? 'Prawo Pierwokupu' : 'Licytacja: ' + tiles[a.tileIndex].shortName);
      } else log(s, '🔨 Licytacja zakończona bez kupującego.');
      s.auction = null; s.preemption = null; s.turnPhase = a.returnPhase || 'END'; s.turnDeadline = s.updatedAt + 60000;
      settle(s);
    }
    function closeAuction(s) {
      const a = s.auction;
      if (a.kind !== 'ACTION' && a.leaderId) {
        const candidates = s.players.slice(s.turnIndex).concat(s.players.slice(0, s.turnIndex))
          .filter(p => !p.bankrupt && p.id !== a.leaderId && p.powerUp === 'FIRST' && !p.powerUsed && p.cash >= (a.openingPrice || 1)).map(p => p.id);
        if (candidates.length) {
          s.preemption = { auction: { ...a }, candidates }; s.auction = null; s.turnPhase = 'PREEMPT'; s.turnDeadline = s.updatedAt + 20000;
          log(s, '📜 Przed rozliczeniem licytacji: decyzja o prawie pierwokupu należy do ' + player(s, candidates[0]).name + '.');
          return;
        }
      }
      finalizeAuction(s, a);
    }
    function handleAction(s, action, actor) {
      const p = current(s), who = player(s, actor);
      const ownTurn = () => ensure(actor === p.id && !s.debt && !s.auction && !s.preemption, 'Poczekaj na swoją turę i rozliczenie akcji.');
      switch (action.type) {
        case 'CART': {
          ownTurn(); ensure(s.turnPhase === 'CART_CHOICE' && s.pendingMove?.playerId === actor, 'Brak ruchu wagonika do rozstrzygnięcia.');
          const d = Number(action.direction); ensure([-2, 0, 2].includes(d), 'Wybierz −2, 0 lub +2 pola.');
          const pending = s.pendingMove; s.pendingMove = null;
          if (d) { ensure(who.avatar === 'cart' && !who.cartUsed, 'Wagonik został już użyty.'); who.cartUsed = true; }
          move(s, who, Math.max(0, pending.steps + d)); landing(s, who, pending.diceSum); break;
        }
        case 'PAY_RENT':
        case 'SKIP_RENT': {
          ownTurn(); const q = s.rentOffer; ensure(q?.playerId === actor, 'Nie czekasz na zapłatę czynszu.');
          if (action.type === 'SKIP_RENT') { ensure(who.powerUp === 'RENT' && !who.powerUsed, 'Ten atut nie jest dostępny.'); who.powerUsed = true; log(s, '🛡️ ' + who.name + ' unika czynszu $' + q.amount + ' — Plecy u Sztygara.'); }
          else charge(s, actor, q.ownerId, q.amount, q.reason);
          s.rentOffer = null; s.turnPhase = 'END'; break;
        }
        case 'POWER_JUMP': {
          ownTurn(); ensure(s.round === 1 && s.turnPhase === 'ROLL' && !who.inJail && who.powerUp === 'JUMP' && !who.powerUsed, 'Zjazd jest dostępny przed rzutem w pierwszej rundzie.');
          ensure(Number.isInteger(action.index) && s.properties[action.index] && !s.properties[action.index].ownerId, 'Wybierz wolną działkę.');
          const from = who.position; who.position = action.index; who.powerUsed = true; s.extraRoll = false;
          s.lastMove = { playerId: actor, from, to: who.position, steps: 0, at: s.updatedAt };
          landing(s, who, 7); break;
        }
        case 'PREEMPT_YES':
        case 'PREEMPT_NO': {
          const q = s.preemption; ensure(q && q.candidates[0] === actor, 'Inny gracz ma teraz prawo decyzji.');
          if (action.type === 'PREEMPT_YES') {
            ensure(who.powerUp === 'FIRST' && !who.powerUsed && who.cash >= (q.auction.openingPrice || 1), 'Nie możesz skorzystać z prawa pierwokupu.');
            who.powerUsed = true; finalizeAuction(s, q.auction, actor);
          } else {
            q.candidates.shift();
            if (!q.candidates.length) finalizeAuction(s, q.auction);
            else s.turnDeadline = s.updatedAt + 20000;
          }
          break;
        }
        case 'MARKET_OPEN': {
          ownTurn(); const m = s.ultimate.market;
          ensure(['ROLL', 'END'].includes(s.turnPhase) && m && !m.sold, 'Bursa czeka na nową dostawę co 3 rundy.');
          s.auction = { kind: 'ACTION', cardId: m.cardId, tileIndex: 20, highBid: 0, openingPrice: 50, leaderId: null, passed: [], returnPhase: s.turnPhase, deadline: s.updatedAt + 25000 };
          s.turnPhase = 'AUCTION'; break;
        }
        case 'ACTION_BAIL': {
          ownTurn(); ensure(who.inJail && s.turnPhase === 'ROLL' && who.actionCards.includes('BAIL'), 'Użyj Legalnej Kaucji na Izbie przed rzutem.');
          who.actionCards.splice(who.actionCards.indexOf('BAIL'), 1); who.inJail = false; who.jailTurns = 0; break;
        }
        case 'ACTION_BRIBE': {
          ownTurn(); ensure(['ROLL', 'END'].includes(s.turnPhase) && who.actionCards.includes('BRIBE'), 'Brak karty lub rozlicz bieżącą akcję.');
          const source = s.properties[action.from], dest = s.properties[action.to], a = tiles[action.from], b = tiles[action.to];
          ensure(source && dest && source !== dest && source.ownerId === actor && dest.ownerId === actor && source.mortgaged && !dest.mortgaged, 'Wybierz własną zastawioną i własną wolną działkę.');
          ensure(b.price >= a.price && !dest.level && (b.type !== 'PROPERTY' || group(b).every(t => !s.properties[t.index].level)), 'Działka docelowa musi mieć tę samą lub wyższą cenę, a jej dzielnica nie może mieć zabudowy.');
          source.mortgaged = false; dest.mortgaged = true; who.actionCards.splice(who.actionCards.indexOf('BRIBE'), 1);
          source.history.unshift('Hipoteka przeniesiona kartą urzędnika.'); dest.history.unshift('Przejęta hipoteka — karta urzędnika.');
          log(s, '📄 ' + who.name + ' przenosi hipotekę: ' + a.shortName + ' → ' + b.shortName + '.'); break;
        }
        case 'STYLE': {
          ownTurn(); const t = tiles[action.index], style = STYLES.find(x => x.id === action.style);
          ensure(['ROLL', 'END'].includes(s.turnPhase) && t?.type === 'PROPERTY' && style && ownsSet(s, t, actor), 'Wybierz styl własnej kompletnej dzielnicy.');
          ensure(group(t).some(x => s.properties[x.index].level === 5) && group(t).every(x => !s.properties[x.index].mortgaged), 'Styl wymaga hotelu i dzielnicy bez hipotek.');
          ensure(!s.districtStyles[t.group] && who.cash >= style.cost, 'Styl jest już wykupiony lub brakuje $300.');
          who.cash -= style.cost; s.districtStyles[t.group] = { ownerId: actor, style: style.id };
          event(s, actor, null, style.cost, 'Architektura: ' + style.name); log(s, '🏛️ ' + who.name + ': ' + style.name + '. Prestiż ×2, czynsz +30% do czasu utraty hotelu lub kompletu.'); break;
        }
        default: return false;
      }
      return true;
    }
    function tick(s) {
      if (s.rentOffer) return handleAction(s, { type: 'PAY_RENT' }, s.rentOffer.playerId);
      if (s.pendingMove) return handleAction(s, { type: 'CART', direction: 0 }, s.pendingMove.playerId);
      if (s.preemption) return handleAction(s, { type: 'PREEMPT_NO' }, s.preemption.candidates[0]);
      return false;
    }
    function botAction(s) {
      if (s.preemption) { const p = player(s, s.preemption.candidates[0]); return p?.isBot ? { actor: p.id, type: 'PREEMPT_YES' } : null; }
      if (s.auction || s.debt) return null;
      const p = current(s);
      if (!p?.isBot) return null;
      if (s.rentOffer) return { actor: p.id, type: s.rentOffer.amount >= 50 || p.cash < s.rentOffer.amount ? 'SKIP_RENT' : 'PAY_RENT' };
      if (s.pendingMove) {
        const q = s.pendingMove;
        const directions = [0, -2, 2].map(d => { const i = (p.position + Math.max(0, q.steps + d)) % 40, pr = s.properties[i]; return { d, penalty: pr?.ownerId && pr.ownerId !== p.id ? (tiles[i].rents?.[pr.level] || 40) : tiles[i].type === 'GO_TO_JAIL' ? 500 : 0 }; });
        directions.sort((a,b) => a.penalty - b.penalty);
        return { actor: p.id, type: 'CART', direction: directions[0].d };
      }
      if (p.inJail && s.turnPhase === 'ROLL' && p.actionCards.includes('BAIL')) return { actor: p.id, type: 'ACTION_BAIL' };
      return null;
    }
    return { normalize, init, round, onStart, rent, buildCost, repairCost, planMove, offerRent, closeAuction, handleAction, tick, botAction };
  }
  function buyCosmetic(s, actor, itemId) {
    const p = s.players.find(p => p.id === actor), item = SHOP.find(x => x.id === itemId);
    ensure(p && item, 'Wybierz gracza i przedmiot.');
    if (!p.ownedCosmetics.includes(item.id)) {
      ensure(p.arcadeCash >= item.price, 'Brakuje $arcadeCash. Wygraj w minigrach, aby uzupełnić portfel.');
      p.arcadeCash -= item.price; p.ownedCosmetics.push(item.id);
    }
    p[{ pawn: 'equippedPawn', frame: 'equippedFrame', nick: 'equippedNick' }[item.kind]] = item.id;
  }
  function liarAction(s, actor, cardId, rank) {
    const l = s.liars, p = s.players[l.turnIndex % s.players.length];
    ensure(!l.winnerName && p.id === actor && l.actionUsedBy !== actor, 'Jedna karta akcji przed zagraniem zwykłych kart w swojej turze.');
    const hands = JSON.parse(l.handsJson), hand = hands[actor] || [], card = hand.find(c => c.id === cardId);
    ensure(card?.action && ['SNAPS','FART'].includes(card.action), 'Wybierz kartę Sznaps lub Fart.');
    if (card.action === 'SNAPS') {
      const target = s.players[(l.turnIndex + 1) % s.players.length], exposed = (hands[target.id] || [])[0];
      l.exposed = exposed ? { playerId: target.id, rank: exposed.rank, suit: exposed.suit } : null;
      l.lastRevealMsg = '🥃 Sznaps! ' + target.name.replace(/[<>&]/g,'') + (exposed ? ' pokazuje: ' + exposed.rank + exposed.suit : ' nie ma kart w dłoni.');
    } else {
      ensure(['A','K','Q','J','10'].includes(rank), 'Wybierz zwykłą figurę.');
      l.requiredRank = rank; l.lastRevealMsg = '🍀 Fart! W tej turze obowiązuje figura: ' + rank + '.';
    }
    hands[actor] = hand.filter(c => c.id !== cardId); l.handsJson = JSON.stringify(hands); l.actionUsedBy = actor;
    if (!hands[actor].length) { l.winnerName = p.name; p.arcadeCash += 500; }
    else if (hands[actor].every(c => c.action)) { l.turnIndex = (l.turnIndex + 1) % s.players.length; l.actionUsedBy = ''; }
  }
  function slotsStart(players, id, now) {
    return { id, startedAt: now, deadline: now + 180000, status: 'PLAYING', rng: now >>> 0, rewarded: false,
      entries: Object.fromEntries(players.map(p => [p.id, { balance: 1000, spins: 0, last: [], done: false }])) };
  }
  function slotsSpin(t, id, bet, now) {
    const e = t.entries[id]; ensure(t.status === 'PLAYING' && now < t.deadline && e && !e.done && e.spins < 20, 'Turniej lub limit 20 obrotów został zakończony.');
    ensure(Number.isSafeInteger(bet) && bet > 0 && bet <= 1000 && e.balance >= bet, 'Stawka musi mieścić się w budżecie turniejowym.');
    e.last = [0,0,0].map(() => Math.floor(random(t) * 6));
    const [a,b,c] = e.last, mult = a === b && b === c ? (a < 2 ? 15 : 8) : a === b || a === c || b === c ? 2 : 0;
    e.balance += bet * mult - bet; e.spins++; e.lastReturn = bet * mult;
    e.done = e.spins >= 20 || e.balance === 0;
    return e;
  }
  function slotsFinish(s, now) {
    const t = s.slotTournament;
    if (!t || t.status !== 'PLAYING' || (now < t.deadline && !Object.values(t.entries).every(e => e.done))) return false;
    t.status = 'FINISHED';
    const best = Math.max(...Object.values(t.entries).map(e => e.balance));
    t.winnerIds = s.players.filter(p => t.entries[p.id]?.balance === best).map(p => p.id);
    if (!t.rewarded) { t.rewarded = true; t.winnerIds.forEach(id => { s.players.find(p => p.id === id).arcadeCash += 500; }); }
    return true;
  }
  return { PERKS, EVENTS, MARKET, STYLES, SHOP, SCENARIOS, SOUNDS, random, prestige, createRules, buyCosmetic, liarAction, slotsStart, slotsSpin, slotsFinish, list };
});
