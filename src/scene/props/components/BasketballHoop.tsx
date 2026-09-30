import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { BallCollider, CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import { FONTS } from '@/scene/fonts';
import { neon } from '@/scene/materials/neon';
import { blockTap } from '@/scene/world/events';
import {
  HOOP_BOARD_OFFSET,
  HOOP_RIM_HEIGHT,
  HOOP_RIM_OFFSET,
  HOOP_RIM_RADIUS,
  HOOPS,
  type Hoop,
} from '../propLayout';
import { usePropsStore } from '../propsStore';
import { canPositions } from './Cans';

const BOARD = { width: 1.8, height: 1.1, depth: 0.06, y: 3.5 } as const;
const POLE_HEIGHT = 3.8;
const RIM_SEGMENTS = 12;
/** A throw that hasn't scored within this time counts as a miss. */
const MISS_AFTER_MS = 2500;

// Bright, readable palette: the hoops must stand out against the night street.
const POLE_COLOR = '#e8ebf2';
const BOARD_COLOR = '#f7f9ff';
const ACCENT_COLOR = '#ff6a13';

function HoopModel({ hoop }: { hoop: Hoop }) {
  const score = usePropsStore((state) => state.hoop.score);
  const best = usePropsStore((state) => state.hoop.best);
  const accent = neon(ACCENT_COLOR, 2.6);

  return (
    // Local frame: +Z points from the pole towards the plaza centre.
    <RigidBody type="fixed" colliders={false} position={[hoop.x, 0, hoop.z]} rotation={[0, hoop.rotationY, 0]}>
      <CylinderCollider args={[POLE_HEIGHT / 2, 0.1]} position={[0, POLE_HEIGHT / 2, 0]} />
      <CuboidCollider
        args={[BOARD.width / 2, BOARD.height / 2, BOARD.depth / 2]}
        position={[0, BOARD.y, HOOP_BOARD_OFFSET]}
      />
      {/* Rim made of small balls so cans can bounce off it or drop through. */}
      {Array.from({ length: RIM_SEGMENTS }, (_, i) => {
        const angle = (i / RIM_SEGMENTS) * Math.PI * 2;
        return (
          <BallCollider
            key={i}
            args={[0.03]}
            position={[
              Math.cos(angle) * HOOP_RIM_RADIUS,
              HOOP_RIM_HEIGHT,
              HOOP_RIM_OFFSET + Math.sin(angle) * HOOP_RIM_RADIUS,
            ]}
          />
        );
      })}

      <group onClick={blockTap}>
        {/* Pole with a weighted base and an arm out to the board. */}
        <mesh position-y={0.1}>
          <cylinderGeometry args={[0.35, 0.4, 0.2, 16]} />
          <meshStandardMaterial color={ACCENT_COLOR} emissive={ACCENT_COLOR} emissiveIntensity={0.35} />
        </mesh>
        <mesh position-y={POLE_HEIGHT / 2}>
          <cylinderGeometry args={[0.08, 0.1, POLE_HEIGHT, 12]} />
          <meshStandardMaterial color={POLE_COLOR} emissive={POLE_COLOR} emissiveIntensity={0.25} roughness={0.4} />
        </mesh>

        <group position={[0, BOARD.y, HOOP_BOARD_OFFSET]}>
          <mesh>
            <boxGeometry args={[BOARD.width, BOARD.height, BOARD.depth]} />
            <meshStandardMaterial
              color={BOARD_COLOR}
              emissive={BOARD_COLOR}
              emissiveIntensity={0.45}
              roughness={0.3}
              transparent
              opacity={0.92}
            />
          </mesh>
          {/* Orange frame and shooter's square. */}
          {[
            { position: [0, BOARD.height / 2, 0.04], size: [BOARD.width, 0.05, 0.02] },
            { position: [0, -BOARD.height / 2, 0.04], size: [BOARD.width, 0.05, 0.02] },
            { position: [-BOARD.width / 2, 0, 0.04], size: [0.05, BOARD.height, 0.02] },
            { position: [BOARD.width / 2, 0, 0.04], size: [0.05, BOARD.height, 0.02] },
            { position: [0, 0.04, 0.04], size: [0.6, 0.04, 0.02] },
            { position: [-0.28, -0.18, 0.04], size: [0.04, 0.45, 0.02] },
            { position: [0.28, -0.18, 0.04], size: [0.04, 0.45, 0.02] },
          ].map(({ position, size }) => (
            <mesh key={position.join()} position={position as [number, number, number]}>
              <boxGeometry args={size as [number, number, number]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
          ))}
        </group>

        {/* Scoreboard strip above the backboard. */}
        <group position={[0, BOARD.y + BOARD.height / 2 + 0.22, HOOP_BOARD_OFFSET]}>
          <mesh>
            <boxGeometry args={[BOARD.width, 0.34, 0.08]} />
            <meshStandardMaterial color="#0b0916" />
          </mesh>
          <Text font={FONTS.display} position-z={0.05} fontSize={0.15} anchorX="center" anchorY="middle">
            {`SCORE ${score}   BEST ${best}`}
            <meshBasicMaterial color={neon('#00f0ff', 2.4)} toneMapped={false} />
          </Text>
        </group>

        <mesh position={[0, HOOP_RIM_HEIGHT, HOOP_RIM_OFFSET]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[HOOP_RIM_RADIUS, 0.03, 8, 32]} />
          <meshBasicMaterial color={neon(ACCENT_COLOR, 3.2)} toneMapped={false} />
        </mesh>
        <mesh position={[0, HOOP_RIM_HEIGHT - 0.3, HOOP_RIM_OFFSET]}>
          <cylinderGeometry args={[HOOP_RIM_RADIUS, HOOP_RIM_RADIUS * 0.6, 0.55, 12, 3, true]} />
          <meshBasicMaterial color={neon('#ffffff', 2)} wireframe toneMapped={false} />
        </mesh>
      </group>
    </RigidBody>
  );
}

/** All plaza hoops; throw cans through a rim to score (score is shared). */
export function BasketballHoops() {
  const previous = useRef(new Map<string, [number, number, number]>());

  // A basket = a can crossing a rim plane downwards inside the rim between two
  // frames. Frame-based, so it can't be skipped at low frame rates the way a
  // thin physics sensor can.
  useFrame(() => {
    canPositions.forEach((position, id) => {
      const before = previous.current.get(id);
      previous.current.set(id, [...position]);
      if (!before || before[1] <= HOOP_RIM_HEIGHT || position[1] > HOOP_RIM_HEIGHT) return;
      const t = (before[1] - HOOP_RIM_HEIGHT) / (before[1] - position[1]);
      const x = before[0] + (position[0] - before[0]) * t;
      const z = before[2] + (position[2] - before[2]) * t;
      const scored = HOOPS.some((hoop) => Math.hypot(x - hoop.rim.x, z - hoop.rim.z) < HOOP_RIM_RADIUS);
      if (scored) usePropsStore.getState().scoreBasket();
    });

    const { isShotPending, lastThrowAt, missBasket } = usePropsStore.getState();
    if (isShotPending && Date.now() - lastThrowAt > MISS_AFTER_MS) missBasket();
  });

  return (
    <>
      {HOOPS.map((hoop) => (
        <HoopModel key={hoop.id} hoop={hoop} />
      ))}
    </>
  );
}
