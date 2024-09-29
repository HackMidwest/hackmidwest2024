import ZoomVideo from '@zoom/videosdk';
import { ZOOM_SESSION_NAME } from '../common/config';

export const client = ZoomVideo.createClient();

client.init('en-US', 'CDN');

export const joinSession = (nickname: string, jwt: string) =>
  client.join(ZOOM_SESSION_NAME, jwt, nickname);
