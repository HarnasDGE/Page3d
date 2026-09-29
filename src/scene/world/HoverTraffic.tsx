import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { neon } from '@/scene/materials/neon';

const EXTENT = 130;

interface Lane {
  axis: 'x' | 'z';
  offset: number;
  height: number;
  /** Units per second; the sign sets the direction. */
  speed: number;
  start: number;
}

// Lanes run above the streets and higher than every street building, so cars
// never clip through towers.
const LANES: Lane[] = [
  { axis: 'x', offset: -2, height: 33, speed: 14, start: 0 },
  { axis: 'x', offset: 2, height: 36, speed: -11, start: 60 },
  { axis: 'z', offset: 2, height: 34, speed: 12, start: 30 },
  { axis: 'z', offset: -2, height: 39, speed: -16, start: 100 },
  { axis: 'x', offset: 0, height: 44, speed: 9, start: 140 },
  { axis: 'z', offset: 0, height: 42, speed: -13, start: 200 },
];

const TAIL_LIGHT = neon('#ff2b4a', 3);
const HEAD_LIGHT = neon('#e8f6ff', 3);

function HoverCar({ lane }: { lane: Lane }) {
  const car = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!car.current) return;
    const span = EXTENT * 2;
    const travelled = (lane.start + clock.elapsedTime * Math.abs(lane.speed)) % span;
    const along = (lane.speed > 0 ? travelled : span - travelled) - EXTENT;
    if (lane.axis === 'x') car.current.position.set(along, lane.height, lane.offset);
    else car.current.position.set(lane.offset, lane.height, along);
  });

  // The car model points along +Z; turn it towards its direction of travel.
  const heading =
    lane.axis === 'z'
      ? lane.speed > 0
        ? 0
        : Math.PI
      : lane.speed > 0
        ? Math.PI / 2
        : -Math.PI / 2;

  return (
    <group ref={car}>
      <group rotation-y={heading}>
        <mesh>
          <boxGeometry args={[1.6, 0.6, 3.6]} />
          <meshStandardMaterial color="#2a2448" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position-z={-1.82}>
          <boxGeometry args={[1.4, 0.12, 0.05]} />
          <meshBasicMaterial color={TAIL_LIGHT} toneMapped={false} />
        </mesh>
        <mesh position-z={1.82}>
          <boxGeometry args={[1.4, 0.12, 0.05]} />
          <meshBasicMaterial color={HEAD_LIGHT} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Flying cars crossing the sky above the district. */
export function HoverTraffic() {
  return (
    <group>
      {LANES.map((lane, i) => (
        <HoverCar key={i} lane={lane} />
      ))}
    </group>
  );
}
