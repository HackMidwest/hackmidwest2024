import express from 'express';
import { App } from '../common/types';
import { Mutex } from 'async-mutex';
import { UpdateAppState } from '../common/transitions';

const app = express();
const port = 4000;

let state: App = { kind: 'waitingLobby', players: [] };
const stateMutex = new Mutex();
const setState = async (getNewState: UpdateAppState) => {
  const release = await stateMutex.acquire();
  state = await getNewState(state);
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
