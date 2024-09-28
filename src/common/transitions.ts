import { pipe } from 'effect';
import { obsessions, skills } from './constants';
import { App, Obsession } from './types';
import { shuffleArray, splitIntoChunks, updateElementInArray } from './utils';

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
      skills: null,
      obsession: null,
      skillOptions: skills,
      obsessionOptions: eachPlayerObsessionOptions[i],
    })),
  });
};

// a player selects their skills and obsession
export const playerSkillObsessionSelect =
  (
    nickname: string,
    skillOne: string,
    skillTwo: string,
    obsession: Obsession,
  ): UpdateAppState =>
  prev => {
    if (prev.kind !== 'pickingPeriod') return Promise.resolve(prev);

    const newPlayers = updateElementInArray(
      prev.players,
      p => ({ ...p, skills: { one: skillOne, two: skillTwo }, obsession }),
      p => p.nickname === nickname,
    );

    return Promise.resolve({ ...prev, players: newPlayers });
  };

// if everyone is done picking, move to bidding
export const maybeFinishPicking = (): UpdateAppState => prev => {
  if (prev.kind !== 'pickingPeriod') return Promise.resolve(prev);
  const everyoneDone = prev.players.every(
    p => p.obsession !== null && p.skills !== null,
  );
  return everyoneDone
    ? Promise.resolve({
        kind: 'bidding',
        history: [],
        players: prev.players.map(p => ({
          nickname: p.nickname,
          willpower: 10,
          skills: p.skills!,
          obsession: p.obsession!,
          bidAmount: null,
        })),
      })
    : Promise.resolve(prev);
};

// a player decides their bid
export const playerBid =
  (nickname: string, bidAmt: number): UpdateAppState =>
  prev => {
    if (prev.kind !== 'bidding') return Promise.resolve(prev);

    return Promise.resolve({
      ...prev,
      players: updateElementInArray(
        prev.players,
        p => ({ ...p, bidAmount: bidAmt }),
        p => p.nickname === 'nickname',
      ),
    });
  };
