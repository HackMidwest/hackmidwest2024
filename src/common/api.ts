import { SERVER_ORIGIN } from './config';
import { Obsession } from './types';

const makeUrl = (route: string) => `${SERVER_ORIGIN}${route}`;

const post = (url: string, body: unknown) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

const get = (url: string) => fetch(url, { method: 'GET' });

export type JoinLobbyRequest = {
  nickname: string;
};
export type KitSelectRequest = {
  nickname: string;
  skillOne: string;
  skillTwo: string;
  obsession: Obsession;
};
export type PlayerBidRequest = {
  nickname: string;
  bidAmt: number;
};
export type PlayerTieRollRequest = {
  nickname: string;
  roll: number;
};
export type IssueInstructionRequest = {
  instruction: string;
};
export type AttemptSkillCheckRequest = {
  willpowerAdded: number;
  rollResult: number;
};

export const joinLobby = (body: JoinLobbyRequest) =>
  post(makeUrl('/api/join'), body);

export const startGame = () => post(makeUrl('/api/start'), {});

export const submitTieRoll = (body: PlayerTieRollRequest) =>
  post(makeUrl('/api/playerTieRoll'), body);

export const fetchZoomJwt = () => get(makeUrl('/api/zoom-jwt'));
