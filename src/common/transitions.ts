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

// if everyone is done bidding, move to bidding tie
// if no tie, move to control
export const maybeFinishBidding = (): UpdateAppState => prev => {
  if (prev.kind !== 'bidding') return Promise.resolve(prev);

  const everyoneDone = prev.players.every(p => p.bidAmount !== null);

  if (!everyoneDone) return Promise.resolve(prev);

  const highestBidAmt = prev.players.reduce(
    (max, p) => Math.max(max, p.bidAmount!),
    0,
  );

  const highestBids = prev.players.filter(p => p.bidAmount === highestBidAmt);
  const lowerBids = prev.players.filter(p => p.bidAmount !== highestBidAmt);
  const isATie = highestBids.length > 1;

  if (isATie) {
    const newPlayers = [
      ...highestBids.map(p => ({
        ...p,
        bidAmount: p.bidAmount!,
        tieStatus: { kind: 'tie' as const, roll: null },
      })),
      ...lowerBids.map(p => ({
        ...p,
        bidAmount: p.bidAmount!,
        tieStatus: { kind: 'noTie' as const },
      })),
    ];

    return Promise.resolve({
      kind: 'biddingTie',
      history: prev.history,
      players: newPlayers,
    });
  }

  // TODO a bidder was selected
  return Promise.resolve(prev);
};

// a player rolls a die to break the bidding tie
export const playerSubmitTieRoll =
  (nickname: string, roll: number): UpdateAppState =>
  prev => {
    if (prev.kind !== 'biddingTie') return Promise.resolve(prev);

    const newPlayers = updateElementInArray(
      prev.players,
      p => ({
        ...p,
        tieStatus: { kind: 'tie' as const, roll },
      }),
      p => p.nickname === nickname,
    );
    return Promise.resolve({ ...prev, players: newPlayers });
  };

// if everyone is done rolling their tie dice, move to control
export const maybeFinishTieRoll = (): UpdateAppState => prev => {
  if (prev.kind !== 'biddingTie') return Promise.resolve(prev);

  const everyoneDone = prev.players.every(
    p => p.tieStatus.kind === 'noTie' || p.tieStatus.roll !== null,
  );

  if (!everyoneDone) return Promise.resolve(prev);

  const hadTieRoll = prev.players.filter(p => p.tieStatus.kind === 'tie');
  const winner = hadTieRoll.reduce((prev, curr) =>
    (curr.tieStatus as { kind: 'tie'; roll: number }).roll >
    (prev.tieStatus as { kind: 'tie'; roll: number }).roll
      ? curr
      : prev,
  );

  // TODO move to control, a bidder was selected
  return Promise.resolve(prev);
};
