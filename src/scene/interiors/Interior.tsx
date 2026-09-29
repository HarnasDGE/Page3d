import { serviceBySlug } from '@/data/services';
import { venueByBuilding, type Venue } from '@/scene/world/venues';
import { Room } from './Room';
import { ReadingRoom } from './venues/ReadingRoom';
import { ServiceRoom } from './venues/ServiceRoom';
import { SignalRoom } from './venues/SignalRoom';
import { StudioRoom } from './venues/StudioRoom';

function VenueContent({ venue }: { venue: Venue }) {
  switch (venue.kind) {
    case 'service': {
      const service = venue.slug ? serviceBySlug.get(venue.slug) : undefined;
      return service ? <ServiceRoom service={service} /> : null;
    }
    case 'about':
      return <StudioRoom accent={venue.accent} />;
    case 'blog':
      return <ReadingRoom accent={venue.accent} />;
    case 'contact':
      return <SignalRoom accent={venue.accent} />;
  }
}

export function Interior({ buildingId }: { buildingId: string }) {
  const venue = venueByBuilding.get(buildingId);
  if (!venue) return null;

  return (
    <group>
      <color attach="background" args={['#050409']} />
      <Room accent={venue.accent} />
      <VenueContent venue={venue} />
    </group>
  );
}
