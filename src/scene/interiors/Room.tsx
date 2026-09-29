import { MeshReflectorMaterial, Text } from '@react-three/drei';
import { tapToMove } from '@/scene/controls/tapToMove';
import { FONTS } from '@/scene/fonts';
import { requestInteraction } from '@/scene/interaction/interactables';
import { exitToStreet } from '@/scene/interaction/travel';
import { useInteractable } from '@/scene/interaction/useInteractable';
import { neon } from '@/scene/materials/neon';
import { useGameStore } from '@/scene/store/gameStore';
import { blockTap, onTap } from '@/scene/world/events';
import { EXIT_DOOR, ROOM, ROOM_CENTER_Z } from './roomLayout';

const WALL_THICKNESS = 0.4;
const WALL_COLOR = '#241d42';
const FLOOR_COLOR = '#0c0a18';
const DOOR_WIDTH = 2.4;
const DOOR_HEIGHT = 3.2;
const EXIT_ID = 'exit';

const ROOM_WIDTH = ROOM.halfWidth * 2;
const ROOM_DEPTH = ROOM.maxZ - ROOM.minZ;

function Floor() {
  const quality = useGameStore((state) => state.quality);
  return (
    <mesh rotation-x={-Math.PI / 2} position-z={ROOM_CENTER_Z} onClick={tapToMove}>
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      {quality === 'high' ? (
        <MeshReflectorMaterial
          color={FLOOR_COLOR}
          resolution={256}
          blur={[200, 60]}
          mixBlur={1}
          mixStrength={18}
          roughness={0.6}
          metalness={0.5}
          mirror={0}
        />
      ) : (
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.4} metalness={0.6} />
      )}
    </mesh>
  );
}

function Walls() {
  const halfT = WALL_THICKNESS / 2;
  const y = ROOM.height / 2;
  const walls: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, y, ROOM.minZ - halfT], size: [ROOM_WIDTH, ROOM.height, WALL_THICKNESS] },
    { position: [0, y, ROOM.maxZ + halfT], size: [ROOM_WIDTH, ROOM.height, WALL_THICKNESS] },
    { position: [-ROOM.halfWidth - halfT, y, ROOM_CENTER_Z], size: [WALL_THICKNESS, ROOM.height, ROOM_DEPTH] },
    { position: [ROOM.halfWidth + halfT, y, ROOM_CENTER_Z], size: [WALL_THICKNESS, ROOM.height, ROOM_DEPTH] },
    { position: [0, ROOM.height + halfT, ROOM_CENTER_Z], size: [ROOM_WIDTH, WALL_THICKNESS, ROOM_DEPTH] },
  ];

  return (
    <group onClick={blockTap}>
      {walls.map(({ position, size }) => (
        <mesh key={position.join()} position={position}>
          <boxGeometry args={size} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.8} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/** Neon strips running along the floor and ceiling edges. */
function EdgeStrips({ accent }: { accent: string }) {
  const color = neon(accent, 2);
  const inset = 0.05;
  const strips: { position: [number, number, number]; size: [number, number, number] }[] = [];

  for (const y of [0.04, ROOM.height - 0.04]) {
    strips.push(
      { position: [0, y, ROOM.minZ + inset], size: [ROOM_WIDTH, 0.06, 0.06] },
      { position: [0, y, ROOM.maxZ - inset], size: [ROOM_WIDTH, 0.06, 0.06] },
      { position: [-ROOM.halfWidth + inset, y, ROOM_CENTER_Z], size: [0.06, 0.06, ROOM_DEPTH] },
      { position: [ROOM.halfWidth - inset, y, ROOM_CENTER_Z], size: [0.06, 0.06, ROOM_DEPTH] },
    );
  }

  return (
    <group>
      {strips.map(({ position, size }) => (
        <mesh key={position.join()} position={position}>
          <boxGeometry args={size} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Vertical neon light bars near the room corners, clear of the wall panels. */
function WallLights({ accent }: { accent: string }) {
  const color = neon(accent, 1.8);
  const height = ROOM.height - 1.6;
  const inset = 0.06;
  const bars: [number, number, number][] = [
    [-ROOM.halfWidth + inset, ROOM.height / 2, ROOM.minZ + 0.8],
    [ROOM.halfWidth - inset, ROOM.height / 2, ROOM.minZ + 0.8],
    [-ROOM.halfWidth + inset, ROOM.height / 2, ROOM.maxZ - 1.2],
    [ROOM.halfWidth - inset, ROOM.height / 2, ROOM.maxZ - 1.2],
    [-ROOM.halfWidth + 0.8, ROOM.height / 2, ROOM.minZ + inset],
    [ROOM.halfWidth - 0.8, ROOM.height / 2, ROOM.minZ + inset],
  ];

  return (
    <group>
      {bars.map((position) => (
        <mesh key={position.join()} position={position}>
          <boxGeometry args={[0.08, height, 0.08]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function ExitDoor({ accent }: { accent: string }) {
  const isNearby = useGameStore((state) => state.nearbyId === EXIT_ID);
  const frame = neon(accent, isNearby ? 3.2 : 1.6);

  useInteractable({
    id: EXIT_ID,
    label: 'Back to the street',
    spot: { x: EXIT_DOOR.x, z: EXIT_DOOR.z - 1.4 },
    radius: 1.8,
    activate: exitToStreet,
  });

  return (
    // Rotated so the door's +Z faces into the room.
    <group
      position={[EXIT_DOOR.x, 0, EXIT_DOOR.z - 0.02]}
      rotation-y={Math.PI}
      onClick={onTap(() => requestInteraction(EXIT_ID, useGameStore.getState().nearbyId))}
    >
      <mesh position-y={DOOR_HEIGHT / 2}>
        <planeGeometry args={[DOOR_WIDTH, DOOR_HEIGHT]} />
        <meshStandardMaterial
          color="#05040b"
          emissive={accent}
          emissiveIntensity={isNearby ? 0.35 : 0}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * DOOR_WIDTH) / 2, DOOR_HEIGHT / 2, 0.02]}>
          <boxGeometry args={[0.08, DOOR_HEIGHT, 0.04]} />
          <meshBasicMaterial color={frame} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, DOOR_HEIGHT, 0.02]}>
        <boxGeometry args={[DOOR_WIDTH + 0.08, 0.08, 0.04]} />
        <meshBasicMaterial color={frame} toneMapped={false} />
      </mesh>
      <Text
        font={FONTS.display}
        position={[0, DOOR_HEIGHT + 0.55, 0.03]}
        fontSize={0.4}
        letterSpacing={0.2}
        anchorX="center"
        anchorY="middle"
      >
        EXIT
        <meshBasicMaterial color={neon('#ff2b4a', 2.4)} toneMapped={false} />
      </Text>
    </group>
  );
}

/** Shared interior shell: floor, walls, ceiling, neon trim, lights and exit door. */
export function Room({ accent }: { accent: string }) {
  return (
    <group>
      <Floor />
      <Walls />
      <EdgeStrips accent={accent} />
      <ExitDoor accent={accent} />

      <WallLights accent={accent} />

      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#8f7dff', '#140c28', 1.2]} />
      <pointLight position={[0, ROOM.height - 0.8, ROOM_CENTER_Z]} color="#ffffff" intensity={70} distance={22} />
      <pointLight position={[-ROOM.halfWidth + 1.5, 2.5, ROOM.minZ + 2]} color={accent} intensity={45} distance={14} />
      <pointLight position={[ROOM.halfWidth - 1.5, 2.5, ROOM.minZ + 2]} color={accent} intensity={45} distance={14} />
    </group>
  );
}
