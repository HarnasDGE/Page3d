import { categoryBySlug } from '@/data/blogCategories';
import { serviceBySlug } from '@/data/services';
import { venueByBuilding, type Venue } from '@/scene/world/venues';
import { Room } from './Room';
import { ReadingRoom } from './venues/ReadingRoom';
import { ServiceRoom } from './venues/ServiceRoom';
import { SignalRoom } from './venues/SignalRoom';
import { StudioRoom } from './venues/StudioRoom';

function VenueContent({ venue, floor }: { venue: Venue; floor: number }) {
  switch (venue.kind) {
    case 'service': {
      const service = venue.slug ? serviceBySlug.get(venue.slug) : undefined;
      return service ? <ServiceRoom service={service} /> : null;
    }
    case 'about':
      return <StudioRoom accent={venue.accent} />;
    case 'blog': {
      const category = venue.slug ? categoryBySlug.get(venue.slug) : undefined;
      return category ? <ReadingRoom category={category} floor={floor} /> : null;
    }
    case 'contact':
      return <SignalRoom accent={venue.accent} />;
  }
}

export function Interior({ buildingId, floor }: { buildingId: string; floor: number }) {
  const venue = venueByBuilding.get(buildingId);
  if (!venue) return null;

  return (
    <group>
      <color attach="background" args={['#050409']} />
      <Room accent={venue.accent} />
      <VenueContent venue={venue} floor={floor} />
    </group>
  );
}
