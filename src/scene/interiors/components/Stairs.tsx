import { requestInteraction } from '@/scene/interaction/interactables';
import { changeFloor } from '@/scene/interaction/travel';
import { useInteractable } from '@/scene/interaction/useInteractable';
import { neon } from '@/scene/materials/neon';
import { useGameStore } from '@/scene/store/gameStore';
import { onTap } from '@/scene/world/events';
import { ChannelLetters } from '@/scene/world/signs/ChannelLetters';
import { ROOM, STAIRS, type StairDirection } from '../roomLayout';

const STEP_COUNT = 10;
const STEP_RISE = 0.5;
const STEEL = { color: '#2a2640', metalness: 0.8, roughness: 0.35 } as const;

interface StairsProps {
  direction: StairDirection;
  /** Page the stairs lead to (1-based, as shown on the sign). */
  targetPage: number;
  accent: string;
}

/**
 * Reading room staircase. "Up" is a solid flight rising towards the back
 * wall; "down" is a railed stairwell opening in the floor. A 3D sign above
 * the entrance names the page it leads to.
 */
export function Stairs({ direction, targetPage, accent }: StairsProps) {
  const { rect, spot } = STAIRS[direction];
  const id = `stairs-${direction}`;
  const isNearby = useGameStore((state) => state.nearbyId === id);
  const label = `PAGE ${targetPage}`;
  const glow = neon(accent, isNearby ? 3 : 1.8);

  useInteractable({
    id,
    label: `${direction === 'up' ? 'Up' : 'Down'} to page ${targetPage}`,
    spot,
    radius: 1.6,
    activate: () => changeFloor(direction),
  });

  const width = rect.maxX - rect.minX;
  const length = rect.maxZ - rect.minZ;
  const centerX = (rect.minX + rect.maxX) / 2;
  const stepDepth = length / STEP_COUNT;
  const innerX = direction === 'up' ? rect.minX : rect.maxX;
  const handleTap = onTap(() => requestInteraction(id, useGameStore.getState().nearbyId));

  return (
    <group onClick={handleTap}>
      {direction === 'up' ? (
        <group>
          {Array.from({ length: STEP_COUNT }, (_, i) => {
            const height = (i + 1) * STEP_RISE;
            const z = rect.maxZ - (i + 0.5) * stepDepth;
            return (
              <group key={i}>
                <mesh position={[centerX, height / 2, z]}>
                  <boxGeometry args={[width, height, stepDepth]} />
                  <meshStandardMaterial color="#1b1730" metalness={0.4} roughness={0.6} />
                </mesh>
                {/* Glowing step nosing. */}
                <mesh position={[centerX, height + 0.01, z + stepDepth / 2 - 0.04]}>
                  <boxGeometry args={[width, 0.03, 0.06]} />
                  <meshBasicMaterial color={glow} toneMapped={false} />
                </mesh>
              </group>
            );
          })}
          {/* Opening in the ceiling above the top of the flight. */}
          <mesh position={[centerX, ROOM.height - 0.02, rect.minZ + 1.6]} rotation-x={Math.PI / 2}>
            <planeGeometry args={[width, 3.2]} />
            <meshBasicMaterial color="#020104" />
          </mesh>
          {/* Hand rail along the open side. */}
          <mesh
            position={[innerX + 0.05, (STEP_COUNT * STEP_RISE) / 2 + 1, (rect.minZ + rect.maxZ) / 2]}
            rotation-x={Math.atan2(STEP_COUNT * STEP_RISE, length)}
          >
            <boxGeometry args={[0.06, 0.06, Math.hypot(length, STEP_COUNT * STEP_RISE)]} />
            <meshBasicMaterial color={glow} toneMapped={false} />
          </mesh>
        </group>
      ) : (
        <group>
          {/* Dark opening with dimming step edges going down into it. */}
          <mesh position={[centerX, 0.012, (rect.minZ + rect.maxZ) / 2]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[width, length]} />
            <meshBasicMaterial color="#020104" />
          </mesh>
          {Array.from({ length: STEP_COUNT - 2 }, (_, i) => (
            <mesh key={i} position={[centerX, 0.02, rect.maxZ - (i + 0.5) * stepDepth]}>
              <boxGeometry args={[width - 0.3, 0.01, 0.05]} />
              <meshBasicMaterial color={neon(accent, 1.6 * (1 - i / STEP_COUNT))} toneMapped={false} />
            </mesh>
          ))}
          {/* Railing on the room side and the back. */}
          <mesh position={[innerX, 0.55, (rect.minZ + rect.maxZ) / 2]}>
            <boxGeometry args={[0.06, 0.06, length]} />
            <meshBasicMaterial color={glow} toneMapped={false} />
          </mesh>
          <mesh position={[centerX, 0.55, rect.minZ]}>
            <boxGeometry args={[width, 0.06, 0.06]} />
            <meshBasicMaterial color={glow} toneMapped={false} />
          </mesh>
          {[rect.minZ, (rect.minZ + rect.maxZ) / 2, rect.maxZ].map((z) => (
            <mesh key={z} position={[innerX, 0.28, z]}>
              <boxGeometry args={[0.06, 0.56, 0.06]} />
              <meshStandardMaterial {...STEEL} />
            </mesh>
          ))}
        </group>
      )}

      {/* Page sign hanging above the entrance, facing into the room. */}
      <group position={[centerX, 3, rect.maxZ + 0.1]}>
        <mesh position-z={-0.12}>
          <boxGeometry args={[width - 0.2, 0.9, 0.12]} />
          <meshStandardMaterial color="#0b0916" metalness={0.6} roughness={0.4} />
        </mesh>
        <ChannelLetters text={label} size={0.34} depth={0.08} accent={accent} glow={isNearby ? 3.2 : 2.4} />
        <mesh position={[0, 0.8, -0.12]}>
          <boxGeometry args={[0.04, 0.7, 0.04]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      </group>
    </group>
  );
}
