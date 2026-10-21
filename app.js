/**
 * RUDA ŚLĄSKA ARENA ULTIMATE — PEŁNY SILNIK 7 GIER (app.js)
 */
(function () {
  'use strict';

  const HARDCODED_FIREBASE_URL = "";

  const RUDA_MAPS = [
    { id: 'KAUFHAUS', shortTitle: 'Kaufhaus', fullTitle: 'Kolonia Kaufhaus (Chebzie)', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ruda_Slaska_Chebzie_Kaufhaus_02.jpg?width=1440', fallbackGradient: 'linear-gradient(135deg, #4a2118 0%, #160f29 100%)' },
    { id: 'HUTA_POKOJ', shortTitle: 'Wielki Piec', fullTitle: 'Wielki Piec Huty Pokój', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Huta_Pok%C3%B3j_-_Wielki_Piec.jpg?width=1440', fallbackGradient: 'linear-gradient(135deg, #4d3014 0%, #10172b 100%)' },
    { id: 'SZYB_ANDRZEJ', shortTitle: 'Szyb Andrzej', fullTitle: 'Zabytkowy Szyb Andrzej (Wirek)', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Szyb_Andrzej_w_Rudzie_%C5%9Al%C4%85skiej.JPG?width=1440', fallbackGradient: 'linear-gradient(135deg, #173b34 0%, #140f24 100%)' },
    { id: 'FICINUS', shortTitle: 'Kolonia Ficinus', fullTitle: 'Kolonia Robotnicza Ficinus', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ruda_%C5%9Al%C4%85ska_-_Kolonia_Ficinus_01.jpg?width=1440', fallbackGradient: 'linear-gradient(135deg, #3b2447 0%, #0f1c30 100%)' },
    { id: 'NOWY_BYTOM', shortTitle: 'Ratusz N.Bytom', fullTitle: 'Magistrat (Nowy Bytom)', photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Urza_Miejski_w_Rudzie_Slaskiej.jpg?width=1440', fallbackGradient: 'linear-gradient(135deg, #1e3054 0%, #190e26 100%)' }
  ];

  const PAWN_AVATARS = [
    { id: 'helmet', name: 'Hełm Sztygara', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 15C4 9.5 7.5 5 12 5C16.5 5 20 9.5 20 15H4Z" fill="#fff" stroke="#111" stroke-width="1.8"/><path d="M2 15H22V18H2V15Z" fill="#ffca28" stroke="#111" stroke-width="1.5"/><circle cx="12" cy="10" r="2.6" fill="#00e5ff" stroke="#111" stroke-width="1.4"/></svg>` },
    { id: 'cool', name: 'Okulary Szefa', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 9H21L19 14H13.5L12 11.5L10.5 14H5L3 9Z" fill="#111"/><rect x="5" y="10" width="4" height="1.5" fill="#00e5ff"/><rect x="13.5" y="10" width="4" height="1.5" fill="#00e5ff"/><path d="M8 17.5C9.5 19 14.5 19 16 17.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>` },
    { id: 'mustache', name: 'Śląski Wąs', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="8.5" cy="9" r="2.2" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="15.5" cy="9" r="2.2" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="8.5" cy="9" r="1" fill="#111"/><circle cx="15.5" cy="9" r="1" fill="#111"/><path d="M4 15.5C6.5 13 10.5 13.5 12 15.5C13.5 13.5 17.5 13 20 15.5C18 18 14 17.5 12 16.2C10 17.5 6 18 4 15.5Z" fill="#1b1429" stroke="#fff" stroke-width="1"/></svg>` },
    { id: 'crown', name: 'Korona Barona', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 18L5 8L9.5 13L12 6L14.5 13L19 8L21 18H3Z" fill="#ffca28" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="15" r="1.2" fill="#e53935"/><circle cx="15" cy="15" r="1.2" fill="#00e5ff"/></svg>` },
    { id: 'cart', name: 'Wagonik Węgla', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 6L9 3L14 5L18 3L19 7H5V6Z" fill="#111"/><path d="M4 7H20L18 15H6L4 7Z" fill="#fff" stroke="#111" stroke-width="1.8"/><circle cx="8" cy="18" r="2.3" fill="#ff9800" stroke="#111" stroke-width="1.5"/><circle cx="16" cy="18" r="2.3" fill="#ff9800" stroke="#111" stroke-width="1.5"/></svg>` },
    { id: 'devil', name: 'Skarbnik', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 4L9 8M20 4L15 8" stroke="#111" stroke-width="2.5" stroke-linecap="round"/><circle cx="8.5" cy="11" r="2" fill="#ffeb3b" stroke="#111" stroke-width="1.3"/><circle cx="15.5" cy="11" r="2" fill="#ffeb3b" stroke="#111" stroke-width="1.3"/><path d="M7 16.5C9.5 19 14.5 19 17 16.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>` },
    { id: 'pirate', name: 'Pirat z Hałdy', svg: `<svg viewBox="0 0 24 24" fill="none"><line x1="4" y1="7" x2="20" y2="13" stroke="#111" stroke-width="2.2"/><circle cx="9" cy="10" r="3" fill="#111"/><circle cx="15.5" cy="10" r="2.2" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="15.5" cy="10" r="1" fill="#111"/><path d="M8 17C10.5 18.5 14 18.5 16.5 16.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>` },
    { id: 'classic', name: 'Klasyczne Oczka', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="8.5" cy="10" r="3" fill="#fff" stroke="#111" stroke-width="1.6"/><circle cx="15.5" cy="10" r="3" fill="#fff" stroke="#111" stroke-width="1.6"/><circle cx="9" cy="10" r="1.4" fill="#111"/><circle cx="16" cy="10" r="1.4" fill="#111"/><path d="M8.5 16.5C10 18.2 14 18.2 15.5 16.5" stroke="#111" stroke-width="2" stroke-linecap="round"/></svg>` }
  ];

  function getAvatarSvg(avatarId) { return (PAWN_AVATARS.find(a => a.id === avatarId) || PAWN_AVATARS[0]).svg; }

  const PLAYER_COLORS = [
    { id: 'ember', name: 'Żar Węglowy', hex: '#ff7849' },
    { id: 'cyan', name: 'Błękit Huty', hex: '#00e5ff' },
    { id: 'gold', name: 'Złoto', hex: '#ffca28' },
    { id: 'pink', name: 'Neon Róż', hex: '#f06292' },
    { id: 'violet', name: 'Fiolet', hex: '#ab47bc' },
    { id: 'green', name: 'Szmaragd', hex: '#2ecc71' }
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
    AIRPORT:     { name: 'Lotniska (4 = Wygrana!)', color: '#00e5ff', code: 'LOT' },
    UTILITY:     { name: 'Huty i Elektrownie',      color: '#ffa000', code: 'HUT' }
  };

  const AIRPORT_INDICES = [5, 15, 25, 35];

  const BOARD_TILES = [
    { index: 0,  type: 'START',      name: 'START — Zjazd Szybem', shortName: 'START', subtitle: '+$250 za okrążenie' },
    { index: 1,  type: 'PROPERTY',   name: 'Orzegów — Burloch Arena', shortName: 'Burloch Arena', district: 'Orzegów', group: 'ORZEGOW', price: 60, buildCost: 50, rents: [10, 35, 90, 220, 360, 500] },
    { index: 2,  type: 'TREASURE',   name: 'Skarb Skarbnika', shortName: 'Skarb', district: 'Kasa Kopalni' },
    { index: 3,  type: 'PROPERTY',   name: 'Chebzie — Kolonia Kaufhaus', shortName: 'Kaufhaus', district: 'Chebzie', group: 'ORZEGOW', price: 70, buildCost: 50, rents: [8, 35, 100, 280, 420, 560] },
    { index: 4,  type: 'TAX',        name: 'Podatek Górniczy', shortName: 'Podatek', district: 'Urząd Miasta', taxAmount: 150 },
    { index: 5,  type: 'AIRPORT',    name: 'Lotnisko Chebzie-DTŚ (1/4)', shortName: '✈️ Lotnisko DTŚ', district: 'Lotnisko Strategiczne', group: 'AIRPORT', price: 220, rents: [50, 110, 220, 500] },
    { index: 6,  type: 'PROPERTY',   name: 'Godula — Szyb Godula', shortName: 'Szyb Godula', district: 'Godula', group: 'GODULA', price: 100, buildCost: 60, rents: [16, 55, 140, 330, 480, 650] },
    { index: 7,  type: 'SURPRISE',   name: 'Szansa na Szychcie', shortName: 'Szansa', district: 'Losowanie' },
    { index: 8,  type: 'PROPERTY',   name: 'Godula — Kwiaciarnia Godula', shortName: 'Kwiaciarnia Godula', district: 'Godula', group: 'GODULA', price: 110, buildCost: 60, rents: [18, 60, 150, 350, 500, 680] },
    { index: 9,  type: 'PROPERTY',   name: 'Ruda — KWK Pokój (Szyb)', shortName: 'KWK Pokój', district: 'Ruda', group: 'GODULA', price: 120, buildCost: 60, rents: [20, 65, 170, 460, 640, 800] },
    { index: 10, type: 'JAIL',       name: 'Izba / Kontrola OUG', shortName: 'Izba OUG', subtitle: 'Kontrola Górnicza' },
    { index: 11, type: 'PROPERTY',   name: 'Czarny Las — Osiedle', shortName: 'Czarny Las', district: 'Czarny Las', group: 'KOCHLOWICE', price: 140, buildCost: 90, rents: [22, 75, 200, 510, 710, 920] },
    { index: 12, type: 'UTILITY',    name: 'Elektrociepłownia Mikołaj', shortName: 'EC Mikołaj', district: 'Energetyka', group: 'UTILITY', price: 150 },
    { index: 13, type: 'PROPERTY',   name: 'Kochłowice — Rynek', shortName: 'Kochłowice', district: 'Kochłowice', group: 'KOCHLOWICE', price: 140, buildCost: 90, rents: [22, 75, 200, 510, 710, 920] },
    { index: 14, type: 'PROPERTY',   name: 'Kochłowice — Szyb Radoszowy', shortName: 'Szyb Radoszowy', district: 'Kochłowice', group: 'KOCHLOWICE', price: 160, buildCost: 90, rents: [26, 85, 220, 560, 760, 980] },
    { index: 15, type: 'AIRPORT',    name: 'Lotnisko Ruda Północ (2/4)', shortName: '✈️ Lotnisko Ruda', district: 'Lotnisko Strategiczne', group: 'AIRPORT', price: 220, rents: [50, 110, 220, 500] },
    { index: 16, type: 'PROPERTY',   name: 'Bykowina — Gwarek', shortName: 'Bykowina', district: 'Bykowina', group: 'BYKOWINA', price: 180, buildCost: 110, rents: [28, 95, 240, 620, 820, 1040] },
    { index: 17, type: 'TREASURE',   name: 'Skarb Skarbnika', shortName: 'Skarb', district: 'Kasa Kopalni' },
    { index: 18, type: 'PROPERTY',   name: 'Bykowina — ul. Górnośląska', shortName: 'Górnośląska', district: 'Bykowina', group: 'BYKOWINA', price: 180, buildCost: 110, rents: [28, 95, 240, 620, 820, 1040] },
    { index: 19, type: 'PROPERTY',   name: 'Bykowina — Planetarium Skałka', shortName: 'Skałka', district: 'Bykowina', group: 'BYKOWINA', price: 200, buildCost: 110, rents: [32, 105, 270, 720, 890, 1100] },
    { index: 20, type: 'VACATION',   name: 'Hałda Widokowa', shortName: 'Hałda', subtitle: 'Pula Miasta' },
    { index: 21, type: 'PROPERTY',   name: 'Bielszowice — Dom Kultury', shortName: 'Bielszowice', district: 'Bielszowice', group: 'BIELSZOWICE', price: 220, buildCost: 130, rents: [34, 115, 310, 760, 940, 1140] },
    { index: 22, type: 'SURPRISE',   name: 'Szansa na Szychcie', shortName: 'Szansa', district: 'Losowanie' },
    { index: 23, type: 'PROPERTY',   name: 'Bielszowice — ul. Kokota', shortName: 'ul. Kokota', district: 'Bielszowice', group: 'BIELSZOWICE', price: 220, buildCost: 130, rents: [34, 115, 310, 760, 940, 1140] },
    { index: 24, type: 'PROPERTY',   name: 'Bielszowice — KWK Ruda Ruch', shortName: 'KWK Ruda', district: 'Bielszowice', group: 'BIELSZOWICE', price: 240, buildCost: 130, rents: [38, 125, 340, 810, 990, 1200] },
    { index: 25, type: 'AIRPORT',    name: 'Lotnisko Halemba-Południe (3/4)', shortName: '✈️ Lotnisko Halemba', district: 'Lotnisko Strategiczne', group: 'AIRPORT', price: 220, rents: [50, 110, 220, 500] },
    { index: 26, type: 'PROPERTY',   name: 'Halemba — Aquadrom', shortName: 'Aquadrom', district: 'Halemba', group: 'HALEMBA', price: 260, buildCost: 150, rents: [40, 135, 370, 860, 1040, 1240] },
    { index: 27, type: 'PROPERTY',   name: 'Halemba — Elektrownia Halemba', shortName: 'El. Halemba', district: 'Halemba', group: 'HALEMBA', price: 260, buildCost: 150, rents: [40, 135, 370, 860, 1040, 1240] },
    { index: 28, type: 'UTILITY',    name: 'Wodociągi Rudzkie PWiK', shortName: 'Wodociągi', district: 'Infrastruktura', group: 'UTILITY', price: 150 },
    { index: 29, type: 'PROPERTY',   name: 'Halemba — KWK Halemba', shortName: 'KWK Halemba', district: 'Halemba', group: 'HALEMBA', price: 280, buildCost: 150, rents: [44, 145, 400, 920, 1120, 1320] },
    { index: 30, type: 'GO_TO_JAIL', name: 'Alarm Metanowy!', shortName: 'Na Izbę!', subtitle: 'Idź na Izbę' },
    { index: 31, type: 'PROPERTY',   name: 'Wirek — Kolonia Ficinus', shortName: 'Ficinus', district: 'Wirek', group: 'WIREK', price: 300, buildCost: 175, rents: [48, 160, 450, 1000, 1200, 1420] },
    { index: 32, type: 'PROPERTY',   name: 'Wirek — Szyb Andrzej', shortName: 'Szyb Andrzej', district: 'Wirek', group: 'WIREK', price: 300, buildCost: 175, rents: [48, 160, 450, 1000, 1200, 1420] },
    { index: 33, type: 'TREASURE',   name: 'Skarb Skarbnika', shortName: 'Skarb', district: 'Kasa Kopalni' },
    { index: 34, type: 'PROPERTY',   name: 'Wirek — CH Plaza Ruda Śląska', shortName: 'CH Plaza', district: 'Wirek', group: 'WIREK', price: 320, buildCost: 175, rents: [52, 175, 490, 1060, 1260, 1500] },
    { index: 35, type: 'AIRPORT',    name: 'Port Lotniczy Wirek-A4 (4/4)', shortName: '✈️ Lotnisko A4', district: 'Lotnisko Strategiczne', group: 'AIRPORT', price: 220, rents: [50, 110, 220, 500] },
    { index: 36, type: 'SURPRISE',   name: 'Szansa na Szychcie', shortName: 'Szansa', district: 'Losowanie' },
    { index: 37, type: 'PROPERTY',   name: 'Nowy Bytom — Wielki Piec Huty Pokój', shortName: 'Huta Pokój', district: 'Nowy Bytom', group: 'NOWY_BYTOM', price: 350, buildCost: 200, rents: [60, 190, 520, 1120, 1320, 1580] },
    { index: 38, type: 'TAX',        name: 'Podatek Węglowy', shortName: 'Podatek', district: 'Opłata Specjalna', taxAmount: 120 },
    { index: 39, type: 'PROPERTY',   name: 'Nowy Bytom — Plac Jana Pawła II (Ratusz)', shortName: 'Ratusz N.Bytom', district: 'Nowy Bytom', group: 'NOWY_BYTOM', price: 400, buildCost: 200, rents: [70, 230, 620, 1400, 1700, 2000] }
  ];

  const SURPRISE_CARDS = [
    { text: 'Odkryto bogatą żyłę węgla w KWK Halemba! Otrzymujesz +$160 premii.', action: 'CASH', amount: 160 },
    { text: 'Przejazd Drogową Trasą Średnicową prosto na START! Pobierz +$250.', action: 'MOVE_TO', target: 0 },
    { text: 'Awaria wentylacji na szychcie — wpłać $110 do puli miasta.', action: 'TAX_POOL', amount: 110 },
    { text: 'Otrzymujesz Kartę Wolności od Wyższego Urzędu Górniczego!', action: 'PARDON' },
    { text: 'Zysk z Kwiaciarni Godula: +$140.', action: 'CASH', amount: 140 },
    { text: 'Kontrola OUG na szychcie! Przejdź natychmiast na Izbę.', action: 'GO_JAIL' }
  ];

  const TREASURE_CARDS = [
    { text: 'Premia Barbórkowa z Ratusza w Nowym Bytomiu: +$150!', action: 'CASH', amount: 150 },
    { text: 'Zysk z najmu powierzchni w CH Plaza Wirek: +$180.', action: 'CASH', amount: 180 },
    { text: 'Fundusz rekultywacji hałd: wpłać $100 do puli miasta.', action: 'TAX_POOL', amount: 100 },
    { text: 'Karczma Piwna! Każdy aktywny gracz wypłaca Ci po $40.', action: 'BIRTHDAY', amount: 40 }
  ];

  const SVG_ICONS = {
    START: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#a6ff00" stroke-width="2.4"><polygon points="5 4 15 12 5 20 5 4" fill="#a6ff00"/><polygon points="13 4 21 12 13 20 13 4" fill="#a6ff00"/></svg>`,
    JAIL: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ff9800" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
    VACATION: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#2ecc71" stroke-width="2.2"><path d="M2 20h20L15 6l-4 7-3-3-6 10z" fill="rgba(46,204,113,0.3)"/></svg>`,
    GO_TO_JAIL: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ff5252" stroke-width="2.3"><circle cx="12" cy="12" r="9" fill="rgba(255,82,82,0.2)"/><line x1="12" y1="7" x2="12" y2="13"/><circle cx="12" cy="17" r="1.2" fill="#ff5252"/></svg>`,
    TREASURE: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#ffca28" stroke-width="2"><rect x="3" y="6" width="18" height="14" rx="3" fill="rgba(255,202,40,0.25)"/><path d="M3 11h18"/><circle cx="12" cy="11" r="2" fill="#ffca28"/></svg>`,
    SURPRISE: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><circle cx="12" cy="12" r="10" fill="rgba(240,98,146,0.2)" stroke="#f06292" stroke-width="2"/><text x="8" y="17" fill="#f06292" font-size="15" font-weight="900">?</text></svg>`,
    TAX: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#cfd8dc" stroke-width="2"><path d="M12 2L3 7v2h18V7l-9-5z"/><line x1="6" y1="9" x2="6" y2="18"/><line x1="12" y1="9" x2="12" y2="18"/><line x1="18" y1="9" x2="18" y2="18"/><path d="M3 18h18v3H3z"/></svg>`,
    AIRPORT: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#00e5ff" stroke-width="2.1"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="rgba(0,229,255,0.25)"/></svg>`,
    UTILITY: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ffca28" stroke-width="2.2"><polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2" fill="rgba(255,202,40,0.28)"/></svg>`,
    MINE_TOWER: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" stroke-width="2.2"><circle cx="12" cy="6" r="3.5"/><path d="M6 21L10 9m8 12L14 9M5 21h14"/></svg>`
  };

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

  let myClientToken = localStorage.getItem('ruda_client_token');
  if (!myClientToken) {
    myClientToken = 'cl_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
    localStorage.setItem('ruda_client_token', myClientToken);
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

  function setBannerStatus(msg, color = '#00e5ff') {
    const el = document.getElementById('net-status-banner');
    if (el) { el.textContent = msg; el.style.color = color; }
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
        }, 550);
      }
    }, 95);
  }

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
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      firebaseDb = firebase.database();
      activeFirebaseUrl = cfg.databaseURL;
      localStorage.setItem('ruda_firebase_url', activeFirebaseUrl);

      const urlInput = document.getElementById('firebase-url-input');
      if (urlInput) urlInput.value = activeFirebaseUrl;
      const fbPill = document.getElementById('fb-conn-pill');
      if (fbPill) { fbPill.textContent = '✅ Firebase Połączony'; fbPill.className = 'fb-pill connected'; }
      const topDot = document.getElementById('top-net-dot');
      if (topDot) topDot.classList.add('firebase');
      setBannerStatus('✅ Połączono z bazą Firebase Realtime Database!', '#2ecc71');
      return true;
    } catch (err) {
      return false;
    }
  }

  function buildShareInviteLink(roomCode) {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', roomCode);
    if (activeFirebaseUrl) url.searchParams.set('db', btoa(activeFirebaseUrl));
    return url.toString();
  }

  /* ==================== 5. FABRYKI STANÓW WSZYSTKICH 7 GIER ==================== */
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
      requiredRank: null,
      pile: [],
      lastPlay: null,
      lastRevealMsg: '',
      handsJson: JSON.stringify(hands),
      winnerName: null
    };
  }

  function createLudoState() {
    return { turn: 0, dice: 6, rolled: false, winner: null, pawns: [[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1]] };
  }

  function createCheckersState() {
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = { p: 1, king: false };
    for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = { p: 0, king: false };
    return { turn: 0, boardJson: JSON.stringify(b), captured: [0, 0], winner: null };
  }

  function createChessState() {
    const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let c = 0; c < 8; c++) {
      b[0][c] = { p: 1, type: back[c] }; b[1][c] = { p: 1, type: 'P' };
      b[6][c] = { p: 0, type: 'P' };     b[7][c] = { p: 0, type: back[c] };
    }
    return { turn: 0, boardJson: JSON.stringify(b), winner: null, lastMove: 'Kliknij figurę, aby zobaczyć ruchy.' };
  }

  function createConnect4State() {
    return { turn: 0, boardJson: JSON.stringify(Array(6).fill(null).map(() => Array(7).fill(null))), winner: null };
  }

  function normalizeState(st) {
    if (!st) return null;
    st.players = Array.isArray(st.players) ? st.players : Object.values(st.players || {});
    st.players.forEach((p, idx) => { if (!p.avatar) p.avatar = PAWN_AVATARS[idx % PAWN_AVATARS.length].id; });
    st.trades = Array.isArray(st.trades) ? st.trades : Object.values(st.trades || {});
    st.feed   = Array.isArray(st.feed)   ? st.feed   : Object.values(st.feed || {});
    st.chat   = Array.isArray(st.chat)   ? st.chat   : Object.values(st.chat || {});
    st.builtThisTurn = !!st.builtThisTurn;
    if (!st.mapId) st.mapId = selectedMapId;
    if (!st.properties) st.properties = {};

    BOARD_TILES.forEach(t => {
      if (t.type === 'PROPERTY' || t.type === 'AIRPORT' || t.type === 'UTILITY') {
        if (!st.properties[t.index]) {
          st.properties[t.index] = { ownerId: null, level: 0, boughtInRound: 0, mortgaged: false, history: ['Dostępne w zasobach Miasta'] };
        } else {
          const p = st.properties[t.index];
          if (!p.ownerId) p.ownerId = null;
          if (typeof p.level !== 'number') p.level = 0;
          if (typeof p.boughtInRound !== 'number') p.boughtInRound = 0;
          p.mortgaged = !!p.mortgaged;
          p.history = Array.isArray(p.history) ? p.history : Object.values(p.history || ['Dostępne']);
        }
      }
    });

    if (!st.liars || !st.liars.handsJson) {
      st.liars = createLiarsGameState(st.players);
    } else {
      st.liars.pile = Array.isArray(st.liars.pile) ? st.liars.pile : Object.values(st.liars.pile || {});
      if (st.liars.lastPlay && st.liars.lastPlay.actualCards) {
        st.liars.lastPlay.actualCards = Array.isArray(st.liars.lastPlay.actualCards)
          ? st.liars.lastPlay.actualCards
          : Object.values(st.liars.lastPlay.actualCards || {});
      }
    }

    if (!st.ludo || !st.ludo.pawns) st.ludo = createLudoState();
    else {
      st.ludo.pawns = [0,1,2,3].map(i => Array.isArray(st.ludo.pawns[i]) ? st.ludo.pawns[i] : Object.values(st.ludo.pawns[i] || [-1,-1,-1,-1]));
      if (st.ludo.winner === undefined) st.ludo.winner = null;
    }
    if (!st.checkers || !st.checkers.boardJson) st.checkers = createCheckersState();
    if (!st.chess || !st.chess.boardJson)       st.chess = createChessState();
    if (!st.connect4 || !st.connect4.boardJson) st.connect4 = createConnect4State();
    return st;
  }

  function createFreshGameState(playersList, startingCash, roomCode = 'LOKALNY', isOnline = false, initialGame = 'MONOPOLY', mapId = selectedMapId) {
    const propertiesState = {};
    BOARD_TILES.forEach(tile => {
      if (tile.type === 'PROPERTY' || tile.type === 'AIRPORT' || tile.type === 'UTILITY') {
        propertiesState[tile.index] = { ownerId: null, level: 0, boughtInRound: 0, mortgaged: false, history: ['Dostępne w zasobach Miasta'] };
      }
    });
    const chosenMap = RUDA_MAPS.find(m => m.id === mapId) || RUDA_MAPS[0];
    const mappedPlayers = playersList.map((p, idx) => ({
      id: p.id || ('p' + (idx + 1)), clientToken: p.clientToken || '', name: p.name, color: p.color,
      avatar: p.avatar || PAWN_AVATARS[idx % PAWN_AVATARS.length].id, isBot: !!p.isBot,
      cash: Number(startingCash), position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
    }));

    return {
      roomCode, isOnline, lobbyOpen: isOnline, activeGame: initialGame, mapId: chosenMap.id,
      status: 'PLAYING', winnerAnnouncement: null,
      round: 1, turnIndex: 0, turnPhase: 'ROLL', builtThisTurn: false,
      lastDice: [6, 5], doublesStreak: 0, vacationPool: 100, turnSecondsLeft: 120,
      players: mappedPlayers,
      properties: propertiesState,
      trades: [],
      liars: createLiarsGameState(mappedPlayers),
      ludo: createLudoState(),
      checkers: createCheckersState(),
      chess: createChessState(),
      connect4: createConnect4State(),
      feed: [{ text: `🗺️ Arena: <strong>${chosenMap.fullTitle}</strong>! Zdobądź wszystkie 4 Lotniska (✈️) lub doprowadź rywali do bankructwa, aby wygrać!`, time: nowTime() }],
      chat: [{ author: 'Skarbnik', color: '#ffca28', text: `Szczęść Boże! Nowe tryby: 🃏 Szynk Kłamców oraz 🌸 Kwiaciarnia Godula są gotowe na górnym pasku!`, time: nowTime() }]
    };
  }

  /* ==================== 6. SYNCHRONIZACJA POKOJU ==================== */
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
          if (gameState.isOnline && !gameState.lobbyOpen) document.getElementById('lobby-overlay')?.classList.add('hidden');
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
          if (gameState.isOnline && !gameState.lobbyOpen) document.getElementById('lobby-overlay')?.classList.add('hidden');
          renderAll();
          updateLobbyWaitingRoom();
        }
      });
    }
  }

  function syncMyOnlineIdentity() {
    if (!gameState || !gameState.isOnline) return;
    const me = gameState.players.find(p => p.clientToken === myClientToken);
    if (me) { myOnlinePlayerId = me.id; activePerspectiveId = me.id; }
  }

  function pushStateSync() {
    if (!gameState) return;
    try { localStorage.setItem('ruda_room_' + gameState.roomCode, JSON.stringify(gameState)); } catch (e) {}
    if (broadcastChannel) broadcastChannel.postMessage({ type: 'SYNC', state: gameState });
    if (firebaseDb && gameState.roomCode !== 'LOKALNY') firebaseDb.ref('rooms/' + gameState.roomCode).set(gameState);
    renderAll();
  }

  /* ==================== 7. MONOPOLY ==================== */
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
        if (tile.type === 'PROPERTY' || tile.type === 'TRANSPORT' || tile.type === 'UTILITY') openPropertyModal(tile.index);
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
    if (gameState.isOnline && myOnlinePlayerId) return active.id === myOnlinePlayerId;
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
        if (groupTiles.every(t => gameState.properties[t.index]?.ownerId === prop.ownerId)) base = Math.round(base * 1.5);
      }
      return base;
    }
    if (tile.type === 'AIRPORT') {
      const cnt = AIRPORT_INDICES.filter(idx => gameState.properties[idx]?.ownerId === prop.ownerId).length;
      return tile.rents[Math.max(0, cnt - 1)] || 50;
    }
    if (tile.type === 'UTILITY') {
      const cnt = BOARD_TILES.filter(t => t.type === 'UTILITY' && gameState.properties[t.index]?.ownerId === prop.ownerId).length;
      return cnt >= 2 ? diceSum * 10 : diceSum * 5;
    }
    return 0;
  }

  function getBuyoutCost(tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    if (!tile || !prop || tile.type === 'AIRPORT') return null;
    if (tile.type === 'UTILITY') return tile.price * 2;
    return Math.round((tile.price * 2) + (prop.level * (tile.buildCost || 100) * 2.5));
  }

  function canBuyoutProperty(tileIndex, buyerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const buyer = getPlayerById(buyerId);
    const active = currentTurnPlayer();

    if (!tile || !prop || !prop.ownerId) return { ok: false, reason: 'Pole jest niczyje.' };
    if (prop.ownerId === buyerId) return { ok: false, reason: 'To już jest Twoje pole.' };
    if (tile.type === 'AIRPORT') {
      return { ok: false, reason: '✈️ Lotnisk NIE MOŻNA odkupić siłą! Możesz je przejąć tylko wtedy, gdy właściciel będzie musiał je sprzedać z braku pieniędzy.' };
    }
    if (!active || active.id !== buyerId || buyer.position !== tileIndex || gameState.turnPhase === 'ROLL') {
      return { ok: false, reason: '🚶 Odkupić cudze pole możesz wyłącznie wtedy, gdy staniesz na nim swoim pionkiem!' };
    }
    if (prop.level >= 5) {
      return { ok: false, reason: '🏨 Na tym polu stoi już Hotel (Poziom 5) — jest chronione przed wykupem!' };
    }
    const cost = getBuyoutCost(tileIndex);
    if (!buyer || buyer.cash < cost) {
      return { ok: false, reason: `Brakuje Ci $${cost - (buyer?.cash || 0)} do przymusowego wykupu (Koszt: $${cost}).` };
    }
    return { ok: true, cost, reason: `💼 Możesz odkupić to pole od właściciela za zawyżoną cenę $${cost}!` };
  }

  function executeHostileBuyout(tileIndex, buyerId) {
    const check = canBuyoutProperty(tileIndex, buyerId);
    if (!check.ok) return false;

    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const buyer = getPlayerById(buyerId);
    const oldOwner = getPlayerById(prop.ownerId);

    buyer.cash -= check.cost;
    if (oldOwner) oldOwner.cash += check.cost;
    prop.ownerId = buyer.id;
    prop.boughtInRound = gameState.round;
    gameState.builtThisTurn = true;
    prop.history.unshift(`${nowTime()} — Przymusowy wykup przez ${buyer.name} od ${oldOwner?.name} za $${check.cost}`);

    addFeedEvent(`💼 <strong>${buyer.name}</strong> wykupił pole <strong>${tile.shortName}</strong> od <strong>${oldOwner?.name}</strong> za <strong>$${check.cost}</strong>!`);
    sfx.buy();
    pushStateSync();
    return true;
  }

  function checkMonopolyVictory() {
    if (!gameState || gameState.status === 'FINISHED') return false;

    for (const p of gameState.players) {
      if (p.bankrupt) continue;
      const ownedAirports = AIRPORT_INDICES.filter(idx => gameState.properties[idx]?.ownerId === p.id);
      if (ownedAirports.length === 4) {
        gameState.status = 'FINISHED';
        gameState.winnerAnnouncement = {
          winnerName: p.name,
          reason: `✈️ ${p.name} wykupił wszystkie 4 Strategiczne Lotniska Rudy Śląskiej i wygrał grę!`,
          cash: p.cash
        };
        addFeedEvent(`🏆 <strong>${p.name}</strong> ZDOBYŁ WSZYSTKIE 4 LOTNISKA I WYGRYWA GRĘ!`);
        sfx.win();
        pushStateSync();
        return true;
      }
    }

    if (gameState.players.length >= 2) {
      const alive = gameState.players.filter(p => !p.bankrupt);
      if (alive.length === 1) {
        const winner = alive[0];
        gameState.status = 'FINISHED';
        gameState.winnerAnnouncement = {
          winnerName: winner.name,
          reason: `👑 Wszyscy pozostali gracze zbankrutowali! ${winner.name} zostaje jedynym Magnatem Rudy Śląskiej!`,
          cash: winner.cash
        };
        addFeedEvent(`👑 <strong>${winner.name}</strong> WYGRYWA MONOPOLY RUDA ŚLĄSKA!`);
        sfx.win();
        pushStateSync();
        return true;
      }
    }
    return false;
  }

  function canUpgradeProperty(tileIndex, playerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const player = getPlayerById(playerId);
    const active = currentTurnPlayer();

    if (!tile || tile.type !== 'PROPERTY') return { ok: false, reason: 'Na tym polu nie buduje się domów.' };
    if (!prop || prop.ownerId !== playerId) return { ok: false, reason: 'Nie jesteś właścicielem tej dzielnicy.' };
    if (!active || active.id !== playerId) return { ok: false, reason: 'Budować możesz tylko podczas swojej tury.' };
    if (player.position !== tileIndex) {
      return { ok: false, reason: '🚶 Musisz stać swoim pionkiem centralnie na tym polu, aby wybudować na nim dom!' };
    }
    if (gameState.turnPhase === 'ROLL') {
      return { ok: false, reason: '🎲 Najpierw wykonaj rzut kostką w tej turze!' };
    }
    if (prop.boughtInRound >= gameState.round) {
      return { ok: false, reason: '🔄 Kupiłeś to pole w tym okrążeniu! Musisz przejechać całą mapę i stanąć tu ponownie w kolejnym okrążeniu, aby zbudować dom.' };
    }
    if (gameState.builtThisTurn) {
      return { ok: false, reason: '⏳ Wykorzystałeś już limit 1 wybudowanego domu w tej turze!' };
    }
    if (prop.mortgaged) return { ok: false, reason: 'Pole jest obciążone hipoteką.' };
    if (prop.level >= 5) return { ok: false, reason: 'Osiągnięto maksymalny poziom (Poziom 5 — Hotel).' };
    if (!player || player.cash < tile.buildCost) {
      return { ok: false, reason: `Brakuje Ci $${tile.buildCost - (player?.cash || 0)}.` };
    }
    return { ok: true, reason: '✅ Wróciłeś na swoje pole po okrążeniu! Możesz zbudować dom.' };
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
    prop.history.unshift(`${nowTime()} — ${player.name} wrócił na pole i zbudował ${lvlName} za $${tile.buildCost}`);
    addFeedEvent(`🏠 <strong>${player.name}</strong> odwiedził swoje pole <strong>${tile.shortName}</strong> i zbudował <strong>${lvlName}</strong>!`);
    sfx.build();
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
    addFeedEvent(`🔨 <strong>${player.name}</strong> sprzedał dom w <strong>${tile.shortName}</strong> za <strong>+$${refund}</strong>.`);
    sfx.buy();
    pushStateSync();
    return true;
  }

  function sellLandToBank(tileIndex, playerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const player = getPlayerById(playerId);
    if (!prop || prop.ownerId !== playerId) return false;

    const housesValue = prop.level * Math.floor((tile.buildCost || 0) * 0.5);
    const landValue = prop.mortgaged ? Math.floor(tile.price * 0.25) : Math.floor(tile.price * 0.75);
    const totalRefund = housesValue + landValue;

    prop.ownerId = null;
    prop.level = 0;
    prop.boughtInRound = 0;
    prop.mortgaged = false;
    player.cash += totalRefund;
    prop.history.unshift(`${nowTime()} — Sprzedane z powrotem na rynek przez ${player.name} (+$${totalRefund})`);

    if (tile.type === 'AIRPORT') {
      addFeedEvent(`✈️ <strong>${player.name}</strong> musiał sprzedać <strong>${tile.shortName}</strong> za <strong>+$${totalRefund}</strong>! Lotnisko jest znów wolne!`);
    } else {
      addFeedEvent(`💵 <strong>${player.name}</strong> sprzedał pole <strong>${tile.shortName}</strong> do Banku za <strong>+$${totalRefund}</strong>!`);
    }
    sfx.buy();
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
      addFeedEvent(`🏦 <strong>${player.name}</strong> zastawił hipoteką <strong>${tile.shortName}</strong> (+$${val})`);
    } else {
      const payoff = Math.ceil(tile.price * 0.55);
      if (player.cash < payoff) return false;
      player.cash -= payoff;
      prop.mortgaged = false;
      addFeedEvent(`🏦 <strong>${player.name}</strong> spłacił hipotekę <strong>${tile.shortName}</strong> (-$${payoff})`);
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
    if (!gameState || gameState.activeGame !== 'MONOPOLY' || gameState.status !== 'PLAYING' || gameState.turnPhase !== 'ROLL' || isRollingLock) return;
    const player = currentTurnPlayer();
    if (!player || player.bankrupt) return;
    if (!player.isBot && !canControlTurn()) return;

    isRollingLock = true;
    sfx.dice();

    const d1El = document.getElementById('die-box-1');
    const d2El = document.getElementById('die-box-2');
    d1El?.classList.add('rolling');
    d2El?.classList.add('rolling');

    setTimeout(() => {
      d1El?.classList.remove('rolling');
      d2El?.classList.remove('rolling');

      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2;
      const isDouble = d1 === d2;

      gameState.lastDice = [d1, d2];
      if (d1El) d1El.dataset.val = d1;
      if (d2El) d2El.dataset.val = d2;

      if (player.inJail) {
        if (isDouble) {
          player.inJail = false; player.jailTurns = 0;
          addFeedEvent(`<strong>${player.name}</strong> wyrzucił dublet (${d1}+${d2}) i wychodzi z Izby!`);
        } else {
          player.jailTurns += 1;
          if (player.jailTurns >= 3) {
            player.cash -= 100; player.inJail = false; player.jailTurns = 0;
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
          player.position = 10; player.inJail = true; gameState.doublesStreak = 0; gameState.turnPhase = 'END';
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
        checkMonopolyVictory();
        pushStateSync();
        if (player.isBot && gameState.status === 'PLAYING') setTimeout(botMonopolyTurn, 750);
      });
    }, 430);
  }

  function resolveLandedTile(player, tileIndex, diceSum) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const alertEl = document.getElementById('center-card-alert');
    alertEl?.classList.add('hidden');

    addFeedEvent(`<strong>${player.name}</strong> wyrzucił ${gameState.lastDice[0]}+${gameState.lastDice[1]} ➔ <strong>${tile.name}</strong>`);

    if (tile.type === 'PROPERTY' || tile.type === 'AIRPORT' || tile.type === 'UTILITY') {
      if (!prop.ownerId) {
        gameState.turnPhase = 'DECIDE';
        return;
      }
      if (prop.ownerId === player.id) {
        if (tile.type === 'PROPERTY' && prop.boughtInRound < gameState.round && prop.level < 5 && !prop.mortgaged) {
          addFeedEvent(`🏗️ <strong>${player.name}</strong> wrócił na swoje pole <strong>${tile.shortName}</strong>! Może teraz dokupić dom.`);
        }
        gameState.turnPhase = 'END';
        return;
      }
      if (prop.ownerId !== player.id && !prop.mortgaged) {
        const owner = getPlayerById(prop.ownerId);
        const rent = calculateRent(tileIndex, diceSum);
        player.cash -= rent;
        owner.cash += rent;
        sfx.rent();
        addFeedEvent(`💸 <strong>${player.name}</strong> zapłacił <strong>$${rent}</strong> opłaty dla <strong>${owner.name}</strong> (${tile.shortName})`);
      }
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'TAX') {
      const tax = tile.taxAmount || 120;
      player.cash -= tax;
      gameState.vacationPool += tax;
      addFeedEvent(`🏛️ <strong>${player.name}</strong> naliczono <strong>$${tax}</strong> podatku.`);
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'VACATION') {
      const bonus = gameState.vacationPool;
      player.cash += bonus;
      gameState.vacationPool = 50;
      addFeedEvent(`🏖️ <strong>${player.name}</strong> zgarnia pulę z Hałdy: <strong>+$${bonus}</strong>!`);
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'GO_TO_JAIL') {
      player.position = 10; player.inJail = true; player.jailTurns = 0; gameState.doublesStreak = 0;
      addFeedEvent(`🚨 <strong>${player.name}</strong> skierowany na Izbę!`);
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'SURPRISE' || tile.type === 'TREASURE') {
      const deck = tile.type === 'SURPRISE' ? SURPRISE_CARDS : TREASURE_CARDS;
      const card = deck[Math.floor(Math.random() * deck.length)];
      if (alertEl) {
        alertEl.textContent = card.text;
        alertEl.classList.remove('hidden');
      }
      addFeedEvent(`🃏 <strong>${player.name}</strong>: "${card.text}"`);
      if (card.action === 'CASH') player.cash += card.amount;
      if (card.action === 'TAX_POOL') { player.cash -= card.amount; gameState.vacationPool += card.amount; }
      if (card.action === 'PARDON') player.pardonCards += 1;
      if (card.action === 'GO_JAIL') { player.position = 10; player.inJail = true; }
      if (card.action === 'MOVE_TO') { if (card.target < player.position) player.cash += 250; player.position = card.target; }
      if (card.action === 'BIRTHDAY') {
        gameState.players.forEach(o => { if (o.id !== player.id && !o.bankrupt) { o.cash -= card.amount; player.cash += card.amount; } });
      }
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
    prop.boughtInRound = gameState.round;
    gameState.builtThisTurn = true;
    prop.history.unshift(`${nowTime()} — Kupione przez ${player.name} za $${tile.price} (Okrążenie #${gameState.round})`);
    sfx.buy();

    if (tile.type === 'AIRPORT') {
      const ownedAirports = AIRPORT_INDICES.filter(idx => gameState.properties[idx]?.ownerId === player.id).length;
      addFeedEvent(`✈️ <strong>${player.name}</strong> kupił <strong>${tile.name}</strong>! Posiada już <strong>${ownedAirports}/4 Lotnisk</strong>!`);
    } else {
      addFeedEvent(`💰 <strong>${player.name}</strong> kupił <strong>${tile.name}</strong> za <strong>$${tile.price}</strong>!`);
    }

    gameState.turnPhase = 'END';
    if (checkMonopolyVictory()) return;
    pushStateSync();
    if (player.isBot) setTimeout(botMonopolyTurn, 500);
  }

  function endCurrentTurn() {
    if (!gameState || gameState.status !== 'PLAYING') return;
    const player = currentTurnPlayer();
    if (!player.isBot && !canControlTurn()) return;

    if (player.cash < 0) {
      const myOwned = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === player.id);
      if (myOwned.length > 0 && !player.isBot) {
        alert(`🚨 Masz dług ($${player.cash})!\n\nMusisz sprzedać swoje domy lub działki (w tym Lotniska!) z listy po prawej stronie, aby wyjść na minimum $0 zanim zakończysz turę!`);
        return;
      }
      declareBankruptcy(player.id, null);
      return;
    }

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

    if (nextP.isBot && gameState.activeGame === 'MONOPOLY') setTimeout(handleRollDice, 750);
  }

  function botMonopolyTurn() {
    if (!gameState || gameState.activeGame !== 'MONOPOLY' || gameState.status !== 'PLAYING') return;
    const bot = currentTurnPlayer();
    if (!bot || !bot.isBot || bot.bankrupt) return;

    if (gameState.turnPhase === 'DECIDE') {
      const tile = BOARD_TILES[bot.position];
      if (bot.cash >= tile.price) { buyCurrentField(); return; }
      else gameState.turnPhase = 'END';
    }

    if (!gameState.builtThisTurn && canUpgradeProperty(bot.position, bot.id).ok && bot.cash > 200) {
      buildHouseOnProperty(bot.position, bot.id);
    }

    while (bot.cash < 0) {
      const withHouses = BOARD_TILES.find(t => gameState.properties[t.index]?.ownerId === bot.id && gameState.properties[t.index]?.level > 0);
      if (withHouses) { sellHouseOnProperty(withHouses.index, bot.id); continue; }
      const normalLand = BOARD_TILES.find(t => t.type !== 'AIRPORT' && gameState.properties[t.index]?.ownerId === bot.id);
      if (normalLand) { sellLandToBank(normalLand.index, bot.id); continue; }
      const airportLand = BOARD_TILES.find(t => t.type === 'AIRPORT' && gameState.properties[t.index]?.ownerId === bot.id);
      if (airportLand) { sellLandToBank(airportLand.index, bot.id); continue; }
      declareBankruptcy(bot.id, null);
      return;
    }

    setTimeout(endCurrentTurn, 550);
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
        if (!creditorId) { prop.level = 0; prop.boughtInRound = 0; prop.mortgaged = false; }
      }
    });
    addFeedEvent(`💀 <strong>${player.name}</strong> ogłosił bankructwo i odpada z gry!`);
    if (checkMonopolyVictory()) return;
    if (currentTurnPlayer().id === playerId) endCurrentTurn();
    else pushStateSync();
  }

  function openGiftModal() {
    const sender = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const others = gameState.players.filter(p => !p.bankrupt && p.id !== sender.id);
    if (!others.length) return;
    document.getElementById('gift-error-msg').textContent = '';
    document.getElementById('gift-cash-amount').value = 0;
    document.getElementById('gift-target-player').innerHTML = others.map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
    const myProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === sender.id);
    document.getElementById('gift-props-list').innerHTML = myProps.length
      ? myProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-gift-prop"/> ${t.name}</label>`).join('')
      : '<span style="color:#b5abd6;font-size:0.76rem;">Brak działek.</span>';
    const myBuiltProps = myProps.filter(t => t.type === 'PROPERTY' && gameState.properties[t.index]?.level > 0);
    document.getElementById('gift-house-source').innerHTML = `<option value="">-- Nie przekazuj pojedynczego domu --</option>` +
      myBuiltProps.map(t => `<option value="${t.index}">Przekaż 1 dom z: ${t.name} (Poz. ${gameState.properties[t.index].level})</option>`).join('');
    document.getElementById('gift-modal')?.classList.remove('hidden');
  }

  function executeGiftTransfer() {
    const sender = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const receiver = getPlayerById(document.getElementById('gift-target-player').value);
    const cashVal = Math.max(0, Number(document.getElementById('gift-cash-amount').value) || 0);
    const propIndices = Array.from(document.querySelectorAll('.chk-gift-prop:checked')).map(el => Number(el.value));
    const houseSourceIdx = document.getElementById('gift-house-source').value;
    if (!receiver) return;
    if (cashVal > sender.cash) { document.getElementById('gift-error-msg').textContent = 'Nie masz tylu pieniędzy!'; return; }
    if (cashVal === 0 && propIndices.length === 0 && !houseSourceIdx) return;

    const summary = [];
    if (cashVal > 0) { sender.cash -= cashVal; receiver.cash += cashVal; summary.push(`$${cashVal}`); }
    propIndices.forEach(idx => {
      const pr = gameState.properties[idx];
      if (pr && pr.ownerId === sender.id) { pr.ownerId = receiver.id; summary.push(BOARD_TILES[idx].shortName); }
    });
    if (houseSourceIdx !== '') {
      const hIdx = Number(houseSourceIdx);
      const srcProp = gameState.properties[hIdx];
      if (srcProp && srcProp.ownerId === sender.id && srcProp.level > 0) {
        srcProp.level -= 1;
        receiver.cash += BOARD_TILES[hIdx].buildCost;
        summary.push(`+$${BOARD_TILES[hIdx].buildCost} z domu`);
      }
    }
    addFeedEvent(`🎁 <strong>${sender.name}</strong> podarował graczowi <strong>${receiver.name}</strong>: <strong>${summary.join(', ')}</strong>!`);
    sfx.buy();
    document.getElementById('gift-modal')?.classList.add('hidden');
    checkMonopolyVictory();
    pushStateSync();
  }

  function renderTradesList() {
    const panel = document.getElementById('trades-panel-box');
    const box = document.getElementById('trades-list-box');
    if (!panel || !box) return;
    if (!gameState.trades || !gameState.trades.length) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');
    box.innerHTML = gameState.trades.map(tr => {
      const from = getPlayerById(tr.fromId), to = getPlayerById(tr.toId);
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
          s.cash = s.cash - tr.giveCash + tr.takeCash; t.cash = t.cash - tr.takeCash + tr.giveCash;
          (tr.giveProps || []).forEach(idx => { if (gameState.properties[idx]) gameState.properties[idx].ownerId = t.id; });
          (tr.takeProps || []).forEach(idx => { if (gameState.properties[idx]) gameState.properties[idx].ownerId = s.id; });
        }
        gameState.trades = gameState.trades.filter(x => x.id !== b.dataset.acc);
        checkMonopolyVictory();
        pushStateSync();
      };
    });
    box.querySelectorAll('[data-rej]').forEach(b => {
      b.onclick = () => { gameState.trades = gameState.trades.filter(x => x.id !== b.dataset.rej); pushStateSync(); };
    });
  }

  function renderChat() {
    const stream = document.getElementById('chat-stream');
    if (!stream) return;
    stream.innerHTML = gameState.chat.map(m => `
      <div class="chat-bubble-row">
        <span class="player-pawn-inline" style="background:${m.color || '#7c4dff'};width:16px;height:16px;flex-shrink:0;margin-top:3px;"></span>
        <div class="chat-msg-bubble"><span class="chat-msg-author">${m.author} • ${m.time}</span><div>${m.text}</div></div>
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
      localPicker.innerHTML = PLAYER_COLORS.map(c => `<button type="button" class="color-dot-pick ${c.hex === localPickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}"></button>`).join('');
      localPicker.querySelectorAll('.color-dot-pick').forEach(btn => { btn.onclick = () => { localPickedColor = btn.dataset.hex; renderLobbySetup(); }; });
    }

    const localAvPicker = document.getElementById('local-avatar-picker');
    if (localAvPicker) {
      localAvPicker.innerHTML = PAWN_AVATARS.map(a => `<button type="button" class="avatar-pick-btn ${a.id === localPickedAvatar ? 'active' : ''}" data-av="${a.id}" title="${a.name}">${a.svg}</button>`).join('');
      localAvPicker.querySelectorAll('.avatar-pick-btn').forEach(btn => { btn.onclick = () => { localPickedAvatar = btn.dataset.av; renderLobbySetup(); }; });
    }

    const onlinePicker = document.getElementById('online-color-picker');
    if (onlinePicker) {
      onlinePicker.innerHTML = PLAYER_COLORS.map(c => `<button type="button" class="color-dot-pick ${c.hex === onlinePickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}"></button>`).join('');
      onlinePicker.querySelectorAll('.color-dot-pick').forEach(btn => { btn.onclick = () => { onlinePickedColor = btn.dataset.hex; renderLobbySetup(); }; });
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
            <strong>${o.name}</strong>
          </div>
          ${lobbyOpponents.length > 1 ? `<button type="button" class="btn-ghost" data-rm-opp="${idx}">Usuń</button>` : ''}
        </div>
      `).join('');
      oppBox.querySelectorAll('[data-rm-opp]').forEach(btn => { btn.onclick = () => { lobbyOpponents.splice(Number(btn.dataset.rmOpp), 1); renderLobbySetup(); }; });
    }
  }

  function updateLobbyWaitingRoom() {
    if (!gameState || !currentRoomCode || currentRoomCode === 'LOKALNY') return;
    document.getElementById('room-waiting-box')?.classList.remove('hidden');
    const codeDisp = document.getElementById('lobby-room-code-display');
    if (codeDisp) codeDisp.textContent = currentRoomCode;
    const plBox = document.getElementById('lobby-room-players');
    if (plBox) {
      plBox.innerHTML = gameState.players.map(p => `
        <div class="btn-ghost" style="border-left:4px solid ${p.color};display:flex;align-items:center;gap:6px;">
          <span class="player-pawn-inline" style="background:${p.color};width:18px;height:18px;">${getAvatarSvg(p.avatar)}</span>
          <span>${p.name} ${p.isBot ? '🤖' : '👤'} ${p.clientToken === myClientToken ? '(Ty)' : ''}</span>
        </div>
      `).join('');
    }
  }

  function addOrReconnectPlayerToRoom(roomState, myName, myColor, myAvatar, tokenToUse = myClientToken) {
    roomState = normalizeState(roomState);
    const existing = roomState.players.find(p => p.clientToken === tokenToUse);
    if (existing) {
      existing.name = myName || existing.name;
      existing.avatar = myAvatar || existing.avatar;
      myOnlinePlayerId = existing.id; activePerspectiveId = existing.id;
      return roomState;
    }
    const newId = 'p' + (roomState.players.length + 1);
    roomState.players.push({
      id: newId, clientToken: tokenToUse, name: myName, color: myColor, avatar: myAvatar || 'cool',
      isBot: false, cash: 2000, position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
    });
    myOnlinePlayerId = newId; activePerspectiveId = newId;
    roomState.liars = createLiarsGameState(roomState.players);
    roomState.feed.unshift({ text: `👋 <strong>${myName}</strong> dołączył do pokoju!`, time: nowTime() });
    return roomState;
  }

  function showRankingModal() {
    if (!gameState) return;
    const sorted = [...gameState.players].sort((a, b) => {
      if (a.bankrupt !== b.bankrupt) return a.bankrupt ? 1 : -1;
      let netA = a.cash, netB = b.cash;
      BOARD_TILES.forEach(t => {
        if (gameState.properties[t.index]?.ownerId === a.id) netA += t.price;
        if (gameState.properties[t.index]?.ownerId === b.id) netB += t.price;
      });
      return netB - netA;
    });

    const winner = sorted[0];
    const spot = document.getElementById('ranking-champion-spotlight');
    if (spot && winner) {
      spot.innerHTML = `
        <span class="champ-crown-icon">👑</span>
        <h3 style="color:#ffca28;font-size:1.3rem;margin:4px 0;">Król Areny: ${winner.name}</h3>
        <p style="font-size:0.85rem;color:#b5abd6;">Najbogatszy magnat Rudy Śląskiej z majątkiem $${winner.cash}</p>
      `;
    }

    const tbody = document.getElementById('ranking-tbody');
    if (tbody) {
      tbody.innerHTML = sorted.map((p, idx) => `
        <tr class="${idx === 0 ? 'top-winner-row' : ''}">
          <td><strong>#${idx + 1}</strong></td>
          <td style="display:flex;align-items:center;gap:7px;">
            <span class="player-pawn-inline" style="background:${p.color};width:20px;height:20px;">${getAvatarSvg(p.avatar)}</span>
            ${p.name} ${idx === 0 ? '👑' : ''} ${p.isBot ? '🤖' : ''}
          </td>
          <td>${p.bankrupt ? '❌ Zbankrutował' : '🟢 Aktywny'}</td>
          <td><strong>$${p.cash}</strong></td>
        </tr>
      `).join('');
    }

    document.getElementById('ranking-modal')?.classList.remove('hidden');
  }

  function showGenericModal(title, htmlContent) {
    const tEl = document.getElementById('generic-modal-title');
    const bEl = document.getElementById('generic-modal-body');
    if (tEl) tEl.textContent = title;
    if (bEl) bEl.innerHTML = htmlContent;
    document.getElementById('generic-modal')?.classList.remove('hidden');
  }

  function initEvents() {
    document.querySelectorAll('.mob-nav-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.mobTab;
        if (tab === 'ranking') { showRankingModal(); return; }
        if (tab === 'lobby') { document.getElementById('lobby-overlay')?.classList.remove('hidden'); return; }

        const stageBoard = document.getElementById('mobile-pane-board');
        const sidePanel = document.getElementById('mobile-pane-sidebar');
        if (stageBoard && sidePanel) {
          if (tab === 'board') {
            stageBoard.style.display = 'flex';
            sidePanel.style.display = 'none';
          } else if (tab === 'players') {
            stageBoard.style.display = 'none';
            sidePanel.style.display = 'flex';
            document.getElementById('side-panel-players')?.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'chat') {
            stageBoard.style.display = 'none';
            sidePanel.style.display = 'flex';
            document.getElementById('side-panel-chat')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };
    });

    bindClick('btn-show-ranking', showRankingModal);
    bindClick('btn-ranking-continue', () => document.getElementById('ranking-modal')?.classList.add('hidden'));
    bindClick('btn-ranking-rematch', () => {
      document.getElementById('ranking-modal')?.classList.add('hidden');
      document.getElementById('btn-reset-board')?.click();
    });

    bindClick('btn-toggle-theme', () => {
      document.body.classList.toggle('theme-light');
      document.body.classList.toggle('theme-dark');
    });

    document.querySelectorAll('.game-pick-card').forEach(card => {
      card.onclick = () => {
        document.querySelectorAll('.game-pick-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedGameMode = card.dataset.game;
      };
    });

    document.querySelectorAll('[data-switch-game]').forEach(btn => {
      btn.onclick = () => { if (!gameState) return; gameState.activeGame = btn.dataset.switchGame; pushStateSync(); checkBotForOtherGames(); };
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
      if (!connectFirebaseDatabase(document.getElementById('firebase-url-input')?.value)) {
        setBannerStatus('❌ Nieprawidłowy adres URL Firebase.', '#ff5252');
      }
    });

    bindClick('btn-create-room', () => {
      const typedUrl = document.getElementById('firebase-url-input')?.value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);
      const hostName = document.getElementById('online-name-input')?.value.trim() || 'Sztygar';
      const code = document.getElementById('join-code-input')?.value.trim().toUpperCase() || ('RUDA' + Math.floor(100 + Math.random() * 900));
      const players = [{ id: 'p1', clientToken: myClientToken, name: hostName, color: onlinePickedColor, avatar: onlinePickedAvatar, isBot: false }];
      myOnlinePlayerId = 'p1'; activePerspectiveId = 'p1';
      gameState = createFreshGameState(players, 2000, code, true, selectedGameMode, selectedMapId);
      subscribeToRoom(code); pushStateSync(); updateLobbyWaitingRoom();
    });

    bindClick('btn-join-room', () => {
      const typedUrl = document.getElementById('firebase-url-input')?.value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);
      const code = document.getElementById('join-code-input')?.value.trim().toUpperCase();
      if (!code) return;
      const myName = document.getElementById('online-name-input')?.value.trim() || ('Górnik_' + Math.floor(10 + Math.random() * 89));

      if (firebaseDb) {
        firebaseDb.ref('rooms/' + code).once('value').then((snap) => {
          const cloudRoom = snap.val();
          if (cloudRoom) {
            gameState = addOrReconnectPlayerToRoom(cloudRoom, myName, onlinePickedColor, onlinePickedAvatar, myClientToken);
            subscribeToRoom(code); pushStateSync(); updateLobbyWaitingRoom();
          } else setBannerStatus(`❌ Pokój "${code}" nie istnieje.`, '#ff5252');
        });
        return;
      }
      const savedRaw = localStorage.getItem('ruda_room_' + code);
      if (savedRaw) {
        gameState = addOrReconnectPlayerToRoom(JSON.parse(savedRaw), myName, onlinePickedColor, onlinePickedAvatar, myClientToken);
        subscribeToRoom(code); pushStateSync(); updateLobbyWaitingRoom();
      }
    });

    bindClick('btn-room-add-bot', () => {
      if (!gameState || gameState.players.length >= 6) return;
      const idx = gameState.players.length + 1;
      gameState.players.push({
        id: 'p' + idx, clientToken: '', name: 'Bot Górnik #' + idx,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length].hex, avatar: PAWN_AVATARS[idx % PAWN_AVATARS.length].id,
        isBot: true, cash: 2000, position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
      });
      gameState.liars = createLiarsGameState(gameState.players);
      pushStateSync(); updateLobbyWaitingRoom();
    });

    bindClick('btn-launch-room-game', () => {
      if (!gameState) return;
      if (gameState.players.length < 2) document.getElementById('btn-room-add-bot')?.click();
      document.getElementById('lobby-overlay')?.classList.add('hidden');
      playMapRouletteAnimation((pickedMapId) => {
        gameState.lobbyOpen = false;
        gameState.activeGame = selectedGameMode;
        gameState.mapId = pickedMapId;
        pushStateSync();
        checkBotForOtherGames();
      });
    });

    bindClick('btn-copy-invite-lobby', () => navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode)));
    bindClick('btn-copy-invite-top', () => navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode)));

    bindClick('btn-add-bot', () => {
      if (lobbyOpponents.length >= 5) return;
      lobbyOpponents.push({ name: 'Bot KWK #' + (lobbyOpponents.length + 1), isBot: true, color: PLAYER_COLORS[(lobbyOpponents.length + 1) % PLAYER_COLORS.length].hex, avatar: PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id });
      renderLobbySetup();
    });

    bindClick('btn-add-human', () => {
      if (lobbyOpponents.length >= 5) return;
      lobbyOpponents.push({ name: `Gracz ${lobbyOpponents.length + 2}`, isBot: false, color: PLAYER_COLORS[(lobbyOpponents.length + 1) % PLAYER_COLORS.length].hex, avatar: PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id });
      renderLobbySetup();
    });

    bindClick('btn-start-local-game', () => {
      const mainName = document.getElementById('local-name-input')?.value.trim() || 'Sztygar';
      const startCash = Number(document.getElementById('local-cash-select')?.value) || 2000;
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
        pushStateSync();
        checkBotForOtherGames();
      });
    });

    bindClick('btn-roll', handleRollDice);
    bindClick('dice-stage', handleRollDice);
    bindClick('btn-buy', buyCurrentField);
    bindClick('btn-end-turn', endCurrentTurn);
    bindClick('btn-ludo-roll', rollLudoDice);
    bindClick('ludo-die', rollLudoDice);

    bindClick('btn-build-quick', () => {
      const active = currentTurnPlayer();
      if (canUpgradeProperty(active.position, active.id).ok) buildHouseOnProperty(active.position, active.id);
    });

    bindClick('btn-buyout-field', () => {
      const active = currentTurnPlayer();
      if (canBuyoutProperty(active.position, active.id).ok) executeHostileBuyout(active.position, active.id);
    });

    bindClick('btn-sell-emergency', () => {
      const active = currentTurnPlayer();
      const firstOwned = BOARD_TILES.find(t => gameState.properties[t.index]?.ownerId === active.id);
      if (firstOwned) openPropertyModal(firstOwned.index);
    });

    bindClick('btn-jail-pay', () => {
      const active = currentTurnPlayer();
      if (canControlTurn() && active.inJail && active.cash >= 100) { active.cash -= 100; active.inJail = false; active.jailTurns = 0; pushStateSync(); }
    });

    bindClick('btn-jail-card', () => {
      const active = currentTurnPlayer();
      if (canControlTurn() && active.inJail && active.pardonCards > 0) { active.pardonCards -= 1; active.inJail = false; active.jailTurns = 0; pushStateSync(); }
    });

    bindClick('btn-liars-play', playLiarsCards);
    bindClick('btn-liars-call', callLiarOnLastPlay);
    bindClick('btn-liars-new-match', () => {
      if (!gameState) return;
      gameState.liars = createLiarsGameState(gameState.players);
      selectedLiarCardIds = [];
      pushStateSync();
    });

    document.querySelectorAll('.casino-quick-bet').forEach(btn => {
      btn.onclick = () => {
        const inp = document.getElementById('casino-bet-input');
        if (inp) inp.value = btn.dataset.bet;
      };
    });
    document.querySelectorAll('[data-rbet]').forEach(btn => {
      btn.onclick = () => spinGodulaRoulette(btn.dataset.rbet);
    });
    bindClick('btn-spin-slots', spinGodulaSlots);

    bindClick('btn-reset-board', () => {
      if (!gameState) return;
      isRollingLock = false;
      if (gameState.activeGame === 'LIARS') gameState.liars = createLiarsGameState(gameState.players);
      if (gameState.activeGame === 'LUDO') gameState.ludo = createLudoState();
      if (gameState.activeGame === 'CHECKERS') gameState.checkers = createCheckersState();
      if (gameState.activeGame === 'CHESS') gameState.chess = createChessState();
      if (gameState.activeGame === 'CONNECT4') gameState.connect4 = createConnect4State();
      pushStateSync();
    });

    const perspSel = document.getElementById('perspective-select');
    if (perspSel) perspSel.onchange = (e) => { activePerspectiveId = e.target.value; renderAll(); };

    bindClick('btn-bankrupt', () => {
      const viewer = getPlayerById(activePerspectiveId) || currentTurnPlayer();
      if (confirm(`Ogłosić bankructwo dla ${viewer.name}?`)) declareBankruptcy(viewer.id, null);
    });

    bindClick('btn-open-gift', openGiftModal);
    bindClick('btn-confirm-gift', executeGiftTransfer);
    bindClick('btn-close-gift', () => document.getElementById('gift-modal')?.classList.add('hidden'));

    let auctionState = null;
    bindClick('btn-auction', () => {
      const active = currentTurnPlayer();
      const tile = BOARD_TILES[active.position];
      auctionState = { tileIndex: tile.index, highBid: Math.max(20, Math.floor(tile.price * 0.4)), leaderId: null };
      document.getElementById('auc-title').textContent = tile.name;
      document.getElementById('auc-current-bid').textContent = `$${auctionState.highBid}`;
      document.getElementById('auc-bidder-select').innerHTML = gameState.players.filter(p => !p.bankrupt).map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
      document.getElementById('auction-modal')?.classList.remove('hidden');
    });

    document.querySelectorAll('.btn-auc-add').forEach(btn => {
      btn.onclick = () => {
        if (!auctionState) return;
        const bidder = getPlayerById(document.getElementById('auc-bidder-select').value);
        const inc = Number(btn.dataset.inc);
        if (bidder && bidder.cash >= auctionState.highBid + inc) {
          auctionState.highBid += inc; auctionState.leaderId = bidder.id;
          document.getElementById('auc-current-bid').textContent = `$${auctionState.highBid}`;
          document.getElementById('auc-leader-name').textContent = `Prowadzi: ${bidder.name}`;
        }
      };
    });

    bindClick('btn-auc-finalize', () => {
      if (auctionState && auctionState.leaderId) {
        const winner = getPlayerById(auctionState.leaderId);
        winner.cash -= auctionState.highBid;
        gameState.properties[auctionState.tileIndex].ownerId = winner.id;
        gameState.properties[auctionState.tileIndex].boughtInRound = gameState.round;
      }
      document.getElementById('auction-modal')?.classList.add('hidden');
      gameState.turnPhase = 'END';
      checkMonopolyVictory();
      pushStateSync();
    });

    bindClick('btn-auc-cancel', () => { document.getElementById('auction-modal')?.classList.add('hidden'); gameState.turnPhase = 'END'; pushStateSync(); });

    bindClick('btn-new-trade', () => {
      const sender = getPlayerById(activePerspectiveId) || currentTurnPlayer();
      const partners = gameState.players.filter(p => !p.bankrupt && p.id !== sender.id);
      if (!partners.length) return;
      const pSel = document.getElementById('trade-partner-select');
      pSel.innerHTML = partners.map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
      const myProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === sender.id);
      document.getElementById('trade-give-props').innerHTML = myProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-give-prop"/> ${t.name}</label>`).join('');
      const renderTarget = () => {
        const theirProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === pSel.value);
        document.getElementById('trade-take-props').innerHTML = theirProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-take-prop"/> ${t.name}</label>`).join('');
      };
      pSel.onchange = renderTarget; renderTarget();
      document.getElementById('trade-modal')?.classList.remove('hidden');
    });

    bindClick('btn-send-trade-offer', () => {
      const sender = getPlayerById(activePerspectiveId) || currentTurnPlayer();
      const target = getPlayerById(document.getElementById('trade-partner-select').value);
      const giveCash = Number(document.getElementById('trade-give-cash').value) || 0;
      const takeCash = Number(document.getElementById('trade-take-cash').value) || 0;
      const giveProps = Array.from(document.querySelectorAll('.chk-give-prop:checked')).map(el => Number(el.value));
      const takeProps = Array.from(document.querySelectorAll('.chk-take-prop:checked')).map(el => Number(el.value));
      gameState.trades.push({ id: 'tr_' + Date.now(), fromId: sender.id, toId: target.id, giveCash, takeCash, giveProps, takeProps });
      document.getElementById('trade-modal')?.classList.add('hidden');
      pushStateSync();
    });

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
    bindClick('btn-close-lobby', () => document.getElementById('lobby-overlay')?.classList.add('hidden'));
    bindClick('btn-toggle-sound', (e) => { sfx.enabled = !sfx.enabled; e.currentTarget.textContent = sfx.enabled ? '🔊' : '🔇'; });
    bindClick('btn-open-rules', () => {
      showGenericModal(
        '⚒️ Zasady 7 Gier — Ruda Śląska Arena Ultimate',
        `<div style="line-height:1.65;font-size:0.86rem;display:flex;flex-direction:column;gap:8px;">
          <p><strong>✈️ 1. 4 Lotniska = Wygrana:</strong> Na planszy są 4 Lotniska. Zgromadzenie wszystkich 4 daje natychmiastowe zwycięstwo! Lotnisk nie da się od nikogo odkupić siłą — można je przejąć tylko wtedy, gdy właściciel musi je sprzedać przez brak gotówki.</p>
          <p><strong>💼 2. Odkup cudzych pól:</strong> Gdy staniesz na zwykłej dzielnicy innego gracza, płacisz mu czynsz, a następnie możesz przymusowo odkupić od niego to pole po zawyżonej cenie.</p>
          <p><strong>🏠 3. Budowa domów:</strong> Po zakupie pustej działki musisz przejechać całą mapę i ponownie stanąć na tym polu w kolejnym okrążeniu, aby wybudować dom.</p>
          <p><strong>🃏 4. Szynk Kłamców:</strong> Wykładaj zakryte karty zgodnie z deklarowaną figurą albo kliknij "SPRAWDZAM!", jeśli podejrzewasz blef!</p>
          <p><strong>🌸 5. Kwiaciarnia Godula:</strong> Kręć kołem ruletki oraz automatem 777 za gotówkę z portfela.</p>
        </div>`
      );
    });

    bindClick('btn-close-prop-modal', () => document.getElementById('prop-modal')?.classList.add('hidden'));
    bindClick('btn-close-trade', () => document.getElementById('trade-modal')?.classList.add('hidden'));
    bindClick('btn-close-generic', () => document.getElementById('generic-modal')?.classList.add('hidden'));

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

  window.addEventListener('DOMContentLoaded', () => {
    buildMonopolyBoardDOM();
    applyMapTheme(selectedMapId);
    renderLobbySetup();
    initEvents();

    const params = new URLSearchParams(window.location.search);
    const dbParam = params.get('db');
    const savedFb = localStorage.getItem('ruda_firebase_url');

    if (dbParam) { try { connectFirebaseDatabase(atob(dbParam)); } catch (e) {} }
    else if (HARDCODED_FIREBASE_URL) connectFirebaseDatabase(HARDCODED_FIREBASE_URL);
    else if (savedFb) connectFirebaseDatabase(savedFb);

    gameState = createFreshGameState([
      { id: 'p1', clientToken: myClientToken, name: 'Sztygar', color: PLAYER_COLORS[0].hex, avatar: localPickedAvatar, isBot: false },
      ...lobbyOpponents.map((o, i) => ({ id: 'p' + (i + 2), name: o.name, color: o.color, avatar: o.avatar, isBot: o.isBot }))
    ], 2000, 'LOKALNY', false, 'MONOPOLY', selectedMapId);
    renderAll();

    const roomParam = params.get('room');
    if (roomParam && roomParam.toUpperCase() !== 'LOKALNY') {
      document.querySelector('[data-tab="online"]')?.click();
      const jInp = document.getElementById('join-code-input');
      if (jInp) jInp.value = roomParam.toUpperCase();
    }
  });
})();
