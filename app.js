/**
 * RUDA ŚLĄSKA ARENA — KOMPLETNY SILNIK 5 GIER + FIREBASE + MAPY + CUSTOM PIONKI (app.js)
 * Nowości:
 * 1. Budowa kolejnego domu w Monopoly wymaga ponownego stanięcia pionkiem na własnym polu!
 * 2. Awaryjna sprzedaż domów (+50%) oraz całych działek do Banku (+75%), gdy brakuje gotówki.
 * 3. System Darowizny (🎁 Podaruj): przekazywanie gotówki, działek lub pojedynczych domów znajomym.
 * 4. 5 Map z autentycznymi zdjęciami z Rudy Śląskiej (Kaufhaus, Wielki Piec Huty Pokój, Szyb Andrzej, Ficinus, Ratusz Nowy Bytom).
 * 5. Customowe Pionki 3D i Kulki z Twarzami SVG (Kask Górniczy, Wagonik, Korona, Okulary, Wąs Śląski, Diabełek, Pirat, Uśmiech).
 */
(function () {
  'use strict';

  /**
   * OPCJONALNIE: Możesz tu na stałe wkleić URL swojej bazy Firebase Realtime Database
   */
  const HARDCODED_FIREBASE_URL = "";

  /* ==================== 1. MAPY TŁA RUDY ŚLĄSKIEJ (PRAWDZIWE FOTOGRAFIE WIKIMEDIA COMMONS) ==================== */
  const RUDA_MAPS = [
    {
      id: 'KAUFHAUS',
      shortTitle: 'Kaufhaus',
      fullTitle: 'Kolonia Kaufhaus (Chebzie) — Zabytkowe Familoki',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ruda_Slaska_Chebzie_Kaufhaus_02.jpg?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #3b1d16 0%, #140d1f 100%)'
    },
    {
      id: 'HUTA_POKOJ',
      shortTitle: 'Wielki Piec',
      fullTitle: 'Wielki Piec Huty Pokój (Nowy Bytom)',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Huta_Pok%C3%B3j_-_Wielki_Piec.jpg?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #3d2712 0%, #0f1424 100%)'
    },
    {
      id: 'SZYB_ANDRZEJ',
      shortTitle: 'Szyb Andrzej',
      fullTitle: 'Zabytkowy Szyb Andrzej (Wirek)',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Szyb_Andrzej_w_Rudzie_%C5%9Al%C4%85skiej.JPG?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #16302b 0%, #120e24 100%)'
    },
    {
      id: 'FICINUS',
      shortTitle: 'Kolonia Ficinus',
      fullTitle: 'Kolonia Robotnicza Ficinus (Wirek)',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ruda_%C5%9Al%C4%85ska_-_Kolonia_Ficinus_01.jpg?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #2e2038 0%, #0e1726 100%)'
    },
    {
      id: 'NOWY_BYTOM',
      shortTitle: 'Ratusz N.Bytom',
      fullTitle: 'Plac Jana Pawła II i Magistrat (Nowy Bytom)',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Urza_Miejski_w_Rudzie_Slaskiej.jpg?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #1b2845 0%, #140c1c 100%)'
    }
  ];

  /* ==================== 2. CUSTOMOWE PIONKI 3D ORAZ TWARZE (WEKTOROWE SVG) ==================== */
  const PAWN_AVATARS = [
    {
      id: 'helmet',
      name: 'Hełm Sztygara',
      svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 15C4 9.5 7.5 5 12 5C16.5 5 20 9.5 20 15H4Z" fill="#fff" stroke="#111" stroke-width="1.8"/><path d="M2 15H22V18H2V15Z" fill="#ffca28" stroke="#111" stroke-width="1.5"/><circle cx="12" cy="10" r="2.6" fill="#00e5ff" stroke="#111" stroke-width="1.4"/></svg>`
    },
    {
      id: 'cool',
      name: 'Okulary Szefa',
      svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 9H21L19 14H13.5L12 11.5L10.5 14H5L3 9Z" fill="#111"/><rect x="5" y="10" width="4" height="1.5" fill="#00e5ff"/><rect x="13.5" y="10" width="4" height="1.5" fill="#00e5ff"/><path d="M8 17.5C9.5 19 14.5 19 16 17.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>`
    },
    {
      id: 'mustache',
      name: 'Śląski Wąs',
      svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="8.5" cy="9" r="2.2" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="15.5" cy="9" r="2.2" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="8.5" cy="9" r="1" fill="#111"/><circle cx="15.5" cy="9" r="1" fill="#111"/><path d="M4 15.5C6.5 13 10.5 13.5 12 15.5C13.5 13.5 17.5 13 20 15.5C18 18 14 17.5 12 16.2C10 17.5 6 18 4 15.5Z" fill="#1b1429" stroke="#fff" stroke-width="1"/></svg>`
    },
    {
      id: 'crown',
      name: 'Korona Barona',
      svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 18L5 8L9.5 13L12 6L14.5 13L19 8L21 18H3Z" fill="#ffca28" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="15" r="1.2" fill="#e53935"/><circle cx="15" cy="15" r="1.2" fill="#00e5ff"/></svg>`
    },
    {
      id: 'cart',
      name: 'Wagonik Węgla',
      svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 6L9 3L14 5L18 3L19 7H5V6Z" fill="#111"/><path d="M4 7H20L18 15H6L4 7Z" fill="#fff" stroke="#111" stroke-width="1.8"/><circle cx="8" cy="18" r="2.3" fill="#ff9800" stroke="#111" stroke-width="1.5"/><circle cx="16" cy="18" r="2.3" fill="#ff9800" stroke="#111" stroke-width="1.5"/></svg>`
    },
    {
      id: 'devil',
      name: 'Skarbnik / Diabełek',
      svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 4L9 8M20 4L15 8" stroke="#111" stroke-width="2.5" stroke-linecap="round"/><circle cx="8.5" cy="11" r="2" fill="#ffeb3b" stroke="#111" stroke-width="1.3"/><circle cx="15.5" cy="11" r="2" fill="#ffeb3b" stroke="#111" stroke-width="1.3"/><path d="M7 16.5C9.5 19 14.5 19 17 16.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>`
    },
    {
      id: 'pirate',
      name: 'Pirat z Hałdy',
      svg: `<svg viewBox="0 0 24 24" fill="none"><line x1="4" y1="7" x2="20" y2="13" stroke="#111" stroke-width="2.2"/><circle cx="9" cy="10" r="3" fill="#111"/><circle cx="15.5" cy="10" r="2.2" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="15.5" cy="10" r="1" fill="#111"/><path d="M8 17C10.5 18.5 14 18.5 16.5 16.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>`
    },
    {
      id: 'classic',
      name: 'Klasyczne Oczka',
      svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="8.5" cy="10" r="3" fill="#fff" stroke="#111" stroke-width="1.6"/><circle cx="15.5" cy="10" r="3" fill="#fff" stroke="#111" stroke-width="1.6"/><circle cx="9" cy="10" r="1.4" fill="#111"/><circle cx="16" cy="10" r="1.4" fill="#111"/><path d="M8.5 16.5C10 18.2 14 18.2 15.5 16.5" stroke="#111" stroke-width="2" stroke-linecap="round"/></svg>`
    }
  ];

  function getAvatarSvg(avatarId) {
    const found = PAWN_AVATARS.find(a => a.id === avatarId) || PAWN_AVATARS[0];
    return found.svg;
  }

  /* ==================== 3. DANE PLANSZY MONOPOLY RUDY ŚLĄSKIEJ ==================== */
  const PLAYER_COLORS = [
    { id: 'ember',  name: 'Żar Węglowy (Wirek)',       hex: '#ff7849' },
    { id: 'cyan',   name: 'Błękit Huty (Nowy Bytom)',  hex: '#00e5ff' },
    { id: 'gold',   name: 'Złoto Skarbnika (Halemba)', hex: '#ffca28' },
    { id: 'pink',   name: 'Neon Róż (Bykowina)',       hex: '#f06292' },
    { id: 'violet', name: 'Fiolet Nocy (Godula)',      hex: '#ab47bc' },
    { id: 'green',  name: 'Szmaragd (Kochłowice)',     hex: '#2ecc71' }
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

  /* ==================== 4. SYNTEZATOR DŹWIĘKÓW ==================== */
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

  /* ==================== 5. STAN GLOBALNY, MAPY I FIREBASE ==================== */
  let myClientToken = localStorage.getItem('ruda_client_token');
  if (!myClientToken) {
    myClientToken = 'cl_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
    localStorage.setItem('ruda_client_token', myClientToken);
  }

  let gameState = null;
  let selectedGameMode = 'MONOPOLY';
  let selectedMapId = RUDA_MAPS[Math.floor(Math.random() * RUDA_MAPS.length)].id;
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

  function nowTime() { return new Date().toTimeString().slice(0, 5); }

  function setBannerStatus(msg, color = '#00e5ff') {
    const el = document.getElementById('net-status-banner');
    if (el) { el.textContent = msg; el.style.color = color; }
  }

  function applyMapTheme(mapId) {
    const m = RUDA_MAPS.find(x => x.id === mapId) || RUDA_MAPS[0];
    selectedMapId = m.id;

    const bgLayer = document.getElementById('map-bg-layer');
    const hubPhoto = document.getElementById('hub-map-photo');
    const subTitle = document.getElementById('active-map-subtitle');
    const topName = document.getElementById('top-map-name');

    const bgValue = `url("${m.photoUrl}"), ${m.fallbackGradient}`;
    if (bgLayer) bgLayer.style.backgroundImage = bgValue;
    if (hubPhoto) hubPhoto.style.backgroundImage = bgValue;
    if (subTitle) subTitle.textContent = `Mapa: ${m.fullTitle}`;
    if (topName) topName.textContent = m.shortTitle;

    document.querySelectorAll('.map-thumb-card').forEach(el => {
      el.classList.toggle('active', el.dataset.mapId === m.id);
    });
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

      setBannerStatus('✅ Połączono z bazą Firebase Realtime Database!', '#2ecc71');
      return true;
    } catch (err) {
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
    st.players.forEach((p, idx) => {
      if (!p.avatar) p.avatar = PAWN_AVATARS[idx % PAWN_AVATARS.length].id;
    });
    st.trades = Array.isArray(st.trades) ? st.trades : Object.values(st.trades || {});
    st.feed   = Array.isArray(st.feed)   ? st.feed   : Object.values(st.feed || {});
    st.chat   = Array.isArray(st.chat)   ? st.chat   : Object.values(st.chat || {});
    st.builtThisTurn = !!st.builtThisTurn;
    if (!st.mapId) st.mapId = selectedMapId;

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

  /* ==================== 6. FABRYKA STANÓW 5 GIER ==================== */
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
    return { turn: 0, boardJson: JSON.stringify(b), winner: null, lastMove: 'Kliknij figurę, aby zobaczyć podświetlone ruchy.' };
  }

  function createConnect4State() {
    const b = Array(6).fill(null).map(() => Array(7).fill(null));
    return { turn: 0, boardJson: JSON.stringify(b), winner: null };
  }

  function createFreshGameState(playersList, startingCash, roomCode = 'LOKALNY', isOnline = false, initialGame = 'MONOPOLY', mapId = selectedMapId) {
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

    const chosenMap = RUDA_MAPS.find(m => m.id === mapId) || RUDA_MAPS[0];

    return {
      roomCode: roomCode,
      isOnline: isOnline,
      lobbyOpen: isOnline,
      activeGame: initialGame,
      mapId: chosenMap.id,
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
        avatar: p.avatar || PAWN_AVATARS[idx % PAWN_AVATARS.length].id,
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
        { text: `🗺️ Wylosowano mapę: <strong>${chosenMap.fullTitle}</strong>! Aby wybudować kolejny dom, musisz ponownie stanąć pionkiem na swoim polu.`, time: nowTime() }
      ],
      chat: [
        { author: 'Skarbnik', color: '#ffca28', text: `Szczęść Boże na mapie ${chosenMap.shortTitle}! Możecie darować sobie kasę i domy przyciskiem 🎁 Podaruj.`, time: nowTime() }
      ]
    };
  }

  /* ==================== 7. SYNCHRONIZACJA POKOJU ==================== */
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

  /* ==================== 8. MONOPOLY: BUDOWA PO POWROCIE NA POLE, SPRZEDAŻ AWARYJNA I DAROWIZNY ==================== */
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
   * ZASADA BUDOWY DOMU:
   * 1. Musisz być właścicielem tego pola.
   * 2. MUSISZ AKTUALNIE STAĆ PIONKIEM NA TYM POLU (`player.position === tileIndex`) po rzucie w swojej turze!
   * 3. Nie możesz wybudować domu w tej samej turze, w której dopiero kupiłeś pustą działkę — musisz zrobić kółko i ponownie na niej wylądować!
   * 4. Limit: maksymalnie 1 dom na turę.
   */
  function canUpgradeProperty(tileIndex, playerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const player = getPlayerById(playerId);
    const active = currentTurnPlayer();

    if (!tile || tile.type !== 'PROPERTY') return { ok: false, reason: 'Tego pola nie można rozbudowywać.' };
    if (!prop || prop.ownerId !== playerId) return { ok: false, reason: 'Nie jesteś właścicielem tej dzielnicy.' };
    if (!active || active.id !== playerId) return { ok: false, reason: 'Budować możesz tylko podczas swojej tury.' };
    if (player.position !== tileIndex) {
      return { ok: false, reason: '🚶 Aby dokupić kolejny dom, musisz ponownie stanąć swoim pionkiem dokładnie na tym polu!' };
    }
    if (gameState.turnPhase === 'ROLL') {
      return { ok: false, reason: '🎲 Najpierw rzuć kostką w tej turze!' };
    }
    if (gameState.builtThisTurn) {
      return { ok: false, reason: '⏳ W tej turze kupiłeś już tę działkę lub wybudowałeś dom. Wróć tu w kolejnym okrążeniu!' };
    }
    if (prop.mortgaged) return { ok: false, reason: 'Nieruchomość jest pod hipoteką.' };
    if (prop.level >= 5) return { ok: false, reason: 'Osiągnięto maksymalny poziom (Poziom 5 — Hotel).' };
    if (!player || player.cash < tile.buildCost) {
      return { ok: false, reason: `Brakuje Ci $${tile.buildCost - (player?.cash || 0)}. Możesz sprzedać dom na innym polu!` };
    }
    return { ok: true, reason: '✅ Stoisz na swoim polu! Możesz dobudować kolejny poziom domu.' };
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

    const cellEl = document.querySelector(`.board-tile[data-index="${tileIndex}"]`);
    if (cellEl) {
      cellEl.classList.remove('upgraded-flash');
      void cellEl.offsetWidth;
      cellEl.classList.add('upgraded-flash');
    }

    pushStateSync();
    return true;
  }

  /**
   * AWARYJNA SPRZEDAŻ DOMÓW (+50%) LUB CAŁEJ DZIAŁKI DO BANKU (+75%), GDY BRAKUJE PIENIĘDZY
   */
  function sellHouseOnProperty(tileIndex, playerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const player = getPlayerById(playerId);
    if (!prop || prop.ownerId !== playerId || prop.level <= 0) return false;

    const refund = Math.floor(tile.buildCost * 0.5);
    prop.level -= 1;
    player.cash += refund;
    prop.history.unshift(`${nowTime()} — ${player.name} sprzedał dom (+$${refund})`);
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
    prop.mortgaged = false;
    player.cash += totalRefund;
    prop.history.unshift(`${nowTime()} — Odpsrzedane do Banku przez ${player.name} (+$${totalRefund})`);
    addFeedEvent(`💵 <strong>${player.name}</strong> odsprzedał działkę <strong>${tile.shortName}</strong> do Banku za <strong>+$${totalRefund}</strong>!`);
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
      if (prop.ownerId === player.id) {
        // Gracz ponownie wylądował na swoim własnym polu — może teraz wybudować kolejny dom!
        if (tile.type === 'PROPERTY' && prop.level < 5 && !prop.mortgaged) {
          addFeedEvent(`🏗️ <strong>${player.name}</strong> wrócił na swoje pole <strong>${tile.shortName}</strong>! Może teraz dokupić kolejny dom.`);
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
        addFeedEvent(`💸 <strong>${player.name}</strong> zapłacił <strong>$${rent}</strong> czynszu dla <strong>${owner.name}</strong>`);
      }
      gameState.turnPhase = 'END';
      return;
    }

    if (tile.type === 'TAX') {
      const tax = tile.taxAmount || 120;
      player.cash -= tax;
      gameState.vacationPool += tax;
      addFeedEvent(`🏛️ <strong>${player.name}</strong> naliczono <strong>$${tax}</strong> podatku miejskiego.`);
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
    // Zaznaczamy builtThisTurn = true przy pierwszym zakupie działki, żeby pierwszy dom można było postawić dopiero przy KOLEJNYM powrocie na to pole!
    gameState.builtThisTurn = true;
    prop.history.unshift(`${nowTime()} — Kupione przez ${player.name} za $${tile.price}`);
    sfx.buy();
    addFeedEvent(`💰 <strong>${player.name}</strong> kupił działkę <strong>${tile.name}</strong> za <strong>$${tile.price}</strong> (Domy zbudujesz przy kolejnej wizycie na tym polu!)`);
    gameState.turnPhase = 'END';
    pushStateSync();
    if (player.isBot) setTimeout(botMonopolyTurn, 550);
  }

  function endCurrentTurn() {
    if (!gameState) return;
    const player = currentTurnPlayer();
    if (!player.isBot && !canControlTurn()) return;

    // Jeżeli gracz ma dług (< $0), ale posiada jeszcze domy lub działki — podpowiedz mu sprzedaż zamiast od razu bankrutować
    if (player.cash < 0 && !player.isBot) {
      const myOwned = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === player.id);
      if (myOwned.length > 0) {
        const confirmBankrupt = confirm(
          `Masz ujemne saldo ($${player.cash}), ale posiadasz jeszcze nieruchomości (${myOwned.length})!\n\nKliknij "Anuluj", aby najpierw sprzedać dom lub działkę i wyjść na plus, albo "OK", aby ogłosić bankructwo.`
        );
        if (!confirmBankrupt) return;
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
      if (bot.cash >= tile.price + 60) {
        buyCurrentField();
        return;
      } else {
        gameState.turnPhase = 'END';
      }
    }

    // Jeśli Bot wylądował ponownie na swoim własnym polu -> buduje dom!
    if (!gameState.builtThisTurn && canUpgradeProperty(bot.position, bot.id).ok && bot.cash > 200) {
      buildHouseOnProperty(bot.position, bot.id);
    }

    // Jeśli Bot wpadł w dług -> sprzedaje domy lub działki, żeby się uratować!
    while (bot.cash < 0) {
      const withHouses = BOARD_TILES.find(t => gameState.properties[t.index]?.ownerId === bot.id && gameState.properties[t.index]?.level > 0);
      if (withHouses) {
        sellHouseOnProperty(withHouses.index, bot.id);
        continue;
      }
      const anyLand = BOARD_TILES.find(t => gameState.properties[t.index]?.ownerId === bot.id);
      if (anyLand) {
        sellLandToBank(anyLand.index, bot.id);
        continue;
      }
      declareBankruptcy(bot.id, null);
      return;
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

  /* ==================== 9. SYSTEM DAROWIZNY (🎁 PODARUJ PIENIĄDZE, DZIAŁKĘ LUB DOM) ==================== */
  function openGiftModal() {
    const sender = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const others = gameState.players.filter(p => !p.bankrupt && p.id !== sender.id);
    if (!others.length) return;

    document.getElementById('gift-error-msg').textContent = '';
    document.getElementById('gift-cash-amount').value = 0;

    const targetSel = document.getElementById('gift-target-player');
    targetSel.innerHTML = others.map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');

    const myProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === sender.id);
    const propsBox = document.getElementById('gift-props-list');
    propsBox.innerHTML = myProps.length
      ? myProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-gift-prop"/> ${t.name} (Poz. ${gameState.properties[t.index].level})</label>`).join('')
      : '<span style="color:#b0a6d1;font-size:0.76rem;">Nie posiadasz obecnie żadnych działek do oddania.</span>';

    const myBuiltProps = myProps.filter(t => t.type === 'PROPERTY' && gameState.properties[t.index]?.level > 0);
    const houseSel = document.getElementById('gift-house-source');
    houseSel.innerHTML = `<option value="">-- Nie przekazuj pojedynczego domu --</option>` +
      myBuiltProps.map(t => `<option value="${t.index}">Przekaż 1 dom z: ${t.name} (obecnie Poz. ${gameState.properties[t.index].level})</option>`).join('');

    document.getElementById('gift-modal').classList.remove('hidden');
  }

  function executeGiftTransfer() {
    const sender = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const receiver = getPlayerById(document.getElementById('gift-target-player').value);
    const cashVal = Math.max(0, Number(document.getElementById('gift-cash-amount').value) || 0);
    const propIndices = Array.from(document.querySelectorAll('.chk-gift-prop:checked')).map(el => Number(el.value));
    const houseSourceIdx = document.getElementById('gift-house-source').value;

    if (!receiver) return;
    if (cashVal > sender.cash) {
      document.getElementById('gift-error-msg').textContent = 'Nie masz tylu pieniędzy w portfelu!';
      return;
    }
    if (cashVal === 0 && propIndices.length === 0 && !houseSourceIdx) {
      document.getElementById('gift-error-msg').textContent = 'Wybierz kwotę gotówki, działkę lub dom do podarowania.';
      return;
    }

    const summaryParts = [];

    if (cashVal > 0) {
      sender.cash -= cashVal;
      receiver.cash += cashVal;
      summaryParts.push(`$${cashVal} gotówki`);
    }

    propIndices.forEach(idx => {
      const pr = gameState.properties[idx];
      if (pr && pr.ownerId === sender.id) {
        pr.ownerId = receiver.id;
        pr.history.unshift(`${nowTime()} — Podarowane za darmo przez ${sender.name} dla ${receiver.name}`);
        summaryParts.push(`działkę ${BOARD_TILES[idx].shortName}`);
      }
    });

    if (houseSourceIdx !== '') {
      const hIdx = Number(houseSourceIdx);
      const srcProp = gameState.properties[hIdx];
      const srcTile = BOARD_TILES[hIdx];
      if (srcProp && srcProp.ownerId === sender.id && srcProp.level > 0) {
        srcProp.level -= 1;
        // Jeśli obdarowany ma jakąś własną działkę, dobuduj mu na niej darmowy dom; jeśli nie — otrzymuje pełną wartość domu w gotówce
        const receiverProp = BOARD_TILES.find(t => t.type === 'PROPERTY' && gameState.properties[t.index]?.ownerId === receiver.id && gameState.properties[t.index].level < 5);
        if (receiverProp) {
          gameState.properties[receiverProp.index].level += 1;
          summaryParts.push(`1 dom (przeniesiony na ${receiverProp.shortName})`);
        } else {
          receiver.cash += srcTile.buildCost;
          summaryParts.push(`równowartość 1 domu ($${srcTile.buildCost})`);
        }
      }
    }

    addFeedEvent(`🎁 <strong>${sender.name}</strong> podarował graczowi <strong>${receiver.name}</strong>: <strong>${summaryParts.join(', ')}</strong>!`);
    sfx.buy();
    document.getElementById('gift-modal').classList.add('hidden');
    pushStateSync();
  }

  /* ==================== 10. POZOSTAŁE 4 GRY (CHIŃCZYK, WARCABY, SZACHY, 4 W RZĘDZIE) ==================== */
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
      ? `Wyrzucono ${ludo.dice}! Kliknij migający pionek na planszy.`
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
      const plObj = gameState.players[p];
      const avSvg = getAvatarSvg(plObj?.avatar || 'helmet');
      for (let k = 0; k < 4; k++) {
        const step = ludo.pawns[p][k];
        const coords = (step === -1) ? LUDO_BASES[p][k] : (step < 40 ? LUDO_TRACK[(step + p * 10) % 40] : LUDO_HOMES[p][step - 40]);
        if (coords) {
          const pawnEl = document.createElement('div');
          const movable = ludo.rolled && ludo.turn === p && canMoveLudoPawn(p, k, ludo.dice);
          pawnEl.className = `ludo-pawn ${movable ? 'movable-pawn' : ''}`;
          pawnEl.style.background = plObj?.color || LUDO_COLORS[p];
          pawnEl.innerHTML = avSvg;
          pawnEl.onclick = () => moveLudoPawn(p, k);
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

  /* ==================== 11. RENDEROWANIE INTERFEJSU ==================== */
  function renderAll() {
    if (!gameState) return;
    if (gameState.mapId) applyMapTheme(gameState.mapId);

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
    document.querySelectorAll('.board-tile').forEach(el => {
      el.classList.toggle('selected-tile', Number(el.dataset.index) === selectedTileIndex);
    });
  }

  function renderCenterHUD() {
    const active = currentTurnPlayer();
    document.getElementById('hud-round').textContent = `Runda ${gameState.round}`;
    document.getElementById('die-box-1').dataset.val = gameState.lastDice[0];
    document.getElementById('die-box-2').dataset.val = gameState.lastDice[1];

    const canBuildHere = canUpgradeProperty(active.position, active.id);
    const quotaEl = document.getElementById('hud-build-quota');
    if (quotaEl) {
      if (canBuildHere.ok) {
        quotaEl.textContent = '🏠 Stoisz na swoim polu — możesz zbudować dom!';
        quotaEl.className = 'hub-pill quota-ready';
      } else {
        quotaEl.textContent = '🏠 Budowa: Wyląduj ponownie na swoim polu';
        quotaEl.className = 'hub-pill quota-used';
      }
    }

    const debtBanner = document.getElementById('debt-warning-banner');
    if (debtBanner) {
      debtBanner.classList.toggle('hidden', !(active.cash < 0));
    }

    const avatarDot = document.getElementById('playing-now-avatar');
    const labelEl = document.getElementById('playing-now-label');
    if (active) {
      avatarDot.style.background = active.color;
      avatarDot.innerHTML = getAvatarSvg(active.avatar);
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

    const btnBuildQuick = document.getElementById('btn-build-quick');
    btnBuildQuick.classList.toggle('hidden', !canBuildHere.ok);
    if (canBuildHere.ok && tile) {
      btnBuildQuick.textContent = `🏠 Zbuduj Dom na ${tile.shortName} ($${tile.buildCost})`;
    }

    const hasAnythingToSell = BOARD_TILES.some(t => gameState.properties[t.index]?.ownerId === active.id);
    const btnSellEmergency = document.getElementById('btn-sell-emergency');
    btnSellEmergency.classList.toggle('hidden', !(active.cash < 150 && hasAnythingToSell));

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
            <div class="roster-avatar" style="background:${p.color}">${getAvatarSvg(p.avatar)}</div>
            <div>
              <div class="roster-name-title">${p.name}${youTag} ${crown} ${p.isBot ? '🤖' : ''}</div>
              <div class="roster-meta-sub">${BOARD_TILES[p.position].shortName}</div>
            </div>
          </div>
          <div class="roster-money ${p.cash < 0 ? 'negative' : ''}">$${p.cash}</div>
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
    document.getElementById('my-props-header-text').textContent = `🏘️ Twoje Dzielnice (${ownedTiles.length})`;

    let totalWorth = viewer.cash;
    ownedTiles.forEach(t => {
      const pr = gameState.properties[t.index];
      totalWorth += t.price + (pr.level * (t.buildCost || 0));
    });
    document.getElementById('my-networth-badge').textContent = `Majątek: $${totalWorth}`;

    if (ownedTiles.length === 0) {
      listEl.innerHTML = `<div style="font-size:0.76rem;color:#b0a6d1;">Brak kupionych dzielnic. Rzuć kostką na planszy Monopoly!</div>`;
      return;
    }

    listEl.innerHTML = ownedTiles.map(t => {
      const pr = gameState.properties[t.index];
      const grp = GROUPS[t.group];
      const upCheck = canUpgradeProperty(t.index, viewer.id);
      const lvlBadge = pr.mortgaged ? '🔒 Hipoteka' : (t.type === 'PROPERTY' ? `🏠 Poz. ${pr.level}/5` : 'Aktywne');

      const buildBtnHtml = (t.type === 'PROPERTY' && upCheck.ok)
        ? `<button type="button" class="btn-quick-up" data-build-idx="${t.index}" title="${upCheck.reason}">+🏠 $${t.buildCost}</button>`
        : '';

      const sellHouseBtnHtml = (t.type === 'PROPERTY' && pr.level > 0)
        ? `<button type="button" class="btn-quick-sell" data-sell-house-idx="${t.index}" title="Sprzedaj 1 dom za +$${Math.floor(t.buildCost * 0.5)}">-🏠 +$${Math.floor(t.buildCost * 0.5)}</button>`
        : `<button type="button" class="btn-quick-sell" data-sell-land-idx="${t.index}" title="Odsprzedaj działkę do Banku za +$${Math.floor(t.price * 0.75)}">💵 +$${Math.floor(t.price * 0.75)}</button>`;

      return `
        <div class="owned-prop-item" data-open-idx="${t.index}">
          <div class="owned-prop-left">
            <span class="owned-dot" style="background:${grp ? grp.color : '#888'}"></span>
            <span class="owned-name">${t.shortName}</span>
          </div>
          <div class="owned-prop-right">
            <span class="lvl-tag">${lvlBadge}</span>
            ${buildBtnHtml}
            ${sellHouseBtnHtml}
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-open-idx]').forEach(row => {
      row.onclick = (e) => {
        if (e.target.closest('button')) return;
        openPropertyModal(Number(row.dataset.openIdx));
      };
    });
    listEl.querySelectorAll('[data-build-idx]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        buildHouseOnProperty(Number(btn.dataset.buildIdx), viewer.id);
      };
    });
    listEl.querySelectorAll('[data-sell-house-idx]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        sellHouseOnProperty(Number(btn.dataset.sellHouseIdx), viewer.id);
      };
    });
    listEl.querySelectorAll('[data-sell-land-idx]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = Number(btn.dataset.sellLandIdx);
        if (confirm(`Sprzedać działkę ${BOARD_TILES[idx].name} do Banku za +$${Math.floor(BOARD_TILES[idx].price * 0.75)}?`)) {
          sellLandToBank(idx, viewer.id);
        }
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
      content.innerHTML = `<div style="font-size:0.78rem;color:#b0a6d1;">${tile.subtitle || 'Pole specjalne na planszy Rudy Śląskiej.'}</div>`;
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
    const btnBuild = document.getElementById('btn-pm-build');
    const btnSell = document.getElementById('btn-pm-sell');
    const btnSellLand = document.getElementById('btn-pm-sell-land');
    const btnMort = document.getElementById('btn-pm-mortgage');

    upBox.classList.remove('hidden');
    if (tile.type === 'PROPERTY') {
      document.getElementById('pm-build-cost').textContent = `$${tile.buildCost}`;
      const nextDiff = prop.level < 5 ? (tile.rents[prop.level + 1] - tile.rents[prop.level]) : 0;
      document.getElementById('pm-rent-diff').textContent = prop.level < 5 ? `+$${nextDiff}` : 'MAX';

      const check = canUpgradeProperty(tileIndex, viewer.id);
      document.getElementById('pm-status-note').textContent = check.reason;

      btnBuild.classList.remove('hidden');
      btnSell.classList.remove('hidden');
      btnBuild.disabled = !check.ok;
      btnSell.disabled = !(prop.ownerId === viewer.id && prop.level > 0);
      btnBuild.onclick = () => { if (buildHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
      btnSell.onclick = () => { if (sellHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
    } else {
      btnBuild.classList.add('hidden');
      btnSell.classList.add('hidden');
      document.getElementById('pm-status-note').textContent = 'Możesz odsprzedać ten obiekt do Banku lub zastawić hipoteką.';
    }

    btnSellLand.disabled = !(prop.ownerId === viewer.id);
    btnSellLand.textContent = `💵 Sprzedaj Działkę do Banku (+$${Math.floor(tile.price * 0.75)})`;
    btnSellLand.onclick = () => {
      if (sellLandToBank(tileIndex, viewer.id)) {
        document.getElementById('prop-modal').classList.add('hidden');
      }
    };

    btnMort.disabled = !(prop.ownerId === viewer.id && prop.level === 0);
    btnMort.onclick = () => { if (toggleMortgageProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };

    document.getElementById('pm-history-list').innerHTML = prop.history.map(h => `<li>${h}</li>`).join('');
    modal.classList.remove('hidden');
  }

  /* ==================== 12. HANDEL, CZAT I KREATOR LOBBY ==================== */
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
        <span class="player-pawn-inline" style="background:${m.color || '#7c4dff'};width:16px;height:16px;flex-shrink:0;margin-top:3px;"></span>
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
    // Karty wyboru mapy tła w Lobby
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
          if (gameState) {
            gameState.mapId = card.dataset.mapId;
            pushStateSync();
          }
        };
      });
    }

    // Kolory lokalne
    const localPicker = document.getElementById('local-color-picker');
    localPicker.innerHTML = PLAYER_COLORS.map(c => `
      <button type="button" class="color-dot-pick ${c.hex === localPickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}"></button>
    `).join('');
    localPicker.querySelectorAll('.color-dot-pick').forEach(btn => {
      btn.onclick = () => { localPickedColor = btn.dataset.hex; renderLobbySetup(); };
    });

    // Wybór Pionka 3D / Twarzy (Lokalnie)
    const localAvPicker = document.getElementById('local-avatar-picker');
    if (localAvPicker) {
      localAvPicker.innerHTML = PAWN_AVATARS.map(a => `
        <button type="button" class="avatar-pick-btn ${a.id === localPickedAvatar ? 'active' : ''}" data-av="${a.id}" title="${a.name}">${a.svg}</button>
      `).join('');
      localAvPicker.querySelectorAll('.avatar-pick-btn').forEach(btn => {
        btn.onclick = () => { localPickedAvatar = btn.dataset.av; renderLobbySetup(); };
      });
    }

    // Kolory online
    const onlinePicker = document.getElementById('online-color-picker');
    onlinePicker.innerHTML = PLAYER_COLORS.map(c => `
      <button type="button" class="color-dot-pick ${c.hex === onlinePickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}"></button>
    `).join('');
    onlinePicker.querySelectorAll('.color-dot-pick').forEach(btn => {
      btn.onclick = () => { onlinePickedColor = btn.dataset.hex; renderLobbySetup(); };
    });

    // Wybór Pionka 3D / Twarzy (Online)
    const onlineAvPicker = document.getElementById('online-avatar-picker');
    if (onlineAvPicker) {
      onlineAvPicker.innerHTML = PAWN_AVATARS.map(a => `
        <button type="button" class="avatar-pick-btn ${a.id === onlinePickedAvatar ? 'active' : ''}" data-av="${a.id}" title="${a.name}">${a.svg}</button>
      `).join('');
      onlineAvPicker.querySelectorAll('.avatar-pick-btn').forEach(btn => {
        btn.onclick = () => { onlinePickedAvatar = btn.dataset.av; renderLobbySetup(); };
      });
    }

    const oppBox = document.getElementById('local-opponents-list');
    oppBox.innerHTML = lobbyOpponents.map((o, idx) => `
      <div class="opp-row">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="player-pawn-inline" style="background:${o.color};">${getAvatarSvg(o.avatar)}</span>
          <strong>${o.name}</strong>
          <span style="font-size:0.72rem;color:#b0a6d1;">(${o.isBot ? 'Bot AI' : 'Gracz Hot-Seat'})</span>
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
      <div class="btn-ghost" style="border-left:4px solid ${p.color};display:flex;align-items:center;gap:6px;">
        <span class="player-pawn-inline" style="background:${p.color};width:18px;height:18px;">${getAvatarSvg(p.avatar)}</span>
        <span>${p.name} ${p.isBot ? '🤖' : ''} ${p.clientToken === myClientToken ? '(Ty)' : ''}</span>
      </div>
    `).join('');
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
    const newId = 'p' + (roomState.players.length + 1);
    const usedColors = roomState.players.map(p => p.color);
    const finalColor = usedColors.includes(myColor)
      ? (PLAYER_COLORS.find(c => !usedColors.includes(c.hex))?.hex || myColor)
      : myColor;

    roomState.players.push({
      id: newId, clientToken: tokenToUse, name: myName, color: finalColor,
      avatar: myAvatar || 'cool', isBot: false,
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

  /* ==================== 13. PODPIĘCIE WSZYSTKICH EVENTÓW ==================== */
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

    // Przycisk losowania/zmiany mapy (Kaufhaus, Wielki Piec, Szyb Andrzej, Ficinus)
    const cycleOrRandomMap = () => {
      const idx = RUDA_MAPS.findIndex(m => m.id === selectedMapId);
      const nextMap = RUDA_MAPS[(idx + 1) % RUDA_MAPS.length];
      applyMapTheme(nextMap.id);
      if (gameState) {
        gameState.mapId = nextMap.id;
        addFeedEvent(`🗺️ Zmieniono tło mapy na: <strong>${nextMap.fullTitle}</strong>!`);
        pushStateSync();
      }
    };
    document.getElementById('btn-random-map').onclick = cycleOrRandomMap;
    document.getElementById('btn-lobby-rand-map').onclick = cycleOrRandomMap;

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
        setBannerStatus('❌ Nieprawidłowy adres URL Firebase.', '#ff5252');
      }
    };

    document.getElementById('btn-create-room').onclick = () => {
      const typedUrl = document.getElementById('firebase-url-input').value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);

      const hostName = document.getElementById('online-name-input').value.trim() || 'Sztygar';
      const typedCode = document.getElementById('join-code-input').value.trim().toUpperCase();
      const code = typedCode || ('RUDA' + Math.floor(100 + Math.random() * 900));

      const players = [{ id: 'p1', clientToken: myClientToken, name: hostName, color: onlinePickedColor, avatar: onlinePickedAvatar, isBot: false }];
      myOnlinePlayerId = 'p1';
      activePerspectiveId = 'p1';
      gameState = createFreshGameState(players, 2000, code, true, selectedGameMode, selectedMapId);
      subscribeToRoom(code);
      pushStateSync();
      updateLobbyWaitingRoom();

      if (firebaseDb) {
        setBannerStatus(`✅ Pokój ${code} utworzony w chmurze Firebase! Skopiuj Link Zaproszenia dla znajomych.`, '#2ecc71');
      } else {
        setBannerStatus(`⚠️ Pokój ${code} działa lokalnie. Aby grać przez Internet, wklej wyżej URL bazy Firebase!`, '#ffca28');
      }
    };

    document.getElementById('btn-join-room').onclick = () => {
      const typedUrl = document.getElementById('firebase-url-input').value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);

      const code = document.getElementById('join-code-input').value.trim().toUpperCase();
      if (!code) {
        setBannerStatus('⚠️ Wpisz kod pokoju (np. RUDA500)!', '#ffca28');
        return;
      }
      const myName = document.getElementById('online-name-input').value.trim() || ('Górnik_' + Math.floor(10 + Math.random() * 89));

      if (firebaseDb) {
        setBannerStatus(`⏳ Pobieranie pokoju ${code} z Firebase...`, '#00e5ff');
        firebaseDb.ref('rooms/' + code).once('value').then((snap) => {
          const cloudRoom = snap.val();
          if (cloudRoom) {
            gameState = addOrReconnectPlayerToRoom(cloudRoom, myName, onlinePickedColor, onlinePickedAvatar, myClientToken);
            subscribeToRoom(code);
            pushStateSync();
            updateLobbyWaitingRoom();
            setBannerStatus(`✅ Dołączono do pokoju ${code}!`, '#2ecc71');
          } else {
            setBannerStatus(`❌ Pokój "${code}" nie istnieje w tej bazie Firebase.`, '#ff5252');
          }
        });
        return;
      }

      const savedRaw = localStorage.getItem('ruda_room_' + code);
      if (savedRaw) {
        gameState = addOrReconnectPlayerToRoom(JSON.parse(savedRaw), myName, onlinePickedColor, onlinePickedAvatar, myClientToken);
        subscribeToRoom(code);
        pushStateSync();
        updateLobbyWaitingRoom();
        setBannerStatus(`✅ Dołączono do pokoju ${code}!`, '#2ecc71');
      } else {
        setBannerStatus(`❌ Podłącz wyżej URL bazy Firebase lub użyj Linku Zaproszenia od Hosta.`, '#ff5252');
      }
    };

    document.getElementById('btn-room-add-bot').onclick = () => {
      if (!gameState || gameState.players.length >= 6) return;
      const idx = gameState.players.length + 1;
      gameState.players.push({
        id: 'p' + idx, clientToken: '', name: 'Bot Górnik #' + idx,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length].hex,
        avatar: PAWN_AVATARS[idx % PAWN_AVATARS.length].id,
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
      gameState.mapId = selectedMapId;
      document.getElementById('lobby-overlay').classList.add('hidden');
      pushStateSync();
      checkBotForOtherGames();
    };

    document.getElementById('btn-copy-invite-lobby').onclick = () => {
      navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode));
      document.getElementById('btn-copy-invite-lobby').textContent = '✅ Skopiowano!';
      setTimeout(() => { document.getElementById('btn-copy-invite-lobby').textContent = '📋 Kopiuj Link Zaproszenia'; }, 2000);
    };

    document.getElementById('btn-copy-invite-top').onclick = () => {
      navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode));
      document.getElementById('btn-copy-invite-top').textContent = '✅ Skopiowano!';
      setTimeout(() => { document.getElementById('btn-copy-invite-top').textContent = '📋 Zaproszenie'; }, 1800);
    };

    document.getElementById('btn-add-bot').onclick = () => {
      if (lobbyOpponents.length >= 5) return;
      const nextColor = PLAYER_COLORS[(lobbyOpponents.length + 1) % PLAYER_COLORS.length].hex;
      const nextAv = PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id;
      const names = ['Bot KWK Bielszowice', 'Bot Kochłowice', 'Bot Orzegów', 'Bot Czarny Las', 'Bot Godula'];
      lobbyOpponents.push({ name: names[lobbyOpponents.length % names.length], isBot: true, color: nextColor, avatar: nextAv });
      renderLobbySetup();
    };

    document.getElementById('btn-add-human').onclick = () => {
      if (lobbyOpponents.length >= 5) return;
      const nextColor = PLAYER_COLORS[(lobbyOpponents.length + 1) % PLAYER_COLORS.length].hex;
      const nextAv = PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id;
      lobbyOpponents.push({ name: `Gracz ${lobbyOpponents.length + 2}`, isBot: false, color: nextColor, avatar: nextAv });
      renderLobbySetup();
    };

    document.getElementById('btn-start-local-game').onclick = () => {
      const mainName = document.getElementById('local-name-input').value.trim() || 'Sztygar';
      const startCash = Number(document.getElementById('local-cash-select').value) || 2000;
      const allPlayers = [
        { id: 'p1', clientToken: myClientToken, name: mainName, color: localPickedColor, avatar: localPickedAvatar, isBot: false },
        ...lobbyOpponents.map((o, i) => ({ id: 'p' + (i + 2), name: o.name, color: o.color, avatar: o.avatar, isBot: o.isBot }))
      ];
      myOnlinePlayerId = null;
      gameState = createFreshGameState(allPlayers, startCash, 'LOKALNY', false, selectedGameMode, selectedMapId);
      activePerspectiveId = 'p1';
      subscribeToRoom('LOKALNY');
      document.getElementById('lobby-overlay').classList.add('hidden');
      pushStateSync();
      checkBotForOtherGames();
    };

    // Przyciski na stole
    document.getElementById('btn-roll').onclick = handleRollDice;
    document.getElementById('dice-stage').onclick = handleRollDice;
    document.getElementById('btn-buy').onclick = buyCurrentField;
    document.getElementById('btn-end-turn').onclick = endCurrentTurn;
    document.getElementById('btn-ludo-roll').onclick = rollLudoDice;
    document.getElementById('ludo-die').onclick = rollLudoDice;

    document.getElementById('btn-build-quick').onclick = () => {
      const active = currentTurnPlayer();
      if (canUpgradeProperty(active.position, active.id).ok) {
        buildHouseOnProperty(active.position, active.id);
      }
    };

    document.getElementById('btn-sell-emergency').onclick = () => {
      const active = currentTurnPlayer();
      const firstOwned = BOARD_TILES.find(t => gameState.properties[t.index]?.ownerId === active.id);
      if (firstOwned) openPropertyModal(firstOwned.index);
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

    // Darowizny (🎁 Podaruj)
    document.getElementById('btn-open-gift').onclick = openGiftModal;
    document.getElementById('btn-confirm-gift').onclick = executeGiftTransfer;
    document.getElementById('btn-close-gift').onclick = () => document.getElementById('gift-modal').classList.add('hidden');

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
        `<div style="line-height:1.65;font-size:0.86rem;display:flex;flex-direction:column;gap:8px;">
          <p><strong>🏭 1. Monopoly Ruda Śląska:</strong> Pierwsze wejście na wolne pole pozwala kupić działkę. Aby wybudować kolejny dom (lub hotel), <strong>musisz ponownie wylądować swoim pionkiem na tym samym polu</strong> w kolejnym okrążeniu!</p>
          <p><strong>🔨 Sprzedaż domów i działek:</strong> Gdy brakuje Ci pieniędzy, w każdej chwili możesz kliknąć <strong>-🏠</strong> przy swojej dzielnicy (zwrot 50% kosztu domu) lub sprzedać całą działkę do Banku (+75%).</p>
          <p><strong>🎁 Darowizny (Podaruj):</strong> Kliknij przycisk <em>🎁 Podaruj</em> w prawym panelu, aby przekazać znajomemu gotówkę, działkę lub pojedynczy dom.</p>
          <p><strong>🗺️ Mapy Rudy Śląskiej:</strong> Kliknij przycisk mapy na górnym pasku, aby losować tła (Kaufhaus, Wielki Piec Huty Pokój, Szyb Andrzej, Kolonia Ficinus).</p>
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

  /* ==================== 14. START APLIKACJI ==================== */
  window.addEventListener('DOMContentLoaded', () => {
    buildMonopolyBoardDOM();
    applyMapTheme(selectedMapId);
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
      { id: 'p1', clientToken: myClientToken, name: 'Sztygar', color: PLAYER_COLORS[0].hex, avatar: localPickedAvatar, isBot: false },
      ...lobbyOpponents.map((o, i) => ({ id: 'p' + (i + 2), name: o.name, color: o.color, avatar: o.avatar, isBot: o.isBot }))
    ], 2000, 'LOKALNY', false, 'MONOPOLY', selectedMapId);
    renderAll();

    const roomParam = params.get('room');
    if (roomParam && roomParam.toUpperCase() !== 'LOKALNY') {
      document.querySelector('[data-tab="online"]').click();
      document.getElementById('join-code-input').value = roomParam.toUpperCase();
      setBannerStatus(`Wykryto zaproszenie do pokoju ${roomParam.toUpperCase()}! Wpisz swój nick, wybierz pionek i kliknij "Dołącz po Kodzie".`, '#00e5ff');
    }
  });
})();
