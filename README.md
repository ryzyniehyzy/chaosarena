# Ruda Śląska Arena Ultimate

Rozbudowana wersja trzech załączonych plików: HTML, CSS i połączonego silnika JavaScript. Zrealizowane są cztery części specyfikacji z pliku „CZĘŚĆ 1 REWOLUCJA W MONOPOLY”.

## Uruchomienie

Wypakuj cały katalog i otwórz `dist/index.html` w aktualnej przeglądarce. Gra lokalna działa bez konta i bez bazy danych. Zachowaj wszystkie siedem plików z katalogu `dist` razem.

Można też udostępnić katalog `dist` na hostingu statycznym. Na komputerze z Pythonem uruchom lokalnie `python3 -m http.server 8000 --directory dist`, a następnie wejdź na `http://localhost:8000`.

W pokoju wybierz grę, scenariusz, postać i atut. Inne osoby na tym samym urządzeniu mogą dostać własne postacie i atuty z list przy ich nazwach. W minigrach wybór „Portfel” na górnym pasku przełącza lokalnego gracza, np. uczestnika turnieju.

## Co dodano

### 1. Monopoly Ultimate

- Wydarzenia w rundach 5, 10, 15 itd. trwają po dwie pełne rundy. Awaria blokuje czynsz z zabudowanej Halemby i jej rozbudowę. Boom podnosi przemysłowy czynsz o 50%. Premier daje każdemu graczowi jedną dotację $150 przy najbliższym przejściu przez START w czasie wydarzenia.
- Trzy atuty do wyboru: uniknięcie jednego czynszu, skok na wolną działkę w pierwszej rundzie i pierwokup po licytacji. Pierwokup kosztuje $1, czyli cenę wywoławczą zwykłej działki. Zwycięzca aukcji płaci dopiero po decyzji uprawnionych graczy. Przy wielu uprawnieniach obowiązuje kolejność od gracza aktualnej tury.
- Hełm Sztygara: pierwsza budowa lub pierwsza naprawa gratis. Okulary Szefa: podgląd trzymanych kart Wolności i Bursy rywali. Wagonik: jednorazowe przesunięcie lądowania o −2 lub +2 pola po zobaczeniu rzutu, przed rozliczeniem pola.
- Bursa na polu 20 i w panelu Szychta Ultimate. Co trzy rundy pojawia się nowa karta do wspólnej licytacji od $50. Legalna Kaucja zwalnia z Izby. Przekupstwo urzędnika przenosi własną hipotekę na niezabudowaną własną działkę o nie niższej cenie, bez wypłaty różnicy.
- Style Familoków i Modernizmu Huty za $300 po postawieniu hotelu. Prestiż dzielnicy to suma poziomów zabudowy, podwajana przez aktywny styl. Czynsz całej dzielnicy +30%, zaokrąglany w górę. Wymagany komplet bez hipotek i co najmniej jeden hotel.

Decyzje o wagoniku, czynszu i pierwokupie są przy przyciskach rzutu, także na telefonie. Brak decyzji przed upływem zegara oznacza zwykły ruch, zapłatę czynszu lub rezygnację z pierwokupu.

### 2. Nowe gry i tryby

- Rajd DTŚ: tor 2D przez dzielnice Rudy, 3 okrążenia lub 150 sekund, checkpointy, dopalacze węglowe, klopsy jako miny oraz patrole. Strzałki i Spacja; drugi gracz lokalny WASD i F. Przyciski dotykowe na ekranie. Więcej lokalnych kierowców można wybierać z listy; pozostałych prowadzi autopilot. Wygrany dostaje $500 arcadeCash, pozostali $150.
- Silesian Tower Defense: kooperacyjna obrona szybu, 12 miejsc na wieże, działka Huty i spowalniające wieże ciśnień, trzy poziomy rozbudowy, wspólny budżet, 15 fal. Przetrwanie daje każdemu $600 arcadeCash. Boty pomagają budować. Pola można wybierać myszą, dotykiem lub przyciskami 1–12.
- Szynk Kłamców: w talii są po dwie karty Sznaps i Fart. Akcję zagrywa się pojedynczo przed zwykłymi kartami, najwyżej jedną na turę. Sznaps pokazuje kartę gracza po prawej; Fart zmienia figurę według selektora.
- Turniej Maszyn: osobny budżet $1000 na uczestnika, do 20 obrotów lub trzech minut. Ranking po każdym ruchu. Zwycięzca, a przy remisie każdy lider, dostaje $500 arcadeCash. Boty także biorą udział.

