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
import { fetchZoomJwt } from '../common/api';
import ZoomVideo from '@zoom/videosdk';

type AppState = App & {
  nickname: string | null;
  setNickname: Dispatch<SetStateAction<string | null>>;
  zoomJwt: string | null;
};

const initial: AppState = {
  kind: 'waitingLobby',
  players: [],
  nickname: null,
  setNickname: () => {},
  zoomJwt: null,
};

export const StateContext = createContext<AppState>(initial);

export const StateContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [gameState, setGameState] = useState<App>(initial);
  const [nickname, setNickname] = useState<string | null>(initial.nickname);
  const [zoomJwt, setZoomJwt] = useState<string | null>(initial.zoomJwt);

  useEffect(() => {
    io(SERVER_ORIGIN).on('message', setGameState);
    fetchZoomJwt().then(res => res.json().then(body => setZoomJwt(body.jwt)));
  }, []);

  return (
    <StateContext.Provider
      value={{ ...gameState, nickname, setNickname, zoomJwt }}
    >
      {children}
    </StateContext.Provider>
  );
};
