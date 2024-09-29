import { FC, useContext } from 'react';
import { StateContext } from '../State';
import { match, P } from 'ts-pattern';
import Lobby from './Lobby';
import { Typography } from '@mui/joy';
import JoinLobby from './JoinLobby';

const Router: FC = () => {
  const appState = useContext(StateContext);

  return match(appState)
    .with(
      {
        kind: 'waitingLobby',
        nickname: P.when(
          () =>
            appState.kind === 'waitingLobby' &&
            appState.players.filter(
              player => player.nickname === appState.nickname,
            ).length !== 0,
        ),
      },
      appState => <Lobby lobbyState={appState} />,
    )
    .with({ kind: 'waitingLobby', nickname: P.nullish }, () => <JoinLobby />)
    .otherwise(appState => (
      <Typography level="body-md">{appState.kind}</Typography>
    ));
};

export default Router;
