/**
 * RUDA ŚLĄSKA ARENA ULTIMATE — POŁĄCZONY I NAPRAWIONY SILNIK (3 W 1)
 * Naprawiona synchronizacja Firebase Online + Przełącznik 1v1 / 2v2 w grach 2-osobowych
 */

/* ==================== CZĘŚĆ A: DANE PLANSZY (board-data) ==================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RudaBoard = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const GROUPS = {
    ORZEGOW:     { name: 'Orzegów / Chebzie',       color: '#7cb342', code: 'ORZ' },
    GODULA:      { name: 'Godula / Ruda',           color: '#29b6f6', code: 'GOD' },
    KOCHLOWICE:  { name: 'Kochłowice / Czarny Las', color: '#ab47bc', code: 'KOC' },
    BYKOWINA:    { name: 'Bykowina',                color: '#ffa726', code: 'BYK' },
    BIELSZOWICE: { name: 'Bielszowice',             color: '#ef5350', code: 'BIE' },
    HALEMBA:     { name: 'Halemba',                 color: '#fdd835', code: 'HAL' },
    WIREK:       { name: 'Wirek (Zagłębie)',        color: '#26a69a', code: 'WIR' },
    NOWY_BYTOM:  { name: 'Nowy Bytom (Centrum)',    color: '#5c6bc0', code: 'NBY' },
    AIRPORT:     { name: 'Lotniska — czynsz za komplet', color: '#00e5ff', code: 'LOT' },
    UTILITY:     { name: 'Huty i Elektrownie',      color: '#ffa000', code: 'HUT' }
  };

  const AIRPORT_INDICES = [5, 15, 25, 35];

  const BOARD_TILES = [
    { index: 0,  type: 'START',      name: 'START — Zjazd Szybem', shortName: 'START', subtitle: '+$200 za okrążenie' },
    { index: 1,  type: 'PROPERTY',   name: 'Orzegów — Burloch Arena', shortName: 'Burloch Arena', district: 'Orzegów', group: 'ORZEGOW', price: 60, buildCost: 50, rents: [2, 10, 30, 90, 160, 250] },
    { index: 2,  type: 'TREASURE',   name: 'Skarb Skarbnika', shortName: 'Skarb', district: 'Kasa Kopalni' },
    { index: 3,  type: 'PROPERTY',   name: 'Chebzie — Kolonia Kaufhaus', shortName: 'Kaufhaus', district: 'Chebzie', group: 'ORZEGOW', price: 60, buildCost: 50, rents: [4, 20, 60, 180, 320, 450] },
    { index: 4,  type: 'TAX',        name: 'Podatek Górniczy', shortName: 'Podatek', district: 'Urząd Miasta', taxAmount: 200 },
    { index: 5,  type: 'AIRPORT',    name: 'Lotnisko Chebzie-DTŚ (1/4)', shortName: '✈️ Lotnisko DTŚ', district: 'Transport', group: 'AIRPORT', price: 200, rents: [25, 50, 100, 200] },
    { index: 6,  type: 'PROPERTY',   name: 'Godula — Szyb Godula', shortName: 'Szyb Godula', district: 'Godula', group: 'GODULA', price: 100, buildCost: 50, rents: [6, 30, 90, 270, 400, 550] },
    { index: 7,  type: 'SURPRISE',   name: 'Szansa na Szychcie', shortName: 'Szansa', district: 'Losowanie' },
    { index: 8,  type: 'PROPERTY',   name: 'Godula — Kwiaciarnia Godula', shortName: 'Kwiaciarnia Godula', district: 'Godula', group: 'GODULA', price: 100, buildCost: 50, rents: [6, 30, 90, 270, 400, 550] },
    { index: 9,  type: 'PROPERTY',   name: 'Ruda — KWK Pokój (Szyb)', shortName: 'KWK Pokój', district: 'Ruda', group: 'GODULA', price: 120, buildCost: 50, rents: [8, 40, 100, 300, 450, 600] },
    { index: 10, type: 'JAIL',       name: 'Izba / Kontrola OUG', shortName: 'Izba OUG', subtitle: 'Kontrola Górnicza' },
    { index: 11, type: 'PROPERTY',   name: 'Czarny Las — Osiedle', shortName: 'Czarny Las', district: 'Czarny Las', group: 'KOCHLOWICE', price: 140, buildCost: 100, rents: [10, 50, 150, 450, 625, 750] },
    { index: 12, type: 'UTILITY',    name: 'Elektrociepłownia Mikołaj', shortName: 'EC Mikołaj', district: 'Energetyka', group: 'UTILITY', price: 150 },
    { index: 13, type: 'PROPERTY',   name: 'Kochłowice — Rynek', shortName: 'Kochłowice', district: 'Kochłowice', group: 'KOCHLOWICE', price: 140, buildCost: 100, rents: [10, 50, 150, 450, 625, 750] },
    { index: 14, type: 'PROPERTY',   name: 'Kochłowice — Szyb Radoszowy', shortName: 'Szyb Radoszowy', district: 'Kochłowice', group: 'KOCHLOWICE', price: 160, buildCost: 100, rents: [12, 60, 180, 500, 700, 900] },
    { index: 15, type: 'AIRPORT',    name: 'Lotnisko Ruda Północ (2/4)', shortName: '✈️ Lotnisko Ruda', district: 'Transport', group: 'AIRPORT', price: 200, rents: [25, 50, 100, 200] },
    { index: 16, type: 'PROPERTY',   name: 'Bykowina — Gwarek', shortName: 'Bykowina', district: 'Bykowina', group: 'BYKOWINA', price: 180, buildCost: 100, rents: [14, 70, 200, 550, 750, 950] },
    { index: 17, type: 'TREASURE',   name: 'Skarb Skarbnika', shortName: 'Skarb', district: 'Kasa Kopalni' },
    { index: 18, type: 'PROPERTY',   name: 'Bykowina — ul. Górnośląska', shortName: 'Górnośląska', district: 'Bykowina', group: 'BYKOWINA', price: 180, buildCost: 100, rents: [14, 70, 200, 550, 750, 950] },
    { index: 19, type: 'PROPERTY',   name: 'Bykowina — Planetarium Skałka', shortName: 'Skałka', district: 'Bykowina', group: 'BYKOWINA', price: 200, buildCost: 100, rents: [16, 80, 220, 600, 800, 1000] },
    { index: 20, type: 'VACATION',   name: 'Hałda Widokowa', shortName: 'Hałda', subtitle: 'Bezpłatny parking' },
    { index: 21, type: 'PROPERTY',   name: 'Bielszowice — Dom Kultury', shortName: 'Bielszowice', district: 'Bielszowice', group: 'BIELSZOWICE', price: 220, buildCost: 150, rents: [18, 90, 250, 700, 875, 1050] },
    { index: 22, type: 'SURPRISE',   name: 'Szansa na Szychcie', shortName: 'Szansa', district: 'Losowanie' },
    { index: 23, type: 'PROPERTY',   name: 'Bielszowice — ul. Kokota', shortName: 'ul. Kokota', district: 'Bielszowice', group: 'BIELSZOWICE', price: 220, buildCost: 150, rents: [18, 90, 250, 700, 875, 1050] },
    { index: 24, type: 'PROPERTY',   name: 'Bielszowice — KWK Ruda Ruch', shortName: 'KWK Ruda', district: 'Bielszowice', group: 'BIELSZOWICE', price: 240, buildCost: 150, rents: [20, 100, 300, 750, 925, 1100] },
    { index: 25, type: 'AIRPORT',    name: 'Lotnisko Halemba-Południe (3/4)', shortName: '✈️ Lotnisko Halemba', district: 'Transport', group: 'AIRPORT', price: 200, rents: [25, 50, 100, 200] },
    { index: 26, type: 'PROPERTY',   name: 'Halemba — Aquadrom', shortName: 'Aquadrom', district: 'Halemba', group: 'HALEMBA', price: 260, buildCost: 150, rents: [22, 110, 330, 800, 975, 1150] },
    { index: 27, type: 'PROPERTY',   name: 'Halemba — Elektrownia Halemba', shortName: 'El. Halemba', district: 'Halemba', group: 'HALEMBA', price: 260, buildCost: 150, rents: [22, 110, 330, 800, 975, 1150] },
    { index: 28, type: 'UTILITY',    name: 'Wodociągi Rudzkie PWiK', shortName: 'Wodociągi', district: 'Infrastruktura', group: 'UTILITY', price: 150 },
    { index: 29, type: 'PROPERTY',   name: 'Halemba — KWK Halemba', shortName: 'KWK Halemba', district: 'Halemba', group: 'HALEMBA', price: 280, buildCost: 150, rents: [24, 120, 360, 850, 1025, 1200] },
    { index: 30, type: 'GO_TO_JAIL', name: 'Alarm Metanowy!', shortName: 'Na Izbę!', subtitle: 'Idź na Izbę' },
    { index: 31, type: 'PROPERTY',   name: 'Wirek — Kolonia Ficinus', shortName: 'Ficinus', district: 'Wirek', group: 'WIREK', price: 300, buildCost: 200, rents: [26, 130, 390, 900, 1100, 1275] },
    { index: 32, type: 'PROPERTY',   name: 'Wirek — Szyb Andrzej', shortName: 'Szyb Andrzej', district: 'Wirek', group: 'WIREK', price: 300, buildCost: 200, rents: [26, 130, 390, 900, 1100, 1275] },
    { index: 33, type: 'TREASURE',   name: 'Skarb Skarbnika', shortName: 'Skarb', district: 'Kasa Kopalni' },
    { index: 34, type: 'PROPERTY',   name: 'Wirek — CH Plaza Ruda Śląska', shortName: 'CH Plaza', district: 'Wirek', group: 'WIREK', price: 320, buildCost: 200, rents: [28, 150, 450, 1000, 1200, 1400] },
    { index: 35, type: 'AIRPORT',    name: 'Port Lotniczy Wirek-A4 (4/4)', shortName: '✈️ Lotnisko A4', district: 'Transport', group: 'AIRPORT', price: 200, rents: [25, 50, 100, 200] },
    { index: 36, type: 'SURPRISE',   name: 'Szansa na Szychcie', shortName: 'Szansa', district: 'Losowanie' },
    { index: 37, type: 'PROPERTY',   name: 'Nowy Bytom — Wielki Piec Huty Pokój', shortName: 'Huta Pokój', district: 'Nowy Bytom', group: 'NOWY_BYTOM', price: 350, buildCost: 200, rents: [35, 175, 500, 1100, 1300, 1500] },
    { index: 38, type: 'TAX',        name: 'Podatek Węglowy', shortName: 'Podatek', district: 'Opłata Specjalna', taxAmount: 100 },
    { index: 39, type: 'PROPERTY',   name: 'Nowy Bytom — Plac Jana Pawła II (Ratusz)', shortName: 'Ratusz N.Bytom', district: 'Nowy Bytom', group: 'NOWY_BYTOM', price: 400, buildCost: 200, rents: [50, 200, 600, 1400, 1700, 2000] }
  ];

  const SURPRISE_CARDS = [
    { text: 'Premia za szychty. Bank wypłaca Ci $100.', action: 'CASH', amount: 100 },
    { text: 'Przejdź na START. Pobierz $200.', action: 'MOVE_TO', target: 0 },
    { text: 'Awaria wentylacji. Zapłać bankowi $50.', action: 'PAY_BANK', amount: 50 },
    { text: 'Karta wolności z Izby OUG. Zachowaj do użycia.', action: 'PARDON' },
    { text: 'Kontrola OUG. Idź na Izbę bez premii za START.', action: 'GO_JAIL' },
    { text: 'Remont dzielnic: $25 za dom i $100 za hotel.', action: 'REPAIRS', house: 25, hotel: 100 },
    { text: 'Jedź do Huty Pokój. Po drodze pobierz premię za START.', action: 'MOVE_TO', target: 37 },
    { text: 'Karczma Piwna! Zapłać każdemu rywalowi $50.', action: 'PAY_EACH', amount: 50 }
  ];

  const TREASURE_CARDS = [
    { text: 'Premia barbórkowa! Bank wypłaca Ci $100.', action: 'CASH', amount: 100 },
    { text: 'Zwrot podatku. Otrzymujesz $50.', action: 'CASH', amount: 50 },
    { text: 'Fundusz rekultywacji. Zapłać bankowi $100.', action: 'PAY_BANK', amount: 100 },
    { text: 'Urodziny! Każdy rywal płaci Ci $10.', action: 'BIRTHDAY', amount: 10 },
    { text: 'Karta wolności z Izby OUG. Zachowaj do użycia.', action: 'PARDON' },
    { text: 'Kontrola OUG. Idź na Izbę bez premii za START.', action: 'GO_JAIL' },
    { text: 'Przejdź na START. Pobierz $200.', action: 'MOVE_TO', target: 0 },
    { text: 'Przegląd budynków: $40 za dom i $115 za hotel.', action: 'REPAIRS', house: 40, hotel: 115 }
  ];

  return { GROUPS, AIRPORT_INDICES, BOARD_TILES, SURPRISE_CARDS, TREASURE_CARDS };
});

/* ==================== CZĘŚĆ B: SILNIK MONOPOLY (monopoly-engine) ==================== */
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
      s.debt = (s.debt && s.debt.playerId) ? s.debt : null;
      s.continuation = (s.continuation && s.continuation.playerId) ? s.continuation : null;
      s.winnerAnnouncement = (s.winnerAnnouncement && s.winnerAnnouncement.winnerName) ? s.winnerAnnouncement : null;
      s.lastCard = (s.lastCard && s.lastCard.text) ? s.lastCard : null;
      if (s.auction && typeof s.auction.tileIndex === 'number') {
        s.auction.passed = list(s.auction.passed);
        s.auction.leaderId = s.auction.leaderId || null;
      } else {
        s.auction = null;
      }
      if (s.cards && list(s.cards.chance).length && list(s.cards.chest).length) {
        s.cards.chance = list(s.cards.chance);
        s.cards.chest = list(s.cards.chest);
      } else {
        s.cards = {
          chance: Array.from({ length: chance.length }, (_, i) => i),
          chest: Array.from({ length: chest.length }, (_, i) => i)
        };
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
      if (t.type === 'AIRPORT') return t.rents[airports.filter(i => s.properties[i]?.ownerId === p.ownerId).length - 1] || 25;
      if (t.type === 'UTILITY') return diceSum * (tiles.filter(x => x.type === 'UTILITY' && s.properties[x.index]?.ownerId === p.ownerId).length === 2 ? 10 : 4);
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
      if (!owner || owner.bankrupt || current(s)?.id !== id) return { ok: false, reason: 'Buduj w swojej turze.' };
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
      s.winnerAnnouncement = { winnerId: winners[0]?.id || '', winnerName: winners.map(p => p.name).join(' i '),
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
      const held = s.players.some(x => list(x.pardonDecks).includes(key));
      let index = s.cards[key].shift();
      if (index === undefined) index = 0;
      s.cards[key].push(index);
      if (deck[index].action === 'PARDON' && held) {
        index = s.cards[key].shift() ?? 0; s.cards[key].push(index);
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
            if (s.debt) bankrupt(s, s.debt.playerId, s.debt.creditorId);
            else if (s.turnPhase === 'DECIDE') startAuction(s, p.position);
            else nextTurn(s);
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
        const t = tiles[a.tileIndex];
        const completes = t.type === 'PROPERTY' && group(t).filter(x => x.index !== t.index).every(x => s.properties[x.index]?.ownerId === bot.id);
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

/* ==================== CZĘŚĆ C: GŁÓWNA APLIKACJA I FIREBASE ONLINE ==================== */
(function () {
  'use strict';

  const storage = (() => {
    try {
      const s = window.localStorage;
      s.setItem('ruda_storage_check', '1');
      s.removeItem('ruda_storage_check');
      return s;
    } catch (e) {
      const memory = new Map();
      return {
        getItem: key => memory.get(key) || null,
        setItem: (key, value) => memory.set(key, String(value)),
        removeItem: key => memory.delete(key)
      };
    }
  })();

  const sessionStore = (() => {
    try {
      const s = window.sessionStorage;
      s.setItem('ruda_session_check', '1');
      s.removeItem('ruda_session_check');
      return s;
    } catch (e) {
      return storage;
    }
  })();

  const HARDCODED_FIREBASE_URL = "";
  const STORAGE_VERSION = "v16_monopoly_online_fix";
  storage.setItem('ruda_arena_version', STORAGE_VERSION);

  /* ==================== 1. MAPY RUDY ŚLĄSKIEJ ==================== */
  const RUDA_MAPS = [
    { id: 'KAUFHAUS', shortTitle: 'Kaufhaus', fullTitle: 'Kolonia Kaufhaus (Chebzie)', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ruda_Slaska_Chebzie_Kaufhaus_02.jpg?width=1440', fallbackGradient: 'linear-gradient(135deg, #4a2118 0%, #160f29 100%)' },
    { id: 'HUTA_POKOJ', shortTitle: 'Wielki Piec', fullTitle: 'Wielki Piec Huty Pokój (Nowy Bytom)', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Huta_Pok%C3%B3j_-_Wielki_Piec.jpg?width=1440', fallbackGradient: 'linear-gradient(135deg, #4d3014 0%, #10172b 100%)' },
    { id: 'SZYB_ANDRZEJ', shortTitle: 'Szyb Andrzej', fullTitle: 'Zabytkowy Szyb Andrzej (Wirek)', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Szyb_Andrzej_w_Rudzie_%C5%9Al%C4%85skiej.JPG?width=1440', fallbackGradient: 'linear-gradient(135deg, #173b34 0%, #140f2b 100%)' },
    { id: 'FICINUS', shortTitle: 'Kolonia Ficinus', fullTitle: 'Kolonia Robotnicza Ficinus (Wirek)', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ruda_%C5%9Al%C4%85ska_-_Kolonia_Ficinus_01.jpg?width=1440', fallbackGradient: 'linear-gradient(135deg, #3b2447 0%, #0f1c30 100%)' },
    { id: 'NOWY_BYTOM', shortTitle: 'Ratusz N.Bytom', fullTitle: 'Magistrat (Nowy Bytom)', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Urza_Miejski_w_Rudzie_Slaskiej.jpg?width=1440', fallbackGradient: 'linear-gradient(135deg, #1e3054 0%, #190e26 100%)' }
  ];

  /* ==================== 2. PIONKI I UNIKALNE KOLORY ==================== */
  const PAWN_AVATARS = [
    { id: 'helmet',   name: 'Hełm Sztygara',   svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 15C4 9.5 7.5 5 12 5C16.5 5 20 9.5 20 15H4Z" fill="#fff" stroke="#111" stroke-width="1.8"/><path d="M2 15H22V18H2V15Z" fill="#ffca28" stroke="#111" stroke-width="1.5"/><circle cx="12" cy="10" r="2.6" fill="#00e5ff" stroke="#111" stroke-width="1.4"/></svg>` },
    { id: 'cool',     name: 'Okulary Szefa',   svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 9H21L19 14H13.5L12 11.5L10.5 14H5L3 9Z" fill="#111"/><rect x="5" y="10" width="4" height="1.5" fill="#00e5ff"/><rect x="13.5" y="10" width="4" height="1.5" fill="#00e5ff"/><path d="M8 17.5C9.5 19 14.5 19 16 17.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>` },
    { id: 'mustache', name: 'Śląski Wąs',      svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="8.5" cy="9" r="2.2" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="15.5" cy="9" r="2.2" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="8.5" cy="9" r="1" fill="#111"/><circle cx="15.5" cy="9" r="1" fill="#111"/><path d="M4 15.5C6.5 13 10.5 13.5 12 15.5C13.5 13.5 17.5 13 20 15.5C18 18 14 17.5 12 16.2C10 17.5 6 18 4 15.5Z" fill="#1b1429" stroke="#fff" stroke-width="1"/></svg>` },
    { id: 'crown',    name: 'Korona Barona',   svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 18L5 8L9.5 13L12 6L14.5 13L19 8L21 18H3Z" fill="#ffca28" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="15" r="1.2" fill="#e53935"/><circle cx="15" cy="15" r="1.2" fill="#00e5ff"/></svg>` },
    { id: 'cart',     name: 'Wagonik Węgla',   svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 6L9 3L14 5L18 3L19 7H5V6Z" fill="#111"/><path d="M4 7H20L18 15H6L4 7Z" fill="#fff" stroke="#111" stroke-width="1.8"/><circle cx="8" cy="18" r="2.3" fill="#ff9800" stroke="#111" stroke-width="1.5"/><circle cx="16" cy="18" r="2.3" fill="#ff9800" stroke="#111" stroke-width="1.5"/></svg>` },
    { id: 'devil',    name: 'Skarbnik',        svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 4L9 8M20 4L15 8" stroke="#111" stroke-width="2.5" stroke-linecap="round"/><circle cx="8.5" cy="11" r="2" fill="#ffeb3b" stroke="#111" stroke-width="1.3"/><circle cx="15.5" cy="11" r="2" fill="#ffeb3b" stroke="#111" stroke-width="1.3"/><path d="M7 16.5C9.5 19 14.5 19 17 16.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>` },
    { id: 'pirate',   name: 'Pirat z Hałdy',   svg: `<svg viewBox="0 0 24 24" fill="none"><line x1="4" y1="7" x2="20" y2="13" stroke="#111" stroke-width="2.2"/><circle cx="9" cy="10" r="3" fill="#111"/><circle cx="15.5" cy="10" r="2.2" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="15.5" cy="10" r="1" fill="#111"/><path d="M8 17C10.5 18.5 14 18.5 16.5 16.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>` },
    { id: 'classic',  name: 'Klasyczne Oczka', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="8.5" cy="10" r="3" fill="#fff" stroke="#111" stroke-width="1.6"/><circle cx="15.5" cy="10" r="3" fill="#fff" stroke="#111" stroke-width="1.6"/><circle cx="9" cy="10" r="1.4" fill="#111"/><circle cx="16" cy="10" r="1.4" fill="#111"/><path d="M8.5 16.5C10 18.2 14 18.2 15.5 16.5" stroke="#111" stroke-width="2" stroke-linecap="round"/></svg>` }
  ];

  function getAvatarSvg(avatarId) {
    return (PAWN_AVATARS.find(a => a.id === avatarId) || PAWN_AVATARS[0]).svg;
  }

  const PLAYER_COLORS = [
    { id: 'ember',  name: 'Żar Węglowy', hex: '#ff7849' },
    { id: 'cyan',   name: 'Błękit Huty', hex: '#00e5ff' },
    { id: 'gold',   name: 'Złoto',       hex: '#ffca28' },
    { id: 'pink',   name: 'Neon Róż',    hex: '#f06292' },
    { id: 'violet', name: 'Fiolet',      hex: '#ab47bc' },
    { id: 'green',  name: 'Szmaragd',    hex: '#2ecc71' }
  ];

  function getFirstAvailableColor(usedHexList) {
    const found = PLAYER_COLORS.find(c => !usedHexList.includes(c.hex));
    return found ? found.hex : PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)].hex;
  }

  const { GROUPS, AIRPORT_INDICES, BOARD_TILES } = window.RudaBoard;
  const monopoly = window.RudaMonopoly.createEngine(window.RudaBoard);

  const SVG_ICONS = {
    START: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#a6ff00" stroke-width="2.4"><polygon points="5 4 15 12 5 20 5 4" fill="#a6ff00"/><polygon points="13 4 21 12 13 20 13 4" fill="#a6ff00"/></svg>`,
    JAIL: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff9800" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
    VACATION: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2ecc71" stroke-width="2.2"><path d="M2 20h20L15 6l-4 7-3-3-6 10z" fill="rgba(46,204,113,0.3)"/></svg>`,
    GO_TO_JAIL: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff5252" stroke-width="2.3"><circle cx="12" cy="12" r="9" fill="rgba(255,82,82,0.2)"/><line x1="12" y1="7" x2="12" y2="13"/><circle cx="12" cy="17" r="1.2" fill="#ff5252"/></svg>`,
    TREASURE: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ffca28" stroke-width="2"><rect x="3" y="6" width="18" height="14" rx="3" fill="rgba(255,202,40,0.25)"/><path d="M3 11h18"/><circle cx="12" cy="11" r="2" fill="#ffca28"/></svg>`,
    SURPRISE: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><circle cx="12" cy="12" r="10" fill="rgba(240,98,146,0.2)" stroke="#f06292" stroke-width="2"/><text x="8" y="17" fill="#f06292" font-size="15" font-weight="900">?</text></svg>`,
    TAX: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#cfd8dc" stroke-width="2"><path d="M12 2L3 7v2h18V7l-9-5z"/><line x1="6" y1="9" x2="6" y2="18"/><line x1="12" y1="9" x2="12" y2="18"/><line x1="18" y1="9" x2="18" y2="18"/><path d="M3 18h18v3H3z"/></svg>`,
    AIRPORT: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#00e5ff" stroke-width="2.1"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="rgba(0,229,255,0.25)"/></svg>`,
    UTILITY: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffca28" stroke-width="2.2"><polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2" fill="rgba(255,202,40,0.28)"/></svg>`,
    MINE_TOWER: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ffffff" stroke-width="2.2"><circle cx="12" cy="6" r="3.5"/><path d="M6 21L10 9m8 12L14 9M5 21h14"/></svg>`
  };

  /* ==================== 3. DŹWIĘKI ==================== */
  class SoundEngine {
    constructor() { this.enabled = true; this.ctx = null; }
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    }
    beep(freq = 440, dur = 0.08, type = 'sine', vol = 0.07) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
      } catch (e) {}
    }
    step()  { this.beep(350, 0.035, 'triangle', 0.045); }
    dice()  { this.beep(250, 0.06, 'triangle'); setTimeout(() => this.beep(370, 0.07, 'triangle'), 70); }
    buy()   { this.beep(520, 0.08, 'sine'); setTimeout(() => this.beep(780, 0.14, 'sine'), 80); }
    build() { this.beep(440, 0.07, 'square', 0.05); setTimeout(() => this.beep(680, 0.14, 'square', 0.05), 80); }
    rent()  { this.beep(300, 0.12, 'sawtooth', 0.05); }
    win()   { this.beep(523, 0.12, 'sine'); setTimeout(() => this.beep(659, 0.12, 'sine'), 130); setTimeout(() => this.beep(784, 0.25, 'sine'), 260); }
  }
  const sfx = new SoundEngine();

  /* ==================== 4. STAN GLOBALNY ==================== */
  let myClientToken = sessionStore.getItem('ruda_client_token');
  if (!myClientToken) {
    myClientToken = 'cl_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
    sessionStore.setItem('ruda_client_token', myClientToken);
  }

  let gameState = null;
  let selectedGameMode = 'MONOPOLY';
  let selectedMapId = RUDA_MAPS[0].id;
  let selectedTileIndex = 1;
  let activePerspectiveId = 'p1';
  let myOnlinePlayerId = null;
  let currentRoomCode = 'LOKALNY';
  let isRollingLock = false;
  let turnTimerInterval = null;
  let botActionTimeout = null;
  let lastWinnerShown = null;

  let firebaseDb = null;
  let activeFirebaseUrl = '';
  let firebaseRoomRef = null;
  let broadcastChannel = null;

  let localPickedColor = PLAYER_COLORS[0].hex;
  let localPickedAvatar = 'helmet';
  let onlinePickedColor = PLAYER_COLORS[1].hex;
  let onlinePickedAvatar = 'cool';

  let lobbyOpponents = [
    { name: 'Bot KWK Halemba', isBot: true, color: PLAYER_COLORS[1].hex, avatar: 'cart' },
    { name: 'Bot Huta Pokój',  isBot: true, color: PLAYER_COLORS[2].hex, avatar: 'crown' },
    { name: 'Bot Wirek',       isBot: true, color: PLAYER_COLORS[3].hex, avatar: 'mustache' }
  ];

  function bindClick(id, fn) {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  }

  function nowTime() { return new Date().toTimeString().slice(0, 5); }

  function setBannerStatus(msg, color = '#81cfb5') {
    const el = document.getElementById('net-status-banner');
    if (el) { el.textContent = msg; el.style.color = color; }
  }

  // Sprawdza, czy ten klient odpowiada za obliczanie ruchów botów i zegar (w Online tylko Host)
  function isBotController() {
    if (!gameState) return false;
    if (!gameState.isOnline) return true;
    if (gameState.hostToken && gameState.hostToken === myClientToken) return true;
    const firstHuman = gameState.players.find(p => !p.isBot && !p.bankrupt);
    return firstHuman ? firstHuman.clientToken === myClientToken : false;
  }

  function getMyViewerPlayer() {
    if (!gameState || !gameState.players.length) return null;
    if (gameState.isOnline) return getPlayerById(myOnlinePlayerId) || gameState.players[0];
    if (gameState.debt) return getPlayerById(gameState.debt.playerId);
    const cur = currentTurnPlayer();
    if (cur && !cur.isBot) return cur;
    return gameState.players.find(p => !p.isBot) || gameState.players[0];
  }

  /* ==================== SYSTEM 1 VS 1 ORAZ 2 VS 2 (DRUŻYNY) W GRACH 2-OSOBOWYCH ==================== */
  function isTeamMode2v2() {
    if (!gameState) return false;
    return gameState.twoPlayerMode === '2V2' && gameState.players.length > 2;
  }

  function getTeamActivePlayer(sideIndex, subGameObj) {
    if (!gameState || !gameState.players.length) return null;
    // W trybie 1v1 (domyślnym) zawsze gra Gracz 1 kontra Gracz 2 (np. Ty vs 1 Bot), bez przełączania na kolejne boty!
    if (!isTeamMode2v2()) {
      return gameState.players[sideIndex] || gameState.players[0];
    }
    const teamMembers = gameState.players.filter((_, idx) => (idx % 2) === sideIndex);
    if (!teamMembers.length) return gameState.players[0];
    const rotArr = subGameObj?.teamRot || [0, 0];
    const memberIdx = (rotArr[sideIndex] || 0) % teamMembers.length;
    return teamMembers[memberIdx];
  }

  function getTeamNamesSummary(sideIndex) {
    if (!gameState) return '';
    if (!isTeamMode2v2()) {
      return gameState.players[sideIndex]?.name || `Gracz ${sideIndex + 1}`;
    }
    const members = gameState.players.filter((_, idx) => (idx % 2) === sideIndex);
    return members.map(m => m.name).join(' + ');
  }

  function advance2PGameTurn(subGameObj) {
    const finishedSide = subGameObj.turn;
    if (!Array.isArray(subGameObj.teamRot)) subGameObj.teamRot = [0, 0];
    if (isTeamMode2v2()) {
      subGameObj.teamRot[finishedSide] = (subGameObj.teamRot[finishedSide] || 0) + 1;
    } else {
      subGameObj.teamRot = [0, 0];
    }
    subGameObj.turn = 1 - finishedSide;
  }

  function canControl2PSide(sideIndex, subGameObj) {
    if (!gameState || gameState.status !== 'PLAYING') return false;
    const activeMember = getTeamActivePlayer(sideIndex, subGameObj);
    if (!activeMember || activeMember.isBot) return false;
    if (gameState.isOnline && myOnlinePlayerId) return activeMember.id === myOnlinePlayerId;
    return true;
  }

  function inject2PModeToggleButtons() {
    ['QUORIDOR', 'CHECKERS', 'CHESS', 'CONNECT4'].forEach(gameKey => {
      const stage = document.getElementById('stage-' + gameKey);
      const topBar = stage?.querySelector('.game-top-bar');
      if (!topBar || topBar.querySelector('.btn-toggle-2p-mode')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-ghost btn-toggle-2p-mode';
      btn.style.cssText = 'border-color:var(--accent-gold);color:var(--accent-gold);font-weight:800;';
      btn.onclick = () => {
        if (!gameState) return;
        if (gameState.isOnline && gameState.hostToken !== myClientToken) {
          showToast('Tryb 1v1 / 2v2 przełącza gospodarz pokoju.');
          return;
        }
        gameState.twoPlayerMode = gameState.twoPlayerMode === '2V2' ? '1V1' : '2V2';
        showToast(gameState.twoPlayerMode === '2V2'
          ? '🤝 Włączono tryb 2 vs 2 (Drużyny)!'
          : '⚔️ Włączono tryb 1 vs 1 (Gracz 1 kontra Gracz 2 — bez zmiany botów)!');
        pushStateSync();
        checkBotForOtherGames();
      };
      topBar.appendChild(btn);
    });
  }

  function update2PModeToggleLabels() {
    if (!gameState) return;
    const mode = gameState.twoPlayerMode || '1V1';
    document.querySelectorAll('.btn-toggle-2p-mode').forEach(btn => {
      btn.textContent = mode === '2V2' ? '🤝 Tryb: 2 vs 2 (Drużyny)' : '⚔️ Tryb: 1 vs 1 (Pojedynek)';
    });
  }

  function applyMapTheme(mapId) {
    const m = RUDA_MAPS.find(x => x.id === mapId) || RUDA_MAPS[0];
    selectedMapId = m.id;
    const bgValue = `url("${m.photoUrl}"), ${m.fallbackGradient}`;
    const bgLayer = document.getElementById('map-bg-layer');
    const hubPhoto = document.getElementById('hub-map-photo');
    const subTitle = document.getElementById('active-map-subtitle');
    const topName = document.getElementById('top-map-name');

    if (bgLayer) bgLayer.style.backgroundImage = bgValue;
    if (hubPhoto) hubPhoto.style.backgroundImage = bgValue;
    if (subTitle) subTitle.textContent = `Mapa: ${m.fullTitle}`;
    if (topName) topName.textContent = m.shortTitle;

    document.querySelectorAll('.map-thumb-card').forEach(el => {
      el.classList.toggle('active', el.dataset.mapId === m.id);
    });
  }

  function playMapRouletteAnimation(onFinished) {
    const overlay = document.getElementById('map-roulette-overlay');
    const card = document.getElementById('roulette-preview-card');
    const nameEl = document.getElementById('roulette-preview-name');
    const titleEl = document.getElementById('roulette-status-title');

    const finalMap = RUDA_MAPS[Math.floor(Math.random() * RUDA_MAPS.length)];
    if (!overlay || !card || !nameEl || !titleEl) {
      applyMapTheme(finalMap.id);
      if (onFinished) onFinished(finalMap.id);
      return;
    }

    overlay.classList.remove('hidden');
    titleEl.textContent = '🎲 Losowanie Areny Rudy Śląskiej...';

    let ticks = 0;
    const maxTicks = 10;

    const interval = setInterval(() => {
      const m = (ticks === maxTicks - 1) ? finalMap : RUDA_MAPS[ticks % RUDA_MAPS.length];
      card.style.backgroundImage = `url("${m.photoUrl}"), ${m.fallbackGradient}`;
      nameEl.textContent = m.fullTitle;
      sfx.step();
      ticks++;

      if (ticks >= maxTicks) {
        clearInterval(interval);
        titleEl.textContent = `✅ Wylosowano: ${finalMap.shortTitle}!`;
        sfx.win();
        applyMapTheme(finalMap.id);
        setTimeout(() => {
          overlay.classList.add('hidden');
          if (onFinished) onFinished(finalMap.id);
        }, 450);
      }
    }, 85);
  }

  /* ==================== POŁĄCZENIE FIREBASE ONLINE ==================== */
  function extractFirebaseConfig(rawInput) {
    if (!rawInput) return null;
    if (typeof rawInput === 'object' && rawInput.databaseURL) {
      return { ...rawInput, databaseURL: String(rawInput.databaseURL).trim().replace(/\/+$/, '') };
    }
    const text = String(rawInput).trim();
    if (!text) return null;

    const urlMatch = text.match(/https:\/\/[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(?:firebaseio\.com|firebasedatabase\.app)/i);
    if (urlMatch) {
      const cleanUrl = urlMatch[0].replace(/\/+$/, '');
      const apiKeyMatch = text.match(/apiKey\s*:\s*["']([^"']+)["']/);
      const projectIdMatch = text.match(/projectId\s*:\s*["']([^"']+)["']/);
      const cfg = { databaseURL: cleanUrl };
      if (apiKeyMatch) cfg.apiKey = apiKeyMatch[1];
      if (projectIdMatch) cfg.projectId = projectIdMatch[1];
      return cfg;
    }

    const projMatch = text.match(/projectId\s*["']?\s*:\s*["']([a-zA-Z0-9-]+)["']/);
    if (projMatch) {
      return {
        projectId: projMatch[1],
        databaseURL: `https://${projMatch[1]}-default-rtdb.firebaseio.com`
      };
    }

    if (text.startsWith('http://') || text.startsWith('https://')) {
      const u = new URL(text);
      return { databaseURL: u.origin };
    }
    return null;
  }

  function connectFirebaseDatabase(rawInput) {
    if (!window.firebase) {
      setBannerStatus('Brak biblioteki Firebase (sprawdź połączenie z internetem). Gra lokalna działa.', '#ffb454');
      return false;
    }
    try {
      const cfg = extractFirebaseConfig(rawInput);
      if (!cfg || !cfg.databaseURL) {
        throw new Error('Nie znaleziono poprawnego adresu databaseURL.');
      }

      const urlObj = new URL(cfg.databaseURL);
      cfg.databaseURL = urlObj.origin;

      if (firebaseDb && activeFirebaseUrl === cfg.databaseURL) {
        const inputEl = document.getElementById('firebase-url-input');
        if (inputEl) inputEl.value = activeFirebaseUrl;
        return true;
      }

      const appName = 'ruda_' + Array.from(urlObj.origin).reduce((n, c) => ((n * 31 + c.charCodeAt(0)) >>> 0), 0);
      const existingApp = firebase.apps.find(a => a.name === appName);
      const app = existingApp || firebase.initializeApp(cfg, appName);

      if (firebaseRoomRef) { firebaseRoomRef.off(); firebaseRoomRef = null; }
      if (connectionRef) { connectionRef.off(); connectionRef = null; }

      firebaseDb = app.database();
      activeFirebaseUrl = cfg.databaseURL;
      storage.setItem('ruda_firebase_url', activeFirebaseUrl);

      const inputEl = document.getElementById('firebase-url-input');
      if (inputEl) inputEl.value = activeFirebaseUrl;

      const pill = document.getElementById('fb-conn-pill');
      if (pill) {
        pill.textContent = 'Firebase: gotowy (' + urlObj.hostname.split('.')[0] + ')';
        pill.className = 'fb-pill connected';
      }

      connectionRef = firebaseDb.ref('.info/connected');
      connectionRef.on('value', snapshot => {
        firebaseConnected = snapshot.val() === true;
        if (pill) {
          pill.textContent = firebaseConnected ? '🟢 Firebase: Połączono' : '🟡 Firebase: Łączenie...';
          pill.className = 'fb-pill ' + (firebaseConnected ? 'connected' : 'disconnected');
        }
        document.getElementById('top-net-dot')?.classList.toggle('firebase', firebaseConnected);
      }, err => networkError(err));

      setBannerStatus('✅ Połączono z bazą: ' + activeFirebaseUrl + '. Możesz teraz utworzyć lub dołączyć do pokoju!', '#72d8bd');
      return true;
    } catch (error) {
      setBannerStatus('❌ Wklej poprawny link https://...-rtdb...firebasedatabase.app lub obiekt firebaseConfig.', '#ff737d');
      return false;
    }
  }

  function buildShareInviteLink(roomCode) {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomCode);
    if (activeFirebaseUrl) url.searchParams.set('db', btoa(activeFirebaseUrl));
    return url.toString();
  }

  /* ==================== 5. FABRYKI STANÓW WSZYSTKICH 8 GIER ==================== */
  function createLiarsGameState(playersList) {
    const ranks = ['A', 'K', 'Q', 'J', '10'];
    const suits = ['♠', '♥', '♦', '♣'];
    const deck = [];
    ranks.forEach(r => {
      suits.forEach(s => deck.push({ id: r + s + '_' + Math.random().toString(36).slice(2, 6), rank: r, suit: s }));
    });
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const hands = {};
    playersList.forEach(p => { hands[p.id] = []; });
    deck.forEach((card, idx) => {
      const pl = playersList[idx % playersList.length];
      hands[pl.id].push(card);
    });

    return {
      turnIndex: 0,
      requiredRank: '',
      pile: [],
      lastPlay: null,
      lastRevealMsg: '',
      handsJson: JSON.stringify(hands),
      winnerName: ''
    };
  }

  function createQuoridorState() {
    return {
      turn: 0,
      teamRot: [0, 0],
      pos: [{ r: 8, c: 4 }, { r: 0, c: 4 }],
      wallsLeft: [10, 10],
      hWalls: [],
      vWalls: [],
      winner: null
    };
  }

  function createLudoState() {
    return { turn: 0, dice: 6, rolled: false, winner: null, pawns: [[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1]] };
  }

  function createCheckersState() {
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = { p: 1, king: false };
    for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = { p: 0, king: false };
    return { turn: 0, teamRot: [0, 0], boardJson: JSON.stringify(b), captured: [0, 0], winner: null };
  }

  function createChessState() {
    const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let c = 0; c < 8; c++) {
      b[0][c] = { p: 1, type: back[c] }; b[1][c] = { p: 1, type: 'P' };
      b[6][c] = { p: 0, type: 'P' };     b[7][c] = { p: 0, type: back[c] };
    }
    return { turn: 0, teamRot: [0, 0], boardJson: JSON.stringify(b), winner: null, lastMove: 'Kliknij swoją figurę, aby zobaczyć dozwolone ruchy.' };
  }

  function createConnect4State() {
    return { turn: 0, teamRot: [0, 0], boardJson: JSON.stringify(Array(6).fill(null).map(() => Array(7).fill(null))), winner: null };
  }

  const validWinIdx = w => (typeof w === 'number' && w >= 0) ? w : null;

  function normalizeState(st) {
    if (!st) return null;
    st.players = Array.isArray(st.players) ? st.players : Object.values(st.players || {});
    const usedColors = [];
    st.players.forEach((p, idx) => {
      p.id = p.id || ('p' + (idx + 1));
      p.clientToken = p.clientToken || '';
      p.name = cleanName(p.name);
      p.cash = Number.isFinite(Number(p.cash)) ? Number(p.cash) : 1500;
      p.arcadeCash = Number.isFinite(Number(p.arcadeCash)) ? Number(p.arcadeCash) : 2000;
      p.position = Number.isInteger(p.position) ? p.position : 0;
      p.inJail = !!p.inJail;
      p.jailTurns = Number(p.jailTurns) || 0;
      p.pardonCards = Number(p.pardonCards) || 0;
      p.pardonDecks = Array.isArray(p.pardonDecks) ? p.pardonDecks : Object.values(p.pardonDecks || {});
      p.bankrupt = !!p.bankrupt;
      p.isBot = !!p.isBot;
      if (!/^#[0-9a-f]{6}$/i.test(p.color || '')) p.color = null;
      if (!p.avatar) p.avatar = PAWN_AVATARS[idx % PAWN_AVATARS.length].id;
      if (!p.color || usedColors.includes(p.color)) {
        p.color = getFirstAvailableColor(usedColors);
      }
      usedColors.push(p.color);
    });

    st.twoPlayerMode = st.twoPlayerMode === '2V2' ? '2V2' : '1V1';
    st.trades = Array.isArray(st.trades) ? st.trades : Object.values(st.trades || {});
    st.feed   = Array.isArray(st.feed)   ? st.feed   : Object.values(st.feed || {});
    st.chat   = Array.isArray(st.chat)   ? st.chat   : Object.values(st.chat || {});
    st.lastDice = Array.isArray(st.lastDice) ? st.lastDice : Object.values(st.lastDice || [6, 5]);
    if (st.lastDice.length < 2) st.lastDice = [6, 5];
    st.builtThisTurn = !!st.builtThisTurn;
    if (!st.mapId) st.mapId = selectedMapId;
    if (!st.casinoGoal) st.casinoGoal = 5000;
    if (!st.properties || typeof st.properties !== 'object') {
      st.properties = {};
    }

    BOARD_TILES.forEach(t => {
      if (t.type === 'PROPERTY' || t.type === 'AIRPORT' || t.type === 'UTILITY') {
        if (!st.properties[t.index]) {
          st.properties[t.index] = { ownerId: null, level: 0, boughtInRound: 0, mortgaged: false, history: ['Dostępne w zasobach Miasta'] };
        } else {
          const p = st.properties[t.index];
          p.ownerId = p.ownerId || null;
          if (typeof p.level !== 'number') p.level = 0;
          if (typeof p.boughtInRound !== 'number') p.boughtInRound = 0;
          p.mortgaged = !!p.mortgaged;
          p.history = Array.isArray(p.history) ? p.history : Object.values(p.history || ['Dostępne']);
        }
      }
    });

    if (!st.liars || !st.liars.handsJson) st.liars = createLiarsGameState(st.players);
    else {
      st.liars.turnIndex = Number(st.liars.turnIndex) || 0;
      st.liars.requiredRank = st.liars.requiredRank || null;
      st.liars.winnerName = st.liars.winnerName || null;
      st.liars.lastRevealMsg = st.liars.lastRevealMsg || '';
      st.liars.pile = Array.isArray(st.liars.pile) ? st.liars.pile : Object.values(st.liars.pile || {});
      if (st.liars.lastPlay && st.liars.lastPlay.playerId) {
        st.liars.lastPlay.actualCards = Array.isArray(st.liars.lastPlay.actualCards) ? st.liars.lastPlay.actualCards : Object.values(st.liars.lastPlay.actualCards || {});
      } else {
        st.liars.lastPlay = null;
      }
    }

    if (!st.quoridor || !st.quoridor.pos) st.quoridor = createQuoridorState();
    else {
      st.quoridor.turn = Number(st.quoridor.turn) || 0;
      st.quoridor.pos = Array.isArray(st.quoridor.pos) ? st.quoridor.pos : Object.values(st.quoridor.pos);
      st.quoridor.wallsLeft = Array.isArray(st.quoridor.wallsLeft) ? st.quoridor.wallsLeft : Object.values(st.quoridor.wallsLeft || [10, 10]);
      st.quoridor.hWalls = Array.isArray(st.quoridor.hWalls) ? st.quoridor.hWalls : Object.values(st.quoridor.hWalls || {});
      st.quoridor.vWalls = Array.isArray(st.quoridor.vWalls) ? st.quoridor.vWalls : Object.values(st.quoridor.vWalls || {});
      st.quoridor.teamRot = Array.isArray(st.quoridor.teamRot) ? st.quoridor.teamRot : Object.values(st.quoridor.teamRot || [0, 0]);
      st.quoridor.winner = validWinIdx(st.quoridor.winner);
    }

    if (!st.ludo || !st.ludo.pawns) st.ludo = createLudoState();
    else {
      st.ludo.turn = Number(st.ludo.turn) || 0;
      st.ludo.dice = Number(st.ludo.dice) || 6;
      st.ludo.rolled = !!st.ludo.rolled;
      st.ludo.pawns = [0,1,2,3].map(i => {
        const row = st.ludo.pawns[i];
        const arr = Array.isArray(row) ? row : Object.values(row || [-1,-1,-1,-1]);
        return [0,1,2,3].map(k => typeof arr[k] === 'number' ? arr[k] : -1);
      });
      st.ludo.winner = validWinIdx(st.ludo.winner);
    }

    if (!st.checkers || !st.checkers.boardJson) st.checkers = createCheckersState();
    else {
      st.checkers.turn = Number(st.checkers.turn) || 0;
      st.checkers.teamRot = Array.isArray(st.checkers.teamRot) ? st.checkers.teamRot : Object.values(st.checkers.teamRot || [0, 0]);
      st.checkers.captured = Array.isArray(st.checkers.captured) ? st.checkers.captured : Object.values(st.checkers.captured || [0, 0]);
      st.checkers.winner = validWinIdx(st.checkers.winner);
    }

    if (!st.chess || !st.chess.boardJson) st.chess = createChessState();
    else {
      st.chess.turn = Number(st.chess.turn) || 0;
      st.chess.teamRot = Array.isArray(st.chess.teamRot) ? st.chess.teamRot : Object.values(st.chess.teamRot || [0, 0]);
      st.chess.winner = validWinIdx(st.chess.winner);
      st.chess.lastMove = st.chess.lastMove || 'Kliknij swoją figurę, aby zobaczyć dozwolone ruchy.';
    }

    if (!st.connect4 || !st.connect4.boardJson) st.connect4 = createConnect4State();
    else {
      st.connect4.turn = Number(st.connect4.turn) || 0;
      st.connect4.teamRot = Array.isArray(st.connect4.teamRot) ? st.connect4.teamRot : Object.values(st.connect4.teamRot || [0, 0]);
      st.connect4.winner = validWinIdx(st.connect4.winner);
    }

    return monopoly.normalize(st);
  }

  // Zabezpiecza obiekt przed usunięciem kluczy o wartości undefined w Firebase Realtime Database
  function sanitizeForFirebase(obj) {
    return JSON.parse(JSON.stringify(obj, (_, val) => val === undefined ? null : val));
  }

  function createFreshGameState(playersList, startingCash, roomCode = 'LOKALNY', isOnline = false, initialGame = 'MONOPOLY', mapId = selectedMapId) {
    const propertiesState = {};
    BOARD_TILES.forEach(tile => {
      if (tile.type === 'PROPERTY' || tile.type === 'AIRPORT' || tile.type === 'UTILITY') {
        propertiesState[tile.index] = { ownerId: null, level: 0, boughtInRound: 0, mortgaged: false, history: ['Dostępne w zasobach Miasta'] };
      }
    });
    const chosenMap = RUDA_MAPS.find(m => m.id === mapId) || RUDA_MAPS[0];
    const usedColors = [];
    const mappedPlayers = playersList.map((p, idx) => {
      const uniqueColor = (!p.color || usedColors.includes(p.color)) ? getFirstAvailableColor(usedColors) : p.color;
      usedColors.push(uniqueColor);
      return {
        id: p.id || ('p' + (idx + 1)),
        clientToken: p.clientToken || '',
        name: p.name,
        color: uniqueColor,
        avatar: p.avatar || PAWN_AVATARS[idx % PAWN_AVATARS.length].id,
        isBot: !!p.isBot,
        cash: Number(startingCash),
        position: 0,
        inJail: false,
        jailTurns: 0,
        pardonCards: 0,
        bankrupt: false
      };
    });

    const fresh = {
      roomCode, isOnline, lobbyOpen: isOnline, hostToken: isOnline ? myClientToken : '', activeGame: initialGame, mapId: chosenMap.id,
      twoPlayerMode: '1V1',
      status: 'PLAYING', winnerAnnouncement: null, casinoGoal: 5000,
      round: 1, turnIndex: 0, turnPhase: 'ROLL', builtThisTurn: false,
      lastDice: [6, 5], doublesStreak: 0, vacationPool: 100, turnSecondsLeft: 120,
      players: mappedPlayers,
      properties: propertiesState,
      trades: [],
      liars: createLiarsGameState(mappedPlayers),
      quoridor: createQuoridorState(),
      ludo: createLudoState(),
      checkers: createCheckersState(),
      chess: createChessState(),
      connect4: createConnect4State(),
      feed: [{ text: `🗺️ Arena: <strong>${chosenMap.fullTitle}</strong>! Zbieraj dzielnice i doprowadź rywali do bankructwa!`, time: nowTime() }],
      chat: [{ author: 'Skarbnik', color: '#ffca28', text: `Szczęść Boże! Wszystkie 8 gier jest gotowych!`, time: nowTime() }]
    };
    return monopoly.initialize(fresh, { startingCash, roundLimit: Number(document.getElementById('monopoly-round-limit')?.value ?? 30), gameId: makeId('game'), seed: randomSeed(), now: serverNow() });
  }

  /* ==================== 6. SYNCHRONIZACJA POKOJU (STABILNY ZAPIS FIREBASE) ==================== */
  let acceptedState = null;
  let syncBusy = false;
  let firebaseConnected = false;
  let connectionRef = null;
  let serverOffset = 0;
  let engineBotTimer = null;
  let toastTimer = null;
  let lastEventSequence = 0;
  let eventGameId = '';
  let paymentQueueUI = [];
  let paymentUIBusy = false;
  const escapeHTML = window.RudaMonopoly.escapeHTML;
  const copy = x => JSON.parse(JSON.stringify(x));
  const serverNow = () => Date.now() + serverOffset;
  function makeId(prefix) { return prefix + '_' + (window.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2)); }
  function randomSeed() { const a = new Uint32Array(1); if (window.crypto?.getRandomValues) crypto.getRandomValues(a); else a[0] = Math.random() * 4294967296; return a[0]; }
  function fairDie() { let n; do { n = randomSeed(); } while (n >= 4294967292); return n % 6 + 1; }
  function cleanName(name) { return String(name || 'Górnik').replace(/[<>&"'`]/g, '').trim().slice(0, 24) || 'Górnik'; }
  function safeRichText(text) { return escapeHTML(text).replace(/&lt;(\/?strong|br\s*\/?)&gt;/g, '<$1>'); }

  function showToast(message) {
    const el = document.getElementById('app-toast'); if (!el) return;
    el.textContent = message; el.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.add('hidden'), 4500);
  }

  function networkError(error) {
    const codeStr = String(error?.code || error?.message || '');
    const permission = /permission|denied/i.test(codeStr);
    const msg = permission
      ? '❌ Baza Firebase odrzuciła zapis (PERMISSION_DENIED)! W konsoli Firebase wejdź w Realtime Database → Reguły (Rules) i ustaw ".read": true, ".write": true.'
      : ('⚠️ Problem z połączeniem Firebase: ' + (error?.message || 'Sprawdź adres bazy i internet.'));
    setBannerStatus(msg, '#ff737d');
    showToast(msg);
  }

  function acceptState(state, first = false) {
    if (!state) return;
    gameState = normalizeState(copy(state));
    acceptedState = copy(gameState);
    isRollingLock = false;
    syncMyOnlineIdentity();
    if (first || eventGameId !== gameState.gameId) {
      eventGameId = gameState.gameId;
      lastEventSequence = gameState.eventSequence || 0;
      paymentQueueUI = [];
      lastWinnerShown = null;
    }
    if (gameState.isOnline && !gameState.lobbyOpen) {
      document.getElementById('lobby-overlay')?.classList.add('hidden');
    }
    renderAll();
    updateLobbyWaitingRoom();
    scheduleMonopolyBot();
    if (gameState.activeGame !== 'MONOPOLY' && !syncBusy) checkBotForOtherGames();
  }

  function subscribeToRoom(roomCode) {
    if (firebaseRoomRef) { firebaseRoomRef.off(); firebaseRoomRef = null; }
    if (broadcastChannel) { broadcastChannel.close(); broadcastChannel = null; }
    currentRoomCode = roomCode;
    const lbl = document.getElementById('top-room-label');
    if (lbl) lbl.textContent = roomCode;

    if (firebaseDb && roomCode !== 'LOKALNY') {
      firebaseRoomRef = firebaseDb.ref('rooms/' + roomCode);
      let first = true;
      firebaseRoomRef.on('value', snap => {
        const val = snap.val();
        if (val) {
          acceptState(val, first);
          first = false;
        }
      }, networkError);
      firebaseDb.ref('.info/serverTimeOffset').once('value').then(s => { serverOffset = Number(s.val()) || 0; }).catch(() => {});
    }
  }

  function syncMyOnlineIdentity() {
    if (!gameState) return;
    if (gameState.isOnline) {
      const me = gameState.players.find(p => p.clientToken === myClientToken);
      myOnlinePlayerId = me?.id || null;
      activePerspectiveId = me?.id || null;
    } else {
      activePerspectiveId = getMyViewerPlayer()?.id || 'p1';
    }
  }

  function saveLocalState() {
    if (gameState && !gameState.isOnline) {
      try { storage.setItem('ruda_local_save_v15', JSON.stringify(gameState)); } catch (e) {}
    }
  }

  async function pushStateSync() {
    if (!gameState) return false;
    if (!gameState.isOnline) {
      gameState.revision = (gameState.revision || 0) + 1;
      acceptedState = copy(gameState);
      saveLocalState();
      renderAll();
      scheduleMonopolyBot();
      return true;
    }
    if (!firebaseRoomRef) return false;
    const candidate = sanitizeForFirebase(gameState);
    candidate.revision = (acceptedState?.revision || 0) + 1;
    syncBusy = true;
    try {
      await firebaseRoomRef.set(candidate);
      acceptState(candidate);
      return true;
    } catch (error) {
      if (acceptedState) acceptState(acceptedState);
      networkError(error);
      return false;
    } finally {
      syncBusy = false;
      if (gameState) { renderCenterHUD(); renderAuction(); }
      scheduleMonopolyBot();
    }
  }

  async function commitMonopoly(type, extra = {}, actorId = null, quiet = false) {
    if (!gameState || syncBusy || gameState.activeGame !== 'MONOPOLY') return false;
    const localActor = actorId || (gameState.isOnline ? myOnlinePlayerId : (gameState.debt?.playerId || currentTurnPlayer()?.id));
    if (!localActor) {
      if (!quiet) showToast('Dołącz do tego pokoju, aby wykonać ruch.');
      return false;
    }
    const action = { ...extra, type, now: serverNow() };
    if (type === 'ROLL') action.dice = [fairDie(), fairDie()];
    syncBusy = true;
    if (type === 'ROLL') {
      sfx.dice();
      document.querySelectorAll('.die-3d').forEach(el => el.classList.add('rolling'));
    }
    try {
      if (gameState.isOnline) {
        if (!firebaseRoomRef) throw new Error('Brak aktywnego pokoju Firebase.');
        // Pobieramy najświeższy stan z bazy, redukujemy i zapisujemy atomowo bez zawieszania transakcji
        const snap = await firebaseRoomRef.once('value');
        const raw = snap.val() || gameState;
        const norm = normalizeState(raw);
        const member = norm.players.find(p => p.clientToken === myClientToken);
        if (!member) throw new Error('Dołącz do tego pokoju, aby wykonać ruch.');
        const target = norm.players.find(p => p.id === localActor);
        if (type !== 'TICK' && localActor !== member.id && !target?.isBot) {
          throw new Error('Możesz sterować tylko swoim graczem.');
        }
        const nextState = sanitizeForFirebase(monopoly.reduce(norm, action, localActor));
        await firebaseRoomRef.set(nextState);
        acceptState(nextState);
        return true;
      }
      acceptState(monopoly.reduce(gameState, action, localActor));
      saveLocalState();
      return true;
    } catch (error) {
      if (!quiet) showToast(error.message || 'Nie udało się wykonać ruchu.');
      return false;
    } finally {
      syncBusy = false;
      if (gameState) { renderCenterHUD(); renderAuction(); }
      setTimeout(() => document.querySelectorAll('.die-3d').forEach(el => el.classList.remove('rolling')), 420);
      scheduleMonopolyBot();
    }
  }

  function scheduleMonopolyBot() {
    clearTimeout(engineBotTimer);
    if (!gameState || gameState.activeGame !== 'MONOPOLY' || gameState.status !== 'PLAYING' || gameState.lobbyOpen || syncBusy) return;
    if (!gameState.isOnline && !document.getElementById('lobby-overlay').classList.contains('hidden')) return;
    if (!isBotController()) return;
    const next = monopoly.botAction(gameState);
    if (!next) return;
    const revision = gameState.revision;
    engineBotTimer = setTimeout(() => {
      if (!gameState || gameState.revision !== revision) return;
      commitMonopoly(next.type, next, next.actor, true);
    }, 850);
  }

  /* ==================== 7. MONOPOLY DOM ==================== */
  function getGridPosition(index) {
    if (index === 0) return { row: 1, col: 1, edge: 'corner' };
    if (index > 0 && index < 10) return { row: 1, col: index + 1, edge: 'edge-top' };
    if (index === 10) return { row: 1, col: 11, edge: 'corner' };
    if (index > 10 && index < 20) return { row: (index - 10) + 1, col: 11, edge: 'edge-right' };
    if (index === 20) return { row: 11, col: 11, edge: 'corner' };
    if (index > 20 && index < 30) return { row: 11, col: 11 - (index - 20), edge: 'edge-bottom' };
    if (index === 30) return { row: 11, col: 1, edge: 'corner' };
    return { row: 11 - (index - 30), col: 1, edge: 'edge-left' };
  }

  function buildMonopolyBoardDOM() {
    const board = document.getElementById('monopoly-board');
    if (!board) return;
    board.querySelectorAll('.board-tile').forEach(el => el.remove());

    BOARD_TILES.forEach(tile => {
      const pos = getGridPosition(tile.index);
      const cell = document.createElement('div');
      const isAirport = tile.type === 'AIRPORT';
      cell.className = `board-tile ${pos.edge === 'corner' ? 'corner-tile' : pos.edge} ${isAirport ? 'airport-tile' : ''}`;
      cell.style.gridRow = pos.row;
      cell.style.gridColumn = pos.col;
      cell.dataset.index = tile.index;
      cell.title = tile.name;
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', tile.name + (tile.price ? ', cena $' + tile.price : ''));
      cell.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cell.click(); } });

      if (pos.edge === 'corner') {
        cell.innerHTML = `
          <div class="corner-label">${tile.shortName}</div>
          <div class="corner-svg-wrap">${SVG_ICONS[tile.type] || ''}</div>
          <div class="corner-sub" id="corner-sub-${tile.index}">${tile.subtitle || ''}</div>
          <div class="tile-tokens-box" id="tokens-${tile.index}"></div>
        `;
      } else {
        const grp = tile.group ? GROUPS[tile.group] : null;
        const colorBarHtml = grp ? `<div class="tile-color-bar" style="background:${grp.color}"></div>` : '';
        const badgeHtml = tile.type === 'PROPERTY'
          ? `<div class="tile-badge-circle" style="background:${grp.color}">${SVG_ICONS.MINE_TOWER}</div>`
          : `<div class="tile-special-svg">${SVG_ICONS[tile.type] || ''}</div>`;
        const priceHtml = tile.price ? `<span class="tile-price-tag">$${tile.price}</span>` : (tile.taxAmount ? `<span class="tile-price-tag">-$${tile.taxAmount}</span>` : '');

        cell.innerHTML = `
          ${colorBarHtml}
          <div class="owner-outer-cap hidden" id="cap-${tile.index}"></div>
          ${priceHtml}
          <div class="tile-title">${tile.shortName}</div>
          ${badgeHtml}
          <div class="tile-houses-banner hidden" id="houses-banner-${tile.index}"></div>
          <div class="tile-tokens-box" id="tokens-${tile.index}"></div>
        `;
      }

      cell.addEventListener('click', () => {
        selectedTileIndex = tile.index;
        renderInspector(tile.index);
        if (tile.type === 'PROPERTY' || tile.type === 'AIRPORT' || tile.type === 'UTILITY') openPropertyModal(tile.index);
        renderBoardHighlights();
      });

      board.appendChild(cell);
    });
  }

  function getPlayerById(id) { return gameState?.players.find(p => p.id === id); }
  function currentTurnPlayer() { return gameState?.players[gameState.turnIndex] || gameState?.players[0]; }
  function canControlTurn(turnPlayerIdx = gameState?.turnIndex) {
    if (!gameState) return false;
    if (gameState.activeGame === 'MONOPOLY' && (gameState.status !== 'PLAYING' || gameState.lobbyOpen)) return false;
    const active = gameState.players[turnPlayerIdx % gameState.players.length];
    if (!active || active.isBot || (gameState.isOnline && !myOnlinePlayerId)) return false;
    return !gameState.isOnline || active.id === myOnlinePlayerId;
  }
  function calculateRent(index, sum = 7) { return monopoly.rent(gameState, index, sum); }
  function canUpgradeProperty(index, id) { return monopoly.buildCheck(gameState, index, id); }
  function buildHouseOnProperty(index, id) { return commitMonopoly('BUILD', { index }, id); }
  function sellHouseOnProperty(index, id) { return commitMonopoly('SELL_HOUSE', { index }, id); }
  function toggleMortgageProperty(index, id) { return commitMonopoly('MORTGAGE', { index }, id); }
  function addFeedEvent(text) { gameState.feed.unshift({ text, time: nowTime() }); gameState.feed = gameState.feed.slice(0, 60); }
  function handleRollDice() { if (canControlTurn()) return commitMonopoly('ROLL'); }
  function buyCurrentField() { if (canControlTurn()) return commitMonopoly('BUY'); }
  function endCurrentTurn() { if (canControlTurn()) return commitMonopoly('END'); }
  function declareBankruptcy(id) { return commitMonopoly('BANKRUPT', {}, id); }

  /* ==================== 8. SZYNK KŁAMCÓW ==================== */
  let selectedLiarCardIds = [];

  function renderLiarsGame() {
    if (!gameState || !gameState.liars) return;
    const liars = gameState.liars;
    const hands = JSON.parse(liars.handsJson || '{}');
    const activeP = gameState.players[liars.turnIndex % gameState.players.length];
    const viewer = getMyViewerPlayer();

    const titleEl = document.getElementById('liars-turn-title');
    if (titleEl) {
      titleEl.textContent = liars.winnerName
        ? `🏆 Wygrywa Szynk Kłamców: ${liars.winnerName}!`
        : `Kolej przy stole: ${activeP?.name || '...'}`;
    }

    const reqBadge = document.getElementById('liars-required-rank');
    const selWrap = document.getElementById('liars-rank-selector-wrap');
    if (reqBadge && selWrap) {
      if (liars.requiredRank) {
        reqBadge.textContent = `Wymagana figura: ${liars.requiredRank}`;
        selWrap.classList.add('hidden');
      } else {
        reqBadge.textContent = `Nowe rozdanie — wybierz deklarowaną figurę!`;
        selWrap.classList.remove('hidden');
      }
    }

    const oppRow = document.getElementById('liars-opponents-row');
    if (oppRow) {
      oppRow.innerHTML = gameState.players.map((p, idx) => {
        const cnt = (hands[p.id] || []).length;
        return `
          <div class="liars-opp-card ${idx === liars.turnIndex ? 'active-liar' : ''}">
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:4px;">
              <span class="player-pawn-inline" style="background:${p.color};width:20px;height:20px;">${getAvatarSvg(p.avatar)}</span>
              <strong>${escapeHTML(p.name)} ${p.isBot ? '🤖' : ''}</strong>
            </div>
            <div style="font-size:0.78rem;color:#ffca28;">🂠 Kart: <strong>${cnt}</strong></div>
          </div>
        `;
      }).join('');
    }

    const pileEl = document.getElementById('liars-pile-count');
    if (pileEl) pileEl.textContent = `🂠 Zakrytych kart na stole: ${liars.pile.length}`;

    const claimEl = document.getElementById('liars-last-claim');
    if (claimEl) {
      claimEl.innerHTML = liars.lastPlay
        ? `🗣️ <strong>${escapeHTML(liars.lastPlay.playerName)}</strong> deklaruje: <strong>${liars.lastPlay.count}× ${escapeHTML(liars.lastPlay.claimedRank)}</strong>`
        : `Stół jest pusty. Wyłóż od 1 do 4 zakrytych kart!`;
    }

    const revBanner = document.getElementById('liars-reveal-banner');
    if (revBanner) {
      if (liars.lastRevealMsg) {
        revBanner.innerHTML = liars.lastRevealMsg;
        revBanner.classList.remove('hidden');
      } else {
        revBanner.classList.add('hidden');
      }
    }

    const isHumanTurn = activeP && !activeP.isBot && canControlTurn(liars.turnIndex);
    const canCallLiar = isHumanTurn && !!liars.lastPlay && liars.lastPlay.playerId !== activeP.id && !liars.winnerName;
    const btnCall = document.getElementById('btn-liars-call');
    const btnPlay = document.getElementById('btn-liars-play');
    if (btnCall) btnCall.disabled = !canCallLiar;
    if (btnPlay) btnPlay.disabled = !isHumanTurn || !!liars.winnerName;

    const myCards = (viewer && hands[viewer.id]) ? hands[viewer.id] : [];
    const handLabel = document.getElementById('liars-my-hand-label');
    if (handLabel && viewer) handLabel.textContent = `Karty gracza ${viewer.name} (${myCards.length} szt.):`;

    const strip = document.getElementById('liars-my-cards');
    if (strip) {
      strip.innerHTML = myCards.map(c => {
        const isRed = c.suit === '♥' || c.suit === '♦';
        const isSel = selectedLiarCardIds.includes(c.id);
        return `
          <div class="playing-card ${isRed ? 'red-suit' : ''} ${isSel ? 'selected-card' : ''}" data-cid="${c.id}">
            <span style="align-self:flex-start;font-size:0.78rem;">${c.rank}${c.suit}</span>
            <span style="font-size:1.35rem;">${c.suit}</span>
            <span style="align-self:flex-end;font-size:0.78rem;">${c.rank}</span>
          </div>
        `;
      }).join('');

      strip.querySelectorAll('.playing-card').forEach(el => {
        el.onclick = () => {
          if (!isHumanTurn) return;
          const cid = el.dataset.cid;
          if (selectedLiarCardIds.includes(cid)) {
            selectedLiarCardIds = selectedLiarCardIds.filter(x => x !== cid);
          } else if (selectedLiarCardIds.length < 4) {
            selectedLiarCardIds.push(cid);
          }
          renderLiarsGame();
        };
      });
    }
  }

  function playLiarsCards() {
    const liars = gameState.liars;
    if (!liars || liars.winnerName) return;
    const activeP = gameState.players[liars.turnIndex % gameState.players.length];
    if (!canControlTurn(liars.turnIndex)) return;

    const hands = JSON.parse(liars.handsJson);
    const myHand = hands[activeP.id] || [];
    const chosenCards = myHand.filter(c => selectedLiarCardIds.includes(c.id));
    if (chosenCards.length === 0) {
      showToast('Zaznacz od 1 do 4 swoich kart na dole ekranu!');
      return;
    }

    const claimedRank = liars.requiredRank || document.getElementById('liars-declare-select').value;
    liars.requiredRank = claimedRank;

    hands[activeP.id] = myHand.filter(c => !selectedLiarCardIds.includes(c.id));
    liars.pile.push(...chosenCards);
    liars.lastPlay = {
      playerId: activeP.id,
      playerName: activeP.name,
      count: chosenCards.length,
      claimedRank: claimedRank,
      actualCards: chosenCards
    };
    liars.lastRevealMsg = '';
    selectedLiarCardIds = [];
    sfx.step();

    liars.handsJson = JSON.stringify(hands);
    liars.turnIndex = (liars.turnIndex + 1) % gameState.players.length;
    pushStateSync();
    checkBotForOtherGames();
  }

  function callLiarOnLastPlay() {
    const liars = gameState.liars;
    if (!liars || !liars.lastPlay) return;
    const caller = gameState.players[liars.turnIndex % gameState.players.length];
    const accused = getPlayerById(liars.lastPlay.playerId);
    const hands = JSON.parse(liars.handsJson);

    const actualStr = liars.lastPlay.actualCards.map(c => `${c.rank}${c.suit}`).join(', ');
    const wasTruth = liars.lastPlay.actualCards.every(c => c.rank === liars.lastPlay.claimedRank);

    if (wasTruth) {
      hands[caller.id].push(...liars.pile);
      liars.lastRevealMsg = `✅ PRAWDA! <strong>${escapeHTML(accused?.name)}</strong> położył [${actualStr}]! Sprawdzający <strong>${escapeHTML(caller.name)}</strong> zabiera całą pulę!`;
      sfx.rent();
    } else {
      hands[accused.id].push(...liars.pile);
      liars.lastRevealMsg = `🚨 KŁAMSTWO! <strong>${escapeHTML(accused?.name)}</strong> deklarował ${liars.lastPlay.claimedRank}, a położył [${actualStr}]! Zabiera całą pulę!`;
      sfx.buy();
    }

    liars.pile = [];
    liars.lastPlay = null;
    liars.requiredRank = null;

    for (const p of gameState.players) {
      if ((hands[p.id] || []).length === 0) {
        liars.winnerName = p.name;
        p.arcadeCash += 500;
        addFeedEvent(`🃏 <strong>${escapeHTML(p.name)}</strong> wygrał rozdanie w Szynku Kłamców (+$500)!`);
        sfx.win();
      }
    }

    liars.handsJson = JSON.stringify(hands);
    pushStateSync();
    checkBotForOtherGames();
  }

  /* ==================== 9. KWIACIARNIA GODULA ==================== */
  const RED_NUMS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  let selectedCasinoChip = 25;
  let currentRouletteBets = {};
  let rouletteHistory = [];
  let rouletteSpinAngle = 0;
  let isCasinoBusy = false;

  function buildRouletteFeltGrid() {
    const grid = document.getElementById('roulette-numbers-grid');
    if (!grid) return;
    let html = `<button type="button" class="felt-num-btn zero-cell" data-bet-key="NUM_0">0<span class="chip-stack-anchor"></span></button>`;
    const rows = [
      [3,6,9,12,15,18,21,24,27,30,33,36],
      [2,5,8,11,14,17,20,23,26,29,32,35],
      [1,4,7,10,13,16,19,22,25,28,31,34]
    ];
    rows.forEach(r => {
      r.forEach(n => {
        const cls = RED_NUMS.includes(n) ? 'red-num' : 'black-num';
        html += `<button type="button" class="felt-num-btn ${cls}" data-bet-key="NUM_${n}">${n}<span class="chip-stack-anchor"></span></button>`;
      });
    });
    grid.innerHTML = html;

    document.querySelectorAll('[data-bet-key]').forEach(btn => {
      btn.onclick = () => placeRouletteChip(btn.dataset.betKey);
    });
  }

  function getTotalRouletteStaked() {
    return Object.values(currentRouletteBets).reduce((a, b) => a + b, 0);
  }

  function placeRouletteChip(betKey) {
    if (isCasinoBusy || !gameState) return;
    const player = getMyViewerPlayer();
    if (!player) return;
    const staked = getTotalRouletteStaked();
    if (player.arcadeCash < staked + selectedCasinoChip) {
      const msgEl = document.getElementById('roulette-msg');
      if (msgEl) msgEl.textContent = '❌ Nie masz tyle gotówki w portfelu na kolejny żeton!';
      return;
    }
    currentRouletteBets[betKey] = (currentRouletteBets[betKey] || 0) + selectedCasinoChip;
    sfx.step();
    renderCasinoGame();
  }

  function clearRouletteBets() {
    if (isCasinoBusy) return;
    currentRouletteBets = {};
    renderCasinoGame();
  }

  function renderCasinoGame() {
    if (!gameState) return;
    const viewer = getMyViewerPlayer();
    const header = document.getElementById('casino-player-header');
    if (header && viewer) {
      header.textContent = `Grasz jako: ${viewer.name} (Portfel: $${viewer.arcadeCash})`;
    }

    const goal = Number(gameState.casinoGoal || 5000);
    const bar = document.getElementById('casino-goal-bar');
    if (bar && viewer) {
      const pct = Math.min(100, Math.round((viewer.arcadeCash / goal) * 100));
      bar.style.width = pct + '%';
    }

    const stakedEl = document.getElementById('roulette-total-staked');
    if (stakedEl) stakedEl.textContent = `$${getTotalRouletteStaked()}`;

    document.querySelectorAll('[data-bet-key]').forEach(btn => {
      const key = btn.dataset.betKey;
      const anchor = btn.querySelector('.chip-stack-anchor');
      if (!anchor) return;
      const amt = currentRouletteBets[key] || 0;
      anchor.innerHTML = amt > 0 ? `<span class="chip-on-felt">$${amt}</span>` : '';
    });

    const histEl = document.getElementById('roulette-history-strip');
    if (histEl && rouletteHistory.length) {
      histEl.innerHTML = `<span>Ostatnie:</span>` + rouletteHistory.slice(0, 7).map(n => {
        const bg = n === 0 ? '#2e7d32' : (RED_NUMS.includes(n) ? '#c62828' : '#212121');
        return `<span class="hist-num-pill" style="background:${bg};padding:2px 6px;border-radius:4px;color:#fff;font-weight:800;">${n}</span>`;
      }).join('');
    }
  }

  function checkCasinoGoalReached(player) {
    const goal = Number(gameState.casinoGoal || 5000);
    if (player && player.arcadeCash >= goal) {
      sfx.win();
      showGenericModal(
        `🌸 KRÓL KWIACIARNI GODULA: ${player.name}!`,
        `<div style="text-align:center;padding:14px;">
          <div style="font-size:3rem;">🎰👑</div>
          <h3 style="color:#ffca28;margin:8px 0;">${escapeHTML(player.name)} osiągnął cel majątkowy $${goal}!</h3>
          <p>Aktualny stan konta: <strong style="color:#2ecc71;">$${player.arcadeCash}</strong></p>
        </div>`
      );
    }
  }

  function evaluateRoulettePayout(betsMap, outcomeNum) {
    let totalReturn = 0;
    const isRed = RED_NUMS.includes(outcomeNum);
    Object.entries(betsMap).forEach(([key, amt]) => {
      if (key === `NUM_${outcomeNum}`) totalReturn += amt * 36;
      else if (key === 'RED' && isRed) totalReturn += amt * 2;
      else if (key === 'BLACK' && outcomeNum !== 0 && !isRed) totalReturn += amt * 2;
      else if (key === 'EVEN' && outcomeNum !== 0 && outcomeNum % 2 === 0) totalReturn += amt * 2;
      else if (key === 'ODD' && outcomeNum % 2 === 1) totalReturn += amt * 2;
      else if (key === 'LOW' && outcomeNum >= 1 && outcomeNum <= 18) totalReturn += amt * 2;
      else if (key === 'HIGH' && outcomeNum >= 19 && outcomeNum <= 36) totalReturn += amt * 2;
      else if (key === 'DOZ_1' && outcomeNum >= 1 && outcomeNum <= 12) totalReturn += amt * 3;
      else if (key === 'DOZ_2' && outcomeNum >= 13 && outcomeNum <= 24) totalReturn += amt * 3;
      else if (key === 'DOZ_3' && outcomeNum >= 25 && outcomeNum <= 36) totalReturn += amt * 3;
    });
    return totalReturn;
  }

  async function commitArcadeWallet(id, stake, payout, reason, gameId) {
    if (!Number.isSafeInteger(stake) || !Number.isSafeInteger(payout) || stake < 0 || payout < 0 || gameState.gameId !== gameId) return false;
    const p = getPlayerById(id);
    if (!p || p.arcadeCash < stake) return false;
    p.arcadeCash = p.arcadeCash - stake + payout;
    addFeedEvent(escapeHTML(reason));
    return pushStateSync();
  }

  function spinFullGodulaRoulette() {
    if (isCasinoBusy || !gameState || gameState.activeGame !== 'CASINO') return;
    const player = getMyViewerPlayer(), totalBet = getTotalRouletteStaked(), msg = document.getElementById('roulette-msg');
    if (!player || totalBet <= 0) { if (msg) msg.textContent = 'Najpierw połóż żetony na stole.'; return; }
    if (player.arcadeCash < totalBet) { if (msg) msg.textContent = 'Brakuje gotówki w portfelu gier towarzyskich.'; return; }
    const gameId = gameState.gameId, id = player.id, bets = copy(currentRouletteBets);
    const outcome = Math.floor(Math.random() * 37), payout = evaluateRoulettePayout(bets, outcome);
    currentRouletteBets = {}; isCasinoBusy = true; sfx.dice();
    const wheel = document.getElementById('godula-roulette-wheel'), orbit = document.getElementById('roulette-ball-orbit');
    rouletteSpinAngle += 1440 + Math.floor(Math.random() * 360);
    if (wheel) wheel.style.transform = `rotate(${rouletteSpinAngle}deg)`;
    orbit?.classList.add('spinning');
    if (msg) msg.textContent = 'Kulka w ruch! Trwa losowanie…';
    setTimeout(async () => {
      orbit?.classList.remove('spinning');
      try {
        if (gameState.gameId !== gameId) return;
        document.getElementById('roulette-result-num').textContent = outcome;
        rouletteHistory.unshift(outcome);
        const ok = await commitArcadeWallet(id, totalBet, payout, `Ruletka: ${player.name}, wynik ${outcome}, stawka $${totalBet}, zwrot $${payout}.`, gameId);
        if (msg) msg.textContent = ok ? `Wypadło ${outcome}. Stawka $${totalBet}, zwrot $${payout}.` : 'Zakład nie został zapisany.';
        if (ok && payout) { sfx.win(); checkCasinoGoalReached(getPlayerById(id)); }
      } finally { isCasinoBusy = false; renderCasinoGame(); }
    }, 2200);
  }

  function spinGodulaSlots() {
    if (isCasinoBusy || !gameState || gameState.activeGame !== 'CASINO') return;
    const player = getMyViewerPlayer(), bet = selectedCasinoChip;
    const msg = document.getElementById('slots-msg');
    if (!player || !Number.isSafeInteger(bet) || bet < 1 || player.arcadeCash < bet) { showToast('Wybierz stawkę mieszczącą się w portfelu gier towarzyskich.'); return; }
    const symbols = ['7️⃣', '💎', '🍒', '🔔', '🍋', '⛏️'];
    const gameId = gameState.gameId, id = player.id;
    const reels = ['slot-r1', 'slot-r2', 'slot-r3'].map(key => document.getElementById(key));
    if (reels.some(x => !x)) return;
    isCasinoBusy = true; if (msg) msg.textContent = 'Bębny w ruch…'; let ticks = 0;
    const timer = setInterval(async () => {
      const result = reels.map(el => { const symbol = symbols[Math.floor(Math.random() * symbols.length)]; el.textContent = symbol; return symbol; }); sfx.step();
      if (++ticks < 11) return;
      clearInterval(timer);
      try {
        if (gameState.gameId !== gameId) return;
        const [a, b, c] = result;
        const mult = a === b && b === c ? (a === '7️⃣' || a === '💎' ? 15 : 8) : (a === b || b === c || a === c ? 2 : 0);
        const payout = bet * mult;
        const ok = await commitArcadeWallet(id, bet, payout, `Automat: ${player.name}, stawka $${bet}, zwrot $${payout}.`, gameId);
        if (msg) msg.textContent = ok ? `${result.join(' ')} · Zwrot $${payout} ze stawki $${bet}.` : 'Zakład nie został zapisany.';
        if (ok && payout) { sfx.win(); checkCasinoGoalReached(getPlayerById(id)); }
      } finally { isCasinoBusy = false; renderCasinoGame(); }
    }, 85);
  }

  /* ==================== 10. SZTOLNIA LABIRYNT (QUORIDOR 9x9) ==================== */
  let quoridorActionMode = 'MOVE';

  function isQuoridorStepOpen(r1, c1, r2, c2, hWalls, vWalls) {
    if (r2 < 0 || r2 > 8 || c2 < 0 || c2 > 8) return false;
    if (r2 === r1 - 1 && c2 === c1) return !hWalls.includes(`${r2},${c1}`) && !hWalls.includes(`${r2},${c1 - 1}`);
    if (r2 === r1 + 1 && c2 === c1) return !hWalls.includes(`${r1},${c1}`) && !hWalls.includes(`${r1},${c1 - 1}`);
    if (c2 === c1 - 1 && r2 === r1) return !vWalls.includes(`${r1},${c2}`) && !vWalls.includes(`${r1 - 1},${c2}`);
    if (c2 === c1 + 1 && r2 === r1) return !vWalls.includes(`${r1},${c1}`) && !vWalls.includes(`${r1 - 1},${c1}`);
    return false;
  }

  function getShortestQuoridorPath(startPos, targetRow, hWalls, vWalls) {
    const queue = [{ r: startPos.r, c: startPos.c, path: [] }];
    const visited = new Set([`${startPos.r},${startPos.c}`]);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.r === targetRow) return cur.path;

      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr, nc = cur.c + dc;
        const key = `${nr},${nc}`;
        if (!visited.has(key) && isQuoridorStepOpen(cur.r, cur.c, nr, nc, hWalls, vWalls)) {
          visited.add(key);
          queue.push({ r: nr, c: nc, path: [...cur.path, { r: nr, c: nc }] });
        }
      }
    }
    return null;
  }

  function canPlaceQuoridorWall(orient, r, c, qState) {
    if (r < 0 || r > 7 || c < 0 || c > 7) return false;
    const key = `${r},${c}`;
    if (orient === 'H') {
      if (qState.hWalls.includes(key) || qState.hWalls.includes(`${r},${c - 1}`) || qState.hWalls.includes(`${r},${c + 1}`)) return false;
      if (qState.vWalls.includes(key)) return false;
      const nextH = [...qState.hWalls, key];
      return getShortestQuoridorPath(qState.pos[0], 0, nextH, qState.vWalls) !== null &&
             getShortestQuoridorPath(qState.pos[1], 8, nextH, qState.vWalls) !== null;
    } else {
      if (qState.vWalls.includes(key) || qState.vWalls.includes(`${r - 1},${c}`) || qState.vWalls.includes(`${r + 1},${c}`)) return false;
      if (qState.hWalls.includes(key)) return false;
      const nextV = [...qState.vWalls, key];
      return getShortestQuoridorPath(qState.pos[0], 0, qState.hWalls, nextV) !== null &&
             getShortestQuoridorPath(qState.pos[1], 8, qState.hWalls, nextV) !== null;
    }
  }

  function getValidQuoridorPawnMoves(qState, side) {
    const me = qState.pos[side];
    const opp = qState.pos[1 - side];
    const moves = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    dirs.forEach(([dr, dc]) => {
      const nr = me.r + dr, nc = me.c + dc;
      if (!isQuoridorStepOpen(me.r, me.c, nr, nc, qState.hWalls, qState.vWalls)) return;
      if (nr === opp.r && nc === opp.c) {
        const jr = nr + dr, jc = nc + dc;
        if (isQuoridorStepOpen(nr, nc, jr, jc, qState.hWalls, qState.vWalls)) {
          moves.push({ r: jr, c: jc });
        }
      } else {
        moves.push({ r: nr, c: nc });
      }
    });
    return moves;
  }

  function executeQuoridorMove(targetR, targetC) {
    const q = gameState.quoridor;
    if (!q || q.winner !== null) return;
    const side = q.turn;
    q.pos[side] = { r: targetR, c: targetC };
    sfx.step();

    if ((side === 0 && targetR === 0) || (side === 1 && targetR === 8)) {
      q.winner = side;
      sfx.win();
      const winPlayer = getTeamActivePlayer(side, q);
      addFeedEvent(`🧱 <strong>${escapeHTML(winPlayer?.name)}</strong> przeszedł na drugą stronę Sztolni Labiryntu i wygrał mecz!`);
    } else {
      advance2PGameTurn(q);
    }
    pushStateSync();
    checkBotForOtherGames();
  }

  function executeQuoridorWall(orient, r, c) {
    const q = gameState.quoridor;
    if (!q || q.winner !== null) return;
    const side = q.turn;
    if (q.wallsLeft[side] <= 0) {
      showToast('Nie masz już więcej ścian do postawienia!');
      return;
    }
    if (!canPlaceQuoridorWall(orient, r, c, q)) {
      showToast('Nie można tu postawić ściany (nachodzi na inną lub całkowicie odcina drogę)!');
      return;
    }

    if (orient === 'H') q.hWalls.push(`${r},${c}`);
    else q.vWalls.push(`${r},${c}`);
    q.wallsLeft[side] -= 1;
    quoridorActionMode = 'MOVE';
    sfx.build();
    advance2PGameTurn(q);
    pushStateSync();
    checkBotForOtherGames();
  }

  function renderQuoridorGame() {
    if (!gameState) return;
    if (!gameState.quoridor || !Array.isArray(gameState.quoridor.pos)) {
      gameState.quoridor = createQuoridorState();
    }

    const grid = document.getElementById('quoridor-grid');
    if (!grid) return;
    grid.style.cssText = 'width:min(58dvh,82vw,520px);height:min(58dvh,82vw,520px);min-width:270px;min-height:270px;display:grid;grid-template-columns:repeat(9,1fr);grid-template-rows:repeat(9,1fr);gap:7px;background:#0d1f1e;padding:10px;border-radius:16px;border:3px solid #35584b;position:relative;';

    const q = gameState.quoridor;
    const activePlayer = getTeamActivePlayer(q.turn, q);

    const teamsTag = document.getElementById('quoridor-teams-tag');
    if (teamsTag) {
      teamsTag.textContent = isTeamMode2v2()
        ? `DRUŻYNA A (${getTeamNamesSummary(0)}) VS DRUŻYNA B (${getTeamNamesSummary(1)})`
        : `POJEDYNEK 1 VS 1: ${getTeamNamesSummary(0)} VS ${getTeamNamesSummary(1)}`;
    }

    const turnTxt = document.getElementById('quoridor-turn-text');
    if (turnTxt) {
      if (q.winner !== null) {
        const wName = getTeamActivePlayer(q.winner, q)?.name || (q.winner === 0 ? 'Drużyna A' : 'Drużyna B');
        turnTxt.textContent = `🏆 Zwycięstwo w Sztolni: ${wName}!`;
      } else {
        turnTxt.textContent = `Ruch: ${activePlayer?.name} (${q.turn === 0 ? 'Idzie w GÓRĘ ▲' : 'Idzie w DÓŁ ▼'})`;
      }
    }

    const wallsInfo = document.getElementById('quoridor-walls-info');
    if (wallsInfo) wallsInfo.textContent = `🧱 Ściany: ${q.wallsLeft[0]} vs ${q.wallsLeft[1]}`;

    document.getElementById('btn-q-mode-move')?.classList.toggle('btn-hub-buy', quoridorActionMode === 'MOVE');
    document.getElementById('btn-q-mode-wall-h')?.classList.toggle('btn-hub-buy', quoridorActionMode === 'WALL_H');
    document.getElementById('btn-q-mode-wall-v')?.classList.toggle('btn-hub-buy', quoridorActionMode === 'WALL_V');

    const canControl = canControl2PSide(q.turn, q) && q.winner === null;
    const validMoves = (canControl && quoridorActionMode === 'MOVE') ? getValidQuoridorPawnMoves(q, q.turn) : [];

    grid.innerHTML = '';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        const isStep = validMoves.some(m => m.r === r && m.c === c);
        cell.style.cssText = `background:${isStep ? 'rgba(46,204,113,0.34)' : '#1c3633'};border:${isStep ? '2px solid #2ecc71' : '1px solid rgba(255,255,255,0.12)'};border-radius:7px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;`;
        if (r === 0) cell.style.borderTop = '3px solid #ff7849';
        if (r === 8) cell.style.borderBottom = '3px solid #00e5ff';

        [0, 1].forEach(side => {
          if (q.pos[side] && q.pos[side].r === r && q.pos[side].c === c) {
            const pObj = getTeamActivePlayer(side, q) || gameState.players[side] || gameState.players[0];
            const pawn = document.createElement('div');
            pawn.style.cssText = `width:78%;height:78%;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;background:${side === 0 ? (pObj?.color || '#ff7849') : (pObj?.color || '#00e5ff')};box-shadow:0 4px 10px rgba(0,0,0,0.8);z-index:4;`;
            pawn.innerHTML = getAvatarSvg(pObj?.avatar || 'helmet');
            const svgEl = pawn.querySelector('svg');
            if (svgEl) { svgEl.style.width = '70%'; svgEl.style.height = '70%'; }
            cell.appendChild(pawn);
          }
        });

        if (q.hWalls.includes(`${r},${c}`)) {
          const hw = document.createElement('div');
          hw.style.cssText = 'position:absolute;left:0;bottom:-6px;width:calc(200% + 7px);height:5px;background:linear-gradient(90deg,#ff9800,#ffca28);border-radius:3px;z-index:9;pointer-events:none;';
          cell.appendChild(hw);
        }
        if (q.vWalls.includes(`${r},${c}`)) {
          const vw = document.createElement('div');
          vw.style.cssText = 'position:absolute;top:0;right:-6px;width:5px;height:calc(200% + 7px);background:linear-gradient(180deg,#ff9800,#ffca28);border-radius:3px;z-index:9;pointer-events:none;';
          cell.appendChild(vw);
        }

        cell.onclick = () => {
          if (!canControl) return;
          if (quoridorActionMode === 'MOVE') {
            if (isStep) executeQuoridorMove(r, c);
          } else if (quoridorActionMode === 'WALL_H') {
            if (r < 8 && c < 8) executeQuoridorWall('H', r, c);
          } else if (quoridorActionMode === 'WALL_V') {
            if (r < 8 && c < 8) executeQuoridorWall('V', r, c);
          }
        };

        grid.appendChild(cell);
      }
    }
  }

  /* ==================== 11. CHIŃCZYK, WARCABY, SZACHY, 4 W RZĘDZIE ==================== */
  const LUDO_TRACK = [[4,0],[4,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,4],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[4,7],[4,8],[4,9],[4,10],[5,10],[6,10],[6,9],[6,8],[6,7],[6,6],[7,6],[8,6],[9,6],[10,6],[10,5],[10,4],[9,4],[8,4],[7,4],[6,4],[6,3],[6,2],[6,1],[6,0],[5,0]];
  const LUDO_BASES = [[[1,1],[1,2],[2,1],[2,2]],[[1,8],[1,9],[2,8],[2,9]],[[8,8],[8,9],[9,8],[9,9]],[[8,1],[8,2],[9,1],[9,2]]];
  const LUDO_HOMES = [[[5,1],[5,2],[5,3],[5,4]],[[1,5],[2,5],[3,5],[4,5]],[[5,9],[5,8],[5,7],[5,6]],[[9,5],[8,5],[7,5],[6,5]]];
  const LUDO_COLORS = ['#ff7849', '#00e5ff', '#ffca28', '#f06292'];
  const LUDO_NAMES  = ['Wirek', 'Nowy Bytom', 'Halemba', 'Bykowina'];

  function canMoveLudoPawn(pIdx, pawnIdx, dice) {
    const step = gameState.ludo.pawns[pIdx][pawnIdx];
    if (step === -1) return dice === 6;
    if (step + dice > 43) return false;
    if (step + dice >= 40) return !gameState.ludo.pawns[pIdx].includes(step + dice);
    return true;
  }

  function rollLudoDice() {
    if (!gameState || gameState.activeGame !== 'LUDO') return;
    const ludo = gameState.ludo;
    if (ludo.rolled || ludo.winner !== null) return;
    const pCount = Math.min(4, gameState.players.length);
    const curPlayer = gameState.players[ludo.turn % pCount];
    if (!curPlayer.isBot && !canControlTurn(ludo.turn % pCount)) return;

    sfx.dice();
    const dieEl = document.getElementById('ludo-die');
    dieEl?.classList.add('rolling');

    setTimeout(() => {
      dieEl?.classList.remove('rolling');
      const allInBase = ludo.pawns[ludo.turn].every(s => s === -1);
      const d = (allInBase && Math.random() < 0.38) ? 6 : (Math.floor(Math.random() * 6) + 1);

      ludo.dice = d;
      ludo.rolled = true;
      if (dieEl) dieEl.dataset.val = d;

      const anyMove = [0,1,2,3].some(i => canMoveLudoPawn(ludo.turn, i, d));
      if (!anyMove) {
        setTimeout(() => {
          ludo.rolled = false;
          ludo.turn = (ludo.turn + 1) % pCount;
          pushStateSync();
          checkBotForOtherGames();
        }, 550);
      } else {
        pushStateSync();
        if (curPlayer.isBot && isBotController()) {
          setTimeout(() => {
            const movableIdx = [0,1,2,3].find(i => canMoveLudoPawn(ludo.turn, i, ludo.dice));
            if (movableIdx !== undefined) moveLudoPawn(ludo.turn, movableIdx, true);
          }, 500);
        }
      }
    }, 350);
  }

  function moveLudoPawn(pIdx, pawnIdx, isBotCall = false) {
    const ludo = gameState.ludo;
    const pCount = Math.min(4, gameState.players.length);
    if (!ludo.rolled || ludo.turn !== pIdx) return;
    if (!isBotCall && !canControlTurn(pIdx)) return;
    if (!canMoveLudoPawn(pIdx, pawnIdx, ludo.dice)) return;

    let step = ludo.pawns[pIdx][pawnIdx];
    step = (step === -1) ? 0 : (step + ludo.dice);
    ludo.pawns[pIdx][pawnIdx] = step;
    sfx.step();

    if (step < 40) {
      const myGlobalIdx = (step + pIdx * 10) % 40;
      for (let otherP = 0; otherP < pCount; otherP++) {
        if (otherP === pIdx) continue;
        for (let k = 0; k < 4; k++) {
          const oStep = ludo.pawns[otherP][k];
          if (oStep >= 0 && oStep < 40 && ((oStep + otherP * 10) % 40) === myGlobalIdx) {
            ludo.pawns[otherP][k] = -1;
            sfx.rent();
          }
        }
      }
    }
    if (ludo.pawns[pIdx].every(s => s >= 40)) {
      ludo.winner = pIdx;
      sfx.win();
    }
    const extra = (ludo.dice === 6 && ludo.winner === null);
    ludo.rolled = false;
    if (!extra) ludo.turn = (ludo.turn + 1) % pCount;
    pushStateSync();
    checkBotForOtherGames();
  }

  function renderLudoGame() {
    const grid = document.getElementById('ludo-grid');
    if (!grid || !gameState.ludo) return;
    const ludo = gameState.ludo;
    const pCount = Math.min(4, gameState.players.length);
    const curP = gameState.players[ludo.turn % pCount];

    const turnTxt = document.getElementById('ludo-turn-text');
    if (turnTxt) {
      turnTxt.textContent = ludo.winner !== null
        ? `🏆 Wygrywa: ${gameState.players[ludo.winner]?.name || LUDO_NAMES[ludo.winner]}!`
        : `Kolej: ${curP?.name || LUDO_NAMES[ludo.turn]}`;
    }
    const dieEl = document.getElementById('ludo-die');
    if (dieEl) dieEl.dataset.val = ludo.dice;

    grid.innerHTML = '';
    const cells = Array(11).fill(null).map(() => Array(11).fill(null));
    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const div = document.createElement('div');
        div.className = 'ludo-cell';
        if (r === 5 && c === 5) { div.style.background = '#ff9800'; div.textContent = '⚒️'; }
        cells[r][c] = div;
        grid.appendChild(div);
      }
    }
    LUDO_TRACK.forEach(([r, c]) => cells[r][c].classList.add('track-cell'));
    for (let p = 0; p < 4; p++) {
      const col = gameState.players[p]?.color || LUDO_COLORS[p];
      LUDO_BASES[p].forEach(([r, c]) => { cells[r][c].style.background = col + '24'; cells[r][c].style.border = `2px solid ${col}`; });
      LUDO_HOMES[p].forEach(([r, c]) => { cells[r][c].style.background = col + '38'; cells[r][c].style.border = `2px solid ${col}`; });
    }
    for (let p = 0; p < pCount; p++) {
      const plObj = gameState.players[p];
      const avSvg = getAvatarSvg(plObj?.avatar || 'helmet');
      for (let k = 0; k < 4; k++) {
        const step = ludo.pawns[p][k];
        const coords = (step === -1) ? LUDO_BASES[p][k] : (step < 40 ? LUDO_TRACK[(step + p * 10) % 40] : LUDO_HOMES[p][step - 40]);
        if (coords) {
          const pawnEl = document.createElement('div');
          const movable = ludo.rolled && ludo.turn === p && canControlTurn(p) && canMoveLudoPawn(p, k, ludo.dice);
          pawnEl.className = `ludo-pawn ${movable ? 'movable-pawn' : ''}`;
          pawnEl.style.background = plObj?.color || LUDO_COLORS[p];
          pawnEl.innerHTML = avSvg;
          if (movable) pawnEl.onclick = () => moveLudoPawn(p, k, false);
          cells[coords[0]][coords[1]].appendChild(pawnEl);
        }
      }
    }
  }

  let selectedChecker = null;
  function getCheckerMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const dirs = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : (piece.p === 0 ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]);
    const moves = [];
    dirs.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (!board[nr][nc]) moves.push({ r: nr, c: nc, jump: null });
        else if (board[nr][nc].p !== piece.p) {
          const jr = r + dr * 2, jc = c + dc * 2;
          if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !board[jr][jc]) moves.push({ r: jr, c: jc, jump: [nr, nc] });
        }
      }
    });
    return moves;
  }

  function renderCheckersGame() {
    const grid = document.getElementById('checkers-grid');
    if (!grid || !gameState.checkers) return;
    const chk = gameState.checkers;
    const board = JSON.parse(chk.boardJson);
    const activeP = getTeamActivePlayer(chk.turn, chk);

    const teamsTag = document.getElementById('checkers-teams-tag');
    if (teamsTag) {
      teamsTag.textContent = isTeamMode2v2()
        ? `DRUŻYNA WĘGLA (${getTeamNamesSummary(0)}) VS DRUŻYNA STALI (${getTeamNamesSummary(1)})`
        : `POJEDYNEK 1 VS 1: ${getTeamNamesSummary(0)} VS ${getTeamNamesSummary(1)}`;
    }

    const turnEl = document.getElementById('checkers-turn-text');
    if (turnEl) {
      turnEl.textContent = chk.winner !== null
        ? `🏆 Zwycięstwo: ${getTeamActivePlayer(chk.winner, chk)?.name}!`
        : `Ruch: ${activeP?.name} (${chk.turn === 0 ? 'Pomarańczowe ▲' : 'Błękitne ▼'})`;
    }
    const scoreEl = document.getElementById('checkers-score-text');
    if (scoreEl) scoreEl.textContent = `Zbicia: ${chk.captured[0]} — ${chk.captured[1]}`;

    const canControl = canControl2PSide(chk.turn, chk) && chk.winner === null;
    const validTargets = (canControl && selectedChecker) ? getCheckerMoves(board, selectedChecker.r, selectedChecker.c) : [];
    grid.innerHTML = '';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isDark = (r + c) % 2 === 1;
        const isSel = selectedChecker && selectedChecker.r === r && selectedChecker.c === c;
        const targetMove = validTargets.find(m => m.r === r && m.c === c);
        sq.className = `board-sq ${isDark ? 'sq-dark' : 'sq-light'} ${isSel ? 'sq-selected' : ''} ${targetMove ? 'sq-valid-move' : ''}`;
        const cell = board[r][c];
        if (cell) {
          const disc = document.createElement('div');
          disc.className = `checker-disc ${cell.p === 0 ? 'p1-disc' : 'p2-disc'}`;
          if (cell.king) disc.textContent = '👑';
          sq.appendChild(disc);
        }
        sq.onclick = () => {
          if (!canControl) return;
          if (targetMove) { executeCheckerMove(selectedChecker.r, selectedChecker.c, targetMove); selectedChecker = null; return; }
          if (cell && cell.p === chk.turn) { selectedChecker = { r, c }; renderCheckersGame(); }
        };
        grid.appendChild(sq);
      }
    }
  }

  function executeCheckerMove(fr, fc, move) {
    const chk = gameState.checkers;
    const board = JSON.parse(chk.boardJson);
    const piece = board[fr][fc];
    if (!piece) return;
    board[fr][fc] = null;
    board[move.r][move.c] = piece;
    if (move.jump) { board[move.jump[0]][move.jump[1]] = null; chk.captured[piece.p] += 1; sfx.rent(); }
    else sfx.step();
    if ((piece.p === 0 && move.r === 0) || (piece.p === 1 && move.r === 7)) piece.king = true;
    if (chk.captured[0] >= 12) { chk.winner = 0; sfx.win(); }
    if (chk.captured[1] >= 12) { chk.winner = 1; sfx.win(); }
    chk.boardJson = JSON.stringify(board);
    if (chk.winner === null) advance2PGameTurn(chk);
    pushStateSync();
    checkBotForOtherGames();
  }

  const CHESS_GLYPHS = {
    0: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
    1: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }
  };
  let selectedChessSq = null;

  function getValidChessMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const moves = [];
    const p = piece.p;
    const addIfValid = (nr, nc) => {
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7) return false;
      if (!board[nr][nc]) { moves.push({ r: nr, c: nc }); return true; }
      if (board[nr][nc].p !== p) { moves.push({ r: nr, c: nc }); return false; }
      return false;
    };
    if (piece.type === 'P') {
      const dir = p === 0 ? -1 : 1, startRow = p === 0 ? 6 : 1;
      if (r + dir >= 0 && r + dir < 8 && !board[r + dir][c]) {
        moves.push({ r: r + dir, c });
        if (r === startRow && !board[r + dir * 2][c]) moves.push({ r: r + dir * 2, c });
      }
      [-1, 1].forEach(dc => {
        const nr = r + dir, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] && board[nr][nc].p !== p) moves.push({ r: nr, c: nc });
      });
    }
    if (piece.type === 'N') [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => addIfValid(r + dr, c + dc));
    if (piece.type === 'K') [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => addIfValid(r + dr, c + dc));
    const slideDirs = [];
    if (piece.type === 'R' || piece.type === 'Q') slideDirs.push([-1,0],[1,0],[0,-1],[0,1]);
    if (piece.type === 'B' || piece.type === 'Q') slideDirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
    slideDirs.forEach(([dr, dc]) => { for (let s = 1; s < 8; s++) if (!addIfValid(r + dr * s, c + dc * s)) break; });
    return moves;
  }

  function renderChessGame() {
    const grid = document.getElementById('chess-grid');
    if (!grid || !gameState.chess) return;
    const ch = gameState.chess;
    const board = JSON.parse(ch.boardJson);
    const activeP = getTeamActivePlayer(ch.turn, ch);

    const teamsTag = document.getElementById('chess-teams-tag');
    if (teamsTag) {
      teamsTag.textContent = isTeamMode2v2()
        ? `DRUŻYNA ZŁOTYCH (${getTeamNamesSummary(0)}) VS DRUŻYNA BŁĘKITNYCH (${getTeamNamesSummary(1)})`
        : `POJEDYNEK 1 VS 1: ${getTeamNamesSummary(0)} VS ${getTeamNamesSummary(1)}`;
    }

    const turnEl = document.getElementById('chess-turn-text');
    if (turnEl) {
      turnEl.textContent = ch.winner !== null
        ? `🏆 Szach-Mat! Wygrywa: ${getTeamActivePlayer(ch.winner, ch)?.name}!`
        : `Ruch: ${activeP?.name} (${ch.turn === 0 ? 'Złote ♔' : 'Błękitne ♚'})`;
    }
    const statusEl = document.getElementById('chess-status-text');
    if (statusEl) statusEl.textContent = ch.lastMove || 'Kliknij swoją figurę, a następnie podświetlone pole';

    const canControl = canControl2PSide(ch.turn, ch) && ch.winner === null;
    const validMoves = (canControl && selectedChessSq) ? getValidChessMoves(board, selectedChessSq.r, selectedChessSq.c) : [];
    grid.innerHTML = '';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isDark = (r + c) % 2 === 1;
        const isSel = selectedChessSq && selectedChessSq.r === r && selectedChessSq.c === c;
        const target = validMoves.find(m => m.r === r && m.c === c);
        sq.className = `board-sq ${isDark ? 'sq-dark' : 'sq-light'} ${isSel ? 'sq-selected' : ''} ${target ? 'sq-valid-move' : ''}`;
        const piece = board[r][c];
        if (piece) {
          const span = document.createElement('span');
          span.className = `chess-piece-glyph ${piece.p === 0 ? 'white-side' : 'black-side'}`;
          span.textContent = CHESS_GLYPHS[piece.p][piece.type];
          sq.appendChild(span);
        }
        sq.onclick = () => {
          if (!canControl) return;
          if (target) {
            executeChessMove(selectedChessSq.r, selectedChessSq.c, target.r, target.c);
            selectedChessSq = null;
            return;
          }
          if (piece && piece.p === ch.turn) {
            selectedChessSq = { r, c };
            renderChessGame();
          }
        };
        grid.appendChild(sq);
      }
    }
  }

  function executeChessMove(fr, fc, tr, tc) {
    const ch = gameState.chess;
    const board = JSON.parse(ch.boardJson);
    const moving = board[fr][fc];
    if (!moving) return;
    const target = board[tr][tc];
    const activeP = getTeamActivePlayer(ch.turn, ch);

    board[fr][fc] = null;
    board[tr][tc] = moving;
    if (moving.type === 'P' && (tr === 0 || tr === 7)) moving.type = 'Q';

    if (target && target.type === 'K') {
      ch.winner = moving.p;
      ch.lastMove = `👑 ${activeP?.name} zbija Króla i wygrywa partię!`;
      sfx.win();
    } else {
      ch.lastMove = `${activeP?.name}: ${CHESS_GLYPHS[moving.p][moving.type]} ➔ (${tr + 1}, ${tc + 1})`;
      if (target) sfx.rent(); else sfx.step();
    }

    ch.boardJson = JSON.stringify(board);
    if (ch.winner === null) advance2PGameTurn(ch);
    pushStateSync();
    checkBotForOtherGames();
  }

  function dropConnect4Disc(col) {
    const c4 = gameState.connect4;
    if (!c4 || c4.winner !== null) return;
    const board = JSON.parse(c4.boardJson);
    let placedRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (board[r][col] === null) { board[r][col] = c4.turn; placedRow = r; break; }
    }
    if (placedRow === -1) return;
    sfx.step();

    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    const won = dirs.some(([dr, dc]) => {
      let count = 1;
      for (let s = 1; s < 4; s++) { const nr = placedRow + dr * s, nc = col + dc * s; if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr][nc] === c4.turn) count++; else break; }
      for (let s = 1; s < 4; s++) { const nr = placedRow - dr * s, nc = col - dc * s; if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr][nc] === c4.turn) count++; else break; }
      return count >= 4;
    });

    c4.boardJson = JSON.stringify(board);
    if (won) {
      c4.winner = c4.turn;
      sfx.win();
    } else {
      advance2PGameTurn(c4);
    }
    pushStateSync();
    checkBotForOtherGames();
  }

  function renderConnect4Game() {
    const grid = document.getElementById('c4-grid');
    if (!grid || !gameState.connect4) return;
    const c4 = gameState.connect4;
    const board = JSON.parse(c4.boardJson);
    const activeP = getTeamActivePlayer(c4.turn, c4);

    const teamsTag = document.getElementById('c4-teams-tag');
    if (teamsTag) {
      teamsTag.textContent = isTeamMode2v2()
        ? `DRUŻYNA A (${getTeamNamesSummary(0)}) VS DRUŻYNA B (${getTeamNamesSummary(1)})`
        : `POJEDYNEK 1 VS 1: ${getTeamNamesSummary(0)} VS ${getTeamNamesSummary(1)}`;
    }

    const turnEl = document.getElementById('c4-turn-text');
    if (turnEl) {
      turnEl.textContent = c4.winner !== null
        ? `🏆 Wygrywa: ${getTeamActivePlayer(c4.winner, c4)?.name}!`
        : `Ruch: ${activeP?.name} (${c4.turn === 0 ? 'Pomarańczowe' : 'Błękitne'})`;
    }

    const canControl = canControl2PSide(c4.turn, c4) && c4.winner === null;
    grid.innerHTML = '';
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const slot = document.createElement('div');
        slot.className = 'c4-slot';
        const val = board[r][c];
        if (val !== null) {
          const disc = document.createElement('div');
          disc.className = 'c4-disc';
          disc.style.background = val === 0 ? '#ff7849' : '#00e5ff';
          slot.appendChild(disc);
        }
        slot.onclick = () => {
          if (canControl) dropConnect4Disc(c);
        };
        grid.appendChild(slot);
      }
    }
  }

  /* ==================== CENTRALNY STEROWNIK BOTÓW ==================== */
  function checkBotForOtherGames() {
    if (!gameState) return;
    if (botActionTimeout) {
      clearTimeout(botActionTimeout);
      botActionTimeout = null;
    }
    if (!isBotController()) return;

    const mode = gameState.activeGame;

    if (mode === 'MONOPOLY' && gameState.status === 'PLAYING') {
      scheduleMonopolyBot();
    }

    if (mode === 'LIARS' && !gameState.liars.winnerName) {
      const liars = gameState.liars;
      const cur = gameState.players[liars.turnIndex % gameState.players.length];
      if (cur && cur.isBot) {
        botActionTimeout = setTimeout(() => {
          const hands = JSON.parse(liars.handsJson);
          const botHand = hands[cur.id] || [];
          if (liars.lastPlay && Math.random() < 0.38) {
            callLiarOnLastPlay();
            return;
          }
          if (botHand.length > 0) {
            const rank = liars.requiredRank || ['A','K','Q','J','10'][Math.floor(Math.random() * 5)];
            liars.requiredRank = rank;
            const matching = botHand.filter(c => c.rank === rank);
            const played = matching.length > 0 ? [matching[0]] : [botHand[0]];
            hands[cur.id] = botHand.filter(c => c.id !== played[0].id);
            liars.pile.push(...played);
            liars.lastPlay = { playerId: cur.id, playerName: cur.name, count: played.length, claimedRank: rank, actualCards: played };
            if (hands[cur.id].length === 0) liars.winnerName = cur.name;
            liars.handsJson = JSON.stringify(hands);
            liars.turnIndex = (liars.turnIndex + 1) % gameState.players.length;
            pushStateSync();
            checkBotForOtherGames();
          }
        }, 700);
      }
    }

    if (mode === 'QUORIDOR' && gameState.quoridor.winner === null) {
      const q = gameState.quoridor;
      const activeP = getTeamActivePlayer(q.turn, q);
      if (activeP && activeP.isBot) {
        botActionTimeout = setTimeout(() => {
          const side = q.turn;
          const opp = 1 - side;
          if (q.wallsLeft[side] > 0 && Math.random() < 0.3) {
            const oppPos = q.pos[opp];
            const wallR = opp === 0 ? Math.max(0, oppPos.r - 1) : Math.min(7, oppPos.r);
            const wallC = Math.min(7, oppPos.c);
            if (canPlaceQuoridorWall('H', wallR, wallC, q)) {
              executeQuoridorWall('H', wallR, wallC);
              return;
            }
          }
          const targetRow = side === 0 ? 0 : 8;
          const shortest = getShortestQuoridorPath(q.pos[side], targetRow, q.hWalls, q.vWalls);
          const validSteps = getValidQuoridorPawnMoves(q, side);
          if (shortest && shortest.length > 0) {
            const nextStep = shortest[0];
            const match = validSteps.find(m => m.r === nextStep.r && m.c === nextStep.c) || validSteps[0];
            if (match) executeQuoridorMove(match.r, match.c);
          } else if (validSteps.length > 0) {
            executeQuoridorMove(validSteps[0].r, validSteps[0].c);
          }
        }, 600);
      }
    }
if (mode === 'LUDO') {
      const pCount = Math.min(4, gameState.players.length);
      const cur = gameState.players[gameState.ludo.turn % pCount];
      if (cur && cur.isBot && gameState.ludo.winner === null && !gameState.ludo.rolled) {
        botActionTimeout = setTimeout(rollLudoDice, 600);
      }
    }

    if (mode === 'CHECKERS' && gameState.checkers.winner === null) {
      const chk = gameState.checkers;
      const cur = getTeamActivePlayer(chk.turn, chk);
      if (cur && cur.isBot) {
        botActionTimeout = setTimeout(() => {
          const board = JSON.parse(chk.boardJson);
          const all = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (board[r][c]?.p === chk.turn) getCheckerMoves(board, r, c).forEach(m => all.push({ fr: r, fc: c, m }));
            }
          }
          if (all.length) {
            const pick = all.find(x => x.m.jump) || all[Math.floor(Math.random() * all.length)];
            executeCheckerMove(pick.fr, pick.fc, pick.m);
          } else {
            chk.winner = 1 - chk.turn;
            pushStateSync();
          }
        }, 600);
      }
    }

    if (mode === 'CHESS' && gameState.chess.winner === null) {
      const ch = gameState.chess;
      const cur = getTeamActivePlayer(ch.turn, ch);
      if (cur && cur.isBot) {
        botActionTimeout = setTimeout(() => {
          const board = JSON.parse(ch.boardJson);
          const all = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (board[r][c]?.p === ch.turn) getValidChessMoves(board, r, c).forEach(m => all.push({ fr: r, fc: c, tr: m.r, tc: m.c }));
            }
          }
          if (all.length) {
            const kingMove = all.find(x => board[x.tr][x.tc]?.type === 'K');
            const captureMove = all.find(x => board[x.tr][x.tc] !== null);
            const pick = kingMove || captureMove || all[Math.floor(Math.random() * all.length)];
            executeChessMove(pick.fr, pick.fc, pick.tr, pick.tc);
          }
        }, 600);
      }
    }

    if (mode === 'CONNECT4' && gameState.connect4.winner === null) {
      const c4 = gameState.connect4;
      const cur = getTeamActivePlayer(c4.turn, c4);
      if (cur && cur.isBot) {
        botActionTimeout = setTimeout(() => {
          const board = JSON.parse(c4.boardJson);
          const cols = [0,1,2,3,4,5,6].filter(c => board[0][c] === null);
          if (cols.length) dropConnect4Disc(cols[Math.floor(Math.random() * cols.length)]);
        }, 550);
      }
    }
  }

  /* ==================== 12. RENDEROWANIE INTERFEJSU ==================== */
  function renderAll() {
    if (!gameState) return;
    syncMyOnlineIdentity();
    inject2PModeToggleButtons();
    update2PModeToggleLabels();
    if (gameState.mapId) applyMapTheme(gameState.mapId);

    if (gameState.status === 'FINISHED' && gameState.winnerAnnouncement && lastWinnerShown !== gameState.gameId) {
      lastWinnerShown = gameState.gameId;
      showGenericModal(
        `👑 ZWYCIĘZCA GRY: ${gameState.winnerAnnouncement.winnerName}!`,
        `<div style="text-align:center;padding:18px;">
          <div style="font-size:3.5rem;margin-bottom:8px;">🏆</div>
          <h2 style="color:#ffca28;margin-bottom:10px;">${escapeHTML(gameState.winnerAnnouncement.winnerName)} wygrywa Ruda Śląska Monopoly!</h2>
          <p style="font-size:0.95rem;line-height:1.5;margin-bottom:14px;">${escapeHTML(gameState.winnerAnnouncement.reason)}</p>
          <div style="font-weight:900;color:#2ecc71;font-size:1.1rem;">Końcowy stan konta: $${Number(gameState.winnerAnnouncement.cash) || 0}</div>
        </div>`
      );
    }

    const activeMode = gameState.activeGame || 'MONOPOLY';
    ['MONOPOLY', 'LIARS', 'CASINO', 'QUORIDOR', 'LUDO', 'CHECKERS', 'CHESS', 'CONNECT4'].forEach(g => {
      const st = document.getElementById('stage-' + g);
      if (st) st.classList.toggle('hidden', g !== activeMode);
    });
    document.querySelectorAll('.game-nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.switchGame === activeMode));

    renderMonopolyBoard();
    renderCenterHUD();
    document.body.dataset.activeGame = activeMode;
    const renderActive = { LIARS: renderLiarsGame, CASINO: renderCasinoGame, QUORIDOR: renderQuoridorGame, LUDO: renderLudoGame, CHECKERS: renderCheckersGame, CHESS: renderChessGame, CONNECT4: renderConnect4Game };
    if (renderActive[activeMode]) renderActive[activeMode]();
    renderPlayersRoster();
    renderMyProperties();
    renderMoneyEvents();
    renderAuction();
    renderMatchSummary();
    renderChat();
    renderInspector(selectedTileIndex);
    if (!document.getElementById('prop-modal').classList.contains('hidden')) openPropertyModal(selectedTileIndex);
  }

  function renderMonopolyBoard() {
    const sub20 = document.getElementById('corner-sub-20');
    if (sub20) sub20.textContent = 'Bezpłatny parking';

    BOARD_TILES.forEach(tile => {
      const prop = gameState.properties[tile.index];
      const capEl = document.getElementById('cap-' + tile.index);
      const bannerEl = document.getElementById('houses-banner-' + tile.index);
      const cellEl = document.querySelector(`.board-tile[data-index="${tile.index}"]`);

      if (capEl && prop) {
        if (prop.ownerId) {
          const owner = getPlayerById(prop.ownerId);
          capEl.classList.remove('hidden');
          capEl.style.background = owner ? owner.color : '#888';
          capEl.textContent = prop.mortgaged ? '🔒' : (prop.level === 5 ? '🏨' : (prop.level > 0 ? `🏠${prop.level}` : '✓'));
          if (cellEl && owner) cellEl.style.borderColor = owner.color;
        } else {
          capEl.classList.add('hidden');
          if (cellEl) cellEl.style.borderColor = '';
        }
      }

      if (bannerEl && prop) {
        if (prop.level === 5) {
          bannerEl.className = 'tile-houses-banner hotel-banner';
          bannerEl.textContent = '🏨 HOTEL';
        } else if (prop.level > 0) {
          bannerEl.className = 'tile-houses-banner';
          bannerEl.textContent = '🏠'.repeat(prop.level);
        } else {
          bannerEl.className = 'tile-houses-banner hidden';
        }
      }

      if (cellEl && prop) cellEl.classList.toggle('mortgaged-tile', !!prop.mortgaged);

      const tokenBox = document.getElementById('tokens-' + tile.index);
      if (tokenBox) {
        tokenBox.innerHTML = '';
        gameState.players.filter(p => !p.bankrupt && p.position === tile.index).forEach(p => {
          const tok = document.createElement('div');
          tok.className = 'custom-pawn-token';
          tok.style.background = p.color;
          tok.title = p.name;
          tok.innerHTML = getAvatarSvg(p.avatar);
          tokenBox.appendChild(tok);
        });
      }
    });
    renderBoardHighlights();
  }

  function renderBoardHighlights() {
    document.querySelectorAll('.board-tile').forEach(el => el.classList.toggle('selected-tile', Number(el.dataset.index) === selectedTileIndex));
  }

  function renderCenterHUD() {
    const active = currentTurnPlayer(); if (!active) return;
    document.getElementById('hud-round').textContent = `Runda ${gameState.round}${gameState.roundLimit ? ' / ' + gameState.roundLimit : ''}`;
    document.getElementById('die-box-1').dataset.val = gameState.lastDice[0];
    document.getElementById('die-box-2').dataset.val = gameState.lastDice[1];
    const stock = monopoly.buildingStock(gameState);
    document.getElementById('hud-build-quota').textContent = `Bank: ${stock.houses} domów · ${stock.hotels} hoteli`;
    const debt = gameState.debt, debtor = debt ? getPlayerById(debt.playerId) : null;
    const debtEl = document.getElementById('debt-warning-banner');
    debtEl.classList.toggle('hidden', !debt);
    if (debt && debtor) debtEl.textContent = `${debtor.name} musi zapłacić $${debt.amount}. Brakuje $${Math.max(0, debt.amount - debtor.cash)}. Sprzedaj budynki lub zastaw działki.`;
    const avatar = document.getElementById('playing-now-avatar');
    avatar.style.background = (debtor || active).color; avatar.innerHTML = getAvatarSvg((debtor || active).avatar);
    document.getElementById('playing-now-label').textContent = (debt && debtor) ? `Spłaca dług: ${debtor.name}` : `Tura: ${active.name}`;
    const phase = gameState.turnPhase, control = canControlTurn();
    document.getElementById('wait-turn-notice').classList.toggle('hidden', control || gameState.status === 'FINISHED');
    document.getElementById('wait-turn-notice').textContent = active.isBot ? `🤖 ${active.name} planuje ruch…` : `Czekasz na ruch: ${active.name}`;
    document.getElementById('action-buttons-wrap').classList.toggle('hidden', !control || !!debt || !!gameState.auction);
    const visible = (id, condition) => document.getElementById(id)?.classList.toggle('hidden', !condition);
    visible('btn-roll', phase === 'ROLL'); visible('btn-buy', phase === 'DECIDE'); visible('btn-auction', phase === 'DECIDE'); visible('btn-end-turn', phase === 'END');
    const tile = BOARD_TILES[active.position];
    const buy = document.getElementById('btn-buy'); buy.textContent = `Kup za $${tile.price || 0}`; buy.disabled = active.cash < (tile.price || 0) || syncBusy;
    document.getElementById('btn-end-turn').textContent = gameState.extraRoll ? '🎲 Dodatkowy rzut' : 'Zakończ turę →';
    const buildable = BOARD_TILES.find(t => canUpgradeProperty(t.index, active.id).ok);
    visible('btn-build-quick', !!buildable && phase !== 'DECIDE');
    if (buildable) document.getElementById('btn-build-quick').textContent = `🏠 Buduj: ${buildable.shortName}`;
    visible('btn-sell-emergency', !!debt || active.cash < 100);
    visible('btn-jail-pay', active.inJail && phase === 'ROLL' && active.cash >= 50);
    visible('btn-jail-card', active.inJail && phase === 'ROLL' && active.pardonCards > 0);
    const card = document.getElementById('center-card-alert'); card.classList.toggle('hidden', !gameState.lastCard);
    if (gameState.lastCard) card.textContent = gameState.lastCard.text;
    document.getElementById('center-feed-log').innerHTML = gameState.feed.slice(0, 4).map(x => `<div class="feed-line">${safeRichText(x.text)}</div>`).join('');
    const hint = document.getElementById('turn-hint');
    const hints = { ROLL: active.inJail ? 'Izba OUG: dublet, karta lub kaucja $50.' : 'Rzuć kostkami i ruszaj po swoje dzielnice.', DECIDE: 'Wolna działka. Kupujesz czy oddajesz na licytację?', END: gameState.extraRoll ? 'Dublet! Możesz rzucić ponownie.' : 'Zarządzaj dzielnicami lub zakończ turę.', AUCTION: 'Trwa wspólna licytacja działki.', DEBT: 'Rozlicz dług w panelu „Twoje dzielnice”.', FINISHED: 'Mecz zakończony. Sprawdź podium lub zagraj rewanż.' };
    if (hint) hint.textContent = hints[phase] || '';
    document.getElementById('btn-bankrupt').disabled = gameState.activeGame !== 'MONOPOLY' || gameState.status !== 'PLAYING' || !!gameState.auction || (gameState.isOnline && (debt?.playerId || active.id) !== myOnlinePlayerId);
  }

  function renderPlayersRoster() {
    const viewer = getMyViewerPlayer();
    const idBadge = document.getElementById('my-identity-badge');
    if (idBadge && viewer) {
      idBadge.textContent = `Ty: ${viewer.name}`;
      idBadge.style.borderColor = viewer.color;
    }

    const rosterEl = document.getElementById('players-roster');
    if (rosterEl) {
      rosterEl.innerHTML = gameState.players.map((p, idx) => {
        const airCnt = AIRPORT_INDICES.filter(i => gameState.properties[i]?.ownerId === p.id).length;
        const teamLabel = isTeamMode2v2() ? ((idx % 2 === 0) ? ' • Druż. A' : ' • Druż. B') : (idx < 2 && ['QUORIDOR','CHECKERS','CHESS','CONNECT4'].includes(gameState.activeGame) ? ' • 1v1' : '');
        return `
          <div class="roster-player-row ${idx === gameState.turnIndex ? 'is-active' : ''} ${p.bankrupt ? 'is-bankrupt' : ''}" style="border-left-color:${p.color}">
            <div class="roster-left">
              <div class="roster-avatar" style="background:${p.color}">${getAvatarSvg(p.avatar)}</div>
              <div>
                <div class="roster-name-title">${escapeHTML(p.name)} ${p.id === viewer?.id ? '(Ty)' : ''} ${p.isBot ? '🤖' : ''}</div>
                <div class="roster-meta-sub">${p.bankrupt ? 'Bankrut' : BOARD_TILES[p.position]?.shortName || 'START'}${gameState.activeGame === 'MONOPOLY' ? '' : teamLabel} ${airCnt > 0 ? `• ✈️×${airCnt}` : ''}</div>
              </div>
            </div>
            <div class="roster-money ${p.cash < 0 ? 'negative' : ''}">$${gameState.activeGame === 'MONOPOLY' ? p.cash : p.arcadeCash}</div>
          </div>
        `;
      }).join('');
    }
  }

  function renderMyProperties() {
    const viewer = getMyViewerPlayer(), listEl = document.getElementById('my-properties-scroll');
    if (!viewer || !listEl) { if (listEl) listEl.textContent = 'Dołącz do pokoju, aby zobaczyć swój majątek.'; return; }
    const owned = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === viewer.id);
    document.getElementById('my-props-header-text').textContent = `Majątek: ${viewer.name} (${owned.length})`;
    document.getElementById('my-networth-badge').textContent = `$${monopoly.netWorth(gameState, viewer.id)}`;
    listEl.innerHTML = owned.length ? owned.map(t => {
      const pr = gameState.properties[t.index], build = canUpgradeProperty(t.index, viewer.id), sale = monopoly.sellCheck(gameState, t.index, viewer.id), mort = monopoly.mortgageCheck(gameState, t.index, viewer.id);
      const canManage = gameState.status === 'PLAYING' && !gameState.auction && (gameState.debt?.playerId || currentTurnPlayer().id) === viewer.id;
      return `<div class="owned-prop-item" data-open-idx="${t.index}">
        <div class="owned-prop-left"><span class="owned-dot" style="background:${GROUPS[t.group].color}"></span><div><span class="owned-name">${t.shortName}</span><small class="property-meta">${pr.mortgaged ? '🔒 Zastawiona' : t.type === 'PROPERTY' ? (pr.level === 5 ? '🏨 Hotel' : pr.level + ' / 4 domów') : t.type === 'AIRPORT' ? '✈️ Lotnisko' : '⚡ Zakład'}</small></div></div>
        <div class="owned-prop-right">${build.ok ? `<button class="btn-quick-up" data-build-idx="${t.index}" aria-label="Zbuduj na ${t.shortName}">+🏠 $${t.buildCost}</button>` : ''}
        ${pr.level > 0 ? `<button class="btn-quick-sell" data-sell-house-idx="${t.index}" ${!canManage || !sale.ok ? 'disabled' : ''}>−🏠</button>` : `<button class="btn-quick-sell" data-mortgage-idx="${t.index}" ${!canManage || !mort.ok ? 'disabled' : ''}>${pr.mortgaged ? 'Spłać $' + Math.ceil(t.price * .55) : 'Zastaw +$' + Math.floor(t.price / 2)}</button>`}</div></div>`;
    }).join('') : '<div class="empty-state">🏘️<p>Brak własnych działek.</p><small>Zbierz kolor, aby budować domy.</small></div>';
    listEl.querySelectorAll('[data-open-idx]').forEach(row => { row.onclick = e => { if (!e.target.closest('button')) openPropertyModal(Number(row.dataset.openIdx)); }; });
    listEl.querySelectorAll('[data-build-idx]').forEach(btn => { btn.onclick = () => buildHouseOnProperty(Number(btn.dataset.buildIdx), viewer.id); });
    listEl.querySelectorAll('[data-sell-house-idx]').forEach(btn => { btn.onclick = () => sellHouseOnProperty(Number(btn.dataset.sellHouseIdx), viewer.id); });
    listEl.querySelectorAll('[data-mortgage-idx]').forEach(btn => { btn.onclick = () => toggleMortgageProperty(Number(btn.dataset.mortgageIdx), viewer.id); });
  }

  function renderInspector(index) {
    const t = BOARD_TILES[index]; if (!t) return;
    const prop = gameState.properties[index], owner = getPlayerById(prop?.ownerId);
    document.getElementById('spotlight-tag').textContent = t.group ? GROUPS[t.group].name : 'POLE SPECJALNE';
    document.getElementById('spotlight-title').textContent = t.name;
    document.getElementById('spotlight-content').innerHTML = prop ? `<div class="spot-grid"><div class="spot-stat"><span>Wartość</span><strong>$${t.price}</strong></div><div class="spot-stat"><span>Właściciel</span><strong>${owner ? escapeHTML(owner.name) : 'Bank'}</strong></div><div class="spot-stat"><span>Czynsz</span><strong>$${calculateRent(index)}</strong></div><div class="spot-stat"><span>Zastaw</span><strong>$${Math.floor(t.price / 2)}</strong></div></div>` : `<p style="font-size:0.65rem;color:var(--text-muted);">${escapeHTML(t.subtitle || 'Pole specjalne')}</p>`;
  }

  function openPropertyModal(index) {
    selectedTileIndex = index;
    const t = BOARD_TILES[index], prop = gameState.properties[index], viewer = getMyViewerPlayer();
    renderBoardHighlights(); renderInspector(index);
    if (!t || !prop) { showToast(t.name + '. ' + (t.subtitle || '')); return; }
    const owner = getPlayerById(prop.ownerId), modal = document.getElementById('prop-modal');
    document.getElementById('prop-modal-banner').style.background = `linear-gradient(125deg, ${GROUPS[t.group].color}, #162b2d)`;
    document.getElementById('prop-modal-group').textContent = GROUPS[t.group].name;
    document.getElementById('prop-modal-name').textContent = t.name;
    document.getElementById('pm-price').textContent = '$' + t.price;
    document.getElementById('pm-owner').textContent = owner?.name || 'Bank';
    document.getElementById('pm-level').textContent = prop.mortgaged ? 'Zastawiona' : t.type === 'PROPERTY' ? (prop.level === 5 ? 'Hotel' : prop.level + ' / 4 domów') : t.type === 'AIRPORT' ? 'Lotnisko' : 'Zakład';
    document.getElementById('pm-rent').textContent = '$' + calculateRent(index);
    document.getElementById('pm-build-cost').textContent = t.buildCost ? '$' + t.buildCost : '—';
    const tbody = document.getElementById('pm-rent-tbody');
    if (t.type === 'PROPERTY') tbody.innerHTML = t.rents.map((r, n) => `<tr class="${prop.level === n ? 'current-lvl-row' : ''}"><td>${['Działka', '1 dom', '2 domy', '3 domy', '4 domy', 'Hotel'][n]}</td><td>${n === 5 ? '🏨' : n ? '🏠'.repeat(n) : '—'}</td><td>$${r}${n === 0 ? ' / $' + (r * 2) + ' za komplet' : ''}</td></tr>`).join('');
    else if (t.type === 'AIRPORT') tbody.innerHTML = t.rents.map((r, n) => `<tr><td>${n + 1} lotnisk(a)</td><td>✈️</td><td>$${r}</td></tr>`).join('');
    else tbody.innerHTML = '<tr><td>1 zakład</td><td>⚡</td><td>4 × suma kostek</td></tr><tr><td>2 zakłady</td><td>⚡⚡</td><td>10 × suma kostek</td></tr>';
    const id = viewer?.id, manage = viewer && gameState.status === 'PLAYING' && !gameState.auction && !viewer.bankrupt && (gameState.debt?.playerId || currentTurnPlayer().id) === id;
    const build = canUpgradeProperty(index, id), sell = monopoly.sellCheck(gameState, index, id), mortgage = monopoly.mortgageCheck(gameState, index, id);
    document.getElementById('pm-status-note').textContent = prop.ownerId === id ? (gameState.debt ? 'Spłać dług: sprzedaj budynki lub zastaw działki.' : build.reason) : 'Cudza działka pozostaje własnością jej właściciela. Płacisz tylko należny czynsz.';
    const bind = (name, allowed, fn) => { const b = document.getElementById(name); b.disabled = !allowed; b.onclick = async () => { if (await fn()) openPropertyModal(index); }; };
    bind('btn-pm-build', manage && build.ok, () => buildHouseOnProperty(index, id));
    bind('btn-pm-sell', manage && sell.ok, () => sellHouseOnProperty(index, id));
    bind('btn-pm-sell-group', manage && prop.ownerId === id && prop.level > 0, () => commitMonopoly('SELL_GROUP', { index }, id));
    bind('btn-pm-mortgage', manage && mortgage.ok, () => toggleMortgageProperty(index, id));
    document.getElementById('btn-pm-mortgage').textContent = prop.mortgaged ? `Spłać hipotekę $${Math.ceil(t.price * .55)}` : `Zastaw działkę +$${Math.floor(t.price / 2)}`;
    document.getElementById('pm-history-list').innerHTML = prop.history.map(h => '<li>' + escapeHTML(h) + '</li>').join('');
    modal.classList.remove('hidden');
  }

  function renderMatchSummary() {
    const alive = gameState.players.filter(p => !p.bankrupt);
    const leader = [...alive].sort((a, b) => monopoly.netWorth(gameState, b.id) - monopoly.netWorth(gameState, a.id))[0];
    const viewer = getMyViewerPlayer();
    document.getElementById('summary-balance').textContent = '$' + (viewer?.cash ?? 0).toLocaleString('pl-PL');
    document.getElementById('summary-active').textContent = alive.length + ' / ' + gameState.players.length;
    document.getElementById('summary-leader').textContent = leader?.name || '—';
    const curPos = (gameState.debt ? getPlayerById(gameState.debt.playerId) : currentTurnPlayer())?.position || 0;
    document.getElementById('mobile-field-name').textContent = BOARD_TILES[curPos]?.shortName || 'START';
    document.getElementById('summary-mode').textContent = gameState.roundLimit ? gameState.roundLimit + ' rund' : 'Klasyczny';
    const progress = document.getElementById('round-progress');
    progress.style.width = (gameState.status === 'FINISHED' ? 100 : gameState.roundLimit ? Math.min(100, (gameState.round - 1) / gameState.roundLimit * 100) : 0) + '%';
    const rows = document.getElementById('district-collection');
    if (rows && viewer) rows.innerHTML = Object.entries(GROUPS).filter(([k]) => !['AIRPORT', 'UTILITY'].includes(k)).map(([k, g]) => {
      const all = BOARD_TILES.filter(t => t.group === k), count = all.filter(t => gameState.properties[t.index]?.ownerId === viewer.id).length;
      return `<div class="collection-cell ${count === all.length ? 'complete' : ''}" title="${g.name}" style="--district:${g.color}"><span>${g.code}</span><strong>${count}/${all.length}</strong></div>`;
    }).join('');
    document.getElementById('btn-show-ledger').classList.toggle('has-new', !!gameState.debt);
  }

  function renderMoneyEvents() {
    if (eventGameId !== gameState.gameId) { eventGameId = gameState.gameId; lastEventSequence = gameState.eventSequence || 0; }
    const recent = (gameState.moneyEvents || []).filter(e => e.sequence > lastEventSequence);
    recent.forEach(e => paymentQueueUI.push(e));
    lastEventSequence = Math.max(lastEventSequence, gameState.eventSequence || 0);
    if (!paymentUIBusy) showNextPayment();
    const ledger = document.getElementById('money-ledger');
    ledger.innerHTML = (gameState.moneyEvents || []).slice(-10).reverse().map(e => `<div class="ledger-row"><span>${escapeHTML(getPlayerById(e.fromId)?.name || 'Bank')} → ${escapeHTML(getPlayerById(e.toId)?.name || 'Bank')}<small>${escapeHTML(e.reason)}</small></span><strong class="${e.status === 'DUE' ? 'negative' : ''}">${e.status === 'DUE' ? 'Dług ' : ''}$${e.amount}</strong></div>`).join('') || '<p class="muted">Tu pojawią się rozliczenia partii.</p>';
  }

  let paymentDismissTimer;
  function showNextPayment() {
    if (!paymentQueueUI.length) { paymentUIBusy = false; return; }
    paymentUIBusy = true;
    const e = paymentQueueUI.shift(), from = getPlayerById(e.fromId)?.name || 'Bank', to = getPlayerById(e.toId)?.name || 'Bank';
    const overlay = document.getElementById('payment-overlay');
    overlay.className = 'payment-overlay ' + (e.status === 'DUE' ? 'payment-due' : 'payment-paid');
    document.getElementById('payment-eyebrow').textContent = e.status === 'DUE' ? 'WYMAGANA PŁATNOŚĆ' : 'ROZLICZENIE';
    document.getElementById('payment-amount').textContent = '$' + e.amount.toLocaleString('pl-PL');
    document.getElementById('payment-description').textContent = e.status === 'DUE' ? `${from} musi zapłacić: ${to}. Sprzedaj budynki lub zastaw działki.` : `${from} płaci → ${to}`;
    document.getElementById('payment-reason').textContent = e.reason;
    document.getElementById('payment-icon').textContent = e.status === 'DUE' ? '⚠' : e.fromId === 'BANK' ? '↗' : '↔';
    sfx.rent();
    clearTimeout(paymentDismissTimer); paymentDismissTimer = setTimeout(dismissPayment, e.status === 'DUE' ? 4000 : 2400);
  }

  function dismissPayment() {
    clearTimeout(paymentDismissTimer); document.getElementById('payment-overlay').classList.add('hidden');
    paymentUIBusy = false; if (paymentQueueUI.length) setTimeout(showNextPayment, 160);
  }

  function renderAuction() {
    const modal = document.getElementById('auction-modal'), a = gameState.auction;
    modal.classList.toggle('hidden', !a || gameState.activeGame !== 'MONOPOLY');
    if (!a) return;
    document.getElementById('auc-title').textContent = BOARD_TILES[a.tileIndex]?.name || 'Działka';
    document.getElementById('auc-current-bid').textContent = '$' + a.highBid;
    document.getElementById('auc-leader-name').textContent = a.leaderId ? 'Prowadzi: ' + getPlayerById(a.leaderId)?.name : 'Brak ofert — zaczynamy od $1';
    const select = document.getElementById('auc-bidder-select'), previous = select.value;
    const eligible = gameState.players.filter(p => !p.bankrupt && !p.isBot && !a.passed.includes(p.id) && p.id !== a.leaderId && (!gameState.isOnline || p.id === myOnlinePlayerId));
    select.innerHTML = eligible.map(p => `<option value="${p.id}">${escapeHTML(p.name)} · $${p.cash}</option>`).join('');
    if (eligible.some(p => p.id === previous)) select.value = previous;
    select.disabled = gameState.isOnline || !eligible.length;
    document.getElementById('auction-wait').textContent = eligible.length ? 'Podbij lub spasuj. Po spasowaniu nie wracasz do tej licytacji.' : 'Czekasz na oferty pozostałych graczy…';
    document.querySelectorAll('.btn-auc-add').forEach(b => { b.disabled = !eligible.length || syncBusy; });
    document.getElementById('btn-auc-pass').disabled = !eligible.length || syncBusy;
  }

  function renderChat() {
    const stream = document.getElementById('chat-stream');
    if (!stream) return;
    stream.innerHTML = gameState.chat.map(m => `
      <div class="chat-bubble-row">
        <span class="player-pawn-inline" style="background:${/^#[0-9a-f]{6}$/i.test(m.color || '') ? m.color : '#549f8b'};width:14px;height:14px;flex-shrink:0;margin-top:2px;"></span>
        <div class="chat-msg-bubble"><span class="chat-msg-author">${escapeHTML(m.author)} • ${escapeHTML(m.time)}</span><div>${escapeHTML(m.text)}</div></div>
      </div>
    `).join('');
    stream.scrollTop = stream.scrollHeight;
  }

  async function sendChatMessage(text) {
    if (!text.trim() || !gameState) return;
    const sender = getMyViewerPlayer(); if (!sender) return;
    const message = { author: sender.name, color: sender.color, text: text.trim().slice(0, 140), time: nowTime() };
    gameState.chat.push(message);
    gameState.chat = gameState.chat.slice(-80);
    await pushStateSync();
  }

  /* ==================== LOBBY Z UNIKALNYMI KOLORAMI ==================== */
  function ensureUniqueLobbyColors() {
    const used = [localPickedColor];
    lobbyOpponents.forEach(o => {
      if (!o.color || used.includes(o.color)) {
        o.color = getFirstAvailableColor(used);
      }
      used.push(o.color);
    });
  }

  function renderLobbySetup() {
    ensureUniqueLobbyColors();

    const mapCardsEl = document.getElementById('lobby-map-cards');
    if (mapCardsEl) {
      mapCardsEl.innerHTML = RUDA_MAPS.map(m => `
        <div class="map-thumb-card ${m.id === selectedMapId ? 'active' : ''}" data-map-id="${m.id}" style="background-image:url('${m.photoUrl}'), ${m.fallbackGradient}">
          <span>${m.shortTitle}</span>
        </div>
      `).join('');
      mapCardsEl.querySelectorAll('.map-thumb-card').forEach(card => {
        card.onclick = () => {
          applyMapTheme(card.dataset.mapId);
          if (gameState) { gameState.mapId = card.dataset.mapId; pushStateSync(); }
        };
      });
    }

    const localPicker = document.getElementById('local-color-picker');
    if (localPicker) {
      localPicker.innerHTML = PLAYER_COLORS.map(c => `<button type="button" class="color-dot-pick ${c.hex === localPickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}" title="${c.name}"></button>`).join('');
      localPicker.querySelectorAll('.color-dot-pick').forEach(btn => {
        btn.onclick = () => {
          localPickedColor = btn.dataset.hex;
          ensureUniqueLobbyColors();
          renderLobbySetup();
        };
      });
    }

    const localAvPicker = document.getElementById('local-avatar-picker');
    if (localAvPicker) {
      localAvPicker.innerHTML = PAWN_AVATARS.map(a => `<button type="button" class="avatar-pick-btn ${a.id === localPickedAvatar ? 'active' : ''}" data-av="${a.id}" title="${a.name}">${a.svg}</button>`).join('');
      localAvPicker.querySelectorAll('.avatar-pick-btn').forEach(btn => { btn.onclick = () => { localPickedAvatar = btn.dataset.av; renderLobbySetup(); }; });
    }

    const onlinePicker = document.getElementById('online-color-picker');
    if (onlinePicker) {
      const takenOnline = (gameState && gameState.isOnline)
        ? gameState.players.filter(p => p.clientToken !== myClientToken).map(p => p.color)
        : [];
      onlinePicker.innerHTML = PLAYER_COLORS.map(c => {
        const isTaken = takenOnline.includes(c.hex);
        return `<button type="button" class="color-dot-pick ${c.hex === onlinePickedColor ? 'active' : ''}" style="background:${c.hex};${isTaken ? 'opacity:0.2;cursor:not-allowed;' : ''}" data-hex="${c.hex}" ${isTaken ? 'disabled title="Zajęty przez innego gracza"' : ''}></button>`;
      }).join('');
      onlinePicker.querySelectorAll('.color-dot-pick:not([disabled])').forEach(btn => {
        btn.onclick = () => { onlinePickedColor = btn.dataset.hex; renderLobbySetup(); };
      });
    }

    const onlineAvPicker = document.getElementById('online-avatar-picker');
    if (onlineAvPicker) {
      onlineAvPicker.innerHTML = PAWN_AVATARS.map(a => `<button type="button" class="avatar-pick-btn ${a.id === onlinePickedAvatar ? 'active' : ''}" data-av="${a.id}" title="${a.name}">${a.svg}</button>`).join('');
      onlineAvPicker.querySelectorAll('.avatar-pick-btn').forEach(btn => { btn.onclick = () => { onlinePickedAvatar = btn.dataset.av; renderLobbySetup(); }; });
    }

    const oppBox = document.getElementById('local-opponents-list');
    if (oppBox) {
      oppBox.innerHTML = lobbyOpponents.map((o, idx) => `
        <div class="opp-row">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="player-pawn-inline" style="background:${o.color};">${getAvatarSvg(o.avatar)}</span>
            <strong>${escapeHTML(o.name)}</strong>
            <span style="font-size:0.66rem;color:var(--text-muted);">(${o.isBot ? 'Bot AI' : 'Człowiek'})</span>
          </div>
          ${lobbyOpponents.length > 1 ? `<button type="button" class="btn-ghost" data-rm-opp="${idx}">Usuń</button>` : ''}
        </div>
      `).join('');
      oppBox.querySelectorAll('[data-rm-opp]').forEach(btn => {
        btn.onclick = () => { lobbyOpponents.splice(Number(btn.dataset.rmOpp), 1); renderLobbySetup(); };
      });
    }
  }

  function updateLobbyWaitingRoom() {
    if (!gameState || !currentRoomCode || currentRoomCode === 'LOKALNY') return;
    document.getElementById('room-waiting-box')?.classList.remove('hidden');
    const isHost = gameState.hostToken === myClientToken;
    document.getElementById('btn-room-add-bot').disabled = !isHost || !gameState.lobbyOpen;
    document.getElementById('btn-launch-room-game').disabled = !isHost || !gameState.lobbyOpen;
    const codeDisp = document.getElementById('lobby-room-code-display');
    if (codeDisp) codeDisp.textContent = currentRoomCode;
    const plBox = document.getElementById('lobby-room-players');
    if (plBox) {
      plBox.innerHTML = gameState.players.map(p => `
        <div class="btn-ghost" style="border-left:4px solid ${p.color};display:flex;align-items:center;gap:6px;">
          <span class="player-pawn-inline" style="background:${p.color};width:18px;height:18px;">${getAvatarSvg(p.avatar)}</span>
          <span>${escapeHTML(p.name)} ${p.isBot ? '🤖' : '👤'} ${p.clientToken === myClientToken ? '(Ty)' : ''}</span>
        </div>
      `).join('');
    }
  }

  function addOrReconnectPlayerToRoom(roomState, myName, myColor, myAvatar, tokenToUse = myClientToken) {
    roomState = normalizeState(roomState);
    const existing = roomState.players.find(p => p.clientToken === tokenToUse);
    if (existing) {
      existing.name = cleanName(myName);
      return roomState;
    }
    if (!roomState.lobbyOpen) throw new Error('Mecz już trwa.');
    if (roomState.players.length >= 6) throw new Error('Pokój ma komplet 6 graczy.');
    const color = roomState.players.some(p => p.color === myColor) ? getFirstAvailableColor(roomState.players.map(p => p.color)) : myColor;
    roomState.players.push({
      id: 'p' + (roomState.players.length + 1),
      clientToken: tokenToUse,
      name: cleanName(myName),
      color,
      avatar: myAvatar || 'cool',
      isBot: false,
      cash: roomState.startingCash || 1500,
      arcadeCash: 2000,
      position: 0,
      inJail: false,
      jailTurns: 0,
      pardonCards: 0,
      bankrupt: false
    });
    roomState.liars = createLiarsGameState(roomState.players);
    roomState.revision = (roomState.revision || 0) + 1;
    return roomState;
  }

  function showRankingModal() {
    if (!gameState) return;
    const getNetWorth = pl => monopoly.netWorth(gameState, pl.id);

    const sorted = [...gameState.players].sort((a, b) => {
      if (a.bankrupt !== b.bankrupt) return a.bankrupt ? 1 : -1;
      return getNetWorth(b) - getNetWorth(a);
    });

    const winner = sorted[0];
    const spot = document.getElementById('ranking-champion-spotlight');
    if (spot && winner) {
      spot.innerHTML = `
        <span class="champ-crown-icon" style="font-size:2rem;">👑</span>
        <h3 style="color:#ffca28;font-size:1.2rem;margin:4px 0;">Lider Monopoly: ${escapeHTML(winner.name)}</h3>
        <p style="font-size:0.8rem;color:var(--text-muted);">Łączny majątek: <strong>$${getNetWorth(winner)}</strong> (Gotówka: $${winner.cash})</p>
      `;
    }

    const tbody = document.getElementById('ranking-tbody');
    if (tbody) {
      tbody.innerHTML = sorted.map((p, idx) => {
        const airCnt = AIRPORT_INDICES.filter(i => gameState.properties[i]?.ownerId === p.id).length;
        return `
          <tr class="${idx === 0 ? 'top-winner-row' : ''}">
            <td><strong>#${idx + 1}</strong></td>
            <td style="display:flex;align-items:center;gap:7px;">
              <span class="player-pawn-inline" style="background:${p.color};width:18px;height:18px;">${getAvatarSvg(p.avatar)}</span>
              ${escapeHTML(p.name)} ${idx === 0 ? '👑' : ''} ${p.isBot ? '🤖' : ''}
            </td>
            <td>${p.bankrupt ? '❌ Bankrut' : `🟢 Aktywny • ✈️×${airCnt}`}</td>
            <td><strong>$${getNetWorth(p)}</strong> <small style="color:var(--text-muted);">($${p.cash})</small></td>
          </tr>
        `;
      }).join('');
    }
    document.getElementById('ranking-modal')?.classList.remove('hidden');
  }

  /* ==================== KSIĘGA ZASAD ==================== */
  function openRulesModal(initialTab = null) {
    const activeTab = initialTab || (gameState ? gameState.activeGame : 'MONOPOLY');
    const rulesData = {
      MONOPOLY: {
        title: '🏭 Monopoly Ruda Śląska',
        body: `<p><strong>Cel:</strong> zostań ostatnim wypłacalnym graczem lub miej największy majątek netto po limicie rund.</p>
          <p><strong>Zakupy i licytacje:</strong> kupujesz wolne pole po wejściu na nie. Odmowa zakupu uruchamia licytację dla wszystkich.</p>
          <p><strong>Budowanie:</strong> zbierz całą dzielnicę w jednym kolorze. W swojej turze buduj równomiernie na dowolnym jej polu.</p>`
      },
      LIARS: {
        title: '🃏 Szynk Kłamców',
        body: `<p><strong>Cel:</strong> pozbądź się wszystkich swoich kart jako pierwszy (+$500 do portfela gier).</p>`
      },
      CASINO: {
        title: '🌸 Kwiaciarnia Godula',
        body: `<p><strong>Cel:</strong> osiągnij wybrany cel majątkowy na stole ruletki (0–36) lub automacie 777.</p>`
      },
      QUORIDOR: {
        title: '🧱 Sztolnia Labirynt',
        body: `<p><strong>Cel:</strong> przeprowadź pionek na przeciwległy koniec planszy 9×9, stawiając ściany blokujące rywala. Przycisk u góry przełącza tryb <strong>1 vs 1</strong> oraz <strong>2 vs 2</strong>.</p>`
      },
      LUDO: {
        title: '🎲 Chińczyk',
        body: `<p><strong>Cel:</strong> wprowadź wszystkie 4 pionki z bazy do domku na środku.</p>`
      },
      CHECKERS: {
        title: '⚫ Warcaby',
        body: `<p><strong>Zasady:</strong> ruch po ciemnych polach na ukos. Przycisk u góry pozwala wybrać pojedynek <strong>1 vs 1</strong> (bez czekania na inne boty) lub <strong>2 vs 2 (Drużyny)</strong>.</p>`
      },
      CHESS: {
        title: '♟️ Szachy',
        body: `<p><strong>Zasady:</strong> zbicie Króla rywala kończy partię. Przycisk u góry pozwala wybrać pojedynek <strong>1 vs 1</strong> lub <strong>2 vs 2 (Drużyny)</strong>.</p>`
      },
      CONNECT4: {
        title: '🪙 4 w Rzędzie',
        body: `<p><strong>Zasady:</strong> ułóż 4 krążki swojego koloru w linii poziomej, pionowej lub ukośnej. Dostępny przełącznik <strong>1 vs 1 / 2 vs 2</strong>.</p>`
      }
    };

    const tabsHtml = Object.keys(rulesData).map(k => `
      <button type="button" class="btn-ghost rules-tab-btn" style="${k === activeTab ? 'background:var(--accent-gold);color:#111;font-weight:900;' : ''}" data-rtab="${k}">${rulesData[k].title.split(' ')[0]} ${k}</button>
    `).join('');

    const cur = rulesData[activeTab] || rulesData.MONOPOLY;
    showGenericModal(
      '❓ Księga Zasad — 8 Gier Ruda Śląska Arena',
      `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">${tabsHtml}</div>
       <div class="action-box" style="line-height:1.6;font-size:0.84rem;">
         <h3 style="color:var(--accent-gold);margin-bottom:6px;">${cur.title}</h3>
         ${cur.body}
       </div>`
    );

    document.querySelectorAll('.rules-tab-btn').forEach(btn => {
      btn.onclick = () => openRulesModal(btn.dataset.rtab);
    });
  }

  function showGenericModal(title, htmlContent) {
    const tEl = document.getElementById('generic-modal-title');
    const bEl = document.getElementById('generic-modal-body');
    if (tEl) tEl.textContent = title;
    if (bEl) bEl.innerHTML = htmlContent;
    document.getElementById('generic-modal')?.classList.remove('hidden');
  }

  /* ==================== 13. INICJALIZACJA ZDARZEŃ ==================== */
  function initEvents() {
    bindClick('btn-fullscreen', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });

    document.querySelectorAll('.mob-nav-btn').forEach(btn => {
      btn.onclick = () => {
        const tab = btn.dataset.mobTab;
        if (tab === 'ranking') { showRankingModal(); return; }
        if (tab === 'lobby') { document.getElementById('lobby-overlay').classList.remove('hidden'); return; }
        setMobileTab(tab);
      };
    });

    const controlAnchor = document.createComment('miejsce panelu sterowania');
    const controls = document.getElementById('monopoly-controls');
    controls.before(controlAnchor);
    const phoneQuery = window.matchMedia('(max-width: 700px)');
    const moveControls = () => {
      if (phoneQuery.matches) document.getElementById('mobile-action-dock').appendChild(controls);
      else controlAnchor.after(controls);
    };
    phoneQuery.addEventListener('change', moveControls);
    moveControls();

    bindClick('mobile-current-field', () => openPropertyModal((gameState.debt ? getPlayerById(gameState.debt.playerId) : currentTurnPlayer()).position));
    bindClick('btn-board-zoom', e => {
      const enlarged = document.getElementById('board-scroll').classList.toggle('zoomed');
      e.currentTarget.setAttribute('aria-pressed', String(enlarged));
      e.currentTarget.textContent = enlarged ? '⤡ Dopasuj' : '⤢ Powiększ';
    });
    bindClick('btn-payment-dismiss', dismissPayment);
    bindClick('btn-show-ledger', () => {
      setMobileTab('players');
      document.getElementById('ledger-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    bindClick('btn-resume-local', () => {
      try {
        const saved = JSON.parse(storage.getItem('ruda_local_save_v15'));
        if (!saved || saved.isOnline) throw new Error('Brak zgodnego zapisu.');
        saved.turnDeadline = serverNow() + 120000;
        if (saved.auction) saved.auction.deadline = serverNow() + 25000;
        subscribeToRoom('LOKALNY');
        acceptState(saved, true);
        document.getElementById('lobby-overlay').classList.add('hidden');
        showToast('Wznowiono zapisaną partię.');
      } catch (e) { showToast(e.message); }
    });

    window.addEventListener('keydown', e => {
      const modal = [...document.querySelectorAll('.modal-backdrop:not(.hidden)')].pop();
      if (e.key === 'Escape' && modal && modal.id !== 'auction-modal') {
        modal.classList.add('hidden');
        if (modal.id === 'lobby-overlay') scheduleMonopolyBot();
      }
      if (e.key === ' ' && !['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName) && !modal) {
        e.preventDefault();
        handleRollDice();
      }
    });

    bindClick('btn-show-ranking', showRankingModal);
    bindClick('btn-close-ranking', () => document.getElementById('ranking-modal')?.classList.add('hidden'));
    bindClick('btn-ranking-continue', () => document.getElementById('ranking-modal')?.classList.add('hidden'));
    bindClick('btn-ranking-rematch', () => {
      document.getElementById('ranking-modal')?.classList.add('hidden');
      document.getElementById('btn-reset-board')?.click();
    });

    bindClick('btn-toggle-theme', () => {
      document.body.classList.toggle('theme-light');
      document.body.classList.toggle('theme-dark');
      storage.setItem('ruda_theme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
    });

    document.querySelectorAll('.game-pick-card').forEach(card => {
      card.onclick = () => {
        document.querySelectorAll('.game-pick-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedGameMode = card.dataset.game;
      };
    });

    document.querySelectorAll('[data-switch-game]').forEach(btn => {
      btn.onclick = async () => {
        if (!gameState || syncBusy) return;
        if (gameState.isOnline && gameState.hostToken !== myClientToken) {
          showToast('Grę dla pokoju wybiera gospodarz.');
          return;
        }
        if (gameState.activeGame === 'MONOPOLY' && btn.dataset.switchGame !== 'MONOPOLY') gameState.monopolyPausedAt = serverNow();
        if (btn.dataset.switchGame === 'MONOPOLY' && gameState.monopolyPausedAt) {
          const pause = serverNow() - gameState.monopolyPausedAt;
          gameState.turnDeadline += pause;
          if (gameState.auction) gameState.auction.deadline += pause;
          gameState.monopolyPausedAt = null;
        }
        gameState.activeGame = btn.dataset.switchGame;
        await pushStateSync();
        checkBotForOtherGames();
      };
    });

    document.querySelectorAll('[data-rules-jump]').forEach(btn => {
      btn.onclick = () => openRulesModal(btn.dataset.rulesJump);
    });

    const triggerMapRoulette = () => {
      playMapRouletteAnimation((newMapId) => {
        if (gameState) { gameState.mapId = newMapId; pushStateSync(); }
      });
    };
    bindClick('btn-random-map', triggerMapRoulette);
    bindClick('btn-lobby-rand-map', triggerMapRoulette);

    document.querySelectorAll('.lobby-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.lobby-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.lobby-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
      };
    });

    bindClick('btn-save-firebase', () => {
      const val = document.getElementById('firebase-url-input')?.value;
      if (connectFirebaseDatabase(val)) {
        showToast('✅ Połączono z bazą Firebase!');
      }
    });

    const ensureFirebaseReady = () => {
      const typed = document.getElementById('firebase-url-input')?.value?.trim();
      if (typed) connectFirebaseDatabase(typed);
      if (!firebaseDb) {
        showToast('Najpierw wklej link do swojej bazy Firebase Realtime Database w Kroku 1!');
        setBannerStatus('❌ Brak podpiętego adresu Firebase w Kroku 1.', '#ff737d');
        return false;
      }
      return true;
    };

    const parseRoomCode = () => {
      const raw = document.getElementById('join-code-input')?.value?.trim().toUpperCase() || '';
      return raw.replace(/[^A-Z0-9-]/g, '').slice(0, 12);
    };

    bindClick('btn-create-room', async () => {
      if (syncBusy || !ensureFirebaseReady()) return;
      syncBusy = true;
      setBannerStatus('⏳ Tworzenie pokoju w bazie Firebase...', '#edc681');
      try {
        const code = parseRoomCode() || ('RUDA' + randomSeed().toString(36).slice(0, 4).toUpperCase());
        const myName = cleanName(document.getElementById('online-name-input')?.value || 'Hanys');
        const players = [{ id: 'p1', clientToken: myClientToken, name: myName, color: onlinePickedColor, avatar: onlinePickedAvatar, isBot: false }];
        const fresh = sanitizeForFirebase(createFreshGameState(players, 1500, code, true, selectedGameMode, selectedMapId));
        const ref = firebaseDb.ref('rooms/' + code);

        await ref.set(fresh);
        acceptState(fresh, true);
        subscribeToRoom(code);
        updateLobbyWaitingRoom();
        setBannerStatus(`✅ Pokój ${code} utworzony! Skopiuj link zaproszenia lub kliknij „Rozpocznij Mecz”.`, '#72d8bd');
        showToast(`Utworzono pokój: ${code}`);
      } catch (e) {
        networkError(e);
      } finally {
        syncBusy = false;
        if (gameState) { renderCenterHUD(); renderAuction(); }
      }
    });

    bindClick('btn-join-room', async () => {
      if (syncBusy || !ensureFirebaseReady()) return;
      syncBusy = true;
      try {
        const code = parseRoomCode();
        if (!code) throw new Error('Wpisz kod pokoju (np. RUDA500).');
        setBannerStatus(`⏳ Dołączanie do pokoju ${code}...`, '#edc681');
        const ref = firebaseDb.ref('rooms/' + code);
        const snap = await ref.once('value');
        const currentData = snap.val();
        if (!currentData) throw new Error(`Pokój „${code}” nie istnieje w tej bazie Firebase.`);

        const myName = document.getElementById('online-name-input')?.value || 'Górnik';
        const updatedRoom = sanitizeForFirebase(addOrReconnectPlayerToRoom(currentData, myName, onlinePickedColor, onlinePickedAvatar, myClientToken));
        await ref.set(updatedRoom);

        acceptState(updatedRoom, true);
        subscribeToRoom(code);
        updateLobbyWaitingRoom();
        if (gameState.lobbyOpen) document.getElementById('lobby-overlay').classList.remove('hidden');
        setBannerStatus(`✅ Dołączono do pokoju ${code} jako ${getMyViewerPlayer()?.name || myName}!`, '#72d8bd');
        showToast(`Dołączono do pokoju ${code}!`);
      } catch (e) {
        if (e.code) networkError(e);
        else {
          setBannerStatus('❌ ' + e.message, '#ff737d');
          showToast(e.message);
        }
      } finally {
        syncBusy = false;
        if (gameState) { renderCenterHUD(); renderAuction(); }
        scheduleMonopolyBot();
      }
    });

    bindClick('btn-room-add-bot', async () => {
      if (!gameState?.isOnline || gameState.hostToken !== myClientToken || !gameState.lobbyOpen || gameState.players.length >= 6 || syncBusy) return;
      const idx = gameState.players.length + 1;
      gameState.players.push({
        id: 'p' + idx,
        clientToken: '',
        name: 'Bot Górnik #' + idx,
        color: getFirstAvailableColor(gameState.players.map(p => p.color)),
        avatar: PAWN_AVATARS[idx % PAWN_AVATARS.length].id,
        isBot: true,
        cash: gameState.startingCash,
        arcadeCash: 2000,
        position: 0,
        inJail: false,
        jailTurns: 0,
        pardonCards: 0,
        bankrupt: false
      });
      gameState.liars = createLiarsGameState(gameState.players);
      await pushStateSync();
      updateLobbyWaitingRoom();
    });

    bindClick('btn-launch-room-game', async () => {
      if (!gameState?.isOnline || gameState.hostToken !== myClientToken || !gameState.lobbyOpen || syncBusy) return;
      if (gameState.players.length < 2) {
        showToast('Dodaj przynajmniej jednego Bota AI albo poczekaj na drugiego gracza!');
        return;
      }
      gameState.lobbyOpen = false;
      gameState.activeGame = selectedGameMode;
      gameState.turnDeadline = serverNow() + 120000;
      if (await pushStateSync()) {
        document.getElementById('lobby-overlay').classList.add('hidden');
        checkBotForOtherGames();
      }
    });

    const copyInvite = async () => {
      if (!gameState?.isOnline) { showToast('Najpierw utwórz pokój online.'); return; }
      const link = buildShareInviteLink(currentRoomCode);
      try {
        await navigator.clipboard.writeText(link);
        showToast('📋 Skopiowano link zaproszenia do pokoju ' + currentRoomCode + '!');
      } catch (e) {
        showGenericModal('Link do pokoju ' + currentRoomCode, `<p>Skopiuj poniższy link i wyślij znajomym:</p><input readonly value="${escapeHTML(link)}" onclick="this.select()" style="width:100%;margin-top:8px;" />`);
      }
    };
    bindClick('btn-copy-invite-lobby', copyInvite);
    bindClick('btn-copy-invite-top', copyInvite);

    bindClick('btn-add-bot', () => {
      if (lobbyOpponents.length >= 5) return;
      const used = [localPickedColor, ...lobbyOpponents.map(o => o.color)];
      lobbyOpponents.push({
        name: 'Bot KWK #' + (lobbyOpponents.length + 1),
        isBot: true,
        color: getFirstAvailableColor(used),
        avatar: PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id
      });
      renderLobbySetup();
    });

    bindClick('btn-add-human', () => {
      if (lobbyOpponents.length >= 5) return;
      const used = [localPickedColor, ...lobbyOpponents.map(o => o.color)];
      lobbyOpponents.push({
        name: `Gracz ${lobbyOpponents.length + 2}`,
        isBot: false,
        color: getFirstAvailableColor(used),
        avatar: PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id
      });
      renderLobbySetup();
    });

    bindClick('btn-start-local-game', () => {
      ensureUniqueLobbyColors();
      if (!lobbyOpponents.length) { showToast('Dodaj przynajmniej jednego bota lub drugiego gracza.'); return; }
      const mainName = cleanName(document.getElementById('local-name-input')?.value);
      const startCash = Number(document.getElementById('local-cash-select')?.value) || 1500;
      const allPlayers = [
        { id: 'p1', clientToken: myClientToken, name: mainName, color: localPickedColor, avatar: localPickedAvatar, isBot: false },
        ...lobbyOpponents.map((o, i) => ({ id: 'p' + (i + 2), name: o.name, color: o.color, avatar: o.avatar, isBot: o.isBot }))
      ];
      myOnlinePlayerId = null;
      isRollingLock = false;
      lastWinnerShown = null;
      document.getElementById('lobby-overlay')?.classList.add('hidden');

      playMapRouletteAnimation((pickedMapId) => {
        gameState = createFreshGameState(allPlayers, startCash, 'LOKALNY', false, selectedGameMode, pickedMapId);
        activePerspectiveId = 'p1';
        subscribeToRoom('LOKALNY');
        acceptState(gameState, true);
        saveLocalState();
        checkBotForOtherGames();
      });
    });

    bindClick('btn-roll', handleRollDice);
    bindClick('dice-stage', handleRollDice);
    bindClick('btn-buy', buyCurrentField);
    bindClick('btn-end-turn', endCurrentTurn);
    bindClick('btn-ludo-roll', rollLudoDice);
    bindClick('ludo-die', rollLudoDice);

    bindClick('btn-q-mode-move', () => { quoridorActionMode = 'MOVE'; renderQuoridorGame(); });
    bindClick('btn-q-mode-wall-h', () => { quoridorActionMode = 'WALL_H'; renderQuoridorGame(); });
    bindClick('btn-q-mode-wall-v', () => { quoridorActionMode = 'WALL_V'; renderQuoridorGame(); });

    bindClick('btn-build-quick', () => {
      const active = currentTurnPlayer(), t = BOARD_TILES.find(t => canUpgradeProperty(t.index, active.id).ok);
      if (t) openPropertyModal(t.index);
    });
    bindClick('btn-sell-emergency', () => { setMobileTab('players'); document.getElementById('side-panel-props')?.scrollIntoView({ behavior: 'smooth' }); });
    bindClick('btn-jail-pay', () => commitMonopoly('JAIL_PAY'));
    bindClick('btn-jail-card', () => commitMonopoly('JAIL_CARD'));

    bindClick('btn-liars-play', playLiarsCards);
    bindClick('btn-liars-call', callLiarOnLastPlay);
    bindClick('btn-liars-new-match', () => {
      if (!gameState) return;
      gameState.liars = createLiarsGameState(gameState.players);
      selectedLiarCardIds = [];
      pushStateSync();
      checkBotForOtherGames();
    });

    document.querySelectorAll('.casino-chip-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.casino-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCasinoChip = Number(btn.dataset.chip) || 25;
      };
    });
    const goalSel = document.getElementById('casino-target-select');
    if (goalSel) {
      goalSel.onchange = () => {
        if (gameState) { gameState.casinoGoal = Number(goalSel.value) || 5000; pushStateSync(); }
      };
    }
    bindClick('btn-clear-roulette-bets', clearRouletteBets);
    bindClick('btn-spin-roulette', spinFullGodulaRoulette);
    bindClick('btn-spin-slots', spinGodulaSlots);

    bindClick('btn-reset-board', async () => {
      if (!gameState || syncBusy) return;
      if (gameState.isOnline && gameState.hostToken !== myClientToken) { showToast('Rewanż rozpoczyna gospodarz pokoju.'); return; }
      if (gameState.activeGame === 'MONOPOLY') {
        const previous = gameState;
        gameState = createFreshGameState(previous.players, previous.startingCash || 1500, previous.roomCode, previous.isOnline, 'MONOPOLY', previous.mapId);
        gameState.roundLimit = previous.roundLimit;
        gameState.twoPlayerMode = previous.twoPlayerMode || '1V1';
        gameState.lobbyOpen = false;
        gameState.hostToken = previous.hostToken;
        if (previous.isOnline && firebaseRoomRef) {
          gameState.revision = (previous.revision || 0) + 1;
          await pushStateSync();
          return;
        }
        acceptState(gameState, true);
        saveLocalState();
        return;
      }
      if (gameState.activeGame === 'LIARS') gameState.liars = createLiarsGameState(gameState.players);
      if (gameState.activeGame === 'QUORIDOR') gameState.quoridor = createQuoridorState();
      if (gameState.activeGame === 'LUDO') gameState.ludo = createLudoState();
      if (gameState.activeGame === 'CHECKERS') gameState.checkers = createCheckersState();
      if (gameState.activeGame === 'CHESS') gameState.chess = createChessState();
      if (gameState.activeGame === 'CONNECT4') gameState.connect4 = createConnect4State();
      await pushStateSync();
      checkBotForOtherGames();
    });

    bindClick('btn-bankrupt', () => {
      const viewer = getMyViewerPlayer();
      if (viewer && confirm(`Zakończyć udział gracza ${viewer.name}? Pozostały majątek zostanie rozliczony.`)) declareBankruptcy(viewer.id);
    });
    bindClick('btn-auction', () => commitMonopoly('DECLINE'));
    document.querySelectorAll('.btn-auc-add').forEach(btn => {
      btn.onclick = () => {
        const a = gameState.auction, id = document.getElementById('auc-bidder-select').value;
        if (a && id) commitMonopoly('BID', { amount: a.highBid === 0 && Number(btn.dataset.inc) === 1 ? 1 : a.highBid + Number(btn.dataset.inc) }, id);
      };
    });
    bindClick('btn-auc-pass', () => { const id = document.getElementById('auc-bidder-select').value; if (id) commitMonopoly('PASS', {}, id); });

    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        const inp = document.getElementById('chat-text-input');
        if (inp) { sendChatMessage(inp.value); inp.value = ''; }
      };
    }
    document.querySelectorAll('.emoji-chip').forEach(btn => { btn.onclick = () => sendChatMessage(btn.dataset.emoji); });

    bindClick('btn-open-lobby', () => document.getElementById('lobby-overlay')?.classList.remove('hidden'));
    bindClick('btn-close-lobby', () => { document.getElementById('lobby-overlay').classList.add('hidden'); scheduleMonopolyBot(); });
    bindClick('btn-toggle-sound', (e) => { sfx.enabled = !sfx.enabled; e.currentTarget.textContent = sfx.enabled ? '🔊' : '🔇'; });
    bindClick('btn-open-rules', () => openRulesModal());

    bindClick('btn-close-prop-modal', () => document.getElementById('prop-modal')?.classList.add('hidden'));
    bindClick('btn-close-generic', () => document.getElementById('generic-modal')?.classList.add('hidden'));

    if (turnTimerInterval) clearInterval(turnTimerInterval);
    turnTimerInterval = setInterval(() => {
      if (!gameState || gameState.activeGame !== 'MONOPOLY' || gameState.lobbyOpen || gameState.status !== 'PLAYING') return;
      if (!gameState.isOnline && !document.getElementById('lobby-overlay').classList.contains('hidden')) {
        gameState.turnDeadline += 1000;
        if (gameState.auction) gameState.auction.deadline += 1000;
        return;
      }
      const now = serverNow(), deadline = gameState.auction?.deadline || gameState.turnDeadline;
      const left = Math.max(0, Math.ceil((deadline - now) / 1000));
      const timer = document.getElementById('hud-timer');
      timer.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
      timer.classList.toggle('timer-urgent', left <= 15);
      document.getElementById('auc-time-left').textContent = left + ' s';
      if (left === 0 && !syncBusy && isBotController()) {
        const actor = gameState.isOnline ? myOnlinePlayerId : gameState.players.find(p => !p.bankrupt)?.id;
        commitMonopoly('TICK', {}, actor, true);
      }
    }, 1000);
  }

  function setMobileTab(tab) {
    document.body.dataset.mobileView = tab === 'chat' ? 'chat' : tab === 'players' ? 'players' : 'board';
    document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.mobTab === tab));
  }

  window.addEventListener('DOMContentLoaded', () => {
    if (storage.getItem('ruda_theme') === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    }
    buildMonopolyBoardDOM();
    buildRouletteFeltGrid();
    inject2PModeToggleButtons();
    applyMapTheme(selectedMapId);
    renderLobbySetup();
    initEvents();

    const params = new URLSearchParams(window.location.search);
    const dbParam = params.get('db');
    const savedFb = storage.getItem('ruda_firebase_url');

    if (dbParam) { try { connectFirebaseDatabase(atob(dbParam)); } catch (e) {} }
    else if (HARDCODED_FIREBASE_URL) connectFirebaseDatabase(HARDCODED_FIREBASE_URL);
    else if (savedFb) connectFirebaseDatabase(savedFb);

    gameState = createFreshGameState([
      { id: 'p1', clientToken: myClientToken, name: 'Sztygar', color: PLAYER_COLORS[0].hex, avatar: localPickedAvatar, isBot: false },
      ...lobbyOpponents.map((o, i) => ({ id: 'p' + (i + 2), name: o.name, color: o.color, avatar: o.avatar, isBot: o.isBot }))
    ], 1500, 'LOKALNY', false, 'MONOPOLY', selectedMapId);
    acceptedState = copy(gameState);
    renderAll();
    document.getElementById('btn-resume-local').classList.toggle('hidden', !storage.getItem('ruda_local_save_v15'));

    const roomParam = params.get('room');
    if (roomParam && roomParam.toUpperCase() !== 'LOKALNY') {
      document.getElementById('lobby-overlay').classList.remove('hidden');
      document.querySelector('[data-tab="online"]')?.click();
      const jInp = document.getElementById('join-code-input');
      if (jInp) jInp.value = roomParam.toUpperCase();
    }
  });
})();
