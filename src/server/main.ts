import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CLIENT_ORIGIN, SERVER_PORT } from '../common/config';

const app = express();
const port = SERVER_PORT;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
  },
});

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
);

app.use(express.json());

app.post('/api/join', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

io.on('connection', socket => {
  console.log(`Socket with id ${socket.id} has connected.`);
  // TODO: Send actual app state
  socket.send({ kind: 'waitingLobby', players: [] });

  socket.on('disconnect', () => {
    console.log(`Socket with id ${socket.id} has disconnected.`);
  });
});

server.listen(port, () => {
  console.log(`App is listening on port ${port}...`);
});
