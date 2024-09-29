import { FC } from 'react';
import { App } from '../../common/types';
import { Typography } from '@mui/joy';

type Props = {
  pickingState: Extract<App, { kind: 'pickingPeriod' }>;
};
const Picking: FC<Props> = ({ pickingState }) => {
  return <Typography level="h1">Picking</Typography>;
};

export default Picking;
