const { test } = require('node:test');
const assert = require('node:assert/strict');
const data = require('../board-data.js');
const engine = require('../monopoly-engine.js').createEngine(data);
const baseTime = 1793260800000;
function fresh(count = 3, options = {}) {
  const properties = {};
  data.BOARD_TILES.filter(t => t.price).forEach(t => { properties[t.index] = { ownerId: null, level: 0, mortgaged: false, history: [] }; });
  return engine.initialize({ players: Array.from({ length: count }, (_, i) => ({ id: 'p' + (i + 1), name: 'Gracz ' + (i + 1), isBot: false })), properties, feed: [], chat: [], lobbyOpen: false }, { now: baseTime, seed: 12345, startingCash: 1500, roundLimit: 30, ...options });
}
function act(s, type, fields = {}, actor = s.debt?.playerId || s.players[s.turnIndex].id) {
  return engine.reduce(s, { type, expectedRevision: s.revision, now: s.updatedAt + 1000, ...fields }, actor);
}
function own(s, id, indices, level = 0) { indices.forEach(i => { Object.assign(s.properties[i], { ownerId: id, level }); }); return s; }
function assertValid(s) {
  assert.ok(s.players.every(p => Number.isFinite(p.cash) && p.cash >= 0), 'gotówka nie może być ujemna');
  Object.values(s.properties).forEach(p => {
    assert.ok(Number.isInteger(p.level) && p.level >= 0 && p.level <= 5);
    assert.ok(!p.ownerId || s.players.some(x => x.id === p.ownerId && !x.bankrupt));
    assert.ok(!p.mortgaged || p.level === 0);
  });
  const stock = engine.buildingStock(s); assert.ok(stock.houses >= 0 && stock.hotels >= 0);
}
test('klasyczny kapitał, limit rund i osobny portfel minigier', () => {
  const s = fresh(); assert.equal(s.players[0].cash, 1500); assert.equal(s.players[0].arcadeCash, 2000); assert.equal(s.roundLimit, 30);
});
test('reducer nie zmienia wejściowego stanu', () => {
  const s = fresh(), before = JSON.stringify(s); act(s, 'ROLL', { dice: [1, 2] }); assert.equal(JSON.stringify(s), before);
});
test('zakup dotyczy wyłącznie wolnego pola po rzucie', () => {
  let s = act(fresh(), 'ROLL', { dice: [1, 2] }); assert.equal(s.turnPhase, 'DECIDE');
  s = act(s, 'BUY'); assert.equal(s.properties[3].ownerId, 'p1'); assert.equal(s.players[0].cash, 1440);
  assert.throws(() => act(s, 'BUY'));
});
test('nie można zakończyć tury przed rzutem ani pominąć zakupu', () => {
  assert.throws(() => act(fresh(), 'END'));
  const s = act(fresh(), 'ROLL', { dice: [1, 2] }); assert.throws(() => act(s, 'END'));
});
test('przekroczenie START daje dokładnie $200', () => {
  const s = fresh(); s.players[0].position = 39;
  const n = act(s, 'ROLL', { dice: [1, 3] }); assert.equal(n.players[0].cash, 1700); assert.equal(n.players[0].position, 3);
});
test('parking nie dodaje gotówki', () => {
  const s = fresh(); s.players[0].position = 17;
  const n = act(s, 'ROLL', { dice: [1, 2] }); assert.equal(n.players[0].cash, 1500);
});
test('pełna dzielnica podwaja pusty czynsz, hipoteka wyłącza czynsz', () => {
  const s = own(fresh(), 'p2', [1, 3]); assert.equal(engine.rent(s, 1), 4);
  s.properties[1].mortgaged = true; assert.equal(engine.rent(s, 1), 0);
});
test('lotniska mają czynsze 25/50/100/200 i nie kończą gry', () => {
  const s = fresh(); data.AIRPORT_INDICES.forEach((i, n) => { own(s, 'p1', [i]); assert.equal(engine.rent(s, 5), [25, 50, 100, 200][n]); });
  const n = act(s, 'ROLL', { dice: [1, 2] }); assert.equal(n.status, 'PLAYING');
});
test('zakłady pobierają 4 lub 10 razy sumę kostek', () => {
  const s = own(fresh(), 'p2', [12]); assert.equal(engine.rent(s, 12, 8), 32);
  own(s, 'p2', [28]); assert.equal(engine.rent(s, 12, 8), 80);
});
test('budowa wymaga całego koloru, nie wejścia pionkiem na działkę', () => {
  const s = own(fresh(), 'p1', [1]); assert.equal(engine.buildCheck(s, 1, 'p1').ok, false);
  own(s, 'p1', [3]); assert.equal(s.players[0].position, 0);
  const n = act(s, 'BUILD', { index: 1 }); assert.equal(n.properties[1].level, 1);
});
test('domy trzeba budować i sprzedawać równomiernie', () => {
  let s = own(fresh(), 'p1', [1, 3]); s = act(s, 'BUILD', { index: 1 });
  assert.throws(() => act(s, 'BUILD', { index: 1 })); s = act(s, 'BUILD', { index: 3 });
  s = act(s, 'BUILD', { index: 1 }); assert.throws(() => act(s, 'SELL_HOUSE', { index: 3 }));
  const cash = s.players[0].cash; s = act(s, 'SELL_HOUSE', { index: 1 }); assert.equal(s.players[0].cash, cash + 25);
});
test('hipoteka w dzielnicy blokuje budowę', () => {
  let s = own(fresh(), 'p1', [1, 3]); s = act(s, 'MORTGAGE', { index: 3 }); assert.equal(engine.buildCheck(s, 1, 'p1').ok, false);
});
test('zastaw wymaga sprzedaży budynków całego koloru i spłata kosztuje 55%', () => {
  let s = own(fresh(), 'p1', [1, 3]); s.properties[3].level = 1;
  assert.throws(() => act(s, 'MORTGAGE', { index: 1 }));
  s.properties[3].level = 0; s = act(s, 'MORTGAGE', { index: 1 }); assert.equal(s.players[0].cash, 1530);
  s = act(s, 'MORTGAGE', { index: 1 }); assert.equal(s.players[0].cash, 1497);
});
test('bank ma 32 domy i 12 hoteli; hotel oddaje cztery domy', () => {
  let s = own(fresh(), 'p1', [1, 3], 4); assert.equal(engine.buildingStock(s).houses, 24);
  s = act(s, 'BUILD', { index: 1 }); assert.equal(engine.buildingStock(s).houses, 28); assert.equal(engine.buildingStock(s).hotels, 11);
});
test('brak domów blokuje kolejną budowę', () => {
  const s = own(fresh(), 'p1', [1, 3]); const candidates = data.BOARD_TILES.filter(t => t.type === 'PROPERTY' && ![1, 3].includes(t.index));
  candidates.slice(0, 8).forEach(t => own(s, 'p2', [t.index], 4)); assert.equal(engine.buildingStock(s).houses, 0);
  assert.equal(engine.buildCheck(s, 1, 'p1').ok, false);
});
test('dublet daje ponowny rzut, trzeci wysyła do Izby', () => {
  let s = fresh(); s = act(s, 'ROLL', { dice: [2, 2] }); s = act(s, 'END'); assert.equal(s.turnIndex, 0); assert.equal(s.turnPhase, 'ROLL');
  s = act(s, 'ROLL', { dice: [3, 3] }); s = act(s, 'END');
  s = act(s, 'ROLL', { dice: [4, 4] }); assert.equal(s.players[0].inJail, true); assert.equal(s.players[0].position, 10); assert.equal(s.extraRoll, false);
});
test('dublet wychodzący z Izby nie daje dodatkowego rzutu', () => {
  let s = fresh(); s.players[0].inJail = true; s.players[0].position = 10;
  s = act(s, 'ROLL', { dice: [2, 2] }); assert.equal(s.players[0].inJail, false); assert.equal(s.extraRoll, false);
  s = act(s, 'BUY'); s = act(s, 'END'); assert.equal(s.turnIndex, 1);
});
test('trzecia nieudana próba w Izbie pobiera 50 i wykonuje ruch', () => {
  let s = fresh(); Object.assign(s.players[0], { inJail: true, position: 10, jailTurns: 2 });
  s = act(s, 'ROLL', { dice: [1, 2] }); assert.equal(s.players[0].cash, 1450); assert.equal(s.players[0].position, 13); assert.equal(s.turnPhase, 'DECIDE');
});
test('czynsz jest jednym transferem bez tworzenia pieniędzy', () => {
  const s = own(fresh(), 'p2', [3]); const n = act(s, 'ROLL', { dice: [1, 2] });
  assert.equal(n.players[0].cash, 1496); assert.equal(n.players[1].cash, 1504);
});
test('dług nie tworzy ujemnej gotówki ani pieniędzy u wierzyciela', () => {
  let s = own(fresh(), 'p2', [3], 2); own(s, 'p1', [5]); s.players[0].cash = 10;
  s = act(s, 'ROLL', { dice: [1, 2] }); assert.equal(s.turnPhase, 'DEBT'); assert.equal(s.players[1].cash, 1500); assert.equal(s.players[0].cash, 10);
  assert.throws(() => act(s, 'END'));
  s = act(s, 'MORTGAGE', { index: 5 }); assert.equal(s.debt, null); assert.equal(s.players[1].cash, 1560); assert.equal(s.players[0].cash, 50);
});
test('niewypłacalność przekazuje tylko pozostałą gotówkę i działki', () => {
  const s = own(fresh(), 'p2', [39], 5); own(s, 'p1', [1]); s.players[0].cash = 10; s.players[0].position = 36;
  const n = act(s, 'ROLL', { dice: [1, 2] }); assert.equal(n.players[0].bankrupt, true); assert.equal(n.players[1].cash, 1510); assert.equal(n.properties[1].ownerId, 'p2'); assert.equal(n.turnIndex, 1);
});
test('bankructwo wobec banku wystawia majątek na wspólną licytację', () => {
  const s = own(fresh(), 'p1', [1]); s.players[0].cash = 0; s.players[0].position = 1;
  const n = act(s, 'ROLL', { dice: [1, 2] }); assert.equal(n.players[0].bankrupt, true); assert.equal(n.properties[1].ownerId, null); assert.equal(n.auction.tileIndex, 1);
});
test('ostatni wypłacalny gracz wygrywa, kolejne akcje są blokowane', () => {
  const s = fresh(2); const n = act(s, 'BANKRUPT'); assert.equal(n.status, 'FINISHED'); assert.equal(n.winnerAnnouncement.winnerId, 'p2'); assert.throws(() => act(n, 'ROLL', { dice: [1, 2] }, 'p2'));
});
test('licytacja przyjmuje oferty gracza, który odmówił zakupu', () => {
  let s = act(fresh(), 'ROLL', { dice: [1, 2] }); s = act(s, 'DECLINE');
  s = act(s, 'BID', { amount: 1 }); assert.equal(s.auction.leaderId, 'p1');
  s = act(s, 'PASS', {}, 'p2'); s = act(s, 'PASS', {}, 'p3');
  assert.equal(s.auction, null); assert.equal(s.properties[3].ownerId, 'p1'); assert.equal(s.players[0].cash, 1499);
});
test('licytacja odrzuca za niskie, nadmierne i cudze oferty po pasie', () => {
  let s = act(fresh(), 'ROLL', { dice: [1, 2] }); s = act(s, 'DECLINE'); s = act(s, 'BID', { amount: 10 }, 'p1');
  assert.throws(() => act(s, 'BID', { amount: 10 }, 'p2')); assert.throws(() => act(s, 'BID', { amount: 9999 }, 'p2'));
  s = act(s, 'PASS', {}, 'p2'); assert.throws(() => act(s, 'BID', { amount: 20 }, 'p2'));
});
test('licytacja bez ofert kończy się po czasie', () => {
  let s = act(fresh(), 'ROLL', { dice: [1, 2] }); s = act(s, 'DECLINE');
  s = act(s, 'TICK', { now: s.auction.deadline + 1 }); assert.equal(s.auction, null); assert.equal(s.properties[3].ownerId, null); assert.equal(s.turnPhase, 'END');
});
test('przestarzała rewizja odrzuca zduplikowany rzut i podwójną płatność', () => {
  const s = own(fresh(), 'p2', [3]); const action = { type: 'ROLL', dice: [1, 2], expectedRevision: 0, now: baseTime + 1000 };
  const after = engine.reduce(s, action, 'p1'); assert.throws(() => engine.reduce(after, action, 'p1')); assert.equal(after.players[1].cash, 1504);
});
test('nie można sterować innym graczem ani użyć usuniętego wykupu', () => {
  assert.throws(() => act(fresh(), 'ROLL', { dice: [1, 2] }, 'p2')); assert.throws(() => act(fresh(), 'BUYOUT', { index: 3 }));
});
test('koniec limitu pełnych rund rozstrzyga majątek, hipoteki obniżają wycenę', () => {
  const s = own(fresh(2), 'p1', [39]); s.round = 30; s.turnIndex = 1; s.turnPhase = 'END'; s.properties[39].mortgaged = true;
  assert.equal(engine.netWorth(s, 'p1'), 1700);
  const n = act(s, 'END'); assert.equal(n.status, 'FINISHED'); assert.equal(n.winnerAnnouncement.winnerId, 'p1'); assert.equal(n.round, 31);
});
test('równy majątek na końcu limitu daje jawną wspólną wygraną', () => {
  const s = fresh(2); s.round = 30; s.turnIndex = 1; s.turnPhase = 'END';
  const n = act(s, 'END'); assert.equal(n.status, 'FINISHED'); assert.match(n.winnerAnnouncement.winnerName, /Gracz 1 i Gracz 2/);
});
test('karta urodzin może wymagać spłaty od gracza poza jego turą', () => {
  let s = own(fresh(), 'p2', [1]); s.players[1].cash = 5; s.players[0].position = 14;
  s.cards.chest = [3, 0, 1, 2, 4, 5, 6, 7]; s = act(s, 'ROLL', { dice: [1, 2] });
  assert.equal(s.debt.playerId, 'p2'); s = act(s, 'MORTGAGE', { index: 1 }, 'p2');
  assert.equal(s.debt, null); assert.equal(s.players[0].cash, 1520); assert.equal(s.players[1].cash, 25);
});
test('normalizacja odtwarza puste tablice usunięte przez Firebase', () => {
  const s = fresh(); delete s.paymentQueue; delete s.auctionQueue; delete s.moneyEvents;
  const n = engine.normalize(s); assert.deepEqual(n.paymentQueue, []); assert.deepEqual(n.moneyEvents, []);
});
test('48 pełnych partii z 2, 3, 4 i 6 botami kończy się zwycięstwem', () => {
  for (let seed = 1; seed <= 12; seed++) for (const count of [2, 3, 4, 6]) {
    let s = fresh(count, { seed, roundLimit: seed % 2 ? 20 : 30 }); s.players.forEach(p => { p.isBot = true; });
    let x = seed * 9173, steps = 0;
    const die = () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return 1 + (x >>> 16) % 6; };
    while (s.status === 'PLAYING' && steps++ < 10000) {
      const next = engine.botAction(s); assert.ok(next, 'bot musi mieć akcję: ' + s.turnPhase);
      if (next.type === 'ROLL') next.dice = [die(), die()];
      s = act(s, next.type, next, next.actor); assertValid(s);
    }
    assert.equal(s.status, 'FINISHED', `seed ${seed}, gracze ${count}, kroki ${steps}`); assert.ok(s.winnerAnnouncement.winnerName);
  }
});
test('karta wolności z danej talii nie jest wydawana ponownie, gdy ktoś ją trzyma', () => {
  let s = fresh(); s.players[0].position = 14; s.cards.chest = [4, 0, 1, 2, 3, 5, 6, 7];
  s = act(s, 'ROLL', { dice: [1, 2] }); assert.equal(s.players[0].pardonCards, 1);
  s = act(s, 'END'); s.players[1].position = 14; s.cards.chest = [4, 0, 1, 2, 3, 5, 6, 7];
  s = act(s, 'ROLL', { dice: [1, 2] }); assert.equal(s.players[1].pardonCards, 0); assert.equal(s.players[1].cash, 1600);
  s.turnIndex = 0; s.turnPhase = 'ROLL'; s.players[0].inJail = true;
  s = act(s, 'JAIL_CARD'); assert.equal(s.players[0].pardonCards, 0); assert.deepEqual(s.players[0].pardonDecks, []);
});
test('bezczynność przy długu rozlicza bankructwo po pełnym czasie na spłatę', () => {
  let s = own(fresh(), 'p2', [3], 2); own(s, 'p1', [5]); s.players[0].cash = 10;
  s = act(s, 'ROLL', { dice: [1, 2] }); assert.equal(s.turnPhase, 'DEBT');
  assert.throws(() => act(s, 'TICK', { now: s.turnDeadline - 1 }, 'p2'));
  s = act(s, 'TICK', { now: s.turnDeadline + 1 }, 'p2'); assert.equal(s.players[0].bankrupt, true); assert.equal(s.properties[5].ownerId, 'p2');
});
