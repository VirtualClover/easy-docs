import { Box, keyframes, styled } from '@mui/material';

import component from '../illustrations/component.svg';
import doc from '../illustrations/doc.svg';
import lightning from '../illustrations/lightning.svg';
import pencil from '../illustrations/pencil.svg';
import sparks from '../illustrations/sparks.svg';

let rotationAnimation = keyframes`
0% {transform: rotate(20deg);}
50% {transform: rotate(0deg);}
100% {transform: rotate(20deg);}
`;

let RotatingImg = styled('img')(({ theme }) => ({
  animationName: rotationAnimation,
  animationDuration: '4s',
  animationIterationCount: 'infinite',
}));

export const InspectAnim = () => {
  return (
    <Box style={{ position: 'relative', marginBottom: 45 }}>
      <img src={doc} style={{ height: 180 }} />
      <RotatingImg
        src={pencil}
        style={{
          position: 'absolute',
          left: '-40%',
          bottom: 0,
          height: 180,
        }}
      />
      <RotatingImg
        src={sparks}
        style={{ position: 'absolute', right: '-15%', top: '-10%', animationDirection:'reverse' }}
      />
    </Box>
  );
};

export const OutdatedComponentsAnim = () => {
  return (
    <Box style={{ position: 'relative', marginTop: 45 }}>
      <img src={component} style={{ height: 180 }} />
      <img
        src={lightning}
        style={{ position: 'absolute', right: 0, top: 0, height: 100 }}
      />
    </Box>
  );
};
