import { profile } from '@/data/profile';
import { neon } from '@/scene/materials/neon';
import { useInteractable } from '@/scene/interaction/useInteractable';
import { useGameStore } from '@/scene/store/gameStore';
import { INTERIOR_TEXTURES } from '@/scene/textures/assets';
import { blockTap } from '@/scene/world/events';
import { FramedImage } from '../components/FramedImage';
import { HoloPanel, PanelText } from '../components/HoloPanel';
import { EXHIBIT, WALLS } from '../roomLayout';

const CODE_LINES = [
  'const dev = {',
  `  name: '${profile.name}',`,
  "  loves: ['fast sites', '3D'],",
  "  status: 'available',",
  '};',
];

const SKILL_COLUMNS = 3;
const CHIP_WIDTH = 2.4;
const CHIP_HEIGHT = 0.5;
const CHIP_GAP = 0.2;

/** Desk with a monitor showing a code snippet: the studio's centrepiece. */
function Desk({ accent }: { accent: string }) {
  return (
    <group position={[EXHIBIT.x, 0, EXHIBIT.z]} onClick={blockTap}>
      <mesh position-y={0.95}>
        <boxGeometry args={[3.4, 0.1, 1.6]} />
        <meshStandardMaterial color="#2a2448" metalness={0.6} roughness={0.35} />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 0.45, 0]}>
          <boxGeometry args={[0.1, 0.9, 1.4]} />
          <meshStandardMaterial color="#1a1530" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.96, 0.02]}>
        <boxGeometry args={[3.42, 0.02, 1.62]} />
        <meshBasicMaterial color={neon(accent, 1.5)} toneMapped={false} wireframe />
      </mesh>

      {/* Monitor */}
      <group position={[0, 1.85, -0.35]}>
        <mesh>
          <boxGeometry args={[2.3, 1.35, 0.08]} />
          <meshStandardMaterial color="#0d0b1a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position-z={0.045}>
          <planeGeometry args={[2.15, 1.2]} />
          <meshBasicMaterial color="#07101a" />
        </mesh>
        <group position={[-0.98, 0.5, 0.05]}>
          {CODE_LINES.map((line, i) => (
            <PanelText key={line} y={-i * 0.22} size={0.15} color={i === 0 || i === 4 ? accent : '#9ff7ff'} glow={1.6}>
              {line}
            </PanelText>
          ))}
        </group>
        <mesh position={[0, -0.8, 0.1]}>
          <boxGeometry args={[0.15, 0.3, 0.1]} />
          <meshStandardMaterial color="#1a1530" />
        </mesh>
      </group>
      <pointLight position={[0, 2, 0.8]} color={accent} intensity={12} distance={6} />
    </group>
  );
}

export function StudioRoom({ accent }: { accent: string }) {
  const openPanel = useGameStore((state) => state.openPanel);

  useInteractable({
    id: 'desk',
    label: 'Say hello',
    spot: { x: EXHIBIT.x, z: EXHIBIT.z + 2.1 },
    radius: 1.4,
    activate: () => openPanel({ kind: 'contact', topic: 'Hello!' }),
  });

  return (
    <group>
      <Desk accent={accent} />

      <FramedImage
        url={INTERIOR_TEXTURES.avatar}
        position={[WALLS.back.x - 6.3, 3.4, WALLS.back.z]}
        width={2.6}
        height={3.25}
        accent={accent}
      />

      <HoloPanel
        position={[WALLS.back.x + 1.6, 3.4, WALLS.back.z]}
        width={11.6}
        height={4.8}
        accent={accent}
        title={profile.name.toUpperCase()}
      >
        <PanelText font="display" size={0.26} color={accent} glow={2}>
          {profile.role.toUpperCase()}
        </PanelText>
        <PanelText y={-0.55} size={0.34} maxWidth={10.6}>
          {profile.bio.join(' ')}
        </PanelText>
        {profile.stats.map((stat, i) => (
          <group key={stat.label} position={[i * 3.2, -2.05, 0]}>
            <PanelText font="display" size={0.5} color={accent} glow={2.4}>
              {stat.value}
            </PanelText>
            <PanelText y={-0.62} size={0.28} color="#b9b3e6">
              {stat.label.toUpperCase()}
            </PanelText>
          </group>
        ))}
      </HoloPanel>

      <HoloPanel
        position={[WALLS.left.x, 3, WALLS.left.z]}
        rotationY={WALLS.left.rotationY}
        width={8.6}
        height={3.6}
        accent={accent}
        title="STACK"
      >
        {profile.skills.map((skill, i) => {
          const x = (i % SKILL_COLUMNS) * (CHIP_WIDTH + CHIP_GAP);
          const y = -Math.floor(i / SKILL_COLUMNS) * (CHIP_HEIGHT + CHIP_GAP);
          return (
            <group key={skill} position={[x, y, 0]}>
              <mesh position={[CHIP_WIDTH / 2, -CHIP_HEIGHT / 2, -0.01]}>
                <planeGeometry args={[CHIP_WIDTH, CHIP_HEIGHT]} />
                <meshBasicMaterial color={neon(accent, 0.35)} toneMapped={false} />
              </mesh>
              <PanelText x={0.15} y={-0.08} size={0.3}>
                {skill}
              </PanelText>
            </group>
          );
        })}
      </HoloPanel>

      <HoloPanel
        position={[WALLS.right.x, 3, WALLS.right.z]}
        rotationY={WALLS.right.rotationY}
        width={8.6}
        height={3.6}
        accent={accent}
        title="EXPERIENCE"
      >
        {profile.experience.map((job, i) => (
          <group key={job.period} position-y={-i * 0.85}>
            <PanelText font="display" size={0.22} color={accent} glow={2}>
              {job.period}
            </PanelText>
            <PanelText y={-0.3} size={0.34}>
              {`${job.role}  ·  ${job.company}`}
            </PanelText>
          </group>
        ))}
      </HoloPanel>
    </group>
  );
}
