import { FC, useContext, useEffect, useRef, useState } from 'react';
import { client } from '../zoom';
import { StateContext } from '../State';
import { Stream, VideoPlayer, VideoQuality } from '@zoom/videosdk';

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
    <div
      style={{
        width: '400px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* @ts-expect-error */}
      <video-player-container
        ref={containerRef}
        /* @ts-expect-error */
      ></video-player-container>
    </div>
  );
};

export default Player;
