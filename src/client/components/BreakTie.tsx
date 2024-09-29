import { Button, Card, Stack } from '@mui/joy';
import { FC, useContext, useEffect, useRef, useState } from 'react';
import ReactDice, { ReactDiceRef } from 'react-dice-complete';
import { submitTieRoll } from '../../common/api';
import { StateContext } from '../State';

const BreakTie: FC = () => {
  const appState = useContext(StateContext);
  const reactDice = useRef<ReactDiceRef>(null);
  const [disabled, setDisabled] = useState(false);

  const roll = () => {
    reactDice.current?.rollAll();
    setDisabled(true);
  };

  const rollDone = async (total: number) => {
    if (!appState.nickname) return;
    await submitTieRoll({
      nickname: appState.nickname,
      roll: total,
    });
  };

  useEffect(() => {
    if (appState.kind !== 'biddingTie') return;

    // If the state changes and everyone who needs to roll hasn't yet rolled,
    // then a new round of tie breaking has begun and we need to undisabled
    // the dice if it was disabled
    if (
      appState.players.filter(
        p => p.tieStatus.kind === 'tie' && p.tieStatus.roll !== null,
      ).length === 0
    ) {
      setDisabled(false);
    }
  }, [appState]);

  return (
    <Card sx={{ p: 5 }}>
      <Stack spacing={3}>
        <ReactDice
          numDice={1}
          ref={reactDice}
          rollDone={rollDone}
          rollTime={3}
          faceColor={'#b0d2ff'}
          dotColor={'#ffffff'}
          outlineColor={'#97abc4'}
          outline
          disableIndividual
        />
        <Button onClick={roll} disabled={disabled}>
          Roll
        </Button>
      </Stack>
    </Card>
  );
};

export default BreakTie;
