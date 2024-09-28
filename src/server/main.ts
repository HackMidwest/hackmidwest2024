import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const port = 4000;

const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/join', (req, res) => {
  console.log(req);
  res.sendStatus(200);
});

io.on('connection', socket => {
  console.log(`Socket with id ${socket.id} has connected.`);

  socket.on('disconnect', () => {
    console.log(`Socket with id ${socket.id} has disconnected.`);
  });
});

server.listen(port, () => {
  console.log(`App is listening on port ${port}...`);
});
