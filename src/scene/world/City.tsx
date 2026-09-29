import { Buildings } from './Buildings';
import { Ground } from './Ground';
import { PlazaHologram } from './PlazaHologram';

export function City() {
  return (
    <group>
      <Ground />
      <Buildings />
      <PlazaHologram />
    </group>
  );
}
