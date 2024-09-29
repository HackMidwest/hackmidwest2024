import Background from './components/Background';
import Router from './components/Router';
import { StateContextProvider } from './State';

export const App = () => {
  return (
    <StateContextProvider>
      <Background></Background>
      <Router />
    </StateContextProvider>
  );
};
