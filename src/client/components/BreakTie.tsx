import { Card } from '@mui/joy';
import { FC, useRef } from 'react';
import ReactDice, { ReactDiceRef } from 'react-dice-complete';

const BreakTie: FC = () => {
  const reactDice = useRef<ReactDiceRef>(null);

  const roll = () => {
    reactDice.current?.rollAll();
  };

  const rollDone = () => {};

  return (
    <Card sx={{ p: 5 }}>
      <ReactDice
        numDice={1}
        ref={reactDice}
        rollDone={rollDone}
        rollTime={3}
        faceColor={'#b0d2ff'}
        dotColor={'#ffffff'}
        outlineColor={'#97abc4'}
        outline
      />
    </Card>
  );
};

export default BreakTie;
