import { Buildings } from './Buildings';
import { Ground } from './Ground';
import { HoverTraffic } from './HoverTraffic';
import { PlazaHologram } from './PlazaHologram';
import { Skyline } from './Skyline';
import { Storefronts } from './Storefronts';
import { StreetDecor } from './StreetDecor';

export function City() {
  return (
    <group>
      <Ground />
      <Buildings />
      <Storefronts />
      <StreetDecor />
      <PlazaHologram />
      <Skyline />
      <HoverTraffic />
    </group>
  );
}
