import express from 'express';
import { App } from '../common/types';
import { Mutex } from 'async-mutex';
import { SetAppState } from '../common/transitions';

const app = express();
const port = 4000;

let state: App = { kind: 'waitingLobby', players: [] };
const stateMutex = new Mutex();
const setState: SetAppState = async (getNewState: (prev: App) => App) => {
  const release = await stateMutex.acquire();
  state = getNewState(state);
  release();
};

// Define a simple Hello World endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
