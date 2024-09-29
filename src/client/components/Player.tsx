import { FC, useContext, useEffect, useRef, useState } from 'react';
import { client } from '../zoom';
import { StateContext } from '../State';
import { Stream, VideoPlayer, VideoQuality } from '@zoom/videosdk';
import { Box, Card, Typography } from '@mui/joy';

type Props = {
  nickname: string;
};

const Player: FC<Props> = ({ nickname }) => {
  const { nickname: appNickname } = useContext(StateContext);
  const streamRef = useRef<typeof Stream | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    client.on('peer-video-state-change', () => {
      setTrigger(n => n + 1);
    });
  }, []);

  useEffect(() => {
    if (appNickname === null) {
      return;
    }

    if (appNickname === nickname && trigger === 0) {
      const stream = client.getMediaStream();
      streamRef.current = stream;
      console.log(client.getAllUser());
      stream.startAudio();
      stream.startVideo().then(() => {
        stream
          .attachVideo(
            client.getCurrentUserInfo().userId,
            VideoQuality.Video_360P,
          )
          .then(userVideo => {
            containerRef.current?.appendChild(userVideo as VideoPlayer);
          });
      });
    } else {
      const participant = client
        .getAllUser()
        .filter(u => u.displayName === nickname)[0];
      if (!participant) return;
      const stream = client.getMediaStream();
      stream
        .attachVideo(participant.userId, VideoQuality.Video_360P)
        .then(userVideo => {
          containerRef.current?.appendChild(userVideo as VideoPlayer);
        });
    }
  }, [appNickname, trigger]);
  return (
    <Box
      my={5}
      width="350px"
      style={
        {
          // filter: 'drop-shadow(5px 5px 8px #DDDDDD)',
        }
      }
    >
      <Box
        style={{
          width: '300px',
          height: '275px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '15px',
        }}
        sx={
          {
            // boxShadow: 'xl',
          }
        }
        mx="auto"
      >
        {/* @ts-expect-error */}
        <video-player-container
          ref={containerRef}
          /* @ts-expect-error */
        ></video-player-container>
      </Box>
      <Card
        sx={{
          marginTop: '-50px',
          width: '350px',
          boxSizing: 'border-box',
          // filter: 'drop-shadow(5px 8px 12px #000000)',
        }}
      >
        <Typography level="h3">{nickname}</Typography>
      </Card>
    </Box>
  );
};

export default Player;
