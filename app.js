/**
 * RUDA ŚLĄSKA ARENA ULTIMATE — KOMPLETNY SILNIK 7 GIER (app.js)
 * 1. Monopoly Ruda Śląska:
 *    - 4 Lotniska (pola 5, 15, 25, 35) -> posiadanie wszystkich 4 daje NATYCHMIASTOWĄ WYGRANĄ!
 *    - Lotniska są chronione przed wrogim wykupem — można je przejąć tylko wtedy, gdy właściciel musi je sprzedać przez dług!
 *    - Wrogie przejęcie (Wykup cudzego pola): po stanięciu na cudzej dzielnicy i opłaceniu czynszu możesz ją odkupić po zawyżonej cenie (200% ceny + 250% wartości domów).
 *    - Budowa domów wymaga pełnego okrążenia od zakupu (`boughtInRound < round`) i centralnego stanięcia pionkiem na własnym polu.
 *    - Duże, wyraźne oznaczenia domów (🏠..🏠🏠🏠🏠) i hoteli (🏨 HOTEL) bezpośrednio na polach.
 *    - Przymusowa sprzedaż przy ujemnym saldzie + gwarantowany ekran Zwycięzcy.
 * 2. Szynk Kłamców (Liar's Bar / Oszust Karciany): prywatne karty, deklarowana figura, dokładanie 1–4 zakrytych kart i przycisk "SPRAWDZAM!".
 * 3. Kwiaciarnia Godula (Kasyno): Koło Ruletki oraz Automat Slotowy 777 połączone z portfelem gracza.
 * 4. Chińczyk: blokada ruszania cudzymi pionkami (każdy rusza wyłącznie swoim kolorem).
 * 5. Warcaby, Szachy Śląskie oraz Sztolnia 4 w Rzędzie + Animacja losowania mapy i Jasny/Ciemny motyw.
 */
