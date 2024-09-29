import { FC } from 'react';
import { Box, Button, Stack, Typography } from '@mui/joy';

const Lobby: FC = () => {
  return (
    <Stack spacing={5}>
      <Typography level="h1">Lobby</Typography>
      <Button>Start Game</Button>
    </Stack>
  );
};

export default Lobby;
