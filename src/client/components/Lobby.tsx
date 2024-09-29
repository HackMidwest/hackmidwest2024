import { FC, useContext } from 'react';
import { StateContext } from '../State';
import { Card, Typography } from '@mui/joy';
import { App } from '../../common/types';
import Player from './Player';

type Props = {
  lobbyState: Extract<App, { kind: 'waitingLobby' }>;
};

const Lobby: FC<Props> = ({ lobbyState }) => {
  const appState = useContext(StateContext);
  return (
    <Card>
      <Typography level="h1">Lobby</Typography>
      {lobbyState.players.map(player => (
        <div key={player.nickname}>
          <Typography key={player.nickname}>{player.nickname}</Typography>
          <Player nickname={player.nickname} />
        </div>
      ))}
      {/** TODO will be a map eventually and the as will go away */}
    </Card>
  );
};

export default Lobby;
