import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshBasicMaterial, Object3D, type InstancedMesh } from 'three';
import { neon } from '@/scene/materials/neon';
import { usePropsStore } from '@/scene/props/propsStore';
import {
  BUILDING_DEPTH,
  BUILDING_GAP,
  PLAZA_HALF_SIZE,
  STREET_HALF_WIDTH,
  STREET_LENGTH,
  STREET_ROTATION,
  streets,
  type Street,
} from './cityLayout';
import { ChannelLetters } from './signs/ChannelLetters';

// Everything below is authored in local street space: the street runs from
// the plaza (z = -PLAZA_HALF_SIZE) towards -Z, centred on x = 0.
const STREET_START = -PLAZA_HALF_SIZE;
const STREET_END = -PLAZA_HALF_SIZE - STREET_LENGTH;

const DASH_LENGTH = 2;
const DASH_STEP = 5;
const DASH_COUNT = Math.floor(STREET_LENGTH / DASH_STEP);
export const LAMP_X = STREET_HALF_WIDTH - 0.15;
/** Lamps stand in the gaps between buildings so they never block a door. */
export const LAMP_Z = [0, 1, 2].map(
  (i) => STREET_START - 1 - BUILDING_DEPTH - BUILDING_GAP / 2 - i * (BUILDING_DEPTH + BUILDING_GAP),
);

const POLE_COLOR = '#1c1830';

function StreetMarkings({ accent }: { accent: string }) {
  const dashes = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = dashes.current;
    if (!mesh) return;
    const dummy = new Object3D();
    for (let i = 0; i < DASH_COUNT; i++) {
      dummy.position.set(0, 0.02, STREET_START - 3 - i * DASH_STEP);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <instancedMesh ref={dashes} args={[undefined, undefined, DASH_COUNT]}>
        <boxGeometry args={[0.18, 0.02, DASH_LENGTH]} />
        <meshBasicMaterial color={neon('#ffffff', 0.35)} toneMapped={false} />
      </instancedMesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (STREET_HALF_WIDTH - 0.05), 0.02, (STREET_START + STREET_END) / 2]}
        >
          <boxGeometry args={[0.1, 0.03, STREET_LENGTH]} />
          <meshBasicMaterial color={neon(accent, 1.6)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** About Street's lamps flicker until the broken power box is fixed. */
const POWER_OUTAGE_STREET: Street['id'] = 'about';

function StreetLamps({ accent, streetId }: { accent: string; streetId: Street['id'] }) {
  const lamps = LAMP_Z.flatMap((z) => [-1, 1].map((side) => ({ z, side })));
  const headMaterial = useMemo(
    () => new MeshBasicMaterial({ color: neon(accent, 3), toneMapped: false }),
    [accent],
  );
  const lit = useMemo(() => neon(accent, 3), [accent]);

  useFrame(({ clock }) => {
    if (streetId !== POWER_OUTAGE_STREET) return;
    if (usePropsStore.getState().isPowerFixed) {
      headMaterial.color.copy(lit);
      return;
    }
    // Brown-out: mostly dim with nervous flashes.
    const t = clock.elapsedTime;
    const flash = Math.sin(t * 23) * Math.sin(t * 7.3) > 0.55;
    headMaterial.color.copy(lit).multiplyScalar(flash ? 0.8 : 0.08);
  });

  return (
    <group>
      {lamps.map(({ z, side }) => (
        <group key={`${z}:${side}`} position={[side * LAMP_X, 0, z]}>
          <mesh position-y={3}>
            <cylinderGeometry args={[0.07, 0.1, 6, 8]} />
            <meshStandardMaterial color={POLE_COLOR} metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh position={[-side * 0.6, 6, 0]}>
            <boxGeometry args={[1.3, 0.08, 0.08]} />
            <meshStandardMaterial color={POLE_COLOR} metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh position={[-side * 1.15, 5.9, 0]} material={headMaterial}>
            <boxGeometry args={[0.5, 0.08, 0.22]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Neon gateway over the street entrance, labelled on both sides. */
function StreetGate({ street }: { street: Street }) {
  const width = STREET_HALF_WIDTH * 2 + 0.6;

  return (
    <group position-z={STREET_START - 0.5}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * width) / 2, 3.75, 0]}>
          <boxGeometry args={[0.3, 7.5, 0.3]} />
          <meshBasicMaterial color={neon(street.accent, 1.4)} toneMapped={false} />
        </mesh>
      ))}
      <mesh position-y={7.5}>
        <boxGeometry args={[width + 0.3, 1.3, 0.3]} />
        <meshStandardMaterial color="#0b0916" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Extruded letters on both faces of the beam. */}
      {[1, -1].map((side) => (
        <group key={side} position={[0, 7.5, side * 0.15]} rotation-y={side > 0 ? 0 : Math.PI}>
          <ChannelLetters text={street.label.toUpperCase()} size={0.5} depth={0.1} accent={street.accent} />
        </group>
      ))}
    </group>
  );
}

export function StreetDecor() {
  return (
    <group>
      {streets.map((street) => (
        <group key={street.id} rotation-y={STREET_ROTATION[street.id]}>
          <StreetMarkings accent={street.accent} />
          <StreetLamps accent={street.accent} streetId={street.id} />
          <StreetGate street={street} />
        </group>
      ))}
    </group>
  );
}
