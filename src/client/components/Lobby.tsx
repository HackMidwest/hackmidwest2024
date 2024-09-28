import { FC, useContext } from 'react';
import { StateContext } from '../State';
import { Card, Typography } from '@mui/joy';
import { App } from '../../common/types';

type Props = {
  lobbyState: Extract<App, { kind: 'waitingLobby' }>;
};

const Lobby: FC<Props> = ({ lobbyState }) => {
  return (
    <Card>
      <Typography level="h1">Lobby</Typography>
      {lobbyState.players.map(player => (
        <Typography key={player.nickname}>{player.nickname}</Typography>
      ))}
    </Card>
  );
};

export default Lobby;
