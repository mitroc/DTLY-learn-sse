import http from 'node:http';

http
  .createServer((req, res) => {
    if (req.url.toLowerCase() === '/events') {
      res.writeHead(200, 'streaming', {
        'Connection-Type': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      });

      /**
       * Events
       * */
      setInterval(() => {
        res.write('event: heartbeat\n');
        res.write(`data: ${Date()}`);
        res.write('\n\n');
      }, 4000);
    } else {
      res.writeHead(404);
      res.end();
    }
  })
  .listen(5000, () => {
    console.log(`SSE stoi na http://localhost:5000`);
  });
