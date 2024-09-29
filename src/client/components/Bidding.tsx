import React, { useContext, useState } from 'react';
import { Slider, Button, Typography, Stack, Card } from '@mui/joy';
import { StateContext } from '../State';
import { submitBid } from '../../common/api';

const Bidding: React.FC = () => {
  const appState = useContext(StateContext);
  const [betAmount, setBetAmount] = useState<number>(0);
  const maxBet =
    (appState.kind === 'bidding' &&
      appState.players.find(u => u.nickname === appState.nickname)?.points) ||
    0;
  const [disabled, setDisabled] = useState(false);

  const handleSliderChange = (e: Event, newValue: number | number[]) => {
    setBetAmount(newValue as number);
  };

  const handleConfirm = async () => {
    if (!appState.nickname) return;
    setDisabled(true);
    await submitBid({
      nickname: appState.nickname,
      bidAmt: betAmount,
    });
  };

  return (
    <Card sx={{ padding: 5, maxWidth: 575 }}>
      <Typography level="h1" p={0}>
        Place Your Bet
      </Typography>
      <Typography>
        Select an amount of Willpower to wager. If your bet is the highest, you
        win control of John. Otherwise, you'll get your Willpower back.
      </Typography>
      <Stack alignItems="center">
        <Slider
          value={betAmount}
          onChange={handleSliderChange}
          min={0}
          max={maxBet}
          step={1}
          valueLabelDisplay="auto"
          aria-label="Bidding slider"
          marks
          sx={{
            '--Slider-markSize': '4px',
            '--Slider-thumbSize': '22px',
            my: 4,
            maxWidth: '300px',
          }}
          disabled={disabled}
        />
        <Button
          variant="solid"
          disabled={disabled}
          onClick={handleConfirm}
          sx={{ alignSelf: 'flex-end' }}
        >
          Bet {betAmount} Willpower{' '}
        </Button>
      </Stack>
    </Card>
  );
};

export default Bidding;
