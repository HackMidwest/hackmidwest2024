import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  useState,
} from 'react';
import { App } from '../common/types';

const initial: App = {
  kind: 'waitingLobby',
  players: [],
};

const StateContext = createContext<{
  state: App;
  setState: Dispatch<React.SetStateAction<App>>;
}>({
  state: initial,
  setState: () => {},
});

export const StateContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<App>(initial);

  return (
    <StateContext.Provider value={{ state, setState }}>
      {children}
    </StateContext.Provider>
  );
};
