import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import type { Group } from 'three';
import { FONTS } from '@/scene/fonts';
import { neon } from '@/scene/materials/neon';
import { blockTap } from '@/scene/world/events';
import { venueByBuilding, type Venue } from '@/scene/world/venues';
import { EXHIBIT_HALF_SIZE, ROOM_CENTER_Z } from './roomLayout';
import { Room } from './Room';

/** Centre-of-room hologram; replaced by venue specific content in the next stage. */
function ExhibitPlaceholder({ venue }: { venue: Venue }) {
  const hologram = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!hologram.current) return;
    hologram.current.rotation.y = clock.elapsedTime * 0.5;
    hologram.current.position.y = 2.6 + Math.sin(clock.elapsedTime * 1.3) * 0.08;
  });

  return (
    <group position-z={ROOM_CENTER_Z} onClick={blockTap}>
      <mesh position-y={0.4}>
        <boxGeometry args={[EXHIBIT_HALF_SIZE * 2, 0.8, EXHIBIT_HALF_SIZE * 2]} />
        <meshStandardMaterial color="#1a1530" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position-y={0.82} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.1, 1.25, 48]} />
        <meshBasicMaterial color={neon(venue.accent, 2.4)} toneMapped={false} />
      </mesh>
      <group ref={hologram}>
        {[0, Math.PI].map((rotation) => (
          <Text
            key={rotation}
            font={FONTS.display}
            rotation-y={rotation}
            fontSize={0.55}
            letterSpacing={0.08}
            anchorX="center"
            anchorY="middle"
          >
            {venue.sign}
            <meshBasicMaterial color={neon(venue.accent, 2.4)} toneMapped={false} />
          </Text>
        ))}
      </group>
    </group>
  );
}

export function Interior({ buildingId }: { buildingId: string }) {
  const venue = venueByBuilding.get(buildingId);
  if (!venue) return null;

  return (
    <group>
      <color attach="background" args={['#050409']} />
      <Room accent={venue.accent} />
      <ExhibitPlaceholder venue={venue} />
    </group>
  );
}
