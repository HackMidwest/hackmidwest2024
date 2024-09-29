import { SERVER_ORIGIN } from './config';

const makeUrl = (route: string) => `${SERVER_ORIGIN}${route}`;

const post = (url: string, body: unknown) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

export type JoinLobbyRequest = {
  nickname: string;
};

export const joinLobby = (body: JoinLobbyRequest) =>
  post(makeUrl('/api/join'), body);
