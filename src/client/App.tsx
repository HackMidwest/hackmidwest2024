import JoinLobby from './components/JoinLobby';
import { StateContextProvider } from './State';

export const App = () => {
  return (
    <StateContextProvider>
      <JoinLobby />
    </StateContextProvider>
  );
};
