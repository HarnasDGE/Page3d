import { lazy, Suspense } from 'react';
import { Buildings } from './Buildings';
import { FacadeDecor } from './FacadeDecor';
import { Ground } from './Ground';
import { HoverTraffic } from './HoverTraffic';
import { NonAgencyHQ } from './NonAgencyHQ';
import { PlazaHologram } from './PlazaHologram';
import { RoadMarkings } from './RoadMarkings';
import { Skyline } from './Skyline';
import { Storefronts } from './Storefronts';
import { StreetDecor } from './StreetDecor';

const StreetPhysics = lazy(() => import('@/scene/props/StreetPhysics'));

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
      {/* Textured details stream in without blanking the rest of the city. */}
      <Suspense fallback={null}>
        <RoadMarkings />
        <FacadeDecor />
        <NonAgencyHQ />
      </Suspense>
      <Suspense fallback={null}>
        <StreetPhysics />
      </Suspense>
    </group>
  );
}
