/* Czysty silnik rozgrywki: ten sam stan i akcja dają ten sam wynik.
 * Całą akcję online zapisujemy jedną transakcją Firebase, bez efektów DOM.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RudaMonopoly = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const RULES_VERSION = 15;
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const list = value => Array.isArray(value) ? value : Object.values(value || {});

  function createEngine(data) {
    const { BOARD_TILES: tiles, AIRPORT_INDICES: airports, SURPRISE_CARDS: chance, TREASURE_CARDS: chest } = data;
    const player = (s, id) => s.players.find(p => p.id === id);
    const current = s => s.players[s.turnIndex];
    const group = tile => tiles.filter(t => t.type === 'PROPERTY' && t.group === tile.group);
    const ownsSet = (s, t, id) => group(t).every(x => s.properties[x.index]?.ownerId === id);
    const activePlayers = s => s.players.filter(p => !p.bankrupt);
    const stamp = s => new Date(s.updatedAt || 0).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });

    function log(s, text) {
      s.feed.unshift({ text, time: stamp(s) });
      s.feed = s.feed.slice(0, 60);
    }

    function event(s, fromId, toId, amount, reason, status = 'PAID') {
      if (amount <= 0) return;
      s.eventSequence += 1;
      s.moneyEvents.push({ id: s.gameId + ':' + s.eventSequence, sequence: s.eventSequence,
        fromId: fromId || 'BANK', toId: toId || 'BANK', amount, reason, status, at: s.updatedAt });
      s.moneyEvents = s.moneyEvents.slice(-40);
    }

    function normalize(s) {
      s.moneyEvents = list(s.moneyEvents);
      s.paymentQueue = list(s.paymentQueue);
      s.auctionQueue = list(s.auctionQueue);
      s.feed = list(s.feed);
      s.eventSequence = s.eventSequence || 0;
      s.revision = s.revision || 0;
      if (s.auction) s.auction.passed = list(s.auction.passed);
      if (s.cards) {
        s.cards.chance = list(s.cards.chance);
        s.cards.chest = list(s.cards.chest);
      }
      return s;
    }

    function shuffled(length, seed) {
      const a = Array.from({ length }, (_, i) => i);
      let x = (seed >>> 0) || 918273;
      for (let i = a.length - 1; i > 0; i--) {
        x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
        const j = (x >>> 0) % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function initialize(state, options = {}) {
      const s = clone(state);
      s.rulesVersion = RULES_VERSION;
      s.gameId = options.gameId || 'game_' + (options.now || Date.now());
      s.revision = 0;
      s.updatedAt = options.now || Date.now();
      s.startingCash = Number(options.startingCash || 1500);
      s.roundLimit = [20, 30, 0].includes(Number(options.roundLimit)) ? Number(options.roundLimit) : 30;
      s.turnIndex = 0; s.turnNumber = 1; s.round = 1;
      s.turnPhase = 'ROLL'; s.extraRoll = false; s.doublesStreak = 0;
      s.turnDeadline = s.updatedAt + 120000;
      s.status = 'PLAYING'; s.winnerAnnouncement = null;
      s.debt = null; s.continuation = null; s.auction = null;
      s.paymentQueue = []; s.auctionQueue = []; s.moneyEvents = []; s.eventSequence = 0;
      s.lastCard = null; s.lastMove = null;
      s.cards = { chance: shuffled(chance.length, options.seed || s.updatedAt), chest: shuffled(chest.length, (options.seed || s.updatedAt) + 97) };
      s.players.forEach(p => {
        p.cash = s.startingCash; p.arcadeCash = 2000; p.bankrupt = false;
        p.position = 0; p.inJail = false; p.jailTurns = 0; p.pardonCards = 0; p.pardonDecks = [];
      });
      Object.values(s.properties).forEach(p => { p.ownerId = null; p.level = 0; p.mortgaged = false; p.history = ['Działka należy do banku.']; });
      s.feed = [];
      log(s, `🏭 Rozpoczynamy Monopoly! ${s.roundLimit ? 'Limit: <strong>' + s.roundLimit + ' rund</strong>.' : 'Tryb klasyczny: wygrywa ostatni gracz.'} Zbierz dzielnicę i buduj równomiernie.`);
      return s;
    }

    function rent(s, index, diceSum = 7) {
      const t = tiles[index], p = s.properties[index];
      if (!p?.ownerId || p.mortgaged) return 0;
      if (t.type === 'AIRPORT') return t.rents[airports.filter(i => s.properties[i].ownerId === p.ownerId).length - 1];
      if (t.type === 'UTILITY') return diceSum * (tiles.filter(x => x.type === 'UTILITY' && s.properties[x.index].ownerId === p.ownerId).length === 2 ? 10 : 4);
      if (t.type === 'PROPERTY') return t.rents[p.level] * (p.level === 0 && ownsSet(s, t, p.ownerId) ? 2 : 1);
      return 0;
    }

    function buildingStock(s) {
      let houses = 32, hotels = 12;
      Object.values(s.properties).forEach(p => { if (p.level === 5) hotels--; else houses -= p.level || 0; });
      return { houses, hotels };
    }

    function netWorth(s, id) {
      let value = player(s, id)?.cash || 0;
      tiles.forEach(t => {
        const p = s.properties[t.index];
        if (p?.ownerId === id) value += (p.mortgaged ? Math.floor(t.price / 2) : t.price) + p.level * (t.buildCost || 0);
      });
      if (s.debt?.playerId === id) value -= s.debt.amount;
      return value;
    }

    function buildCheck(s, index, id) {
      const t = tiles[index], p = s.properties[index], owner = player(s, id);
      if (s.status !== 'PLAYING' || s.lobbyOpen) return { ok: false, reason: 'Poczekaj na rozpoczęcie partii.' };
      if (!owner || owner.bankrupt || current(s).id !== id) return { ok: false, reason: 'Buduj w swojej turze.' };
      if (s.debt || s.auction || !['ROLL', 'END'].includes(s.turnPhase)) return { ok: false, reason: 'Najpierw rozlicz bieżącą akcję.' };
      if (!t || t.type !== 'PROPERTY' || p?.ownerId !== id) return { ok: false, reason: 'Możesz budować na własnej działce.' };
      const set = group(t);
      if (!ownsSet(s, t, id)) return { ok: false, reason: 'Najpierw zbierz wszystkie działki tego koloru.' };
      if (set.some(x => s.properties[x.index].mortgaged)) return { ok: false, reason: 'Spłać wszystkie hipoteki w tej dzielnicy.' };
      if (p.level >= 5) return { ok: false, reason: 'Na tej działce stoi już hotel.' };
      if (p.level > Math.min(...set.map(x => s.properties[x.index].level))) return { ok: false, reason: 'Buduj równomiernie — najpierw na niższych działkach.' };
      if (owner.cash < t.buildCost) return { ok: false, reason: 'Brakuje gotówki na budowę.' };
      const stock = buildingStock(s);
      if (p.level < 4 && stock.houses < 1) return { ok: false, reason: 'Bank nie ma wolnych domów (limit 32).' };
      if (p.level === 4 && stock.hotels < 1) return { ok: false, reason: 'Bank nie ma wolnych hoteli (limit 12).' };
      return { ok: true, reason: 'Komplet dzielnicy. Możesz budować bez wchodzenia na pole.' };
    }

    function sellCheck(s, index, id) {
      const t = tiles[index], p = s.properties[index];
      if (!p || p.ownerId !== id || p.level < 1) return { ok: false, reason: 'Brak własnego budynku do sprzedaży.' };
      if (p.level < Math.max(...group(t).map(x => s.properties[x.index].level))) return { ok: false, reason: 'Sprzedawaj równomiernie, zaczynając od najwyższych budynków.' };
      if (p.level === 5 && buildingStock(s).houses < 4) return { ok: false, reason: 'Bank nie ma 4 domów na wymianę hotelu. Możesz sprzedać całą zabudowę dzielnicy.' };
      return { ok: true };
    }

    function mortgageCheck(s, index, id) {
      const t = tiles[index], p = s.properties[index], owner = player(s, id);
      if (!p || p.ownerId !== id) return { ok: false, reason: 'To nie jest Twoja działka.' };
      if (p.mortgaged) {
        if (s.debt) return { ok: false, reason: 'Najpierw spłać dług.' };
        return { ok: owner.cash >= Math.ceil(t.price * 0.55), reason: 'Spłata hipoteki kosztuje 110% jej wartości.' };
      }
      if (p.level || (t.type === 'PROPERTY' && group(t).some(x => s.properties[x.index].level > 0))) return { ok: false, reason: 'Najpierw sprzedaj budynki w całej dzielnicy.' };
      return { ok: true };
    }

    function finish(s, winners, reason) {
      s.status = 'FINISHED'; s.turnPhase = 'FINISHED'; s.auction = null; s.debt = null;
      s.winnerAnnouncement = { winnerId: winners[0]?.id || null, winnerName: winners.map(p => p.name).join(' i '),
        reason, cash: winners[0]?.cash || 0, worth: winners[0] ? netWorth(s, winners[0].id) : 0, gameId: s.gameId };
      log(s, `🏆 ${esc(s.winnerAnnouncement.winnerName)} — ${esc(reason)}`);
    }

    function victory(s) {
      if (s.status === 'FINISHED') return true;
      const alive = activePlayers(s);
      if (s.players.length >= 2 && alive.length === 1) { finish(s, alive, 'Wszyscy rywale zbankrutowali. Ostatni gracz wygrywa!'); return true; }
      return false;
    }

    function nextTurn(s) {
      if (victory(s)) return;
      const old = s.turnIndex;
      for (let i = 1; i <= s.players.length; i++) {
        const idx = (old + i) % s.players.length;
        if (!s.players[idx].bankrupt) {
          if (idx <= old) s.round += 1;
          s.turnIndex = idx;
          break;
        }
      }
      if (s.roundLimit && s.round > s.roundLimit) {
        const alive = activePlayers(s);
        const best = Math.max(...alive.map(p => netWorth(s, p.id)));
        const leaders = alive.filter(p => netWorth(s, p.id) === best);
        finish(s, leaders, `Koniec ${s.roundLimit} rund. ${leaders.length > 1 ? 'Wspólna wygrana przy równym majątku' : 'Wygrywa największy majątek netto'}: $${best}.`);
        return;
      }
      s.turnNumber += 1; s.turnPhase = 'ROLL'; s.extraRoll = false; s.doublesStreak = 0;
      s.turnDeadline = s.updatedAt + 120000; s.lastCard = null;
    }

    function credit(s, id, amount, reason) {
      player(s, id).cash += amount;
      event(s, null, id, amount, reason);
      log(s, `💰 Bank wypłaca <strong>${esc(player(s, id).name)}</strong> <strong>$${amount}</strong> — ${esc(reason)}.`);
    }

    function charge(s, fromId, toId, amount, reason) {
      if (amount > 0) s.paymentQueue.push({ playerId: fromId, creditorId: toId || null, amount, reason });
    }

    function liquidationValue(s, id) {
      let cash = player(s, id).cash;
      tiles.forEach(t => {
        const p = s.properties[t.index];
        if (p?.ownerId === id) cash += p.level * Math.floor((t.buildCost || 0) / 2) + (p.mortgaged ? 0 : Math.floor(t.price / 2));
      });
      return cash;
    }

    function bankrupt(s, id, creditorId) {
      const p = player(s, id), creditor = player(s, creditorId);
      check(p && !p.bankrupt, 'Ten gracz już odpadł.');
      // Budynki wracają do banku za połowę wartości, zanim majątek przejmie wierzyciel.
      tiles.forEach(t => { const prop = s.properties[t.index]; if (prop?.ownerId === id) { p.cash += prop.level * Math.floor((t.buildCost || 0) / 2); prop.level = 0; } });
      const remaining = p.cash;
      if (creditor && !creditor.bankrupt) creditor.cash += remaining;
      if (remaining > 0) event(s, id, creditor?.id, remaining, 'Rozliczenie bankructwa');
      let interest = 0;
      tiles.forEach(t => {
        const prop = s.properties[t.index];
        if (prop?.ownerId !== id) return;
        prop.ownerId = creditor && !creditor.bankrupt ? creditor.id : null;
        if (prop.ownerId) {
          if (prop.mortgaged) interest += Math.ceil(Math.floor(t.price / 2) * 0.1);
        } else { prop.mortgaged = false; s.auctionQueue.push(t.index); }
        prop.history.unshift(`${stamp(s)} — Bankructwo ${p.name}; ${creditor ? 'przejął ' + creditor.name : 'zwrot do banku'}`);
      });
      if (creditor) {
        creditor.pardonCards += p.pardonCards;
        creditor.pardonDecks = [...list(creditor.pardonDecks), ...list(p.pardonDecks)];
        if (interest) charge(s, creditor.id, null, interest, 'Odsetki od przejętych hipotek');
      }
      p.pardonDecks = [];
      p.cash = 0; p.bankrupt = true; p.pardonCards = 0; p.inJail = false;
      s.paymentQueue = s.paymentQueue.filter(q => q.playerId !== id);
      if (s.debt?.playerId === id) s.debt = null;
      if (s.continuation?.playerId === id) s.continuation = null;
      log(s, `🚩 <strong>${esc(p.name)}</strong> bankrutuje. ${creditor ? 'Majątek przejmuje ' + esc(creditor.name) + '.' : 'Działki wracają do banku na licytację.'}`);
      if (current(s).id === id) s.extraRoll = false;
    }

    function startAuction(s, index) {
      s.auction = { tileIndex: index, highBid: 0, leaderId: null, passed: [], deadline: s.updatedAt + 25000 };
      s.turnPhase = 'AUCTION';
      log(s, `🔨 Licytacja <strong>${esc(tiles[index].shortName)}</strong> od $1. Każdy aktywny gracz może licytować.`);
    }

    function settle(s) {
      if (victory(s)) return;
      let guard = 0;
      while (s.paymentQueue.length && guard++ < 50) {
        const q = s.paymentQueue[0], p = player(s, q.playerId);
        if (!p || p.bankrupt) { s.paymentQueue.shift(); continue; }
        if (p.cash < q.amount) {
          if (!s.debt || s.debt.playerId !== q.playerId || s.debt.amount !== q.amount) { event(s, p.id, q.creditorId, q.amount, q.reason, 'DUE'); s.turnDeadline = s.updatedAt + 120000; }
          s.debt = clone(q); s.turnPhase = 'DEBT';
          if (liquidationValue(s, p.id) < q.amount) { bankrupt(s, p.id, q.creditorId); if (victory(s)) return; continue; }
          return;
        }
        p.cash -= q.amount;
        const creditor = player(s, q.creditorId);
        if (creditor && !creditor.bankrupt) creditor.cash += q.amount;
        event(s, p.id, creditor?.id, q.amount, q.reason);
        log(s, `💸 <strong>${esc(p.name)}</strong> płaci <strong>$${q.amount}</strong> → <strong>${creditor ? esc(creditor.name) : 'Bank'}</strong> (${esc(q.reason)}).`);
        s.paymentQueue.shift(); s.debt = null;
      }
      if (s.status === 'FINISHED') return;
      // Ruch po zapłaceniu przymusowej kaucji w trzeciej turze więzienia.
      if (s.continuation) {
        const c = s.continuation; s.continuation = null;
        const p = player(s, c.playerId);
        if (p && !p.bankrupt) { move(s, p, c.steps); landing(s, p, c.diceSum); settle(s); return; }
      }
      if (victory(s)) return;
      if (s.turnPhase === 'DEBT') s.turnPhase = 'END';
      if (!s.auction && s.auctionQueue.length) { startAuction(s, s.auctionQueue.shift()); return; }
      if (current(s).bankrupt && !s.auction) nextTurn(s);
    }

    function move(s, p, steps) {
      const from = p.position;
      p.position = (from + steps) % 40;
      if (from + steps >= 40) credit(s, p.id, 200, 'Przejście przez START');
      s.lastMove = { playerId: p.id, from, to: p.position, steps, at: s.updatedAt };
    }

    function jail(s, p) {
      p.position = 10; p.inJail = true; p.jailTurns = 0;
      s.extraRoll = false; s.doublesStreak = 0; s.turnPhase = 'END';
      log(s, `🔒 <strong>${esc(p.name)}</strong> trafia na Izbę OUG.`);
    }

    function drawCard(s, type, p) {
      const key = type === 'SURPRISE' ? 'chance' : 'chest';
      const deck = key === 'chance' ? chance : chest;
      // Każda talia ma dokładnie jedną kartę wolności. Nie dobieramy jej ponownie, gdy jest w czyjejś ręce.
      const held = s.players.some(x => list(x.pardonDecks).includes(key));
      let index = s.cards[key].shift();
      s.cards[key].push(index);
      if (deck[index].action === 'PARDON' && held) {
        index = s.cards[key].shift(); s.cards[key].push(index);
      }
      const c = deck[index];
      s.lastCard = { text: c.text, playerId: p.id, at: s.updatedAt };
      log(s, `🃏 <strong>${esc(p.name)}</strong>: ${esc(c.text)}`);
      if (c.action === 'CASH') credit(s, p.id, c.amount, c.text);
      if (c.action === 'PAY_BANK') charge(s, p.id, null, c.amount, c.text);
      if (c.action === 'PARDON') { p.pardonCards += 1; p.pardonDecks = [...list(p.pardonDecks), key]; }
      if (c.action === 'GO_JAIL') jail(s, p);
      if (c.action === 'MOVE_TO') { const steps = (c.target - p.position + 40) % 40; move(s, p, steps); landing(s, p, s.lastDice[0] + s.lastDice[1]); }
      if (c.action === 'BIRTHDAY') activePlayers(s).filter(x => x.id !== p.id).forEach(x => charge(s, x.id, p.id, c.amount, 'Urodziny gracza ' + p.name));
      if (c.action === 'PAY_EACH') activePlayers(s).filter(x => x.id !== p.id).forEach(x => charge(s, p.id, x.id, c.amount, 'Karczma Piwna'));
      if (c.action === 'REPAIRS') {
        let amount = 0;
        Object.values(s.properties).filter(x => x.ownerId === p.id).forEach(x => { amount += x.level === 5 ? c.hotel : x.level * c.house; });
        charge(s, p.id, null, amount, 'Remont budynków');
      }
    }

    function landing(s, p, diceSum) {
      const t = tiles[p.position], prop = s.properties[p.position];
      s.turnPhase = 'END';
      log(s, `📍 <strong>${esc(p.name)}</strong> → ${esc(t.name)}.`);
      if (prop) {
        if (!prop.ownerId) s.turnPhase = 'DECIDE';
        else if (prop.ownerId !== p.id) charge(s, p.id, prop.ownerId, rent(s, p.position, diceSum), 'Czynsz: ' + t.shortName);
      } else if (t.type === 'TAX') charge(s, p.id, null, t.taxAmount, t.name);
      else if (t.type === 'GO_TO_JAIL') jail(s, p);
      else if (t.type === 'SURPRISE' || t.type === 'TREASURE') drawCard(s, t.type, p);
      else if (t.type === 'VACATION') log(s, '🌿 Bezpłatny parking. Odpoczywasz — bank nie wypłaca premii.');
    }

    function closeAuction(s) {
      const a = s.auction;
      if (!a) return;
      const winner = player(s, a.leaderId), t = tiles[a.tileIndex];
      if (winner && !winner.bankrupt && winner.cash >= a.highBid) {
        winner.cash -= a.highBid;
        const prop = s.properties[t.index];
        prop.ownerId = winner.id; prop.level = 0; prop.mortgaged = false;
        prop.history.unshift(`${stamp(s)} — ${winner.name}: licytacja $${a.highBid}`);
        event(s, winner.id, null, a.highBid, 'Licytacja: ' + t.shortName);
        log(s, `🔨 <strong>${esc(winner.name)}</strong> wygrywa ${esc(t.shortName)} za $${a.highBid}.`);
      } else log(s, `🔨 Bez ofert. ${esc(t.shortName)} pozostaje w banku.`);
      s.auction = null; s.turnPhase = 'END'; s.turnDeadline = s.updatedAt + 60000;
      settle(s);
    }

    function manageAllowed(s, actor) {
      const debtor = s.debt?.playerId || current(s).id;
      check(actor === debtor, 'Teraz działkami zarządza gracz, którego dotyczy ta tura lub dług.');
      check(!s.auction && !player(s, actor)?.bankrupt, 'Dokończ licytację.');
    }

    function reduce(state, action, actor) {
      check(state.rulesVersion === RULES_VERSION, 'Ten pokój używa poprzednich zasad. Utwórz nową partię.');
      check(action.expectedRevision === state.revision, 'Stan gry się zmienił. Wykonaj ruch ponownie.');
      const s = normalize(clone(state));
      s.updatedAt = Number(action.now) || Date.now();
      check(s.status === 'PLAYING' && !s.lobbyOpen, 'Partia nie jest teraz aktywna.');
      const p = current(s), who = player(s, actor);
      check(who && !who.bankrupt, 'Nie jesteś aktywnym graczem tej partii.');
      const turnAction = ['ROLL', 'BUY', 'DECLINE', 'END', 'JAIL_PAY', 'JAIL_CARD'];
      if (turnAction.includes(action.type)) check(actor === p.id && !s.debt && !s.auction, 'Poczekaj na swoją turę i rozliczenie płatności.');
      switch (action.type) {
        case 'ROLL': {
          check(s.turnPhase === 'ROLL', 'Rzut został już wykonany.');
          const dice = action.dice;
          check(Array.isArray(dice) && dice.length === 2 && dice.every(x => Number.isInteger(x) && x >= 1 && x <= 6), 'Nieprawidłowe kostki.');
          s.lastDice = dice; s.lastCard = null;
          const sum = dice[0] + dice[1], doubles = dice[0] === dice[1], jailed = p.inJail;
          log(s, `🎲 <strong>${esc(p.name)}</strong>: ${dice[0]} + ${dice[1]}.`);
          s.turnPhase = 'END'; s.extraRoll = false;
          if (jailed) {
            p.jailTurns += 1;
            if (!doubles && p.jailTurns < 3) break;
            p.inJail = false; p.jailTurns = 0; s.doublesStreak = 0;
            if (!doubles) {
              s.continuation = { playerId: p.id, steps: sum, diceSum: sum };
              charge(s, p.id, null, 50, 'Kaucja po trzeciej turze na Izbie');
              break;
            }
          } else {
            s.doublesStreak = doubles ? s.doublesStreak + 1 : 0;
            if (s.doublesStreak >= 3) { jail(s, p); break; }
            s.extraRoll = doubles;
          }
          move(s, p, sum); landing(s, p, sum);
          s.turnDeadline = s.updatedAt + 120000;
          break;
        }
        case 'BUY': {
          check(s.turnPhase === 'DECIDE', 'Kupować możesz tylko pole, na którym właśnie stanąłeś.');
          const t = tiles[p.position], prop = s.properties[p.position];
          check(prop && !prop.ownerId && p.cash >= t.price, 'Działka jest zajęta lub brakuje gotówki.');
          p.cash -= t.price; prop.ownerId = p.id; prop.boughtInRound = s.round;
          prop.history.unshift(`${stamp(s)} — ${p.name}: zakup od banku $${t.price}`);
          event(s, p.id, null, t.price, 'Zakup: ' + t.shortName);
          log(s, `🏘️ <strong>${esc(p.name)}</strong> kupuje ${esc(t.shortName)} za $${t.price}.`);
          s.turnPhase = 'END';
          break;
        }
        case 'DECLINE':
          check(s.turnPhase === 'DECIDE', 'Brak działki do wystawienia.'); startAuction(s, p.position); break;
        case 'END':
          check(s.turnPhase === 'END', 'Najpierw wykonaj rzut i podejmij decyzję o działce.');
          if (s.extraRoll && !p.inJail) { s.turnPhase = 'ROLL'; s.extraRoll = false; s.turnDeadline = s.updatedAt + 120000; }
          else nextTurn(s);
          break;
        case 'JAIL_PAY':
        case 'JAIL_CARD':
          check(p.inJail && s.turnPhase === 'ROLL', 'Wyjdź z Izby przed rzutem.');
          if (action.type === 'JAIL_CARD') { check(p.pardonCards > 0, 'Brak karty wolności.'); p.pardonCards--; p.pardonDecks = list(p.pardonDecks); p.pardonDecks.shift(); }
          else { check(p.cash >= 50, 'Kaucja kosztuje $50.'); p.cash -= 50; event(s, p.id, null, 50, 'Kaucja za Izbę OUG'); }
          p.inJail = false; p.jailTurns = 0;
          break;
        case 'BUILD': {
          manageAllowed(s, actor); const ok = buildCheck(s, action.index, actor); check(ok.ok, ok.reason);
          const t = tiles[action.index], prop = s.properties[action.index];
          who.cash -= t.buildCost; prop.level++;
          event(s, actor, null, t.buildCost, (prop.level === 5 ? 'Hotel: ' : 'Dom: ') + t.shortName);
          prop.history.unshift(`${stamp(s)} — Budowa: poziom ${prop.level}`);
          log(s, `🏗️ <strong>${esc(who.name)}</strong> buduje ${prop.level === 5 ? 'hotel' : 'dom'} — ${esc(t.shortName)}.`);
          break;
        }
        case 'SELL_HOUSE': {
          manageAllowed(s, actor); const ok = sellCheck(s, action.index, actor); check(ok.ok, ok.reason);
          const t = tiles[action.index]; s.properties[action.index].level--;
          credit(s, actor, Math.floor(t.buildCost / 2), 'Sprzedaż budynku: ' + t.shortName);
          break;
        }
        case 'SELL_GROUP': {
          manageAllowed(s, actor); const t = tiles[action.index];
          check(t?.type === 'PROPERTY' && ownsSet(s, t, actor), 'Sprzedaj zabudowę własnej dzielnicy.');
          let refund = 0;
          group(t).forEach(x => { const prop = s.properties[x.index]; refund += prop.level * Math.floor(x.buildCost / 2); prop.level = 0; });
          check(refund > 0, 'W tej dzielnicy nie ma budynków.');
          credit(s, actor, refund, 'Sprzedaż całej zabudowy dzielnicy');
          break;
        }
        case 'MORTGAGE': {
          manageAllowed(s, actor); const ok = mortgageCheck(s, action.index, actor); check(ok.ok, ok.reason);
          const t = tiles[action.index], prop = s.properties[action.index];
          if (prop.mortgaged) { const cost = Math.ceil(t.price * 0.55); who.cash -= cost; prop.mortgaged = false; event(s, actor, null, cost, 'Spłata hipoteki: ' + t.shortName); }
          else { prop.mortgaged = true; credit(s, actor, Math.floor(t.price / 2), 'Zastaw: ' + t.shortName); }
          break;
        }
        case 'BANKRUPT':
          manageAllowed(s, actor); bankrupt(s, actor, s.debt?.creditorId || null); break;
        case 'BID': {
          const a = s.auction; check(a, 'Licytacja jest już zakończona.');
          check(!a.passed.includes(actor) && a.leaderId !== actor, 'Prowadzisz lub już spasowałeś.');
          check(Number.isSafeInteger(action.amount) && action.amount > a.highBid && action.amount <= who.cash, 'Oferta musi być wyższa i mieścić się w Twojej gotówce.');
          a.highBid = action.amount; a.leaderId = actor; a.deadline = s.updatedAt + 15000;
          log(s, `🔨 ${esc(who.name)} licytuje $${action.amount}.`);
          if (activePlayers(s).filter(x => x.id !== a.leaderId && !a.passed.includes(x.id)).length === 0) closeAuction(s);
          break;
        }
        case 'PASS': {
          const a = s.auction; check(a && a.leaderId !== actor && !a.passed.includes(actor), 'Nie możesz teraz spasować.');
          a.passed.push(actor);
          if (activePlayers(s).filter(x => x.id !== a.leaderId && !a.passed.includes(x.id)).length === 0) closeAuction(s);
          break;
        }
        case 'TICK':
          if (s.auction) { check(s.updatedAt >= s.auction.deadline, 'Licytacja jeszcze trwa.'); closeAuction(s); }
          else {
            check(s.updatedAt >= s.turnDeadline, 'Tura jeszcze trwa.');
            // Nie pomijamy długu. Dajemy 2 minuty na likwidację majątku, potem rozliczamy bankructwo.
            if (s.debt) bankrupt(s, s.debt.playerId, s.debt.creditorId);
            else if (s.turnPhase === 'DECIDE') startAuction(s, p.position);
            else if (s.turnPhase === 'ROLL') {
              // Automatyczne zakończenie bez darmowej premii i bez nieustannych dubletów.
              nextTurn(s);
            } else nextTurn(s);
          }
          break;
        default: throw new Error('Nieznana akcja.');
      }
      settle(s);
      s.revision += 1;
      return s;
    }

    function botAction(s) {
      if (s.auction) {
        const a = s.auction;
        const bot = activePlayers(s).find(p => p.isBot && p.id !== a.leaderId && !a.passed.includes(p.id));
        if (!bot) return null;
        const t = tiles[a.tileIndex], prop = s.properties[t.index];
        const completes = t.type === 'PROPERTY' && group(t).filter(x => x.index !== t.index).every(x => s.properties[x.index].ownerId === bot.id);
        const limit = Math.min(Math.max(0, bot.cash - 100), Math.floor(t.price * (completes ? 1.6 : 1.05)));
        const amount = a.highBid ? a.highBid + 10 : 1;
        return { actor: bot.id, type: amount <= limit ? 'BID' : 'PASS', amount };
      }
      const p = s.debt ? player(s, s.debt.playerId) : current(s);
      if (!p?.isBot || p.bankrupt) return null;
      if (s.debt) {
        const improved = tiles.find(t => s.properties[t.index]?.ownerId === p.id && sellCheck(s, t.index, p.id).ok);
        if (improved) return { actor: p.id, type: 'SELL_HOUSE', index: improved.index };
        const stuckHotel = tiles.find(t => s.properties[t.index]?.ownerId === p.id && s.properties[t.index].level > 0);
        if (stuckHotel) return { actor: p.id, type: 'SELL_GROUP', index: stuckHotel.index };
        const mortgage = tiles.find(t => s.properties[t.index]?.ownerId === p.id && !s.properties[t.index].mortgaged && mortgageCheck(s, t.index, p.id).ok);
        return mortgage ? { actor: p.id, type: 'MORTGAGE', index: mortgage.index } : { actor: p.id, type: 'BANKRUPT' };
      }
      const build = tiles.find(t => buildCheck(s, t.index, p.id).ok && p.cash - t.buildCost >= 180);
      if (build) return { actor: p.id, type: 'BUILD', index: build.index };
      if (s.turnPhase === 'ROLL') return { actor: p.id, type: 'ROLL' };
      if (s.turnPhase === 'DECIDE') return { actor: p.id, type: p.cash >= tiles[p.position].price ? 'BUY' : 'DECLINE' };
      if (s.turnPhase === 'END') return { actor: p.id, type: 'END' };
      return null;
    }
    return { initialize, normalize, reduce, rent, buildCheck, sellCheck, mortgageCheck, buildingStock, netWorth, botAction, liquidationValue, rulesVersion: RULES_VERSION };
  }
  return { createEngine, RULES_VERSION, escapeHTML: esc };
});
