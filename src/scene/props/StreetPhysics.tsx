import { useEffect } from 'react';
import { Physics } from '@react-three/rapier';
import { BasketballHoops } from './components/BasketballHoop';
import { canPositions, Cans } from './components/Cans';
import { ElectricalBox } from './components/ElectricalBox';
import { PlayerBody } from './components/PlayerBody';
import { TrajectoryPreview } from './components/TrajectoryPreview';
import { TrashBins } from './components/TrashBin';
import { VendingMachine } from './components/VendingMachine';
import { WorldColliders } from './components/WorldColliders';
import { usePropsStore } from './propsStore';

/**
 * Interactive street props with Rapier physics. Loaded lazily (own chunk,
 * WASM included) so the city renders before the physics engine arrives.
 */
export default function StreetPhysics() {
  // The street unmounts when entering a building: remember where cans lay.
  useEffect(
    () => () => {
      const { saveCan } = usePropsStore.getState();
      canPositions.forEach((position, id) => saveCan(id, position));
    },
    [],
  );

  return (
    <Physics gravity={[0, -9.81, 0]}>
      <WorldColliders />
      <PlayerBody />
      <Cans />
      <TrashBins />
      <ElectricalBox />
      <VendingMachine />
      <BasketballHoops />
      <TrajectoryPreview />
    </Physics>
  );
}
