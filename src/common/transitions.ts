import { pipe } from 'effect';
import { obsessions, skills } from './constants';
import { App } from './types';
import { shuffleArray, splitIntoChunks } from './utils';

export type SetAppState = (getNewState: (prev: App) => App) => Promise<void>;

// a player joins the lobby
export const playerJoinLobby = (nickname: string) => (setApp: SetAppState) =>
  setApp(prev => {
    if (prev.kind !== 'waitingLobby') return prev;

    return { ...prev, players: [...prev.players, { nickname }] };
  });

// once all players are in the lobby, someone clicks submit
export const waitingToPicking = (setApp: SetAppState) =>
  setApp(prev => {
    if (prev.kind !== 'waitingLobby') return prev;

    const eachPlayerObsessionOptions = pipe(
      obsessions,
      shuffleArray,
      splitIntoChunks(prev.players.length),
    );
    return {
      kind: 'pickingPeriod',
      players: prev.players.map(({ nickname }, i) => ({
        nickname,
        skills: { one: null, two: null },
        obsession: null,
        skillOptions: skills,
        obsessionOptions: eachPlayerObsessionOptions[i],
      })),
    };
  });
