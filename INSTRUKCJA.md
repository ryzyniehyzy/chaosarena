# Ruda Arena — poprawiona wersja

## Uruchomienie

1. Rozpakuj całą paczkę. Do folderu strony wgraj **wszystkie pięć plików**: `index.html`, `styles.css`, `app.js`, `board-data.js`, `monopoly-engine.js`.
2. Otwórz stronę. Lokalnie wybierz graczy i kliknij przycisk rozpoczęcia. Zapis partii działa automatycznie w tej przeglądarce; przy kolejnym wejściu wybierz „Wznów zapisaną partię lokalną”.
3. Do gry ze znajomymi na telefonach strona musi być dostępna pod wspólnym adresem HTTP/HTTPS. Każdy otwiera ten sam adres w swojej przeglądarce. Sam plik otwarty z dysku komputera nie jest linkiem dostępnym na innych urządzeniach.
4. Jeśli przeglądarka trzyma stare pliki, odśwież stronę z pominięciem pamięci podręcznej.

Folder `tests` i ten dokument nie są potrzebne do działania strony.

## Twoja baza Firebase

W dostarczonym kodzie `HARDCODED_FIREBASE_URL` było puste. Nie było w nim rzeczywistego adresu Twojego projektu ani reguł dostępu. Dlatego paczka nie zawiera wymyślonej konfiguracji i nie zmienia niczego w Twojej bazie.

1. Otwórz **Pokój → Multiplayer online**.
2. Wklej swój `databaseURL`, np. adres zakończony `firebaseio.com` lub `firebasedatabase.app`, albo poprawny JSON konfiguracji zawierający `databaseURL`. Adres musi wskazywać główną bazę Realtime Database.
3. Kliknij **Połącz Firebase**, poczekaj na stan „Firebase: połączono”, a następnie utwórz pokój. Utworzenie pokoju sprawdza także uprawnienia do odczytu i zapisu.
4. Skopiuj link zaproszenia. Zawiera adres bazy i kod pokoju. Znajomy otwiera go, podaje swój nick i dołącza.
5. Gospodarz uruchamia mecz po dołączeniu przynajmniej dwóch graczy; można też dodać bota.

Opcjonalnie możesz wpisać publiczny `databaseURL` do stałej `HARDCODED_FIREBASE_URL` na początku `app.js`. Adres podany w interfejsie zapamiętuje się w przeglądarce.

Zachowana ścieżka danych: `rooms/{KOD_POKOJU}`. Do tej wersji utwórz nowy pokój — stare pokoje mają inny zestaw zasad. Powrót do rozpoczętej partii jest możliwy z tej samej przeglądarki, która wcześniej dołączyła. Nowi gracze dołączają wyłącznie przed rozpoczęciem.

Aplikacja korzysta z istniejących uprawnień Realtime Database. Nie dodaje logowania Firebase Auth. Jeśli Twoje reguły wymagają zalogowania, trzeba podłączyć metodę logowania używaną w Twoim projekcie. Do weryfikacji tego wariantu potrzebna jest konfiguracja i reguły projektu. Sam wskaźnik połączenia nie oznacza uprawnienia do zapisu.

## Co się zmieniło

- Usunięto przymusowe wykupy, wymiany i darowizny działek. Działkę można kupić od banku albo zdobyć na licytacji; przy bankructwie majątek może przejść do wierzyciela.
- Cztery lotniska dają czynsz $200. Nie oznaczają automatycznej wygranej.
- Budowa wymaga całego koloru. Domy stawia się równomiernie, na dowolnym własnym polu dzielnicy, bez potrzeby stawania na nim pionkiem. Po czterech domach można postawić hotel. Bank ma 32 domy i 12 hoteli.
- START daje $200, kaucja za Izbę kosztuje $50, parking nie wypłaca dodatkowej gotówki. Podatki trafiają do banku.
- Poprawiono dublety, trzeci dublet, trzy próby wyjścia z Izby, karty wolności, hipotekę i naliczanie czynszu.
- Dług wstrzymuje rozgrywkę. Wierzyciel otrzymuje pieniądze dopiero przy rzeczywistej zapłacie. Można sprzedać budynki za połowę ceny lub zastawić działki. Przy niewypłacalności następuje bankructwo z rozliczeniem pozostałego majątku.
- Domyślnie partia ma 30 pełnych rund. Można wybrać 20 rund albo tryb klasyczny do ostatniego wypłacalnego gracza. Po limicie wygrywa największy majątek netto; równy majątek daje wspólną wygraną.
- Licytacje, oferty, czas i rozliczenie są wspólne dla wszystkich urządzeń. Każda akcja Monopoly jest zapisywana atomową transakcją z kontrolą wersji stanu. Powtórzona lub spóźniona akcja jest odrzucana.
- Duży animowany komunikat pokazuje płatnika, odbiorcę, kwotę i przyczynę. Osobno pokazuje wymagany dług. Historię można sprawdzić w „Rozliczeniach”.
- Dodano panel zebranych dzielnic, postęp rund, majątek netto, automatyczny zapis lokalny i wznowienie gry.
- Gry towarzyskie mają osobny portfel. Wygrana w kasynie lub karciance nie dopisuje pieniędzy do Monopoly. Zachowano siedem pozostałych gier z oryginału; pełne reguły szachów i warcabów nie były przedmiotem tej przebudowy.
- Usunięto ukryte manipulowanie szczęściem. Czat wyświetla tekst zamiast interpretować wiadomości jako HTML.

