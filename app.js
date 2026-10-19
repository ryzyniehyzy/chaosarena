/**
 * RUDA ŚLĄSKA ARENA — KOMPLETNY SILNIK 5 GIER + FIREBASE REALTIME DATABASE (app.js)
 */
(function () {
  'use strict';

  /**
   * OPCJONALNIE: Możesz wkleić tutaj na stałe adres swojej bazy Firebase Realtime Database,
   * np. "https://twoja-baza-default-rtdb.europe-west1.firebasedatabase.app"
   * Wtedy nikt nigdy nie będzie musiał wklejać go nawet w oknie Lobby!
   */
  const HARDCODED_FIREBASE_URL = "";

  /* ==================== 1. DANE PLANSZY MONOPOLY RUDY ŚLĄSKIEJ ==================== */
  const PLAYER_COLORS = [
    { id: 'ember',  name: 'Żar Węglowy (Wirek)',      hex: '#ff7849' },
    { id: 'cyan',   name: 'Błękit Huty (Nowy Bytom)', hex: '#00e5ff' },
    { id: 'gold',   name: 'Złoto Skarbnika (Halemba)',hex: '#ffca28' },
    { id: 'pink',   name: 'Neon Róż (Bykowina)',      hex: '#f06292' },
    { id: 'violet', name: 'Fiolet Nocy (Godula)',     hex: '#ab47bc' },
    { id: 'green',  name: 'Szmaragd (Kochłowice)',    hex: '#2ecc71' }
  ];

  const GROUPS = {
    ORZEGOW:     { name: 'Orzegów / Chebzie',       color: '#7cb342', code: 'ORZ' },
    GODULA:      { name: 'Godula / Ruda',           color: '#29b6f6', code: 'GOD' },
    KOCHLOWICE:  { name: 'Kochłowice / Czarny Las', color: '#ab47bc', code: 'KOC' },
    BYKOWINA:    { name: 'Bykowina',                color: '#ffa726', code: 'BYK' },
    BIELSZOWICE: { name: 'Bielszowice',             color: '#ef5350', code: 'BIE' },
    HALEMBA:     { name: 'Halemba',                 color: '#fdd835', code: 'HAL' },
    WIREK:       { name: 'Wirek (Zagłębie)',        color: '#26a69a', code: 'WIR' },
    NOWY_BYTOM:  { name: 'Nowy Bytom (Centrum)',    color: '#5c6bc0', code: 'NBY' },
    TRANSPORT:   { name: 'Koleje i Węzły Drogowe',  color: '#90a4ae', code: 'PKP' },
    UTILITY:     { name: 'Huty i Elektrownie',      color: '#ffa000', code: 'HUT' }
  };

  const BOARD_TILES = [
    { index: 0,  type: 'START',      name: 'START — Zjazd Szybem', shortName: 'START', subtitle: '+$250 za okrążenie' },
    { index: 1,  type: 'PROPERTY',   name: 'Orzegów — Burloch Arena', shortName: 'Burloch Arena', district: 'Orzegów', group: 'ORZEGOW', price: 60, buildCost: 50, rents: [6, 25, 70, 200, 340, 480] },
    { index: 2,  type: 'TREASURE',   name: 'Skarb Skarbnika', shortName: 'Skarb', district: 'Kasa Kopalni' },
    { index: 3,  type: 'PROPERTY',   name: 'Chebzie — Kolonia Kaufhaus', shortName: 'Kaufhaus', district: 'Chebzie', group: 'ORZEGOW', price: 70, buildCost: 50, rents: [8, 35, 100, 280, 420, 560] },
    { index: 4,  type: 'TAX',        name: 'Podatek Górniczy', shortName: 'Podatek', district: 'Urząd Miasta', taxAmount: 150 },
    { index: 5,  type: 'TRANSPORT',  name: 'Stacja PKP Chebzie', shortName: 'PKP Chebzie', district: 'Węzeł Kolejowy', group: 'TRANSPORT', price: 200, rents: [40, 80, 160, 320] },
    { index: 6,  type: 'PROPERTY',   name: 'Godula — Szyb Godula', shortName: 'Szyb Godula', district: 'Godula', group: 'GODULA', price: 100, buildCost: 60, rents: [10, 45, 120, 320, 460, 620] },
    { index: 7,  type: 'SURPRISE',   name: 'Szansa na Szychcie', shortName: 'Szansa', district: 'Losowanie' },
    { index: 8,  type: 'PROPERTY',   name: 'Godula — Park Młodzieży', shortName: 'Park Godula', district: 'Godula', group: 'GODULA', price: 100, buildCost: 60, rents: [10, 45, 120, 320, 460, 620] },
    { index: 9,  type: 'PROPERTY',   name: 'Ruda — KWK Pokój (Szyb)', shortName: 'KWK Pokój', district: 'Ruda', group: 'GODULA', price: 120, buildCost: 60, rents: [12, 55, 160, 460, 640, 780] },
    { index: 10, type: 'JAIL',       name: 'Izba / Kontrola OUG', shortName: 'Izba OUG', subtitle: 'Kontrola Górnicza' },
    { index: 11, type: 'PROPERTY',   name: 'Czarny Las — Osiedle', shortName: 'Czarny Las', district: 'Czarny Las', group: 'KOCHLOWICE', price: 140, buildCost: 90, rents: [14, 65, 190, 510, 710, 910] },
    { index: 12, type: 'UTILITY',    name: 'Elektrociepłownia Mikołaj', shortName: 'EC Mikołaj', district: 'Energetyka', group: 'UTILITY', price: 150 },
    { index: 13, type: 'PROPERTY',   name: 'Kochłowice — Rynek', shortName: 'Kochłowice', district: 'Kochłowice', group: 'KOCHLOWICE', price: 140, buildCost: 90, rents: [14, 65, 190, 510, 710, 910] },
    { index: 14, type: 'PROPERTY',   name: 'Kochłowice — Szyb Radoszowy', shortName: 'Szyb Radoszowy', district: 'Kochłowice', group: 'KOCHLOWICE', price: 160, buildCost: 90, rents: [16, 75, 210, 560, 760, 970] },
    { index: 15, type: 'TRANSPORT',  name: 'Dworzec PKP Ruda Śląska', shortName: 'PKP Ruda Śl.', district: 'Koleje Śląskie', group: 'TRANSPORT', price: 200, rents: [40, 80, 160, 320] },
    { index: 16, type: 'PROPERTY',   name: 'Bykowina — Gwarek', shortName: 'Bykowina', district: 'Bykowina', group: 'BYKOWINA', price: 180, buildCost: 110, rents: [18, 85, 230, 620, 820, 1020] },
    { index: 17, type: 'TREASURE',   name: 'Skarb Skarbnika', shortName: 'Skarb', district: 'Kasa Kopalni' },
    { index: 18, type: 'PROPERTY',   name: 'Bykowina — ul. Górnośląska', shortName: 'Górnośląska', district: 'Bykowina', group: 'BYKOWINA', price: 180, buildCost: 110, rents: [18, 85, 230, 620, 820, 1020] },
    { index: 19, type: 'PROPERTY',   name: 'Bykowina — Planetarium Skałka', shortName: 'Skałka', district: 'Bykowina', group: 'BYKOWINA', price: 200, buildCost: 110, rents: [20, 95, 260, 720, 890, 1080] },
    { index: 20, type: 'VACATION',   name: 'Hałda Widokowa', shortName: 'Hałda', subtitle: 'Pula Miasta' },
    { index: 21, type: 'PROPERTY',   name: 'Bielszowice — Dom Kultury', shortName: 'Bielszowice', district: 'Bielszowice', group: 'BIELSZOWICE', price: 220, buildCost: 130, rents: [22, 105, 310, 760, 940, 1120] },
    { index: 22, type: 'SURPRISE',   name: 'Szansa na Szychcie', shortName: 'Szansa', district: 'Losowanie' },
    { index: 23, type: 'PROPERTY',   name: 'Bielszowice — ul. Kokota', shortName: 'ul. Kokota', district: 'Bielszowice', group: 'BIELSZOWICE', price: 220, buildCost: 130, rents: [22, 105, 310, 760, 940, 1120] },
    { index: 24, type: 'PROPERTY',   name: 'Bielszowice — KWK Ruda Ruch', shortName: 'KWK Ruda', district: 'Bielszowice', group: 'BIELSZOWICE', price: 240, buildCost: 130, rents: [24, 115, 340, 810, 990, 1180] },
    { index: 25, type: 'TRANSPORT',  name: 'Węzeł DTŚ Ruda Śląska', shortName: 'Węzeł DTŚ', district: 'Trasa Średnicowa', group: 'TRANSPORT', price: 200, rents: [40, 80, 160, 320] },
    { index: 26, type: 'PROPERTY',   name: 'Halemba — Aquadrom', shortName: 'Aquadrom', district: 'Halemba', group: 'HALEMBA', price: 260, buildCost: 150, rents: [26, 125, 370, 860, 1040, 1220] },
    { index: 27, type: 'PROPERTY',   name: 'Halemba — Elektrownia Halemba', shortName: 'El. Halemba', district: 'Halemba', group: 'HALEMBA', price: 260, buildCost: 150, rents: [26, 125, 370, 860, 1040, 1220] },
    { index: 28, type: 'UTILITY',    name: 'Wodociągi Rudzkie PWiK', shortName: 'Wodociągi', district: 'Infrastruktura', group: 'UTILITY', price: 150 },
    { index: 29, type: 'PROPERTY',   name: 'Halemba — KWK Halemba', shortName: 'KWK Halemba', district: 'Halemba', group: 'HALEMBA', price: 280, buildCost: 150, rents: [28, 135, 400, 920, 1120, 1300] },
    { index: 30, type: 'GO_TO_JAIL', name: 'Alarm Metanowy!', shortName: 'Na Izbę!', subtitle: 'Idź na Izbę' },
    { index: 31, type: 'PROPERTY',   name: 'Wirek — Kolonia Ficinus', shortName: 'Ficinus', district: 'Wirek', group: 'WIREK', price: 300, buildCost: 175, rents: [30, 150, 450, 1000, 1200, 1400] },
    { index: 32, type: 'PROPERTY',   name: 'Wirek — Szyb Andrzej', shortName: 'Szyb Andrzej', district: 'Wirek', group: 'WIREK', price: 300, buildCost: 175, rents: [30, 150, 450, 1000, 1200, 1400] },
    { index: 33, type: 'TREASURE',   name: 'Skarb Skarbnika', shortName: 'Skarb', district: 'Kasa Kopalni' },
    { index: 34, type: 'PROPERTY',   name: 'Wirek — CH Plaza Ruda Śląska', shortName: 'CH Plaza', district: 'Wirek', group: 'WIREK', price: 320, buildCost: 175, rents: [34, 165, 490, 1060, 1260, 1480] },
    { index: 35, type: 'TRANSPORT',  name: 'Węzeł Autostrady A4 Wirek', shortName: 'Węzeł A4', district: 'Autostrada A4', group: 'TRANSPORT', price: 200, rents: [40, 80, 160, 320] },
    { index: 36, type: 'SURPRISE',   name: 'Szansa na Szychcie', shortName: 'Szansa', district: 'Losowanie' },
    { index: 37, type: 'PROPERTY',   name: 'Nowy Bytom — Wielki Piec Huty Pokój', shortName: 'Huta Pokój', district: 'Nowy Bytom', group: 'NOWY_BYTOM', price: 350, buildCost: 200, rents: [40, 180, 520, 1120, 1320, 1550] },
    { index: 38, type: 'TAX',        name: 'Podatek Węglowy', shortName: 'Podatek', district: 'Opłata Specjalna', taxAmount: 100 },
    { index: 39, type: 'PROPERTY',   name: 'Nowy Bytom — Plac Jana Pawła II (Ratusz)', shortName: 'Ratusz N.Bytom', district: 'Nowy Bytom', group: 'NOWY_BYTOM', price: 400, buildCost: 200, rents: [55, 220, 620, 1400, 1700, 2000] }
  ];

  const SURPRISE_CARDS = [
    { text: 'Odkryto bogatą żyłę węgla w KWK Halemba! Otrzymujesz +$160 premii.', action: 'CASH', amount: 160 },
    { text: 'Przejazd Drogową Trasą Średnicową prosto na START! Pobierz +$250.', action: 'MOVE_TO', target: 0 },
    { text: 'Składka na zabezpieczenie szybu — wpłać $90 do puli miasta.', action: 'TAX_POOL', amount: 90 },
    { text: 'Otrzymujesz Kartę Wolności od Wyższego Urzędu Górniczego!', action: 'PARDON' },
    { text: 'Dywidenda z Wielkiego Pieca Huty Pokój: +$140.', action: 'CASH', amount: 140 },
    { text: 'Kontrola OUG na szychcie! Przejdź natychmiast na Izbę.', action: 'GO_JAIL' }
  ];

  const TREASURE_CARDS = [
    { text: 'Premia Barbórkowa z Ratusza w Nowym Bytomiu: +$150!', action: 'CASH', amount: 150 },
    { text: 'Zysk z najmu powierzchni w CH Plaza Wirek: +$180.', action: 'CASH', amount: 180 },
    { text: 'Fundusz rekultywacji hałd: wpłać $80 do puli miasta.', action: 'TAX_POOL', amount: 80 },
    { text: 'Karczma Piwna! Każdy aktywny gracz wypłaca Ci po $35.', action: 'BIRTHDAY', amount: 35 }
  ];

  /* ==================== 2. DUŻE, WYRAŹNE IKONY GÓRNICZE SVG ==================== */
  const SVG_ICONS = {
    START: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#a6ff00" stroke-width="2.4"><polygon points="5 4 15 12 5 20 5 4" fill="#a6ff00"/><polygon points="13 4 21 12 13 20 13 4" fill="#a6ff00"/></svg>`,
    JAIL: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ff9800" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
    VACATION: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#2ecc71" stroke-width="2.2"><path d="M2 20h20L15 6l-4 7-3-3-6 10z" fill="rgba(46,204,113,0.3)"/></svg>`,
    GO_TO_JAIL: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ff5252" stroke-width="2.3"><circle cx="12" cy="12" r="9" fill="rgba(255,82,82,0.2)"/><line x1="12" y1="7" x2="12" y2="13"/><circle cx="12" cy="17" r="1.2" fill="#ff5252"/></svg>`,
    TREASURE: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#ffca28" stroke-width="2"><rect x="3" y="6" width="18" height="14" rx="3" fill="rgba(255,202,40,0.25)"/><path d="M3 11h18"/><circle cx="12" cy="11" r="2" fill="#ffca28"/></svg>`,
    SURPRISE: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><circle cx="12" cy="12" r="10" fill="rgba(240,98,146,0.2)" stroke="#f06292" stroke-width="2"/><text x="8" y="17" fill="#f06292" font-size="15" font-weight="900">?</text></svg>`,
    TAX: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#cfd8dc" stroke-width="2"><path d="M12 2L3 7v2h18V7l-9-5z"/><line x1="6" y1="9" x2="6" y2="18"/><line x1="12" y1="9" x2="12" y2="18"/><line x1="18" y1="9" x2="18" y2="18"/><path d="M3 18h18v3H3z"/></svg>`,
    TRANSPORT: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#81d4fa" stroke-width="2"><rect x="4" y="3" width="16" height="13" rx="3" fill="rgba(129,212,250,0.2)"/><line x1="4" y1="10" x2="20" y2="10"/><circle cx="8" cy="13.5" r="1" fill="#fff"/><circle cx="16" cy="13.5" r="1" fill="#fff"/><path d="M7 16l-2 4m12-4l2 4"/></svg>`,
    UTILITY: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ffca28" stroke-width="2.2"><polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2" fill="rgba(255,202,40,0.28)"/></svg>`,
    MINE_TOWER: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" stroke-width="2.2"><circle cx="12" cy="6" r="3.5"/><path d="M6 21L10 9m8 12L14 9M5 21h14"/></svg>`
  };

  /* ==================== 3. SYNTEZATOR DŹWIĘKÓW ==================== */
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
  }
  const sfx = new SoundEngine();

  /* ==================== 4. STAN GLOBALNY I FIREBASE REALTIME DATABASE ==================== */
  let myClientToken = localStorage.getItem('ruda_client_token');
  if (!myClientToken) {
    myClientToken = 'cl_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
    localStorage.setItem('ruda_client_token', myClientToken);
  }

  let gameState = null;
  let selectedGameMode = 'MONOPOLY';
  let selectedTileIndex = 1;
  let activePerspectiveId = 'p1';
  let myOnlinePlayerId = null;
  let currentRoomCode = 'LOKALNY';
  let isRollingLock = false;
  let turnTimerInterval = null;

  let firebaseDb = null;
  let activeFirebaseUrl = '';
  let firebaseRoomRef = null;
  let broadcastChannel = null;

  let localPickedColor = PLAYER_COLORS[0].hex;
  let onlinePickedColor = PLAYER_COLORS[1].hex;
  let lobbyOpponents = [
    { name: 'Bot KWK Halemba', isBot: true, color: PLAYER_COLORS[1].hex },
    { name: 'Bot Huta Pokój',  isBot: true, color: PLAYER_COLORS[2].hex },
    { name: 'Bot Wirek',       isBot: true, color: PLAYER_COLORS[3].hex }
  ];

  function nowTime() { return new Date().toTimeString().slice(0, 5); }

  function setBannerStatus(msg, color = '#00e5ff') {
    const el = document.getElementById('net-status-banner');
    if (el) { el.textContent = msg; el.style.color = color; }
  }

  /**
   * Inicjalizacja Firebase Realtime Database z samego URL lub obiektu JSON
   */
  function connectFirebaseDatabase(rawInput) {
    if (!rawInput || !window.firebase) return false;
    let cfg = null;
    const str = typeof rawInput === 'string' ? rawInput.trim() : JSON.stringify(rawInput);
    if (!str) return false;

    if (str.startsWith('http://') || str.startsWith('https://')) {
      cfg = { databaseURL: str.replace(/\/$/, '') };
    } else {
      try { cfg = JSON.parse(str); } catch (e) { return false; }
    }

    if (!cfg || !cfg.databaseURL) return false;

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(cfg);
      }
      firebaseDb = firebase.database();
      activeFirebaseUrl = cfg.databaseURL;
      localStorage.setItem('ruda_firebase_url', activeFirebaseUrl);

      const urlInput = document.getElementById('firebase-url-input');
      if (urlInput) urlInput.value = activeFirebaseUrl;

      const fbPill = document.getElementById('fb-conn-pill');
      if (fbPill) {
        fbPill.textContent = '✅ Firebase Połączony';
        fbPill.className = 'fb-pill connected';
      }
      const topDot = document.getElementById('top-net-dot');
      if (topDot) topDot.classList.add('firebase');

      setBannerStatus('✅ Połączono z bazą Firebase Realtime Database! Możesz tworzyć i dołączać do pokojów przez Internet.', '#2ecc71');
      return true;
    } catch (err) {
      console.error('Firebase error:', err);
      return false;
    }
  }

  function buildShareInviteLink(roomCode) {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', roomCode);
    if (activeFirebaseUrl) {
      url.searchParams.set('db', btoa(activeFirebaseUrl));
    }
    return url.toString();
  }

  function normalizeState(st) {
    if (!st) return null;
    st.players = Array.isArray(st.players) ? st.players : Object.values(st.players || {});
    st.trades  = Array.isArray(st.trades)  ? st.trades  : Object.values(st.trades || {});
    st.feed    = Array.isArray(st.feed)    ? st.feed    : Object.values(st.feed || {});
    st.chat    = Array.isArray(st.chat)    ? st.chat    : Object.values(st.chat || {});
    st.builtThisTurn = !!st.builtThisTurn;

    if (!st.properties) st.properties = {};
    BOARD_TILES.forEach(t => {
      if (t.type === 'PROPERTY' || t.type === 'TRANSPORT' || t.type === 'UTILITY') {
        if (!st.properties[t.index]) {
          st.properties[t.index] = { ownerId: null, level: 0, mortgaged: false, history: ['Dostępne w zasobach Miasta'] };
        } else {
          const p = st.properties[t.index];
          if (!p.ownerId) p.ownerId = null;
          if (typeof p.level !== 'number') p.level = 0;
          p.mortgaged = !!p.mortgaged;
          p.history = Array.isArray(p.history) ? p.history : Object.values(p.history || ['Dostępne']);
        }
      }
    });

    if (!st.ludo || !st.ludo.pawns) st.ludo = createLudoState();
    else {
      st.ludo.pawns = [0,1,2,3].map(i => {
        const row = st.ludo.pawns[i];
        return Array.isArray(row) ? row : Object.values(row || [-1,-1,-1,-1]);
      });
      if (st.ludo.winner === undefined) st.ludo.winner = null;
    }

    if (!st.checkers || !st.checkers.boardJson) st.checkers = createCheckersState();
    if (!st.chess || !st.chess.boardJson)       st.chess = createChessState();
    if (!st.connect4 || !st.connect4.boardJson) st.connect4 = createConnect4State();

    return st;
  }

  /* ==================== 5. FABRYKA STANÓW WSZYSTKICH 5 GIER ==================== */
  function createLudoState() {
    return {
      turn: 0,
      dice: 6,
      rolled: false,
      winner: null,
      pawns: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1]
      ]
    };
  }

  function createCheckersState() {
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = { p: 1, king: false };
    }
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = { p: 0, king: false };
    }
    return { turn: 0, boardJson: JSON.stringify(b), captured: [0, 0], winner: null };
  }

  function createChessState() {
    const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let c = 0; c < 8; c++) {
      b[0][c] = { p: 1, type: back[c] };
      b[1][c] = { p: 1, type: 'P' };
      b[6][c] = { p: 0, type: 'P' };
      b[7][c] = { p: 0, type: back[c] };
    }
    return { turn: 0, boardJson: JSON.stringify(b), winner: null, lastMove: 'Wybierz figurę, aby zobaczyć podświetlone ruchy.' };
  }

  function createConnect4State() {
    const b = Array(6).fill(null).map(() => Array(7).fill(null));
    return { turn: 0, boardJson: JSON.stringify(b), winner: null };
  }

  function createFreshGameState(playersList, startingCash, roomCode = 'LOKALNY', isOnline = false, initialGame = 'MONOPOLY') {
    const propertiesState = {};
    BOARD_TILES.forEach(tile => {
      if (tile.type === 'PROPERTY' || tile.type === 'TRANSPORT' || tile.type === 'UTILITY') {
        propertiesState[tile.index] = {
          ownerId: null,
          level: 0,
          mortgaged: false,
          history: ['Dostępne w zasobach Miasta Ruda Śląska']
        };
      }
    });

    return {
      roomCode: roomCode,
      isOnline: isOnline,
      lobbyOpen: isOnline,
      activeGame: initialGame,
      status: 'PLAYING',
      round: 1,
      turnIndex: 0,
      turnPhase: 'ROLL',
      builtThisTurn: false,
      lastDice: [6, 5],
      doublesStreak: 0,
      vacationPool: 100,
      turnSecondsLeft: 120,
      players: playersList.map((p, idx) => ({
        id: p.id || ('p' + (idx + 1)),
        clientToken: p.clientToken || '',
        name: p.name,
        color: p.color,
        isBot: !!p.isBot,
        cash: Number(startingCash),
        position: 0,
        inJail: false,
        jailTurns: 0,
        pardonCards: 0,
        bankrupt: false
      })),
      properties: propertiesState,
      trades: [],
      ludo: createLudoState(),
      checkers: createCheckersState(),
      chess: createChessState(),
      connect4: createConnect4State(),
      feed: [
        { text: '⚒️ Rozpoczęto rozgrywkę w Rudzie Śląskiej! Limit budowy w Monopoly: 1 domek na turę.', time: nowTime() }
      ],
      chat: [
        { author: 'Skarbnik', color: '#ffca28', text: 'Szczęść Boże! Możecie w każdej chwili przełączać 5 gier na górnym pasku.', time: nowTime() }
      ]
    };
  }

  /* ==================== 6. SYNCHRONIZACJA POKOJU (FIREBASE + MULTI-TAB) ==================== */
  function subscribeToRoom(roomCode) {
    currentRoomCode = roomCode;
    const topLabel = document.getElementById('top-room-label');
    if (topLabel) topLabel.textContent = 'Pokój: ' + roomCode;

    if (broadcastChannel) broadcastChannel.close();
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('ruda_arena_' + roomCode);
      broadcastChannel.onmessage = (ev) => {
        if (ev.data && ev.data.type === 'SYNC') {
          gameState = normalizeState(ev.data.state);
          syncMyOnlineIdentity();
          if (gameState.isOnline && !gameState.lobbyOpen) {
            document.getElementById('lobby-overlay').classList.add('hidden');
          }
          renderAll();
          updateLobbyWaitingRoom();
        }
      };
    }

    if (firebaseDb && roomCode !== 'LOKALNY') {
      if (firebaseRoomRef) firebaseRoomRef.off();
      firebaseRoomRef = firebaseDb.ref('rooms/' + roomCode);
      firebaseRoomRef.on('value', (snap) => {
        const val = snap.val();
        if (val) {
          gameState = normalizeState(val);
          syncMyOnlineIdentity();
          if (gameState.isOnline && !gameState.lobbyOpen) {
            document.getElementById('lobby-overlay').classList.add('hidden');
          }
          renderAll();
          updateLobbyWaitingRoom();
        }
      });
    }
  }

  function syncMyOnlineIdentity() {
    if (!gameState || !gameState.isOnline) return;
    const me = gameState.players.find(p => p.clientToken === myClientToken);
    if (me) {
      myOnlinePlayerId = me.id;
      activePerspectiveId = me.id;
    }
  }

  function pushStateSync() {
    if (!gameState) return;
    try { localStorage.setItem('ruda_room_' + gameState.roomCode, JSON.stringify(gameState)); } catch (e) {}

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC', state: gameState });
    }
    if (firebaseDb && gameState.roomCode !== 'LOKALNY') {
      firebaseDb.ref('rooms/' + gameState.roomCode).set(gameState);
    }
    renderAll();
  }

  /* ==================== 7. LOGIKA GRY 1: MONOPOLY RUDY ŚLĄSKIEJ ==================== */
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
    board.querySelectorAll('.board-tile').forEach(el => el.remove());

    BOARD_TILES.forEach(tile => {
      const pos = getGridPosition(tile.index);
      const cell = document.createElement('div');
      cell.className = `board-tile ${pos.edge === 'corner' ? 'corner-tile' : pos.edge}`;
      cell.style.gridRow = pos.row;
      cell.style.gridColumn = pos.col;
      cell.dataset.index = tile.index;
      cell.title = tile.name;

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
          ? `<div class="tile-badge-circle" style="background:${grp.color}" title="Dzielnica: ${tile.district}">${SVG_ICONS.MINE_TOWER}</div>`
          : `<div class="tile-special-svg">${SVG_ICONS[tile.type] || ''}</div>`;
        const priceHtml = tile.price
          ? `<span class="tile-price-tag">$${tile.price}</span>`
          : (tile.taxAmount ? `<span class="tile-price-tag">-$${tile.taxAmount}</span>` : '');

        cell.innerHTML = `
          ${colorBarHtml}
          <div class="owner-outer-cap hidden" id="cap-${tile.index}"></div>
          ${priceHtml}
          <div class="tile-title">${tile.shortName}</div>
          ${badgeHtml}
          <div class="tile-tokens-box" id="tokens-${tile.index}"></div>
        `;
      }

      cell.addEventListener('click', () => {
        selectedTileIndex = tile.index;
        renderInspector(tile.index);
        if (tile.type === 'PROPERTY' || tile.type === 'TRANSPORT' || tile.type === 'UTILITY') {
          openPropertyModal(tile.index);
        }
        renderBoardHighlights();
      });

      board.appendChild(cell);
    });
  }

  function getPlayerById(id) { return gameState.players.find(p => p.id === id); }
  function currentTurnPlayer() { return gameState.players[gameState.turnIndex] || gameState.players[0]; }

  function canControlTurn(turnPlayerIdx = gameState.turnIndex) {
    if (!gameState || gameState.status !== 'PLAYING') return false;
    const active = gameState.players[turnPlayerIdx % gameState.players.length];
    if (!active || active.isBot) return false;
    if (gameState.isOnline && myOnlinePlayerId) {
      return active.id === myOnlinePlayerId;
    }
    return true;
  }

  function calculateRent(tileIndex, diceSum = 7) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    if (!prop || !prop.ownerId || prop.mortgaged) return 0;

    if (tile.type === 'PROPERTY') {
      let base = tile.rents[prop.level];
      if (prop.level === 0) {
        const groupTiles = BOARD_TILES.filter(t => t.group === tile.group);
        const ownsAll = groupTiles.every(t => gameState.properties[t.index]?.ownerId === prop.ownerId);
        if (ownsAll) base = Math.round(base * 1.5);
      }
      return base;
    }
    if (tile.type === 'TRANSPORT') {
      const cnt = BOARD_TILES.filter(t => t.type === 'TRANSPORT' && gameState.properties[t.index]?.ownerId === prop.ownerId).length;
      return tile.rents[Math.max(0, cnt - 1)] || 40;
    }
    if (tile.type === 'UTILITY') {
      const cnt = BOARD_TILES.filter(t => t.type === 'UTILITY' && gameState.properties[t.index]?.ownerId === prop.ownerId).length;
      return cnt >= 2 ? diceSum * 10 : diceSum * 5;
    }
    return 0;
  }

  /**
   * ZASADA ROZBUDOWY:
   * - Nie wymaga posiadania całego koloru (monopolu)
   * - Limit: tylko 1 domek na turę (`gameState.builtThisTurn`)
   */
  function canUpgradeProperty(tileIndex, playerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const player = getPlayerById(playerId);
    const active = currentTurnPlayer();

    if (!tile || tile.type !== 'PROPERTY') return { ok: false, reason: 'Tego pola nie można rozbudowywać.' };
    if (!prop || prop.ownerId !== playerId) return { ok: false, reason: 'Nie jesteś właścicielem tej dzielnicy.' };
    if (!active || active.id !== playerId) return { ok: false, reason: 'Budować możesz tylko podczas swojej tury.' };
    if (gameState.builtThisTurn) return { ok: false, reason: '⏳ Wykorzystano już limit budowy (1 domek na turę).' };
    if (prop.mortgaged) return { ok: false, reason: 'Nieruchomość jest pod hipoteką.' };
    if (prop.level >= 5) return { ok: false, reason: 'Osiągnięto maksymalny poziom (Poziom 5).' };
    if (!player || player.cash < tile.buildCost) return { ok: false, reason: `Brakuje Ci $${tile.buildCost - (player?.cash || 0)}.` };
    return { ok: true, reason: '✅ Możesz wybudować 1 domek w tej turze (monopol nie jest wymagany).' };
  }

  function buildHouseOnProperty(tileIndex, playerId) {
    const check = canUpgradeProperty(tileIndex, playerId);
    if (!check.ok) return false;
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const player = getPlayerById(playerId);

    player.cash -= tile.buildCost;
    prop.level += 1;
    gameState.builtThisTurn = true;
    const lvlName = prop.level === 5 ? 'Kompleks Górniczy / Hotel' : `Dom #${prop.level}`;
    prop.history.unshift(`${nowTime()} — ${player.name} zbudował ${lvlName} za $${tile.buildCost}`);
    addFeedEvent(`<strong>${player.name}</strong> zbudował 🏠 (${lvlName}) w <strong>${tile.shortName}</strong>`);
    sfx.build();

    const cellEl = document.querySelector(`.board-tile[data-index="${tileIndex}"]`);
    if (cellEl) {
      cellEl.classList.remove('upgraded-flash');
      void cellEl.offsetWidth;
      cellEl.classList.add('upgraded-flash');
    }

    pushStateSync();
    return true;
  }

  function sellHouseOnProperty(tileIndex, playerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const player = getPlayerById(playerId);
    if (!prop || prop.ownerId !== playerId || prop.level <= 0) return false;
    const refund = Math.floor(tile.buildCost * 0.5);
    prop.level -= 1;
    player.cash += refund;
    prop.history.unshift(`${nowTime()} — Sprzedano dom (+$${refund})`);
    addFeedEvent(`<strong>${player.name}</strong> sprzedał dom w <strong>${tile.shortName}</strong> (+$${refund})`);
    pushStateSync();
    return true;
  }

  function toggleMortgageProperty(tileIndex, playerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const player = getPlayerById(playerId);
    if (!prop || prop.ownerId !== playerId) return false;

    if (!prop.mortgaged) {
      if (prop.level > 0) return false;
      const val = Math.floor(tile.price * 0.5);
      prop.mortgaged = true;
      player.cash += val;
      addFeedEvent(`<strong>${player.name}</strong> zastawił hipoteką <strong>${tile.shortName}</strong> (+$${val})`);
    } else {
      const payoff = Math.ceil(tile.price * 0.55);
      if (player.cash < payoff) return false;
      player.cash -= payoff;
      prop.mortgaged = false;
      addFeedEvent(`<strong>${player.name}</strong> spłacił hipotekę <strong>${tile.shortName}</strong> (-$${payoff})`);
    }
    pushStateSync();
    return true;
  }

  function addFeedEvent(htmlText) {
    gameState.feed.unshift({ text: htmlText, time: nowTime() });
    if (gameState.feed.length > 40) gameState.feed.pop();
  }

  function animateStepByStepMove(player, stepsCount, onComplete) {
    let rem = stepsCount;
    function step() {
      if (rem <= 0) {
        const landedCell = document.querySelector(`.board-tile[data-index="${player.position}"]`);
        if (landedCell) {
          landedCell.classList.remove('active-landed-tile');
          void landedCell.offsetWidth;
          landedCell.classList.add('active-landed-tile');
        }
        onComplete();
        return;
      }
      rem -= 1;
      player.position = (player.position + 1) % 40;
      if (player.position === 0) {
        player.cash += 250;
        addFeedEvent(`⏩ <strong>${player.name}</strong> minął START i odebrał <strong>+$250</strong>!`);
        sfx.buy();
      } else {
        sfx.step();
      }
      selectedTileIndex = player.position;
      renderMonopolyBoard();
      setTimeout(step, 105);
    }
    step();
  }

  function handleRollDice() {
    if (!gameState || gameState.activeGame !== 'MONOPOLY' || gameState.turnPhase !== 'ROLL' || isRollingLock) return;
    const player = currentTurnPlayer();
    if (!player || player.bankrupt) return;
    if (!player.isBot && !canControlTurn()) return;

    isRollingLock = true;
    sfx.dice();

    const d1El = document.getElementById('die-box-1');
    const d2El = document.getElementById('die-box-2');
    d1El.classList.add('rolling');
    d2El.classList.add('rolling');

    setTimeout(() => {
      d1El.classList.remove('rolling');
      d2El.classList.remove('rolling');

      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2;
      const isDouble = d1 === d2;

      gameState.lastDice = [d1, d2];
      d1El.dataset.val = d1;
      d2El.dataset.val = d2;

      if (player.inJail) {
        if (isDouble) {
          player.inJail = false;
          player.jailTurns = 0;
          addFeedEvent(`<strong>${player.name}</strong> wyrzucił dublet (${d1}+${d2}) i wychodzi z Izby!`);
        } else {
          player.jailTurns += 1;
          if (player.jailTurns >= 3) {
            player.cash -= 100;
            player.inJail = false;
            player.jailTurns = 0;
            addFeedEvent(`<strong>${player.name}</strong> opłacił $100 kaucji po 3 turach na Izbie.`);
          } else {
            addFeedEvent(`<strong>${player.name}</strong> zostaje na Izbie (${d1}+${d2}).`);
            gameState.turnPhase = 'END';
            isRollingLock = false;
            pushStateSync();
            if (player.isBot) setTimeout(botMonopolyTurn, 650);
            return;
          }
        }
      }

      if (isDouble) {
        gameState.doublesStreak += 1;
        if (gameState.doublesStreak >= 3) {
          player.position = 10;
          player.inJail = true;
          gameState.doublesStreak = 0;
          gameState.turnPhase = 'END';
          addFeedEvent(`🚨 <strong>${player.name}</strong> wyrzucił 3 dublety i trafia na Izbę!`);
          isRollingLock = false;
          pushStateSync();
          if (player.isBot) setTimeout(botMonopolyTurn, 650);
          return;
        }
      } else {
        gameState.doublesStreak = 0;
      }

      animateStepByStepMove(player, sum, () => {
        resolveLandedTile(player, player.position, sum);
        isRollingLock = false;
        pushStateSync();
        if (player.isBot) setTimeout(botMonopolyTurn, 750);
      });
    }, 430);
  }

  function resolveLandedTile(player, tileIndex, diceSum) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const alertEl = document.getElementById('center-card-alert');
    alertEl.classList.add('hidden');

    addFeedEvent(`<strong>${player.name}</strong> wyrzucił ${gameState.lastDice[0]}+${gameState.lastDice[1]} ➔ <strong>${tile.name}</strong>`);

    if (tile.type === 'PROPERTY' || tile.type === 'TRANSPORT' || tile.type === 'UTILITY') {
      if (!prop.ownerId) {
        gameState.turnPhase = 'DECIDE';
        return;
      }
      if (prop.ownerId !== player.id && !prop.mortgaged) {
        const owner = getPlayerById(prop.ownerId);
        const rent = calculateRent(tileIndex, diceSum);
        player.cash -= rent;
        owner.cash += rent;
        sfx.rent();
        addFeedEvent(`💸 <strong>${player.name}</strong> zapłacił <strong>$${rent}</strong> czynszu dla <strong>${owner.name}</strong>`);
        if (player.cash < 0) declareBankruptcy(player.id, owner.id);
      }
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'TAX') {
      const tax = tile.taxAmount || 120;
      player.cash -= tax;
      gameState.vacationPool += tax;
      addFeedEvent(`🏛️ <strong>${player.name}</strong> wpłacił <strong>$${tax}</strong> podatku do puli miasta.`);
      if (player.cash < 0) declareBankruptcy(player.id, null);
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'VACATION') {
      const bonus = gameState.vacationPool;
      player.cash += bonus;
      gameState.vacationPool = 50;
      addFeedEvent(`🏖️ <strong>${player.name}</strong> zgarnia pulę z Hałdy Widokowej: <strong>+$${bonus}</strong>!`);
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'GO_TO_JAIL') {
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      gameState.doublesStreak = 0;
      addFeedEvent(`🚨 <strong>${player.name}</strong> skierowany na Izbę!`);
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'SURPRISE' || tile.type === 'TREASURE') {
      const deck = tile.type === 'SURPRISE' ? SURPRISE_CARDS : TREASURE_CARDS;
      const card = deck[Math.floor(Math.random() * deck.length)];
      alertEl.textContent = card.text;
      alertEl.classList.remove('hidden');
      addFeedEvent(`🃏 <strong>${player.name}</strong>: "${card.text}"`);

      if (card.action === 'CASH') player.cash += card.amount;
      if (card.action === 'TAX_POOL') { player.cash -= card.amount; gameState.vacationPool += card.amount; }
      if (card.action === 'PARDON') player.pardonCards += 1;
      if (card.action === 'GO_JAIL') { player.position = 10; player.inJail = true; }
      if (card.action === 'MOVE_TO') {
        if (card.target < player.position) player.cash += 250;
        player.position = card.target;
      }
      if (card.action === 'BIRTHDAY') {
        gameState.players.forEach(o => {
          if (o.id !== player.id && !o.bankrupt) { o.cash -= card.amount; player.cash += card.amount; }
        });
      }
      if (player.cash < 0) declareBankruptcy(player.id, null);
      gameState.turnPhase = 'END';
      return;
    }

    gameState.turnPhase = 'END';
  }

  function buyCurrentField() {
    const player = currentTurnPlayer();
    if (!player.isBot && !canControlTurn()) return;
    const tile = BOARD_TILES[player.position];
    const prop = gameState.properties[player.position];
    if (!prop || prop.ownerId || player.cash < tile.price) return;

    player.cash -= tile.price;
    prop.ownerId = player.id;
    prop.history.unshift(`${nowTime()} — Kupione przez ${player.name} za $${tile.price}`);
    sfx.buy();
    addFeedEvent(`<strong>${player.name}</strong> kupił <strong>${tile.name}</strong> za <strong>$${tile.price}</strong>`);
    gameState.turnPhase = 'END';
    pushStateSync();
    if (player.isBot) setTimeout(botMonopolyTurn, 550);
  }

  function endCurrentTurn() {
    if (!gameState) return;
    const player = currentTurnPlayer();
    if (!player.isBot && !canControlTurn()) return;

    if (gameState.doublesStreak > 0 && !player.inJail && !player.bankrupt) {
      gameState.turnPhase = 'ROLL';
      gameState.builtThisTurn = false;
      addFeedEvent(`🎲 <strong>${player.name}</strong> ma dodatkowy rzut za dublet!`);
      pushStateSync();
      if (player.isBot) setTimeout(handleRollDice, 700);
      return;
    }

    const total = gameState.players.length;
    let nextIdx = gameState.turnIndex;
    for (let i = 1; i <= total; i++) {
      const cand = (gameState.turnIndex + i) % total;
      if (!gameState.players[cand].bankrupt) {
        if (cand <= gameState.turnIndex) gameState.round += 1;
        nextIdx = cand;
        break;
      }
    }

    gameState.turnIndex = nextIdx;
    gameState.turnPhase = 'ROLL';
    gameState.builtThisTurn = false;
    gameState.doublesStreak = 0;
    gameState.turnSecondsLeft = 120;

    const nextP = currentTurnPlayer();
    if (!gameState.isOnline && !nextP.isBot) activePerspectiveId = nextP.id;
    pushStateSync();

    if (nextP.isBot && gameState.activeGame === 'MONOPOLY') {
      setTimeout(handleRollDice, 750);
    }
  }

  function botMonopolyTurn() {
    if (!gameState || gameState.activeGame !== 'MONOPOLY') return;
    const bot = currentTurnPlayer();
    if (!bot || !bot.isBot || bot.bankrupt) return;

    if (gameState.turnPhase === 'DECIDE') {
      const tile = BOARD_TILES[bot.position];
      if (bot.cash >= tile.price + 80) {
        buyCurrentField();
        return;
      } else {
        gameState.turnPhase = 'END';
      }
    }

    if (!gameState.builtThisTurn) {
      const myProps = BOARD_TILES.filter(t => t.type === 'PROPERTY' && gameState.properties[t.index]?.ownerId === bot.id);
      for (const t of myProps) {
        if (bot.cash > t.buildCost + 250 && canUpgradeProperty(t.index, bot.id).ok) {
          buildHouseOnProperty(t.index, bot.id);
          break;
        }
      }
    }
    setTimeout(endCurrentTurn, 600);
  }

  function declareBankruptcy(playerId, creditorId = null) {
    const player = getPlayerById(playerId);
    if (!player || player.bankrupt) return;
    player.bankrupt = true;
    player.cash = 0;
    Object.keys(gameState.properties).forEach(idx => {
      const prop = gameState.properties[idx];
      if (prop.ownerId === playerId) {
        prop.ownerId = creditorId || null;
        if (!creditorId) { prop.level = 0; prop.mortgaged = false; }
      }
    });
    addFeedEvent(`💀 <strong>${player.name}</strong> zbankrutował!`);
    const alive = gameState.players.filter(p => !p.bankrupt);
    if (alive.length === 1) {
      showGenericModal('👑 Zwycięzca Rudy Śląskiej!', `<h3 style="text-align:center;color:#ffca28;">${alive[0].name} wygrywa całe miasto!</h3>`);
    }
    if (currentTurnPlayer().id === playerId) endCurrentTurn();
    else pushStateSync();
  }

  /* ==================== 8. GRA 2: CHIŃCZYK (SZYCHTA 4 DZIELNIC) ==================== */
  const LUDO_TRACK = [
    [4,0],[4,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,4],[0,4],[0,5],
    [0,6],[1,6],[2,6],[3,6],[4,6],[4,7],[4,8],[4,9],[4,10],[5,10],
    [6,10],[6,9],[6,8],[6,7],[6,6],[7,6],[8,6],[9,6],[10,6],[10,5],
    [10,4],[9,4],[8,4],[7,4],[6,4],[6,3],[6,2],[6,1],[6,0],[5,0]
  ];
  const LUDO_BASES = [
    [[1,1],[1,2],[2,1],[2,2]],
    [[1,8],[1,9],[2,8],[2,9]],
    [[8,8],[8,9],[9,8],[9,9]],
    [[8,1],[8,2],[9,1],[9,2]]
  ];
  const LUDO_HOMES = [
    [[5,1],[5,2],[5,3],[5,4]],
    [[1,5],[2,5],[3,5],[4,5]],
    [[5,9],[5,8],[5,7],[5,6]],
    [[9,5],[8,5],[7,5],[6,5]]
  ];
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
    dieEl.classList.add('rolling');

    setTimeout(() => {
      dieEl.classList.remove('rolling');
      const allInBase = ludo.pawns[ludo.turn].every(s => s === -1);
      const d = (allInBase && Math.random() < 0.45) ? 6 : (Math.floor(Math.random() * 6) + 1);
      ludo.dice = d;
      ludo.rolled = true;
      dieEl.dataset.val = d;

      const anyMove = [0,1,2,3].some(i => canMoveLudoPawn(ludo.turn, i, d));
      if (!anyMove) {
        setTimeout(() => {
          ludo.rolled = false;
          ludo.turn = (ludo.turn + 1) % pCount;
          pushStateSync();
          checkBotForOtherGames();
        }, 600);
      } else {
        pushStateSync();
        if (curPlayer.isBot) {
          setTimeout(() => {
            const movableIdx = [0,1,2,3].find(i => canMoveLudoPawn(ludo.turn, i, ludo.dice));
            if (movableIdx !== undefined) moveLudoPawn(ludo.turn, movableIdx);
          }, 550);
        }
      }
    }, 360);
  }

  function moveLudoPawn(pIdx, pawnIdx) {
    const ludo = gameState.ludo;
    const pCount = Math.min(4, gameState.players.length);
    if (!ludo.rolled || ludo.turn !== pIdx) return;
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
      sfx.buy();
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

    document.getElementById('ludo-turn-text').textContent = ludo.winner !== null
      ? `🏆 Wygrywa: ${LUDO_NAMES[ludo.winner]}!`
      : `Kolej: ${curP?.name || LUDO_NAMES[ludo.turn]} (${LUDO_NAMES[ludo.turn]})`;
    document.getElementById('ludo-die').dataset.val = ludo.dice;
    document.getElementById('ludo-hint-text').textContent = ludo.rolled
      ? `Wyrzucono ${ludo.dice}! Kliknij migającego górnika na planszy.`
      : `Kliknij "Rzuć Kostką", aby wykonać ruch.`;

    grid.innerHTML = '';
    const cells = Array(11).fill(null).map(() => Array(11).fill(null));

    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const div = document.createElement('div');
        div.className = 'ludo-cell';
        if (r === 5 && c === 5) {
          div.style.background = '#ff9800';
          div.style.color = '#111';
          div.textContent = '⚒️';
        }
        cells[r][c] = div;
        grid.appendChild(div);
      }
    }

    LUDO_TRACK.forEach(([r, c], idx) => {
      cells[r][c].classList.add('track-cell');
      if (idx % 10 === 0) {
        cells[r][c].style.borderColor = LUDO_COLORS[idx / 10];
        cells[r][c].style.boxShadow = `inset 0 0 10px ${LUDO_COLORS[idx / 10]}88`;
      }
    });

    for (let p = 0; p < 4; p++) {
      LUDO_BASES[p].forEach(([r, c]) => {
        cells[r][c].style.background = LUDO_COLORS[p] + '24';
        cells[r][c].style.border = `2px solid ${LUDO_COLORS[p]}`;
      });
      LUDO_HOMES[p].forEach(([r, c]) => {
        cells[r][c].style.background = LUDO_COLORS[p] + '38';
        cells[r][c].style.border = `2px solid ${LUDO_COLORS[p]}`;
      });
    }

    for (let p = 0; p < pCount; p++) {
      for (let k = 0; k < 4; k++) {
        const step = ludo.pawns[p][k];
        const coords = (step === -1) ? LUDO_BASES[p][k] : (step < 40 ? LUDO_TRACK[(step + p * 10) % 40] : LUDO_HOMES[p][step - 40]);
        if (coords) {
          const pawnEl = document.createElement('div');
          const movable = ludo.rolled && ludo.turn === p && canMoveLudoPawn(p, k, ludo.dice);
          pawnEl.className = `ludo-pawn ${movable ? 'movable-pawn' : ''}`;
          pawnEl.style.background = LUDO_COLORS[p];
          pawnEl.textContent = k + 1;
          pawnEl.onclick = () => moveLudoPawn(p, k);
          cells[coords[0]][coords[1]].appendChild(pawnEl);
        }
      }
    }
  }

  /* ==================== 9. GRA 3: WARCABY GÓRNICZE ==================== */
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
    const p0 = gameState.players[0]?.name || 'Węgiel';
    const p1 = gameState.players[1]?.name || 'Stal';

    document.getElementById('checkers-turn-text').textContent = chk.winner !== null
      ? `🏆 Wygrywa: ${chk.winner === 0 ? p0 : p1}!`
      : `Ruch: ${chk.turn === 0 ? p0 + ' (Pomarańczowe)' : p1 + ' (Turkusowe)'}`;
    document.getElementById('checkers-score-text').textContent = `Zbicia: ${p0} (${chk.captured[0]}) — ${p1} (${chk.captured[1]})`;

    const validTargets = selectedChecker ? getCheckerMoves(board, selectedChecker.r, selectedChecker.c) : [];
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
          if (chk.winner !== null) return;
          if (targetMove) {
            executeCheckerMove(selectedChecker.r, selectedChecker.c, targetMove);
            selectedChecker = null;
            return;
          }
          if (cell && cell.p === chk.turn) {
            selectedChecker = { r, c };
            renderCheckersGame();
          }
        };
        grid.appendChild(sq);
      }
    }
  }

  function executeCheckerMove(fr, fc, move) {
    const chk = gameState.checkers;
    const board = JSON.parse(chk.boardJson);
    const piece = board[fr][fc];
    board[fr][fc] = null;
    board[move.r][move.c] = piece;

    if (move.jump) {
      board[move.jump[0]][move.jump[1]] = null;
      chk.captured[piece.p] += 1;
      sfx.rent();
    } else {
      sfx.step();
    }

    if ((piece.p === 0 && move.r === 0) || (piece.p === 1 && move.r === 7)) piece.king = true;
    if (chk.captured[0] >= 12) chk.winner = 0;
    if (chk.captured[1] >= 12) chk.winner = 1;

    chk.boardJson = JSON.stringify(board);
    chk.turn = 1 - chk.turn;
    pushStateSync();
    checkBotForOtherGames();
  }

  /* ==================== 10. GRA 4: SZACHY ŚLĄSKIE ==================== */
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
      const dir = p === 0 ? -1 : 1;
      const startRow = p === 0 ? 6 : 1;
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
    slideDirs.forEach(([dr, dc]) => {
      for (let s = 1; s < 8; s++) if (!addIfValid(r + dr * s, c + dc * s)) break;
    });
    return moves;
  }

  function renderChessGame() {
    const grid = document.getElementById('chess-grid');
    if (!grid || !gameState.chess) return;
    const ch = gameState.chess;
    const board = JSON.parse(ch.boardJson);
    const p0 = gameState.players[0]?.name || 'Huta Pokój';
    const p1 = gameState.players[1]?.name || 'KWK Halemba';

    document.getElementById('chess-turn-text').textContent = ch.winner !== null
      ? `🏆 Wygrywa: ${ch.winner === 0 ? p0 : p1}!`
      : `Ruch: ${ch.turn === 0 ? p0 + ' (Złote)' : p1 + ' (Błękitne)'}`;
    document.getElementById('chess-status-text').textContent = ch.lastMove || 'Kliknij figurę, aby zobaczyć ruchy.';

    const validMoves = selectedChessSq ? getValidChessMoves(board, selectedChessSq.r, selectedChessSq.c) : [];
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
          if (ch.winner !== null) return;
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
    const target = board[tr][tc];

    board[fr][fc] = null;
    board[tr][tc] = moving;
    if (moving.type === 'P' && (tr === 0 || tr === 7)) moving.type = 'Q';

    if (target && target.type === 'K') {
      ch.winner = moving.p;
      sfx.buy();
    } else {
      sfx.step();
    }

    ch.boardJson = JSON.stringify(board);
    ch.lastMove = `Ostatni ruch: ${CHESS_GLYPHS[moving.p][moving.type]} (${fr},${fc}) ➔ (${tr},${tc})`;
    ch.turn = 1 - ch.turn;
    pushStateSync();
    checkBotForOtherGames();
  }

  /* ==================== 11. GRA 5: SZTOLNIA 4 W RZĘDZIE ==================== */
  function dropConnect4Disc(col) {
    const c4 = gameState.connect4;
    if (!c4 || c4.winner !== null) return;
    const board = JSON.parse(c4.boardJson);

    let placedRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (board[r][col] === null) {
        board[r][col] = c4.turn;
        placedRow = r;
        break;
      }
    }
    if (placedRow === -1) return;
    sfx.step();

    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    const won = dirs.some(([dr, dc]) => {
      let count = 1;
      for (let s = 1; s < 4; s++) {
        const nr = placedRow + dr * s, nc = col + dc * s;
        if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr][nc] === c4.turn) count++; else break;
      }
      for (let s = 1; s < 4; s++) {
        const nr = placedRow - dr * s, nc = col - dc * s;
        if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr][nc] === c4.turn) count++; else break;
      }
      return count >= 4;
    });

    c4.boardJson = JSON.stringify(board);
    if (won) {
      c4.winner = c4.turn;
      sfx.buy();
    } else {
      c4.turn = 1 - c4.turn;
    }
    pushStateSync();
    checkBotForOtherGames();
  }

  function renderConnect4Game() {
    const grid = document.getElementById('c4-grid');
    if (!grid || !gameState.connect4) return;
    const c4 = gameState.connect4;
    const board = JSON.parse(c4.boardJson);
    const p0 = gameState.players[0]?.name || 'Gracz 1';
    const p1 = gameState.players[1]?.name || 'Gracz 2';

    document.getElementById('c4-turn-text').textContent = c4.winner !== null
      ? `🏆 Wygrywa: ${c4.winner === 0 ? p0 : p1}!`
      : `Ruch: ${c4.turn === 0 ? p0 + ' (Pomarańczowy)' : p1 + ' (Turkusowy)'}`;

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
        slot.onclick = () => dropConnect4Disc(c);
        grid.appendChild(slot);
      }
    }
  }

  /* ==================== 12. RUCHY BOTÓW W GRACH 2–5 ==================== */
  function checkBotForOtherGames() {
    if (!gameState) return;
    const mode = gameState.activeGame;

    if (mode === 'LUDO') {
      const pCount = Math.min(4, gameState.players.length);
      const cur = gameState.players[gameState.ludo.turn % pCount];
      if (cur && cur.isBot && gameState.ludo.winner === null && !gameState.ludo.rolled) {
        setTimeout(rollLudoDice, 600);
      }
    }

    if (mode === 'CHECKERS' && gameState.checkers.winner === null) {
      const cur = gameState.players[gameState.checkers.turn];
      if (cur && cur.isBot) {
        setTimeout(() => {
          const board = JSON.parse(gameState.checkers.boardJson);
          const allMoves = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (board[r][c]?.p === gameState.checkers.turn) {
                getCheckerMoves(board, r, c).forEach(m => allMoves.push({ fr: r, fc: c, m }));
              }
            }
          }
          if (allMoves.length > 0) {
            const pick = allMoves.find(x => x.m.jump) || allMoves[Math.floor(Math.random() * allMoves.length)];
            executeCheckerMove(pick.fr, pick.fc, pick.m);
          }
        }, 600);
      }
    }

    if (mode === 'CHESS' && gameState.chess.winner === null) {
      const cur = gameState.players[gameState.chess.turn];
      if (cur && cur.isBot) {
        setTimeout(() => {
          const board = JSON.parse(gameState.chess.boardJson);
          const allMoves = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (board[r][c]?.p === gameState.chess.turn) {
                getValidChessMoves(board, r, c).forEach(m => allMoves.push({ fr: r, fc: c, tr: m.r, tc: m.c }));
              }
            }
          }
          if (allMoves.length > 0) {
            const cap = allMoves.find(x => board[x.tr][x.tc] !== null);
            const pick = cap || allMoves[Math.floor(Math.random() * allMoves.length)];
            executeChessMove(pick.fr, pick.fc, pick.tr, pick.tc);
          }
        }, 650);
      }
    }

    if (mode === 'CONNECT4' && gameState.connect4.winner === null) {
      const cur = gameState.players[gameState.connect4.turn];
      if (cur && cur.isBot) {
        setTimeout(() => {
          const board = JSON.parse(gameState.connect4.boardJson);
          const cols = [0,1,2,3,4,5,6].filter(c => board[0][c] === null);
          if (cols.length > 0) dropConnect4Disc(cols[Math.floor(Math.random() * cols.length)]);
        }, 550);
      }
    }
  }

  /* ==================== 13. RENDEROWANIE INTERFEJSU ==================== */
  function renderAll() {
    if (!gameState) return;
    const activeMode = gameState.activeGame || 'MONOPOLY';
    ['MONOPOLY', 'LUDO', 'CHECKERS', 'CHESS', 'CONNECT4'].forEach(g => {
      const st = document.getElementById('stage-' + g);
      if (st) st.classList.toggle('hidden', g !== activeMode);
    });
    document.querySelectorAll('.game-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.switchGame === activeMode);
    });

    renderMonopolyBoard();
    renderCenterHUD();
    renderLudoGame();
    renderCheckersGame();
    renderChessGame();
    renderConnect4Game();
    renderPlayersRoster();
    renderMyProperties();
    renderTradesList();
    renderChat();
    renderInspector(selectedTileIndex);
  }

  function renderMonopolyBoard() {
    const sub20 = document.getElementById('corner-sub-20');
    if (sub20) sub20.textContent = `$${gameState.vacationPool} w puli`;

    BOARD_TILES.forEach(tile => {
      const prop = gameState.properties[tile.index];
      const capEl = document.getElementById('cap-' + tile.index);
      const cellEl = document.querySelector(`.board-tile[data-index="${tile.index}"]`);

      if (capEl && prop) {
        if (prop.ownerId) {
          const owner = getPlayerById(prop.ownerId);
          capEl.classList.remove('hidden');
          capEl.style.background = owner ? owner.color : '#888';
          if (prop.mortgaged) capEl.textContent = '🔒';
          else if (prop.level === 5) capEl.textContent = '🏨';
          else if (prop.level > 0) capEl.textContent = `🏠×${prop.level}`;
          else capEl.textContent = '';
        } else {
          capEl.classList.add('hidden');
        }
      }

      if (cellEl && prop) cellEl.classList.toggle('mortgaged-tile', !!prop.mortgaged);

      const tokenBox = document.getElementById('tokens-' + tile.index);
      if (tokenBox) {
        tokenBox.innerHTML = '';
        gameState.players
          .filter(p => !p.bankrupt && p.position === tile.index)
          .forEach(p => {
            const tok = document.createElement('div');
            tok.className = 'eye-token';
            tok.style.background = p.color;
            tok.title = p.name;
            tokenBox.appendChild(tok);
          });
      }
    });

    renderBoardHighlights();
  }

  function renderBoardHighlights() {
    document.querySelectorAll('.board-tile').forEach(el => {
      el.classList.toggle('selected-tile', Number(el.dataset.index) === selectedTileIndex);
    });
  }

  function renderCenterHUD() {
    const active = currentTurnPlayer();
    document.getElementById('hud-round').textContent = `Runda ${gameState.round}`;
    document.getElementById('die-box-1').dataset.val = gameState.lastDice[0];
    document.getElementById('die-box-2').dataset.val = gameState.lastDice[1];

    const quotaEl = document.getElementById('hud-build-quota');
    if (quotaEl) {
      quotaEl.textContent = gameState.builtThisTurn ? '⏳ Budowa: 0/1 w tej turze' : '🏠 Limit budowy: 1/1 w tej turze';
      quotaEl.className = gameState.builtThisTurn ? 'hub-pill quota-used' : 'hub-pill quota-ready';
    }

    const avatarDot = document.getElementById('playing-now-avatar');
    const labelEl = document.getElementById('playing-now-label');
    if (active) {
      avatarDot.style.background = active.color;
      labelEl.textContent = `Kolej gracza: ${active.name}`;
    }

    const isMyTurn = canControlTurn();
    document.getElementById('wait-turn-notice').classList.toggle('hidden', isMyTurn);
    document.getElementById('action-buttons-wrap').classList.toggle('hidden', !isMyTurn);

    const tile = BOARD_TILES[active.position];
    document.getElementById('btn-roll').classList.toggle('hidden', gameState.turnPhase !== 'ROLL');
    document.getElementById('btn-buy').classList.toggle('hidden', gameState.turnPhase !== 'DECIDE');
    document.getElementById('btn-auction').classList.toggle('hidden', gameState.turnPhase !== 'DECIDE');
    document.getElementById('btn-end-turn').classList.toggle('hidden', gameState.turnPhase === 'ROLL');

    if (gameState.turnPhase === 'DECIDE' && tile) {
      const btnBuy = document.getElementById('btn-buy');
      btnBuy.textContent = `💰 Kup ${tile.shortName} ($${tile.price})`;
      btnBuy.disabled = active.cash < tile.price;
    }

    const hasBuildable = BOARD_TILES.some(t => canUpgradeProperty(t.index, active.id).ok);
    document.getElementById('btn-build-quick').classList.toggle('hidden', !hasBuildable);
    document.getElementById('btn-jail-pay').classList.toggle('hidden', !(active.inJail && gameState.turnPhase === 'ROLL' && active.cash >= 100));
    document.getElementById('btn-jail-card').classList.toggle('hidden', !(active.inJail && gameState.turnPhase === 'ROLL' && active.pardonCards > 0));

    document.getElementById('center-feed-log').innerHTML = gameState.feed.map(item => `<div class="feed-line">${item.text}</div>`).join('');
  }

  function renderPlayersRoster() {
    const rosterEl = document.getElementById('players-roster');
    rosterEl.innerHTML = gameState.players.map((p, idx) => {
      const isTurn = idx === gameState.turnIndex;
      const crown = idx === 0 ? '👑' : '';
      const youTag = (gameState.isOnline && p.id === myOnlinePlayerId) ? ' (Ty)' : '';
      return `
        <div class="roster-player-row ${isTurn ? 'is-active' : ''} ${p.bankrupt ? 'is-bankrupt' : ''}" style="border-left-color:${p.color}">
          <div class="roster-left">
            <div class="roster-avatar" style="background:${p.color}"></div>
            <div>
              <div class="roster-name-title">${p.name}${youTag} ${crown} ${p.isBot ? '🤖' : ''}</div>
              <div class="roster-meta-sub">${BOARD_TILES[p.position].shortName}</div>
            </div>
          </div>
          <div class="roster-money">$${p.cash}</div>
        </div>
      `;
    }).join('');

    const sel = document.getElementById('perspective-select');
    sel.innerHTML = gameState.players
      .filter(p => !p.bankrupt)
      .map(p => `<option value="${p.id}" ${p.id === activePerspectiveId ? 'selected' : ''}>${p.name} ($${p.cash})</option>`)
      .join('');
  }

  function renderMyProperties() {
    const viewer = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const listEl = document.getElementById('my-properties-scroll');
    if (!viewer) return;

    const ownedTiles = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === viewer.id);
    document.getElementById('my-props-header-text').textContent = `🏘️ Posiadane Dzielnice (${ownedTiles.length})`;

    let totalWorth = viewer.cash;
    ownedTiles.forEach(t => {
      const pr = gameState.properties[t.index];
      totalWorth += t.price + (pr.level * (t.buildCost || 0));
    });
    document.getElementById('my-networth-badge').textContent = `Majątek: $${totalWorth}`;

    if (ownedTiles.length === 0) {
      listEl.innerHTML = `<div style="font-size:0.76rem;color:#a99fc9;">Brak kupionych dzielnic. Rzuć kostką na planszy Monopoly!</div>`;
      return;
    }

    listEl.innerHTML = ownedTiles.map(t => {
      const pr = gameState.properties[t.index];
      const grp = GROUPS[t.group];
      const upCheck = canUpgradeProperty(t.index, viewer.id);
      const lvlBadge = pr.mortgaged ? '🔒 Hipoteka' : (t.type === 'PROPERTY' ? `🏠 Poz. ${pr.level}/5` : 'Aktywne');
      const btnLabel = gameState.builtThisTurn ? '⏳ Limit 1/1' : `+🏠 $${t.buildCost}`;
      const buildBtnHtml = t.type === 'PROPERTY'
        ? `<button type="button" class="btn-quick-up" data-build-idx="${t.index}" ${upCheck.ok ? '' : 'disabled'} title="${upCheck.reason}">${btnLabel}</button>`
        : '';

      return `
        <div class="owned-prop-item" data-open-idx="${t.index}">
          <div class="owned-prop-left">
            <span class="owned-dot" style="background:${grp ? grp.color : '#888'}"></span>
            <span class="owned-name">${t.name}</span>
          </div>
          <div class="owned-prop-right">
            <span class="lvl-tag">${lvlBadge}</span>
            ${buildBtnHtml}
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-open-idx]').forEach(row => {
      row.onclick = (e) => {
        if (e.target.closest('[data-build-idx]')) return;
        openPropertyModal(Number(row.dataset.openIdx));
      };
    });
    listEl.querySelectorAll('[data-build-idx]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        buildHouseOnProperty(Number(btn.dataset.buildIdx), viewer.id);
      };
    });
  }

  function renderInspector(tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    if (!tile) return;
    const prop = gameState.properties[tileIndex];
    const grp = tile.group ? GROUPS[tile.group] : null;
    document.getElementById('spotlight-tag').textContent = tile.district || grp?.name || 'RUDA ŚLĄSKA';
    document.getElementById('spotlight-title').textContent = tile.name;

    const content = document.getElementById('spotlight-content');
    if (!prop) {
      content.innerHTML = `<div style="font-size:0.78rem;color:#a99fc9;">${tile.subtitle || 'Pole specjalne na planszy Rudy Śląskiej.'}</div>`;
      return;
    }
    const owner = prop.ownerId ? getPlayerById(prop.ownerId) : null;
    content.innerHTML = `
      <div class="spot-grid">
        <div class="spot-stat"><span>Cena</span><strong>$${tile.price}</strong></div>
        <div class="spot-stat"><span>Właściciel</span><strong>${owner ? owner.name : 'Wolne'}</strong></div>
        <div class="spot-stat"><span>Poziom</span><strong>${prop.level}/5</strong></div>
        <div class="spot-stat"><span>Czynsz</span><strong>$${calculateRent(tileIndex)}</strong></div>
      </div>
    `;
  }

  function openPropertyModal(tileIndex) {
    selectedTileIndex = tileIndex;
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    if (!tile || !prop) return;

    const modal = document.getElementById('prop-modal');
    const viewer = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const owner = prop.ownerId ? getPlayerById(prop.ownerId) : null;
    const grp = tile.group ? GROUPS[tile.group] : null;

    document.getElementById('prop-modal-banner').style.background = grp ? `linear-gradient(135deg, ${grp.color}, #1c162e)` : '#2a2244';
    document.getElementById('prop-modal-group').textContent = grp ? grp.name : tile.district;
    document.getElementById('prop-modal-name').textContent = tile.name;
    document.getElementById('pm-price').textContent = `$${tile.price}`;
    document.getElementById('pm-owner').textContent = owner ? owner.name : 'Brak (Wolne)';
    document.getElementById('pm-level').textContent = `${prop.level} / 5`;
    document.getElementById('pm-rent').textContent = `$${calculateRent(tileIndex)}`;

    const tbody = document.getElementById('pm-rent-tbody');
    if (tile.type === 'PROPERTY') {
      const labels = ['Poziom 0 (Działka)','Poziom 1 (1 Dom)','Poziom 2 (2 Domy)','Poziom 3 (3 Domy)','Poziom 4 (4 Domy)','Poziom 5 (Kompleks / Hotel)'];
      tbody.innerHTML = tile.rents.map((r, lvl) => `
        <tr class="${prop.level === lvl ? 'current-lvl-row' : ''}">
          <td>${labels[lvl]}</td><td>${lvl === 5 ? '🏨' : (lvl > 0 ? '🏠×'+lvl : '—')}</td><td><strong>$${r}</strong></td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td>Czynsz komunikacyjny / przemysłowy</td><td>⚡</td><td><strong>$${calculateRent(tileIndex)}</strong></td></tr>`;
    }

    const upBox = document.getElementById('pm-upgrade-box');
    if (tile.type === 'PROPERTY') {
      upBox.classList.remove('hidden');
      document.getElementById('pm-build-cost').textContent = `$${tile.buildCost}`;
      const nextDiff = prop.level < 5 ? (tile.rents[prop.level + 1] - tile.rents[prop.level]) : 0;
      document.getElementById('pm-rent-diff').textContent = prop.level < 5 ? `+$${nextDiff}` : 'MAX';

      const check = canUpgradeProperty(tileIndex, viewer.id);
      document.getElementById('pm-status-note').textContent = check.reason;

      const btnBuild = document.getElementById('btn-pm-build');
      const btnSell = document.getElementById('btn-pm-sell');
      const btnMort = document.getElementById('btn-pm-mortgage');

      btnBuild.disabled = !check.ok;
      btnSell.disabled = !(prop.ownerId === viewer.id && prop.level > 0);
      btnMort.disabled = !(prop.ownerId === viewer.id && prop.level === 0);

      btnBuild.onclick = () => { if (buildHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
      btnSell.onclick = () => { if (sellHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
      btnMort.onclick = () => { if (toggleMortgageProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
    } else {
      upBox.classList.add('hidden');
    }

    document.getElementById('pm-history-list').innerHTML = prop.history.map(h => `<li>${h}</li>`).join('');
    modal.classList.remove('hidden');
  }

  /* ==================== 14. HANDEL, CZAT I LOBBY ==================== */
  function renderTradesList() {
    const panel = document.getElementById('trades-panel-box');
    const box = document.getElementById('trades-list-box');
    if (!gameState.trades || gameState.trades.length === 0) {
      panel.classList.add('hidden');
      return;
    }
    panel.classList.remove('hidden');
    box.innerHTML = gameState.trades.map(tr => {
      const from = getPlayerById(tr.fromId);
      const to = getPlayerById(tr.toId);
      return `
        <div style="background:rgba(255,255,255,0.05);padding:8px;border-radius:9px;font-size:0.76rem;margin-bottom:6px;">
          <div><strong>${from?.name}</strong> ➔ <strong>${to?.name}</strong> ($${tr.giveCash} za $${tr.takeCash})</div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button type="button" class="btn-quick-up" data-acc="${tr.id}">Akceptuj</button>
            <button type="button" class="btn-ghost" data-rej="${tr.id}">Odrzuć</button>
          </div>
        </div>
      `;
    }).join('');

    box.querySelectorAll('[data-acc]').forEach(b => {
      b.onclick = () => {
        const tr = gameState.trades.find(x => x.id === b.dataset.acc);
        if (!tr) return;
        const s = getPlayerById(tr.fromId), t = getPlayerById(tr.toId);
        if (s && t) {
          s.cash = s.cash - tr.giveCash + tr.takeCash;
          t.cash = t.cash - tr.takeCash + tr.giveCash;
          (tr.giveProps || []).forEach(idx => { if (gameState.properties[idx]) gameState.properties[idx].ownerId = t.id; });
          (tr.takeProps || []).forEach(idx => { if (gameState.properties[idx]) gameState.properties[idx].ownerId = s.id; });
        }
        gameState.trades = gameState.trades.filter(x => x.id !== tr.id);
        pushStateSync();
      };
    });
    box.querySelectorAll('[data-rej]').forEach(b => {
      b.onclick = () => {
        gameState.trades = gameState.trades.filter(x => x.id !== b.dataset.rej);
        pushStateSync();
      };
    });
  }

  function renderChat() {
    const stream = document.getElementById('chat-stream');
    stream.innerHTML = gameState.chat.map(m => `
      <div class="chat-bubble-row">
        <span class="player-dot-lg" style="background:${m.color || '#7c4dff'};width:14px;height:14px;flex-shrink:0;margin-top:3px;"></span>
        <div class="chat-msg-bubble">
          <span class="chat-msg-author">${m.author} • ${m.time}</span>
          <div>${m.text}</div>
        </div>
      </div>
    `).join('');
    stream.scrollTop = stream.scrollHeight;
  }

  function sendChatMessage(text) {
    if (!text.trim() || !gameState) return;
    const sender = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    gameState.chat.push({ author: sender.name, color: sender.color, text: text.trim(), time: nowTime() });
    pushStateSync();
  }

  function renderLobbySetup() {
    const localPicker = document.getElementById('local-color-picker');
    localPicker.innerHTML = PLAYER_COLORS.map(c => `
      <button type="button" class="color-dot-pick ${c.hex === localPickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}"></button>
    `).join('');
    localPicker.querySelectorAll('.color-dot-pick').forEach(btn => {
      btn.onclick = () => { localPickedColor = btn.dataset.hex; renderLobbySetup(); };
    });

    const onlinePicker = document.getElementById('online-color-picker');
    onlinePicker.innerHTML = PLAYER_COLORS.map(c => `
      <button type="button" class="color-dot-pick ${c.hex === onlinePickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}"></button>
    `).join('');
    onlinePicker.querySelectorAll('.color-dot-pick').forEach(btn => {
      btn.onclick = () => { onlinePickedColor = btn.dataset.hex; renderLobbySetup(); };
    });

    const oppBox = document.getElementById('local-opponents-list');
    oppBox.innerHTML = lobbyOpponents.map((o, idx) => `
      <div class="opp-row">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="player-dot-lg" style="background:${o.color};width:14px;height:14px;"></span>
          <strong>${o.name}</strong>
          <span style="font-size:0.72rem;color:#a99fc9;">(${o.isBot ? 'Bot AI' : 'Gracz Hot-Seat'})</span>
        </div>
        ${lobbyOpponents.length > 1 ? `<button type="button" class="btn-ghost" data-rm-opp="${idx}">Usuń</button>` : ''}
      </div>
    `).join('');

    oppBox.querySelectorAll('[data-rm-opp]').forEach(btn => {
      btn.onclick = () => { lobbyOpponents.splice(Number(btn.dataset.rmOpp), 1); renderLobbySetup(); };
    });
  }

  function updateLobbyWaitingRoom() {
    if (!gameState || !currentRoomCode || currentRoomCode === 'LOKALNY') return;
    document.getElementById('room-waiting-box').classList.remove('hidden');
    document.getElementById('lobby-room-code-display').textContent = currentRoomCode;
    document.getElementById('lobby-room-players').innerHTML = gameState.players.map(p => `
      <div class="btn-ghost" style="border-left:4px solid ${p.color}">
        ${p.name} ${p.isBot ? '🤖' : '👤'} ${p.clientToken === myClientToken ? '(Ty)' : ''}
      </div>
    `).join('');
  }

  function addOrReconnectPlayerToRoom(roomState, myName, myColor, tokenToUse = myClientToken) {
    roomState = normalizeState(roomState);
    const existing = roomState.players.find(p => p.clientToken === tokenToUse);
    if (existing) {
      existing.name = myName || existing.name;
      myOnlinePlayerId = existing.id;
      activePerspectiveId = existing.id;
      return roomState;
    }
    const newId = 'p' + (roomState.players.length + 1);
    const usedColors = roomState.players.map(p => p.color);
    const finalColor = usedColors.includes(myColor)
      ? (PLAYER_COLORS.find(c => !usedColors.includes(c.hex))?.hex || myColor)
      : myColor;

    roomState.players.push({
      id: newId, clientToken: tokenToUse, name: myName, color: finalColor, isBot: false,
      cash: 2000, position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
    });
    myOnlinePlayerId = newId;
    activePerspectiveId = newId;
    roomState.feed.unshift({ text: `👋 <strong>${myName}</strong> dołączył do pokoju!`, time: nowTime() });
    return roomState;
  }

  function showGenericModal(title, htmlContent) {
    document.getElementById('generic-modal-title').textContent = title;
    document.getElementById('generic-modal-body').innerHTML = htmlContent;
    document.getElementById('generic-modal').classList.remove('hidden');
  }

  /* ==================== 15. INICJALIZACJA WSZYSTKICH PRZYCISKÓW ==================== */
  function initEvents() {
    document.querySelectorAll('.game-pick-card').forEach(card => {
      card.onclick = () => {
        document.querySelectorAll('.game-pick-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedGameMode = card.dataset.game;
      };
    });

    document.querySelectorAll('[data-switch-game]').forEach(btn => {
      btn.onclick = () => {
        if (!gameState) return;
        gameState.activeGame = btn.dataset.switchGame;
        pushStateSync();
        checkBotForOtherGames();
      };
    });

    document.querySelectorAll('.lobby-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.lobby-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.lobby-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      };
    });

    document.getElementById('btn-save-firebase').onclick = () => {
      const val = document.getElementById('firebase-url-input').value;
      if (!connectFirebaseDatabase(val)) {
        setBannerStatus('❌ Nieprawidłowy adres URL Firebase. Wklej pełny link https://twoja-baza...firebasedatabase.app', '#ff5252');
      }
    };

    // Tworzenie Pokoju Online w Firebase
    document.getElementById('btn-create-room').onclick = () => {
      const typedUrl = document.getElementById('firebase-url-input').value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);

      const hostName = document.getElementById('online-name-input').value.trim() || 'Sztygar';
      const typedCode = document.getElementById('join-code-input').value.trim().toUpperCase();
      const code = typedCode || ('RUDA' + Math.floor(100 + Math.random() * 900));

      const players = [{ id: 'p1', clientToken: myClientToken, name: hostName, color: onlinePickedColor, isBot: false }];
      myOnlinePlayerId = 'p1';
      activePerspectiveId = 'p1';
      gameState = createFreshGameState(players, 2000, code, true, selectedGameMode);
      subscribeToRoom(code);
      pushStateSync();
      updateLobbyWaitingRoom();

      if (firebaseDb) {
        setBannerStatus(`✅ Pokój ${code} został zapisany w chmurze Firebase! Kliknij "Kopiuj Link Zaproszenia" i wyślij znajomym.`, '#2ecc71');
      } else {
        setBannerStatus(`⚠️ Pokój ${code} działa w trybie lokalnym. Aby połączyć znajomych z innych domów, wklej wyżej URL swojej bazy Firebase!`, '#ffca28');
      }
    };

    // Dołączanie do Pokoju w Firebase
    document.getElementById('btn-join-room').onclick = () => {
      const typedUrl = document.getElementById('firebase-url-input').value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);

      const code = document.getElementById('join-code-input').value.trim().toUpperCase();
      if (!code) {
        setBannerStatus('⚠️ Wpisz najpierw kod pokoju (np. RUDA500)!', '#ffca28');
        return;
      }
      const myName = document.getElementById('online-name-input').value.trim() || ('Górnik_' + Math.floor(10 + Math.random() * 89));

      if (firebaseDb) {
        setBannerStatus(`⏳ Pobieranie pokoju ${code} z bazy Firebase...`, '#00e5ff');
        firebaseDb.ref('rooms/' + code).once('value').then((snap) => {
          const cloudRoom = snap.val();
          if (cloudRoom) {
            gameState = addOrReconnectPlayerToRoom(cloudRoom, myName, onlinePickedColor, myClientToken);
            subscribeToRoom(code);
            pushStateSync();
            updateLobbyWaitingRoom();
            setBannerStatus(`✅ Dołączono do pokoju ${code} w chmurze Firebase!`, '#2ecc71');
          } else {
            setBannerStatus(`❌ Pokój "${code}" nie istnieje w tej bazie Firebase. Upewnij się, że Host go utworzył.`, '#ff5252');
          }
        }).catch((err) => {
          setBannerStatus(`❌ Błąd dostępu do Firebase (${err.message}). Sprawdź czy w Realtime Database -> Rules ustawiono ".read": true, ".write": true.`, '#ff5252');
        });
        return;
      }

      const savedRaw = localStorage.getItem('ruda_room_' + code);
      if (savedRaw) {
        gameState = addOrReconnectPlayerToRoom(JSON.parse(savedRaw), myName, onlinePickedColor, myClientToken);
        subscribeToRoom(code);
        pushStateSync();
        updateLobbyWaitingRoom();
        setBannerStatus(`✅ Dołączono do pokoju ${code}!`, '#2ecc71');
      } else {
        setBannerStatus(`❌ Nie podpięto bazy Firebase! Wklej wyżej URL bazy Firebase lub otwórz Link Zaproszenia wygenerowany przez Hosta.`, '#ff5252');
      }
    };

    document.getElementById('btn-room-add-bot').onclick = () => {
      if (!gameState || gameState.players.length >= 6) return;
      const idx = gameState.players.length + 1;
      gameState.players.push({
        id: 'p' + idx, clientToken: '', name: 'Bot Górnik #' + idx, color: PLAYER_COLORS[idx % PLAYER_COLORS.length].hex,
        isBot: true, cash: 2000, position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
      });
      pushStateSync();
      updateLobbyWaitingRoom();
    };

    document.getElementById('btn-launch-room-game').onclick = () => {
      if (!gameState) return;
      if (gameState.players.length < 2) document.getElementById('btn-room-add-bot').click();
      gameState.lobbyOpen = false;
      gameState.activeGame = selectedGameMode;
      document.getElementById('lobby-overlay').classList.add('hidden');
      pushStateSync();
      checkBotForOtherGames();
    };

    document.getElementById('btn-copy-invite-lobby').onclick = () => {
      navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode));
      document.getElementById('btn-copy-invite-lobby').textContent = '✅ Skopiowano Link Zaproszenia!';
      setTimeout(() => {
        document.getElementById('btn-copy-invite-lobby').textContent = '📋 Kopiuj Link Zaproszenia (z kluczem Firebase)';
      }, 2200);
    };

    document.getElementById('btn-copy-invite-top').onclick = () => {
      navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode));
      document.getElementById('btn-copy-invite-top').textContent = '✅ Skopiowano!';
      setTimeout(() => { document.getElementById('btn-copy-invite-top').textContent = '📋 Zaproszenie'; }, 1800);
    };

    // Gra lokalna / Boty
    document.getElementById('btn-add-bot').onclick = () => {
      if (lobbyOpponents.length >= 5) return;
      const nextColor = PLAYER_COLORS[(lobbyOpponents.length + 1) % PLAYER_COLORS.length].hex;
      const names = ['Bot KWK Bielszowice', 'Bot Kochłowice', 'Bot Orzegów', 'Bot Czarny Las', 'Bot Godula'];
      lobbyOpponents.push({ name: names[lobbyOpponents.length % names.length], isBot: true, color: nextColor });
      renderLobbySetup();
    };

    document.getElementById('btn-add-human').onclick = () => {
      if (lobbyOpponents.length >= 5) return;
      const nextColor = PLAYER_COLORS[(lobbyOpponents.length + 1) % PLAYER_COLORS.length].hex;
      lobbyOpponents.push({ name: `Gracz ${lobbyOpponents.length + 2}`, isBot: false, color: nextColor });
      renderLobbySetup();
    };

    document.getElementById('btn-start-local-game').onclick = () => {
      const mainName = document.getElementById('local-name-input').value.trim() || 'Sztygar';
      const startCash = Number(document.getElementById('local-cash-select').value) || 2000;
      const allPlayers = [
        { id: 'p1', clientToken: myClientToken, name: mainName, color: localPickedColor, isBot: false },
        ...lobbyOpponents.map((o, i) => ({ id: 'p' + (i + 2), name: o.name, color: o.color, isBot: o.isBot }))
      ];
      myOnlinePlayerId = null;
      gameState = createFreshGameState(allPlayers, startCash, 'LOKALNY', false, selectedGameMode);
      activePerspectiveId = 'p1';
      subscribeToRoom('LOKALNY');
      document.getElementById('lobby-overlay').classList.add('hidden');
      pushStateSync();
      checkBotForOtherGames();
    };

    // Przyciski na stole gry
    document.getElementById('btn-roll').onclick = handleRollDice;
    document.getElementById('dice-stage').onclick = handleRollDice;
    document.getElementById('btn-buy').onclick = buyCurrentField;
    document.getElementById('btn-end-turn').onclick = endCurrentTurn;
    document.getElementById('btn-ludo-roll').onclick = rollLudoDice;
    document.getElementById('ludo-die').onclick = rollLudoDice;

    document.getElementById('btn-build-quick').onclick = () => {
      const active = currentTurnPlayer();
      const b = BOARD_TILES.find(t => canUpgradeProperty(t.index, active.id).ok);
      if (b) openPropertyModal(b.index);
    };

    document.getElementById('btn-jail-pay').onclick = () => {
      const active = currentTurnPlayer();
      if (!canControlTurn() || !active.inJail || active.cash < 100) return;
      active.cash -= 100;
      active.inJail = false;
      active.jailTurns = 0;
      addFeedEvent(`🔓 <strong>${active.name}</strong> wykupił wyjście z Izby za $100.`);
      pushStateSync();
    };

    document.getElementById('btn-jail-card').onclick = () => {
      const active = currentTurnPlayer();
      if (!canControlTurn() || !active.inJail || active.pardonCards <= 0) return;
      active.pardonCards -= 1;
      active.inJail = false;
      active.jailTurns = 0;
      addFeedEvent(`🕊️ <strong>${active.name}</strong> użył Karty Wolności!`);
      pushStateSync();
    };

    document.getElementById('btn-reset-board').onclick = () => {
      if (!gameState) return;
      if (gameState.activeGame === 'LUDO') gameState.ludo = createLudoState();
      if (gameState.activeGame === 'CHECKERS') gameState.checkers = createCheckersState();
      if (gameState.activeGame === 'CHESS') gameState.chess = createChessState();
      if (gameState.activeGame === 'CONNECT4') gameState.connect4 = createConnect4State();
      pushStateSync();
      checkBotForOtherGames();
    };

    document.getElementById('perspective-select').onchange = (e) => {
      activePerspectiveId = e.target.value;
      renderAll();
    };

    document.getElementById('btn-bankrupt').onclick = () => {
      const viewer = getPlayerById(activePerspectiveId) || currentTurnPlayer();
      if (confirm(`Ogłosić bankructwo dla ${viewer.name}?`)) declareBankruptcy(viewer.id, null);
    };

    // Aukcje i Wymiany
    let auctionState = null;
    document.getElementById('btn-auction').onclick = () => {
      const active = currentTurnPlayer();
      const tile = BOARD_TILES[active.position];
      auctionState = { tileIndex: tile.index, highBid: Math.max(20, Math.floor(tile.price * 0.4)), leaderId: null };
      document.getElementById('auc-title').textContent = tile.name;
      document.getElementById('auc-current-bid').textContent = `$${auctionState.highBid}`;
      document.getElementById('auc-bidder-select').innerHTML = gameState.players.filter(p => !p.bankrupt).map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
      document.getElementById('auction-modal').classList.remove('hidden');
    };

    document.querySelectorAll('.btn-auc-add').forEach(btn => {
      btn.onclick = () => {
        if (!auctionState) return;
        const bidder = getPlayerById(document.getElementById('auc-bidder-select').value);
        const inc = Number(btn.dataset.inc);
        if (bidder && bidder.cash >= auctionState.highBid + inc) {
          auctionState.highBid += inc;
          auctionState.leaderId = bidder.id;
          document.getElementById('auc-current-bid').textContent = `$${auctionState.highBid}`;
          document.getElementById('auc-leader-name').textContent = `Prowadzi: ${bidder.name}`;
        }
      };
    });

    document.getElementById('btn-auc-finalize').onclick = () => {
      if (auctionState && auctionState.leaderId) {
        const winner = getPlayerById(auctionState.leaderId);
        const prop = gameState.properties[auctionState.tileIndex];
        winner.cash -= auctionState.highBid;
        prop.ownerId = winner.id;
        addFeedEvent(`🔨 <strong>${winner.name}</strong> wylicytował dzielnicę za $${auctionState.highBid}!`);
      }
      document.getElementById('auction-modal').classList.add('hidden');
      gameState.turnPhase = 'END';
      pushStateSync();
    };

    document.getElementById('btn-auc-cancel').onclick = () => {
      document.getElementById('auction-modal').classList.add('hidden');
      gameState.turnPhase = 'END';
      pushStateSync();
    };

    document.getElementById('btn-new-trade').onclick = () => {
      const sender = getPlayerById(activePerspectiveId) || currentTurnPlayer();
      const partners = gameState.players.filter(p => !p.bankrupt && p.id !== sender.id);
      if (!partners.length) return;
      document.getElementById('trade-sender-title').textContent = `Oferta od: ${sender.name}`;
      const pSel = document.getElementById('trade-partner-select');
      pSel.innerHTML = partners.map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
      const myProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === sender.id);
      document.getElementById('trade-give-props').innerHTML = myProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-give-prop"/> ${t.name}</label>`).join('');
      const renderTarget = () => {
        const theirProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === pSel.value);
        document.getElementById('trade-take-props').innerHTML = theirProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-take-prop"/> ${t.name}</label>`).join('');
      };
      pSel.onchange = renderTarget;
      renderTarget();
      document.getElementById('trade-modal').classList.remove('hidden');
    };

    document.getElementById('btn-send-trade-offer').onclick = () => {
      const sender = getPlayerById(activePerspectiveId) || currentTurnPlayer();
      const target = getPlayerById(document.getElementById('trade-partner-select').value);
      const giveCash = Number(document.getElementById('trade-give-cash').value) || 0;
      const takeCash = Number(document.getElementById('trade-take-cash').value) || 0;
      const giveProps = Array.from(document.querySelectorAll('.chk-give-prop:checked')).map(el => Number(el.value));
      const takeProps = Array.from(document.querySelectorAll('.chk-take-prop:checked')).map(el => Number(el.value));
      gameState.trades.push({ id: 'tr_' + Date.now(), fromId: sender.id, toId: target.id, giveCash, takeCash, giveProps, takeProps });
      document.getElementById('trade-modal').classList.add('hidden');
      pushStateSync();
    };

    document.getElementById('chat-form').onsubmit = (e) => {
      e.preventDefault();
      const inp = document.getElementById('chat-text-input');
      sendChatMessage(inp.value);
      inp.value = '';
    };
    document.querySelectorAll('.emoji-chip').forEach(btn => {
      btn.onclick = () => sendChatMessage(btn.dataset.emoji);
    });

    document.getElementById('btn-open-lobby').onclick = () => document.getElementById('lobby-overlay').classList.remove('hidden');
    document.getElementById('btn-close-lobby').onclick = () => document.getElementById('lobby-overlay').classList.add('hidden');
    document.getElementById('btn-toggle-sound').onclick = (e) => {
      sfx.enabled = !sfx.enabled;
      e.currentTarget.textContent = sfx.enabled ? '🔊' : '🔇';
    };

    document.getElementById('btn-open-rules').onclick = () => {
      showGenericModal(
        '⚒️ Zasady 5 Gier — Ruda Śląska Arena',
        `<div style="line-height:1.65;font-size:0.88rem;display:flex;flex-direction:column;gap:8px;">
          <p><strong>🏭 1. Monopoly Ruda Śląska:</strong> Kupuj dzielnice, kopalnie i huty. Możesz budować domy na każdym posiadanym polu <strong>bez konieczności zbierania całego koloru</strong>, z limitem <strong>maksymalnie 1 wybudowanego domu na turę</strong>.</p>
          <p><strong>🎲 2. Chińczyk (4 Dzielnice):</strong> Wyrzuć 6, aby wyprowadzić górnika z bazy i przeprowadź wszystkie 4 pionki do mety.</p>
          <p><strong>⚫ 3. Warcaby Górnicze:</strong> Węgiel kontra Stal — klasyczne bicie po przekątnej z promocją na Damkę (👑).</p>
          <p><strong>♟️ 4. Szachy Śląskie:</strong> Pełna szachownica 8×8 z podświetlaniem legalnych ruchów.</p>
          <p><strong>🪙 5. Sztolnia 4 w Rzędzie:</strong> Zrzucaj krążki do kolumn i ułóż 4 w jednej linii.</p>
        </div>`
      );
    };

    document.getElementById('btn-close-prop-modal').onclick = () => document.getElementById('prop-modal').classList.add('hidden');
    document.getElementById('btn-close-trade').onclick = () => document.getElementById('trade-modal').classList.add('hidden');
    document.getElementById('btn-close-generic').onclick = () => document.getElementById('generic-modal').classList.add('hidden');

    if (turnTimerInterval) clearInterval(turnTimerInterval);
    turnTimerInterval = setInterval(() => {
      if (!gameState) return;
      if (gameState.turnSecondsLeft > 0) gameState.turnSecondsLeft -= 1;
      const m = String(Math.floor(gameState.turnSecondsLeft / 60)).padStart(2, '0');
      const s = String(gameState.turnSecondsLeft % 60).padStart(2, '0');
      const hudTimer = document.getElementById('hud-timer');
      if (hudTimer) hudTimer.textContent = `${m}:${s}`;
    }, 1000);
  }

  /* ==================== 16. START APLIKACJI ==================== */
  window.addEventListener('DOMContentLoaded', () => {
    buildMonopolyBoardDOM();
    renderLobbySetup();
    initEvents();

    const params = new URLSearchParams(window.location.search);
    const dbParam = params.get('db');
    const savedFb = localStorage.getItem('ruda_firebase_url');

    if (dbParam) {
      try { connectFirebaseDatabase(atob(dbParam)); } catch (e) {}
    } else if (HARDCODED_FIREBASE_URL) {
      connectFirebaseDatabase(HARDCODED_FIREBASE_URL);
    } else if (savedFb) {
      connectFirebaseDatabase(savedFb);
    }

    gameState = createFreshGameState([
      { id: 'p1', clientToken: myClientToken, name: 'Sztygar', color: PLAYER_COLORS[0].hex, isBot: false },
      ...lobbyOpponents.map((o, i) => ({ id: 'p' + (i + 2), name: o.name, color: o.color, isBot: o.isBot }))
    ], 2000, 'LOKALNY', false, 'MONOPOLY');
    renderAll();

    const roomParam = params.get('room');
    if (roomParam && roomParam.toUpperCase() !== 'LOKALNY') {
      document.querySelector('[data-tab="online"]').click();
      document.getElementById('join-code-input').value = roomParam.toUpperCase();
      setBannerStatus(`Wykryto zaproszenie do pokoju ${roomParam.toUpperCase()}! Wpisz swój nick i kliknij "Dołącz po Kodzie".`, '#00e5ff');
    }
  });
})();