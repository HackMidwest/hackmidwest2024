import React, { useState } from 'react';
import { Slider, Button, Typography, Stack, Card, Box } from '@mui/joy';

type BiddingProps = {
  maxBetAmount: number;
  onBetSubmit: (betAmount: number) => void;
}

const Bidding: React.FC<BiddingProps> = ({ maxBetAmount, onBetSubmit }) => {
  const [betAmount, setBetAmount] = useState<number>(0);

  const handleSliderChange = (e: Event, newValue: number | number[]) => {
    setBetAmount(newValue as number);
  };

  const handleConfirm = () => {
    onBetSubmit(betAmount);
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}
    >
      <Card sx={{  padding: 4, width: 320, textAlign: 'center' }}>
        <Stack spacing={2}>
          <Typography level="h2">Place Your Bet</Typography>
          <Slider
            value={betAmount}
            onChange={handleSliderChange}
            min={0}
            max={maxBetAmount}
            step={1}
            valueLabelDisplay="auto"
            aria-label="Bidding slider"
            marks
            sx={{
                "--Slider-markSize": "4px",
                "--Slider-thumbSize": "22px"
              }}
          />
          <Button variant="solid" onClick={handleConfirm}>
          <Typography level="h4" textColor={"white"}>Bet {betAmount} Tokens </Typography>
          </Button>
        </Stack>
      </Card>
    </Box>
  );
};

export default Bidding;