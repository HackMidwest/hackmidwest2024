import { FC, useContext } from 'react';
import { StateContext } from '../State';
import { match, P } from 'ts-pattern';
import Lobby from './Lobby';
import { Box, Stack, Typography } from '@mui/joy';
import JoinLobby from './JoinLobby';
import { getPlayers } from '../../common/utils';
import Player from './Player';
import Picking from './Picking';
import BreakTie from './BreakTie';

const Router: FC = () => {
  const appState = useContext(StateContext);

  return (
    <Stack sx={{ height: '100%' }}>
      <Box
        flexGrow={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {match(appState)
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
          .with({ kind: 'waitingLobby', nickname: P.nullish }, () => (
            <JoinLobby />
          ))
          .with({ kind: 'pickingPeriod' }, pickingState => (
            <Picking pickingState={pickingState} />
          ))
          .with({ kind: 'biddingTie' }, () => <BreakTie />)
          .otherwise(appState => (
            <Typography level="body-md">{appState.kind}</Typography>
          ))}
      </Box>
      {appState.nickname !== null && (
        <Stack justifyContent="space-around" flexDirection="row">
          {getPlayers(appState).map(player => (
            <div key={player.nickname}>
              <Player nickname={player.nickname} />
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default Router;
