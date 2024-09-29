import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CLIENT_ORIGIN, SERVER_PORT } from '../common/config';
import { App } from '../common/types';
import { Mutex } from 'async-mutex';
import { playerJoinLobby, UpdateAppState } from '../common/transitions';
import { JoinLobbyRequest } from '../common/api';
import { getJWT } from './zoom';
import { callStableImage } from './awsImageCall';

const app = express();
const port = SERVER_PORT;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
  },
});

let state: App = { kind: 'waitingLobby', players: [] };
const stateMutex = new Mutex();
const setState = async (getNewState: UpdateAppState) => {
  const release = await stateMutex.acquire();
  state = await getNewState(state);
  io.emit('message', state);
  release();
};

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
);

app.use(express.json());

app.post('/api/join', async (req, res) => {
  const { nickname } = req.body as JoinLobbyRequest;
  await setState(playerJoinLobby(nickname));
  console.log(`Player sent join request with nickname "${nickname}".`);
  res.sendStatus(200);
});

app.get('/api/zoom-jwt', async (_, res) => {
  res.send({ jwt: await getJWT() });
});

io.on('connection', socket => {
  console.log(`Socket with id ${socket.id} has connected.`);
  socket.send(state);

  socket.on('disconnect', () => {
    console.log(`Socket with id ${socket.id} has disconnected.`);
  });
});

server.listen(port, () => {
  console.log(`App is listening on port ${port}...`);
});

callStableImage('little boy on a bridge').then(console.log);
