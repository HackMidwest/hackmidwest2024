export type App =
  | {
      kind: 'waitingLobby';
      players: { nickname: string }[];
    }
  | {
      kind: 'pickingPeriod';
      players: {
        nickname: string;
        skills: null | { one: string; two: string };
        obsession: Obsession | null;
        skillOptions: string[];
        obsessionOptions: Obsession[];
      }[];
    }
  | {
      kind: 'bidding';
      history: string[];
      players: {
        nickname: string;
        willpower: number;
        skills: { one: string; two: string };
        points: number;
        obsession: Obsession;
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
        points: number;
        obsession: Obsession;
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
        points: number;
        obsession: Obsession;
      };
      otherPlayers: {
        nickname: string;
        willpower: number;
        skills: { one: string; two: string };
        points: number;
        obsession: Obsession;
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
        points: number;
        obsession: Obsession;
        // willpowerAdded: number;
        // rollResult: null | number;
      };
      otherPlayers: {
        nickname: string;
        willpower: number;
        skills: { one: string; two: string };
        points: number;
        obsession: Obsession;
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

export type Obsession = { description: string; rank: number };