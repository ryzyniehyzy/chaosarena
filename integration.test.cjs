const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const board = require('../board-data.js');
const engineModule = require('../monopoly-engine.js');
const engine = engineModule.createEngine(board);
const appSource = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const clone = x => JSON.parse(JSON.stringify(x));
function state(online = true) {
  const properties = {}; board.BOARD_TILES.filter(t => t.price).forEach(t => { properties[t.index] = { ownerId: null, level: 0, mortgaged: false, history: [] }; });
  const s = engine.initialize({ roomCode: online ? 'TEST123' : 'LOKALNY', isOnline: online, activeGame: 'MONOPOLY', mapId: 'KAUFHAUS', lobbyOpen: false,
    players: [{ id: 'p1', name: 'Ala', clientToken: 'clientA', isBot: false, color: '#ff7849', avatar: 'helmet' }, { id: 'p2', name: 'Kuba', clientToken: 'clientB', isBot: false, color: '#00e5ff', avatar: 'cool' }],
    properties, feed: [], chat: [], trades: [] }, { gameId: 'integration', now: 1793260800000, seed: 2, roundLimit: 20 });
  s.hostToken = 'clientA'; return s;
}
function app(token = 'clientA') {
  const memory = new Map([['ruda_client_token', token]]);
  const storage = { getItem: k => memory.get(k) || null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) };
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: id === 'monopoly-round-limit' ? '30' : '', textContent: '', innerHTML: '', style: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return true; } } });
    return elements.get(id);
  };
  const window = { RudaBoard: board, RudaMonopoly: engineModule, localStorage: storage, addEventListener() {}, crypto: require('node:crypto').webcrypto, location: { href: 'https://example.test/arena/', origin: 'https://example.test', pathname: '/arena/', protocol: 'https:' } };
  const context = { window, document: { getElementById: element, querySelectorAll: () => [] }, navigator: {}, URL, URLSearchParams, Uint32Array, Date, Math, Map, setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {}, crypto: window.crypto, btoa: s => Buffer.from(s).toString('base64'), atob: s => Buffer.from(s, 'base64').toString('utf8') };
  const injection = `
    renderAll = () => {}; renderCenterHUD = () => {}; renderAuction = () => {}; updateLobbyWaitingRoom = () => {}; scheduleMonopolyBot = () => {};
    window.testing = {
      setState(s) { gameState = normalizeState(copy(s)); acceptedState = copy(gameState); syncMyOnlineIdentity(); },
      setRef(ref) { firebaseRoomRef = ref; firebaseConnected = true; },
      getState() { return copy(gameState); }, commitMonopoly, pushStateSync, sendChatMessage, commitArcadeWallet,
      getMyViewerPlayer, canControlTurn, addOrReconnectPlayerToRoom, buildShareInviteLink,
      renderChat, connectFirebaseDatabase, createFreshGameState
    };
  `;
  vm.runInNewContext(appSource.replace(/\}\)\(\);\s*$/, injection + '\n})();'), context);
  return { api: window.testing, elements, element, memory };
}
function database(initial) {
  let value = clone(initial);
  return { get value() { return clone(value); }, async transaction(update) {
    let old = clone(value), next = update(clone(old));
    await Promise.resolve();
    if (JSON.stringify(old) !== JSON.stringify(value)) next = update(clone(value));
    const committed = next !== undefined;
    if (committed) value = clone(next);
    return { committed, snapshot: { val: () => clone(value) } };
  } };
}
test('lokalny ruch aplikacji jest zapisywany i nie blokuje się po zatwierdzeniu', async () => {
  const a = app(); a.api.setState(state(false));
  assert.equal(await a.api.commitMonopoly('ROLL'), true); assert.ok(a.memory.has('ruda_local_save_v15'));
  assert.equal(await a.api.commitMonopoly('END'), a.api.getState().turnPhase !== 'DECIDE');
});
test('dwie karty przeglądarki nie mogą rozliczyć tej samej tury dwa razy', async () => {
  const db = database(state()), a = app(), b = app();
  for (const x of [a, b]) { x.api.setState(state()); x.api.setRef(db); }
  const outcomes = await Promise.all([a.api.commitMonopoly('ROLL'), b.api.commitMonopoly('ROLL')]);
  assert.equal(outcomes.filter(Boolean).length, 1); assert.equal(db.value.revision, 1);
});
test('gracz bez tożsamości w pokoju nie może przejąć pierwszego pionka', async () => {
  const a = app('stranger'), db = database(state()); a.api.setState(state()); a.api.setRef(db);
  assert.equal(a.api.getMyViewerPlayer(), null); assert.equal(a.api.canControlTurn(), false);
  assert.equal(await a.api.commitMonopoly('ROLL', {}, 'p1'), false); assert.equal(db.value.revision, 0);
});
test('gracz nie może wykonać akcji innego człowieka', async () => {
  const a = app('clientB'), db = database(state()); a.api.setState(state()); a.api.setRef(db);
  assert.equal(await a.api.commitMonopoly('ROLL', {}, 'p1'), false); assert.equal(db.value.revision, 0);
});
test('równoczesne wiadomości nie znikają w zapisie całego stanu', async () => {
  const a = app(), b = app('clientB'), db = database(state());
  for (const x of [a, b]) { x.api.setState(state()); x.api.setRef(db); }
  await Promise.all([a.api.sendChatMessage('Pierwsza'), b.api.sendChatMessage('Druga')]);
  assert.equal(db.value.chat.length, 2); assert.deepEqual(db.value.chat.map(m => m.text).sort(), ['Druga', 'Pierwsza']);
});
test('czat wyświetla tekst i nie wykonuje przesłanych znaczników HTML', () => {
  const a = app(), s = state(false); s.chat = [{ author: '<b>test</b>', color: '#ffffff', text: '<img src=x onerror=alert(1)>', time: '12:00' }]; a.api.setState(s); a.api.renderChat();
  const html = a.element('chat-stream').innerHTML; assert.ok(!html.includes('<img')); assert.ok(html.includes('&lt;img'));
});
test('do działającego pokoju wraca dotychczasowy gracz, nowy nie dołącza w połowie gry', () => {
  const a = app(), s = state();
  assert.equal(a.api.addOrReconnectPlayerToRoom(clone(s), 'Ala', '#ffffff', 'helmet', 'clientA').players.length, 2);
  assert.throws(() => a.api.addOrReconnectPlayerToRoom(clone(s), 'Nowy', '#ffffff', 'helmet', 'new'));
});
test('wynik kasyna zmienia tylko portfel minigier i scala się z czatem', async () => {
  const a = app(), b = app('clientB'), s = state(), db = database(s);
  for (const x of [a, b]) { x.api.setState(s); x.api.setRef(db); }
  await Promise.all([a.api.commitArcadeWallet('p1', 100, 200, 'Wynik', s.gameId), b.api.sendChatMessage('Wiadomość')]);
  assert.equal(db.value.players[0].arcadeCash, 2100); assert.equal(db.value.players[0].cash, 1500); assert.equal(db.value.chat.length, 1);
});
test('wynik starej animacji nie trafia do nowej partii', async () => {
  const a = app(), s = state(); a.api.setState(s);
  assert.equal(await a.api.commitArcadeWallet('p1', 100, 5000, 'Stary wynik', 'old_game'), false);
  assert.equal(a.api.getState().players[0].arcadeCash, 2000);
});
test('brak SDK Firebase nie blokuje gry lokalnej i nie udaje połączenia', () => {
  const a = app(); assert.equal(a.api.connectFirebaseDatabase('https://example.firebaseio.com'), false);
});
test('wszystkie statyczne identyfikatory DOM, skrypty i pliki CSS istnieją', () => {
  const root = path.join(__dirname, '..'), html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]); assert.equal(new Set(ids).size, ids.length);
  const references = [...appSource.matchAll(/getElementById\('([^']+)'\)/g)].map(m => m[1]);
  assert.deepEqual([...new Set(references)].filter(id => !ids.includes(id) && id !== 'corner-sub-20'), []);
  for (const file of ['app.js', 'monopoly-engine.js', 'board-data.js', 'styles.css']) { assert.ok(html.includes(file)); assert.ok(fs.statSync(path.join(root, file)).size > 0); }
  assert.ok(html.indexOf('board-data.js') < html.indexOf('monopoly-engine.js')); assert.ok(html.indexOf('monopoly-engine.js') < html.indexOf('src="app.js"'));
  assert.ok(!html.includes('user-scalable=no')); assert.ok(!html.includes('btn-buyout-field')); assert.ok(!html.includes('btn-new-trade'));
});
