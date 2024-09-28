import { pipe } from 'effect';
import { obsessions, skills } from './constants';
import { App } from './types';
import { shuffleArray, splitIntoChunks } from './utils';

export type UpdateAppState = (prev: App) => Promise<App>;

// a player joins the lobby
export const playerJoinLobby =
  (nickname: string): UpdateAppState =>
  prev => {
    if (prev.kind !== 'waitingLobby') return Promise.resolve(prev);

    return Promise.resolve({
      ...prev,
      players: [...prev.players, { nickname }],
    });
  };

// once all players are in the lobby, someone clicks submit
export const waitingToPicking = (): UpdateAppState => prev => {
  if (prev.kind !== 'waitingLobby') return Promise.resolve(prev);

  const eachPlayerObsessionOptions = pipe(
    obsessions,
    shuffleArray,
    splitIntoChunks(prev.players.length),
  );
  return Promise.resolve({
    kind: 'pickingPeriod',
    players: prev.players.map(({ nickname }, i) => ({
      nickname,
      skills: { one: null, two: null },
      obsession: null,
      skillOptions: skills,
      obsessionOptions: eachPlayerObsessionOptions[i],
    })),
  });
};
