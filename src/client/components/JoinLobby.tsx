import { FC, FormEventHandler, useContext, useState } from 'react';
import { StateContext } from '../State';
import { Button, Card, Input, Typography } from '@mui/joy';
import { getTargetValue } from '../../common/utils';
import { flow } from 'effect';
import { joinLobby } from '../../common/api';
import { joinSession } from '../zoom';

const JoinLobby: FC = () => {
  const { setNickname: setAppNickname, zoomJwt } = useContext(StateContext);
  const [disabled, setDisabled] = useState(false);
  const [nickname, setNickname] = useState('');

  const onSubmit: FormEventHandler = async e => {
    e.preventDefault();
    setDisabled(true);
    await joinLobby({ nickname });
    // zoom jwt could be null if it's not fetched yet, but don't really want to handle
    await joinSession(nickname, zoomJwt ?? '');
    setAppNickname(nickname);
  };

  return (
    <Card>
      <Typography level="h1">Join Lobby</Typography>
      <form onSubmit={onSubmit}>
        <Input
          value={nickname}
          onChange={flow(getTargetValue, setNickname)}
          placeholder="Nickname"
        />
        <Button type="submit" disabled={disabled}>
          Join
        </Button>
      </form>
    </Card>
  );
};

export default JoinLobby;
