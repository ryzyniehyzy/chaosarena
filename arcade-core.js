/* Symulacje 2D. Gospodarz pokoju wykonuje ten sam stały krok co gra lokalna. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RudaArcade = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const TRACK = [[110,120],[390,76],[716,126],[800,270],[701,428],[412,464],[136,406],[63,267]];
  const LANDMARKS = ['Chebzie · START','Godula','Ruda','Nowy Bytom','Wirek','Halemba · DTŚ','Bielszowice','Orzegów'];
  const PADS = [[305,170],[390,155],[510,155],[595,170],[600,245],[600,315],[540,385],[450,390],[360,385],[300,315],[300,245],[450,185]];
  const CLAMP = (v,a,b) => Math.max(a,Math.min(b,v));
  const DIST = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const angleDiff = (a,b) => Math.atan2(Math.sin(a-b),Math.cos(a-b));
  const ensure = (ok,message) => { if (!ok) throw new Error(message); };
  function rand(s) { let x = s.rng || 987321; x ^= x<<13; x ^= x>>>17; x ^= x<<5; s.rng = x>>>0; return s.rng / 4294967296; }
  function distanceToRoad(x,y) {
    let best = Infinity;
    TRACK.forEach((a,i) => {
      const b=TRACK[(i+1)%TRACK.length], dx=b[0]-a[0],dy=b[1]-a[1];
      const t=CLAMP(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);
      best=Math.min(best,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
    }); return best;
  }
  function createKart(players,id,seed) {
    return { id, rng: seed>>>0, status:'PLAYING', elapsed:-3, laps:3, rewarded:false,
      cars:players.map((p,i) => ({id:p.id,x:110-i*13,y:120+i*11,angle:-.15,speed:0,next:1,checkpoints:0,lap:0,boost:0,slow:0,mines:1,mineLock:0,finished:false,finishTime:0})),
      pickups:TRACK.map((p,i) => ({x:p[0],y:p[1],type:i%3===0?'MINE':'COAL',cooldown:0})), mines:[],
      police:[{x:750,y:170},{x:210,y:435}]
    };
  }
  function rankKart(s) {
    return [...s.cars].sort((a,b)=> {
      if(a.finished!==b.finished) return a.finished?-1:1;
      if(a.finished) return a.finishTime-b.finishTime;
      if(a.checkpoints!==b.checkpoints) return b.checkpoints-a.checkpoints;
      const point=TRACK[a.next];
      return Math.hypot(a.x-point[0],a.y-point[1])-Math.hypot(b.x-point[0],b.y-point[1]);
    });
  }
  function stepKart(s, inputs, bots, dt) {
    if(s.status!=='PLAYING') return s;
    dt=CLAMP(dt,0,.1); s.elapsed+=dt;
    if(s.elapsed<0) return s;
    s.pickups.forEach(p=>{p.cooldown=Math.max(0,p.cooldown-dt);});
    s.mines=s.mines.filter(m=>(m.ttl-=dt)>0);
    s.police[0]={x:750+Math.sin(s.elapsed*.75)*28,y:210+Math.sin(s.elapsed*.6)*43};
    s.police[1]={x:240+Math.sin(s.elapsed*.65)*75,y:435+Math.cos(s.elapsed)*15};
    s.cars.forEach(car=> {
      if(car.finished) return;
      const bot=bots.includes(car.id), control=inputs[car.id]||{};
      let steer=CLAMP(Number(control.steer)||0,-1,1), throttle=!!control.throttle, brake=!!control.brake;
      if(bot) {
        const [tx,ty]=TRACK[car.next], desired=Math.atan2(ty-car.y,tx-car.x),diff=angleDiff(desired,car.angle);
        steer=CLAMP(diff*2.1,-1,1); throttle=true; brake=Math.abs(diff)>1.15 && car.speed>75;
      }
      car.boost=Math.max(0,car.boost-dt); car.slow=Math.max(0,car.slow-dt);car.mineLock=Math.max(0,car.mineLock-dt);
      const offroad=distanceToRoad(car.x,car.y)>52;
      const max=(car.boost>0?226:153)*(car.slow>0?.44:1)*(offroad?.45:1);
      car.speed=CLAMP(car.speed+(throttle?100: -50)*dt-(brake?180*dt:0),0,max);
      car.angle+=steer*2.5*dt*Math.min(1,car.speed/35);
      car.x=CLAMP(car.x+Math.cos(car.angle)*car.speed*dt,18,882);
      car.y=CLAMP(car.y+Math.sin(car.angle)*car.speed*dt,18,522);
      const target=TRACK[car.next];
      if(Math.hypot(car.x-target[0],car.y-target[1])<54) {
        car.checkpoints++; if(car.next===0)car.lap++;
        car.next=(car.next+1)%TRACK.length;
        if(car.lap>=s.laps){car.finished=true;car.finishTime=Math.round(s.elapsed*100)/100;car.speed=0;}
      }
      s.pickups.forEach(p=> {
        if(p.cooldown<=0 && DIST(car,p)<30) {
          if(p.type==='COAL') car.boost=2.8; else car.mines=Math.min(3,car.mines+1);
          p.cooldown=7;
        }
      });
      if((control.mine || (bot && rand(s)<dt*.17)) && car.mines>0 && car.mineLock===0) {
        s.mines.push({x:car.x-Math.cos(car.angle)*30,y:car.y-Math.sin(car.angle)*30,owner:car.id,ttl:10});car.mines--;car.mineLock=1.2;
      }
      s.mines.forEach(m=>{if(m.owner!==car.id && DIST(car,m)<24){car.slow=2.5;m.ttl=0;}});
      s.police.forEach(p=>{if(DIST(car,p)<29)car.slow=Math.max(car.slow,1.5);});
    });
    if(s.elapsed>=150 || s.cars.every(c=>c.finished)) {s.status='FINISHED';s.ranking=rankKart(s).map(c=>c.id);}
    return s;
  }
  function createDefense(id,seed) {
    return { id,rng:seed>>>0,status:'PLAYING',wave:0,hp:100,funds:520,kills:0,towers:[],enemies:[],shots:[],
      remaining:0,spawnIn:0,intermission:1,elapsed:0,nextEnemyId:1,processed:[],notice:'Wspólny fundusz $520. Postaw obronę na polach wokół szybu.',rewarded:false };
  }
  function defenseCommand(s,command) {
    ensure(s.status==='PLAYING','Obrona szybu jest zakończona.');
    ensure(Number.isInteger(command.pad)&&command.pad>=0&&command.pad<PADS.length,'Wybierz pole budowy.');
    const existing=s.towers.find(t=>t.pad===command.pad);
    if(command.type==='UPGRADE') {
      ensure(existing && existing.level<3,'Wybierz wieżę poniżej poziomu 3.');
      const cost=existing.level*100;ensure(s.funds>=cost,'Brakuje wspólnych funduszy.');s.funds-=cost;existing.level++;
      s.notice='Ulepszono wieżę do poziomu '+existing.level+'.';
    } else {
      ensure(!existing && ['HUTA','WATER'].includes(command.tower),'To pole jest zajęte lub nie wybrano wieży.');
      const cost=command.tower==='HUTA'?130:160;ensure(s.funds>=cost,'Brakuje wspólnych funduszy.');s.funds-=cost;
      s.towers.push({pad:command.pad,type:command.tower,level:1,cooldown:0});s.notice='Nowa wieża: '+(command.tower==='HUTA'?'Działko Huty.':'Wieża ciśnień.');
    }
  }
  function stepDefense(s,dt) {
    if(s.status!=='PLAYING')return s;
    dt=CLAMP(dt,0,.1);s.elapsed+=dt;
    s.shots=s.shots.filter(b=>(b.ttl-=dt)>0);
    if(s.remaining===0&&s.enemies.length===0) {
      if(s.wave===15){s.status='WON';s.notice='Szyb uratowany! Przetrwaliście wszystkie 15 fal.';return s;}
      s.intermission-=dt;
      if(s.intermission<=0){s.wave++;s.remaining=5+s.wave*2;s.spawnIn=0;s.notice='Fala '+s.wave+' / 15 — hałda naciera!';}
    }
    if(s.remaining>0){
      s.spawnIn-=dt;
      if(s.spawnIn<=0){
        const side=Math.floor(rand(s)*4),jitter=(rand(s)-.5)*65;
        const point=[[450+jitter,-15],[915,270+jitter],[450+jitter,555],[-15,270+jitter]][side];
        const health=32+s.wave*10;
        s.enemies.push({id:s.nextEnemyId++,x:point[0],y:point[1],hp:health,maxHp:health,speed:21+s.wave*1.9,slow:0,kind:s.wave%3});
        s.remaining--;s.spawnIn=Math.max(.42,1.25-s.wave*.035);
      }
    }
    s.towers.forEach(t=> {
      t.cooldown-=dt;if(t.cooldown>0)return;
      const pos={x:PADS[t.pad][0],y:PADS[t.pad][1]},range=(t.type==='HUTA'?148:160)+t.level*13;
      const target=s.enemies.filter(e=>e.hp>0&&DIST(e,pos)<range).sort((a,b)=>DIST(a,{x:450,y:270})-DIST(b,{x:450,y:270}))[0];
      if(!target)return;
      target.hp-=t.type==='HUTA'?12*t.level:5*t.level;
      if(t.type==='WATER')target.slow=1.7;
      t.cooldown=t.type==='HUTA'?.52:.7;
      s.shots.push({x:pos.x,y:pos.y,tx:target.x,ty:target.y,water:t.type==='WATER',ttl:.15});
    });
    s.enemies=s.enemies.filter(e=> {
      if(e.hp<=0){s.kills++;s.funds+=16;return false;}
      e.slow=Math.max(0,e.slow-dt);
      const dx=450-e.x,dy=270-e.y,d=Math.hypot(dx,dy);
      if(d<29){s.hp=Math.max(0,s.hp-8);return false;}
      const step=e.speed*(e.slow>0?.42:1)*dt;e.x+=dx/d*step;e.y+=dy/d*step;return true;
    });
    if(s.remaining===0&&s.enemies.length===0&&s.intermission<=0){s.funds+=85;s.intermission=4;s.notice='Fala odparta. +$85 do wspólnego funduszu. Rozbuduj obronę!';}
    if(s.hp<=0){s.status='LOST';s.notice='Szyb zniszczony. Spróbujcie ponownie, łącząc działka z wieżami ciśnień.';}
    return s;
  }
  return { TRACK,LANDMARKS,PADS,createKart,stepKart,rankKart,distanceToRoad,createDefense,defenseCommand,stepDefense };
});