(function () {
  'use strict';

  const HARDCODED_FIREBASE_URL = "";

  /* ==================== 1. MAPY RUDY ŚLĄSKIEJ ==================== */
  const RUDA_MAPS = [
    {
      id: 'KAUFHAUS',
      shortTitle: 'Kaufhaus',
      fullTitle: 'Kolonia Kaufhaus (Chebzie) — Zabytkowe Familoki',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ruda_Slaska_Chebzie_Kaufhaus_02.jpg?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #4a2118 0%, #160f29 100%)'
    },
    {
      id: 'HUTA_POKOJ',
      shortTitle: 'Wielki Piec',
      fullTitle: 'Wielki Piec Huty Pokój (Nowy Bytom)',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Huta_Pok%C3%B3j_-_Wielki_Piec.jpg?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #4d3014 0%, #10172b 100%)'
    },
    {
      id: 'SZYB_ANDRZEJ',
      shortTitle: 'Szyb Andrzej',
      fullTitle: 'Zabytkowy Szyb Andrzej (Wirek)',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Szyb_Andrzej_w_Rudzie_%C5%9Al%C4%85skiej.JPG?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #173b34 0%, #140f2b 100%)'
    },
    {
      id: 'FICINUS',
      shortTitle: 'Kolonia Ficinus',
      fullTitle: 'Kolonia Robotnicza Ficinus (Wirek)',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ruda_%C5%9Al%C4%85ska_-_Kolonia_Ficinus_01.jpg?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #3b2447 0%, #0f1c30 100%)'
    },
    {
      id: 'NOWY_BYTOM',
      shortTitle: 'Ratusz N.Bytom',
      fullTitle: 'Plac Jana Pawła II i Magistrat (Nowy Bytom)',
      photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Urza_Miejski_w_Rudzie_Slaskiej.jpg?width=1440',
      fallbackGradient: 'linear-gradient(135deg, #1e3054 0%, #190e26 100%)'
    }
  ];

  /* ==================== 2. CUSTOMOWE PIONKI 3D I TWARZE ==================== */
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

  /* ==================== 4. STAN GLOBALNY I FIREBASE ==================== */
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

  /**
   * ANIMACJA RULETKI LOSOWANIA MAPY PRZY KLIKNIĘCIU "GRAJ" LUB "LOSUJ MAPĘ"
   */
  function playMapRouletteAnimation(onFinished) {
    const overlay = document.getElementById('map-roulette-overlay');
    const card = document.getElementById('roulette-preview-card');
    const nameEl = document.getElementById('roulette-preview-name');
    const titleEl = document.getElementById('roulette-status-title');
    if (!overlay) {
      if (onFinished) onFinished(selectedMapId);
      return;
    }

    overlay.classList.remove('hidden');
    titleEl.textContent = '🎲 Trwa losowanie Areny Rudy Śląskiej...';

    let ticks = 0;
    const maxTicks = 14;
    const finalMap = RUDA_MAPS[Math.floor(Math.random() * RUDA_MAPS.length)];

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
        }, 850);
      }
    }, 115);
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
    // Tasowanie
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
      requiredRank: null, // Ustala pierwszy gracz w nowym rozdaniu
      pile: [],           // Wszystkie zakryte karty na stole
      lastPlay: null,     // { playerId, playerName, count, claimedRank, actualCards }
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
    return { turn: 0, boardJson: JSON.stringify(b), winner: null, lastMove: 'Kliknij swoją figurę, aby zobaczyć ruchy.' };
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

    if (!st.liars || !st.liars.handsJson) st.liars = createLiarsGameState(st.players);
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
  let lastWinnerShown = null;

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
          if (gameState.isOnline && !gameState.lobbyOpen) document.getElementById('lobby-overlay').classList.add('hidden');
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
          if (gameState.isOnline && !gameState.lobbyOpen) document.getElementById('lobby-overlay').classList.add('hidden');
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

  /* ==================== 7. MONOPOLY: 4 LOTNISKA, WROGI WYKUP PÓL I PRZYMUSOWA SPRZEDAŻ ==================== */
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

  /**
   * OBLICZANIE CENY PRZYMUSOWEGO WYKUPU CUDZEGO POLA (HOSTILE TAKEOVER)
   * - Lotnisk (AIRPORT) NIE DA SIĘ odkupić od gracza!
   * - Zwykłe pole można odkupić tylko wtedy, gdy aktualnie stoisz na tym polu po opłaceniu czynszu.
   * - Cena rośnie mocno wraz z liczbą wybudowanych domów: 200% ceny działki + 250% wartości wszystkich domów.
   * - Hotel (Poziom 5) chroni pole przed wrogim wykupem.
   */
  function getBuyoutCost(tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    if (!tile || !prop || tile.type === 'AIRPORT') return null;
    if (tile.type === 'UTILITY') return tile.price * 2;
    return (tile.price * 2) + (prop.level * (tile.buildCost || 100) * 2.5);
  }

  function canBuyoutProperty(tileIndex, buyerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const buyer = getPlayerById(buyerId);
    const active = currentTurnPlayer();

    if (!tile || !prop || !prop.ownerId) return { ok: false, reason: 'Pole jest niczyje.' };
    if (prop.ownerId === buyerId) return { ok: false, reason: 'To już jest Twoje pole.' };
    if (tile.type === 'AIRPORT') {
      return { ok: false, reason: '✈️ Lotnisk NIE MOŻNA odkupić siłą! Lotnisko przejmiesz tylko wtedy, gdy właściciel będzie musiał je sprzedać z braku pieniędzy.' };
    }
    if (!active || active.id !== buyerId || buyer.position !== tileIndex || gameState.turnPhase === 'ROLL') {
      return { ok: false, reason: '🚶 Odkupić cudze pole możesz wyłącznie wtedy, gdy staniesz na nim swoim pionkiem!' };
    }
    if (prop.level >= 5) {
      return { ok: false, reason: '🏨 Na tym polu stoi już Hotel (Poziom 5) — kompleks jest chroniony przed wrogim wykupem!' };
    }
    const cost = getBuyoutCost(tileIndex);
    if (buyer.cash < cost) {
      return { ok: false, reason: `Brakuje Ci $${cost - buyer.cash} do przymusowego wykupu (Koszt wykupu: $${cost}).` };
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
    // Po wrogim wykupie trzeba ponownie zrobić pełne okrążenie, zanim rozbuduje się kolejny dom
    prop.boughtInRound = gameState.round;
    gameState.builtThisTurn = true;
    prop.history.unshift(`${nowTime()} — Przymusowy wykup przez ${buyer.name} od ${oldOwner?.name} za $${check.cost}`);

    addFeedEvent(`💼 <strong>${buyer.name}</strong> wykupił pole <strong>${tile.shortName}</strong> od <strong>${oldOwner?.name}</strong> za zawyżoną kwotę <strong>$${check.cost}</strong>!`);
    sfx.buy();
    pushStateSync();
    return true;
  }

  /**
   * SPRAWDZENIE ZWYCIĘSTWA PRZEZ 4 LOTNISKA LUB BANKRUCTWO WSZYSTKICH RYWALI
   */
  function checkMonopolyVictory() {
    if (!gameState || gameState.status === 'FINISHED') return false;

    // 1. Sprawdź czy ktoś posiada wszystkie 4 Lotniska
    for (const p of gameState.players) {
      if (p.bankrupt) continue;
      const ownedAirports = AIRPORT_INDICES.filter(idx => gameState.properties[idx]?.ownerId === p.id);
      if (ownedAirports.length === 4) {
        gameState.status = 'FINISHED';
        gameState.winnerAnnouncement = {
          winnerName: p.name,
          reason: `✈️ ${p.name} wykupił wszystkie 4 Strategiczne Lotniska Rudy Śląskiej i zdominował transport w mieście!`,
          cash: p.cash
        };
        addFeedEvent(`🏆 <strong>${p.name}</strong> ZDOBYŁ WSZYSTKIE 4 LOTNISKA I WYGRYWA GRĘ!`);
        sfx.win();
        pushStateSync();
        return true;
      }
    }

    // 2. Sprawdź czy został tylko 1 nie-zbankrutowany gracz (gdy w meczu było min. 2 graczy)
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
        addFeedEvent(`👑 <strong>${winner.name}</strong> WYGRYWA MONOPOLY RUDA ŚLĄSKA! Wszyscy rywale zbankrutowali!`);
        sfx.win();
        pushStateSync();
        return true;
      }
    }
    return false;
  }

  /**
   * ZASADA BUDOWY DOMU:
   * - Musisz stać centralnie na swoim polu (`player.position === tileIndex`)
   * - Nie możesz zbudować domu w tym samym okrążeniu, w którym kupiłeś działkę (`prop.boughtInRound < gameState.round`) — musisz przejechać całą mapę!
   * - Limit: 1 dom na turę.
   */
  function canUpgradeProperty(tileIndex, playerId) {
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    const player = getPlayerById(playerId);
    const active = currentTurnPlayer();

    if (!tile || tile.type !== 'PROPERTY') return { ok: false, reason: 'Na tym polu nie buduje się domów.' };
    if (!prop || prop.ownerId !== playerId) return { ok: false, reason: 'Nie jesteś właścicielem tej dzielnicy.' };
    if (!active || active.id !== playerId) return { ok: false, reason: 'Budować możesz tylko w swojej turze.' };
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
    prop.history.unshift(`${nowTime()} — Sprzedane z powrotem na rynek przez ${player.name} (+$${totalRefund})`);

    if (tile.type === 'AIRPORT') {
      addFeedEvent(`✈️ <strong>${player.name}</strong> musiał sprzedać <strong>${tile.shortName}</strong> za <strong>+$${totalRefund}</strong>! Lotnisko jest znów wolne do przejęcia!`);
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
    alertEl.classList.add('hidden');

    addFeedEvent(`<strong>${player.name}</strong> wyrzucił ${gameState.lastDice[0]}+${gameState.lastDice[1]} ➔ <strong>${tile.name}</strong>`);

    if (tile.type === 'PROPERTY' || tile.type === 'AIRPORT' || tile.type === 'UTILITY') {
      if (!prop.ownerId) {
        gameState.turnPhase = 'DECIDE';
        return;
      }
      if (prop.ownerId === player.id) {
        if (tile.type === 'PROPERTY' && prop.boughtInRound < gameState.round && prop.level < 5 && !prop.mortgaged) {
          addFeedEvent(`🏗️ <strong>${player.name}</strong> wrócił na swoje pole <strong>${tile.shortName}</strong> po pełnym okrążeniu! Może teraz dokupić dom.`);
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

        const buyoutCheck = canBuyoutProperty(tileIndex, player.id);
        if (buyoutCheck.ok) {
          addFeedEvent(`💼 <strong>${player.name}</strong> może teraz odkupić <strong>${tile.shortName}</strong> od <strong>${owner.name}</strong> za <strong>$${buyoutCheck.cost}</strong>!`);
        }
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
      alertEl.textContent = card.text;
      alertEl.classList.remove('hidden');
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
    prop.boughtInRound = gameState.round; // Blokuje budowę domu w tym samym okrążeniu!
    gameState.builtThisTurn = true;
    prop.history.unshift(`${nowTime()} — Kupione przez ${player.name} za $${tile.price} (Okrążenie #${gameState.round})`);
    sfx.buy();

    if (tile.type === 'AIRPORT') {
      const ownedAirports = AIRPORT_INDICES.filter(idx => gameState.properties[idx]?.ownerId === player.id).length;
      addFeedEvent(`✈️ <strong>${player.name}</strong> kupił <strong>${tile.name}</strong>! Posiada już <strong>${ownedAirports}/4 Lotnisk</strong>!`);
    } else {
      addFeedEvent(`💰 <strong>${player.name}</strong> kupił <strong>${tile.name}</strong> za <strong>$${tile.price}</strong> (Domy zbudujesz po pełnym okrążeniu!)`);
    }

    gameState.turnPhase = 'END';
    if (checkMonopolyVictory()) return;
    pushStateSync();
    if (player.isBot) setTimeout(botMonopolyTurn, 550);
  }

  function endCurrentTurn() {
    if (!gameState || gameState.status !== 'PLAYING') return;
    const player = currentTurnPlayer();
    if (!player.isBot && !canControlTurn()) return;

    // PRZYMUSOWA SPRZEDAŻ PRZY DŁUGU: Dopóki gracz ma < $0 i posiada jakiekolwiek pola/lotniska/domy, MUSI je sprzedać!
    if (player.cash < 0) {
      const myOwned = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === player.id);
      if (myOwned.length > 0 && !player.isBot) {
        alert(`🚨 Masz dług ($${player.cash})!\n\nZgodnie z zasadami musisz sprzedać swoje domy lub działki (w tym Lotniska!) z listy po prawej stronie, aby wyjść na minimum $0 zanim zakończysz turę!`);
        return;
      }
      // Jeśli sprzedał już wszystko i nadal ma dług -> bankrutuje!
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

    // Jeśli Bot ma ujemne saldo -> przymusowo sprzedaje domy, potem zwykłe działki, a na końcu lotniska!
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
        if (!creditorId) { prop.level = 0; prop.boughtInRound = 0; prop.mortgaged = false; }
      }
    });
    addFeedEvent(`💀 <strong>${player.name}</strong> ogłosił bankructwo i odpada z gry!`);

    if (checkMonopolyVictory()) return;

    if (currentTurnPlayer().id === playerId) endCurrentTurn();
    else pushStateSync();
  }

  /* ==================== 8. TRYB 2: SZYNK KŁAMCÓW (KARCIANKA BLEFU / OSZUST) ==================== */
  let selectedLiarCardIds = [];

  function renderLiarsGame() {
    if (!gameState || !gameState.liars) return;
    const liars = gameState.liars;
    const hands = JSON.parse(liars.handsJson || '{}');
    const activeP = gameState.players[liars.turnIndex % gameState.players.length];
    const viewer = getPlayerById(activePerspectiveId) || activeP;

    document.getElementById('liars-turn-title').textContent = liars.winnerName
      ? `🏆 Wygrywa Szynk Kłamców: ${liars.winnerName}!`
      : `Kolej przy stole: ${activeP?.name || '...'}`;

    const reqBadge = document.getElementById('liars-required-rank');
    const selWrap = document.getElementById('liars-rank-selector-wrap');
    if (liars.requiredRank) {
      reqBadge.textContent = `Wymagana figura w tej kolejce: ${liars.requiredRank}`;
      selWrap.classList.add('hidden');
    } else {
      reqBadge.textContent = `Nowe rozdanie na stole — wybierz deklarowaną figurę!`;
      selWrap.classList.remove('hidden');
    }

    // Przeciwnicy (widać wyłącznie liczbę ich kart!)
    const oppRow = document.getElementById('liars-opponents-row');
    oppRow.innerHTML = gameState.players.map((p, idx) => {
      const cnt = (hands[p.id] || []).length;
      return `
        <div class="liars-opp-card ${idx === liars.turnIndex ? 'active-liar' : ''}">
          <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:4px;">
            <span class="player-pawn-inline" style="background:${p.color};width:20px;height:20px;">${getAvatarSvg(p.avatar)}</span>
            <strong>${p.name}</strong>
          </div>
          <div style="font-size:0.8rem;color:#ffca28;">🂠 Kart w ręce: <strong>${cnt}</strong></div>
        </div>
      `;
    }).join('');

    document.getElementById('liars-pile-count').textContent = `🂠 Zakrytych kart w puli na stole: ${liars.pile.length}`;
    document.getElementById('liars-last-claim').innerHTML = liars.lastPlay
      ? `🗣️ <strong>${liars.lastPlay.playerName}</strong> twierdzi, że położył: <strong>${liars.lastPlay.count}× ${liars.lastPlay.claimedRank}</strong>`
      : `Stół jest pusty. Wyłóż od 1 do 4 zakrytych kart!`;

    const revBanner = document.getElementById('liars-reveal-banner');
    if (liars.lastRevealMsg) {
      revBanner.innerHTML = liars.lastRevealMsg;
      revBanner.classList.remove('hidden');
    } else {
      revBanner.classList.add('hidden');
    }

    const canCallLiar = !!liars.lastPlay && liars.lastPlay.playerId !== activeP.id && !liars.winnerName;
    document.getElementById('btn-liars-call').disabled = !canCallLiar;
    document.getElementById('btn-liars-play').disabled = !!liars.winnerName;

    // Prywatna ręka aktualnego widza
    const myCards = hands[viewer.id] || [];
    document.getElementById('liars-my-hand-label').textContent = `Karty gracza ${viewer.name} (${myCards.length} szt. — widoczne tylko dla Ciebie):`;
    const strip = document.getElementById('liars-my-cards');
    strip.innerHTML = myCards.map(c => {
      const isRed = c.suit === '♥' || c.suit === '♦';
      const isSel = selectedLiarCardIds.includes(c.id);
      return `
        <div class="playing-card ${isRed ? 'red-suit' : ''} ${isSel ? 'selected-card' : ''}" data-cid="${c.id}">
          <span style="align-self:flex-start;font-size:0.85rem;">${c.rank}${c.suit}</span>
          <span style="font-size:1.6rem;">${c.suit}</span>
          <span style="align-self:flex-end;font-size:0.85rem;">${c.rank}</span>
        </div>
      `;
    }).join('');

    strip.querySelectorAll('.playing-card').forEach(el => {
      el.onclick = () => {
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

  function playLiarsCards() {
    const liars = gameState.liars;
    if (!liars || liars.winnerName) return;
    const activeP = gameState.players[liars.turnIndex % gameState.players.length];
    const hands = JSON.parse(liars.handsJson);
    const myHand = hands[activeP.id] || [];

    const chosenCards = myHand.filter(c => selectedLiarCardIds.includes(c.id));
    if (chosenCards.length === 0) {
      alert('Kliknij od 1 do 4 swoich kart na dole ekranu, aby położyć je zakryte na stole!');
      return;
    }

    const claimedRank = liars.requiredRank || document.getElementById('liars-declare-select').value;
    liars.requiredRank = claimedRank;

    // Usuwamy karty z ręki i dodajemy do puli stołu
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

    // Sprawdź czy gracz pozbył się wszystkich kart (wygrywa jeśli nikt go nie sprawdzi, lub od razu gdy stół się zamknie)
    liars.handsJson = JSON.stringify(hands);
    liars.turnIndex = (liars.turnIndex + 1) % gameState.players.length;
    if (!gameState.isOnline && !gameState.players[liars.turnIndex].isBot) {
      activePerspectiveId = gameState.players[liars.turnIndex].id;
    }
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
      // Mówił prawdę -> Sprawdzający zabiera wszystkie karty z puli!
      hands[caller.id].push(...liars.pile);
      liars.lastRevealMsg = `✅ PRAWDA! <strong>${accused.name}</strong> naprawdę położył [${actualStr}]! Sprawdzający <strong>${caller.name}</strong> zabiera całą pulę (${liars.pile.length} kart)!`;
      sfx.rent();
    } else {
      // Kłamał -> Kłamca zabiera całą pulę!
      hands[accused.id].push(...liars.pile);
      liars.lastRevealMsg = `🚨 PRZYŁAPANY NA KŁAMSTWIE! <strong>${accused.name}</strong> deklarował ${liars.lastPlay.claimedRank}, a położył [${actualStr}]! Zabiera całą pulę (${liars.pile.length} kart)!`;
      sfx.buy();
    }

    liars.pile = [];
    liars.lastPlay = null;
    liars.requiredRank = null;

    // Sprawdź czy ktoś ma 0 kart i wygrał
    for (const p of gameState.players) {
      if ((hands[p.id] || []).length === 0) {
        liars.winnerName = p.name;
        sfx.win();
      }
    }

    liars.handsJson = JSON.stringify(hands);
    pushStateSync();
    checkBotForOtherGames();
  }

  /* ==================== 9. TRYB 3: KWIACIARNIA GODULA (KASYNO: RULETKA + AUTOMATY) ==================== */
  let rouletteSpinAngle = 0;
  let isCasinoBusy = false;

  function renderCasinoGame() {
    const viewer = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const header = document.getElementById('casino-player-header');
    if (header && viewer) {
      header.textContent = `Grasz w Kwiaciarni Godula jako: ${viewer.name} (Portfel: $${viewer.cash})`;
    }
  }

  function spinGodulaRoulette(betType) {
    if (isCasinoBusy || !gameState) return;
    const player = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const bet = Math.max(10, Number(document.getElementById('casino-bet-input').value) || 100);
    if (player.cash < bet) {
      document.getElementById('roulette-msg').textContent = '❌ Nie masz wystarczająco gotówki na ten zakład!';
      return;
    }

    isCasinoBusy = true;
    player.cash -= bet;
    sfx.dice();

    const outcomeNum = Math.floor(Math.random() * 37); // 0..36
    const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(outcomeNum);
    const wheel = document.getElementById('godula-roulette-wheel');
    rouletteSpinAngle += 1080 + Math.floor(Math.random() * 360);
    wheel.style.transform = `rotate(${rouletteSpinAngle}deg)`;

    document.getElementById('roulette-msg').textContent = '🎡 Koło w Kwiaciarni Godula kręci się...';

    setTimeout(() => {
      document.getElementById('roulette-result-num').textContent = outcomeNum;
      let mult = 0;
      if (betType === 'ZERO' && outcomeNum === 0) mult = 14;
      if (betType === 'RED' && isRed) mult = 2;
      if (betType === 'BLACK' && outcomeNum !== 0 && !isRed) mult = 2;
      if (betType === 'EVEN' && outcomeNum !== 0 && outcomeNum % 2 === 0) mult = 2;
      if (betType === 'ODD' && outcomeNum % 2 === 1) mult = 2;

      if (mult > 0) {
        const winAmount = bet * mult;
        player.cash += winAmount;
        document.getElementById('roulette-msg').textContent = `🎉 Wypadło ${outcomeNum}! Wygrywasz +$${winAmount}!`;
        addFeedEvent(`🎡 <strong>${player.name}</strong> wygrał <strong>$${winAmount}</strong> na ruletce w Kwiaciarni Godula!`);
        sfx.win();
      } else {
        document.getElementById('roulette-msg').textContent = `💸 Wypadło ${outcomeNum}. Zakład ($${bet}) przepadł.`;
      }
      isCasinoBusy = false;
      pushStateSync();
    }, 2200);
  }

  function spinGodulaSlots() {
    if (isCasinoBusy || !gameState) return;
    const player = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const bet = Math.max(10, Number(document.getElementById('casino-bet-input').value) || 100);
    if (player.cash < bet) {
      document.getElementById('slots-msg').textContent = '❌ Brak środków na zakręcenie automatem!';
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
      r1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      r2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      r3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      sfx.step();
      ticks++;
      if (ticks >= 12) {
        clearInterval(timer);
        const s1 = r1.textContent, s2 = r2.textContent, s3 = r3.textContent;
        let mult = 0;
        if (s1 === s2 && s2 === s3) {
          mult = (s1 === '7️⃣' || s1 === '💎') ? 15 : 8;
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
          mult = 2;
        }

        if (mult > 0) {
          const prize = bet * mult;
          player.cash += prize;
          document.getElementById('slots-msg').textContent = `🎰 TRAFIONE (${s1}${s2}${s3})! Wygrywasz +$${prize}!`;
          addFeedEvent(`🎰 <strong>${player.name}</strong> rozbił automat w Kwiaciarni Godula: <strong>+$${prize}</strong>!`);
          sfx.win();
        } else {
          document.getElementById('slots-msg').textContent = `Spróbuj ponownie (${s1} ${s2} ${s3}).`;
        }
        isCasinoBusy = false;
        pushStateSync();
      }
    }, 90);
  }

  /* ==================== 10. CHIŃCZYK (Z BLOKADĄ CUDZYCH PIONKÓW), WARCABY, SZACHY, 4 W RZĘDZIE ==================== */
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
    // BLOKADA: tylko właściciel aktualnej tury może rzucić kostką!
    if (!curPlayer.isBot && !canControlTurn(ludo.turn % pCount)) return;

    sfx.dice();
    const dieEl = document.getElementById('ludo-die');
    dieEl.classList.add('rolling');

    setTimeout(() => {
      dieEl.classList.remove('rolling');
      const allInBase = ludo.pawns[ludo.turn].every(s => s === -1);
      const d = (allInBase && Math.random() < 0.45) ? 6 : (Math.floor(Math.random() * 6) + 1);
      ludo.dice = d; ludo.rolled = true; dieEl.dataset.val = d;

      const anyMove = [0,1,2,3].some(i => canMoveLudoPawn(ludo.turn, i, d));
      if (!anyMove) {
        setTimeout(() => { ludo.rolled = false; ludo.turn = (ludo.turn + 1) % pCount; pushStateSync(); checkBotForOtherGames(); }, 600);
      } else {
        pushStateSync();
        if (curPlayer.isBot) {
          setTimeout(() => {
            const movableIdx = [0,1,2,3].find(i => canMoveLudoPawn(ludo.turn, i, ludo.dice));
            if (movableIdx !== undefined) moveLudoPawn(ludo.turn, movableIdx, true);
          }, 550);
        }
      }
    }, 360);
  }

  function moveLudoPawn(pIdx, pawnIdx, isBotCall = false) {
    const ludo = gameState.ludo;
    const pCount = Math.min(4, gameState.players.length);
    // BLOKADA: Nie można ruszyć pionkiem innego gracza ani poza swoją turą!
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
          if (oStep >= 0 && oStep < 40 && ((oStep + otherP * 10) % 40) === myGlobalIdx) { ludo.pawns[otherP][k] = -1; sfx.rent(); }
        }
      }
    }
    if (ludo.pawns[pIdx].every(s => s >= 40)) { ludo.winner = pIdx; sfx.win(); }
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

    document.getElementById('ludo-turn-text').textContent = ludo.winner !== null ? `🏆 Wygrywa: ${LUDO_NAMES[ludo.winner]}!` : `Kolej: ${curP?.name || LUDO_NAMES[ludo.turn]}`;
    document.getElementById('ludo-die').dataset.val = ludo.dice;

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
      LUDO_BASES[p].forEach(([r, c]) => { cells[r][c].style.background = LUDO_COLORS[p] + '24'; cells[r][c].style.border = `2px solid ${LUDO_COLORS[p]}`; });
      LUDO_HOMES[p].forEach(([r, c]) => { cells[r][c].style.background = LUDO_COLORS[p] + '38'; cells[r][c].style.border = `2px solid ${LUDO_COLORS[p]}`; });
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
          if (movable) {
            pawnEl.onclick = () => moveLudoPawn(p, k, false);
          }
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
    document.getElementById('checkers-turn-text').textContent = chk.winner !== null ? `🏆 Wygrywa: ${chk.winner === 0 ? p0 : p1}!` : `Ruch: ${chk.turn === 0 ? p0 : p1}`;
    document.getElementById('checkers-score-text').textContent = `Zbicia: ${chk.captured[0]} — ${chk.captured[1]}`;

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
          if (chk.winner !== null || !canControlTurn(chk.turn)) return;
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
    board[fr][fc] = null;
    board[move.r][move.c] = piece;
    if (move.jump) { board[move.jump[0]][move.jump[1]] = null; chk.captured[piece.p] += 1; sfx.rent(); }
    else sfx.step();
    if ((piece.p === 0 && move.r === 0) || (piece.p === 1 && move.r === 7)) piece.king = true;
    if (chk.captured[0] >= 12) chk.winner = 0;
    if (chk.captured[1] >= 12) chk.winner = 1;
    chk.boardJson = JSON.stringify(board);
    chk.turn = 1 - chk.turn;
    pushStateSync();
    checkBotForOtherGames();
  }

  const CHESS_GLYPHS = { 0: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' }, 1: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' } };
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
          if (ch.winner !== null || !canControlTurn(ch.turn)) return;
          if (target) { executeChessMove(selectedChessSq.r, selectedChessSq.c, target.r, target.c); selectedChessSq = null; return; }
          if (piece && piece.p === ch.turn) { selectedChessSq = { r, c }; renderChessGame(); }
        };
        grid.appendChild(sq);
      }
    }
  }

  function executeChessMove(fr, fc, tr, tc) {
    const ch = gameState.chess;
    const board = JSON.parse(ch.boardJson);
    const moving = board[fr][fc], target = board[tr][tc];
    board[fr][fc] = null; board[tr][tc] = moving;
    if (moving.type === 'P' && (tr === 0 || tr === 7)) moving.type = 'Q';
    if (target && target.type === 'K') { ch.winner = moving.p; sfx.win(); } else sfx.step();
    ch.boardJson = JSON.stringify(board);
    ch.turn = 1 - ch.turn;
    pushStateSync();
    checkBotForOtherGames();
  }

  function dropConnect4Disc(col) {
    const c4 = gameState.connect4;
    if (!c4 || c4.winner !== null) return;
    const board = JSON.parse(c4.boardJson);
    let placedRow = -1;
    for (let r = 5; r >= 0; r--) { if (board[r][col] === null) { board[r][col] = c4.turn; placedRow = r; break; } }
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
    if (won) { c4.winner = c4.turn; sfx.win(); } else c4.turn = 1 - c4.turn;
    pushStateSync();
    checkBotForOtherGames();
  }

  function renderConnect4Game() {
    const grid = document.getElementById('c4-grid');
    if (!grid || !gameState.connect4) return;
    const c4 = gameState.connect4;
    const board = JSON.parse(c4.boardJson);
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
        slot.onclick = () => { if (canControlTurn(c4.turn)) dropConnect4Disc(c); };
        grid.appendChild(slot);
      }
    }
  }

  function checkBotForOtherGames() {
    if (!gameState) return;
    const mode = gameState.activeGame;

    if (mode === 'LIARS' && !gameState.liars.winnerName) {
      const liars = gameState.liars;
      const cur = gameState.players[liars.turnIndex % gameState.players.length];
      if (cur && cur.isBot) {
        setTimeout(() => {
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
        }, 750);
      }
    }

    if (mode === 'LUDO') {
      const pCount = Math.min(4, gameState.players.length);
      const cur = gameState.players[gameState.ludo.turn % pCount];
      if (cur && cur.isBot && gameState.ludo.winner === null && !gameState.ludo.rolled) setTimeout(rollLudoDice, 600);
    }

    if (mode === 'CHECKERS' && gameState.checkers.winner === null) {
      const cur = gameState.players[gameState.checkers.turn];
      if (cur && cur.isBot) {
        setTimeout(() => {
          const board = JSON.parse(gameState.checkers.boardJson);
          const all = [];
          for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c]?.p === gameState.checkers.turn) getCheckerMoves(board, r, c).forEach(m => all.push({ fr: r, fc: c, m }));
          if (all.length) { const pick = all.find(x => x.m.jump) || all[Math.floor(Math.random() * all.length)]; executeCheckerMove(pick.fr, pick.fc, pick.m); }
        }, 600);
      }
    }

    if (mode === 'CHESS' && gameState.chess.winner === null) {
      const cur = gameState.players[gameState.chess.turn];
      if (cur && cur.isBot) {
        setTimeout(() => {
          const board = JSON.parse(gameState.chess.boardJson);
          const all = [];
          for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c]?.p === gameState.chess.turn) getValidChessMoves(board, r, c).forEach(m => all.push({ fr: r, fc: c, tr: m.r, tc: m.c }));
          if (all.length) { const pick = all.find(x => board[x.tr][x.tc] !== null) || all[Math.floor(Math.random() * all.length)]; executeChessMove(pick.fr, pick.fc, pick.tr, pick.tc); }
        }, 650);
      }
    }

    if (mode === 'CONNECT4' && gameState.connect4.winner === null) {
      const cur = gameState.players[gameState.connect4.turn];
      if (cur && cur.isBot) {
        setTimeout(() => {
          const board = JSON.parse(gameState.connect4.boardJson);
          const cols = [0,1,2,3,4,5,6].filter(c => board[0][c] === null);
          if (cols.length) dropConnect4Disc(cols[Math.floor(Math.random() * cols.length)]);
        }, 550);
      }
    }
  }

  /* ==================== 11. RENDEROWANIE CAŁOŚCI + WYRAŹNE DOMY NA POLACH ==================== */
  function renderAll() {
    if (!gameState) return;
    if (gameState.mapId) applyMapTheme(gameState.mapId);

    // Wyświetl gwarantowany ekran zwycięzcy, jeśli gra się zakończyła
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
    ['MONOPOLY', 'LIARS', 'CASINO', 'LUDO', 'CHECKERS', 'CHESS', 'CONNECT4'].forEach(g => {
      const st = document.getElementById('stage-' + g);
      if (st) st.classList.toggle('hidden', g !== activeMode);
    });
    document.querySelectorAll('.game-nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.switchGame === activeMode));

    renderMonopolyBoard();
    renderCenterHUD();
    renderLiarsGame();
    renderCasinoGame();
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
          if (cellEl && owner) {
            cellEl.style.borderColor = owner.color;
          }
        } else {
          capEl.classList.add('hidden');
          if (cellEl) cellEl.style.borderColor = '';
        }
      }

      // DUŻA, WYRAŹNA WIZUALIZACJA DOMÓW I HOTELU BEZPOŚREDNIO NA KAFELKU PLANSZY
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
    document.getElementById('hud-round').textContent = `Okrążenie #${gameState.round}`;
    document.getElementById('die-box-1').dataset.val = gameState.lastDice[0];
    document.getElementById('die-box-2').dataset.val = gameState.lastDice[1];

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

    document.getElementById('debt-warning-banner').classList.toggle('hidden', !(active.cash < 0));
    const avatarDot = document.getElementById('playing-now-avatar');
    if (active) {
      avatarDot.style.background = active.color;
      avatarDot.innerHTML = getAvatarSvg(active.avatar);
      document.getElementById('playing-now-label').textContent = `Kolej gracza: ${active.name}`;
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
    if (canBuildHere.ok && tile) btnBuildQuick.textContent = `🏠 Zbuduj Dom na ${tile.shortName} ($${tile.buildCost})`;

    const btnBuyout = document.getElementById('btn-buyout-field');
    btnBuyout.classList.toggle('hidden', !buyoutHere.ok);
    if (buyoutHere.ok && tile) btnBuyout.textContent = `💼 Wykup ${tile.shortName} od właściciela ($${buyoutHere.cost})`;

    const hasAnythingToSell = BOARD_TILES.some(t => gameState.properties[t.index]?.ownerId === active.id);
    document.getElementById('btn-sell-emergency').classList.toggle('hidden', !(active.cash < 150 && hasAnythingToSell));
    document.getElementById('btn-jail-pay').classList.toggle('hidden', !(active.inJail && gameState.turnPhase === 'ROLL' && active.cash >= 100));
    document.getElementById('btn-jail-card').classList.toggle('hidden', !(active.inJail && gameState.turnPhase === 'ROLL' && active.pardonCards > 0));
    document.getElementById('center-feed-log').innerHTML = gameState.feed.map(item => `<div class="feed-line">${item.text}</div>`).join('');
  }

  function renderPlayersRoster() {
    document.getElementById('players-roster').innerHTML = gameState.players.map((p, idx) => {
      const airCnt = AIRPORT_INDICES.filter(i => gameState.properties[i]?.ownerId === p.id).length;
      return `
        <div class="roster-player-row ${idx === gameState.turnIndex ? 'is-active' : ''} ${p.bankrupt ? 'is-bankrupt' : ''}" style="border-left-color:${p.color}">
          <div class="roster-left">
            <div class="roster-avatar" style="background:${p.color}">${getAvatarSvg(p.avatar)}</div>
            <div>
              <div class="roster-name-title">${p.name} ${idx === 0 ? '👑' : ''} ${p.isBot ? '🤖' : ''}</div>
              <div class="roster-meta-sub">${BOARD_TILES[p.position].shortName} ${airCnt > 0 ? `• ✈️×${airCnt}` : ''}</div>
            </div>
          </div>
          <div class="roster-money ${p.cash < 0 ? 'negative' : ''}">$${p.cash}</div>
        </div>
      `;
    }).join('');

    document.getElementById('perspective-select').innerHTML = gameState.players
      .filter(p => !p.bankrupt)
      .map(p => `<option value="${p.id}" ${p.id === activePerspectiveId ? 'selected' : ''}>${p.name} ($${p.cash})</option>`)
      .join('');
  }

  function renderMyProperties() {
    const viewer = getPlayerById(activePerspectiveId) || currentTurnPlayer();
    const listEl = document.getElementById('my-properties-scroll');
    if (!viewer) return;

    const ownedTiles = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === viewer.id);
    document.getElementById('my-props-header-text').textContent = `🏘️ Twoje Pola i Lotniska (${ownedTiles.length})`;
    let totalWorth = viewer.cash;
    ownedTiles.forEach(t => { totalWorth += t.price + (gameState.properties[t.index].level * (t.buildCost || 0)); });
    document.getElementById('my-networth-badge').textContent = `Majątek: $${totalWorth}`;

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
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = Number(btn.dataset.sellLandIdx);
        sellLandToBank(idx, viewer.id);
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
    const viewer = getPlayerById(activePerspectiveId) || currentTurnPlayer();
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
    document.getElementById('pm-buyout-cost').textContent = bCost ? `$${bCost}` : 'Chronione (Lotnisko)';

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

    btnBuild.classList.toggle('hidden', tile.type !== 'PROPERTY');
    btnSell.classList.toggle('hidden', tile.type !== 'PROPERTY');
    btnBuild.disabled = !upCheck.ok;
    btnSell.disabled = !(prop.ownerId === viewer.id && prop.level > 0);
    btnBuild.onclick = () => { if (buildHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
    btnSell.onclick = () => { if (sellHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };

    btnBuyout.classList.toggle('hidden', !buyoutCheck.ok);
    if (buyoutCheck.ok) {
      btnBuyout.textContent = `💼 Wykup to pole od gracza za $${buyoutCheck.cost}!`;
      btnBuyout.onclick = () => {
        if (executeHostileBuyout(tileIndex, viewer.id)) openPropertyModal(tileIndex);
      };
    }

    btnSellLand.disabled = !(prop.ownerId === viewer.id);
    btnSellLand.textContent = `💵 Sprzedaj Pole do Banku (+$${Math.floor(tile.price * 0.75)})`;
    btnSellLand.onclick = () => { if (sellLandToBank(tileIndex, viewer.id)) modal.classList.add('hidden'); };

    btnMort.disabled = !(prop.ownerId === viewer.id && prop.level === 0);
    btnMort.onclick = () => { if (toggleMortgageProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };

    document.getElementById('pm-history-list').innerHTML = prop.history.map(h => `<li>${h}</li>`).join('');
    modal.classList.remove('hidden');
  }

  /* ==================== 12. POZOSTAŁE MODALE, CZAT I INICJALIZACJA ==================== */
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
    document.getElementById('gift-modal').classList.remove('hidden');
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
    document.getElementById('gift-modal').classList.add('hidden');
    checkMonopolyVictory();
    pushStateSync();
  }

  function renderTradesList() {
    const panel = document.getElementById('trades-panel-box');
    const box = document.getElementById('trades-list-box');
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
        gameState.trades = gameState.trades.filter(x => x.id !== tr.id);
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
    localPicker.innerHTML = PLAYER_COLORS.map(c => `<button type="button" class="color-dot-pick ${c.hex === localPickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}"></button>`).join('');
    localPicker.querySelectorAll('.color-dot-pick').forEach(btn => { btn.onclick = () => { localPickedColor = btn.dataset.hex; renderLobbySetup(); }; });

    const localAvPicker = document.getElementById('local-avatar-picker');
    localAvPicker.innerHTML = PAWN_AVATARS.map(a => `<button type="button" class="avatar-pick-btn ${a.id === localPickedAvatar ? 'active' : ''}" data-av="${a.id}" title="${a.name}">${a.svg}</button>`).join('');
    localAvPicker.querySelectorAll('.avatar-pick-btn').forEach(btn => { btn.onclick = () => { localPickedAvatar = btn.dataset.av; renderLobbySetup(); }; });

    const onlinePicker = document.getElementById('online-color-picker');
    onlinePicker.innerHTML = PLAYER_COLORS.map(c => `<button type="button" class="color-dot-pick ${c.hex === onlinePickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}"></button>`).join('');
    onlinePicker.querySelectorAll('.color-dot-pick').forEach(btn => { btn.onclick = () => { onlinePickedColor = btn.dataset.hex; renderLobbySetup(); }; });

    const onlineAvPicker = document.getElementById('online-avatar-picker');
    onlineAvPicker.innerHTML = PAWN_AVATARS.map(a => `<button type="button" class="avatar-pick-btn ${a.id === onlinePickedAvatar ? 'active' : ''}" data-av="${a.id}" title="${a.name}">${a.svg}</button>`).join('');
    onlineAvPicker.querySelectorAll('.avatar-pick-btn').forEach(btn => { btn.onclick = () => { onlinePickedAvatar = btn.dataset.av; renderLobbySetup(); }; });

    const oppBox = document.getElementById('local-opponents-list');
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

  function updateLobbyWaitingRoom() {
    if (!gameState || !currentRoomCode || currentRoomCode === 'LOKALNY') return;
    document.getElementById('room-waiting-box').classList.remove('hidden');
    document.getElementById('lobby-room-code-display').textContent = currentRoomCode;
    document.getElementById('lobby-room-players').innerHTML = gameState.players.map(p => `
      <div class="btn-ghost" style="border-left:4px solid ${p.color};display:flex;align-items:center;gap:6px;">
        <span class="player-pawn-inline" style="background:${p.color};width:18px;height:18px;">${getAvatarSvg(p.avatar)}</span>
        <span>${p.name} ${p.clientToken === myClientToken ? '(Ty)' : ''}</span>
      </div>
    `).join('');
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

  function showGenericModal(title, htmlContent) {
    document.getElementById('generic-modal-title').textContent = title;
    document.getElementById('generic-modal-body').innerHTML = htmlContent;
    document.getElementById('generic-modal').classList.remove('hidden');
  }

  function initEvents() {
    // Przełącznik Jasnego / Ciemnego motywu
    document.getElementById('btn-toggle-theme').onclick = () => {
      document.body.classList.toggle('theme-light');
      document.body.classList.toggle('theme-dark');
    };

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
        if (gameState) {
          gameState.mapId = newMapId;
          pushStateSync();
        }
      });
    };
    document.getElementById('btn-random-map').onclick = triggerMapRoulette;
    document.getElementById('btn-lobby-rand-map').onclick = triggerMapRoulette;

    document.querySelectorAll('.lobby-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.lobby-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.lobby-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      };
    });

    document.getElementById('btn-save-firebase').onclick = () => {
      if (!connectFirebaseDatabase(document.getElementById('firebase-url-input').value)) setBannerStatus('❌ Nieprawidłowy adres URL Firebase.', '#ff5252');
    };

    document.getElementById('btn-create-room').onclick = () => {
      const typedUrl = document.getElementById('firebase-url-input').value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);
      const hostName = document.getElementById('online-name-input').value.trim() || 'Sztygar';
      const code = document.getElementById('join-code-input').value.trim().toUpperCase() || ('RUDA' + Math.floor(100 + Math.random() * 900));
      const players = [{ id: 'p1', clientToken: myClientToken, name: hostName, color: onlinePickedColor, avatar: onlinePickedAvatar, isBot: false }];
      myOnlinePlayerId = 'p1'; activePerspectiveId = 'p1';
      gameState = createFreshGameState(players, 2000, code, true, selectedGameMode, selectedMapId);
      subscribeToRoom(code); pushStateSync(); updateLobbyWaitingRoom();
    };

    document.getElementById('btn-join-room').onclick = () => {
      const typedUrl = document.getElementById('firebase-url-input').value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);
      const code = document.getElementById('join-code-input').value.trim().toUpperCase();
      if (!code) return;
      const myName = document.getElementById('online-name-input').value.trim() || ('Górnik_' + Math.floor(10 + Math.random() * 89));

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
    };

    document.getElementById('btn-room-add-bot').onclick = () => {
      if (!gameState || gameState.players.length >= 6) return;
      const idx = gameState.players.length + 1;
      gameState.players.push({
        id: 'p' + idx, clientToken: '', name: 'Bot Górnik #' + idx,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length].hex, avatar: PAWN_AVATARS[idx % PAWN_AVATARS.length].id,
        isBot: true, cash: 2000, position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
      });
      gameState.liars = createLiarsGameState(gameState.players);
      pushStateSync(); updateLobbyWaitingRoom();
    };

    document.getElementById('btn-launch-room-game').onclick = () => {
      if (!gameState) return;
      if (gameState.players.length < 2) document.getElementById('btn-room-add-bot').click();
      document.getElementById('lobby-overlay').classList.add('hidden');
      playMapRouletteAnimation((pickedMapId) => {
        gameState.lobbyOpen = false;
        gameState.activeGame = selectedGameMode;
        gameState.mapId = pickedMapId;
        pushStateSync();
        checkBotForOtherGames();
      });
    };

    document.getElementById('btn-copy-invite-lobby').onclick = () => navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode));
    document.getElementById('btn-copy-invite-top').onclick = () => navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode));

    document.getElementById('btn-add-bot').onclick = () => {
      if (lobbyOpponents.length >= 5) return;
      lobbyOpponents.push({ name: 'Bot KWK #' + (lobbyOpponents.length + 1), isBot: true, color: PLAYER_COLORS[(lobbyOpponents.length + 1) % PLAYER_COLORS.length].hex, avatar: PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id });
      renderLobbySetup();
    };

    document.getElementById('btn-add-human').onclick = () => {
      if (lobbyOpponents.length >= 5) return;
      lobbyOpponents.push({ name: `Gracz ${lobbyOpponents.length + 2}`, isBot: false, color: PLAYER_COLORS[(lobbyOpponents.length + 1) % PLAYER_COLORS.length].hex, avatar: PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id });
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
      document.getElementById('lobby-overlay').classList.add('hidden');
      playMapRouletteAnimation((pickedMapId) => {
        lastWinnerShown = null;
        gameState = createFreshGameState(allPlayers, startCash, 'LOKALNY', false, selectedGameMode, pickedMapId);
        activePerspectiveId = 'p1';
        subscribeToRoom('LOKALNY');
        pushStateSync();
        checkBotForOtherGames();
      });
    };

    // Przyciski Monopoly
    document.getElementById('btn-roll').onclick = handleRollDice;
    document.getElementById('dice-stage').onclick = handleRollDice;
    document.getElementById('btn-buy').onclick = buyCurrentField;
    document.getElementById('btn-end-turn').onclick = endCurrentTurn;
    document.getElementById('btn-ludo-roll').onclick = rollLudoDice;
    document.getElementById('ludo-die').onclick = rollLudoDice;

    document.getElementById('btn-build-quick').onclick = () => {
      const active = currentTurnPlayer();
      if (canUpgradeProperty(active.position, active.id).ok) buildHouseOnProperty(active.position, active.id);
    };

    document.getElementById('btn-buyout-field').onclick = () => {
      const active = currentTurnPlayer();
      if (canBuyoutProperty(active.position, active.id).ok) executeHostileBuyout(active.position, active.id);
    };

    document.getElementById('btn-sell-emergency').onclick = () => {
      const active = currentTurnPlayer();
      const firstOwned = BOARD_TILES.find(t => gameState.properties[t.index]?.ownerId === active.id);
      if (firstOwned) openPropertyModal(firstOwned.index);
    };

    document.getElementById('btn-jail-pay').onclick = () => {
      const active = currentTurnPlayer();
      if (canControlTurn() && active.inJail && active.cash >= 100) { active.cash -= 100; active.inJail = false; active.jailTurns = 0; pushStateSync(); }
    };

    document.getElementById('btn-jail-card').onclick = () => {
      const active = currentTurnPlayer();
      if (canControlTurn() && active.inJail && active.pardonCards > 0) { active.pardonCards -= 1; active.inJail = false; active.jailTurns = 0; pushStateSync(); }
    };

    // Szynk Kłamców
    document.getElementById('btn-liars-play').onclick = playLiarsCards;
    document.getElementById('btn-liars-call').onclick = callLiarOnLastPlay;
    document.getElementById('btn-liars-new-match').onclick = () => {
      if (!gameState) return;
      gameState.liars = createLiarsGameState(gameState.players);
      selectedLiarCardIds = [];
      pushStateSync();
    };

    // Kwiaciarnia Godula (Kasyno)
    document.querySelectorAll('.casino-quick-bet').forEach(btn => {
      btn.onclick = () => { document.getElementById('casino-bet-input').value = btn.dataset.bet; };
    });
    document.querySelectorAll('[data-rbet]').forEach(btn => {
      btn.onclick = () => spinGodulaRoulette(btn.dataset.rbet);
    });
    document.getElementById('btn-spin-slots').onclick = spinGodulaSlots;

    document.getElementById('btn-reset-board').onclick = () => {
      if (!gameState) return;
      if (gameState.activeGame === 'LIARS') gameState.liars = createLiarsGameState(gameState.players);
      if (gameState.activeGame === 'LUDO') gameState.ludo = createLudoState();
      if (gameState.activeGame === 'CHECKERS') gameState.checkers = createCheckersState();
      if (gameState.activeGame === 'CHESS') gameState.chess = createChessState();
      if (gameState.activeGame === 'CONNECT4') gameState.connect4 = createConnect4State();
      pushStateSync();
    };

    document.getElementById('perspective-select').onchange = (e) => { activePerspectiveId = e.target.value; renderAll(); };
    document.getElementById('btn-bankrupt').onclick = () => {
      const viewer = getPlayerById(activePerspectiveId) || currentTurnPlayer();
      if (confirm(`Ogłosić bankructwo dla ${viewer.name}?`)) declareBankruptcy(viewer.id, null);
    };

    document.getElementById('btn-open-gift').onclick = openGiftModal;
    document.getElementById('btn-confirm-gift').onclick = executeGiftTransfer;
    document.getElementById('btn-close-gift').onclick = () => document.getElementById('gift-modal').classList.add('hidden');

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
          auctionState.highBid += inc; auctionState.leaderId = bidder.id;
          document.getElementById('auc-current-bid').textContent = `$${auctionState.highBid}`;
          document.getElementById('auc-leader-name').textContent = `Prowadzi: ${bidder.name}`;
        }
      };
    });

    document.getElementById('btn-auc-finalize').onclick = () => {
      if (auctionState && auctionState.leaderId) {
        const winner = getPlayerById(auctionState.leaderId);
        winner.cash -= auctionState.highBid;
        gameState.properties[auctionState.tileIndex].ownerId = winner.id;
        gameState.properties[auctionState.tileIndex].boughtInRound = gameState.round;
      }
      document.getElementById('auction-modal').classList.add('hidden');
      gameState.turnPhase = 'END';
      checkMonopolyVictory();
      pushStateSync();
    };

    document.getElementById('btn-auc-cancel').onclick = () => { document.getElementById('auction-modal').classList.add('hidden'); gameState.turnPhase = 'END'; pushStateSync(); };

    document.getElementById('btn-new-trade').onclick = () => {
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
      sendChatMessage(inp.value); inp.value = '';
    };
    document.querySelectorAll('.emoji-chip').forEach(btn => { btn.onclick = () => sendChatMessage(btn.dataset.emoji); });

    document.getElementById('btn-open-lobby').onclick = () => document.getElementById('lobby-overlay').classList.remove('hidden');
    document.getElementById('btn-close-lobby').onclick = () => document.getElementById('lobby-overlay').classList.add('hidden');
    document.getElementById('btn-toggle-sound').onclick = (e) => { sfx.enabled = !sfx.enabled; e.currentTarget.textContent = sfx.enabled ? '🔊' : '🔇'; };
    document.getElementById('btn-open-rules').onclick = () => {
      showGenericModal(
        '⚒️ Zasady 7 Gier — Ruda Śląska Arena Ultimate',
        `<div style="line-height:1.6;font-size:0.86rem;display:flex;flex-direction:column;gap:8px;">
          <p><strong>✈️ 1. 4 Lotniska = Wygrana:</strong> Na planszy są 4 Lotniska. Zgromadzenie wszystkich 4 daje natychmiastowe zwycięstwo! Lotnisk nie da się od nikogo odkupić siłą — można je przejąć tylko wtedy, gdy właściciel musi je sprzedać przez brak gotówki.</p>
          <p><strong>💼 2. Odkup cudzych pól:</strong> Gdy staniesz na zwykłej dzielnicy innego gracza, płacisz mu czynsz, a następnie możesz przymusowo odkupić od niego to pole po zawyżonej cenie (im więcej stoi tam domów, tym drożej!).</p>
          <p><strong>🏠 3. Budowa domów:</strong> Po zakupie pustej działki musisz przejechać całą mapę i ponownie stanąć na tym polu w kolejnym okrążeniu, aby wybudować dom.</p>
          <p><strong>🃏 4. Szynk Kłamców:</strong> Wykładaj zakryte karty zgodnie z deklarowaną figurą albo kliknij "SPRAWDZAM!", jeśli podejrzewasz blef!</p>
          <p><strong>🌸 5. Kwiaciarnia Godula:</strong> Kręć kołem ruletki oraz automatem 777 za gotówkę z portfela.</p>
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
      document.querySelector('[data-tab="online"]').click();
      document.getElementById('join-code-input').value = roomParam.toUpperCase();
    }
  });
})();
