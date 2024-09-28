import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { App } from '../common/types';
import { io } from 'socket.io-client';
import { SERVER_ORIGIN } from '../common/config';

type AppState = App & {
  nickname: string | null;
  setNickname: Dispatch<SetStateAction<string | null>>;
};

const initial: AppState = {
  kind: 'waitingLobby',
  players: [],
  nickname: null,
  setNickname: () => {},
};

export const StateContext = createContext<AppState>(initial);

export const StateContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [gameState, setGameState] = useState<App>(initial);
  const [nickname, setNickname] = useState<string | null>(initial.nickname);

  useEffect(() => {
    io(SERVER_ORIGIN).on('message', setGameState);
  }, []);

  return (
    <StateContext.Provider value={{ ...gameState, nickname, setNickname }}>
      {children}
    </StateContext.Provider>
  );
};
