import { FC, useState } from 'react';
import { Button, Stack, Typography } from '@mui/joy';
import { startGame } from '../../common/api';
import { App } from '../../common/types';

type Props = {
  lobbyState: Extract<App, { kind: 'waitingLobby' }>;
};

const Lobby: FC<Props> = ({ lobbyState }) => {
  const [disabled, setDisabled] = useState(false);
  const onClick = async () => {
    setDisabled(false);
    await startGame();
  };
  return (
    <Stack spacing={5}>
      <Typography level="h1">Lobby</Typography>
      <Button
        disabled={disabled || lobbyState.players.length < 2}
        onClick={onClick}
      >
        Start Game
      </Button>
    </Stack>
  );
};

export default Lobby;
