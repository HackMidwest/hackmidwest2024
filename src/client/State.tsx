import {
  createContext,
  FC,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { App } from '../common/types';
import { io } from 'socket.io-client';
import { SERVER_ORIGIN } from '../common/config';

const initial: App = {
  kind: 'waitingLobby',
  players: [],
};

export const StateContext = createContext<App>(initial);

export const StateContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<App>(initial);

  useEffect(() => {
    const socket = io(SERVER_ORIGIN);
    socket.on('message', setState);
  }, []);

  return (
    <StateContext.Provider value={state}>{children}</StateContext.Provider>
  );
};
