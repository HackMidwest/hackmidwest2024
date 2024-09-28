import Router from './components/Router';
import { StateContextProvider } from './State';

export const App = () => {
  return (
    <StateContextProvider>
      <Router />
    </StateContextProvider>
  );
};
