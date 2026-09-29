import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh, MeshBasicMaterial } from 'three';
import { profile } from '@/data/profile';
import { requestInteraction } from '@/scene/interaction/interactables';
import { useInteractable } from '@/scene/interaction/useInteractable';
import { neon } from '@/scene/materials/neon';
import { useGameStore } from '@/scene/store/gameStore';
import { blockTap, onTap } from '@/scene/world/events';
import { HoloPanel, PanelText } from '../components/HoloPanel';
import { CONSOLE, CONSOLE_HALF_SIZE, EXHIBIT, ROOM, WALLS } from '../roomLayout';

const CONSOLE_ID = 'console';
const MAST_HEIGHT = ROOM.height - 0.6;
const BURST_RINGS = 4;
const BURST_DURATION = 2.4;

/** Transmitter tower; fires rings up the mast whenever a message is sent. */
function Tower({ accent }: { accent: string }) {
  const idleRings = useRef<Group>(null);
  const burst = useRef<(Mesh | null)[]>([]);
  const burstStart = useRef(-Infinity);

  useFrame(({ clock }) => {
    // Fire the burst as soon as the success panel is out of the way.
    const { isSignalPending, panel, setSignalPending } = useGameStore.getState();
    if (isSignalPending && !panel) {
      setSignalPending(false);
      burstStart.current = clock.elapsedTime;
    }

    idleRings.current?.children.forEach((ring, i) => {
      const t = (clock.elapsedTime * 0.6 + i / 3) % 1;
      ring.scale.setScalar(0.6 + t * 0.8);
      ((ring as Mesh).material as MeshBasicMaterial).opacity = 1 - t;
    });

    const elapsed = clock.elapsedTime - burstStart.current;
    burst.current.forEach((ring, i) => {
      if (!ring) return;
      const t = (elapsed - i * 0.25) / BURST_DURATION;
      ring.visible = t >= 0 && t <= 1;
      if (!ring.visible) return;
      ring.position.y = 1 + t * (MAST_HEIGHT - 1);
      ring.scale.setScalar(1 + t * 2.5);
      (ring.material as MeshBasicMaterial).opacity = 1 - t;
    });
  });

  return (
    <group position={[EXHIBIT.x, 0, EXHIBIT.z]} onClick={blockTap}>
      <mesh position-y={0.3}>
        <cylinderGeometry args={[1.5, 1.6, 0.6, 6]} />
        <meshStandardMaterial color="#1a1530" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position-y={MAST_HEIGHT / 2}>
        <cylinderGeometry args={[0.08, 0.2, MAST_HEIGHT, 8]} />
        <meshStandardMaterial color="#2a2448" metalness={0.9} roughness={0.25} />
      </mesh>
      {[1.8, 3, 4.2].map((y) => (
        <mesh key={y} position-y={y} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.45, 0.03, 8, 32]} />
          <meshBasicMaterial color={neon(accent, 2.4)} toneMapped={false} />
        </mesh>
      ))}
      <mesh position-y={MAST_HEIGHT}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color={neon('#ff2b4a', 3)} toneMapped={false} />
      </mesh>

      <group ref={idleRings} position-y={0.62}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[1.2, 1.28, 48]} />
            <meshBasicMaterial color={neon(accent, 1.8)} transparent toneMapped={false} />
          </mesh>
        ))}
      </group>

      {Array.from({ length: BURST_RINGS }, (_, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            burst.current[i] = mesh;
          }}
          rotation-x={-Math.PI / 2}
          visible={false}
        >
          <ringGeometry args={[0.5, 0.6, 48]} />
          <meshBasicMaterial color={neon(accent, 3)} transparent toneMapped={false} />
        </mesh>
      ))}
      <pointLight position-y={3} color={accent} intensity={25} distance={10} />
    </group>
  );
}

function Console({ accent }: { accent: string }) {
  const isNearby = useGameStore((state) => state.nearbyId === CONSOLE_ID);

  return (
    <group
      position={[CONSOLE.x, 0, CONSOLE.z]}
      onClick={onTap(() => requestInteraction(CONSOLE_ID, useGameStore.getState().nearbyId))}
    >
      <mesh position-y={0.5}>
        <boxGeometry args={[CONSOLE_HALF_SIZE.x * 2, 1, CONSOLE_HALF_SIZE.z * 2]} />
        <meshStandardMaterial color="#1a1530" metalness={0.8} roughness={0.3} />
      </mesh>
      <group position={[0, 1.2, 0]} rotation-x={-0.6}>
        <mesh>
          <planeGeometry args={[1.9, 0.9]} />
          <meshBasicMaterial color={isNearby ? '#2a0a24' : '#0b0a14'} />
        </mesh>
        <group position={[-0.8, 0.3, 0.01]}>
          <PanelText font="display" size={0.14} color={accent} glow={isNearby ? 3 : 2}>
            {'> OPEN CHANNEL'}
          </PanelText>
          <PanelText y={-0.28} size={0.16}>
            Send me a message
          </PanelText>
        </group>
      </group>
    </group>
  );
}

export function SignalRoom({ accent }: { accent: string }) {
  const openPanel = useGameStore((state) => state.openPanel);

  useInteractable({
    id: CONSOLE_ID,
    label: 'Open channel',
    spot: { x: CONSOLE.x, z: CONSOLE.z + CONSOLE_HALF_SIZE.z + 1 },
    radius: 1.3,
    activate: () => openPanel({ kind: 'contact' }),
  });

  return (
    <group>
      <Tower accent={accent} />
      <Console accent={accent} />

      <HoloPanel
        position={[WALLS.back.x, 3.4, WALLS.back.z]}
        width={12}
        height={3.8}
        accent={accent}
        title="LET'S BUILD SOMETHING"
      >
        <PanelText size={0.38} maxWidth={11}>
          Got a project, a question or just want to say hi? Use the console to send a message.
        </PanelText>
        <PanelText y={-1.1} font="display" size={0.3} color={accent} glow={2.2}>
          {profile.email}
        </PanelText>
        <PanelText y={-1.6} size={0.32} color="#b9b3e6">
          {`${profile.responseTime}  ·  ${profile.location}`}
        </PanelText>
      </HoloPanel>

      <HoloPanel
        position={[WALLS.right.x, 3, WALLS.right.z]}
        rotationY={WALLS.right.rotationY}
        width={8}
        height={3.2}
        accent={accent}
        title="HOW I WORK"
      >
        {['Reply and quote within 48h', 'Fixed price per milestone', 'Weekly progress demos'].map(
          (line, i) => (
            <PanelText key={line} y={-i * 0.55} size={0.36}>
              {`•  ${line}`}
            </PanelText>
          ),
        )}
      </HoloPanel>

      <HoloPanel
        position={[WALLS.left.x, 3, WALLS.left.z]}
        rotationY={WALLS.left.rotationY}
        width={8}
        height={3.2}
        accent={accent}
        title="ELSEWHERE"
      >
        {profile.socials.map((social, i) => (
          <PanelText key={social.label} y={-i * 0.55} size={0.36}>
            {`•  ${social.label}`}
          </PanelText>
        ))}
      </HoloPanel>
    </group>
  );
}