## Telefon

Dolny pasek otwiera planszę, majątek, czat i pokój. Przyciski akcji są większe i znajdują się pod planszą. Podgląd bieżącego pola otwiera jego kartę. Przycisk „Powiększ” umożliwia przybliżenie i przewijanie planszy. Strona obsługuje bezpieczne marginesy ekranu, powiększanie przeglądarki i preferencję ograniczonych animacji.

Licytacja jest widoczna na wszystkich telefonach. W trybie online wybierasz oferty tylko za swojego gracza; przy jednym urządzeniu wybierasz osobę z listy.

## Jawne zasady tej wersji

Nazwy dzielnic są lokalne, a podstawowa ekonomia opiera się na klasycznym Monopoly. Na prośbę użytkownika usunięto handel między graczami. Dodatkowe zasady tempa: 2 minuty na turę, 25 sekund na pierwszą ofertę licytacji i 15 sekund po podbiciu, bankructwo po przekroczeniu czasu na dług. Limit rund i budowanie wyłącznie we własnej turze są zasadami tej adaptacji. Przy braku domów do zamiany hotelu można sprzedać całą zabudowę dzielnicy za połowę kosztu; nie ma osobnej licytacji brakujących budynków.

Majątek netto na końcu limitu: gotówka + ceny własnych działek + koszt budynków, z odjęciem wartości hipotek i bieżącego długu. To jest wycena końcowa, nie kwota możliwa do natychmiastowego uzyskania przy sprzedaży budynków.

## Sprawdzenie

Wykonano **46 testów automatycznych**, wszystkie zakończone powodzeniem. Wśród nich są 48 pełnych symulowanych partii z 2, 3, 4 i 6 botami, testy długu, bankructwa, licytacji, dubletów, budowania, zapisów, portfela kasyna, czatu oraz równoczesnych zapisów z dwóch klientów.

Testy integracyjne korzystają z imitacji transakcji Firebase — nie łączą się z Twoim projektem. W tym środowisku nie działa usługa podglądu przeglądarkowego, dlatego wygląd i obsługa dotyku nie zostały sprawdzone na prawdziwym telefonie. Rzeczywiste połączenie i reguły Twojej bazy również pozostają do sprawdzenia po podaniu konfiguracji.

Do powtórzenia testów wystarczy Node.js (bez instalowania bibliotek):

```sh
node --test tests/*.test.cjs
```

## Pliki

| Plik | Zawartość |
| --- | --- |
| `index.html` | Układ strony, dialogi, mobilne sterowanie |
| `styles.css` | Nowy motyw, układ telefonu, animacje płatności |
| `app.js` | Interfejs ośmiu gier, pokoje, zapis i synchronizacja Firebase |
| `board-data.js` | Dzielnice, ceny, czynsze i karty |
| `monopoly-engine.js` | Zasady, płatności, licytacje, bankructwo i zakończenie partii |
| `tests/*.test.cjs` | Testy silnika i integracji |

Podstawa zasad: [klasyczna instrukcja Hasbro](https://www.hasbro.com/common/instruct/monins.pdf). Zapis współbieżny: [dokumentacja transakcji Firebase Realtime Database](https://firebase.google.com/docs/database/web/read-and-write#save_data_as_transactions).
