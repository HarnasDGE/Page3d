import type { ServiceIcon } from '@/data/services';
import { neon } from '@/scene/materials/neon';

function Wire({ color, intensity = 2.2 }: { color: string; intensity?: number }) {
  return <meshBasicMaterial color={neon(color, intensity)} wireframe toneMapped={false} />;
}

function Solid({ color, intensity = 2.2 }: { color: string; intensity?: number }) {
  return <meshBasicMaterial color={neon(color, intensity)} toneMapped={false} />;
}

function Browser({ accent }: { accent: string }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.9, 1.3, 0.06, 1, 1, 1]} />
        <Wire color={accent} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.9, 0.04, 0.07]} />
        <Solid color={accent} />
      </mesh>
      {[0.3, 0.05, -0.2, -0.45].map((y, i) => (
        <mesh key={y} position={[-0.25 + (i % 2) * 0.1, y, 0]}>
          <boxGeometry args={[1.1 - (i % 2) * 0.3, 0.07, 0.07]} />
          <Solid color={accent} intensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}

function Bag({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position-y={-0.15}>
        <boxGeometry args={[1.3, 1.1, 0.6, 2, 2, 1]} />
        <Wire color={accent} />
      </mesh>
      <mesh position-y={0.4}>
        <torusGeometry args={[0.35, 0.04, 8, 24, Math.PI]} />
        <Solid color={accent} />
      </mesh>
    </group>
  );
}

function Stack({ accent }: { accent: string }) {
  return (
    <group>
      {[-0.45, 0, 0.45].map((y, i) => (
        <mesh key={y} position-y={y}>
          <boxGeometry args={[1.5 - i * 0.2, 0.22, 1.1 - i * 0.15, 3, 1, 3]} />
          <Wire color={accent} intensity={1.6 + i * 0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Gauge({ accent }: { accent: string }) {
  return (
    <group>
      <mesh rotation-z={-Math.PI / 4}>
        <torusGeometry args={[0.8, 0.05, 8, 48, Math.PI * 1.5]} />
        <Solid color={accent} />
      </mesh>
      <mesh position={[0.22, 0.22, 0]} rotation-z={-Math.PI / 4}>
        <boxGeometry args={[0.06, 0.65, 0.06]} />
        <Solid color="#ffffff" intensity={2.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <Solid color={accent} />
      </mesh>
    </group>
  );
}

const ICONS: Record<ServiceIcon, (props: { accent: string }) => React.JSX.Element> = {
  browser: Browser,
  bag: Bag,
  stack: Stack,
  gauge: Gauge,
};

/** Neon wireframe symbol for a service, shown above the room's pedestal. */
export function ServiceHologram({ icon, accent }: { icon: ServiceIcon; accent: string }) {
  const Icon = ICONS[icon];
  return <Icon accent={accent} />;
}
