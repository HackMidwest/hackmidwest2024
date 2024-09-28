import { StateContextProvider } from './State';

export const App = () => {
  return (
    <StateContextProvider>
      <div>hello world</div>
    </StateContextProvider>
  );
};
