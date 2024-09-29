import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CLIENT_ORIGIN, SERVER_PORT } from '../common/config';
import { App } from '../common/types';
import { Mutex } from 'async-mutex';
import {
  maybeFinishBidding,
  maybeFinishPicking,
  maybeFinishTieRoll,
  playerBid,
  playerJoinLobby,
  playerSkillObsessionSelect,
  playerSubmitTieRoll,
  UpdateAppState,
  waitingToPicking,
} from '../common/transitions';
import {
  JoinLobbyRequest,
  KitSelectRequest,
  PlayerBidRequest,
  PlayerTieRollRequest,
} from '../common/api';
import { getJWT } from './zoom';
import { callStableImage } from './awsImageCall';
import { callClaudeConverse } from './awsClaudeConverse';

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

app.post('/api/start', async (_, res) => {
  await setState(waitingToPicking());
  console.log('Starting game.');
  res.sendStatus(200);
});

app.post('/api/selectKit', async (req, res) => {
  const { nickname, skillOne, skillTwo, obsession } =
    req.body as KitSelectRequest;
  await setState(
    playerSkillObsessionSelect(nickname, skillOne, skillTwo, obsession),
  );
  console.log(`kit selected: ${JSON.stringify(req.body)}`);
  await setState(maybeFinishPicking());
  res.sendStatus(200);
});

app.post('/api/playerBid', async (req, res) => {
  const { nickname, bidAmt } = req.body as PlayerBidRequest;
  await setState(playerBid(nickname, bidAmt));
  console.log(`${nickname} bid ${bidAmt}`);
  await setState(maybeFinishBidding());
  res.sendStatus(200);
});

app.post('/api/playerTieRoll', async (req, res) => {
  const { nickname, roll } = req.body as PlayerTieRollRequest;
  await setState(playerSubmitTieRoll(nickname, roll));
  console.log(`${nickname} rolled ${roll}`);
  await setState(maybeFinishTieRoll());
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
