import { FC, FormEventHandler, useContext, useState } from 'react';
import { StateContext } from '../State';
import { Button, Card, Input, Link, Stack, Typography } from '@mui/joy';
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
    <Card sx={{ maxWidth: '600px' }}>
      <Typography level="h1">Everyone is John</Typography>
      <Typography>
        A web-based multiplayer cooperative story-telling game where the rules
        are simple: everyone is John. Enter a nickname to begin!
      </Typography>
      <Link href="https://rtwolf.github.io/Everyone-is-John/">
        Origin and explanation.
      </Link>
      <form onSubmit={onSubmit}>
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <Input
            value={nickname}
            onChange={flow(getTargetValue, setNickname)}
            placeholder="Nickname"
            sx={{ my: 3, flexGrow: 1 }}
          />
          <Button type="submit" disabled={disabled}>
            Enter Game
          </Button>
        </Stack>
      </form>
    </Card>
  );
};

export default JoinLobby;
