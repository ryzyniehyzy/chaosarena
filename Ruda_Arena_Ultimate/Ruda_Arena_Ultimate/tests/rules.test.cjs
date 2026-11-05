const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..', 'dist');
const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(root, 'ultimate-core.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8').split('/* ==================== CZĘŚĆ C:')[0], ctx);
const U = ctx.RudaUltimate, data = ctx.RudaBoard, engine = ctx.RudaMonopoly.createEngine(data);
const A = require('../dist/arcade-core.js');
const plain = v => JSON.parse(JSON.stringify(v));
function fresh(overrides = []) {
  const properties = Object.fromEntries(data.BOARD_TILES.filter(t => t.price).map(t => [t.index, { ownerId: null, level: 0, mortgaged: false, history: [] }]));
  return engine.initialize({ players: [
    { id: 'a', name: 'A', avatar: 'classic', powerUp: 'JUMP', ...overrides[0] },
    { id: 'b', name: 'B', avatar: 'classic', powerUp: 'JUMP', ...overrides[1] },
    { id: 'c', name: 'C', avatar: 'classic', powerUp: 'JUMP', ...overrides[2] }
  ], properties, lastDice: [1, 2] }, { now: 1000, seed: 42, roundLimit: 0, gameId: 'test' });
}
function act(s, type, extra = {}, actor = s.players[s.turnIndex].id) {
  return engine.reduce(s, { type, now: (s.updatedAt || 0) + 1, ...extra }, actor);
}
function nextRound(s) {
  const target = s.round + 1;
  while (s.round < target) { s.turnPhase = 'END'; s.extraRoll = false; s = act(s, 'END'); }
  return s;
}
function giveSet(s, group, owner = 'a', level = 0) {
  data.BOARD_TILES.filter(t => t.type === 'PROPERTY' && t.group === group).forEach(t => Object.assign(s.properties[t.index], { ownerId: owner, level }));
}
test('wydarzenie zaczyna się co 5 rund, jest wspólne, wygasa przed rundą 7', () => {
  let s = fresh(); for (let i = 0; i < 3; i++) s = nextRound(s);
  assert.equal(s.round, 4); assert.equal(s.ultimate.activeEvent, null);
  s = nextRound(s); const key = s.ultimate.activeEvent.key;
  assert.equal(s.ultimate.activeEvent.untilRound, 7);
  s = nextRound(s); assert.equal(s.ultimate.activeEvent.key, key);
  s = nextRound(s); assert.equal(s.ultimate.activeEvent, null);
});
test('boom i awaria modyfikują czynsz; Halemba z domami blokuje budowę', () => {
  const s = fresh(); giveSet(s, 'HALEMBA', 'b', 1);
  s.ultimate.activeEvent = { id: 'METHANE', untilRound: 3 };
  assert.equal(engine.rent(s, 26), 0);
  s.turnIndex = 1; assert.equal(engine.buildCheck(s, 26, 'b').ok, false);
  s.ultimate.activeEvent = { id: 'COAL', untilRound: 3 };
  assert.equal(engine.rent(s, 29), 180);
  assert.equal(engine.rent(s, 26), 110);
});
test('dotacja Premiera jest raz na gracza, tylko podczas aktywnego wydarzenia', () => {
  let s = fresh(); s.players[0].position = 38;
  s.ultimate.activeEvent = { id: 'PREMIER', untilRound: 3, key: 'visit' };
  s = act(s, 'ROLL', { dice: [1, 2] });
  assert.equal(s.players[0].cash, 1850);
  s.players[0].position = 38; s.turnPhase = 'ROLL'; s = act(s, 'ROLL', { dice: [1, 2] });
  assert.equal(s.players[0].cash, 2050);
});
test('Hełm: pierwsza budowa kosztuje 0, kolejna płatna; umiejętność nie resetuje się w turze', () => {
  let s = fresh([{ avatar: 'helmet' }]); giveSet(s, 'ORZEGOW'); s.players[0].cash = 0;
  assert.equal(engine.buildCheck(s, 1, 'a').ok, true);
  s = act(s, 'BUILD', { index: 1 }); assert.equal(s.players[0].cash, 0); assert.equal(s.players[0].helmetUsed, true);
  assert.equal(engine.buildCheck(s, 3, 'a').ok, false);
});
test('Hełm: darmowa pierwsza naprawa zużywa ten sam przywilej co budowa', () => {
  let s = fresh([{ avatar: 'helmet' }]);giveSet(s, 'ORZEGOW', 'a', 1);
  const repair = data.SURPRISE_CARDS.findIndex(c => c.action === 'REPAIRS');
  assert.ok(repair >= 0);s.cards.chance = [repair];s.players[0].position = 4;
  s = act(s, 'ROLL', { dice: [1, 2] });assert.equal(s.players[0].cash, 1500);assert.equal(s.players[0].helmetUsed, true);
});
test('Wagonik czeka na decyzję po rzucie i zmienia pole przed naliczeniem czynszu', () => {
  let s = fresh([{ avatar: 'cart' }]);s.properties[3].ownerId = 'b';
  s = act(s, 'ROLL', { dice: [1, 2] });assert.equal(s.turnPhase, 'CART_CHOICE');assert.equal(s.players[0].cash, 1500);
  s = act(s, 'CART', { direction: 2 });assert.equal(s.players[0].position, 5);assert.equal(s.players[0].cartUsed, true);assert.equal(s.players[0].cash, 1500);
});
test('Plecy: decyzja poprzedza płatność, atut nie może być użyty dwa razy', () => {
  let s = fresh([{ powerUp: 'RENT' }]);s.properties[3].ownerId = 'b';
  s = act(s, 'ROLL', { dice: [1, 2] });assert.equal(s.turnPhase, 'RENT_CHOICE');assert.equal(s.players[1].cash, 1500);
  s = act(s, 'SKIP_RENT');assert.equal(s.players[0].powerUsed, true);assert.equal(s.players[1].cash, 1500);
  s.players[0].position = 0;s.turnPhase = 'ROLL';s = act(s, 'ROLL', { dice: [1, 2] });assert.equal(s.players[1].cash, 1504);
});
test('Zjazd: tylko wolne pole w rundzie 1, bez niezasłużonej wypłaty START', () => {
  let s = fresh();s.players[0].position = 39;s = act(s, 'POWER_JUMP', { index: 1 });
  assert.equal(s.players[0].position, 1);assert.equal(s.players[0].cash, 1500);assert.equal(s.turnPhase, 'DECIDE');
  assert.throws(() => act(s, 'POWER_JUMP', { index: 3 }), /pierwszej rundzie/);
});
test('Pierwokup rozstrzyga się przed obciążeniem zwycięzcy aukcji', () => {
  let s = fresh([{ powerUp: 'FIRST' }]);s.players[0].position = 1;s.turnPhase = 'DECIDE';
  s = act(s, 'DECLINE');s = act(s, 'BID', { amount: 60 }, 'b');s = act(s, 'PASS', {}, 'a');s = act(s, 'PASS', {}, 'c');
  assert.equal(s.turnPhase, 'PREEMPT');assert.equal(s.players[1].cash, 1500);assert.equal(s.properties[1].ownerId, null);
  s = act(s, 'PREEMPT_YES', {}, 'a');assert.equal(s.players[0].cash, 1499);assert.equal(s.players[1].cash, 1500);assert.equal(s.properties[1].ownerId, 'a');
});
test('Rezygnacja z pierwokupu kończy aukcję zwykłą, jednokrotną płatnością', () => {
  let s = fresh([{ powerUp: 'FIRST' }]);s.players[0].position = 1;s.turnPhase = 'DECIDE';
  s = act(s, 'DECLINE');s = act(s, 'BID', { amount: 40 }, 'b');s = act(s, 'PASS', {}, 'a');s = act(s, 'PASS', {}, 'c');
  s = act(s, 'PREEMPT_NO', {}, 'a');assert.equal(s.players[1].cash, 1460);assert.equal(s.properties[1].ownerId, 'b');assert.equal(s.players[0].powerUsed, false);
});
test('Bursa: karty mają cenę minimalną $50 i trafiają do zwycięzcy', () => {
  let s = fresh();s = nextRound(nextRound(s));assert.ok(s.ultimate.market);s = act(s, 'MARKET_OPEN');
  assert.throws(() => act(s, 'BID', { amount: 1 }), /Oferta/);
  s = act(s, 'BID', { amount: 50 });s = act(s, 'PASS', {}, 'b');s = act(s, 'PASS', {}, 'c');
  assert.equal(s.players[0].actionCards.length, 1);assert.equal(s.ultimate.market.sold, true);assert.equal(s.players[0].cash, 1450);
});
test('Karta urzędnika przenosi hipotekę tylko między własnymi, poprawnymi polami', () => {
  let s = fresh();s.properties[1].ownerId = 'a';s.properties[1].mortgaged = true;s.properties[6].ownerId = 'a';s.players[0].actionCards = ['BRIBE'];
  s = act(s, 'ACTION_BRIBE', { from: 1, to: 6 });assert.equal(s.properties[1].mortgaged, false);assert.equal(s.properties[6].mortgaged, true);assert.equal(s.players[0].cash, 1500);assert.equal(s.players[0].actionCards.length, 0);
});
test('Architektura: mnożnik 1.3 i prestiż ×2; bonus znika przy utracie hotelu', () => {
  let s = fresh();giveSet(s, 'ORZEGOW', 'a', 5);s = act(s, 'STYLE', { index: 1, style: 'FAMILOK' });
  assert.equal(engine.rent(s, 1), 325);assert.equal(U.prestige(s, 'ORZEGOW', data.BOARD_TILES).value, 20);
  s.properties[1].level = 4;s.properties[3].level = 4;assert.equal(engine.rent(s, 1), 160);assert.equal(U.prestige(s, 'ORZEGOW', data.BOARD_TILES).value, 8);
});
test('Zakupy nie obciążają Monopoly, nie płacą ponownie za posiadaną skórkę i zachowują umiejętność', () => {
  const s = fresh([{ avatar: 'cart' }]);U.buyCosmetic(s, 'a', 'pigeon');assert.equal(s.players[0].cash, 1500);assert.equal(s.players[0].arcadeCash, 1550);assert.equal(s.players[0].avatar, 'cart');
  U.buyCosmetic(s, 'a', 'pigeon');assert.equal(s.players[0].arcadeCash, 1550);assert.equal(s.players[0].ownedCosmetics.length, 1);
});
test('Sznaps odsłania jedną kartę następnego gracza, Fart zmienia figurę, limit jednej akcji na turę', () => {
  const s = fresh();s.liars = { turnIndex: 0, requiredRank: 'A', handsJson: JSON.stringify({a:[{id:'x',action:'SNAPS',rank:'Sznaps',suit:'🥃'},{id:'y',action:'FART',rank:'Fart',suit:'🍀'},{id:'ordinary',rank:'A',suit:'♣'}],b:[{id:'q',rank:'Q',suit:'♥'}],c:[]}) };
  U.liarAction(s, 'a', 'x', 'K');assert.equal(s.liars.exposed.rank, 'Q');assert.throws(()=>U.liarAction(s, 'a', 'y', 'K'),/Jedna karta/);
  s.liars.actionUsedBy = '';s.liars.turnIndex = 0;const hands=JSON.parse(s.liars.handsJson);hands.a=hands.a.filter(c=>c.action);s.liars.handsJson=JSON.stringify(hands);U.liarAction(s, 'a', 'y', 'K');assert.equal(s.liars.requiredRank, 'K');assert.equal(s.liars.winnerName, 'A');assert.equal(s.players[0].arcadeCash, 2500);
});
test('Turniej: osobny budżet, 20 obrotów, limit czasu i jednokrotna nagroda', () => {
  const s = fresh();s.slotTournament = U.slotsStart(s.players, 'slots', 1000);const cash = s.players[0].arcadeCash;
  for(let i=0;i<20;i++)U.slotsSpin(s.slotTournament, 'a', 1, 1001+i);
  assert.throws(()=>U.slotsSpin(s.slotTournament, 'a', 1, 1030),/20 obrotów/);assert.equal(s.players[0].arcadeCash, cash);
  assert.throws(()=>U.slotsSpin(s.slotTournament, 'b', 50, 181000),/zakończony/);
  U.slotsFinish(s, 181000);const after = s.players.map(p=>p.arcadeCash);U.slotsFinish(s, 181001);assert.deepEqual(plain(s.players.map(p=>p.arcadeCash)), plain(after));
});
test('Wyścig botów kończy się, wymaga checkpointów i jest deterministyczny', () => {
  const players = fresh().players,k = A.createKart(players,'race',77),second = plain(k),bots = players.map(p=>p.id);
  for(let i=0;i<1600;i++){A.stepKart(k,{},bots,.1);A.stepKart(second,{},bots,.1);}
  assert.deepEqual(plain(k),plain(second));assert.equal(k.status,'FINISHED');assert.equal(k.ranking.length,3);assert.ok(k.cars.some(c=>c.finished));
  const idle = A.createKart(players,'idle',99);for(let i=0;i<100;i++)A.stepKart(idle,{},[],.1);assert.equal(idle.cars[0].checkpoints,0);
});
test('Obrona: wspólne pieniądze, poprawne ulepszenia i przegrana bez wież', () => {
  const s = A.createDefense('td',23);A.defenseCommand(s,{type:'BUILD',tower:'HUTA',pad:0});assert.equal(s.funds,390);
  A.defenseCommand(s,{type:'UPGRADE',pad:0});assert.equal(s.funds,290);assert.equal(s.towers[0].level,2);
  assert.throws(()=>A.defenseCommand(s,{type:'BUILD',tower:'HUTA',pad:0}),/zajęte/);
  const empty = A.createDefense('empty',23);for(let i=0;i<6000&&empty.status==='PLAYING';i++)A.stepDefense(empty,.1);assert.equal(empty.status,'LOST');assert.equal(empty.hp,0);
});
test('15 fal daje osiągalną kooperacyjną wygraną, ekonomia nie schodzi poniżej zera', () => {
  const s=A.createDefense('td-win',17);const pads=[11,1,2,7,0,3,9,5,8,6,10,4];
  for(let i=0;i<16000&&s.status==='PLAYING';i++){
    const pad=pads.find(p=>!s.towers.some(t=>t.pad===p));
    if(pad!==undefined&&s.funds>=160)A.defenseCommand(s,{type:'BUILD',tower:s.towers.length%3===2?'WATER':'HUTA',pad});
    else {const t=s.towers.find(t=>t.level<3&&s.funds>=t.level*100);if(t)A.defenseCommand(s,{type:'UPGRADE',pad:t.pad});}
    A.stepDefense(s,.1);assert.ok(s.funds>=0);
  }
  assert.equal(s.status,'WON');assert.equal(s.wave,15);assert.ok(s.hp>0);
});
test('Zapis Firebase bez pustych tablic zachowuje stan atutów i kart', () => {
  const s=fresh([{powerUp:'RENT'}]);s.players[0].powerUsed=true;s.players[0].actionCards={0:'BAIL'};s.ultimate.history={};s.ultimate.activeEvent=false;
  const normalized=engine.normalize(s);assert.equal(normalized.players[0].powerUsed,true);assert.deepEqual(plain(normalized.players[0].actionCards),['BAIL']);assert.equal(normalized.ultimate.activeEvent,null);
});
