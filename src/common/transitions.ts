import { pipe } from 'effect';
import { obsessions, skills } from './constants';
import { App, InstructionResult, Obsession } from './types';
import { shuffleArray, splitIntoChunks, updateElementInArray } from './utils';
import { callClaudeConverse } from '../server/awsClaudeConverse';
import { callStableImage } from '../server/awsImageCall';

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
        imageURL: null,
        history: [],
        players: prev.players.map(p => ({
          nickname: p.nickname,
          willpower: 10,
          skills: p.skills!,
          points: 0,
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
export const maybeFinishBidding = (): UpdateAppState => async prev => {
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
      imageURL: prev.imageURL,
      history: prev.history,
      players: newPlayers,
    });
  }

  // NOTE this is duped with maybeFinishBidding
  const historyWithWinner = [
    ...prev.history,
    `CONTEST: ${highestBids[0].nickname} won the contest, and took control of John.`,
  ];

  // TODO: Prompt Engineering
  const scenario =
    prev.history.length === 0
      ? callClaudeConverse(
          ['No current history, generate a scenario.'],
          'You are the GM of everyone is John.',
        )
      : callClaudeConverse(
          historyWithWinner.slice(-10),
          'You are the GM of everyone is John. You will be given the history of the last ten events in the queue. Describe the events since the last person lost control.',
        );

  const newHistory = [...historyWithWinner, await scenario];

  const generatedImageURL = await callStableImage(
    newHistory.slice(-3).join('\n\n'),
  );
  return Promise.resolve({
    kind: 'control',
    imageURL: generatedImageURL,
    history: newHistory,
    controlPlayer: {
      nickname: highestBids[0].nickname,
      willpower: highestBids[0].willpower - highestBids[0].bidAmount!,
      skills: highestBids[0].skills,
      points: highestBids[0].points,
      obsession: highestBids[0].obsession,
      instruction: null,
    },
    otherPlayers: lowerBids.map(p => ({
      nickname: p.nickname,
      willpower: p.willpower,
      skills: p.skills,
      points: p.points,
      obsession: p.obsession,
    })),
  });
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
export const maybeFinishTieRoll = (): UpdateAppState => async prev => {
  if (prev.kind !== 'biddingTie') return Promise.resolve(prev);

  const everyoneDone = prev.players.every(
    p => p.tieStatus.kind === 'noTie' || p.tieStatus.roll !== null,
  );

  if (!everyoneDone) return Promise.resolve(prev);

  const hadTieRoll = prev.players.filter(p => p.tieStatus.kind === 'tie');
  const highestTieRoll = hadTieRoll.reduce(
    (max, p) =>
      Math.max(max, (p.tieStatus as { kind: 'tie'; roll: number }).roll),
    0,
  );
  const winners = prev.players.filter(
    p => p.tieStatus.kind === 'tie' && p.tieStatus.roll === highestTieRoll,
  );
  const nonWinners = prev.players.filter(
    p => p.tieStatus.kind === 'noTie' || p.tieStatus.roll !== highestTieRoll,
  );

  if (winners.length > 1) {
    const newPlayers = [
      ...winners.map(p => ({
        ...p,
        tieStatus: { kind: 'tie' as const, roll: null },
      })),
      ...nonWinners.map(p => ({
        ...p,
        tieStatus: { kind: 'noTie' as const },
      })),
    ];

    return Promise.resolve({
      ...prev,
      players: newPlayers,
    });
  }

  // NOTE this is duped with maybeFinishBidding
  const historyWithWinner = [
    ...prev.history,
    `CONTEST: ${winners[0].nickname} won the contest, and took control of John.`,
  ];

  // TODO: Prompt Engineering
  const scenario =
    prev.history.length === 0
      ? callClaudeConverse(
          ['No current history, generate a scenario.'],
          'You are the GM of everyone is John.',
        )
      : callClaudeConverse(
          historyWithWinner.slice(-10),
          'You are the GM of everyone is John. You will be given the history of the last ten events in the queue. Describe the events since the last person lost control.',
        );

  const newHistory = [...historyWithWinner, await scenario];

  const generatedImageURL = await callStableImage(
    newHistory.slice(-3).join('\n\n'),
  );

  return Promise.resolve({
    kind: 'control',
    imageURL: generatedImageURL,
    history: newHistory,
    controlPlayer: {
      nickname: winners[0].nickname,
      willpower: winners[0].willpower - winners[0].bidAmount,
      skills: winners[0].skills,
      points: winners[0].points,
      obsession: winners[0].obsession,
      instruction: null,
    },
    otherPlayers: nonWinners.map(p => ({
      nickname: p.nickname,
      willpower: p.willpower,
      skills: p.skills,
      points: p.points,
      obsession: p.obsession,
    })),
  });
};

export const userIssuesControlInstruction =
  (instruction: string): UpdateAppState =>
  async prev => {
    if (prev.kind !== 'control') return Promise.resolve(prev);

    const response = await callClaudeConverse(
      [...prev.history.slice(-10), `INSTRUCTION: ${instruction}`],
      `You are the GM of the game Everyone Is John. Given the current history and the most recent instruction create a logical continuation. Your response must be in the form of the typescript type InstructionResult = {description: string; result: | { kind: 'skillCheckWithAdvantage' } | { kind: 'skillCheck' } | { kind: 'okayNext' } | { kind: 'fallAsleep' } | { kind: 'obsessionsCompleted'; playerNicknames: string[] };};`,
    );

    // based on user data and existing history
    const result = JSON.parse(response) as InstructionResult;
    const generatedImageURL = await callStableImage(
      `${prev.history.join('\n\n')}\n\n${result.description}`,
    );

    if (result.result.kind === 'okayNext') {
      return Promise.resolve({
        ...prev,
        imageURL: generatedImageURL,
        history: [...prev.history, result.description],
      });
    }

    if (result.result.kind === 'fallAsleep') {
      return Promise.resolve({
        kind: 'bidding',
        imageURL: generatedImageURL,
        history: [...prev.history, result.description],
        players: [
          ...prev.otherPlayers.map(p => ({
            nickname: p.nickname,
            willpower: p.willpower + 1,
            skills: p.skills,
            points: p.points,
            obsession: p.obsession,
            bidAmount: null,
          })),
          {
            nickname: prev.controlPlayer.nickname,
            willpower: prev.controlPlayer.willpower + 1,
            skills: prev.controlPlayer.skills,
            points: prev.controlPlayer.points,
            obsession: prev.controlPlayer.obsession,
            bidAmount: null,
          },
        ],
      });
    }

    if (
      result.result.kind === 'skillCheck' ||
      result.result.kind === 'skillCheckWithAdvantage'
    ) {
      return Promise.resolve({
        kind: 'skillCheck',
        imageURL: generatedImageURL,
        history: [...prev.history, result.description],
        advantage: result.result.kind === 'skillCheckWithAdvantage',
        controlPlayer: {
          ...prev.controlPlayer,
          willpowerAdded: 0,
          rollResult: null,
        },
        otherPlayers: [...prev.otherPlayers],
      });
    }

    if (result.result.kind === 'obsessionsCompleted') {
      const playersCompletedObsessions = result.result.playerNicknames;
      const newOtherPlayers = prev.otherPlayers.map(p => ({
        ...p,
        points:
          p.points +
          (playersCompletedObsessions.includes(p.nickname)
            ? p.obsession.rank
            : 0),
      }));

      if (playersCompletedObsessions.includes(prev.controlPlayer.nickname)) {
        return Promise.resolve({
          kind: 'bidding',
          imageURL: generatedImageURL,
          history: [...prev.history, result.description],
          players: [
            ...newOtherPlayers.map(p => ({ ...p, bidAmount: null })),
            {
              ...prev.controlPlayer,
              points:
                prev.controlPlayer.points + prev.controlPlayer.obsession.rank,
              bidAmount: null,
            },
          ],
        });
      }

      return Promise.resolve({
        kind: 'control',
        imageURL: generatedImageURL,
        history: [...prev.history, result.description],
        otherPlayers: newOtherPlayers,
        controlPlayer: { ...prev.controlPlayer, instruction: null },
      });
    }

    throw 'this should never happen';
  };

export const attemptSkillCheck =
  (willpowerAdded: number, rollResult: number): UpdateAppState =>
  prev => {
    if (prev.kind !== 'skillCheck') return Promise.resolve(prev);

    const computedRoll = rollResult + willpowerAdded;
    const isSuccess = prev.advantage ? computedRoll >= 3 : computedRoll >= 6;

    if (isSuccess) {
      const test = userIssuesControlInstruction(
        `${prev.controlPlayer.nickname} succeeds the skill check`,
      );
      return test(prev);
    } else {
      const newHistory = [
        ...prev.history,
        `TODO ${prev.controlPlayer.nickname} failed the skill check`,
      ];
      return Promise.resolve({
        kind: 'bidding',
        imageURL: prev.imageURL,
        history: newHistory,
        players: [
          ...prev.otherPlayers.map(p => ({ ...p, bidAmount: null })),
          { ...prev.controlPlayer, bidAmount: null },
        ],
      });
    }
  };
