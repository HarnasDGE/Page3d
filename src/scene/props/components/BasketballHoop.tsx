import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { BallCollider, CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import { FONTS } from '@/scene/fonts';
import { neon } from '@/scene/materials/neon';
import { BASKETBALL_HOOP } from '@/scene/world/cityLayout';
import { blockTap } from '@/scene/world/events';
import { HOOP_BOARD_OFFSET, HOOP_RIM, HOOP_RIM_OFFSET, HOOP_RIM_RADIUS } from '../propLayout';
import { usePropsStore } from '../propsStore';
import { canPositions } from './Cans';

const BOARD = { width: 1.8, height: 1.1, depth: 0.06, y: 3.5 } as const;
const RIM_SEGMENTS = 12;
/** A throw that hasn't scored within this time counts as a miss. */
const MISS_AFTER_MS = 2500;
const RIM_COLOR = '#ff7a1a';

/** Plaza basketball hoop: throw cans through the rim to score. */
export function BasketballHoop() {
  const score = usePropsStore((state) => state.hoop.score);
  const best = usePropsStore((state) => state.hoop.best);
  const previous = useRef(new Map<string, [number, number, number]>());

  // A basket = a can crossing the rim plane downwards inside the rim between two
  // frames. Frame-based, so it can't be skipped at low frame rates the way a
  // thin physics sensor can.
  useFrame(() => {
    canPositions.forEach((position, id) => {
      const before = previous.current.get(id);
      previous.current.set(id, [...position]);
      if (!before || before[1] <= HOOP_RIM.y || position[1] > HOOP_RIM.y) return;
      const t = (before[1] - HOOP_RIM.y) / (before[1] - position[1]);
      const x = before[0] + (position[0] - before[0]) * t;
      const z = before[2] + (position[2] - before[2]) * t;
      if (Math.hypot(x - HOOP_RIM.x, z - HOOP_RIM.z) < HOOP_RIM_RADIUS) usePropsStore.getState().scoreBasket();
    });

    const { isShotPending, lastThrowAt, missBasket } = usePropsStore.getState();
    if (isShotPending && Date.now() - lastThrowAt > MISS_AFTER_MS) missBasket();
  });

  return (
    // Local frame: +Z points from the pole towards the plaza centre.
    <RigidBody
      type="fixed"
      colliders={false}
      position={[BASKETBALL_HOOP.x, 0, BASKETBALL_HOOP.z]}
      rotation={[0, BASKETBALL_HOOP.rotationY, 0]}
    >
      <CylinderCollider args={[1.9, 0.1]} position={[0, 1.9, 0]} />
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
              HOOP_RIM.y,
              HOOP_RIM_OFFSET + Math.sin(angle) * HOOP_RIM_RADIUS,
            ]}
          />
        );
      })}
      <group onClick={blockTap}>
        <mesh position-y={1.9}>
          <cylinderGeometry args={[0.08, 0.1, 3.8, 10]} />
          <meshStandardMaterial color="#2a2448" metalness={0.8} roughness={0.35} />
        </mesh>
        <group position={[0, BOARD.y, HOOP_BOARD_OFFSET]}>
          <mesh>
            <boxGeometry args={[BOARD.width, BOARD.height, BOARD.depth]} />
            <meshStandardMaterial color="#0b0916" metalness={0.4} roughness={0.3} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, -0.18, BOARD.depth / 2 + 0.005]}>
            <planeGeometry args={[0.6, 0.45]} />
            <meshBasicMaterial color={neon('#ffffff', 1.4)} toneMapped={false} wireframe />
          </mesh>
          <Text
            font={FONTS.display}
            position={[0, 0.32, BOARD.depth / 2 + 0.01]}
            fontSize={0.16}
            anchorX="center"
            anchorY="middle"
          >
            {`SCORE ${score}   BEST ${best}`}
            <meshBasicMaterial color={neon('#00f0ff', 2.2)} toneMapped={false} />
          </Text>
        </group>
        <mesh position={[0, HOOP_RIM.y, HOOP_RIM_OFFSET]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[HOOP_RIM_RADIUS, 0.025, 8, 32]} />
          <meshBasicMaterial color={neon(RIM_COLOR, 2.4)} toneMapped={false} />
        </mesh>
        <mesh position={[0, HOOP_RIM.y - 0.3, HOOP_RIM_OFFSET]}>
          <cylinderGeometry args={[HOOP_RIM_RADIUS, HOOP_RIM_RADIUS * 0.6, 0.55, 12, 3, true]} />
          <meshBasicMaterial color={neon('#e8e6f2', 1.2)} wireframe toneMapped={false} />
        </mesh>
      </group>
    </RigidBody>
  );
}
