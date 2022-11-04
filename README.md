# Server Sent Events (SSE)

## Jak działają SSE
![zasada działania](/assets/sse.png)

* SSE są jednokierunkowe - wiadomości są dostarczane wyłącznie **od serwera do 
  klienta**.
* Aplikacja frontowa inicjuje połączenie -> dostaje status `200` i zaczyna 
  nasłuchiwać na zdarzenia -> backend wysyła zdarzenia w ramach 
  ustanowionego połączenia -> aplikacja frontowa kończy (jeżeli trzeba) 
  połączenie.
* Wszyscy zasubskrybowani klienci (w ramach ich kanału) dostają ten sam 
  event, w tym samym czasie.
* W niektórych systemach (np. Heroku) należy sztucznie utrzymywać kanał przy 
  życiu, poprzez wysyłanie okresowych porcji danych często nazywanych 
  _heartbeat_ czy _keep-alive_

## Implementacja

### Front
* zainicjowanie połączenia poprzez stworzenie obiektu `EventSource` za 
  pomocą konstruktora interfejsu `EventSource`
```javascript
const eventSource = new EventSource('<adres servera sse>');
```
* zajerestrowanie obserwatora zdarzeń (`event listener`)
```javascript
// onmessage lub 'message' to specjalny przypadek, gdy zdarzenia nie mają 
// ustawionego pola `event` lub gdy mają pole `event: message`
eventSource.onmessage = (event) => {
  console.log(event.data);
}

// lub - zdarzenie określone jako `event: cokolwiek`
eventSource.addEventListener('cokolwiek', (event) => {
  console.log(event.data);
})
```

### Backend (naiwny js)
* w odpowiedzi na zainicjowanie żądania ze strony frontu, backend odpowiada 
  statusem `200` i ustawia odpowiednie nagłówki
```javascript
res.writeHead(200, 'streaming', {
  /**
   * The Connection general header controls whether the network
   * connection stays open after the current transaction finishes. If
   * the value sent is keep-alive, the connection is persistent and not
   * closed, allowing for subsequent requests to the same server to be done.
   * */
  'Connection-Type': 'keep-alive',

  /**
   * In responses, a Content-Type header provides the client with the
   * actual content type of the returned content.
   * In practice, 'text/event-stream' informs the client that this
   * connection uses the Server-Sent Events protocol.
   * The event stream is a simple stream of text data which must be
   * encoded using UTF-8. Messages in the event stream are separated by
   * a pair of newline characters. A colon as the first character of a
   * line is in essence a comment, and is ignored.
   * */
  'Content-Type': 'text/event-stream',
  
  /**
   * The no-store response directive indicates that any caches of any
   * kind (private or shared) should not store this response.
   * */
  'Cache-Control': 'no-store',
});
```
* a następnie wysyła odpowiednie zdarzenia (`event` typu `cokolwiek` będzie 
  przechwycony przez front, a dane odczytane z pola `data`)
```javascript
res.write('event: cokolwiek\n');
res.write(`data: 4444`);
res.write('\n\n');
```
---

### Implementacja frontu w aplikacji produkcyjnej z RTKQ


### Problemy w rzeczywistej aplikacji
- jeżeli chcemy ukryć adres serwera sse, musimy użyć proxy, podobnie jak to 
  robimy przy _normalnych_ żądaniach
- występują problemy z kompresją danych, np. biblioteka _compression_, 
  której używamy w node, kompletnie blokowała połączenie, więc musieliśmy ją 
  wyłączyć dla endpointu dedykowanego sse,
- Heroku wymaga utrzymania _heartbeat_, inaczej po 55 sekundach rozpina 
  połączenie
- występują na backendzie jeszcze nie zdiagnozowane błędy _broken pipe_, 
  które są prawdopodobnie _false positivami_, ale robią nam syf w elasticu
- 
