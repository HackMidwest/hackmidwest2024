export type App =
  | {
      kind: 'waitingLobby';
      players: { nickname: string }[];
    }
  | {
      kind: 'pickingPeriod';
      players: {
        nickname: string;
        skills: { one: string | null; two: string | null };
        obsession: string | null;
        skillOptions: string[];
        obsessionOptions: string[];
      }[];
    }
  | {
      kind: 'bidding';
      history: string[];
      players: {
        nickname: string;
        willpower: number;
        skills: { one: string; two: string };
        obsession: string;
        bidAmount: null | number;
      }[];
    }
  | {
      kind: 'biddingTie';
      history: string[];
      players: {
        nickname: string;
        willpower: number;
        skills: { one: string; two: string };
        obsession: string;
        bidAmount: number;
        tieStatus: { kind: 'noTie' } | { kind: 'tie'; roll: null | number };
      }[];
    }
  | {
      kind: 'control';
      history: string[];
      controlPlayer: {
        nickname: string;
        willpower: number;
        skills: { one: string; two: string };
        obsession: string;
        instruction: null | string;
      };
      otherPlayers: {
        nickname: string;
        willpower: number;
        skills: { one: string; two: string };
        obsession: string;
      }[];
    }
  | {
      kind: 'skillCheck';
      history: string[];
      advantage: boolean;
      controlPlayer: {
        nickname: string;
        willpower: number;
        skills: { one: string; two: string };
        obsession: string;
        willpowerAdded: number;
        rollResult: null | number;
      };
      otherPlayers: {
        nickname: string;
        willpower: number;
        skills: { one: string; two: string };
        obsession: string;
      }[];
    }
  | {
      kind: 'end';
    };

export type InstructionResult = {
  description: string;
  result:
    | { kind: 'skillCheckWithAdvantage' }
    | { kind: 'skillCheck' }
    | { kind: 'okayNext' }
    | { kind: 'fallAsleep' }
    | { kind: 'obsessionsCompleted'; playerNicknames: string[] };
};
