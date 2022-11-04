/**
 * To jest kod FRONTU, czyli serwer www, który hostuje zbudowany
 * kod. Tutaj cały front to tekst 'Server Side Events'
 * */
import http from 'node:http';
import fs from 'node:fs';

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('front.html'));
  })
  .listen(3000, '127.0.0.1', () => {
    console.log(`WWW stoi na http://localhost:3000`);
  });