Pozostawiono Monopoly, Szynk, kasyno, Quoridor, Chińczyka, warcaby, szachy i 4 w Rzędzie: łącznie dziesięć gier.

### 3. Klimat i dodatki

- Cztery śląskie okrzyki w czacie, dymki nad pionkami i lektor przeglądarki. Dostępność polskiego głosu zależy od urządzenia. Przycisk dźwięku wycisza też lektora.
- Sklep za arcadeCash: Gołąb, Złoty Kilof i Lampka Naftowa, dwie ramki oraz dwa kolory nicku. Skórki mają cieniowanie i stylizację przestrzenną SVG/CSS. Umiejętność pozostaje przypisana do bazowej postaci.
- Portfel i kosmetyki właściciela są zapisywane w profilu przeglądarki. Gra lokalna ma osobny przycisk wznowienia. Wyczyszczenie danych przeglądarki usuwa lokalne zapisy.
- Świt, dzień i neonowa noc według zegara Europe/Warsaw lub ręcznego wyboru; efekty mgły i deszczu. Są to efekty wizualne, bez pobierania prawdziwej prognozy.

### 4. Scenariusze

- Ruda Śląska: dzielnice i oryginalna ekonomia.
- Podziemia Kopalni −500 m: wyrobiska, komory, szyby zjazdowe, zawał chodnika i koszty obudowy stropu.
- Rajza po Śląsku: punkty Rudy, Zabrza, Bytomia, Gliwic i Katowic, w tym Kopalnia Guido, Radiostacja i Spodek.

Scenariusze zmieniają rzeczywiste nazwy pól i grup, zachowując 40 pól i ceny bazowego silnika. Wybiera się je przed rozpoczęciem nowej partii. Wybór zdjęcia tła jest osobnym ustawieniem.

## Gra online

Zachowano konfigurację Firebase z oryginalnej aplikacji. W zakładce Online trzeba podać własną bazę Realtime Database i jej konfigurację, utworzyć pokój, a potem skopiować zaproszenie. Nie dołączono żadnego cudzego adresu bazy ani danych dostępu. CDN Firebase, zdjęcia tła i fonty wymagają internetu; przy braku zdjęć i fontów są lokalne style zastępcze.

Atuty i licytacje Monopoly oraz nowe zakupy i nagrody korzystają z transakcji. Rajd i obronę symuluje gospodarz, a uczestnicy przekazują sterowanie i polecenia budowy przez pokój. Gospodarz musi mieć otwartą grę. Przełączenie na inną grę wstrzymuje symulację rajdu lub obrony; zegar rozpoczętego turnieju 777 płynie dalej.

## Sprawdzenie kodu

Wymagany Node.js, bez instalowania pakietów: `node --test tests/*.test.cjs`.

26 testów obejmuje inicjalizację całej aplikacji, scenariusze, zachowanie stanu Firebase, wydarzenia, trzy atuty, umiejętności, pierwokup, rynek kart, architekturę, ekonomię sklepu i turnieju, jednokrotne nagrody, pełny rajd botów oraz osiągalną wygraną po 15 falach. Dodatkowo sprawdzono składnię JavaScript, lokalne zasoby i identyfikatory interfejsu.

Lokalny podgląd przeglądarkowy nie był dostępny w środowisku przygotowania. Rozgrywka na dwóch urządzeniach z prawdziwą bazą Firebase wymaga osobnego sprawdzenia po jej podłączeniu.

## Pliki

- `dist/index.html`, `dist/style.css`, `dist/app.js`: rozbudowana aplikacja z załączników.
- `dist/ultimate-core.js`: nowe reguły i rozliczenia.
- `dist/arcade-core.js`: symulacje rajdu i obrony.
- `dist/ultimate-ui.js`, `dist/ultimate.css`: interfejs, sklep, klimat, sterowanie i integracja z pokojem.
- `tests/`: testy reguł oraz integracji danych aplikacji.
