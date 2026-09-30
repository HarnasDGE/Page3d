import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Line, LineDashedMaterial, Vector3, type Mesh } from 'three';
import { neon } from '@/scene/materials/neon';
import { chargedThrowPoint, chargePower, computeThrow, getHandPosition, pointOnArc } from '../carry';
import { usePropsStore } from '../propsStore';

const SEGMENTS = 28;
const hand = new Vector3();
const target = new Vector3();
const velocity = new Vector3();
const point = new Vector3();
const aimPoint = new Vector3();

/** Dotted arc + landing ring while a throw is charging (shows where it will land). */
export function TrajectoryPreview() {
  const ring = useRef<Mesh>(null);
  const line = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array((SEGMENTS + 1) * 3), 3));
    const material = new LineDashedMaterial({
      color: neon('#ffb800', 2),
      dashSize: 0.25,
      gapSize: 0.18,
      toneMapped: false,
    });
    const arc = new Line(geometry, material);
    arc.frustumCulled = false;
    arc.visible = false;
    return arc;
  }, []);

  useFrame(({ clock }) => {
    const { heldCanId, chargeStartedAt } = usePropsStore.getState();
    const visible = heldCanId !== null && chargeStartedAt !== null;
    line.visible = visible;
    if (ring.current) ring.current.visible = visible;
    if (!visible) return;

    getHandPosition(hand);
    chargedThrowPoint(chargePower(Date.now() - chargeStartedAt!), aimPoint);
    const time = computeThrow(hand, aimPoint, target, velocity);

    const positions = line.geometry.attributes.position as BufferAttribute;
    for (let i = 0; i <= SEGMENTS; i++) {
      pointOnArc(hand, velocity, (i / SEGMENTS) * time, point);
      positions.setXYZ(i, point.x, point.y, point.z);
    }
    positions.needsUpdate = true;
    line.computeLineDistances();

    // Landing ring on the ground, or around the rim when the hoop assist kicks in.
    ring.current?.position.set(target.x, target.y > 1 ? target.y : 0.03, target.z);
    ring.current?.scale.setScalar(1 + Math.sin(clock.elapsedTime * 8) * 0.1);
  });

  return (
    <>
      <primitive object={line} />
      <mesh ref={ring} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.35, 0.48, 32]} />
        <meshBasicMaterial color={neon('#ffb800', 2)} toneMapped={false} transparent opacity={0.9} />
      </mesh>
    </>
  );
}
