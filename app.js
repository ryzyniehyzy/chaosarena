/**
 * RUDA ŚLĄSKA ARENA ULTIMATE — KOMPLETNY SILNIK 8 GIER (app.js)
 * Wklej ten kod jako CAŁą zawartość pliku app.js!
 */
(function () {
  'use strict';

  const HARDCODED_FIREBASE_URL = "";
  const STORAGE_VERSION = "v14_complete_8games";

  try {
    if (localStorage.getItem('ruda_arena_version') !== STORAGE_VERSION) {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('ruda_room_')) localStorage.removeItem(k);
      });
      localStorage.setItem('ruda_arena_version', STORAGE_VERSION);
    }
  } catch (e) {}

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
    { index: 3,  type: 'PROPERTY',   name: 'Chebzie — Kolonia Kaufhaus', shortName: 'Kaufhaus', district: 'Chebzie', group: 'ORZEGOW', price: 70, buildCost: 50, rents: [12, 45, 110, 280, 420, 580] },
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
    { text: 'Odkryto bogatą żyłę węgla w KWK Halemba! Otrzymujesz +$160 premii.', action: 'CASH', amount: 160, good: true },
    { text: 'Przejazd Drogową Trasą Średnicową prosto na START! Pobierz +$250.', action: 'MOVE_TO', target: 0, good: true },
    { text: 'Awaria wentylacji na szychcie — wpłać $110 do puli miasta.', action: 'TAX_POOL', amount: 110, good: false },
    { text: 'Otrzymujesz Kartę Wolności od Wyższego Urzędu Górniczego!', action: 'PARDON', good: true },
    { text: 'Zysk z Kwiaciarni Godula: +$140.', action: 'CASH', amount: 140, good: true },
    { text: 'Kontrola OUG na szychcie! Przejdź natychmiast na Izbę.', action: 'GO_JAIL', good: false }
  ];

  const TREASURE_CARDS = [
    { text: 'Premia Barbórkowa z Ratusza w Nowym Bytomiu: +$150!', action: 'CASH', amount: 150, good: true },
    { text: 'Zysk z najmu powierzchni w CH Plaza Wirek: +$180.', action: 'CASH', amount: 180, good: true },
    { text: 'Fundusz rekultywacji hałd: wpłać $100 do puli miasta.', action: 'TAX_POOL', amount: 100, good: false },
    { text: 'Karczma Piwna! Każdy aktywny gracz wypłaca Ci po $40.', action: 'BIRTHDAY', amount: 40, good: true }
  ];

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

  /* ==================== 4. STAN GLOBALNY I UKRYTY TRYB SZTYGARA ==================== */
  let myClientToken = localStorage.getItem('ruda_client_token');
  if (!myClientToken) {
    myClientToken = 'cl_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
    localStorage.setItem('ruda_client_token', myClientToken);
  }

  let secretLuckEnabled = false;
  let secretKeyBuffer = '';
  let emblemTapCount = 0;
  let emblemTapTimer = null;

  function updateSecretVisualIndicator() {
    const emblem = document.querySelector('.brand-emblem');
    if (!emblem) return;
    emblem.style.position = 'relative';
    emblem.style.cursor = 'pointer';

    let dot = document.getElementById('secret-luck-dot');
    if (!dot) {
      dot = document.createElement('span');
      dot.id = 'secret-luck-dot';
      emblem.appendChild(dot);
    }

    dot.style.cssText = secretLuckEnabled
      ? 'position:absolute;bottom:2px;right:2px;width:9px;height:9px;border-radius:50%;background:#00ff66;box-shadow:0 0 10px #00ff66;border:1.5px solid #000;display:block;z-index:20;'
      : 'display:none;';

    emblem.style.boxShadow = secretLuckEnabled ? '0 0 14px rgba(0, 255, 102, 0.65)' : '';
  }

  function toggleSecretLuckMode() {
    secretLuckEnabled = !secretLuckEnabled;
    updateSecretVisualIndicator();
    sfx.beep(secretLuckEnabled ? 880 : 240, 0.06, 'sine', 0.04);
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

  function setBannerStatus(msg, color = '#00e5ff') {
    const el = document.getElementById('net-status-banner');
    if (el) { el.textContent = msg; el.style.color = color; }
  }

  function hasSecretLuck(player) {
    if (!secretLuckEnabled || !player || player.isBot) return false;
    if (gameState && gameState.isOnline) return player.clientToken === myClientToken;
    return player.id === 'p1';
  }

  function getMyViewerPlayer() {
    if (!gameState || !gameState.players.length) return null;
    if (gameState.isOnline && myOnlinePlayerId) {
      return getPlayerById(myOnlinePlayerId) || gameState.players[0];
    }
    const cur = currentTurnPlayer();
    if (cur && !cur.isBot) return cur;
    return gameState.players.find(p => !p.isBot) || gameState.players[0];
  }

  /* ==================== SYSTEM 2 DRUŻYN DLA GIER 2-OSOBOWYCH ==================== */
  function getTeamActivePlayer(sideIndex, subGameObj) {
    if (!gameState || !gameState.players.length) return null;
    if (gameState.players.length <= 2) {
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
    const members = gameState.players.filter((_, idx) => (idx % 2) === sideIndex);
    return members.map(m => m.name).join(' + ');
  }

  function advance2PGameTurn(subGameObj) {
    const finishedSide = subGameObj.turn;
    if (!Array.isArray(subGameObj.teamRot)) subGameObj.teamRot = [0, 0];
    subGameObj.teamRot[finishedSide] = (subGameObj.teamRot[finishedSide] || 0) + 1;
    subGameObj.turn = 1 - finishedSide;
  }

  function canControl2PSide(sideIndex, subGameObj) {
    if (!gameState || gameState.status !== 'PLAYING') return false;
    const activeMember = getTeamActivePlayer(sideIndex, subGameObj);
    if (!activeMember || activeMember.isBot) return false;
    if (gameState.isOnline && myOnlinePlayerId) return activeMember.id === myOnlinePlayerId;
    return true;
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
        }, 500);
      }
    }, 90);
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
      requiredRank: null,
      pile: [],
      lastPlay: null,
      lastRevealMsg: '',
      handsJson: JSON.stringify(hands),
      winnerName: null
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

  function normalizeState(st) {
    if (!st) return null;
    st.players = Array.isArray(st.players) ? st.players : Object.values(st.players || {});
    const usedColors = [];
    st.players.forEach((p, idx) => {
      if (!p.avatar) p.avatar = PAWN_AVATARS[idx % PAWN_AVATARS.length].id;
      if (!p.color || usedColors.includes(p.color)) {
        p.color = getFirstAvailableColor(usedColors);
      }
      usedColors.push(p.color);
    });

    st.trades = Array.isArray(st.trades) ? st.trades : Object.values(st.trades || {});
    st.feed   = Array.isArray(st.feed)   ? st.feed   : Object.values(st.feed || {});
    st.chat   = Array.isArray(st.chat)   ? st.chat   : Object.values(st.chat || {});
    st.builtThisTurn = !!st.builtThisTurn;
    if (!st.mapId) st.mapId = selectedMapId;
    if (!st.casinoGoal) st.casinoGoal = 5000;
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

    if (!st.liars || !st.liars.handsJson) st.liars = createLiarsGameState(st.players);
    else {
      st.liars.pile = Array.isArray(st.liars.pile) ? st.liars.pile : Object.values(st.liars.pile || {});
      if (st.liars.lastPlay && st.liars.lastPlay.actualCards) {
        st.liars.lastPlay.actualCards = Array.isArray(st.liars.lastPlay.actualCards) ? st.liars.lastPlay.actualCards : Object.values(st.liars.lastPlay.actualCards || {});
      }
    }

    if (!st.quoridor || !st.quoridor.pos) st.quoridor = createQuoridorState();
    else {
      st.quoridor.pos = Array.isArray(st.quoridor.pos) ? st.quoridor.pos : Object.values(st.quoridor.pos);
      st.quoridor.wallsLeft = Array.isArray(st.quoridor.wallsLeft) ? st.quoridor.wallsLeft : Object.values(st.quoridor.wallsLeft || [10, 10]);
      st.quoridor.hWalls = Array.isArray(st.quoridor.hWalls) ? st.quoridor.hWalls : Object.values(st.quoridor.hWalls || {});
      st.quoridor.vWalls = Array.isArray(st.quoridor.vWalls) ? st.quoridor.vWalls : Object.values(st.quoridor.vWalls || {});
      st.quoridor.teamRot = Array.isArray(st.quoridor.teamRot) ? st.quoridor.teamRot : [0, 0];
      if (st.quoridor.winner === undefined) st.quoridor.winner = null;
    }

    if (!st.ludo || !st.ludo.pawns) st.ludo = createLudoState();
    else {
      st.ludo.pawns = [0,1,2,3].map(i => Array.isArray(st.ludo.pawns[i]) ? st.ludo.pawns[i] : Object.values(st.ludo.pawns[i] || [-1,-1,-1,-1]));
      if (st.ludo.winner === undefined) st.ludo.winner = null;
    }
    if (!st.checkers || !st.checkers.boardJson) st.checkers = createCheckersState();
    else st.checkers.teamRot = Array.isArray(st.checkers.teamRot) ? st.checkers.teamRot : [0, 0];

    if (!st.chess || !st.chess.boardJson) st.chess = createChessState();
    else st.chess.teamRot = Array.isArray(st.chess.teamRot) ? st.chess.teamRot : [0, 0];

    if (!st.connect4 || !st.connect4.boardJson) st.connect4 = createConnect4State();
    else st.connect4.teamRot = Array.isArray(st.connect4.teamRot) ? st.connect4.teamRot : [0, 0];

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

    return {
      roomCode, isOnline, lobbyOpen: isOnline, activeGame: initialGame, mapId: chosenMap.id,
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
      feed: [{ text: `🗺️ Arena: <strong>${chosenMap.fullTitle}</strong>! Zdobądź wszystkie 4 Lotniska (✈️) lub doprowadź rywali do bankructwa!`, time: nowTime() }],
      chat: [{ author: 'Skarbnik', color: '#ffca28', text: `Szczęść Boże! Wszystkie 8 gier (w tym 🧱 Sztolnia Labirynt i 2 Drużyny) są gotowe!`, time: nowTime() }]
    };
  }

  /* ==================== 6. SYNCHRONIZACJA POKOJU ==================== */
  function subscribeToRoom(roomCode) {
    currentRoomCode = roomCode;
    const topLabel = document.getElementById('top-room-label');
    if (topLabel) topLabel.textContent = roomCode;

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
    if (!gameState) return;
    if (gameState.isOnline) {
      const me = gameState.players.find(p => p.clientToken === myClientToken);
      if (me) {
        myOnlinePlayerId = me.id;
        activePerspectiveId = me.id;
      }
    } else {
      const viewer = getMyViewerPlayer();
      if (viewer) activePerspectiveId = viewer.id;
    }
  }

  function pushStateSync() {
    if (!gameState) return;
    syncMyOnlineIdentity();
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
        if (tile.type === 'PROPERTY' || tile.type === 'AIRPORT' || tile.type === 'UTILITY') openPropertyModal(tile.index);
        renderBoardHighlights();
      });

      board.appendChild(cell);
    });
  }

  function getPlayerById(id) { return gameState?.players.find(p => p.id === id); }
  function currentTurnPlayer() { return gameState?.players[gameState.turnIndex] || gameState?.players[0]; }

  function canControlTurn(turnPlayerIdx = gameState?.turnIndex) {
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
      return { ok: false, reason: '🚶 Odkupić cudze pole możesz wyłącznie wtedy, gdy staniesz na nim swoim pionkiem w swojej turze!' };
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
    if (!canControlTurn()) return false;
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
    if (!active || active.id !== playerId) return { ok: false, reason: 'Budować możesz tylko w swojej turze.' };
    if (player.position !== tileIndex) {
      return { ok: false, reason: '🚶 Musisz stać swoim pionkiem na tym polu, aby wybudować dom!' };
    }
    if (gameState.turnPhase === 'ROLL') {
      return { ok: false, reason: '🎲 Najpierw wykonaj rzut kostką w tej turze!' };
    }
    if (prop.boughtInRound >= gameState.round) {
      return { ok: false, reason: '🔄 Kupiłeś to pole w tym okrążeniu! Musisz przejechać całą mapę i stanąć tu ponownie w kolejnym okrążeniu.' };
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
    const lvlName = prop.level === 5 ? 'HOTEL (Poziom 5)' : `Dom #${prop.level}`;
    prop.history.unshift(`${nowTime()} — ${player.name} zbudował ${lvlName} za $${tile.buildCost}`);
    addFeedEvent(`🏠 <strong>${player.name}</strong> zbudował <strong>${lvlName}</strong> w <strong>${tile.shortName}</strong>!`);
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
    addFeedEvent(`🔨 <strong>${player.name}</strong> sprzedał dom w <strong>${tile.shortName}</strong> (+$${refund}).`);
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
    prop.history.unshift(`${nowTime()} — Sprzedane do Banku przez ${player.name} (+$${totalRefund})`);

    addFeedEvent(`💵 <strong>${player.name}</strong> sprzedał <strong>${tile.shortName}</strong> do Banku za <strong>+$${totalRefund}</strong>!`);
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

  function rollMonopolyDicePair(player) {
    let bestD1 = Math.floor(Math.random() * 6) + 1;
    let bestD2 = Math.floor(Math.random() * 6) + 1;

    if (!hasSecretLuck(player) || Math.random() > 0.65) {
      return [bestD1, bestD2];
    }

    let bestScore = -9999;
    for (let attempt = 0; attempt < 5; attempt++) {
      const c1 = Math.floor(Math.random() * 6) + 1;
      const c2 = Math.floor(Math.random() * 6) + 1;
      if (player.inJail && c1 === c2) return [c1, c2];

      const dest = (player.position + c1 + c2) % 40;
      const tile = BOARD_TILES[dest];
      const prop = gameState.properties[dest];
      let score = 0;

      if (dest < player.position) score += 50;
      if (tile.type === 'AIRPORT' && !prop?.ownerId && player.cash >= tile.price) score += 130;
      else if (tile.type === 'PROPERTY' && !prop?.ownerId && player.cash >= tile.price) score += 55;
      else if (prop?.ownerId === player.id && prop.boughtInRound < gameState.round && prop.level < 5) score += 70;
      else if (tile.type === 'VACATION') score += 45;
      else if (tile.type === 'GO_TO_JAIL' || tile.type === 'TAX') score -= 100;
      else if (prop?.ownerId && prop.ownerId !== player.id && !prop.mortgaged) {
        score -= calculateRent(dest, c1 + c2);
      }

      if (score > bestScore) {
        bestScore = score;
        bestD1 = c1;
        bestD2 = c2;
      }
    }
    return [bestD1, bestD2];
  }

  function animateStepByStepMove(player, stepsCount, onComplete) {
    let rem = stepsCount;
    function step() {
      if (rem <= 0) { onComplete(); return; }
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
      setTimeout(step, 90);
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

      const [d1, d2] = rollMonopolyDicePair(player);
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
            if (player.isBot) setTimeout(botMonopolyTurn, 600);
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
          if (player.isBot) setTimeout(botMonopolyTurn, 600);
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
        if (player.isBot && gameState.status === 'PLAYING') setTimeout(botMonopolyTurn, 600);
      });
    }, 400);
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
          addFeedEvent(`🏗️ <strong>${player.name}</strong> wrócił na swoje pole <strong>${tile.shortName}</strong>! Może wybudować dom.`);
        }
        gameState.turnPhase = 'END';
        return;
      }
      if (prop.ownerId !== player.id && !prop.mortgaged) {
        const owner = getPlayerById(prop.ownerId);
        const rent = calculateRent(tileIndex, diceSum);
        player.cash -= rent;
        if (owner) owner.cash += rent;
        sfx.rent();
        addFeedEvent(`💸 <strong>${player.name}</strong> zapłacił <strong>$${rent}</strong> czynszu dla <strong>${owner?.name}</strong> (${tile.shortName})`);
      }
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'TAX') {
      const tax = tile.taxAmount || 120;
      player.cash -= tax;
      gameState.vacationPool += tax;
      addFeedEvent(`🏛️ <strong>${player.name}</strong> zapłacił <strong>$${tax}</strong> podatku.`);
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
      let deck = tile.type === 'SURPRISE' ? SURPRISE_CARDS : TREASURE_CARDS;
      if (hasSecretLuck(player) && Math.random() < 0.75) {
        const goodOnes = deck.filter(c => c.good);
        if (goodOnes.length) deck = goodOnes;
      }
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
        alert(`🚨 Masz dług ($${player.cash})!\n\nMusisz sprzedać swoje domy lub działki z listy po prawej stronie, aby wyjść na minimum $0!`);
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
      if (player.isBot) setTimeout(handleRollDice, 600);
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

    pushStateSync();
    const nextP = currentTurnPlayer();
    if (nextP.isBot && gameState.activeGame === 'MONOPOLY') setTimeout(handleRollDice, 650);
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

    setTimeout(endCurrentTurn, 500);
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
              <strong>${p.name} ${p.isBot ? '🤖' : ''}</strong>
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
        ? `🗣️ <strong>${liars.lastPlay.playerName}</strong> deklaruje: <strong>${liars.lastPlay.count}× ${liars.lastPlay.claimedRank}</strong>`
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
            <span style="align-self:flex-start;font-size:0.82rem;">${c.rank}${c.suit}</span>
            <span style="font-size:1.5rem;">${c.suit}</span>
            <span style="align-self:flex-end;font-size:0.82rem;">${c.rank}</span>
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
      alert('Zaznacz od 1 do 4 swoich kart na dole ekranu!');
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
      liars.lastRevealMsg = `✅ PRAWDA! <strong>${accused?.name}</strong> położył [${actualStr}]! Sprawdzający <strong>${caller.name}</strong> zabiera całą pulę!`;
      sfx.rent();
    } else {
      hands[accused.id].push(...liars.pile);
      liars.lastRevealMsg = `🚨 KŁAMSTWO! <strong>${accused?.name}</strong> deklarował ${liars.lastPlay.claimedRank}, a położył [${actualStr}]! Zabiera całą pulę!`;
      sfx.buy();
    }

    liars.pile = [];
    liars.lastPlay = null;
    liars.requiredRank = null;

    for (const p of gameState.players) {
      if ((hands[p.id] || []).length === 0) {
        liars.winnerName = p.name;
        p.cash += 500;
        addFeedEvent(`🃏 <strong>${p.name}</strong> wygrał rozdanie w Szynku Kłamców (+$500)!`);
        sfx.win();
      }
    }

    liars.handsJson = JSON.stringify(hands);
    pushStateSync();
    checkBotForOtherGames();
  }

  /* ==================== 9. KWIACIARNIA GODULA (PEŁNY STÓŁ 0-36 + CEL GRY) ==================== */
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
    if (player.cash < staked + selectedCasinoChip) {
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
      header.textContent = `Grasz jako: ${viewer.name} (Portfel: $${viewer.cash})`;
    }

    const goal = Number(gameState.casinoGoal || 5000);
    const bar = document.getElementById('casino-goal-bar');
    if (bar && viewer) {
      const pct = Math.min(100, Math.round((viewer.cash / goal) * 100));
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
    if (player.cash >= goal) {
      sfx.win();
      addFeedEvent(`🌸 <strong>${player.name}</strong> rozbił bank w Kwiaciarni Godula, osiągając cel <strong>$${player.cash}</strong>!`);
      showGenericModal(
        `🌸 KRÓL KWIACIARNI GODULA: ${player.name}!`,
        `<div style="text-align:center;padding:14px;">
          <div style="font-size:3rem;">🎰👑</div>
          <h3 style="color:#ffca28;margin:8px 0;">${player.name} osiągnął cel majątkowy $${goal}!</h3>
          <p>Aktualny stan konta: <strong style="color:#2ecc71;">$${player.cash}</strong></p>
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

  function spinFullGodulaRoulette() {
    if (isCasinoBusy || !gameState) return;
    const player = getMyViewerPlayer();
    const totalBet = getTotalRouletteStaked();
    const msgEl = document.getElementById('roulette-msg');
    if (!player || totalBet <= 0) {
      if (msgEl) msgEl.textContent = '⚠️ Najpierw połóż przynajmniej jeden żeton na stole ruletki!';
      return;
    }
    if (player.cash < totalBet) {
      if (msgEl) msgEl.textContent = '❌ Nie masz wystarczająco gotówki!';
      return;
    }

    isCasinoBusy = true;
    player.cash -= totalBet;
    sfx.dice();

    let outcomeNum = Math.floor(Math.random() * 37);
    if (hasSecretLuck(player) && Math.random() < 0.6) {
      for (let i = 0; i < 8; i++) {
        const cand = Math.floor(Math.random() * 37);
        if (evaluateRoulettePayout(currentRouletteBets, cand) > totalBet) {
          outcomeNum = cand;
          break;
        }
      }
    }

    const wheel = document.getElementById('godula-roulette-wheel');
    const orbit = document.getElementById('roulette-ball-orbit');
    rouletteSpinAngle += 1440 + Math.floor(Math.random() * 360);
    if (wheel) wheel.style.transform = `rotate(${rouletteSpinAngle}deg)`;
    orbit?.classList.add('spinning');
    if (msgEl) msgEl.textContent = '🎡 Kulka kręci się w Kwiaciarni Godula...';

    setTimeout(() => {
      orbit?.classList.remove('spinning');
      const resNumEl = document.getElementById('roulette-result-num');
      if (resNumEl) resNumEl.textContent = outcomeNum;
      rouletteHistory.unshift(outcomeNum);

      const payout = evaluateRoulettePayout(currentRouletteBets, outcomeNum);
      currentRouletteBets = {};

      if (payout > 0) {
        player.cash += payout;
        if (msgEl) msgEl.textContent = `🎉 Wypadło ${outcomeNum}! Wygrywasz +$${payout}!`;
        sfx.win();
        checkCasinoGoalReached(player);
      } else {
        if (msgEl) msgEl.textContent = `💸 Wypadło ${outcomeNum}. Spróbuj kolejnego spinu!`;
      }
      isCasinoBusy = false;
      pushStateSync();
    }, 2200);
  }

  function spinGodulaSlots() {
    if (isCasinoBusy || !gameState) return;
    const player = getMyViewerPlayer();
    const bet = selectedCasinoChip;
    const msgEl = document.getElementById('slots-msg');
    if (!player || player.cash < bet) {
      if (msgEl) msgEl.textContent = `❌ Brak $${bet} na spin!`;
      return;
    }

    isCasinoBusy = true;
    player.cash -= bet;
    const symbols = ['🌹', '💎', '7️⃣', '⚒️', '🍀', '🔔'];
    const r1 = document.getElementById('slot-r1');
    const r2 = document.getElementById('slot-r2');
    const r3 = document.getElementById('slot-r3');

    let ticks = 0;
    const timer = setInterval(() => {
      if (r1) r1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      if (r2) r2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      if (r3) r3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      sfx.step();
      ticks++;
      if (ticks >= 11) {
        clearInterval(timer);
        if (hasSecretLuck(player) && Math.random() < 0.45 && r1 && r2) {
          r2.textContent = r1.textContent;
        }
        const s1 = r1?.textContent, s2 = r2?.textContent, s3 = r3?.textContent;
        let mult = 0;
        if (s1 === s2 && s2 === s3) mult = (s1 === '7️⃣' || s1 === '💎') ? 15 : 8;
        else if (s1 === s2 || s2 === s3 || s1 === s3) mult = 2;

        if (mult > 0) {
          const prize = bet * mult;
          player.cash += prize;
          if (msgEl) msgEl.textContent = `🎰 TRAFIONE (${s1}${s2}${s3})! +$${prize}!`;
          sfx.win();
          checkCasinoGoalReached(player);
        } else {
          if (msgEl) msgEl.textContent = `Układ: ${s1} ${s2} ${s3} — graj dalej!`;
        }
        isCasinoBusy = false;
        pushStateSync();
      }
    }, 85);
  }

  /* ==================== 10. SZTOLNIA LABIRYNT (QUORIDOR 9x9 + ŚCIANY + BFS) ==================== */
  let quoridorActionMode = 'MOVE';

  function ensureQuoridorDOMExists() {
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23ff9800'/><text x='50%25' y='54%25' dominant-baseline='central' text-anchor='middle' font-size='64'>⚒️</text></svg>";
      document.head.appendChild(link);
    }

    updateSecretVisualIndicator();

    const nav = document.getElementById('games-nav');
    if (nav && !nav.querySelector('[data-switch-game="QUORIDOR"]')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'game-nav-btn';
      btn.dataset.switchGame = 'QUORIDOR';
      btn.innerHTML = `<span class="g-icon">🧱</span><span>Sztolnia Labirynt</span>`;
      btn.onclick = () => {
        if (!gameState) return;
        gameState.activeGame = 'QUORIDOR';
        pushStateSync();
        checkBotForOtherGames();
      };
      nav.appendChild(btn);
    }

    const mainStage = document.getElementById('mobile-pane-board');
    if (mainStage && !document.getElementById('stage-QUORIDOR')) {
      const sec = document.createElement('section');
      sec.id = 'stage-QUORIDOR';
      sec.className = 'stage-view hidden';
      sec.innerHTML = `
        <div class="board-card-shell quoridor-shell" style="max-width:900px;width:100%;">
          <div class="game-top-bar">
            <div>
              <span class="game-tag" id="quoridor-teams-tag">WYŚCIG PRZEZ CHODNIK GÓRNICZY — QUORIDOR 9×9</span>
              <h2 id="quoridor-turn-text">Ruch: Sztygar</h2>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <div id="quoridor-walls-info" style="background:rgba(255,152,0,0.18);border:1px solid #ffca28;color:#ffca28;padding:6px 10px;border-radius:9px;font-size:0.76rem;font-weight:900;">🧱 Ściany: 10 vs 10</div>
              <button type="button" id="btn-q-mode-move" class="btn-hub btn-hub-buy">🚶 Ruch Pionkiem</button>
              <button type="button" id="btn-q-mode-wall-h" class="btn-ghost">➖ Ściana Pozioma</button>
              <button type="button" id="btn-q-mode-wall-v" class="btn-ghost">❕ Ściana Pionowa</button>
            </div>
          </div>
          <div style="width:100%;background:rgba(124,77,255,0.14);border:1px solid rgba(124,77,255,0.4);border-radius:11px;padding:7px 12px;font-size:0.76rem;text-align:center;margin:6px 0;">
            🎯 <strong>Cel:</strong> Dojdź pionkiem na przeciwległy koniec planszy! W swojej turze kliknij zielone pole ruchu LUB wybierz powyżej tryb ściany i postaw tamę przed rywalem.
          </div>
          <div style="width:100%;flex:1;min-height:420px;display:flex;align-items:center;justify-content:center;padding:8px 0;">
            <div id="quoridor-grid"></div>
          </div>
        </div>
      `;
      mainStage.appendChild(sec);

      bindClick('btn-q-mode-move', () => { quoridorActionMode = 'MOVE'; renderQuoridorGame(); });
      bindClick('btn-q-mode-wall-h', () => { quoridorActionMode = 'WALL_H'; renderQuoridorGame(); });
      bindClick('btn-q-mode-wall-v', () => { quoridorActionMode = 'WALL_V'; renderQuoridorGame(); });
    }
  }

  function isQuoridorStepOpen(r1, c1, r2, c2, hWalls, vWalls) {
    if (r2 < 0 || r2 > 8 || c2 < 0 || c2 > 8) return false;
    if (r2 === r1 - 1 && c2 === c1) {
      return !hWalls.includes(`${r2},${c1}`) && !hWalls.includes(`${r2},${c1 - 1}`);
    }
    if (r2 === r1 + 1 && c2 === c1) {
      return !hWalls.includes(`${r1},${c1}`) && !hWalls.includes(`${r1},${c1 - 1}`);
    }
    if (c2 === c1 - 1 && r2 === r1) {
      return !vWalls.includes(`${r1},${c2}`) && !vWalls.includes(`${r1 - 1},${c2}`);
    }
    if (c2 === c1 + 1 && r2 === r1) {
      return !vWalls.includes(`${r1},${c1}`) && !vWalls.includes(`${r1 - 1},${c1}`);
    }
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
      addFeedEvent(`🧱 <strong>${winPlayer?.name}</strong> przeszedł na drugą stronę Sztolni Labiryntu i wygrał mecz!`);
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
      alert('Nie masz już więcej ścian do postawienia!');
      return;
    }
    if (!canPlaceQuoridorWall(orient, r, c, q)) {
      alert('Nie można tu postawić ściany (nachodzi na inną lub całkowicie odcina rywalowi jedyną drogę do mety)!');
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
    ensureQuoridorDOMExists();
    if (!gameState) return;
    if (!gameState.quoridor || !Array.isArray(gameState.quoridor.pos)) {
      gameState.quoridor = createQuoridorState();
    }

    const grid = document.getElementById('quoridor-grid');
    if (!grid) return;
    grid.style.cssText = 'width:min(62vh,86vw,540px);height:min(62vh,86vw,540px);min-width:290px;min-height:290px;display:grid;grid-template-columns:repeat(9,1fr);grid-template-rows:repeat(9,1fr);gap:8px;background:#120e21;padding:12px;border-radius:18px;border:4px solid #3c3063;position:relative;';

    const q = gameState.quoridor;
    const activePlayer = getTeamActivePlayer(q.turn, q);

    const teamsTag = document.getElementById('quoridor-teams-tag');
    if (teamsTag) {
      teamsTag.textContent = gameState.players.length > 2
        ? `DRUŻYNA A (${getTeamNamesSummary(0)}) VS DRUŻYNA B (${getTeamNamesSummary(1)})`
        : `WYŚCIG PRZEZ CHODNIK GÓRNICZY — QUORIDOR 9×9`;
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
        cell.style.cssText = `background:${isStep ? 'rgba(46,204,113,0.34)' : '#261f3d'};border:${isStep ? '2px solid #2ecc71' : '1px solid rgba(255,255,255,0.14)'};border-radius:8px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;`;
        if (r === 0) cell.style.borderTop = '3px solid #ff7849';
        if (r === 8) cell.style.borderBottom = '3px solid #00e5ff';

        [0, 1].forEach(side => {
          if (q.pos[side] && q.pos[side].r === r && q.pos[side].c === c) {
            const pObj = getTeamActivePlayer(side, q) || gameState.players[side] || gameState.players[0];
            const pawn = document.createElement('div');
            pawn.style.cssText = `width:78%;height:78%;border-radius:50%;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;background:${side === 0 ? (pObj?.color || '#ff7849') : (pObj?.color || '#00e5ff')};box-shadow:0 4px 12px rgba(0,0,0,0.85);z-index:4;`;
            pawn.innerHTML = getAvatarSvg(pObj?.avatar || 'helmet');
            const svgEl = pawn.querySelector('svg');
            if (svgEl) { svgEl.style.width = '70%'; svgEl.style.height = '70%'; }
            cell.appendChild(pawn);
          }
        });

        if (q.hWalls.includes(`${r},${c}`)) {
          const hw = document.createElement('div');
          hw.style.cssText = 'position:absolute;left:0;bottom:-7px;width:calc(200% + 8px);height:6px;background:linear-gradient(90deg,#ff9800,#ffca28);border-radius:4px;box-shadow:0 0 10px rgba(255,152,0,0.9);z-index:9;pointer-events:none;';
          cell.appendChild(hw);
        }
        if (q.vWalls.includes(`${r},${c}`)) {
          const vw = document.createElement('div');
          vw.style.cssText = 'position:absolute;top:0;right:-7px;width:6px;height:calc(200% + 8px);background:linear-gradient(180deg,#ff9800,#ffca28);border-radius:4px;box-shadow:0 0 10px rgba(255,152,0,0.9);z-index:9;pointer-events:none;';
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
      const luckBoost = hasSecretLuck(curPlayer) ? 0.65 : 0.38;
      const d = (allInBase && Math.random() < luckBoost)
        ? 6
        : (hasSecretLuck(curPlayer) && Math.random() < 0.35 ? 6 : (Math.floor(Math.random() * 6) + 1));

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
        if (curPlayer.isBot) {
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
      teamsTag.textContent = gameState.players.length > 2
        ? `DRUŻYNA WĘGLA (${getTeamNamesSummary(0)}) VS DRUŻYNA STALI (${getTeamNamesSummary(1)})`
        : `WĘGIEL VS STAL`;
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
      teamsTag.textContent = gameState.players.length > 2
        ? `DRUŻYNA ZŁOTYCH (${getTeamNamesSummary(0)}) VS DRUŻYNA BŁĘKITNYCH (${getTeamNamesSummary(1)})`
        : `HUTA POKÓJ VS KWK HALEMBA`;
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
      teamsTag.textContent = gameState.players.length > 2
        ? `DRUŻYNA A (${getTeamNamesSummary(0)}) VS DRUŻYNA B (${getTeamNamesSummary(1)})`
        : `SZYB WYDOBYWCZY: 4 W LINII`;
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

  /* ==================== CENTRALNY STEROWNIK BOTÓW WE WSZYSTKICH 8 GRACH ==================== */
  function checkBotForOtherGames() {
    if (!gameState) return;
    if (botActionTimeout) {
      clearTimeout(botActionTimeout);
      botActionTimeout = null;
    }

    const mode = gameState.activeGame;

    if (mode === 'MONOPOLY' && gameState.status === 'PLAYING') {
      const cur = currentTurnPlayer();
      if (cur && cur.isBot && gameState.turnPhase === 'ROLL' && !isRollingLock) {
        botActionTimeout = setTimeout(handleRollDice, 650);
      }
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
    ensureQuoridorDOMExists();
    syncMyOnlineIdentity();
    if (gameState.mapId) applyMapTheme(gameState.mapId);

    if (gameState.status === 'FINISHED' && gameState.winnerAnnouncement && lastWinnerShown !== gameState.winnerAnnouncement.winnerName) {
      lastWinnerShown = gameState.winnerAnnouncement.winnerName;
      showGenericModal(
        `👑 ZWYCIĘZCA GRY: ${gameState.winnerAnnouncement.winnerName}!`,
        `<div style="text-align:center;padding:18px;">
          <div style="font-size:3.5rem;margin-bottom:8px;">🏆</div>
          <h2 style="color:#ffca28;margin-bottom:10px;">${gameState.winnerAnnouncement.winnerName} wygrywa Ruda Śląska Monopoly!</h2>
          <p style="font-size:0.95rem;line-height:1.5;margin-bottom:14px;">${gameState.winnerAnnouncement.reason}</p>
          <div style="font-weight:900;color:#2ecc71;font-size:1.1rem;">Końcowy stan konta: $${gameState.winnerAnnouncement.cash}</div>
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
    renderLiarsGame();
    renderCasinoGame();
    renderQuoridorGame();
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
      const bannerEl = document.getElementById('houses-banner-' + tile.index);
      const cellEl = document.querySelector(`.board-tile[data-index="${tile.index}"]`);

      if (capEl && prop) {
        if (prop.ownerId) {
          const owner = getPlayerById(prop.ownerId);
          capEl.classList.remove('hidden');
          capEl.style.background = owner ? owner.color : '#888';
          capEl.textContent = prop.mortgaged ? '🔒' : (prop.level === 5 ? '🏨 HOTEL' : (prop.level > 0 ? `🏠×${prop.level}` : '✓'));
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
    const active = currentTurnPlayer();
    if (!active) return;
    const roundEl = document.getElementById('hud-round');
    if (roundEl) roundEl.textContent = `Okrążenie #${gameState.round}`;
    const d1El = document.getElementById('die-box-1');
    const d2El = document.getElementById('die-box-2');
    if (d1El) d1El.dataset.val = gameState.lastDice[0];
    if (d2El) d2El.dataset.val = gameState.lastDice[1];

    const canBuildHere = canUpgradeProperty(active.position, active.id);
    const buyoutHere = canBuyoutProperty(active.position, active.id);
    const quotaEl = document.getElementById('hud-build-quota');
    if (quotaEl) {
      const airCount = AIRPORT_INDICES.filter(idx => gameState.properties[idx]?.ownerId === active.id).length;
      quotaEl.textContent = canBuildHere.ok
        ? '🏠 Stoisz na swoim polu — możesz zbudować dom!'
        : `✈️ Lotniska gracza ${active.name}: ${airCount}/4`;
      quotaEl.className = canBuildHere.ok ? 'hub-pill quota-ready' : 'hub-pill quota-used';
    }

    document.getElementById('debt-warning-banner')?.classList.toggle('hidden', !(active.cash < 0));
    const avatarDot = document.getElementById('playing-now-avatar');
    if (avatarDot) {
      avatarDot.style.background = active.color;
      avatarDot.innerHTML = getAvatarSvg(active.avatar);
      document.getElementById('playing-now-label').textContent = `Kolej gracza: ${active.name}`;
    }

    const isMyTurn = canControlTurn();
    document.getElementById('wait-turn-notice')?.classList.toggle('hidden', isMyTurn);
    document.getElementById('action-buttons-wrap')?.classList.toggle('hidden', !isMyTurn);

    const tile = BOARD_TILES[active.position];
    document.getElementById('btn-roll')?.classList.toggle('hidden', gameState.turnPhase !== 'ROLL');
    document.getElementById('btn-buy')?.classList.toggle('hidden', gameState.turnPhase !== 'DECIDE');
    document.getElementById('btn-auction')?.classList.toggle('hidden', gameState.turnPhase !== 'DECIDE');
    document.getElementById('btn-end-turn')?.classList.toggle('hidden', gameState.turnPhase === 'ROLL');

    if (gameState.turnPhase === 'DECIDE' && tile) {
      const btnBuy = document.getElementById('btn-buy');
      if (btnBuy) {
        btnBuy.textContent = `💰 Kup ${tile.shortName} ($${tile.price})`;
        btnBuy.disabled = active.cash < tile.price;
      }
    }

    const btnBuildQuick = document.getElementById('btn-build-quick');
    if (btnBuildQuick) {
      btnBuildQuick.classList.toggle('hidden', !canBuildHere.ok);
      if (canBuildHere.ok && tile) btnBuildQuick.textContent = `🏠 Zbuduj Dom na ${tile.shortName} ($${tile.buildCost})`;
    }

    const btnBuyout = document.getElementById('btn-buyout-field');
    if (btnBuyout) {
      btnBuyout.classList.toggle('hidden', !buyoutHere.ok);
      if (buyoutHere.ok && tile) btnBuyout.textContent = `💼 Wykup ${tile.shortName} ($${buyoutHere.cost})`;
    }

    const hasAnythingToSell = BOARD_TILES.some(t => gameState.properties[t.index]?.ownerId === active.id);
    document.getElementById('btn-sell-emergency')?.classList.toggle('hidden', !(active.cash < 150 && hasAnythingToSell));
    document.getElementById('btn-jail-pay')?.classList.toggle('hidden', !(active.inJail && gameState.turnPhase === 'ROLL' && active.cash >= 100));
    document.getElementById('btn-jail-card')?.classList.toggle('hidden', !(active.inJail && gameState.turnPhase === 'ROLL' && active.pardonCards > 0));
    const feedEl = document.getElementById('center-feed-log');
    if (feedEl) feedEl.innerHTML = gameState.feed.map(item => `<div class="feed-line">${item.text}</div>`).join('');
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
        const teamLabel = gameState.players.length > 2 ? ((idx % 2 === 0) ? ' • Druż. A' : ' • Druż. B') : '';
        return `
          <div class="roster-player-row ${idx === gameState.turnIndex ? 'is-active' : ''} ${p.bankrupt ? 'is-bankrupt' : ''}" style="border-left-color:${p.color}">
            <div class="roster-left">
              <div class="roster-avatar" style="background:${p.color}">${getAvatarSvg(p.avatar)}</div>
              <div>
                <div class="roster-name-title">${p.name} ${p.id === viewer?.id ? '(Ty)' : ''} ${p.isBot ? '🤖' : ''}</div>
                <div class="roster-meta-sub">${BOARD_TILES[p.position].shortName}${teamLabel} ${airCnt > 0 ? `• ✈️×${airCnt}` : ''}</div>
              </div>
            </div>
            <div class="roster-money ${p.cash < 0 ? 'negative' : ''}">$${p.cash}</div>
          </div>
        `;
      }).join('');
    }
  }

  function renderMyProperties() {
    const viewer = getMyViewerPlayer();
    const listEl = document.getElementById('my-properties-scroll');
    if (!viewer || !listEl) return;

    const ownedTiles = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === viewer.id);
    const headTxt = document.getElementById('my-props-header-text');
    if (headTxt) headTxt.textContent = `🏘️ Pola gracza ${viewer.name} (${ownedTiles.length})`;
    let totalWorth = viewer.cash;
    ownedTiles.forEach(t => { totalWorth += t.price + (gameState.properties[t.index].level * (t.buildCost || 0)); });
    const worthBadge = document.getElementById('my-networth-badge');
    if (worthBadge) worthBadge.textContent = `Majątek: $${totalWorth}`;

    if (!ownedTiles.length) {
      listEl.innerHTML = `<div style="font-size:0.76rem;color:var(--text-muted);">Brak kupionych pól.</div>`;
      return;
    }

    listEl.innerHTML = ownedTiles.map(t => {
      const pr = gameState.properties[t.index];
      const grp = GROUPS[t.group];
      const upCheck = canUpgradeProperty(t.index, viewer.id);
      const lvlBadge = pr.mortgaged ? '🔒 Hipoteka' : (t.type === 'PROPERTY' ? (pr.level === 5 ? '🏨 HOTEL' : `🏠 Poz. ${pr.level}/5`) : '✈️ Lotnisko');
      const buildBtnHtml = (t.type === 'PROPERTY' && upCheck.ok) ? `<button type="button" class="btn-quick-up" data-build-idx="${t.index}">+🏠 $${t.buildCost}</button>` : '';
      const sellBtnHtml = (t.type === 'PROPERTY' && pr.level > 0)
        ? `<button type="button" class="btn-quick-sell" data-sell-house-idx="${t.index}">-🏠 +$${Math.floor(t.buildCost * 0.5)}</button>`
        : `<button type="button" class="btn-quick-sell" data-sell-land-idx="${t.index}">💵 Sprzedaj (+$${Math.floor(t.price * 0.75)})</button>`;

      return `
        <div class="owned-prop-item" data-open-idx="${t.index}">
          <div class="owned-prop-left"><span class="owned-dot" style="background:${grp ? grp.color : '#888'}"></span><span class="owned-name">${t.shortName}</span></div>
          <div class="owned-prop-right"><span class="lvl-tag">${lvlBadge}</span>${buildBtnHtml}${sellBtnHtml}</div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-open-idx]').forEach(row => {
      row.onclick = (e) => { if (!e.target.closest('button')) openPropertyModal(Number(row.dataset.openIdx)); };
    });
    listEl.querySelectorAll('[data-build-idx]').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); buildHouseOnProperty(Number(btn.dataset.buildIdx), viewer.id); };
    });
    listEl.querySelectorAll('[data-sell-house-idx]').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); sellHouseOnProperty(Number(btn.dataset.sellHouseIdx), viewer.id); };
    });
    listEl.querySelectorAll('[data-sell-land-idx]').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); sellLandToBank(Number(btn.dataset.sellLandIdx), viewer.id); };
    });
  }

  function renderInspector(tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    if (!tile) return;
    const prop = gameState.properties[tileIndex];
    const grp = tile.group ? GROUPS[tile.group] : null;
    const tagEl = document.getElementById('spotlight-tag');
    const titleEl = document.getElementById('spotlight-title');
    const content = document.getElementById('spotlight-content');
    if (tagEl) tagEl.textContent = tile.district || grp?.name || 'RUDA ŚLĄSKA';
    if (titleEl) titleEl.textContent = tile.name;
    if (!content) return;
    if (!prop) { content.innerHTML = `<div style="font-size:0.78rem;color:#b5abd6;">${tile.subtitle || 'Pole specjalne.'}</div>`; return; }
    const owner = prop.ownerId ? getPlayerById(prop.ownerId) : null;
    const bCost = getBuyoutCost(tileIndex);
    content.innerHTML = `
      <div class="spot-grid">
        <div class="spot-stat"><span>Cena</span><strong>$${tile.price}</strong></div>
        <div class="spot-stat"><span>Właściciel</span><strong>${owner ? owner.name : 'Wolne'}</strong></div>
        <div class="spot-stat"><span>Poziom</span><strong>${tile.type === 'AIRPORT' ? '✈️' : prop.level+'/5'}</strong></div>
        <div class="spot-stat"><span>Wykup</span><strong>${bCost ? '$'+bCost : 'Chronione'}</strong></div>
      </div>
    `;
  }

  function openPropertyModal(tileIndex) {
    selectedTileIndex = tileIndex;
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    if (!tile || !prop) return;

    const modal = document.getElementById('prop-modal');
    if (!modal) return;
    const viewer = getMyViewerPlayer();
    const owner = prop.ownerId ? getPlayerById(prop.ownerId) : null;
    const grp = tile.group ? GROUPS[tile.group] : null;

    document.getElementById('prop-modal-banner').style.background = grp ? `linear-gradient(135deg, ${grp.color}, #1c162e)` : '#2a2244';
    document.getElementById('prop-modal-group').textContent = grp ? grp.name : tile.district;
    document.getElementById('prop-modal-name').textContent = tile.name;
    document.getElementById('pm-price').textContent = `$${tile.price}`;
    document.getElementById('pm-owner').textContent = owner ? owner.name : 'Brak (Wolne)';
    document.getElementById('pm-level').textContent = tile.type === 'AIRPORT' ? 'Lotnisko (4 = Wygrana)' : `${prop.level} / 5`;
    document.getElementById('pm-rent').textContent = `$${calculateRent(tileIndex)}`;

    const bCost = getBuyoutCost(tileIndex);
    const buyoutEl = document.getElementById('pm-buyout-cost');
    if (buyoutEl) buyoutEl.textContent = bCost ? `$${bCost}` : 'Chronione (Lotnisko)';

    const tbody = document.getElementById('pm-rent-tbody');
    if (tile.type === 'PROPERTY') {
      const labels = ['Poziom 0 (Działka)','Poziom 1 (1 Dom)','Poziom 2 (2 Domy)','Poziom 3 (3 Domy)','Poziom 4 (4 Domy)','Poziom 5 (Hotel — Chroniony)'];
      tbody.innerHTML = tile.rents.map((r, lvl) => `<tr class="${prop.level === lvl ? 'current-lvl-row' : ''}"><td>${labels[lvl]}</td><td>${lvl === 5 ? '🏨' : (lvl > 0 ? '🏠×'+lvl : '—')}</td><td><strong>$${r}</strong></td></tr>`).join('');
    } else if (tile.type === 'AIRPORT') {
      tbody.innerHTML = `
        <tr><td>1 Lotnisko</td><td>✈️</td><td><strong>$50</strong></td></tr>
        <tr><td>2 Lotniska</td><td>✈️✈️</td><td><strong>$110</strong></td></tr>
        <tr><td>3 Lotniska</td><td>✈️✈️✈️</td><td><strong>$220</strong></td></tr>
        <tr class="current-lvl-row"><td>4 Lotniska</td><td>🏆</td><td><strong>NATYCHMIASTOWA WYGRANA GRY!</strong></td></tr>
      `;
    } else {
      tbody.innerHTML = `<tr><td>Czynsz przemysłowy</td><td>⚡</td><td><strong>$${calculateRent(tileIndex)}</strong></td></tr>`;
    }

    const btnBuild = document.getElementById('btn-pm-build');
    const btnBuyout = document.getElementById('btn-pm-buyout');
    const btnSell = document.getElementById('btn-pm-sell');
    const btnSellLand = document.getElementById('btn-pm-sell-land');
    const btnMort = document.getElementById('btn-pm-mortgage');

    const upCheck = canUpgradeProperty(tileIndex, viewer.id);
    const buyoutCheck = canBuyoutProperty(tileIndex, viewer.id);

    document.getElementById('pm-build-cost').textContent = tile.buildCost ? `$${tile.buildCost}` : '—';
    document.getElementById('pm-status-note').textContent = prop.ownerId === viewer.id ? upCheck.reason : buyoutCheck.reason;

    if (btnBuild) {
      btnBuild.classList.toggle('hidden', tile.type !== 'PROPERTY');
      btnBuild.disabled = !upCheck.ok;
      btnBuild.onclick = () => { if (buildHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
    }
    if (btnSell) {
      btnSell.classList.toggle('hidden', tile.type !== 'PROPERTY');
      btnSell.disabled = !(prop.ownerId === viewer.id && prop.level > 0);
      btnSell.onclick = () => { if (sellHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
    }
         if (btnBuyout) {
      btnBuyout.classList.toggle('hidden', !buyoutCheck.ok);
      if (buyoutCheck.ok) {
        btnBuyout.textContent = `💼 Wykup to pole od gracza za $${buyoutCheck.cost}!`;
        btnBuyout.onclick = () => {
          if (executeHostileBuyout(tileIndex, viewer.id)) openPropertyModal(tileIndex);
        };
      }
    }
    if (btnSellLand) {
      btnSellLand.disabled = !(prop.ownerId === viewer.id);
      btnSellLand.textContent = `💵 Sprzedaj Pole do Banku (+$${Math.floor(tile.price * 0.75)})`;
      btnSellLand.onclick = () => { if (sellLandToBank(tileIndex, viewer.id)) modal.classList.add('hidden'); };
    }
    if (btnMort) {
      btnMort.disabled = !(prop.ownerId === viewer.id && prop.level === 0);
      btnMort.onclick = () => { if (toggleMortgageProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
    }

    document.getElementById('pm-history-list').innerHTML = prop.history.map(h => `<li>${h}</li>`).join('');
    modal.classList.remove('hidden');
  }

  /* ==================== ZABEZPIECZONA DAROWIZNA ==================== */
  function openGiftModal() {
    const sender = getMyViewerPlayer();
    if (!sender || sender.isBot) return;
    const others = gameState.players.filter(p => !p.bankrupt && p.id !== sender.id);
    if (!others.length) return;
    const sNameEl = document.getElementById('gift-sender-name');
    if (sNameEl) sNameEl.textContent = `${sender.name} ($${sender.cash})`;
    document.getElementById('gift-error-msg').textContent = '';
    document.getElementById('gift-cash-amount').value = 0;
    document.getElementById('gift-target-player').innerHTML = others.map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
    const myProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === sender.id);
    document.getElementById('gift-props-list').innerHTML = myProps.length
      ? myProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-gift-prop"/> ${t.name}</label>`).join('')
      : '<span style="color:#b5abd6;font-size:0.76rem;">Brak własnych działek.</span>';
    document.getElementById('gift-modal')?.classList.remove('hidden');
  }

  function executeGiftTransfer() {
    const sender = getMyViewerPlayer();
    if (!sender || sender.isBot) return;
    const receiver = getPlayerById(document.getElementById('gift-target-player').value);
    const cashVal = Math.max(0, Number(document.getElementById('gift-cash-amount').value) || 0);
    const propIndices = Array.from(document.querySelectorAll('.chk-gift-prop:checked')).map(el => Number(el.value));
    if (!receiver || receiver.id === sender.id) return;
    if (cashVal > sender.cash) {
      document.getElementById('gift-error-msg').textContent = 'Nie masz tylu własnych pieniędzy!';
      return;
    }
    if (cashVal === 0 && propIndices.length === 0) return;

    const summary = [];
    if (cashVal > 0) { sender.cash -= cashVal; receiver.cash += cashVal; summary.push(`$${cashVal}`); }
    propIndices.forEach(idx => {
      const pr = gameState.properties[idx];
      if (pr && pr.ownerId === sender.id) { pr.ownerId = receiver.id; summary.push(BOARD_TILES[idx].shortName); }
    });
    addFeedEvent(`🎁 <strong>${sender.name}</strong> podarował graczowi <strong>${receiver.name}</strong>: <strong>${summary.join(', ')}</strong>!`);
    sfx.buy();
    document.getElementById('gift-modal')?.classList.add('hidden');
    checkMonopolyVictory();
    pushStateSync();
  }

  /* ==================== ZABEZPIECZONA WYMIANA HANDLOWA ==================== */
  function renderTradesList() {
    const panel = document.getElementById('trades-panel-box');
    const box = document.getElementById('trades-list-box');
    if (!panel || !box) return;
    if (!gameState.trades || !gameState.trades.length) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');

    const viewer = getMyViewerPlayer();

    box.innerHTML = gameState.trades.map(tr => {
      const from = getPlayerById(tr.fromId), to = getPlayerById(tr.toId);
      const giveNames = (tr.giveProps || []).map(i => BOARD_TILES[i]?.shortName).join(', ') || 'brak działek';
      const takeNames = (tr.takeProps || []).map(i => BOARD_TILES[i]?.shortName).join(', ') || 'brak działek';

      const canAccept = gameState.isOnline
        ? (viewer && viewer.id === tr.toId)
        : (currentTurnPlayer()?.id === tr.toId);

      return `
        <div class="trade-offer-card" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.14);padding:8px;border-radius:10px;font-size:0.75rem;margin-bottom:6px;">
          <div><strong>${from?.name}</strong> ➔ <strong>${to?.name}</strong></div>
          <div style="font-size:0.71rem;color:#b5abd6;margin:3px 0;">
            Daje: <strong>$${tr.giveCash}</strong> (${giveNames})<br/>
            Żąda: <strong>$${tr.takeCash}</strong> (${takeNames})
          </div>
          <div style="display:flex;gap:6px;margin-top:6px;align-items:center;">
            ${canAccept
              ? `<button type="button" class="btn-quick-up" data-acc="${tr.id}">✅ Akceptuj (Jako ${to?.name})</button>`
              : `<span style="font-size:0.68rem;color:#ffca28;">⏳ Czeka na decyzję: ${to?.name}</span>`}
            <button type="button" class="btn-ghost" data-rej="${tr.id}">Odrzuć / Anuluj</button>
          </div>
        </div>
      `;
    }).join('');

    box.querySelectorAll('[data-acc]').forEach(b => {
      b.onclick = () => {
        const tr = gameState.trades.find(x => x.id === b.dataset.acc);
        if (!tr) return;
        const s = getPlayerById(tr.fromId), t = getPlayerById(tr.toId);
        if (!s || !t || s.cash < tr.giveCash || t.cash < tr.takeCash) {
          alert('Jedna ze stron nie ma już wymaganej gotówki!');
          return;
        }
        s.cash = s.cash - tr.giveCash + tr.takeCash;
        t.cash = t.cash - tr.takeCash + tr.giveCash;
        (tr.giveProps || []).forEach(idx => { if (gameState.properties[idx]?.ownerId === s.id) gameState.properties[idx].ownerId = t.id; });
        (tr.takeProps || []).forEach(idx => { if (gameState.properties[idx]?.ownerId === t.id) gameState.properties[idx].ownerId = s.id; });
        addFeedEvent(`🤝 <strong>${t.name}</strong> zaakceptował wymianę z <strong>${s.name}</strong>!`);
        gameState.trades = gameState.trades.filter(x => x.id !== tr.id);
        checkMonopolyVictory();
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
    const sender = getMyViewerPlayer() || currentTurnPlayer();
    gameState.chat.push({ author: sender.name, color: sender.color, text: text.trim(), time: nowTime() });
    pushStateSync();
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

    // Dynamiczne dodanie kafelka Sztolnia Labirynt w Lobby, jeśli brakowało go w HTML
    const lobbyGrid = document.getElementById('lobby-game-picker');
    if (lobbyGrid && !lobbyGrid.querySelector('[data-game="QUORIDOR"]')) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'game-pick-card';
      card.dataset.game = 'QUORIDOR';
      card.innerHTML = `<span class="gp-icon">🧱</span><strong>Sztolnia Labirynt</strong><small>Ściany & Ścieżka</small>`;
      card.onclick = () => {
        document.querySelectorAll('.game-pick-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedGameMode = 'QUORIDOR';
      };
      lobbyGrid.appendChild(card);
    }

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
            <strong>${o.name}</strong>
            <span style="font-size:0.68rem;color:#b5abd6;">(${o.isBot ? 'Bot AI' : 'Człowiek'})</span>
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
      myOnlinePlayerId = existing.id;
      activePerspectiveId = existing.id;
      return roomState;
    }
    const usedColors = roomState.players.map(p => p.color);
    const uniqueColor = (!myColor || usedColors.includes(myColor)) ? getFirstAvailableColor(usedColors) : myColor;
    const newId = 'p' + (roomState.players.length + 1);
    roomState.players.push({
      id: newId, clientToken: tokenToUse, name: myName, color: uniqueColor, avatar: myAvatar || 'cool',
      isBot: false, cash: 2000, position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
    });
    myOnlinePlayerId = newId;
    activePerspectiveId = newId;
    roomState.liars = createLiarsGameState(roomState.players);
    roomState.feed.unshift({ text: `👋 <strong>${myName}</strong> dołączył do pokoju!`, time: nowTime() });
    return roomState;
  }

  function showRankingModal() {
    if (!gameState) return;
    const getNetWorth = (pl) => {
      let w = pl.cash;
      BOARD_TILES.forEach(t => {
        if (gameState.properties[t.index]?.ownerId === pl.id) {
          w += t.price + (gameState.properties[t.index].level * (t.buildCost || 0));
        }
      });
      return w;
    };

    const sorted = [...gameState.players].sort((a, b) => {
      if (a.bankrupt !== b.bankrupt) return a.bankrupt ? 1 : -1;
      return getNetWorth(b) - getNetWorth(a);
    });

    const winner = sorted[0];
    const spot = document.getElementById('ranking-champion-spotlight');
    if (spot && winner) {
      spot.innerHTML = `
        <span class="champ-crown-icon">👑</span>
        <h3 style="color:#ffca28;font-size:1.3rem;margin:4px 0;">Lider Areny: ${winner.name}</h3>
        <p style="font-size:0.84rem;color:#b5abd6;">Łączny majątek: <strong>$${getNetWorth(winner)}</strong> (Gotówka: $${winner.cash})</p>
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
              <span class="player-pawn-inline" style="background:${p.color};width:20px;height:20px;">${getAvatarSvg(p.avatar)}</span>
              ${p.name} ${idx === 0 ? '👑' : ''} ${p.isBot ? '🤖' : ''}
            </td>
            <td>${p.bankrupt ? '❌ Bankrut' : `🟢 Aktywny • ✈️×${airCnt}/4`}</td>
            <td><strong>$${getNetWorth(p)}</strong> <small style="color:#b5abd6;">($${p.cash})</small></td>
          </tr>
        `;
      }).join('');
    }
    document.getElementById('ranking-modal')?.classList.remove('hidden');
  }

  /* ==================== KSIĘGA ZASAD WSZYSTKICH 8 GIER ==================== */
  function openRulesModal(initialTab = null) {
    const activeTab = initialTab || (gameState ? gameState.activeGame : 'MONOPOLY');
    const rulesData = {
      MONOPOLY: {
        title: '🏭 Monopoly Ruda Śląska',
        body: `
          <p><strong>✈️ 1. 4 Lotniska = Natychmiastowa Wygrana:</strong> Na planszy są 4 Lotniska Strategiczne. Zgromadzenie wszystkich 4 daje natychmiastowe zwycięstwo! Lotnisk nie da się od nikogo odkupić siłą.</p>
          <p><strong>💼 2. Przymusowy wykup cudzych pól:</strong> Gdy staniesz na zwykłej dzielnicy innego gracza (poniżej Hotelu), płacisz czynsz, a następnie możesz odkupić to pole po zawyżonej cenie.</p>
          <p><strong>🏠 3. Budowa domów:</strong> Po zakupie działki musisz przejechać pełne okrążenie planszy i stanąć na niej ponownie, aby wybudować dom.</p>
        `
      },
      LIARS: {
        title: '🃏 Szynk Kłamców (Blef Karciany)',
        body: `
          <p><strong>🎯 Cel gry:</strong> Pozbądź się wszystkich swoich kart z ręki jako pierwszy (+$500 nagrody).</p>
          <p><strong>🂠 Rozgrywka:</strong> Pierwszy gracz wybiera figurę (A, K, Q, J, 10) i wykłada od 1 do 4 zakrytych kart. Kolejni gracze dokładają karty albo klikają <strong>„SPRAWDZAM!”</strong>.</p>
          <p><strong>🚨 Sprawdzanie:</strong> Jeśli poprzednik kłamał — zabiera całą pulę ze stołu. Jeśli mówił prawdę — pulę zabiera sprawdzający!</p>
        `
      },
      CASINO: {
        title: '🌸 Kwiaciarnia Godula (Ruletka 0–36 & Automat 777)',
        body: `
          <p><strong>🏆 Cel zwycięstwa:</strong> Jako pierwszy osiągnij wybrany cel majątkowy ($5 000, $10 000 lub $25 000).</p>
          <p><strong>🎡 Stół Ruletki (0–36):</strong> Wybierz żeton ($10–$500), klikaj na liczby (wypłata <strong>x36</strong>), tuziny (<strong>x3</strong>) lub kolory (<strong>x2</strong>) i zakręć kołem!</p>
        `
      },
      QUORIDOR: {
        title: '🧱 Sztolnia Labirynt (Quoridor 9×9)',
        body: `
          <p><strong>🎯 Cel gry:</strong> Przeprowadź swojego górnika na przeciwległy koniec planszy 9×9 jako pierwszy!</p>
          <p><strong>🧱 Stawianie ścian:</strong> W swojej turze przesuń pionek o 1 pole ALBO postaw jedną ze swoich 10 ścian (poziomą lub pionową), aby zablokować rywala.</p>
          <p><strong>⚠️ Zakaz zamurowania:</strong> Nie wolno zamknąć przeciwnikowi ostatniej możliwej drogi do mety.</p>
        `
      },
      LUDO: {
        title: '🎲 Chińczyk (Wyścig 4 Dzielnic)',
        body: `
          <p><strong>🎯 Cel gry:</strong> Wprowadź wszystkie 4 swoje pionki z bazy do domku na środku. Wyjście z bazy wymaga wyrzucenia <strong>6</strong>.</p>
        `
      },
      CHECKERS: {
        title: '⚫ Warcaby (2 Graczy lub 2 Drużyny)',
        body: `
          <p><strong>🎯 Zasady:</strong> Ruch po ciemnych polach na ukos. Przy >2 graczach przy stole tworzone są 2 drużyny wykonujące ruchy rotacyjnie.</p>
        `
      },
      CHESS: {
        title: '♟️ Szachy (2 Graczy lub 2 Drużyny)',
        body: `
          <p><strong>🎯 Zasady:</strong> Kliknij swoją figurę, a następnie zielone pole. Zbicie Króla rywala kończy partię. Przy >2 graczach działa tryb 2 drużyn.</p>
        `
      },
      CONNECT4: {
        title: '🪙 Sztolnia 4 w Rzędzie',
        body: `
          <p><strong>🎯 Zasady:</strong> Ułóż 4 krążki swojego koloru w linii poziomej, pionowej lub ukośnej.</p>
        `
      }
    };

    const tabsHtml = Object.keys(rulesData).map(k => `
      <button type="button" class="btn-ghost rules-tab-btn" style="${k === activeTab ? 'background:#ffca28;color:#111;font-weight:900;' : ''}" data-rtab="${k}">${rulesData[k].title.split(' ')[0]} ${k}</button>
    `).join('');

    const cur = rulesData[activeTab] || rulesData.MONOPOLY;
    showGenericModal(
      '❓ Księga Zasad — 8 Gier Ruda Śląska Arena',
      `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">${tabsHtml}</div>
       <div class="action-box" style="line-height:1.65;font-size:0.86rem;">
         <h3 style="color:#ffca28;margin-bottom:6px;">${cur.title}</h3>
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

  /* ==================== 13. INICJALIZACJA ZDARZEŃ I CHEATÓW ==================== */
  function initEvents() {
    // Wyzwalacz Cheatów #1: 5 kliknięć w logo ⚒️ w lewym górnym rogu
    const secretLogo = document.querySelector('.brand-emblem');
    if (secretLogo) {
      secretLogo.onclick = () => {
        emblemTapCount += 1;
        if (emblemTapTimer) clearTimeout(emblemTapTimer);
        if (emblemTapCount >= 5) {
          emblemTapCount = 0;
          toggleSecretLuckMode();
        } else {
          emblemTapTimer = setTimeout(() => { emblemTapCount = 0; }, 1600);
        }
      };
    }

    // Wyzwalacz Cheatów #2: 3 kliknięcia w pastylkę "Okrążenie #1" na środku planszy
    const roundPill = document.getElementById('hud-round');
    if (roundPill) {
      let rTaps = 0;
      let rTimer = null;
      roundPill.style.cursor = 'pointer';
      roundPill.onclick = () => {
        rTaps += 1;
        if (rTimer) clearTimeout(rTimer);
        if (rTaps >= 3) {
          rTaps = 0;
          toggleSecretLuckMode();
        } else {
          rTimer = setTimeout(() => { rTaps = 0; }, 1400);
        }
      };
    }

    // Wyzwalacz Cheatów #3: Wpisanie na klawiaturze słowa "sztygar"
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key && e.key.length === 1) {
        secretKeyBuffer = (secretKeyBuffer + e.key.toLowerCase()).slice(-7);
        if (secretKeyBuffer === 'sztygar') {
          secretKeyBuffer = '';
          toggleSecretLuckMode();
        }
      }
    });

    // Dolny pasek mobilny
    document.querySelectorAll('.mob-nav-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.mobTab;
        if (tab === 'ranking') { showRankingModal(); return; }
        if (tab === 'lobby') { document.getElementById('lobby-overlay')?.classList.remove('hidden'); return; }

        const stageBoard = document.getElementById('mobile-pane-board');
        const sidePanel = document.getElementById('mobile-pane-sidebar');
        if (stageBoard && sidePanel && window.innerWidth <= 1280) {
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
    bindClick('btn-close-ranking', () => document.getElementById('ranking-modal')?.classList.add('hidden'));
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
      btn.onclick = () => {
        if (!gameState) return;
        gameState.activeGame = btn.dataset.switchGame;
        pushStateSync();
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
      myOnlinePlayerId = 'p1';
      activePerspectiveId = 'p1';
      gameState = createFreshGameState(players, 2000, code, true, selectedGameMode, selectedMapId);
      subscribeToRoom(code);
      pushStateSync();
      updateLobbyWaitingRoom();
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
            subscribeToRoom(code);
            pushStateSync();
            updateLobbyWaitingRoom();
          } else setBannerStatus(`❌ Pokój "${code}" nie istnieje.`, '#ff5252');
        });
        return;
      }
      const savedRaw = localStorage.getItem('ruda_room_' + code);
      if (savedRaw) {
        gameState = addOrReconnectPlayerToRoom(JSON.parse(savedRaw), myName, onlinePickedColor, onlinePickedAvatar, myClientToken);
        subscribeToRoom(code);
        pushStateSync();
        updateLobbyWaitingRoom();
      }
    });

    bindClick('btn-room-add-bot', () => {
      if (!gameState || gameState.players.length >= 6) return;
      const idx = gameState.players.length + 1;
      const used = gameState.players.map(p => p.color);
      gameState.players.push({
        id: 'p' + idx, clientToken: '', name: 'Bot Górnik #' + idx,
        color: getFirstAvailableColor(used), avatar: PAWN_AVATARS[idx % PAWN_AVATARS.length].id,
        isBot: true, cash: 2000, position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
      });
      gameState.liars = createLiarsGameState(gameState.players);
      pushStateSync();
      updateLobbyWaitingRoom();
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

    bindClick('btn-q-mode-move', () => { quoridorActionMode = 'MOVE'; renderQuoridorGame(); });
    bindClick('btn-q-mode-wall-h', () => { quoridorActionMode = 'WALL_H'; renderQuoridorGame(); });
    bindClick('btn-q-mode-wall-v', () => { quoridorActionMode = 'WALL_V'; renderQuoridorGame(); });

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

    bindClick('btn-reset-board', () => {
      if (!gameState) return;
      isRollingLock = false;
      if (gameState.activeGame === 'MONOPOLY') {
        gameState = createFreshGameState(gameState.players, 2000, gameState.roomCode, gameState.isOnline, 'MONOPOLY', gameState.mapId);
      }
      if (gameState.activeGame === 'LIARS') gameState.liars = createLiarsGameState(gameState.players);
      if (gameState.activeGame === 'QUORIDOR') gameState.quoridor = createQuoridorState();
      if (gameState.activeGame === 'LUDO') gameState.ludo = createLudoState();
      if (gameState.activeGame === 'CHECKERS') gameState.checkers = createCheckersState();
      if (gameState.activeGame === 'CHESS') gameState.chess = createChessState();
      if (gameState.activeGame === 'CONNECT4') gameState.connect4 = createConnect4State();
      pushStateSync();
      checkBotForOtherGames();
    });

    bindClick('btn-bankrupt', () => {
      const viewer = getMyViewerPlayer();
      if (viewer && confirm(`Ogłosić bankructwo dla swojego konta (${viewer.name})?`)) declareBankruptcy(viewer.id, null);
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
      document.getElementById('auc-bidder-select').innerHTML = gameState.players.filter(p => !p.bankrupt && !p.isBot).map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
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

    bindClick('btn-auc-cancel', () => {
      document.getElementById('auction-modal')?.classList.add('hidden');
      gameState.turnPhase = 'END';
      pushStateSync();
    });

    bindClick('btn-new-trade', () => {
      const sender = getMyViewerPlayer();
      if (!sender || sender.isBot) return;
      const partners = gameState.players.filter(p => !p.bankrupt && p.id !== sender.id);
      if (!partners.length) return;
      document.getElementById('trade-error-msg').textContent = '';
      document.getElementById('trade-sender-title').textContent = `Twoja Oferta (${sender.name})`;
      document.getElementById('trade-give-cash').value = 0;
      document.getElementById('trade-take-cash').value = 0;

      const pSel = document.getElementById('trade-partner-select');
      pSel.innerHTML = partners.map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
      const myProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === sender.id);
      document.getElementById('trade-give-props').innerHTML = myProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-give-prop"/> ${t.name} ($${t.price})</label>`).join('');
      const renderTarget = () => {
        const theirProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === pSel.value);
        document.getElementById('trade-take-props').innerHTML = theirProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-take-prop"/> ${t.name} ($${t.price})</label>`).join('');
      };
      pSel.onchange = renderTarget;
      renderTarget();
      document.getElementById('trade-modal')?.classList.remove('hidden');
    });

    bindClick('btn-send-trade-offer', () => {
      const sender = getMyViewerPlayer();
      const target = getPlayerById(document.getElementById('trade-partner-select').value);
      if (!sender || !target) return;
      const giveCash = Math.max(0, Number(document.getElementById('trade-give-cash').value) || 0);
      const takeCash = Math.max(0, Number(document.getElementById('trade-take-cash').value) || 0);
      const giveProps = Array.from(document.querySelectorAll('.chk-give-prop:checked')).map(el => Number(el.value));
      const takeProps = Array.from(document.querySelectorAll('.chk-take-prop:checked')).map(el => Number(el.value));

      if (giveCash > sender.cash) {
        document.getElementById('trade-error-msg').textContent = 'Nie masz tyle gotówki!';
        return;
      }
      if (takeCash > target.cash) {
        document.getElementById('trade-error-msg').textContent = 'Partner nie ma tyle gotówki!';
        return;
      }
      if (takeProps.some(idx => BOARD_TILES[idx].type === 'AIRPORT') && !hasSecretLuck(sender)) {
        document.getElementById('trade-error-msg').textContent = '✈️ Lotniska są strategiczne i nie podlegają zwykłemu wykupowi!';
        return;
      }

      if (target.isBot) {
        const giveVal = giveCash + giveProps.reduce((a, i) => a + BOARD_TILES[i].price, 0);
        const takeVal = takeCash + takeProps.reduce((a, i) => a + BOARD_TILES[i].price, 0);
        const minRatio = hasSecretLuck(sender) ? 0.65 : 1.05;
        if (giveVal >= takeVal * minRatio && takeVal > 0) {
          sender.cash = sender.cash - giveCash + takeCash;
          target.cash = target.cash - takeCash + giveCash;
          giveProps.forEach(idx => { gameState.properties[idx].ownerId = target.id; });
          takeProps.forEach(idx => { gameState.properties[idx].ownerId = sender.id; });
          addFeedEvent(`🤖 <strong>${target.name}</strong> zaakceptował wymianę z <strong>${sender.name}</strong>!`);
          document.getElementById('trade-modal')?.classList.add('hidden');
          checkMonopolyVictory();
          pushStateSync();
        } else {
          document.getElementById('trade-error-msg').textContent = `🤖 ${target.name} odrzuca tę ofertę! Zaproponuj uczciwszą równowartość ($${takeVal}+).`;
        }
        return;
      }

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
    bindClick('btn-open-rules', () => openRulesModal());

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
    ensureQuoridorDOMExists();
    buildMonopolyBoardDOM();
    buildRouletteFeltGrid();
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
