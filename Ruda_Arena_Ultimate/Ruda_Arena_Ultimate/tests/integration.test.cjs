const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const root = path.join(__dirname, '..', 'dist');
function memory() { const m = new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}; }
function load() {
  const fields = { 'monopoly-round-limit': { value: '30' }, 'ultimate-scenario': { value: 'CLASSIC' }, 'local-perk': { value: 'RENT' }, 'online-perk': { value: 'FIRST' } };
  const context = { console, performance, document: { getElementById: id => fields[id] || null }, localStorage: memory(), sessionStorage: memory(), addEventListener() {} };
  context.window = context;const c = vm.createContext(context);
  ['ultimate-core.js','arcade-core.js','ultimate-ui.js','app.js'].forEach(file => {
    let code = fs.readFileSync(path.join(root,file),'utf8');
    if(file==='ultimate-ui.js')code=code.replace('return {init,render,renderLobby','return {_testReduce:reduceFeature,init,render,renderLobby');
    if(file==='app.js')code=code.replace(/\}\)\(\);\s*$/, 'window.arenaTest = { createFreshGameState,normalizeState,sanitizeForFirebase,createLiarsGameState,ultimateUI };})();');
    vm.runInContext(code,c,{filename:file});
  });
  const players=[{id:'p1',name:'Sztygar',clientToken:context.sessionStorage.getItem('ruda_client_token'),color:'#ff7849',avatar:'helmet'},{id:'p2',name:'Gość',color:'#81cfb5',avatar:'cart',powerUp:'JUMP'}];
  return {c,fields,players,api:c.arenaTest};
}
const plain=x=>JSON.parse(JSON.stringify(x));
test('cała aplikacja ładuje się; nowy stan ma dodatki, ekonomię i talię 24 kart',()=>{
  const {api,players}=load(),s=api.createFreshGameState(players,1500);
  assert.equal(s.rulesVersion,20);assert.equal(s.players[0].powerUp,'RENT');assert.equal(s.players[1].powerUp,'JUMP');assert.equal(Object.keys(s.properties).length,28);
  const cards=Object.values(JSON.parse(s.liars.handsJson)).flat();assert.equal(cards.length,24);assert.equal(cards.filter(c=>c.action==='SNAPS').length,2);assert.equal(cards.filter(c=>c.action==='FART').length,2);
});
test('trzy scenariusze zmieniają dane pól bez utraty cen, hipotek i poziomów',()=>{
  const {api,c,players,fields}=load();fields['ultimate-scenario'].value='MINE';const s=api.createFreshGameState(players,1500);
  s.properties[1].ownerId='p1';s.properties[1].level=3;s.players[0].powerUsed=true;
  api.normalizeState(s);assert.match(c.RudaBoard.BOARD_TILES[1].name,/−500/);assert.match(c.RudaBoard.BOARD_TILES[5].name,/Szyb zjazdowy/);assert.equal(s.properties[1].level,3);assert.equal(s.players[0].powerUsed,true);
  s.scenarioId='SILESIA';api.normalizeState(s);assert.match(c.RudaBoard.BOARD_TILES[1].name,/Guido/);assert.ok(c.RudaBoard.BOARD_TILES.some(t=>/Spodek/.test(t.name)));
  s.scenarioId='CLASSIC';api.normalizeState(s);assert.match(c.RudaBoard.BOARD_TILES[1].name,/Burloch/);assert.equal(c.RudaBoard.BOARD_TILES[1].price,60);assert.match(c.RudaBoard.BOARD_TILES[20].name,/Bursa/);
});
test('serializacja Firebase zachowuje nowe karty, pierwokup i zerowe symbole automatu',()=>{
  const {api,players}=load();let s=api.createFreshGameState(players,1500);
  s.preemption={candidates:['p2'],auction:{tileIndex:1,leaderId:'p1',highBid:50,openingPrice:1}};
  s.slotTournament={entries:{p1:{last:[0,0,2]}}};s.players[1].actionCards=['BAIL'];
  s=api.normalizeState(api.sanitizeForFirebase(s));assert.equal(s.preemption.candidates[0],'p2');assert.equal(s.slotTournament.entries.p1.last.length,3);assert.equal(s.slotTournament.entries.p1.last[0],0);assert.equal(s.players[1].actionCards[0],'BAIL');
});
test('wygrana rajdu i obrony wypłaca nagrody jeden raz, niezależnie od ponownego połączenia',()=>{
  const {api,players}=load(),s=api.createFreshGameState(players,1500),reduce=api.ultimateUI._testReduce;
  reduce(s,'KART_START',{id:'r',seed:13},'p1',true);s.kart.status='FINISHED';s.kart.ranking=['p2','p1'];
  reduce(s,'LIVE_REWARD',{key:'kart',session:'r'},'p1',true);reduce(s,'LIVE_REWARD',{key:'kart',session:'r'},'p1',true);
  assert.equal(s.players[1].arcadeCash,2500);assert.equal(s.players[0].arcadeCash,2150);
  reduce(s,'DEFENSE_START',{id:'d',seed:13},'p1',true);s.defense.status='WON';
  reduce(s,'LIVE_REWARD',{key:'defense',session:'d'},'p1',true);reduce(s,'LIVE_REWARD',{key:'defense',session:'d'},'p1',true);
  assert.equal(s.players[1].arcadeCash,3100);assert.equal(s.players[0].arcadeCash,2750);assert.equal(s.players[0].cash,1500);
  assert.throws(()=>reduce(s,'KART_START',{id:'bad',seed:1},'p2',false),/gospodarz/);
});
test('profil przechowuje portfel i kosmetyki, nowa skórka nie zmienia postaci',()=>{
  const {api,c,players}=load();c.localStorage.setItem('ruda_ultimate_profile',JSON.stringify({arcadeCash:900,ownedCosmetics:['pigeon'],equippedPawn:'pigeon'}));
  const s=api.createFreshGameState(players,3000);assert.equal(s.players[0].arcadeCash,900);assert.equal(s.players[0].cash,3000);assert.equal(s.players[0].equippedPawn,'pigeon');assert.equal(s.players[0].avatar,'helmet');
});
test('specjalne decyzje po wczytaniu nie tracą pól przy migracji stanu',()=>{
  const {api,players}=load();const s=api.createFreshGameState(players,1500);s.pendingMove={playerId:'p2',steps:9,diceSum:9};s.turnPhase='CART_CHOICE';s.players[1].cartUsed=false;
  const restored=api.normalizeState(plain(api.sanitizeForFirebase(s)));assert.equal(restored.pendingMove.steps,9);assert.equal(restored.turnPhase,'CART_CHOICE');assert.equal(restored.players[1].cartUsed,false);
});
