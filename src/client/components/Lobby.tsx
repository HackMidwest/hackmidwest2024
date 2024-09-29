import { FC, useContext, useState } from 'react';
import { StateContext } from '../State';
import { Box, Card, Stack, Typography } from '@mui/joy';
import { App } from '../../common/types';
import Player from './Player';

type Props = {
  lobbyState: Extract<App, { kind: 'waitingLobby' }>;
};

const Lobby: FC<Props> = ({ lobbyState }) => {
  const appState = useContext(StateContext);
  return (
    <Box>
      <Typography level="h1">Lobby</Typography>
      <Stack justifyContent="space-around" flexDirection="row">
        {lobbyState.players.map(player => (
          <div key={player.nickname}>
            <Player nickname={player.nickname} />
          </div>
        ))}
      </Stack>
    </Box>
  );
};

export default Lobby;
