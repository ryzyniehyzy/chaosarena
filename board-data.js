/* Dane planszy. Lokalne nazwy, klasyczna ekonomia gry. */
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
